import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from '../types/homeassistant';
import { HomeAssistantService } from '../services/ha-service';
import { WeatherService } from '../services/weather-service';
import { WeatherData, RainHistory } from '../types/weather';
import { getWeatherIcon } from './weather-display/weather-icons';

@customElement('weather-display')
export class WeatherDisplay extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public entity: string = '';

  @state() private weatherData: WeatherData | null = null;
  @state() private rainHistory: RainHistory | null = null;
  @state() private loading: boolean = true;
  @state() private error: boolean = false;

  private weatherService: WeatherService | null = null;
  private refreshInterval: number | null = null;

  static styles = css`
    .weather-info {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      margin-bottom: 16px;
      padding: 12px;
      border-radius: 8px;
      background-color: rgba(var(--rgb-primary-color, 33, 150, 243), 0.1);
    }

    .weather-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .weather-icon {
      font-size: 1.2rem;
    }

    .weather-temp {
      font-weight: bold;
    }

    .rain-info {
      color: var(--secondary-text-color);
      font-size: 0.9rem;
    }

    .forecast-info {
      color: var(--secondary-text-color);
      font-size: 0.9rem;
    }

    .hidden {
      display: none;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.initializeWeatherService();
    this.loadWeatherData();
    
    // Refresh weather data every 15 minutes
    this.refreshInterval = window.setInterval(() => {
      this.loadWeatherData();
    }, 15 * 60 * 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    this.weatherService = null;
  }

  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has('hass') || changedProps.has('entity')) {
      this.initializeWeatherService();
      this.loadWeatherData();
    }
  }

  private initializeWeatherService() {
    if (!this.hass || !this.entity) {
      this.weatherService = null;
      return;
    }

    const haService = new HomeAssistantService(this.hass);
    this.weatherService = new WeatherService(haService, {
      device_name: '',
      valve_entity: '',
      weather_entity: this.entity
    });
  }

  private async loadWeatherData() {
    if (!this.weatherService) {
      this.weatherData = null;
      this.rainHistory = null;
      this.loading = false;
      this.error = false;
      return;
    }

    try {
      this.loading = true;
      this.error = false;
      
      // Get current weather data
      this.weatherData = this.weatherService.getCurrentWeather();
      
      // Get rain history data
      this.rainHistory = await this.weatherService.getRecentRainHistory();
    } catch (err) {
      console.warn('Error loading weather data:', err);
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  private formatLastRain(): string {
    if (!this.rainHistory?.hasRainInPast2Days || !this.rainHistory.lastRainDate) {
      return 'No rain in past 2 days';
    }

    const now = new Date();
    const lastRain = this.rainHistory.lastRainDate;
    const diffMs = now.getTime() - lastRain.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `Last rain: ${diffHours} hour${diffHours !== 1 ? 's' : ''} ago (${this.rainHistory.lastRainAmount?.toFixed(1) || 0}mm)`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `Last rain: ${diffDays} day${diffDays !== 1 ? 's' : ''} ago (${this.rainHistory.lastRainAmount?.toFixed(1) || 0}mm)`;
    }
  }

  private formatForecast(): string {
    if (!this.weatherData?.forecast24h || this.weatherData.forecast24h.length === 0) {
      return 'No forecast available';
    }

    // Check if any rain is expected in the next 24 hours
    const rainForecast = this.weatherData.forecast24h.filter(item =>
      item.precipitation > 0.1
    );

    if (rainForecast.length === 0) {
      return 'Clear next 24h';
    }

    const totalRain = rainForecast.reduce((sum, item) => sum + item.precipitation, 0);
    return `Rain expected: ${totalRain.toFixed(1)}mm in next 24h`;
  }

  render() {
    if (this.loading) {
      return html`<div class="weather-info">Loading weather data...</div>`;
    }

    if (this.error || !this.weatherData) {
      return html`<div class="weather-info hidden"></div>`;
    }

    const { condition, currentTemp } = this.weatherData;
    const weatherIcon = getWeatherIcon(condition);

    return html`
      <div class="weather-info">
        <div class="weather-row">
          <ha-icon class="weather-icon" icon="${weatherIcon}"></ha-icon>
          <span class="weather-temp">${condition.charAt(0).toUpperCase() + condition.slice(1)}, ${currentTemp.toFixed(1)}°C</span>
        </div>
        
        <div class="weather-row rain-info">
          <ha-icon icon="mdi:water-outline"></ha-icon>
          <span>${this.formatLastRain()}</span>
        </div>
        
        <div class="weather-row forecast-info">
          <ha-icon icon="mdi:calendar-outline"></ha-icon>
          <span>${this.formatForecast()}</span>
        </div>
      </div>
    `;
  }
}
