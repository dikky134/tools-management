# Factory Warehouse Tool Management System

## Project Overview

Build a modern, responsive web application for managing tools and equipment in a factory warehouse.

The application is designed to help warehouse administrators, employees, and maintenance mechanics manage tool availability, borrowing, returning, damaged tools, maintenance tasks, and mechanic workload.

The main objective is to make tool management faster and more transparent by using QR codes. Employees should be able to scan a QR code attached to a tool, immediately see its current status, borrow the tool, and return it later. If a tool is damaged, the system should automatically create a maintenance request that can be handled by an available mechanic.

The system must have role-based access control, a clean dashboard, real-time status updates, transaction history, notifications, and reporting.

---

# 1. User Roles

The system must support the following user roles:

## 1.1 Administrator / Warehouse Staff

Administrators are responsible for managing the entire warehouse system.

Permissions:

* View dashboard
* Manage users
* Manage tools
* Manage tool categories
* Generate and manage QR codes
* View all borrowing transactions
* Approve or manage borrowing transactions if approval is enabled
* Process tool returns
* View damaged tools
* Create and manage maintenance requests
* Assign mechanics to maintenance tasks
* View mechanic availability
* View maintenance history
* View tool history
* View reports
* View activity logs
* Manage system settings

---

## 1.2 Employee / Tool Borrower

Employees can borrow tools from the warehouse.

Permissions:

* View available tools
* Search tools
* Filter tools by category and status
* Scan QR codes
* View tool details
* Borrow tools
* Specify borrowing purpose
* Specify expected borrowing duration
* View currently borrowed tools
* Return borrowed tools
* Report damaged tools
* View borrowing history
* Receive notifications

---

## 1.3 Maintenance Mechanic

Mechanics are responsible for repairing damaged tools.

Permissions:

* View maintenance dashboard
* View damaged tools
* View assigned maintenance tasks
* Accept maintenance tasks
* Start maintenance work
* Update maintenance progress
* Add repair notes
* Add repair cost if required
* Mark maintenance as completed
* View maintenance history
* View current workload
* Set availability status

Mechanic statuses:

* AVAILABLE
* BUSY
* OFF_DUTY

---

# 2. Authentication

Implement secure authentication.

Features:

* Login
* Logout
* Forgot password
* Password reset
* User profile
* Change password
* Role-based authorization
* Protected routes
* Session persistence

After login, redirect users to the appropriate dashboard based on their role.

Example:

```text
Administrator → Admin Dashboard
Employee → Employee Dashboard
Mechanic → Mechanic Dashboard
```

Passwords must never be stored as plain text.

---

# 3. Main Dashboard

Create different dashboards based on the user's role.

## 3.1 Administrator Dashboard

Display:

* Total number of tools
* Available tools
* Borrowed tools
* Damaged tools
* Tools currently under maintenance
* Total employees
* Total mechanics
* Available mechanics
* Busy mechanics
* Active borrowing transactions
* Overdue borrowing transactions
* Pending maintenance requests

Include charts for:

* Tool usage
* Borrowing statistics
* Most frequently borrowed tools
* Most frequently damaged tools
* Maintenance statistics
* Monthly borrowing trends

Include recent activity:

```text
Recent Activities

Budi borrowed Electric Drill
Andi returned Angle Grinder
Candra started maintenance on Welding Machine
Dedi completed maintenance on Multimeter
```

---

# 4. Tool Management

Administrators must be able to manage all tools.

Each tool should contain:

```text
Tool ID
Tool Code
Tool Name
Category
Brand
Model
Serial Number
Description
Purchase Date
Purchase Price
Location
Condition
Status
QR Code
Created At
Updated At
```

Tool status:

```text
AVAILABLE
BORROWED
DAMAGED
MAINTENANCE
INACTIVE
```

Tool condition:

```text
GOOD
MINOR_DAMAGE
DAMAGED
```

---

# 5. Tool Categories

Create a category management system.

Examples:

* Hand Tools
* Power Tools
* Measuring Tools
* Welding Equipment
* Electrical Tools
* Safety Equipment
* Workshop Equipment
* Other

Administrators can:

* Add category
* Edit category
* Delete category
* View number of tools in each category

