import React from 'react';
import Card from '../components/ui/Card';
import PriceChart from '../components/chart/PriceChart';
import IndicatorChart from '../components/chart/IndicatorChart';
import Table from '../components/ui/Table';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { usePriceData } from '../hooks/usePrediction';

interface DataVisualizationProps {
  symbol: string;
}

const DataVisualization: React.FC<DataVisualizationProps> = ({ symbol }) => {
  const { priceData } = usePriceData();
  
  if (!priceData) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  // Preparar datos para los gráficos
  const dates = priceData.index.map((date: Date) => date.toLocaleDateString());
  const prices = priceData.close;
  const volumes = priceData.volume;
  
  // Preparar datos para RSI si está disponible
  const hasRSI = priceData.columns.includes('RSI');
  const rsiValues = hasRSI ? priceData.RSI : [];
  
  // Preparar datos para MACD si está disponible
  const hasMACD = priceData.columns.includes('MACD') && priceData.columns.includes('MACD_signal');
  const macdValues = hasMACD ? priceData.MACD : [];
  const macdSignalValues = hasMACD ? priceData.MACD_signal : [];
  
  // Preparar datos para la tabla
  const tableData = [];
  for (let i = Math.max(0, dates.length - 10); i < dates.length; i++) {
    tableData.push([
      dates[i],
      prices[i].toFixed(2),
      volumes[i].toFixed(2),
      hasRSI ? rsiValues[i].toFixed(2) : 'N/A',
      hasMACD ? macdValues[i].toFixed(2) : 'N/A'
    ]);
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Visualización de Datos: {symbol}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Precio Histórico">
          <PriceChart 
            labels={dates} 
            prices={prices} 
            title={`Precio de ${symbol}`}
            height={300}
            width={500}
            className="mx-auto"
          />
        </Card>
        
        <Card title="Volumen de Operaciones">
          <IndicatorChart 
            labels={dates} 
            values={volumes} 
            title={`Volumen de ${symbol}`}
            color="rgba(153, 102, 255, 0.6)"
            height={300}
            width={500}
            className="mx-auto"
          />
        </Card>
        
        {hasRSI && (
          <Card title="Índice de Fuerza Relativa (RSI)">
            <IndicatorChart 
              labels={dates} 
              values={rsiValues} 
              title="RSI"
              threshold={70}
              thresholdLabel="Sobrecompra"
              height={300}
              width={500}
              className="mx-auto"
            />
          </Card>
        )}
        
        {hasMACD && (
          <Card title="MACD">
            <PriceChart 
              labels={dates} 
              prices={macdValues} 
              title="MACD"
              borderColor="rgb(255, 99, 132)"
              backgroundColor="rgba(255, 99, 132, 0.2)"
              height={300}
              width={500}
              className="mx-auto"
            />
          </Card>
        )}
      </div>
      
      <Card title="Datos Recientes">
        <Table 
          headers={['Fecha', 'Precio', 'Volumen', 'RSI', 'MACD']} 
          data={tableData}
          className="w-full"
        />
      </Card>
    </div>
  );
};

export default DataVisualization;