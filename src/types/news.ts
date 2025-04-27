import { CryptoAsset } from '../types';
// Tipos para las monedas asociadas a una noticia
export interface NewsCurrency {
    code: string;
    title: string;
    slug: string;
  }
  
  // Tipos para los votos de una noticia
  export interface NewsVotes {
    positive: number;
    negative: number;
    important: number;
  }
  
  // Tipos para una noticia
  export interface NewsItem {
    title: string;
    url: string;
    source: string;
    publishedAt: string; // Cambiar published_at a publishedAt
    sentiment: 'positive' | 'negative' | 'neutral';
    relevance: number;
    summary?: string;
    currencies: CryptoAsset[];
  }