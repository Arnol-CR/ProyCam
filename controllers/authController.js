const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { getPool, sql } = require('../config/db');
const { ok, error }    = require('../utils/response');

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return error(res, 'Email y contraseña son requeridos', 400);
  }

  try {
    const pool   = await getPool();
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query(`
        SELECT u.id, u.nombre, u.email, u.password_hash,
               u.rol_id, r.nombre AS rol,
               u.sector_id, u.activo
        FROM   Usuarios u
        JOIN   Roles r ON r.id = u.rol_id
        WHERE  u.email = @email
      `);

    const usuario = result.recordset[0];

    if (!usuario) {
      return error(res, 'Credenciales incorrectas', 401);
    }

    if (!usuario.activo) {
      return error(res, 'Usuario inactivo, contacta al administrador', 403);
    }

    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) {
      return error(res, 'Credenciales incorrectas', 401);
    }

    const payload = {
      id:        usuario.id,
      nombre:    usuario.nombre,
      email:     usuario.email,
      rol_id:    usuario.rol_id,
      rol:       usuario.rol,
      sector_id: usuario.sector_id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    return ok(res, { token, usuario: payload }, 'Login exitoso');

  } catch (err) {
    console.error('Error en login:', err);
    return error(res, 'Error interno del servidor', 500);
  }
};

// GET /api/auth/me  (requiere token)
const me = async (req, res) => {
  return ok(res, req.user, 'Usuario autenticado');
};

module.exports = { login, me };
