import { HomeAssistant } from "types/homeassistant";

// services/ha-service.ts
export class HomeAssistantService {
    // @ts-ignore
    constructor(private hass: HomeAssistant, private config: any) {}
    
    getEntityState(entityId: string) {
      return this.hass.states[entityId];
    }
    
    callService(domain: string, service: string, data: any) {
      return this.hass.callService(domain, service, data);
    }
    
    // More helper methods for common HA operations
  }
  