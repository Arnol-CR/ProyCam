const express = require('express');
const router  = express.Router();
const { getPool, sql } = require('../config/db');
const { verifyToken } = require('../middlewares/auth');

// GET /api/reportes/rendimiento
// Devuelve ranking de usuarios por tasa de acierto ±10%
router.get('/rendimiento', verifyToken, async (req, res) => {
  try {
    const pool   = await getPool();
    const result = await pool.request()
      .execute('sp_ReporteRendimientoUsuarios');

    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error('Error reporte rendimiento:', err);
    res.status(500).json({ success: false, message: 'Error al generar reporte' });
  }
});

module.exports = router;
