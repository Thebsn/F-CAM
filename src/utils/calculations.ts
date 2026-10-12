/**
 * Cinematography Calculations & Physics Utilities
 */

import { SENSOR_PRESETS } from '../types/cinematography';

/**
 * Calculates Horizontal Field of View in degrees
 * Formula: 2 * arctan(sensor_width / (2 * focal_length)) * (180 / PI)
 */
export function calculateHorizontalFoV(focalLengthMm: number, sensorKey: string): number {
  const sensor = SENSOR_PRESETS[sensorKey] || SENSOR_PRESETS['full-frame'];
  const fovRad = 2 * Math.atan(sensor.width / (2 * focalLengthMm));
  return (fovRad * 180) / Math.PI;
}

/**
 * Calculates Vertical Field of View in degrees
 */
export function calculateVerticalFoV(focalLengthMm: number, sensorKey: string): number {
  const sensor = SENSOR_PRESETS[sensorKey] || SENSOR_PRESETS['full-frame'];
  const fovRad = 2 * Math.atan(sensor.height / (2 * focalLengthMm));
  return (fovRad * 180) / Math.PI;
}

/**
 * Hyperfocal Distance in meters
 * Formula: H = (f^2 / (N * c)) + f
 * f in mm, N = aperture, c = circle of confusion in mm
 */
export function calculateHyperfocal(focalLengthMm: number, aperture: number, sensorKey: string): number {
  const sensor = SENSOR_PRESETS[sensorKey] || SENSOR_PRESETS['full-frame'];
  const f = focalLengthMm;
  const c = sensor.coc;
  const N = aperture;
  // Result in mm, convert to meters
  const hMm = (f * f) / (N * c) + f;
  return hMm / 1000;
}

/**
 * Depth of Field Calculation
 * Returns near limit, far limit, total DoF in meters
 */
export function calculateDepthOfField(
  focalLengthMm: number,
  aperture: number,
  subjectDistanceM: number,
  sensorKey: string
): { nearM: number; farM: number | 'infinity'; totalM: number | 'infinity'; hyperfocalM: number } {
  const H = calculateHyperfocal(focalLengthMm, aperture, sensorKey);
  const s = subjectDistanceM;
  const fM = focalLengthMm / 1000;

  // Near limit: (H * s) / (H + (s - f))
  const nearM = (H * s) / (H + (s - fM));

  // Far limit: (H * s) / (H - (s - f))
  let farM: number | 'infinity';
  let totalM: number | 'infinity';

  if (s >= H) {
    farM = 'infinity';
    totalM = 'infinity';
  } else {
    const denom = H - (s - fM);
    if (denom <= 0) {
      farM = 'infinity';
      totalM = 'infinity';
    } else {
      farM = (H * s) / denom;
      totalM = farM - nearM;
    }
  }

  return {
    nearM: Math.max(0.1, nearM),
    farM,
    totalM,
    hyperfocalM: H,
  };
}

/**
 * Calculates physical circle of confusion blur in canvas pixels for a visual layer at distance D
 * using geometric optics:
 * CoC_on_sensor = (|D - s| / D) * (f / (s - f)) * (f / N)
 * 
 * If D is within the Depth of Field ([nearM, farM]), the blur is below the acceptable CoC threshold (sharp).
 * Outside the DOF, the blur increases with distance from the focus plane.
 */
export function calculateLayerBlurPx(
  layerDistanceM: number,
  focusDistanceM: number,
  focalLengthMm: number,
  aperture: number,
  sensorKey: string = 'full-frame'
): number {
  const sensor = SENSOR_PRESETS[sensorKey] || SENSOR_PRESETS['full-frame'];
  const cocMm = sensor.coc; // sensor circle of confusion in mm (e.g. 0.030mm for 35mm full-frame)
  const fMm = focalLengthMm;
  const fM = fMm / 1000;
  const sM = Math.max(fM + 0.05, focusDistanceM);
  const DM = Math.max(0.1, layerDistanceM);

  // Optical aperture diameter (entrance pupil) in mm
  const entrancePupilMm = fMm / Math.max(0.7, aperture);

  // Geometric circle of confusion on sensor in mm:
  // c = (|D - s| / D) * (f / (s - f)) * entrancePupil
  const distanceRatio = Math.abs(DM - sM) / DM;
  const magnificationFactor = fM / (sM - fM);
  const cocOnSensorMm = distanceRatio * magnificationFactor * entrancePupilMm;

  // Acceptable sharpness threshold: within the sensor's acceptable CoC limit
  if (cocOnSensorMm <= cocMm) {
    return 0;
  }

  // Excess blur above acceptable circle of confusion:
  const excessCocRatio = (cocOnSensorMm - cocMm) / cocMm;

  // Convert to visual canvas pixels with natural optical roll-off:
  // 50mm f/1.4 s=2.3m -> ~7.8px (distinct, soft cinematic background)
  // 50mm f/2.8 s=2.3m -> ~5.4px (moderately softer)
  // 50mm f/8.0 s=2.3m -> ~2.9px (significantly sharper)
  // 50mm f/16  s=2.3m -> ~1.7px (substantially sharper, approaching crisp)
  const visualBlurPx = Math.min(10.0, Math.sqrt(excessCocRatio) * 1.55);

  return parseFloat(visualBlurPx.toFixed(2));
}

