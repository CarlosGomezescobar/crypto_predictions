import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { TooltipItem } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation'; // Importar el plugin de anotaciones

// Registrar los componentes necesarios de Chart.js y el plugin de anotaciones
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin // Registrar el plugin de anotaciones
);

interface IndicatorChartProps {
  labels: string[];
  values: number[];
  title?: string;
  color?: string;
  threshold?: number;
  thresholdLabel?: string;
  height?: number;
  width?: number;
  className?: string;
}

const IndicatorChart: React.FC<IndicatorChartProps> = ({
  labels,
  values,
  title = 'Indicador',
  color = 'rgb(54, 162, 235)',
  threshold,
  thresholdLabel = 'Umbral',
  height = 300,
  width = 600,
  className = '',
}) => {
  const data = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
        backgroundColor: values.map((value) =>
          threshold !== undefined
            ? value > threshold
              ? 'rgba(255, 99, 132, 0.5)' // Rojo si supera el umbral
              : 'rgba(54, 162, 235, 0.5)' // Azul si está por debajo
            : color
        ),
        borderColor: values.map((value) =>
          threshold !== undefined
            ? value > threshold
              ? 'rgb(255, 99, 132)' // Rojo si supera el umbral
              : 'rgb(54, 162, 235)' // Azul si está por debajo
            : color
        ),
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'bar'>) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2);
            }
            return label;
          },
        },
      },
      annotation: {}, // Inicializar el objeto de anotaciones
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  // Añadir línea de umbral si se proporciona
  if (threshold !== undefined) {
    // Inicializar plugins si no está definido
    options.plugins = options.plugins || {};

    options.plugins.annotation = {
      annotations: {
        line1: {
          type: 'line',
          yMin: threshold,
          yMax: threshold,
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 2,
          label: {
            display: true,
            content: thresholdLabel,
            position: 'end',
          },
        },
      },
    };
  }

  return (
    <div className={`${className}`} style={{ height, width }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default IndicatorChart;