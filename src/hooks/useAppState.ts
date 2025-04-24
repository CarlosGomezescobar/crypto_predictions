import { useState, useEffect, useCallback } from 'react';
import { TimeFrame, CryptoAsset, UserSettings, NotificationSettings } from '../types';

/**
 * Hook para gestionar la configuración del usuario
 * @param initialSettings Configuración inicial del usuario
 * @returns Configuración del usuario y funciones para actualizarla
 */
export const useUserSettings = (initialSettings?: Partial<UserSettings>) => {
  const defaultSettings: UserSettings = {
    defaultSymbol: 'BTC/USDT',
    defaultTimeframe: '1d',
    predictionDays: 30,
    theme: 'light',
    showAdvancedOptions: false,
    autoRefreshInterval: null,
    favoriteAssets: ['BTC/USDT', 'ETH/USDT']
  };

  const [settings, setSettings] = useState<UserSettings>({
    ...defaultSettings,
    ...initialSettings
  });

  // Cargar configuración desde localStorage al iniciar
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    }
  }, []);

  // Guardar configuración en localStorage cuando cambia
  useEffect(() => {
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error al guardar configuración:', error);
    }
  }, [settings]);

  // Función para actualizar una configuración específica
  const updateSetting = useCallback(<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Función para añadir/quitar un activo de favoritos
  const toggleFavoriteAsset = useCallback((symbol: string) => {
    setSettings(prev => {
      const isFavorite = prev.favoriteAssets.includes(symbol);
      return {
        ...prev,
        favoriteAssets: isFavorite
          ? prev.favoriteAssets.filter(s => s !== symbol)
          : [...prev.favoriteAssets, symbol]
      };
    });
  }, []);

  // Función para restablecer configuración por defecto
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  return {
    settings,
    updateSetting,
    toggleFavoriteAsset,
    resetSettings
  };
};

/**
 * Hook para gestionar la configuración de notificaciones
 * @param initialSettings Configuración inicial de notificaciones
 * @returns Configuración de notificaciones y funciones para actualizarla
 */
export const useNotificationSettings = (initialSettings?: Partial<NotificationSettings>) => {
  const defaultSettings: NotificationSettings = {
    enablePriceAlerts: false,
    enableSignalAlerts: false,
    enablePredictionAlerts: false,
    priceChangeThreshold: 5,
    notificationMethods: ['app']
  };

  const [settings, setSettings] = useState<NotificationSettings>({
    ...defaultSettings,
    ...initialSettings
  });

  // Cargar configuración desde localStorage al iniciar
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('notificationSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error al cargar configuración de notificaciones:', error);
    }
  }, []);

  // Guardar configuración en localStorage cuando cambia
  useEffect(() => {
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error al guardar configuración de notificaciones:', error);
    }
  }, [settings]);

  // Función para actualizar una configuración específica
  const updateSetting = useCallback(<K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Función para alternar un método de notificación
  const toggleNotificationMethod = useCallback((method: 'app' | 'email' | 'push') => {
    setSettings(prev => {
      const isEnabled = prev.notificationMethods.includes(method);
      return {
        ...prev,
        notificationMethods: isEnabled
          ? prev.notificationMethods.filter(m => m !== method)
          : [...prev.notificationMethods, method]
      };
    });
  }, []);

  return {
    notificationSettings: settings,
    updateNotificationSetting: updateSetting,
    toggleNotificationMethod
  };
};

/**
 * Hook para gestionar los timeframes disponibles
 * @returns Lista de timeframes y funciones relacionadas
 */
export const useTimeFrames = () => {
  const timeFrames: TimeFrame[] = [
    { id: '1m', label: '1 minuto', value: '1m', description: 'Actualización cada minuto' },
    { id: '5m', label: '5 minutos', value: '5m', description: 'Actualización cada 5 minutos' },
    { id: '15m', label: '15 minutos', value: '15m', description: 'Actualización cada 15 minutos' },
    { id: '30m', label: '30 minutos', value: '30m', description: 'Actualización cada 30 minutos' },
    { id: '1h', label: '1 hora', value: '1h', description: 'Actualización cada hora' },
    { id: '4h', label: '4 horas', value: '4h', description: 'Actualización cada 4 horas' },
    { id: '1d', label: '1 día', value: '1d', description: 'Actualización diaria' },
    { id: '1w', label: '1 semana', value: '1w', description: 'Actualización semanal' },
    { id: '1M', label: '1 mes', value: '1M', description: 'Actualización mensual' }
  ];

  const [selectedTimeFrame, setSelectedTimeFrame] = useState<string>('1d');

  const getTimeFrameById = useCallback((id: string) => {
    return timeFrames.find(tf => tf.id === id) || timeFrames[6]; // Default to 1d
  }, []);

  return {
    timeFrames,
    selectedTimeFrame,
    setSelectedTimeFrame,
    getTimeFrameById
  };
};

