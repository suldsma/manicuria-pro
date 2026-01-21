// backend/seed.js - Script para cargar datos iniciales
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import Servicio from './models/Servicio.js';

dotenv.config();

const serviciosIniciales = [
  {
    nombre: "Esmaltado Semipermanente",
    descripcion: "Duración de hasta 3 semanas con acabado profesional",
    duracion: 60,
    precio: 7500,
    activo: true,
    imagen: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400"
  },
  {
    nombre: "Manicuría Completa",
    descripcion: "Limado, cutículas, hidratación y esmaltado tradicional",
    duracion: 45,
    precio: 5000,
    activo: true,
    imagen: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400"
  },
  {
    nombre: "Uñas Esculpidas",
    descripcion: "Extensión y diseño personalizado con gel",
    duracion: 90,
    precio: 12000,
    activo: true,
    imagen: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400"
  },
  {
    nombre: "Kapping",
    descripcion: "Refuerzo y alargamiento natural de uñas",
    duracion: 75,
    precio: 9500,
    activo: true,
    imagen: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400"
  },
  {
    nombre: "Retiro de Semipermanente",
    descripcion: "Retiro seguro sin dañar la uña natural",
    duracion: 30,
    precio: 3000,
    activo: true,
    imagen: "https://images.unsplash.com/photo-1583001809398-ea64a785d0f3?w=400"
  },
  {
    nombre: "Nail Art Premium",
    descripcion: "Diseños personalizados y decoración avanzada",
    duracion: 90,
    precio: 15000,
    activo: true,
    imagen: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400"
  }
];

const adminInicial = {
  nombre: "Administrador",
  email: "admin@manicuria.com",
  password: "admin123" // Será hasheado automáticamente por el modelo
};

async function seed() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar colecciones existentes
    console.log('🗑️  Limpiando datos anteriores...');
    await Admin.deleteMany({});
    await Servicio.deleteMany({});

    // Crear admin
    console.log('👤 Creando administrador...');
    const admin = await Admin.create(adminInicial);
    console.log(`✅ Admin creado: ${admin.email}`);

    // Crear servicios
    console.log('💅 Creando servicios...');
    const servicios = await Servicio.insertMany(serviciosIniciales);
    console.log(`✅ ${servicios.length} servicios creados`);

    console.log('\n🎉 SEED COMPLETADO EXITOSAMENTE!\n');
    console.log('📋 RESUMEN:');
    console.log(`   - Admin: ${admin.email}`);
    console.log(`   - Password: admin123`);
    console.log(`   - Servicios: ${servicios.length}`);
    console.log('\n🚀 Ahora podés iniciar el servidor con: npm run dev\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

seed();