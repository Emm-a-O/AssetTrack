import React, { useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  MapPin,
  Calendar,
  User,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  PlusCircle,
} from 'lucide-react';
import { useAssetTrack } from '../../context/AssetTrackContext';

interface MissingAssetsViewProps {
  onOpenReportModal: (assetId?: string) => void;
  onOpenRecoverModal: (reportId: string) => void;
  onSelectAsset: (assetId: string) => void;
}

export const MissingAssetsView: React.FC<MissingAssetsViewProps> = ({
  onOpenReportModal,
  onOpenRecoverModal,
  onSelectAsset,
}) => {
  const { missingReports, assets, getLocationName, environment } = useAssetTrack();
  const [activeTab, setActiveTab] = useState<'active' | 'recovered'>('active');

  const scopedAssetIds = assets.filter((a) => a.environment === environment).map((a) => a.id);
  const activeReports = missingReports.filter((r) => scopedAssetIds.includes(r.assetId) && !r.isRecovered);
  const recoveredReports = missingReports.filter((r) => scopedAssetIds.includes(r.assetId) && r.isRecovered);

  const currentList = activeTab === 'active' ? activeReports : recoveredReports;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-600" />
            <span>Missing Assets &amp; Incident Investigation</span>
          </h2>
          <p className="text-xs text-slate-500">
            Formal investigation workflow and verified recovery tracking (Section 6.3)
          </p>
        </div>

        <button
          onClick={() => onOpenReportModal()}
          className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Report Asset Missing</span>
        </button>
      </div>

      {/* Workflow Explainer */}
      <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Section 6.3 Rule:</span> A missing asset does not simply disappear from the register. The system preserves all history, sets operational status to <em>Missing</em>, alerts the custodian and safety officer, and maintains the investigation until verified recovery.
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold text-slate-600">
        <button
          onClick={() => setActiveTab('active')}
          className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'active'
              ? 'border-rose-600 text-rose-600 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <span>Active Missing Incidents</span>
          {activeReports.length > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-600 text-white animate-pulse">
              {activeReports.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('recovered')}
          className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'recovered'
              ? 'border-emerald-600 text-emerald-600 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <span>Resolved &amp; Recovered Cases</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-700">
            {recoveredReports.length}
          </span>
        </button>
      </div>

      {/* List */}
      {currentList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <p className="font-semibold text-slate-800 text-sm">
            {activeTab === 'active'
              ? 'All assets accounted for! No active missing cases.'
              : 'No recovered incident logs in this category.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((report) => (
            <div
              key={report.id}
              className={`p-5 rounded-2xl border shadow-xs transition-all space-y-3 ${
                report.isRecovered ? 'bg-white border-slate-200' : 'bg-rose-50/30 border-rose-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200">
                    {report.id}
                  </span>
                  <button
                    onClick={() => onSelectAsset(report.assetId)}
                    className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors"
                  >
                    {report.assetName}
                  </button>
                  <span className="font-mono text-[11px] text-slate-400">({report.assetId})</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      report.isRecovered
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800 animate-pulse'
                    }`}
                  >
                    {report.isRecovered ? 'Recovered' : 'Missing & Under Investigation'}
                  </span>
                  <span className="text-[11px] text-slate-500">Reported: {report.reportedDate}</span>
                </div>
              </div>

              {/* Last known location */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Last Confirmed Location:</span>
                  <strong className="text-slate-900">{getLocationName(report.lastKnownLocationId)}</strong>
                </div>
                <div className="text-slate-600 text-xs pl-5">
                  <strong>Circumstances:</strong> "{report.circumstances}"
                </div>
                <div className="text-[11px] text-slate-400 pl-5">
                  Reported by: {report.reportedByName}
                </div>
              </div>

              {report.isRecovered && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Recovered on {report.recoveryDate}</span>
                  </div>
                  <p>
                    Verified at location:{' '}
                    <strong>{report.recoveryLocationId ? getLocationName(report.recoveryLocationId) : 'N/A'}</strong>
                  </p>
                  {report.recoveryNotes && <p className="italic">"{report.recoveryNotes}"</p>}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectAsset(report.assetId)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                >
                  View Asset Dossier
                </button>

                {!report.isRecovered && (
                  <button
                    onClick={() => onOpenRecoverModal(report.id)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify Recovery &amp; Restore</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
