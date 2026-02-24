import { User, Mail, Bell, Shield, Moon } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: 'Usuario TFG',
    email: 'usuario@tfg.com',
    notifications: true,
    darkMode: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí irá la lógica para guardar los cambios
    console.log('Perfil actualizado:', formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Editar Perfil
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona tu configuración personal y preferencias
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Información Personal
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Preferencias */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Preferencias
              </h4>

              {/* Notificaciones */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <Bell className="w-4 h-4 mr-2 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Notificaciones
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Recibir alertas sobre cambios de riesgo
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notifications}
                    onChange={(e) => handleChange('notifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                               peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer 
                               dark:bg-gray-700 peer-checked:after:translate-x-full 
                               peer-checked:after:border-white after:content-[''] after:absolute 
                               after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 
                               after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
                               dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Modo Oscuro */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <Moon className="w-4 h-4 mr-2 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Modo Oscuro
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Activar tema oscuro
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.darkMode}
                    onChange={(e) => handleChange('darkMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                               peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer 
                               dark:bg-gray-700 peer-checked:after:translate-x-full 
                               peer-checked:after:border-white after:content-[''] after:absolute 
                               after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 
                               after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
                               dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                         bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                         rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 
                         rounded-lg hover:bg-blue-700 transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Sección adicional - Información de cuenta */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Información de la Cuenta
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Cuenta creada</span>
              <span className="text-gray-900 dark:text-white font-medium">Enero 2026</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Último acceso</span>
              <span className="text-gray-900 dark:text-white font-medium">Hoy, 10:30 AM</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600 dark:text-gray-400">Tipo de cuenta</span>
              <span className="text-gray-900 dark:text-white font-medium">Usuario TFG</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
