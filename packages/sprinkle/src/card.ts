import { LitElement, css, html } from 'lit';
import * as pjson from '../package.json';
import './containers/watering-container';
// import './containers/history-container';
// import './containers/schedule-container';
import './components/weather-display';
// import './components/battery-indicator/battery-indicator';
import { HomeAssistant } from './types/homeassistant';
import { SprinkleConfig } from './types/config';
import { fireEvent } from './utils/fireEvent';
import { MoreInfoDialogParams } from './types/lovelace';
import { customElement, property } from 'lit/decorators.js';

/* eslint no-console: 0 */
console.info(
  `%c  SPRINKLE-CARD  \n%c Version ${pjson.version} `,
  'color: gray; font-weight: bold; background: papayawhip',
  'color: white; font-weight: bold; background: dimgray'
);

@customElement('sprinkle-card')
export class SprinkleCard extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ type: Boolean }) narrow?: boolean;
  @property({ attribute: false }) config?: SprinkleConfig;
  @property({ type: String }) activeView: string = 'main'; // Default view
  @property({ type: Boolean }) showMoreInfo: boolean = false;
  

  setView(view: string) {
    this.activeView = view;
  }

  setConfig(config: SprinkleConfig) {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    this.config = config;
  }

  handleShowMoreInfo() {
    fireEvent(this, 'hass-more-info', {
      entityId: 'switch.smart_water_valve',
    });
  }

  render() {
    // const weatherEntity = this.config?.weather_entity || 'weather.home';
    // const batteryEntity =
    //   this.config?.battery_entity || 'sensor.smart_water_valve_battery';
    // const states = this.hass?.states;
    // const valveEntity = this.config?.valve_entity;
    // const valveState = states?.[valveEntity ?? '']?.state;
    return html`
      <div class="header">
        <div>${this.hass?.states[this.config?.valve_entity ?? '']?.state}</div>
        <div class="left-section">
          <h1 class="app-name">Sprinkle containers</h1>
          <weather-display .hass=${this.hass} .entity=${''}></weather-display>

          <div class="battery-info">🔋</div>
        </div>

        <button @click="${() => this.handleShowMoreInfo()}">More Info</button>
      </div>

      <div class="main-content">
        ${this.activeView === 'main'
          ? html`<watering-container
              .hass=${this.hass}
              .config=${this.config}
              .narrow=${this.narrow}
            ></watering-container>`
          : ''}
        ${this.activeView === 'schedule'
          ? ''
          : //   html`<schedule-container
            //       .hass=${this.hass}
            //       .config=${this.config}
            //     ></schedule-container>`
            ''}
        ${this.activeView === 'history'
          ? ''
          : //   html`<history-container
            //       .hass=${this.hass}
            //       .config=${this.config}
            //     ></history-container>`
            ''}
      </div>

      <div class="footer">
        <a href="#" class="nav-button" @click=${() => this.setView('schedule')}>
          <span>📅</span>
          <span>Schedule</span>
        </a>
        <a href="#" class="nav-button" @click=${() => this.setView('history')}>
          <span>📊</span>
          <span>History</span>
        </a>
      </div>
    `;
  }

  static styles = css`
    .main-content {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px 32px;
    }
  `;
}

declare global {
  // for fire event
  interface HASSDomEvents {
    'hass-more-info': MoreInfoDialogParams;
  }
}

/* 
Battery indicator example:
 <div class="battery-info">
          <battery-indicator
            .hass=${this.hass}
            .entity=${batteryEntity}
          ></battery-indicator>
        </div>
*/

