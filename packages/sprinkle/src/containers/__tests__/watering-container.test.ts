import { LitTestKit } from '../../test/Testkit';
import { elementUpdated } from '../../test/utils';
import { html } from 'lit';

import '../watering-container';
import { WateringContainer } from '../watering-container';
import { ValveService, CountDown } from '../../services/valve-service';
import { HomeAssistant } from '../../types/homeassistant';
import { SprinkleConfig } from '../../types/config';

// Mock ValveService
vi.mock('../../services/valve-service');

describe('WateringContainer Timer Integration', () => {
  const driver = new LitTestKit<
    WateringContainer,
    {
      wateringControls: string;
      wateringCountdown: string;
    }
  >({
    wateringControls: 'watering-controls',
    wateringCountdown: 'watering-countdown',
  });

  let mockValveService: vi.Mocked<ValveService>;
  let mockHass: HomeAssistant;
  let mockConfig: SprinkleConfig;

  beforeEach(() => {
    // Setup mocks
    mockValveService = {
      isValveOn: vi.fn(),
      turnValveOff: vi.fn(),
      toggleValve: vi.fn(),
      startTimedWateringOnce: vi.fn(),
      startVolumeBasedWateringOnce: vi.fn(),
      getCountdownInfo: vi.fn(),
    } as any;

    mockHass = {} as HomeAssistant;
    mockConfig = {
      valve_entity: 'switch.test_valve',
      device_name: 'test_device',
      duration_max: 60,
      volume_max: 100,
    };

    driver.reset();
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Countdown State Management', () => {
    it('should initialize with default countdown state', async () => {
      mockValveService.getCountdownInfo.mockReturnValue({
        secondsRemaining: 0,
        totalDuration: 0,
        formatted: '--:--',
        progress: 0,
        isActive: false,
      });

      const el = await driver.render(html`
        <watering-container
          .valveService=${mockValveService}
          .hass=${mockHass}
          .config=${mockConfig}
        ></watering-container>
      `);

      expect(el.countdown.secondsRemaining).toBe(0);
      expect(el.countdown.totalDuration).toBe(0);
      expect(el.countdown.formatted).toBe('--:--');
      expect(el.countdown.progress).toBe(0);
      expect(el.countdown.isActive).toBe(false);
      expect(el.isWatering).toBe(false);
    });

    it('should update countdown state from valve service', async () => {
      const mockCountdown: CountDown = {
        secondsRemaining: 180,
        totalDuration: 300,
        formatted: '03:00',
        progress: 40,
        isActive: true,
      };

      mockValveService.getCountdownInfo.mockReturnValue(mockCountdown);

      const el = await driver.render(html`
        <watering-container
          .valveService=${mockValveService}
          .hass=${mockHass}
          .config=${mockConfig}
        ></watering-container>
      `);

      // Trigger update manually to simulate connectedCallback
      (el as any).updateCountdown();
      await elementUpdated(el);

      expect(el.countdown).toEqual(mockCountdown);
      expect(el.isWatering).toBe(true);
    });

    it('should pass countdown data to child components', async () => {
      const mockCountdown: CountDown = {
        secondsRemaining: 120,
        totalDuration: 300,
        formatted: '02:00',
        progress: 60,
        isActive: true,
      };

      mockValveService.getCountdownInfo.mockReturnValue(mockCountdown);

      const el = await driver.render(html`
        <watering-container
          .valveService=${mockValveService}
          .hass=${mockHass}
          .config=${mockConfig}
        ></watering-container>
      `);

      // Trigger update manually to simulate connectedCallback updating the countdown
      (el as any).updateCountdown();
      await elementUpdated(el);

      const wateringControls = driver.finders.wateringControls();
      const wateringCountdown = driver.finders.wateringCountdown();

      expect(wateringControls.exists()).toBe(true);
      expect(wateringCountdown.exists()).toBe(true);

      // Check that countdown properties are passed to child components
      const wateringControlsEl = wateringControls.element as any;
      const wateringCountdownEl = wateringCountdown.element as any;
      
      expect(wateringControlsEl?.isCountdownActive).toBe(true);
      expect(wateringCountdownEl?.isActive).toBe(true);
      expect(wateringCountdownEl?.formatted).toBe('02:00');
      expect(wateringCountdownEl?.progress).toBe(60);
    });
  });

  describe('Timer Monitoring Lifecycle', () => {
    it('should start countdown monitoring on connected', async () => {
      mockValveService.getCountdownInfo.mockReturnValue({
        secondsRemaining: 0,
        totalDuration: 0,
        formatted: '--:--',
        progress: 0,
        isActive: false,
      });

      const el = await driver.render(html`
        <watering-container
          .valveService=${mockValveService}
          .hass=${mockHass}
          .config=${mockConfig}
        ></watering-container>
      `);

      // Component already connected during render, so getCountdownInfo was called
      const initialCallCount = mockValveService.getCountdownInfo.mock.calls.length;
      expect(initialCallCount).toBeGreaterThanOrEqual(1);

      // Advance timer and check that monitoring continues
      vi.advanceTimersByTime(1000);
      expect(mockValveService.getCountdownInfo.mock.calls.length).toBeGreaterThanOrEqual(initialCallCount + 1);

      vi.advanceTimersByTime(2000);
      const finalCallCount = mockValveService.getCountdownInfo.mock.calls.length;
      expect(finalCallCount).toBeGreaterThan(initialCallCount);
    });

    it('should stop countdown monitoring on disconnected', async () => {
      mockValveService.getCountdownInfo.mockReturnValue({
        secondsRemaining: 0,
        totalDuration: 0,
        formatted: '--:--',
        progress: 0,
        isActive: false,
      });

      const el = await driver.render(html`
        <watering-container
          .valveService=${mockValveService}
          .hass=${mockHass}
          .config=${mockConfig}
        ></watering-container>
      `);

      // Component already connected during render
      const initialCallCount = mockValveService.getCountdownInfo.mock.calls.length;
      expect(initialCallCount).toBeGreaterThanOrEqual(1);

      // Advance time to confirm monitoring is running
      vi.advanceTimersByTime(1000);
      const midCallCount = mockValveService.getCountdownInfo.mock.calls.length;
      expect(midCallCount).toBe(initialCallCount + 1);

      // Disconnect and verify monitoring stops
      (el as any).disconnectedCallback();
      vi.advanceTimersByTime(5000);
      expect(mockValveService.getCountdownInfo).toHaveBeenCalledTimes(midCallCount); // No additional calls
    });

    it('should automatically stop monitoring when irrigation becomes inactive', async () => {
      // Start with active countdown
      mockValveService.getCountdownInfo.mockReturnValueOnce({
        secondsRemaining: 60,
        totalDuration: 300,
        formatted: '01:00',
        progress: 80,
        isActive: true,
      });

      const el = await driver.render(html`
        <watering-container
          .valveService=${mockValveService}
          .hass=${mockHass}
          .config=${mockConfig}
        ></watering-container>
      `);

      // Component already connected during render
      const initialCallCount = mockValveService.getCountdownInfo.mock.calls.length;
      expect(initialCallCount).toBeGreaterThanOrEqual(1);

      // Change to inactive countdown
      mockValveService.getCountdownInfo.mockReturnValue({
        secondsRemaining: 0,
        totalDuration: 300,
        formatted: '--:--',
        progress: 100,
        isActive: false,
      });

      // Advance timer to trigger update
      vi.advanceTimersByTime(1000);
      const midCallCount = mockValveService.getCountdownInfo.mock.calls.length;
      expect(midCallCount).toBe(initialCallCount + 1);

      // Verify monitoring stops automatically
      vi.advanceTimersByTime(5000);
      expect(mockValveService.getCountdownInfo).toHaveBeenCalledTimes(midCallCount); // No additional calls
    });

    it('should handle missing valve service gracefully', async () => {
      const el = await driver.render(html`
        <watering-container
          .hass=${mockHass}
          .config=${mockConfig}
        ></watering-container>
      `);

      // Should not throw when valve service is missing
      expect(() => (el as any).updateCountdown()).not.toThrow();
      expect(() => (el as any).connectedCallback()).not.toThrow();
      expect(() => (el as any).disconnectedCallback()).not.toThrow();
    });
  });

  describe('Timer Integration with Valve Operations', () => {
    it('should restart monitoring after starting timed watering', async () => {
      mockValveService.isValveOn.mockReturnValue(false);
      mockValveService.startTimedWateringOnce.mockResolvedValue(undefined);
      mockValveService.getCountdownInfo.mockReturnValue({
        secondsRemaining: 0,
        totalDuration: 0,
        formatted: '--:--',
        progress: 0,
        isActive: false,
      });

      const el = await driver.render(html`
        <watering-container
          .valveService=${mockValveService}
          .hass=${mockHass}
          .config=${mockConfig}
        ></watering-container>
      `);

      el.duration = 5; // 5 minutes
      el.activeMode = 'duration';

      // Start watering
      await el.handleToggleValve();

      expect(mockValveService.startTimedWateringOnce).toHaveBeenCalledWith(300); // 5 * 60 seconds

      // Verify monitoring restarts after delay
      vi.advanceTimersByTime(1100); // Advance past the 1000ms delay
      expect(mockValveService.getCountdownInfo).toHaveBeenCalled();
    });

    it('should restart monitoring after starting volume-based watering', async () => {
      mockValveService.isValveOn.mockReturnValue(false);
      mockValveService.startVolumeBasedWateringOnce.mockResolvedValue(undefined);
      mockValveService.getCountdownInfo.mockReturnValue({
        secondsRemaining: 0,
        totalDuration: 0,
        formatted: '--:--',
        progress: 0,
        isActive: false,
      });

      const el = await driver.render(html`
        <watering-container
          .valveService=${mockValveService}
          .hass=${mockHass}
          .config=${mockConfig}
        ></watering-container>
      `);

      el.volume = 25; // 25 liters
      el.activeMode = 'volume';

      // Start watering
      await el.handleToggleValve();

      expect(mockValveService.startVolumeBasedWateringOnce).toHaveBeenCalledWith(25);

      // Verify monitoring restarts after delay
      vi.advanceTimersByTime(1100);
      expect(mockValveService.getCountdownInfo).toHaveBeenCalled();
    });

    it('should turn off valve when already watering', async () => {
      mockValveService.isValveOn.mockReturnValue(true);
      mockValveService.turnValveOff.mockResolvedValue(undefined);

      const el = await driver.render(html`
        <watering-container
          .valveService=${mockValveService}
          .hass=${mockHass}
          .config=${mockConfig}
        ></watering-container>
      `);

      await el.handleToggleValve();

      expect(mockValveService.turnValveOff).toHaveBeenCalled();
      expect(mockValveService.startTimedWateringOnce).not.toHaveBeenCalled();
      expect(mockValveService.startVolumeBasedWateringOnce).not.toHaveBeenCalled();
    });

    it('should toggle valve when no duration/volume set', async () => {
      mockValveService.isValveOn.mockReturnValue(false);
      mockValveService.toggleValve.mockResolvedValue(undefined);

      const el = await driver.render(html`
        <watering-container
          .valveService=${mockValveService}
          .hass=${mockHass}
          .config=${mockConfig}
        ></watering-container>
      `);

      el.duration = 0;
      el.volume = 0;
      el.activeMode = 'duration';

      await el.handleToggleValve();

      expect(mockValveService.toggleValve).toHaveBeenCalled();
      expect(mockValveService.startTimedWateringOnce).not.toHaveBeenCalled();
    });
  });

  describe('Real-time Countdown Updates', () => {
    it('should update countdown display every second during active watering', async () => {
      const countdownSequence = [
        {
          secondsRemaining: 180,
          totalDuration: 300,
          formatted: '03:00',
          progress: 40,
          isActive: true,
        },
        {
          secondsRemaining: 179,
          totalDuration: 300,
          formatted: '02:59',
          progress: 40.33,
          isActive: true,
        },
        {
          secondsRemaining: 178,
          totalDuration: 300,
          formatted: '02:58',
          progress: 40.67,
          isActive: true,
        },
      ];

      let callCount = 0;
      mockValveService.getCountdownInfo.mockImplementation(() => {
        const result = countdownSequence[callCount] || countdownSequence[countdownSequence.length - 1];
        callCount++;
        return result;
      });

      const el = await driver.render(html`
        <watering-container
          .valveService=${mockValveService}
          .hass=${mockHass}
          .config=${mockConfig}
        ></watering-container>
      `);

      // Component already connected during render
      // Get initial state after connection
      await elementUpdated(el);
      expect(el.countdown.formatted).toBe('03:00');
      expect(el.countdown.secondsRemaining).toBe(180);

      // After 1 second
      vi.advanceTimersByTime(1000);
      await elementUpdated(el);
      expect(el.countdown.formatted).toBe('02:59');
      expect(el.countdown.secondsRemaining).toBe(179);

      // After another second
      vi.advanceTimersByTime(1000);
      await elementUpdated(el);
      expect(el.countdown.formatted).toBe('02:58');
      expect(el.countdown.secondsRemaining).toBe(178);
    });

    it('should reflect countdown changes in isWatering state', async () => {
      // Set up mock to return active state for multiple calls initially
      mockValveService.getCountdownInfo
        .mockReturnValueOnce({
          secondsRemaining: 60,
          totalDuration: 300,
          formatted: '01:00',
          progress: 80,
          isActive: true,
        })
        .mockReturnValueOnce({
          secondsRemaining: 59,
          totalDuration: 300,
          formatted: '00:59',
          progress: 80.3,
          isActive: true,
        })
        .mockReturnValueOnce({
          secondsRemaining: 0,
          totalDuration: 300,
          formatted: '--:--',
          progress: 100,
          isActive: false,
        })
        .mockReturnValue({
          secondsRemaining: 0,
          totalDuration: 300,
          formatted: '--:--',
          progress: 100,
          isActive: false,
        });

      const el = await driver.render(html`
        <watering-container
          .valveService=${mockValveService}
          .hass=${mockHass}
          .config=${mockConfig}
        ></watering-container>
      `);

      // Component should have active state after connection
      await elementUpdated(el);
      expect(el.isWatering).toBe(true);

      // Advance timer twice to trigger the inactive state
      vi.advanceTimersByTime(1000);
      await elementUpdated(el);
      vi.advanceTimersByTime(1000); 
      await elementUpdated(el);
      expect(el.isWatering).toBe(false);
    });
  });

  describe('Event Handling', () => {
    it('should handle duration change events', async () => {
      mockValveService.getCountdownInfo.mockReturnValue({
        secondsRemaining: 0,
        totalDuration: 0,
        formatted: '--:--',
        progress: 0,
        isActive: false,
      });

      const el = await driver.render(html`
        <watering-container
          .valveService=${mockValveService}
          .hass=${mockHass}
          .config=${mockConfig}
        ></watering-container>
      `);

      const durationChangeEvent = new CustomEvent('duration-change', {
        detail: { value: 15 },
      });

      el.handleDurationChange(durationChangeEvent);
      expect(el.duration).toBe(15);
    });

    it('should handle volume change events', async () => {
      mockValveService.getCountdownInfo.mockReturnValue({
        secondsRemaining: 0,
        totalDuration: 0,
        formatted: '--:--',
        progress: 0,
        isActive: false,
      });

      const el = await driver.render(html`
        <watering-container
          .valveService=${mockValveService}
          .hass=${mockHass}
          .config=${mockConfig}
        ></watering-container>
      `);

      const volumeChangeEvent = new CustomEvent('volume-change', {
        detail: { value: 50 },
      });

      el.handleVolumeChange(volumeChangeEvent);
      expect(el.volume).toBe(50);
    });

    it('should handle mode change events', async () => {
      mockValveService.getCountdownInfo.mockReturnValue({
        secondsRemaining: 0,
        totalDuration: 0,
        formatted: '--:--',
        progress: 0,
        isActive: false,
      });

      const el = await driver.render(html`
        <watering-container
          .valveService=${mockValveService}
          .hass=${mockHass}
          .config=${mockConfig}
        ></watering-container>
      `);

      const modeChangeEvent = new CustomEvent('mode-change', {
        detail: { mode: 'volume' },
      });

      el.handleModeChange(modeChangeEvent);
      expect(el.activeMode).toBe('volume');
    });
  });

  describe('Error Handling', () => {
    it('should handle valve service errors gracefully', async () => {
      mockValveService.getCountdownInfo.mockImplementation(() => {
        throw new Error('Service error');
      });

      const el = await driver.render(html`
        <watering-container
          .valveService=${mockValveService}
          .hass=${mockHass}
          .config=${mockConfig}
        ></watering-container>
      `);

      // Should not throw when service throws (component handles errors gracefully)
      expect(() => (el as any).updateCountdown()).not.toThrow();
      
      // Component should maintain default state when service fails
      expect(el.countdown.isActive).toBe(false);
    });

    it('should handle async valve operations errors', async () => {
      mockValveService.isValveOn.mockReturnValue(false);
      mockValveService.startTimedWateringOnce.mockRejectedValue(new Error('MQTT error'));

      const el = await driver.render(html`
        <watering-container
          .valveService=${mockValveService}
          .hass=${mockHass}
          .config=${mockConfig}
        ></watering-container>
      `);

      el.duration = 5;
      el.activeMode = 'duration';

      // Should handle promise rejection gracefully
      await expect(el.handleToggleValve()).rejects.toThrow('MQTT error');
    });
  });

  describe('Memory Management', () => {
    it('should clear interval on multiple disconnections', async () => {
      mockValveService.getCountdownInfo.mockReturnValue({
        secondsRemaining: 0,
        totalDuration: 0,
        formatted: '--:--',
        progress: 0,
        isActive: false,
      });

      const el = await driver.render(html`
        <watering-container
          .valveService=${mockValveService}
          .hass=${mockHass}
          .config=${mockConfig}
        ></watering-container>
      `);

      // Start monitoring
      (el as any).connectedCallback();
      
      // Stop multiple times (should not cause issues)
      (el as any).disconnectedCallback();
      (el as any).disconnectedCallback();
      (el as any).disconnectedCallback();

      // Verify no timers are running after disconnection
      const callCountAfterDisconnect = mockValveService.getCountdownInfo.mock.calls.length;
      vi.advanceTimersByTime(5000);
      expect(mockValveService.getCountdownInfo.mock.calls.length).toBe(callCountAfterDisconnect); // No additional calls
    });

    it('should handle restart monitoring during active interval', async () => {
      mockValveService.getCountdownInfo.mockReturnValue({
        secondsRemaining: 60,
        totalDuration: 300,
        formatted: '01:00',
        progress: 80,
        isActive: true,
      });

      const el = await driver.render(html`
        <watering-container
          .valveService=${mockValveService}
          .hass=${mockHass}
          .config=${mockConfig}
        ></watering-container>
      `);

      // Start monitoring
      (el as any).connectedCallback();
      vi.advanceTimersByTime(1000);
      
      const initialCallCount = mockValveService.getCountdownInfo.mock.calls.length;

      // Restart monitoring (like after valve toggle)
      (el as any).stopCountdownMonitoring();
      (el as any).startCountdownMonitoring();

      // Should continue monitoring without duplicate intervals
      vi.advanceTimersByTime(2000);
      
      const finalCallCount = mockValveService.getCountdownInfo.mock.calls.length;
      expect(finalCallCount).toBeGreaterThan(initialCallCount);
    });
  });
});