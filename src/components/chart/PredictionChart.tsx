import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PredictionChartProps {
  historicalLabels: string[];
  historicalPrices: number[];
  predictionLabels: string[];
  predictionPrices: number[];
  title?: string;
  height?: number;
  width?: number;
  className?: string;
}

const PredictionChart: React.FC<PredictionChartProps> = ({
  historicalLabels,
  historicalPrices,
  predictionLabels,
  predictionPrices,
  title = 'Predicción de Precios',
  height = 400,
  width = 800,
  className = ''
}) => {
  // Combinar datos históricos y predicciones
  const allLabels = [...historicalLabels, ...predictionLabels];
  
  const data = {
    labels: allLabels,
    datasets: [
      {
        label: 'Datos Históricos',
        data: [...historicalPrices, ...Array(predictionLabels.length).fill(null)],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        fill: true,
        pointRadius: 3,
      },
      {
        label: 'Predicciones',
        data: [...Array(historicalLabels.length).fill(null), ...predictionPrices],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderDash: [5, 5],
        tension: 0.1,
        fill: true,
        pointRadius: 3,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('es-ES', { 
                style: 'currency', 
                currency: 'USD',
                minimumFractionDigits: 2
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Fecha'
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Precio'
        },
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('es-ES', { 
              style: 'currency', 
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(Number(value));
          }
        }
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 5,
      },
    },
  };

  return (
    <div className={`${className}`} style={{ height, width }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default PredictionChart;
