import { LitElement, css, html } from 'lit';
import './containers/watering-container';
import './components/card-mini';
import './components/themes/light';
import { HomeAssistant } from './types/homeassistant';
import { SprinkleConfig } from './types/config';
import { fireEvent } from './utils/fireEvent';
import { MoreInfoDialogParams } from './types/lovelace';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistantService } from './services/ha-service';
import { ValveService } from './services/valve-service';
import { ConfigRegistry } from './services/SprinkleConfigRegistry';

@customElement('sprinkle-card')
export class SprinkleCard extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ type: Boolean }) narrow?: boolean;
  @property({ attribute: false }) config?: SprinkleConfig;
  @property({ attribute: false }) public stateObj?: any;

  @state()
  haService: HomeAssistantService | null = null;
  
  @state()
  valveService: ValveService | null = null

  private configRegistry = ConfigRegistry.getInstance();

  setConfig(config: SprinkleConfig) {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    
    if (config.valve_entity) {
      this.configRegistry.setConfig(config.valve_entity, config);
    }
    
    this.config = config;
  }

  connectedCallback() {
    super.connectedCallback();
    const mainDeviceEntity = this.hass?.states[this.config?.valve_entity ?? ''];
    
    this.config = {
      ...mainDeviceEntity?.attributes as SprinkleConfig,
      ...this.config,
    };
    
    if (this.config?.valve_entity) {
      this.configRegistry.setConfig(this.config.valve_entity, this.config);
    }
    
    this.initializeServices();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    
    if (this.config?.valve_entity) {
      this.configRegistry.deleteConfig(this.config.valve_entity);
    }
  }

  updated(changedProps: Map<string, any>) {
    if ((changedProps.has('hass') || changedProps.has('config'))) {
      this.initializeServices();
    }
  }

  handleShowMoreInfo() {
    if (!this.config?.valve_entity) {
      return;
    }
    
    fireEvent(this, 'hass-more-info', {
      entityId: this.config.valve_entity,
    });
  }

  async handleToggleValve() {
    await this.valveService?.toggleValve();
  }

  handleToggleFailed(e: CustomEvent) {
    if (this.hass) {
      this.hass.callService('persistent_notification', 'create', {
        title: 'Sprinkle Card',
        message: e.detail.message || 'Failed to toggle valve state',
        notification_id: 'sprinkle-valve-toggle-failed'
      });
    }
    console.error('Valve toggle failed:', e.detail.message);
  }

  render() {
    if (!this.hass) {
      return html`<div>${this.config?.device_name} Loading...</div>`;
    }
    if (!this.haService || !this.valveService) {
      throw new Error(`Services not initialized for ${this.config?.device_name}`);
    }

    const statusEntity = this.haService.getEntityState(this.config?.device_status_entity);
    const batteryLevel = this.valveService.batteryLevel ?? '';

    return html`
      <sprinkle-light-theme>
        <sprinkle-status-card
          ?iswaterrunning="${this.valveService?.isValveOn()}"
          .valveSwitchState="${this.hass.states[this.config?.valve_entity ?? '']?.state}"
          .title="${this.config?.title ?? ''}"
          .status="${statusEntity?.state ?? ''}"
          .batteryLevel="${batteryLevel}"
          .flowRate="${this.valveService?.flowRate ?? null}"
          @click="${this.handleShowMoreInfo}"
          @toggle-valve="${this.handleToggleValve}"
          @valve-toggle-failed="${this.handleToggleFailed}"
        ></sprinkle-status-card>
      </sprinkle-light-theme>
    `;
  }

  private initializeServices() {
    if (!this.hass || !this.config) return;
    
    this.haService = new HomeAssistantService(this.hass);
    this.valveService = new ValveService(this.haService, this.config);
  }

  static styles = css`
    .main-content {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px 32px;
    }
  `;
}

declare global {
  interface HASSDomEvents {
    'hass-more-info': MoreInfoDialogParams;
    'valve-toggle-failed': {
      message: string;
    };
  }
}