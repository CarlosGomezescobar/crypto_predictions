import React, { useEffect } from 'react';
import { useTheme } from '../hooks/useAppState';
import {
  usePrediction,
  useAnalysis,
  useTradingSignals,
} from '../hooks/usePrediction';
import {
  calculateRSI,
  calculateMACD,
  calculateVolatility,
} from '../utils/calculationUtils';
import {
  formatCurrency,
  formatPercent,
  formatDate,
} from '../utils/calculationUtils';
import Card from '../components/Card';
import PriceChart from '../components/PriceChart';
import Table from '../components/Table';
import Alert from '../components/Alerts';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';

/**
 * Vista principal del dashboard
 */
const Dashboard: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const {
    selectedAsset,
    setSelectedAsset,
    selectedTimeFrame,
    setSelectedTimeFrame,
    notifications,
  } = useAppState();

  const {
    historicalData,
    isLoadingHistorical,
    predictionData,
    isPredicting,
    trainModel,
  } = usePrediction(selectedAsset, selectedTimeFrame);

  const { analyzeRisk } = useAnalysis();
  const { signals, generateSignals } = useTradingSignals();

  // Estado local para controlar la generación de señales
  const [isGeneratingSignals, setIsGeneratingSignals] = React.useState(false);

  // Función para entrenar el modelo
  const handleTrainModel = async () => {
    await trainModel();
  };

  // Función para generar señales de trading
  const handleGenerateSignals = async () => {
    setIsGeneratingSignals(true);
    try {
      await generateSignals();
    } catch (error) {
      console.error('Error al generar señales:', error);
    } finally {
      setIsGeneratingSignals(false);
    }
  };

  // Renderizar notificaciones
  const renderNotifications = () => {
    if (!notifications || notifications.length === 0) return null;

    return (
      <div className="mb-4">
        {notifications.map((notification, index) => (
          <Alert
            key={index}
            type={notification.type}
            message={notification.message}
            className="mb-2"
          />
        ))}
      </div>
    );
  };

  // Renderizar pestaña de visión general
  const renderOverviewTab = () => {
    if (isLoadingHistorical) {
      return (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      );
    }

    if (!historicalData || !historicalData.close || historicalData.close.length === 0) {
      return (
        <Alert
          type="warning"
          message="No hay datos históricos disponibles."
          className="mb-4"
        />
      );
    }

    const lastPrice = historicalData.close[historicalData.close.length - 1];
    const volatility = calculateVolatility(historicalData.close);
    const rsi = calculateRSI(historicalData.close);
    const macd = calculateMACD(historicalData.close);

    return (
      <div>
        <Card className="p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Resumen del Mercado
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Precio Actual</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(lastPrice)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Volatilidad</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatPercent(volatility)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">RSI</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {rsi.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Precios Históricos
          </h3>
          <PriceChart
            labels={historicalData.dates}
            prices={historicalData.close}
            title="Precios Históricos"
            height={400}
            width={800}
          />
        </Card>
      </div>
    );
  };

  // Renderizar pestaña de señales de trading
  const renderTradingSignalsTab = () => {
    if (isGeneratingSignals) {
      return (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      );
    }

    if (!signals || signals.length === 0) {
      return (
        <Alert
          type="info"
          message="No hay señales de trading disponibles."
          className="mb-4"
        />
      );
    }

    return (
      <Card className="p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Señales de Trading
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Fecha
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Señal
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Precio
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Confianza
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Indicadores
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {signals.map((signal, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(signal.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {signal.type === 'buy' ? (
                      <span className="text-green-600 font-semibold">COMPRAR</span>
                    ) : signal.type === 'sell' ? (
                      <span className="text-red-600 font-semibold">VENDER</span>
                    ) : (
                      <span className="text-gray-600">NEUTRAL</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatCurrency(signal.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatPercent(signal.confidence / 100)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <ul className="list-disc pl-5 space-y-1">
                      {signal.indicators.map((indicator, idx) => (
                        <li key={idx}>{indicator}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Panel de Control
      </h1>

      {/* Cambiador de tema */}
      <div className="mb-6">
        <Button onClick={toggleTheme}>
          {isDarkMode ? 'Cambiar a Tema Claro' : 'Cambiar a Tema Oscuro'}
        </Button>
      </div>

      {/* Notificaciones */}
      {renderNotifications()}

      {/* Controles */}
      <div className="mb-6">
        <label htmlFor="asset" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Activo
        </label>
        <select
          id="asset"
          value={selectedAsset}
          onChange={(e) => setSelectedAsset(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="BTC">Bitcoin (BTC)</option>
          <option value="ETH">Ethereum (ETH)</option>
          <option value="ADA">Cardano (ADA)</option>
        </select>
      </div>

      <div className="mb-6">
        <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Intervalo de Tiempo
        </label>
        <select
          id="timeframe"
          value={selectedTimeFrame}
          onChange={(e) => setSelectedTimeFrame(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="1d">Diario</option>
          <option value="1w">Semanal</option>
          <option value="1m">Mensual</option>
        </select>
      </div>

      {/* Botones de acción */}
      <div className="flex space-x-4 mb-6">
        <Button onClick={handleTrainModel} disabled={isPredicting}>
          {isPredicting ? 'Entrenando...' : 'Entrenar Modelo'}
        </Button>
        <Button onClick={handleGenerateSignals} disabled={isGeneratingSignals}>
          {isGeneratingSignals ? 'Generando...' : 'Generar Señales'}
        </Button>
      </div>

      {/* Contenido principal */}
      <div>
        {renderOverviewTab()}
        {renderTradingSignalsTab()}
      </div>
    </div>
  );
};

export default Dashboard;