---

# 6. QR Code System

Every tool must have a unique QR code.

The QR code should contain a unique tool identifier or tool URL.

Example:

```text
ALT-001
```

or:

```text
https://your-app.com/tools/ALT-001
```

Administrators can:

* Generate QR code
* Regenerate QR code
* Download QR code
* Print QR code
* View QR code
* Print multiple QR codes

The QR code should be attached to the physical tool.

---

# 7. QR Code Scanning

Employees should be able to scan a tool's QR code using their smartphone camera.

After scanning:

```text
Scan QR
   ↓
Identify Tool
   ↓
Load Tool Details
   ↓
Display Current Status
```

The application should immediately show:

```text
Tool Name
Tool Code
Category
Condition
Current Status
Current Borrower
Borrowing Time
Expected Return Time
```

If the tool is available:

```text
Status: AVAILABLE

[ BORROW TOOL ]
```

If the tool is currently borrowed:

```text
Status: BORROWED

Borrowed By: Budi Santoso
Borrowed At: 08:30
Expected Return: 16:30
Purpose: Machine maintenance
```

The employee must not be able to borrow a tool that is already borrowed, damaged, or under maintenance.

---

# 8. Borrowing System

Employees can borrow an available tool.

The borrowing form must contain:

```text
Tool
Borrower
Purpose
Borrowing Date
Borrowing Time
Expected Return Date
Expected Return Time
Notes
```

The system should automatically record:

```text
Created At
Borrower ID
Tool ID
```

When the borrowing transaction is confirmed:

```text
Tool Status:
AVAILABLE → BORROWED
```

Create a borrowing record.

Display a confirmation message:

```text
Tool successfully borrowed.

Tool:
Electric Drill

Expected Return:
August 26, 2026 at 16:30
```

---

# 9. Borrowing Duration

Allow employees to specify how long they intend to use the tool.

Examples:

```text
30 minutes
1 hour
2 hours
4 hours
1 day
Custom duration
```

The system should automatically calculate:

```text
Borrowed At
+
Borrowing Duration
=
Expected Return Time
```

The system should detect overdue tools.

Example:

```text
OVERDUE

Expected return:
14:00

Current time:
15:30

Overdue by:
1 hour 30 minutes
```

---

# 10. Tool Return

Employees can return tools from their active borrowing list or by scanning the QR code.

Return form:

```text
Tool
Borrower
Return Time
Tool Condition
Return Notes
```

Condition options:

```text
Good
Minor Damage
Damaged
```

If the tool is returned in good condition:

```text
BORROWED → AVAILABLE
```

If the tool is returned damaged:

```text
BORROWED → DAMAGED
```

The system should automatically create a maintenance request when a tool is reported as damaged.

---

# 11. Damage Reporting

Employees should be able to report tool damage.

Damage report fields:

```text
Tool
Reporter
Damage Type
Damage Description
Photo Evidence
Priority
Date Reported
```

Damage priority:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Allow employees to upload photos of damaged tools.

---

# 12. Maintenance Management

When a tool is damaged, create a maintenance request.

Maintenance request fields:

```text
Maintenance ID
Tool ID
Reported By
Assigned Mechanic
Damage Description
Priority
Status
Created At
Started At
Completed At
Repair Notes
Repair Cost
```

Maintenance status:

```text
PENDING
ASSIGNED
IN_PROGRESS
WAITING_FOR_PARTS
COMPLETED
CANCELLED
```

---

# 13. Mechanic Dashboard

Create a dedicated dashboard for mechanics.

Display:

```text
My Maintenance Tasks
Pending Tasks
In Progress
Completed
```

Example:

```text
Maintenance Tasks

ALT-003
Electric Drill

Problem:
Motor does not start

Priority:
HIGH

Status:
IN_PROGRESS

Assigned Mechanic:
Candra
```

Mechanics should be able to:

* Accept a task
* Start repair
* Update progress
* Add notes
* Upload repair photos
* Mark waiting for parts
* Complete repair

---

# 14. Mechanic Availability

Each mechanic must have a workload status.

Statuses:

```text
AVAILABLE
BUSY
OFF_DUTY
```

