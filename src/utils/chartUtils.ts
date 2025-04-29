/**
 * Utilidades para formateo y manipulación de datos para visualizaciones
 */

import { ChartOptions } from '../types';

import { TooltipItem } from 'chart.js'; // ChartOptions

export const generateChartOptions = (
  title: string,
  xAxisLabel: string,
  yAxisLabel: string,
  isDarkMode: boolean = false
): ChartOptions => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
        color: isDarkMode ? '#ffffff' : '#333333',
      },
      legend: {
        display: true,
        labels: {
          color: isDarkMode ? '#ffffff' : '#333333',
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed.y.toFixed(2);
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: xAxisLabel,
          color: isDarkMode ? '#ffffff' : '#333333',
        },
        ticks: {
          color: isDarkMode ? '#ffffff' : '#333333',
        },
        grid: {
          color: isDarkMode ? '#444444' : '#cccccc',
        },
      },
      y: {
        title: {
          display: true,
          text: yAxisLabel,
          color: isDarkMode ? '#ffffff' : '#333333',
        },
        ticks: {
          color: isDarkMode ? '#ffffff' : '#333333',
        },
        grid: {
          color: isDarkMode ? '#444444' : '#cccccc',
        },
      },
    },
  } as ChartOptions;
};
/**
 * Prepara datos para gráficos de línea
 * @param labels Etiquetas para el eje X
 * @param datasets Conjuntos de datos a visualizar
 * @param options Opciones de configuración
 * @returns Configuración para Chart.js
 */
