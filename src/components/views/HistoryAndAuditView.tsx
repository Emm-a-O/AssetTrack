import React, { useState } from 'react';
import {
  History,
  ShieldCheck,
  Search,
  ArrowRight,
  MapPin,
  Calendar,
  User,
  Filter,
  FileText,
  Clock,
  Download,
} from 'lucide-react';
import { useAssetTrack } from '../../context/AssetTrackContext';

interface HistoryAndAuditViewProps {
  onSelectAsset: (assetId: string) => void;
}

export const HistoryAndAuditView: React.FC<HistoryAndAuditViewProps> = ({ onSelectAsset }) => {
  const { movements, auditLogs, getLocationName, environment } = useAssetTrack();
  const [activeTab, setActiveTab] = useState<'movements' | 'audit'>('movements');
  const [searchQuery, setSearchQuery] = useState('');

  const scopedMovements = movements.filter((m) => m.environment === environment);

  const filteredMovements = scopedMovements.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.id.toLowerCase().includes(q) ||
      m.assetId.toLowerCase().includes(q) ||
      m.assetName.toLowerCase().includes(q) ||
      m.requestedByName.toLowerCase().includes(q) ||
      m.movementReason.toLowerCase().includes(q)
    );
  });

  const filteredAuditLogs = auditLogs.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.id.toLowerCase().includes(q) ||
      l.actorName.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.entityId.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <span>Movement History &amp; System Audit Trail</span>
          </h2>
          <p className="text-xs text-slate-500">
            Immutable physical transfers ledger (Tab 1) alongside system governance audit trail (Tab 2)
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search records, user, or action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold text-slate-600">
        <button
          onClick={() => setActiveTab('movements')}
          className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'movements'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <span>1. Physical Movement Log</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-700">
            {scopedMovements.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <span>2. System Audit Trail</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-700">
            {auditLogs.length}
          </span>
        </button>
      </div>

      {/* Principle Note */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Specification Guidance (Module 4):</span> A system audit log should not be confused with physical movement history. Physical moves document relocation transactions, whereas audit trails log system operations (edits, approvals, archives, permission changes). Neither may be directly overwritten.
        </div>
      </div>

      {activeTab === 'movements' ? (
        /* Physical Movements Log */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tx ID</th>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Asset</th>
                  <th className="py-3 px-4">From Location</th>
                  <th className="py-3 px-4">To Location</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">
                    {environment === 'household' ? 'Moved By (Individual)' : 'Requested By'}
                  </th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMovements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                      {mov.id}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      <div>{mov.movementDate}</div>
                      <div className="text-[10px] text-slate-400">{mov.movementTime}</div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onSelectAsset(mov.assetId)}
                        className="font-bold text-slate-900 hover:text-blue-600 text-left block"
                      >
                        {mov.assetName}
                      </button>
                      <span className="font-mono text-[10px] text-slate-400">{mov.assetId}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {getLocationName(mov.previousLocationId)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {getLocationName(mov.newLocationId)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {mov.movementReason}
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      <span className="font-semibold text-indigo-950 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1 w-fit text-xs">
                        <User className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{mov.requestedByName}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
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
                        {environment === 'household' ? 'Moved Freely' : mov.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Immutable System Audit Trail */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Audit ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-600 whitespace-nowrap">
                      {log.id}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                      {log.actorName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {log.entityType} ({log.entityId})
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-xs max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