When a mechanic starts a maintenance task:

```text
AVAILABLE → BUSY
```

When the mechanic has no active maintenance task:

```text
BUSY → AVAILABLE
```

Mechanics can manually set themselves as:

```text
OFF_DUTY
```

The administrator should be able to see all mechanic statuses.

Example:

```text
Mechanic Availability

Candra
🟢 AVAILABLE

Budi
🔴 BUSY
Current Task: ALT-003

Andi
⚫ OFF_DUTY
```

---

# 15. Automatic Mechanic Assignment

Implement an optional automatic mechanic assignment feature.

When a maintenance request is created:

1. Find mechanics with AVAILABLE status.
2. Check their current workload.
3. Select the mechanic with the lowest workload.
4. Assign the maintenance request.
5. Change mechanic status to BUSY.
6. Notify the mechanic.

Administrators must also be able to manually reassign a task.

---

# 16. Maintenance Completion

When a mechanic completes a repair, require:

```text
Repair Result
Repair Notes
Parts Replaced
Repair Cost
Completion Date
Before Photo
After Photo
```

Repair result:

```text
REPAIRED
PARTIALLY_REPAIRED
UNREPAIRABLE
```

If successfully repaired:

```text
MAINTENANCE → AVAILABLE
```

If the tool cannot be repaired:

```text
MAINTENANCE → INACTIVE
```

After completion, automatically update the mechanic workload.

---

# 17. Tool History

Every tool must have a complete history.

Tool history should include:

```text
Borrowing History
Return History
Damage Reports
Maintenance History
Status Changes
```

Example:

```text
ALT-001 — Electric Drill

August 26
Borrowed by Budi

August 26
Returned by Budi

August 25
Maintenance completed by Candra

August 24
Damage reported by Andi
```

This history must be immutable from the normal user interface.

---

# 18. Notifications

Implement a notification system.

Notifications should be generated for:

### Employee

* Tool successfully borrowed
* Borrowing is about to expire
* Borrowing is overdue
* Tool return successful
* Damage report submitted

### Mechanic

* New maintenance task assigned
* Maintenance priority changed
* Maintenance task reassigned
* Maintenance reminder

### Administrator

* New damaged tool
* Overdue tool
* Maintenance completed
* Critical maintenance request

Notification types:

```text
INFO
SUCCESS
WARNING
ERROR
```

---

# 19. Search and Filtering

Implement global search.

Users should be able to search by:

```text
Tool Name
Tool Code
Category
Serial Number
Borrower
Mechanic
Maintenance ID
```

Add filters:

```text
Status
Category
Date
Condition
Priority
Maintenance Status
Borrower
Mechanic
```

---

# 20. Borrowing History

Create a complete borrowing history page.

Columns:

```text
Tool
Tool Code
Borrower
Purpose
Borrowed At
Expected Return
Actual Return
Duration
Status
```

Statuses:

```text
ACTIVE
RETURNED
OVERDUE
CANCELLED
```

Allow administrators to filter and export borrowing records.

---

# 21. Maintenance History

Display:

```text
Tool
Maintenance ID
Damage
Mechanic
Priority
Started At
Completed At
Repair Result
Repair Cost
Status
```

Allow filtering by:

* Mechanic
* Tool
* Date
* Priority
* Status

---

# 22. Reports

Create a reporting module.

Reports should include:

### Tool Usage Report

* Most borrowed tools
* Least borrowed tools
* Tool utilization rate

### Borrowing Report

* Total borrowings
* Active borrowings
* Returned borrowings
* Overdue borrowings

### Damage Report

* Total damaged tools
* Most frequently damaged tools
* Damage frequency by category

### Maintenance Report

* Total maintenance tasks
* Completed tasks
* Pending tasks
* Average repair duration
* Maintenance cost

### Mechanic Performance

* Number of assigned tasks
* Completed tasks
* Average repair duration
* Current workload

Allow export to:

```text
CSV
Excel
PDF
```

---

# 23. Admin User Management

Administrators can manage users.

User fields:

```text
Full Name
Employee ID
Email
Phone Number
Department
Role
Status
Created At
```

User statuses:

```text
ACTIVE
INACTIVE
```

