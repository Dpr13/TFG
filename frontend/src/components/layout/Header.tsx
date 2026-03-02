import { BarChart3, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Análisis de Riesgo Financiero
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Plataforma de análisis y gestión de riesgos
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {user && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700">
                <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                  {user.name}
                </span>
              </div>
            )}
            <Link
              to="/profile"
              className="flex items-center space-x-2 px-3 py-2 rounded-lg
                       text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                       dark:hover:bg-gray-700 transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">Perfil</span>
            </Link>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="flex items-center space-x-2 px-3 py-2 rounded-lg
                       text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600
                       dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
