import type { User, Tool, ToolCategory, Borrowing, MaintenanceRequest, DamageReport, Notification, ActivityLog } from './types';

export const categories: ToolCategory[] = [
  { id: 'cat-1', name: 'Power Tools', description: 'Electric and battery-powered tools', color: '#f59e0b' },
  { id: 'cat-2', name: 'Hand Tools', description: 'Manual hand tools', color: '#60a5fa' },
  { id: 'cat-3', name: 'Measuring Tools', description: 'Precision measuring instruments', color: '#4ade80' },
  { id: 'cat-4', name: 'Welding Equipment', description: 'Welding and cutting tools', color: '#fb923c' },
  { id: 'cat-5', name: 'Electrical Tools', description: 'Electrical testing and installation', color: '#a78bfa' },
  { id: 'cat-6', name: 'Safety Equipment', description: 'Personal protective equipment', color: '#f87171' },
  { id: 'cat-7', name: 'Workshop Equipment', description: 'Heavy workshop machinery', color: '#94a3b8' },
  { id: 'cat-8', name: 'Other', description: 'Miscellaneous tools', color: '#71717a' },
];

export const users: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Ahmad Fauzi',
    employeeId: 'EMP-001',
    email: 'ahmad.fauzi@factory.com',
    phone: '+62-812-0001-0001',
    department: 'Warehouse Management',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'usr-emp-1',
    name: 'Budi Santoso',
    employeeId: 'EMP-002',
    email: 'budi.santoso@factory.com',
    phone: '+62-812-0002-0001',
    department: 'Production Line A',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    createdAt: '2024-02-01T08:00:00Z',
  },
  {
    id: 'usr-emp-2',
    name: 'Andi Pratama',
    employeeId: 'EMP-003',
    email: 'andi.pratama@factory.com',
    phone: '+62-812-0003-0001',
    department: 'Production Line B',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    createdAt: '2024-02-10T08:00:00Z',
  },
  {
    id: 'usr-emp-3',
    name: 'Dedi Setiawan',
    employeeId: 'EMP-004',
    email: 'dedi.setiawan@factory.com',
    phone: '+62-812-0004-0001',
    department: 'Assembly',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    createdAt: '2024-03-01T08:00:00Z',
  },
  {
    id: 'usr-mech-1',
    name: 'Candra Wijaya',
    employeeId: 'EMP-005',
    email: 'candra.wijaya@factory.com',
    phone: '+62-812-0005-0001',
    department: 'Maintenance',
    role: 'MECHANIC',
    status: 'ACTIVE',
    mechanicStatus: 'AVAILABLE',
    createdAt: '2024-01-20T08:00:00Z',
  },
  {
    id: 'usr-mech-2',
    name: 'Eko Prasetyo',
    employeeId: 'EMP-006',
    email: 'eko.prasetyo@factory.com',
    phone: '+62-812-0006-0001',
    department: 'Maintenance',
    role: 'MECHANIC',
    status: 'ACTIVE',
    mechanicStatus: 'BUSY',
    createdAt: '2024-01-25T08:00:00Z',
  },
];

const now = new Date();
const h = (hrs: number) => new Date(now.getTime() - hrs * 3600000).toISOString();
const hf = (hrs: number) => new Date(now.getTime() + hrs * 3600000).toISOString();