/**
 * Hook para gestionar los activos de criptomonedas disponibles
 * @returns Lista de activos y funciones relacionadas
 */
export const useCryptoAssets = () => {
  const [assets, setAssets] = useState<CryptoAsset[]>([
    { symbol: 'BTC/USDT', name: 'Bitcoin', category: 'cryptocurrency' },
    { symbol: 'ETH/USDT', name: 'Ethereum', category: 'cryptocurrency' },
    { symbol: 'BNB/USDT', name: 'Binance Coin', category: 'exchange-token' },
    { symbol: 'SOL/USDT', name: 'Solana', category: 'smart-contract' },
    { symbol: 'ADA/USDT', name: 'Cardano', category: 'smart-contract' },
    { symbol: 'XRP/USDT', name: 'Ripple', category: 'payment' },
    { symbol: 'DOT/USDT', name: 'Polkadot', category: 'infrastructure' },
    { symbol: 'DOGE/USDT', name: 'Dogecoin', category: 'meme' },
    { symbol: 'AVAX/USDT', name: 'Avalanche', category: 'smart-contract' },
    { symbol: 'MATIC/USDT', name: 'Polygon', category: 'layer-2' }
  ]);

  const [selectedAsset, setSelectedAsset] = useState<string>('BTC/USDT');

  const getAssetBySymbol = useCallback((symbol: string) => {
    return assets.find(asset => asset.symbol === symbol) || assets[0]; // Default to BTC/USDT
  }, [assets]);

  const getAssetsByCategory = useCallback((category: string) => {
    return assets.filter(asset => asset.category === category);
  }, [assets]);

  // Función para cargar más información sobre los activos
  const loadAssetDetails = useCallback(async () => {
    try {
      // Simulación de carga de datos
      const updatedAssets = [...assets];
      
      // Añadir logos y descripciones
      updatedAssets[0].logo = 'https://cryptologos.cc/logos/bitcoin-btc-logo.png';
      updatedAssets[0].description = 'Bitcoin es una criptomoneda descentralizada creada en 2009 por una persona o grupo conocido bajo el seudónimo de Satoshi Nakamoto.';
      
      updatedAssets[1].logo = 'https://cryptologos.cc/logos/ethereum-eth-logo.png';
      updatedAssets[1].description = 'Ethereum es una plataforma de código abierto basada en blockchain que permite a los desarrolladores crear y desplegar contratos inteligentes y aplicaciones descentralizadas.';
      
      setAssets(updatedAssets);
    } catch (error) {
      console.error('Error al cargar detalles de activos:', error);
    }
  }, [assets]);

  // Cargar detalles al iniciar
  useEffect(() => {
    loadAssetDetails();
  }, [loadAssetDetails]);

  return {
    assets,
    selectedAsset,
    setSelectedAsset,
    getAssetBySymbol,
    getAssetsByCategory,
    loadAssetDetails
  };
};

/**
 * Hook para gestionar el tema de la aplicación
 * @param initialTheme Tema inicial
 * @returns Tema actual y funciones para cambiarlo
 */
export const useTheme = (initialTheme: 'light' | 'dark' = 'light') => {
  const [theme, setTheme] = useState<'light' | 'dark'>(initialTheme);

  // Cargar tema desde localStorage al iniciar
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        // Detectar preferencia del sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      }
    } catch (error) {
      console.error('Error al cargar tema:', error);
    }
  }, []);

  // Guardar tema en localStorage y aplicar clases CSS cuando cambia
  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
      
      // Aplicar clase al elemento html
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Error al guardar tema:', error);
    }
  }, [theme]);

  // Función para alternar entre temas
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  return {
    theme,
    setTheme,
    toggleTheme,
    isDarkMode: theme === 'dark'
  };
};

