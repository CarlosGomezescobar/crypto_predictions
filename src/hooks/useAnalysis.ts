import { useState, useEffect, useCallback } from 'react';
import { PriceData, TechnicalIndicator, BacktestResult, RiskAnalysis, ModelTrainingOptions } from '../types';
import PredictionService from '../services/PredictionService';
import { useLoadingState } from './useAppState';

/**
 * Hook avanzado para gestionar el análisis técnico
 * @param symbol Par de trading
 * @param timeframe Intervalo de tiempo
 * @returns Indicadores técnicos y funciones relacionadas
 */
export const useTechnicalAnalysis = (symbol: string, timeframe: string) => {
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([]);
  const [supportLevels, setSupportLevels] = useState<number[]>([]);
  const [resistanceLevels, setResistanceLevels] = useState<number[]>([]);
  const [trendDirection, setTrendDirection] = useState<'up' | 'down' | 'sideways'>('sideways');
  const [trendStrength, setTrendStrength] = useState<number>(0);
  const { isLoading, error, executeWithLoading } = useLoadingState();

  // Calcular indicadores técnicos
  const calculateIndicators = useCallback(async () => {
    await executeWithLoading(async () => {
      const predictionService = PredictionService.getInstance();
      const priceData = predictionService.getPriceData();
      
      if (!priceData) {
        throw new Error('No hay datos de precios disponibles');
      }
      
      // Calcular indicadores
      const newIndicators: TechnicalIndicator[] = [];
      
      // RSI
      if (priceData.columns.includes('RSI')) {
        newIndicators.push({
          name: 'RSI',
          values: priceData.RSI,
          description: 'Índice de Fuerza Relativa',
          interpretation: 'Valores por encima de 70 indican sobrecompra, por debajo de 30 indican sobreventa.'
        });
      }
      
      // MACD
      if (priceData.columns.includes('MACD') && priceData.columns.includes('MACD_signal')) {
        newIndicators.push({
          name: 'MACD',
          values: priceData.MACD,
          description: 'Moving Average Convergence Divergence',
          interpretation: 'Cruce de MACD por encima de la línea de señal indica tendencia alcista, por debajo indica tendencia bajista.'
        });
      }
      
      // Medias Móviles
      if (priceData.columns.includes('MA_50') && priceData.columns.includes('MA_200')) {
        newIndicators.push({
          name: 'MA_50',
          values: priceData.MA_50,
          description: 'Media Móvil de 50 períodos',
          interpretation: 'Precio por encima de MA_50 indica tendencia alcista a medio plazo.'
        });
        
        newIndicators.push({
          name: 'MA_200',
          values: priceData.MA_200,
          description: 'Media Móvil de 200 períodos',
          interpretation: 'Precio por encima de MA_200 indica tendencia alcista a largo plazo.'
        });
        
        // Determinar dirección de tendencia
        const lastPrice = priceData.close[priceData.close.length - 1];
        const lastMA50 = priceData.MA_50[priceData.MA_50.length - 1];
        const lastMA200 = priceData.MA_200[priceData.MA_200.length - 1];
        
        if (lastPrice > lastMA50 && lastMA50 > lastMA200) {
          setTrendDirection('up');
          setTrendStrength(0.8);
        } else if (lastPrice < lastMA50 && lastMA50 < lastMA200) {
          setTrendDirection('down');
          setTrendStrength(0.8);
        } else {
          setTrendDirection('sideways');
          setTrendStrength(0.3);
        }
      }
      
      // Bandas de Bollinger
      if (priceData.columns.includes('BB_upper') && 
          priceData.columns.includes('BB_middle') && 
          priceData.columns.includes('BB_lower')) {
        newIndicators.push({
          name: 'Bollinger_Bands',
          values: priceData.BB_middle,
          description: 'Bandas de Bollinger',
          interpretation: 'Precio cerca de la banda superior indica posible sobrecompra, cerca de la banda inferior indica posible sobreventa.'
        });
      }
      
      setIndicators(newIndicators);
      
      // Calcular niveles de soporte y resistencia
      // Simplificación: usamos mínimos y máximos locales
      const prices = priceData.close;
      const window = 10;
      const supports: number[] = [];
      const resistances: number[] = [];
      
      for (let i = window; i < prices.length - window; i++) {
        // Verificar si es un mínimo local (soporte)
        let isSupport = true;
        for (let j = 1; j <= window; j++) {
          if (prices[i] > prices[i-j] || prices[i] > prices[i+j]) {
            isSupport = false;
            break;
          }
        }
        
        if (isSupport) {
          supports.push(prices[i]);
        }
        
        // Verificar si es un máximo local (resistencia)
        let isResistance = true;
        for (let j = 1; j <= window; j++) {
          if (prices[i] < prices[i-j] || prices[i] < prices[i+j]) {
            isResistance = false;
            break;
          }
        }
        
        if (isResistance) {
          resistances.push(prices[i]);
        }
      }
      
      setSupportLevels(supports);
      setResistanceLevels(resistances);
      
      return newIndicators;
    });
  }, [symbol, timeframe, executeWithLoading]);

  // Calcular indicadores cuando cambia el símbolo o timeframe
  useEffect(() => {
    calculateIndicators();
  }, [symbol, timeframe, calculateIndicators]);

  return {
    indicators,
    supportLevels,
    resistanceLevels,
    trendDirection,
    trendStrength,
    isLoading,
    error,
    refreshIndicators: calculateIndicators
  };
};

