import React, { useState, useEffect } from 'react';
import { Card, Button, Alert } from '../components/';
import { 
  AdvancedPriceChart, 
  TechnicalIndicatorChart, 
  PredictionComparisonChart,
  BacktestResultChart,
  PortfolioAllocationChart,
  MultiAssetComparisonChart,
  MarketSentimentChart,
  OnChainMetricsChart,
  RiskAnalysisChart
} from '../components/AdvancedCharts';
import { 
  ThemeSwitcher, 
  TimeFrameSelector, 
  AssetSelector, 
  StatCard, 
  TrendIndicator,
  ModelTrainingForm
} from '../components/AdvancedUI';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAppState, useTheme } from '../hooks/useAppState';
import { usePrediction } from '../hooks/usePrediction';
import { useAnalysis } from '../hooks/useAnalysis';
import { calculateRSI, calculateMACD, calculateVolatility } from '../utils/calculationUtils';
import { formatCurrency, formatPercent, formatDate } from '../utils/calculationUtils';

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
    notifications
  } = useAppState();
  const { 
    historicalData, 
    isLoadingHistorical, 
    predictionData, 
    isPredicting,
    trainModel,
    modelMetrics,
    trainingOptions,
    updateTrainingOptions
  } = usePrediction();
  const {
    technicalAnalysis,
    fundamentalAnalysis,
    riskMetrics,
    backtestResults,
    marketSentiment,
    runBacktest,
    isRunningBacktest
  } = useAnalysis();

  // Estado local para controlar las pestañas
  const [activeTab, setActiveTab] = useState<'overview' | 'prediction' | 'analysis' | 'risk'>('overview');
  
  // Opciones para selector de activos
  const cryptoAssets = [
    { symbol: 'BTC/USDT', name: 'Bitcoin', logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
    { symbol: 'ETH/USDT', name: 'Ethereum', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
    { symbol: 'BNB/USDT', name: 'Binance Coin', logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png' },
    { symbol: 'ADA/USDT', name: 'Cardano', logo: 'https://cryptologos.cc/logos/cardano-ada-logo.png' },
    { symbol: 'SOL/USDT', name: 'Solana', logo: 'https://cryptologos.cc/logos/solana-sol-logo.png' },
    { symbol: 'XRP/USDT', name: 'Ripple', logo: 'https://cryptologos.cc/logos/xrp-xrp-logo.png' },
    { symbol: 'DOT/USDT', name: 'Polkadot', logo: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png' },
    { symbol: 'DOGE/USDT', name: 'Dogecoin', logo: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png' }
  ];
  
  // Opciones para selector de intervalo de tiempo
  const timeFrames = [
    { id: '1h', label: '1H', value: '1h', description: 'Intervalo de 1 hora' },
    { id: '4h', label: '4H', value: '4h', description: 'Intervalo de 4 horas' },
    { id: '1d', label: '1D', value: '1d', description: 'Intervalo de 1 día' },
    { id: '1w', label: '1W', value: '1w', description: 'Intervalo de 1 semana' },
    { id: '1M', label: '1M', value: '1M', description: 'Intervalo de 1 mes' }
  ];

  // Calcular indicadores técnicos si hay datos históricos
  const [technicalIndicators, setTechnicalIndicators] = useState<{
    rsi: number[];
    macd: { macd: number[]; signal: number[]; histogram: number[] };
    volatility: number;
  } | null>(null);

  useEffect(() => {
    if (historicalData && historicalData.close && historicalData.close.length > 0) {
      const rsi = calculateRSI(historicalData.close);
      const macd = calculateMACD(historicalData.close);
      const volatility = calculateVolatility(historicalData.close);
      
      setTechnicalIndicators({ rsi, macd, volatility });
    }
  }, [historicalData]);

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
          message="No hay datos históricos disponibles. Por favor, seleccione otro activo o intervalo de tiempo." 
        />
      );
    }

    const currentPrice = historicalData.close[historicalData.close.length - 1];
    const previousPrice = historicalData.close[historicalData.close.length - 2];
    const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;
    
    // Determinar tendencia basada en RSI y MACD
    let trend: 'up' | 'down' | 'sideways' = 'sideways';
    let trendStrength = 0.5;
    
    if (technicalIndicators) {
      const lastRsi = technicalIndicators.rsi[technicalIndicators.rsi.length - 1];
      const lastMacd = technicalIndicators.macd.histogram[technicalIndicators.macd.histogram.length - 1];
      
      if (lastRsi > 60 && lastMacd > 0) {
        trend = 'up';
        trendStrength = Math.min(0.9, 0.5 + (lastRsi - 60) / 80);
      } else if (lastRsi < 40 && lastMacd < 0) {
        trend = 'down';
        trendStrength = Math.min(0.9, 0.5 + (40 - lastRsi) / 80);
      } else {
        trend = 'sideways';
        trendStrength = Math.max(0.1, 1 - Math.abs(lastRsi - 50) / 50);
      }
    }

    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard 
            title="Precio Actual" 
            value={formatCurrency(currentPrice, 'USD')} 
            change={priceChange} 
          />
          
          <StatCard 
            title="Volumen 24h" 
            value={formatCurrency(historicalData.volume[historicalData.volume.length - 1], 'USD', 0)} 
          />
          
          <StatCard 
            title="Volatilidad" 
            value={technicalIndicators ? `${technicalIndicators.volatility.toFixed(2)}%` : 'N/A'} 
          />
        </div>
        
        <div className="mb-6">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Tendencia del Mercado</h3>
              <TrendIndicator 
                direction={trend} 
                strength={trendStrength} 
              />
            </div>
            
            <AdvancedPriceChart 
              data={historicalData} 
              symbol={selectedAsset} 
              timeframe={selectedTimeFrame}
              showVolume={true}
              showSMA={true}
              showBollingerBands={true}
              height={400}
              className="w-full"
            />
          </Card>
        </div>
        
        {marketSentiment && (
          <div className="mb-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Sentimiento del Mercado</h3>
              <MarketSentimentChart 
                data={marketSentiment.history}
                height={250}
                className="w-full"
              />
              <div className="mt-4 flex items-center">
                <div className="mr-6">
                  <span className="block text-sm text-gray-500 dark:text-gray-400">Índice Actual</span>
                  <span className="text-2xl font-bold">{marketSentiment.current.fearGreedIndex}</span>
                </div>
                <div className="mr-6">
                  <span className="block text-sm text-gray-500 dark:text-gray-400">Categoría</span>
                  <span className="text-lg font-medium">{marketSentiment.current.fearGreedCategory}</span>
                </div>
                <div>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">Tendencia</span>
                  <span className={`text-lg font-medium ${
                    marketSentiment.current.marketTrend === 'bullish' 
                      ? 'text-green-600 dark:text-green-400' 
                      : marketSentiment.current.marketTrend === 'bearish'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {marketSentiment.current.marketTrend === 'bullish' 
                      ? 'Alcista' 
                      : marketSentiment.current.marketTrend === 'bearish'
                        ? 'Bajista'
                        : 'Neutral'
                    }
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}
        
        {technicalIndicators && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">RSI</h3>
              <TechnicalIndicatorChart 
                data={{
                  dates: historicalData.dates,
                  close: historicalData.close,
                  indicator: technicalIndicators.rsi
                }}
                indicatorName="RSI"
                indicatorColor="#8B5CF6"
                thresholds={{
                  upper: 70,
                  lower: 30,
                  upperColor: '#EF4444',
                  lowerColor: '#10B981'
                }}
                height={250}
                className="w-full"
              />
            </Card>
            
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">MACD</h3>
              <TechnicalIndicatorChart 
                data={{
                  dates: historicalData.dates,
                  close: historicalData.close,
                  indicator: technicalIndicators.macd.histogram
                }}
                indicatorName="MACD Histograma"
                indicatorColor="#EC4899"
                height={250}
                className="w-full"
              />
            </Card>
          </div>
        )}
      </div>
    );
  };

  // Renderizar pestaña de predicción
  const renderPredictionTab = () => {
    return (
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Predicción de Precios</h3>
              
              {isPredicting ? (
                <div className="flex justify-center items-center h-64">
                  <LoadingSpinner size="large" />
                </div>
              ) : predictionData ? (
                <PredictionComparisonChart 
                  historicalData={{
                    dates: historicalData.dates.slice(-30),
                    prices: historicalData.close.slice(-30)
                  }}
                  predictionData={{
                    dates: predictionData.dates,
                    prices: predictionData.predictions,
                    confidenceInterval: predictionData.confidenceInterval
                  }}
                  symbol={selectedAsset}
                  height={350}
                  className="w-full"
                />
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No hay predicciones disponibles. Entrene el modelo para generar predicciones.
                  </p>
                </div>
              )}
              
              {modelMetrics && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">Error (RMSE)</span>
                    <span className="text-lg font-medium">{modelMetrics.rmse.toFixed(4)}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">Error (MAE)</span>
                    <span className="text-lg font-medium">{modelMetrics.mae.toFixed(4)}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">R²</span>
                    <span className="text-lg font-medium">{modelMetrics.r2.toFixed(4)}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">Épocas</span>
                    <span className="text-lg font-medium">{modelMetrics.epochs}</span>
                  </div>
                </div>
              )}
            </Card>
          </div>
          
          <div>
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Entrenamiento del Modelo</h3>
              
              <ModelTrainingForm 
                options={trainingOptions}
                onUpdateOptions={updateTrainingOptions}
                onTrain={trainModel}
                isTraining={isPredicting}
              />
              
              {modelMetrics && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Último Entrenamiento</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Fecha: {formatDate(modelMetrics.trainedAt, 'full')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tiempo de entrenamiento: {modelMetrics.trainingTime.toFixed(2)} segundos
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
        
        {predictionData && predictionData.tradingSignals && (
          <Card className="p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Señales de Trading</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Señal
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Precio
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Confianza
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Indicadores
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {predictionData.tradingSignals.map((signal, index) => (
              
(Content truncated due to size limit. Use line ranges to read in chunks)