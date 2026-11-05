import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Asset,
  Location,
  Department,
  AssetCategory,
  AssetMovement,
  AssetAssignment,
  MaintenanceRecord,
  MissingReport,
  AuditLog,
  NotificationItem,
  User,
  EnvironmentMode,
  UserRole,
  AssetCondition,
  OperationalStatus,
  MovementReason,
} from '../types';
import {
  INITIAL_ASSETS,
  INITIAL_LOCATIONS,
  INITIAL_DEPARTMENTS,
  INITIAL_CATEGORIES,
  INITIAL_MOVEMENTS,
  INITIAL_ASSIGNMENTS,
  INITIAL_MAINTENANCE,
  INITIAL_MISSING_REPORTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_USERS,
} from '../data/initialData';

export type ThemeMode = 'light' | 'dark' | 'system';

interface AssetTrackContextType {
  environment: EnvironmentMode;
  setEnvironment: (env: EnvironmentMode) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  departments: Department[];
  categories: AssetCategory[];
  locations: Location[];
  assets: Asset[];
  movements: AssetMovement[];
  assignments: AssetAssignment[];
  maintenanceRecords: MaintenanceRecord[];
  missingReports: MissingReport[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  unreadNotificationsCount: number;

  // Asset Actions
  registerAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'lastConfirmedMovementDate' | 'lastConfirmedMovementTime' | 'isArchived' | 'registeredBy'>) => { success: boolean; asset?: Asset; error?: string };
  updateAsset: (id: string, updates: Partial<Asset>) => { success: boolean; error?: string };
  archiveAsset: (id: string) => { success: boolean; error?: string };
  restoreAsset: (id: string) => { success: boolean; error?: string };

  // Movement Workflow Actions
  requestMovement: (params: {
    assetId: string;
    newLocationId: string;
    movementReason: MovementReason;
    movementDate: string;
    movementTime: string;
    remarks?: string;
    requireApprovalDirectly?: boolean;
  }) => { success: boolean; movement?: AssetMovement; error?: string };
  approveMovement: (movementId: string, approvalRemarks?: string) => { success: boolean; error?: string };
  rejectMovement: (movementId: string, rejectionReason: string) => { success: boolean; error?: string };
  completeMovement: (movementId: string, actualDate?: string, actualTime?: string) => { success: boolean; error?: string };
  cancelMovement: (movementId: string, reason?: string) => { success: boolean; error?: string };

  // Responsibility & Custody
  assignAsset: (assetId: string, targetUserId: string, notes?: string) => { success: boolean; error?: string };
  acknowledgeAssignment: (assignmentId: string) => { success: boolean; error?: string };

  // Maintenance Actions
  createMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id'>) => { success: boolean; error?: string };
  completeMaintenanceRecord: (id: string, workPerformed: string, repairCost?: number, newCondition?: AssetCondition) => { success: boolean; error?: string };

  // Missing & Recovery
  reportMissingAsset: (assetId: string, circumstances: string) => { success: boolean; error?: string };
  recoverMissingAsset: (missingReportId: string, verifiedLocationId: string, recoveryNotes: string) => { success: boolean; error?: string };

  // Locations & Departments
  addLocation: (loc: Omit<Location, 'id'>) => { success: boolean; error?: string };
  updateLocation: (id: string, updates: Partial<Location>) => { success: boolean; error?: string };
  toggleLocationActive: (id: string) => { success: boolean; error?: string };
  addDepartment: (dept: Omit<Department, 'id'>) => { success: boolean; error?: string };

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Utilities
  getLocationName: (id: string) => string;
  getLocationHierarchyName: (id: string) => string;
  getDepartmentName: (id?: string) => string;
  getUserName: (id?: string) => string;
  resetAllDemoData: () => void;
  generateNextAssetId: (env: EnvironmentMode) => string;
}

const STORAGE_KEY = 'assettrack_state_v3';

const AssetTrackContext = createContext<AssetTrackContextType | undefined>(undefined);

