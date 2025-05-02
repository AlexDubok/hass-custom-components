import { ValveService } from './valve-service';
import { HomeAssistantService } from './ha-service';
import { SprinkleConfig } from '../types/config';
import { HomeAssistant } from '../types/homeassistant';
import { HassEntityAttributeBase, Context } from 'home-assistant-js-websocket';

jest.mock('./ha-service');

const mockEntity = (state: string): any => ({
  entity_id: 'switch.mock_valve',
  state,
  last_changed: new Date().toISOString(),
  last_updated: new Date().toISOString(),
  attributes: {} as HassEntityAttributeBase,
  context: {} as Context,
});

describe('ValveService', () => {
  let valveService: ValveService;
  let mockHaService: jest.Mocked<HomeAssistantService>;
  const mockConfig: SprinkleConfig = {
    valve_entity: 'switch.mock_valve',
    device_name: 'mock_device',
  };

  beforeEach(() => {
    mockHaService = new HomeAssistantService(
      {} as HomeAssistant
    ) as jest.Mocked<HomeAssistantService>;
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
      // @ts-expect-error
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
        }
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
        }
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
        }
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
          duration: JSON.stringify({
            cyclic_timed_irrigation: {
              current_count: 1,
              total_number: 3,
              irrigation_duration: 3600,
              irrigation_interval: 600,
            },
          }),
        }
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
          duration: JSON.stringify({
            cyclic_quantitative_irrigation: {
              current_count: 2,
              total_number: 4,
              irrigation_capacity: 500,
              irrigation_interval: 1200,
            },
          }),
        }
      );
    });
  });
});
