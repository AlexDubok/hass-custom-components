import { LitElement, html, css } from 'lit';
import './watering-slider';
import { Mode } from '../../types/config';
import { customElement, property } from 'lit/decorators.js';
import { fireHapticEvent } from '../../utils/fireEvent';
import '../optimistic-switch-button';

@customElement('watering-controls')
export class WateringControls extends LitElement {
  @property({ type: Boolean }) isWatering = false;
  @property({ type: Boolean }) isCountdownActive = false;
  @property({ type: Number }) duration = 0;
  @property({ type: Number }) volume = 0;
  @property({ type: String }) activeMode: Mode = 'duration';
  @property({ type: Number }) maxDuration = 30;
  @property({ type: Number }) maxVolume = 50;

  handleToggleClick() {
    this.dispatchEvent(new CustomEvent('toggle-valve'));
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

  handleDurationChange(e: CustomEvent) {
    this.dispatchEvent(
      new CustomEvent('duration-change', {
        detail: { value: +e.detail.value },
      })
    );
  }

  handleVolumeChange(e: CustomEvent) {
    this.dispatchEvent(
      new CustomEvent('volume-change', {
        detail: { value: e.detail.value },
      })
    );
  }

  setMode(mode: string) {
    this.dispatchEvent(
      new CustomEvent('mode-change', {
        detail: { mode },
      })
    );
  }

  get isDuration() {
    return this.activeMode === 'duration';
  }

  get currentValue() {
    return this.isDuration ? this.duration : this.volume;
  }

  get unit() {
    return this.isDuration ? 'minutes' : 'liters';
  }

  render() {
    const statusText = this.isWatering
      ? 'Watering in progress...'
      : 'Tap to begin watering';

    // Icons for the button
    const playIcon = html`<svg
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      width="24"
      viewBox="0 0 24 24"
      style="vertical-align: middle; margin-right: 8px;"
    >
      <path fill="currentColor" d="M8 5v14l11-7z" />
    </svg>`;

    const stopIcon = html`<svg
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      width="24"
      viewBox="0 0 24 24"
      style="vertical-align: middle; margin-right: 8px;"
    >
      <path fill="currentColor" d="M6 6h12v12H6z" />
    </svg>`;

    return html`
      <div class="watering-controls">
        <optimistic-switch-button
          .state=${this.isWatering}
          timeout="4000"
          label="Toggle water valve"
          @toggle=${this.handleToggleClick}
          @toggle-failed=${this.handleToggleFailed}
        >
          <div class="control-button active" slot="on">
            ${stopIcon}
            <span>Stop Watering</span>
          </div>
          <div class="control-button" slot="off">
            ${playIcon}
            <span>Start Watering</span>
          </div>
        </optimistic-switch-button>
        <div class="control-text ${this.isWatering ? 'active' : ''}">
          ${statusText}
        </div>

        <div class="tabs">
          <div
            class="tab ${this.isDuration ? 'active' : ''}"
            @click=${() => this.setMode('duration')}
          >
            Duration
          </div>
          <div
            class="tab ${this.activeMode === 'volume' ? 'active' : ''}"
            @click=${() => this.setMode('volume')}
          >
            Volume
          </div>
        </div>

        ${this.isCountdownActive
          ? html`<div class="input-container">
              <slot name="countdown"></slot>
            </div>`
          : html`
              <div class="input-container">
                <div class="value-display">
                  <span class="value-label"
                    >${this.currentValue.toFixed(1)}</span
                  >
                  ${this.unit}
                </div>

                ${this.isDuration
                  ? html`
                      <watering-slider
                        min="0"
                        max="${this.maxDuration}"
                        value="${this.duration}"
                        unit="minutes"
                        @value-change=${this.handleDurationChange}
                      ></watering-slider>
                    `
                  : html`
                      <watering-slider
                        min="0"
                        max="${this.maxVolume}"
                        value="${this.volume}"
                        unit="liters"
                        @value-change=${this.handleVolumeChange}
                      ></watering-slider>
                    `}
              </div>
            `}
      </div>
    `;
  }

  static get styles() {
    return css`
      .watering-controls {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .control-button {
        width: 100%;
        max-width: 300px;
        padding: 20px;
        border-radius: 16px;
        background: white;
        border: 2px solid var(--primary-color, red);
        color: var(--primary-color, red);
        cursor: pointer;
        text-align: center;
        font-weight: bold;
        font-size: 1.2em;
        transition: transform 0.1s ease;
        position: relative;
        overflow: hidden;
        margin-block-end: 16px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .control-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      .control-button.active {
        background-color: var(--water-color, #f44336);
        border-color: var(--water-color, #f44336);
        color: white;
        box-shadow: 0 4px 8px rgba(244, 67, 54, 0.3);
      }

      .control-button.active::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: rgba(255, 255, 255, 0.4);
        animation: water-flow 2s infinite linear;
      }

      @keyframes water-flow {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }

      .control-text {
        margin-block-end: 32px;
        font-weight: 500;
        color: var(--secondary-text-color, #727272);
        transition: color 0.3s ease;
      }

      .control-text.active {
        color: var(--water-color, #f44336);
        font-weight: bold;
      }

      .tabs {
        display: flex;
        width: 100%;
        margin-bottom: 16px;
      }

      .tab {
        flex: 1;
        text-align: center;
        padding: 8px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
      }

      .tab.active {
        border-bottom-color: var(--primary-color, #03a9f4);
        color: var(--primary-color, #03a9f4);
      }

      .input-container {
        width: 75%;
      }

      .value-display {
        font-size: 24px;
        text-align: center;
        margin: 16px 0;
        color: #212121;
      }

      .value-label {
        font-size: 32px;
        font-weight: bold;
        min-width: 4ch;
      }
    `;
  }
}
