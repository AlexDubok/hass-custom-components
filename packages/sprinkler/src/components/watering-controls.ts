import { LitElement, html, css } from 'lit';

export class WateringControls extends LitElement {
  static properties = {
    mode: { type: String },
    duration: { type: Number },
    volume: { type: Number },
  };

  mode: 'duration' | 'volume';
  duration: number;
  volume: number;

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .tabs {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .tab {
      padding: 8px 16px;
      border: none;
      background: none;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      color: var(--primary-text-color);
    }

    .tab.active {
      border-bottom: 2px solid var(--primary-color);
      color: var(--primary-color);
    }

    .slider-container {
      padding: 16px 0;
    }

    .slider-label {
      display: block;
      margin-bottom: 8px;
      color: var(--primary-text-color);
    }

    .slider {
      width: 100%;
      margin: 16px 0;
    }

    .value-display {
      font-size: 1.2em;
      text-align: center;
      color: var(--primary-text-color);
    }

    .range-labels {
      display: flex;
      justify-content: space-between;
      color: var(--secondary-text-color);
      font-size: 0.9em;
    }
  `;

  constructor() {
    super();
    this.mode = 'duration';
    this.duration = 10;
    this.volume = 20;
  }

  render() {
    return html`
      <div class="tabs">
        <button
          class="tab ${this.mode === 'duration' ? 'active' : ''}"
          @click="${() => this.mode = 'duration'}"
        >
          Duration
        </button>
        <button
          class="tab ${this.mode === 'volume' ? 'active' : ''}"
          @click="${() => this.mode = 'volume'}"
        >
          Volume
        </button>
      </div>

      <div class="slider-container">
        ${this.mode === 'duration' ? html`
          <label class="slider-label">Watering Duration (minutes)</label>
          <input
            type="range"
            class="slider"
            min="1"
            max="60"
            .value="${this.duration}"
            @input="${(e: any) => this.duration = e.target.value}"
          />
          <div class="value-display">${this.duration} minutes</div>
          <div class="range-labels">
            <span>1</span>
            <span>5</span>
            <span>10</span>
            <span>60</span>
          </div>
        ` : html`
          <label class="slider-label">Watering Volume (liters)</label>
          <input
            type="range"
            class="slider"
            min="1"
            max="25"
            .value="${this.volume}"
            @input="${(e: any) => this.volume = e.target.value}"
          />
          <div class="value-display">${this.volume} liters</div>
          <div class="range-labels">
            <span>1L</span>
            <span>5L</span>
            <span>10L</span>
            <span>15L</span>
            <span>20L</span>
            <span>25L</span>
          </div>
        `}
      </div>
    `;
  }
}

customElements.define('watering-controls', WateringControls);