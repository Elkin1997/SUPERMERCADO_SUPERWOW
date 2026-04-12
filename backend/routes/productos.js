const express = require('express');
const sql = require('mssql');
const { productoValidation } = require('../utils/validation');
const { getConnection } = require('../config/database');

const router = express.Router();

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM productos ORDER BY nombre');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener producto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM productos WHERE id_producto = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear producto
router.post('/', async (req, res) => {
  try {
    const { error } = productoValidation(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { nombre, precio, imagen } = req.body;

    const pool = await getConnection();
    const result = await pool.request()
      .input('nombre', sql.VarChar, nombre)
      .input('precio', sql.Decimal(10,2), precio)
      .input('imagen', sql.VarChar, imagen)
      .query(`
        INSERT INTO productos (nombre, precio, imagen)
        OUTPUT INSERTED.*
        VALUES (@nombre, @precio, @imagen)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar producto
router.put('/:id', async (req, res) => {
  try {
    const { error } = productoValidation(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { id } = req.params;
    const { nombre, precio, imagen } = req.body;

    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('nombre', sql.VarChar, nombre)
      .input('precio', sql.Decimal(10,2), precio)
      .input('imagen', sql.VarChar, imagen)
      .query(`
        UPDATE productos
        SET nombre = @nombre, precio = @precio, imagen = @imagen
        OUTPUT INSERTED.*
        WHERE id_producto = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar producto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM productos OUTPUT DELETED.* WHERE id_producto = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;