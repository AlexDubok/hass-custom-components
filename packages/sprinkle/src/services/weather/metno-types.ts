export interface MetNoEntity {
  state: string;
  attributes: {
    temperature: number;
    humidity?: number;
  };
}

export interface MetWeatherHistoryRecord {
  s: 'rainy' | 'sunny' | 'partlycloudy' | 'cloudy' | 'snowy';
  lu: number; // last updated timestamp
}

export interface HistoryResponse {
  [entityId: string]: MetWeatherHistoryRecord[];
}

export interface ForecastEntry {
    datetime: string;
    condition: string;
    precipitation: number;
    precipitation_probability?: number;
    temperature: number;
    templow?: number;
    wind_speed?: number;
    wind_bearing?: number;
}

export interface ForecastResponse {
    response: {
        [entityId: string]: {
            forecast: ForecastEntry[];
        };
    };
}