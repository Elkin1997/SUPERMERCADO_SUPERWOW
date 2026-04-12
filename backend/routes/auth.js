const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const { loginValidation, registerValidation } = require('../utils/validation');
const { getConnection } = require('../config/database');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const usuario = req.body.usuario || req.body.nombre_usuario || req.body.user;
    const password = req.body.password || req.body.contraseña || req.body.pass;

    if (!usuario || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('usuario', sql.VarChar, usuario)
      .query('SELECT * FROM usuarios WHERE usuario = @usuario');

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const user = result.recordset[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { id: user.id, usuario: user.usuario },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        usuario: user.usuario,
        nombre: user.nombre
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Registro
router.post('/register', async (req, res) => {
  try {
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { usuario, password, nombre } = req.body;

    const pool = await getConnection();
    const result = await pool.request()
      .input('usuario', sql.VarChar, usuario)
      .query('SELECT * FROM usuarios WHERE usuario = @usuario');

    if (result.recordset.length > 0) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.request()
      .input('usuario', sql.VarChar, usuario)
      .input('password', sql.VarChar, hashedPassword)
      .input('nombre', sql.VarChar, nombre)
      .query('INSERT INTO usuarios (usuario, password, nombre) VALUES (@usuario, @password, @nombre)');

    res.json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;