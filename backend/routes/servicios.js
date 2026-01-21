// backend/routes/servicios.js
import express from 'express';
import Servicio from '../models/Servicio.js';
import verificarToken from '../middleware/auth.js';

const router = express.Router();

// GET /api/servicios (público)
router.get('/', async (req, res) => {
  try {
    const servicios = await Servicio.find({ activo: true });
    res.json(servicios);
  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// GET /api/servicios/:id (público)
router.get('/:id', async (req, res) => {
  try {
    const servicio = await Servicio.findById(req.params.id);
    if (!servicio) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }
    res.json(servicio);
  } catch (error) {
    console.error('Error obteniendo servicio:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// POST /api/servicios (protegido - solo admin)
router.post('/', verificarToken, async (req, res) => {
  try {
    const { nombre, descripcion, duracion, precio, imagen } = req.body;

    const nuevoServicio = new Servicio({
      nombre,
      descripcion,
      duracion,
      precio,
      imagen
    });

    await nuevoServicio.save();
    res.status(201).json(nuevoServicio);

  } catch (error) {
    console.error('Error creando servicio:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// PUT /api/servicios/:id (protegido - solo admin)
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const servicio = await Servicio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!servicio) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    res.json(servicio);

  } catch (error) {
    console.error('Error actualizando servicio:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// DELETE /api/servicios/:id (protegido - solo admin)
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const servicio = await Servicio.findByIdAndDelete(req.params.id);
    
    if (!servicio) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    res.json({ mensaje: 'Servicio eliminado exitosamente' });

  } catch (error) {
    console.error('Error eliminando servicio:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

export default router;