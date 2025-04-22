export interface SprinklerConfig {
    entity: string;
    name?: string;
    icon?: string;
    
    valve_entity?: string;
    battery_entity?: string;
    flow_entity?: string;
    weather_entity?: string;
    device_status_entity?: string;
    auto_close_entity?: string;
    volume_max?: number;
    duration_max?: number;
}

export type Mode = 'duration' | 'volume';