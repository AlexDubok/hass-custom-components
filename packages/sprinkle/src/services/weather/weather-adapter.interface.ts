import { HomeAssistantService } from '../ha-service';

export interface WeatherCondition {
  condition: string;           // 'sunny', 'rainy', 'cloudy', etc.
  temperature: number;         // Current temperature in °C
  humidity?: number;           // Optional humidity percentage
  icon: string;               // Icon identifier
}

export interface RainHistory {
  totalRainHours: number;      // Total hours of rain in past 2 days
  lastRainTime?: Date;         // When the last rain ended
  totalPrecipitation: number;  // Total mm in past 2 days
}

export interface RainForecast {
  expectedRainHours: number;   // Expected hours of rain in next 24h
  totalExpectedMm: number;     // Total expected precipitation
  rainPeriods: Array<{
    start: Date;
    end: Date;
    precipitationMm: number;
  }>;
}

export abstract class WeatherAdapter {
  protected entityId: string;
  protected haService: HomeAssistantService;
  
  constructor(haService: HomeAssistantService, entityId: string) {
    this.haService = haService;
    this.entityId = entityId;
  }
  
  abstract getCurrentCondition(): Promise<WeatherCondition | null>;
  abstract getRainHistory(): Promise<RainHistory | null>;
  abstract getRainForecast(): Promise<RainForecast | null>;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected handleError(method: string, error: any): null {
    console.warn(`WeatherAdapter.${method} failed:`, error);
    return null;
  }
}