/**
 * Hook para gestionar la persistencia de datos en localStorage
 * @param key Clave para almacenar en localStorage
 * @param initialValue Valor inicial
 * @returns Valor actual y funciones para actualizarlo
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para almacenar nuestro valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Obtener del localStorage por clave
      const item = window.localStorage.getItem(key);
      // Analizar JSON almacenado o devolver initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Si hay error, devolver initialValue
      console.error(`Error al recuperar ${key} de localStorage:`, error);
      return initialValue;
    }
  });

  // Función para actualizar el valor en localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Permitir que value sea una función para seguir el mismo patrón que useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Guardar estado
      setStoredValue(valueToStore);
      // Guardar en localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error al guardar ${key} en localStorage:`, error);
    }
  }, [key, storedValue]);

  // Función para eliminar el valor de localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error al eliminar ${key} de localStorage:`, error);
    }
  }, [key, initialValue]);

  return { value: storedValue, setValue, removeValue };
}

/**
 * Hook para gestionar intervalos de actualización automática
 * @param callback Función a ejecutar en cada intervalo
 * @param delay Tiempo en milisegundos entre ejecuciones (null para pausar)
 */
export const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef<() => void>(callback);

  // Recordar la última callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Configurar el intervalo
  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

/**
 * Hook para gestionar el estado de carga de datos
 * @returns Estado de carga y funciones para actualizarlo
 */
export const useLoadingState = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Función para ejecutar una operación asíncrona con manejo de estado
  const executeWithLoading = async <T,>(
    operation: () => Promise<T>,
    successMessage?: string
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const result = await operation();
      setSuccess(true);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para resetear el estado
  const resetState = () => {
    setIsLoading(false);
    setError(null);
    setSuccess(false);
  };

  return {
    isLoading,
    error,
    success,
    setIsLoading,
    setError,
    setSuccess,
    executeWithLoading,
    resetState
  };
};

// Necesitamos importar useRef para useInterval
import { useRef } from 'react';

/**
 * Hook para gestionar el historial de predicciones
 * @returns Historial de predicciones y funciones para actualizarlo
 */
export const usePredictionHistory = () => {
  const { value: history, setValue: setHistory } = useLocalStorage<{
    symbol: string;
    date: string;
    predictionDays: number;
    predictions: number[];
    actualPrices?: number[];
    accuracy?: number;
  }[]>('predictionHistory', []);

  // Añadir una nueva predicción al historial
  const addPrediction = useCallback((
    symbol: string,
    predictionDays: number,
    predictions: number[]
  ) => {
    setHistory(prev => [
      {
        symbol,
        date: new Date().toISOString(),
        predictionDays,
        predictions
      },
      ...prev.slice(0, 9) // Mantener solo las 10 predicciones más recientes
    ]);
  }, [setHistory]);

  // Actualizar una predicción con los precios reales
  const updatePredictionWithActual = useCallback((
    index: number,
    actualPrices: number[]
  ) => {
    setHistory(prev => {
      if (index < 0 || index >= prev.length) return prev;
      
      const prediction = prev[index];
      const newPrediction = {
        ...prediction,
        actualPrices
      };
      
      // Calcular precisión si tenemos suficientes datos
      if (actualPrices.length >= prediction.predictions.length) {
        let sumError = 0;
        for (let i = 0; i < prediction.predictions.length; i++) {
          sumError += Math.abs(prediction.predictions[i] - actualPrices[i]) / actualPrices[i];
        }
        newPrediction.accuracy = 100 * (1 - sumError / prediction.predictions.length);
      }
      
      const newHistory = [...prev];
      newHistory[index] = newPrediction;
      return newHistory;
    });
  }, [setHistory]);

  // Eliminar una predicción del historial
  const removePrediction = useCallback((index: number) => {
    setHistory(prev => {
      if (index < 0 || index >= prev.length) return prev;
      return [...prev.slice(0, index), ...prev.slice(index + 1)];
    });
  }, [setHistory]);

  // Limpiar todo el historial
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  return {
    predictionHistory: history,
    addPrediction,
    updatePredictionWithActual,
    removePrediction,
    clearHistory
  };
};

/**
 * Hook para gestionar el historial de señales de trading
 * @returns Historial de señales y funciones para actualizarlo
 */
export const useTradingSignalHistory = () => {
  const { value: history, setValue
(Content truncated due to size limit. Use line ranges to read in chunks)