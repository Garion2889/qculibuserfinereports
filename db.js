// db.js
const oracledb = require('oracledb');

const dbConfig = {
  user: 'SYSTEM',
  password: '123',
  connectString: 'localhost/xe',  // Modify with your actual connection details
};

async function getConnection() {
  try {
    return await oracledb.getConnection(dbConfig);
  } catch (err) {
    console.error('Error getting DB connection:', err);
    throw err;
  }
}

module.exports = { getConnection };
