/**
 * Utilidades para formateo y manipulación de datos para visualizaciones
 */

import { ChartOptions } from '../types';
import { hexToRgba, generateColorPalette } from './calculationUtils';

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
            label: function(context) {
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
            label: function(context) {
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
       
(Content truncated due to size limit. Use line ranges to read in chunks)