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
  @property({ type: Number }) maxDuration = 60;
  @property({ type: Number }) maxVolume = 100;
  @property({ type: String }) unit = 'minutes';

  handleToggleClick() {
    this.dispatchEvent(new CustomEvent('toggle-valve'));
  }

  handleDurationChange(e: CustomEvent) {
    this.dispatchEvent(
      new CustomEvent('duration-change', {
        detail: { value: e.detail.value },
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
            class="tab ${this.activeMode === 'duration' ? 'active' : ''}"
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

        ${this.activeMode === 'duration'
          ? html`
              <div>
                <h3>Watering Duration (minutes)</h3>
                <watering-slider
                  min="1"
                  max="${this.maxDuration}"
                  value="${this.duration}"
                  unit="minutes"
                  @value-change=${this.handleDurationChange}
                ></watering-slider>
              </div>
            `
          : html`
              <div>
                <h3>Watering Volume (liters)</h3>
                <watering-slider
                  min="1"
                  max="${this.maxVolume}"
                  value="${this.volume}"
                  unit="liters"
                  @value-change=${this.handleVolumeChange}
                ></watering-slider>
              </div>
            `}
      </div>
    `;
  }

  static styles = css`
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
  `;
}
