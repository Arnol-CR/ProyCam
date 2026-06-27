const { getPool, sql } = require('../config/db');
const { ok, error }    = require('../utils/response');

const listar = async (req, res) => {
  try {
    const sector_id = req.query.sector_id || null;
    const pool      = await getPool();
    const request   = pool.request();
    let where = 'WHERE l.activa = 1';
    if (sector_id) {
      request.input('sector_id', sql.Int, sector_id);
      where += ' AND l.sector_id = @sector_id';
    }
    const result = await request.query(`
      SELECT l.id, l.nombre, l.hectareas, l.descripcion,
             s.id AS sector_id, s.nombre AS sector
      FROM   Lagunas  l
      JOIN   Sectores s ON s.id = l.sector_id
      ${where}
      ORDER BY l.nombre
    `);
    return ok(res, result.recordset);
  } catch (err) {
    return error(res, 'Error al listar lagunas');
  }
};

module.exports = { listar };
