import React, { useState } from 'react';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Calendar,
  DollarSign,
  User,
  Shield,
  Layers,
} from 'lucide-react';
import { useAssetTrack } from '../../context/AssetTrackContext';
import { MaintenanceRecord } from '../../types';

interface MaintenanceViewProps {
  onOpenMaintenanceModal: (assetId?: string) => void;
  onOpenCompleteModal: (maintenanceId: string) => void;
  onSelectAsset: (assetId: string) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  onOpenMaintenanceModal,
  onOpenCompleteModal,
  onSelectAsset,
}) => {
  const { maintenanceRecords, assets, getLocationName, environment } = useAssetTrack();
  const [subTab, setSubTab] = useState<'active' | 'completed'>('active');

  const scopedAssetIds = assets.filter((a) => a.environment === environment).map((a) => a.id);
  const activeTickets = maintenanceRecords.filter(
    (m) => scopedAssetIds.includes(m.assetId) && (m.status === 'In Progress' || m.status === 'Scheduled' || m.status === 'Waiting for Parts')
  );
  const completedTickets = maintenanceRecords.filter(
    (m) => scopedAssetIds.includes(m.assetId) && m.status === 'Completed'
  );

  const currentList = subTab === 'active' ? activeTickets : completedTickets;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-600" />
            <span>Asset Condition &amp; Maintenance Management</span>
          </h2>
          <p className="text-xs text-slate-500">
            Decoupled physical condition from operational lifecycle status (Module 5)
          </p>
        </div>

        <button
          onClick={() => onOpenMaintenanceModal()}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs shadow-blue-500/20 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log Service Ticket</span>
        </button>
      </div>

      {/* Conceptual Clarity Banner */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
        <Layers className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Module 5 Specification Rule:</span> Asset condition (Excellent, Good, Fair, Damaged, Unserviceable) describes physical state. Operational status (Active, Under Maintenance, Missing, Retired) describes lifecycle availability. An item can be physically good but under routine scheduled service. Physical location remains recorded throughout.
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold text-slate-600">
        <button
          onClick={() => setSubTab('active')}
          className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
            subTab === 'active'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <span>Active Service Cases</span>
          {activeTickets.length > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-600 text-white">
              {activeTickets.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('completed')}
          className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
            subTab === 'completed'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <span>Completed Maintenance Log</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-700">
            {completedTickets.length}
          </span>
        </button>
      </div>

      {/* Cards List */}
      {currentList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-800 text-sm">No maintenance cases in this view.</p>
          <p>Click "Log Service Ticket" to schedule maintenance or document a repair.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((ticket) => {
            const asset = assets.find((a) => a.id === ticket.assetId);

            return (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      {ticket.id}
                    </span>
                    <button
                      onClick={() => onSelectAsset(ticket.assetId)}
                      className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors text-left"
                    >
                      {ticket.assetName}
                    </button>
                    <span className="font-mono text-[11px] text-slate-400">({ticket.assetId})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        ticket.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}
                    >
                      {ticket.status}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {ticket.maintenanceType}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="font-semibold text-slate-900 mb-0.5">Problem / Work Scope:</div>
                  <p className="text-slate-700">{ticket.problemDescription}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Technician / Vendor:</span>
                    <strong className="text-slate-800">{ticket.assignedTechnician}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Reported Date:</span>
                    <span className="text-slate-700">{ticket.reportedDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Equipment Physical Location:</span>
                    <span className="text-slate-700">
                      {asset ? getLocationName(asset.currentLocationId) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Repair Cost:</span>
                    <strong className="text-slate-900">
                      {ticket.repairCost ? `$${ticket.repairCost.toLocaleString()}` : 'Pending final invoice'}
                    </strong>
                  </div>
                </div>

                {ticket.workPerformed && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-900 space-y-0.5">
                    <div className="font-semibold">Work Performed:</div>
                    <p>{ticket.workPerformed}</p>
                    {ticket.completionDate && (
                      <span className="text-[10px] text-emerald-700 block mt-1">
                        Completed on {ticket.completionDate}
                      </span>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onSelectAsset(ticket.assetId)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    View Asset Dossier
                  </button>

                  {ticket.status !== 'Completed' && (
                    <button
                      onClick={() => onOpenCompleteModal(ticket.id)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete &amp; Restore Active</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
