const bcrypt           = require('bcryptjs');
const { getPool, sql } = require('../config/db');
const { ok, error }    = require('../utils/response');

const listar = async (req, res) => {
  try {
    const pool   = await getPool();
    const result = await pool.request().query(`
      SELECT u.id, u.nombre, u.email, u.activo, u.created_at,
             r.id AS rol_id, r.nombre AS rol,
             STUFF((
               SELECT ', ' + s.nombre
               FROM   UsuarioSectores us
               JOIN   Sectores s ON s.id = us.sector_id
               WHERE  us.usuario_id = u.id
               FOR XML PATH('')
             ), 1, 2, '') AS sectores,
             (SELECT STRING_AGG(CAST(us2.sector_id AS NVARCHAR), ',')
              FROM UsuarioSectores us2
              WHERE us2.usuario_id = u.id) AS sector_ids
      FROM   Usuarios u
      JOIN   Roles    r ON r.id = u.rol_id
      ORDER BY u.nombre ASC
    `);
    return ok(res, result.recordset);
  } catch (err) {
    console.error(err);
    return error(res, 'Error al listar usuarios');
  }
};

const crear = async (req, res) => {
  const { nombre, email, password, rol_id, sector_ids } = req.body;
  if (!nombre || !email || !password || !rol_id) {
    return error(res, 'Nombre, email, contraseña y rol son requeridos', 400);
  }
  try {
    const pool = await getPool();
    const existe = await pool.request()
      .input('email', sql.NVarChar, email)
      .query(`SELECT id FROM Usuarios WHERE email = @email`);
    if (existe.recordset.length > 0) {
      return error(res, 'Ya existe un usuario con ese email', 409);
    }
    const hash   = await bcrypt.hash(password, 10);
    const result = await pool.request()
      .input('nombre', sql.NVarChar, nombre)
      .input('email',  sql.NVarChar, email)
      .input('hash',   sql.NVarChar, hash)
      .input('rol_id', sql.Int,      rol_id)
      .query(`
        INSERT INTO Usuarios (nombre, email, password_hash, rol_id, activo)
        OUTPUT INSERTED.id
        VALUES (@nombre, @email, @hash, @rol_id, 1)
      `);
    const userId = result.recordset[0].id;

    // Insertar sectores
    if (sector_ids && sector_ids.length > 0) {
      for (const sid of sector_ids) {
        await pool.request()
          .input('usuario_id', sql.Int, userId)
          .input('sector_id',  sql.Int, sid)
          .query(`INSERT INTO UsuarioSectores (usuario_id, sector_id) VALUES (@usuario_id, @sector_id)`);
      }
    }
    return ok(res, { id: userId }, 'Usuario creado exitosamente', 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Error al crear usuario');
  }
};

const actualizar = async (req, res) => {
  const { nombre, email, password, rol_id, sector_ids, activo } = req.body;
  try {
    const pool    = await getPool();
    const request = pool.request()
      .input('id',     sql.Int,      req.params.id)
      .input('nombre', sql.NVarChar, nombre)
      .input('email',  sql.NVarChar, email)
      .input('rol_id', sql.Int,      rol_id)
      .input('activo', sql.Bit,      activo ?? 1);

    let hashQuery = '';
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      request.input('hash', sql.NVarChar, hash);
      hashQuery = ', password_hash = @hash';
    }

    await request.query(`
      UPDATE Usuarios SET
        nombre = @nombre, email = @email,
        rol_id = @rol_id, activo = @activo
        ${hashQuery}
      WHERE id = @id
    `);

    // Reemplazar sectores
    await pool.request()
      .input('usuario_id', sql.Int, req.params.id)
      .query(`DELETE FROM UsuarioSectores WHERE usuario_id = @usuario_id`);

    if (sector_ids && sector_ids.length > 0) {
      for (const sid of sector_ids) {
        await pool.request()
          .input('usuario_id', sql.Int, req.params.id)
          .input('sector_id',  sql.Int, sid)
          .query(`INSERT INTO UsuarioSectores (usuario_id, sector_id) VALUES (@usuario_id, @sector_id)`);
      }
    }
    return ok(res, {}, 'Usuario actualizado');
  } catch (err) {
    console.error(err);
    return error(res, 'Error al actualizar usuario');
  }
};

const listarRoles = async (req, res) => {
  try {
    const pool   = await getPool();
    const result = await pool.request().query(`SELECT id, nombre FROM Roles ORDER BY nombre`);
    return ok(res, result.recordset);
  } catch (err) {
    return error(res, 'Error al listar roles');
  }
};

module.exports = { listar, crear, actualizar, listarRoles };
