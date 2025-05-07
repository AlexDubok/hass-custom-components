import { SprinkleConfig } from './types/config';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'types/homeassistant';
import { HomeAssistantService } from './services/ha-service';
import { ValveService } from './services/valve-service';

/**
 * Custom More Info dialog for Sprinkle irrigation entities
 *
 * @customElement more-info-sprinkle
 */
@customElement('sprinkle-more-info')
export class MoreInfoSprinkle extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  // The entity state object
  @property({ attribute: false }) public stateObj?: any;

  @state()
  haService: HomeAssistantService | null = null;

  @state()
  valveService: ValveService | null = null;

  connectedCallback() {
    super.connectedCallback();
    const { attributes } = this.stateObj ?? {};

    this.config = {
      device_name: attributes?.device_name,
      valve_entity: this.stateObj?.entity_id,
      weather_entity: attributes?.weather_entity,
      flow_entity: attributes?.flow_entity,
      device_status_entity: attributes?.device_status_entity,
      timed_irrigation_entity: attributes?.timed_irrigation_entity,
      quantitative_irrigation_entity:
        attributes?.quantitative_irrigation_entity,
      volume_max: attributes?.volume_max,
      duration_max: attributes?.duration_max,
      battery_entity: attributes?.battery_entity,
    };

    this.initializeServices();
  }

  updated(changedProps: Map<string, any>) {
    if (changedProps.has('hass') || changedProps.has('config')) {
      this.initializeServices();
    }
  }

  config: SprinkleConfig | null = null;

  render() {
    if (!this.config) {
      return html`<div>Loading...</div>`;
    }

    const timedIrrigation = this.valveService?.timedIrrigation;
    const quantitativeIrrigation = this.valveService?.quantitativeIrrigation;
  
    // @ts-ignore
    window._haas = this.hass;

    return html`
      <div class="header">
        <h1 class="app-name">Custom more info</h1>
        <div class="left-section">
          <weather-display .hass=${this.hass} .entity=${''}></weather-display>

          <div class="battery-info">🔋 ${this.valveService?.batteryLevel}% </div>
        </div>
      </div>

      <div class="main-content">
        <watering-container
          .hass=${this.hass}
          .config=${this.config}
          .valveService=${this.valveService as ValveService}
        ></watering-container>
      </div>

      <div class="status">
        <div class="status-item">
          <span>💧</span>
          <pre class="debug">${JSON.stringify({
            onOffState:  this.valveService?.onOffState,
            status: this.valveService?.status,
            batteryLevel: `${this.valveService?.batteryLevel} %`,
            flowRate: `${this.valveService?.flowRate?.state} ${this.valveService?.flowRate?.unitOfMeasurment}`,
            timedEntity: `${timedIrrigation?.state}. changed: ${new Date(timedIrrigation?.last_changed ?? 0).toLocaleString()} / updated: ${new Date(timedIrrigation?.last_updated ?? 0).toLocaleString()}`,
            quantitativeEntity: `${quantitativeIrrigation?.state}. changed: ${new Date(quantitativeIrrigation?.last_changed ?? 0).toLocaleString()} / updated: ${new Date(quantitativeIrrigation?.last_updated ?? 0).toLocaleString()}`,
          }, null, 2)}</pre>
        </div>
      </div>

      <div class="footer">
        <!-- <a href="#" class="nav-button" >
          <span>📅</span>
          <span>Schedule</span>
        </a>
        <a href="#" class="nav-button">
          <span>📊</span>
          <span>History</span>
        </a> -->
      </div>
    `;
  }

  private initializeServices() {
    if (!this.hass || !this.config) return;

    this.haService = new HomeAssistantService(this.hass);
    this.valveService = new ValveService(this.haService, this.config);
  }

  static styles = css`
    .left-section {
      display: flex;
      justify-content: space-between;
      margin-block-end: 16px;
    }

    .debug {
      width: 100%;
      overflow: scroll;
    }
  `;
}
