const router       = require('express').Router();
const { getStats } = require('../controllers/dashboardController');
const { verifyToken } = require('../middlewares/auth');

router.get('/stats', verifyToken, getStats);
module.exports = router;
