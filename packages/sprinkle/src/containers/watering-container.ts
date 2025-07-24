import { CSSResultGroup, LitElement, css, html } from 'lit';
import { CountDown, ValveService } from '../services/valve-service';
import { HomeAssistant } from '../types/homeassistant';
import { Mode, SprinkleConfig } from '../types/config';
import { customElement, property, state } from 'lit/decorators.js';
import '../components/watering-controls/watering-controls';
import '../components/watering-controls/watering-countdown';

@customElement('watering-container')
export class WateringContainer extends LitElement {
  @property({ type: Object }) config?: SprinkleConfig;
  @property({ type: Object }) hass?: HomeAssistant;
  @property({ type: Object }) valveService!: ValveService;

  @state() isWatering: boolean = false;
  @state() duration: number = 0;
  @state() volume: number = 0;
  @state() activeMode: Mode = 'duration';
  @state() countdown: CountDown = { 
    secondsRemaining: 0,
    totalDuration: 0,
    formatted: '--:--',
    progress: 0,
    isActive: false 
  };
  
  private countdownInterval?: number;

  async handleToggleValve() {
    if (this.valveService.isValveOn()) {
      return await this.valveService.turnValveOff();
    }
    if (!this[this.activeMode]) {
      return await this.valveService.toggleValve();
    }
    
    let result;
    if (this.activeMode === 'duration') {
      result = await this.valveService.startTimedWateringOnce(this.duration * 60);
    } else {
      result = await this.valveService.startVolumeBasedWateringOnce(this.volume);
    }
    
    this.stopCountdownMonitoring();
    setTimeout(() => {
      this.startCountdownMonitoring();
    }, 1000);
    
    return result;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.startCountdownMonitoring();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stopCountdownMonitoring();
  }

  private startCountdownMonitoring(): void {
    // Start monitoring immediately
    this.updateCountdown();
    
    // Update every second
    this.countdownInterval = window.setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  private stopCountdownMonitoring(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = undefined;
    }
  }

  private updateCountdown(): void {
    if (this.valveService) {
      this.countdown = this.valveService.getCountdownInfo();
      this.isWatering = this.countdown.isActive;
      // Stop monitoring if irrigation finished
      if (!this.countdown.isActive && this.countdownInterval) {
        this.stopCountdownMonitoring();
      }
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
        .isWatering=${this.isWatering}
        .isCountdownActive=${this.countdown.isActive}
        .duration=${this.duration}
        .volume=${this.volume}
        .activeMode=${this.activeMode}
        .maxDuration=${this.config?.duration_max || 60}
        .maxVolume=${this.config?.volume_max || 100}
        @toggle-valve=${this.handleToggleValve}
        @duration-change=${this.handleDurationChange}
        @volume-change=${this.handleVolumeChange}
        @mode-change=${this.handleModeChange}
      >
        <watering-countdown
          slot="countdown"
          .isActive=${this.countdown.isActive}
          .formatted=${this.countdown.formatted}
          .progress=${this.countdown.progress}
        ></watering-countdown>
      
    </watering-controls>
      
    `;
  }

  static styles?: CSSResultGroup | undefined = css`
    :host {
      flex: 1;
    }
  `;
}
