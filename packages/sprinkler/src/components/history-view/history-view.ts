import { LitElement, html, css } from 'lit';
import { HomeAssistant } from '../../types/homeassistant';

export class HistoryView extends LitElement {
  static properties = {
    hass: { type: Object },
    narrow: { type: Boolean }
  };

  static styles = css`
    :host {
      display: block;
      padding: 16px;
    }
    #chart {
      width: 100%;
      height: 400px;
    }
  `;

//   private chart?: ApexCharts;
  hass?: HomeAssistant;
  narrow?: boolean;

  render() {
    return html`
      <div class="history-view">
        <div id="chart"></div>
      </div>
    `;
  }
}

customElements.define('history-view', HistoryView);