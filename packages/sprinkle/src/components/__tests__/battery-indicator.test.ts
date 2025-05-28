import { LitTestKit } from '../../test/Testkit';
import { elementUpdated } from '../../test/utils';

import { BatteryIndicator } from '../battery-indicator';
import { html } from 'lit';
import '../battery-indicator';

describe('BatteryIndicator', () => {
  const driver = new LitTestKit<BatteryIndicator, {
    container: string;
    body: string;
    fill: string;
    terminal: string;
    percentage: string;
  }>({
    container: '.battery-container',
    body: '.battery-body',
    fill: '.battery-fill',
    terminal: '.battery-terminal',
    percentage: '.battery-percentage',
  });

  beforeEach(() => {
    driver.reset();
  });

  it('is defined', async () => {
    const el = await driver.render(html`<battery-indicator></battery-indicator>`);
    expect(el).toBeInstanceOf(BatteryIndicator);
  });

  it('renders with default props', async () => {
    const el = await driver.render(html`<battery-indicator></battery-indicator>`);

    expect(el.batteryLevel).toBe(100);
    expect(el.size).toBe('medium');

    const container = driver.finders.container();
    const body = driver.finders.body();
    const fill = driver.finders.fill();
    const terminal = driver.finders.terminal();
    const percentage = driver.finders.percentage();

    expect(container.exists()).toBe(true);
    expect(body.exists()).toBe(true);
    expect(fill.exists()).toBe(true);
    expect(terminal.exists()).toBe(true);
    expect(percentage.exists()).toBe(true);
  });

  it('displays correct percentage text', async () => {
    await driver.render(html`<battery-indicator .batteryLevel=${75}></battery-indicator>`);

    const percentage = driver.finders.percentage();
    expect(percentage.text()?.trim()).toBe('75');
  });

  it('rounds percentage to nearest integer', async () => {
    await driver.render(html`<battery-indicator .batteryLevel=${75.7}></battery-indicator>`);

    const percentage = driver.finders.percentage();
    expect(percentage.text()?.trim()).toBe('76');
  });

  it('handles zero battery level', async () => {
    await driver.render(html`<battery-indicator .batteryLevel=${0}></battery-indicator>`);

    const percentage = driver.finders.percentage();
    const fill = driver.finders.fill();
    
    expect(percentage.text()?.trim()).toBe('0');
    expect(fill.element?.style.width).toBe('0%');
  });

  it('handles battery level above 100%', async () => {
    await driver.render(html`<battery-indicator .batteryLevel=${120}></battery-indicator>`);

    const percentage = driver.finders.percentage();
    const fill = driver.finders.fill();
    
    expect(percentage.text()?.trim()).toBe('120');
    expect(fill.element?.style.width).toBe('100%'); // Capped at 100%
  });

  it('handles negative battery level', async () => {
    await driver.render(html`<battery-indicator .batteryLevel=${-10}></battery-indicator>`);

    const percentage = driver.finders.percentage();
    const fill = driver.finders.fill();
    
    expect(percentage.text()?.trim()).toBe('-10');
    expect(fill.element?.style.width).toBe('0%'); // Capped at 0%
  });

  describe('battery colors', () => {
    it('shows critical color for battery level <= 20%', async () => {
      await driver.render(html`<battery-indicator .batteryLevel=${15}></battery-indicator>`);

      const fill = driver.finders.fill();
      expect(fill.element?.style.backgroundColor).toContain('var(--battery-critical-color, #f44336)');
    });

    it('shows low color for battery level 21-50%', async () => {
      await driver.render(html`<battery-indicator .batteryLevel=${35}></battery-indicator>`);

      const fill = driver.finders.fill();
      expect(fill.element?.style.backgroundColor).toContain('var(--battery-low-color, #ffeb3b)');
    });

    it('shows good color for battery level > 50%', async () => {
      await driver.render(html`<battery-indicator .batteryLevel=${75}></battery-indicator>`);

      const fill = driver.finders.fill();
      expect(fill.element?.style.backgroundColor).toContain('var(--battery-good-color, #4caf50)');
    });

    it('shows critical color at exactly 20%', async () => {
      await driver.render(html`<battery-indicator .batteryLevel=${20}></battery-indicator>`);

      const fill = driver.finders.fill();
      expect(fill.element?.style.backgroundColor).toContain('var(--battery-critical-color, #f44336)');
    });

    it('shows low color at exactly 50%', async () => {
      await driver.render(html`<battery-indicator .batteryLevel=${50}></battery-indicator>`);

      const fill = driver.finders.fill();
      expect(fill.element?.style.backgroundColor).toContain('var(--battery-low-color, #ffeb3b)');
    });

    it('shows good color at exactly 51%', async () => {
      await driver.render(html`<battery-indicator .batteryLevel=${51}></battery-indicator>`);

      const fill = driver.finders.fill();
      expect(fill.element?.style.backgroundColor).toContain('var(--battery-good-color, #4caf50)');
    });
  });

  describe('fill width calculation', () => {
    it('sets correct fill width for various battery levels', async () => {
      const testCases = [
        { level: 0, expectedWidth: '0%' },
        { level: 25, expectedWidth: '25%' },
        { level: 50, expectedWidth: '50%' },
        { level: 75, expectedWidth: '75%' },
        { level: 100, expectedWidth: '100%' },
      ];

      for (const testCase of testCases) {
         await driver.render(html`<battery-indicator .batteryLevel=${testCase.level}></battery-indicator>`);
        const fill = driver.finders.fill();
        expect(fill.element?.style.width).toBe(testCase.expectedWidth);
      }
    });
  });

  describe('low battery animation', () => {
    it('adds low-battery class for battery level <= 20%', async () => {
       await driver.render(html`<battery-indicator .batteryLevel=${15}></battery-indicator>`);

      const fill = driver.finders.fill();
      expect(fill.element?.className).toContain('low-battery');
    });

    it('does not add low-battery class for battery level > 20%', async () => {
      await driver.render(html`<battery-indicator .batteryLevel=${25}></battery-indicator>`);

      const fill = driver.finders.fill();
      expect(fill.element?.className).not.toContain('low-battery');
    });

    it('adds low-battery class at exactly 20%', async () => {
      await driver.render(html`<battery-indicator .batteryLevel=${20}></battery-indicator>`);

      const fill = driver.finders.fill();
      expect(fill.element?.className).toContain('low-battery');
    });
  });

  describe('size variants', () => {
    it('applies small size class', async () => {
      await driver.render(html`<battery-indicator size="small"></battery-indicator>`);

      const container = driver.finders.container();
      expect(container.element?.className).toContain('battery-small');
    });

    it('applies medium size class by default', async () => {
      await driver.render(html`<battery-indicator></battery-indicator>`);

      const container = driver.finders.container();
      expect(container.element?.className).toContain('battery-medium');
    });

    it('applies large size class', async () => {
      await driver.render(html`<battery-indicator size="large"></battery-indicator>`);

      const container = driver.finders.container();
      expect(container.element?.className).toContain('battery-large');
    });
  });

  describe('property updates', () => {
    it('updates percentage text when batteryLevel changes', async () => {
      const el = await driver.render(html`<battery-indicator .batteryLevel=${50}></battery-indicator>`);

      let percentage = driver.finders.percentage();
      expect(percentage.text()?.trim()).toBe('50');

      el.batteryLevel = 80;
      await elementUpdated(el);

      percentage = driver.finders.percentage();
      expect(percentage.text()?.trim()).toBe('80');
    });

    it('updates fill width when batteryLevel changes', async () => {
      const el = await driver.render(html`<battery-indicator .batteryLevel=${30}></battery-indicator>`);

      let fill = driver.finders.fill();
      expect(fill.element?.style.width).toBe('30%');

      el.batteryLevel = 70;
      await elementUpdated(el);

      fill = driver.finders.fill();
      expect(fill.element?.style.width).toBe('70%');
    });

    it('updates color when batteryLevel changes across thresholds', async () => {
      const el = await driver.render(html`<battery-indicator .batteryLevel=${15}></battery-indicator>`);

      let fill = driver.finders.fill();
      expect(fill.element?.style.backgroundColor).toContain('var(--battery-critical-color, #f44336)');

      el.batteryLevel = 60;
      await elementUpdated(el);

      fill = driver.finders.fill();
      expect(fill.element?.style.backgroundColor).toContain('var(--battery-good-color, #4caf50)');
    });

    it('updates size class when size property changes', async () => {
      const el = await driver.render(html`<battery-indicator size="small"></battery-indicator>`);

      let container = driver.finders.container();
      expect(container.element?.className).toContain('battery-small');

      el.size = 'large';
      await elementUpdated(el);

      container = driver.finders.container();
      expect(container.element?.className).toContain('battery-large');
      expect(container.element?.className).not.toContain('battery-small');
    });
  });

  describe('accessibility', () => {
    it('provides meaningful structure for screen readers', async () => {
      await driver.render(html`<battery-indicator .batteryLevel=${65}></battery-indicator>`);

      const container = driver.finders.container();
      const percentage = driver.finders.percentage();
      
      expect(container.exists()).toBe(true);
      expect(percentage.text()?.trim()).toBe('65');
    });
  });

  describe('edge cases', () => {
    it('handles fractional battery levels correctly', async () => {
      await driver.render(html`<battery-indicator .batteryLevel=${33.33}></battery-indicator>`);

      const percentage = driver.finders.percentage();
      const fill = driver.finders.fill();
      
      expect(percentage.text()?.trim()).toBe('33'); // Rounded
      expect(fill.element?.style.width).toBe('33.33%'); // Precise
    });

    it('handles very small positive values', async () => {
      await driver.render(html`<battery-indicator .batteryLevel=${0.1}></battery-indicator>`);

      const percentage = driver.finders.percentage();
      const fill = driver.finders.fill();
      
      expect(percentage.text()?.trim()).toBe('0');
      expect(fill.element?.style.width).toBe('0.1%');
    });
  });
});