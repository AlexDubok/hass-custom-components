import { LitElement, html, css } from 'lit';
import './watering-slider';
import { Mode } from '../../types/config';
import { customElement, property } from 'lit/decorators.js';

@customElement('watering-controls')
export class WateringControls extends LitElement {
  @property({ type: Boolean }) isWatering = false;
  @property({ type: Number }) duration = 0;
  @property({ type: Number }) volume = 0;
  @property({ type: String }) activeMode: Mode = 'duration';
  @property({ type: Number }) maxDuration = 30;
  @property({ type: Number }) maxVolume = 50;

  handleToggleClick() {
    this.dispatchEvent(new CustomEvent('toggle-valve'));
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
    const buttonClass = this.isWatering
      ? 'control-button active'
      : 'control-button';
    const buttonText = this.isWatering ? 'Stop Watering' : 'Start Watering';
    const statusText = this.isWatering
      ? 'Watering in progress...'
      : 'Tap to begin watering';

    return html`
      <div class="watering-controls">
        <button class="${buttonClass}" @click=${this.handleToggleClick}>
          <span>${buttonText}</span>
        </button>
        <div class="control-text">${statusText}</div>

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

        <div class="input-container">
          <div class="value-display">
            <span class="value-label">${this.currentValue.toFixed(1)}</span>
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

      .control-text {
        margin-block-end: 16px;
      }

      /* Your styles here */
      .control-button {
        width: 100%;
        max-width: 300px;
        padding: 20px;
        border-radius: 16px;
        background: white;
        border: 2px solid var(--primary-color, #03a9f4);
        cursor: pointer;
        text-align: center;
      }

      .control-buttonClass.active {
        background-color: #4caf50;
        color: white;
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
