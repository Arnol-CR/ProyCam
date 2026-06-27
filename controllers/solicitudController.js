const { getPool, sql } = require('../config/db');
const { ok, error }    = require('../utils/response');

const listar = async (req, res) => {
  try {
    const estado = req.query.estado || null;
    const limit  = parseInt(req.query.limit) || 50;
    const pool   = await getPool();

    const request = pool.request().input('limit', sql.Int, limit);
    let where = '';
    if (estado) {
      request.input('estado', sql.NVarChar, estado);
      where = "WHERE sc.estado = @estado";
    }

    const result = await request.query(`
      SELECT TOP (@limit)
        sc.id, sc.estado, sc.motivo,
        sc.valor_anterior, sc.nuevo_valor, sc.created_at,
        u.nombre  AS usuario,
        l.nombre  AS laguna,
        c.fecha
      FROM  SolicitudesCambio sc
      JOIN  ProyeccionesUsuario pu ON pu.id = sc.proyeccion_id
      JOIN  Usuarios u             ON u.id  = sc.solicitado_por
      JOIN  Cosechas c             ON c.id  = pu.cosecha_id
      JOIN  Lagunas  l             ON l.id  = c.laguna_id
      ${where}
      ORDER BY sc.created_at DESC
    `);
    return ok(res, result.recordset);
  } catch (err) {
    console.error(err);
    return error(res, 'Error al listar solicitudes');
  }
};

module.exports = { listar };
