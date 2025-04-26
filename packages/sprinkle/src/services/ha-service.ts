import { HomeAssistant } from "types/homeassistant";

// services/ha-service.ts
export class HomeAssistantService {
    constructor(private hass: HomeAssistant) {}
    
    getEntityState(entityId: string = '') {
      return this.hass.states[entityId] ?? {};
    }
    
    callService(domain: string, service: string, data: any) {
      return this.hass.callService(domain, service, data);
    }
  }
  