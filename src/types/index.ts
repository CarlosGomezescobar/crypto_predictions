// Definición de tipos para el sistema de predicción de criptomonedas
// Este archivo centraliza todas las interfaces y tipos utilizados en la aplicación

// Tipos básicos para datos de criptomonedas
export interface CryptoAsset {
  symbol: string;
  name: string;
  logo?: string;
  description?: string;
  category: string;
}

export interface TimeFrame {
  id: string;
  label: string;
  value: string;
  description: string;
}

// Datos OHLCV (Open, High, Low, Close, Volume)
export interface OHLCVData {
  dates: string[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
  timestamp?: number[];
}
export type PriceData = {
  date: Date;
  price: number;
  volume?: number; // Volumen es opcional
};
// export const createPriceData = (
//   date: Date,
//   price: number,
//   volume?: number
// ): PriceData | null => {
//   // Validar que el precio sea un número positivo
//   if (typeof price !== 'number' || price <= 0) {
//     console.error('El precio debe ser un número positivo.');
//     return null;
//   }

//   // Validar que la fecha sea válida
//   if (!(date instanceof Date) || isNaN(date.getTime())) {
//     console.error('La fecha proporcionada no es válida.');
//     return null;
//   }

//   // Validar que el volumen, si está presente, sea un número positivo
//   if (volume !== undefined && (typeof volume !== 'number' || volume < 0)) {
//     console.error('El volumen debe ser un número positivo o cero.');
//     return null;
//   }

//   // Retornar el objeto PriceData validado
//   return {
//     date,
//     price,
//     volume,
//   };
// };
// Interfaces para análisis técnico
export interface TechnicalIndicator {
  name: string;
  value: string | number;
  signal: 'buy' | 'sell' | 'neutral';
  description?: string;
}

export interface TechnicalAnalysisResult {
  trend: 'bullish' | 'bearish' | 'neutral';
  trendStrength: number;
  supportLevel: number;
  resistanceLevel: number;
  indicators: TechnicalIndicator[];
  patterns?: ChartPattern[];
  fibonacciLevels?: FibonacciLevels;
}

export interface ChartPattern {
  type: string;
  startIndex: number;
  endIndex: number;
  significance: number;
  description: string;
}

export interface FibonacciLevels {
  high: number;
  low: number;
  levels: {
    level: number;
    price: number;
  }[];
}

export interface SupportResistanceLevel {
  price: number;
  strength: number;
  type: 'support' | 'resistance';
  touchCount: number;
}

// Interfaces para análisis fundamental
export interface OnChainData {
  dates: string[];
  activeAddresses: number[];
  exchangeReserves: number[];
  hashRate?: number[];
  transactionCount?: number[];
  fees?: number[];
}

export interface DevelopmentMetrics {
  githubActivity: number;
  githubActivityChange: number;
  commits: number;
  commitsChange: number;
  developers: number;
  lastUpdate: string;
}

export interface AdoptionMetrics {
  dailyTransactions: number;
  dailyTransactionsChange: number;
  newAddresses: number;
  newAddressesChange: number;
  googleTrends: number;
  googleTrendsChange: number;
}

export interface CryptoEvent {
  date: string;
  title: string;
  description?: string;
  category: string;
  source: string;
  impact?: 'high' | 'medium' | 'low';
}

export interface FundamentalAnalysisResult {
  onChainData: OnChainData;
  development: DevelopmentMetrics;
  adoption: AdoptionMetrics;
  events: CryptoEvent[];
  marketCap?: number;
  circulatingSupply?: number;
  totalSupply?: number;
}

// Interfaces para predicción
export interface PredictionResult {
  dates: string[];
  predictions: number[];
  confidenceInterval?: {
    upper: number[];
    lower: number[];
  };
  accuracy?: number;
  tradingSignals?: TradingSignal[];
}

export interface ModelMetrics {
  rmse: number;
  mae: number;
  r2: number;
  epochs: number;
  trainedAt: string;
  trainingTime: number;
}

export interface TrainingOptions {
  epochs: number;
  learningRate: number;
  batchSize: number;
  splitRatio: number;
  windowSize: number;
  features: string[];
  modelType: 'lstm' | 'gru' | 'cnn' | 'transformer';
}
export const ModelTrainingOptions = (options: Partial<TrainingOptions>): TrainingOptions => {
  // Valores predeterminados
  const defaultOptions: TrainingOptions = {
    epochs: 100,
    learningRate: 0.001,
    batchSize: 32,
    splitRatio: 0.8,
    windowSize: 14,
    features: ['close', 'volume', 'rsi', 'macd'],
    modelType: 'lstm',
  };

  // Validar y combinar las opciones proporcionadas con los valores predeterminados
  const validatedOptions: TrainingOptions = {
    ...defaultOptions,
    ...options,
  };

  // Validaciones adicionales
  if (validatedOptions.epochs <= 0) {
    console.warn('El número de épocas debe ser mayor que cero. Usando valor predeterminado.');
    validatedOptions.epochs = defaultOptions.epochs;
  }

  if (validatedOptions.batchSize <= 0) {
    console.warn('El tamaño del lote debe ser mayor que cero. Usando valor predeterminado.');
    validatedOptions.batchSize = defaultOptions.batchSize;
  }

  if (validatedOptions.splitRatio < 0 || validatedOptions.splitRatio > 1) {
    console.warn('La proporción de división debe estar entre 0 y 1. Usando valor predeterminado.');
    validatedOptions.splitRatio = defaultOptions.splitRatio;
  }

  if (validatedOptions.windowSize <= 0) {
    console.warn('El tamaño de la ventana debe ser mayor que cero. Usando valor predeterminado.');
    validatedOptions.windowSize = defaultOptions.windowSize;
  }

  if (!['lstm', 'gru', 'cnn', 'transformer'].includes(validatedOptions.modelType)) {
    console.warn('Tipo de modelo no válido. Usando valor predeterminado.');
    validatedOptions.modelType = defaultOptions.modelType;
  }

  return validatedOptions;
};
export interface TradingSignal {
  date: string;
  type: 'buy' | 'sell' | 'hold';
  price: number;
  confidence: number;
  indicators: string[];
  description?: string;
}

// Interfaces para backtesting
export interface BacktestResult {
  dates: string[];
  balance: number[];
  trades: Trade[];
  strategy: string;
  metrics: BacktestMetrics;
}

export interface Trade {
  date: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  profit?: number;
  profitPercentage?: number;
}

export interface BacktestMetrics {
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  averageProfit: number;
  averageLoss: number;
}

// Interfaces para gestión de riesgo
export interface RiskMetrics {
  volatility: number;
  volatilityChange: number;
  maxDrawdown: number;
  sharpeRatio: number;
  sharpeRatioChange: number;
  correlation: number;
  liquidity: number;
  sentiment: number;
  positionSizing: {
    recommended: number;
    conservative: number;
    aggressive: number;
  };
  stopLoss: {
    price: number;
    percentage: number;
  };
  takeProfit: {
    price: number;
    percentage: number;
  };
  riskRewardRatio: number;
  correlations: {
    asset: string;
    value: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }[];
  portfolioAllocation: {
    asset: string;
    percentage: number;
    reason: string;
  }[];
  portfolioMetrics: {
    expectedReturn: number;
    volatility: number;
    sharpeRatio: number;
    diversification: number;
  };
}

// Interfaces para sentimiento de mercado
export interface MarketSentiment {
  current: {
    fearGreedIndex: number;
    fearGreedCategory: string;
    marketTrend: 'bullish' | 'bearish' | 'neutral';
    socialMediaSentiment: number;
    newsSentiment: number;
  };
  history: {
    dates: string[];
    fearGreedIndex: number[];
    socialMediaSentiment?: number[];
    newsSentiment?: number[];
  };
}

// Interfaces para noticias y eventos
export interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  relevance: number;
  summary?: string;
}

