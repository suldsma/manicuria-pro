// backend/routes/auth.js - Version MySQL
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import pool from '../config/db.js';

const router = express.Router();

const validarLogin = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Password requerido')
];

// POST /api/auth/login
router.post('/login', validarLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }

    const { email, password } = req.body;

    const [admins] = await pool.execute(
      'SELECT * FROM admins WHERE email = ?',
      [email]
    );

    if (admins.length === 0) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const admin = admins[0];

    const passwordValido = await bcrypt.compare(password, admin.password);
    if (!passwordValido) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        nombre: admin.nombre,
        email: admin.email
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// POST /api/auth/registro
router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    const [adminExistente] = await pool.execute(
      'SELECT id FROM admins WHERE email = ?',
      [email]
    );

    if (adminExistente.length > 0) {
      return res.status(400).json({ mensaje: 'Email ya registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await pool.execute(
      'INSERT INTO admins (nombre, email, password) VALUES (?, ?, ?)',
      [nombre, email, passwordHash]
    );

    res.status(201).json({ mensaje: 'Admin creado exitosamente' });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

export default router;