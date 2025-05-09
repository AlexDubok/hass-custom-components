import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('sprinkle-light-theme')
export class SprinkleLightTheme extends LitElement {
  static get styles() {
    return css`
      :host {
        --color-green: #4caf50;
        --water-color: #0870f8;
        --primary-color: #03a9f4;
        --color-gray: #808080;
        --error-color: #f44336;
        --secondary-color: #4caf50;
        --text-primary: rgba(0, 0, 0, 0.87);
        --text-secondary: rgba(0, 0, 0, 0.6);
      }

      :host * {
        box-sizing: border-box;
      }
    `;
  }

  render() {
    return html`<slot></slot>`;
  }
}