export const tools: Tool[] = [
  {
    id: 'tool-1', code: 'ALT-001', name: 'Electric Drill', categoryId: 'cat-1',
    brand: 'Bosch', model: 'GSB 18V-55', serialNumber: 'SN-DRILL-001',
    description: 'Cordless combi drill with 18V battery pack',
    purchaseDate: '2023-06-15', purchasePrice: 1850000, location: 'Warehouse A - Shelf B3',
    condition: 'GOOD', status: 'BORROWED', createdAt: h(720), updatedAt: h(6),
  },
  {
    id: 'tool-2', code: 'ALT-002', name: 'Angle Grinder', categoryId: 'cat-1',
    brand: 'Makita', model: 'GA9020', serialNumber: 'SN-GRIND-002',
    description: '9-inch heavy duty angle grinder 2000W',
    purchaseDate: '2023-07-10', purchasePrice: 2100000, location: 'Warehouse A - Shelf B4',
    condition: 'GOOD', status: 'AVAILABLE', createdAt: h(700), updatedAt: h(24),
  },
  {
    id: 'tool-3', code: 'ALT-003', name: 'Welding Machine', categoryId: 'cat-4',
    brand: 'Lincoln Electric', model: 'POWER MIG 210', serialNumber: 'SN-WELD-003',
    description: 'MIG/Flux-Core welding machine 210A',
    purchaseDate: '2023-05-20', purchasePrice: 8500000, location: 'Welding Bay - Station 2',
    condition: 'DAMAGED', status: 'MAINTENANCE', createdAt: h(680), updatedAt: h(48),
  },
  {
    id: 'tool-4', code: 'ALT-004', name: 'Digital Multimeter', categoryId: 'cat-5',
    brand: 'Fluke', model: '87V', serialNumber: 'SN-MULT-004',
    description: 'True-RMS digital multimeter with temperature measurement',
    purchaseDate: '2023-08-05', purchasePrice: 3200000, location: 'Electrical Room - Cabinet 1',
    condition: 'GOOD', status: 'AVAILABLE', createdAt: h(650), updatedAt: h(12),
  },
  {
    id: 'tool-5', code: 'ALT-005', name: 'Impact Wrench', categoryId: 'cat-1',
    brand: 'Snap-on', model: 'PTGR500A', serialNumber: 'SN-WRENCH-005',
    description: 'Heavy duty pneumatic impact wrench 1/2 inch drive',
    purchaseDate: '2023-09-01', purchasePrice: 4500000, location: 'Warehouse B - Shelf A1',
    condition: 'GOOD', status: 'AVAILABLE', createdAt: h(600), updatedAt: h(8),
  },
  {
    id: 'tool-6', code: 'ALT-006', name: 'Screwdriver Set', categoryId: 'cat-2',
    brand: 'Stanley', model: 'FatMax 6PC', serialNumber: 'SN-SCREW-006',
    description: '6-piece professional screwdriver set with ergonomic handles',
    purchaseDate: '2023-10-15', purchasePrice: 450000, location: 'Warehouse A - Shelf A1',
    condition: 'GOOD', status: 'BORROWED', createdAt: h(550), updatedAt: h(3),
  },
  {
    id: 'tool-7', code: 'ALT-007', name: 'Hydraulic Jack', categoryId: 'cat-7',
    brand: 'Blackhawk', model: 'BH6006', serialNumber: 'SN-JACK-007',
    description: '6-ton low profile hydraulic floor jack',
    purchaseDate: '2023-04-20', purchasePrice: 5200000, location: 'Workshop Bay 1',
    condition: 'MINOR_DAMAGE', status: 'AVAILABLE', createdAt: h(800), updatedAt: h(72),
  },
  {
    id: 'tool-8', code: 'ALT-008', name: 'Cutting Machine', categoryId: 'cat-1',
    brand: 'Dewalt', model: 'DW872', serialNumber: 'SN-CUT-008',
    description: '14-inch multi-cutter saw for metal cutting',
    purchaseDate: '2023-11-01', purchasePrice: 3800000, location: 'Fabrication Area - Station A',
    condition: 'DAMAGED', status: 'DAMAGED', createdAt: h(400), updatedAt: h(36),
  },
];

export const borrowings: Borrowing[] = [
  {
    id: 'bor-1', toolId: 'tool-1', borrowerId: 'usr-emp-1', purpose: 'Machine maintenance on Line A',
    borrowedAt: h(6), expectedReturn: hf(2), status: 'ACTIVE',
  },
  {
    id: 'bor-2', toolId: 'tool-6', borrowerId: 'usr-emp-2', purpose: 'Panel assembly work',
    borrowedAt: h(3), expectedReturn: hf(5), status: 'ACTIVE',
  },
  {
    id: 'bor-3', toolId: 'tool-2', borrowerId: 'usr-emp-1', purpose: 'Metal fabrication',
    borrowedAt: h(48), expectedReturn: h(40), returnedAt: h(41), returnCondition: 'GOOD', status: 'RETURNED',
  },
  {
    id: 'bor-4', toolId: 'tool-5', borrowerId: 'usr-emp-3', purpose: 'Tire change - forklift FL-03',
    borrowedAt: h(24), expectedReturn: h(20), returnedAt: h(22), returnCondition: 'GOOD', status: 'RETURNED',
  },
  {
    id: 'bor-5', toolId: 'tool-4', borrowerId: 'usr-emp-2', purpose: 'Electrical panel diagnosis',
    borrowedAt: h(72), expectedReturn: h(64), returnedAt: h(65), returnCondition: 'GOOD', status: 'RETURNED',
  },
];

export const damageReports: DamageReport[] = [
  {
    id: 'dmg-1', toolId: 'tool-3', reportedBy: 'usr-emp-1',
    damageType: 'Mechanical failure', description: 'Motor does not start, wire insulation burnt near cable entry',
    priority: 'HIGH', reportedAt: h(48),
  },
  {
    id: 'dmg-2', toolId: 'tool-8', reportedBy: 'usr-emp-3',
    damageType: 'Blade damage', description: 'Cutting blade cracked, guard broken, makes unusual noise during operation',
    priority: 'CRITICAL', reportedAt: h(36),
  },
];

