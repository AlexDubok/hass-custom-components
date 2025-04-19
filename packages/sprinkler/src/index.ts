import { LitElement, html, css, CSSResult, TemplateResult } from 'lit';

export class SprinklerApp extends LitElement {
  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
        padding: 16px;
      }
    `;
  }

  render(): TemplateResult {
    return html`
      <h1>Welcome to the Sprinkler App</h1>
    `;
  }
}

// Register the custom element
customElements.define('sprinkler-app', SprinklerApp);