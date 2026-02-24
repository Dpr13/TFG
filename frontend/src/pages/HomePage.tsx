import { Activity, TrendingUp, AlertTriangle, Briefcase } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Bienvenido al Sistema de Análisis de Riesgo Financiero
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Analiza activos financieros y evalúa métricas de riesgo en tiempo real
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Activos Monitoreados</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">150+</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Análisis Realizados</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">1,247</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Alertas Activas</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">3</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Características Principales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="bg-primary-100 dark:bg-primary-900/20 p-2 rounded">
              <Activity className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Monitoreo en Tiempo Real</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Seguimiento continuo de precios y métricas de activos financieros
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-primary-100 dark:bg-primary-900/20 p-2 rounded">
              <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Análisis de Riesgo Avanzado</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cálculo de volatilidad, Sharpe Ratio, VaR y más métricas
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-primary-100 dark:bg-primary-900/20 p-2 rounded">
              <AlertTriangle className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Sistema de Alertas</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Notificaciones automáticas cuando se superan umbrales de riesgo
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-primary-100 dark:bg-primary-900/20 p-2 rounded">
              <Briefcase className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Múltiples Tipos de Activos</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Soporte para acciones, criptomonedas y forex
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
