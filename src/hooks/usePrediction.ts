import { useState, useEffect } from 'react';
import PredictionService from '../services/PredictionService';

/**
 * Hook personalizado para gestionar la inicialización del servicio de predicción
 * @param symbol Par de trading (ej. 'BTC/USDT')
 * @param timeframe Intervalo de tiempo ('1d', '4h', '1h', etc.)
 * @returns Estado de inicialización y error
 */
export const usePredictionService = (symbol: string = 'BTC/USDT', timeframe: string = '1d') => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const initializeService = async () => {
      try {
        setIsLoading(true);
        const predictionService = PredictionService.getInstance();
        const success = await predictionService.initialize(symbol, timeframe);
        
        if (success) {
          setIsInitialized(true);
          setError(null);
        } else {
          setError('No se pudo inicializar el servicio de predicción');
        }
      } catch (err) {
        setError(`Error al inicializar el servicio: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeService();
  }, [symbol, timeframe]);
  
  return { isInitialized, isLoading, error };
};

/**
 * Hook personalizado para entrenar el modelo de predicción
 * @param predictionDays Días a predecir en el futuro
 * @returns Estado del entrenamiento y función para iniciar el entrenamiento
 */
export const useTrainModel = (predictionDays: number = 30) => {
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [isModelTrained, setIsModelTrained] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const trainModel = async () => {
    try {
      setIsTraining(true);
      setError(null);
      
      const predictionService = PredictionService.getInstance();
      const success = await predictionService.trainModel(predictionDays);
      
      if (success) {
        setIsModelTrained(true);
      } else {
        setError('No se pudo entrenar el modelo');
      }
    } catch (err) {
      setError(`Error al entrenar el modelo: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsTraining(false);
    }
  };
  
  return { isTraining, isModelTrained, error, trainModel };
};

/**
 * Hook personalizado para realizar predicciones
 * @param days Número de días a predecir
 * @returns Estado de la predicción, resultados y función para iniciar la predicción
 */
export const usePrediction = (days: number = 30) => {
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictions, setPredictions] = useState<number[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const predict = async () => {
    try {
      setIsPredicting(true);
      setError(null);
      
      const predictionService = PredictionService.getInstance();
      const results = await predictionService.predictPrices(days);
      
      if (results) {
        setPredictions(results);
      } else {
        setError('No se pudieron obtener predicciones');
      }
    } catch (err) {
      setError(`Error al realizar predicciones: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsPredicting(false);
    }
  };
  
  return { isPredicting, predictions, error, predict };
};

/**
 * Hook personalizado para obtener señales de trading
 * @returns Estado de las señales, resultados y función para generar señales
 */
export const useTradingSignals = () => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [signals, setSignals] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const generateSignals = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const predictionService = PredictionService.getInstance();
      const results = predictionService.generateTradingSignals();
      
      if (results) {
        setSignals(results);
      } else {
        setError('No se pudieron generar señales de trading');
      }
    } catch (err) {
      setError(`Error al generar señales: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return { isGenerating, signals, error, generateSignals };
};

/**
 * Hook personalizado para obtener datos de precio
 * @returns Datos de precio
 */
export const usePriceData = () => {
  const [priceData, setPriceData] = useState<any | null>(null);
  
  useEffect(() => {
    const predictionService = PredictionService.getInstance();
    const data = predictionService.getPriceData();
    setPriceData(data);
  }, []);
  
  return { priceData };
};

/**
 * Hook personalizado para obtener datos combinados
 * @returns Datos combinados
 */
export const useCombinedData = () => {
  const [combinedData, setCombinedData] = useState<any | null>(null);
  
  useEffect(() => {
    const predictionService = PredictionService.getInstance();
    const data = predictionService.getCombinedData();
    setCombinedData(data);
  }, []);
  
  return { combinedData };
};
