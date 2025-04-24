import axios from 'axios';
import { CryptoAsset } from '../types';

/**
 * Servicio para obtener datos de noticias y eventos de criptomonedas
 */
class NewsService {
  private static instance: NewsService;
  private baseUrl: string = 'https://cryptopanic.com/api/v1';
  private apiKey: string | null = null;
  
  private constructor() {
    // Idealmente, esta clave debería estar en las variables de entorno
    this.apiKey = import.meta.env.VITE_CRYPTOPANIC_API_KEY || null;
  }
  
  public static getInstance(): NewsService {
    if (!NewsService.instance) {
      NewsService.instance = new NewsService();
    }
    return NewsService.instance;
  }
  
  /**
   * Establece la clave de API
   * @param apiKey Clave de API para CryptoPanic
   */
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }
  
  /**
   * Obtiene noticias recientes de criptomonedas
   * @param currency Moneda (ej. 'BTC')
   * @param kind Tipo de noticias ('news', 'media', 'all')
   * @param limit Número de noticias a obtener
   * @returns Lista de noticias
   */
  public async getNews(
    currency: string = '',
    kind: 'news' | 'media' | 'all' = 'all',
    limit: number = 10
  ): Promise<{
    title: string;
    url: string;
    source: string;
    published_at: string;
    votes: { positive: number; negative: number; important: number };
    currencies: CryptoAsset[];
  }[]> {
    try {
      const params: Record<string, string | number> = {
        limit,
        public: true
      };
      
      if (this.apiKey) {
        params.auth_token = this.apiKey;
      }
      
      if (currency) {
        params.currencies = currency;
      }
      
      if (kind !== 'all') {
        params.kind = kind;
      }
      
      const response = await axios.get(`${this.baseUrl}/posts/`, { params });
      
      if (!response.data || !response.data.results) {
        throw new Error('Formato de respuesta inválido');
      }
      
      return response.data.results.map((item: any) => ({
        title: item.title,
        url: item.url,
        source: item.source.title,
        published_at: item.published_at,
        votes: {
          positive: item.votes.positive || 0,
          negative: item.votes.negative || 0,
          important: item.votes.important || 0
        },
        currencies: item.currencies.map((c: any) => ({
          symbol: c.code,
          name: c.title,
          category: c.slug
        }))
      }));
    } catch (error) {
      console.error('Error al obtener noticias:', error);
      return [];
    }
  }
  
  /**
   * Obtiene eventos próximos de criptomonedas
   * @param currency Moneda (ej. 'BTC')
   * @param limit Número de eventos a obtener
   * @returns Lista de eventos
   */
  public async getEvents(
    currency: string = '',
    limit: number = 10
  ): Promise<{
    title: string;
    date: string;
    description: string;
    proof: string;
    source: string;
    currency: CryptoAsset;
    category: string;
  }[]> {
    // Nota: Esta es una implementación simulada ya que CryptoPanic no tiene API de eventos
    // En una implementación real, se conectaría a una API como CoinMarketCal
    
    // Simulamos algunos eventos para demostración
    const mockEvents = [
      {
        title: 'Actualización de red Ethereum 2.0',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Actualización importante de la red Ethereum que mejora la escalabilidad y reduce las comisiones.',
        proof: 'https://ethereum.org',
        source: 'Ethereum Foundation',
        currency: { symbol: 'ETH/USDT', name: 'Ethereum', category: 'smart-contract' },
        category: 'Actualización de red'
      },
      {
        title: 'Conferencia Bitcoin 2023',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'La mayor conferencia de Bitcoin del año con presentaciones de líderes de la industria.',
        proof: 'https://bitcoin.org',
        source: 'Bitcoin Foundation',
        currency: { symbol: 'BTC/USDT', name: 'Bitcoin', category: 'cryptocurrency' },
        category: 'Conferencia'
      },
      {
        title: 'Listado de Cardano en nuevo exchange',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Cardano será listado en un importante exchange, aumentando su liquidez y accesibilidad.',
        proof: 'https://cardano.org',
        source: 'Cardano Foundation',
        currency: { symbol: 'ADA/USDT', name: 'Cardano', category: 'smart-contract' },
        category: 'Listado en exchange'
      }
    ];
    
    // Filtrar por moneda si se especifica
    let filteredEvents = mockEvents;
    if (currency) {
      filteredEvents = mockEvents.filter(event => 
        event.currency.symbol.split('/')[0] === currency
      );
    }
    
    // Limitar número de resultados
    return filteredEvents.slice(0, limit);
  }
  
  /**
   * Analiza el sentimiento de las noticias
   * @param news Lista de noticias
   * @returns Puntuación de sentimiento (-1 a 1)
   */
  public analyzeSentiment(news: {
    title: string;
    votes: { positive: number; negative: number; important: number };
  }[]): number {
    if (news.length === 0) {
      return 0;
    }
    
    let totalScore = 0;
    
    for (const item of news) {
      const { positive, negative } = item.votes;
      const itemScore = positive - negative;
      
      // Análisis simple de palabras clave en el título
      const title = item.title.toLowerCase();
      if (title.includes('bull') || title.includes('surge') || title.includes('soar') || title.includes('gain')) {
        totalScore += 1;
      } else if (title.includes('bear') || title.includes('crash') || title.includes('plunge') || title.includes('loss')) {
        totalScore -= 1;
      }
      
      // Añadir puntuación de votos
      totalScore += itemScore;
    }
    
    // Normalizar a un rango de -1 a 1
    return Math.max(-1, Math.min(1, totalScore / (news.length * 2)));
  }
}

export default NewsService;
