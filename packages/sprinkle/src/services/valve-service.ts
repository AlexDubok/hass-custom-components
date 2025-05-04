import { SprinkleConfig } from '../types/config';
import { HomeAssistantService } from './ha-service';
import { HassEntity } from 'home-assistant-js-websocket';

type VolumeBasedWateringParams = {
  currentCount?: number;
  totalNumber?: number;
  volumeLiters: number;
  irrigationInterval?: number;
};

export type TimedWateringParams = {
  currentCount?: number;
  totalNumber?: number;
  durationSeconds: number;
  irrigationInterval?: number;
};

export type FlowRate = {
  state: string;
  unitOfMeasurment: string | undefined;
};

export class ValveService {
  private haService: HomeAssistantService;
  private valveEntity: string;
  private deviceName: string;

  public status: string | undefined;
  public onOffState: string | undefined;
  public batteryLevel: string | undefined;
  public flowRate: FlowRate | undefined;
  public weatherEntity: string | undefined;
  public timedIrrigation: HassEntity | undefined;
  public quantitativeIrrigation: HassEntity | undefined;

  constructor(haService: HomeAssistantService, config: SprinkleConfig) {
    this.haService = haService;
    this.valveEntity = config.valve_entity;
    this.deviceName = config.device_name;
    const flowEntity = this.haService.getEntityState(config.flow_entity);

    this.status = this.haService.getEntityState(config.device_status_entity)?.state;
    this.onOffState = this.haService.getEntityState(this.valveEntity)?.state;
    this.batteryLevel = this.haService.getEntityState(config.battery_entity)?.state;
    this.flowRate = {
      state: flowEntity?.state,
      unitOfMeasurment: flowEntity?.attributes?.unit_of_measurement,
    };
    this.timedIrrigation = this.haService.getEntityState(config.timed_irrigation_entity);
    this.quantitativeIrrigation = this.haService.getEntityState(config.quantitative_irrigation_entity);
    
  }

  isValveOn(): boolean {
    const state = this.haService.getEntityState(this.valveEntity);
    return state?.state === 'on';
  }

  toggleValve(): Promise<any> {
    return this.haService.callService('switch', 'toggle', {
      entity_id: this.valveEntity,
    });
  }

  turnValveOn(): Promise<any> {
    return this.haService.callService('switch', 'turn_on', {
      entity_id: this.valveEntity,
    });
  }

  turnValveOff(): Promise<any> {
    return this.haService.callService('switch', 'turn_off', {
      entity_id: this.valveEntity,
    });
  }

  /**
   * Starts a one-time timed irrigation cycle.
   * 
   * @param durationSeconds - Duration of the irrigation in seconds (max: 86400).
   * @returns A promise resolving the result of the MQTT publish call.
   */
  startTimedWateringOnce(durationSeconds: number): Promise<any> {
    return this.startTimedWatering({
      durationSeconds,
      currentCount: 0,
      totalNumber: 1,
    });
  }

  /**
   * Starts a one-time volume-based irrigation cycle.
   * 
   * @param volumeLiters - Volume of water for irrigation in liters (max: 6500).
   * @returns A promise resolving the result of the MQTT publish call.
   */
  startVolumeBasedWateringOnce(volumeLiters: number): Promise<any> {
    return this.startVolumeBasedWatering({
      volumeLiters,
      currentCount: 0,
      totalNumber: 1,
    });
  }

  /**
   * Starts a cyclic timed irrigation process.
   * 
   * @param durationSeconds - Single irrigation duration in seconds (max: 86400).
   * @param currentCount - Number of times it has been executed (default: 0).
   * @param totalNumber - Total number of irrigation cycles (max: 100, default: 1).
   * @param irrigationInterval - Time interval between two adjacent irrigations in seconds (max: 86400, default: 0).
   * @returns A promise resolving the result of the MQTT publish call.
   */
  private startTimedWatering({durationSeconds, currentCount, irrigationInterval, totalNumber}: TimedWateringParams): Promise<any> {
    console.log('start TimedWatering', {
      topic: `zigbee2mqtt/${this.deviceName}/set`,
      payload: JSON.stringify({
        cyclic_timed_irrigation: {
          current_count: currentCount || 0,
          total_number: totalNumber || 1,
          irrigation_duration: durationSeconds,
          irrigation_interval: irrigationInterval || 0,
        },
      }),
    });
    return this.haService.callService('mqtt', 'publish', {
      topic: `zigbee2mqtt/${this.deviceName}/set`,
      payload: JSON.stringify({
        cyclic_timed_irrigation: {
          current_count: currentCount || 0,
          total_number: totalNumber || 1,
          irrigation_duration: durationSeconds,
          irrigation_interval: irrigationInterval || 0,
        },
      }),
    });
  }

  /**
   * Starts a cyclic volume-based irrigation process.
   * 
   * @param volumeLiters - Single irrigation capacity in liters (max: 6500).
   * @param currentCount - Number of times it has been executed (default: 0).
   * @param totalNumber - Total number of irrigation cycles (max: 100, default: 1).
   * @param irrigationInterval - Time interval between two adjacent irrigations in seconds (max: 86400, default: 0).
   * @returns A promise resolving the result of the MQTT publish call.
   */
  startVolumeBasedWatering({volumeLiters, currentCount, irrigationInterval, totalNumber}: VolumeBasedWateringParams): Promise<any> {
    console.log('start VolumeBasedWatering', {
      topic: `zigbee2mqtt/${this.deviceName}/set`,
      payload: JSON.stringify({
        cyclic_quantitative_irrigation: {
          current_count: currentCount || 0,
          total_number: totalNumber || 1,
          irrigation_capacity: volumeLiters,
          irrigation_interval: irrigationInterval || 0,
        },
      }),
    });
    return this.haService.callService('mqtt', 'publish', {
      topic: `zigbee2mqtt/${this.deviceName}/set`,
      payload: JSON.stringify({
        cyclic_quantitative_irrigation: {
          current_count: currentCount || 0,
          total_number: totalNumber || 1,
          irrigation_capacity: volumeLiters,
          irrigation_interval: irrigationInterval || 0,
        },
      }),
    });
  }
}
