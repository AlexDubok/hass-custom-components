import { MessageBase } from 'home-assistant-js-websocket';
import {
  HomeAssistant,
  ServiceCallResponse,
  ServiceCallRequest,
} from '../types/homeassistant';

// services/ha-service.ts
export class HomeAssistantService {
  constructor(private hass: HomeAssistant) {}

  getEntity(entityId: string = '')  {
    return this.hass.entities[entityId] ?? {};
  }

  getEntityState(entityId: string = '') {
    return this.hass.states[entityId] ?? {};
  }

  callService(
    domain: string,
    service: string,
    data: Record<string, unknown> = {},
    target?: ServiceCallRequest['target'],
    notifyOnError = true,
    returnResponse = false
  ): Promise<ServiceCallResponse> {
    return this.hass.callService(
      domain,
      service,
      data,
      target,
      notifyOnError,
      returnResponse
    );
  }

  callWS<T>(msg: MessageBase): Promise<T> {
    return this.hass.callWS<T>(msg);
  }
}
