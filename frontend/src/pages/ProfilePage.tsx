import { User, Mail, Bell, Moon, Shield, Lock, Save, X, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/auth.service';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { setDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notificationsEnabled: true,
    darkMode: false,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        notificationsEnabled: user.notificationsEnabled,
        darkMode: user.darkMode,
      });
      // Asegurar que el tema visual refleje el estado guardado del usuario al cargar la página
      // por si se cambió y no se llegó a guardar
      setDarkMode(user.darkMode);
    }
  }, [user, setDarkMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setIsLoading(true);

    try {
      const updatedUser = await authService.updateProfile({
        name: formData.name,
        email: formData.email,
        notificationsEnabled: formData.notificationsEnabled,
        darkMode: formData.darkMode,
      });

      updateUser(updatedUser);
      setProfileSuccess('Perfil actualizado correctamente');

      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err: any) {
      setProfileError(err.response?.data?.error || 'Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordSuccess('Contraseña actualizada correctamente');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);

      setTimeout(() => setPasswordSuccess(null), 3000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.error || 'Error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDarkModeToggle = async (value: boolean) => {
    setFormData(prev => ({ ...prev, darkMode: value }));
    setDarkMode(value);
    
    try {
      const updatedUser = await authService.updateProfile({
        ...formData,
        darkMode: value,
      });
      updateUser(updatedUser);
    } catch (err: any) {
      setFormData(prev => ({ ...prev, darkMode: !value }));
      setDarkMode(!value);
      setProfileError('Error al guardar la preferencia de modo oscuro');
    }
  };

  const handlePasswordFieldChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando perfil...</p>
      </div>
    );
  }

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

      {/* Información Personal */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Información Personal
          </h3>

          {/* Mensajes de éxito/error de perfil */}
          {profileSuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center mb-6">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-green-800 dark:text-green-200">{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center mb-6">
              <X className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <span className="text-red-800 dark:text-red-200">{profileError}</span>
            </div>
          )}

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
                required
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
                required
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
                    checked={formData.notificationsEnabled}
                    onChange={(e) => handleChange('notificationsEnabled', e.target.checked)}
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
                    onChange={(e) => handleDarkModeToggle(e.target.checked)}
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
                onClick={() => {
                  if (user) {
                    setFormData({
                      name: user.name,
                      email: user.email,
                      notificationsEnabled: user.notificationsEnabled,
                      darkMode: user.darkMode,
                    });
                    setDarkMode(user.darkMode);
                  }
                  setProfileError(null);
                  setProfileSuccess(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                         bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                         rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 
                         rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50
                         disabled:cursor-not-allowed flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mensajes de éxito/error de contraseña */}
      {passwordSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center">
          <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
          <span className="text-green-800 dark:text-green-200">{passwordSuccess}</span>
        </div>
      )}

      {passwordError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center">
          <X className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
          <span className="text-red-800 dark:text-red-200">{passwordError}</span>
        </div>
      )}

      {/* Seguridad - Cambiar Contraseña */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              Seguridad
            </h3>
            {!showPasswordSection && (
              <button
                onClick={() => {
                  setShowPasswordSection(true);
                  setPasswordError(null);
                  setPasswordSuccess(null);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 
                         dark:hover:text-blue-300 font-medium"
              >
                Cambiar Contraseña
              </button>
            )}
          </div>

          {showPasswordSection && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordFieldChange('currentPassword', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordFieldChange('newPassword', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordFieldChange('confirmPassword', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordSection(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordError(null);
                    setPasswordSuccess(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                           bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                           rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 
                           rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50
                           disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
              </div>
            </form>
          )}

          {!showPasswordSection && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Última actualización de contraseña: {formatDate(user.updatedAt)}
            </p>
          )}
        </div>
      </div>

      {/* Información de la Cuenta */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Información de la Cuenta
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">ID de Usuario</span>
              <span className="text-gray-900 dark:text-white font-mono text-xs">{user.id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Cuenta creada</span>
              <span className="text-gray-900 dark:text-white font-medium">{formatDate(user.createdAt)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Última actualización</span>
              <span className="text-gray-900 dark:text-white font-medium">{formatDate(user.updatedAt)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600 dark:text-gray-400">Estado de la cuenta</span>
              <span className="text-green-600 dark:text-green-400 font-medium flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Activa
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
