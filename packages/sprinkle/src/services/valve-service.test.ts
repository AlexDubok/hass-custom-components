/* eslint-disable @typescript-eslint/no-explicit-any */
import { ValveService } from './valve-service';
import { Mocked } from 'vitest';
import { HomeAssistantService } from './ha-service';
import { SprinkleConfig } from '../types/config';
import { HomeAssistant } from '../types/homeassistant';
import { HassEntityAttributeBase, Context, HassEntity } from 'home-assistant-js-websocket';

vi.mock('./ha-service');

const mockEntity = (state: string): HassEntity => ({
  entity_id: 'switch.mock_valve',
  state,
  last_changed: new Date().toISOString(),
  last_updated: new Date().toISOString(),
  attributes: {} as HassEntityAttributeBase,
  context: {} as Context,
});

describe('ValveService', () => {
  let valveService: ValveService;
  let mockHaService: Mocked<HomeAssistantService>;
  const mockConfig: SprinkleConfig = {
    valve_entity: 'switch.mock_valve',
    device_name: 'mock_device',
  };

  beforeEach(() => {
    mockHaService = new HomeAssistantService(
      {} as HomeAssistant,
    ) as Mocked<HomeAssistantService>;
    valveService = new ValveService(mockHaService, mockConfig);
  });

  describe('isValveOn', () => {
    it('should return true if the valve state is "on"', () => {
      mockHaService.getEntityState.mockReturnValue(mockEntity('on'));
      expect(valveService.isValveOn()).toBe(true);
    });

    it('should return false if the valve state is not "on"', () => {
      mockHaService.getEntityState.mockReturnValue(mockEntity('off'));
      expect(valveService.isValveOn()).toBe(false);
    });

    it('should return false if the valve state is undefined', () => {
      // @ts-expect-error mocking undefined state
      mockHaService.getEntityState.mockReturnValue(undefined);
      expect(valveService.isValveOn()).toBe(false);
    });
  });

  describe('toggleValve', () => {
    it('should call the toggle service on the valve entity', async () => {
      await valveService.toggleValve();
      expect(mockHaService.callService).toHaveBeenCalledWith(
        'switch',
        'toggle',
        {
          entity_id: 'switch.mock_valve',
        },
      );
    });
  });

  describe('turnValveOn', () => {
    it('should call the turn_on service on the valve entity', async () => {
      await valveService.turnValveOn();
      expect(mockHaService.callService).toHaveBeenCalledWith(
        'switch',
        'turn_on',
        {
          entity_id: 'switch.mock_valve',
        },
      );
    });
  });

  describe('turnValveOff', () => {
    it('should call the turn_off service on the valve entity', async () => {
      await valveService.turnValveOff();
      expect(mockHaService.callService).toHaveBeenCalledWith(
        'switch',
        'turn_off',
        {
          entity_id: 'switch.mock_valve',
        },
      );
    });
  });

  describe('startTimedWateringOnce', () => {
    it('should call startTimedWatering with correct parameters', async () => {
      const spy = jest.spyOn(valveService as any, 'startTimedWatering');
      await valveService.startTimedWateringOnce(3600);
      expect(spy).toHaveBeenCalledWith({
        durationSeconds: 3600,
        currentCount: 0,
        totalNumber: 1,
      });
    });
  });

  describe('startVolumeBasedWateringOnce', () => {
    it('should call startVolumeBasedWatering with correct parameters', async () => {
      const spy = jest.spyOn(valveService as any, 'startVolumeBasedWatering');
      await valveService.startVolumeBasedWateringOnce(100);
      expect(spy).toHaveBeenCalledWith({
        volumeLiters: 100,
        currentCount: 0,
        totalNumber: 1,
      });
    });
  });

  describe('startTimedWatering', () => {
    it('should publish the correct MQTT payload for timed irrigation', async () => {
      await (valveService as any).startTimedWatering({
        durationSeconds: 3600,
        currentCount: 1,
        totalNumber: 3,
        irrigationInterval: 600,
      });
      expect(mockHaService.callService).toHaveBeenCalledWith(
        'mqtt',
        'publish',
        {
          topic: 'zigbee2mqtt/mock_device/set',
          payload: JSON.stringify({
            cyclic_timed_irrigation: {
              current_count: 1,
              total_number: 3,
              irrigation_duration: 3600,
              irrigation_interval: 600,
            },
          }),
        },
      );
    });
  });

  describe('startVolumeBasedWatering', () => {
    it('should publish the correct MQTT payload for volume-based irrigation', async () => {
      await valveService.startVolumeBasedWatering({
        volumeLiters: 500,
        currentCount: 2,
        totalNumber: 4,
        irrigationInterval: 1200,
      });
      expect(mockHaService.callService).toHaveBeenCalledWith(
        'mqtt',
        'publish',
        {
          topic: 'zigbee2mqtt/mock_device/set',
          payload: JSON.stringify({
            cyclic_quantitative_irrigation: {
              current_count: 2,
              total_number: 4,
              irrigation_capacity: 500,
              irrigation_interval: 1200,
            },
          }),
        },
      );
    });
  });

  describe('getCurrentCycleTimeRemaining', () => {
    const mockTimedIrrigationEntity = (state: string, lastChanged?: string): HassEntity => ({
      entity_id: 'sensor.mock_timed_irrigation',
      state,
      last_changed: lastChanged || new Date().toISOString(),
      last_updated: new Date().toISOString(),
      attributes: {} as HassEntityAttributeBase,
      context: {} as Context,
    });

    beforeEach(() => {
      const config: SprinkleConfig = {
        valve_entity: 'switch.mock_valve',
        device_name: 'mock_device',
        timed_irrigation_entity: 'sensor.mock_timed_irrigation',
      };
      valveService = new ValveService(mockHaService, config);
    });

    it('should return 0 when valve is off', () => {
      mockHaService.getEntityState.mockImplementation((entity) => {
        if (entity === 'switch.mock_valve') return mockEntity('off');
        if (entity === 'sensor.mock_timed_irrigation') {
          return mockTimedIrrigationEntity("{'current_count': 1, 'total_number': 1, 'irrigation_duration': 300, 'irrigation_interval': 0}");
        }
        return null as any;
      });

      expect(valveService.getCurrentCycleTimeRemaining()).toBe(0);
    });

    it('should return 0 when current_count is 0', () => {
      mockHaService.getEntityState.mockImplementation((entity) => {
        if (entity === 'switch.mock_valve') return mockEntity('on');
        if (entity === 'sensor.mock_timed_irrigation') {
          return mockTimedIrrigationEntity("{'current_count': 0, 'total_number': 1, 'irrigation_duration': 300, 'irrigation_interval': 0}");
        }
        return null as any;
      });

      expect(valveService.getCurrentCycleTimeRemaining()).toBe(0);
    });

    it('should return 0 when total_number is 0', () => {
      mockHaService.getEntityState.mockImplementation((entity) => {
        if (entity === 'switch.mock_valve') return mockEntity('on');
        if (entity === 'sensor.mock_timed_irrigation') {
          return mockTimedIrrigationEntity("{'current_count': 1, 'total_number': 0, 'irrigation_duration': 300, 'irrigation_interval': 0}");
        }
        return null as any;
      });

      expect(valveService.getCurrentCycleTimeRemaining()).toBe(0);
    });

    it('should return 0 when irrigation_duration is 0', () => {
      mockHaService.getEntityState.mockImplementation((entity) => {
        if (entity === 'switch.mock_valve') return mockEntity('on');
        if (entity === 'sensor.mock_timed_irrigation') {
          return mockTimedIrrigationEntity("{'current_count': 1, 'total_number': 1, 'irrigation_duration': 0, 'irrigation_interval': 0}");
        }
        return null as any;
      });

      expect(valveService.getCurrentCycleTimeRemaining()).toBe(0);
    });

    it('should return full duration when valve just turned on', () => {
      const now = new Date();
      const valveLastChanged = new Date(now.getTime() - 1000).toISOString(); // 1 second ago

      mockHaService.getEntityState.mockImplementation((entity) => {
        if (entity === 'switch.mock_valve') return {
          ...mockEntity('on'),
          last_changed: valveLastChanged
        };
        if (entity === 'sensor.mock_timed_irrigation') {
          return mockTimedIrrigationEntity("{'current_count': 1, 'total_number': 1, 'irrigation_duration': 300, 'irrigation_interval': 0}");
        }
        return null as any;
      });

      const remaining = valveService.getCurrentCycleTimeRemaining();
      expect(remaining).toBeGreaterThan(295); // Should be close to 300 seconds minus ~1 second elapsed
      expect(remaining).toBeLessThanOrEqual(300);
    });

    it('should calculate remaining time correctly based on elapsed time', () => {
      const now = new Date();
      const valveLastChanged = new Date(now.getTime() - 60000).toISOString(); // 60 seconds ago

      mockHaService.getEntityState.mockImplementation((entity) => {
        if (entity === 'switch.mock_valve') return {
          ...mockEntity('on'),
          last_changed: valveLastChanged
        };
        if (entity === 'sensor.mock_timed_irrigation') {
          return mockTimedIrrigationEntity("{'current_count': 1, 'total_number': 1, 'irrigation_duration': 300, 'irrigation_interval': 0}");
        }
        return null as any;
      });

      const remaining = valveService.getCurrentCycleTimeRemaining();
      expect(remaining).toBeGreaterThan(235); // Should be close to 240 seconds (300 - 60)
      expect(remaining).toBeLessThanOrEqual(240);
    });

    it('should return 0 when irrigation time has elapsed', () => {
      const now = new Date();
      const valveLastChanged = new Date(now.getTime() - 400000).toISOString(); // 400 seconds ago (more than 300)

      mockHaService.getEntityState.mockImplementation((entity) => {
        if (entity === 'switch.mock_valve') return {
          ...mockEntity('on'),
          last_changed: valveLastChanged
        };
        if (entity === 'sensor.mock_timed_irrigation') {
          return mockTimedIrrigationEntity("{'current_count': 1, 'total_number': 1, 'irrigation_duration': 300, 'irrigation_interval': 0}");
        }
        return null as any;
      });

      expect(valveService.getCurrentCycleTimeRemaining()).toBe(0);
    });

    it('should handle multiple cycles correctly', () => {
      const now = new Date();
      const valveLastChanged = new Date(now.getTime() - 150000).toISOString(); // 150 seconds ago

      mockHaService.getEntityState.mockImplementation((entity) => {
        if (entity === 'switch.mock_valve') return {
          ...mockEntity('on'),
          last_changed: valveLastChanged
        };
        if (entity === 'sensor.mock_timed_irrigation') {
          return mockTimedIrrigationEntity("{'current_count': 1, 'total_number': 3, 'irrigation_duration': 120, 'irrigation_interval': 0}");
        }
        return null as any;
      });

      const remaining = valveService.getCurrentCycleTimeRemaining();
      // 150 seconds elapsed, cycle duration 120 seconds
      // elapsed in current cycle = 150 % 120 = 30 seconds
      // remaining = 120 - 30 = 90 seconds
      expect(remaining).toBeGreaterThan(85);
      expect(remaining).toBeLessThanOrEqual(90);
    });

    it('should return full duration when no last_changed timestamp', () => {
      mockHaService.getEntityState.mockImplementation((entity) => {
        if (entity === 'switch.mock_valve') return {
          ...mockEntity('on'),
          last_changed: ''
        };
        if (entity === 'sensor.mock_timed_irrigation') {
          return mockTimedIrrigationEntity("{'current_count': 1, 'total_number': 1, 'irrigation_duration': 300, 'irrigation_interval': 0}");
        }
        return null as any;
      });

      expect(valveService.getCurrentCycleTimeRemaining()).toBe(300);
    });

    it('should handle invalid irrigation state gracefully', () => {
      mockHaService.getEntityState.mockImplementation((entity) => {
        if (entity === 'switch.mock_valve') return mockEntity('on');
        if (entity === 'sensor.mock_timed_irrigation') {
          return mockTimedIrrigationEntity("invalid_json");
        }
        return null as any;
      });

      expect(valveService.getCurrentCycleTimeRemaining()).toBe(0);
    });

    it('should handle missing timed irrigation entity', () => {
      const config: SprinkleConfig = {
        valve_entity: 'switch.mock_valve',
        device_name: 'mock_device',
        // No timed_irrigation_entity configured
      };
      valveService = new ValveService(mockHaService, config);

      mockHaService.getEntityState.mockImplementation((entity) => {
        if (entity === 'switch.mock_valve') return mockEntity('on');
        return null as any;
      });

      expect(valveService.getCurrentCycleTimeRemaining()).toBe(0);
    });
  });

  describe('getCountdownInfo', () => {
    const mockTimedIrrigationEntity = (state: string, lastChanged?: string): HassEntity => ({
      entity_id: 'sensor.mock_timed_irrigation',
      state,
      last_changed: lastChanged || new Date().toISOString(),
      last_updated: new Date().toISOString(),
      attributes: {} as HassEntityAttributeBase,
      context: {} as Context,
    });

    beforeEach(() => {
      const config: SprinkleConfig = {
        valve_entity: 'switch.mock_valve',
        device_name: 'mock_device',
        timed_irrigation_entity: 'sensor.mock_timed_irrigation',
      };
      valveService = new ValveService(mockHaService, config);
    });

    it('should return inactive countdown when valve is off', () => {
      mockHaService.getEntityState.mockImplementation((entity) => {
        if (entity === 'switch.mock_valve') return mockEntity('off');
        if (entity === 'sensor.mock_timed_irrigation') {
          return mockTimedIrrigationEntity("{'current_count': 0, 'total_number': 1, 'irrigation_duration': 300, 'irrigation_interval': 0}");
        }
        return null as any;
      });

      const countdown = valveService.getCountdownInfo();
      expect(countdown.isActive).toBe(false);
      expect(countdown.secondsRemaining).toBe(0);
      expect(countdown.formatted).toBe('--:--');
      expect(countdown.progress).toBe(0);
    });

    it('should return active countdown with correct formatting', () => {
      const now = new Date();
      const valveLastChanged = new Date(now.getTime() - 60000).toISOString(); // 60 seconds ago

      mockHaService.getEntityState.mockImplementation((entity) => {
        if (entity === 'switch.mock_valve') return {
          ...mockEntity('on'),
          last_changed: valveLastChanged
        };
        if (entity === 'sensor.mock_timed_irrigation') {
          return mockTimedIrrigationEntity("{'current_count': 1, 'total_number': 1, 'irrigation_duration': 300, 'irrigation_interval': 0}");
        }
        return null as any;
      });

      const countdown = valveService.getCountdownInfo();
      expect(countdown.isActive).toBe(true);
      expect(countdown.secondsRemaining).toBeGreaterThan(235);
      expect(countdown.secondsRemaining).toBeLessThanOrEqual(240);
      expect(countdown.totalDuration).toBe(300);
      expect(countdown.formatted).toMatch(/^0[3-4]:[0-5][0-9]$/); // Should be around 04:00 or 03:5x
      expect(countdown.progress).toBeGreaterThan(15); // Should be around 20% progress
      expect(countdown.progress).toBeLessThanOrEqual(25);
    });

    it('should format time correctly for various durations', () => {
      const testCases = [
        { seconds: 0, expected: '--:--' },
        { seconds: 59, expected: '00:59' },
        { seconds: 60, expected: '01:00' },
        { seconds: 125, expected: '02:05' },
        { seconds: 3600, expected: '60:00' }, // 1 hour shown as 60 minutes
      ];

      testCases.forEach(({ seconds, expected }) => {
        // Mock to return exact seconds remaining
        const now = new Date();
        const duration = seconds > 300 ? seconds : 300;
        const valveLastChanged = new Date(now.getTime() - (duration - seconds) * 1000).toISOString();

        mockHaService.getEntityState.mockImplementation((entity) => {
          if (entity === 'switch.mock_valve') return {
            ...mockEntity('on'),
            last_changed: valveLastChanged
          };
          if (entity === 'sensor.mock_timed_irrigation') {
            // Use the expected seconds as the duration for test cases that require it
            const duration = seconds > 300 ? seconds : 300;
            return mockTimedIrrigationEntity(`{'current_count': 1, 'total_number': 1, 'irrigation_duration': ${duration}, 'irrigation_interval': 0}`);
          }
          return null as any;
        });

        const countdown = valveService.getCountdownInfo();
        if (seconds === 0) {
          expect(countdown.formatted).toBe(expected);
        } else {
          // Allow for small timing variations in test execution
          const actualSeconds = countdown.secondsRemaining;
          expect(Math.abs(actualSeconds - seconds)).toBeLessThan(5);
        }
      });
    });

    it('should calculate progress correctly', () => {
      const now = new Date();
      const valveLastChanged = new Date(now.getTime() - 150000).toISOString(); // 150 seconds ago (50% of 300)

      mockHaService.getEntityState.mockImplementation((entity) => {
        if (entity === 'switch.mock_valve') return {
          ...mockEntity('on'),
          last_changed: valveLastChanged
        };
        if (entity === 'sensor.mock_timed_irrigation') {
          return mockTimedIrrigationEntity("{'current_count': 1, 'total_number': 1, 'irrigation_duration': 300, 'irrigation_interval': 0}");
        }
        return null as any;
      });

      const countdown = valveService.getCountdownInfo();
      expect(countdown.progress).toBeGreaterThan(45); // Should be around 50%
      expect(countdown.progress).toBeLessThanOrEqual(55);
    });

    it('should handle edge cases for progress calculation', () => {
      // Test 0% progress (just started)
      const now = new Date();
      const valveLastChanged = new Date(now.getTime() - 1000).toISOString(); // 1 second ago

      mockHaService.getEntityState.mockImplementation((entity) => {
        if (entity === 'switch.mock_valve') return {
          ...mockEntity('on'),
          last_changed: valveLastChanged
        };
        if (entity === 'sensor.mock_timed_irrigation') {
          return mockTimedIrrigationEntity("{'current_count': 1, 'total_number': 1, 'irrigation_duration': 300, 'irrigation_interval': 0}");
        }
        return null as any;
      });

      const countdown = valveService.getCountdownInfo();
      expect(countdown.progress).toBeGreaterThanOrEqual(0);
      expect(countdown.progress).toBeLessThan(5);
    });

    it('should handle zero duration gracefully', () => {
      mockHaService.getEntityState.mockImplementation((entity) => {
        if (entity === 'switch.mock_valve') return mockEntity('on');
        if (entity === 'sensor.mock_timed_irrigation') {
          return mockTimedIrrigationEntity("{'current_count': 1, 'total_number': 1, 'irrigation_duration': 0, 'irrigation_interval': 0}");
        }
        return null as any;
      });

      const countdown = valveService.getCountdownInfo();
      expect(countdown.isActive).toBe(false);
      expect(countdown.progress).toBe(0);
      expect(countdown.totalDuration).toBe(0);
    });

    it('should handle invalid state gracefully', () => {
      mockHaService.getEntityState.mockImplementation((entity) => {
        if (entity === 'switch.mock_valve') return mockEntity('on');
        if (entity === 'sensor.mock_timed_irrigation') {
          return mockTimedIrrigationEntity("invalid_json");
        }
        return null as any;
      });

      const countdown = valveService.getCountdownInfo();
      expect(countdown.isActive).toBe(false);
      expect(countdown.secondsRemaining).toBe(0);
      expect(countdown.formatted).toBe('--:--');
      expect(countdown.progress).toBe(0);
      expect(countdown.totalDuration).toBeNaN();
    });
  });

  describe('formatTime', () => {
    it('should format time correctly', () => {
      // Access private method via any cast for testing
      const formatTime = (valveService as any).formatTime.bind(valveService);

      expect(formatTime(0)).toBe('--:--');
      expect(formatTime(30)).toBe('00:30');
      expect(formatTime(60)).toBe('01:00');
      expect(formatTime(90)).toBe('01:30');
      expect(formatTime(3600)).toBe('60:00');
      expect(formatTime(3661)).toBe('61:01');
    });

    it('should pad single digits with zeros', () => {
      const formatTime = (valveService as any).formatTime.bind(valveService);

      expect(formatTime(5)).toBe('00:05');
      expect(formatTime(65)).toBe('01:05');
      expect(formatTime(305)).toBe('05:05');
    });

    it('should handle edge cases', () => {
      const formatTime = (valveService as any).formatTime.bind(valveService);

      expect(formatTime(-1)).toBe('--:--'); // Negative numbers should return default
      expect(formatTime(359)).toBe('05:59'); // Just under 6 minutes
      expect(formatTime(3599)).toBe('59:59'); // Just under 60 minutes
    });
  });

  describe('timer entity integration', () => {
    const timerConfig: SprinkleConfig = {
      valve_entity: 'switch.mock_valve',
      device_name: 'mock_device',
      timer_entity: 'timer.mock_watering',
    };

    const mockTimerEntity = (
      state: string,
      attributes: Record<string, unknown> = {}
    ): HassEntity => ({
      entity_id: 'timer.mock_watering',
      state,
      last_changed: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      attributes: attributes as HassEntityAttributeBase,
      context: {} as Context,
    });

    const mockStates = (valveState: string, timerEntity?: HassEntity) => {
      mockHaService.getEntityState.mockImplementation((entity) => {
        if (entity === 'switch.mock_valve') return mockEntity(valveState);
        if (entity === 'timer.mock_watering') {
          return (timerEntity ?? {}) as HassEntity; // {} mirrors getEntityState for a missing entity
        }
        return {} as HassEntity;
      });
    };

    beforeEach(() => {
      valveService = new ValveService(mockHaService, timerConfig);
      mockHaService.callService.mockResolvedValue({} as any);
    });

    describe('startTimedWateringOnce', () => {
      it('starts the HA timer with the watering duration', async () => {
        mockStates('off');
        await valveService.startTimedWateringOnce(90);
        expect(mockHaService.callService).toHaveBeenCalledWith(
          'timer',
          'start',
          {
            entity_id: 'timer.mock_watering',
            duration: 90,
          }
        );
      });

      it('does not call timer.start when timer_entity is not configured', async () => {
        valveService = new ValveService(mockHaService, mockConfig);
        await valveService.startTimedWateringOnce(90);
        const timerCalls = mockHaService.callService.mock.calls.filter(
          ([domain]) => domain === 'timer'
        );
        expect(timerCalls).toHaveLength(0);
      });

      it('still starts watering when timer.start fails', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        mockHaService.callService.mockImplementation((domain) =>
          domain === 'timer'
            ? Promise.reject(new Error('timer unavailable'))
            : Promise.resolve({} as any)
        );

        await expect(valveService.startTimedWateringOnce(90)).resolves.toBeDefined();
        expect(mockHaService.callService).toHaveBeenCalledWith(
          'mqtt',
          'publish',
          expect.anything()
        );
        // let the fire-and-forget rejection settle
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(warnSpy).toHaveBeenCalled();
        warnSpy.mockRestore();
      });
    });

    describe('turnValveOff', () => {
      it('cancels the timer after turning the valve off', async () => {
        await valveService.turnValveOff();
        expect(mockHaService.callService).toHaveBeenCalledWith(
          'timer',
          'cancel',
          {
            entity_id: 'timer.mock_watering',
          }
        );
      });

      it('does not call timer.cancel when timer_entity is not configured', async () => {
        valveService = new ValveService(mockHaService, mockConfig);
        await valveService.turnValveOff();
        const timerCalls = mockHaService.callService.mock.calls.filter(
          ([domain]) => domain === 'timer'
        );
        expect(timerCalls).toHaveLength(0);
      });
    });

    describe('toggleValve', () => {
      it('cancels the timer when toggling an open valve', async () => {
        mockStates('on');
        await valveService.toggleValve();
        expect(mockHaService.callService).toHaveBeenCalledWith(
          'timer',
          'cancel',
          {
            entity_id: 'timer.mock_watering',
          }
        );
      });

      it('does not cancel the timer when toggling a closed valve', async () => {
        mockStates('off');
        await valveService.toggleValve();
        const timerCalls = mockHaService.callService.mock.calls.filter(
          ([domain]) => domain === 'timer'
        );
        expect(timerCalls).toHaveLength(0);
      });
    });

    describe('getTimerCountdown', () => {
      const activeAttributes = (secondsFromNow: number, duration = '0:01:30') => ({
        finishes_at: new Date(Date.now() + secondsFromNow * 1000).toISOString(),
        duration,
      });

      it('returns an active countdown computed from finishes_at', () => {
        mockStates('on', mockTimerEntity('active', activeAttributes(45)));

        const countdown = valveService.getTimerCountdown();
        expect(countdown).not.toBeNull();
        expect(countdown!.isActive).toBe(true);
        expect(countdown!.secondsRemaining).toBeGreaterThanOrEqual(44);
        expect(countdown!.secondsRemaining).toBeLessThanOrEqual(46);
        expect(countdown!.totalDuration).toBe(90);
        expect(countdown!.progress).toBeGreaterThan(45);
        expect(countdown!.progress).toBeLessThan(55);
        expect(countdown!.formatted).toMatch(/^00:4[4-6]$/);
      });

      it('returns null when timer_entity is not configured', () => {
        valveService = new ValveService(mockHaService, mockConfig);
        mockHaService.getEntityState.mockReturnValue(mockEntity('on'));
        expect(valveService.getTimerCountdown()).toBeNull();
      });

      it('returns null when the timer entity is missing', () => {
        mockStates('on', undefined);
        expect(valveService.getTimerCountdown()).toBeNull();
      });

      it.each(['idle', 'paused', 'unavailable'])(
        'returns null when the timer state is %s',
        (state) => {
          mockStates('on', mockTimerEntity(state, activeAttributes(45)));
          expect(valveService.getTimerCountdown()).toBeNull();
        }
      );

      it('returns null when the valve is off even if the timer is active', () => {
        mockStates('off', mockTimerEntity('active', activeAttributes(45)));
        expect(valveService.getTimerCountdown()).toBeNull();
      });

      it('returns null when finishes_at is missing (paused/idle shape)', () => {
        mockStates('on', mockTimerEntity('active', { duration: '0:01:30' }));
        expect(valveService.getTimerCountdown()).toBeNull();
      });

      it('returns null when finishes_at is in the past', () => {
        mockStates('on', mockTimerEntity('active', activeAttributes(-5)));
        expect(valveService.getTimerCountdown()).toBeNull();
      });

      it('returns null when finishes_at is malformed', () => {
        mockStates(
          'on',
          mockTimerEntity('active', { finishes_at: 'not-a-date', duration: '0:01:30' })
        );
        expect(valveService.getTimerCountdown()).toBeNull();
      });

      it('stays active with progress 0 when duration is malformed', () => {
        mockStates(
          'on',
          mockTimerEntity('active', {
            finishes_at: new Date(Date.now() + 45000).toISOString(),
            duration: 'garbage',
          })
        );

        const countdown = valveService.getTimerCountdown();
        expect(countdown).not.toBeNull();
        expect(countdown!.isActive).toBe(true);
        expect(countdown!.totalDuration).toBe(0);
        expect(countdown!.progress).toBe(0);
      });
    });

    describe('getCountdownInfo with timer entity', () => {
      it('prefers the timer countdown when the timer is active', () => {
        mockStates(
          'on',
          mockTimerEntity('active', {
            finishes_at: new Date(Date.now() + 45000).toISOString(),
            duration: '0:01:30',
          })
        );

        const countdown = valveService.getCountdownInfo();
        expect(countdown.isActive).toBe(true);
        expect(countdown.totalDuration).toBe(90);
      });

      it('falls back to the legacy computed countdown when the timer is idle', () => {
        // externally-started timed run: z2m reports a cycle, HA timer knows nothing
        valveService = new ValveService(mockHaService, {
          ...timerConfig,
          timed_irrigation_entity: 'sensor.mock_timed_irrigation',
        });

        const valveLastChanged = new Date(Date.now() - 60000).toISOString();
        mockHaService.getEntityState.mockImplementation((entity) => {
          if (entity === 'switch.mock_valve') {
            return { ...mockEntity('on'), last_changed: valveLastChanged };
          }
          if (entity === 'timer.mock_watering') return mockTimerEntity('idle');
          if (entity === 'sensor.mock_timed_irrigation') {
            return {
              ...mockEntity('on'),
              entity_id: 'sensor.mock_timed_irrigation',
              state:
                "{'current_count': 1, 'total_number': 1, 'irrigation_duration': 300, 'irrigation_interval': 0}",
            };
          }
          return {} as HassEntity;
        });

        const countdown = valveService.getCountdownInfo();
        expect(countdown.isActive).toBe(true);
        expect(countdown.totalDuration).toBe(300);
        expect(countdown.secondsRemaining).toBeGreaterThan(235);
        expect(countdown.secondsRemaining).toBeLessThanOrEqual(240);
      });
    });
  });
});
