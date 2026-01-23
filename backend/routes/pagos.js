// backend/routes/pagos.js - Version MySQL
import express from 'express';
import mercadopago from 'mercadopago';
import pool from '../config/db.js';

const router = express.Router();

// POST /api/pagos/crear-preferencia
router.post('/crear-preferencia', async (req, res) => {
  try {
    const { turnoId } = req.body;

    const [turnos] = await pool.execute(
      `SELECT 
        t.*,
        s.nombre AS servicio_nombre,
        s.precio AS servicio_precio
       FROM turnos t
       INNER JOIN servicios s ON t.servicio_id = s.id
       WHERE t.id = ?`,
      [turnoId]
    );

    if (turnos.length === 0) {
      return res.status(404).json({ mensaje: 'Turno no encontrado' });
    }

    const turno = turnos[0];

    const preference = {
      items: [
        {
          title: turno.servicio_nombre,
          unit_price: parseFloat(turno.servicio_precio),
          quantity: 1,
          currency_id: 'ARS'
        }
      ],
      payer: {
        name: turno.cliente_nombre,
        phone: {
          number: turno.cliente_telefono
        },
        email: turno.cliente_email || 'cliente@ejemplo.com'
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/confirmacion`,
        failure: `${process.env.FRONTEND_URL}/error`,
        pending: `${process.env.FRONTEND_URL}/pendiente`
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL}/api/pagos/webhook`,
      external_reference: turnoId.toString(),
      statement_descriptor: 'MANICURIA PRO'
    };

    const response = await mercadopago.preferences.create(preference);

    res.json({
      id: response.body.id,
      init_point: response.body.init_point
    });

  } catch (error) {
    console.error('Error creando preferencia:', error);
    res.status(500).json({ mensaje: 'Error al crear preferencia de pago' });
  }
});

// POST /api/pagos/webhook
router.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment') {
      const paymentId = data.id;

      const payment = await mercadopago.payment.findById(paymentId);
      
      const turnoId = payment.body.external_reference;
      const estado = payment.body.status;

      if (estado === 'approved') {
        await pool.execute(
          `UPDATE turnos 
           SET estado = 'pagado',
               pago_id = ?,
               pago_estado = ?,
               pago_monto = ?,
               pago_metodo = ?
           WHERE id = ?`,
          [
            paymentId,
            estado,
            payment.body.transaction_amount,
            payment.body.payment_method_id,
            turnoId
          ]
        );

        console.log(`✅ Pago aprobado para turno ${turnoId}`);
      } else if (estado === 'rejected') {
        await pool.execute(
          `UPDATE turnos SET estado = 'cancelado' WHERE id = ?`,
          [turnoId]
        );
        
        console.log(`❌ Pago rechazado para turno ${turnoId}`);
      }
    }

    res.sendStatus(200);

  } catch (error) {
    console.error('Error en webhook:', error);
    res.sendStatus(500);
  }
});

// GET /api/pagos/verificar/:turnoId
router.get('/verificar/:turnoId', async (req, res) => {
  try {
    const [turnos] = await pool.execute(
      `SELECT 
        t.*,
        s.nombre AS servicio_nombre,
        s.precio AS servicio_precio
       FROM turnos t
       INNER JOIN servicios s ON t.servicio_id = s.id
       WHERE t.id = ?`,
      [req.params.turnoId]
    );
    
    if (turnos.length === 0) {
      return res.status(404).json({ mensaje: 'Turno no encontrado' });
    }

    const turno = turnos[0];

    res.json({
      estado: turno.estado,
      pago: {
        id: turno.pago_id,
        estado: turno.pago_estado,
        monto: turno.pago_monto,
        metodoPago: turno.pago_metodo
      }
    });

  } catch (error) {
    console.error('Error verificando pago:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

export default router;