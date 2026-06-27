const router                              = require('express').Router();
const { listar, crear, actualizar, listarRoles } = require('../controllers/usuarioController');
const { verifyToken, soloRoles }          = require('../middlewares/auth');

router.get('/roles',  verifyToken, listarRoles);
router.get('/',       verifyToken, soloRoles('Admin'), listar);
router.post('/',      verifyToken, soloRoles('Admin'), crear);
router.patch('/:id',  verifyToken, soloRoles('Admin'), actualizar);

module.exports = router;
