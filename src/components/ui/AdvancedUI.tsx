import React, { useState } from 'react';
import { ThemeColors } from '../types';

interface ThemeSwitcherProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  className?: string;
}

/**
 * Componente para cambiar entre tema claro y oscuro
 */
const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ 
  isDarkMode, 
  toggleTheme,
  className = ''
}) => {
  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${className} ${
        isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
      }`}
      aria-pressed={isDarkMode}
    >
      <span className="sr-only">
        {isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      </span>
      <span
        className={`${
          isDarkMode ? 'translate-x-6' : 'translate-x-1'
        } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out`}
      />
      <span className="absolute inset-y-0 right-0 flex items-center pr-1.5">
        {isDarkMode && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </span>
      <span className="absolute inset-y-0 left-0 flex items-center pl-1.5">
        {!isDarkMode && (
          <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </span>
    </button>
  );
};

interface TimeFrameSelectorProps {
  timeFrames: { id: string; label: string; value: string; description?: string }[];
  selectedTimeFrame: string;
  onChange: (timeFrame: string) => void;
  className?: string;
}

/**
 * Componente para seleccionar el intervalo de tiempo
 */
const TimeFrameSelector: React.FC<TimeFrameSelectorProps> = ({
  timeFrames,
  selectedTimeFrame,
  onChange,
  className = ''
}) => {
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {timeFrames.map((tf) => (
        <button
          key={tf.id}
          onClick={() => onChange(tf.id)}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
            selectedTimeFrame === tf.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          }`}
          title={tf.description}
        >
          {tf.label}
        </button>
      ))}
    </div>
  );
};

interface AssetSelectorProps {
  assets: { symbol: string; name: string; logo?: string }[];
  selectedAsset: string;
  onChange: (symbol: string) => void;
  className?: string;
}

/**
 * Componente para seleccionar el activo de criptomoneda
 */
