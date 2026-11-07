# Apartment Maintenance Request Management System

A colorful, attractive, and fully interactive web application designed to manage apartment maintenance complaints, repair requests, staff assignments, and repair costs.

---

## 🌟 Key Features

1. **Vibrant & Modern UI**:
   - High-definition architectural and maintenance imagery (plumbing, electrical, cleaning, carpentry).
   - Dynamic gradient headers, glassmorphic cards, glowing badges, and micro-animations.
   - Fully responsive for desktop, tablet, and mobile browsers.

2. **Full Lifecycle Maintenance Workflow**:
   - **Residents Portal**: Submit maintenance requests for **Plumbing**, **Electrical**, **Cleaning**, and **Other** issues.
   - **Staff Management**: Assign certified technicians (`staff_id`) to pending complaints.
   - **Status Tracking**: Transition requests through `Pending` ➔ `Assigned` ➔ `In Progress` ➔ `Completed`.
   - **Expense & Repair Cost Logging**: Record completion date, repair cost in USD, and work remarks for resolved jobs.

3. **Live Interactive Dashboard**:
   - Real-time stat cards calculating Total Requests, Active/Pending issues, Resolved jobs, and Grand Total Repair Expenditure.
   - LocalStorage persistence: Any newly added residents, staff members, submitted requests, or recorded repair costs are preserved across browser refreshes.
   - Quick one-click "Reset Default Sample Data" button to restore fresh demonstration data anytime.

4. **Interactive Database Schema Explorer**:
   - Visual architectural cards for all 4 tables with PK and FK badges.
   - Ready-to-copy SQL DDL script compatible with MySQL, PostgreSQL, and SQLite.

---

## 🗄️ Relational Database Schema (4 Tables)

### **Table 1: Residents (`residents`)**
| Column | Type | Constraints | Description |
|---|---|---|---|
| `resident_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for each resident |
| `name` | VARCHAR(100) | NOT NULL | Full name of resident |
| `flat_no` | VARCHAR(20) | NOT NULL | Apartment flat number (e.g. A-101) |
| `phone` | VARCHAR(15) | NOT NULL | Contact phone number |
| `email` | VARCHAR(100) | NOT NULL, UNIQUE | Resident email address |

### **Table 2: Maintenance Staff (`maintenance_staff`)**
| Column | Type | Constraints | Description |
|---|---|---|---|
| `staff_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for staff member |
| `name` | VARCHAR(100) | NOT NULL | Staff member technician name |
| `email` | VARCHAR(100) | NOT NULL, UNIQUE | Official staff email address |

### **Table 3: Requests (`requests`)**
| Column | Type | Constraints | Description |
|---|---|---|---|
| `request_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for maintenance complaint |
| `resident_id` | INT | FOREIGN KEY (`residents.resident_id`) | Resident who submitted request |
| `staff_id` | INT | FOREIGN KEY (`maintenance_staff.staff_id`) | Assigned technician (can be NULL if unassigned) |
| `issue_type` | VARCHAR(50) | NOT NULL | Category: Plumbing, Electrical, Cleaning, Other |
| `request_date`| DATETIME | DEFAULT CURRENT_TIMESTAMP | Date and time when complaint was lodged |
| `status` | VARCHAR(30) | DEFAULT 'Pending' | Pending, Assigned, In Progress, Completed |
| `description` | TEXT | | Detailed complaint description |

### **Table 4: Maintenance Record (`maintenance_record`)**
| Column | Type | Constraints | Description |
|---|---|---|---|
| `record_id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique record ID |
| `request_id` | INT | FOREIGN KEY (`requests.request_id`), UNIQUE | Associated completed request |
| `completion_date`| DATETIME | NOT NULL | Date & time when repair was completed |
| `repair_cost` | DECIMAL(10,2)| NOT NULL, DEFAULT 0.00 | Cost incurred for parts & labor |
| `remarks` | TEXT | | Notes, parts replaced, technician sign-off |

---

## 🚀 How to Open and Run

1. Open `index.html` directly in any web browser (Google Chrome, Microsoft Edge, Firefox, Safari).
2. No local web server or build steps needed (uses CDN libraries for Tailwind CSS and FontAwesome).
3. To inspect or import the SQL database script, open `schema.sql` in MySQL Workbench, phpMyAdmin, DBeaver, or VS Code.

