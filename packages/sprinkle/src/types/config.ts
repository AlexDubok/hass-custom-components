export interface SprinkleConfig {
    device_name: string;
    valve_entity: string;
    title?: string;
    
    icon?: string;
    battery_entity?: string;
    flow_entity?: string;
    weather_entity?: string;
    device_status_entity?: string;
    auto_close_entity?: string;
    volume_max?: number;
    duration_max?: number;
    status_entity?: string;
    timed_irrigation_entity?: string;
    quantitative_irrigation_entity?: string;
}

export type Mode = 'duration' | 'volume';