Admin actions:

* Create user
* Edit user
* Deactivate user
* Reset password
* Change role
* View user activity

---

# 24. Activity Log

Create an audit log system.

Record important actions such as:

```text
User logged in
User created
Tool created
Tool updated
Tool borrowed
Tool returned
Damage reported
Maintenance created
Mechanic assigned
Maintenance started
Maintenance completed
User deactivated
```

Each log should contain:

```text
User
Action
Entity
Entity ID
Description
Timestamp
```

Administrators can view activity logs.

---

# 25. Real-Time Updates

Use real-time database subscriptions where appropriate.

When the status of a tool changes, the interface should update automatically.

Example:

Employee A sees:

```text
Electric Drill
AVAILABLE
```

Employee B borrows it.

Employee A's interface should automatically update to:

```text
BORROWED
Borrowed by Employee B
```

The same concept should apply to:

* Maintenance status
* Mechanic availability
* Notifications
* Borrowing status

---

# 26. UI/UX Requirements

Create a modern industrial-style interface.

The design should be:

* Clean
* Professional
* Minimal
* Responsive
* Mobile-friendly
* Easy to understand
* Suitable for factory environments

Use clear status indicators.

Example:

```text
AVAILABLE       → Green
BORROWED        → Blue
DAMAGED         → Red
MAINTENANCE     → Orange
OVERDUE         → Red
COMPLETED       → Green
BUSY            → Orange
OFF_DUTY        → Gray
```

Use cards, tables, badges, charts, modals, dropdowns, and confirmation dialogs appropriately.

---

# 27. Mobile Experience

The application must be optimized for smartphones because employees will frequently use their phones to scan QR codes.

Mobile interface must include:

* Large buttons
* Easy QR scanner access
* Responsive forms
* Touch-friendly controls
* Bottom navigation if appropriate
* Fast tool status lookup

The primary mobile flow should be:

```text
Login
 ↓
Dashboard
 ↓
Scan QR
 ↓
Tool Details
 ↓
Borrow Tool
 ↓
Confirmation
```

---

# 28. QR Scanner UX

Create a prominent:

```text
[ SCAN QR CODE ]
```

button on the employee dashboard.

When clicked:

```text
Open Camera
 ↓
Scan QR
 ↓
Detect Tool
 ↓
Show Tool Information
```

Handle errors:

```text
Invalid QR Code
Tool Not Found
Camera Permission Denied
Tool Inactive
```

Provide clear user feedback.

---

# 29. Database Design

Use a relational database.

Recommended tables:

```text
users
roles
tools
tool_categories
borrowings
damage_reports
maintenance_requests
maintenance_logs
notifications
activity_logs
```

Recommended relationships:

```text
users
  │
  ├── borrowings
  │
  ├── damage_reports
  │
  ├── maintenance_requests
  │
  └── activity_logs

tools
  │
  ├── borrowings
  ├── damage_reports
  ├── maintenance_requests
  └── maintenance_logs

maintenance_requests
  │
  └── assigned mechanic → users
```

Use foreign keys and appropriate indexes.

Do not duplicate data unnecessarily.

---

# 30. Data Integrity Rules

Implement strict business rules.

### Tool borrowing

A tool cannot be borrowed if:

```text
status != AVAILABLE
```

### Tool return

Only the current borrower or authorized administrator can return the tool.

### Maintenance

A tool cannot be borrowed while:

```text
status = DAMAGED
```

or:

```text
status = MAINTENANCE
```

### Mechanic

A mechanic marked as:

```text
OFF_DUTY
```

must not receive new maintenance tasks.

### Maintenance completion

A maintenance task cannot be completed without a repair result.

---

# 31. Security

Implement:

* Role-based access control
* Authentication
* Authorization
* Protected routes
* Database-level access policies
* Input validation
* File upload validation
* Secure password handling
* Prevention of unauthorized status changes
* Audit logging

Employees must not be able to modify tool status directly.

Tool status should only change through valid business transactions.

---

# 32. Error Handling

Create user-friendly error states.

Examples:

```text
Tool not found.

This tool may have been removed or the QR code is invalid.
```

```text
Tool unavailable.

This tool is currently being used by another employee.
```

