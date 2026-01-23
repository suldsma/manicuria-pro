// backend/routes/turnos.js - Version MySQL
import express from 'express';
import pool from '../config/db.js';
import verificarToken from '../middleware/auth.js';

const router = express.Router();

// GET /api/turnos/disponibles
router.get('/disponibles', async (req, res) => {
  try {
    const { fecha, servicioId } = req.query;

    if (!fecha || !servicioId) {
      return res.status(400).json({ mensaje: 'Fecha y servicioId requeridos' });
    }

    const [servicios] = await pool.execute(
      'SELECT duracion FROM servicios WHERE id = ?',
      [servicioId]
    );

    if (servicios.length === 0) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    const duracionServicio = servicios[0].duracion;

    const [turnosOcupados] = await pool.execute(
      `SELECT t.hora, s.duracion 
       FROM turnos t
       INNER JOIN servicios s ON t.servicio_id = s.id
       WHERE t.fecha = ? 
       AND t.estado IN ('pagado', 'confirmado')
       ORDER BY t.hora`,
      [fecha]
    );

    const horariosDisponibles = [];
    const horaInicio = 9;
    const horaFin = 18;

    for (let hora = horaInicio; hora < horaFin; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        const horario = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
        const minutosHorario = hora * 60 + minuto;

        const estaOcupado = turnosOcupados.some(turno => {
          const [h, m] = turno.hora.split(':').map(Number);
          const minutosTurno = h * 60 + m;
          const duracionTurno = turno.duracion;

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

// POST /api/turnos
router.post('/', async (req, res) => {
  try {
    const { cliente, servicioId, fecha, hora } = req.body;

    const [servicios] = await pool.execute(
      'SELECT * FROM servicios WHERE id = ?',
      [servicioId]
    );

    if (servicios.length === 0) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    const [result] = await pool.execute(
      `INSERT INTO turnos (cliente_nombre, cliente_telefono, cliente_email, servicio_id, fecha, hora, estado) 
       VALUES (?, ?, ?, ?, ?, ?, 'pendiente')`,
      [cliente.nombre, cliente.telefono, cliente.email || null, servicioId, fecha, hora]
    );

    const [turnoCreado] = await pool.execute(
      `SELECT 
        t.*,
        s.nombre AS servicio_nombre,
        s.precio AS servicio_precio,
        s.duracion AS servicio_duracion
       FROM turnos t
       INNER JOIN servicios s ON t.servicio_id = s.id
       WHERE t.id = ?`,
      [result.insertId]
    );

    const turno = {
      _id: turnoCreado[0].id,
      cliente: {
        nombre: turnoCreado[0].cliente_nombre,
        telefono: turnoCreado[0].cliente_telefono,
        email: turnoCreado[0].cliente_email
      },
      servicio: {
        _id: turnoCreado[0].servicio_id,
        nombre: turnoCreado[0].servicio_nombre,
        precio: turnoCreado[0].servicio_precio,
        duracion: turnoCreado[0].servicio_duracion
      },
      fecha: turnoCreado[0].fecha,
      hora: turnoCreado[0].hora,
      estado: turnoCreado[0].estado
    };

    res.status(201).json(turno);

  } catch (error) {
    console.error('Error creando turno:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// GET /api/turnos
router.get('/', verificarToken, async (req, res) => {
  try {
    const { fecha, estado } = req.query;
    let query = `
      SELECT 
        t.*,
        s.nombre AS servicio_nombre,
        s.precio AS servicio_precio
      FROM turnos t
      INNER JOIN servicios s ON t.servicio_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (fecha) {
      query += ' AND t.fecha = ?';
      params.push(fecha);
    }

    if (estado) {
      query += ' AND t.estado = ?';
      params.push(estado);
    }

    query += ' ORDER BY t.fecha, t.hora';

    const [turnos] = await pool.execute(query, params);
    res.json(turnos);

  } catch (error) {
    console.error('Error obteniendo turnos:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// PUT /api/turnos/:id
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const updates = [];
    const params = [];

    if (req.body.estado) {
      updates.push('estado = ?');
      params.push(req.body.estado);
    }
    if (req.body.notas !== undefined) {
      updates.push('notas = ?');
      params.push(req.body.notas);
    }

    if (updates.length === 0) {
      return res.status(400).json({ mensaje: 'No hay datos para actualizar' });
    }

    params.push(req.params.id);

    await pool.execute(
      `UPDATE turnos SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const [turnoActualizado] = await pool.execute(
      `SELECT t.*, s.nombre AS servicio_nombre 
       FROM turnos t
       INNER JOIN servicios s ON t.servicio_id = s.id
       WHERE t.id = ?`,
      [req.params.id]
    );

    if (turnoActualizado.length === 0) {
      return res.status(404).json({ mensaje: 'Turno no encontrado' });
    }

    res.json(turnoActualizado[0]);

  } catch (error) {
    console.error('Error actualizando turno:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// DELETE /api/turnos/:id
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    await pool.execute(
      `UPDATE turnos SET estado = 'cancelado' WHERE id = ?`,
      [req.params.id]
    );

    const [turno] = await pool.execute(
      'SELECT * FROM turnos WHERE id = ?',
      [req.params.id]
    );

    if (turno.length === 0) {
      return res.status(404).json({ mensaje: 'Turno no encontrado' });
    }

    res.json({ mensaje: 'Turno cancelado exitosamente', turno: turno[0] });

  } catch (error) {
    console.error('Error cancelando turno:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

export default router;