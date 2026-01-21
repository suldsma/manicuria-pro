// backend/models/Servicio.js
import mongoose from 'mongoose';

const servicioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    default: ''
  },
  duracion: {
    type: Number, // en minutos
    required: true,
    min: 15
  },
  precio: {
    type: Number,
    required: true,
    min: 0
  },
  activo: {
    type: Boolean,
    default: true
  },
  imagen: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('Servicio', servicioSchema);