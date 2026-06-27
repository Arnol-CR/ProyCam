const { getPool, sql } = require('../config/db');
const { ok, error }    = require('../utils/response');

// GET /api/proyecciones/factores
const getFactores = async (req, res) => {
  try {
    const pool   = await getPool();
    const result = await pool.request().query(
      `SELECT id, codigo, nombre, descripcion FROM FactoresProyeccion WHERE activo = 1 ORDER BY nombre`
    );
    return ok(res, result.recordset);
  } catch (err) {
    return error(res, 'Error al obtener factores');
  }
};

// POST /api/proyecciones
const crear = async (req, res) => {
  const { cosecha_id, libras_proyectadas, comentario, factores } = req.body;
  if (!cosecha_id || !libras_proyectadas) {
    return error(res, 'Cosecha y libras proyectadas son requeridos', 400);
  }
  try {
    const pool = await getPool();

    // Verificar que no haya proyectado ya
    const check = await pool.request()
      .input('cosecha_id', sql.Int, cosecha_id)
      .input('usuario_id', sql.Int, req.user.id)
      .query(`SELECT id FROM ProyeccionesUsuario WHERE cosecha_id=@cosecha_id AND usuario_id=@usuario_id`);

    if (check.recordset.length > 0) {
      return error(res, 'Ya registraste una proyección para esta cosecha', 409);
    }

    // Insertar proyección
    const result = await pool.request()
      .input('cosecha_id',         sql.Int,          cosecha_id)
      .input('usuario_id',         sql.Int,          req.user.id)
      .input('libras_proyectadas', sql.Decimal(12,2), libras_proyectadas)
      .input('comentario',         sql.NVarChar,     comentario || null)
      .query(`
        INSERT INTO ProyeccionesUsuario (cosecha_id, usuario_id, libras_proyectadas, comentario)
        OUTPUT INSERTED.id
        VALUES (@cosecha_id, @usuario_id, @libras_proyectadas, @comentario)
      `);

    const proyeccionId = result.recordset[0].id;

    // Insertar factores seleccionados
    if (factores && factores.length > 0) {
      for (const factorId of factores) {
        await pool.request()
          .input('proyeccion_id', sql.Int, proyeccionId)
          .input('factor_id',     sql.Int, factorId)
          .query(`INSERT INTO ProyeccionFactores (proyeccion_id, factor_id) VALUES (@proyeccion_id, @factor_id)`);
      }
    }

    return ok(res, { id: proyeccionId }, 'Proyección registrada exitosamente', 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Error al registrar proyección');
  }
};

module.exports = { getFactores, crear };

// GET /api/proyecciones/cosecha/:id
const listarPorCosecha = async (req, res) => {
  try {
    const pool   = await getPool();
    const result = await pool.request()
      .input('cosecha_id', sql.Int, req.params.cosecha_id)
      .query(`
        SELECT
          pu.id, pu.libras_proyectadas, pu.comentario, pu.created_at,
          u.nombre AS usuario, r.nombre AS rol,
          STUFF((
            SELECT ', ' + fp.nombre
            FROM   ProyeccionFactores pf
            JOIN   FactoresProyeccion fp ON fp.id = pf.factor_id
            WHERE  pf.proyeccion_id = pu.id
            FOR XML PATH('')
          ), 1, 2, '') AS parametros
        FROM  ProyeccionesUsuario pu
        JOIN  Usuarios u ON u.id = pu.usuario_id
        JOIN  Roles    r ON r.id = u.rol_id
        WHERE pu.cosecha_id = @cosecha_id
        ORDER BY pu.created_at ASC
      `);
    return ok(res, result.recordset);
  } catch (err) {
    console.error(err);
    return error(res, 'Error al listar proyecciones');
  }
};

module.exports = { getFactores, crear, listarPorCosecha };
