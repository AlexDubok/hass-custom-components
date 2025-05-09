import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { fireEvent, fireHapticEvent } from '../utils/fireEvent';
import { FlowRate } from '../services/valve-service';
import './optimistic-switch-button';

const iconWaterOn = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 512 512"
>
  <path
    fill="currentColor"
    d="M224 0c17.7 0 32 14.3 32 32l0 12 96-12c17.7 0 32 14.3 32 32s-14.3 32-32 32L256 84l-31-3.9-1-.1-1 .1L192 84 96 96C78.3 96 64 81.7 64 64s14.3-32 32-32l96 12 0-12c0-17.7 14.3-32 32-32zM0 224c0-17.7 14.3-32 32-32l96 0 22.6-22.6c6-6 14.1-9.4 22.6-9.4l18.7 0 0-43.8 32-4 32 4 0 43.8 18.7 0c8.5 0 16.6 3.4 22.6 9.4L320 192l32 0c88.4 0 160 71.6 160 160c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32-14.3-32-32s-14.3-32-32-32l-36.1 0c-20.2 29-53.9 48-91.9 48s-71.7-19-91.9-48L32 320c-17.7 0-32-14.3-32-32l0-64zM436.8 423.4c1.9-4.5 6.3-7.4 11.2-7.4s9.2 2.9 11.2 7.4l18.2 42.4c1.8 4.1 2.7 8.6 2.7 13.1l0 1.2c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-1.2c0-4.5 .9-8.9 2.7-13.1l18.2-42.4z"
  />
</svg>`;
const iconWaterOff = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 512 512"
>
  <path
    fill="currentColor"
    d="M192 96l0 12L96 96c-17.7 0-32 14.3-32 32s14.3 32 32 32l96-12 31-3.9 1-.1 1 .1 31 3.9 96 12c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 12 0-12c0-17.7-14.3-32-32-32s-32 14.3-32 32zM32 256c-17.7 0-32 14.3-32 32l0 64c0 17.7 14.3 32 32 32l100.1 0c20.2 29 53.9 48 91.9 48s71.7-19 91.9-48l36.1 0c17.7 0 32 14.3 32 32s14.3 32 32 32l64 0c17.7 0 32-14.3 32-32c0-88.4-71.6-160-160-160l-32 0-22.6-22.6c-6-6-14.1-9.4-22.6-9.4L256 224l0-43.8-32-4-32 4 0 43.8-18.7 0c-8.5 0-16.6 3.4-22.6 9.4L128 256l-96 0z"
  />
</svg>`;

@customElement('sprinkle-status-card')
export class SprinkleCardMini extends LitElement {
  @property({ type: String }) valveSwitchState: string = '';
  @property({ type: String }) title: string = '';
  @property({ type: String }) status: string = '';
  @property({ type: String }) batteryLevel: string = '';
  @property({ type: Object }) flowRate: FlowRate | null = null;
  @property({ type: Boolean }) isWaterRunning: boolean = false;

  handleToggleRequest() {
    fireEvent(this, 'toggle-valve');
    fireHapticEvent('success');
  }

  handleToggleFailed(e: CustomEvent) {
    this.dispatchEvent(
      new CustomEvent('valve-toggle-failed', {
        bubbles: true,
        composed: true,
        detail: { message: e.detail.message || 'Failed to switch valve state' },
      })
    );
    fireHapticEvent('failure');
  }

  handleCardClick(e: Event) {
    if (e.target !== e.currentTarget) {
      e.stopPropagation();
      return;
    }
  }

  render() {
    return html`
      <ha-card .header=${this.title}>
        <div class="sprinkle-status-card" @click=${this.handleCardClick}>
          <div class="button-container">
            <!-- Use the optimistic-switch-button component -->
            <optimistic-switch-button
              .state=${this.isWaterRunning}
              timeout="4000"
              label="Toggle water valve"
              @toggle=${this.handleToggleRequest}
              @toggle-failed=${this.handleToggleFailed}
            >
              <!-- Content for "on" state -->
              <span slot="on" class="sprinkle-button on">
                ${iconWaterOn}
                <div class="wave wave-1"></div>
                <div class="wave wave-2"></div>
              </span>

              <!-- Content for "off" state -->
              <span slot="off" class="sprinkle-button off">
                ${iconWaterOff}
              </span>
            </optimistic-switch-button>
            <span>${this.valveSwitchState}</span>
          </div>

          <div class="sprinkle-info">
            ${this.batteryLevel &&
            html`<div class="battery">
              battery: <span>${this.batteryLevel}%</span>
            </div>`}
            ${this.status &&
            html`<div class="status">status: <span>${this.status}</span></div>`}
            ${this.flowRate?.state &&
            html`<div class="battery">
              flow rate:
              <span
                >${this.flowRate.state} ${this.flowRate.unitOfMeasurment}</span
              >
            </div>`}
          </div>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    :host * {
      box-sizing: border-box;
    }
    .sprinkle-status-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px 16px;
    }

    .button-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .sprinkle-button {
      min-width: 32px;
      min-height: 32px;
      flex-shrink: 0;
      width: 64px;
      height: 64px;
      display: flex;
      padding: 10px;
      background-color: var(--card-background-color, #ffffff);
      border-radius: 50%;
      position: relative;
      overflow: hidden;
    }

    .sprinkle-button.on {
      border: 2px solid var(--water-color);
      color: var(--water-color);
    }

    .sprinkle-button.off {
      border: 2px solid var(--color-green);
      color: var(--color-gray);
    }

    .sprinkle-button:hover {
      box-shadow: 0 4px 15px rgba(128, 128, 128, 0.3);
    }

    .sprinkle-button:active {
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      transition: box-shadow 0.1s ease-in-out;
    }

    .sprinkle-button.off > .wave {
      display: none;
    }

    .wave {
      position: absolute;
      top: 82%;
      left: -50%;
      width: 128px;
      height: 128px;
      background-color: blue;
      opacity: 0.3;
      border-radius: 42%;
      animation-name: waves;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }

    .wave-1 {
      animation-duration: 7s;
    }

    .wave-2 {
      top: 78%;
      animation-duration: 9s;
    }

    @keyframes waves {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `;
}

//<button class="sprinkle-status-card" @click="${() => fireEvent(this, 'click')}"></button>
declare global {
  // for fire event
  interface HASSDomEvents {
    click: {};
    'toggle-valve': {};
    'valve-toggle-failed': {
      message: string;
    };
  }
}
