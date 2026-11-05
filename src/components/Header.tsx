import React, { useState } from 'react';
import {
  Boxes,
  Bell,
  QrCode,
  Printer,
  PlusCircle,
  Building2,
  Home,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Clock,
  RotateCcw,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { useAssetTrack } from '../context/AssetTrackContext';
import { UserRole } from '../types';

interface HeaderProps {
  onOpenRegisterModal: () => void;
  onOpenScanModal: () => void;
  onOpenPrintLabelsModal: () => void;
  onSelectTab: (tabId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenRegisterModal,
  onOpenScanModal,
  onOpenPrintLabelsModal,
  onSelectTab,
}) => {
  const {
    environment,
    setEnvironment,
    currentUser,
    setCurrentUser,
    users,
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    resetAllDemoData,
  } = useAssetTrack();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Asset<span className="text-blue-600">Track</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {environment === 'organisation' ? 'Organisation' : 'Household'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Know what you own. Know where it is. Know who is responsible.
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Environment Toggle */}
            <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
              <button
                onClick={() => setEnvironment('organisation')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                  environment === 'organisation'
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Advanced organisation features (departments, approvals, staff roles)"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Organisation</span>
              </button>
              <button
                onClick={() => setEnvironment('household')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                  environment === 'household'
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Simplified personal possession tracking"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Household</span>
              </button>
            </div>

            {/* Quick Actions */}
            <button
              onClick={onOpenScanModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              title="Scan QR Code via Camera or Enter Asset ID"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Scan QR</span>
            </button>

            <button
              onClick={onOpenPrintLabelsModal}
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              title="Print QR Asset Tags Sheet"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Tags</span>
            </button>

            <button
              onClick={onOpenRegisterModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs shadow-blue-500/20 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Asset</span>
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Notifications &amp; Alerts</h4>
                      <p className="text-[11px] text-slate-500">Live operational updates</p>
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.targetTab) {
                              onSelectTab(n.targetTab);
                              setShowNotifications(false);
                            }
                          }}
                          className={`p-3 hover:bg-slate-50 cursor-pointer flex items-start gap-2.5 transition-colors ${
                            !n.isRead ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">{getNotificationIcon(n.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-900 leading-snug">
                              {n.title}
                            </p>
                            <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                              {new Date(n.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Current User & Role Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left"
                title="Switch active user role to test permissions"
              >
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-blue-600 font-medium">
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">Switch User Role</p>
                    <p className="text-[11px] text-slate-500">
                      Test multi-user permissions (Approvals, audits, custodian view)
                    </p>
                  </div>
                  <div className="py-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setCurrentUser(u);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-slate-50 transition-colors ${
                          u.id === currentUser.id ? 'bg-blue-50/60 font-semibold' : ''
                        }`}
                      >
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-900 truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-500">{u.role} • {u.title}</p>
                        </div>
                        {u.id === currentUser.id && (
                          <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 px-3 py-2 mt-1">
                    <button
                      onClick={() => {
                        if (confirm('Reset all demo data back to initial audit state?')) {
                          resetAllDemoData();
                          setShowUserMenu(false);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-medium transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Demo Dataset</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
