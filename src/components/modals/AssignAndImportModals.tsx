import React, { useState } from 'react';
import {
  X,
  UserCheck2,
  FileSpreadsheet,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import { useAssetTrack } from '../../context/AssetTrackContext';
import { AssetCondition } from '../../types';

// ==========================================
// 1. Assign Custody / Responsibility Modal
// ==========================================
interface AssignCustodyModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string | null;
}

export const AssignCustodyModal: React.FC<AssignCustodyModalProps> = ({
  isOpen,
  onClose,
  assetId,
}) => {
  const { assets, users, assignAsset, getUserName } = useAssetTrack();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !assetId) return null;
  const asset = assets.find((a) => a.id === assetId);
  if (!asset) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setError('Please select a staff member or user.');
      return;
    }
    const res = assignAsset(asset.id, selectedUserId, notes.trim());
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to assign custody.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserCheck2 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold">Transfer Asset Responsibility</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 space-y-1">
            <p className="font-bold">{asset.id} — {asset.name}</p>
            <p className="text-slate-600">
              Current Responsible Person: <strong>{getUserName(asset.responsiblePersonId)}</strong>
            </p>
            <p className="text-[10px] text-indigo-700 italic">
              * Module 6 Rule: Physical location is separate from responsibility. Custody transfer preserves full historical assignment log.
            </p>
          </div>

          {error && <div className="text-xs text-rose-600 font-medium">{error}</div>}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Custodian / Responsible User <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select staff member...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id} disabled={u.id === asset.responsiblePersonId}>
                  {u.name} — {u.role} ({u.title || 'Staff'}) {u.id === asset.responsiblePersonId ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assignment Notes / Handoff Terms
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Issued with power cord, docking station, and security cable. Requires acknowledgement."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
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
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              Confirm Custody Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 2. Excel / CSV Import Modal (Section 1 & Module 1)
// ==========================================
interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ isOpen, onClose }) => {
  const { environment, locations, registerAsset } = useAssetTrack();
  const [csvText, setCsvText] = useState('');
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<string | null>(null);

  if (!isOpen) return null;

  const sampleCsv = `Asset Name,Category,Initial Location Code,Brand,Model,Serial Number,Condition,Acquisition Cost
Lenovo ThinkPad E14,Electronics,ICT-301,Lenovo,ThinkPad E14,SN-LNV-00912,Excellent,950
Bacteriological Incubator,Laboratory Equipment,SCI-201,Thermo Scientific,Heratherm,SN-THM-8812,Good,3400
Executive Mesh Task Chair,Furniture & Fixtures,ADM-101,Steelcase,Gesture,SN-STC-4412,Excellent,720
Wireless Lapel Microphone Kit,Audio-Visual,ICT-302,Rode,Wireless PRO,SN-ROD-9102,Good,390`;

  const handleLoadSample = () => {
    setCsvText(sampleCsv);
    parseCsv(sampleCsv);
  };

  const parseCsv = (text: string) => {
    setError(null);
    setImportSummary(null);
    try {
      const lines = text.trim().split('\n');
      if (lines.length < 2) {
        setPreviewRows([]);
        return;
      }

      const rows: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim());
        if (parts.length >= 3 && parts[0]) {
          rows.push({
            name: parts[0],
            category: parts[1] || 'Electronics',
            locationCode: parts[2] || 'ADM-101',
            brand: parts[3] || '',
            model: parts[4] || '',
            serialNumber: parts[5] || '',
            condition: (parts[6] as AssetCondition) || 'Good',
            cost: parts[7] ? parseFloat(parts[7]) : undefined,
          });
        }
      }
      setPreviewRows(rows);
    } catch (e) {
      setError('Failed to parse CSV lines.');
    }
  };

  const handleImport = () => {
    if (previewRows.length === 0) {
      setError('No valid rows found to import.');
      return;
    }

    let successCount = 0;
    const defaultLoc = locations.find((l) => l.isActive && l.environment === environment);

    for (const row of previewRows) {
      const matchLoc =
        locations.find((l) => l.code.toLowerCase() === row.locationCode.toLowerCase()) ||
        defaultLoc;

      if (matchLoc) {
        const res = registerAsset({
          name: row.name,
          category: row.category,
          initialLocationId: matchLoc.id,
          currentLocationId: matchLoc.id,
          brand: row.brand || undefined,
          model: row.model || undefined,
          serialNumber: row.serialNumber || undefined,
          condition: row.condition || 'Good',
          status: 'Active',
          acquisitionCost: row.cost,
          currency: 'USD',
          environment,
          notes: 'Batch imported from Excel / CSV register.',
        });
        if (res.success) successCount++;
      }
    }

    setImportSummary(`Successfully imported ${successCount} assets with new unique Asset IDs!`);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold">Import Assets from Excel / CSV</h3>
              <p className="text-xs text-slate-300">
                Fixes original spreadsheet row-dependency with verified database ingestion
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Paste CSV records below:</span>
            <button
              onClick={handleLoadSample}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Load Sample CSV Rows</span>
            </button>
          </div>

          <textarea
            rows={5}
            placeholder="Asset Name,Category,Initial Location Code,Brand,Model,Serial Number,Condition,Acquisition Cost..."
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
              parseCsv(e.target.value);
            }}
            className="w-full font-mono text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
          />

          {error && <div className="text-xs text-rose-600 font-medium">{error}</div>}
          {importSummary && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{importSummary}</span>
            </div>
          )}

          {previewRows.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-900 mb-2">
                Parsed Rows Ready for ID Generation ({previewRows.length}):
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Loc Code</th>
                      <th className="p-2">Condition</th>
                      <th className="p-2">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2 font-medium text-slate-900">{r.name}</td>
                        <td className="p-2 text-slate-600">{r.category}</td>
                        <td className="p-2 font-mono text-[11px] text-blue-600">{r.locationCode}</td>
                        <td className="p-2 text-slate-600">{r.condition}</td>
                        <td className="p-2 font-mono">{r.cost ? `$${r.cost}` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={previewRows.length === 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <FileCheck className="w-4 h-4" />
              <span>Import &amp; Generate Asset IDs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
