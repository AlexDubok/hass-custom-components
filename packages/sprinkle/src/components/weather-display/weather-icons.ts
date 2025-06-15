export const WEATHER_ICON_MAP: Record<string, string> = {
  'clear-night': 'mdi:weather-night',
  'cloudy': 'mdi:weather-cloudy',
  'exceptional': 'mdi:alert-circle',
  'fog': 'mdi:weather-fog',
  'hail': 'mdi:weather-hail',
  'lightning': 'mdi:weather-lightning',
  'lightning-rainy': 'mdi:weather-lightning-rainy',
  'partlycloudy': 'mdi:weather-partly-cloudy',
  'pouring': 'mdi:weather-pouring',
  'rainy': 'mdi:weather-rainy',
  'snowy': 'mdi:weather-snowy',
  'snowy-rainy': 'mdi:weather-snowy-rainy',
  'sunny': 'mdi:weather-sunny',
  'windy': 'mdi:weather-windy',
  'windy-variant': 'mdi:weather-windy-variant'
};

/**
 * Get the appropriate MDI icon for a weather condition
 * @param condition The weather condition string
 * @returns MDI icon string
 */
export function getWeatherIcon(condition: string): string {
  return WEATHER_ICON_MAP[condition] || 'mdi:weather-partly-cloudy';
}