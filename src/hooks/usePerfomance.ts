import { useCallback, useEffect, useState } from 'react';

/**
 * Hook personalizado para memoización de funciones costosas
 * @param fn Función a memoizar
 * @param dependencies Dependencias para recalcular
 * @returns Resultado memoizado
 */
export function useMemoizedCallback<T, Args extends any[]>(
  fn: (...args: Args) => T,
  dependencies: React.DependencyList
): [(...args: Args) => T, boolean] {
  const [isComputing, setIsComputing] = useState(false);
  const memoizedFn = useCallback((...args: Args) => {
    setIsComputing(true);
    try {
      return fn(...args);
    } finally {
      setIsComputing(false);
    }
  }, dependencies);

  return [memoizedFn, isComputing];
}

/**
 * Hook para debounce de valores
 * @param value Valor a debounce
 * @param delay Tiempo de espera en ms
 * @returns Valor con debounce
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para throttle de funciones
 * @param fn Función a throttle
 * @param delay Tiempo de espera en ms
 * @returns Función con throttle
 */
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T {
  const [lastCall, setLastCall] = useState(0);

  return useCallback(
    ((...args) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        setLastCall(now);
        return fn(...args);
      }
    }) as T,
    [fn, delay, lastCall]
  );
}

/**
 * Hook para carga perezosa de datos
 * @param loadFn Función para cargar datos
 * @param dependencies Dependencias para recargar
 * @returns Estado de carga y datos
 */
export function useLazyLoad<T>(
  loadFn: () => Promise<T>,
  dependencies: React.DependencyList = []
): {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  load: () => Promise<T>;
  reload: () => Promise<T>;
} {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loadFn();
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, dependencies);

  const reload = useCallback(() => {
    return load();
  }, [load]);

  return { data, isLoading, error, load, reload };
}

/**
 * Hook para virtualización de listas
 * @param items Lista de elementos
 * @param itemHeight Altura de cada elemento
 * @param visibleItems Número de elementos visibles
 * @returns Elementos visibles y propiedades del contenedor
 */
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  visibleItems: number
): {
  virtualItems: { item: T; index: number; offsetTop: number }[];
  totalHeight: number;
  startIndex: number;
  endIndex: number;
  scrollTo: (index: number) => void;
} {
  const [scrollTop, setScrollTop] = useState(0);
  const totalHeight = items.length * itemHeight;
  
  // Calcular índices de inicio y fin
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 3);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + visibleItems * itemHeight) / itemHeight) + 3
  );
  
  // Crear elementos virtuales
  const virtualItems = items
    .slice(startIndex, endIndex + 1)
    .map((item, index) => ({
      item,
      index: startIndex + index,
      offsetTop: (startIndex + index) * itemHeight
    }));
  
  // Función para desplazarse a un elemento específico
  const scrollTo = useCallback(
    (index: number) => {
      setScrollTop(index * itemHeight);
    },
    [itemHeight]
  );
  
  return {
    virtualItems,
    totalHeight,
    startIndex,
    endIndex,
    scrollTo
  };
}

/**
 * Hook para caché de datos con tiempo de expiración
 * @param key Clave para identificar los datos
 * @param fetchFn Función para obtener datos
 * @param expirationTime Tiempo de expiración en ms
 * @returns Datos y funciones de control
 */
export function useDataCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  expirationTime: number = 5 * 60 * 1000 // 5 minutos por defecto
): {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<T>;
  invalidate: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetched, setLastFetched] = useState(0);
  
  // Verificar caché en localStorage al montar
  useEffect(() => {
    const cachedData = localStorage.getItem(`cache_${key}`);
    if (cachedData) {
      try {
        const { data, timestamp } = JSON.parse(cachedData);
        const now = Date.now();
        if (now - timestamp < expirationTime) {
          setData(data);
          setLastFetched(timestamp);
          return;
        }
      } catch (err) {
        // Ignorar errores de parsing
      }
    }
    
    // Si no hay caché válida, cargar datos
    refresh();
  }, [key]);
  
  // Función para refrescar datos
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
      const now = Date.now();
      setLastFetched(now);
      
      // Guardar en caché
      localStorage.setItem(
        `cache_${key}`,
        JSON.stringify({ data: result, timestamp: now })
      );
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [key, fetchFn, expirationTime]);
  
  // Función para invalidar caché
  const invalidate = useCallback(() => {
    localStorage.removeItem(`cache_${key}`);
    setData(null);
    setLastFetched(0);
  }, [key]);
  
  // Refrescar automáticamente si expira
  useEffect(() => {
    if (lastFetched === 0) return;
    
    const now = Date.now();
    const timeRemaining = expirationTime - (now - lastFetched);
    
    if (timeRemaining <= 0) {
      refresh();
      return;
    }
    
    const timer = setTimeout(() => {
      refresh();
    }, timeRemaining);
    
    return () => clearTimeout(timer);
  }, [lastFetched, expirationTime, refresh]);
  
  return { data, isLoading, error, refresh, invalidate };
}

