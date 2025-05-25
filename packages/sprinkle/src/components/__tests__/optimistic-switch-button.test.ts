import { LitTestKit } from '../../test/Testkit';
import { elementUpdated } from '../../test/utils';

import '../optimistic-switch-button';
import { OptimisticButton } from '../optimistic-switch-button';
import { html } from 'lit';

describe('OptimisticButton', () => {
  const driver = new LitTestKit<OptimisticButton, {button: string}>({
    button: '.optimistic-switch-button',
  });

  beforeEach(() => {
    driver.reset();
  });

  it('is defined', async () => {
    const el = await driver.render(html`
      <optimistic-switch-button></optimistic-switch-button>
    `);
    expect(el).toBeInstanceOf(OptimisticButton);
  });

  it('renders with default props', async () => {
    const el = await driver.render(html`
      <optimistic-switch-button>
        <span slot="on">ON State</span>
        <span slot="off">OFF State</span>
      </optimistic-switch-button>
    `);

    expect(el.state).toBe(false);
    expect(el.timeout).toBe(5000);
    expect(el.disabled).toBe(false);
    expect(el.label).toBe('Toggle');

    // Check that the optimisticState is initially null
    expect(el.optimisticState).toBe(null);

    // Verify that the correct slot content is being displayed (off state by default)
    const button = driver.finders.button();
    expect(button.exists()).not.toBeNull();
    expect(button?.getAttribute('aria-pressed')).toBe('false');
    expect(button?.getAttribute('role')).toBe('switch');
    expect(button?.getAttribute('aria-label')).toBe('Toggle');

    const slotElement = button.getSlot('off');

    expect(slotElement).not.toBeNull();
  });

  it('renders in OFF state by default', async () => {
    await driver.render(html`
      <optimistic-switch-button>
        <span slot="on">ON State</span>
        <span slot="off">OFF State</span>
      </optimistic-switch-button>
    `);

    const button = driver.finders.button();
    expect(button?.getAttribute('aria-pressed')).toBe('false');
    const slotElement = button.getSlot('off');
    expect(slotElement.textContent?.trim()).toBe(
      'OFF State'
    );
  });

  it('toggles state on click', async () => {
    const el = await driver.render(html`
      <optimistic-switch-button>
        <span slot="on">ON State</span>
        <span slot="off">OFF State</span>
      </optimistic-switch-button>
    `);

    const button = driver.finders.button();
    expect(button.exists()).not.toBeNull();

    button?.click();
    await elementUpdated(el);

    expect(el.optimisticState).toBe(true);
    expect(button?.getAttribute('aria-pressed')).toBe('true');
    const slotElement = button.getSlot('on');
    expect(slotElement?.textContent?.trim()).toBe('ON State');
  });

  it('dispatches toggle event on click', async () => {
    const el = await driver.render(html`
      <optimistic-switch-button>
        <span slot="on">ON State</span>
        <span slot="off">OFF State</span>
      </optimistic-switch-button>
    `);
    const toggleSpy = vi.fn();
    el.addEventListener('toggle', toggleSpy);

    const button = driver.finders.button();
    button.click();

    expect(toggleSpy).toHaveBeenCalledTimes(1);
  });

  it('handles timeout for optimistic update', async () => {
        const el = await driver.render(html`
      <optimistic-switch-button>
        <span slot="on">ON State</span>
        <span slot="off">OFF State</span>
      </optimistic-switch-button>
    `);
    el.timeout = 100; // Set a short timeout for testing
    const toggleFailedSpy = vi.fn();
    el.addEventListener('toggle-failed', toggleFailedSpy);

    const button = driver.finders.button();
    button.click();

    await new Promise((resolve) => setTimeout(resolve, 150)); // Wait for timeout

    expect(toggleFailedSpy).toHaveBeenCalledTimes(1);
    expect(el.optimisticState).toBe(null);
  });

  it('does not toggle when disabled', async () => {
    const el = await driver.render(html`
      <optimistic-switch-button>
        <span slot="on">ON State</span>
        <span slot="off">OFF State</span>
      </optimistic-switch-button>
    `);
    el.disabled = true;

    const button = driver.finders.button();
    button.click();

    expect(el.optimisticState).toBe(null);
  });
});
