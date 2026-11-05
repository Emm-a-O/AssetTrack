import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin,
  Calendar,
  User,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  Filter,
  FileCheck,
  Ban,
} from 'lucide-react';
import { useAssetTrack } from '../../context/AssetTrackContext';
import { AssetMovement, MovementStatus } from '../../types';

interface MovementsViewProps {
  onOpenMovementModal: (assetId?: string) => void;
  onSelectAsset: (assetId: string) => void;
}

export const MovementsView: React.FC<MovementsViewProps> = ({
  onOpenMovementModal,
  onSelectAsset,
}) => {
  const {
    movements,
    assets,
    currentUser,
    environment,
    getLocationName,
    approveMovement,
    rejectMovement,
    completeMovement,
    cancelMovement,
  } = useAssetTrack();

  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'approved' | 'completed' | 'all'>(
    environment === 'household' ? 'all' : 'pending'
  );
  const [selectedMover, setSelectedMover] = useState<string>('all');
  const [rejectingMovementId, setRejectingMovementId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [completingMovementId, setCompletingMovementId] = useState<string | null>(null);
  const [actualTransferDate, setActualTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [actualTransferTime, setActualTransferTime] = useState(new Date().toTimeString().slice(0, 5));
  const [actionError, setActionError] = useState<string | null>(null);

  const scopedMovements = movements.filter((m) => m.environment === environment);
  const pendingList = scopedMovements.filter((m) => m.status === 'Pending approval');
  const approvedList = scopedMovements.filter((m) => m.status === 'Approved');
  const completedList = scopedMovements.filter((m) => m.status === 'Completed');

  const householdMovers = Array.from(new Set(scopedMovements.map((m) => m.requestedByName).filter(Boolean)));

  const currentDisplayList =
    environment === 'household'
      ? selectedMover === 'all'
        ? scopedMovements
        : scopedMovements.filter((m) => m.requestedByName === selectedMover)
      : activeSubTab === 'pending'
      ? pendingList
      : activeSubTab === 'approved'
      ? approvedList
      : activeSubTab === 'completed'
      ? completedList
      : scopedMovements;

  const isManagerOrAdmin =
    currentUser.role === 'Asset Manager' ||
    currentUser.role === 'Organisation Administrator' ||
    currentUser.role === 'Platform Administrator' ||
    environment === 'household';

  const handleApprove = (id: string) => {
    setActionError(null);
    const res = approveMovement(id, `Approved by ${currentUser.name} (${currentUser.role})`);
    if (!res.success) setActionError(res.error || 'Failed to approve.');
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingMovementId || !rejectionReasonInput.trim()) {
      setActionError('Rejection reason is required.');
      return;
    }
    const res = rejectMovement(rejectingMovementId, rejectionReasonInput.trim());
    if (res.success) {
      setRejectingMovementId(null);
      setRejectionReasonInput('');
      setActionError(null);
    } else {
      setActionError(res.error || 'Failed to reject movement.');
    }
  };

  const handleConfirmCompletion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingMovementId) return;

    const res = completeMovement(completingMovementId, actualTransferDate, actualTransferTime);
    if (res.success) {
      setCompletingMovementId(null);
      setActionError(null);
    } else {
      setActionError(res.error || 'Failed to complete physical transfer.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-blue-600" />
            <span>
              {environment === 'household' ? 'Household Moved Items Register' : 'Asset Movement Management'}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            {environment === 'household'
              ? 'Items move freely without permission • Automatically records everyone who moves items'
              : 'Atomic transfer workflow: Request → Approval → Physical Confirmation → Confirmed Location'}
          </p>
        </div>

        <button
          onClick={() => onOpenMovementModal()}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs shadow-blue-500/20 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{environment === 'household' ? 'Move Household Item' : 'New Movement Request'}</span>
        </button>
      </div>

      {actionError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Transaction Warning:</span> {actionError}
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-500 hover:text-rose-700">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs / Mover Filter */}
      {environment === 'household' ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
          <div className="flex gap-6 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setSelectedMover('all')}
              className={`py-2 border-b-2 flex items-center gap-2 transition-colors ${
                selectedMover === 'all'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <span>All Moved Items ({scopedMovements.length})</span>
            </button>
          </div>

          {householdMovers.length > 0 && (
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="text-slate-500 font-medium">Filter by Individual:</span>
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  onClick={() => setSelectedMover('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedMover === 'all'
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All ({scopedMovements.length})
                </button>
                {householdMovers.map((mover) => {
                  const count = scopedMovements.filter((m) => m.requestedByName === mover).length;
                  return (
                    <button
                      key={mover}
                      onClick={() => setSelectedMover(mover)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                        selectedMover === mover
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <User className="w-3 h-3" />
                      <span>{mover}</span>
                      <span className="text-[10px] opacity-80">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveSubTab('pending')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeSubTab === 'pending'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <span>Pending Approvals</span>
            {pendingList.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white">
                {pendingList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('approved')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeSubTab === 'approved'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <span>Approved (Pending Physical Transfer)</span>
            {approvedList.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-600 text-white">
                {approvedList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('completed')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeSubTab === 'completed'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <span>Completed Transfers</span>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-600">
              {completedList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('all')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeSubTab === 'all'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <span>All History ({scopedMovements.length})</span>
          </button>
        </div>
      )}

      {/* Process Flow Guide Reminder */}
      {environment === 'household' ? (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">No Permission Needed (Household Platform):</span> Individuals logged in move items freely without approvals. The log below automatically records and attributes every moved item alongside the individual who moved it.
          </div>
        </div>
      ) : (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Atomic Transaction Integrity:</strong> An approved movement does NOT change current location until physical transfer is confirmed. Conflicting or stale moves are rejected automatically.
            </span>
          </div>
        </div>
      )}

      {/* Movements List */}
      {currentDisplayList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-800 text-sm">No movement records in this category.</p>
          <p>Click "New Movement Request" above to initiate a physical asset relocation.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentDisplayList.map((mov) => {
            const asset = assets.find((a) => a.id === mov.assetId);
            const isStale = asset && asset.currentLocationId !== mov.previousLocationId;

            return (
              <div
                key={mov.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  isStale && mov.status !== 'Completed' && mov.status !== 'Rejected'
                    ? 'bg-rose-50/50 border-rose-300'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      {mov.id}
                    </span>
                    <button
                      onClick={() => onSelectAsset(mov.assetId)}
                      className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors text-left"
                    >
                      {mov.assetName}
                    </button>
                    <span className="font-mono text-[11px] text-slate-400">({mov.assetId})</span>

                    {environment === 'household' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs font-bold shadow-2xs">
                        <User className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Moved by: <strong className="text-indigo-800 underline decoration-indigo-300">{mov.requestedByName}</strong></span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        mov.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : mov.status === 'Pending approval'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                          : mov.status === 'Approved'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : mov.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {environment === 'household' ? 'Moved Freely' : mov.status}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {mov.movementDate} at {mov.movementTime}
                    </span>
                  </div>
                </div>

                {/* Stale Location Conflict Warning */}
                {isStale && mov.status !== 'Completed' && mov.status !== 'Rejected' && (
                  <div className="p-2.5 bg-rose-100/80 border border-rose-300 rounded-lg text-xs text-rose-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      <strong>CONCURRENCY CONFLICT DETECTED:</strong> This request was recorded when asset was at "{getLocationName(mov.previousLocationId)}", but asset is currently at "{getLocationName(asset!.currentLocationId)}". Completion blocked to prevent stale relocation.
                    </span>
                  </div>
                )}

                {/* From -> To Transfer Route */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 font-medium">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>From:</span>
                      <strong className="text-slate-900">{getLocationName(mov.previousLocationId)}</strong>
                    </div>

                    <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />

                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>To:</span>
                      <strong className="text-blue-900">{getLocationName(mov.newLocationId)}</strong>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-slate-700 bg-white px-2 py-1 rounded-md border border-slate-200 self-start sm:self-auto">
                    Reason: {mov.movementReason}
                  </span>
                </div>

                {/* Metadata & Audit Footnotes */}
                <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1 text-slate-700 font-semibold">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Moved by: <strong className="text-indigo-900">{mov.requestedByName}</strong></span>
                  </span>
                  {environment === 'organisation' && mov.approvedByName && (
                    <span>
                      Approved by: <strong className="text-slate-700">{mov.approvedByName}</strong>
                    </span>
                  )}
                  {environment === 'organisation' && mov.completedByName && (
                    <span>
                      Physical Transfer Verified by:{' '}
                      <strong className="text-slate-700">{mov.completedByName}</strong>
                    </span>
                  )}
                  {environment === 'household' && (
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[10px] font-bold border border-emerald-200">
                      Self-Service Relocation • Free Move
                    </span>
                  )}
                  {mov.remarks && <span className="italic">"{mov.remarks}"</span>}
                </div>

                {mov.rejectionReason && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                    <strong>Rejection Notice:</strong> {mov.rejectionReason}
                  </div>
                )}

                {/* Action Toolbar */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectAsset(mov.assetId)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Inspect Asset Dossier
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Pending Actions */}
                    {mov.status === 'Pending approval' && (
                      <>
                        <button
                          onClick={() => cancelMovement(mov.id)}
                          className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                          Cancel
                        </button>
                        {isManagerOrAdmin && (
                          <>
                            <button
                              onClick={() => {
                                setRejectingMovementId(mov.id);
                                setRejectionReasonInput('');
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
                            >
                              Reject Request
                            </button>
                            <button
                              onClick={() => handleApprove(mov.id)}
                              className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                            >
                              Approve Request
                            </button>
                          </>
                        )}
                      </>
                    )}

                    {/* Approved Actions (Physical Transfer Confirmation) */}
                    {mov.status === 'Approved' && (
                      <button
                        onClick={() => {
                          setCompletingMovementId(mov.id);
                          setActualTransferDate(new Date().toISOString().split('T')[0]);
                          setActualTransferTime(new Date().toTimeString().slice(0, 5));
                        }}
                        disabled={isStale}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Physical Transfer</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingMovementId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-600" />
                <span>Reject Movement Request ({rejectingMovementId})</span>
              </h3>
              <button
                onClick={() => setRejectingMovementId(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Rule #7 requires a specific rejection reason to be preserved permanently in the transaction log.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rejection Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Destination room does not have required air-conditioning or safety grounding..."
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingMovementId(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Physical Transfer Modal */}
      {completingMovementId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Confirm Physical Equipment Relocation</span>
              </h3>
              <button
                onClick={() => setCompletingMovementId(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              This atomic operation updates the asset's live current location and records your verified timestamp.
            </p>

            <form onSubmit={handleConfirmCompletion} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Actual Date
                  </label>
                  <input
                    type="date"
                    required
                    value={actualTransferDate}
                    onChange={(e) => setActualTransferDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Actual Time
                  </label>
                  <input
                    type="time"
                    required
                    value={actualTransferTime}
                    onChange={(e) => setActualTransferTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompletingMovementId(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Save &amp; Update Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
