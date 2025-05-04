// components/watering-controls/watering-slider.ts
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getTickValues } from './utils/slider';

@customElement('watering-slider')
export class WateringSlider extends LitElement {
  private stepsCount = 6;
  @property({ type: Number }) min = 0;
  @property({ type: Number }) max = 60;
  @property({ type: Number }) value = 0;
  @property({ type: Number }) precision = 0.5;
  @property({ type: String }) unit = 'minutes';
  @property({ type: Boolean }) disabled = false;
  
  @state() tickValues: number[] = [];

  constructor() {
    super();
    this.updateTickValues();
  }

  updateTickValues() {
    // const range = this.max - this.min;
    // if (range % 6 === 0) {
    //   this.tickValues = getTickValues(6, this.min, this.max);  
    // }
    // if (range % 5 === 0) {
    //   this.tickValues = getTickValues(5, this.min, this.max);  
    // }
    this.tickValues = getTickValues(this.stepsCount, this.min, this.max);
  }

  handleSliderChange(e: Event) {
    const target = e.target as HTMLInputElement;
    console.log(target.value);
    const newValue = parseFloat(target.value);

    this.value = newValue;
    this.dispatchEvent(
      new CustomEvent('value-change', {
        detail: { value: newValue },
      })
    );
  }

  updated(changedProps: Map<string, any>) {
    if (changedProps.has('min') || changedProps.has('max')) {
      this.updateTickValues();
    }
  }

  render() {
    return html`
      <div class="slider-container">
        <input
          type="range"
          class="slider"
          min="${this.min}"
          max="${this.max}"
          step="${this.precision}"
          .value="${this.value.toString()}"
          ?disabled="${this.disabled}"
          @input="${this.handleSliderChange}"
        />

        <div class="tick-marks">
          ${this.tickValues.map(
            (tick) => html`
              <div class="tick">
                ${tick}
              </div>
            `
          )}
        </div>
      </div>

      <div class="value-display">${this.value} ${this.unit}</div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      padding: 10px 0;
    }

    .slider-container {
      position: relative;
      width: 100%;
      margin: 20px 0;
    }

    .slider {
      -webkit-appearance: none;
      width: 100%;
      height: 8px;
      border-radius: 4px;
      background: #e0e0e0;
      outline: none;
      transition: all 0.2s;
    }

    .slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #03a9f4;
      cursor: pointer;
      border: none;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      transition: all 0.2s;
    }

    .slider::-moz-range-thumb {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #03a9f4;
      cursor: pointer;
      border: none;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      transition: all 0.2s;
    }

    .slider:disabled {
      opacity: 0.5;
    }

    .slider:disabled::-webkit-slider-thumb {
      background: #9e9e9e;
      cursor: not-allowed;
    }

    .slider:disabled::-moz-range-thumb {
      background: #9e9e9e;
      cursor: not-allowed;
    }

    .tick-marks {
      position: relative;
      width: 100%;
      margin-top: 10px;
      height: 20px;
      display: flex;
      justify-content: space-between;
    }

    .tick {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 1px;
      color: #757575;
      font-size: 12px;
    }

    .tick::before {
      content: '';
      width: 1px;
      height: 8px;
      background-color: #bdbdbd;
      margin-bottom: 4px;
    }

    .value-display {
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      margin: 16px 0;
      color: #212121;
    }
  `;
}
