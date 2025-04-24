# Documentación del Sistema de Predicción de Criptomonedas

## Descripción General

Este proyecto es un sistema avanzado de predicción de criptomonedas desarrollado con Vite.js y TypeScript. Proporciona herramientas para análisis técnico, predicción de precios, backtesting de estrategias y gestión de riesgo, todo integrado en una interfaz de usuario moderna y responsiva.

## Estructura del Proyecto

```
crypto-prediction-frontend/
├── src/
│   ├── components/         # Componentes reutilizables
│   ├── hooks/              # Hooks personalizados
│   ├── services/           # Servicios para obtención de datos
│   ├── types/              # Definiciones de tipos TypeScript
│   ├── utils/              # Funciones de utilidad
│   ├── views/              # Vistas principales
│   ├── App.tsx             # Componente principal
│   └── main.tsx            # Punto de entrada
├── public/                 # Archivos estáticos
├── .env                    # Variables de entorno
├── vite.config.ts          # Configuración de Vite
└── tailwind.config.js      # Configuración de Tailwind CSS
```

## Características Principales

### 1. Análisis Técnico y Fundamental
- Cálculo de indicadores técnicos (RSI, MACD, Bandas de Bollinger, etc.)
- Análisis de tendencias y patrones
- Integración con datos on-chain y sentimiento de mercado

### 2. Predicción de Precios
- Modelos de machine learning para predicción de precios
- Intervalos de confianza para predicciones
- Entrenamiento personalizable de modelos

### 3. Backtesting de Estrategias
- Prueba de estrategias en datos históricos
- Métricas de rendimiento (Sharpe ratio, drawdown, etc.)
- Visualización de resultados

### 4. Gestión de Riesgo
- Cálculo de tamaño óptimo de posición
- Análisis de correlación entre activos
- Optimización de cartera

### 5. Visualizaciones Avanzadas
- Gráficos interactivos de precios
- Visualización de indicadores técnicos
- Gráficos de predicción y backtesting

## Componentes Principales

### Hooks Personalizados

- **useAppState**: Gestión del estado global de la aplicación
- **usePrediction**: Funcionalidad de predicción de precios
- **useAnalysis**: Análisis técnico y fundamental
- **usePerformance**: Optimización de rendimiento

### Servicios

- **PredictionService**: Servicio principal para predicciones
- **MarketSentimentService**: Datos de sentimiento de mercado
- **OnChainDataService**: Datos on-chain y fundamentales
- **NewsService**: Noticias y eventos de criptomonedas

### Componentes de UI

- **AdvancedCharts**: Visualizaciones avanzadas de datos
- **AdvancedUI**: Componentes de interfaz interactivos
- **Card, Button, Alert, etc.**: Componentes básicos de UI

### Vistas

- **Dashboard**: Panel principal con visión general
- **DataVisualization**: Visualización detallada de datos
- **PredictionView**: Entrenamiento y visualización de predicciones
- **TradingSignalsView**: Señales de trading
- **IntegrationTest**: Pruebas de integración

## Optimizaciones de Rendimiento

- **Memoización**: Evita cálculos innecesarios
- **Debounce y Throttle**: Limita la frecuencia de operaciones costosas
- **Virtualización**: Renderizado eficiente de listas largas
- **Caché de Datos**: Almacenamiento local con tiempo de expiración
- **Web Workers**: Procesamiento en segundo plano

## Guía de Uso

### Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>

# Instalar dependencias
cd crypto-prediction-frontend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus claves de API

# Iniciar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

### Configuración de APIs

El sistema utiliza varias APIs externas para obtener datos. Configura tus claves de API en el archivo `.env`:

```
VITE_BINANCE_API_KEY=tu_clave_api
VITE_GLASSNODE_API_KEY=tu_clave_api
VITE_CRYPTOPANIC_API_KEY=tu_clave_api
VITE_ALTERNATIVE_ME_API_URL=https://api.alternative.me/fng/
```

### Uso Básico

1. **Dashboard**: Proporciona una visión general del mercado, precios actuales y tendencias.
2. **Visualización**: Permite explorar datos históricos con diversos indicadores técnicos.
3. **Predicción**: Entrena modelos de predicción y visualiza resultados futuros.
4. **Señales**: Genera y visualiza señales de trading basadas en análisis técnico.
5. **Pruebas**: Verifica la integración y rendimiento de todos los componentes.

## Extensión y Personalización

### Añadir Nuevos Indicadores Técnicos

Para añadir un nuevo indicador técnico, sigue estos pasos:

1. Implementa la función de cálculo en `utils/calculationUtils.ts`
2. Añade la visualización en `components/AdvancedCharts.tsx`
3. Integra el indicador en `hooks/useAnalysis.ts`

### Implementar Nuevas Estrategias de Trading

Para añadir una nueva estrategia de trading:

1. Define la lógica de la estrategia en `hooks/useAnalysis.ts`
2. Implementa la función de backtesting en `services/PredictionService.ts`
3. Añade la visualización de resultados en `views/TradingSignalsView.tsx`

### Personalizar Modelos de Predicción

Para personalizar o añadir nuevos modelos de predicción:

1. Modifica la implementación del modelo en `services/PredictionService.ts`
2. Actualiza las opciones de entrenamiento en `hooks/usePrediction.ts`
3. Ajusta la visualización de predicciones en `components/AdvancedCharts.tsx`

## Mejores Prácticas

- **Rendimiento**: Utiliza los hooks de optimización para operaciones costosas
- **Datos**: Implementa caché para datos que no cambian frecuentemente
- **UI**: Utiliza componentes virtualizados para listas largas
- **Modelos**: Entrena modelos con suficientes datos históricos para mayor precisión
- **Backtesting**: Verifica estrategias en diferentes condiciones de mercado

## Solución de Problemas

### Problemas Comunes

1. **Datos no disponibles**: Verifica tus claves de API y conexión a internet
2. **Rendimiento lento**: Utiliza los hooks de optimización y considera reducir la cantidad de datos procesados
3. **Errores de predicción**: Aumenta el tamaño del conjunto de entrenamiento y ajusta los parámetros del modelo
4. **Problemas de visualización**: Asegúrate de que los datos están en el formato correcto para los componentes de gráficos

### Depuración

El sistema incluye herramientas de medición de rendimiento que pueden ayudar a identificar cuellos de botella:

```typescript
import { usePerformanceMeasure } from '../hooks/usePerformance';

const { startMeasure, endMeasure, getMeasurements } = usePerformanceMeasure();

// Medir tiempo de operación
startMeasure('operationName');
// Realizar operación
const duration = endMeasure('operationName');
console.log(`Operación completada en ${duration}ms`);
```

## Recursos Adicionales

- [Documentación de Vite.js](https://vitejs.dev/guide/)
- [Documentación de TypeScript](https://www.typescriptlang.org/docs/)
- [Documentación de Chart.js](https://www.chartjs.org/docs/latest/)
- [Documentación de TensorFlow.js](https://www.tensorflow.org/js/guide)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)

## Contribución

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Haz fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Haz push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.