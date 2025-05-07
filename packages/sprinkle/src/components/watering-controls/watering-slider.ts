import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { fireHapticEvent } from '../../utils/fireEvent';

@customElement('watering-slider')
export class WateringSlider extends LitElement {
  @property({ type: Number }) min = 0;
  @property({ type: Number }) max = 60;
  @property({ type: Number }) value = 0;
  @property({ type: Number }) precision = 0.5;
  @property({ type: String }) unit = 'min';
  @property({ type: Boolean }) disabled = false;

  @state() tickValues: number[] = [];
  
  private sliderInput?: HTMLInputElement;
  
  firstUpdated() {
    // Get reference to the slider input
    this.sliderInput = this.shadowRoot?.querySelector('input.range') as HTMLInputElement;
    
    // if (this.sliderInput) {
    //   // Add touch event listeners for mobile devices
    //   this.sliderInput.addEventListener('touchstart', this.handleTouchStart.bind(this));
    //   this.sliderInput.addEventListener('touchmove', this.handleTouchMove.bind(this));
    //   this.sliderInput.addEventListener('touchend', this.handleTouchEnd.bind(this));
    // }
  }
  
  handleSliderChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const newValue = parseFloat(target.value);

    this.value = newValue;
    this.dispatchEvent(
      new CustomEvent('value-change', {
        detail: { value: newValue },
      })
    );
    fireHapticEvent('selection');
  }
  
  handleTouchStart(e: TouchEvent) {
    e.preventDefault(); // Prevent scrolling while touching the slider
    
    const touch = e.touches[0];
    
    const newValue = this.calculateValueFromTouch(touch);
    
    if (newValue !== undefined) {
      this.sliderInput!.value = String(newValue);
      
      this.value = newValue;
      
      this.dispatchEvent(
        new CustomEvent('value-change', {
          detail: { value: newValue },
        })
      );
      
      fireHapticEvent('selection');
    }
  }
  
  handleTouchMove(e: TouchEvent) {
    e.preventDefault(); // Prevent scrolling while touching the slider
    const touch = e.touches[0];
    const newValue = this.calculateValueFromTouch(touch);
    
    if (newValue !== undefined && newValue !== this.value) {
      this.sliderInput!.value = String(newValue);
      this.value = newValue;
      
      this.dispatchEvent(
        new CustomEvent('value-change', {
          detail: { value: newValue },
        })
      );
      fireHapticEvent('selection');
    }
  }
  
  handleTouchEnd() {
    fireHapticEvent('light');
  }
  
  calculateValueFromTouch(touch: Touch): number {
    if (!this.sliderInput) return this.value;
    
    const rect = this.sliderInput.getBoundingClientRect();
    
    const percentage = (touch.clientX - rect.left) / rect.width;
    const range = this.max - this.min;

    const rawValue = this.min + percentage * range;
    const steppedValue = Math.round(rawValue / this.precision) * this.precision;

    return Math.max(this.min, Math.min(this.max, steppedValue));
  }

  render() {
    return html`
      <div class="slider-container">
        <div class="value-display"><span class="value-label">${this.value.toFixed(1)}</span> ${this.unit}</div>

        <input
          type="range"
          class="range ${this.value === this.min ? 'minimum' : ''}"
          min="${this.min}"
          max="${this.max}"
          step="${this.precision}"
          .value="${this.value.toString()}"
          ?disabled="${this.disabled}"
          @input="${this.handleSliderChange}"
          @touchstart="${this.handleTouchStart}"
          @touchmove="${this.handleTouchMove}"
          @touchend="${this.handleTouchEnd}"
        />
      </div>
    `;
  }
  
  // disconnectedCallback() {
  //   super.disconnectedCallback();
    
  //   // Clean up event listeners
  //   if (this.sliderInput) {
  //     this.sliderInput.removeEventListener('touchstart', this.handleTouchStart.bind(this));
  //     this.sliderInput.removeEventListener('touchmove', this.handleTouchMove.bind(this));
  //     this.sliderInput.removeEventListener('touchend', this.handleTouchEnd.bind(this));
  //   }
  // }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      --text-color: #f9f9f9;
      --blue: oklch(0.58 0.22 259.05);
      --blue-rgb: 8, 112, 248;
      --input-size: 70px;
      --range-border: transparent;
      --range-bg: rgba(0, 0, 0, 0.1);
      /* --thumb-bg: #0870f8; */
      --thumb-bg: purple;
    }

    .slider-container {
      position: relative;
      width: 100%;
      margin: 20px 0;
      touch-action: none; /* Prevent scrolling while interacting with slider */
    }

    .slider-container * {
      user-select: none;
    }

    .range {
      margin-top: 25px;
      display: inline-block;
      width: 100%;
      height: var(--input-size);
      appearance: none;
      -moz-appearance: none;
      -webkit-appearance: none;
      background-color: var(--range-bg);
      outline: none;
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 0 0 0 2px var(--range-border);
      touch-action: none;
    }

    .range:focus,
    .range:active {
      background: var(--range-bg);
    }

    .range::-webkit-slider-thumb {
      -webkit-appearance: none;
      position: relative;
      height: var(--input-size);
      background: var(--range-bg);
      outline: none;
      border: none;
      cursor: pointer;
      box-shadow: -500px 0 0 505px var(--thumb-bg);
      border-radius: 2px;
      width: 3px;
      height: 20px;
      right: 5px;
    }

    .range::-moz-range-thumb {
      -webkit-appearance: none;
      position: relative;
      height: var(--input-size);
      background: var(--range-bg);
      outline: none;
      border: none;
      cursor: pointer;
      box-shadow: -500px 0 0 505px var(--thumb-bg);
      border-radius: 2px;
      width: 3px;
      height: 20px;
      right: 5px;
    }
    
    /* Make thumb transparent when at minimum value */
    .range.minimum::-webkit-slider-thumb {
      background: transparent;
    }
    
    .range.minimum::-moz-range-thumb {
      background: transparent;
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