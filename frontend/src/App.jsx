import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, DollarSign, User, Menu, X, LogOut } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

// Componente Principal
export default function ManicuriaApp() {
  const [vista, setVista] = useState('cliente');
  const [servicios, setServicios] = useState([]);

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      const res = await fetch(`${API_URL}/servicios`);
      const data = await res.json();
      setServicios(data);
    } catch (error) {
      console.error('Error cargando servicios:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <header className="bg-white shadow-sm border-b-4 border-pink-400">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">💅</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Manicuría PRO</h1>
                <p className="text-sm text-gray-500">Tu belleza, nuestra pasión</p>
              </div>
            </div>
            <button
              onClick={() => setVista(vista === 'cliente' ? 'admin' : 'cliente')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
            >
              {vista === 'cliente' ? '🔐 Admin' : '👥 Cliente'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {vista === 'cliente' ? (
          <VistaCliente servicios={servicios} />
        ) : (
          <VistaAdmin servicios={servicios} onActualizar={cargarServicios} />
        )}
      </main>
    </div>
  );
}

function VistaCliente({ servicios }) {
  const [paso, setPaso] = useState(1);
  const [reserva, setReserva] = useState({
    servicioId: null,
    fecha: '',
    hora: '',
    cliente: { nombre: '', telefono: '', email: '' }
  });
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);

  const servicioSeleccionado = servicios.find(s => s._id === reserva.servicioId);

  const buscarHorarios = async () => {
    if (!reserva.servicioId || !reserva.fecha) return;
    
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/turnos/disponibles?fecha=${reserva.fecha}&servicioId=${reserva.servicioId}`
      );
      const data = await res.json();
      setHorariosDisponibles(data.horarios);
    } catch (error) {
      console.error('Error buscando horarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reserva.fecha && reserva.servicioId) {
      buscarHorarios();
    }
  }, [reserva.fecha, reserva.servicioId]);

  const confirmarReserva = async () => {
    setLoading(true);
    try {
      const resTurno = await fetch(`${API_URL}/turnos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reserva)
      });
      const turno = await resTurno.json();

      const resPago = await fetch(`${API_URL}/pagos/crear-preferencia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turnoId: turno._id })
      });
      const { init_point } = await resPago.json();

      window.location.href = init_point;
    } catch (error) {
      console.error('Error confirmando reserva:', error);
      alert('Error al procesar la reserva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-center mb-8 gap-4">
        {[1, 2, 3, 4].map(num => (
          <div key={num} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              paso >= num ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              {num}
            </div>
            {num < 4 && <div className={`w-16 h-1 ${paso > num ? 'bg-pink-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {paso === 1 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-center">Elegí tu servicio</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {servicios.map(servicio => (
              <div
                key={servicio._id}
                onClick={() => {
                  setReserva({ ...reserva, servicioId: servicio._id });
                  setPaso(2);
                }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-pink-400"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-2">{servicio.nombre}</h3>
                <p className="text-gray-600 mb-4">{servicio.descripcion}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock size={18} />
                    <span>{servicio.duracion} min</span>
                  </div>
                  <div className="text-2xl font-bold text-pink-600">
                    ${servicio.precio.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {paso === 2 && (
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Elegí fecha y hora</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Fecha</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={reserva.fecha}
                onChange={(e) => setReserva({ ...reserva, fecha: e.target.value })}
                className="w-full p-3 border rounded-lg"
              />
            </div>
            
            {loading ? (
              <p className="text-center text-gray-500">Buscando horarios...</p>
            ) : horariosDisponibles.length > 0 ? (
              <div>
                <label className="block text-sm font-medium mb-2">Horarios disponibles</label>
                <div className="grid grid-cols-4 gap-3">
                  {horariosDisponibles.map(hora => (
                    <button
                      key={hora}
                      onClick={() => {
                        setReserva({ ...reserva, hora });
                        setPaso(3);
                      }}
                      className="p-3 border-2 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition"
                    >
                      {hora}
                    </button>
                  ))}
                </div>
              </div>
            ) : reserva.fecha && (
              <p className="text-center text-gray-500">No hay horarios disponibles</p>
            )}
          </div>
        </div>
      )}

      {paso === 3 && (
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Tus datos</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nombre completo"
              value={reserva.cliente.nombre}
              onChange={(e) => setReserva({
                ...reserva,
                cliente: { ...reserva.cliente, nombre: e.target.value }
              })}
              className="w-full p-3 border rounded-lg"
            />
            <input
              type="tel"
              placeholder="Teléfono"
              value={reserva.cliente.telefono}
              onChange={(e) => setReserva({
                ...reserva,
                cliente: { ...reserva.cliente, telefono: e.target.value }
              })}
              className="w-full p-3 border rounded-lg"
            />
            <input
              type="email"
              placeholder="Email (opcional)"
              value={reserva.cliente.email}
              onChange={(e) => setReserva({
                ...reserva,
                cliente: { ...reserva.cliente, email: e.target.value }
              })}
              className="w-full p-3 border rounded-lg"
            />
            <button
              onClick={() => setPaso(4)}
              disabled={!reserva.cliente.nombre || !reserva.cliente.telefono}
              className="w-full py-3 bg-pink-500 text-white rounded-lg font-bold hover:bg-pink-600 disabled:bg-gray-300 transition"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {paso === 4 && servicioSeleccionado && (
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Confirmá tu reserva</h2>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Servicio:</span>
              <span className="font-bold">{servicioSeleccionado.nombre}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Fecha:</span>
              <span className="font-bold">{new Date(reserva.fecha).toLocaleDateString('es-AR')}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Hora:</span>
              <span className="font-bold">{reserva.hora}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Total:</span>
              <span className="text-2xl font-bold text-pink-600">
                ${servicioSeleccionado.precio.toLocaleString()}
              </span>
            </div>
          </div>
          <button
            onClick={confirmarReserva}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-bold text-lg hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'Procesando...' : '💳 Pagar con Mercado Pago'}
          </button>
        </div>
      )}

      {paso > 1 && (
        <button
          onClick={() => setPaso(paso - 1)}
          className="mt-6 px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
        >
          ← Volver
        </button>
      )}
    </div>
  );
}

function VistaAdmin({ servicios, onActualizar }) {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
      } else {
        alert('Credenciales inválidas');
      }
    } catch (error) {
      alert('Error en login');
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">🔐 Login Admin</h2>
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && login()}
              className="w-full p-3 border rounded-lg"
            />
            <button
              onClick={login}
              className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition"
            >
              Ingresar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Panel de Administración</h2>
        <button
          onClick={() => setToken('')}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
        >
          <LogOut size={18} />
          Salir
        </button>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4">Panel Administrativo</h3>
        <div className="space-y-4">
          <div className="p-4 bg-pink-50 rounded-lg">
            <p className="font-semibold text-pink-700 mb-2">Servicios Activos</p>
            <p className="text-3xl font-bold text-pink-600">{servicios.length}</p>
          </div>
          <div className="space-y-2 text-gray-600">
            <p className="font-semibold">Funcionalidades disponibles:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Gestión de turnos diarios</li>
              <li>CRUD de servicios</li>
              <li>Visualización de pagos</li>
              <li>Reportes y estadísticas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}