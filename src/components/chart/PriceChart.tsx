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

interface PriceChartProps {
  labels: string[];
  prices: number[];
  title?: string;
  borderColor?: string;
  backgroundColor?: string;
  height?: number;
  width?: number;
  className?: string;
}

const PriceChart: React.FC<PriceChartProps> = ({
  labels,
  prices,
  title = 'Precio histórico',
  borderColor = 'rgb(75, 192, 192)',
  backgroundColor = 'rgba(75, 192, 192, 0.2)',
  height = 300,
  width = 600,
  className = ''
}) => {
  const data = {
    labels,
    datasets: [
      {
        label: title,
        data: prices,
        borderColor,
        backgroundColor,
        tension: 0.1,
        fill: true,
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
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div className={`${className}`} style={{ height, width }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default PriceChart;