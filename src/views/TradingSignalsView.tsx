import React from 'react';
import Card from '../components/ui/Card';

import Table from '../components/ui/Table';
import LoadingSpinner from '../components/ui/LoadingSpinner';

import Button from '../components/ui/Button';
import Alert from '../components/ui/Alerts';


import { useTradingSignals, usePriceData } from '../hooks/usePrediction';

interface TradingSignalsViewProps {
  symbol: string;
}

const TradingSignalsView: React.FC<TradingSignalsViewProps> = ({ symbol }) => {
  const { priceData } = usePriceData();
  const { isGenerating, signals, error, generateSignals } = useTradingSignals();
  
  // Estado para controlar si se muestra la alerta de error
  const [showError, setShowError] = React.useState<boolean>(false);
  
  // Efecto para mostrar la alerta cuando hay un error
  React.useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  if (!priceData) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Preparar datos para la tabla de señales
  const signalsTableData = signals 
    ? signals.index.slice(-10).map((date: Date, i: number) => {
        const idx = signals.index.length - 10 + i;
        return [
          date.toLocaleDateString(),
          signals.close[idx].toFixed(2),
          signals.buy_signal[idx] ? '✅' : '❌',
          signals.sell_signal[idx] ? '✅' : '❌',
          signals.columns.includes('golden_cross') ? (signals.golden_cross[idx] ? '✅' : '❌') : 'N/A',
          signals.columns.includes('death_cross') ? (signals.death_cross[idx] ? '✅' : '❌') : 'N/A',
          signals.columns.includes('rsi_oversold') ? (signals.rsi_oversold[idx] ? '✅' : '❌') : 'N/A',
          signals.columns.includes('rsi_overbought') ? (signals.rsi_overbought[idx] ? '✅' : '❌') : 'N/A'
        ];
      })
    : [];

  // Calcular resumen de señales actuales
  const currentSignals = signals 
    ? {
        buySignal: signals.buy_signal[signals.buy_signal.length - 1],
        sellSignal: signals.sell_signal[signals.sell_signal.length - 1],
        lastPrice: signals.close[signals.close.length - 1],
        date: signals.index[signals.index.length - 1]
      }
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Señales de Trading: {symbol}</h1>
      
      {error && showError && (
        <Alert 
          type="error" 
          message={error || 'Ha ocurrido un error'} 
          onClose={() => setShowError(false)}
        />
      )}
      
      <Card>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Generar Señales de Trading</h2>
          <p className="text-gray-600">
            Genera señales de trading para {symbol} basadas en análisis técnico y fundamental.
          </p>
          <Button 
            onClick={generateSignals} 
            disabled={isGenerating} 
            isLoading={isGenerating}
            variant="primary"
            fullWidth
          >
            {signals ? 'Actualizar Señales' : 'Generar Señales'}
          </Button>
        </div>
      </Card>
      
      {signals && currentSignals && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card title="Señal Actual">
              <div className="flex flex-col items-center justify-center p-6">
                <div className={`text-4xl font-bold mb-4 ${currentSignals.buySignal ? 'text-green-600' : currentSignals.sellSignal ? 'text-red-600' : 'text-gray-600'}`}>
                  {currentSignals.buySignal ? 'COMPRAR' : currentSignals.sellSignal ? 'VENDER' : 'NEUTRAL'}
                </div>
                <div className="text-gray-600">
                  Precio: ${currentSignals.lastPrice.toFixed(2)}
                </div>
                <div className="text-gray-600">
                  Fecha: {currentSignals.date.toLocaleDateString()}
                </div>
              </div>
            </Card>
            
            <Card title="Recomendación">
              <div className="p-6">
                {currentSignals.buySignal && (
                  <div className="space-y-4">
                    <p className="text-green-600 font-semibold">Se recomienda COMPRAR {symbol}</p>
                    <p>Basado en los siguientes indicadores:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      {signals.columns.includes('golden_cross') && signals.golden_cross[signals.golden_cross.length - 1] && (
                        <li>Cruce dorado (MA 50 cruza por encima de MA 200)</li>
                      )}
                      {signals.columns.includes('rsi_oversold') && signals.rsi_oversold[signals.rsi_oversold.length - 1] && (
                        <li>RSI en zona de sobreventa (por debajo de 30)</li>
                      )}
                      {signals.columns.includes('macd_bullish_cross') && signals.macd_bullish_cross[signals.macd_bullish_cross.length - 1] && (
                        <li>Cruce alcista de MACD</li>
                      )}
                      {signals.columns.includes('extreme_fear') && signals.extreme_fear[signals.extreme_fear.length - 1] && (
                        <li>Índice de miedo y codicia en miedo extremo</li>
                      )}
                    </ul>
                  </div>
                )}
                
                {currentSignals.sellSignal && (
                  <div className="space-y-4">
                    <p className="text-red-600 font-semibold">Se recomienda VENDER {symbol}</p>
                    <p>Basado en los siguientes indicadores:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      {signals.columns.includes('death_cross') && signals.death_cross[signals.death_cross.length - 1] && (
                        <li>Cruce de muerte (MA 50 cruza por debajo de MA 200)</li>
                      )}
                      {signals.columns.includes('rsi_overbought') && signals.rsi_overbought[signals.rsi_overbought.length - 1] && (
                        <li>RSI en zona de sobrecompra (por encima de 70)</li>
                      )}
                      {signals.columns.includes('macd_bearish_cross') && signals.macd_bearish_cross[signals.macd_bearish_cross.length - 1] && (
                        <li>Cruce bajista de MACD</li>
                      )}
                      {signals.columns.includes('extreme_greed') && signals.extreme_greed[signals.extreme_greed.length - 1] && (
                        <li>Índice de miedo y codicia en codicia extrema</li>
                      )}
                    </ul>
                  </div>
                )}
                
                {!currentSignals.buySignal && !currentSignals.sellSignal && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-600">No hay señales claras en este momento</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
          
          <Card title="Historial de Señales">
            <Table 
              headers={['Fecha', 'Precio', 'Señal de Compra', 'Señal de Venta', 'Cruce Dorado', 'Cruce de Muerte', 'RSI Sobreventa', 'RSI Sobrecompra']} 
              data={signalsTableData}
              className="w-full"
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default TradingSignalsView;