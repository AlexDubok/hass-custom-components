import { HomeAssistantService } from './ha-service';
import { SprinkleConfig } from '../types/config';
import {
  WeatherData,
  ForecastItem,
  RainHistory,
  MetNoWeatherEntity,
  MetNoForecastItem
} from '../types/weather';

export class WeatherService {
  private weatherEntityId: string;
  private lastRainHistoryFetch: number = 0;
  private cachedRainHistory: RainHistory | null = null;
  
  constructor(private haService: HomeAssistantService, config: SprinkleConfig) {
    this.weatherEntityId = config.weather_entity || '';
  }
  
  /**
   * Get current weather data from the configured weather entity
   * @returns WeatherData object or null if unavailable
   */
  getCurrentWeather(): WeatherData | null {
    try {
      if (!this.weatherEntityId) {
        console.warn('No weather entity configured');
        return null;
      }
      
      const entity = this.haService.getEntityState(this.weatherEntityId);
      if (!entity || !entity.state) {
        console.warn(`Weather entity ${this.weatherEntityId} not found or unavailable`);
        return null;
      }
      
      // Cast the entity to MetNoWeatherEntity for processing
      return this.parseMetNoWeatherEntity(entity as unknown as MetNoWeatherEntity);
    } catch (error) {
      console.warn('Error getting current weather:', error);
      return null;
    }
  }
  
  /**
   * Get rain history for the past 2 days
   * @returns RainHistory object or null if unavailable
   */
  async getRecentRainHistory(): Promise<RainHistory | null> {
    try {
      const now = Date.now();
      if (this.cachedRainHistory && (now - this.lastRainHistoryFetch < 60 * 60 * 1000)) {
        return this.cachedRainHistory;
      }
      
      if (!this.weatherEntityId) {
        console.warn('No weather entity configured');
        return null;
      }
      
      const rainHistory = await this.queryHistoryForPrecipitation();
      
      this.cachedRainHistory = rainHistory;
      this.lastRainHistoryFetch = now;
      
      return rainHistory;
    } catch (error) {
      console.warn('Error getting rain history:', error);
      return null;
    }
  }
  
  /**
   * Parse a Met.no weather entity into our WeatherData format
   * @param entity The weather entity from Home Assistant
   * @returns WeatherData object or null if parsing fails
   */
  private parseMetNoWeatherEntity(entity: MetNoWeatherEntity): WeatherData | null {
    try {
      if (!entity || !entity.state || !entity.attributes) {
        return null;
      }
      
      // Validate temperature is reasonable
      const temperature = entity.attributes.temperature;
      if (typeof temperature !== 'number' || temperature < -50 || temperature > 70) {
        console.warn('Invalid temperature value:', temperature);
        return null;
      }
      
      const forecastItems = this.extractMetNoForecast(entity);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayPrecipitation = forecastItems
        .filter(item => {
          const itemDate = new Date(item.datetime);
          return itemDate >= today && itemDate < tomorrow;
        })
        .reduce((sum, item) => sum + item.precipitation, 0);
      
      return {
        condition: entity.state,
        currentTemp: temperature,
        todayPrecipitation,
        forecast24h: forecastItems,
        // lastRainDate and lastRainAmount will be populated from history data
      };
    } catch (error) {
      console.warn('Error parsing weather entity:', error);
      return null;
    }
  }
  
  /**
   * Extract forecast items from a Met.no weather entity
   * @param entity The weather entity from Home Assistant
   * @returns Array of ForecastItem objects
   */
  private extractMetNoForecast(entity: MetNoWeatherEntity): ForecastItem[] {
    try {
      if (!entity?.attributes?.forecast || !Array.isArray(entity.attributes.forecast)) {
        console.warn('No forecast data available');
        return [];
      }
      
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      return entity.attributes.forecast
        .filter((item: MetNoForecastItem) => {
          if (!item || !item.datetime) return false;
          
          try {
            const forecastDate = new Date(item.datetime);
            return forecastDate >= now && forecastDate <= in24Hours;
          } catch {
            console.warn('Invalid datetime in forecast item:', item.datetime);
            return false;
          }
        })
        .map((item: MetNoForecastItem) => {
          // Validate data
          const precipitation = typeof item.precipitation === 'number' ? 
            Math.max(0, item.precipitation) : 0;
          
          const temperature = typeof item.temperature === 'number' && 
            item.temperature >= -50 && item.temperature <= 70 ? 
            item.temperature : null;
          
          return {
            datetime: item.datetime,
            precipitation,
            condition: item.condition || 'unknown',
            temperature: temperature !== null ? temperature : 0
          };
        });
    } catch (error) {
      console.warn('Error extracting forecast:', error);
      return [];
    }
  }
  
  /**
   * Query Home Assistant history API for precipitation data
   * @returns RainHistory object or null if query fails
   */
  private async queryHistoryForPrecipitation() {
    
  }
}