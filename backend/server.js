require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { verificarAutenticacion } = require('./middleware');
const authRoutes = require('./routes/auth');
const clientesRoutes = require('./routes/clientes');
const productosRoutes = require('./routes/productos');
const facturasRoutes = require('./routes/facturas');
const reportesRoutes = require('./routes/reportes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Rutas de autenticación (sin middleware de autenticación)
app.use('/api/auth', authRoutes);

// Middleware de autenticación para rutas protegidas
app.use('/api/clientes', clientesRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/facturas', facturasRoutes);
app.use('/api/reportes', verificarAutenticacion, reportesRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

// Servir archivos estáticos del frontend
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));
app.use('/IMAGENES', express.static(path.join(__dirname, '../IMAGENES')));

// Ruta para el index.html principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/viws/index.html'));
});

// Ruta para el diagnóstico
app.get('/diagnostico.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/viws/diagnostico.html'));
});
app.get('/diagnostico', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/viws/diagnostico.html'));
});

// Ruta para el test
app.get('/test.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/viws/test.html'));
});
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/viws/test.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});