```text
Maintenance assignment failed.

There are currently no available mechanics.
```

```text
Unable to return tool.

Please contact the warehouse administrator.
```

Avoid displaying raw database or server errors to users.

---

# 33. Loading States

Implement proper loading states.

Use:

* Skeleton loaders
* Loading spinners
* Disabled submit buttons
* Progress indicators

Prevent duplicate submissions.

For example, when a user clicks:

```text
BORROW TOOL
```

disable the button until the transaction is completed.

---

# 34. Confirmation Dialogs

Use confirmation dialogs for destructive or important actions.

Examples:

```text
Are you sure you want to return this tool?
```

```text
Are you sure you want to assign this maintenance task to Candra?
```

```text
Are you sure you want to deactivate this user?
```

---

# 35. Recommended Pages

Create the following pages:

```text
/login

/dashboard

/tools
/tools/:id
/tools/:id/history
/tools/create
/tools/:id/edit

/scan

/borrowings
/borrowings/:id

/my-tools
/my-history

/maintenance
/maintenance/:id

/mechanics
/mechanics/:id

/users
/users/:id

/categories

/reports

/notifications

/activity-logs

/profile

/settings
```

---

# 36. Navigation

Administrator navigation:

```text
Dashboard
Tools
Categories
Borrowings
Maintenance
Mechanics
Users
Reports
Activity Logs
Notifications
Settings
```

Employee navigation:

```text
Dashboard
Scan QR
My Borrowed Tools
History
Notifications
Profile
```

Mechanic navigation:

```text
Dashboard
My Tasks
Maintenance
History
Notifications
Profile
```

---

# 37. Dashboard Quick Actions

Employee dashboard:

```text
[ SCAN TOOL ]
[ MY BORROWED TOOLS ]
[ BORROWING HISTORY ]
```

Mechanic dashboard:

```text
[ MAINTENANCE TASKS ]
[ DAMAGED TOOLS ]
[ UPDATE AVAILABILITY ]
```

Admin dashboard:

```text
[ ADD TOOL ]
[ SCAN TOOL ]
[ MAINTENANCE ]
[ BORROWINGS ]
[ REPORTS ]
```

---

# 38. Empty States

Create useful empty states.

Examples:

```text
No borrowed tools

You currently have no active borrowing transactions.
```

```text
No maintenance tasks

You don't have any assigned maintenance tasks.
```

```text
No damaged tools

Great! There are currently no damaged tools.
```

---

# 39. Responsive Design

The application must work properly on:

```text
Mobile phones
Tablets
Laptops
Desktop monitors
```

Tables should become horizontally scrollable or transform into cards on mobile.

The QR scanning interface must prioritize mobile usability.

---

# 40. Technology Stack

Use the following stack unless there is a strong technical reason to choose an alternative:

### Frontend

```text
Next.js
React
TypeScript
Tailwind CSS
```

### Backend

```text
Supabase
PostgreSQL
Supabase Auth
Supabase Storage
Supabase Realtime
```

### QR Code

Use a reliable browser-based QR scanner library that supports mobile camera scanning.

### Charts

Use a modern React charting library.

### Forms

Use:

```text
React Hook Form
Zod
```

for form management and validation.

---

# 41. Component Architecture

Create reusable components such as:

```text
DashboardCard
StatusBadge
ToolCard
ToolTable
ToolStatus
QRScanner
QRGenerator
BorrowToolModal
ReturnToolModal
DamageReportModal
MaintenanceCard
MaintenanceTable
MechanicStatus
NotificationItem
ConfirmDialog
SearchInput
FilterPanel
Pagination
LoadingState
EmptyState
```

Avoid duplicating UI logic.

---

# 42. Code Quality

Follow these principles:

* TypeScript strict mode
* Reusable components
* Clean architecture
* Separation of concerns
* Proper error handling
* Meaningful variable names
* Avoid unnecessary duplication
* Use server-side validation
* Use database constraints
* Use environment variables for secrets
* Never expose private keys
* Write maintainable code

---

# 43. Seed Data

Create realistic demo data.

Example tools:

