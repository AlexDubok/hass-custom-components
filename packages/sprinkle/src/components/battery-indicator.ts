import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('battery-indicator')
export class BatteryIndicator extends LitElement {
  @property({ type: Number }) batteryLevel: number = 100;
  @property({ type: String }) size: 'small' | 'medium' | 'large' = 'medium';

  private getBatteryColor(): string {
    if (this.batteryLevel <= 20) return 'var(--battery-critical-color, #f44336)'; // Red
    if (this.batteryLevel <= 50) return 'var(--battery-low-color, #ffeb3b)'; // Yellow
    return 'var(--battery-good-color, #4caf50)'; // Green
  }

  private getBatteryWidth(): number {
    return Math.max(0, Math.min(100, this.batteryLevel));
  }

  private getSizeClass(): string {
    return `battery-${this.size}`;
  }

  render() {
    const batteryColor = this.getBatteryColor();
    const fillWidth = this.getBatteryWidth();
    const isLowBattery = this.batteryLevel <= 20;
    const displayPercentage = Math.round(this.batteryLevel);
    
    return html`
      <div class="battery-container ${this.getSizeClass()}">
        <div class="battery-body">
          <div 
            class="battery-fill ${isLowBattery ? 'low-battery' : ''}"
            style="width: ${fillWidth}%; background-color: ${batteryColor};"
          ></div>
          <div class="battery-percentage">${displayPercentage}</div>
        </div>
        <div class="battery-terminal"></div>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
    }

    .battery-container {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .battery-body {
      position: relative;
      background-color: var(--battery-background-color, #fafafa);
      border: 2px solid var(--battery-border-color, var(--divider-color, #e0e0e0));
      border-radius: 4px;
      overflow: hidden;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .battery-fill {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      transition: width 0.5s ease, background-color 0.3s ease;
      border-radius: 2px;
    }

    .battery-fill.low-battery {
      animation: batteryPulse 1.5s ease-in-out infinite;
    }

    .battery-terminal {
      background-color: var(--battery-terminal-color, var(--divider-color, #e0e0e0));
      border-radius: 0 2px 2px 0;
      transition: background-color 0.3s ease;
    }

    .battery-percentage {
      position: relative;
      z-index: 1;
      font-size: var(--battery-text-size, 14px);
      font-weight: 700;
      color: var(--battery-text-color, #505050);
      text-align: center;
      line-height: 1;
    }

    /* Size variants */
    .battery-small .battery-body {
      width: 32px;
      height: 16px;
    }

    .battery-small .battery-terminal {
      width: 2px;
      height: 10px;
    }

    .battery-small .battery-percentage {
      --battery-text-size: 14px;
    }

    .battery-medium .battery-body {
      width: 40px;
      height: 20px;
    }

    .battery-medium .battery-terminal {
      width: 3px;
      height: 14px;
    }

    .battery-medium .battery-percentage {
      --battery-text-size: 14px;
    }

    .battery-large .battery-body {
      width: 48px;
      height: 24px;
    }

    .battery-large .battery-terminal {
      width: 4px;
      height: 18px;
    }

    .battery-large .battery-percentage {
      --battery-text-size: 16px;
    }

    @keyframes batteryPulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.6;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'battery-indicator': BatteryIndicator;
  }
}