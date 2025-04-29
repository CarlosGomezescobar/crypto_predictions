import React from 'react';
import Card from '../components/ui/Card';
import PredictionChart from '../components/chart/PredictionChart';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alerts';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Table from '../components/ui/Table';
import { usePrediction, useTrainModel, usePriceData } from '../hooks/usePrediction';

interface PredictionViewProps {
  symbol: string;
  predictionDays?: number;
}

const PredictionView: React.FC<PredictionViewProps> = ({ 
  symbol, 
  predictionDays = 30 
}) => {
  const { priceData } = usePriceData();
  const { isTraining, isModelTrained, error: trainingError, trainModel } = useTrainModel(predictionDays);
  const { isPredicting, predictions, error: predictionError, predict } = usePrediction(predictionDays);

  // Estado para controlar si se muestra la alerta de error
  const [showError, setShowError] = React.useState<boolean>(false);
  
  // Efecto para mostrar la alerta cuando hay un error
  React.useEffect(() => {
    if (trainingError || predictionError) {
      setShowError(true);
    }
  }, [trainingError, predictionError]);

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
  
  // Preparar fechas futuras para predicciones
  const lastDate = new Date(priceData.index[priceData.index.length - 1]);
  const futureDates = Array.from({ length: predictionDays }, (_, i) => {
    const date = new Date(lastDate);
    date.setDate(date.getDate() + i + 1);
    return date.toLocaleDateString();
  });

  // Preparar datos para la tabla de predicciones
  const predictionTableData = predictions 
    ? futureDates.map((date, index) => [
        date,
        predictions[index].toFixed(2),
        ((predictions[index] - prices[prices.length - 1]) / prices[prices.length - 1] * 100).toFixed(2) + '%'
      ])
    : [];

  // Calcular estadísticas de predicción
  const predictionStats = predictions 
    ? {
        min: Math.min(...predictions),
        max: Math.max(...predictions),
        avg: predictions.reduce((sum, val) => sum + val, 0) / predictions.length,
        lastKnownPrice: prices[prices.length - 1],
        expectedReturn: (predictions[predictions.length - 1] - prices[prices.length - 1]) / prices[prices.length - 1] * 100
      }
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Predicción de Precios: {symbol}</h1>
      
      {(trainingError || predictionError) && showError && (
        <Alert 
          type="error" 
          message={trainingError || predictionError || 'Ha ocurrido un error'} 
          onClose={() => setShowError(false)}
        />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Entrenamiento del Modelo</h2>
            <p className="text-gray-600">
              Entrena el modelo de machine learning para predecir los precios futuros de {symbol} 
              para los próximos {predictionDays} días.
            </p>
            <Button 
              onClick={trainModel} 
              disabled={isTraining} 
              isLoading={isTraining}
              variant="primary"
              fullWidth
            >
              {isModelTrained ? 'Reentrenar Modelo' : 'Entrenar Modelo'}
            </Button>
            {isModelTrained && !isTraining && (
              <div className="bg-green-100 text-green-800 p-3 rounded-md">
                Modelo entrenado correctamente
              </div>
            )}
          </div>
        </Card>
        
        <Card>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Generar Predicciones</h2>
            <p className="text-gray-600">
              Genera predicciones de precios para {symbol} utilizando el modelo entrenado.
            </p>
            <Button 
              onClick={predict} 
              disabled={!isModelTrained || isPredicting} 
              isLoading={isPredicting}
              variant="success"
              fullWidth
            >
              {predictions ? 'Actualizar Predicciones' : 'Generar Predicciones'}
            </Button>
          </div>
        </Card>
      </div>
      
      {predictions && (
        <>
          <Card title={`Predicción de Precios para ${symbol} (${predictionDays} días)`}>
            <PredictionChart 
              historicalLabels={dates.slice(-30)} // Mostrar solo los últimos 30 días de datos históricos
              historicalPrices={prices.slice(-30)}
              predictionLabels={futureDates}
              predictionPrices={predictions}
              title={`Predicción de Precios para ${symbol}`}
              height={400}
              width={800}
              className="mx-auto"
            />
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card title="Precio Mínimo Esperado">
              <div className="text-center">
                <span className="text-3xl font-bold text-blue-600">
                  ${predictionStats?.min.toFixed(2)}
                </span>
                <p className="text-gray-600 mt-2">
                  {((predictionStats!.min - predictionStats!.lastKnownPrice) / predictionStats!.lastKnownPrice * 100).toFixed(2)}% desde el precio actual
                </p>
              </div>
            </Card>
            
            <Card title="Precio Máximo Esperado">
              <div className="text-center">
                <span className="text-3xl font-bold text-green-600">
                  ${predictionStats?.max.toFixed(2)}
                </span>
                <p className="text-gray-600 mt-2">
                  {((predictionStats!.max - predictionStats!.lastKnownPrice) / predictionStats!.lastKnownPrice * 100).toFixed(2)}% desde el precio actual
                </p>
              </div>
            </Card>
            
            <Card title="Retorno Esperado">
              <div className="text-center">
                <span className={`text-3xl font-bold ${predictionStats!.expectedReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {predictionStats!.expectedReturn.toFixed(2)}%
                </span>
                <p className="text-gray-600 mt-2">
                  En {predictionDays} días
                </p>
              </div>
            </Card>
          </div>
          
          <Card title="Tabla de Predicciones">
            <Table 
              headers={['Fecha', 'Precio Predicho', 'Cambio desde Actual']} 
              data={predictionTableData}
              className="w-full"
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default PredictionView;