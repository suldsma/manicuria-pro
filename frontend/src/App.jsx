import React, { useState, useEffect, useMemo } from 'react';
import { db } from './backend/config/db'; // Verifica que la ruta sea correcta
import { ref, set, onValue, remove } from "firebase/database";
import { 
  Calendar, Clock, CheckCircle, ArrowLeft, 
  Trash2, LayoutDashboard, UserPlus, Lock 
} from 'lucide-react';

const App = () => {
  // --- ESTADOS ---
  const [modoAdmin, setModoAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [autenticado, setAutenticado] = useState(false);
  const [paso, setPaso] = useState(1);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [datosCliente, setDatosCliente] = useState({ nombre: '', email: '', telefono: '' });
  const [turnosReservados, setTurnosReservados] = useState({});

  const servicios = [
    { id: 1, nombre: 'Manicura Clásica', precio: 3500 },
    { id: 2, nombre: 'Esmaltado Semipermanente', precio: 5500 },
    { id: 3, nombre: 'Kapping con Esculpidas', precio: 8000 }
  ];

  const horariosBase = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  // --- CONEXIÓN REAL CON TU FIREBASE ---
  useEffect(() => {
    const turnosRef = ref(db, 'turnos');
    return onValue(turnosRef, (snapshot) => {
      setTurnosReservados(snapshot.val() || {});
    });
  }, []);

  const manejarReserva = async (e) => {
    e.preventDefault();
    const idUnico = `${fechaSeleccionada}_${horaSeleccionada.replace(':', '')}`;
    try {
      await set(ref(db, `turnos/${idUnico}`), {
        ...datosCliente,
        servicio: servicioSeleccionado.nombre,
        precio: servicioSeleccionado.precio,
        fecha: fechaSeleccionada,
        hora: horaSeleccionada
      });
      setPaso(4);
    } catch (err) { alert("Error al conectar con Firebase"); }
  };

  const eliminarTurno = (id) => {
    if(window.confirm("¿Eliminar este turno?")) remove(ref(db, `turnos/${id}`));
  };

  // --- LÓGICA DE INTERFAZ ---
  const fechasDisponibles = useMemo(() => {
    const lista = [];
    for (let i = 0; i < 15; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      if (d.getDay() !== 0) lista.push(d.toISOString().split('T')[0]);
    }
    return lista;
  }, []);

  const loginAdmin = () => {
    if (passwordInput === 'susana2026') setAutenticado(true); // Cambia tu contraseña aquí
    else alert("Contraseña incorrecta");
  };

  return (
    <div className={`min-h-screen p-4 ${modoAdmin ? 'bg-slate-900 text-white' : 'bg-pink-50'}`}>
      <div className="max-w-md mx-auto">
        
        {/* Botón de Acceso Admin */}
        <div className="text-right mb-4">
          <button onClick={() => setModoAdmin(!modoAdmin)} className="text-[10px] opacity-40 uppercase tracking-widest">
            {modoAdmin ? 'Volver' : 'Acceso Staff'}
          </button>
        </div>

        {modoAdmin ? (
          /* --- PANEL ADMINISTRATIVO --- */
          !autenticado ? (
            <div className="bg-slate-800 p-8 rounded-3xl text-center space-y-4">
              <Lock className="mx-auto text-pink-500" />
              <h2 className="font-bold">Panel Protegido</h2>
              <input 
                type="password" 
                placeholder="Palabra secreta"
                className="w-full p-3 rounded-xl bg-slate-700 border-none outline-none"
                onChange={(e) => setPasswordInput(e.target.value)}
              />
              <button onClick={loginAdmin} className="w-full bg-pink-600 p-3 rounded-xl font-bold">Entrar</button>
            </div>
          ) : (
            <div className="space-y-4">
              <h1 className="text-2xl font-black text-pink-400">MIS TURNOS</h1>
              {Object.entries(turnosReservados).map(([id, t]) => (
                <div key={id} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex justify-between items-center">
                  <div>
                    <p className="font-bold">{t.nombre}</p>
                    <p className="text-xs text-pink-400">{t.fecha} - {t.hora}hs</p>
                    <p className="text-[10px] opacity-60">{t.servicio}</p>
                  </div>
                  <button onClick={() => eliminarTurno(id)} className="text-slate-500 hover:text-red-500"><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
          )
        ) : (
          /* --- VISTA CLIENTE --- */
          <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden">
            <div className="bg-pink-500 p-8 text-white text-center">
              <h1 className="text-3xl font-black italic">Nails Studio</h1>
              <p className="text-pink-100 text-sm">Reserva tu lugar ahora</p>
            </div>

            <div className="p-6">
              {paso === 1 && (
                <div className="space-y-4">
                  {servicios.map(s => (
                    <button key={s.id} onClick={() => { setServicioSeleccionado(s); setPaso(2); }} className="w-full p-5 border-2 border-slate-50 rounded-2xl flex justify-between font-bold hover:border-pink-500 transition-all">
                      <span>{s.nombre}</span>
                      <span className="text-pink-600">${s.precio}</span>
                    </button>
                  ))}
                </div>
              )}

              {paso === 2 && (
                <div className="space-y-4">
                  <select onChange={(e) => setFechaSeleccionada(e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl font-bold">
                    <option value="">Selecciona fecha</option>
                    {fechasDisponibles.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <div className="grid grid-cols-3 gap-2">
                    {fechaSeleccionada && horariosBase.map(h => (
                      <button key={h} onClick={() => { setHoraSeleccionada(h); setPaso(3); }} className="p-3 bg-pink-50 text-pink-600 rounded-xl font-bold hover:bg-pink-600 hover:text-white">{h}</button>
                    ))}
                  </div>
                </div>
              )}

              {paso === 3 && (
                <form onSubmit={manejarReserva} className="space-y-4">
                  <input required placeholder="Tu Nombre" className="w-full p-4 bg-slate-50 rounded-xl" onChange={e => setDatosCliente({...datosCliente, nombre: e.target.value})} />
                  <input required type="tel" placeholder="WhatsApp" className="w-full p-4 bg-slate-50 rounded-xl" onChange={e => setDatosCliente({...datosCliente, telefono: e.target.value})} />
                  <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase tracking-widest">Confirmar Reserva</button>
                </form>
              )}

              {paso === 4 && (
                <div className="text-center py-6">
                  <CheckCircle className="mx-auto text-green-500 mb-2" size={48} />
                  <h2 className="text-2xl font-black">¡LISTO!</h2>
                  <p className="text-slate-500">Te esperamos el {fechaSeleccionada}.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;