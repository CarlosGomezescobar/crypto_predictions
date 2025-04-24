import axios from 'axios';
import { ApiKeys } from '../types';

/**
 * Servicio para obtener datos on-chain y fundamentales de criptomonedas
 */
class OnChainDataService {
  private static instance: OnChainDataService;
  private glassnodeApiKey: string | null = null;
  private baseUrl: string = 'https://api.glassnode.com/v1';
  
  private constructor() {
    this.glassnodeApiKey = import.meta.env.VITE_GLASSNODE_API_KEY || null;
  }
  
  public static getInstance(): OnChainDataService {
    if (!OnChainDataService.instance) {
      OnChainDataService.instance = new OnChainDataService();
    }
    return OnChainDataService.instance;
  }
  
  /**
   * Configura las claves de API
   * @param apiKeys Objeto con claves de API
   */
  public setApiKeys(apiKeys: ApiKeys): void {
    if (apiKeys.glassnodeApiKey) {
      this.glassnodeApiKey = apiKeys.glassnodeApiKey;
    }
  }
  
  /**
   * Obtiene datos de reservas de exchanges
   * @param asset Activo (ej. 'BTC')
   * @param since Fecha de inicio (timestamp Unix)
   * @param until Fecha de fin (timestamp Unix)
   * @returns Datos de reservas de exchanges
   */
  public async getExchangeReserves(
    asset: string = 'BTC',
    since: number = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
    until: number = Math.floor(Date.now() / 1000)
  ): Promise<{ timestamp: number[]; value: number[] }> {
    try {
      if (!this.glassnodeApiKey) {
        throw new Error('API key de Glassnode no configurada');
      }
      
      const response = await axios.get(`${this.baseUrl}/metrics/distribution/balance_exchanges`, {
        params: {
          a: asset,
          s: since,
          u: until,
          api_key: this.glassnodeApiKey
        }
      });
      
      if (!Array.isArray(response.data)) {
        throw new Error('Formato de respuesta inválido');
      }
      
      const timestamps: number[] = [];
      const values: number[] = [];
      
      response.data.forEach((item: any) => {
        timestamps.push(item.t);
        values.push(item.v);
      });
      
      return { timestamp: timestamps, value: values };
    } catch (error) {
      console.error('Error al obtener reservas de exchanges:', error);
      return { timestamp: [], value: [] };
    }
  }
  
  /**
   * Obtiene datos de direcciones activas
   * @param asset Activo (ej. 'BTC')
   * @param since Fecha de inicio (timestamp Unix)
   * @param until Fecha de fin (timestamp Unix)
   * @returns Datos de direcciones activas
   */
  public async getActiveAddresses(
    asset: string = 'BTC',
    since: number = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
    until: number = Math.floor(Date.now() / 1000)
  ): Promise<{ timestamp: number[]; value: number[] }> {
    try {
      if (!this.glassnodeApiKey) {
        throw new Error('API key de Glassnode no configurada');
      }
      
      const response = await axios.get(`${this.baseUrl}/metrics/addresses/active_count`, {
        params: {
          a: asset,
          s: since,
          u: until,
          api_key: this.glassnodeApiKey
        }
      });
      
      if (!Array.isArray(response.data)) {
        throw new Error('Formato de respuesta inválido');
      }
      
      const timestamps: number[] = [];
      const values: number[] = [];
      
      response.data.forEach((item: any) => {
        timestamps.push(item.t);
        values.push(item.v);
      });
      
      return { timestamp: timestamps, value: values };
    } catch (error) {
      console.error('Error al obtener direcciones activas:', error);
      return { timestamp: [], value: [] };
    }
  }
  
  /**
   * Obtiene datos de hash rate de la red
   * @param asset Activo (ej. 'BTC')
   * @param since Fecha de inicio (timestamp Unix)
   * @param until Fecha de fin (timestamp Unix)
   * @returns Datos de hash rate
   */
  public async getHashRate(
    asset: string = 'BTC',
    since: number = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
    until: number = Math.floor(Date.now() / 1000)
  ): Promise<{ timestamp: number[]; value: number[] }> {
    try {
      if (!this.glassnodeApiKey) {
        throw new Error('API key de Glassnode no configurada');
      }
      
      const response = await axios.get(`${this.baseUrl}/metrics/mining/hash_rate_mean`, {
        params: {
          a: asset,
          s: since,
          u: until,
          api_key: this.glassnodeApiKey
        }
      });
      
      if (!Array.isArray(response.data)) {
        throw new Error('Formato de respuesta inválido');
      }
      
      const timestamps: number[] = [];
      const values: number[] = [];
      
      response.data.forEach((item: any) => {
        timestamps.push(item.t);
        values.push(item.v);
      });
      
      return { timestamp: timestamps, value: values };
    } catch (error) {
      console.error('Error al obtener hash rate:', error);
      return { timestamp: [], value: [] };
    }
  }
  
  /**
   * Obtiene datos de SOPR (Spent Output Profit Ratio)
   * @param asset Activo (ej. 'BTC')
   * @param since Fecha de inicio (timestamp Unix)
   * @param until Fecha de fin (timestamp Unix)
   * @returns Datos de SOPR
   */
  public async getSOPR(
    asset: string = 'BTC',
    since: number = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
    until: number = Math.floor(Date.now() / 1000)
  ): Promise<{ timestamp: number[]; value: number[] }> {
    try {
      if (!this.glassnodeApiKey) {
        throw new Error('API key de Glassnode no configurada');
      }
      
      const response = await axios.get(`${this.baseUrl}/metrics/indicators/sopr`, {
        params: {
          a: asset,
          s: since,
          u: until,
          api_key: this.glassnodeApiKey
        }
      });
      
      if (!Array.isArray(response.data)) {
        throw new Error('Formato de respuesta inválido');
      }
      
      const timestamps: number[] = [];
      const values: number[] = [];
      
      response.data.forEach((item: any) => {
        timestamps.push(item.t);
        values.push(item.v);
      });
      
      return { timestamp: timestamps, value: values };
    } catch (error) {
      console.error('Error al obtener SOPR:', error);
      return { timestamp: [], value: [] };
    }
  }
  
  /**
   * Obtiene múltiples métricas on-chain
   * @param asset Activo (ej. 'BTC')
   * @param days Número de días a obtener
   * @returns Objeto con múltiples métricas on-chain
   */
  public async getMultipleMetrics(
    asset: string = 'BTC',
    days: number = 30
  ): Promise<{
    exchangeReserves: { timestamp: number[]; value: number[] };
    activeAddresses: { timestamp: number[]; value: number[] };
    hashRate?: { timestamp: number[]; value: number[] };
    sopr: { timestamp: number[]; value: number[] };
  }> {
    const since = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;
    const until = Math.floor(Date.now() / 1000);
    
    const [exchangeReserves, activeAddresses, sopr] = await Promise.all([
      this.getExchangeReserves(asset, since, until),
      this.getActiveAddresses(asset, since, until),
      this.getSOPR(asset, since, until)
    ]);
    
    // Hash rate solo está disponible para BTC
    let hashRate;
    if (asset === 'BTC') {
      hashRate = await this.getHashRate(asset, since, until);
    }
    
    return {
      exchangeReserves,
      activeAddresses,
      hashRate,
      sopr
    };
  }
}

export default OnChainDataService;