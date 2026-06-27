const router      = require('express').Router();
const { listar }  = require('../controllers/lagunaController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, listar);
module.exports = router;
