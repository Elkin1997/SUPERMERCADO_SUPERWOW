require('dotenv').config();
const sql = require('mssql');

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123456',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'superwow',
  options: {
    encrypt: false, // Para SQL Server local
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let poolPromise;

const getConnection = async () => {
  try {
    if (!poolPromise) {
      poolPromise = new sql.ConnectionPool(config).connect();
    }
    return await poolPromise;
  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
    throw error;
  }
};

module.exports = {
  getConnection,
  sql
};