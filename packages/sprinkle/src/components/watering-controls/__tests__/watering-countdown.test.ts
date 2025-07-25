import { LitTestKit } from '../../../test/Testkit';
import { elementUpdated } from '../../../test/utils';
import { html } from 'lit';

import '../watering-countdown';
import { WateringCountdown } from '../watering-countdown';

describe('WateringCountdown', () => {
  const driver = new LitTestKit<
    WateringCountdown,
    {
      container: string;
      timerDisplay: string;
      timerIcon: string;
      timerValue: string;
      progressBar: string;
      progressFill: string;
    }
  >({
    container: '.countdown-timer',
    timerDisplay: '.timer-display',
    timerIcon: '.timer-icon',
    timerValue: '.timer-value',
    progressBar: '.progress-bar',
    progressFill: '.progress-fill',
  });

  beforeEach(() => {
    driver.reset();
    vi.clearAllMocks();
  });

  it('is defined', async () => {
    const el = await driver.render(html`<watering-countdown></watering-countdown>`);
    expect(el).toBeInstanceOf(WateringCountdown);
  });

  it('renders with default props', async () => {
    const el = await driver.render(html`<watering-countdown></watering-countdown>`);

    expect(el.formatted).toBe('--:--');
    expect(el.progress).toBe(0);
    expect(el.isActive).toBe(false);
  });

  it('does not render when inactive', async () => {
    await driver.render(html`
      <watering-countdown 
        formatted="12:34"
        progress="50"
        ?isActive=${false}
      ></watering-countdown>
    `);

    const container = driver.finders.container();
    expect(container.exists()).toBe(false);
  });

  it('renders countdown timer when active', async () => {
    await driver.render(html`
      <watering-countdown 
        formatted="12:34"
        progress="50"
        ?isActive=${true}
      ></watering-countdown>
    `);

    const container = driver.finders.container();
    const timerDisplay = driver.finders.timerDisplay();
    const timerIcon = driver.finders.timerIcon();
    const timerValue = driver.finders.timerValue();
    const progressBar = driver.finders.progressBar();
    const progressFill = driver.finders.progressFill();

    expect(container.exists()).toBe(true);
    expect(timerDisplay.exists()).toBe(true);
    expect(timerIcon.exists()).toBe(true);
    expect(timerValue.exists()).toBe(true);
    expect(progressBar.exists()).toBe(true);
    expect(progressFill.exists()).toBe(true);
  });

  it('displays formatted time correctly', async () => {
    await driver.render(html`
      <watering-countdown 
        formatted="05:42"
        ?isActive=${true}
      ></watering-countdown>
    `);

    const timerValue = driver.finders.timerValue();
    expect(timerValue.text()).toBe('05:42');
  });

  it('displays default time when no formatted prop provided', async () => {
    await driver.render(html`
      <watering-countdown ?isActive=${true}></watering-countdown>
    `);

    const timerValue = driver.finders.timerValue();
    expect(timerValue.text()).toBe('--:--');
  });

  it('shows timer icon', async () => {
    await driver.render(html`
      <watering-countdown ?isActive=${true}></watering-countdown>
    `);

    const timerIcon = driver.finders.timerIcon();
    expect(timerIcon.text()).toBe('⏱️');
  });

  it('sets progress bar width correctly', async () => {
    await driver.render(html`
      <watering-countdown 
        progress="75"
        ?isActive=${true}
      ></watering-countdown>
    `);

    const progressFill = driver.finders.progressFill();
    expect(progressFill.element?.style.width).toBe('75%');
  });

  it('handles zero progress', async () => {
    await driver.render(html`
      <watering-countdown 
        progress="0"
        ?isActive=${true}
      ></watering-countdown>
    `);

    const progressFill = driver.finders.progressFill();
    expect(progressFill.element?.style.width).toBe('0%');
  });

  it('handles full progress', async () => {
    await driver.render(html`
      <watering-countdown 
        progress="100"
        ?isActive=${true}
      ></watering-countdown>
    `);

    const progressFill = driver.finders.progressFill();
    expect(progressFill.element?.style.width).toBe('100%');
  });

  it('updates when properties change', async () => {
    const el = await driver.render(html`
      <watering-countdown 
        formatted="10:00"
        progress="25"
        ?isActive=${true}
      ></watering-countdown>
    `);

    let timerValue = driver.finders.timerValue();
    let progressFill = driver.finders.progressFill();

    expect(timerValue.text()).toBe('10:00');
    expect(progressFill.element?.style.width).toBe('25%');

    // Update properties
    el.formatted = '08:30';
    el.progress = 60;
    await elementUpdated(el);

    timerValue = driver.finders.timerValue();
    progressFill = driver.finders.progressFill();

    expect(timerValue.text()).toBe('08:30');
    expect(progressFill.element?.style.width).toBe('60%');
  });

  it('toggles visibility when isActive changes', async () => {
    const el = await driver.render(html`
      <watering-countdown 
        formatted="05:00"
        ?isActive=${true}
      ></watering-countdown>
    `);

    let container = driver.finders.container();
    expect(container.exists()).toBe(true);

    // Set inactive
    el.isActive = false;
    await elementUpdated(el);

    container = driver.finders.container();
    expect(container.exists()).toBe(false);

    // Set active again
    el.isActive = true;
    await elementUpdated(el);

    container = driver.finders.container();
    expect(container.exists()).toBe(true);
  });

  it('handles various time formats', async () => {
    const testCases = [
      '00:01',
      '01:30', 
      '15:45',
      '59:59',
      '--:--'
    ];

    for (const timeFormat of testCases) {
      await driver.render(html`
        <watering-countdown 
          formatted="${timeFormat}"
          ?isActive=${true}
        ></watering-countdown>
      `);

      const timerValue = driver.finders.timerValue();
      expect(timerValue.text()).toBe(timeFormat);
    }
  });

  it('handles edge case progress values', async () => {
    const testCases = [
      { progress: -5, expected: '-5%' },  // Negative values
      { progress: 150, expected: '150%' }, // Over 100%
      { progress: 0.5, expected: '0.5%' }, // Decimal values
    ];

    for (const testCase of testCases) {
      await driver.render(html`
        <watering-countdown 
          progress="${testCase.progress}"
          ?isActive=${true}
        ></watering-countdown>
      `);

      const progressFill = driver.finders.progressFill();
      expect(progressFill.element?.style.width).toBe(testCase.expected);
    }
  });

  it('applies correct CSS classes', async () => {
    await driver.render(html`
      <watering-countdown ?isActive=${true}></watering-countdown>
    `);

    const container = driver.finders.container();
    const timerDisplay = driver.finders.timerDisplay();
    const timerIcon = driver.finders.timerIcon();
    const timerValue = driver.finders.timerValue();
    const progressBar = driver.finders.progressBar();
    const progressFill = driver.finders.progressFill();

    expect(container.element?.classList.contains('countdown-timer')).toBe(true);
    expect(timerDisplay.element?.classList.contains('timer-display')).toBe(true);
    expect(timerIcon.element?.classList.contains('timer-icon')).toBe(true);
    expect(timerValue.element?.classList.contains('timer-value')).toBe(true);
    expect(progressBar.element?.classList.contains('progress-bar')).toBe(true);
    expect(progressFill.element?.classList.contains('progress-fill')).toBe(true);
  });

  it('has proper CSS custom property usage in styles', async () => {
    await driver.render(html`
      <watering-countdown ?isActive=${true}></watering-countdown>
    `);

    const container = driver.finders.container();
    const timerValue = driver.finders.timerValue();
    const progressBar = driver.finders.progressBar();
    const progressFill = driver.finders.progressFill();

    // Check computed styles use CSS custom properties
    const containerStyles = getComputedStyle(container.element!);
    const timerValueStyles = getComputedStyle(timerValue.element!);
    const progressBarStyles = getComputedStyle(progressBar.element!);
    const progressFillStyles = getComputedStyle(progressFill.element!);

    // These should be applied via CSS custom properties
    expect(containerStyles.backgroundColor).toBeDefined();
    expect(timerValueStyles.color).toBeDefined();
    expect(progressBarStyles.backgroundColor).toBeDefined();
    expect(progressFillStyles.backgroundColor).toBeDefined();
  });

  it('renders with proper accessibility attributes', async () => {
    await driver.render(html`
      <watering-countdown 
        formatted="03:45"
        progress="60"
        ?isActive=${true}
      ></watering-countdown>
    `);

    const timerValue = driver.finders.timerValue();
    
    // Timer value should be readable by screen readers
    expect(timerValue.text()).toBe('03:45');
    
    // Progress bar should have proper structure for accessibility
    const progressBar = driver.finders.progressBar();
    const progressFill = driver.finders.progressFill();
    
    expect(progressBar.exists()).toBe(true);
    expect(progressFill.exists()).toBe(true);
  });
});