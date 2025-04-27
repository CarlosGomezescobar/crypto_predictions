/**
 * Sistema de Predicción de Precios de Criptomonedas
 * Desarrollado para análisis, evaluación y predicción de precios de tokens/criptomonedas
 * Incluye análisis fundamental, técnico, y modelos de machine learning
 */

// Importación de librerías necesarias
import * as danfojs from 'danfojs-node';
import * as numjs from 'numjs';
import * as Chart from 'chart.js';
import * as ccxt from 'ccxt';
import axios from 'axios';
import * as tf from '@tensorflow/tfjs-node';
import * as moment from 'moment';


// Definición de interfaces
interface DataFrame {
  index: any[];
  columns: string[];
  [key: string]: any;
}

interface OHLCVData {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface MetricsResult {
  MSE: number;
  MAE: number;
  RMSE: number;
  R2: number;
}

interface FibonacciLevels {
  [key: string]: number;
}

interface SupportResistance {
  timestamp: Date;
  price: number;
}

/**
 * Clase para recolectar datos históricos de criptomonedas desde diferentes fuentes
 */
class CryptoDataCollector {
  private binance: ccxt.Exchange;
  private coinbase: ccxt.Exchange;
  private glassnode_api_key: string | null;

  /**
   * Inicializa el recolector de datos
   */
  constructor() {
    this.binance = new ccxt.binance();
    this.coinbase = new ccxt.coinbasepro();
    this.glassnode_api_key = null; // Requiere registro en Glassnode
  }

  /**
   * Establece la API key para Glassnode
   * @param api_key - API key de Glassnode
   */
  setGlassnodeApiKey(api_key: string): void {
    this.glassnode_api_key = api_key;
  }

  /**
   * Obtiene datos históricos de precios desde exchanges
   * @param symbol - Par de trading (ej. 'BTC/USDT')
   * @param timeframe - Intervalo de tiempo ('1d', '4h', '1h', etc.)
   * @param limit - Número de registros a obtener
   * @param source - Exchange fuente ('binance' o 'coinbase')
   * @returns DataFrame con datos históricos
   */
  async getHistoricalPriceData(
    symbol: string = 'BTC/USDT',
    timeframe: string = '1d',
    limit: number = 1000,
    source: string = 'binance'
  ): Promise<DataFrame | null> {
    try {
      const exchange = source === 'binance' ? this.binance : this.coinbase;
      const ohlcv = await exchange.fetchOHLCV(symbol, timeframe, undefined, limit);
      
      const data: OHLCVData[] = ohlcv.map(item => ({
        timestamp: new Date(item[0]),
        open: item[1],
        high: item[2],
        low: item[3],
        close: item[4],
        volume: item[5]
      }));
      
      // Crear DataFrame usando danfojs
      const df = new danfojs.DataFrame(data);
      df.setIndex({ column: 'timestamp' });
      
      return df;
    } catch (e) {
      console.log(`Error al obtener datos históricos: ${e}`);
      return null;
    }
  }

  /**
   * Obtiene métricas on-chain desde Glassnode API
   * @param coin - Nombre de la criptomoneda ('bitcoin', 'ethereum', etc.)
   * @param metric - Métrica a obtener ('mvrv_z_score', 'nupl', etc.)
   * @param since - Fecha de inicio en formato ISO (ej. '2020-01-01')
   * @returns DataFrame con métricas on-chain
   */
  async getOnchainMetrics(
    coin: string = 'bitcoin',
    metric: string = 'mvrv_z_score',
    since: string | null = null
  ): Promise<DataFrame | null> {
    if (!this.glassnode_api_key) {
      console.log("Se requiere API key de Glassnode para métricas on-chain");
      return null;
    }
    
    const url = `https://api.glassnode.com/v1/metrics/${metric}`;
    const params: any = {
      api_key: this.glassnode_api_key,
      a: coin,
      i: '24h'
    };
    
    if (since) {
      params.s = since;
    }
    
    try {
      const response = await axios.get(url, { params });
      if (response.status === 200) {
        const data = response.data.map((item: any) => ({
          timestamp: new Date(item.t * 1000),
          [metric]: item.v
        }));
        
        const df = new danfojs.DataFrame(data);
        df.setIndex({ column: 'timestamp' });
        return df;
      } else {
        console.log(`Error en la solicitud: ${response.status}`);
        return null;
      }
    } catch (e) {
      console.log(`Error al obtener métricas on-chain: ${e}`);
      return null;
    }
  }

  /**
   * Obtiene datos de reservas en exchanges (simulado, requiere API real)
   * @param coin - Símbolo de la criptomoneda
   * @returns DataFrame con datos de reservas
   */
  getExchangeReserves(coin: string = 'BTC'): DataFrame {
    // Nota: Esta es una simulación, se requiere API real para datos precisos
    const dates: Date[] = [];
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      dates.unshift(date);
    }
    
    // Generar datos aleatorios con tendencia descendente
    const reserves: number[] = [];
    for (let i = 0; i < 365; i++) {
      // Simulación de distribución normal
      const randomValue = 2000000 + (Math.random() * 2 - 1) * 100000;
      // Tendencia descendente
      const trend = -200000 * (i / 364);
      reserves.push(randomValue + trend);
    }
    
    const data = dates.map((date, i) => ({
      timestamp: date,
      exchange_reserves: reserves[i]
    }));
    
    const df = new danfojs.DataFrame(data);
    df.setIndex({ column: 'timestamp' });
    return df;
  }

  /**
   * Obtiene el índice de miedo y codicia de Alternative.me
   * @returns DataFrame con índice de miedo y codicia
   */
  async getFearGreedIndex(): Promise<DataFrame | null> {
    const url = "https://api.alternative.me/fng/?limit=365";
    try {
      const response = await axios.get(url);
      if (response.status === 200) {
        const data = response.data.data.map((item: any) => ({
          timestamp: new Date(item.timestamp * 1000),
          fear_greed_index: parseInt(item.value)
        }));
        
        const df = new danfojs.DataFrame(data);
        df.setIndex({ column: 'timestamp' });
        // Ordenar por fecha
        df.sortIndex({ ascending: true });
        return df;
      } else {
        console.log(`Error en la solicitud: ${response.status}`);
        return null;
      }
    } catch (e) {
      console.log(`Error al obtener índice de miedo y codicia: ${e}`);
      return null;
    }
  }
}

/**
 * Clase para realizar análisis técnico en datos de criptomonedas
 */
class TechnicalAnalysis {
  /**
   * Añade medias móviles al DataFrame
   * @param df - DataFrame con datos de precios
   * @param windows - Lista de períodos para las medias móviles
   * @returns DataFrame con medias móviles añadidas
   */
  static addMovingAverages(df: DataFrame, windows: number[] = [50, 200]): DataFrame {
    const result = df.copy();
    
    for (const window of windows) {
      const maColumn = `MA_${window}`;
      result[maColumn] = this.calculateMovingAverage(df.close, window);
    }
    
    return result;
  }
  
  /**
   * Calcula la media móvil de una serie
   * @param series - Serie de datos
   * @param window - Período para la media móvil
   * @returns Array con la media móvil
   */
  private static calculateMovingAverage(series: number[], window: number): number[] {
    const result: number[] = [];
    
    for (let i = 0; i < series.length; i++) {
      if (i < window - 1) {
        result.push(NaN);
      } else {
        let sum = 0;
        for (let j = 0; j < window; j++) {
          sum += series[i - j];
        }
        result.push(sum / window);
      }
    }
    
    return result;
  }

