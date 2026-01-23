// backend/server.js - Version MySQL
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mercadopago from 'mercadopago';
import { verificarConexion } from './config/db.js';

// Importar rutas
import authRoutes from './routes/auth.js';
import serviciosRoutes from './routes/servicios.js';
import turnosRoutes from './routes/turnos.js';
import pagosRoutes from './routes/pagos.js';

dotenv.config();

const app = express();

// Configuración de Mercado Pago
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/turnos', turnosRoutes);
app.use('/api/pagos', pagosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'API Manicuría PRO con MySQL funcionando ✅' });
});

// Ruta de salud
app.get('/health', async (req, res) => {
  const dbConectado = await verificarConexion();
  res.json({
    status: 'OK',
    database: dbConectado ? 'MySQL Conectado' : 'MySQL Desconectado',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;

const iniciarServidor = async () => {
  try {
    const conectado = await verificarConexion();
    
    if (!conectado) {
      console.error('❌ No se pudo conectar a MySQL. Verifica las credenciales en .env');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📊 Base de datos: MySQL`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
};

iniciarServidor();

export default app;