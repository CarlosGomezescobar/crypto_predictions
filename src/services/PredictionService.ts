import { CryptoDataCollector, TechnicalAnalysis, FundamentalAnalysis, MachineLearningPredictor, RiskManagement, Visualization, CryptoPredictionSystem } from '../services/crypto_prediction_system';

// Configuración de las claves API desde variables de entorno
const glassnodeApiKey = import.meta.env.VITE_GLASSNODE_API_KEY;
const binanceApiKey = import.meta.env.VITE_CCXT_BINANCE_API_KEY;
const binanceSecretKey = import.meta.env.VITE_CCXT_BINANCE_SECRET_KEY;
const coinbaseApiKey = import.meta.env.VITE_CCXT_COINBASE_API_KEY;
const coinbaseSecretKey = import.meta.env.VITE_CCXT_COINBASE_SECRET_KEY;

// Clase singleton para gestionar la instancia del sistema de predicción
class PredictionService {
  private static instance: PredictionService;
  private cryptoSystem: CryptoPredictionSystem;
  private isInitialized: boolean = false;
  private initializationPromise: Promise<boolean> | null = null;

  private constructor() {
    this.cryptoSystem = new CryptoPredictionSystem();
    
    // Configurar API keys si están disponibles
    if (glassnodeApiKey && glassnodeApiKey !== 'your_glassnode_api_key_here') {
      this.cryptoSystem.setGlassnodeApiKey(glassnodeApiKey);
    }
  }

  public static getInstance(): PredictionService {
    if (!PredictionService.instance) {
      PredictionService.instance = new PredictionService();
    }
    return PredictionService.instance;
  }

  /**
   * Inicializa el sistema de predicción cargando datos históricos
   * @param symbol Par de trading (ej. 'BTC/USDT')
   * @param timeframe Intervalo de tiempo ('1d', '4h', '1h', etc.)
   * @returns Promesa que se resuelve cuando el sistema está inicializado
   */
  public async initialize(symbol: string = 'BTC/USDT', timeframe: string = '1d'): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = new Promise<boolean>(async (resolve) => {
      try {
        // Paso 1: Recolectar datos
        const dataCollected = await this.cryptoSystem.collectData(symbol, timeframe);
        if (!dataCollected) {
          console.error("Error al recolectar datos");
          resolve(false);
          return;
        }

        // Paso 2: Preparar indicadores técnicos
        const indicatorsPrepared = this.cryptoSystem.prepareTechnicalIndicators();
        if (!indicatorsPrepared) {
          console.error("Error al preparar indicadores técnicos");
          resolve(false);
          return;
        }

        // Paso 3: Combinar datos
        const dataCombined = this.cryptoSystem.combineAllData();
        if (!dataCombined) {
          console.error("Error al combinar datos");
          resolve(false);
          return;
        }

        this.isInitialized = true;
        resolve(true);
      } catch (error) {
        console.error("Error durante la inicialización:", error);
        resolve(false);
      }
    });

    return this.initializationPromise;
  }

  /**
   * Entrena el modelo de predicción
   * @param predictionDays Días a predecir en el futuro
   * @returns Promesa que se resuelve cuando el entrenamiento está completo
   */
  public async trainModel(predictionDays: number = 30): Promise<boolean> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        return false;
      }
    }

    try {
      return await this.cryptoSystem.trainPredictionModel(null, 60, predictionDays);
    } catch (error) {
      console.error("Error durante el entrenamiento del modelo:", error);
      return false;
    }
  }

  /**
   * Predice precios futuros
   * @param days Número de días a predecir
   * @returns Predicciones de precios o null si hay un error
   */
  public async predictPrices(days: number = 30): Promise<number[] | null> {
    try {
      return await this.cryptoSystem.predictFuturePrices(days);
    } catch (error) {
      console.error("Error durante la predicción:", error);
      return null;
    }
  }

  /**
   * Genera señales de trading
   * @returns DataFrame con señales de trading o null si hay un error
   */
  public generateTradingSignals() {
    try {
      return this.cryptoSystem.generateTradingSignals();
    } catch (error) {
      console.error("Error al generar señales de trading:", error);
      return null;
    }
  }

  /**
   * Obtiene los datos de precio actuales
   * @returns Datos de precio o null si no están disponibles
   */
  public getPriceData() {
    if (!this.isInitialized) {
      return null;
    }
    
    // Acceder a los datos internos del sistema
    // Nota: Esto asume que hay una forma de acceder a los datos internos
    // En una implementación real, podría ser necesario añadir métodos getter al CryptoPredictionSystem
    return (this.cryptoSystem as any).priceData;
  }

  /**
   * Obtiene los datos combinados
   * @returns Datos combinados o null si no están disponibles
   */
  public getCombinedData() {
    if (!this.isInitialized) {
      return null;
    }
    
    return (this.cryptoSystem as any).combinedData;
  }

  /**
   * Obtiene los resultados de predicción
   * @returns Resultados de predicción o null si no están disponibles
   */
  public getPredictionResults() {
    if (!this.isInitialized) {
      return null;
    }
    
    return (this.cryptoSystem as any).predictionResults;
  }
}

export default PredictionService;