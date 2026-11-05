import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowLeftRight,
  MapPin,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useAssetTrack } from '../../context/AssetTrackContext';
import { MovementReason } from '../../types';

interface NewMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedAssetId?: string | null;
  onMovementCreated?: (movementId: string) => void;
}

export const NewMovementModal: React.FC<NewMovementModalProps> = ({
  isOpen,
  onClose,
  preselectedAssetId,
  onMovementCreated,
}) => {
  const {
    assets,
    locations,
    currentUser,
    environment,
    requestMovement,
    completeMovement,
    getLocationName,
    getLocationHierarchyName,
  } = useAssetTrack();

  const [selectedAssetId, setSelectedAssetId] = useState<string>(preselectedAssetId || '');
  const [newLocationId, setNewLocationId] = useState<string>('');
  const [movementReason, setMovementReason] = useState<MovementReason>('Internal transfer');
  const [movementDate, setMovementDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [movementTime, setMovementTime] = useState<string>(new Date().toTimeString().slice(0, 5));
  const [remarks, setRemarks] = useState<string>('');
  const [confirmPhysicalTransferNow, setConfirmPhysicalTransferNow] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedAssetId) {
      setSelectedAssetId(preselectedAssetId);
    } else if (assets.length > 0 && !selectedAssetId) {
      const firstActive = assets.find((a) => !a.isArchived && a.environment === environment);
      if (firstActive) setSelectedAssetId(firstActive.id);
    }
  }, [preselectedAssetId, assets, environment, selectedAssetId]);

  if (!isOpen) return null;

  const currentAsset = assets.find((a) => a.id === selectedAssetId);
  const activeLocations = locations.filter((l) => l.isActive && l.environment === environment);

  const isManagerOrAdmin =
    currentUser.role === 'Asset Manager' ||
    currentUser.role === 'Organisation Administrator' ||
    currentUser.role === 'Platform Administrator' ||
    environment === 'household';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedAssetId) {
      setError('Please select an asset to move.');
      return;
    }
    if (!newLocationId) {
      setError('Please select a destination location.');
      return;
    }

    const res = requestMovement({
      assetId: selectedAssetId,
      newLocationId,
      movementReason,
      movementDate,
      movementTime,
      remarks: remarks.trim() || undefined,
    });

    if (!res.success || !res.movement) {
      setError(res.error || 'Failed to request movement.');
      return;
    }

    // If manager chose to immediately confirm physical transfer
    if (confirmPhysicalTransferNow && isManagerOrAdmin) {
      const compRes = completeMovement(res.movement.id, movementDate, movementTime);
      if (!compRes.success) {
        setError(compRes.error || 'Movement created, but physical completion failed.');
        return;
      }
    }

    if (onMovementCreated) onMovementCreated(res.movement.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Record Asset Movement</h3>
              <p className="text-xs text-slate-300">
                Log physical transfer or submit movement request
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Asset Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Asset to Move <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {assets
                .filter((a) => !a.isArchived && a.environment === environment)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} — {a.name} ({a.category}) [{getLocationName(a.currentLocationId)}]
                  </option>
                ))}
            </select>
          </div>

          {/* Current Location (Retrieved Automatically - Module 2 Rule) */}
          {currentAsset && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Current Confirmed Location:</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  {getLocationHierarchyName(currentAsset.currentLocationId)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Last confirmed:</span>
                <span>
                  {currentAsset.lastConfirmedMovementDate} at {currentAsset.lastConfirmedMovementTime}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 italic">
                * Retrieved automatically from system register. Prevents stale location transfers.
              </div>
            </div>
          )}

          {/* Destination Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Destination Location <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={newLocationId}
              onChange={(e) => setNewLocationId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="">Select destination room / lab / building...</option>
              {activeLocations.map((loc) => (
                <option
                  key={loc.id}
                  value={loc.id}
                  disabled={currentAsset && currentAsset.currentLocationId === loc.id}
                >
                  {loc.name} ({loc.code}) {currentAsset?.currentLocationId === loc.id ? '— (Current Location)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Reason & Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Movement Reason <span className="text-rose-500">*</span>
              </label>
              <select
                value={movementReason}
                onChange={(e) => setMovementReason(e.target.value as MovementReason)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="Internal transfer">Internal transfer</option>
                <option value="Change of assigned department">Change of assigned department</option>
                <option value="Temporary relocation">Temporary relocation</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Repair">Repair</option>
                <option value="Return to original location">Return to original location</option>
                <option value="Location Audit Confirmation">Location Audit Confirmation</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Requested By
              </label>
              <input
                type="text"
                disabled
                value={`${currentUser.name} (${currentUser.role})`}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-100 text-slate-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Movement Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={movementDate}
                onChange={(e) => setMovementDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Movement Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={movementTime}
                onChange={(e) => setMovementTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Remarks / Purpose (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Relocated for upcoming board review / lab inspection"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Physical Confirmation Option for Authorized Users */}
          {isManagerOrAdmin ? (
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="confirmTransferCheck"
                checked={confirmPhysicalTransferNow}
                onChange={(e) => setConfirmPhysicalTransferNow(e.target.checked)}
                className="mt-0.5 rounded-sm text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="confirmTransferCheck" className="text-xs text-blue-900 cursor-pointer">
                <span className="font-semibold block">Confirm Physical Transfer Completed Now</span>
                <span className="text-blue-700 text-[11px] block mt-0.5">
                  As an Asset Manager / Admin, check this if the item has already been physically picked up and placed in the new room. This updates the live confirmed location immediately.
                </span>
              </label>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                As a Staff Member, this transaction will be queued as <strong>Pending Approval</strong> for the Asset Manager or Department Head.
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{confirmPhysicalTransferNow ? 'Complete Physical Transfer' : 'Submit Movement'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
