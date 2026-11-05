import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  MapPin,
  User,
  Building,
  Calendar,
  Clock,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Printer,
  History,
  Archive,
  RotateCcw,
  Tag,
  ArrowLeftRight,
  FileText,
  DollarSign,
} from 'lucide-react';
import { useAssetTrack } from '../../context/AssetTrackContext';
import { Asset, AssetMovement, AssetAssignment, MaintenanceRecord } from '../../types';
import { generateQRCodeDataUrl } from '../../utils/qrHelper';

interface AssetDetailModalProps {
  assetId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onInitiateMovement: (assetId: string) => void;
  onInitiateMaintenance: (assetId: string) => void;
  onInitiateMissingReport: (assetId: string) => void;
  onInitiateReassignment: (assetId: string) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  assetId,
  isOpen,
  onClose,
  onInitiateMovement,
  onInitiateMaintenance,
  onInitiateMissingReport,
  onInitiateReassignment,
}) => {
  const {
    assets,
    movements,
    assignments,
    maintenanceRecords,
    missingReports,
    getLocationName,
    getLocationHierarchyName,
    getDepartmentName,
    getUserName,
    archiveAsset,
    restoreAsset,
    environment,
  } = useAssetTrack();

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'movements' | 'custody' | 'maintenance'>('overview');

  const asset = assets.find((a) => a.id === assetId);

  useEffect(() => {
    if (asset) {
      // Encode system Asset ID and verification payload
      const payload = JSON.stringify({
        id: asset.id,
        name: asset.name,
        category: asset.category,
        serial: asset.serialNumber || 'N/A',
        system: 'AssetTrack-v1',
      });
      generateQRCodeDataUrl(payload).then(setQrDataUrl);
    }
  }, [asset]);

  if (!isOpen || !asset) return null;

  // Filter history for this asset
  const assetMovements = movements.filter((m) => m.assetId === asset.id);
  const assetAssignments = assignments.filter((a) => a.assetId === asset.id);
  const assetMaintenance = maintenanceRecords.filter((m) => m.assetId === asset.id);
  const activeMissing = missingReports.find((m) => m.assetId === asset.id && !m.isRecovered);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">Active</span>;
      case 'Under Maintenance':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-300">Under Maintenance</span>;
      case 'Missing':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">Missing</span>;
      case 'Archived':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-200 text-slate-700 border border-slate-300">Archived</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'Excellent':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-teal-50 text-teal-700 border border-teal-200">Excellent Condition</span>;
      case 'Good':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">Good Condition</span>;
      case 'Fair':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-50 text-yellow-800 border border-yellow-200">Fair Wear</span>;
      case 'Damaged':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold">Damaged</span>;
      case 'Unserviceable':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-300">Unserviceable</span>;
      default:
        return <span>{condition}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold bg-blue-600 text-white px-2.5 py-1 rounded-lg tracking-wider shadow-xs">
              {asset.id}
            </span>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {asset.name}
                {asset.brand && <span className="text-slate-400 text-sm font-normal">({asset.brand} {asset.model})</span>}
              </h2>
              <p className="text-xs text-slate-400">
                Category: <span className="text-slate-200">{asset.category}</span>
                {asset.subcategory && ` • ${asset.subcategory}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                  printWindow.document.write(`
                    <html>
                      <head><title>Asset Tag - ${asset.id}</title></head>
                      <body style="font-family:sans-serif; text-align:center; padding: 20px;">
                        <div style="border:2px solid #000; padding:15px; border-radius:10px; max-width:280px; margin:0 auto;">
                          <h2 style="margin:0; font-size:18px;">AssetTrack Physical Tag</h2>
                          <h1 style="margin:5px 0; font-size:24px; font-family:monospace;">${asset.id}</h1>
                          <p style="margin:4px 0; font-weight:bold;">${asset.name}</p>
                          <img src="${qrDataUrl}" width="180" height="180" />
                          <p style="margin:4px 0; font-size:12px;">Category: ${asset.category}</p>
                          <p style="margin:4px 0; font-size:12px;">Location: ${getLocationHierarchyName(asset.currentLocationId)}</p>
                        </div>
                        <script>window.onload = function() { window.print(); }<\/script>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Print single QR label"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Missing Banner Alert if missing */}
        {activeMissing && (
          <div className="bg-rose-500 text-white px-6 py-2.5 flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                ACTIVE INCIDENT: This asset was reported missing on {activeMissing.reportedDate} from {getLocationName(activeMissing.lastKnownLocationId)}.
              </span>
            </div>
            <button
              onClick={() => {
                onClose();
                onInitiateMissingReport(asset.id);
              }}
              className="px-2.5 py-1 bg-white text-rose-700 rounded-md font-semibold hover:bg-rose-50 transition-colors"
            >
              View / Recover
            </button>
          </div>
        )}

        {/* Quick Tabs */}
        <div className="px-6 border-b border-slate-200 bg-slate-50 flex items-center gap-6 text-xs font-semibold text-slate-600 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Asset Overview
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'movements'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <span>Movement History</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700">
              {assetMovements.length}
            </span>
          </button>
          {environment === 'organisation' && (
            <button
              onClick={() => setActiveTab('custody')}
              className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'custody'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <span>Custody &amp; Allocation</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700">
                {assetAssignments.length}
              </span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'maintenance'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <span>Maintenance &amp; Service</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700">
              {assetMaintenance.length}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Primary Highlights Bar */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                    Operational Status
                  </div>
                  <div className="mt-1">{getStatusBadge(asset.status)}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                    Physical Condition
                  </div>
                  <div className="mt-1">{getConditionBadge(asset.condition)}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                    Current Location
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{getLocationHierarchyName(asset.currentLocationId)}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Confirmed: {asset.lastConfirmedMovementDate} {asset.lastConfirmedMovementTime}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                    Custodian / Responsible
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>{getUserName(asset.responsiblePersonId)}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Dept: {getDepartmentName(asset.departmentId)}
                  </div>
                </div>
              </div>

              {/* Detail Panels: QR & Identity + Specs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* QR Code Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col items-center text-center">
                  <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-blue-600" />
                    <span>System QR Identity</span>
                  </div>
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`QR code for ${asset.id}`}
                      className="w-40 h-40 border border-slate-200 rounded-lg p-1 bg-white shadow-xs"
                    />
                  ) : (
                    <div className="w-40 h-40 bg-slate-100 rounded-lg animate-pulse" />
                  )}
                  <span className="font-mono text-sm font-extrabold text-slate-900 mt-2">
                    {asset.id}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">
                    Scan with any smartphone or device to pull confirmed location &amp; verify physical custody.
                  </p>
                </div>

                {/* Technical & Hardware Specs */}
                <div className="md:col-span-2 space-y-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-slate-600" />
                      <span>Identification &amp; Acquisition</span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">System Asset ID:</span>
                        <span className="font-mono font-bold text-slate-900">{asset.id}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Manufacturer Serial:</span>
                        <span className="font-mono font-semibold text-slate-700">
                          {asset.serialNumber || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Brand / Model:</span>
                        <span className="font-medium text-slate-900">
                          {asset.brand || 'Generic'} {asset.model || ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Acquisition Date:</span>
                        <span className="font-medium text-slate-700">{asset.acquisitionDate || 'Unspecified'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Acquisition Value:</span>
                        <span className="font-bold text-slate-900">
                          {asset.acquisitionCost ? `${asset.currency} ${asset.acquisitionCost.toLocaleString()}` : 'Unrecorded'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Initial Registration:</span>
                        <span className="font-medium text-slate-700">{asset.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  {asset.description && (
                    <div className="p-4 rounded-xl border border-slate-200 bg-white">
                      <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-600" />
                        <span>Description &amp; Specifications</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{asset.description}</p>
                    </div>
                  )}

                  {asset.notes && (
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900">
                      <span className="font-semibold block mb-0.5">Asset Notes:</span>
                      {asset.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'movements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Movement Journey &amp; History</h4>
                  <p className="text-[11px] text-slate-500">
                    Chronological physical transfers and relocation approvals for {asset.id}
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onInitiateMovement(asset.id);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Transfer Asset</span>
                </button>
              </div>

              {assetMovements.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                  No movement transactions recorded. This asset remains at its initial registered location: {getLocationName(asset.initialLocationId)}.
                </div>
              ) : (
                <div className="space-y-3">
                  {assetMovements.map((mov) => (
                    <div
                      key={mov.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-600">{mov.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              mov.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : mov.status === 'Pending approval'
                                ? 'bg-amber-100 text-amber-800'
                                : mov.status === 'Approved'
                                ? 'bg-blue-100 text-blue-800'
                                : mov.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {mov.status}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="font-medium text-slate-700">{mov.movementReason}</span>
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          {mov.movementDate} at {mov.movementTime}
                        </div>
                      </div>

                      {/* Path */}
                      <div className="flex items-center gap-2 text-xs font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-slate-500">From:</span>
                        <span className="font-semibold text-slate-800">{getLocationName(mov.previousLocationId)}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="text-slate-500">To:</span>
                        <span className="font-semibold text-slate-900">{getLocationName(mov.newLocationId)}</span>
                      </div>

                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span>Requested by: <strong className="text-slate-700">{mov.requestedByName}</strong></span>
                        {mov.approvedByName && (
                          <span>Approved by: <strong className="text-slate-700">{mov.approvedByName}</strong></span>
                        )}
                        {mov.completedByName && (
                          <span>Transfer Verified by: <strong className="text-slate-700">{mov.completedByName}</strong></span>
                        )}
                      </div>

                      {mov.rejectionReason && (
                        <div className="text-xs text-rose-700 bg-rose-50 p-2 rounded-md border border-rose-200">
                          <strong>Rejection Reason:</strong> {mov.rejectionReason}
                        </div>
                      )}

                      {mov.remarks && (
                        <div className="text-[11px] text-slate-600 italic">
                          "{mov.remarks}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'custody' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Custody &amp; Responsibility Records</h4>
                  <p className="text-[11px] text-slate-500">
                    Audit trail of who holds responsibility for this asset (Section 6: Module 6)
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onInitiateReassignment(asset.id);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Transfer Custody</span>
                </button>
              </div>

              {assetAssignments.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                  No individual custody assigned. Asset is managed as common pooled inventory.
                </div>
              ) : (
                <div className="space-y-3">
                  {assetAssignments.map((asn) => (
                    <div
                      key={asn.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-indigo-600">{asn.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              asn.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {asn.status === 'Active' ? 'Current Custodian' : 'Past Custodian'}
                          </span>
                          {asn.receiptAcknowledged ? (
                            <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Signed &amp; Acknowledged
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-600">Pending sign-off</span>
                          )}
                        </div>
                        <span className="text-slate-400 text-[11px]">Assigned: {asn.assignedDate}</span>
                      </div>

                      <div className="font-semibold text-slate-900 text-sm">
                        {asn.assignedToUserName}
                      </div>

                      <div className="text-[11px] text-slate-500">
                        Assigned by {asn.assignedByUserName}
                        {asn.returnedDate && ` • Returned on ${asn.returnedDate}`}
                      </div>

                      {asn.notes && (
                        <p className="text-[11px] text-slate-600 italic">"{asn.notes}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Maintenance &amp; Service Cases</h4>
                  <p className="text-[11px] text-slate-500">
                    Repair tickets, preventative maintenance, and servicing costs
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onInitiateMaintenance(asset.id);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Log Service Ticket</span>
                </button>
              </div>

              {assetMaintenance.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                  No maintenance records logged. Physical condition is {asset.condition}.
                </div>
              ) : (
                <div className="space-y-3">
                  {assetMaintenance.map((mnt) => (
                    <div
                      key={mnt.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-600">{mnt.id}</span>
                          <span className="font-semibold text-slate-800">{mnt.maintenanceType}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              mnt.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {mnt.status}
                          </span>
                        </div>
                        <span className="text-slate-400 text-[11px]">Reported: {mnt.reportedDate}</span>
                      </div>

                      <div className="text-slate-700 font-medium">
                        "{mnt.problemDescription}"
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-500 pt-1">
                        <div>
                          <span>Technician:</span>{' '}
                          <strong className="text-slate-700">{mnt.assignedTechnician}</strong>
                        </div>
                        {mnt.repairCost !== undefined && (
                          <div>
                            <span>Repair Cost:</span>{' '}
                            <strong className="text-slate-900">${mnt.repairCost}</strong>
                          </div>
                        )}
                        {mnt.completionDate && (
                          <div>
                            <span>Completed:</span>{' '}
                            <strong className="text-slate-700">{mnt.completionDate}</strong>
                          </div>
                        )}
                      </div>

                      {mnt.workPerformed && (
                        <div className="p-2 rounded-md bg-emerald-50 text-emerald-900 text-[11px] border border-emerald-100">
                          <strong>Work Performed:</strong> {mnt.workPerformed}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Quick Action Toolbar */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {!asset.isArchived ? (
              <button
                onClick={() => {
                  if (confirm(`Archive asset ${asset.id} (${asset.name})? All historical movement transactions will remain intact.`)) {
                    archiveAsset(asset.id);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                title="Archive (retaining historical data)"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archive</span>
              </button>
            ) : (
              <button
                onClick={() => restoreAsset(asset.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore from Archive</span>
              </button>
            )}

            {asset.status !== 'Missing' && !asset.isArchived && (
              <button
                onClick={() => {
                  onClose();
                  onInitiateMissingReport(asset.id);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-medium transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Report Missing</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onInitiateMaintenance(asset.id);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
            >
              <Wrench className="w-3.5 h-3.5 text-slate-500" />
              <span>Log Service</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onInitiateMovement(asset.id);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs shadow-blue-500/20 transition-all"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Record Transfer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
