import type {
  ActivityLog,
  Borrowing,
  DamageReport,
  MaintenanceRequest,
  Notification,
  Tool,
  ToolCategory,
  User,
} from './types';

import type {
  DatabaseActivityLogRow,
  DatabaseBorrowingRow,
  DatabaseCategoryRow,
  DatabaseDamageReportRow,
  DatabaseMaintenanceRow,
  DatabaseNotificationRow,
  DatabaseToolRow,
  DatabaseUserRow,
} from './types/database';

export function mapUser(row: DatabaseUserRow): User {
  return {
    id: row.id,
    name: row.full_name,
    employeeId: row.employee_id,
    email: row.email,
    phone: row.phone ?? '',
    department: row.department ?? '',
    role: row.role,
    status: row.status,
    mechanicStatus: row.mechanic_status ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapCategory(
  row: DatabaseCategoryRow,
): ToolCategory {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    color: row.color ?? '',
  };
}

export function mapTool(row: DatabaseToolRow): Tool {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    categoryId: row.category_id ?? '',
    brand: row.brand ?? '',
    model: row.model ?? '',
    serialNumber: row.serial_number ?? '',
    description: row.description ?? '',
    purchaseDate: row.purchase_date ?? '',
    purchasePrice: Number(row.purchase_price ?? 0),
    location: row.location ?? '',
    condition: row.condition,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapBorrowing(
  row: DatabaseBorrowingRow,
): Borrowing {
  return {
    id: row.id,
    toolId: row.tool_id,
    borrowerId: row.borrower_id,
    purpose: row.purpose,
    borrowedAt: row.borrowed_at,
    expectedReturn: row.expected_return,
    returnedAt: row.returned_at ?? undefined,
    returnCondition:
      row.return_condition ?? undefined,
    returnNotes:
      row.return_notes ?? undefined,
    status: row.status,
  };
}

export function mapDamageReport(
  row: DatabaseDamageReportRow,
): DamageReport {
  return {
    id: row.id,
    toolId: row.tool_id,
    reportedBy: row.reported_by,
    damageType: row.damage_type ?? '',
    description: row.description,
    priority: row.priority,
    reportedAt: row.reported_at,
    photoUrl: row.photo_url ?? undefined,
  };
}

export function mapMaintenance(
  row: DatabaseMaintenanceRow,
): MaintenanceRequest {
  return {
    id: row.id,
    toolId: row.tool_id,
    reportedBy: row.reported_by ?? '',
    assignedMechanic:
      row.assigned_mechanic ?? undefined,
    description: row.description,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at,
    startedAt: row.started_at ?? undefined,
    completedAt:
      row.completed_at ?? undefined,
    repairNotes:
      row.repair_notes ?? undefined,
    repairCost:
      row.repair_cost == null
        ? undefined
        : Number(row.repair_cost),
    repairResult:
      row.repair_result ?? undefined,
    partsReplaced:
      row.parts_replaced ?? undefined,
  };
}

export function mapNotification(
  row: DatabaseNotificationRow,
): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    message: row.message,
    read: row.is_read,
    createdAt: row.created_at,
  };
}

export function mapActivityLog(
  row: DatabaseActivityLogRow,
): ActivityLog {
  return {
    id: row.id,
    userId: row.user_id ?? '',
    action: row.action,
    entity: row.entity ?? '',
    entityId: row.entity_id ?? '',
    description: row.description ?? '',
    createdAt: row.created_at,
  };
}