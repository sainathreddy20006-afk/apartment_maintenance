const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MySQL Database Connection Pool
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Sai2603',
  database: process.env.DB_NAME || 'apartment_maintenance_db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
};

const pool = mysql.createPool(dbConfig);

// Health Check & MySQL Status Endpoint
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.json({
      status: 'online',
      message: 'Connected to MySQL Workbench successfully!',
      database: dbConfig.database,
      user: dbConfig.user,
      host: dbConfig.host,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect to MySQL database',
      error: error.message
    });
  }
});

// =========================================================================
// TABLE 1: RESIDENTS ENDPOINTS
// =========================================================================

// GET all residents
app.get('/api/residents', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM residents ORDER BY resident_id ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new resident
app.post('/api/residents', async (req, res) => {
  const { name, flat_no, phone, email } = req.body;
  if (!name || !flat_no || !phone || !email) {
    return res.status(400).json({ error: 'All fields (name, flat_no, phone, email) are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO residents (name, flat_no, phone, email) VALUES (?, ?, ?, ?)',
      [name, flat_no, phone, email]
    );
    res.status(201).json({
      message: 'Resident registered successfully in MySQL',
      resident_id: result.insertId,
      name, flat_no, phone, email
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =========================================================================
// TABLE 2: MAINTENANCE STAFF ENDPOINTS
// =========================================================================

// GET all staff members
app.get('/api/staff', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM maintenance_staff ORDER BY staff_id ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new staff member
app.post('/api/staff', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Both name and email are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO maintenance_staff (name, email) VALUES (?, ?)',
      [name, email]
    );
    res.status(201).json({
      message: 'Staff member added to MySQL successfully',
      staff_id: result.insertId,
      name, email
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =========================================================================
// TABLE 3: REQUESTS ENDPOINTS
// =========================================================================

// GET all requests (joined with resident and staff names)
app.get('/api/requests', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        r.request_id,
        r.resident_id,
        res.name AS resident_name,
        res.flat_no,
        res.phone AS resident_phone,
        res.email AS resident_email,
        r.staff_id,
        ms.name AS staff_name,
        ms.email AS staff_email,
        r.issue_type,
        r.request_date,
        r.status,
        r.description
      FROM requests r
      JOIN residents res ON r.resident_id = res.resident_id
      LEFT JOIN maintenance_staff ms ON r.staff_id = ms.staff_id
      ORDER BY r.request_id DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new maintenance request
app.post('/api/requests', async (req, res) => {
  const { resident_id, staff_id, issue_type, description, status } = req.body;
  if (!resident_id || !issue_type || !description) {
    return res.status(400).json({ error: 'resident_id, issue_type, and description are required' });
  }

  const initialStatus = status || (staff_id ? 'Assigned' : 'Pending');

  try {
    const [result] = await pool.query(
      `INSERT INTO requests (resident_id, staff_id, issue_type, request_date, status, description)
       VALUES (?, ?, ?, NOW(), ?, ?)`,
      [resident_id, staff_id || null, issue_type, initialStatus, description]
    );

    res.status(201).json({
      message: 'Maintenance request created in MySQL',
      request_id: result.insertId,
      resident_id, staff_id, issue_type, status: initialStatus, description
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update request (assign staff or change status)
app.put('/api/requests/:id', async (req, res) => {
  const requestId = req.params.id;
  const { staff_id, status } = req.body;

  try {
    await pool.query(
      'UPDATE requests SET staff_id = ?, status = ? WHERE request_id = ?',
      [staff_id || null, status, requestId]
    );
    res.json({ message: `Request #${requestId} updated successfully in MySQL`, requestId, staff_id, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =========================================================================
// TABLE 4: MAINTENANCE RECORD ENDPOINTS
// =========================================================================

// GET all maintenance records with costs
app.get('/api/records', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        mr.record_id,
        mr.request_id,
        mr.completion_date,
        mr.repair_cost,
        mr.remarks,
        r.issue_type,
        r.description,
        res.name AS resident_name,
        res.flat_no,
        ms.name AS staff_name
      FROM maintenance_record mr
      JOIN requests r ON mr.request_id = r.request_id
      JOIN residents res ON r.resident_id = res.resident_id
      LEFT JOIN maintenance_staff ms ON r.staff_id = ms.staff_id
      ORDER BY mr.completion_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST log completion date, repair cost and remarks
app.post('/api/records', async (req, res) => {
  const { request_id, completion_date, repair_cost, remarks } = req.body;
  if (!request_id || !completion_date || repair_cost === undefined || !remarks) {
    return res.status(400).json({ error: 'request_id, completion_date, repair_cost, and remarks are required' });
  }

  try {
    // Upsert into maintenance_record
    await pool.query(
      `INSERT INTO maintenance_record (request_id, completion_date, repair_cost, remarks)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         completion_date = VALUES(completion_date),
         repair_cost = VALUES(repair_cost),
         remarks = VALUES(remarks)`,
      [request_id, completion_date, repair_cost, remarks]
    );

    // Automatically mark the request as 'Completed'
    await pool.query(
      "UPDATE requests SET status = 'Completed' WHERE request_id = ?",
      [request_id]
    );

    res.status(201).json({
      message: `Maintenance record saved for Request #${request_id} and status marked as Completed in MySQL`,
      request_id, completion_date, repair_cost, remarks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =========================================================================
// AGGREGATED ANALYTICS STATS ENDPOINT
// =========================================================================
app.get('/api/stats', async (req, res) => {
  try {
    const [[totalReqs]] = await pool.query('SELECT COUNT(*) AS total FROM requests');
    const [[pendingReqs]] = await pool.query("SELECT COUNT(*) AS pending FROM requests WHERE status != 'Completed'");
    const [[completedReqs]] = await pool.query("SELECT COUNT(*) AS completed FROM requests WHERE status = 'Completed'");
    const [[totalCost]] = await pool.query('SELECT COALESCE(SUM(repair_cost), 0) AS totalCost FROM maintenance_record');

    const [categoryCosts] = await pool.query(`
      SELECT 
        r.issue_type,
        COALESCE(SUM(mr.repair_cost), 0) AS totalExpense,
        COUNT(r.request_id) AS requestCount
      FROM requests r
      LEFT JOIN maintenance_record mr ON r.request_id = mr.request_id
      GROUP BY r.issue_type
    `);

    res.json({
      totalRequests: totalReqs.total,
      pendingRequests: pendingReqs.pending,
      completedRequests: completedReqs.completed,
      totalCost: totalCost.totalCost,
      categoryCosts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`=================================================================`);
  console.log(`🚀 Apartment Maintenance Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Connected to MySQL Database: "${dbConfig.database}" as "${dbConfig.user}"`);
  console.log(`💻 Ready for MySQL Workbench queries & live browser interaction`);
  console.log(`=================================================================`);
});

