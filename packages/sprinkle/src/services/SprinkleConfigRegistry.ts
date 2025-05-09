import { SprinkleConfig } from '../types/config';

/**
 * Registry for storing and sharing configuration between components
 * Implements the Singleton pattern to ensure only one instance exists
 */
export class ConfigRegistry {
  private static instance: ConfigRegistry;
  private configs = new Map<string, SprinkleConfig>();

  // Private constructor to prevent direct construction calls with the `new` operator
  private constructor() {}

  /**
   * The static method that controls the access to the singleton instance
   */
  public static getInstance(): ConfigRegistry {
    if (!ConfigRegistry.instance) {
      ConfigRegistry.instance = new ConfigRegistry();
    }
    return ConfigRegistry.instance;
  }

  /**
   * Store a configuration for an entity
   * @param entityId - The entity ID to store the configuration for
   * @param config - The configuration to store
   */
  public setConfig(entityId: string, config: SprinkleConfig): void {
    this.configs.set(entityId, { ...config });
  }

  /**
   * Get the stored configuration for an entity
   * @param entityId - The entity ID to get the configuration for
   * @returns The stored configuration, or undefined if none exists
   */
  public getConfig(entityId: string): SprinkleConfig | undefined {
    return this.configs.get(entityId);
  }

  /**
   * Check if a configuration exists for an entity
   * @param entityId - The entity ID to check
   * @returns True if a configuration exists, false otherwise
   */
  public hasConfig(entityId: string): boolean {
    return this.configs.has(entityId);
  }

  /**
   * Delete a configuration for an entity
   * @param entityId - The entity ID to delete the configuration for
   */
  public deleteConfig(entityId: string): void {
    this.configs.delete(entityId);
  }

  /**
   * Clear all stored configurations
   */
  public clear(): void {
    this.configs.clear();
  }
}

// Export a helper function to get the registry instance
export const getConfigRegistry = () => ConfigRegistry.getInstance();