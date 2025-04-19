import { LitElement, html, css } from 'lit';
import { HomeAssistant } from './types/homeassistant';
import { HassConfig } from 'home-assistant-js-websocket';

export class SprinklerApp extends LitElement {
  static properties = {
    hass: { type: Object },
    narrow: { type: Boolean },
    config: { type: Object },
  };

  static styles = css`
    :host {
      display: block;
      padding: 16px;
      color: var(--primary-text-color);
      background-color: var(--primary-background-color);
    }

    .debug {
      overflow-x: scroll;
      overflow-y: visible;
    }
  `;

  hass?: HomeAssistant;
  narrow?: boolean;
  config?: HassConfig & Record<string, any>;

  setConfig(config: HassConfig) {
    // @ts-ignore
    // if (!config.entity) {
    //   throw new Error("You need to define an entity");
    // }
    console.log('[setConfig]', {
      config,
      hass: this.hass,
      stateObj: this.hass?.states[config.entity],
    });
    this.config = config;
  }

  render() {
    const state = this.hass?.states[this.config?.entity];
    if (!this.hass) {
      return html`<div>Loading...</div>`;
    }

    return html`
      <h1>Smart Irrigation</h1>
      <!-- Components will be added here -->
      State:
      <pre class="debug">${JSON.stringify(state, null, 2)}</pre>
    `;
  }
}

customElements.define('sprinkler-app', SprinklerApp);

declare global {
  interface HTMLElementTagNameMap {
    'sprinkler-app': SprinklerApp;
  }
}
