// backend/routes/pagos.js
import express from 'express';
import mercadopago from 'mercadopago';
import Turno from '../models/Turno.js';

const router = express.Router();

// POST /api/pagos/crear-preferencia
router.post('/crear-preferencia', async (req, res) => {
  try {
    const { turnoId } = req.body;

    // Buscar el turno
    const turno = await Turno.findById(turnoId).populate('servicio');
    if (!turno) {
      return res.status(404).json({ mensaje: 'Turno no encontrado' });
    }

    // Crear preferencia de pago
    const preference = {
      items: [
        {
          title: turno.servicio.nombre,
          unit_price: turno.servicio.precio,
          quantity: 1,
          currency_id: 'ARS'
        }
      ],
      payer: {
        name: turno.cliente.nombre,
        phone: {
          number: turno.cliente.telefono
        },
        email: turno.cliente.email || 'cliente@ejemplo.com'
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/confirmacion`,
        failure: `${process.env.FRONTEND_URL}/error`,
        pending: `${process.env.FRONTEND_URL}/pendiente`
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL}/api/pagos/webhook`,
      external_reference: turnoId,
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

// POST /api/pagos/webhook (notificaciones de Mercado Pago)
router.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment') {
      const paymentId = data.id;

      // Obtener info del pago
      const payment = await mercadopago.payment.findById(paymentId);
      
      const turnoId = payment.body.external_reference;
      const estado = payment.body.status;

      // Actualizar turno según estado del pago
      if (estado === 'approved') {
        await Turno.findByIdAndUpdate(turnoId, {
          estado: 'pagado',
          pago: {
            id: paymentId,
            estado: estado,
            monto: payment.body.transaction_amount,
            metodoPago: payment.body.payment_method_id
          }
        });

        console.log(`✅ Pago aprobado para turno ${turnoId}`);
      } else if (estado === 'rejected') {
        await Turno.findByIdAndUpdate(turnoId, {
          estado: 'cancelado'
        });
        
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
    const turno = await Turno.findById(req.params.turnoId).populate('servicio');
    
    if (!turno) {
      return res.status(404).json({ mensaje: 'Turno no encontrado' });
    }

    res.json({
      estado: turno.estado,
      pago: turno.pago
    });

  } catch (error) {
    console.error('Error verificando pago:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

export default router;