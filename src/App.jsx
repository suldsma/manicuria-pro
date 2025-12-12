import { useState } from 'react';

import Header from './components/Header';
import Footer from './components/Footer';

import Inicio from './components/Inicio';
import Servicios from './components/Servicios';
import Turnos from './components/Turnos';
import Admin from './components/Admin';
import Contacto from './components/Contacto';

const TURNOS_INICIALES = [
  {
    id: 1,
    nombre: 'María González',
    telefono: '3515551234',
    email: 'maria@example.com',
    fecha: '2024-12-15',
    hora: '10:00',
    servicio: 'Manicura Clásica',
    notas: 'Prefiere colores suaves'
  }
];

function App() {
  const [currentPage, setCurrentPage] = useState('inicio');
  const [turnos, setTurnos] = useState(TURNOS_INICIALES);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50">
      <Header
        currentPage={currentPage}
        navigate={setCurrentPage}
        isAuthenticated={isAuthenticated}
      />

      <main className="container mx-auto px-4 py-8">
        {currentPage === 'inicio' && <Inicio navigate={setCurrentPage} />}
        {currentPage === 'servicios' && <Servicios />}
        {currentPage === 'turnos' && (
          <Turnos turnos={turnos} setTurnos={setTurnos} />
        )}
        {currentPage === 'contacto' && <Contacto />}
        {currentPage === 'admin' && (
          <Admin
            turnos={turnos}
            setTurnos={setTurnos}
            isAuthenticated={isAuthenticated}
            setIsAuthenticated={setIsAuthenticated}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