  /**
   * Añade el indicador RSI (Relative Strength Index) al DataFrame
   * @param df - DataFrame con datos de precios
   * @param window - Período para el cálculo del RSI
   * @returns DataFrame con RSI añadido
   */
  static addRSI(df: DataFrame, window: number = 14): DataFrame {
    const result = df.copy();
    const close = df.close;
    const delta: number[] = [];
    
    // Calcular diferencias
    for (let i = 0; i < close.length; i++) {
      if (i === 0) {
        delta.push(0);
      } else {
        delta.push(close[i] - close[i - 1]);
      }
    }
    
    // Separar ganancias y pérdidas
    const gain: number[] = delta.map(d => d > 0 ? d : 0);
    const loss: number[] = delta.map(d => d < 0 ? -d : 0);
    
    // Calcular medias móviles de ganancias y pérdidas
    const avgGain = this.calculateMovingAverage(gain, window);
    const avgLoss = this.calculateMovingAverage(loss, window);
    
    // Calcular RS y RSI
    const rs: number[] = [];
    const rsi: number[] = [];
    
    for (let i = 0; i < avgGain.length; i++) {
      if (isNaN(avgGain[i]) || isNaN(avgLoss[i]) || avgLoss[i] === 0) {
        rs.push(NaN);
        rsi.push(NaN);
      } else {
        rs.push(avgGain[i] / avgLoss[i]);
        rsi.push(100 - (100 / (1 + rs[i])));
      }
    }
    
    result['RSI'] = rsi;
    return result;
  }

  /**
   * Añade bandas de Bollinger al DataFrame
   * @param df - DataFrame con datos de precios
   * @param window - Período para el cálculo de las bandas
   * @param numStd - Número de desviaciones estándar
   * @returns DataFrame con bandas de Bollinger añadidas
   */
  static addBollingerBands(df: DataFrame, window: number = 20, numStd: number = 2): DataFrame {
    const result = df.copy();
    
    // Calcular media móvil
    result['BB_middle'] = this.calculateMovingAverage(df.close, window);
    
    // Calcular desviación estándar
    const std = this.calculateStandardDeviation(df.close, window, result['BB_middle']);
    result['BB_std'] = std;
    
    // Calcular bandas superior e inferior
    result['BB_upper'] = result['BB_middle'].map((val: number, i: number) => 
      isNaN(val) ? NaN : val + (std[i] * numStd)
    );
    
    result['BB_lower'] = result['BB_middle'].map((val: number, i: number) => 
      isNaN(val) ? NaN : val - (std[i] * numStd)
    );
    
    return result;
  }
  
  /**
   * Calcula la desviación estándar móvil
   * @param series - Serie de datos
   * @param window - Período para la desviación estándar
   * @param mean - Media móvil precalculada
   * @returns Array con la desviación estándar
   */
  private static calculateStandardDeviation(series: number[], window: number, mean: number[]): number[] {
    const result: number[] = [];
    
    for (let i = 0; i < series.length; i++) {
      if (i < window - 1 || isNaN(mean[i])) {
        result.push(NaN);
      } else {
        let sumSquaredDiff = 0;
        for (let j = 0; j < window; j++) {
          sumSquaredDiff += Math.pow(series[i - j] - mean[i], 2);
        }
        result.push(Math.sqrt(sumSquaredDiff / window));
      }
    }
    
    return result;
  }

  /**
   * Añade el indicador MACD (Moving Average Convergence Divergence) al DataFrame
   * @param df - DataFrame con datos de precios
   * @param fast - Período para la media móvil rápida
   * @param slow - Período para la media móvil lenta
   * @param signal - Período para la línea de señal
   * @returns DataFrame con MACD añadido
   */
  static addMACD(df: DataFrame, fast: number = 12, slow: number = 26, signal: number = 9): DataFrame {
    const result = df.copy();
    
    // Calcular EMA rápida y lenta
    result['EMA_fast'] = this.calculateEMA(df.close, fast);
    result['EMA_slow'] = this.calculateEMA(df.close, slow);
    
    // Calcular MACD
    result['MACD'] = result['EMA_fast'].map((val: number, i: number) => 
      isNaN(val) || isNaN(result['EMA_slow'][i]) ? NaN : val - result['EMA_slow'][i]
    );
    
    // Calcular señal MACD
    result['MACD_signal'] = this.calculateEMA(result['MACD'], signal);
    
    // Calcular histograma MACD
    result['MACD_histogram'] = result['MACD'].map((val: number, i: number) => 
      isNaN(val) || isNaN(result['MACD_signal'][i]) ? NaN : val - result['MACD_signal'][i]
    );
    
    return result;
  }
  
  /**
   * Calcula la media móvil exponencial
   * @param series - Serie de datos
   * @param span - Período para la EMA
   * @returns Array con la EMA
   */
  private static calculateEMA(series: number[], span: number): number[] {
    const result: number[] = [];
    const alpha = 2 / (span + 1);
    
    for (let i = 0; i < series.length; i++) {
      if (i === 0) {
        result.push(series[i]);
      } else if (isNaN(series[i]) || isNaN(result[i - 1])) {
        result.push(NaN);
      } else {
        result.push(alpha * series[i] + (1 - alpha) * result[i - 1]);
      }
    }
    
    return result;
  }

  /**
   * Calcula niveles de retroceso de Fibonacci basados en máximos y mínimos recientes
   * @param df - DataFrame con datos de precios
   * @param trend - Tendencia actual ('uptrend' o 'downtrend')
   * @returns Diccionario con niveles de Fibonacci
   */
  static addFibonacciLevels(df: DataFrame, trend: string = 'uptrend'): FibonacciLevels {
    let priceMin: number;
    let priceMax: number;
    
    if (trend === 'uptrend') {
      // Para tendencia alcista, calculamos retrocesos desde mínimo a máximo
      priceMin = Math.min(...df.low.filter((val: number) => !isNaN(val)));
      priceMax = Math.max(...df.high.filter((val: number) => !isNaN(val)));
    } else {
      // Para tendencia bajista, calculamos extensiones desde máximo a mínimo
      priceMin = Math.max(...df.high.filter((val: number) => !isNaN(val)));
      priceMax = Math.min(...df.low.filter((val: number) => !isNaN(val)));
    }
    
    const diff = priceMax - priceMin;
    
    const levels: FibonacciLevels = {
      '0.0': priceMin,
      '0.236': priceMin + 0.236 * diff,
      '0.382': priceMin + 0.382 * diff,
      '0.5': priceMin + 0.5 * diff,
      '0.618': priceMin + 0.618 * diff,
      '0.786': priceMin + 0.786 * diff,
      '1.0': priceMax
    };
    
    return levels;
  }

  /**
   * Identifica niveles de soporte y resistencia
   * @param df - DataFrame con datos de precios
   * @param window - Ventana para identificar máximos y mínimos locales
   * @returns Tupla de listas de niveles de soporte y resistencia
   */
  static identifySupportResistance(df: DataFrame, window: number = 10): [SupportResistance[], SupportResistance[]] {
    const supports: SupportResistance[] = [];
    const resistances: SupportResistance[] = [];
    
    for (let i = window; i < df.low.length - window; i++) {
      // Verificar si es un mínimo local (soporte)
      let isSupport = true;
      for (let j = 1; j <= window; j++) {
        if (df.low[i] > df.low[i-j] || df.low[i] > df.low[i+j]) {
          isSupport = false;
          break;
        }
      }
      
      if (isSupport) {
        supports.push({
          timestamp: df.index[i],
          price: df.low[i]
        });
      }
      
      // Verificar si es un máximo local (resistencia)
      let isResistance = true;
      for (let j = 1; j <= window; j++) {
        if (df.high[i] < df.high[i-j] || df.high[i] < df.high[i+j]) {
          isResistance = false;
          break;
        }
      }
      
      if (isResistance) {
        resistances.push({
          timestamp: df.index[i],
          price: df.high[i]
        });
      }
    }
    
    return [supports, resistances];
  }
}

/**
 * Clase para realizar análisis fundamental de criptomonedas
 */
class FundamentalAnalysis {
  /**
   * Analiza el MVRV Z-Score para identificar oportunidades de compra/venta
   * @param mvrvDf - DataFrame con datos de MVRV Z-Score
   * @returns DataFrame con señales de compra/venta
   */
  static analyzeMvrvZScore(mvrvDf: DataFrame): DataFrame {
    const signals = new danfojs.DataFrame([], { index: mvrvDf.index });
    signals['mvrv_z_score'] = mvrvDf['mvrv_z_score'];
    signals['buy_signal'] = mvrvDf['mvrv_z_score'].map((val: number) => val < 0);
    signals['sell_signal'] = mvrvDf['mvrv_z_score'].map((val: number) => val > 7);
    return signals;
  }

