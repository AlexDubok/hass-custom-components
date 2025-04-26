import { SprinkleConfig } from './types/config';
import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant } from "types/homeassistant";

/**
 * Custom More Info dialog for Sprinkle irrigation entities
 *
 * @customElement more-info-sprinkle
 */
@customElement("sprinkle-more-info")
export class MoreInfoSprinkle extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  // The entity state object
  @property({ attribute: false }) public stateObj?: any;

  config: SprinkleConfig;

  constructor() {
    super();
    const {attributes} = this.stateObj ?? {};

    this.config = {
      device_name: attributes?.device_name,
      valve_entity: this.stateObj?.entity_id,
      weather_entity: attributes?.weather_entity,
      flow_entity: attributes?.flow_entity,
      status_entity: attributes?.status_entity,
      timed_irrigation_entity: attributes?.timed_irrigation_entity,
      quantitative_irrigation_entity: attributes?.quantitative_irrigation_entity,
      volume_max: attributes?.volume_max,
      duration_max: attributes?.duration_max,
      battery_entity: attributes?.battery_entity,
    }
  }
  
  render() {
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
            ></watering-container>
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
}