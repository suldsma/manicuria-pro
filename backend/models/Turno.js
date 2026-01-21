// backend/models/Turno.js
import mongoose from 'mongoose';

const turnoSchema = new mongoose.Schema({
  cliente: {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    telefono: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    }
  },
  servicio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Servicio',
    required: true
  },
  fecha: {
    type: Date,
    required: true
  },
  hora: {
    type: String, // "14:00"
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'pagado', 'confirmado', 'cancelado', 'completado'],
    default: 'pendiente'
  },
  pago: {
    id: String,
    estado: String,
    monto: Number,
    metodoPago: String
  },
  notas: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Índice para búsquedas rápidas por fecha
turnoSchema.index({ fecha: 1, hora: 1 });

export default mongoose.model('Turno', turnoSchema);