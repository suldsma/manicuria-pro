// backend/routes/servicios.js - Version MySQL
import express from 'express';
import pool from '../config/db.js';
import verificarToken from '../middleware/auth.js';

const router = express.Router();

// GET /api/servicios
router.get('/', async (req, res) => {
  try {
    const [servicios] = await pool.execute(
      'SELECT * FROM servicios WHERE activo = TRUE ORDER BY nombre'
    );
    res.json(servicios);
  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// GET /api/servicios/:id
router.get('/:id', async (req, res) => {
  try {
    const [servicios] = await pool.execute(
      'SELECT * FROM servicios WHERE id = ?',
      [req.params.id]
    );

    if (servicios.length === 0) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    res.json(servicios[0]);
  } catch (error) {
    console.error('Error obteniendo servicio:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// POST /api/servicios
router.post('/', verificarToken, async (req, res) => {
  try {
    const { nombre, descripcion, duracion, precio, imagen } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO servicios (nombre, descripcion, duracion, precio, imagen) VALUES (?, ?, ?, ?, ?)',
      [nombre, descripcion || '', duracion, precio, imagen || '']
    );

    const [nuevoServicio] = await pool.execute(
      'SELECT * FROM servicios WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(nuevoServicio[0]);
  } catch (error) {
    console.error('Error creando servicio:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// PUT /api/servicios/:id
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const { nombre, descripcion, duracion, precio, activo, imagen } = req.body;

    await pool.execute(
      'UPDATE servicios SET nombre = ?, descripcion = ?, duracion = ?, precio = ?, activo = ?, imagen = ? WHERE id = ?',
      [nombre, descripcion, duracion, precio, activo, imagen, req.params.id]
    );

    const [servicioActualizado] = await pool.execute(
      'SELECT * FROM servicios WHERE id = ?',
      [req.params.id]
    );

    if (servicioActualizado.length === 0) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    res.json(servicioActualizado[0]);
  } catch (error) {
    console.error('Error actualizando servicio:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// DELETE /api/servicios/:id
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM servicios WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    res.json({ mensaje: 'Servicio eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando servicio:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

export default router;