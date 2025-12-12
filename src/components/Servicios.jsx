import React from 'react';

const Servicios = () => {
  const servicios = [
    { nombre: 'Manicura Clásica', precio: '$3.500', duracion: '45 min', descripcion: 'Limado, pulido, tratamiento de cutículas y esmaltado tradicional.' },
    { nombre: 'Esmaltado Permanente', precio: '$5.500', duracion: '60 min', descripcion: 'Esmaltado semipermanente, duración 2-3 semanas.' },
    { nombre: 'Uñas Esculpidas', precio: '$8.000', duracion: '90 min', descripcion: 'Extensión con gel o acrílico y diseño personalizado.' },
    { nombre: 'Manicura Spa', precio: '$6.500', duracion: '75 min', descripcion: 'Exfoliación, mascarilla hidratante y masaje prolongado.' },
    { nombre: 'Retiro de Esmaltado', precio: '$1.500', duracion: '20 min', descripcion: 'Retiro profesional sin dañar la uña.' },
    { nombre: 'Nail Art', precio: 'Desde $2.000', duracion: 'Variable', descripcion: 'Diseños personalizados con accesorios y sellado profesional.' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Nuestros Servicios</h1>
        <p className="text-gray-600">Elige el tratamiento perfecto para tus manos</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicios.map((s, i) => (
          <div key={i} className="bg-white rounded p-4 shadow hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-bold text-pink-600">{s.nombre}</h3>
              <div className="text-lg font-bold">{s.precio}</div>
            </div>
            <div className="text-sm text-gray-600 mb-2">{s.duracion}</div>
            <p className="text-gray-700 mb-3">{s.descripcion}</p>
            <button className="py-2 px-3 rounded bg-pink-600 text-white">Reservar</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Servicios;
