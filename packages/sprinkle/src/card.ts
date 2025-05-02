import { LitElement, css, html } from 'lit';
import * as pjson from '../package.json';
import './containers/watering-container';
import './components/weather-display';
import './components/card-mini';
import './components/themes/light';
import { HomeAssistant } from './types/homeassistant';
import { SprinkleConfig } from './types/config';
import { fireEvent } from './utils/fireEvent';
import { MoreInfoDialogParams } from './types/lovelace';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistantService } from './services/ha-service';
import { ValveService } from './services/valve-service';

/* eslint no-console: 0 */
console.info(
  `%c  SPRINKLE-CARD  \n%c Version ${pjson.version} `,
  'color: gray; font-weight: bold; background: papayawhip',
  'color: white; font-weight: bold; background: dimgray'
);

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'sprinkle-card',
  name: 'Sprinkle-Card',
  preview: false,
  description: 'A custom card for controlling your irrigation system',
});

@customElement('sprinkle-card')
export class SprinkleCard extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ type: Boolean }) narrow?: boolean;
  @property({ attribute: false }) config?: SprinkleConfig;

  @state()
  haService: HomeAssistantService | null = null;
  
  @state()
  valveService: ValveService | null = null

  setConfig(config: SprinkleConfig) {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    this.config = config;
  }

  connectedCallback() {
    super.connectedCallback();
    this.initializeServices();
  }

  updated(changedProps: Map<string, any>) {
    if ((changedProps.has('hass') || changedProps.has('config'))) {
      this.initializeServices();
    }
  }

  handleShowMoreInfo() {
    console.log('Show more info for', this.config?.valve_entity);
    fireEvent(this, 'hass-more-info', {
      entityId: this.config?.valve_entity ?? '',
    });
  }

  async handleToggleValve() {
    await this.valveService?.toggleValve();
  }

  render() {
    if (!this.hass) {
      return html`<div>${this.config?.device_name} Loading...</div>`;
    }
    if (!this.haService || !this.valveService) {
      throw new Error(`Services not initialized for ${this.config?.device_name}`);
    }

    const statusEntity = this.haService.getEntityState(this.config?.device_status_entity);
    const valveEntity = this.haService.getEntityState(this.config?.valve_entity);
    const batteryLevel = valveEntity?.attributes?.battery ?? '';

    return html`
      <sprinkle-light-theme>
        <sprinkle-status-card
          ?iswaterrunning="${this.valveService?.isValveOn()}"
          .valveSwitchState="${this.hass.states[this.config?.valve_entity ?? '']?.state}"
          .title="${this.config?.title ?? ''}"
          .status="${statusEntity?.state ?? ''}"
          .batteryLevel="${batteryLevel}"
          @click="${this.handleShowMoreInfo}"
          @toggle-valve="${this.handleToggleValve}"
        ></sprinkle-status-card>
      </sprinkle-light-theme>
    `;
  }

  private initializeServices() {
    if (!this.hass || !this.config) return;
    
    this.haService = new HomeAssistantService(this.hass);
    this.valveService = new ValveService(this.haService, this.config);
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
