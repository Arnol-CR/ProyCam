const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return error(res, 'Token requerido', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, nombre, email, rol_id, rol, sector_id }
    next();
  } catch (err) {
    return error(res, 'Token inválido o expirado', 401);
  }
};

// Middleware para restringir por rol
const soloRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return error(res, 'No tienes permiso para esta acción', 403);
    }
    next();
  };
};

module.exports = { verifyToken, soloRoles };
