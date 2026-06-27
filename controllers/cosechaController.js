const { getPool, sql } = require('../config/db');
const { ok, error }    = require('../utils/response');

const listar = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const pool  = await getPool();
    const result = await pool.request()
      .input('limit', sql.Int, limit)
      .query(`
        SELECT TOP (@limit)
          c.id, l.nombre AS laguna, s.nombre AS sector,
          c.fecha, c.estado, c.cantidad_proyectada_lbs,
          c.peso_planta_lb, c.peso_gramos_cosecha,
          u.nombre AS creado_por,
          (SELECT COUNT(*) FROM ProyeccionesUsuario pu WHERE pu.cosecha_id = c.id) AS total_proyecciones
        FROM  Cosechas c
        JOIN  Lagunas  l ON l.id = c.laguna_id
        JOIN  Sectores s ON s.id = l.sector_id
        JOIN  Usuarios u ON u.id = c.creado_por
        ORDER BY c.created_at DESC
      `);
    return ok(res, result.recordset);
  } catch (err) {
    console.error(err);
    return error(res, 'Error al listar cosechas');
  }
};

const crear = async (req, res) => {
  const { laguna_id, fecha, cantidad_proyectada_lbs, peso_planta_lb, peso_gramos_cosecha, observaciones } = req.body;

  if (!laguna_id || !fecha) {
    return error(res, 'Laguna y fecha son requeridos', 400);
  }

  try {
    const pool   = await getPool();
    const result = await pool.request()
      .input('laguna_id',               sql.Int,          laguna_id)
      .input('creado_por',              sql.Int,          req.user.id)
      .input('fecha',                   sql.Date,         fecha)
      .input('cantidad_proyectada_lbs', sql.Decimal(12,2), cantidad_proyectada_lbs || null)
      .input('peso_planta_lb',          sql.Decimal(10,3), peso_planta_lb || null)
      .input('peso_gramos_cosecha',     sql.Decimal(10,3), peso_gramos_cosecha || null)
      .input('observaciones',           sql.NVarChar,     observaciones || null)
      .query(`
        INSERT INTO Cosechas (laguna_id, creado_por, fecha, cantidad_proyectada_lbs, peso_planta_lb, peso_gramos_cosecha, observaciones)
        OUTPUT INSERTED.id
        VALUES (@laguna_id, @creado_por, @fecha, @cantidad_proyectada_lbs, @peso_planta_lb, @peso_gramos_cosecha, @observaciones)
      `);

    return ok(res, { id: result.recordset[0].id }, 'Cosecha creada exitosamente', 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Error al crear cosecha');
  }
};

const obtener = async (req, res) => {
  try {
    const pool   = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT c.*, l.nombre AS laguna, s.nombre AS sector, l.hectareas,
               u.nombre AS creado_por_nombre
        FROM   Cosechas c
        JOIN   Lagunas  l ON l.id = c.laguna_id
        JOIN   Sectores s ON s.id = l.sector_id
        JOIN   Usuarios u ON u.id = c.creado_por
        WHERE  c.id = @id
      `);
    if (!result.recordset[0]) return error(res, 'Cosecha no encontrada', 404);
    return ok(res, result.recordset[0]);
  } catch (err) {
    return error(res, 'Error al obtener cosecha');
  }
};

module.exports = { listar, crear, obtener };
