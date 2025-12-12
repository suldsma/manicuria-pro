import React, { useState, useMemo } from 'react';
import { Search, Edit2, Trash2, X, LogOut } from 'lucide-react';

const Admin = ({ turnos, setTurnos, isAuthenticated, setIsAuthenticated }) => {
  const [credentials, setCredentials] = useState({ usuario: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [editingTurno, setEditingTurno] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const ADMIN_USER = 'admin';
  const ADMIN_PASS = 'admin123';

  const handleLogin = (e) => {
    e.preventDefault();
    if (credentials.usuario === ADMIN_USER && credentials.password === ADMIN_PASS) {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Usuario o contraseña incorrectos');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCredentials({ usuario: '', password: '' });
  };

  const handleDelete = (id) => {
    setTurnos(prev => prev.filter(t => t.id !== id));
    setShowDeleteConfirm(null);
  };

  const handleSaveEdit = () => {
    setTurnos(prev => prev.map(t => t.id === editingTurno.id ? editingTurno : t));
    setEditingTurno(null);
  };

  const turnosFiltrados = useMemo(() => {
    return turnos.filter(turno => {
      const matchSearch = turno.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         turno.telefono.includes(searchTerm) ||
                         turno.servicio.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDate = !filterDate || turno.fecha === filterDate;
      return matchSearch && matchDate;
    }).sort((a,b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));
  }, [turnos, searchTerm, filterDate]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded p-6 shadow">
          <h2 className="text-2xl font-bold mb-4">Panel de Administración</h2>
          {loginError && <div className="bg-red-100 p-3 rounded text-red-700 mb-3">{loginError}</div>}

          <form onSubmit={handleLogin} className="space-y-3">
            <input placeholder="Usuario" value={credentials.usuario}
              onChange={(e) => setCredentials({ ...credentials, usuario: e.target.value })}
              className="w-full px-3 py-2 border rounded" required />
            <input placeholder="Contraseña" type="password" value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-3 py-2 border rounded" required />
            <button className="w-full py-2 bg-pink-600 text-white rounded">Iniciar Sesión</button>
          </form>

          <div className="mt-3 text-sm text-gray-600">Demo: usuario <strong>admin</strong> | pass <strong>admin123</strong></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <button onClick={handleLogout} className="px-3 py-2 rounded bg-gray-200 flex items-center gap-2"><LogOut size={16} />Cerrar sesión</button>
      </div>

      <div className="bg-white rounded p-4 shadow mb-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="p-3 bg-pink-50 rounded">
            <div className="text-sm text-gray-600">Total Turnos</div>
            <div className="text-2xl font-bold text-pink-600">{turnos.length}</div>
          </div>
          <div className="p-3 bg-pink-50 rounded">
            <div className="text-sm text-gray-600">Hoy</div>
            <div className="text-2xl font-bold text-pink-600">{turnos.filter(t => t.fecha === new Date().toISOString().split('T')[0]).length}</div>
          </div>
          <div className="p-3 bg-pink-50 rounded">
            <div className="text-sm text-gray-600">Próximos 7 días</div>
            <div className="text-2xl font-bold text-pink-600">{turnos.filter(t => {
              const fecha = new Date(t.fecha);
              const hoy = new Date();
              hoy.setHours(0,0,0,0);
              const diff = Math.ceil((fecha - hoy) / (1000*60*60*24));
              return diff >= 0 && diff <= 7;
            }).length}</div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar..."
              className="w-full pl-10 pr-3 py-2 border rounded" />
          </div>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="px-3 py-2 border rounded" />
          {(searchTerm || filterDate) && <button onClick={() => { setSearchTerm(''); setFilterDate(''); }} className="px-3 py-2 rounded bg-gray-200">Limpiar</button>}
        </div>
      </div>

      <div className="bg-white rounded p-4 shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-pink-50">
                <th className="p-2">Fecha</th>
                <th className="p-2">Hora</th>
                <th className="p-2">Cliente</th>
                <th className="p-2">Teléfono</th>
                <th className="p-2">Servicio</th>
                <th className="p-2">Notas</th>
                <th className="p-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {turnos.length === 0 && (
                <tr><td colSpan={7} className="p-6 text-center text-gray-500">No hay turnos</td></tr>
              )}
              {turnos.map(t => (
                <tr key={t.id} className="border-b hover:bg-pink-50">
                  <td className="p-2">{new Date(t.fecha).toLocaleDateString('es-AR')}</td>
                  <td className="p-2">{t.hora}</td>
                  <td className="p-2 font-semibold">{t.nombre}</td>
                  <td className="p-2">{t.telefono}</td>
                  <td className="p-2">{t.servicio}</td>
                  <td className="p-2">{t.notas || '-'}</td>
                  <td className="p-2 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => setEditingTurno({ ...t })} title="Editar" className="p-2 rounded hover:bg-gray-100"><Edit2 size={16} /></button>
                      <button onClick={() => setShowDeleteConfirm(t.id)} title="Eliminar" className="p-2 rounded hover:bg-gray-100 text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      {editingTurno && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Editar turno</h3>
              <button onClick={() => setEditingTurno(null)} className="p-2 rounded hover:bg-gray-100"><X size={18} /></button>
            </div>

            <div className="space-y-3">
              <input value={editingTurno.nombre} onChange={(e) => setEditingTurno({ ...editingTurno, nombre: e.target.value })} className="w-full px-3 py-2 border rounded" />

              <div className="grid md:grid-cols-2 gap-3">
                <input value={editingTurno.telefono} onChange={(e) => setEditingTurno({ ...editingTurno, telefono: e.target.value })} className="w-full px-3 py-2 border rounded" />
                <input value={editingTurno.email} onChange={(e) => setEditingTurno({ ...editingTurno, email: e.target.value })} className="w-full px-3 py-2 border rounded" />
              </div>

              <select value={editingTurno.servicio} onChange={(e) => setEditingTurno({ ...editingTurno, servicio: e.target.value })} className="w-full px-3 py-2 border rounded">
                <option>Manicura Clásica</option>
                <option>Esmaltado Permanente</option>
                <option>Uñas Esculpidas</option>
                <option>Manicura Spa</option>
                <option>Retiro de Esmaltado</option>
                <option>Nail Art</option>
              </select>

              <div className="grid md:grid-cols-2 gap-3">
                <input type="date" value={editingTurno.fecha} onChange={(e) => setEditingTurno({ ...editingTurno, fecha: e.target.value })} className="w-full px-3 py-2 border rounded" />
                <select value={editingTurno.hora} onChange={(e) => setEditingTurno({ ...editingTurno, hora: e.target.value })} className="w-full px-3 py-2 border rounded">
                  <option>09:00</option>
                  <option>10:00</option>
                  <option>11:00</option>
                  <option>12:00</option>
                  <option>14:00</option>
                  <option>15:00</option>
                  <option>16:00</option>
                  <option>17:00</option>
                  <option>18:00</option>
                  <option>19:00</option>
                </select>
              </div>

              <textarea rows={3} value={editingTurno.notas} onChange={(e) => setEditingTurno({ ...editingTurno, notas: e.target.value })} className="w-full px-3 py-2 border rounded" />

              <div className="flex gap-3 mt-3">
                <button onClick={handleSaveEdit} className="flex-1 py-2 bg-pink-600 text-white rounded">Guardar cambios</button>
                <button onClick={() => setEditingTurno(null)} className="flex-1 py-2 bg-gray-200 rounded">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded p-6 max-w-md w-full">
            <h4 className="text-lg font-bold mb-2">Confirmar eliminación</h4>
            <p className="text-gray-600 mb-4">¿Seguro que querés eliminar este turno? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 py-2 bg-red-600 text-white rounded">Eliminar</button>
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2 bg-gray-200 rounded">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
