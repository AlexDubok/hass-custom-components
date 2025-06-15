import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Mocked } from 'vitest';
import { WeatherService } from './weather-service';
import { HomeAssistantService } from './ha-service';
import { MetNoAdapter } from './weather/metno-adapter';
import type { EntityRegistryDisplayEntry } from '../types/homeassistant';

vi.mock('./ha-service');
vi.mock('./weather/metno-adapter');

describe('WeatherService', () => {
  let weatherService: WeatherService;
  let mockHaService: Mocked<HomeAssistantService>;
  const testEntityId = 'weather.home';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // create mock HomeAssistantService
    mockHaService = {
      getEntity: vi.fn(),
      getEntityState: vi.fn(),
      callWS: vi.fn(),
      callService: vi.fn(),
    } as unknown as Mocked<HomeAssistantService>;
    
    // setup default mocks for MetNoAdapter
    const MockedMetNoAdapter = MetNoAdapter as unknown as {
      mockImplementation: (impl: () => unknown) => void;
    };
    MockedMetNoAdapter.mockImplementation(() => ({
      getCurrentCondition: vi.fn().mockResolvedValue('sunny'),
      getRainHistory: vi.fn().mockResolvedValue([]),
      getRainForecast: vi.fn().mockResolvedValue({ amount: 0, hourlyData: [] }),
    }));
  });

  describe('constructor', () => {
    it('should initialize with met provider when entity has met platform', () => {
      const mockEntity: EntityRegistryDisplayEntry = { 
        platform: 'met', 
        entity_id: testEntityId 
      } as EntityRegistryDisplayEntry;
      mockHaService.getEntity.mockReturnValue(mockEntity);
      
      weatherService = new WeatherService(mockHaService, testEntityId);
      
      expect(mockHaService.getEntity).toHaveBeenCalledWith(testEntityId);
      expect(MetNoAdapter).toHaveBeenCalledWith(mockHaService, testEntityId);
    });

    it('should initialize with met provider when entity has no platform specified', () => {
      const mockEntity: EntityRegistryDisplayEntry = { 
        entity_id: testEntityId 
      } as EntityRegistryDisplayEntry;
      mockHaService.getEntity.mockReturnValue(mockEntity);
      
      weatherService = new WeatherService(mockHaService, testEntityId);
      
      expect(MetNoAdapter).toHaveBeenCalledWith(mockHaService, testEntityId);
    });

    it('should not initialize adapter when no entity is found', () => {
      mockHaService.getEntity.mockReturnValue(undefined as never);
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      weatherService = new WeatherService(mockHaService, testEntityId);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('No weather entity configured');
      expect(MetNoAdapter).not.toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
    });

    it('should warn when unknown weather provider is configured', () => {
      const mockEntity: EntityRegistryDisplayEntry = { 
        platform: 'unknown_provider', 
        entity_id: testEntityId 
      } as EntityRegistryDisplayEntry;
      mockHaService.getEntity.mockReturnValue(mockEntity);
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      weatherService = new WeatherService(mockHaService, testEntityId);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Unknown weather provider: unknown_provider');
      expect(MetNoAdapter).not.toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('getCurrentCondition', () => {
    it('should return current condition from adapter', async () => {
      const mockEntity: EntityRegistryDisplayEntry = { 
        platform: 'met', 
        entity_id: testEntityId 
      } as EntityRegistryDisplayEntry;
      mockHaService.getEntity.mockReturnValue(mockEntity);
      const mockGetCurrentCondition = vi.fn().mockResolvedValue('sunny');
      const MockedMetNoAdapter = MetNoAdapter as unknown as {
        mockImplementation: (impl: () => unknown) => void;
      };
      MockedMetNoAdapter.mockImplementation(() => ({
        getCurrentCondition: mockGetCurrentCondition,
        getRainHistory: vi.fn(),
        getRainForecast: vi.fn(),
      }));
      
      weatherService = new WeatherService(mockHaService, testEntityId);
      const condition = await weatherService.getCurrentCondition();
      
      expect(condition).toBe('sunny');
      expect(mockGetCurrentCondition).toHaveBeenCalled();
    });

    it('should return null when no adapter is initialized', async () => {
      mockHaService.getEntity.mockReturnValue(undefined as never);
      weatherService = new WeatherService(mockHaService, testEntityId);
      
      const condition = await weatherService.getCurrentCondition();
      
      expect(condition).toBeNull();
    });
  });

  describe('getRainHistory', () => {
    it('should return rain history from adapter', async () => {
      const mockEntity: EntityRegistryDisplayEntry = { 
        platform: 'met', 
        entity_id: testEntityId 
      } as EntityRegistryDisplayEntry;
      mockHaService.getEntity.mockReturnValue(mockEntity);
      const mockRainData = [
        { timestamp: '2024-01-01T12:00:00Z', amount: 5 },
        { timestamp: '2024-01-01T13:00:00Z', amount: 3 }
      ];
      const mockGetRainHistory = vi.fn().mockResolvedValue(mockRainData);
      const MockedMetNoAdapter = MetNoAdapter as unknown as {
        mockImplementation: (impl: () => unknown) => void;
      };
      MockedMetNoAdapter.mockImplementation(() => ({
        getCurrentCondition: vi.fn(),
        getRainHistory: mockGetRainHistory,
        getRainForecast: vi.fn(),
      }));
      
      weatherService = new WeatherService(mockHaService, testEntityId);
      const history = await weatherService.getRainHistory();
      
      expect(history).toEqual(mockRainData);
      expect(mockGetRainHistory).toHaveBeenCalled();
    });

    it('should return null when no adapter is initialized', async () => {
      mockHaService.getEntity.mockReturnValue(undefined as never);
      weatherService = new WeatherService(mockHaService, testEntityId);
      
      const history = await weatherService.getRainHistory();
      
      expect(history).toBeNull();
    });
  });

  describe('getRainForecast', () => {
    it('should return rain forecast from adapter', async () => {
      const mockEntity: EntityRegistryDisplayEntry = { 
        platform: 'met', 
        entity_id: testEntityId 
      } as EntityRegistryDisplayEntry;
      mockHaService.getEntity.mockReturnValue(mockEntity);
      const mockForecast = {
        amount: 12.5,
        hourlyData: [
          { hour: 0, amount: 2.5 },
          { hour: 1, amount: 5.0 },
          { hour: 2, amount: 5.0 }
        ]
      };
      const mockGetRainForecast = vi.fn().mockResolvedValue(mockForecast);
      const MockedMetNoAdapter = MetNoAdapter as unknown as {
        mockImplementation: (impl: () => unknown) => void;
      };
      MockedMetNoAdapter.mockImplementation(() => ({
        getCurrentCondition: vi.fn(),
        getRainHistory: vi.fn(),
        getRainForecast: mockGetRainForecast,
      }));
      
      weatherService = new WeatherService(mockHaService, testEntityId);
      const forecast = await weatherService.getRainForecast();
      
      expect(forecast).toEqual(mockForecast);
      expect(mockGetRainForecast).toHaveBeenCalled();
    });

    it('should return null when no adapter is initialized', async () => {
      mockHaService.getEntity.mockReturnValue(undefined as never);
      weatherService = new WeatherService(mockHaService, testEntityId);
      
      const forecast = await weatherService.getRainForecast();
      
      expect(forecast).toBeNull();
    });
  });

  describe('adapter initialization edge cases', () => {
    it('should handle entity with undefined platform', () => {
      const mockEntity: EntityRegistryDisplayEntry = { 
        entity_id: testEntityId, 
        platform: undefined 
      } as EntityRegistryDisplayEntry;
      mockHaService.getEntity.mockReturnValue(mockEntity);
      
      weatherService = new WeatherService(mockHaService, testEntityId);
      
      expect(MetNoAdapter).toHaveBeenCalledWith(mockHaService, testEntityId);
    });

    it('should handle adapter methods throwing errors', async () => {
      const mockEntity: EntityRegistryDisplayEntry = { 
        platform: 'met', 
        entity_id: testEntityId 
      } as EntityRegistryDisplayEntry;
      mockHaService.getEntity.mockReturnValue(mockEntity);
      const mockGetCurrentCondition = vi.fn().mockRejectedValue(new Error('API Error'));
      const MockedMetNoAdapter = MetNoAdapter as unknown as {
        mockImplementation: (impl: () => unknown) => void;
      };
      MockedMetNoAdapter.mockImplementation(() => ({
        getCurrentCondition: mockGetCurrentCondition,
        getRainHistory: vi.fn(),
        getRainForecast: vi.fn(),
      }));
      
      weatherService = new WeatherService(mockHaService, testEntityId);
      await expect(weatherService.getCurrentCondition()).rejects.toThrow('API Error');
    });
  });
});