/**
 * Hook para realizar backtesting de estrategias
 * @returns Funciones para realizar backtesting y resultados
 */
export const useBacktesting = () => {
  const [results, setResults] = useState<BacktestResult | null>(null);
  const { isLoading, error, executeWithLoading } = useLoadingState();

  // Realizar backtesting de una estrategia
  const runBacktest = useCallback(async (
    symbol: string,
    startDate: Date,
    endDate: Date,
    strategy: 'ma_crossover' | 'rsi_oversold' | 'macd_signal' | 'bollinger_bands',
    initialBalance: number = 10000
  ) => {
    await executeWithLoading(async () => {
      const predictionService = PredictionService.getInstance();
      const priceData = predictionService.getPriceData();
      
      if (!priceData) {
        throw new Error('No hay datos de precios disponibles');
      }
      
      // Filtrar datos por rango de fechas
      const filteredData: PriceData = {
        index: [],
        columns: priceData.columns,
        close: [],
        open: [],
        high: [],
        low: [],
        volume: []
      };
      
      // Copiar todas las propiedades y columnas
      for (const key of Object.keys(priceData)) {
        if (key !== 'index' && Array.isArray(priceData[key])) {
          filteredData[key] = [];
        }
      }
      
      // Filtrar por fecha
      for (let i = 0; i < priceData.index.length; i++) {
        const date = priceData.index[i];
        if (date >= startDate && date <= endDate) {
          filteredData.index.push(date);
          
          for (const key of Object.keys(priceData)) {
            if (key !== 'index' && Array.isArray(priceData[key])) {
              filteredData[key].push(priceData[key][i]);
            }
          }
        }
      }
      
      if (filteredData.index.length === 0) {
        throw new Error('No hay datos disponibles para el rango de fechas seleccionado');
      }
      
      // Inicializar variables para el backtesting
      let balance = initialBalance;
      let position = 0; // Cantidad de criptomoneda en posesión
      const trades: {
        date: Date;
        type: 'buy' | 'sell';
        price: number;
        quantity: number;
        profit: number;
        runningBalance: number;
      }[] = [];
      
      // Ejecutar estrategia
      for (let i = 1; i < filteredData.index.length; i++) {
        const buySignal = getSignal(filteredData, i, strategy, 'buy');
        const sellSignal = getSignal(filteredData, i, strategy, 'sell');
        
        // Si tenemos señal de compra y no estamos en posición
        if (buySignal && position === 0) {
          const price = filteredData.close[i];
          const quantity = balance / price;
          position = quantity;
          balance = 0;
          
          trades.push({
            date: filteredData.index[i],
            type: 'buy',
            price,
            quantity,
            profit: 0,
            runningBalance: balance + position * price
          });
        }
        // Si tenemos señal de venta y estamos en posición
        else if (sellSignal && position > 0) {
          const price = filteredData.close[i];
          const value = position * price;
          const lastBuyTrade = trades.findLast(t => t.type === 'buy');
          const profit = lastBuyTrade ? value - (lastBuyTrade.price * position) : 0;
          
          trades.push({
            date: filteredData.index[i],
            type: 'sell',
            price,
            quantity: position,
            profit,
            runningBalance: balance + value
          });
          
          balance = value;
          position = 0;
        }
      }
      
      // Liquidar posición final si es necesario
      if (position > 0) {
        const finalPrice = filteredData.close[filteredData.close.length - 1];
        const value = position * finalPrice;
        const lastBuyTrade = trades.findLast(t => t.type === 'buy');
        const profit = lastBuyTrade ? value - (lastBuyTrade.price * position) : 0;
        
        trades.push({
          date: filteredData.index[filteredData.index.length - 1],
          type: 'sell',
          price: finalPrice,
          quantity: position,
          profit,
          runningBalance: balance + value
        });
        
        balance = value;
        position = 0;
      }
      
      // Calcular métricas
      const finalBalance = balance;
      const totalTrades = trades.length;
      const winningTrades = trades.filter(t => t.type === 'sell' && t.profit > 0).length;
      const losingTrades = trades.filter(t => t.type === 'sell' && t.profit <= 0).length;
      const winRate = totalTrades > 0 ? winningTrades / Math.floor(totalTrades / 2) : 0;
      
      // Calcular factor de beneficio
      const grossProfit = trades
        .filter(t => t.type === 'sell' && t.profit > 0)
        .reduce((sum, t) => sum + t.profit, 0);
      
      const grossLoss = Math.abs(trades
        .filter(t => t.type === 'sell' && t.profit < 0)
        .reduce((sum, t) => sum + t.profit, 0));
      
      const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
      
      // Calcular drawdown máximo
      let maxBalance = initialBalance;
      let maxDrawdown = 0;
      
      for (const trade of trades) {
        if (trade.runningBalance > maxBalance) {
          maxBalance = trade.runningBalance;
        }
        
        const drawdown = (maxBalance - trade.runningBalance) / maxBalance;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      }
      
      // Calcular ratio de Sharpe (simplificado)
      const returns = [];
      let prevBalance = initialBalance;
      
      for (const trade of trades) {
        if (trade.type === 'sell') {
          const returnPct = (trade.runningBalance - prevBalance) / prevBalance;
          returns.push(returnPct);
          prevBalance = trade.runningBalance;
        }
      }
      
      const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
      const stdReturn = Math.sqrt(
        returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
      );
      
      const sharpeRatio = stdReturn > 0 ? avgReturn / stdReturn : 0;
      
      // Crear resultado
      const result: BacktestResult = {
        startDate,
        endDate,
        initialBalance,
        finalBalance,
        totalTrades,
        winningTrades,
        losingTrades,
        winRate,
        profitFactor,
        maxDrawdown,
        sharpeRatio,
        trades
      };
      
      setResults(result);
      return result;
    });
  }, [executeWithLoading]);

  // Función auxiliar para obtener señales según la estrategia
  const getSignal = (
    data: PriceData,
    index: number,
    strategy: 'ma_crossover' | 'rsi_oversold' | 'macd_signal' | 'bollinger_bands',
    signalType: 'buy' | 'sell'
  ): boolean => {
    switch (strategy) {
      case 'ma_crossover':
        if (!data.columns.includes('MA_50') || !data.columns.includes('MA_200')) {
          return false;
        }
        
        if (signalType === 'buy') {
          return data.MA_50[index] > data.MA_200[index] && 
                 data.MA_50[index - 1] <= data.MA_200[index - 1];
        } else {
          return data.MA_50[index] < data.MA_200[index] && 
                 data.MA_50[index - 1] >= data.MA_200[index - 1];
        }
      
      case 'rsi_oversold':
        if (!data.columns.includes('RSI')) {
          return false;
        }
        
        if (signalType === 'buy') {
          return data.RSI[index] < 30 && data.RSI[index - 1] >= 30;
        } else {
          return data.RSI[index] > 70 && data.RSI[index - 1] <= 70;
        }
      
      case 'macd_signal':
        if (!data.columns.includes('MACD') || !data.columns.includes('MACD_signal')) {
          return false;
        }
        
        if (signalType === 'buy') {
          return data.MACD[index] > data.MACD_signal[index] && 
                 data.MACD[index - 1] <= data.MACD_signal[index - 1];
        } else {
          return data.MACD[index] < data.MACD_signal[index] && 
                 data.MACD[index - 1] >= data.MACD_signal[index - 1];
        }
      
      case 'bollinger_bands':
        if (!data.columns.includes('BB_upper') || !data.columns.includes('BB_lower')) {
          return false;
        }
        
        if (signalType === 'buy') {
          return data.close[index] < data.BB_lower[index] && 
                 data.close[index - 1] >= data.BB_lower[index - 1];
        } else {
          return data.close[index] > data.BB_upper[index] && 
                 data.close[index - 1] <= data.BB_upper[index - 1];
        }
      
      default:
        return false;
    }
  };

  return {
    results,
    isLoading,
    error,
    runBacktest,
    clearResults: () => setResults(null)
  };
};

