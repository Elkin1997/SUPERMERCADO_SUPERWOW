const express = require('express');
const sql = require('mssql');
const { clienteValidation } = require('../utils/validation');
const { getConnection } = require('../config/database');

const router = express.Router();

// Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM clientes ORDER BY nombre');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM clientes WHERE id_cliente = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear cliente
router.post('/', async (req, res) => {
  try {
    const { error } = clienteValidation(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { nombre, direccion } = req.body;

    const pool = await getConnection();
    const result = await pool.request()
      .input('nombre', sql.VarChar, nombre)
      .input('direccion', sql.VarChar, direccion)
      .query(`
        INSERT INTO clientes (nombre, direccion)
        OUTPUT INSERTED.*
        VALUES (@nombre, @direccion)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Error creando cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { error } = clienteValidation(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { id } = req.params;
    const { nombre, direccion } = req.body;

    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('nombre', sql.VarChar, nombre)
      .input('direccion', sql.VarChar, direccion)
      .query(`
        UPDATE clientes
        SET nombre = @nombre, direccion = @direccion
        OUTPUT INSERTED.*
        WHERE id_cliente = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar cliente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM clientes OUTPUT DELETED.* WHERE id_cliente = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({ message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;