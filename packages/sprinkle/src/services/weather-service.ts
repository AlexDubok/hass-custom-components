import { HomeAssistantService } from './ha-service';
import { WeatherAdapter } from './weather/weather-adapter.interface';
import { MetNoAdapter } from './weather/metno-adapter';

export class WeatherService {
  private adapter: WeatherAdapter | null = null;
  
  constructor(private haService: HomeAssistantService, public entityId: string) {
    this.initializeAdapter();
  }
  
  private initializeAdapter() {
    const entity = this.haService.getEntity(this.entityId);
    if (!entity) {
      console.warn('No weather entity configured');
      return;
    }
    const provider = entity.platform || 'met';
    switch (provider) {
      case 'met':
        this.adapter = new MetNoAdapter(this.haService, this.entityId);
        break;
      // Future providers can be added here
      default:
        console.warn(`Unknown weather provider: ${provider}`);
    }
  }
  
  async getCurrentCondition() {
    if (!this.adapter) return null;
    return this.adapter.getCurrentCondition();
  }
  
  async getRainHistory() {
    if (!this.adapter) return null;
    return this.adapter.getRainHistory();
  }
  
  async getRainForecast() {
    if (!this.adapter) return null;
    return this.adapter.getRainForecast();
  }
}