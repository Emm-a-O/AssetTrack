import React, { useState } from 'react';
import {
  UserCheck2,
  User,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Boxes,
  FileCheck,
} from 'lucide-react';
import { useAssetTrack } from '../../context/AssetTrackContext';

interface AllocationViewProps {
  onOpenAssignModal: (assetId: string) => void;
  onSelectAsset: (assetId: string) => void;
}

export const AllocationView: React.FC<AllocationViewProps> = ({
  onOpenAssignModal,
  onSelectAsset,
}) => {
  const {
    assets,
    assignments,
    users,
    departments,
    currentUser,
    acknowledgeAssignment,
    getLocationName,
    getDepartmentName,
  } = useAssetTrack();

  const [activeTab, setActiveTab] = useState<'roster' | 'history'>('roster');

  const activeAssignments = assignments.filter((a) => a.status === 'Active');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck2 className="w-5 h-5 text-indigo-600" />
            <span>Asset Allocation &amp; Custody Management</span>
          </h2>
          <p className="text-xs text-slate-500">
            Designated custodian tracking, receipt acknowledgement, and responsibility transfer (Module 6)
          </p>
        </div>
      </div>

      {/* Module 6 Concept Card */}
      <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-start gap-2.5">
        <Shield className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Permanent Custody Retention:</span> When an asset's responsible person is transferred, all prior assignments, dates, and sign-offs remain permanently preserved in the historical register.
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold text-slate-600">
        <button
          onClick={() => setActiveTab('roster')}
          className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'roster'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <span>Staff Custodians &amp; Active Custody</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-100 text-indigo-800">
            {activeAssignments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'history'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <span>All Allocation Records &amp; Transfers</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-700">
            {assignments.length}
          </span>
        </button>
      </div>

      {activeTab === 'roster' ? (
        /* Staff Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => {
            const userAssets = assets.filter((a) => !a.isArchived && a.responsiblePersonId === user.id);

            return (
              <div
                key={user.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* User Profile Info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-100"
                    />
                    <div className="truncate">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{user.name}</h3>
                      <p className="text-[11px] text-slate-500 truncate">
                        {user.role} • {user.title}
                      </p>
                      <span className="text-[10px] text-indigo-600 font-medium">
                        Dept: {getDepartmentName(user.departmentId)}
                      </span>
                    </div>
                  </div>

                  {/* Assigned Assets Mini List */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Assigned Assets ({userAssets.length}):</span>
                    </div>

                    {userAssets.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">No assets currently assigned to this custodian.</p>
                    ) : (
                      userAssets.map((asset) => {
                        const activeAsn = assignments.find(
                          (a) => a.assetId === asset.id && a.assignedToUserId === user.id && a.status === 'Active'
                        );

                        return (
                          <div
                            key={asset.id}
                            className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-center justify-between gap-2"
                          >
                            <div className="truncate pr-1">
                              <span className="font-mono font-bold text-indigo-600 mr-1.5">{asset.id}</span>
                              <span className="font-medium text-slate-800">{asset.name}</span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                Physically in: {getLocationName(asset.currentLocationId)}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {activeAsn && !activeAsn.receiptAcknowledged && (
                                <button
                                  onClick={() => acknowledgeAssignment(activeAsn.id)}
                                  className="px-2 py-0.5 text-[10px] bg-amber-100 text-amber-800 hover:bg-amber-200 rounded-md font-semibold"
                                  title="Sign & acknowledge equipment receipt"
                                >
                                  Sign Off
                                </button>
                              )}
                              <button
                                onClick={() => onOpenAssignModal(asset.id)}
                                className="px-2 py-0.5 text-[10px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md font-medium"
                              >
                                Reassign
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* History Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Custody ID</th>
                  <th className="py-3 px-4">Asset</th>
                  <th className="py-3 px-4">Assigned Custodian</th>
                  <th className="py-3 px-4">Assigned By</th>
                  <th className="py-3 px-4">Assigned Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Receipt Sign-off</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((asn) => (
                  <tr key={asn.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 whitespace-nowrap">
                      {asn.id}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onSelectAsset(asn.assetId)}
                        className="font-bold text-slate-900 hover:text-blue-600 text-left block"
                      >
                        {asn.assetName}
                      </button>
                      <span className="font-mono text-[10px] text-slate-400">{asn.assetId}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {asn.assignedToUserName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {asn.assignedByUserName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {asn.assignedDate}
                      {asn.returnedDate && (
                        <span className="block text-[10px] text-slate-400">
                          Returned: {asn.returnedDate}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          asn.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {asn.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {asn.receiptAcknowledged ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledged
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium text-[11px] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Pending Sign-off
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs text-[11px]">
                      {asn.notes || '—'}
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
