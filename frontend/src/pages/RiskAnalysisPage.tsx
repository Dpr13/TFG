import { useState } from 'react';
import { Search, TrendingUp, Loader2 } from 'lucide-react';
import { riskService } from '@services/index';
import { formatPercentage } from '@utils/format';
import type { RiskMetrics } from '../types';

export default function RiskAnalysisPage() {
  const [symbol, setSymbol] = useState('');
  const [riskData, setRiskData] = useState<RiskMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!symbol.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await riskService.calculateRisk(symbol.toUpperCase());
      setRiskData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al calcular riesgo');
      setRiskData(null);
    } finally {
      setLoading(false);
    }
  };

  const RISK_LABELS: Record<string, { label: string; color: string }> = {
    LOW:    { label: 'Bajo',     color: 'text-green-600 dark:text-green-400' },
    MEDIUM: { label: 'Moderado', color: 'text-yellow-600 dark:text-yellow-400' },
    HIGH:   { label: 'Alto',     color: 'text-red-600 dark:text-red-400' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Análisis de Riesgo
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Calcula y visualiza métricas de riesgo para activos financieros
        </p>
      </div>

      {/* Buscador */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Ingresa el símbolo del activo (ej: AAPL, BTC-USD)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading || !symbol.trim()}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
                     disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors
                     flex items-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analizando...</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5" />
                <span>Analizar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Resultados */}
      {riskData && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {riskData.symbol}
                </h3>
                {riskData.period && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {riskData.period.start} — {riskData.period.end} ({riskData.dataPoints} datos)
                  </p>
                )}
              </div>
              <span className={`text-lg font-bold ${RISK_LABELS[riskData.riskLevel]?.color}`}>
                Riesgo {RISK_LABELS[riskData.riskLevel]?.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Volatilidad</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPercentage(riskData.volatility)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sharpe Ratio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {riskData.sharpeRatio !== undefined ? riskData.sharpeRatio.toFixed(2) : 'N/A'}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Max Drawdown</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                -{formatPercentage(riskData.maxDrawdown)}
              </p>
            </div>

            {riskData.valueAtRisk95 !== undefined && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">VaR (95%)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPercentage(riskData.valueAtRisk95)}
                </p>
              </div>
            )}

            {riskData.sortinoRatio !== undefined && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sortino Ratio</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {riskData.sortinoRatio.toFixed(2)}
                </p>
              </div>
            )}

            {riskData.calmarRatio !== undefined && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Calmar Ratio</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {riskData.calmarRatio.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Interpretación de Métricas
            </h4>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
              <li>• <strong>Volatilidad:</strong> Mide la variabilidad de los retornos anualizados. Valores más altos indican mayor riesgo.</li>
              <li>• <strong>Sharpe Ratio:</strong> Retorno ajustado al riesgo. Valores &gt;1 son buenos, &gt;2 son excelentes.</li>
              <li>• <strong>Max Drawdown:</strong> Mayor caída desde un máximo histórico. Indica el peor escenario.</li>
              <li>• <strong>VaR (95%):</strong> Pérdida máxima esperada en un día con 95% de confianza.</li>
              <li>• <strong>Sortino Ratio:</strong> Como Sharpe pero penaliza solo la volatilidad negativa.</li>
              <li>• <strong>Calmar Ratio:</strong> Retorno anual dividido entre el drawdown máximo.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