export const maintenanceRequests: MaintenanceRequest[] = [
  {
    id: 'mnt-1', toolId: 'tool-3', reportedBy: 'usr-emp-1', assignedMechanic: 'usr-mech-2',
    description: 'Motor does not start, burnt wire insulation near cable entry. Needs electrical diagnosis and motor inspection.',
    priority: 'HIGH', status: 'IN_PROGRESS',
    createdAt: h(48), startedAt: h(36),
    repairNotes: 'Replaced burnt wiring, motor capacitor needs replacement. Parts ordered.',
  },
  {
    id: 'mnt-2', toolId: 'tool-8', reportedBy: 'usr-emp-3',
    description: 'Blade cracked, blade guard broken. Requires blade replacement and guard repair.',
    priority: 'CRITICAL', status: 'PENDING', createdAt: h(36),
  },
  {
    id: 'mnt-3', toolId: 'tool-7', reportedBy: 'usr-admin-1', assignedMechanic: 'usr-mech-1',
    description: 'Hydraulic seal showing minor leak. Sealing kit replacement required.',
    priority: 'MEDIUM', status: 'COMPLETED',
    createdAt: h(168), startedAt: h(144), completedAt: h(120),
    repairNotes: 'Replaced hydraulic sealing kit. Tested under load, no further leaks detected.',
    repairCost: 350000, repairResult: 'REPAIRED', partsReplaced: 'Hydraulic seal kit x1',
  },
];

export const notifications: Notification[] = [
  {
    id: 'notif-1', userId: 'usr-emp-1', type: 'WARNING',
    title: 'Return Reminder', message: 'Electric Drill (ALT-001) is due for return in 2 hours.',
    read: false, createdAt: h(1),
  },
  {
    id: 'notif-2', userId: 'usr-mech-2', type: 'INFO',
    title: 'Task Assigned', message: 'You have been assigned to repair Welding Machine (ALT-003).',
    read: true, createdAt: h(36),
  },
  {
    id: 'notif-3', userId: 'usr-admin-1', type: 'ERROR',
    title: 'Critical Damage Report', message: 'Cutting Machine (ALT-008) reported with critical damage. Immediate attention required.',
    read: false, createdAt: h(36),
  },
  {
    id: 'notif-4', userId: 'usr-admin-1', type: 'WARNING',
    title: 'New Damage Report', message: 'Welding Machine (ALT-003) reported damaged by Budi Santoso.',
    read: true, createdAt: h(48),
  },
  {
    id: 'notif-5', userId: 'usr-emp-1', type: 'SUCCESS',
    title: 'Tool Borrowed', message: 'Electric Drill (ALT-001) successfully borrowed.',
    read: true, createdAt: h(6),
  },
  {
    id: 'notif-6', userId: 'usr-mech-1', type: 'SUCCESS',
    title: 'Maintenance Completed', message: 'Hydraulic Jack (ALT-007) repair has been marked as completed.',
    read: false, createdAt: h(120),
  },
];

export const activityLogs: ActivityLog[] = [
  { id: 'log-1', userId: 'usr-emp-1', action: 'BORROW_TOOL', entity: 'Tool', entityId: 'tool-1', description: 'Budi Santoso borrowed Electric Drill (ALT-001)', createdAt: h(6) },
  { id: 'log-2', userId: 'usr-emp-2', action: 'BORROW_TOOL', entity: 'Tool', entityId: 'tool-6', description: 'Andi Pratama borrowed Screwdriver Set (ALT-006)', createdAt: h(3) },
  { id: 'log-3', userId: 'usr-emp-3', action: 'REPORT_DAMAGE', entity: 'Tool', entityId: 'tool-8', description: 'Dedi Setiawan reported damage on Cutting Machine (ALT-008)', createdAt: h(36) },
  { id: 'log-4', userId: 'usr-mech-2', action: 'START_MAINTENANCE', entity: 'Maintenance', entityId: 'mnt-1', description: 'Eko Prasetyo started maintenance on Welding Machine (ALT-003)', createdAt: h(36) },
  { id: 'log-5', userId: 'usr-mech-1', action: 'COMPLETE_MAINTENANCE', entity: 'Maintenance', entityId: 'mnt-3', description: 'Candra Wijaya completed maintenance on Hydraulic Jack (ALT-007)', createdAt: h(120) },
  { id: 'log-6', userId: 'usr-emp-1', action: 'RETURN_TOOL', entity: 'Tool', entityId: 'tool-2', description: 'Budi Santoso returned Angle Grinder (ALT-002)', createdAt: h(41) },
  { id: 'log-7', userId: 'usr-admin-1', action: 'CREATE_TOOL', entity: 'Tool', entityId: 'tool-8', description: 'Ahmad Fauzi added Cutting Machine (ALT-008) to inventory', createdAt: h(400) },
  { id: 'log-8', userId: 'usr-admin-1', action: 'ASSIGN_MECHANIC', entity: 'Maintenance', entityId: 'mnt-1', description: 'Ahmad Fauzi assigned Eko Prasetyo to Welding Machine repair', createdAt: h(47) },
];
