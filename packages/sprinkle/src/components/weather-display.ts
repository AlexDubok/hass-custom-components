import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('weather-display')
export class WeatherDisplay extends LitElement {
  static styles = css`
    .weather-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `;

  render() {
    return html`
      <div class="weather-info">
        <!-- <span>☀️ 19°C</span> -->
      </div>
    `;
  }
}
