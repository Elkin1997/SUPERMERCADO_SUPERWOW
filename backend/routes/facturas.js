const express = require('express');
const sql = require('mssql');
const { facturaValidation } = require('../utils/validation');
const { getConnection } = require('../config/database');

const router = express.Router();

// Obtener todas las facturas
router.get('/', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT f.*, c.nombre as cliente_nombre, c.direccion
      FROM facturas f
      INNER JOIN clientes c ON f.id_cliente = c.id_cliente
      ORDER BY f.fecha DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error obteniendo facturas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener factura por ID con detalles
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    // Obtener factura
    const facturaResult = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT f.*, c.nombre as cliente_nombre, c.direccion
        FROM facturas f
        INNER JOIN clientes c ON f.id_cliente = c.id_cliente
        WHERE f.id_factura = @id
      `);

    if (facturaResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    // Obtener detalles de la factura
    const detallesResult = await pool.request()
      .input('factura_id', sql.Int, id)
      .query(`
        SELECT df.*, p.nombre as producto_nombre, p.precio
        FROM detalle_factura df
        INNER JOIN productos p ON df.id_producto = p.id_producto
        WHERE df.id_factura = @factura_id
      `);

    const factura = facturaResult.recordset[0];
    factura.detalles = detallesResult.recordset;

    res.json(factura);
  } catch (error) {
    console.error('Error obteniendo factura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear factura con detalles
router.post('/', async (req, res) => {
  const transaction = await getConnection();
  try {
    const { error } = facturaValidation(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { cliente_id, productos } = req.body;

    // Calcular total
    let total = 0;
    for (const item of productos) {
      total += item.precio * item.cantidad;
    }

    // Iniciar transacción
    const pool = await transaction;

    // Insertar factura
    const facturaResult = await pool.request()
      .input('cliente_id', sql.Int, cliente_id)
      .input('total', sql.Decimal(10,2), total)
      .input('fecha', sql.DateTime, new Date())
      .query(`
        INSERT INTO facturas (id_cliente, fecha, total)
        OUTPUT INSERTED.id_factura AS id
        VALUES (@cliente_id, @fecha, @total)
      `);

    const facturaId = facturaResult.recordset[0].id;

    // Insertar detalles
    for (const item of productos) {
      await pool.request()
        .input('factura_id', sql.Int, facturaId)
        .input('producto_id', sql.Int, item.id)
        .input('cantidad', sql.Int, item.cantidad)
        .input('subtotal', sql.Decimal(10,2), item.precio * item.cantidad)
        .query(`
          INSERT INTO detalle_factura (id_factura, id_producto, cantidad, subtotal)
          VALUES (@factura_id, @producto_id, @cantidad, @subtotal)
        `);
    }

    res.status(201).json({
      id: facturaId,
      cliente_id,
      total,
      fecha: new Date(),
      productos
    });
  } catch (error) {
    console.error('Error creando factura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar factura
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    // Primero obtener los detalles para restaurar stock
    const detallesResult = await pool.request()
      .input('factura_id', sql.Int, id)
      .query('SELECT * FROM detalle_factura WHERE id_factura = @factura_id');

    // Restaurar stock
    for (const detalle of detallesResult.recordset) {
      await pool.request()
        .input('producto_id', sql.Int, detalle.id_producto)
        .input('cantidad', sql.Int, detalle.cantidad)
        .query(`
          UPDATE productos
          SET stock = stock + @cantidad
          WHERE id_producto = @producto_id
        `);
    }

    // Eliminar detalles
    await pool.request()
      .input('factura_id', sql.Int, id)
      .query('DELETE FROM detalle_factura WHERE id_factura = @factura_id');

    // Eliminar factura
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM facturas OUTPUT DELETED.* WHERE id_factura = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    res.json({ message: 'Factura eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando factura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;