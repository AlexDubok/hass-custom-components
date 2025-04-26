import { createContext } from '@lit/context';
import { HomeAssistantService } from './ha-service';
import { ValveService } from './valve-service';

export const valveService = createContext<ValveService | null>('valve-service');
export const haService = createContext<HomeAssistantService | null>('ha-service');