export const prepareLineChartData = (
  labels: string[],
  datasets: {
    label: string;
    data: number[];
    color?: string;
    fill?: boolean;
    dashed?: boolean;
  }[],
  options?: {
    title?: string;
    yAxisLabel?: string;
    xAxisLabel?: string;
    isDarkMode?: boolean;
  }
) => {
  const isDarkMode = options?.isDarkMode || false;
  const baseColors = [
    '#3B82F6', // blue
    '#EF4444', // red
    '#10B981', // green
    '#F59E0B', // amber
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#6366F1', // indigo
    '#14B8A6'  // teal
  ];

  return {
    data: {
      labels,
      datasets: datasets.map((dataset, index) => {
        const color = dataset.color || baseColors[index % baseColors.length];
        
        return {
          label: dataset.label,
          data: dataset.data,
          borderColor: color,
          backgroundColor: dataset.fill ? hexToRgba(color, 0.2) : 'transparent',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.4,
          fill: dataset.fill || false,
          borderDash: dataset.dashed ? [5, 5] : [],
        };
      }),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: !!options?.title,
          text: options?.title || '',
          color: isDarkMode ? '#E5E7EB' : '#1F2937',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          position: 'top',
          labels: {
            color: isDarkMode ? '#E5E7EB' : '#1F2937',
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
          titleColor: isDarkMode ? '#F3F4F6' : '#111827',
          bodyColor: isDarkMode ? '#D1D5DB' : '#4B5563',
          borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
          borderWidth: 1,
          padding: 10,
          boxPadding: 5,
          usePointStyle: true,
          callbacks: {
            label: function(context: TooltipItem<'line'>) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('es-ES', { 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(context.parsed.y);
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: isDarkMode ? '#374151' : '#E5E7EB',
            drawBorder: false,
          },
          ticks: {
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
            maxRotation: 45,
            minRotation: 45
          },
          title: {
            display: !!options?.xAxisLabel,
            text: options?.xAxisLabel || '',
            color: isDarkMode ? '#E5E7EB' : '#1F2937',
          }
        },
        y: {
          grid: {
            color: isDarkMode ? '#374151' : '#E5E7EB',
            drawBorder: false,
          },
          ticks: {
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
          },
          title: {
            display: !!options?.yAxisLabel,
            text: options?.yAxisLabel || '',
            color: isDarkMode ? '#E5E7EB' : '#1F2937',
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      elements: {
        line: {
          tension: 0.4
        }
      }
    }
  };
};

/**
 * Prepara datos para gráficos de barras
 * @param labels Etiquetas para el eje X
 * @param datasets Conjuntos de datos a visualizar
 * @param options Opciones de configuración
 * @returns Configuración para Chart.js
 */
export const prepareBarChartData = (
  labels: string[],
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[],
  options?: {
    title?: string;
    yAxisLabel?: string;
    xAxisLabel?: string;
    stacked?: boolean;
    isDarkMode?: boolean;
  }
) => {
  const isDarkMode = options?.isDarkMode || false;
  const baseColors = [
    '#3B82F6', // blue
    '#EF4444', // red
    '#10B981', // green
    '#F59E0B', // amber
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#6366F1', // indigo
    '#14B8A6'  // teal
  ];

  return {
    data: {
      labels,
      datasets: datasets.map((dataset, index) => {
        const color = dataset.color || baseColors[index % baseColors.length];
        
        return {
          label: dataset.label,
          data: dataset.data,
          backgroundColor: hexToRgba(color, 0.7),
          borderColor: color,
          borderWidth: 1,
          borderRadius: 4,
          hoverBackgroundColor: color,
        };
      }),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: !!options?.title,
          text: options?.title || '',
          color: isDarkMode ? '#E5E7EB' : '#1F2937',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          position: 'top',
          labels: {
            color: isDarkMode ? '#E5E7EB' : '#1F2937',
            usePointStyle: true,
            pointStyle: 'rect'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
          titleColor: isDarkMode ? '#F3F4F6' : '#111827',
          bodyColor: isDarkMode ? '#D1D5DB' : '#4B5563',
          borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
          borderWidth: 1,
          padding: 10,
          boxPadding: 5,
          usePointStyle: true,
        }
      },
      scales: {
        x: {
          stacked: options?.stacked || false,
          grid: {
            color: isDarkMode ? '#374151' : '#E5E7EB',
            drawBorder: false,
          },
          ticks: {
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
          },
          title: {
            display: !!options?.xAxisLabel,
            text: options?.xAxisLabel || '',
            color: isDarkMode ? '#E5E7EB' : '#1F2937',
          }
        },
        y: {
          stacked: options?.stacked || false,
          grid: {
            color: isDarkMode ? '#374151' : '#E5E7EB',
            drawBorder: false,
          },
          ticks: {
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
          },
          title: {
            display: !!options?.yAxisLabel,
            text: options?.yAxisLabel || '',
            color: isDarkMode ? '#E5E7EB' : '#1F2937',
          }
        }
      }
    }
  };
};

/**
 * Prepara datos para gráficos de velas (candlestick)
 * @param data Datos OHLC
 * @param options Opciones de configuración
 * @returns Configuración para Chart.js con plugin de candlestick
 */
export const prepareCandlestickData = (
  data: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
  }[],
  options?: {
    title?: string;
    yAxisLabel?: string;
    xAxisLabel?: string;
    isDarkMode?: boolean;
  }
) => {
  const isDarkMode = options?.isDarkMode || false;
  
  // Preparar datos para el formato requerido por el plugin de candlestick
  const candlestickData = data.map(item => ({
    x: item.time,
    o: item.open,
    h: item.high,
    l: item.low,
    c: item.close
  }));
  
  return {
    data: {
      datasets: [
        {
          label: 'OHLC',
          data: candlestickData,
          color: {
            up: '#10B981', // verde para velas alcistas
            down: '#EF4444', // rojo para velas bajistas
            unchanged: '#6B7280', // gris para velas sin cambio
          }
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: !!options?.title,
          text: options?.title || '',
          color: isDarkMode ? '#E5E7EB' : '#1F2937',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
          titleColor: isDarkMode ? '#F3F4F6' : '#111827',
          bodyColor: isDarkMode ? '#D1D5DB' : '#4B5563',
          borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function(context) {
              const point = context.raw as any;
              return [
                `Apertura: ${new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2 }).format(point.o)}`,
                `Máximo: ${new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2 }).format(point.h)}`,
                `Mínimo: ${new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2 }).format(point.l)}`,
                `Cierre: ${new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2 }).format(point.c)}`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: isDarkMode ? '#374151' : '#E5E7EB',
            drawBorder: false,
          },
          ticks: {
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
            maxRotation: 45,
            minRotation: 45
          },
          title: {
            display: !!options?.xAxisLabel,
            text: options?.xAxisLabel || '',
            color: isDarkMode ? '#E5E7EB' : '#1F2937',
          }
        },
        y: {
          grid: {
            color: isDarkMode ? '#374151' : '#E5E7EB',
            drawBorder: false,
          },
          ticks: {
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
          },
          title: {
            display: !!options?.yAxisLabel,
            text: options?.yAxisLabel || '',
            color: isDarkMode ? '#E5E7EB' : '#1F2937',
          }
        }
      }
    }
  };
};

/**
 * Prepara datos para gráficos de radar
 * @param labels Etiquetas para los ejes
 * @param datasets Conjuntos de datos a visualizar
 * @param options Opciones de configuración
 * @returns Configuración para Chart.js
 */
export const prepareRadarChartData = (
  labels: string[],
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[],
  options?: {
    title?: string;
    isDarkMode?: boolean;
  }
) => {
  const isDarkMode = options?.isDarkMode || false;
  const baseColors = [
    '#3B82F6', // blue
    '#EF4444', // red
    '#10B981', // green
    '#F59E0B', // amber
    '#8B5CF6', // purple
  ];

  return {
    data: {
      labels,
      datasets: datasets.map((dataset, index) => {
        const color = dataset.color || baseColors[index % baseColors.length];
        
        return {
          label: dataset.label,
          data: dataset.data,
          backgroundColor: hexToRgba(color, 0.2),
          borderColor: color,
          borderWidth: 2,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: color,
          pointRadius: 3,
          pointHoverRadius: 5,
        };
      }),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: !!options?.title,
          text: options?.title || '',
          color: isDarkMode ? '#E5E7EB' : '#1F2937',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          position: 'top',
          labels: {
            color: isDarkMode ? '#E5E7EB' : '#1F2937',
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
          titleColor: isDarkMode ? '#F3F4F6' : '#111827',
          bodyColor: isDarkMode ? '#D1D5DB' : '#4B5563',
          borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
          borderWidth: 1,
          padding: 10,
          boxPadding: 5,
          usePointStyle: true,
        }
      },
      scales: {
        r: {
          angleLines: {
            color: isDarkMode ? '#4B5563' : '#E5E7EB',
          },
          grid: {
            color: isDarkMode ? '#374151' : '#E5E7EB',
          },
          pointLabels: {
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
            font: {
              size: 12
            }
          },
          ticks: {
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
            backdropColor: isDarkMode ? '#1F2937' : '#FFFFFF',
          }
        }
      }
    }
  };
};

/**
 * Prepara datos para gráficos de dispersión
 * @param datasets Conjuntos de datos a visualizar
 * @param options Opciones de configuración
 * @returns Configuración para Chart.js
 */
export const prepareScatterChartData = (
  datasets: {
    label: string;
    data: { x: number; y: number }[];
    color?: string;
  }[],
  options?: {
    title?: string;
    yAxisLabel?: string;
    xAxisLabel?: string;
    isDarkMode?: boolean;
  }
) => {
  const isDarkMode = options?.isDarkMode || false;
  const baseColors = [
    '#3B82F6', // blue
    '#EF4444', // red
    '#10B981', // green
    '#F59E0B', // amber
    '#8B5CF6', // purple
  ];

  return {
    data: {
      datasets: datasets.map((dataset, index) => {
        const color = dataset.color || baseColors[index % baseColors.length];
        
        return {
          label: dataset.label,
          data: dataset.data,
          backgroundColor: color,
          borderColor: color,
          borderWidth: 1,
          pointRadius: 5,
          pointHoverRadius: 7,
        };
      }),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: !!options?.title,
          text: options?.title || '',
          color: isDarkMode ? '#E5E7EB' : '#1F2937',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          position: 'top',
          labels: {
            color: isDarkMode ? '#E5E7EB' : '#1F2937',
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
          titleColor: isDarkMode ? '#F3F4F6' : '#111827',
          bodyColor: isDarkMode ? '#D1D5DB' : '#4B5563',
          borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
          borderWidth: 1,
          padding: 10,
          boxPadding: 5,
          usePointStyle: true,
          callbacks: {
            label: function(context: TooltipItem<'line'>) {
              const point = context.raw as { x: number; y: number };
              return `(${point.x.toFixed(2)}, ${point.y.toFixed(2)})`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: isDarkMode ? '#374151' : '#E5E7EB',
            drawBorder: false,
          },
          ticks: {
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
            maxRotation: 45,
            minRotation: 45,
          },
          title: {
            display: !!options?.xAxisLabel,
            text: options?.xAxisLabel || '',
            color: isDarkMode ? '#E5E7EB' : '#1F2937',
          },
        },
        y: {
          grid: {
            color: isDarkMode ? '#374151' : '#E5E7EB',
            drawBorder: false,
          },
          ticks: {
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
          },
          title: {
            display: !!options?.yAxisLabel,
            text: options?.yAxisLabel || '',
            color: isDarkMode ? '#E5E7EB' : '#1F2937',
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
          titleColor: isDarkMode ? '#F3F4F6' : '#111827',
          bodyColor: isDarkMode ? '#D1D5DB' : '#4B5563',
          borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
          borderWidth: 1,
          padding: 10,
          boxPadding: 5,
          callbacks: {
            label: (context: TooltipItem<'line'>) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y || 0;
              return `${label}: ${value.toFixed(2)}`;
            },
          },
        },
        title: {
          display: !!options?.title,
          text: options?.title || '',
          color: isDarkMode ? '#E5E7EB' : '#1F2937',
          font: {
            size: 16,
            weight: 'bold',
          },
        },
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
      },
      elements: {
        line: {
          tension: 0.4, // Curva suave para gráficos de línea
        },
        point: {
          radius: 3,
          hoverRadius: 5,
        },
      }
    }
  }
}


export const preparePredictionChartData = (
  historicalDates: string[],
  historicalPrices: number[],
  predictionDates: string[],
  predictionPrices: number[],
  options?: {
    title?: string;
    yAxisLabel?: string;
    xAxisLabel?: string;
    historicalLabel?: string;
    predictionLabel?: string;
    historicalColor?: string;
    predictionColor?: string;
    confidenceInterval?: { upper: number[]; lower: number[] };
    isDarkMode?: boolean;
  }
) => {
  const isDarkMode = options?.isDarkMode || false;

  return {
    data: {
      labels: [...historicalDates, ...predictionDates],
      datasets: [
        {
          label: options?.historicalLabel || 'Datos Históricos',
          data: [...historicalPrices, ...Array(predictionDates.length).fill(null)],
          borderColor: options?.historicalColor || '#3B82F6', // Azul
          backgroundColor: hexToRgba(options?.historicalColor || '#3B82F6', 0.2),
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        },
        {
          label: options?.predictionLabel || 'Predicción',
          data: Array(historicalDates.length).fill(null).concat(predictionPrices),
          borderColor: options?.predictionColor || '#EF4444', // Rojo
          backgroundColor: hexToRgba(options?.predictionColor || '#EF4444', 0.2),
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        },
        ...(options?.confidenceInterval
          ? [
              {
                label: 'Intervalo de Confianza (Superior)',
                data: Array(historicalDates.length)
                  .fill(null)
                  .concat(options.confidenceInterval.upper),
                borderColor: '#8B5CF6', // Púrpura
                borderWidth: 1,
                borderDash: [5, 5],
                fill: false,
              },
              {
                label: 'Intervalo de Confianza (Inferior)',
                data: Array(historicalDates.length)
                  .fill(null)
                  .concat(options.confidenceInterval.lower),
                borderColor: '#8B5CF6', // Púrpura
                borderWidth: 1,
                borderDash: [5, 5],
                fill: false,
              },
            ]
          : []),
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: !!options?.title,
          text: options?.title || '',
          color: isDarkMode ? '#E5E7EB' : '#1F2937',
          font: { size: 16, weight: 'bold' },
        },
        legend: {
          position: 'top',
          labels: {
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
      scales: {
        x: {
          title: {
            display: !!options?.xAxisLabel,
            text: options?.xAxisLabel || '',
            color: isDarkMode ? '#E5E7EB' : '#1F2937',
          },
          ticks: {
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
          },
          grid: {
            color: isDarkMode ? '#4B5563' : '#E5E7EB',
          },
        },
        y: {
          title: {
            display: !!options?.yAxisLabel,
            text: options?.yAxisLabel || '',
            color: isDarkMode ? '#E5E7EB' : '#1F2937',
          },
          ticks: {
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
          },
          grid: {
            color: isDarkMode ? '#4B5563' : '#E5E7EB',
          },
        },
      },
    },
  };
};

export const prepareTechnicalIndicatorChart = (
  dates: string[],
  values: number[],
  thresholds?: { upper?: number; lower?: number; upperColor?: string; lowerColor?: string },
  options?: {
    title?: string;
    yAxisLabel?: string;
    xAxisLabel?: string;
    indicatorColor?: string;
    isDarkMode?: boolean;
  }
) => {
  const isDarkMode = options?.isDarkMode || false;

  return {
    data: {
      labels: dates,
      datasets: [
        {
          label: options?.yAxisLabel || 'Indicador',
          data: values,
          borderColor: options?.indicatorColor || '#3B82F6', // Azul
          backgroundColor: hexToRgba(options?.indicatorColor || '#3B82F6', 0.2),
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        },
        ...(thresholds?.upper !== undefined
          ? [
              {
                label: `Umbral Superior (${thresholds.upper})`,
                data: Array(dates.length).fill(thresholds.upper),
                borderColor: thresholds.upperColor || '#EF4444', // Rojo
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
              },
            ]
          : []),
        ...(thresholds?.lower !== undefined
          ? [
              {
                label: `Umbral Inferior (${thresholds.lower})`,
                data: Array(dates.length).fill(thresholds.lower),
                borderColor: thresholds.lowerColor || '#10B981', // Verde
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
              },
            ]
          : []),
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: !!options?.title,
          text: options?.title || '',
          color: isDarkMode ? '#E5E7EB' : '#1F2937',
          font: { size: 16, weight: 'bold' },
        },
        legend: {
          position: 'top',
          labels: {
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
          },
        },
      },
      scales: {
        x: {
          title: {
            display: !!options?.xAxisLabel,
            text: options?.xAxisLabel || '',
            color: isDarkMode ? '#E5E7EB' : '#1F2937',
          },
          ticks: {
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
          },
          grid: {
            color: isDarkMode ? '#4B5563' : '#E5E7EB',
          },
        },
        y: {
          title: {
            display: !!options?.yAxisLabel,
            text: options?.yAxisLabel || '',
            color: isDarkMode ? '#E5E7EB' : '#1F2937',
          },
          ticks: {
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
          },
          grid: {
            color: isDarkMode ? '#4B5563' : '#E5E7EB',
          },
        },
      },
    },
  };
};
export const prepareCorrelationHeatmap = (
  assets: string[],
  matrix: number[][],
  options?: {
    title?: string;
    isDarkMode?: boolean;
  }
) => {
  const isDarkMode = options?.isDarkMode || false;

  return {
    data: {
      labels: assets,
      datasets: [
        {
          data: matrix.flat(),
          backgroundColor: generateColorPalette(matrix.flat(), isDarkMode),
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: !!options?.title,
          text: options?.title || '',
          color: isDarkMode ? '#E5E7EB' : '#1F2937',
          font: { size: 16, weight: 'bold' },
        },
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          ticks: {
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
          },
          grid: {
            color: isDarkMode ? '#4B5563' : '#E5E7EB',
          },
        },
        y: {
          ticks: {
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
          },
          grid: {
            color: isDarkMode ? '#4B5563' : '#E5E7EB',
          },
        },
      },
    },
  };
};

export const prepareBacktestChart = (
  dates: string[],
  balance: number[],
  trades: { entryDate: string; exitDate: string; profit: number }[],
  options?: {
    title?: string;
    balanceLabel?: string;
    buyColor?: string;
    sellColor?: string;
    isDarkMode?: boolean;
  }
) => {
  const isDarkMode = options?.isDarkMode || false;

  return {
    data: {
      labels: dates,
      datasets: [
        {
          label: options?.balanceLabel || 'Balance',
          data: balance,
          borderColor: options?.buyColor || '#3B82F6', // Azul
          backgroundColor: hexToRgba(options?.buyColor || '#3B82F6', 0.2),
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        },
        {
          label: 'Operaciones',
          data: trades.map((trade) => ({
            x: trade.exitDate,
            y: balance[dates.indexOf(trade.exitDate)],
          })),
          borderColor: options?.sellColor || '#EF4444', // Rojo
          backgroundColor: hexToRgba(options?.sellColor || '#EF4444', 0.5),
          borderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: !!options?.title,
          text: options?.title || '',
          color: isDarkMode ? '#E5E7EB' : '#1F2937',
          font: { size: 16, weight: 'bold' },
        },
        legend: {
          position: 'top',
          labels: {
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Fecha',
            color: isDarkMode ? '#E5E7EB' : '#1F2937',
          },
          ticks: {
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
          },
          grid: {
            color: isDarkMode ? '#4B5563' : '#E5E7EB',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Balance',
            color: isDarkMode ? '#E5E7EB' : '#1F2937',
          },
          ticks: {
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
          },
          grid: {
            color: isDarkMode ? '#4B5563' : '#E5E7EB',
          },
        },
      },
    },
  };
};

export const preparePortfolioChart = (
  assets: string[],
  allocations: number[],
  options?: {
    title?: string;
    isDarkMode?: boolean;
  }
) => {
  const isDarkMode = options?.isDarkMode || false;

  return {
    data: {
      labels: assets,
      datasets: [
        {
          data: allocations,
          backgroundColor: generateColorPalette(allocations, isDarkMode),
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: !!options?.title,
          text: options?.title || '',
          color: isDarkMode ? '#E5E7EB' : '#1F2937',
          font: { size: 16, weight: 'bold' },
        },
        legend: {
          position: 'right',
          labels: {
            color: isDarkMode ? '#D1D5DB' : '#4B5563',
          },
        },
      },
    },
  };
};


export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const cleanedHex = hex.replace('#', '');
  const r = parseInt(cleanedHex.slice(0, 2), 16);
  const g = parseInt(cleanedHex.slice(2, 4), 16);
  const b = parseInt(cleanedHex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
export const generateColorPalette = (values: number[], isDarkMode: boolean): string[] => {
  const baseColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
  return values.map((_, i) => hexToRgba(baseColors[i % baseColors.length], isDarkMode ? 0.8 : 0.6));
};