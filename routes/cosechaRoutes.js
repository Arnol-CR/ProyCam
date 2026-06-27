const router                  = require('express').Router();
const { listar, crear, obtener } = require('../controllers/cosechaController');
const { verifyToken, soloRoles } = require('../middlewares/auth');

router.get('/',    verifyToken, listar);
router.post('/',   verifyToken, soloRoles('Admin'), crear);
router.get('/:id', verifyToken, obtener);

module.exports = router;
