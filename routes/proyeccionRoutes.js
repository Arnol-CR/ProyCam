const router                          = require('express').Router();
const { getFactores, crear, listarPorCosecha } = require('../controllers/proyeccionController');
const { verifyToken } = require('../middlewares/auth');

router.get('/factores',         verifyToken, getFactores);
router.get('/cosecha/:cosecha_id', verifyToken, listarPorCosecha);
router.post('/',                verifyToken, crear);

module.exports = router;
