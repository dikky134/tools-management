export type DatabaseUserRow = {
  id: string;
  full_name: string;
  employee_id: string;
  email: string;
  phone: string | null;
  department: string | null;
  role: 'ADMIN' | 'EMPLOYEE' | 'MECHANIC';
  status: 'ACTIVE' | 'INACTIVE';
  mechanic_status: 'AVAILABLE' | 'BUSY' | 'OFF_DUTY' | null;
  created_at: string;
  updated_at: string;
};

export type DatabaseCategoryRow = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string;
};

export type DatabaseToolRow = {
  id: string;
  code: string;
  name: string;
  category_id: string | null;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  description: string | null;
  purchase_date: string | null;
  purchase_price: number | string | null;
  location: string | null;
  condition: 'GOOD' | 'MINOR_DAMAGE' | 'DAMAGED';
  status:
    | 'AVAILABLE'
    | 'BORROWED'
    | 'DAMAGED'
    | 'MAINTENANCE'
    | 'INACTIVE';
  created_at: string;
  updated_at: string;
};

export type DatabaseBorrowingRow = {
  id: string;
  tool_id: string;
  borrower_id: string;
  purpose: string;
  borrowed_at: string;
  expected_return: string;
  returned_at: string | null;
  return_condition:
    | 'GOOD'
    | 'MINOR_DAMAGE'
    | 'DAMAGED'
    | null;
  return_notes: string | null;
  status:
    | 'ACTIVE'
    | 'RETURNED'
    | 'OVERDUE'
    | 'CANCELLED';
  created_at: string;
};

export type DatabaseDamageReportRow = {
  id: string;
  tool_id: string;
  reported_by: string;
  damage_type: string | null;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  photo_url: string | null;
  reported_at: string;
};

export type DatabaseMaintenanceRow = {
  id: string;
  tool_id: string;
  reported_by: string | null;
  assigned_mechanic: string | null;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status:
    | 'PENDING'
    | 'ASSIGNED'
    | 'IN_PROGRESS'
    | 'WAITING_FOR_PARTS'
    | 'COMPLETED'
    | 'CANCELLED';
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  repair_notes: string | null;
  repair_cost: number | string | null;
  repair_result:
    | 'REPAIRED'
    | 'PARTIALLY_REPAIRED'
    | 'UNREPAIRABLE'
    | null;
  parts_replaced: string | null;
};

export type DatabaseNotificationRow = {
  id: string;
  user_id: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type DatabaseActivityLogRow = {
  id: string;
  user_id: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  description: string | null;
  created_at: string;
};