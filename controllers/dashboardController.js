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

// GET /api/dashboard/cosechas-activas
const getCosechasActivas = async (req, res) => {
  try {
    const pool   = await getPool();
    const userId = req.user.id;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT
          c.id, l.nombre AS laguna, s.nombre AS sector,
          l.hectareas,
          c.fecha, c.estado, c.cantidad_proyectada_lbs,
          c.peso_planta_lb, c.peso_gramos_cosecha,
          (SELECT COUNT(*) FROM ProyeccionesUsuario pu WHERE pu.cosecha_id = c.id) AS total_proyecciones,
          (SELECT COUNT(*) FROM ProyeccionesUsuario pu WHERE pu.cosecha_id = c.id AND pu.usuario_id = @userId) AS ya_proyecte
        FROM  Cosechas c
        JOIN  Lagunas  l ON l.id = c.laguna_id
        JOIN  Sectores s ON s.id = l.sector_id
        JOIN  Usuarios u ON u.id = c.creado_por
        WHERE c.estado = 'abierta'
        ORDER BY c.fecha DESC
      `);
    return ok(res, result.recordset);
  } catch (err) {
    console.error(err);
    return error(res, 'Error al obtener cosechas activas');
  }
};

module.exports = { getStats, getCosechasActivas };
