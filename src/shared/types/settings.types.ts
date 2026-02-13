/**
 * Settings-related type definitions
 */

// Re-export user settings types for convenience
export * from './user.types';

export interface SettingDefinition {
  key: string;
  label: string;
  type: 'boolean' | 'number' | 'string' | 'select';
  defaultValue: any;
  options?: any[]; // For select type
  min?: number; // For number type
  max?: number; // For number type
  description?: string;
}

export interface SettingsCategory {
  id: string;
  label: string;
  icon: string;
  settings: SettingDefinition[];
}
