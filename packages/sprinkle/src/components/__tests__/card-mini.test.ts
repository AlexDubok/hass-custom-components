import { LitTestKit } from '../../test/Testkit';

import { SprinkleCardMini } from '../card-mini';
import { CountDown } from '../../services/valve-service';
import { html } from 'lit';
import '../card-mini';

describe('SprinkleCardMini countdown', () => {
  const driver = new LitTestKit<SprinkleCardMini, {
    countdown: string;
    countdownTime: string;
    progressFill: string;
    stateLabel: string;
  }>({
    countdown: '.mini-countdown',
    countdownTime: '.mini-countdown-time',
    progressFill: '.mini-progress-fill',
    stateLabel: '.button-container > span',
  });

  const activeCountdown: CountDown = {
    secondsRemaining: 45,
    totalDuration: 90,
    formatted: '00:45',
    progress: 50,
    isActive: true,
  };

  const inactiveCountdown: CountDown = {
    secondsRemaining: 0,
    totalDuration: 0,
    formatted: '--:--',
    progress: 0,
    isActive: false,
  };

  beforeEach(() => {
    driver.reset();
  });

  it('renders the valve state label when no countdown is set', async () => {
    await driver.render(
      html`<sprinkle-status-card .valveSwitchState=${'off'}></sprinkle-status-card>`
    );

    expect(driver.finders.stateLabel().text()?.trim()).toBe('off');
    expect(driver.finders.countdown().exists()).toBe(false);
  });

  it('renders the valve state label when the countdown is inactive', async () => {
    await driver.render(
      html`<sprinkle-status-card
        .valveSwitchState=${'off'}
        .countdown=${inactiveCountdown}
      ></sprinkle-status-card>`
    );

    expect(driver.finders.stateLabel().text()?.trim()).toBe('off');
    expect(driver.finders.countdown().exists()).toBe(false);
  });

  it('replaces the state label with a ticking countdown when active', async () => {
    await driver.render(
      html`<sprinkle-status-card
        .valveSwitchState=${'on'}
        .countdown=${activeCountdown}
      ></sprinkle-status-card>`
    );

    expect(driver.finders.countdown().exists()).toBe(true);
    expect(driver.finders.countdownTime().text()).toContain('00:45');
    expect(driver.finders.stateLabel().exists()).toBe(false);
  });

  it('renders the countdown progress bar width from progress', async () => {
    await driver.render(
      html`<sprinkle-status-card
        .valveSwitchState=${'on'}
        .countdown=${activeCountdown}
      ></sprinkle-status-card>`
    );

    const fill = driver.finders.progressFill();
    expect(fill.exists()).toBe(true);
    expect(fill.getAttribute('style')).toContain('width: 50%');
  });
});
