import { HomeAssistantService } from "./ha-service";

export class ValveService {
  private haService: HomeAssistantService;
  private valveEntity: string;

  constructor(haService: HomeAssistantService, config: any) {
    this.haService = haService;
    this.valveEntity = config.valve_entity;
  }

  isValveOn(): boolean {
    const state = this.haService.getEntityState(this.valveEntity);
    return state?.state === 'on';
  }

  turnValveOn() {
    return this.haService.callService('switch', 'turn_on', {
      entity_id: this.valveEntity,
    });
  }

  turnValveOff() {
    return this.haService.callService('switch', 'turn_off', {
      entity_id: this.valveEntity,
    });
  }

  startTimedWatering(durationMinutes: number) {
    console.log(`Starting timed watering for ${durationMinutes} minutes`);
    this.turnValveOn();
    // setTimeout(() => {
    //     this.turnValveOff();
    // }, durationMinutes * 60 * 1000);
  }

  startVolumeBasedWatering(volumeLiters: number) {
    console.log(`Starting volume-based watering for ${volumeLiters} liters`);
    // this.turnValveOn();
    // setTimeout(() => {
    //     this.turnValveOff();
    // }, volumeLiters * 1000); // Example conversion
  }
}
