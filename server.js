require('dotenv').config();
const express     = require('express');
const path        = require('path');
const { getPool } = require('./config/db');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin',  '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/', (req, res) => {
  res.redirect('/login.html');
});

app.use('/api/auth',        require('./routes/authRoutes'));
app.use('/api/dashboard',   require('./routes/dashboardRoutes'));
app.use('/api/cosechas',    require('./routes/cosechaRoutes'));
app.use('/api/sectores',   require('./routes/sectorRoutes'));
app.use('/api/lagunas',     require('./routes/lagunaRoutes'));
app.use('/api/proyecciones', require('./routes/proyeccionRoutes'));
app.use('/api/usuarios',    require('./routes/usuarioRoutes'));
app.use('/api/solicitudes', require('./routes/solicitudRoutes'));
app.use('/api/reportes',    require('./routes/reportesRoutes'));

app.get('/api/health', async (req, res) => {
  try {
    const pool   = await getPool();
    const result = await pool.request().query('SELECT GETDATE() AS fecha_servidor');
    res.json({ success: true, fecha_servidor: result.recordset[0].fecha_servidor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.use((req, res) => res.status(404).json({ success: false, message: 'Ruta no encontrada' }));

app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
