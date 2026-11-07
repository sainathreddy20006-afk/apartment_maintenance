-- =========================================================================
-- DATABASE: Apartment Maintenance Request Management System
-- Description: Manage apartment maintenance complaints and repair requests.
--              Residents can submit maintenance requests for plumbing,
--              electrical, cleaning, and other issues. Maintenance staff can
--              assign technicians, update request status, and record repair costs.
-- =========================================================================

CREATE DATABASE IF NOT EXISTS apartment_maintenance_db;
USE apartment_maintenance_db;

-- -------------------------------------------------------------------------
-- TABLE 1: RESIDENTS
-- Stores apartment resident profile and contact details
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS residents (
    resident_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    flat_no VARCHAR(20) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

-- -------------------------------------------------------------------------
-- TABLE 2: MAINTENANCE STAFF
-- Stores maintenance staff technicians and coordinators
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS maintenance_staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

-- -------------------------------------------------------------------------
-- TABLE 3: REQUESTS
-- Maintenance requests logged by residents and assigned to technicians
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT NOT NULL,
    staff_id INT DEFAULT NULL,
    issue_type VARCHAR(50) NOT NULL, -- 'Plumbing', 'Electrical', 'Cleaning', 'Other'
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) DEFAULT 'Pending', -- 'Pending', 'Assigned', 'In Progress', 'Completed'
    description TEXT,
    CONSTRAINT fk_requests_resident 
        FOREIGN KEY (resident_id) REFERENCES residents(resident_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_requests_staff 
        FOREIGN KEY (staff_id) REFERENCES maintenance_staff(staff_id) 
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- -------------------------------------------------------------------------
-- TABLE 4: MAINTENANCE RECORD
-- Completion log, billed repair costs, and technician remarks
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS maintenance_record (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL UNIQUE,
    completion_date DATETIME NOT NULL,
    repair_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    remarks TEXT,
    CONSTRAINT fk_records_request 
        FOREIGN KEY (request_id) REFERENCES requests(request_id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================================================================
-- SAMPLE SEED DATA
-- =========================================================================

-- Insert Table 1: Residents
INSERT INTO residents (resident_id, name, flat_no, phone, email) VALUES
(1, 'Alexander Wright', 'A-101', '+1 555-0101', 'alex.wright@gmail.com'),
(2, 'Sophia Martinez', 'A-204', '+1 555-0142', 'sophia.m@outlook.com'),
(3, 'David Kim', 'B-305', '+1 555-0198', 'david.kim99@yahoo.com'),
(4, 'Emily Watson', 'B-412', '+1 555-0233', 'emily.watson@skyline.io'),
(5, 'Michael Chang', 'C-102', '+1 555-0377', 'michael.c@gmail.com'),
(6, 'Rachel Green', 'C-501', '+1 555-0455', 'rachel.g@fashionnet.com');

-- Insert Table 2: Maintenance Staff
INSERT INTO maintenance_staff (staff_id, name, email) VALUES
(1, 'Carlos Gomez', 'carlos.plumbing@skylinemaint.com'),
(2, 'Vikram Patel', 'vikram.electric@skylinemaint.com'),
(3, 'Maria Santos', 'maria.hygiene@skylinemaint.com'),
(4, 'James Thornton', 'james.carpentry@skylinemaint.com');

-- Insert Table 3: Requests
INSERT INTO requests (request_id, resident_id, staff_id, issue_type, request_date, status, description) VALUES
(101, 1, 1, 'Plumbing', '2026-11-01 09:30:00', 'Completed', 'Kitchen main sink drain backed up and leaking under valve.'),
(102, 2, 2, 'Electrical', '2026-11-03 14:15:00', 'Completed', 'Living room MCB breaker trips when air conditioner starts.'),
(103, 3, 3, 'Cleaning', '2026-11-05 11:00:00', 'In Progress', 'Deep chemical sanitization needed for floor corridor and odor treatment.'),
(104, 4, 4, 'Other', '2026-11-06 16:45:00', 'Assigned', 'Balcony sliding glass door latch jammed and hinges loose.'),
(105, 5, 1, 'Plumbing', '2026-11-07 08:15:00', 'Pending', 'Bathroom shower mixer broken with high pressure leak.');

-- Insert Table 4: Maintenance Record
INSERT INTO maintenance_record (record_id, request_id, completion_date, repair_cost, remarks) VALUES
(1, 101, '2026-11-01 13:45:00', 145.50, 'Replaced PVC P-trap pipe assembly and silicone seals. Tested leak-free.'),
(2, 102, '2026-11-03 17:30:00', 210.00, 'Installed 32A high-surge Siemens miniature circuit breaker.');

-- =========================================================================
-- USEFUL QUERIES & REPORTS
-- =========================================================================

-- 1. Complete Work Order Report with Resident, Staff, and Cost
SELECT 
    r.request_id,
    res.name AS resident_name,
    res.flat_no,
    r.issue_type,
    r.request_date,
    r.status,
    ms.name AS assigned_technician,
    mr.completion_date,
    mr.repair_cost,
    mr.remarks
FROM requests r
JOIN residents res ON r.resident_id = res.resident_id
LEFT JOIN maintenance_staff ms ON r.staff_id = ms.staff_id
LEFT JOIN maintenance_record mr ON r.request_id = mr.request_id
ORDER BY r.request_id DESC;

-- 2. Total Repair Cost Summary Per Issue Category
SELECT 
    r.issue_type,
    COUNT(mr.request_id) AS total_jobs_completed,
    COALESCE(SUM(mr.repair_cost), 0.00) AS total_expense,
    COALESCE(AVG(mr.repair_cost), 0.00) AS average_expense
FROM requests r
LEFT JOIN maintenance_record mr ON r.request_id = mr.request_id
GROUP BY r.issue_type;

