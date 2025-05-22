import { HomeAssistantService } from './ha-service';
import { HomeAssistant } from 'types/homeassistant';

describe('HomeAssistantService', () => {
  let haService: HomeAssistantService;
  let mockHass: jest.Mocked<HomeAssistant>;

  beforeEach(() => {
    mockHass = {
      states: {
        'switch.mock_valve': {
          entity_id: 'switch.mock_valve',
          state: 'on',
        },
      },
      callService: jest.fn(),
    } as unknown as jest.Mocked<HomeAssistant>;

    haService = new HomeAssistantService(mockHass);
  });

  describe('getEntityState', () => {
    it('should return the state of the specified entity', () => {
      const state = haService.getEntityState('switch.mock_valve');
      expect(state).toEqual({
        entity_id: 'switch.mock_valve',
        state: 'on',
      });
    });

    it('should return an empty object if the entity does not exist', () => {
      const state = haService.getEntityState('switch.non_existent');
      expect(state).toEqual({});
    });

    it('should return an empty object if no entityId is provided', () => {
      const state = haService.getEntityState();
      expect(state).toEqual({});
    });
  });

  describe('callService', () => {
    it('should call the specified service with the correct parameters', () => {
      const domain = 'switch';
      const service = 'turn_on';
      const data = { entity_id: 'switch.mock_valve' };

      haService.callService(domain, service, data);

      expect(mockHass.callService).toHaveBeenCalledWith(domain, service, data);
    });

    it('should handle calls with empty data', () => {
      const domain = 'switch';
      const service = 'turn_off';
      const data = {};

      haService.callService(domain, service, data);

      expect(mockHass.callService).toHaveBeenCalledWith(domain, service, data);
    });

    it('should throw an error if callService is not defined in HomeAssistant', () => {
      mockHass.callService = undefined as unknown as jest.Mocked<HomeAssistant>['callService'];
      const domain = 'switch';
      const service = 'toggle';
      const data = { entity_id: 'switch.mock_valve' };

      expect(() => haService.callService(domain, service, data)).toThrow();
    });
  });
});