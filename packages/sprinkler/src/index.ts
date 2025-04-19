import { LitElement, html, css } from 'lit';
import { HomeAssistant } from './types/homeassistant';
import { HassConfig } from 'home-assistant-js-websocket';
import './components/watering-controls';
import './components/weather-display';

export class SprinklerApp extends LitElement {
  static properties = {
    hass: { type: Object },
    narrow: { type: Boolean },
    config: { type: Object },
  };

  hass?: HomeAssistant;
  narrow?: boolean;
  config?: HassConfig & Record<string, any>;

  setConfig(config: HassConfig) {
    this.config = config;
  }

  render() {
    console.log('hass', this.hass);
    const state = this.hass?.states[this.config?.entity];

    if (!this.hass) {
      return html`<div>Loading...</div>`;
    }

    return html`
      <div class="header">
        <div class="left-section">
          <h1 class="app-name">Sprinkle</h1>
          <weather-display></weather-display>
        </div>
        <div class="battery-info">
          <span>🔋 85%</span>
        </div>
      </div>

      <div class="main-content">
        <button class="control-button">
          <span>Start Watering</span>
        </button>
        <div class="control-text">Tap to begin watering</div>

        <div class="controls">
          <watering-controls></watering-controls>
        </div>
      </div>

      <div class="footer">
        <a href="#schedule" class="nav-button">
          <span>📅</span>
          <span>Schedule</span>
        </a>
        <a href="#history" class="nav-button">
          <span>📊</span>
          <span>History</span>
        </a>
      </div>

      <pre class="debug">${JSON.stringify(state, null, 2)}</pre>
    `;
  }

  static styles = css`
  :host {
    display: block;
    padding: 16px;
    color: var(--primary-text-color);
    background-color: var(--primary-background-color);
    font-family: var(--primary-font-family, 'Roboto', sans-serif);
  }
  .debug {
    overflow-x: scroll;
    overflow-y: visible;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .app-name {
    font-size: 24px;
    font-weight: bold;
    margin: 0;
  }

  .battery-info {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .main-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  .control-button {
    width: 100%;
    max-width: 300px;
    padding: 20px;
    border-radius: 16px;
    background: white;
    border: 2px solid var(--primary-color, #03a9f4);
    cursor: pointer;
    text-align: center;
  }

  .control-text {
    color: var(--secondary-text-color);
    text-align: center;
    margin: 8px 0;
  }

  .controls {
    width: 100%;
    max-width: 600px;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--divider-color);
  }

  .nav-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-decoration: none;
    color: var(--primary-text-color);
  }
`;
}

customElements.define('sprinkler-app', SprinklerApp);

declare global {
  interface HTMLElementTagNameMap {
    'sprinkler-app': SprinklerApp;
  }
}
