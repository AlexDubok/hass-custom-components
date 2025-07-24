import { customElement, property } from 'lit/decorators.js';
import { LitElement, html, css } from 'lit';

@customElement('watering-countdown')
export class WateringCountdown extends LitElement {
  @property({type: String}) formatted?: '--:--'; 
  @property({type: Number}) progress?: 0; 
  @property({type: Boolean}) isActive?: boolean; 

  render() {
    if (!this.isActive) {
      return html``;
    }

    return html`
      <div class="countdown-timer">
        <div class="timer-display">
          <span class="timer-icon">⏱️</span>
          <span class="timer-value">${this.formatted}</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            style="width: ${this.progress}%"
          ></div>
        </div>
      </div>
    `;
  }

  static styles = css`
    .countdown-timer {
      padding: 12px;
      background: var(--card-background-color);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .timer-display {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .timer-icon {
      margin-right: 8px;
    }

    .timer-value {
      font-family: monospace;
      color: var(--primary-color);
    }

    .progress-bar {
      height: 4px;
      background: var(--divider-color);
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--primary-color);
      transition: width 1s linear;
    }
  `;
}