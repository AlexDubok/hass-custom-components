import { CSSResultGroup, LitElement, css, html } from 'lit';
import { ValveService } from '../services/valve-service';
import '../components/watering-controls/watering-controls';
import { HomeAssistant } from '../types/homeassistant';
import { Mode, SprinkleConfig } from '../types/config';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('watering-container')
export class WateringContainer extends LitElement {
    @property({ type: Object }) config?: SprinkleConfig;
    @property({ type: Object }) hass?: HomeAssistant;
    @property({ type: Object }) valveService!: ValveService;

    @state() isWatering: boolean = false;
    @state() duration: number = 0;
    @state() volume: number = 0;
    @state() activeMode: Mode = 'duration';
  
  handleToggleValve() {
    if (this.valveService.isValveOn()) {
      this.valveService.turnValveOff();
    } else if (this.activeMode === 'duration') {
      this.valveService.startTimedWateringOnce(this.duration);
    } else {
      this.valveService.startVolumeBasedWateringOnce(this.volume);
    }
  }

  handleDurationChange(e: CustomEvent) {
    this.duration = e.detail.value;
  }

  handleVolumeChange(e: CustomEvent) {
    this.volume = e.detail.value;
  }

  handleModeChange(e: CustomEvent) {
    this.activeMode = e.detail.mode;
  }

  render() {
    return html`
      <watering-controls
        .isWatering=${this.valveService.isValveOn()}
        .duration=${this.duration}
        .volume=${this.volume}
        .activeMode=${this.activeMode}
        .maxDuration=${this.config?.duration_max || 60}
        .maxVolume=${this.config?.volume_max || 100}
        @toggle-valve=${this.handleToggleValve}
        @duration-change=${this.handleDurationChange}
        @volume-change=${this.handleVolumeChange}
        @mode-change=${this.handleModeChange}
      ></watering-controls>
    `;
  }

  static styles?: CSSResultGroup | undefined = css`
    :host {
      flex: 1;
    }
  `;
}
