export type AssetCondition = 'Excellent' | 'Good' | 'Fair' | 'Damaged' | 'Unserviceable';

export type OperationalStatus = 
  | 'Active' 
  | 'Under Maintenance' 
  | 'Missing' 
  | 'Retired' 
  | 'Disposed' 
  | 'Archived';

export type MovementReason = 
  | 'Internal transfer'
  | 'Change of assigned department'
  | 'Temporary relocation'
  | 'Maintenance'
  | 'Repair'
  | 'Return to original location'
  | 'Location Audit Confirmation'
  | 'Other';

export type MovementStatus = 
  | 'Draft'
  | 'Pending approval'
  | 'Approved'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled';

export type MaintenanceType = 'Preventative' | 'Corrective' | 'Inspection' | 'Emergency Repair';

export type MaintenanceStatus = 'Scheduled' | 'In Progress' | 'Waiting for Parts' | 'Completed' | 'Cancelled';

export type UserRole = 
  | 'Platform Administrator'
  | 'Organisation Administrator'
  | 'Asset Manager'
  | 'Department Manager'
  | 'Staff Member'
  | 'Auditor';

export type EnvironmentMode = 'organisation' | 'household';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  title?: string;
  avatar?: string;
}

export interface Location {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  level: 'Campus' | 'Building' | 'Floor' | 'Room' | 'Laboratory' | 'Zone';
  description?: string;
  isActive: boolean;
  environment: EnvironmentMode;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headUserId?: string;
  isActive: boolean;
}

export interface AssetCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  standardPrefix: string;
}

export interface Asset {
  id: string; // e.g. AST-00001
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  brand?: string;
  model?: string;
  serialNumber?: string; // Explicitly separate from system Asset ID!
  acquisitionDate?: string;
  acquisitionCost?: number;
  currency: string;
  initialLocationId: string;
  currentLocationId: string;
  responsiblePersonId?: string; // Separate from physical location!
  departmentId?: string;
  condition: AssetCondition;
  status: OperationalStatus;
  imageUrl?: string;
  lastConfirmedMovementDate: string;
  lastConfirmedMovementTime: string;
  isArchived: boolean;
  createdAt: string;
  registeredBy: string;
  environment: EnvironmentMode;
  notes?: string;
}

export interface AssetMovement {
  id: string; // e.g. MOV-2026-001
  assetId: string;
  assetName: string;
  previousLocationId: string;
  newLocationId: string;
  movementDate: string;
  movementTime: string;
  recordedAt: string;
  movementReason: MovementReason;
  requestedById: string;
  requestedByName: string;
  approvedById?: string;
  approvedByName?: string;
  approvalDate?: string;
  approvalRemarks?: string;
  rejectionReason?: string;
  completedById?: string;
  completedByName?: string;
  completedAt?: string;
  actualMovementDate?: string;
  actualMovementTime?: string;
  remarks?: string;
  status: MovementStatus;
  environment: EnvironmentMode;
}

export interface AssetAssignment {
  id: string;
  assetId: string;
  assetName: string;
  assignedToUserId: string;
  assignedToUserName: string;
  assignedByUserId: string;
  assignedByUserName: string;
  departmentId?: string;
  assignedDate: string;
  returnedDate?: string;
  status: 'Active' | 'Returned' | 'Transferred';
  receiptAcknowledged: boolean;
  notes?: string;
}

export interface MaintenanceRecord {
  id: string; // e.g. MNT-5001
  assetId: string;
  assetName: string;
  maintenanceType: MaintenanceType;
  problemDescription: string;
  reportedDate: string;
  assignedTechnician: string;
  startDate?: string;
  completionDate?: string;
  repairCost?: number;
  workPerformed?: string;
  status: MaintenanceStatus;
  scheduledReminderDate?: string;
  documents?: string[];
}

export interface MissingReport {
  id: string;
  assetId: string;
  assetName: string;
  lastKnownLocationId: string;
  reportedDate: string;
  reportedById: string;
  reportedByName: string;
  circumstances: string;
  isRecovered: boolean;
  recoveryDate?: string;
  recoveryLocationId?: string;
  recoveryNotes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: 'Asset' | 'Movement' | 'Location' | 'Maintenance' | 'Assignment' | 'User';
  entityId: string;
  details: string;
}

export interface NotificationItem {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'approval' | 'completed' | 'alert' | 'maintenance' | 'system';
  isRead: boolean;
  targetTab?: string;
  assetId?: string;
  movementId?: string;
}