const AssetSelector: React.FC<AssetSelectorProps> = ({
  assets,
  selectedAsset,
  onChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedAssetData = assets.find(a => a.symbol === selectedAsset) || assets[0];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
      >
        <div className="flex items-center">
          {selectedAssetData.logo && (
            <img 
              src={selectedAssetData.logo} 
              alt={selectedAssetData.name} 
              className="w-5 h-5 mr-2"
            />
          )}
          <span>{selectedAssetData.symbol}</span>
        </div>
        <svg
          className="w-5 h-5 ml-2 -mr-1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg dark:bg-gray-800 max-h-60 overflow-y-auto">
          <ul className="py-1">
            {assets.map((asset) => (
              <li key={asset.symbol}>
                <button
                  onClick={() => {
                    onChange(asset.symbol);
                    setIsOpen(false);
                  }}
                  className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    selectedAsset === asset.symbol
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {asset.logo && (
                    <img 
                      src={asset.logo} 
                      alt={asset.name} 
                      className="w-5 h-5 mr-2"
                    />
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium">{asset.symbol}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{asset.name}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Tarjeta para mostrar estadísticas con cambio porcentual
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 dark:bg-gray-800 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        {icon && <div className="text-gray-400 dark:text-gray-500">{icon}</div>}
      </div>
      <div className="mt-2">
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
        {change !== undefined && (
          <p className={`mt-1 text-sm ${
            change >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            <span className="flex items-center">
              {change >= 0 ? (
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {Math.abs(change).toFixed(2)}%
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

interface TrendIndicatorProps {
  direction: 'up' | 'down' | 'sideways';
  strength: number;
  label?: string;
  className?: string;
}

/**
 * Indicador de tendencia con dirección y fuerza
 */
const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  direction,
  strength,
  label,
  className = ''
}) => {
  // Mapear dirección a color
  const directionColor = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    sideways: 'text-yellow-600 dark:text-yellow-400'
  };

  // Mapear dirección a icono
  const directionIcon = {
    up: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    ),
    down: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ),
    sideways: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    )
  };

  // Mapear dirección a texto
  const directionText = {
    up: 'Alcista',
    down: 'Bajista',
    sideways: 'Lateral'
  };

  return (
    <div className={`flex items-center ${className}`}>
      {label && <span className="mr-2 text-sm text-gray-600 dark:text-gray-400">{label}</span>}
      <div className={`flex items-center ${directionColor[direction]}`}>
        {directionIcon[direction]}
        <span className="ml-1 font-medium">{directionText[direction]}</span>
      </div>
      <div className="ml-3 w-24 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div 
          className={`h-2.5 rounded-full ${
            direction === 'up' 
              ? 'bg-green-600' 
              : direction === 'down' 
                ? 'bg-red-600' 
                : 'bg-yellow-400'
          }`}
          style={{ width: `${strength * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

interface PriceAlertFormProps {
  currentPrice: number;
  onAddAlert: (price: number, direction: 'above' | 'below') => void;
  className?: string;
}

/**
 * Formulario para crear alertas de precio
 */
const PriceAlertForm: React.FC<PriceAlertFormProps> = ({
  currentPrice,
  onAddAlert,
  className = ''
}) => {
  const [price, setPrice] = useState<string>(currentPrice.toString());
  const [direction, setDirection] = useState<'above' | 'below'>('above');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = parseFloat(price);
    if (!isNaN(numPrice)) {
      onAddAlert(numPrice, direction);
      // Resetear formulario
      setPrice(currentPrice.toString());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div>
        <label htmlFor="alert-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Precio
        </label>
        <div className="mt-1">
          <input
            type="number"
            id="alert-price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            step="0.01"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Condición
        </label>
        <div className="mt-1 flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-blue-600 focus:ring-blue-500"
              checked={direction === 'above'}
              onChange={() => setDirection('above')}
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Precio por encima</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-blue-600 focus:ring-blue-500"
              checked={direction === 'below'}
              onChange={() => setDirection('below')}
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Precio por debajo</span>
          </label>
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Crear Alerta
        </button>
      </div>
    </form>
  );
};

interface ModelTrainingFormProps {
  options: {
    sequenceLength: number;
    predictionDays: number;
    epochs: number;
    batchSize: number;
    validationSplit: number;
  };
  onUpdateOptions: (options: Partial<{
    sequenceLength: number;
    predictionDays: number;
    epochs: number;
    batchSize: number;
    validationSplit: number;
  }>) => void;
  onTrain: () => void;
  isTraining: boolean;
  className?: string;
}

/**
 * Formulario para configurar y entrenar modelos
 */
const ModelTrainingForm: React.FC<ModelTrainingFormProps> = ({
  options,
  onUpdateOptions,
  onTrain,
  isTraining,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sequence-length" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Longitud de secuencia
          </label>
          <div className="mt-1">
            <input
              type="number"
              id="sequence-length"
              value={options.sequenceLength}
              onChange={(e) => onUpdateOptions({ sequenceLength: parseInt(e.target.value) })}
              min="10"
              max="200"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Número de días históricos para entrenar el modelo
          </p>
        </div>

        <div>
          <label htmlFor="prediction-days" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Días a predecir
          </label>
          <div className="mt-1">
            <input
              type="number"
              id="prediction-days"
              value={options.predictionDays}
              onChange={(e) => onUpdateOptions({ predictionDays: parseInt(e.target.value) })}
              min="1"
              max="90"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Número de días futuros a predecir
          </p>
        </div>

        <div>
          <label htmlFor="epochs" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Épocas
          </label>
          <div className="mt-1">
            <input
              type="number"
              id="epochs"
              value={options.epochs}
              onChange={(e) => onUpdateOptions({ epochs: parseInt(e.target.value) })}
              min="1"
              max="500"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Número de iteraciones completas sobre los datos de entrenamiento
          </p>
        </div>

        <div>
          <label htmlFor="batch-size" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tamaño de lote
          </label>
          <div className="mt-1">
            <input
              type="number"
              id="batch-size"
              value={options.batchSize}
              onChange={(e) => onUpdateOptions({ batchSize: parseInt(e.target.value) })}
              min="8"
              max="512"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Número de muestras por actualización del gradiente
          </p>
        </div>

        <div>
          <label htmlFor="validation-split" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            División de validación
          </label>
          <div className="mt-1">
            <input
              type="number"
              step="0.01"
              id="validation-split"
              value={options.validationSplit}
              onChange={(e) => onUpdateOptions({ validationSplit: parseFloat(e.target.value) })}
              min="0"
              max="0.5"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Proporción de datos de entrenamiento usados para validación
          </p>
        </div>
      </div>

      <div>
        <button
          onClick={onTrain}
          disabled={isTraining}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isTraining ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          {isTraining ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Entrenando...
            </>
          ) : (
            'Entrenar Modelo'
          )}
        </button>
      </div>
    </div>
  );
};

export default ModelTrainingForm;