  /**
   * Analiza el NUPL (Net Unrealized Profit/Loss) para identificar zonas de oportunidad
   * @param nuplDf - DataFrame con datos de NUPL
   * @returns DataFrame con zonas de oportunidad
   */
  static analyzeNupl(nuplDf: DataFrame): DataFrame {
    const zones = new danfojs.DataFrame([], { index: nuplDf.index });
    zones['nupl'] = nuplDf['nupl'];
    zones['opportunity_zone'] = nuplDf['nupl'].map((val: number) => val < 0.25);
    zones['euphoria_zone'] = nuplDf['nupl'].map((val: number) => val > 0.75);
    return zones;
  }

  /**
   * Analiza las reservas en exchanges para identificar tendencias de acumulación
   * @param reservesDf - DataFrame con datos de reservas
   * @returns DataFrame con tendencias de acumulación
   */
  static analyzeExchangeReserves(reservesDf: DataFrame): DataFrame {
    const analysis = new danfojs.DataFrame([], { index: reservesDf.index });
    analysis['exchange_reserves'] = reservesDf['exchange_reserves'];
    
    // Calcular cambio porcentual en 30 días
    const reserves = reservesDf['exchange_reserves'];
    const reserves30dChange: number[] = [];
    
    for (let i = 0; i < reserves.length; i++) {
      if (i < 30) {
        reserves30dChange.push(NaN);
      } else {
        const pctChange = ((reserves[i] - reserves[i - 30]) / reserves[i - 30]) * 100;
        reserves30dChange.push(pctChange);
      }
    }
    
    analysis['reserves_30d_change'] = reserves30dChange;
    analysis['accumulation_signal'] = reserves30dChange.map((val: number) => !isNaN(val) && val < -5);
    
    return analysis;
  }

  /**
   * Analiza el índice de miedo y codicia para identificar extremos de mercado
   * @param fgDf - DataFrame con índice de miedo y codicia
   * @returns DataFrame con señales basadas en extremos de mercado
   */
  static analyzeFearGreed(fgDf: DataFrame): DataFrame {
    const signals = new danfojs.DataFrame([], { index: fgDf.index });
    signals['fear_greed_index'] = fgDf['fear_greed_index'];
    signals['extreme_fear'] = fgDf['fear_greed_index'].map((val: number) => val <= 20);
    signals['extreme_greed'] = fgDf['fear_greed_index'].map((val: number) => val >= 80);
    return signals;
  }
}

/**
 * Clase para implementar modelos de machine learning para predicción de precios
 */
class MachineLearningPredictor {
  private model: tf.Sequential | null;
  private xScaler: MinMaxScaler | null;
  private yScaler: MinMaxScaler | null;

  /**
   * Inicializa el predictor de machine learning
   */
  constructor() {
    this.model = null;
    this.xScaler = null;
    this.yScaler = null;
  }

  /**
   * Prepara los datos para el entrenamiento del modelo
   * @param df - DataFrame con datos históricos
   * @param targetCol - Columna objetivo para la predicción
   * @param featureCols - Lista de columnas a usar como características
   * @param sequenceLength - Longitud de la secuencia para LSTM
   * @param predictionDays - Días a predecir en el futuro
   * @returns Datos de entrenamiento y prueba
   */
  prepareData(
    df: DataFrame,
    targetCol: string = 'close',
    featureCols: string[] | null = null,
    sequenceLength: number = 60,
    predictionDays: number = 30
  ): [tf.Tensor, tf.Tensor, tf.Tensor, tf.Tensor] {
    if (!featureCols) {
      featureCols = ['close', 'volume', 'RSI', 'MACD'];
    }
    
    // Asegurarse de que todas las columnas requeridas estén presentes
    for (const col of [...featureCols, targetCol]) {
      if (!df.columns.includes(col)) {
        throw new Error(`La columna ${col} no está presente en el DataFrame`);
      }
    }
    
    // Crear columna objetivo desplazada para predicción futura
    const futureCol = `${targetCol}_future`;
    const dfCopy = df.copy();
    
    // Implementar shift para predicción futura
    const futureValues: number[] = [];
    for (let i = 0; i < df[targetCol].length; i++) {
      if (i + predictionDays >= df[targetCol].length) {
        futureValues.push(NaN);
      } else {
        futureValues.push(df[targetCol][i + predictionDays]);
      }
    }
    dfCopy[futureCol] = futureValues;
    
    // Eliminar filas con valores NaN
    const cleanDf = this.dropNaN(dfCopy);
    
    // Separar características y objetivo
    const X: number[][] = [];
    for (let i = 0; i < cleanDf.index.length; i++) {
      const row: number[] = [];
      for (const col of featureCols) {
        row.push(cleanDf[col][i]);
      }
      X.push(row);
    }
    
    const y: number[] = cleanDf[futureCol];
    
    // Escalar datos
    this.xScaler = new MinMaxScaler();
    this.yScaler = new MinMaxScaler();
    
    const XScaled = this.xScaler.fitTransform(X);
    const yScaled = this.yScaler.fitTransform(y.map(val => [val]));
    
    // Crear secuencias para LSTM
    const XSequences: number[][][] = [];
    const ySequences: number[][] = [];
    
    for (let i = 0; i < XScaled.length - sequenceLength; i++) {
      XSequences.push(XScaled.slice(i, i + sequenceLength));
      ySequences.push(yScaled[i + sequenceLength]);
    }
    
    // Dividir en conjuntos de entrenamiento y prueba
    const splitIdx = Math.floor(0.8 * XSequences.length);
    
    const XTrain = tf.tensor(XSequences.slice(0, splitIdx));
    const XTest = tf.tensor(XSequences.slice(splitIdx));
    const yTrain = tf.tensor(ySequences.slice(0, splitIdx));
    const yTest = tf.tensor(ySequences.slice(splitIdx));
    
    return [XTrain, XTest, yTrain, yTest];
  }
  
  /**
   * Elimina filas con valores NaN de un DataFrame
   * @param df - DataFrame a limpiar
   * @returns DataFrame sin valores NaN
   */
  private dropNaN(df: DataFrame): DataFrame {
    const indices: number[] = [];
    
    for (let i = 0; i < df.index.length; i++) {
      let hasNaN = false;
      for (const col of df.columns) {
        if (isNaN(df[col][i])) {
          hasNaN = true;
          break;
        }
      }
      if (!hasNaN) {
        indices.push(i);
      }
    }
    
    const newDf: any = {};
    for (const col of df.columns) {
      newDf[col] = indices.map(i => df[col][i]);
    }
    
    return new danfojs.DataFrame(newDf, { index: indices.map(i => df.index[i]) });
  }

