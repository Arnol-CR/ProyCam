const sql = require('mssql');
require('dotenv').config();

const config = {
  server:   process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port:     parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt:                true,  // requerido en Azure
    trustServerCertificate: false,
    enableArithAbort:       true,
  },
  pool: {
    max:              10,
    min:              0,
    idleTimeoutMillis: 30000,
  },
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

pool.on('error', (err) => {
  console.error('Error en pool de conexiones SQL:', err);
});

module.exports = {
  sql,
  poolConnect,
  getPool: async () => {
    await poolConnect;
    return pool;
  },
};
