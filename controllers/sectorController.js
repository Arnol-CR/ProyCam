const { getPool } = require('../config/db');
const { ok, error } = require('../utils/response');

const listar = async (req, res) => {
  try {
    const pool   = await getPool();
    const result = await pool.request().query(`
      SELECT id, nombre, descripcion FROM Sectores WHERE activo = 1 ORDER BY id asc
    `);
    return ok(res, result.recordset);
  } catch (err) {
    return error(res, 'Error al listar sectores');
  }
};

module.exports = { listar };