  /**
   * Construye un modelo LSTM para predicción de series temporales
   * @param inputShape - Forma de los datos de entrada
   * @param units - Número de unidades en la capa LSTM
   * @returns Modelo LSTM
   */
  buildLstmModel(inputShape: [number, number], units: number = 50): tf.Sequential {
    const model = tf.sequential();
    
    model.add(tf.layers.lstm({
      units: units,
      returnSequences: true,
      inputShape: inputShape
    }));
    
    model.add(tf.layers.dropout({ rate: 0.2 }));
    
    model.add(tf.layers.lstm({
      units: units,
      returnSequences: false
    }));
    
    model.add(tf.layers.dropout({ rate: 0.2 }));
    
    model.add(tf.layers.dense({ units: 1 }));
    
    model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError'
    });
    
    return model;
  }

  /**
   * Entrena el modelo LSTM
   * @param XTrain - Datos de entrenamiento
   * @param yTrain - Etiquetas de entrenamiento
   * @param epochs - Número de épocas de entrenamiento
   * @param batchSize - Tamaño del lote
   * @param validationSplit - Proporción de datos para validación
   * @returns Historial de entrenamiento
   */
  async trainModel(
    XTrain: tf.Tensor,
    yTrain: tf.Tensor,
    epochs: number = 50,
    batchSize: number = 32,
    validationSplit: number = 0.2
  ): Promise<tf.History> {
    const inputShape: [number, number] = [XTrain.shape[1] as number, XTrain.shape[2] as number];
    this.model = this.buildLstmModel(inputShape);
    
    const history = await this.model.fit(XTrain, yTrain, {
      epochs,
      batchSize,
      validationSplit,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Época ${epoch + 1}/${epochs}, loss: ${logs?.loss.toFixed(4)}, val_loss: ${logs?.val_loss.toFixed(4)}`);
        }
      }
    });
    
    return history;
  }

  /**
   * Evalúa el modelo con datos de prueba
   * @param XTest - Datos de prueba
   * @param yTest - Etiquetas de prueba
   * @returns Métricas de evaluación y predicciones
   */
  async evaluateModel(XTest: tf.Tensor, yTest: tf.Tensor): Promise<[MetricsResult, number[], number[]]> {
    if (!this.model) {
      throw new Error("El modelo no ha sido entrenado");
    }
    
    if (!this.yScaler) {
      throw new Error("El escalador no ha sido inicializado");
    }
    
    const yPredScaled = this.model.predict(XTest) as tf.Tensor;
    
    // Convertir tensores a arrays
    const yTestArray = await yTest.array() as number[][];
    const yPredArray = await yPredScaled.array() as number[][];
    
    // Invertir la escala
    const yTrue = this.yScaler.inverseTransform(yTestArray);
    const yPred = this.yScaler.inverseTransform(yPredArray);
    
    // Calcular métricas
    const mse = this.calculateMSE(yTrue, yPred);
    const mae = this.calculateMAE(yTrue, yPred);
    const rmse = Math.sqrt(mse);
    const r2 = this.calculateR2(yTrue, yPred);
    
    const metrics: MetricsResult = {
      MSE: mse,
      MAE: mae,
      RMSE: rmse,
      R2: r2
    };
    
    // Convertir a arrays unidimensionales
    const yTrueFlat = yTrue.map(row => row[0]);
    const yPredFlat = yPred.map(row => row[0]);
    
    return [metrics, yTrueFlat, yPredFlat];
  }
  
  /**
   * Calcula el error cuadrático medio
   * @param yTrue - Valores reales
   * @param yPred - Valores predichos
   * @returns MSE
   */
  private calculateMSE(yTrue: number[][], yPred: number[][]): number {
    let sum = 0;
    for (let i = 0; i < yTrue.length; i++) {
      sum += Math.pow(yTrue[i][0] - yPred[i][0], 2);
    }
    return sum / yTrue.length;
  }
  
  /**
   * Calcula el error absoluto medio
   * @param yTrue - Valores reales
   * @param yPred - Valores predichos
   * @returns MAE
   */
  private calculateMAE(yTrue: number[][], yPred: number[][]): number {
    let sum = 0;
    for (let i = 0; i < yTrue.length; i++) {
      sum += Math.abs(yTrue[i][0] - yPred[i][0]);
    }
    return sum / yTrue.length;
  }
  
  /**
   * Calcula el coeficiente de determinación R²
   * @param yTrue - Valores reales
   * @param yPred - Valores predichos
   * @returns R²
   */
  private calculateR2(yTrue: number[][], yPred: number[][]): number {
    const yMean = yTrue.reduce((sum, val) => sum + val[0], 0) / yTrue.length;
    
    let ssTotal = 0;
    let ssResidual = 0;
    
    for (let i = 0; i < yTrue.length; i++) {
      ssTotal += Math.pow(yTrue[i][0] - yMean, 2);
      ssResidual += Math.pow(yTrue[i][0] - yPred[i][0], 2);
    }
    
    return 1 - (ssResidual / ssTotal);
  }

  /**
   * Predice precios futuros
   * @param lastSequence - Última secuencia de datos
   * @param days - Número de días a predecir
   * @returns Predicciones de precios
   */
  async predictFuture(lastSequence: number[][], days: number = 30): Promise<number[]> {
    if (!this.model) {
      throw new Error("El modelo no ha sido entrenado");
    }
    
    if (!this.yScaler) {
      throw new Error("El escalador no ha sido inicializado");
    }
    
    const predictions: number[] = [];
    let currentSequence = [...lastSequence];
    
    for (let i = 0; i < days; i++) {
      // Predecir el siguiente valor
      const input = tf.tensor([currentSequence]);
      const scaledPrediction = this.model.predict(input) as tf.Tensor;
      const scaledPredictionArray = await scaledPrediction.array() as number[][];
      
      // Convertir la predicción a escala original
      const prediction = this.yScaler.inverseTransform([[scaledPredictionArray[0][0]]])[0][0];
      predictions.push(prediction);
      
      // Actualizar la secuencia para la siguiente predicción
      // Esto es una simplificación, en un caso real necesitaríamos actualizar todas las características
      const nextInput = [...currentSequence[0]];
      nextInput[0] = scaledPredictionArray[0][0];  // Asumiendo que el precio de cierre es la primera característica
      
      currentSequence = [...currentSequence.slice(1), [nextInput]];
      
      // Liberar tensores
      input.dispose();
      scaledPrediction.dispose();
    }
    
    return predictions;
  }
}

/**
 * Implementación simple de MinMaxScaler para normalización de datos
 */
class MinMaxScaler {
  private min: number[] | null;
  private max: number[] | null;
  private range: number[] | null;
  private featureRange: [number, number];

  constructor(featureRange: [number, number] = [0, 1]) {
    this.min = null;
    this.max = null;
    this.range = null;
    this.featureRange = featureRange;
  }

  /**
   * Ajusta el escalador a los datos y los transforma
   * @param X - Datos a escalar
   * @returns Datos escalados
   */
  fitTransform(X: number[][] | number[]): number[][] {
    // Manejar caso de array unidimensional
    const isOneDimensional = !Array.isArray(X[0]);
    const data = isOneDimensional ? (X as number[]).map(x => [x]) : X as number[][];
    
    const n_samples = data.length;
    const n_features = data[0].length;
    
    this.min = Array(n_features).fill(Infinity);
    this.max = Array(n_features).fill(-Infinity);
    
    // Encontrar min y max para cada característica
    for (let i = 0; i < n_samples; i++) {
      for (let j = 0; j < n_features; j++) {
        if (data[i][j] < this.min[j]) {
          this.min[j] = data[i][j];
        }
        if (data[i][j] > this.max[j]) {
          this.max[j] = data[i][j];
        }
      }
    }
    
    // Calcular rango para cada característica
    this.range = this.max.map((max, i) => max - this.min![i]);
    
    // Escalar datos
    return this.transform(data);
  }

  /**
   * Transforma los datos usando los parámetros ajustados
   * @param X - Datos a transformar
   * @returns Datos transformados
   */
  transform(X: number[][] | number[]): number[][] {
    if (!this.min || !this.max || !this.range) {
      throw new Error("El escalador no ha sido ajustado. Llamar a fitTransform primero.");
    }
    
    // Manejar caso de array unidimensional
    const isOneDimensional = !Array.isArray(X[0]);
    const data = isOneDimensional ? (X as number[]).map(x => [x]) : X as number[][];
    
    const n_samples = data.length;
    const n_features = data[0].length;
    
    if (n_features !== this.min.length) {
      throw new Error(`El número de características ${n_features} no coincide con el número de características ajustadas ${this.min.length}`);
    }
    
    const scaled: number[][] = [];
    
    for (let i = 0; i < n_samples; i++) {
      const row: number[] = [];
      for (let j = 0; j < n_features; j++) {
        if (this.range[j] === 0) {
          row.push(this.featureRange[0]);
        } else {
          const scaled_value = (data[i][j] - this.min[j]) / this.range[j];
          row.push(
            scaled_value * (this.featureRange[1] - this.featureRange[0]) + this.featureRange[0]
          );
        }
      }
      scaled.push(row);
    }
    
    return scaled;
  }

  /**
   * Invierte la transformación
   * @param X - Datos escalados
   * @returns Datos en escala original
   */
  inverseTransform(X: number[][] | number[]): number[][] {
    if (!this.min || !this.max || !this.range) {
      throw new Error("El escalador no ha sido ajustado. Llamar a fitTransform primero.");
    }
    
    // Manejar caso de array unidimensional
    const isOneDimensional = !Array.isArray(X[0]);
    const data = isOneDimensional ? (X as number[]).map(x => [x]) : X as number[][];
    
    const n_samples = data.length;
    const n_features = data[0].length;
    
    if (n_features !== this.min.length) {
      throw new Error(`El número de características ${n_features} no coincide con el número de características ajustadas ${this.min.length}`);
    }
    
    const inverse: number[][] = [];
    
    for (let i = 0; i < n_samples; i++) {
      const row: number[] = [];
      for (let j = 0; j < n_features; j++) {
        const scaled_value = (data[i][j] - this.featureRange[0]) / (this.featureRange[1] - this.featureRange[0]);
        row.push(scaled_value * this.range[j] + this.min[j]);
      }
      inverse.push(row);
    }
    
    return inverse;
  }
}

/**
 * Clase para implementar estrategias de gestión de riesgo
 */
class RiskManagement {
  /**
   * Calcula el tamaño de posición basado en el riesgo por operación
   * @param portfolioValue - Valor total del portafolio
   * @param riskPerTrade - Porcentaje de riesgo por operación (0.02 = 2%)
   * @param stopLossPercent - Porcentaje de stop loss (0.15 = 15%)
   * @returns Tamaño de posición recomendado
   */
  static calculatePositionSize(
    portfolioValue: number,
    riskPerTrade: number = 0.02,
    stopLossPercent: number = 0.15
  ): number {
    const riskAmount = portfolioValue * riskPerTrade;
    const positionSize = riskAmount / stopLossPercent;
    return positionSize;
  }

  /**
   * Establece el nivel de stop loss
   * @param entryPrice - Precio de entrada
   * @param stopLossPercent - Porcentaje de stop loss (0.15 = 15%)
   * @param trailing - Si es un stop loss dinámico
   * @returns Nivel de stop loss
   */
  static setStopLoss(
    entryPrice: number,
    stopLossPercent: number = 0.15,
    trailing: boolean = false
  ): number {
    const stopLossLevel = entryPrice * (1 - stopLossPercent);
    return stopLossLevel;
  }

  /**
   * Establece niveles de toma de beneficios basados en ratios riesgo/recompensa
   * @param entryPrice - Precio de entrada
   * @param riskRewardRatios - Lista de ratios riesgo/recompensa
   * @returns Niveles de toma de beneficios
   */
  static setTakeProfitLevels(
    entryPrice: number,
    riskRewardRatios: number[] = [1, 2, 3]
  ): number[] {
    const stopLossLevel = RiskManagement.setStopLoss(entryPrice);
    const risk = entryPrice - stopLossLevel;
    
    const takeProfitLevels: number[] = [];
    for (const ratio of riskRewardRatios) {
      const takeProfit = entryPrice + (risk * ratio);
      takeProfitLevels.push(takeProfit);
    }
    
    return takeProfitLevels;
  }

  /**
   * Calcula el ratio riesgo/recompensa de una operación
   * @param entryPrice - Precio de entrada
   * @param targetPrice - Precio objetivo
   * @param stopLoss - Nivel de stop loss
   * @returns Ratio riesgo/recompensa
   */
  static calculateRiskRewardRatio(
    entryPrice: number,
    targetPrice: number,
    stopLoss: number
  ): number {
    const reward = Math.abs(targetPrice - entryPrice);
    const risk = Math.abs(entryPrice - stopLoss);
    
    if (risk === 0) {
      return Infinity;
    }
    
    return reward / risk;
  }

  /**
   * Calcula el criterio de Kelly para el tamaño óptimo de posición
   * @param winRate - Tasa de éxito (0.6 = 60%)
   * @param riskRewardRatio - Ratio riesgo/recompensa
   * @returns Porcentaje de Kelly
   */
  static calculateKellyCriterion(
    winRate: number,
    riskRewardRatio: number
  ): number {
    const q = 1 - winRate;
    const kelly = winRate - (q / riskRewardRatio);
    return Math.max(0, kelly);  // No permitir valores negativos
  }
}

/**
 * Clase para visualizar datos y resultados
 */
class Visualization {
  /**
   * Visualiza el precio con indicadores técnicos
   * @param df - DataFrame con datos de precios e indicadores
   * @param title - Título del gráfico
   */
  static plotPriceWithIndicators(df: DataFrame, title: string = "Análisis de Precio con Indicadores Técnicos"): void {
    console.log("Generando visualización de precios con indicadores técnicos...");
    
    // Nota: En un entorno real, aquí se implementaría la visualización con Chart.js o similar
    // Este es un placeholder para la funcionalidad
    
    console.log(`Título: ${title}`);
    console.log(`Rango de fechas: ${df.index[0]} a ${df.index[df.index.length - 1]}`);
    console.log(`Precio inicial: ${df.close[0]}, Precio final: ${df.close[df.close.length - 1]}`);
    
    if (df.columns.includes('MA_50')) {
      console.log(`MA 50 final: ${df['MA_50'][df['MA_50'].length - 1]}`);
    }
    
    if (df.columns.includes('MA_200')) {
      console.log(`MA 200 final: ${df['MA_200'][df['MA_200'].length - 1]}`);
    }
    
    if (df.columns.includes('RSI')) {
      console.log(`RSI final: ${df['RSI'][df['RSI'].length - 1]}`);
    }
    
    if (df.columns.includes('MACD')) {
      console.log(`MACD final: ${df['MACD'][df['MACD'].length - 1]}`);
    }
  }

  /**
   * Visualiza métricas fundamentales
   * @param metricsDf - DataFrame con métricas fundamentales
   * @param title - Título del gráfico
   */
  static plotFundamentalMetrics(metricsDf: DataFrame, title: string = "Análisis Fundamental"): void {
    console.log("Generando visualización de métricas fundamentales...");
    
    // Nota: En un entorno real, aquí se implementaría la visualización con Chart.js o similar
    // Este es un placeholder para la funcionalidad
    
    console.log(`Título: ${title}`);
    console.log(`Rango de fechas: ${metricsDf.index[0]} a ${metricsDf.index[metricsDf.index.length - 1]}`);
    console.log("Métricas disponibles:");
    
    for (const column of metricsDf.columns) {
      console.log(`- ${column}: ${metricsDf[column][metricsDf[column].length - 1]}`);
    }
  }

  /**
   * Visualiza resultados de predicción
   * @param yTrue - Valores reales
   * @param yPred - Valores predichos
   * @param title - Título del gráfico
   */
  static plotPredictionResults(yTrue: number[], yPred: number[], title: string = "Resultados de Predicción"): void {
    console.log("Generando visualización de resultados de predicción...");
    
    // Nota: En un entorno real, aquí se implementaría la visualización con Chart.js o similar
    // Este es un placeholder para la funcionalidad
    
    console.log(`Título: ${title}`);
    console.log(`Número de puntos: ${yTrue.length}`);
    
    // Calcular error medio
    let sumError = 0;
    for (let i = 0; i < yTrue.length; i++) {
      sumError += Math.abs(yTrue[i] - yPred[i]);
    }
    const meanError = sumError / yTrue.length;
    
    console.log(`Error medio absoluto: ${meanError}`);
    console.log(`Primer valor real: ${yTrue[0]}, Primer valor predicho: ${yPred[0]}`);
    console.log(`Último valor real: ${yTrue[yTrue.length - 1]}, Último valor predicho: ${yPred[yPred.length - 1]}`);
  }

  /**
   * Visualiza predicciones futuras
   * @param lastKnownPrice - Último precio conocido
   * @param predictions - Predicciones futuras
   * @param title - Título del gráfico
   */
  static plotFuturePredictions(lastKnownPrice: number, predictions: number[], title: string = "Predicción de Precios Futuros"): void {
    console.log("Generando visualización de predicciones futuras...");
    
    // Nota: En un entorno real, aquí se implementaría la visualización con Chart.js o similar
    // Este es un placeholder para la funcionalidad
    
    console.log(`Título: ${title}`);
    console.log(`Último precio conocido: ${lastKnownPrice}`);
    console.log(`Días predichos: ${predictions.length}`);
    console.log(`Primer día predicho: ${predictions[0]}`);
    console.log(`Último día predicho: ${predictions[predictions.length - 1]}`);
    
    // Calcular cambio porcentual
    const pctChange = ((predictions[predictions.length - 1] - lastKnownPrice) / lastKnownPrice) * 100;
    console.log(`Cambio porcentual esperado: ${pctChange.toFixed(2)}%`);
  }

  /**
   * Visualiza análisis de riesgo/recompensa
   * @param entryPrice - Precio de entrada
   * @param stopLoss - Nivel de stop loss
   * @param takeProfitLevels - Niveles de toma de beneficios
   * @param title - Título del gráfico
   */
  static plotRiskRewardAnalysis(
    entryPrice: number,
    stopLoss: number,
    takeProfitLevels: number[],
    title: string = "Análisis de Riesgo/Recompensa"
  ): void {
    console.log("Generando visualización de análisis de riesgo/recompensa...");
    
    // Nota: En un entorno real, aquí se implementaría la visualización con Chart.js o similar
    // Este es un placeholder para la funcionalidad
    
    console.log(`Título: ${title}`);
    console.log(`Precio de entrada: ${entryPrice}`);
    console.log(`Stop Loss: ${stopLoss} (${((stopLoss - entryPrice) / entryPrice * 100).toFixed(2)}%)`);
    
    console.log("Niveles de toma de beneficios:");
    for (let i = 0; i < takeProfitLevels.length; i++) {
      const tp = takeProfitLevels[i];
      const pctChange = ((tp - entryPrice) / entryPrice) * 100;
      console.log(`- TP ${i+1}: ${tp} (${pctChange.toFixed(2)}%)`);
    }
    
    // Calcular ratios riesgo/recompensa
    console.log("Ratios riesgo/recompensa:");
    for (let i = 0; i < takeProfitLevels.length; i++) {
      const ratio = RiskManagement.calculateRiskRewardRatio(entryPrice, takeProfitLevels[i], stopLoss);
      console.log(`- TP ${i+1}: ${ratio.toFixed(2)}`);
    }
  }
}

/**
 * Clase principal que integra todos los componentes del sistema
 */
class CryptoPredictionSystem {
  private dataCollector: CryptoDataCollector;
  private technicalAnalyzer: typeof TechnicalAnalysis;
  private fundamentalAnalyzer: typeof FundamentalAnalysis;
  private mlPredictor: MachineLearningPredictor;
  private riskManager: typeof RiskManagement;
  private visualizer: typeof Visualization;
  
  private priceData: DataFrame | null;
  private onchainData: { [key: string]: DataFrame | null } | null;
  private fearGreedData: DataFrame | null;
  private exchangeReservesData: DataFrame | null;
  private combinedData: DataFrame | null;
  
  private modelTrained: boolean;
  private predictionResults: {
    metrics: MetricsResult;
    yTrue: number[];
    yPred: number[];
  } | null;

  /**
   * Inicializa el sistema de predicción de criptomonedas
   */
  constructor() {
    this.dataCollector = new CryptoDataCollector();
    this.technicalAnalyzer = TechnicalAnalysis;
    this.fundamentalAnalyzer = FundamentalAnalysis;
    this.mlPredictor = new MachineLearningPredictor();
    this.riskManager = RiskManagement;
    this.visualizer = Visualization;
    
    this.priceData = null;
    this.onchainData = null;
    this.fearGreedData = null;
    this.exchangeReservesData = null;
    this.combinedData = null;
    
    this.modelTrained = false;
    this.predictionResults = null;
  }

  /**
   * Establece la API key para Glassnode
   * @param apiKey - API key de Glassnode
   */
  setGlassnodeApiKey(apiKey: string): void {
    this.dataCollector.setGlassnodeApiKey(apiKey);
  }

  /**
   * Recolecta todos los datos necesarios para el análisis
   * @param symbol - Par de trading
   * @param timeframe - Intervalo de tiempo
   * @param limit - Número de registros
   * @param source - Exchange fuente
   * @returns Éxito de la operación
   */
  async collectData(
    symbol: string = 'BTC/USDT',
    timeframe: string = '1d',
    limit: number = 1000,
    source: string = 'binance'
  ): Promise<boolean> {
    console.log(`Recolectando datos de precios para ${symbol}...`);
    this.priceData = await this.dataCollector.getHistoricalPriceData(symbol, timeframe, limit, source);
    
    if (this.priceData === null) {
      console.log("Error al obtener datos de precios. Verificar conexión o parámetros.");
      return false;
    }
    
    console.log("Recolectando datos de índice de miedo y codicia...");
    this.fearGreedData = await this.dataCollector.getFearGreedIndex();
    
    console.log("Simulando datos de reservas en exchanges...");
    this.exchangeReservesData = this.dataCollector.getExchangeReserves();
    
    // Si se ha configurado la API key de Glassnode, obtener métricas on-chain
    if (this.dataCollector.glassnode_api_key) {
      console.log("Recolectando métricas on-chain...");
      this.onchainData = {
        'mvrv_z_score': await this.dataCollector.getOnchainMetrics(undefined, 'mvrv_z_score'),
        'nupl': await this.dataCollector.getOnchainMetrics(undefined, 'nupl')
      };
    }
    
    console.log("Datos recolectados con éxito.");
    return true;
  }

  /**
   * Prepara indicadores técnicos para el análisis
   * @returns Éxito de la operación
   */
  prepareTechnicalIndicators(): boolean {
    if (this.priceData === null) {
      console.log("No hay datos de precios disponibles. Ejecutar collectData primero.");
      return false;
    }
    
    console.log("Calculando indicadores técnicos...");
    
    // Añadir medias móviles
    this.priceData = this.technicalAnalyzer.addMovingAverages(this.priceData);
    
    // Añadir RSI
    this.priceData = this.technicalAnalyzer.addRSI(this.priceData);
    
    // Añadir bandas de Bollinger
    this.priceData = this.technicalAnalyzer.addBollingerBands(this.priceData);
    
    // Añadir MACD
    this.priceData = this.technicalAnalyzer.addMACD(this.priceData);
    
    console.log("Indicadores técnicos calculados con éxito.");
    return true;
  }

  /**
   * Combina todos los datos recolectados en un único DataFrame
   * @returns Éxito de la operación
   */
  combineAllData(): boolean {
    if (this.priceData === null) {
      console.log("No hay datos de precios disponibles. Ejecutar collectData primero.");
      return false;
    }
    
    console.log("Combinando todos los datos...");
    
    // Comenzar con los datos de precios
    this.combinedData = this.priceData.copy();
    
    // Añadir índice de miedo y codicia si está disponible
    if (this.fearGreedData !== null) {
      // Implementar merge en TypeScript
      // Esto es una simplificación, en un caso real se necesitaría una implementación más robusta
      for (let i = 0; i < this.combinedData.index.length; i++) {
        const date = this.combinedData.index[i];
        const fgIndex = this.fearGreedData.index.findIndex(d => d.getTime() === date.getTime());
        
        if (fgIndex !== -1) {
          this.combinedData['fear_greed_index'][i] = this.fearGreedData['fear_greed_index'][fgIndex];
        }
      }
    }
    
    // Añadir reservas en exchanges si están disponibles
    if (this.exchangeReservesData !== null) {
      // Similar al merge anterior
      for (let i = 0; i < this.combinedData.index.length; i++) {
        const date = this.combinedData.index[i];
        const erIndex = this.exchangeReservesData.index.findIndex(d => d.getTime() === date.getTime());
        
        if (erIndex !== -1) {
          this.combinedData['exchange_reserves'][i] = this.exchangeReservesData['exchange_reserves'][erIndex];
        }
      }
    }
    
    // Añadir métricas on-chain si están disponibles
    if (this.onchainData !== null) {
      for (const [metricName, metricDf] of Object.entries(this.onchainData)) {
        if (metricDf !== null) {
          // Similar al merge anterior
          for (let i = 0; i < this.combinedData.index.length; i++) {
            const date = this.combinedData.index[i];
            const metricIndex = metricDf.index.findIndex(d => d.getTime() === date.getTime());
            
            if (metricIndex !== -1) {
              this.combinedData[metricName][i] = metricDf[metricName][metricIndex];
            }
          }
        }
      }
    }
    
    // Rellenar valores faltantes
    // Implementación simplificada de ffill y bfill
    for (const col of this.combinedData.columns) {
      // Forward fill
      let lastValidValue: number | null = null;
      for (let i = 0; i < this.combinedData[col].length; i++) {
        if (!isNaN(this.combinedData[col][i])) {
          lastValidValue = this.combinedData[col][i];
        } else if (lastValidValue !== null) {
          this.combinedData[col][i] = lastValidValue;
        }
      }
      
      // Backward fill
      lastValidValue = null;
      for (let i = this.combinedData[col].length - 1; i >= 0; i--) {
        if (!isNaN(this.combinedData[col][i])) {
          lastValidValue = this.combinedData[col][i];
        } else if (lastValidValue !== null) {
          this.combinedData[col][i] = lastValidValue;
        }
      }
    }
    
    console.log("Datos combinados con éxito.");
    return true;
  }

  /**
   * Entrena el modelo de predicción
   * @param featureCols - Lista de columnas a usar como características
   * @param sequenceLength - Longitud de la secuencia para LSTM
   * @param predictionDays - Días a predecir en el futuro
   * @returns Éxito de la operación
   */
  async trainPredictionModel(
    featureCols: string[] | null = null,
    sequenceLength: number = 60,
    predictionDays: number = 30
  ): Promise<boolean> {
    if (this.combinedData === null) {
      console.log("No hay datos combinados disponibles. Ejecutar combineAllData primero.");
      return false;
    }
    
    if (featureCols === null) {
      featureCols = ['close', 'volume', 'RSI', 'MACD'];
      // Añadir columnas adicionales si están disponibles
      for (const col of ['fear_greed_index', 'exchange_reserves', 'mvrv_z_score', 'nupl']) {
        if (this.combinedData.columns.includes(col)) {
          featureCols.push(col);
        }
      }
    }
    
    console.log(`Entrenando modelo de predicción con características: ${featureCols}`);
    
    try {
      // Preparar datos para el entrenamiento
      const [XTrain, XTest, yTrain, yTest] = this.mlPredictor.prepareData(
        this.combinedData,
        'close',
        featureCols,
        sequenceLength,
        predictionDays
      );
      
      // Entrenar modelo
      const history = await this.mlPredictor.trainModel(XTrain, yTrain);
      
      // Evaluar modelo
      const [metrics, yTrue, yPred] = await this.mlPredictor.evaluateModel(XTest, yTest);
      
      console.log("Métricas de evaluación del modelo:");
      for (const [metricName, metricValue] of Object.entries(metrics)) {
        console.log(`${metricName}: ${metricValue.toFixed(4)}`);
      }
      
      this.predictionResults = {
        metrics,
        yTrue,
        yPred
      };
      
      this.modelTrained = true;
      console.log("Modelo entrenado con éxito.");
      
      // Liberar tensores
      XTrain.dispose();
      XTest.dispose();
      yTrain.dispose();
      yTest.dispose();
      
      return true;
    } catch (e) {
      console.log(`Error al entrenar el modelo: ${e}`);
      return false;
    }
  }

  /**
   * Predice precios futuros
   * @param days - Número de días a predecir
   * @returns Predicciones de precios
   */
  async predictFuturePrices(days: number = 30): Promise<number[] | null> {
    if (!this.modelTrained) {
      console.log("El modelo no ha sido entrenado. Ejecutar trainPredictionModel primero.");
      return null;
    }
    
    console.log(`Prediciendo precios para los próximos ${days} días...`);
    
    // Obtener la última secuencia de datos
    const featureCols = ['close', 'volume', 'RSI', 'MACD'];
    for (const col of ['fear_greed_index', 'exchange_reserves', 'mvrv_z_score', 'nupl']) {
      if (this.combinedData!.columns.includes(col)) {
        featureCols.push(col);
      }
    }
    
    // Extraer la última secuencia
    const lastSequenceData: number[][] = [];
    for (let i = this.combinedData!.index.length - 60; i < this.combinedData!.index.length; i++) {
      const row: number[] = [];
      for (const col of featureCols) {
        row.push(this.combinedData![col][i]);
      }
      lastSequenceData.push(row);
    }
    
    // Predecir precios futuros
    const predictions = await this.mlPredictor.predictFuture(lastSequenceData, days);
    
    console.log("Predicciones completadas.");
    return predictions;
  }

  /**
   * Genera señales de trading basadas en análisis técnico y fundamental
   * @returns DataFrame con señales de trading
   */
  generateTradingSignals(): DataFrame | null {
    if (this.combinedData === null) {
      console.log("No hay datos combinados disponibles. Ejecutar combineAllData primero.");
      return null;
    }
    
    console.log("Generando señales de trading...");
    
    const signals = new danfojs.DataFrame([], { index: this.combinedData.index });
    signals['close'] = this.combinedData['close'];
    
    // Señales basadas en medias móviles
    if (this.combinedData.columns.includes('MA_50') && this.combinedData.columns.includes('MA_200')) {
      const goldenCross: boolean[] = [];
      const deathCross: boolean[] = [];
      
      for (let i = 1; i < this.combinedData.index.length; i++) {
        goldenCross.push(
          this.combinedData['MA_50'][i] > this.combinedData['MA_200'][i] &&
          this.combinedData['MA_50'][i-1] <= this.combinedData['MA_200'][i-1]
        );
        
        deathCross.push(
          this.combinedData['MA_50'][i] < this.combinedData['MA_200'][i] &&
          this.combinedData['MA_50'][i-1] >= this.combinedData['MA_200'][i-1]
        );
      }
      
      // Añadir un valor inicial para mantener la longitud
      goldenCross.unshift(false);
      deathCross.unshift(false);
      
      signals['golden_cross'] = goldenCross;
      signals['death_cross'] = deathCross;
    }
    
    // Señales basadas en RSI
    if (this.combinedData.columns.includes('RSI')) {
      signals['rsi_oversold'] = this.combinedData['RSI'].map((val: number) => val < 30);
      signals['rsi_overbought'] = this.combinedData['RSI'].map((val: number) => val > 70);
    }
    
    // Señales basadas en MACD
    if (this.combinedData.columns.includes('MACD') && this.combinedData.columns.includes('MACD_signal')) {
      const macdBullishCross: boolean[] = [];
      const macdBearishCross: boolean[] = [];
      
      for (let i = 1; i < this.combinedData.index.length; i++) {
        macdBullishCross.push(
          this.combinedData['MACD'][i] > this.combinedData['MACD_signal'][i] &&
          this.combinedData['MACD'][i-1] <= this.combinedData['MACD_signal'][i-1]
        );
        
        macdBearishCross.push(
          this.combinedData['MACD'][i] < this.combinedData['MACD_signal'][i] &&
          this.combinedData['MACD'][i-1] >= this.combinedData['MACD_signal'][i-1]
        );
      }
      
      // Añadir un valor inicial para mantener la longitud
      macdBullishCross.unshift(false);
      macdBearishCross.unshift(false);
      
      signals['macd_bullish_cross'] = macdBullishCross;
      signals['macd_bearish_cross'] = macdBearishCross;
    }
    
    // Señales basadas en bandas de Bollinger
    if (this.combinedData.columns.includes('BB_lower') && this.combinedData.columns.includes('BB_upper')) {
      signals['price_below_lower_band'] = this.combinedData.index.map((_, i) => 
        this.combinedData!['close'][i] < this.combinedData!['BB_lower'][i]
      );
      
      signals['price_above_upper_band'] = this.combinedData.index.map((_, i) => 
        this.combinedData!['close'][i] > this.combinedData!['BB_upper'][i]
      );
    }
    
    // Señales basadas en miedo y codicia si está disponible
    if (this.combinedData.columns.includes('fear_greed_index')) {
      signals['extreme_fear'] = this.combinedData['fear_greed_index'].map((val: number) => val <= 20);
      signals['extreme_greed'] = this.combinedData['fear_greed_index'].map((val: number) => val >= 80);
    }
    
    // Señales basadas en MVRV Z-Score si está disponible
    if (this.combinedData.columns.includes('mvrv_z_score')) {
      signals['mvrv_buy_zone'] = this.combinedData['mvrv_z_score'].map((val: number) => val < 0);
      signals['mvrv_sell_zone'] = this.combinedData['mvrv_z_score'].map((val: number) => val > 7);
    }
    
    // Combinar señales para generar señal final
    signals['buy_signal'] = signals.index.map((_, i) => {
      let buySignalCount = 0;
      let totalSignals = 0;
      
      if (signals.columns.includes('golden_cross')) {
        totalSignals++;
        if (signals['golden_cross'][i]) buySignalCount++;
      }
      
      if (signals.columns.includes('rsi_oversold')) {
        totalSignals++;
        if (signals['rsi_oversold'][i]) buySignalCount++;
      }
      
      if (signals.columns.includes('macd_bullish_cross')) {
        totalSignals++;
        if (signals['macd_bullish_cross'][i]) buySignalCount++;
      }
      
      if (signals.columns.includes('price_below_lower_band')) {
        totalSignals++;
        if (signals['price_below_lower_band'][i]) buySignalCount++;
      }
      
      if (signals.columns.includes('extreme_fear')) {
        totalSignals++;
        if (signals['extreme_fear'][i]) buySignalCount++;
      }
      
      if (signals.columns.includes('mvrv_buy_zone')) {
        totalSignals++;
        if (signals['mvrv_buy_zone'][i]) buySignalCount++;
      }
      
      // Considerar señal de compra si más del 50% de los indicadores lo sugieren
      return buySignalCount > 0 && (buySignalCount / totalSignals) >= 0.5;
    });
    
    signals['sell_signal'] = signals.index.map((_, i) => {
      let sellSignalCount = 0;
      let totalSignals = 0;
      
      if (signals.columns.includes('death_cross')) {
        totalSignals++;
        if (signals['death_cross'][i]) sellSignalCount++;
      }
      
      if (signals.columns.includes('rsi_overbought')) {
        totalSignals++;
        if (signals['rsi_overbought'][i]) sellSignalCount++;
      }
      
      if (signals.columns.includes('macd_bearish_cross')) {
        totalSignals++;
        if (signals['macd_bearish_cross'][i]) sellSignalCount++;
      }
      
      if (signals.columns.includes('price_above_upper_band')) {
        totalSignals++;
        if (signals['price_above_upper_band'][i]) sellSignalCount++;
      }
      
      if (signals.columns.includes('extreme_greed')) {
        totalSignals++;
        if (signals['extreme_greed'][i]) sellSignalCount++;
      }
      
      if (signals.columns.includes('mvrv_sell_zone')) {
        totalSignals++;
        if (signals['mvrv_sell_zone'][i]) sellSignalCount++;
      }
      
      // Considerar señal de venta si más del 50% de los indicadores lo sugieren
      return sellSignalCount > 0 && (sellSignalCount / totalSignals) >= 0.5;
    });
    
    console.log("Señales de trading generadas con éxito.");
    return signals;
  }

  /**
   * Visualiza los resultados del análisis
   */
  visualizeResults(): void {
    if (this.priceData === null) {
      console.log("No hay datos de precios disponibles. Ejecutar collectData primero.");
      return;
    }
    
    console.log("Visualizando resultados del análisis...");
    
    // Visualizar precio con indicadores técnicos
    this.visualizer.plotPriceWithIndicators(this.priceData);
    
    // Visualizar métricas fundamentales si están disponibles
    if (this.combinedData !== null) {
      const fundamentalCols = ['fear_greed_index', 'exchange_reserves', 'mvrv_z_score', 'nupl'].filter(
        col => this.combinedData!.columns.includes(col)
      );
      
      if (fundamentalCols.length > 0) {
        const fundamentalDf = new danfojs.DataFrame([], { index: this.combinedData.index });
        for (const col of fundamentalCols) {
          fundamentalDf[col] = this.combinedData[col];
        }
        
        this.visualizer.plotFundamentalMetrics(fundamentalDf);
      }
    }
    
    // Visualizar resultados de predicción si el modelo ha sido entrenado
    if (this.predictionResults !== null) {
      this.visualizer.plotPredictionResults(
        this.predictionResults.yTrue,
        this.predictionResults.yPred
      );
    }
    
    console.log("Visualización completada.");
  }

  /**
   * Ejecuta una simulación completa del sistema
   * @param symbol - Par de trading
   * @param timeframe - Intervalo de tiempo
   * @param predictionDays - Días a predecir
   * @returns Éxito de la operación
   */
  async runFullSimulation(
    symbol: string = 'BTC/USDT',
    timeframe: string = '1d',
    predictionDays: number = 30
  ): Promise<boolean> {
    console.log(`Iniciando simulación completa para ${symbol}...`);
    
    // Recolectar datos
    const dataCollected = await this.collectData(symbol, timeframe);
    if (!dataCollected) {
      console.log("Error al recolectar datos. Abortando simulación.");
      return false;
    }
    
    // Preparar indicadores técnicos
    const indicatorsPrepared = this.prepareTechnicalIndicators();
    if (!indicatorsPrepared) {
      console.log("Error al preparar indicadores técnicos. Abortando simulación.");
      return false;
    }
    
    // Combinar datos
    const dataCombined = this.combineAllData();
    if (!dataCombined) {
      console.log("Error al combinar datos. Abortando simulación.");
      return false;
    }
    
    // Entrenar modelo de predicción
    const modelTrained = await this.trainPredictionModel(null, 60, predictionDays);
    if (!modelTrained) {
      console.log("Error al entrenar modelo de predicción. Abortando simulación.");
      return false;
    }
    
    // Predecir precios futuros
    const predictions = await this.predictFuturePrices(predictionDays);
    if (predictions === null) {
      console.log("Error al predecir precios futuros. Abortando simulación.");
      return false;
    }
    
    // Generar señales de trading
    const signals = this.generateTradingSignals();
    if (signals === null) {
      console.log("Error al generar señales de trading. Abortando simulación.");
      return false;
    }
    
    // Visualizar resultados
    this.visualizeResults();
    
    // Mostrar predicciones futuras
    const lastPrice = this.priceData!.close[this.priceData!.close.length - 1];
    this.visualizer.plotFuturePredictions(lastPrice, predictions);
    
    // Calcular niveles de gestión de riesgo para una posible entrada
    const entryPrice = lastPrice;
    const stopLoss = this.riskManager.setStopLoss(entryPrice);
    const takeProfitLevels = this.riskManager.setTakeProfitLevels(entryPrice);
    
    this.visualizer.plotRiskRewardAnalysis(entryPrice, stopLoss, takeProfitLevels);
    
    console.log("Simulación completada con éxito.");
    return true;
  }
}

// Exportar clases para su uso
export {
  CryptoDataCollector,
  TechnicalAnalysis,
  FundamentalAnalysis,
  MachineLearningPredictor,
  RiskManagement,
  Visualization,
  CryptoPredictionSystem
};
