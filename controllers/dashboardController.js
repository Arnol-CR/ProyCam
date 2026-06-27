const { getPool, sql } = require('../config/db');
const { ok, error }    = require('../utils/response');

const getStats = async (req, res) => {
  try {
    const pool   = await getPool();
    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM Cosechas  WHERE estado = 'abierta') AS cosechas_activas,
        (SELECT COUNT(*) FROM Lagunas   WHERE activa = 1)         AS lagunas_activas,
        (SELECT COUNT(*) FROM Usuarios  WHERE activo = 1)         AS usuarios_activos,
        (SELECT COUNT(*) FROM SolicitudesCambio WHERE estado = 'pendiente') AS solicitudes_pendientes
    `);
    return ok(res, result.recordset[0]);
  } catch (err) {
    console.error(err);
    return error(res, 'Error al obtener estadísticas');
  }
};

module.exports = { getStats };
