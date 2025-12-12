import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, Check } from 'lucide-react';

const Turnos = ({ turnos, setTurnos }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    fecha: '',
    hora: '',
    servicio: '',
    notas: ''
  });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const servicios = [
    'Manicura Clásica',
    'Esmaltado Permanente',
    'Uñas Esculpidas',
    'Manicura Spa',
    'Retiro de Esmaltado',
    'Nail Art'
  ];

  const horarios = [
    '09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00','19:00'
  ];

  useEffect(() => {
    // limpiar errores cuando cambia formData
    if (Object.keys(errors).length > 0) setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.nombre, formData.telefono, formData.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    const telDigits = formData.telefono.replace(/\D/g, '');
    if (telDigits && !/^\d{10}$/.test(telDigits)) newErrors.telefono = 'Teléfono inválido (10 dígitos)';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.fecha) newErrors.fecha = 'La fecha es requerida';
    if (!formData.hora) newErrors.hora = 'La hora es requerida';
    if (!formData.servicio) newErrors.servicio = 'El servicio es requerido';

    // fecha no anterior a hoy
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const fechaSeleccionada = formData.fecha ? new Date(formData.fecha + 'T00:00:00') : null;
    if (fechaSeleccionada && fechaSeleccionada < hoy) newErrors.fecha = 'La fecha no puede ser anterior a hoy';

    // evitar turno duplicado
    if (formData.fecha && formData.hora) {
      const existe = turnos.find(t => t.fecha === formData.fecha && t.hora === formData.hora);
      if (existe) newErrors.hora = 'Este horario ya está ocupado';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length === 0) {
      const nuevoTurno = { id: Date.now(), ...formData };
      setTurnos(prev => [...prev, nuevoTurno]);
      setFormData({ nombre: '', telefono: '', email: '', fecha: '', hora: '', servicio: '', notas: '' });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Reservar Turno</h1>
        <p className="text-gray-600">Completa el formulario para agendar tu cita</p>
      </div>

      {showSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <Check className="mr-2" />
          <span>¡Turno reservado exitosamente!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow space-y-4">
        <div>
          <label className="block font-semibold mb-2"><User className="inline mr-2" size={16} />Nombre completo *</label>
          <input name="nombre" value={formData.nombre} onChange={handleChange}
            className={`w-full px-3 py-2 border rounded ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`} />
          {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2"><Phone className="inline mr-2" size={16} />Teléfono *</label>
            <input name="telefono" value={formData.telefono} onChange={handleChange}
              placeholder="3515551234" className={`w-full px-3 py-2 border rounded ${errors.telefono ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
          </div>

          <div>
            <label className="block font-semibold mb-2"><Mail className="inline mr-2" size={16} />Email</label>
            <input name="email" value={formData.email} onChange={handleChange}
              placeholder="tu@email.com" className={`w-full px-3 py-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-2"><Calendar className="inline mr-2" size={16} />Servicio *</label>
          <select name="servicio" value={formData.servicio} onChange={handleChange}
            className={`w-full px-3 py-2 border rounded ${errors.servicio ? 'border-red-500' : 'border-gray-300'}`}>
            <option value="">Selecciona un servicio</option>
            {servicios.map((s,i) => <option key={i} value={s}>{s}</option>)}
          </select>
          {errors.servicio && <p className="text-red-500 text-sm mt-1">{errors.servicio}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2"><Calendar className="inline mr-2" size={16} />Fecha *</label>
            <input type="date" name="fecha" value={formData.fecha} onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 border rounded ${errors.fecha ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.fecha && <p className="text-red-500 text-sm mt-1">{errors.fecha}</p>}
          </div>

          <div>
            <label className="block font-semibold mb-2"><Clock className="inline mr-2" size={16} />Hora *</label>
            <select name="hora" value={formData.hora} onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${errors.hora ? 'border-red-500' : 'border-gray-300'}`}>
              <option value="">Selecciona una hora</option>
              {horarios.map((h,i) => <option key={i} value={h}>{h}</option>)}
            </select>
            {errors.hora && <p className="text-red-500 text-sm mt-1">{errors.hora}</p>}
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-2">Notas</label>
          <textarea name="notas" value={formData.notas} onChange={handleChange} rows="3"
            className="w-full px-3 py-2 border rounded border-gray-300" placeholder="Preferencias, colores, alergias..." />
        </div>

        <button type="submit" className="w-full py-3 rounded bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold">Confirmar Turno</button>
      </form>
    </div>
  );
};

export default Turnos;

