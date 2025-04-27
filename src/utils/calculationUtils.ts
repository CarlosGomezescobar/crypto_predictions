/**
 * Funciones de utilidad para formateo de datos y cálculos
 */

/**
 * Formatea un número como moneda
 * @param value Valor a formatear
 * @param currency Código de moneda (por defecto USD)
 * @param decimals Número de decimales
 * @returns Cadena formateada como moneda
 */
export const formatCurrency = (
    value: number,
    currency: string = 'USD',
    decimals: number = 2
  ): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };
  
  /**
   * Formatea un número como porcentaje
   * @param value Valor a formatear (0.1 = 10%)
   * @param decimals Número de decimales
   * @returns Cadena formateada como porcentaje
   */
  export const formatPercent = (value: number, decimals: number = 2): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };
  
  /**
   * Formatea una fecha
   * @param date Fecha a formatear
   * @param format Formato ('short', 'medium', 'long', 'full')
   * @returns Cadena de fecha formateada
   */
  export const formatDate = (
    date: Date | string | number,
    format: 'short' | 'medium' | 'long' | 'full' = 'medium'
  ): string => {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: format === 'short' ? '2-digit' : 'long',
      day: '2-digit'
    };
    
    if (format === 'long' || format === 'full') {
      options.weekday = format === 'full' ? 'long' : 'short';
    }
    
    if (format === 'full') {
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.second = '2-digit';
    }
    
    return new Intl.DateTimeFormat('es-ES', options).format(dateObj);
  };
  
  /**
   * Calcula el cambio porcentual entre dos valores
   * @param currentValue Valor actual
   * @param previousValue Valor anterior
   * @returns Cambio porcentual
   */
  export const calculatePercentChange = (
    currentValue: number,
    previousValue: number
  ): number => {
    if (previousValue === 0) return 0;
    return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
  };
  
  /**
   * Calcula la media móvil simple
   * @param data Array de datos
   * @param period Período para la media móvil
   * @returns Array con la media móvil
   */
  export const calculateSMA = (data: number[], period: number): number[] => {
    const result: number[] = [];
    
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result.push(NaN);
        continue;
      }
      
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j];
      }
      
      result.push(sum / period);
    }
    
    return result;
  };
  
  /**
   * Calcula la media móvil exponencial
   * @param data Array de datos
   * @param period Período para la media móvil
   * @returns Array con la media móvil exponencial
   */
  export const calculateEMA = (data: number[], period: number): number[] => {
    const result: number[] = [];
    const multiplier = 2 / (period + 1);
    
    // Calcular la primera EMA como SMA
    let ema = data.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
    
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result.push(NaN);
        continue;
      }
      
      if (i === period - 1) {
        result.push(ema);
        continue;
      }
      
      // Fórmula EMA: (Precio actual - EMA anterior) * multiplicador + EMA anterior
      ema = (data[i] - ema) * multiplier + ema;
      result.push(ema);
    }
    
    return result;
  };
  
  /**
   * Calcula el RSI (Relative Strength Index)
   * @param data Array de datos
   * @param period Período para el RSI
   * @returns Array con el RSI
   */
  export const calculateRSI = (data: number[], period: number = 14): number[] => {
    const result: number[] = [];
    const changes: number[] = [];
    
    // Calcular cambios
    for (let i = 1; i < data.length; i++) {
      changes.push(data[i] - data[i - 1]);
    }
    
    // Inicializar arrays para ganancias y pérdidas
    const gains: number[] = changes.map(change => change > 0 ? change : 0);
    const losses: number[] = changes.map(change => change < 0 ? Math.abs(change) : 0);
    
    // Calcular RS y RSI
    for (let i = 0; i < data.length; i++) {
      if (i < period) {
        result.push(NaN);
        continue;
      }
      
      // Calcular promedio de ganancias y pérdidas
      const avgGain = gains.slice(i - period, i).reduce((sum, gain) => sum + gain, 0) / period;
      const avgLoss = losses.slice(i - period, i).reduce((sum, loss) => sum + loss, 0) / period;
      
      // Evitar división por cero
      if (avgLoss === 0) {
        result.push(100);
        continue;
      }
      
      // Calcular RS y RSI
      const rs = avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      
      result.push(rsi);
    }
    
    return result;
  };
  
  /**
   * Calcula el MACD (Moving Average Convergence Divergence)
   * @param data Array de datos
   * @param fastPeriod Período para la EMA rápida
   * @param slowPeriod Período para la EMA lenta
   * @param signalPeriod Período para la línea de señal
   * @returns Objeto con MACD, señal e histograma
   */
  export const calculateMACD = (
    data: number[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9
  ): { macd: number[]; signal: number[]; histogram: number[] } => {
    // Calcular EMAs
    const fastEMA = calculateEMA(data, fastPeriod);
    const slowEMA = calculateEMA(data, slowPeriod);
    
    // Calcular MACD
    const macd: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (isNaN(fastEMA[i]) || isNaN(slowEMA[i])) {
        macd.push(NaN);
      } else {
        macd.push(fastEMA[i] - slowEMA[i]);
      }
    }
    
    // Calcular señal (EMA del MACD)
    const signal = calculateEMA(
      macd.filter(value => !isNaN(value)),
      signalPeriod
    );
    
    // Ajustar longitud de la señal
    const fullSignal: number[] = [];
    let signalIndex = 0;
    
    for (let i = 0; i < data.length; i++) {
      if (isNaN(macd[i])) {
        fullSignal.push(NaN);
      } else if (i < slowPeriod + signalPeriod - 2) {
        fullSignal.push(NaN);
      } else {
        fullSignal.push(signal[signalIndex++]);
      }
    }
    
    // Calcular histograma
    const histogram: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (isNaN(macd[i]) || isNaN(fullSignal[i])) {
        histogram.push(NaN);
      } else {
        histogram.push(macd[i] - fullSignal[i]);
      }
    }
    
    return { macd, signal: fullSignal, histogram };
  };
  
  /**
   * Calcula las Bandas de Bollinger
   * @param data Array de datos
   * @param period Período para la media móvil
   * @param stdDev Número de desviaciones estándar
   * @returns Objeto con bandas superior, media e inferior
   */
  export const calculateBollingerBands = (
    data: number[],
    period: number = 20,
    stdDev: number = 2
  ): { upper: number[]; middle: number[]; lower: number[] } => {
    // Calcular SMA
    const sma = calculateSMA(data, period);
    
    // Calcular bandas
    const upper: number[] = [];
    const lower: number[] = [];
    
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        upper.push(NaN);
        lower.push(NaN);
        continue;
      }
      
      // Calcular desviación estándar
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += Math.pow(data[i - j] - sma[i], 2);
      }
      
      const std = Math.sqrt(sum / period);
      
      upper.push(sma[i] + (std * stdDev));
      lower.push(sma[i] - (std * stdDev));
    }
    
    return { upper, middle: sma, lower };
  };
  
  /**
   * Calcula niveles de Fibonacci
   * @param high Precio más alto
   * @param low Precio más bajo
   * @returns Objeto con niveles de Fibonacci
   */
  export const calculateFibonacciLevels = (
    high: number,
    low: number
  ): { level0: number; level236: number; level382: number; level500: number; level618: number; level786: number; level1000: number } => {
    const diff = high - low;
    
    return {
      level0: high,
      level236: high - (diff * 0.236),
      level382: high - (diff * 0.382),
      level500: high - (diff * 0.5),
      level618: high - (diff * 0.618),
      level786: high - (diff * 0.786),
      level1000: low
    };
  };
  
  /**
   * Calcula niveles de soporte y resistencia
   * @param data Array de precios
   * @param periods Número de períodos para buscar
   * @returns Objeto con niveles de soporte y resistencia
   */
  export const calculateSupportResistance = (
    data: number[],
    periods: number = 5
  ): { support: number[]; resistance: number[] } => {
    const support: number[] = [];
    const resistance: number[] = [];
    
    // Buscar mínimos locales (soporte)
    for (let i = periods; i < data.length - periods; i++) {
      let isSupport = true;
      
      for (let j = i - periods; j < i; j++) {
        if (data[i] > data[j]) {
          isSupport = false;
          break;
        }
      }
      
      for (let j = i + 1; j <= i + periods; j++) {
        if (data[i] > data[j]) {
          isSupport = false;
          break;
        }
      }
      
      if (isSupport) {
        support.push(data[i]);
      }
    }
    
    // Buscar máximos locales (resistencia)
    for (let i = periods; i < data.length - periods; i++) {
      let isResistance = true;
      
      for (let j = i - periods; j < i; j++) {
        if (data[i] < data[j]) {
          isResistance = false;
          break;
        }
      }
      
      for (let j = i + 1; j <= i + periods; j++) {
        if (data[i] < data[j]) {
          isResistance = false;
          break;
        }
      }
      
      if (isResistance) {
        resistance.push(data[i]);
      }
    }
    
    return { support, resistance };
  };
  
  /**
   * Normaliza un array de datos al rango [0, 1]
   * @param data Array de datos
   * @returns Array normalizado
   */
  export const normalizeData = (data: number[]): number[] => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    
    if (max === min) return data.map(() => 0.5);
    
    return data.map(value => (value - min) / (max - min));
  };
  
  /**
   * Desnormaliza un array de datos desde [0, 1] al rango original
   * @param normalizedData Array normalizado
   * @param min Valor mínimo original
   * @param max Valor máximo original
   * @returns Array desnormalizado
   */
  export const denormalizeData = (
    normalizedData: number[],
    min: number,
    max: number
  ): number[] => {
    return normalizedData.map(value => (value * (max - min)) + min);
  };
  
  /**
   * Calcula la correlación entre dos arrays de datos
   * @param data1 Primer array de datos
   * @param data2 Segundo array de datos
   * @returns Coeficiente de correlación (-1 a 1)
   */
  export const calculateCorrelation = (data1: number[], data2: number[]): number => {
    if (data1.length !== data2.length || data1.length === 0) {
      return 0;
    }
    
    const n = data1.length;
    
    // Calcular medias
    const mean1 = data1.reduce((sum, value) => sum + value, 0) / n;
    const mean2 = data2.reduce((sum, value) => sum + value, 0) / n;
    
    // Calcular desviaciones
    let sum1 = 0;
    let sum2 = 0;
    let sum12 = 0;
    
    for (let i = 0; i < n; i++) {
      const dev1 = data1[i] - mean1;
      const dev2 = data2[i] - mean2;
      
      sum1 += dev1 * dev1;
      sum2 += dev2 * dev2;
      sum12 += dev1 * dev2;
    }
    
    if (sum1 === 0 || sum2 === 0) {
      return 0;
    }
    
    return sum12 / (Math.sqrt(sum1) * Math.sqrt(sum2));
  };
  
  /**
   * Calcula el ratio de Sharpe
   * @param returns Array de retornos
   * @param riskFreeRate Tasa libre de riesgo
   * @returns Ratio de Sharpe
   */
  export const calculateSharpeRatio = (
    returns: number[],
    riskFreeRate: number = 0
  ): number => {
    if (returns.length === 0) {
      return 0;
    }
    
    // Calcular retorno promedio
    const meanReturn = returns.reduce((sum, value) => sum + value, 0) / returns.length;
    
    // Calcular desviación estándar
    let sumSquaredDev = 0;
    for (const ret of returns) {
      sumSquaredDev += Math.pow(ret - meanReturn, 2);
    }
    
    const stdDev = Math.sqrt(sumSquaredDev / returns.length);
    
    if (stdDev === 0) {
      return 0;
    }
    
    // Calcular ratio de Sharpe
    return (meanReturn - riskFreeRate) / stdDev;
  };
  
  /**
   * Calcula el drawdown máximo
   * @param data Array de precios o valores
   * @returns Drawdown máximo como porcentaje
   */
  export const calculateMaxDrawdown = (data: number[]): number => {
    if (data.length === 0) {
      return 0;
    }
    
    let maxValue = data[0];
    let maxDrawdown = 0;
    
    for (const value of data) {
      if (value > maxValue) {
        maxValue = value;
      }
      
      const drawdown = (maxValue - value) / maxValue;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    return maxDrawdown * 100;
  };
  
  /**
   * Calcula el porcentaje de Kelly para dimensionamiento de posiciones
   * @param winRate Tasa de acierto (0-1)
   * @param winLossRatio Ratio de ganancia/pérdida
   * @returns Porcentaje de Kelly
   */
  export const calculateKellyPercentage = (
    winRate: number,
    winLossRatio: number
  ): number => {
    return Math.max(0, winRate - ((1 - winRate) / winLossRatio));
  };
  
  /**
   * Genera fechas futuras a partir de una fecha inicial
   * @param startDate Fecha inicial
   * @param days Número de días a generar
   * @returns Array de fechas futuras
   */
  export const generateFutureDates = (
    startDate: Date,
    days: number
  ): Date[] => {
    const dates: Date[] = [];
    
    for (let i = 1; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };
  
  /**
   * Convierte un color hexadecimal a RGBA
   * @param hex Color hexadecimal
   * @param alpha Valor de transparencia (0-1)
   * @returns Color en formato RGBA
   */
  export const hexToRgba = (hex: string, alpha: number = 1): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  /**
   * Genera una paleta de colores para gráficos
   * @param baseColor Color base en formato hexadecimal
   * @param count Número de colores a generar
   * @returns Array de colores en formato hexadecimal
   */
  export const generateColorPalette = (
    baseColor: string = '#3B82F6',
    count: number = 5
  ): string[] => {
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    
    const palette: string[] = [baseColor];
    
    // Generar variaciones del color base
    for (let i = 1; i < count; i++) {
      const factor = 0.8 - (i * 0.15);
      
      const newR = Math.min(255, Math.round(r * factor));
      const newG = Math.min(255, Math.round(g * factor));
      const newB = Math.min(255, Math.round(b * factor));
      
      const newColor = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
      palette.push(newColor);
    }
    
    return palette;
  };
  
  /**
   * Trunca un texto a una longitud máxima
   * @param text Texto a truncar
   * @param maxLength Longitud máxima
   * @param suffix Sufijo a añadir si se trunca
   * @returns Texto truncado
   */
  export const truncateText = (
    text: string,
    maxLength: number = 50,
    suffix: string = '...'
  ): string => {
    if (text.length <= maxLength) {
      return text;
    }
    
    return text.substring(0, maxLength - suffix.length) + suffix;
  };
  
  /**
   * Convierte un timestamp Unix a fecha
   * @param timestamp Timestamp Unix en segundos
   * @returns Objeto Date
   */
  export const unixToDate = (timestamp: number): Date => {
    return new Date(timestamp * 1000);
  };
  
  /**
   * Convierte una fecha a timestamp Unix
   * @param date Objeto Date
   * @returns Timestamp Unix en segundos
   */
  export const dateToUnix = (date: Date): number => {
    return Math.floor(date.getTime() / 1000);
  };
  
  /**
   * Agrupa datos por intervalo de tiempo
   * @param data Array de objetos con timestamp
   * @param interval Intervalo en segundos
   * @param timestampKey Clave del timestamp
   * @param valueKey Clave del valor
   * @returns Array de objetos agrupados
   */
  export const groupDataByTimeInterval = (
    data: any[],
    interval: number,
    timestampKey: string = 'timestamp',
    valueKey: string = 'value'
  ): { timestamp: number; value: number }[] => {
    if (data.length === 0) {
      return [];
    }
  
    const result: { timestamp: number; value: number }[] = [];
    let currentIntervalStart = Math.floor(data[0][timestampKey] / interval) * interval;
    let sum = 0;
    let count = 0;
  
    for (const item of data) {
      const timestamp = item[timestampKey];
      const value = item[valueKey];
  
      // Si estamos dentro del mismo intervalo, acumulamos los valores
      if (Math.floor(timestamp / interval) * interval === currentIntervalStart) {
        sum += value;
        count++;
      } else {
        // Guardamos el promedio del intervalo anterior
        if (count > 0) {
          result.push({ timestamp: currentIntervalStart, value: sum / count });
        }
  
        // Comenzamos un nuevo intervalo
        currentIntervalStart = Math.floor(timestamp / interval) * interval;
        sum = value;
        count = 1;
      }
    }
  
    // Añadimos el último intervalo
    if (count > 0) {
      result.push({ timestamp: currentIntervalStart, value: sum / count });
    }
  
    return result;
  };
  /**
 * Calcula el cambio porcentual acumulado entre dos series de datos
 * @param data1 Array de datos inicial
 * @param data2 Array de datos final
 * @returns Cambio porcentual acumulado
 */
export const calculateCumulativePercentChange = (
  data1: number[],
  data2: number[]
): number => {
  if (data1.length !== data2.length || data1.length === 0) {
    return 0;
  }

  const initialSum = data1.reduce((sum, value) => sum + value, 0);
  const finalSum = data2.reduce((sum, value) => sum + value, 0);

  return ((finalSum - initialSum) / initialSum) * 100;
};
/**
 * Detecta cruces entre dos series de datos
 * @param shortSeries Serie corta (ej. SMA 50)
 * @param longSeries Serie larga (ej. SMA 200)
 * @returns Array de señales de cruce
 */
export const detectCrosses = (
  shortSeries: number[],
  longSeries: number[]
): { index: number; type: 'golden' | 'death' }[] => {
  const signals: { index: number; type: 'golden' | 'death' }[] = [];

  for (let i = 1; i < shortSeries.length; i++) {
    const prevShort = shortSeries[i - 1];
    const currShort = shortSeries[i];
    const prevLong = longSeries[i - 1];
    const currLong = longSeries[i];

    if (prevShort <= prevLong && currShort > currLong) {
      signals.push({ index: i, type: 'golden' });
    } else if (prevShort >= prevLong && currShort < currLong) {
      signals.push({ index: i, type: 'death' });
    }
  }

  return signals;
};
/**
 * Calcula la volatilidad histórica
 * @param prices Array de precios
 * @param period Período para calcular la volatilidad
 * @returns Volatilidad histórica
 */
export const calculateHistoricalVolatility = (
  prices: number[],
  period: number = 30
): number => {
  if (prices.length < period) {
    return 0;
  }

  const logReturns = [];
  for (let i = 1; i < prices.length; i++) {
    logReturns.push(Math.log(prices[i] / prices[i - 1]));
  }

  const meanLogReturn =
    logReturns.slice(-period).reduce((sum, value) => sum + value, 0) / period;
  const squaredDeviations = logReturns
    .slice(-period)
    .map((logReturn) => Math.pow(logReturn - meanLogReturn, 2));
  const variance =
    squaredDeviations.reduce((sum, value) => sum + value, 0) / period;

  return Math.sqrt(variance) * Math.sqrt(365); // Anualizada
};
/**
 * Normaliza un array de datos
 * @param data Array de datos
 * @returns Array normalizado
 */
export const normalizeData = (data: number[]): number[] => {
  if (data.length === 0) {
    return [];
  }

  const min = Math.min(...data);
  const max = Math.max(...data);

  if (max === min) {
    return data.map(() => 1); // Evitar división por cero
  }

  return data.map((value) => (value - min) / (max - min));
};
/**
 * Calcula el RSI (Relative Strength Index) optimizado
 * @param data Array de datos
 * @param period Período para el RSI
 * @returns Array con el RSI
 */
export const calculateOptimizedRSI = (
  data: number[],
  period: number = 14
): number[] => {
  const result: number[] = [];
  const changes: number[] = [];

  for (let i = 1; i < data.length; i++) {
    changes.push(data[i] - data[i - 1]);
  }

  const gains = changes.map((change) => (change > 0 ? change : 0));
  const losses = changes.map((change) => (change < 0 ? Math.abs(change) : 0));

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result.push(NaN);
      continue;
    }

    const avgGain =
      gains.slice(i - period, i).reduce((sum, gain) => sum + gain, 0) / period;
    const avgLoss =
      losses.slice(i - period, i).reduce((sum, loss) => sum + loss, 0) / period;

    if (avgLoss === 0) {
      result.push(100);
    } else {
      const rs = avgGain / avgLoss;
      result.push(100 - 100 / (1 + rs));
    }
  }

  return result;
};
