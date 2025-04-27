// Definición de tipos para el sistema de predicción de criptomonedas
// Este archivo centraliza todas las interfaces y tipos utilizados en la aplicación

// Tipos básicos para datos de criptomonedas
export interface CryptoAsset {
  symbol: string;
  name: string;
  logo?: string;
  description?: string;
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
  render?: (value: any, row: T) => React.ReactNode;
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
  details?: any;
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

// Exportar todos los tipos
export type {
  CryptoAsset,
  TimeFrame,
  OHLCVData,
  TechnicalIndicator,
  TechnicalAnalysisResult,
  ChartPattern,
  FibonacciLevels,
  SupportResistanceLevel,
  OnChainData,
  DevelopmentMetrics,
  AdoptionMetrics,
  CryptoEvent,
  FundamentalAnalysisResult,
  PredictionResult,
  ModelMetrics,
  TrainingOptions,
  TradingSignal,
  BacktestResult,
  Trade,
  BacktestMetrics,
  RiskMetrics,
  MarketSentiment,
  NewsItem,
  AppState,
  Notification,
  ChartOptions,
  TableColumn,
  ApiResponse,
  ApiError,
  RiskAnalysis
};
