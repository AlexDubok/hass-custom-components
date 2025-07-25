import {
    Auth,
    Connection,
    HassConfig,
    HassEntities,
    HassServiceTarget,
    HassServices,
    MessageBase,
  } from 'home-assistant-js-websocket';
  
  export interface EntityRegistryDisplayEntry {
    entity_id: string;
    name?: string;
    device_id?: string;
    area_id?: string;
    hidden?: boolean;
    entity_category?: 'config' | 'diagnostic';
    translation_key?: string;
    platform?: string;
    display_precision?: number;
  }
  
  export interface DeviceRegistryEntry {
    id: string;
    config_entries: string[];
    connections: [string, string][];
    identifiers: [string, string][];
    manufacturer: string | null;
    model: string | null;
    name: string | null;
    sw_version: string | null;
    hw_version: string | null;
    via_device_id: string | null;
    area_id: string | null;
    name_by_user: string | null;
    entry_type: 'service' | null;
    disabled_by: 'user' | 'integration' | 'config_entry' | null;
    configuration_url: string | null;
  }
  
  export interface AreaRegistryEntry {
    area_id: string;
    name: string;
    picture: string | null;
  }
  
  export interface ThemeSettings {
    theme: string;
    dark?: boolean;
    primaryColor?: string;
    accentColor?: string;
  }
  
  export interface PanelInfo<T = Record<string, unknown> | null> {
    component_name: string;
    config: T;
    icon: string | null;
    title: string | null;
    url_path: string;
  }
  
  export type Panels = Record<string, PanelInfo>;
  
  export type Resources = Record<string, Record<string, string>>;
  
  export interface Translation {
    nativeName: string;
    isRTL: boolean;
    hash: string;
  }
  
  export interface TranslationMetadata {
    fragments: string[];
    translations: Record<string, Translation>;
  }
  
  export interface Credential {
    auth_provider_type: string;
    auth_provider_id: string;
  }
  
  export interface MFAModule {
    id: string;
    name: string;
    enabled: boolean;
  }
  
  export interface CurrentUser {
    id: string;
    is_owner: boolean;
    is_admin: boolean;
    name: string;
    credentials: Credential[];
    mfa_modules: MFAModule[];
  }
  
  export interface ServiceCallRequest {
    domain: string;
    service: string;
    serviceData?: Record<string, unknown>;
    target?: HassServiceTarget;
  }
  
  export interface Context {
    id: string;
    parent_id?: string;
    user_id?: string | null;
  }
  
  export interface ServiceCallResponse {
    context: Context;
    response?: Record<string, unknown>;
  }
  
  export interface HomeAssistant {
    auth: Auth;
    connection: Connection;
    connected: boolean;
    states: HassEntities;
    entities: Record<string, EntityRegistryDisplayEntry>;
    devices: Record<string, DeviceRegistryEntry>;
    areas: Record<string, AreaRegistryEntry>;
    services: HassServices;
    config: HassConfig;
    themes: Themes;
    selectedTheme: ThemeSettings | null;
    panels: Panels;
    panelUrl: string;
    language: string;
    selectedLanguage: string | null;
    locale: FrontendLocaleData;
    resources: Resources;
    localize: LocalizeFunc;
    translationMetadata: TranslationMetadata;
    suspendWhenHidden: boolean;
    enableShortcuts: boolean;
    vibrate: boolean;
    dockedSidebar: 'docked' | 'always_hidden' | 'auto';
    defaultPanel: string;
    moreInfoEntityId: string | null;
    user?: CurrentUser;
    hassUrl(path?: string): string;
    callService(
      domain: ServiceCallRequest['domain'],
      service: ServiceCallRequest['service'],
      serviceData?: ServiceCallRequest['serviceData'],
      target?: ServiceCallRequest['target'],
      notifyOnError?: boolean,
      returnResponse?: boolean,
    ): Promise<ServiceCallResponse>;
    callApi<T>(
      method: 'GET' | 'POST' | 'PUT' | 'DELETE',
      path: string,
      parameters?: Record<string, unknown>,
      headers?: Record<string, string>,
    ): Promise<T>;
    fetchWithAuth(path: string, init?: Record<string, unknown>): Promise<Response>;
    sendWS(msg: MessageBase): void;
    callWS<T>(msg: MessageBase): Promise<T>;
    loadBackendTranslation(
      category: TranslationCategory,
      integration?: string | string[],
      configFlow?: boolean,
    ): Promise<LocalizeFunc>;
  }
  
  export enum NumberFormat {
    language = 'language',
    system = 'system',
    comma_decimal = 'comma_decimal',
    decimal_comma = 'decimal_comma',
    space_comma = 'space_comma',
    none = 'none',
  }
  
  export enum TimeFormat {
    language = 'language',
    system = 'system',
    am_pm = '12',
    twenty_four = '24',
  }
  
  export enum TimeZone {
    local = 'local',
    server = 'server',
  }
  
  export enum DateFormat {
    language = 'language',
    system = 'system',
    DMY = 'DMY',
    MDY = 'MDY',
    YMD = 'YMD',
  }
  
  export enum FirstWeekday {
    language = 'language',
    monday = 'monday',
    tuesday = 'tuesday',
    wednesday = 'wednesday',
    thursday = 'thursday',
    friday = 'friday',
    saturday = 'saturday',
    sunday = 'sunday',
  }
  
  export interface FrontendLocaleData {
    language: string;
    number_format: NumberFormat;
    time_format: TimeFormat;
    date_format: DateFormat;
    first_weekday: FirstWeekday;
    time_zone: TimeZone;
  }
  
  declare global {
    interface FrontendUserData {
      language: FrontendLocaleData;
    }
  }
  
  export type TranslationCategory =
    | 'title'
    | 'state'
    | 'entity'
    | 'entity_component'
    | 'config'
    | 'config_panel'
    | 'options'
    | 'device_automation'
    | 'mfa_setup'
    | 'system_health'
    | 'device_class'
    | 'application_credentials'
    | 'issues'
    | 'selector';
  
  export type LocalizeFunc = (key: string, ...args: unknown[]) => string;
  
  export interface ThemeVars {
    // Incomplete
    'primary-color': string;
    'text-primary-color': string;
    'accent-color': string;
    [key: string]: string;
  }
  
  export type Theme = ThemeVars & {
    modes?: {
      light?: ThemeVars;
      dark?: ThemeVars;
    };
  };
  
  export interface Themes {
    default_theme: string;
    default_dark_theme: string | null;
    themes: Record<string, Theme>;
    // Currently effective dark mode. Will never be undefined. If user selected "auto"
    // in theme picker, this property will still contain either true or false based on
    // what has been determined via system preferences and support from the selected theme.
    darkMode: boolean;
    // Currently globally active theme name
    theme: string;
  }
  