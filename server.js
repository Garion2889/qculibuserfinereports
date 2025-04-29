const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

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
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'qculibtest1@gmail.com',
    pass: 'qkae avep hgfo deix'
  },
  tls: {
    rejectUnauthorized: false
  }
});


// Fetch users with optional role and branch filters
// Fetch users with optional role, branch, status, and student_id filters
app.get('/api/users', async (req, res) => {
  let connection;
  const { branch, student_id, role, status } = req.query; // added role and status
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    let sql = `SELECT name, student_id, branch, role, status FROM users WHERE 1=1`;
    const binds = {};

    if (branch) {
      sql += ` AND LOWER(branch) = :branch`;
      binds.branch = branch.toLowerCase();
    }
    if (student_id) {
      sql += ` AND student_id LIKE :student_id`;
      binds.student_id = `%${student_id}%`;
    }
    if (role) {
      sql += ` AND LOWER(role) = :role`;
      binds.role = role.toLowerCase();
    }
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

// Fetch Faculty Table
app.get('/api/faculty', async (req, res) => {
  let connection;
  const { status } = req.query;

  try {
    connection = await oracledb.getConnection(dbConfig);

    let sql = `SELECT name, status from faculty`;
    const binds = {};

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
app.get('/api/alumni', async (req, res) => {
  let connection;
  const { status } = req.query;

  try {
    connection = await oracledb.getConnection(dbConfig);

    let sql = `SELECT name, student_id, branch, status FROM users WHERE role IN ('Alumni')`;
    const binds = {};

    if (status) {
      sql = `SELECT name, student_id, branch, status FROM users WHERE LOWER(role) = :role`;
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

// Fetch fines
app.get('/api/fines', async (req, res) => {
  let connection;
  const { status } = req.query;

  try {
    connection = await oracledb.getConnection(dbConfig);

    let sql = `SELECT name, student_id, branch, role, due_date, payment_status, fine_amount FROM fines WHERE 1=1`;
    const binds = {};

    if (status) {
      sql += ` AND LOWER(payment_status) = :payment_status`;
      binds.payment_status = status.toLowerCase();
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

    const userResult = await connection.execute(
      `SELECT email, name FROM users WHERE student_id = :student_id`,
      { student_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const { email, name } = userResult.rows[0];

    const updateSql = `
      UPDATE fines
      SET payment_status = 'Paid'
      WHERE student_id = :student_id AND payment_status = 'Unpaid'
    `;
    const updateResult = await connection.execute(updateSql, { student_id }, { autoCommit: true });

    if (updateResult.rowsAffected === 0) {
      return res.status(404).json({ error: 'Fine not found or already paid' });
    }

    // Optional email notification
    if (email && email.includes('@')) {
      const mailOptions = {
        from: 'qculibtest1@gmail.com',
        to: email,
        subject: 'Fine Payment Confirmation',
        text: `Hi ${name},\n\nYour fine has been successfully marked as Paid.\n\nThank you!`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    } else {
      console.warn(`No valid email found for student_id: ${student_id}`);
    }

    res.json({ message: 'Fine paid and email (if available) sent successfully' });

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
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
