import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { WeatherService } from '../services/weather-service';
import {
  WeatherCondition,
  RainHistory,
  RainForecast,
} from '../services/weather/weather-adapter.interface';
import { HomeAssistantService } from '../services/ha-service';

@customElement('weather-display')
export class WeatherDisplay extends LitElement {
  @property({ attribute: false }) public haService?: HomeAssistantService;
  @property({ attribute: false }) public weatherService?: WeatherService;

  @state() currentCondition: WeatherCondition | null = null;
  @state() rainHistory: RainHistory | null = null;
  @state() rainForecast: RainForecast | null = null;
  @state() loading = true;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadWeatherData();
  }

  async loadWeatherData() {
    if (!this.weatherService) {
      this.loading = false;
      return;
    }

    try {
      const [condition, history, forecast] = await Promise.all([
        this.weatherService.getCurrentCondition(),
        this.weatherService.getRainHistory(),
        this.weatherService.getRainForecast(),
      ]);

      this.currentCondition = condition;
      this.rainHistory = history;
      this.rainForecast = forecast;
    } finally {
      this.loading = false;
    }
  }

  private formatRainHistory(): string {
    if (!this.rainHistory) return '';

    if (this.rainHistory.totalRainHours === 0) {
      return 'No rain in the past 2 days';
    }

    const hoursText = `${this.rainHistory.totalRainHours} hour${
      this.rainHistory.totalRainHours !== 1 ? 's' : ''
    } of rain in the past 2 days`;

    if (this.rainHistory.lastRainTime) {
      const timeAgo = this.getTimeAgo(this.rainHistory.lastRainTime);
      return `${hoursText} (last rain ended ${timeAgo})`;
    }

    return hoursText;
  }

  private formatRainForecast(): string {
    if (!this.rainForecast) return '';

    if (this.rainForecast.expectedRainHours === 0) {
      return 'No rain expected in next 24h';
    }

    return `${this.rainForecast.expectedRainHours}h of rain expected (${this.rainForecast.totalExpectedMm}mm)`;
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const hours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (hours < 1) return 'less than an hour ago';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;

    const days = Math.floor(hours / 24);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }

  render() {
    if (this.loading) {
      return html`<div class="weather-loading">Loading weather...</div>`;
    }

    if (!this.currentCondition) {
      return html`<div class="weather-unavailable">Weather unavailable</div>`;
    }

    return html`

      <div class="weather-info">
        <div class="weather-row">
          <ha-icon
            class="weather-icon"
            icon="${this.currentCondition.icon}"
          ></ha-icon>
          <span class="weather-temp">${this.currentCondition.temperature}°C</span> <span>${this.currentCondition.condition}</span>
        </div>
        
        ${this.rainHistory && html`<div class="weather-row rain-info">
          <ha-icon icon="mdi:water-outline"></ha-icon>
          <span>${this.formatRainHistory()}</span>
        </div>`}
        
        ${this.rainForecast && html`<div class="weather-row forecast-info">
          <ha-icon icon="mdi:calendar-outline"></ha-icon>
          <span>${this.formatRainForecast()}</span>
        </div>`}
      </div>
    `;
  }

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
}
