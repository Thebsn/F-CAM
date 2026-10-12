/**
 * F CAM Canonical Settings Context & LocalStorage Persistence
 * Provides a single source of truth for user preferences.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UnitSystem, DistanceUnit } from '../types/cinematography';

export interface FCamSettings {
  unitSystem: UnitSystem;
  distanceUnit: DistanceUnit;
  tempUnit: 'K' | 'Mired';
  themeMode: string;
  interfaceScale: number;
  showOverlays: boolean;
  showScales: boolean;
  showGridGuides: boolean;
  defaultSensor: string;
  defaultFps: string;
  defaultShutterAngle: string;
  defaultAspectRatio: string;
  defaultWb: string;
  previewQuality: string;
  guideOpacity: number;
  measurementOpacity: number;
  reducedMotion: boolean;
  largerText: boolean;
  highContrast: boolean;
  keyboardNav: boolean;
}

export const DEFAULT_SETTINGS: FCamSettings = {
  unitSystem: 'metric',
  distanceUnit: 'm',
  tempUnit: 'K',
  themeMode: 'dark',
  interfaceScale: 100,
  showOverlays: true,
  showScales: true,
  showGridGuides: true,
  defaultSensor: 'full-frame',
  defaultFps: '24',
  defaultShutterAngle: '180',
  defaultAspectRatio: '2.39:1',
  defaultWb: '5600',
  previewQuality: 'high',
  guideOpacity: 85,
  measurementOpacity: 90,
  reducedMotion: false,
  largerText: false,
  highContrast: false,
  keyboardNav: true,
};

export const SETTINGS_STORAGE_KEY = 'fcam-settings';

const VALID_UNIT_SYSTEMS = new Set(['metric', 'imperial']);
const VALID_DISTANCE_UNITS = new Set(['m', 'cm', 'mm', 'ft', 'in']);
const VALID_TEMP_UNITS = new Set(['K', 'Mired']);
const VALID_SENSORS = new Set(['full-frame', 'super-35', 'micro-43', 'large-format']);
const VALID_FPS = new Set(['23.976', '24', '25', '29.97', '60']);
const VALID_SHUTTER = new Set(['180', '90', '45', '360']);
const VALID_ASPECT = new Set(['2.39:1', '1.85:1', '16:9', '2.00:1', '4:3']);
const VALID_WB = new Set(['5600', '3200', '4300', '6500']);
const VALID_PREVIEW = new Set(['high', 'medium', 'low']);

/**
 * Validates untrusted or partial stored data against allowed domain values,
 * safely falling back to current defaults for missing or invalid keys.
 */
export function validateAndMergeSettings(raw: unknown): FCamSettings {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_SETTINGS };
  }

  const obj = raw as Record<string, unknown>;
  const merged: FCamSettings = { ...DEFAULT_SETTINGS };

  if (typeof obj.unitSystem === 'string' && VALID_UNIT_SYSTEMS.has(obj.unitSystem)) {
    merged.unitSystem = obj.unitSystem as UnitSystem;
  }
  if (typeof obj.distanceUnit === 'string' && VALID_DISTANCE_UNITS.has(obj.distanceUnit)) {
    merged.distanceUnit = obj.distanceUnit as DistanceUnit;
  }
  if (typeof obj.tempUnit === 'string' && VALID_TEMP_UNITS.has(obj.tempUnit)) {
    merged.tempUnit = obj.tempUnit as 'K' | 'Mired';
  }
  if (typeof obj.themeMode === 'string') {
    merged.themeMode = obj.themeMode;
  }
  if (typeof obj.interfaceScale === 'number' && !isNaN(obj.interfaceScale) && obj.interfaceScale >= 50 && obj.interfaceScale <= 200) {
    merged.interfaceScale = obj.interfaceScale;
  }
  if (typeof obj.showOverlays === 'boolean') {
    merged.showOverlays = obj.showOverlays;
  }
  if (typeof obj.showScales === 'boolean') {
    merged.showScales = obj.showScales;
  }
  if (typeof obj.showGridGuides === 'boolean') {
    merged.showGridGuides = obj.showGridGuides;
  }
  if (typeof obj.defaultSensor === 'string' && VALID_SENSORS.has(obj.defaultSensor)) {
    merged.defaultSensor = obj.defaultSensor;
  }
  if (typeof obj.defaultFps === 'string' && VALID_FPS.has(obj.defaultFps)) {
    merged.defaultFps = obj.defaultFps;
  }
  if (typeof obj.defaultShutterAngle === 'string' && VALID_SHUTTER.has(obj.defaultShutterAngle)) {
    merged.defaultShutterAngle = obj.defaultShutterAngle;
  }
  if (typeof obj.defaultAspectRatio === 'string' && VALID_ASPECT.has(obj.defaultAspectRatio)) {
    merged.defaultAspectRatio = obj.defaultAspectRatio;
  }
  if (typeof obj.defaultWb === 'string' && VALID_WB.has(obj.defaultWb)) {
    merged.defaultWb = obj.defaultWb;
  }
  if (typeof obj.previewQuality === 'string' && VALID_PREVIEW.has(obj.previewQuality)) {
    merged.previewQuality = obj.previewQuality;
  }
  if (typeof obj.guideOpacity === 'number' && !isNaN(obj.guideOpacity) && obj.guideOpacity >= 10 && obj.guideOpacity <= 100) {
    merged.guideOpacity = obj.guideOpacity;
  }
  if (typeof obj.measurementOpacity === 'number' && !isNaN(obj.measurementOpacity) && obj.measurementOpacity >= 10 && obj.measurementOpacity <= 100) {
    merged.measurementOpacity = obj.measurementOpacity;
  }
  if (typeof obj.reducedMotion === 'boolean') {
    merged.reducedMotion = obj.reducedMotion;
  }
  if (typeof obj.largerText === 'boolean') {
    merged.largerText = obj.largerText;
  }
  if (typeof obj.highContrast === 'boolean') {
    merged.highContrast = obj.highContrast;
  }
  if (typeof obj.keyboardNav === 'boolean') {
    merged.keyboardNav = obj.keyboardNav;
  }

  return merged;
}

export function loadSavedSettings(): FCamSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return validateAndMergeSettings(parsed);
  } catch (err) {
    console.warn('Failed to parse saved settings, falling back to defaults', err);
    return { ...DEFAULT_SETTINGS };
  }
}

export function persistSettings(settings: FCamSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to persist settings to localStorage', err);
  }
}

interface SettingsContextValue {
  settings: FCamSettings;
  updateSetting: <K extends keyof FCamSettings>(key: K, value: FCamSettings[K]) => void;
  updateSettings: (partial: Partial<FCamSettings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<FCamSettings>(loadSavedSettings);

  const updateSetting = useCallback(<K extends keyof FCamSettings>(key: K, value: FCamSettings[K]) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      persistSettings(updated);
      return updated;
    });
  }, []);

  const updateSettings = useCallback((partial: Partial<FCamSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      persistSettings(updated);
      return updated;
    });
  }, []);

  // Sync when localStorage changes in another tab/window
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === SETTINGS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setSettings(validateAndMergeSettings(parsed));
        } catch {
          // Ignore parse errors from external changes
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
}
