export type SectionId =
  | 'home'
  | 'camera-lens'
  | 'exposure'
  | 'camera-angles'
  | 'shot-types'
  | 'composition'
  | 'lighting'
  | 'movement'
  | 'color-wb'
  | 'framerate'
  | 'aspect-ratio'
  | 'film-language'
  | 'settings';

export type UnitSystem = 'metric' | 'imperial';

export type DistanceUnit = 'm' | 'cm' | 'mm' | 'ft' | 'in';

export interface SensorPreset {
  name: string;
  width: number; // mm
  height: number; // mm
  cropFactor: number;
  coc: number; // Circle of confusion in mm
}

export const SENSOR_PRESETS: Record<string, SensorPreset> = {
  'full-frame': {
    name: 'Full Frame (35mm)',
    width: 36.0,
    height: 24.0,
    cropFactor: 1.0,
    coc: 0.03,
  },
  'super-35': {
    name: 'Super 35 / APS-C',
    width: 24.89,
    height: 18.66,
    cropFactor: 1.45,
    coc: 0.019,
  },
  'micro-43': {
    name: 'Micro Four Thirds',
    width: 17.3,
    height: 13.0,
    cropFactor: 2.0,
    coc: 0.015,
  },
  'large-format': {
    name: 'Large Format (Arri LF / Alexa 65)',
    width: 54.12,
    height: 25.59,
    cropFactor: 0.67,
    coc: 0.045,
  },
};

export type CameraAngle =
  | 'eye-level'
  | 'low-angle'
  | 'high-angle'
  | 'birds-eye'
  | 'worms-eye'
  | 'dutch-angle'
  | 'overhead'
  | 'ground-level';

export type ShotType =
  | 'extreme-wide'
  | 'wide'
  | 'full'
  | 'medium'
  | 'medium-close-up'
  | 'close-up'
  | 'extreme-close-up'
  | 'ots'
  | 'pov'
  | 'two-shot'
  | 'insert'
  | 'cutaway'
  | 'reaction';

export type CompositionGuide =
  | 'rule-of-thirds'
  | 'center'
  | 'symmetry'
  | 'leading-lines'
  | 'diagonal'
  | 'golden-ratio'
  | 'negative-space'
  | 'frame-in-frame'
  | 'triangles'
  | 'depth'
  | 'visual-balance';

export type LightingPattern =
  | 'rembrandt'
  | 'loop'
  | 'butterfly'
  | 'split'
  | 'broad'
  | 'short';

export type CameraMovement =
  | 'static'
  | 'pan'
  | 'tilt'
  | 'dolly-in'
  | 'dolly-out'
  | 'tracking'
  | 'truck'
  | 'pedestal'
  | 'crane'
  | 'orbit'
  | 'arc'
  | 'zoom'
  | 'dolly-zoom'
  | 'whip-pan'
  | 'handheld'
  | 'steadicam'
  | 'gimbal';

export type ColorHarmony =
  | 'natural'
  | 'warm'
  | 'cool'
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'split-complementary'
  | 'monochromatic';

export type FilmLanguageConcept =
  | '180-degree'
  | '30-degree'
  | 'eyeline'
  | 'screen-direction'
  | 'continuity'
  | 'match-cut'
  | 'jump-cut'
  | 'establishing'
  | 'master-shot'
  | 'coverage'
  | 'reaction-shot'
  | 'insert'
  | 'cutaway'
  | 'eye-trace';

export interface AspectRatioPreset {
  id: string;
  label: string;
  ratio: number;
  description: string;
}

export const ASPECT_RATIOS: AspectRatioPreset[] = [
  { id: '4:3', label: '4:3 (1.33:1)', ratio: 4 / 3, description: 'Academy / Classic TV' },
  { id: '16:9', label: '16:9 (1.78:1)', ratio: 16 / 9, description: 'Standard HD / Streaming' },
  { id: '1.85:1', label: '1.85:1', ratio: 1.85, description: 'Theatrical Flat (US)' },
  { id: '2.00:1', label: '2.00:1', ratio: 2.0, description: 'Univisium / Modern Series' },
  { id: '2.20:1', label: '2.20:1', ratio: 2.2, description: '70mm Epic Format' },
  { id: '2.39:1', label: '2.39:1', ratio: 2.39, description: 'Anamorphic Panavision Scope' },
  { id: '2.76:1', label: '2.76:1', ratio: 2.76, description: 'Ultra Panavision 70' },
  { id: '1:1', label: '1:1', ratio: 1.0, description: 'Square Format' },
  { id: '9:16', label: '9:16 (0.56:1)', ratio: 9 / 16, description: 'Vertical Cinema / Mobile' },
];
