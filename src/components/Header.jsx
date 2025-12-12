import { Menu } from 'lucide-react';
import NavLink from './UI/NavLink';

function Header({ currentPage, navigate, isAuthenticated }) {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate('inicio')}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
            Manicure Studio
          </span>
        </div>

        <div className="hidden md:flex space-x-6">
          <NavLink active={currentPage === 'inicio'} onClick={() => navigate('inicio')}>
            Inicio
          </NavLink>

          <NavLink active={currentPage === 'servicios'} onClick={() => navigate('servicios')}>
            Servicios
          </NavLink>

          <NavLink active={currentPage === 'turnos'} onClick={() => navigate('turnos')}>
            Reservar Turno
          </NavLink>

          <NavLink active={currentPage === 'contacto'} onClick={() => navigate('contacto')}>
            Contacto
          </NavLink>

          <NavLink active={currentPage === 'admin'} onClick={() => navigate('admin')}>
            {isAuthenticated ? 'Panel Admin' : 'Admin'}
          </NavLink>
        </div>

        <button className="md:hidden text-pink-600">
          <Menu size={28} />
        </button>
      </nav>
    </header>
  );
}

export default Header;
