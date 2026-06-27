const router                          = require('express').Router();
const { getStats, getCosechasActivas } = require('../controllers/dashboardController');
const { verifyToken }                 = require('../middlewares/auth');

router.get('/stats',           verifyToken, getStats);
router.get('/cosechas-activas',verifyToken, getCosechasActivas);

module.exports = router;
