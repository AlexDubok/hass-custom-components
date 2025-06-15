import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { HomeAssistantService } from './services/ha-service';
import { ConfigRegistry } from './services/SprinkleConfigRegistry';
import { ValveService } from './services/valve-service';
import { WeatherService } from './services/weather-service';
import { SprinkleConfig } from './types/config';
import { HomeAssistant } from './types/homeassistant';
import './components/weather-display';
import './components/battery-indicator';

export interface StateObjAttributes {
  device_name?: string;
  weather_entity?: string;
  flow_entity?: string;
  device_status_entity?: string;
  timed_irrigation_entity?: string;
  quantitative_irrigation_entity?: string;
  volume_max?: number;
  duration_max?: number;
  battery_entity?: string;
}
export interface StateObj {
  entity_id: string;
  attributes: StateObjAttributes;
}

/**
 * Custom More Info dialog for Sprinkle irrigation entities
 *
 * @customElement sprinkle-more-info
 */
@customElement('sprinkle-more-info')
export class MoreInfoSprinkle extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  // The entity state object provided by Home Assistant
  @property({ attribute: false }) public stateObj?: StateObj;

  @state()
  haService: HomeAssistantService | null = null;

  @state()
  valveService: ValveService | null = null;

  @state()
  weatherService: WeatherService | null = null;

  @state()
  config: SprinkleConfig | null = null;

  private configRegistry = ConfigRegistry.getInstance();

  connectedCallback() {
    super.connectedCallback();
    this.loadConfiguration();
  }

  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has('stateObj')) {
      this.loadConfiguration();
    }

    if (changedProps.has('hass') || changedProps.has('config')) {
      this.initializeServices();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.valveService = null;
    this.weatherService = null;
    this.haService = null;
  }

  render() {
    if (!this.config) {
      return html`<div>Loading...</div>`;
    }

    if (!this.valveService || !this.haService) {
      return null;
    }

    return html`
      <sprinkle-light-theme>
        <div class="header">
          <h1 class="app-name">${this.config.title || 'Sprinkle'}</h1>
          <div class="battery-info">
            <battery-indicator .batteryLevel="${Number(this.valveService?.batteryLevel)}"></battery-indicator>
          </div>
        </div>

        <weather-display
          .haService=${this.haService}
          .weatherService=${this.weatherService}
        ></weather-display>

        <div class="main-content">
          <watering-container
            .hass=${this.hass}
            .config=${this.config}
            .valveService=${this.valveService as ValveService}
          ></watering-container>
        </div>

        <div class="status">
          <div class="status-record">
            flowRate: ${this.valveService?.flowRate?.state}
            ${this.valveService?.flowRate?.unitOfMeasurment}
          </div>
          <div class="status-record">
            onOffState: ${this.valveService?.onOffState}
          </div>
          <div class="status-record">status: ${this.valveService?.status}</div>      
        </div>

        <div class="footer">
          <!-- Future navigation items will go here -->
        </div>
      </sprinkle-light-theme>
    `;
  }

  private loadConfiguration() {
    if (!this.stateObj) return;

    const entityId = this.stateObj.entity_id;
    if (this.configRegistry.hasConfig(entityId)) {
      this.config = this.configRegistry.getConfig(entityId) || null;
    } else {
      const attributes = this.stateObj.attributes;
      this.config = {
        device_name: attributes?.device_name ?? '',
        valve_entity: this.stateObj.entity_id ?? '',
        weather_entity: attributes?.weather_entity ?? '',
        flow_entity: attributes?.flow_entity ?? '',
        device_status_entity: attributes?.device_status_entity ?? '',
        timed_irrigation_entity: attributes?.timed_irrigation_entity ?? '',
        quantitative_irrigation_entity:
          attributes?.quantitative_irrigation_entity ?? '',
        volume_max: attributes?.volume_max,
        duration_max: attributes?.duration_max,
        battery_entity: attributes?.battery_entity ?? '',
      };
    }

    this.initializeServices();
  }

  private initializeServices() {
    if (!this.hass || !this.config) return;

    this.haService = new HomeAssistantService(this.hass);
    this.valveService = new ValveService(this.haService, this.config);
    
    if (this.config.weather_entity) {
      this.weatherService = new WeatherService(this.haService, this.config.weather_entity);
    } else {
      this.weatherService = null;
    }
  }

  static styles = css`
    .debug {
      width: 100%;
      overflow: scroll;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-block-end: 32px;
    }

    .app-name {
      margin: 0;
      font-size: 1.5rem;
    }
  `;
}
