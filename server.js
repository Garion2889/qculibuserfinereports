const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

try {
  oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient_23_7' }); 
  console.log('Oracle Client initialized in Thick mode');
} catch (err) {
  console.error('Error initializing Oracle Client', err);
}

const dbConfig = {
  user: "SYSTEM",
  password: "123",
  connectString: "localhost:1521/xe"
};

// Fetch users with optional role and branch filters
app.get('/api/users', async (req, res) => {
  let connection;
  const { role, branch, student_id } = req.query; // Get query parameters
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    let sql = `SELECT name, student_id, branch, role, status FROM users WHERE 1=1`;
    const binds = {};

    if (role) {
      sql += ` AND LOWER(role) = :role`;
      binds.role = role.toLowerCase();
    }
    if (branch) {
      sql += ` AND LOWER(branch) = :branch`;
      binds.branch = branch.toLowerCase();
    }
    if (student_id) {
      sql += ` AND student_id LIKE :student_id`;
      binds.student_id = `%${student_id}%`;
    }

    const result = await connection.execute(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

// Fetch active or alumni users
app.get('/api/active-alumni', async (req, res) => {
  let connection;
  const { status } = req.query;

  try {
    connection = await oracledb.getConnection(dbConfig);

    let sql = `SELECT name, student_id, branch, status FROM users WHERE status IN ('Active', 'Alumni')`;
    const binds = {};

    if (status) {
      sql = `SELECT name, student_id, branch, status FROM users WHERE LOWER(status) = :status`;
      binds.status = status.toLowerCase();
    }

    const result = await connection.execute(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

// Fetch fines with optional status filter
app.get('/api/fines', async (req, res) => {
  let connection;
  const { status } = req.query;

  try {
    connection = await oracledb.getConnection(dbConfig);

    let sql = `SELECT name, student_id, branch, role, due_date, status, fine_amount FROM fines WHERE 1=1`;
    const binds = {};

    if (status) {
      sql += ` AND LOWER(status) = :status`;
      binds.status = status.toLowerCase();
    }

    const result = await connection.execute(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});
// Pay fine and update status to "paid"
// API to mark fine as paid
app.post('/api/pay', async (req, res) => {
  let connection;
  const { student_id } = req.body;

  if (!student_id) {
    return res.status(400).json({ error: 'Missing student_id' });
  }

  try {
    connection = await oracledb.getConnection(dbConfig);

    const updateSql = `
      UPDATE fines
      SET status = 'Paid'
      WHERE student_id = :student_id AND status = 'Unpaid'
    `;

    const result = await connection.execute(updateSql, { student_id }, { autoCommit: true });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Fine not found or already paid' });
    }

    res.json({ message: 'Fine paid successfully' });
  } catch (err) {
    console.error('Error updating fine:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
