import { HomeAssistant } from 'home-assistant-js-websocket';
import { LitElement, html, css } from 'lit';

export class SprinklerApp extends LitElement {
  static properties = {
    hass: { type: Object },
    narrow: { type: Boolean }
  };

  static styles = css`
    :host {
      display: block;
      padding: 16px;
      color: var(--primary-text-color);
      background-color: var(--primary-background-color);
    }
  `;

  hass?: HomeAssistant;
  narrow?: boolean;

  render() {
    if (!this.hass) {
      return html`<div>Loading...</div>`;
    }

    return html`
      <h1>Smart Irrigation</h1>
      <!-- Components will be added here -->
    `;
  }
}

customElements.define('sprinkler-app', SprinklerApp);

declare global {
  interface HTMLElementTagNameMap {
    'sprinkler-app': SprinklerApp;
  }
}