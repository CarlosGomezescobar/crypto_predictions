import React, { useState, useEffect } from 'react';
import { Line, Bar, Radar, Scatter, Doughnut } from 'react-chartjs-2';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import { 
  prepareLineChartData, 
  prepareBarChartData, 
  preparePredictionChartData,
  prepareTechnicalIndicatorChart,
  prepareCorrelationHeatmap,
  prepareBacktestChart,
  preparePortfolioChart
} from '../utils/chartUtils';
import { useTheme } from '../hooks/useAppState';
import { 
  calculateSMA, 
  calculateEMA, 
  calculateRSI, 
  calculateMACD,
  calculateBollingerBands,
  calculateVolatility,
  calculateCorrelation
} from '../utils/calculationUtils';

interface AdvancedPriceChartProps {
  data: {
    dates: string[];
    open: number[];
    high: number[];
    low: number[];
    close: number[];
    volume: number[];
  };
  symbol: string;
  timeframe: string;
  showVolume?: boolean;
  showSMA?: boolean;
  showEMA?: boolean;
  showBollingerBands?: boolean;
  height?: number;
  width?: number;
  className?: string;
}

/**
 * Gráfico avanzado de precios con indicadores técnicos
 */
export const AdvancedPriceChart: React.FC<AdvancedPriceChartProps> = ({
  data,
  symbol,
  timeframe,
  showVolume = true,
  showSMA = false,
  showEMA = false,
  showBollingerBands = false,
  height = 400,
  width = 800,
  className = ''
}) => {
  const { isDarkMode } = useTheme();
  const [chartData, setChartData] = useState<any>(null);
  const [chartOptions, setChartOptions] = useState<any>(null);

  useEffect(() => {
    if (!data || !data.dates || data.dates.length === 0) return;

    // Preparar indicadores técnicos
    const indicators = [];
    
    if (showSMA) {
      const sma20 = calculateSMA(data.close, 20);
      const sma50 = calculateSMA(data.close, 50);
      
      indicators.push({
        name: 'SMA 20',
        values: sma20,
        color: '#10B981', // verde
        type: 'line',
        yAxisID: 'y'
      });
      
      indicators.push({
        name: 'SMA 50',
        values: sma50,
        color: '#6366F1', // indigo
        type: 'line',
        yAxisID: 'y'
      });
    }
    
    if (showEMA) {
      const ema12 = calculateEMA(data.close, 12);
      const ema26 = calculateEMA(data.close, 26);
      
      indicators.push({
        name: 'EMA 12',
        values: ema12,
        color: '#F59E0B', // ámbar
        type: 'line',
        yAxisID: 'y'
      });
      
      indicators.push({
        name: 'EMA 26',
        values: ema26,
        color: '#EC4899', // rosa
        type: 'line',
        yAxisID: 'y'
      });
    }
    
    if (showBollingerBands) {
      const { upper, middle, lower } = calculateBollingerBands(data.close, 20, 2);
      
      indicators.push({
        name: 'BB Superior',
        values: upper,
        color: '#EF4444', // rojo
        type: 'line',
        yAxisID: 'y'
      });
      
      indicators.push({
        name: 'BB Media',
        values: middle,
        color: '#8B5CF6', // púrpura
        type: 'line',
        yAxisID: 'y'
      });
      
      indicators.push({
        name: 'BB Inferior',
        values: lower,
        color: '#3B82F6', // azul
        type: 'line',
        yAxisID: 'y'
      });
    }

    // Preparar datos para el gráfico
    const { data: chartData, options: chartOptions } = prepareTechnicalIndicatorChart(
      data.dates,
      data.close,
      indicators,
      {
        title: `${symbol} - ${timeframe}`,
        priceLabel: 'Precio',
        priceColor: '#3B82F6', // azul
        showPrice: true,
        showVolume,
        volume: data.volume,
        volumeColor: '#6B7280', // gris
        isDarkMode
      }
    );

    setChartData(chartData);
    setChartOptions(chartOptions);
  }, [data, symbol, timeframe, showVolume, showSMA, showEMA, showBollingerBands, isDarkMode]);

  if (!chartData || !chartOptions) {
    return (
      <div className="flex justify-center items-center" style={{ height, width }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className={`${className}`} style={{ height, width }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

interface TechnicalIndicatorChartProps {
  data: {
    dates: string[];
    close: number[];
    indicator: number[];
  };
  indicatorName: string;
  indicatorColor?: string;
  thresholds?: {
    upper?: number;
    lower?: number;
    upperColor?: string;
    lowerColor?: string;
  };
  height?: number;
  width?: number;
  className?: string;
}

/**
 * Gráfico de indicador técnico con umbrales
 */
export const TechnicalIndicatorChart: React.FC<TechnicalIndicatorChartProps> = ({
  data,
  indicatorName,
  indicatorColor = '#3B82F6',
  thresholds,
  height = 300,
  width = 600,
  className = ''
}) => {
  const { isDarkMode } = useTheme();
  const [chartData, setChartData] = useState<any>(null);
  const [chartOptions, setChartOptions] = useState<any>(null);

  useEffect(() => {
    if (!data || !data.dates || data.dates.length === 0) return;

    // Preparar datos para el gráfico
    const datasets = [
      {
        label: indicatorName,
        data: data.indicator,
        color: indicatorColor,
        fill: false
      }
    ];

    // Añadir líneas de umbral si se especifican
    if (thresholds) {
      if (thresholds.upper !== undefined) {
        datasets.push({
          label: `Umbral Superior (${thresholds.upper})`,
          data: Array(data.dates.length).fill(thresholds.upper),
          color: thresholds.upperColor || '#EF4444', // rojo
          dashed: true
        });
      }
      
      if (thresholds.lower !== undefined) {
        datasets.push({
          label: `Umbral Inferior (${thresholds.lower})`,
          data: Array(data.dates.length).fill(thresholds.lower),
          color: thresholds.lowerColor || '#10B981', // verde
          dashed: true
        });
      }
    }

    const { data: chartData, options: chartOptions } = prepareLineChartData(
      data.dates,
      datasets,
      {
        title: indicatorName,
        yAxisLabel: indicatorName,
        xAxisLabel: 'Fecha',
        isDarkMode
      }
    );

    setChartData(chartData);
    setChartOptions(chartOptions);
  }, [data, indicatorName, indicatorColor, thresholds, isDarkMode]);

  if (!chartData || !chartOptions) {
    return (
      <div className="flex justify-center items-center" style={{ height, width }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className={`${className}`} style={{ height, width }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

interface PredictionComparisonChartProps {
  historicalData: {
    dates: string[];
    prices: number[];
  };
  predictionData: {
    dates: string[];
    prices: number[];
    confidenceInterval?: {
      upper: number[];
      lower: number[];
    };
  };
  symbol: string;
  height?: number;
  width?: number;
  className?: string;
}

/**
 * Gráfico de comparación de predicciones con datos históricos
 */
export const PredictionComparisonChart: React.FC<PredictionComparisonChartProps> = ({
  historicalData,
  predictionData,
  symbol,
  height = 400,
  width = 800,
  className = ''
}) => {
  const { isDarkMode } = useTheme();
  const [chartData, setChartData] = useState<any>(null);
  const [chartOptions, setChartOptions] = useState<any>(null);

  useEffect(() => {
    if (!historicalData || !predictionData) return;

    // Preparar datos para el gráfico
    const { data: chartData, options: chartOptions } = preparePredictionChartData(
      historicalData.dates,
      historicalData.prices,
      predictionData.dates,
      predictionData.prices,
      {
        title: `Predicción de Precios - ${symbol}`,
        yAxisLabel: 'Precio',
        xAxisLabel: 'Fecha',
        historicalLabel: 'Datos Históricos',
        predictionLabel: 'Predicción',
        historicalColor: '#3B82F6', // azul
        predictionColor: '#EF4444', // rojo
        confidenceInterval: predictionData.confidenceInterval,
        isDarkMode
      }
    );

    setChartData(chartData);
    setChartOptions(chartOptions);
  }, [historicalData, predictionData, symbol, isDarkMode]);

  if (!chartData || !chartOptions) {
    return (
      <div className="flex justify-center items-center" style={{ height, width }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className={`${className}`} style={{ height, width }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

interface BacktestResultChartProps {
  backtestData: {
    dates: string[];
    balance: number[];
    trades: {
      date: string;
      type: 'buy' | 'sell';
      price: number;
    }[];
  };
  strategy: string;
  height?: number;
  width?: number;
  className?: string;
}

/**
 * Gráfico de resultados de backtesting
 */
export const BacktestResultChart: React.FC<BacktestResultChartProps> = ({
  backtestData,
  strategy,
  height = 400,
  width = 800,
  className = ''
}) => {
  const { isDarkMode } = useTheme();
  const [chartData, setChartData] = useState<any>(null);
  const [chartOptions, setChartOptions] = useState<any>(null);

  useEffect(() => {
    if (!backtestData) return;

    // Preparar datos para el gráfico
    const { data: chartData, options: chartOptions } = prepareBacktestChart(
      backtestData.dates,
      backtestData.balance,
      backtestData.trades,
      {
        title: `Resultados de Backtesting - ${strategy}`,
        balanceLabel: 'Balance',
        balanceColor: '#3B82F6', // azul
        buyColor: '#10B981', // verde
        sellColor: '#EF4444', // rojo
        isDarkMode
      }
    );

    setChartData(chartData);
    setChartOptions(chartOptions);
  }, [backtestData, strategy, isDarkMode]);

  if (!chartData || !chartOptions) {
    return (
      <div className="flex justify-center items-center" style={{ height, width }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className={`${className}`} style={{ height, width }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

interface PortfolioAllocationChartProps {
  portfolioData: {
    assets: string[];
    allocations: number[];
  };
  height?: number;
  width?: number;
  className?: string;
}

/**
 * Gráfico de asignación de cartera
 */
export const PortfolioAllocationChart: React.FC<PortfolioAllocationChartProps> = ({
  portfolioData,
  height = 300,
  width = 300,
  className = ''
}) => {
  const { isDarkMode } = useTheme();
  const [chartData, setChartData] = useState<any>(null);
  const [chartOptions, setChartOptions] = useState<any>(null);

  useEffect(() => {
    if (!portfolioData) return;

    // Preparar datos para el gráfico
    const { data: chartData, options: chartOptions } = preparePortfolioChart(
      portfolioData.assets,
      portfolioData.allocations,
      {
        title: 'Asignación de Cartera',
        isDarkMode
      }
    );

    setChartData(chartData);
    setChartOptions(chartOptions);
  }, [portfolioData, isDarkMode]);

  if (!chartData || !chartOptions) {
    return (
      <div className="flex justify-center items-center" style={{ height, width }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className={`${className}`} style={{ height, width }}>
      <Doughnut data={chartData} options={chartOptions} />
    </div>
  );
};

interface CorrelationMatrixChartProps {
  correlationData: {
    assets: string[];
    matrix: number[][];
  };
  height?: number;
  width?: number;
  className?: string;
}

/**
 * Gráfico de matriz de correlación
 */
export const CorrelationMatrixChart: React.FC<CorrelationMatrixChartProps> = ({
  correlationData,
  height = 400,
  width = 400,
  className = ''
}) => {
  const { isDarkMode } = useTheme();
  const [chartData, setChartData] = useState<any>(null);
  const [chartOptions, setChartOptions] = useState<any>(null);

  useEffect(() => {
    if (!correlationData) return;

    // Preparar datos para el gráfico
    const { data: chartData, options: chartOptions } = prepareCorrelationHeatmap(
      correlationData.assets,
      correlationData.matrix,
      {
        title: 'Matriz de Correlación',
        isDarkMode
      }
    );

    setChartData(chartData);
    setChartOptions(chartOptions);
  }, [correlationData, isDarkMode]);

  if (!chartData || !chartOptions) {
    return (
      <div className="flex justify-center items-center" style={{ height, width }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Nota: Este gráfico requiere un plugin de heatmap para Chart.js
  // En una implementación real, se usaría un plugin como chartjs-chart-matrix
  return (
    <div className={`${className}`} style={{ height, width }}>
      <div className="flex justify-center items-center h-full">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Matriz de correlación (requiere plugin de heatmap)
        </p>
      </div>
    </div>
  );
};

interface MultiAssetComparisonChartProps {
  data: {
    dates: string[];
    assets: {
      symbol: string;
      prices: number[];
      color?: string;
    }[];
  };
  normalized?: boolean;
  height?: number;
  width?: number;
  className?: string;
}

/**
 * Gráfico de comparación de múltiples activos
 */
export const MultiAssetComparisonChart: React.FC<MultiAssetComparisonChartProps> = ({
  data,
  normalized = true,
  height = 400,
  width = 800,
  className = ''
}) => {
  const { isDarkMode } = useTheme();
  const [chartData, setChartData] = useState<any>(null);
  const [chartOptions, setChartOptions] = useState<any>(null);

  useEffect(() => {
    if (!data || !data.dates || data.dates.length === 0 || !data.assets || data.assets.length === 0) return;

    // Normalizar precios si se solicita
    const datasets = data.assets.map(asset => {
      let prices = [...asset.prices];
      
      if (normalized) {
        const firstPrice = prices[0];
        prices = prices.map(price => (price / firstPrice) * 100);
      }
      
      return {
        label: asset.symbol,
        data: prices,
        color: asset.color,
        fill: false
      };
    });

    // Preparar datos para el gráfico
    const { data: chartData, options: chartOptions } = prepareLineChartData(
      data.dates,
      datasets,
      {
        title: normalized ? 'Comparación de Rendimiento (Base 100)' : 'Comparación de Precios',
        yAxisLabel: normalized ? 'Rendimiento (%)' : 'Precio',
        xAxisLabel: 'Fecha',
        isDarkMode
      }
    );

    setChartData(chartData);
    setChartOptions(chartOptions);
  }, [data, normalized, isDarkMode]);

  if (!chartData || !chartOptions) {
    return (
      <div className="flex justify-center items-center" style={{ height, width }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className={`${className}`} style={{ height, width }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

interface VolumeProfileChartProps {
  data: {
    prices: number[];
    volumes: number[];
  };
  bins?: number;
  height?: number;
  width?: number;
  className?: string;
}

/**
 * Gráfico de perfil de volumen
 */
export const VolumeProfileChart: React.FC<VolumeProfileChartProps> = ({
  data,
  bins = 20,
  height = 400,
  width = 200,
  className = ''
}) => {
  const { isDarkMode } = useTheme();
  const [chartData, setChartData] = useState<any>(null);
  const [chartOptions, setChartOptions] = useState<any>(null);

  useEffect(() => {
    if (!data || !data.prices || data.prices.length === 0) return;

    // Calcular perfil de volumen
    const minPrice = Math.min(...data.prices);
    const maxPrice = Math.max(...data.prices);
    const binSize = (maxPrice - minPrice) / bins;
    
    const volumeProfile: number[] = Array(bins).fill(0);
    const binLabels: string[] = [];
    
    // Crear etiqu
(Content truncated due to size limit. Use line ranges to read in chunks)