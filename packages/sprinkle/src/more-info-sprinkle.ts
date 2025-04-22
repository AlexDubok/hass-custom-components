import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { mdiCalendarClock, mdiChartTimeline, mdiWater } from "@mdi/js";
import { HomeAssistant } from "types/homeassistant";

console.log('😍 More info file loaded');
/**
 * Custom More Info dialog for Sprinkle irrigation entities
 *
 * @customElement more-info-sprinkle
 */
@customElement("more-info-sprinkle")
export class MoreInfoSprinkle extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  // The entity state object
  @property({ attribute: false }) public stateObj?: any;


  render() {
    console.log('😍', this.stateObj);
    return html`
      <div class="header">
        <h1>Custom more info</h1>
        <!-- <h1>${this.stateObj.attributes.friendly_name}</h1>
        <div class="entity-state">${this.stateObj.state}</div> -->
      </div>
      <!-- <div class="content">
        <div class="info">
          <ha-icon icon="${mdiWater}"></ha-icon>
          <span>${this.stateObj.attributes.watered_today} L</span>
        </div>
        <div class="info">
          <ha-icon icon="${mdiCalendarClock}"></ha-icon>
          <span>${this.stateObj.attributes.next_watering}</span>
        </div>
        <div class="info">
          <ha-icon icon="${mdiChartTimeline}"></ha-icon>
          <span>${this.stateObj.attributes.schedule}</span>
        </div> -->
      </div>
    `;
  }
}