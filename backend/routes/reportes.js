const express = require('express');
const sql = require('mssql');
const { getConnection } = require('../config/database');

const router = express.Router();

// Reporte de ventas por período
router.get('/ventas', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const pool = await getConnection();

    let query = `
      SELECT
        CONVERT(date, f.fecha) as fecha,
        COUNT(f.id_factura) as cantidad_facturas,
        SUM(f.total) as total_ventas
      FROM facturas f
      WHERE 1=1
    `;

    const params = [];

    if (fecha_inicio) {
      query += ' AND f.fecha >= @fecha_inicio';
      params.push({ name: 'fecha_inicio', type: sql.DateTime, value: new Date(fecha_inicio) });
    }

    if (fecha_fin) {
      query += ' AND f.fecha <= @fecha_fin';
      params.push({ name: 'fecha_fin', type: sql.DateTime, value: new Date(fecha_fin) });
    }

    query += ' GROUP BY CONVERT(date, f.fecha) ORDER BY fecha DESC';

    const request = pool.request();
    params.forEach(param => {
      request.input(param.name, param.type, param.value);
    });

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error obteniendo reporte de ventas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Reporte de productos más vendidos
router.get('/productos-vendidos', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const pool = await getConnection();

    let query = `
      SELECT
        p.nombre,
        SUM(df.cantidad) as cantidad_vendida,
        SUM(df.subtotal) as total_vendido
      FROM detalle_factura df
      INNER JOIN productos p ON df.id_producto = p.id_producto
      INNER JOIN facturas f ON df.id_factura = f.id_factura
      WHERE 1=1
    `;

    const params = [];

    if (fecha_inicio) {
      query += ' AND f.fecha >= @fecha_inicio';
      params.push({ name: 'fecha_inicio', type: sql.DateTime, value: new Date(fecha_inicio) });
    }

    if (fecha_fin) {
      query += ' AND f.fecha <= @fecha_fin';
      params.push({ name: 'fecha_fin', type: sql.DateTime, value: new Date(fecha_fin) });
    }

    query += ' GROUP BY p.nombre ORDER BY cantidad_vendida DESC';

    const request = pool.request();
    params.forEach(param => {
      request.input(param.name, param.type, param.value);
    });

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error obteniendo reporte de productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Reporte de clientes más activos
router.get('/clientes-activos', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const pool = await getConnection();

    let query = `
      SELECT
        c.nombre as cliente,
        COUNT(f.id_factura) as cantidad_compras,
        SUM(f.total) as total_comprado
      FROM clientes c
      INNER JOIN facturas f ON c.id_cliente = f.id_cliente
      WHERE 1=1
    `;

    const params = [];

    if (fecha_inicio) {
      query += ' AND f.fecha >= @fecha_inicio';
      params.push({ name: 'fecha_inicio', type: sql.DateTime, value: new Date(fecha_inicio) });
    }

    if (fecha_fin) {
      query += ' AND f.fecha <= @fecha_fin';
      params.push({ name: 'fecha_fin', type: sql.DateTime, value: new Date(fecha_fin) });
    }

query += ' GROUP BY c.nombre ORDER BY total_comprado DESC';

    const request = pool.request();
    params.forEach(param => {
      request.input(param.name, param.type, param.value);
    });

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error obteniendo reporte de clientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Estadísticas generales
router.get('/estadisticas', async (req, res) => {
  try {
    const pool = await getConnection();

    const [productosResult, clientesResult, facturasResult, ventasResult] = await Promise.all([
      pool.request().query('SELECT COUNT(*) as total FROM productos'),
      pool.request().query('SELECT COUNT(*) as total FROM clientes'),
      pool.request().query('SELECT COUNT(*) as total FROM facturas'),
      pool.request().query('SELECT SUM(total) as total FROM facturas')
    ]);

    res.json({
      total_productos: productosResult.recordset[0].total,
      total_clientes: clientesResult.recordset[0].total,
      total_facturas: facturasResult.recordset[0].total,
      total_ventas: ventasResult.recordset[0].total || 0
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;