/**
 * Hook para gestionar el análisis de riesgo
 * @returns Funciones para calcular métricas de riesgo
 */
export const useRiskAnalysis = () => {
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const { isLoading, error, executeWithLoading } = useLoadingState();

  const calculateRisk = useCallback(async (
    entryPrice: number,
    stopLossPercent: number = 0.05,
    takeProfitLevels: number[] = [1, 2, 3],
    portfolioValue: number = 10000,
    riskPerTrade: number = 0.02,
    winRate: number = 0.5
  ) => {
    await executeWithLoading(async () => {
      try {
        // 1. Calcular niveles básicos
        const stopLoss = entryPrice * (1 - stopLossPercent);
        const riskPerShare = entryPrice - stopLoss;
        const takeProfits = takeProfitLevels.map(level => 
          entryPrice + (riskPerShare * level)
        );

        // 2. Cálculo de tamaño de posición
        const riskAmount = portfolioValue * riskPerTrade;
        const positionSize = riskAmount / riskPerShare;

        // 3. Análisis de drawdown máximo
        const consecutiveLosses = Math.ceil(
          Math.log(0.05) / Math.log(1 - winRate)
        );
        const maxDrawdown = 1 - Math.pow(1 - riskPerTrade, consecutiveLosses);

        // 4. Cálculo de Kelly Criterion
        const avgWin = takeProfitLevels.reduce((sum, level) => sum + level, 0) 
                     / takeProfitLevels.length;
                     
        const kellyNumerator = winRate * avgWin - (1 - winRate);
        const kellyPercentage = kellyNumerator / avgWin;

        // 5. Ratios riesgo/recompensa
        const riskRewardRatios = takeProfitLevels.map(level => 
          (entryPrice + (riskPerShare * level) - entryPrice) / riskPerShare
        );

        // 6. Probabilidad de alcanzar take profits
        const tpProbabilities = takeProfitLevels.map(level => 
          1 - Math.pow(1 - winRate, level)
        );

        // Actualizar estado con resultados
        setRiskAnalysis({
          entryPrice,
          stopLoss,
          takeProfits,
          positionSize,
          maxDrawdown,
          kellyPercentage: Math.max(0, kellyPercentage),
          riskRewardRatios,
          tpProbabilities,
          consecutiveLosses,
          riskPerShare
        });

      } catch (err) {
        console.error('Error en cálculo de riesgo:', err);
        setRiskAnalysis(null);
        throw err;
      }
    });
  }, [executeWithLoading]);

  return {
    riskAnalysis,
    calculateRisk,
    isLoading,
    error
  };
};