```text
ALT-001 — Electric Drill
ALT-002 — Angle Grinder
ALT-003 — Welding Machine
ALT-004 — Digital Multimeter
ALT-005 — Impact Wrench
ALT-006 — Screwdriver Set
ALT-007 — Hydraulic Jack
ALT-008 — Cutting Machine
```

Example users:

```text
Admin User
Warehouse Staff
Budi Santoso
Andi Pratama
Candra Wijaya
Dedi Setiawan
```

Create sample:

* Borrowing records
* Maintenance records
* Damaged tools
* Notifications
* Activity logs

---

# 44. Important Business Flow

Implement the following complete flow:

## Normal Borrowing

```text
Employee
 ↓
Scan QR
 ↓
Tool Available
 ↓
Enter Purpose
 ↓
Enter Borrowing Duration
 ↓
Confirm
 ↓
Create Borrowing Record
 ↓
Tool = BORROWED
 ↓
Notification
```

## Normal Return

```text
Employee
 ↓
Scan QR
 ↓
Return Tool
 ↓
Select Condition = GOOD
 ↓
Confirm
 ↓
Borrowing = RETURNED
 ↓
Tool = AVAILABLE
```

## Damaged Return

```text
Employee
 ↓
Scan QR
 ↓
Return Tool
 ↓
Condition = DAMAGED
 ↓
Enter Damage Description
 ↓
Upload Photo
 ↓
Create Damage Report
 ↓
Create Maintenance Request
 ↓
Tool = DAMAGED
 ↓
Notify Admin
 ↓
Assign Mechanic
```

## Maintenance

```text
Mechanic
 ↓
Receive Maintenance Task
 ↓
Accept Task
 ↓
Mechanic = BUSY
 ↓
Tool = MAINTENANCE
 ↓
Start Repair
 ↓
Update Progress
 ↓
Complete Repair
 ↓
Enter Repair Result
 ↓
Tool Repaired?
 ├── YES → Tool = AVAILABLE
 └── NO → Tool = INACTIVE
 ↓
Mechanic Workload Updated
 ↓
Mechanic = AVAILABLE if no other active tasks
```

---

# 45. Important UX Principle

The system should always make the current state of a tool obvious.

For example:

```text
┌──────────────────────────────┐
│      ELECTRIC DRILL          │
│          ALT-001             │
│                              │
│       🟢 AVAILABLE           │
│                              │
│ Category: Power Tools        │
│ Condition: Good              │
│ Location: Warehouse A        │
│                              │
│       [ BORROW TOOL ]        │
└──────────────────────────────┘
```

If borrowed:

```text
┌──────────────────────────────┐
│      ELECTRIC DRILL          │
│          ALT-001             │
│                              │
│       🔵 BORROWED            │
│                              │
│ Borrowed by: Budi Santoso    │
│ Since: 08:30                 │
│ Expected: 16:30              │
│                              │
│       [ VIEW DETAILS ]       │
└──────────────────────────────┘
```

If under maintenance:

```text
┌──────────────────────────────┐
│      ELECTRIC DRILL          │
│          ALT-001             │
│                              │
│      🟠 MAINTENANCE          │
│                              │
│ Mechanic: Candra Wijaya      │
│ Problem: Motor failure       │
│ Priority: HIGH               │
│                              │
│       [ VIEW STATUS ]        │
└──────────────────────────────┘
```

---

# 46. Final Development Requirements

Build the application as a complete production-ready system, not just a UI prototype.

The implementation must include:

* Functional authentication
* Functional role-based authorization
* Functional database
* Functional CRUD
* Functional QR generation
* Functional QR scanning
* Functional borrowing workflow
* Functional return workflow
* Functional damage reporting
* Functional maintenance workflow
* Functional mechanic assignment
* Functional mechanic availability
* Functional notifications
* Functional activity logs
* Functional search
* Functional filtering
* Functional reporting
* Responsive UI
* Error handling
* Loading states
* Form validation
* Security policies
* Real-time status updates

Do not create fake buttons or placeholder functionality.

Every important button should perform a real action.

Prioritize correctness of the business logic and database relationships over visual complexity.

The final result should feel like a real internal factory warehouse management system that can be used by warehouse staff, employees, and maintenance mechanics on a daily basis.
