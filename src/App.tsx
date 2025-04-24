import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './views/Dashboard';
import DataVisualization from './views/DataVisualization';
import PredictionView from './views/PredictionView';
import TradingSignalsView from './views/TradingSignalsView';
import IntegrationTest from './views/IntegrationTest';
import { useTheme } from './hooks/useAppState';

const App: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <Router>
      <div className={isDarkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
          <nav className="bg-white dark:bg-gray-800 shadow-md">
            <div className="container mx-auto px-4">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">CryptoPrediction</span>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <Link
                      to="/"
                      className="border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/visualization"
                      className="border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      Visualización
                    </Link>
                    <Link
                      to="/prediction"
                      className="border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      Predicción
                    </Link>
                    <Link
                      to="/trading"
                      className="border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      Señales
                    </Link>
                    <Link
                      to="/test"
                      className="border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      Pruebas
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <main className="py-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/visualization" element={<DataVisualization />} />
              <Route path="/prediction" element={<PredictionView />} />
              <Route path="/trading" element={<TradingSignalsView />} />
              <Route path="/test" element={<IntegrationTest />} />
            </Routes>
          </main>

          <footer className="bg-white dark:bg-gray-800 shadow-inner py-4">
            <div className="container mx-auto px-4">
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                Sistema de Predicción de Criptomonedas © {new Date().getFullYear()}
              </div>
            </div>
          </footer>
        </div>
      </div>
    </Router>
  );
};

export default App;
