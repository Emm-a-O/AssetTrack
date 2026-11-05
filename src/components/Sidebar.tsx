import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  ArrowLeftRight,
  MapPin,
  History,
  Wrench,
  UserCheck2,
  AlertOctagon,
  FileBarChart2,
  FolderTree,
  ShieldAlert,
} from 'lucide-react';
import { useAssetTrack } from '../context/AssetTrackContext';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { environment, movements, maintenanceRecords, missingReports, assets } = useAssetTrack();

  const scopedAssetIds = assets.filter((a) => a.environment === environment).map((a) => a.id);
  const pendingApprovalsCount = movements.filter((m) => m.environment === environment && m.status === 'Pending approval').length;
  const activeMaintenanceCount = maintenanceRecords.filter(
    (m) => scopedAssetIds.includes(m.assetId) && (m.status === 'In Progress' || m.status === 'Scheduled')
  ).length;
  const activeMissingCount = missingReports.filter((m) => scopedAssetIds.includes(m.assetId) && !m.isRecovered).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'KPIs, breakdowns & summary',
    },
    {
      id: 'assets',
      label: 'Asset Register',
      icon: Boxes,
      badge: assets.filter((a) => !a.isArchived && a.environment === environment).length,
      description: 'All registered physical assets',
    },
    {
      id: 'movements',
      label: 'Asset Movements',
      icon: ArrowLeftRight,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
      description: 'Transfers, approvals & verification',
    },
    {
      id: 'locations',
      label: 'Current Locations',
      icon: MapPin,
      description: 'Latest confirmed asset positions',
    },
    {
      id: 'history',
      label: 'History & Audit Trail',
      icon: History,
      description: 'Physical moves & system audit logs',
    },
    {
      id: 'maintenance',
      label: 'Condition & Service',
      icon: Wrench,
      badge: activeMaintenanceCount > 0 ? activeMaintenanceCount : undefined,
      badgeColor: 'bg-blue-600 text-white',
      description: 'Maintenance logs & conditions',
    },
    ...(environment === 'organisation'
      ? [
          {
            id: 'allocation',
            label: 'Allocation & Custody',
            icon: UserCheck2,
            description: 'Staff & department responsibility',
          },
        ]
      : []),
    {
      id: 'missing',
      label: 'Missing Incidents',
      icon: AlertOctagon,
      badge: activeMissingCount > 0 ? activeMissingCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
      description: 'Incident reports & recovery',
    },
    {
      id: 'reports',
      label: 'Reports & Export',
      icon: FileBarChart2,
      description: 'Printable audits & Excel sheets',
    },
    ...(environment === 'organisation'
      ? [
          {
            id: 'structure',
            label: 'Locations & Depts',
            icon: FolderTree,
            description: 'Hierarchy & organizational units',
          },
        ]
      : []),
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:block bg-slate-900 text-slate-300 p-4 border-r border-slate-800 flex flex-col justify-between min-h-[calc(100vh-4rem)]">
      <div>
        <div className="px-3 pb-3 border-b border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {environment === 'organisation' ? 'Organisation Management' : 'Household Registry'}
          </div>
          <div className="text-xs text-slate-300 mt-0.5 truncate">
            {environment === 'organisation' ? 'Springfield Academy & STEM Institute' : 'Family Residential Portfolio'}
          </div>
        </div>

        <nav className="mt-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                      item.badgeColor || (isActive ? 'bg-blue-800 text-white' : 'bg-slate-800 text-slate-300')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Compliance / System Status Footer */}
      <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-2 mb-1.5 text-slate-300 font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
          <span>Audit-Ready Mode</span>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-500">
          Transactions are atomic &amp; irreversible. NDPA 2023 compliant data isolation.
        </p>
      </div>
    </aside>
  );
};