// Interfaces para estado de la aplicación
export interface AppState {
  selectedAsset: string;
  selectedTimeFrame: string;
  isDarkMode: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  read: boolean;
}

// Interfaces para componentes de UI
export interface ChartOptions {
  showVolume?: boolean;
  showSMA?: boolean;
  showEMA?: boolean;
  showBollingerBands?: boolean;
  showRSI?: boolean;
  showMACD?: boolean;
  height?: number;
  width?: string;
  theme?: 'light' | 'dark';
}

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: <K extends keyof T>(value: T[K], row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

// Interfaces para servicios API
export interface ApiResponse<T> {
  data: T;
  status: number;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}
export interface RiskAnalysis {
  entryPrice: number;
  stopLoss: number;
  takeProfits: number[];
  positionSize: number;
  maxDrawdown: number;
  kellyPercentage: number;
  riskRewardRatios: number[];
  tpProbabilities: number[];
  consecutiveLosses: number;
  riskPerShare: number;
}

export interface UserSettings {
  defaultSymbol: string;
  defaultTimeframe: string;
  predictionDays: number;
  theme: 'light' | 'dark';
  showAdvancedOptions: boolean;
  autoRefreshInterval: number | null; // Intervalo en minutos
  favoriteAssets: string[]; // Lista de activos favoritos
}


export const createUserSettings = (settings: Partial<UserSettings>): UserSettings => {
  // Valores predeterminados
  const defaultSettings: UserSettings = {
    defaultSymbol: 'BTC/USDT',
    defaultTimeframe: '1d',
    predictionDays: 30,
    theme: 'light',
    showAdvancedOptions: false,
    autoRefreshInterval: null,
    favoriteAssets: ['BTC/USDT', 'ETH/USDT'],
  };

  // Validar y combinar las opciones proporcionadas con los valores predeterminados
  const validatedSettings: UserSettings = {
    ...defaultSettings,
    ...settings,
  };

  // Validaciones adicionales
  if (!['light', 'dark'].includes(validatedSettings.theme)) {
    console.warn('Tema no válido. Usando valor predeterminado.');
    validatedSettings.theme = defaultSettings.theme;
  }

  if (validatedSettings.predictionDays <= 0) {
    console.warn('El número de días de predicción debe ser mayor que cero. Usando valor predeterminado.');
    validatedSettings.predictionDays = defaultSettings.predictionDays;
  }

  if (validatedSettings.autoRefreshInterval !== null && validatedSettings.autoRefreshInterval < 1) {
    console.warn('El intervalo de actualización automática debe ser al menos 1 minuto. Usando valor predeterminado.');
    validatedSettings.autoRefreshInterval = defaultSettings.autoRefreshInterval;
  }

  return validatedSettings;
};
// Definición de tipos para NotificationSettings
export interface NotificationSettings {
  enablePriceAlerts: boolean;
  enableSignalAlerts: boolean;
  enablePredictionAlerts: boolean;
  priceChangeThreshold: number; // Umbral de cambio de precio en porcentaje
  notificationMethods: ('app' | 'email' | 'push')[]; // Métodos de notificación
}


export const createNotificationSettings = (
  settings: Partial<NotificationSettings>
): NotificationSettings => {
  // Valores predeterminados
  const defaultSettings: NotificationSettings = {
    enablePriceAlerts: false,
    enableSignalAlerts: false,
    enablePredictionAlerts: false,
    priceChangeThreshold: 5, // Umbral predeterminado del 5%
    notificationMethods: ['app'], // Método predeterminado: notificaciones en la app
  };

  // Validar y combinar las opciones proporcionadas con los valores predeterminados
  const validatedSettings: NotificationSettings = {
    ...defaultSettings,
    ...settings,
  };

  // Validaciones adicionales
  if (validatedSettings.priceChangeThreshold < 0) {
    console.warn(
      'El umbral de cambio de precio debe ser mayor o igual a cero. Usando valor predeterminado.'
    );
    validatedSettings.priceChangeThreshold = defaultSettings.priceChangeThreshold;
  }

  if (validatedSettings.notificationMethods.length === 0) {
    console.warn('Debe haber al menos un método de notificación activo. Usando valor predeterminado.');
    validatedSettings.notificationMethods = defaultSettings.notificationMethods;
  }

  return validatedSettings;
};