export const AssetTrackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial from localStorage if available
  const [environment, setEnvironmentState] = useState<EnvironmentMode>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_env`);
      return (saved as EnvironmentMode) || 'organisation';
    } catch {
      return 'organisation';
    }
  });

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_theme`);
      return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
    } catch {
      return 'system';
    }
  });

  const [currentUser, setCurrentUserState] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_user`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_USERS[0]; // Sarah Adebayo (Asset Manager)
  });

  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [departments, setDepartments] = useState<Department[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_departments`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_DEPARTMENTS;
  });

  const [allCategories] = useState<AssetCategory[]>(INITIAL_CATEGORIES);

  const categories = useMemo(() => {
    return allCategories.filter((c) => c.environments.includes(environment));
  }, [allCategories, environment]);

  const [locations, setLocations] = useState<Location[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_locations`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_LOCATIONS;
  });

  const [assets, setAssets] = useState<Asset[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_assets`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ASSETS;
  });

  const [movements, setMovements] = useState<AssetMovement[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_movements`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MOVEMENTS;
  });

  const [assignments, setAssignments] = useState<AssetAssignment[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_assignments`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ASSIGNMENTS;
  });

  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_maintenance`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MAINTENANCE;
  });

  const [missingReports, setMissingReports] = useState<MissingReport[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_missing`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MISSING_REPORTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_notifs`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_env`, environment);
      localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(currentUser));
      localStorage.setItem(`${STORAGE_KEY}_assets`, JSON.stringify(assets));
      localStorage.setItem(`${STORAGE_KEY}_movements`, JSON.stringify(movements));
      localStorage.setItem(`${STORAGE_KEY}_locations`, JSON.stringify(locations));
      localStorage.setItem(`${STORAGE_KEY}_departments`, JSON.stringify(departments));
      localStorage.setItem(`${STORAGE_KEY}_assignments`, JSON.stringify(assignments));
      localStorage.setItem(`${STORAGE_KEY}_maintenance`, JSON.stringify(maintenanceRecords));
      localStorage.setItem(`${STORAGE_KEY}_missing`, JSON.stringify(missingReports));
      localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
      localStorage.setItem(`${STORAGE_KEY}_notifs`, JSON.stringify(notifications));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [environment, currentUser, assets, movements, locations, departments, assignments, maintenanceRecords, missingReports, auditLogs, notifications]);

  useEffect(() => {
    const root = document.documentElement;
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      const resolvedTheme = themeMode === 'system'
        ? (systemPreference.matches ? 'dark' : 'light')
        : themeMode;
      root.dataset.theme = resolvedTheme;
      root.style.colorScheme = resolvedTheme;
    };

    applyTheme();
    try {
      localStorage.setItem(`${STORAGE_KEY}_theme`, themeMode);
    } catch {
      // Keep the current session theme if storage is unavailable.
    }

    if (themeMode === 'system') {
      systemPreference.addEventListener('change', applyTheme);
      return () => systemPreference.removeEventListener('change', applyTheme);
    }
  }, [themeMode]);

  const setEnvironment = (env: EnvironmentMode) => {
    setEnvironmentState(env);
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
  };

  // Helper log generator
  const logAudit = (action: string, entityType: AuditLog['entityType'], entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser.id,
      actorName: currentUser.name,
      action,
      entityType,
      entityId,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Helper notification generator
  const createNotification = (
    title: string,
    message: string,
    type: NotificationItem['type'],
    targetTab?: string,
    assetId?: string,
    movementId?: string
  ) => {
    const item: NotificationItem = {
      id: `NOTIF-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toISOString(),
      title,
      message,
      type,
      isRead: false,
      targetTab,
      assetId,
      movementId,
    };
    setNotifications((prev) => [item, ...prev]);
  };

  const generateNextAssetId = (env: EnvironmentMode): string => {
    const prefix = env === 'organisation' ? 'AST-' : 'AST-H';
    const existingNumbers = assets
      .map((a) => {
        if (env === 'organisation' && a.id.startsWith('AST-') && !a.id.startsWith('AST-H')) {
          const num = parseInt(a.id.replace('AST-', ''), 10);
          return isNaN(num) ? 0 : num;
        } else if (env === 'household' && a.id.startsWith('AST-H')) {
          const num = parseInt(a.id.replace('AST-H', ''), 10);
          return isNaN(num) ? 0 : num;
        }
        return 0;
      })
      .filter((n) => n > 0);

    const max = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    const nextNum = max + 1;
    if (env === 'organisation') {
      return `AST-${String(nextNum).padStart(5, '0')}`;
    }
    return `AST-H${String(nextNum).padStart(3, '0')}`;
  };

  // 1. Asset Registration
  const registerAsset = (
    assetData: Omit<Asset, 'id' | 'createdAt' | 'lastConfirmedMovementDate' | 'lastConfirmedMovementTime' | 'isArchived' | 'registeredBy'>
  ) => {
    if (!assetData.name.trim()) {
      return { success: false, error: 'Asset Name is mandatory.' };
    }
    if (!assetData.category) {
      return { success: false, error: 'Category is mandatory.' };
    }
    if (!assetData.initialLocationId) {
      return { success: false, error: 'Initial Location is mandatory.' };
    }

    const newId = generateNextAssetId(assetData.environment);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    const newAsset: Asset = {
      ...assetData,
      id: newId,
      currentLocationId: assetData.initialLocationId, // Current initially equals initial location
      lastConfirmedMovementDate: dateStr,
      lastConfirmedMovementTime: timeStr,
      isArchived: false,
      createdAt: dateStr,
      registeredBy: currentUser.name,
    };

    setAssets((prev) => [newAsset, ...prev]);

    // Initial assignment if specified
    if (assetData.responsiblePersonId) {
      const assignedUser = users.find((u) => u.id === assetData.responsiblePersonId);
      const newAssignment: AssetAssignment = {
        id: `ASN-${Date.now().toString().slice(-4)}`,
        assetId: newId,
        assetName: newAsset.name,
        assignedToUserId: assetData.responsiblePersonId,
        assignedToUserName: assignedUser ? assignedUser.name : 'Designated Custodian',
        assignedByUserId: currentUser.id,
        assignedByUserName: currentUser.name,
        departmentId: assetData.departmentId,
        assignedDate: dateStr,
        status: 'Active',
        receiptAcknowledged: true,
        notes: 'Initial custody assignment upon registration.',
      };
      setAssignments((prev) => [newAssignment, ...prev]);
    }

    logAudit(
      'Asset Registered',
      'Asset',
      newId,
      `Registered "${newAsset.name}" (${newAsset.category}) with ID ${newId} at location ${getLocationName(newAsset.initialLocationId)}`
    );

    return { success: true, asset: newAsset };
  };

  // 2. Update Asset
  const updateAsset = (id: string, updates: Partial<Asset>) => {
    const existing = assets.find((a) => a.id === id);
    if (!existing) return { success: false, error: 'Asset not found.' };

    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );

    logAudit(
      'Asset Information Edited',
      'Asset',
      id,
      `Updated details for asset ${id} (${existing.name})`
    );

    return { success: true };
  };

  // 3. Archive & Restore (Rule #9: Retaining historical records)
  const archiveAsset = (id: string) => {
    const existing = assets.find((a) => a.id === id);
    if (!existing) return { success: false, error: 'Asset not found.' };

    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isArchived: true, status: 'Archived' } : a))
    );

    logAudit(
      'Asset Archived',
      'Asset',
      id,
      `Archived asset ${id} (${existing.name}). Historical records preserved.`
    );

    createNotification(
      'Asset Archived',
      `Asset ${id} (${existing.name}) has been moved to archives.`,
      'system',
      'assets',
      id
    );

    return { success: true };
  };

  const restoreAsset = (id: string) => {
    const existing = assets.find((a) => a.id === id);
    if (!existing) return { success: false, error: 'Asset not found.' };

    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isArchived: false, status: 'Active' } : a))
    );

    logAudit(
      'Asset Restored',
      'Asset',
      id,
      `Restored asset ${id} (${existing.name}) from archives.`
    );

    return { success: true };
  };

  // 4. Movement Request
  const requestMovement = ({
    assetId,
    newLocationId,
    movementReason,
    movementDate,
    movementTime,
    remarks,
    requireApprovalDirectly,
  }: {
    assetId: string;
    newLocationId: string;
    movementReason: MovementReason;
    movementDate: string;
    movementTime: string;
    remarks?: string;
    requireApprovalDirectly?: boolean;
  }) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return { success: false, error: 'Asset not found.' };

    if (asset.isArchived) {
      return { success: false, error: 'Cannot move an archived asset.' };
    }

    if (asset.status === 'Missing') {
      return { success: false, error: 'Cannot record movement for an asset reported Missing. Recover it first.' };
    }

    const targetLoc = locations.find((l) => l.id === newLocationId);
    if (!targetLoc || !targetLoc.isActive) {
      return { success: false, error: 'Selected destination location is inactive or invalid.' };
    }

    // Check same location unless reason is audit confirmation
    if (asset.currentLocationId === newLocationId && movementReason !== 'Location Audit Confirmation') {
      return {
        success: false,
        error: `Asset is already recorded at "${getLocationName(newLocationId)}". Select a different destination or choose "Location Audit Confirmation".`,
      };
    }

    // Check if there is an active pending movement for this asset
    const activePending = movements.find(
      (m) => m.assetId === assetId && (m.status === 'Pending approval' || m.status === 'Draft')
    );
    if (activePending) {
      return {
        success: false,
        error: `Asset already has an active pending movement (${activePending.id}). Resolve or cancel it before submitting another.`,
      };
    }

    const isHousehold = environment === 'household' || asset.environment === 'household';

    // HOUSEHOLD PLATFORM RULE:
    // When in the household platform, items do not require permission to be moved.
    // Individuals logged in move items freely.
    // The system automatically records the individual who moves the item alongside the item.
    if (isHousehold) {
      const movementId = `MOV-H-${String(movements.length + 1).padStart(3, '0')}`;
      const nowIso = new Date().toISOString();

      const newMovement: AssetMovement = {
        id: movementId,
        assetId,
        assetName: `${asset.name}${asset.brand ? ` (${asset.brand})` : ''}`,
        previousLocationId: asset.currentLocationId, // Captured automatically
        newLocationId,
        movementDate,
        movementTime,
        recordedAt: nowIso,
        movementReason: movementReason || 'Internal transfer',
        requestedById: currentUser.id,
        requestedByName: currentUser.name, // The logged-in person who moved the item
        approvedById: currentUser.id,
        approvedByName: currentUser.name,
        approvalDate: nowIso,
        approvalRemarks: 'Household self-service transfer — no permission required.',
        completedById: currentUser.id,
        completedByName: currentUser.name,
        completedAt: nowIso,
        actualMovementDate: movementDate,
        actualMovementTime: movementTime,
        remarks: remarks || `Moved freely by ${currentUser.name} to ${targetLoc.name}`,
        status: 'Completed',
        environment: 'household',
      };

      // Instantly update asset's live physical location & timestamp
      setAssets((prev) =>
        prev.map((a) =>
          a.id === assetId
            ? {
                ...a,
                currentLocationId: newLocationId,
                lastConfirmedMovementDate: movementDate,
                lastConfirmedMovementTime: movementTime,
              }
            : a
        )
      );

      setMovements((prev) => [newMovement, ...prev]);

      logAudit(
        'Item Relocated (Household)',
        'Movement',
        movementId,
        `${currentUser.name} moved ${asset.id} (${asset.name}) from ${getLocationName(asset.currentLocationId)} to ${getLocationName(newLocationId)}. Logged automatically.`
      );

      createNotification(
        'Household Item Moved',
        `${currentUser.name} moved ${asset.name} to ${getLocationName(newLocationId)}.`,
        'completed',
        'movements',
        asset.id,
        movementId
      );

      return { success: true, movement: newMovement };
    }

    // ORGANISATION WORKFLOW:
    // Staff members require approval; Asset Managers / Admins can directly authorize
    const isManagerOrAdmin =
      currentUser.role === 'Asset Manager' ||
      currentUser.role === 'Organisation Administrator' ||
      currentUser.role === 'Platform Administrator';

    const requiresApproval = requireApprovalDirectly !== undefined ? requireApprovalDirectly : !isManagerOrAdmin;

    const movementId = `MOV-${new Date().getFullYear()}-${String(movements.length + 1).padStart(3, '0')}`;
    const nowIso = new Date().toISOString();

    const newMovement: AssetMovement = {
      id: movementId,
      assetId,
      assetName: `${asset.name}${asset.brand ? ` (${asset.brand})` : ''}`,
      previousLocationId: asset.currentLocationId, // Captured automatically
      newLocationId,
      movementDate,
      movementTime,
      recordedAt: nowIso,
      movementReason,
      requestedById: currentUser.id,
      requestedByName: currentUser.name,
      remarks,
      status: requiresApproval ? 'Pending approval' : 'Approved',
      approvedById: requiresApproval ? undefined : currentUser.id,
      approvedByName: requiresApproval ? undefined : currentUser.name,
      approvalDate: requiresApproval ? undefined : nowIso,
      approvalRemarks: requiresApproval ? undefined : 'Direct authorization by custodian manager.',
      environment: asset.environment,
    };

    setMovements((prev) => [newMovement, ...prev]);

    logAudit(
      'Movement Requested',
      'Movement',
      movementId,
      `Movement ${movementId} requested for ${asset.id} (${asset.name}) from ${getLocationName(asset.currentLocationId)} to ${getLocationName(newLocationId)}. Status: ${newMovement.status}`
    );

    if (requiresApproval) {
      createNotification(
        'Movement Approval Required',
        `${currentUser.name} requested movement of ${asset.name} (${asset.id}) to ${getLocationName(newLocationId)}.`,
        'approval',
        'movements',
        asset.id,
        movementId
      );
    } else {
      createNotification(
        'Movement Approved',
        `Movement ${movementId} approved. Physical transfer confirmation can now be logged.`,
        'completed',
        'movements',
        asset.id,
        movementId
      );
    }

    return { success: true, movement: newMovement };
  };

  // 5. Approve Movement
  const approveMovement = (movementId: string, approvalRemarks?: string) => {
    const mov = movements.find((m) => m.id === movementId);
    if (!mov) return { success: false, error: 'Movement request not found.' };

    if (mov.status !== 'Pending approval') {
      return { success: false, error: `Movement is currently "${mov.status}", not pending approval.` };
    }

    const nowIso = new Date().toISOString();

    setMovements((prev) =>
      prev.map((m) =>
        m.id === movementId
          ? {
              ...m,
              status: 'Approved',
              approvedById: currentUser.id,
              approvedByName: currentUser.name,
              approvalDate: nowIso,
              approvalRemarks: approvalRemarks || 'Approved for physical transfer.',
            }
          : m
      )
    );

    logAudit(
      'Movement Approved',
      'Movement',
      movementId,
      `Approved movement ${movementId} for asset ${mov.assetId}. Ready for physical transfer confirmation.`
    );

    createNotification(
      'Transfer Approved by Manager',
      `Movement ${movementId} for ${mov.assetName} was approved. Ready for physical relocation confirmation.`,
      'completed',
      'movements',
      mov.assetId,
      movementId
    );

    return { success: true };
  };

  // 6. Reject Movement (Rule #7: Retaining rejection reason)
  const rejectMovement = (movementId: string, rejectionReason: string) => {
    const mov = movements.find((m) => m.id === movementId);
    if (!mov) return { success: false, error: 'Movement request not found.' };

    if (!rejectionReason.trim()) {
      return { success: false, error: 'A specific rejection reason is required.' };
    }

    setMovements((prev) =>
      prev.map((m) =>
        m.id === movementId
          ? {
              ...m,
              status: 'Rejected',
              approvedById: currentUser.id,
              approvedByName: currentUser.name,
              approvalDate: new Date().toISOString(),
              rejectionReason,
            }
          : m
      )
    );

    logAudit(
      'Movement Rejected',
      'Movement',
      movementId,
      `Rejected movement ${movementId} for ${mov.assetId}. Reason: "${rejectionReason}"`
    );

    createNotification(
      'Movement Request Rejected',
      `Movement ${movementId} for ${mov.assetName} was rejected. Reason: ${rejectionReason}`,
      'alert',
      'movements',
      mov.assetId,
      movementId
    );

    return { success: true };
  };

  // 7. Complete Movement (Physical Transfer Confirmation + Atomic Location Update)
  const completeMovement = (movementId: string, actualDate?: string, actualTime?: string) => {
    const mov = movements.find((m) => m.id === movementId);
    if (!mov) return { success: false, error: 'Movement request not found.' };

    if (mov.status !== 'Approved' && mov.status !== 'Pending approval') {
      return { success: false, error: `Movement is in status "${mov.status}". Only approved movements can be confirmed.` };
    }

    const asset = assets.find((a) => a.id === mov.assetId);
    if (!asset) return { success: false, error: 'Asset record missing.' };

    // Concurrency Rule #4: The previous location must match the asset's current location when the movement is completed.
    if (asset.currentLocationId !== mov.previousLocationId) {
      return {
        success: false,
        error: `STALE LOCATION CONFLICT: Asset current location is "${getLocationName(asset.currentLocationId)}", but this transfer expected it at "${getLocationName(mov.previousLocationId)}". The asset may have been moved by another transaction. Please review.`,
      };
    }

    const now = new Date();
    const finalDate = actualDate || now.toISOString().split('T')[0];
    const finalTime = actualTime || now.toTimeString().slice(0, 5);
    const nowIso = now.toISOString();

    // 1. Update movement record to Completed
    setMovements((prev) =>
      prev.map((m) =>
        m.id === movementId
          ? {
              ...m,
              status: 'Completed',
              completedById: currentUser.id,
              completedByName: currentUser.name,
              completedAt: nowIso,
              actualMovementDate: finalDate,
              actualMovementTime: finalTime,
            }
          : m
      )
    );

    // 2. Atomically update asset's current location & timestamp
    setAssets((prev) =>
      prev.map((a) =>
        a.id === mov.assetId
          ? {
              ...a,
              currentLocationId: mov.newLocationId,
              lastConfirmedMovementDate: finalDate,
              lastConfirmedMovementTime: finalTime,
            }
          : a
      )
    );

    logAudit(
      'Movement Completed',
      'Movement',
      movementId,
      `Physical transfer verified. Asset ${asset.id} moved from ${getLocationName(mov.previousLocationId)} to ${getLocationName(mov.newLocationId)}.`
    );

    createNotification(
      'Physical Transfer Confirmed',
      `Asset ${asset.id} (${asset.name}) is now confirmed at ${getLocationName(mov.newLocationId)}.`,
      'completed',
      'locations',
      asset.id,
      movementId
    );

    return { success: true };
  };

  // 8. Cancel Movement
  const cancelMovement = (movementId: string, reason?: string) => {
    const mov = movements.find((m) => m.id === movementId);
    if (!mov) return { success: false, error: 'Movement not found.' };

    if (mov.status === 'Completed') {
      return { success: false, error: 'Cannot cancel an already completed movement. File a return movement instead.' };
    }

    setMovements((prev) =>
      prev.map((m) =>
        m.id === movementId
          ? {
              ...m,
              status: 'Cancelled',
              remarks: `${m.remarks || ''} [Cancelled by ${currentUser.name}: ${reason || 'User cancelled'}]`.trim(),
            }
          : m
      )
    );

    logAudit(
      'Movement Cancelled',
      'Movement',
      movementId,
      `Movement ${movementId} cancelled by ${currentUser.name}`
    );

    return { success: true };
  };

  // 9. Assign Responsibility (Module 6: Asset Allocation)
  const assignAsset = (assetId: string, targetUserId: string, notes?: string) => {
    const asset = assets.find((a) => a.id === assetId);
    const targetUser = users.find((u) => u.id === targetUserId);
    if (!asset) return { success: false, error: 'Asset not found.' };
    if (!targetUser) return { success: false, error: 'Target user not found.' };

    const dateStr = new Date().toISOString().split('T')[0];

    // Mark previous active assignment as Transferred
    setAssignments((prev) =>
      prev.map((asn) =>
        asn.assetId === assetId && asn.status === 'Active'
          ? { ...asn, status: 'Transferred', returnedDate: dateStr }
          : asn
      )
    );

    const newAssignment: AssetAssignment = {
      id: `ASN-${Date.now().toString().slice(-4)}`,
      assetId,
      assetName: asset.name,
      assignedToUserId: targetUser.id,
      assignedToUserName: targetUser.name,
      assignedByUserId: currentUser.id,
      assignedByUserName: currentUser.name,
      departmentId: targetUser.departmentId || asset.departmentId,
      assignedDate: dateStr,
      status: 'Active',
      receiptAcknowledged: false, // Requires acknowledgement
      notes,
    };

    setAssignments((prev) => [newAssignment, ...prev]);

    // Update asset's responsiblePersonId
    setAssets((prev) =>
      prev.map((a) =>
        a.id === assetId
          ? {
              ...a,
              responsiblePersonId: targetUser.id,
              departmentId: targetUser.departmentId || a.departmentId,
            }
          : a
      )
    );

    logAudit(
      'Asset Responsibility Assigned',
      'Assignment',
      newAssignment.id,
      `Assigned custody of ${asset.id} (${asset.name}) to ${targetUser.name} (${targetUser.role})`
    );

    createNotification(
      'Asset Custody Assigned',
      `Responsibility for ${asset.name} (${asset.id}) assigned to ${targetUser.name}.`,
      'system',
      'allocation',
      asset.id
    );

    return { success: true };
  };

  const acknowledgeAssignment = (assignmentId: string) => {
    setAssignments((prev) =>
      prev.map((asn) =>
        asn.id === assignmentId ? { ...asn, receiptAcknowledged: true } : asn
      )
    );
    logAudit(
      'Custody Acknowledged',
      'Assignment',
      assignmentId,
      `Custodian acknowledged receipt for assignment ${assignmentId}`
    );
    return { success: true };
  };

  // 10. Maintenance Actions
  const createMaintenanceRecord = (record: Omit<MaintenanceRecord, 'id'>) => {
    const asset = assets.find((a) => a.id === record.assetId);
    if (!asset) return { success: false, error: 'Asset not found.' };

    const newId = `MNT-${Date.now().toString().slice(-4)}`;
    const newRecord: MaintenanceRecord = {
      ...record,
      id: newId,
    };

    setMaintenanceRecords((prev) => [newRecord, ...prev]);

    // Update asset operational status to 'Under Maintenance'
    // Physical location remains separate!
    setAssets((prev) =>
      prev.map((a) =>
        a.id === record.assetId
          ? {
              ...a,
              status: 'Under Maintenance',
            }
          : a
      )
    );

    logAudit(
      'Maintenance Logged',
      'Maintenance',
      newId,
      `Logged ${record.maintenanceType} maintenance for ${asset.id} (${asset.name}): "${record.problemDescription}"`
    );

    createNotification(
      'Maintenance Ticket Opened',
      `Asset ${asset.id} entered maintenance (${record.maintenanceType}). Assigned to ${record.assignedTechnician}.`,
      'maintenance',
      'maintenance',
      asset.id
    );

    return { success: true };
  };

  const completeMaintenanceRecord = (
    id: string,
    workPerformed: string,
    repairCost?: number,
    newCondition?: AssetCondition
  ) => {
    const record = maintenanceRecords.find((m) => m.id === id);
    if (!record) return { success: false, error: 'Maintenance record not found.' };

    const dateStr = new Date().toISOString().split('T')[0];

    setMaintenanceRecords((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status: 'Completed',
              completionDate: dateStr,
              workPerformed,
              repairCost: repairCost !== undefined ? repairCost : m.repairCost,
            }
          : m
      )
    );

    // Restore asset operational status to 'Active', update condition if specified
    setAssets((prev) =>
      prev.map((a) =>
        a.id === record.assetId
          ? {
              ...a,
              status: 'Active',
              condition: newCondition || a.condition,
            }
          : a
      )
    );

    logAudit(
      'Maintenance Completed',
      'Maintenance',
      id,
      `Completed maintenance for ${record.assetId}. Work: "${workPerformed}". Restored to Active status.`
    );

    createNotification(
      'Maintenance Completed',
      `Service on ${record.assetName} is finished and verified. Operational status restored to Active.`,
      'completed',
      'maintenance',
      record.assetId
    );

    return { success: true };
  };

  // 11. Missing & Recovery Workflow (Section 6.3)
  const reportMissingAsset = (assetId: string, circumstances: string) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return { success: false, error: 'Asset not found.' };

    const newReport: MissingReport = {
      id: `MIS-${Date.now().toString().slice(-4)}`,
      assetId,
      assetName: asset.name,
      lastKnownLocationId: asset.currentLocationId,
      reportedDate: new Date().toISOString().split('T')[0],
      reportedById: currentUser.id,
      reportedByName: currentUser.name,
      circumstances,
      isRecovered: false,
    };

    setMissingReports((prev) => [newReport, ...prev]);

    // Update asset operational status to Missing
    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, status: 'Missing' } : a))
    );

    logAudit(
      'Asset Reported Missing',
      'Asset',
      assetId,
      `Asset ${asset.id} (${asset.name}) reported missing from ${getLocationName(asset.currentLocationId)}. Incident: "${circumstances}"`
    );

    createNotification(
      'CRITICAL: Asset Reported Missing',
      `${asset.name} (${asset.id}) reported missing at ${getLocationName(asset.currentLocationId)}. Investigation opened.`,
      'alert',
      'missing',
      asset.id
    );

    return { success: true };
  };

  const recoverMissingAsset = (
    missingReportId: string,
    verifiedLocationId: string,
    recoveryNotes: string
  ) => {
    const report = missingReports.find((r) => r.id === missingReportId);
    if (!report) return { success: false, error: 'Missing report not found.' };

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    // Update report
    setMissingReports((prev) =>
      prev.map((r) =>
        r.id === missingReportId
          ? {
              ...r,
              isRecovered: true,
              recoveryDate: dateStr,
              recoveryLocationId: verifiedLocationId,
              recoveryNotes,
            }
          : r
      )
    );

    // Restore asset status to Active and update confirmed location
    setAssets((prev) =>
      prev.map((a) =>
        a.id === report.assetId
          ? {
              ...a,
              status: 'Active',
              currentLocationId: verifiedLocationId,
              lastConfirmedMovementDate: dateStr,
              lastConfirmedMovementTime: timeStr,
            }
          : a
      )
    );

    logAudit(
      'Asset Recovered',
      'Asset',
      report.assetId,
      `Asset ${report.assetId} recovered and confirmed at ${getLocationName(verifiedLocationId)}. Notes: ${recoveryNotes}`
    );

    createNotification(
      'Asset Recovered',
      `Previously missing asset ${report.assetId} (${report.assetName}) has been recovered at ${getLocationName(verifiedLocationId)}.`,
      'completed',
      'locations',
      report.assetId
    );

    return { success: true };
  };

  // 12. Locations & Departments
  const addLocation = (loc: Omit<Location, 'id'>) => {
    const newId = `LOC-${Date.now().toString().slice(-4)}`;
    const newLoc: Location = { ...loc, id: newId };
    setLocations((prev) => [...prev, newLoc]);
    logAudit('Location Added', 'Location', newId, `Created location "${newLoc.name}" (${newLoc.code})`);
    return { success: true };
  };

  const updateLocation = (id: string, updates: Partial<Location>) => {
    setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
    logAudit('Location Updated', 'Location', id, `Updated location ${id}`);
    return { success: true };
  };

  // Rule #10: A location should not be deleted if it has historical asset transactions. It should be deactivated instead.
  const toggleLocationActive = (id: string) => {
    const loc = locations.find((l) => l.id === id);
    if (!loc) return { success: false, error: 'Location not found.' };

    const newStatus = !loc.isActive;
    setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, isActive: newStatus } : l)));
    logAudit(
      newStatus ? 'Location Activated' : 'Location Deactivated',
      'Location',
      id,
      `Changed location "${loc.name}" active status to ${newStatus}`
    );
    return { success: true };
  };

  const addDepartment = (dept: Omit<Department, 'id'>) => {
    const newId = `DEP-${Date.now().toString().slice(-4)}`;
    setDepartments((prev) => [...prev, { ...dept, id: newId }]);
    return { success: true };
  };

  // 13. Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Utilities
  const getLocationName = (id: string): string => {
    const loc = locations.find((l) => l.id === id);
    return loc ? loc.name : id;
  };

  const getLocationHierarchyName = (id: string): string => {
    const loc = locations.find((l) => l.id === id);
    if (!loc) return id;
    if (loc.parentId) {
      const parent = locations.find((p) => p.id === loc.parentId);
      if (parent) return `${parent.name} › ${loc.name}`;
    }
    return loc.name;
  };

  const getDepartmentName = (id?: string): string => {
    if (!id) return 'General';
    const dept = departments.find((d) => d.id === id);
    return dept ? dept.name : id;
  };

  const getUserName = (id?: string): string => {
    if (!id) return 'Unassigned';
    const user = users.find((u) => u.id === id);
    return user ? user.name : id;
  };

  const resetAllDemoData = () => {
    setAssets(INITIAL_ASSETS);
    setLocations(INITIAL_LOCATIONS);
    setDepartments(INITIAL_DEPARTMENTS);
    setMovements(INITIAL_MOVEMENTS);
    setAssignments(INITIAL_ASSIGNMENTS);
    setMaintenanceRecords(INITIAL_MAINTENANCE);
    setMissingReports(INITIAL_MISSING_REPORTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentUserState(INITIAL_USERS[0]);
    setEnvironmentState('organisation');
    try {
      localStorage.removeItem(`${STORAGE_KEY}_assets`);
      localStorage.removeItem(`${STORAGE_KEY}_movements`);
      localStorage.removeItem(`${STORAGE_KEY}_locations`);
      localStorage.removeItem(`${STORAGE_KEY}_departments`);
      localStorage.removeItem(`${STORAGE_KEY}_assignments`);
      localStorage.removeItem(`${STORAGE_KEY}_maintenance`);
      localStorage.removeItem(`${STORAGE_KEY}_missing`);
      localStorage.removeItem(`${STORAGE_KEY}_audit`);
      localStorage.removeItem(`${STORAGE_KEY}_notifs`);
    } catch {}
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AssetTrackContext.Provider
      value={{
        environment,
        setEnvironment,
        themeMode,
        setThemeMode,
        currentUser,
        setCurrentUser,
        users,
        departments,
        categories,
        locations,
        assets,
        movements,
        assignments,
        maintenanceRecords,
        missingReports,
        auditLogs,
        notifications,
        unreadNotificationsCount,

        registerAsset,
        updateAsset,
        archiveAsset,
        restoreAsset,

        requestMovement,
        approveMovement,
        rejectMovement,
        completeMovement,
        cancelMovement,

        assignAsset,
        acknowledgeAssignment,

        createMaintenanceRecord,
        completeMaintenanceRecord,

        reportMissingAsset,
        recoverMissingAsset,

        addLocation,
        updateLocation,
        toggleLocationActive,
        addDepartment,

        markNotificationRead,
        markAllNotificationsRead,

        getLocationName,
        getLocationHierarchyName,
        getDepartmentName,
        getUserName,
        resetAllDemoData,
        generateNextAssetId,
      }}
    >
      {children}
    </AssetTrackContext.Provider>
  );
};

export const useAssetTrack = () => {
  const context = useContext(AssetTrackContext);
  if (!context) {
    throw new Error('useAssetTrack must be used within an AssetTrackProvider');
  }
  return context;
};
