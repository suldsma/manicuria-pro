import React, { useState } from 'react';
import { Mail, Phone, Clock, Calendar, Check } from 'lucide-react';

const Contacto = () => {
  const [formContact, setFormContact] = useState({ nombre: '', email: '', mensaje: '' });
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // aquí podrías integrar envío a API o email.
    setEnviado(true);
    setTimeout(() => {
      setEnviado(false);
      setFormContact({ nombre: '', email: '', mensaje: '' });
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Contacto</h1>
        <p className="text-gray-600">Estamos aquí para ayudarte</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded p-6 shadow">
          <h2 className="text-xl font-bold mb-4">Información de contacto</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Phone />
              <div>
                <div className="font-semibold">Teléfono</div>
                <div className="text-gray-600">+54 351 555-1234 (WhatsApp)</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail />
              <div>
                <div className="font-semibold">Email</div>
                <div className="text-gray-600">info@manicurestudio.com</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock />
              <div>
                <div className="font-semibold">Horarios</div>
                <div className="text-gray-600">Lun - Vie: 9:00 - 20:00 • Sáb: 9:00 - 18:00</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar />
              <div>
                <div className="font-semibold">Dirección</div>
                <div className="text-gray-600">Av. Colón 1234, Córdoba Capital</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-white rounded p-6 shadow">
          <h2 className="text-xl font-bold mb-3">Envíanos un mensaje</h2>

          {enviado && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mb-3 flex items-center">
              <Check className="mr-2" /> Mensaje enviado correctamente
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input required placeholder="Nombre" value={formContact.nombre} onChange={(e) => setFormContact({ ...formContact, nombre: e.target.value })} className="w-full px-3 py-2 border rounded" />
            <input required type="email" placeholder="Email" value={formContact.email} onChange={(e) => setFormContact({ ...formContact, email: e.target.value })} className="w-full px-3 py-2 border rounded" />
            <textarea required rows={4} placeholder="Mensaje" value={formContact.mensaje} onChange={(e) => setFormContact({ ...formContact, mensaje: e.target.value })} className="w-full px-3 py-2 border rounded" />
            <button className="w-full py-2 bg-pink-600 text-white rounded">Enviar Mensaje</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contacto;
