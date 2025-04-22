// components/watering-controls/watering-slider.ts
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('watering-slider')
export class WateringSlider extends LitElement {
    @property({ type: Number }) min = 0;
    @property({ type: Number }) max = 60;
    @property({ type: Number }) value = 10;
    @property({ type: String }) unit = 'minutes';
    @property({ type: Boolean }) disabled = false;
    @property({ type: Array }) tickValues: number[] = [];

  constructor() {
    super();
    this.updateTickValues();
  }
  
  updateTickValues() {
    // Generate default tick marks if none provided
    if (!this.tickValues || this.tickValues.length === 0) {
      if (this.max <= 10) {
        // For small ranges, show all values
        this.tickValues = Array.from({length: this.max - this.min + 1}, (_, i) => this.min + i);
      } else if (this.max <= 20) {
        // For medium ranges, show every other value
        this.tickValues = Array.from({length: Math.ceil((this.max - this.min + 1) / 2)}, 
                                    (_, i) => this.min + i * 2);
      } else if (this.max <= 60) {
        // For larger ranges like 1-60, show specific increments
        this.tickValues = [1, 5, 10, 15, 30, 45, 60].filter(v => v >= this.min && v <= this.max);
      } else {
        // For very large ranges, show fewer ticks
        const step = Math.ceil((this.max - this.min) / 5);
        this.tickValues = Array.from({length: 6}, (_, i) => this.min + i * step);
        if (this.tickValues[this.tickValues.length - 1] !== this.max) {
          this.tickValues[this.tickValues.length - 1] = this.max;
        }
      }
    }
  }
  
  handleSliderChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const newValue = parseInt(target.value, 10);
    
    this.value = newValue;
    this.dispatchEvent(new CustomEvent('value-change', {
      detail: { value: newValue }
    }));
  }
  
  updated(changedProps: Map<string, any>) {
    if (changedProps.has('min') || changedProps.has('max')) {
      this.updateTickValues();
    }
  }
  
  render() {
    // Calculate where each tick should be positioned along the slider
    const tickPositions = this.tickValues.map(tickValue => {
      const percentage = ((tickValue - this.min) / (this.max - this.min)) * 100;
      return { value: tickValue, position: percentage };
    });
    
    return html`
      <div class="slider-container">
        <input
          type="range"
          class="slider"
          min="${this.min}"
          max="${this.max}"
          .value="${this.value.toString()}"
          ?disabled="${this.disabled}"
          @input="${this.handleSliderChange}"
        />
        
        <div class="tick-marks">
          ${tickPositions.map(tick => html`
            <div class="tick" style="left: calc(${tick.position}% - 6px);">
              ${tick.value}
            </div>
          `)}
        </div>
      </div>
      
      <div class="value-display">
        ${this.value} ${this.unit}
      </div>
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
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    transition: all 0.2s;
  }
  
  .slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #03a9f4;
    cursor: pointer;
    border: none;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
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
