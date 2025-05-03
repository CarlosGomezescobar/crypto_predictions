import { useState, useEffect, useCallback } from 'react';
import PredictionService from '../services/PredictionService';

import { 
  OHLCVData, 
  PredictionResult, 
  ModelMetrics, 
  TrainingOptions, 
  TradingSignal 
} from '../types';
import { useAppState } from './AppState';
import { useDataCache } from  './usePerfomance';

// Opciones de entrenamiento predeterminadas
const defaultTrainingOptions: TrainingOptions = {
  epochs: 100,
  learningRate: 0.001,
  batchSize: 32,
  splitRatio: 0.8,
  windowSize: 14,
  features: ['close', 'volume', 'rsi', 'macd'],
  modelType: 'lstm'
};

/**
 * Hook para gestionar la funcionalidad de predicción de precios
 */
export function usePrediction() {
  const { selectedAsset, selectedTimeFrame, addNotification } = useAppState();
  const [historicalData, setHistoricalData] = useState<OHLCVData | null>(null);
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);
  const [predictionData, setPredictionData] = useState<PredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null);
  const [trainingOptions, setTrainingOptions] = useState<TrainingOptions>(defaultTrainingOptions);
  
  // Instancia del servicio de predicc
  const predictionService = PredictionService.getInstance();
  
  // Usar caché para datos históricos
  const { 
    data: cachedHistoricalData, 
    isLoading: isCacheLoading,
    //refresh: refreshCache // Mantener si planeas usarlo
  } = useDataCache<OHLCVData>(
    `historical_${selectedAsset}_${selectedTimeFrame}`,
    () => predictionService.fetchHistoricalData(selectedAsset, selectedTimeFrame),
    30 * 60 * 1000 // 30 minutos
  );

  // Cargar datos históricos cuando cambia el activo o intervalo de tiempo
  useEffect(() => {
    if (cachedHistoricalData && !isCacheLoading) {
      setHistoricalData(cachedHistoricalData);
    } else {
      fetchHistoricalData(selectedAsset, selectedTimeFrame);
    }
  }, [selectedAsset, selectedTimeFrame]);

  const createNotification = (
    type: 'error' | 'warning' | 'info' | 'success',
    message: string
  ) => ({
    id: generateUniqueId(),
    type,
    message,
    timestamp: new Date().toISOString(), // Formatear como cadena ISO
    read: false,
  });

  // Función para generar IDs únicos
  function generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Función para obtener datos históricos
  const fetchHistoricalData = useCallback(async (asset: string, timeFrame: string) => {
    setIsLoadingHistorical(true);
    try {
      const data = await predictionService.fetchHistoricalData(asset, timeFrame);
      setHistoricalData(data);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      addNotification(
        createNotification('error', `Error al obtener datos históricos: ${errorMessage}`)
      );
      console.error('Error al obtener datos históricos:', error);
      return null;
    } finally {
      setIsLoadingHistorical(false);
    }
  }, [addNotification, predictionService]);
  
  // Función para entrenar modelo y generar predicciones
  const trainModel = useCallback(async (options?: Partial<TrainingOptions>) => {
    if (!historicalData) {
      addNotification(
        createNotification('warning', 'No hay datos históricos disponibles para entrenar el modelo')
      );
      return null;
    }

    const updatedOptions = { ...trainingOptions, ...options };
    setTrainingOptions(updatedOptions);

    setIsPredicting(true);
    try {
      addNotification(createNotification('info', 'Entrenando modelo de predicción...'));

      const startTime = performance.now();
      const { predictions, metrics } = await predictionService.trainAndPredict(historicalData, updatedOptions);
      const endTime = performance.now();

      // Actualizar métricas del modelo
      const updatedMetrics: ModelMetrics = {
        ...metrics,
        trainedAt: new Date().toISOString(),
        trainingTime: (endTime - startTime) / 1000,
      };
      setModelMetrics(updatedMetrics);

      // Actualizar datos de predicción
      const predictionResult: PredictionResult = {
        ...predictions,
      };
      setPredictionData(predictionResult);

      addNotification(
        createNotification('success', `Modelo entrenado con éxito. RMSE: ${metrics.rmse.toFixed(4)}`)
      );

      return predictionResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      addNotification(
        createNotification('error', `Error al entrenar el modelo: ${errorMessage}`)
      );
      console.error('Error al entrenar el modelo:', error);
      return null;
    } finally {
      setIsPredicting(false);
    }
  }, [addNotification, historicalData, trainingOptions, predictionService]);
  
  // Función para actualizar opciones de entrenamiento
  const updateTrainingOptions = useCallback((options: Partial<TrainingOptions>) => {
    setTrainingOptions(prevOptions => ({
      ...prevOptions,
      ...options
    }));
  }, []);
  
  // Función para obtener predicciones sin entrenar (usando modelo guardado)
  const getPredictions = useCallback(async () => {
    if (!historicalData) {
      addNotification(
        createNotification('warning', 'No hay datos históricos disponibles para generar predicciones')
      );
      return null;
    }

    setIsPredicting(true);
    try {
      const predictions = await predictionService.getPredictions(historicalData);
      setPredictionData(predictions);
      return predictions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      addNotification(
        createNotification('error', `Error al generar predicciones: ${errorMessage}`)
      );
      console.error('Error al generar predicciones:', error);
      return null;
    } finally {
      setIsPredicting(false);
    }
  }, [historicalData, addNotification]);
  
  // Función para obtener señales de trading
  const getTradingSignals = useCallback(async (): Promise<TradingSignal[] | null> => {
    if (!historicalData) {
      addNotification(
        createNotification('warning', 'No hay datos históricos disponibles para generar señales')
      );
      return null;
    }

    try {
      const signals = await predictionService.getTradingSignals(historicalData);
      return signals;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      addNotification(
        createNotification('error', `Error al generar señales de trading: ${errorMessage}`)
      );
      console.error('Error al generar señales de trading:', error);
      return null;
    }
  }, [historicalData, addNotification]);
  
  return {
    // Estado
    historicalData,
    isLoadingHistorical,
    predictionData,
    isPredicting,
    modelMetrics,
    trainingOptions,
    
    // Acciones
    fetchHistoricalData,
    trainModel,
    updateTrainingOptions,
    getPredictions,
    getTradingSignals
  };
}