/**
 * Minimum Focus Distance estimation (typical cinema prime lens)
 * approx 5 to 10 times focal length depending on design
 */
export function calculateMinFocusDistance(focalLengthMm: number): number {
  // Typical minimum focus distance in meters: approx 0.25m for wide up to 1.2m for 135mm
  return Math.max(0.2, (focalLengthMm * 0.007) + 0.1);
}

/**
 * Perspective compression factor relative to standard 50mm
 */
export function calculateCompressionFactor(focalLengthMm: number): number {
  return focalLengthMm / 50;
}

/**
 * Exposure Value (EV100)
 * EV = log2(N^2 / t)
 * where N is aperture, t is shutter time in seconds
 */
export function calculateEV(aperture: number, shutterSpeedSec: number, iso: number): number {
  const ev100 = Math.log2((aperture * aperture) / shutterSpeedSec);
  const isoCorrection = Math.log2(iso / 100);
  return ev100 - isoCorrection;
}

/**
 * Shutter angle to shutter speed in seconds
 * t = angle / (360 * fps)
 */
export function shutterAngleToSpeed(angleDeg: number, fps: number): number {
  return angleDeg / (360 * fps);
}

/**
 * Format shutter speed into friendly fractions like 1/48s or decimal
 */
export function formatShutterSpeed(seconds: number): string {
  if (seconds >= 1) {
    return `${seconds.toFixed(1)}s`;
  }
  const denominator = Math.round(1 / seconds);
  return `1/${denominator}s`;
}

/**
 * Unit conversion helpers
 */
export function convertDistance(valueInMeters: number, toUnit: string): number {
  switch (toUnit) {
    case 'mm':
      return valueInMeters * 1000;
    case 'cm':
      return valueInMeters * 100;
    case 'm':
      return valueInMeters;
    case 'in':
      return valueInMeters * 39.3701;
    case 'ft':
      return valueInMeters * 3.28084;
    default:
      return valueInMeters;
  }
}

export function convertToMeters(value: number, fromUnit: string): number {
  switch (fromUnit) {
    case 'mm':
      return value / 1000;
    case 'cm':
      return value / 100;
    case 'm':
      return value;
    case 'in':
      return value / 39.3701;
    case 'ft':
      return value / 3.28084;
    default:
      return value;
  }
}

/**
 * Kelvin to approximate RGB color hex string
 * Tanner Helland algorithm for blackbody radiation
 */
export function kelvinToRgb(kelvin: number): { r: number; g: number; b: number; hex: string } {
  const temp = Math.max(1000, Math.min(40000, kelvin)) / 100;
  let red: number;
  let green: number;
  let blue: number;

  // Red
  if (temp <= 66) {
    red = 255;
  } else {
    red = temp - 60;
    red = 329.698727446 * Math.pow(red, -0.1332047592);
    if (red < 0) red = 0;
    if (red > 255) red = 255;
  }

  // Green
  if (temp <= 66) {
    green = temp;
    green = 99.4708025861 * Math.log(green) - 161.1195681661;
  } else {
    green = temp - 60;
    green = 288.1221695283 * Math.pow(green, -0.0755148492);
  }
  if (green < 0) green = 0;
  if (green > 255) green = 255;

  // Blue
  if (temp >= 66) {
    blue = 255;
  } else if (temp <= 19) {
    blue = 0;
  } else {
    blue = temp - 10;
    blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
    if (blue < 0) blue = 0;
    if (blue > 255) blue = 255;
  }

  const r = Math.round(red);
  const g = Math.round(green);
  const b = Math.round(blue);
  const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

  return { r, g, b, hex };
}

/**
 * Aspect Ratio Matte calculation for a 1920x1080 canvas
 */
export function calculateAspectMattes(targetRatio: number, baseWidth = 1920, baseHeight = 1080): {
  visibleWidth: number;
  visibleHeight: number;
  letterboxHeight: number;
  pillarboxWidth: number;
  cropPercent: number;
} {
  const baseRatio = baseWidth / baseHeight; // 1.7778

  if (targetRatio >= baseRatio) {
    // Letterboxed (wider than 16:9, e.g. 2.39:1)
    const visibleHeight = baseWidth / targetRatio;
    const letterboxHeight = Math.max(0, (baseHeight - visibleHeight) / 2);
    const visibleWidth = baseWidth;
    const cropPercent = ((baseHeight - visibleHeight) / baseHeight) * 100;

    return {
      visibleWidth: Math.round(visibleWidth),
      visibleHeight: Math.round(visibleHeight),
      letterboxHeight: Math.round(letterboxHeight),
      pillarboxWidth: 0,
      cropPercent: Math.round(cropPercent * 10) / 10,
    };
  } else {
    // Pillarboxed (taller than 16:9, e.g. 4:3, 1:1, 9:16)
    const visibleWidth = baseHeight * targetRatio;
    const pillarboxWidth = Math.max(0, (baseWidth - visibleWidth) / 2);
    const visibleHeight = baseHeight;
    const cropPercent = ((baseWidth - visibleWidth) / baseWidth) * 100;

    return {
      visibleWidth: Math.round(visibleWidth),
      visibleHeight: Math.round(visibleHeight),
      letterboxHeight: 0,
      pillarboxWidth: Math.round(pillarboxWidth),
      cropPercent: Math.round(cropPercent * 10) / 10,
    };
  }
}
