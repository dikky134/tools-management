export type Role = 'ADMIN' | 'EMPLOYEE' | 'MECHANIC';

export type ToolStatus = 'AVAILABLE' | 'BORROWED' | 'DAMAGED' | 'MAINTENANCE' | 'INACTIVE';
export type ToolCondition = 'GOOD' | 'MINOR_DAMAGE' | 'DAMAGED';
export type BorrowingStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'CANCELLED';
export type MaintenanceStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'WAITING_FOR_PARTS' | 'COMPLETED' | 'CANCELLED';
export type MechanicAvailability = 'AVAILABLE' | 'BUSY' | 'OFF_DUTY';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RepairResult = 'REPAIRED' | 'PARTIALLY_REPAIRED' | 'UNREPAIRABLE';
export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  department: string;
  role: Role;
  status: UserStatus;
  mechanicStatus?: MechanicAvailability;
  createdAt: string;
}

export interface ToolCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface Tool {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  brand: string;
  model: string;
  serialNumber: string;
  description: string;
  purchaseDate: string;
  purchasePrice: number;
  location: string;
  condition: ToolCondition;
  status: ToolStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Borrowing {
  id: string;
  toolId: string;
  borrowerId: string;
  purpose: string;
  borrowedAt: string;
  expectedReturn: string;
  returnedAt?: string;
  returnCondition?: ToolCondition;
  returnNotes?: string;
  status: BorrowingStatus;
}

export interface DamageReport {
  id: string;
  toolId: string;
  reportedBy: string;
  damageType: string;
  description: string;
  priority: Priority;
  reportedAt: string;
  photoUrl?: string;
}

export interface MaintenanceRequest {
  id: string;
  toolId: string;
  reportedBy: string;
  assignedMechanic?: string;
  description: string;
  priority: Priority;
  status: MaintenanceStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  repairNotes?: string;
  repairCost?: number;
  repairResult?: RepairResult;
  partsReplaced?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  description: string;
  createdAt: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  tools: Tool[];
  categories: ToolCategory[];
  borrowings: Borrowing[];
  maintenanceRequests: MaintenanceRequest[];
  damageReports: DamageReport[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
}
