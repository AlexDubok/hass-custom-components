import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { HomeAssistantService } from './services/ha-service';
import { ConfigRegistry } from './services/SprinkleConfigRegistry';
import { ValveService } from './services/valve-service';
import { SprinkleConfig } from './types/config';
import { HomeAssistant } from './types/homeassistant';
import { parsePythonDict } from './utils/parsePythonDict';
import './components/weather-display';

/**
 * Custom More Info dialog for Sprinkle irrigation entities
 *
 * @customElement sprinkle-more-info
 */
@customElement('sprinkle-more-info')
export class MoreInfoSprinkle extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  // The entity state object provided by Home Assistant
  @property({ attribute: false }) public stateObj?: Record<string, string>;

  @state()
  haService: HomeAssistantService | null = null;

  @state()
  valveService: ValveService | null = null;

  @state()
  config: SprinkleConfig | null = null;

  // Reference to the config registry
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
    // Cleanup any resources
    this.valveService = null;
    this.haService = null;
  }

  render() {
    if (!this.config) {
      return html`<div>Loading...</div>`;
    }

    if (!this.valveService || !this.haService) {
      return null;
    }

    const timedIrrigation = this.valveService?.timedIrrigation;
    const quantitativeIrrigation = this.valveService?.quantitativeIrrigation;

    return html`
      <sprinkle-light-theme>
        <div class="header">
          <h1 class="app-name">${this.config.title || 'Sprinkle'}</h1>
          <div class="left-section">
            <weather-display
              .hass=${this.hass}
              .entity=${this.config.weather_entity || ''}
            ></weather-display>

            <div class="battery-info">
              🔋 ${this.valveService?.batteryLevel}%
            </div>
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
          <div class="status-record">
            onOffState: ${this.valveService?.onOffState}
          </div>
          <div class="status-record">status: ${this.valveService?.status}</div>
          <div class="status-record">
            batteryLevel: ${this.valveService?.batteryLevel}
          </div>
          <div class="status-record">
            flowRate: ${this.valveService?.flowRate?.state}
            ${this.valveService?.flowRate?.unitOfMeasurment}
          </div>

          <div class="status-item">
            <pre class="debug">
${JSON.stringify(
                {
                  timedEntity: {
                    ...parsePythonDict(timedIrrigation?.state),
                    changed: new Date(
                      timedIrrigation?.last_changed ?? 0,
                    ).toLocaleString(),
                    updated: new Date(
                      timedIrrigation?.last_updated ?? 0,
                    ).toLocaleString(),
                  },
                  quantitativeEntity: {
                    ...parsePythonDict(quantitativeIrrigation?.state),
                    changed: new Date(
                      quantitativeIrrigation?.last_changed ?? 0,
                    ).toLocaleString(),
                    updated: new Date(
                      quantitativeIrrigation?.last_updated ?? 0,
                    ).toLocaleString(),
                  },
                },
                null,
                2,
              )}</pre
            >
          </div>
        </div>

        <div class="footer">
          <!-- Future navigation items will go here -->
        </div>
      </sprinkle-light-theme>
    `;
  }

  private loadConfiguration() {
    if (!this.stateObj) return;

    // Try to get the config from the registry first using entity_id
    const entityId = this.stateObj.entity_id;
    if (this.configRegistry.hasConfig(entityId)) {
      this.config = this.configRegistry.getConfig(entityId) || null;
    } else {
      // Fall back to entity attributes if not in the registry
      const { attributes } = this.stateObj;
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

    this.initializeServices();
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
      margin-block-end: 32px;
      font-size: 16px;
    }

    .debug {
      width: 100%;
      overflow: scroll;
    }

    .app-name {
      margin-top: 0;
      font-size: 1.5rem;
    }
  `;
}
