import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  RotateCcw,
  MapPin,
  Calendar,
  DollarSign,
  AlertOctagon,
  User,
} from 'lucide-react';
import { useAssetTrack } from '../../context/AssetTrackContext';
import { AssetCondition, MaintenanceType } from '../../types';

// ==========================================
// 1. Report Missing Modal (Section 6.3)
// ==========================================
interface ReportMissingModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string | null;
}

export const ReportMissingModal: React.FC<ReportMissingModalProps> = ({
  isOpen,
  onClose,
  assetId,
}) => {
  const { assets, reportMissingAsset, getLocationName } = useAssetTrack();
  const [circumstances, setCircumstances] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !assetId) return null;
  const asset = assets.find((a) => a.id === assetId);
  if (!asset) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!circumstances.trim()) {
      setError('Please provide specific incident details / last seen circumstances.');
      return;
    }
    const res = reportMissingAsset(asset.id, circumstances.trim());
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to report missing.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 bg-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-5 h-5" />
            <h3 className="text-base font-bold">Report Asset as Missing</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-rose-100 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <span>{asset.id}</span> — {asset.name}
            </div>
            <p className="text-slate-600">
              Last confirmed location:{' '}
              <strong className="text-slate-900">{getLocationName(asset.currentLocationId)}</strong>
            </p>
            <p className="text-[11px] text-rose-700 pt-1">
              Per Section 6.3: Reporting as Missing preserves all asset history, flags security alerts, and triggers an investigation case.
            </p>
          </div>

          {error && <div className="text-xs text-rose-600 font-medium">{error}</div>}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Incident Circumstances &amp; Last Known Details <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Discovered missing after evening inventory check. Storage locker was found unlocked..."
              value={circumstances}
              onChange={(e) => setCircumstances(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
            >
              Submit Missing Incident Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 2. Recover Missing Asset Modal
// ==========================================
interface RecoverAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string | null;
}

export const RecoverAssetModal: React.FC<RecoverAssetModalProps> = ({
  isOpen,
  onClose,
  reportId,
}) => {
  const { missingReports, locations, environment, recoverMissingAsset } = useAssetTrack();
  const [verifiedLocationId, setVerifiedLocationId] = useState('');
  const [recoveryNotes, setRecoveryNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !reportId) return null;
  const report = missingReports.find((r) => r.id === reportId);
  if (!report) return null;

  const activeLocations = locations.filter((l) => l.isActive && l.environment === environment);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedLocationId) {
      setError('Please select the verified physical location where the asset was recovered.');
      return;
    }
    const res = recoverMissingAsset(report.id, verifiedLocationId, recoveryNotes.trim());
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to mark recovered.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 bg-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="text-base font-bold">Confirm Asset Recovery</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-emerald-100 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
            <p className="font-semibold">
              Recovering {report.assetId} ({report.assetName})
            </p>
            <p className="text-slate-600 text-[11px]">
              Reported missing on {report.reportedDate}. Once recovered, operational status is restored to Active.
            </p>
          </div>

          {error && <div className="text-xs text-rose-600 font-medium">{error}</div>}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Verified Physical Location <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={verifiedLocationId}
              onChange={(e) => setVerifiedLocationId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select current verified room / location...</option>
              {activeLocations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Recovery Notes / Circumstances
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Found safely secured in Media Archive Room by security officer..."
              value={recoveryNotes}
              onChange={(e) => setRecoveryNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
            >
              Verify Recovery &amp; Restore
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 3. Log Maintenance Modal (Module 5)
// ==========================================
interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string | null;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  isOpen,
  onClose,
  assetId,
}) => {
  const { assets, createMaintenanceRecord, getLocationName } = useAssetTrack();
  const [maintenanceType, setMaintenanceType] = useState<MaintenanceType>('Corrective');
  const [problemDescription, setProblemDescription] = useState('');
  const [assignedTechnician, setAssignedTechnician] = useState('');
  const [scheduledReminderDate, setScheduledReminderDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !assetId) return null;
  const asset = assets.find((a) => a.id === assetId);
  if (!asset) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription.trim()) {
      setError('Problem description is required.');
      return;
    }
    if (!assignedTechnician.trim()) {
      setError('Assigned technician or service provider is required.');
      return;
    }

    const res = createMaintenanceRecord({
      assetId: asset.id,
      assetName: `${asset.name}${asset.brand ? ` (${asset.brand})` : ''}`,
      maintenanceType,
      problemDescription: problemDescription.trim(),
      reportedDate: new Date().toISOString().split('T')[0],
      assignedTechnician: assignedTechnician.trim(),
      startDate: new Date().toISOString().split('T')[0],
      status: 'In Progress',
      scheduledReminderDate: scheduledReminderDate || undefined,
    });

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to create maintenance ticket.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Wrench className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold">Log Maintenance Ticket</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
            <div className="font-bold">{asset.id} — {asset.name}</div>
            <p className="text-slate-600 mt-0.5">
              Physical Location remains: <strong>{getLocationName(asset.currentLocationId)}</strong>
            </p>
            <p className="text-[11px] text-blue-700 mt-1">
              * Module 5 Rule: Operational status will be set to "Under Maintenance" while preserving physical location tracking.
            </p>
          </div>

          {error && <div className="text-xs text-rose-600 font-medium">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Maintenance Type
              </label>
              <select
                value={maintenanceType}
                onChange={(e) => setMaintenanceType(e.target.value as MaintenanceType)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Corrective">Corrective (Repair)</option>
                <option value="Preventative">Preventative Service</option>
                <option value="Inspection">Safety / Audit Inspection</option>
                <option value="Emergency Repair">Emergency Repair</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Scheduled Target Date
              </label>
              <input
                type="date"
                value={scheduledReminderDate}
                onChange={(e) => setScheduledReminderDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Technician / Vendor <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Precision BioTech Engineering Ltd or Engr. S. Adeleke"
              value={assignedTechnician}
              onChange={(e) => setAssignedTechnician(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Problem Description / Work Scope <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe symptoms, fault code, or scheduled maintenance interval..."
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              Open Maintenance Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 4. Complete Maintenance Modal
// ==========================================
interface CompleteMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenanceId: string | null;
}

export const CompleteMaintenanceModal: React.FC<CompleteMaintenanceModalProps> = ({
  isOpen,
  onClose,
  maintenanceId,
}) => {
  const { maintenanceRecords, completeMaintenanceRecord } = useAssetTrack();
  const [workPerformed, setWorkPerformed] = useState('');
  const [repairCost, setRepairCost] = useState('');
  const [newCondition, setNewCondition] = useState<AssetCondition>('Excellent');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !maintenanceId) return null;
  const record = maintenanceRecords.find((m) => m.id === maintenanceId);
  if (!record) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workPerformed.trim()) {
      setError('Please summarize the work performed.');
      return;
    }

    const res = completeMaintenanceRecord(
      record.id,
      workPerformed.trim(),
      repairCost ? parseFloat(repairCost) : undefined,
      newCondition
    );

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to complete ticket.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 bg-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="text-base font-bold">Complete Maintenance Ticket</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-emerald-100 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
            <p className="font-semibold">{record.id} — {record.assetName}</p>
            <p className="text-slate-600 mt-0.5">Problem: "{record.problemDescription}"</p>
          </div>

          {error && <div className="text-xs text-rose-600 font-medium">{error}</div>}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Work Performed &amp; Parts Replaced <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Replaced optical sensor, aligned laser reflector, re-calibrated zero point..."
              value={workPerformed}
              onChange={(e) => setWorkPerformed(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Final Repair / Service Cost ($)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={repairCost}
                onChange={(e) => setRepairCost(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Updated Physical Condition
              </label>
              <select
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value as AssetCondition)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Excellent">Excellent - Fully Restored</option>
                <option value="Good">Good - Operational</option>
                <option value="Fair">Fair - Operational with Limits</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
            >
              Close Ticket &amp; Restore Active Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
