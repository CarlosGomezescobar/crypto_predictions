// src/App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './views/Dashboard';
import DataVisualization from './views/DataVisualization';
import PredictionView from './views/PredictionView';
import TradingSignalsView from './views/TradingSignalsView';
import IntegrationTest from './views/IntegrationTest';
import { useAppState } from './hooks/useAppState';
import { useTheme } from './hooks/useTheme';
import LoadingSpinner from './components/ui/LoadingSpinner';
import Alert from './components/ui/Alerts';

const App: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulación de carga inicial
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Aquí puedes agregar cualquier lógica de inicialización necesaria
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulación de carga
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 dark:bg-red-900">
        <Alert type="error" message={`Error al cargar la aplicación: ${error}`} />
      </div>
    );
  }

  return (
    <Router>
      <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
        {/* Barra de navegación */}
        <nav className="bg-white dark:bg-gray-800 shadow-md">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
              CryptoPrediction
            </Link>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                {isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              </button>
            </div>
          </div>
        </nav>

        {/* Contenido principal */}
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/data-visualization" element={<DataVisualization />} />
            <Route path="/prediction" element={<PredictionView />} />
            <Route path="/trading-signals" element={<TradingSignalsView />} />
            <Route path="/integration-test" element={<IntegrationTest />} />
          </Routes>
        </main>

        {/* Pie de página */}
        <footer className="bg-white dark:bg-gray-800 shadow-inner py-4">
          <div className="container mx-auto px-4">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Sistema de Predicción de Criptomonedas © Ing Carlos Gomez {new Date().getFullYear()}
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;