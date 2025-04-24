export interface CryptoData {
    timestamp: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }
  
  export interface PriceData {
    index: Date[];
    columns: string[];
    close: number[];
    open: number[];
    high: number[];
    low: number[];
    volume: number[];
    [key: string]: any;
  }
  
  export interface TechnicalIndicator {
    name: string;
    values: number[];
    description: string;
    interpretation: string;
  }
  
  export interface PredictionResult {
    dates: string[];
    values: number[];
    metrics: {
      mse: number;
      mae: number;
      rmse: number;
      r2: number;
    };
  }
  
  export interface TradingSignal {
    date: Date;
    price: number;
    type: 'buy' | 'sell' | 'neutral';
    strength: number;
    indicators: {
      name: string;
      value: number;
      signal: boolean;
    }[];
  }
  
  export interface MarketSentiment {
    fearGreedIndex: number;
    fearGreedCategory: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
    marketTrend: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
  }
  
  export interface RiskAnalysis {
    stopLoss: number;
    takeProfitLevels: number[];
    riskRewardRatio: number;
    positionSize: number;
    maxDrawdown: number;
    kellyPercentage: number;
  }
  
  export interface CryptoAsset {
    symbol: string;
    name: string;
    logo?: string;
    description?: string;
    category?: string;
  }
  
  export interface TimeFrame {
    id: string;
    label: string;
    value: string;
    description: string;
  }
  
  export interface ChartOptions {
    showVolume?: boolean;
    showGrid?: boolean;
    showTooltip?: boolean;
    showLegend?: boolean;
    showAxisLabels?: boolean;
    height?: number;
    width?: number;
    theme?: 'light' | 'dark';
  }
  
  export interface UserSettings {
    defaultSymbol: string;
    defaultTimeframe: string;
    predictionDays: number;
    theme: 'light' | 'dark';
    showAdvancedOptions: boolean;
    autoRefreshInterval: number | null;
    favoriteAssets: string[];
  }
  
  export interface NotificationSettings {
    enablePriceAlerts: boolean;
    enableSignalAlerts: boolean;
    enablePredictionAlerts: boolean;
    priceChangeThreshold: number;
    notificationMethods: ('app' | 'email' | 'push')[];
  }
  
  export interface ApiKeys {
    glassnodeApiKey?: string;
    binanceApiKey?: string;
    binanceSecretKey?: string;
    coinbaseApiKey?: string;
    coinbaseSecretKey?: string;
  }
  
  export interface ModelTrainingOptions {
    featureColumns?: string[];
    sequenceLength: number;
    predictionDays: number;
    epochs: number;
    batchSize: number;
    validationSplit: number;
  }
  
  export interface ModelEvaluationMetrics {
    mse: number;
    mae: number;
    rmse: number;
    r2: number;
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
  }
  
  export interface BacktestResult {
    startDate: Date;
    endDate: Date;
    initialBalance: number;
    finalBalance: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    profitFactor: number;
    maxDrawdown: number;
    sharpeRatio: number;
    trades: {
      date: Date;
      type: 'buy' | 'sell';
      price: number;
      quantity: number;
      profit: number;
      runningBalance: number;
    }[];
  }
  
  export interface PortfolioAllocation {
    asset: string;
    percentage: number;
    amount: number;
    value: number;
    risk: 'low' | 'medium' | 'high';
  }
  
  export interface ThemeColors {
    primary: string;
    secondary: string;
    success: string;
    danger: string;
    warning: string;
    info: string;
    background: string;
    text: string;
    border: string;
    chart: {
      background: string;
      grid: string;
      tooltip: string;
      line: string[];
      bar: string[];
      area: string[];
    };
  }
  