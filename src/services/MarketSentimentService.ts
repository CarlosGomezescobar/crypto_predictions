import axios from 'axios';
import { MarketSentiment } from '../types';

/**
 * Servicio para obtener datos de sentimiento de mercado
 */
class MarketSentimentService {
  private static instance: MarketSentimentService;
  private apiUrl: string;
  
  private constructor() {
    this.apiUrl = import.meta.env.VITE_ALTERNATIVE_ME_API_URL || 'https://api.alternative.me/fng/';
  }
  
  public static getInstance(): MarketSentimentService {
    if (!MarketSentimentService.instance) {
      MarketSentimentService.instance = new MarketSentimentService();
    }
    return MarketSentimentService.instance;
  }
  
  /**
   * Obtiene el índice de miedo y codicia actual
   * @returns Datos de sentimiento de mercado
   */
  public async getFearGreedIndex(): Promise<MarketSentiment> {
    try {
      const response = await axios.get(this.apiUrl);
      const data = response.data;
      
      if (!data || !data.data || !data.data[0]) {
        throw new Error('Formato de respuesta inválido');
      }
      
      const fgData = data.data[0];
      const fgValue = parseInt(fgData.value);
      
      // Determinar categoría
      let fearGreedCategory: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
      if (fgValue <= 20) {
        fearGreedCategory = 'Extreme Fear';
      } else if (fgValue <= 40) {
        fearGreedCategory = 'Fear';
      } else if (fgValue <= 60) {
        fearGreedCategory = 'Neutral';
      } else if (fgValue <= 80) {
        fearGreedCategory = 'Greed';
      } else {
        fearGreedCategory = 'Extreme Greed';
      }
      
      // Determinar tendencia del mercado
      let marketTrend: 'bullish' | 'bearish' | 'neutral';
      let confidence: number;
      
      if (fgValue >= 70) {
        marketTrend = 'bullish';
        confidence = (fgValue - 70) / 30;
      } else if (fgValue <= 30) {
        marketTrend = 'bearish';
        confidence = (30 - fgValue) / 30;
      } else {
        marketTrend = 'neutral';
        confidence = 1 - Math.abs(fgValue - 50) / 20;
      }
      
      return {
        fearGreedIndex: fgValue,
        fearGreedCategory,
        marketTrend,
        confidence
      };
    } catch (error) {
      console.error('Error al obtener índice de miedo y codicia:', error);
      // Devolver valores por defecto en caso de error
      return {
        fearGreedIndex: 50,
        fearGreedCategory: 'Neutral',
        marketTrend: 'neutral',
        confidence: 0.5
      };
    }
  }
  
  /**
   * Obtiene el historial del índice de miedo y codicia
   * @param days Número de días a obtener
   * @returns Historial de sentimiento de mercado
   */
  public async getFearGreedHistory(days: number = 30): Promise<{
    dates: string[];
    values: number[];
    categories: string[];
  }> {
    try {
      const response = await axios.get(`${this.apiUrl}?limit=${days}`);
      const data = response.data;
      
      if (!data || !data.data) {
        throw new Error('Formato de respuesta inválido');
      }
      
      const history = data.data.reverse();
      const dates: string[] = [];
      const values: number[] = [];
      const categories: string[] = [];
      
      history.forEach((item: any) => {
        dates.push(item.timestamp);
        values.push(parseInt(item.value));
        categories.push(item.value_classification);
      });
      
      return { dates, values, categories };
    } catch (error) {
      console.error('Error al obtener historial de miedo y codicia:', error);
      return { dates: [], values: [], categories: [] };
    }
  }
}

export default MarketSentimentService;