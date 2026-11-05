import React from 'react';
import {
  Boxes,
  MapPin,
  ArrowLeftRight,
  Wrench,
  AlertOctagon,
  CheckCircle2,
  Clock,
  TrendingUp,
  PlusCircle,
  QrCode,
  ArrowRight,
  ShieldAlert,
  FolderTree,
  Tag,
  Layers,
} from 'lucide-react';
import { useAssetTrack } from '../../context/AssetTrackContext';

interface DashboardViewProps {
  onOpenRegisterModal: () => void;
  onOpenMovementModal: (assetId?: string) => void;
  onOpenScanModal: () => void;
  onSelectAsset: (assetId: string) => void;
  onSelectTab: (tabId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenRegisterModal,
  onOpenMovementModal,
  onOpenScanModal,
  onSelectAsset,
  onSelectTab,
}) => {
  const {
    assets,
    movements,
    locations,
    categories,
    maintenanceRecords,
    missingReports,
    environment,
    currentUser,
    getLocationName,
    approveMovement,
    completeMovement,
  } = useAssetTrack();

  const scopedAssets = assets.filter((a) => a.environment === environment);
  const activeAssets = scopedAssets.filter((a) => !a.isArchived && a.status === 'Active');
  const underMaintenanceAssets = scopedAssets.filter((a) => !a.isArchived && a.status === 'Under Maintenance');
  const missingAssets = scopedAssets.filter((a) => !a.isArchived && a.status === 'Missing');
  const damagedAssets = scopedAssets.filter((a) => !a.isArchived && (a.condition === 'Damaged' || a.condition === 'Unserviceable'));
  const archivedAssets = scopedAssets.filter((a) => a.isArchived);

  const pendingMovements = movements.filter((m) => m.status === 'Pending approval');
  const approvedReadyMovements = movements.filter((m) => m.status === 'Approved');
  const completedMovements = movements.filter((m) => m.status === 'Completed');

  // Distribution by category
  const categoryCounts = categories.map((cat) => {
    const count = scopedAssets.filter((a) => !a.isArchived && a.category === cat.name).length;
    return { name: cat.name, count };
  }).sort((a, b) => b.count - a.count);

  // Distribution by location
  const locationCounts = locations
    .filter((loc) => loc.environment === environment && loc.isActive)
    .map((loc) => {
      const count = scopedAssets.filter((a) => !a.isArchived && a.currentLocationId === loc.id).length;
      return { name: loc.name, count, code: loc.code };
    })
    .sort((a, b) => b.count - a.count);

  const recentTransactions = movements.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-950/90 px-2.5 py-0.5 rounded-full border border-blue-800">
              {environment === 'organisation' ? 'Organisation Environment' : 'Household Environment'}
            </span>
            <span className="text-xs text-slate-400">
              Welcome back, <strong>{currentUser.name}</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
            Physical Asset Command Center
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Centralised verified register of physical possessions, atomic transfer transactions, real-time location auditing, and maintenance logs.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenScanModal}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <QrCode className="w-3.5 h-3.5 text-blue-400" />
            <span>Scan Tag</span>
          </button>
          <button
            onClick={() => onOpenMovementModal()}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
            <span>Transfer Asset</span>
          </button>
          <button
            onClick={onOpenRegisterModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Register Asset</span>
          </button>
        </div>
      </div>

      {/* Pending Approvals Callout Banner if any */}
      {pendingMovements.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                {pendingMovements.length} Movement {pendingMovements.length === 1 ? 'Request Requires' : 'Requests Require'} Authorization
              </h4>
              <p className="text-[11px] text-amber-800">
                Staff members have submitted transfer requests awaiting custodian review.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('movements')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0"
          >
            Review Requests
          </button>
        </div>
      )}

      {/* Core Mutually-Exclusive Indicators (Section 1.4 & Module 7 Rule) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Assets */}
        <div
          onClick={() => onSelectTab('assets')}
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Assets</span>
            <Boxes className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {scopedAssets.length}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Registered in registry</span>
        </div>

        {/* Active Operational Status */}
        <div
          onClick={() => onSelectTab('assets')}
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-emerald-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Active Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            {activeAssets.length}
          </div>
          <span className="text-[10px] text-emerald-600 mt-1 block font-medium">Available &amp; deployed</span>
        </div>

        {/* Under Maintenance */}
        <div
          onClick={() => onSelectTab('maintenance')}
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-amber-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>In Service</span>
            <Wrench className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">
            {underMaintenanceAssets.length}
          </div>
          <span className="text-[10px] text-amber-600 mt-1 block font-medium">Under repair</span>
        </div>

        {/* Missing Assets */}
        <div
          onClick={() => onSelectTab('missing')}
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-rose-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Missing</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 mt-2">
            {missingAssets.length}
          </div>
          <span className="text-[10px] text-rose-600 mt-1 block font-medium">Active investigations</span>
        </div>

        {/* Damaged Condition Attention */}
        <div
          onClick={() => onSelectTab('assets')}
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-purple-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Damaged Wear</span>
            <ShieldAlert className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700 mt-2">
            {damagedAssets.length}
          </div>
          <span className="text-[10px] text-purple-600 mt-1 block font-medium">Fair / Damaged condition</span>
        </div>

        {/* Registered Locations */}
        <div
          onClick={() => onSelectTab('locations')}
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Active Locations</span>
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {locations.filter((l) => l.isActive && l.environment === environment).length}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Rooms &amp; premises</span>
        </div>
      </div>

      {/* Main Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions & Movements */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-blue-600" />
                <span>Recent Movement Transactions</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Audited physical relocations and verified transfers
              </p>
            </div>
            <button
              onClick={() => onSelectTab('movements')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <span>View All ({movements.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTransactions.map((mov) => (
              <div
                key={mov.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/70 rounded-lg px-2 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600">{mov.id}</span>
                    <span className="text-xs font-bold text-slate-900">{mov.assetName}</span>
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
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="text-slate-500">{getLocationName(mov.previousLocationId)}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="font-semibold text-slate-900">{getLocationName(mov.newLocationId)}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-[11px] text-slate-500">{mov.movementReason}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-[11px] text-slate-400">
                    {mov.movementDate} {mov.movementTime}
                  </span>
                  <button
                    onClick={() => onSelectAsset(mov.assetId)}
                    className="px-2 py-1 text-[11px] text-blue-600 hover:bg-blue-50 rounded-md font-medium"
                  >
                    Asset Dossier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category & Location Distribution */}
        <div className="space-y-6">
          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-600" />
                <span>Assets by Category</span>
              </h3>
              <span className="text-xs text-slate-400">{scopedAssets.length} items</span>
            </div>

            <div className="space-y-2.5">
              {categoryCounts.slice(0, 5).map((cat) => {
                const pct = scopedAssets.length > 0 ? Math.round((cat.count / scopedAssets.length) * 100) : 0;
                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{cat.name}</span>
                      <span className="font-bold text-slate-900">{cat.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Locations */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-600" />
                <span>Assets by Location</span>
              </h3>
              <button
                onClick={() => onSelectTab('locations')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                View Map
              </button>
            </div>

            <div className="space-y-2">
              {locationCounts.slice(0, 5).map((loc) => (
                <div
                  key={loc.name}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs border border-slate-100"
                >
                  <div className="truncate pr-2">
                    <span className="font-semibold text-slate-800 block truncate">{loc.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{loc.code}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[11px] shrink-0">
                    {loc.count} assets
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
