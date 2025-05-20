import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { fireEvent } from '../utils/fireEvent';

/**
 * A reusable button component that handles optimistic UI updates
 *
 * @slot - Default slot for button content
 * @slot on - Content to show when button is in "on" state
 * @slot off - Content to show when button is in "off" state
 * @fires toggle - Fired when button is toggled with { newState: boolean }
 * @fires toggle-failed - Fired when optimistic update times out with { message: string }
 */
@customElement('optimistic-switch-button')
export class OptimisticButton extends LitElement {
  @property({ type: Boolean }) state = false;
  @property({ type: Number }) timeout = 5000;
  @property({ type: Boolean }) disabled = false;
  @property({ type: String }) label = 'Toggle';

  @state() public optimisticState: boolean | null = null;

  private timeoutId: number | null = null;

  disconnectedCallback() {
    super.disconnectedCallback();
    this.clearTimeout();
  }

  updated(changedProps: Map<string, any>) {
    super.updated(changedProps);

    // If the actual state changed, check if it matches our optimistic state
    if (changedProps.has('state') && this.optimisticState !== null) {
      // If the new state matches what we expected, clear the optimistic state
      if (this.state === this.optimisticState) {
        this.clearTimeout();
        this.optimisticState = null;
      }
    }
  }

  /**
   * Handle button click
   */
  private handleClick(e: Event) {
    e.stopPropagation();
    if (this.disabled) return;

    this.optimisticState = !this.state;
    this.clearTimeout();

    this.timeoutId = window.setTimeout(() => {
      // If we get here, the state didn't change as expected
      this.dispatchEvent(
        new CustomEvent('toggle-failed', {
          bubbles: true,
          composed: true,
          detail: {
            message: 'Toggle operation timed out',
          },
        })
      );

      this.optimisticState = null;
      this.timeoutId = null;
    }, this.timeout);

    fireEvent(this, 'toggle');
  }

  /**
   * Clear the current timeout
   */
  private clearTimeout() {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Get the current display state (optimistic or actual)
   */
  private get displayState(): boolean {
    return this.optimisticState !== null ? this.optimisticState : this.state;
  }

  render() {
    const isOn = this.displayState;

    return html`
      <button
        class="optimistic-switch-button"
        ?disabled=${this.disabled}
        @click=${this.handleClick}
        aria-pressed=${isOn}
        role="switch"
        aria-label=${this.label}
      >
        ${isOn ? html`<slot name="on"></slot>` : html`<slot name="off"></slot>`}
      </button>
    `;
  }

  static styles = css`
    :host {
        display: contents;
    }
    .optimistic-switch-button {
        display: contents;
    }
  `;
}

declare global {
  interface HASSDomEvents {
    // existing events
    toggle: { newState: boolean };
  }
  interface HTMLElementTagNameMap {
    'optimistic-switch-button': OptimisticButton;
  }

  interface HTMLElementEventMap {
    toggle: CustomEvent<{ newState: boolean }>;
    'toggle-failed': CustomEvent<{ message: string }>;
  }
}
