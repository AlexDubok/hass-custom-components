export interface WeatherData {
  condition: string; // 'sunny', 'rainy', 'cloudy', etc.
  currentTemp: number; // Current temperature in °C
  todayPrecipitation: number; // Today's rainfall in mm
  forecast24h: ForecastItem[];
  lastRainDate?: Date; // When was the last rain (within 2 days)
  lastRainAmount?: number; // Amount of last rain in mm
}

export interface ForecastItem {
  datetime: string; // ISO datetime string
  precipitation: number; // Expected precipitation in mm
  condition: string; // Weather condition
  temperature: number; // Temperature in °C
}

export interface RainHistory {
  hasRainInPast2Days: boolean;
  lastRainDate?: Date;
  lastRainAmount?: number;
  totalPast2Days: number;
  totalPastDaysUnit: string; // mm or hours
}

// Met.no weather entity interfaces
export interface MetNoForecastItem {
  datetime: string;
  condition: string;
  precipitation: number;
  temperature: number;
  templow?: number;
  humidity?: number;
  pressure?: number;
  wind_speed?: number;
  wind_bearing?: number;
}

export interface MetNoWeatherAttributes {
  attribution?: string;
  friendly_name?: string;
  temperature: number;
  humidity?: number;
  pressure?: number;
  wind_speed?: number;
  wind_bearing?: number;
  forecast: MetNoForecastItem[];
}

export interface MetWeatherHistoryRecord {
  s: 'rainy' | 'sunny' | 'partlycloudy' | 'cloudy' | 'snowy';
  lu: number;
}

export interface MetNoWeatherEntity {
  entity_id: string;
  state: string;
  attributes: MetNoWeatherAttributes;
  last_changed: string;
  last_updated: string;
}
export interface HistoryResponse {
  [key: string]: MetWeatherHistoryRecord[];
}
