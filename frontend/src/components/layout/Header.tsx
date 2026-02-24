import { BarChart3, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
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
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/profile"
              className="flex items-center space-x-2 px-3 py-2 rounded-lg
                       text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                       dark:hover:bg-gray-700 transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="text-sm font-medium">Perfil</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
