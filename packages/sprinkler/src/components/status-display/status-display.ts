import { LitElement, html, css } from 'lit';
import { HomeAssistant } from '../../types/homeassistant';

export class StatusDisplay extends LitElement {
  static properties = {
    hass: { type: Object }
  };

  static styles = css`
    :host {
      display: flex;
      gap: 16px;
      align-items: center;
    }
  `;

  hass?: HomeAssistant;

  render() {
    if (!this.hass) return html``;

    return html`
      <div class="weather-info">
        <!-- Weather display will be added here -->
      </div>
      <div class="battery-info">
        <!-- Battery status will be added here -->
      </div>
    `;
  }
}

customElements.define('status-display', StatusDisplay);