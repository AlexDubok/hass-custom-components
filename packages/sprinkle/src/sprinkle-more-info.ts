import { SprinkleConfig } from './types/config';
import { LitElement, html } from 'lit';
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
    this.initializeServices();
  }

  updated(changedProps: Map<string, any>) {
    if (changedProps.has('hass') || changedProps.has('config')) {
      this.initializeServices();
    }
  }

  config: SprinkleConfig;

  constructor() {
    super();
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
  }

  render() {
    const statusEntity = this.haService?.getEntityState(
      this.config?.device_status_entity
    );

    return html`
      <div class="header">
        <div>${this.hass?.states[this.config?.valve_entity ?? '']?.state}</div>
        <div class="left-section">
          <h1 class="app-name">Custom more info</h1>
          <weather-display .hass=${this.hass} .entity=${''}></weather-display>

          <div class="battery-info">🔋</div>
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
          <pre>${JSON.stringify(statusEntity?.state, null, 2)}</pre>
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
}
