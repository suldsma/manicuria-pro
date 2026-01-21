// backend/routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import Admin from '../models/Admin.js';

const router = express.Router();

// Middleware de validación
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

    // Buscar admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    // Verificar password
    const passwordValido = await admin.compararPassword(password);
    if (!passwordValido) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        nombre: admin.nombre,
        email: admin.email
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// POST /api/auth/registro (solo para crear primer admin)
router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Verificar si ya existe un admin
    const adminExistente = await Admin.findOne({ email });
    if (adminExistente) {
      return res.status(400).json({ mensaje: 'Email ya registrado' });
    }

    const nuevoAdmin = new Admin({ nombre, email, password });
    await nuevoAdmin.save();

    res.status(201).json({ mensaje: 'Admin creado exitosamente' });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

export default router;