/**
 * Hook para trabajadores web (Web Workers)
 * @param workerScript Contenido del script del worker
 * @returns Funciones para comunicarse con el worker
 */
export function useWebWorker<T, R>(
  workerScript: string
): {
  execute: (data: T) => Promise<R>;
  terminate: () => void;
  isRunning: boolean;
} {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  // Crear worker al montar
  useEffect(() => {
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const newWorker = new Worker(url);
    
    setWorker(newWorker);
    
    return () => {
      newWorker.terminate();
      URL.revokeObjectURL(url);
    };
  }, [workerScript]);
  
  // Función para ejecutar tarea en worker
  const execute = useCallback(
    (data: T): Promise<R> => {
      return new Promise((resolve, reject) => {
        if (!worker) {
          reject(new Error('Worker no inicializado'));
          return;
        }
        
        setIsRunning(true);
        
        const handleMessage = (event: MessageEvent) => {
          worker.removeEventListener('message', handleMessage);
          worker.removeEventListener('error', handleError);
          setIsRunning(false);
          resolve(event.data as R);
        };
        
        const handleError = (error: ErrorEvent) => {
          worker.removeEventListener('message', handleMessage);
          worker.removeEventListener('error', handleError);
          setIsRunning(false);
          reject(new Error(error.message));
        };
        
        worker.addEventListener('message', handleMessage);
        worker.addEventListener('error', handleError);
        worker.postMessage(data);
      });
    },
    [worker]
  );
  
  // Función para terminar worker
  const terminate = useCallback(() => {
    if (worker) {
      worker.terminate();
      setWorker(null);
      setIsRunning(false);
    }
  }, [worker]);
  
  return { execute, terminate, isRunning };
}

/**
 * Hook para medir rendimiento
 * @returns Funciones para medir tiempo
 */
export function usePerformanceMeasure(): {
  startMeasure: (name: string) => void;
  endMeasure: (name: string) => number;
  getMeasurements: () => Record<string, number>;
  clearMeasurements: () => void;
} {
  const [measurements, setMeasurements] = useState<Record<string, { start: number; end?: number }>>(
    {}
  );
  
  // Iniciar medición
  const startMeasure = useCallback((name: string) => {
    setMeasurements(prev => ({
      ...prev,
      [name]: { start: performance.now() }
    }));
  }, []);
  
  // Finalizar medición
  const endMeasure = useCallback(
    (name: string): number => {
      const end = performance.now();
      const measurement = measurements[name];
      
      if (!measurement) {
        console.warn(`No se encontró medición para "${name}"`);
        return 0;
      }
      
      const duration = end - measurement.start;
      
      setMeasurements(prev => ({
        ...prev,
        [name]: { ...prev[name], end }
      }));
      
      return duration;
    },
    [measurements]
  );
  
  // Obtener todas las mediciones
  const getMeasurements = useCallback(() => {
    const result: Record<string, number> = {};
    
    Object.entries(measurements).forEach(([name, { start, end }]) => {
      if (end) {
        result[name] = end - start;
      }
    });
    
    return result;
  }, [measurements]);
  
  // Limpiar mediciones
  const clearMeasurements = useCallback(() => {
    setMeasurements({});
  }, []);
  
  return {
    startMeasure,
    endMeasure,
    getMeasurements,
    clearMeasurements
  };
}

export {
  useMemoizedCallback,
  useDebounce,
  useThrottle,
  useLazyLoad,
  useVirtualList,
  useDataCache,
  useWebWorker,
  usePerformanceMeasure
};
