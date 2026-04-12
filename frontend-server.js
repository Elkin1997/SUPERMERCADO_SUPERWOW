const express = require('express');
const path = require('path');

const app = express();

// Servir archivos estáticos desde la raíz del proyecto
const rootPath = path.join(__dirname);
app.use(express.static(rootPath));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(rootPath, 'frontend/viws/index.html'));
});

// Ruta de diagnóstico
app.get('/diagnostico', (req, res) => {
  res.sendFile(path.join(rootPath, 'frontend/viws/diagnostico.html'));
});

// Ruta de test
app.get('/test', (req, res) => {
  res.sendFile(path.join(rootPath, 'frontend/viws/test.html'));
});

const PORT = 5500;
app.listen(PORT, () => {
  console.log(`\n🌐 Frontend disponible en http://localhost:${PORT}`);
  console.log(`📱 Abre el navegador en: http://localhost:${PORT}\n`);
  console.log(`🔍 Diagnóstico: http://localhost:${PORT}/diagnostico`);
  console.log('📂 Sirviendo desde:', rootPath);
});
