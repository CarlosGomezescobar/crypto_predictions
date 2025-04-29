import React, { useEffect, useState } from 'react';
import { useAppState } from '../hooks/AppState';
import { usePrediction } from '../hooks/usePrediction';
import { useAnalysis } from '../hooks/useAnalysis';
import { useDebounce, useDataCache, usePerformanceMeasure } from '../hooks/usePerfomance';
import { formatCurrency, formatPercent } from  '../utils/calculationUtils'; //'../utils/calculationUtils';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alerts';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { AdvancedPriceChart, TechnicalIndicatorChart } from '../components/chart/AdvancedCharts';

/**
 * Componente de prueba para verificar la integración de todas las mejoras
 */
const IntegrationTest: React.FC = () => {
  const { isDarkMode, toggleTheme, selectedAsset, setSelectedAsset } = useAppState();
  const { historicalData, isLoadingHistorical, fetchHistoricalData } = usePrediction();
  const { technicalAnalysis, calculateTechnicalAnalysis } = useAnalysis();
  const { startMeasure, endMeasure, getMeasurements, clearMeasurements } = usePerformanceMeasure();
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  const [testResults, setTestResults] = useState<{
    componentRendering: boolean;
    dataFetching: boolean;
    hooksFunctionality: boolean;
    uiInteractivity: boolean;
    performanceMetrics: Record<string, number>;
  }>({
    componentRendering: false,
    dataFetching: false,
    hooksFunctionality: false,
    uiInteractivity: false,
    performanceMetrics: {}
  });
  
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [testProgress, setTestProgress] = useState(0);
  const [testLog, setTestLog] = useState<string[]>([]);
  
  // Función para añadir entradas al log
  const logMessage = (message: string) => {
    setTestLog(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };
  
  // Función para ejecutar todas las pruebas
  const runAllTests = async () => {
    setTestStatus('running');
    setTestProgress(0);
    setTestLog([]);
    clearMeasurements();
    
    logMessage('Iniciando pruebas de integración...');
    
    try {
      // Prueba 1: Renderizado de componentes
      startMeasure('componentRendering');
      logMessage('Prueba 1: Verificando renderizado de componentes...');
      
      // Verificar que los componentes principales se renderizan correctamente
      const componentsToTest = [
        historicalData !== null,
        technicalAnalysis !== null,
        isDarkMode !== undefined,
        debouncedSearchTerm !== undefined
      ];
      
      const componentRenderingResult = componentsToTest.every(Boolean);
      setTestResults(prev => ({ ...prev, componentRendering: componentRenderingResult }));
      
      const componentRenderingTime = endMeasure('componentRendering');
      logMessage(`Prueba 1 completada en ${componentRenderingTime.toFixed(2)}ms: ${componentRenderingResult ? 'ÉXITO' : 'FALLO'}`);
      
      setTestProgress(25);
      
      // Prueba 2: Obtención de datos
      startMeasure('dataFetching');
      logMessage('Prueba 2: Verificando obtención de datos...');
      
      // Intentar obtener datos históricos
      await fetchHistoricalData(selectedAsset, '1d');
      
      const dataFetchingResult = historicalData !== null && historicalData.close.length > 0;
      setTestResults(prev => ({ ...prev, dataFetching: dataFetchingResult }));
      
      const dataFetchingTime = endMeasure('dataFetching');
      logMessage(`Prueba 2 completada en ${dataFetchingTime.toFixed(2)}ms: ${dataFetchingResult ? 'ÉXITO' : 'FALLO'}`);
      
      setTestProgress(50);
      
      // Prueba 3: Funcionalidad de hooks
      startMeasure('hooksFunctionality');
      logMessage('Prueba 3: Verificando funcionalidad de hooks...');
      
      // Probar hooks de rendimiento
      setSearchTerm('test');
      await new Promise(resolve => setTimeout(resolve, 600)); // Esperar a que se aplique el debounce
      
      const hooksResult = debouncedSearchTerm === 'test';
      setTestResults(prev => ({ ...prev, hooksFunctionality: hooksResult }));
      
      const hooksFunctionalityTime = endMeasure('hooksFunctionality');
      logMessage(`Prueba 3 completada en ${hooksFunctionalityTime.toFixed(2)}ms: ${hooksResult ? 'ÉXITO' : 'FALLO'}`);
      
      setTestProgress(75);
      
      // Prueba 4: Interactividad de UI
      startMeasure('uiInteractivity');
      logMessage('Prueba 4: Verificando interactividad de UI...');
      
      // Cambiar tema y verificar
      const initialTheme = isDarkMode;
      toggleTheme();
      
      const uiResult = isDarkMode !== initialTheme;
      setTestResults(prev => ({ ...prev, uiInteractivity: uiResult }));
      
      const uiInteractivityTime = endMeasure('uiInteractivity');
      logMessage(`Prueba 4 completada en ${uiInteractivityTime.toFixed(2)}ms: ${uiResult ? 'ÉXITO' : 'FALLO'}`);
      
      setTestProgress(100);
      
      // Recopilar métricas de rendimiento
      const performanceMetrics = getMeasurements();
      setTestResults(prev => ({ ...prev, performanceMetrics }));
      
      logMessage('Todas las pruebas completadas.');
      setTestStatus('completed');
    } catch (error) {
      logMessage(`Error durante las pruebas: ${error instanceof Error ? error.message : String(error)}`);
      setTestStatus('completed');
    }
  };
  
  // Renderizar resultados de prueba
  const renderTestResults = () => {
    if (testStatus === 'idle') {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Haga clic en el botón para iniciar las pruebas de integración.
          </p>
          <Button onClick={runAllTests}>Iniciar Pruebas</Button>
        </div>
      );
    }
    
    if (testStatus === 'running') {
      return (
        <div className="py-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progreso: {testProgress}%
            </span>
            <LoadingSpinner size="small" />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-6">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${testProgress}%` }}
            ></div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md max-h-60 overflow-y-auto">
            {testLog.map((log, index) => (
              <div key={index} className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // Resultados completos
    return (
      <div className="py-4">
        <Alert 
          type={Object.values(testResults).every(result => result === true || typeof result === 'object') ? 'success' : 'error'}
          message={Object.values(testResults).every(result => result === true || typeof result === 'object') 
            ? "Todas las pruebas completadas exitosamente" 
            : "Algunas pruebas fallaron, revise los detalles"}
          className="mb-6"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Resultados de Pruebas</h3>
            <ul className="space-y-2">
              <li className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Renderizado de Componentes</span>
                <span className={`font-medium ${testResults.componentRendering ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {testResults.componentRendering ? 'Éxito' : 'Fallo'}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Obtención de Datos</span>
                <span className={`font-medium ${testResults.dataFetching ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {testResults.dataFetching ? 'Éxito' : 'Fallo'}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Funcionalidad de Hooks</span>
                <span className={`font-medium ${testResults.hooksFunctionality ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {testResults.hooksFunctionality ? 'Éxito' : 'Fallo'}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Interactividad de UI</span>
                <span className={`font-medium ${testResults.uiInteractivity ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {testResults.uiInteractivity ? 'Éxito' : 'Fallo'}
                </span>
              </li>
            </ul>
          </Card>
          
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Métricas de Rendimiento</h3>
            <ul className="space-y-2">
              {Object.entries(testResults.performanceMetrics).map(([name, time]) => (
                <li key={name} className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">{name}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{time.toFixed(2)} ms</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md max-h-60 overflow-y-auto mb-6">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Registro de Pruebas</h4>
          {testLog.map((log, index) => (
            <div key={index} className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {log}
            </div>
          ))}
        </div>
        
        <div className="flex justify-center">
          <Button onClick={runAllTests}>Ejecutar Pruebas Nuevamente</Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Prueba de Integración</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Estado del Sistema</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <span className="block text-sm text-gray-500 dark:text-gray-400">Activo Seleccionado</span>
            <span className="text-lg font-medium text-gray-900 dark:text-white">{selectedAsset}</span>
          </div>
          
          <div>
            <span className="block text-sm text-gray-500 dark:text-gray-400">Tema</span>
            <div className="flex items-center">
              <span className="text-lg font-medium text-gray-900 dark:text-white mr-2">
                {isDarkMode ? 'Oscuro' : 'Claro'}
              </span>
              <button
                onClick={toggleTheme}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Cambiar
              </button>
            </div>
          </div>
          
          <div>
            <span className="block text-sm text-gray-500 dark:text-gray-400">Estado de Datos</span>
            <span className={`text-lg font-medium ${isLoadingHistorical ? 'text-yellow-600 dark:text-yellow-400' : historicalData ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isLoadingHistorical 
                ? 'Cargando...' 
                : historicalData 
                  ? 'Datos Disponibles' 
                  : 'Sin Datos'
              }
            </span>
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Búsqueda (con debounce)
          </label>
          <div className="flex items-center">
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Escriba para probar debounce..."
            />
            <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
              Valor con debounce: <span className="font-medium">{debouncedSearchTerm}</span>
            </span>
          </div>
        </div>
        
        {historicalData && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Visualización de Datos</h3>
            <AdvancedPriceChart 
              data={historicalData} 
              symbol={selectedAsset} 
              timeframe="1d"
              showVolume={true}
              showSMA={true}
              height={300}
              className="w-full"
            />
          </div>
        )}
      </Card>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Pruebas de Integración</h2>
        {renderTestResults()}
      </Card>
    </div>
  );
};

export default IntegrationTest;