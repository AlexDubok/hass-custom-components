import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('sprinkle-light-theme')
export class SprinkleLightTheme extends LitElement {
  static get styles() {
    return css`
      :host { 
        --color-blue: #215df3;
        --color-green: #4caf50;
        --color-gray: #808080;
      }
    `;
  }

  render() {
    return html`<slot></slot>`;
  }
}
