import { ServiceCallResponse } from '../types/homeassistant';
import { SprinkleConfig } from '../types/config';
import { HomeAssistantService } from './ha-service';
import { HassEntity } from 'home-assistant-js-websocket';
import { parsePythonDict } from '../utils/parsePythonDict';

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

export interface TimedIrrigationState {
  current_count: number;
  total_number: number;
  irrigation_duration: number;
  irrigation_interval: number;
}

export type CountDown = {
  secondsRemaining: number;
  totalDuration: number;
  formatted: string;
  progress: number;
  isActive: boolean;
}

export class ValveService {
  private haService: HomeAssistantService;
  private valveEntity: string;
  private deviceName: string;

  public weatherEntity: string | undefined;
  private timedIrrigationEntity: string | undefined;
  private quantitativeIrrigationEntity: string | undefined;
  private batteryEntity: string | undefined;
  private flowEntity: string | undefined;
  private deviceStatusEntity: string | undefined;

  constructor(haService: HomeAssistantService, config: SprinkleConfig) {
    this.haService = haService;
    this.valveEntity = config.valve_entity;
    this.deviceName = config.device_name;
    this.timedIrrigationEntity = config.timed_irrigation_entity;
    this.quantitativeIrrigationEntity = config.quantitative_irrigation_entity;
    this.batteryEntity = config.battery_entity;
    this.flowEntity = config.flow_entity;
    this.deviceStatusEntity = config.device_status_entity;
  }

  isValveOn(): boolean {
    const state = this.haService.getEntityState(this.valveEntity);
    return state?.state === 'on';
  }

  get status(): string | undefined {
    return this.deviceStatusEntity 
      ? this.haService.getEntityState(this.deviceStatusEntity)?.state
      : undefined;
  }

  get onOffState(): string | undefined {
    return this.haService.getEntityState(this.valveEntity)?.state;
  }

  get batteryLevel(): string | undefined {
    return this.batteryEntity
      ? this.haService.getEntityState(this.batteryEntity)?.state
      : undefined;
  }

  get flowRate(): FlowRate | undefined {
    if (!this.flowEntity) return undefined;
    const flowEntity = this.haService.getEntityState(this.flowEntity);
    return {
      state: flowEntity?.state,
      unitOfMeasurment: flowEntity?.attributes?.unit_of_measurement,
    };
  }

  get timedIrrigation(): HassEntity | undefined {
    return this.timedIrrigationEntity
      ? this.haService.getEntityState(this.timedIrrigationEntity)
      : undefined;
  }

  get quantitativeIrrigation(): HassEntity | undefined {
    return this.quantitativeIrrigationEntity
      ? this.haService.getEntityState(this.quantitativeIrrigationEntity)
      : undefined;
  }

  toggleValve(): Promise<ServiceCallResponse> {
    return this.haService.callService('switch', 'toggle', {
      entity_id: this.valveEntity,
    });
  }

  turnValveOn(): Promise<ServiceCallResponse> {
    return this.haService.callService('switch', 'turn_on', {
      entity_id: this.valveEntity,
    });
  }

  turnValveOff(): Promise<ServiceCallResponse> {
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
  startTimedWateringOnce(
    durationSeconds: number
  ): Promise<ServiceCallResponse> {
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
  startVolumeBasedWateringOnce(
    volumeLiters: number
  ): Promise<ServiceCallResponse> {
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
  private startTimedWatering({
    durationSeconds,
    currentCount,
    irrigationInterval,
    totalNumber,
  }: TimedWateringParams): Promise<ServiceCallResponse> {
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
  startVolumeBasedWatering({
    volumeLiters,
    currentCount,
    irrigationInterval,
    totalNumber,
  }: VolumeBasedWateringParams): Promise<ServiceCallResponse> {
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

   getCurrentCycleTimeRemaining(): number {
    // Parse the irrigation data
    const state = this.timedIrrigation?.state || '{}';
    const data = parsePythonDict(state) as unknown as TimedIrrigationState;
    
    // Check if irrigation is active - BOTH conditions must be true:
    // 1. current_count > 0 (irrigation cycle started)
    // 2. valve state === "on"
    if (!this.isValveOn() || data.current_count === 0 || data.total_number === 0) {
      return 0;
    }
    
    // Check if irrigation cycle is still running
    const cyclesRemaining = data.total_number - data.current_count;
    if (cyclesRemaining < 0 || data.irrigation_duration === 0) {
      return 0;
    }
    
    // Get the main valve entity to check when it turned on
    const valveEntity = this.haService.getEntityState(this.valveEntity);
    // Use the valve's last_changed timestamp (when it turned on)
    const valveLastChanged = valveEntity.last_changed;
    if (!valveLastChanged) {
      // Fallback: assume full duration if no timestamp
      return data.irrigation_duration as number;
    }
    
    // Calculate elapsed time since valve turned on
    const now = Date.now();
    const valveTurnedOnAt = new Date(valveLastChanged).getTime();
    const elapsedSeconds = Math.floor((now - valveTurnedOnAt) / 1000);
    
    // Handle case where valve has been on longer than one cycle
    // (in case of multiple cycles)
    const elapsedInCurrentCycle = elapsedSeconds % data.irrigation_duration;
    
    // Time remaining in current cycle
    const timeRemaining = data.irrigation_duration - elapsedInCurrentCycle;
    
    // Sanity check - if calculated remaining time is greater than duration,
    // the valve probably just turned on
    if (timeRemaining > data.irrigation_duration) {
      return data.irrigation_duration;
    }
    
    return Math.max(0, timeRemaining);
  }

  getCountdownInfo(): CountDown {
    const secondsRemaining = this.getCurrentCycleTimeRemaining();
    const irrigationData = parsePythonDict(this.timedIrrigation?.state || '{}') as unknown as TimedIrrigationState;
    
    return {
      secondsRemaining,
      totalDuration: irrigationData.irrigation_duration,
      isActive: secondsRemaining > 0,
      progress: irrigationData.irrigation_duration > 0 
        ? ((irrigationData.irrigation_duration - secondsRemaining) / irrigationData.irrigation_duration) * 100
        : 0,
      formatted: this.formatTime(secondsRemaining)
    };
  }

  private formatTime(seconds: number): string {
    if (seconds === 0) return '--:--';
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
