// backend/routes/turnos.js
import express from 'express';
import Turno from '../models/Turno.js';
import Servicio from '../models/Servicio.js';
import verificarToken from '../middleware/auth.js';

const router = express.Router();

// GET /api/turnos/disponibles?fecha=2026-02-10&servicioId=xxx
router.get('/disponibles', async (req, res) => {
  try {
    const { fecha, servicioId } = req.query;

    if (!fecha || !servicioId) {
      return res.status(400).json({ mensaje: 'Fecha y servicioId requeridos' });
    }

    // Obtener servicio para saber la duración
    const servicio = await Servicio.findById(servicioId);
    if (!servicio) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    // Buscar turnos ocupados en esa fecha
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    
    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);

    const turnosOcupados = await Turno.find({
      fecha: { $gte: fechaInicio, $lte: fechaFin },
      estado: { $in: ['pagado', 'confirmado'] }
    }).populate('servicio');

    // Generar horarios disponibles (9:00 a 18:00)
    const horariosDisponibles = [];
    const horaInicio = 9;
    const horaFin = 18;

    for (let hora = horaInicio; hora < horaFin; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        const horario = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
        
        // Verificar si está ocupado
        const estaOcupado = turnosOcupados.some(turno => {
          const horasTurno = turno.hora.split(':').map(Number);
          const minutosTurno = horasTurno[0] * 60 + horasTurno[1];
          const minutosHorario = hora * 60 + minuto;
          const duracionTurno = turno.servicio.duracion;
          
          return minutosHorario >= minutosTurno && 
                 minutosHorario < (minutosTurno + duracionTurno);
        });

        if (!estaOcupado) {
          horariosDisponibles.push(horario);
        }
      }
    }

    res.json({ horarios: horariosDisponibles });

  } catch (error) {
    console.error('Error obteniendo horarios:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// POST /api/turnos (crear turno pendiente)
router.post('/', async (req, res) => {
  try {
    const { cliente, servicioId, fecha, hora } = req.body;

    // Validar que el servicio exista
    const servicio = await Servicio.findById(servicioId);
    if (!servicio) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    // Crear turno pendiente (se confirmará después del pago)
    const nuevoTurno = new Turno({
      cliente,
      servicio: servicioId,
      fecha: new Date(fecha),
      hora,
      estado: 'pendiente'
    });

    await nuevoTurno.save();
    await nuevoTurno.populate('servicio');

    res.status(201).json(nuevoTurno);

  } catch (error) {
    console.error('Error creando turno:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// GET /api/turnos (solo admin - ver todos)
router.get('/', verificarToken, async (req, res) => {
  try {
    const { fecha, estado } = req.query;
    const filtro = {};

    if (fecha) {
      const fechaInicio = new Date(fecha);
      fechaInicio.setHours(0, 0, 0, 0);
      
      const fechaFin = new Date(fecha);
      fechaFin.setHours(23, 59, 59, 999);

      filtro.fecha = { $gte: fechaInicio, $lte: fechaFin };
    }

    if (estado) {
      filtro.estado = estado;
    }

    const turnos = await Turno.find(filtro)
      .populate('servicio')
      .sort({ fecha: 1, hora: 1 });

    res.json(turnos);

  } catch (error) {
    console.error('Error obteniendo turnos:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// PUT /api/turnos/:id (actualizar estado - admin)
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const turno = await Turno.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('servicio');

    if (!turno) {
      return res.status(404).json({ mensaje: 'Turno no encontrado' });
    }

    res.json(turno);

  } catch (error) {
    console.error('Error actualizando turno:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// DELETE /api/turnos/:id (cancelar turno - admin)
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const turno = await Turno.findByIdAndUpdate(
      req.params.id,
      { estado: 'cancelado' },
      { new: true }
    );

    if (!turno) {
      return res.status(404).json({ mensaje: 'Turno no encontrado' });
    }

    res.json({ mensaje: 'Turno cancelado exitosamente', turno });

  } catch (error) {
    console.error('Error cancelando turno:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

export default router;