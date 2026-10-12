/**
 * solarAtmosphere.ts
 * Continuous Day / Night Cycle Engine for F CAM Living Homepage.
 *
 * Provides a mathematically continuous 24-hour cycle synchronized
 * with the user's real local time (JavaScript `new Date()`):
 *  - Daytime: Sun rises on the left horizon at sunrise, arcs smoothly
 *    to peak zenith at solar noon, and descends to the right horizon at sunset.
 *  - Nighttime: Moon rises on the left horizon as the sun sets, arcs smoothly
 *    across the starry sky to peak zenith at midnight, and descends below the
 *    right horizon as the next sunrise approaches.
 *  - Real-time pacing: Derived directly from the current timestamp so that
 *    1 real minute = 1 real minute with zero drift or artificial acceleration.
 *  - Immediate sync on initial page load, refresh, and returning from background tabs.
 *  - High visual fidelity: warm dawn/dusk amber tints, soft cloud colors, glowing
 *    skyline windows at night, and canonical daytime aesthetic.
 */

export type TimeOfDayPhase =
  | 'astronomical-dawn'
  | 'nautical-dawn'
  | 'civil-dawn'
  | 'sunrise'
  | 'morning'
  | 'day'
  | 'golden-hour'
  | 'sunset'
  | 'dusk'
  | 'night';

export interface AtmosphereLighting {
  cycleProgress: number; // 0.0 to 1.0 (0=sunrise, 0.25=midday, 0.5=sunset, 0.75=midnight, 1.0=next sunrise)
  phase: TimeOfDayPhase;
  phaseLabel: string;
  isDay: boolean;
  // Sky Gradients (top, mid, bottom)
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  // Celestial elements - Sun
  sunVisible: boolean;
  sunX: number; // in 1920 SVG space
  sunY: number; // in 1080 SVG space
  sunOpacity: number;
  sunColor: string;
  sunGlowColor: string;
  sunGlowOpacity: number;
  sunRadius: number;
  // Celestial elements - Moon & stars
  moonVisible: boolean;
  moonX: number;
  moonY: number;
  moonOpacity: number;
  moonPhaseIndex: number;
  starsOpacity: number;
  // Clouds styling
  cloudTop: string;
  cloudMid: string;
  cloudBottom: string;
  cloudShadowColor: string;
  cloudShadowOpacity: number;
  cloudOpacity: number;
  // Buildings lighting & window glows
  buildingWarmTint: string;
  buildingWarmOpacity: number;
  buildingShadowMultiplier: number;
  windowGlowOpacity: number;
  windowGlowColor: string;
  // Characters & rooftop environmental ambient tint
  ambientTint: string;
  ambientTintOpacity: number;
  solarElevation: number;
  shadowLength: number;
  shadowOpacity: number;
}

// Color interpolation helpers (RGBA / HEX)
interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): RGB {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((char) => char + char).join('');
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

export function lerpColor(c1: string, c2: string, t: number): string {
  const clampedT = Math.max(0, Math.min(1, t));
  const rgb1 = hexToRgb(c1);
  const rgb2 = hexToRgb(c2);
  return rgbToHex({
    r: rgb1.r + (rgb2.r - rgb1.r) * clampedT,
    g: rgb1.g + (rgb2.g - rgb1.g) * clampedT,
    b: rgb1.b + (rgb2.b - rgb1.b) * clampedT,
  });
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

/**
 * Calculates approximate sunrise and sunset in fractional hours (0.0 to 24.0)
 * using the date's day of year for a standard mid-latitude temperate benchmark (~37°).
 * Does not require any geolocation permission or network requests.
 *
 * Examples:
 *  - Equinox (March/Sept): sunrise ≈ 06:00, solar noon = 12:00, sunset ≈ 18:00
 *  - Summer: sunrise ≈ 05:30, solar noon = 12:00, sunset ≈ 18:30
 *  - Winter: sunrise ≈ 06:30, solar noon = 12:00, sunset ≈ 17:30
 */
export function getApproximateSunTimes(date: Date = new Date()): {
  sunrise: number;
  sunset: number;
  solarNoon: number;
  dayLength: number;
} {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000) + 1;

  // Approximate solar declination (radians)
  const declination = 0.409 * Math.sin(((2 * Math.PI) / 365) * (dayOfYear - 81));
  const lat = (37.0 * Math.PI) / 180; // temperate mid-latitude benchmark
  const cosHour = -Math.tan(lat) * Math.tan(declination);
  const clampedCos = Math.max(-0.85, Math.min(0.85, cosHour));
  const halfDayHours = (Math.acos(clampedCos) * 12) / Math.PI;

  const solarNoon = 12.0;
  const sunrise = Math.round((solarNoon - halfDayHours) * 100) / 100;
  const sunset = Math.round((solarNoon + halfDayHours) * 100) / 100;
  const dayLength = sunset - sunrise;

  return { sunrise, sunset, solarNoon, dayLength };
}

/**
 * Derives cycle progress [0.0, 1.0) directly from a JavaScript `Date` timestamp:
 *
 *  - Daytime (sunrise <= current local time < sunset):
 *      progress sweeps smoothly from 0.00 (sunrise)
 *      through 0.25 (solar noon, sun at peak zenith)
 *      to 0.50 (sunset, sun descending into horizon).
 *
 *  - Nighttime (sunset <= current local time < next sunrise):
 *      progress sweeps smoothly from 0.50 (sunset, moon rising)
 *      through 0.75 (midnight, moon at peak zenith, warm glowing windows)
 *      to 1.00 / 0.00 (sunrise, moon setting).
 */
export function getCycleProgressFromDate(
  date: Date = new Date(),
  customSunrise?: number,
  customSunset?: number
): number {
  // Current local time as fractional hours (0.000000 to 23.999999)
  const hours =
    date.getHours() +
    date.getMinutes() / 60 +
    date.getSeconds() / 3600 +
    date.getMilliseconds() / 3600000;

  const { sunrise: approxSunrise, sunset: approxSunset } = getApproximateSunTimes(date);
  const sunrise = customSunrise ?? approxSunrise;
  const sunset = customSunset ?? approxSunset;

  if (hours >= sunrise && hours < sunset) {
    // Daytime portion: maps [sunrise, sunset] -> [0.0, 0.5]
    const dayProgress = (hours - sunrise) / (sunset - sunrise);
    return Math.max(0, Math.min(0.5, dayProgress * 0.5));
  } else {
    // Nighttime portion: maps [sunset, next sunrise] -> [0.5, 1.0]
    const nightDuration = 24 - (sunset - sunrise);
    const elapsedNight = hours >= sunset ? hours - sunset : hours + (24 - sunset);
    const nightProgress = elapsedNight / nightDuration;
    return Math.max(0.5, Math.min(1.0, 0.5 + nightProgress * 0.5));
  }
}

/**
 * Calculates continuous celestial positions and atmospheric colors
 * based on cycle progress p in [0, 1):
 *
 *  - p = 0.00: Sunrise (sun rises on the left horizon, x ≈ 240, y ≈ 740)
 *  - p = 0.125: Morning (sun ascends diagonally, sky turns blue)
 *  - p = 0.25: Midday / Solar Noon (sun reaches peak zenith at x ≈ 995, y ≈ 220)
 *  - p = 0.375: Golden hour / late afternoon (sun heads toward right horizon)
 *  - p = 0.50: Sunset (sun sets into right horizon, dusk glows pink/violet)
 *  - p = 0.50 -> 0.52: Moon begins rising from left horizon as sun disappears below right horizon
 *  - p = 0.625: Midnight approach (moon climbing through starry indigo sky)
 *  - p = 0.75: Midnight (moon at peak zenith at x ≈ 995, y ≈ 260, windows glowing warmly, full starry night)
 *  - p = 0.875: Pre-dawn (moon descending toward right horizon, stars subtly softening)
 *  - p = 0.98 -> 1.00: Moon sinks below right horizon as sunrise breaks on the left
 */
export function getContinuousAtmosphere(p: number): AtmosphereLighting {
  // Normalize progress to [0, 1)
  const normP = ((p % 1) + 1) % 1;

  // Key phases determination
  let phase: TimeOfDayPhase = 'day';
  let phaseLabel = 'Daytime';

  if (normP >= 0.95 || normP < 0.05) {
    phase = 'sunrise';
    phaseLabel = 'Sunrise';
  } else if (normP >= 0.05 && normP < 0.18) {
    phase = 'morning';
    phaseLabel = 'Morning';
  } else if (normP >= 0.18 && normP < 0.38) {
    phase = 'day';
    phaseLabel = 'Sunny Midday';
  } else if (normP >= 0.38 && normP < 0.46) {
    phase = 'golden-hour';
    phaseLabel = 'Golden Hour';
  } else if (normP >= 0.46 && normP < 0.54) {
    phase = 'sunset';
    phaseLabel = 'Sunset';
  } else if (normP >= 0.54 && normP < 0.60) {
    phase = 'dusk';
    phaseLabel = 'Blue Hour (Dusk)';
  } else {
    phase = 'night';
    phaseLabel = 'Starry Night';
  }

  // ================= CELESTIAL TRAJECTORY =================
  // Day spans normP in [0.0, 0.5].
  // Night spans normP in [0.5, 1.0].
  const isDay = normP >= 0.0 && normP < 0.5;

  // Horizon boundaries for 1920x1080 viewBox:
  // Left horizon: x=240, y=740
  // Peak zenith: x=995, y=220 (day) / y=260 (night)
  // Right horizon: x=1750, y=740
  let sunVisible = false;
  let sunX = -200;
  let sunY = 1200;
  let sunOpacity = 0;
  let sunRadius = 75;
  let sunColor = '#ffd83b';
  let sunGlowColor = '#ffeaa7';
  let sunGlowOpacity = 0.35;

  let moonVisible = false;
  let moonX = -200;
  let moonY = 1200;
  let moonOpacity = 0;
  let moonPhaseIndex = 3;

  // Sun Path (active when normP ∈ [0, 0.52])
  if (normP >= 0 && normP <= 0.52) {
    const tSun = normP / 0.5; // 0 at sunrise -> 1 at sunset
    sunVisible = true;

    // Smooth sinusoidal / parabolic arc
    // Horizontal traversal: left (240) to right (1750)
    sunX = lerp(240, 1750, Math.min(1, tSun));
    // Vertical traversal: starts at 740, curves up to 220 at midday (t=0.5), descends to 740
    // sin(π * tSun) peaks at 1 when tSun = 0.5
    const heightFactor = Math.sin(Math.PI * Math.min(1, tSun));
    sunY = 740 - heightFactor * 520; // 740 - 520 = 220 at peak

    // Smooth opacity fade near horizons so it never pops abruptly
    if (tSun < 0.06) {
      sunOpacity = tSun / 0.06;
    } else if (tSun > 0.94) {
      sunOpacity = Math.max(0, (1 - tSun) / 0.06);
    } else {
      sunOpacity = 1.0;
    }

    // Solar color shifting: warm coral/amber at sunrise/sunset, crisp gold at noon
    if (tSun < 0.15) {
      // Sunrise transition
      const sFac = tSun / 0.15;
      sunColor = lerpColor('#ff6b4a', '#ffd152', sFac);
      sunGlowColor = '#ff8c42';
      sunGlowOpacity = lerp(0.65, 0.45, sFac);
      sunRadius = lerp(70, 75, sFac);
    } else if (tSun > 0.85) {
      // Sunset transition
      const sFac = (tSun - 0.85) / 0.15;
      sunColor = lerpColor('#ffd152', '#ff5a36', sFac);
      sunGlowColor = '#ff4d00';
      sunGlowOpacity = lerp(0.45, 0.7, sFac);
      sunRadius = lerp(75, 78, sFac);
    } else {
      // Midday
      sunColor = '#ffd83b';
      sunGlowColor = '#ffeaa7';
      sunGlowOpacity = 0.35;
      sunRadius = 75;
    }
  }

  // Moon Path (active when normP ∈ [0.49, 1.0] or [0.0, 0.01])
  if (normP >= 0.49 || normP <= 0.01) {
    let tMoon = 0;
    if (normP >= 0.49) {
      tMoon = (normP - 0.49) / 0.52;
    } else {
      tMoon = (normP + 0.51) / 0.52;
    }
    tMoon = Math.max(0, Math.min(1, tMoon));

    moonVisible = true;
    // Traversal from left horizon to right horizon across nighttime
    moonX = lerp(240, 1750, tMoon);
    const heightFactor = Math.sin(Math.PI * tMoon);
    moonY = 740 - heightFactor * 480; // curves up to ~260 at midnight (t=0.5)

    // Smooth opacity fade near horizon entrance/exit
    if (tMoon < 0.08) {
      moonOpacity = (tMoon / 0.08) * 0.95;
    } else if (tMoon > 0.92) {
      moonOpacity = Math.max(0, ((1 - tMoon) / 0.08) * 0.95);
    } else {
      moonOpacity = 0.95;
    }
  }

  // ================= SKY GRADIENTS & ENVIRONMENT =================
  let skyTop = '#1a73e8';
  let skyMid = '#1e7bf2';
  let skyBottom = '#1b6dd9';

  let cloudTop = '#ffffff';
  let cloudMid = '#ffffff';
  let cloudBottom = '#dce8f9';
  let cloudShadowColor = '#0d47a1';
  let cloudShadowOpacity = 0.12;
  let cloudOpacity = 1.0;

  let windowGlowOpacity = 0;
  const windowGlowColor = '#ffe082';
  let buildingWarmTint = '#ffd83b';
  let buildingWarmOpacity = 0;
  const buildingShadowMultiplier = 1.0;

  let ambientTint = '#ffffff';
  let ambientTintOpacity = 0;
  let starsOpacity = 0;

  // Segmented continuous color interpolation across [0, 1]
  if (normP < 0.08) {
    // 0.00 -> 0.08: Sunrise into Early Morning
    const f = normP / 0.08;
    skyTop = lerpColor('#1b3260', '#1a73e8', f);
    skyMid = lerpColor('#d06450', '#1e7bf2', f);
    skyBottom = lerpColor('#ffaa5a', '#1b6dd9', f);

    cloudTop = lerpColor('#ffe5ec', '#ffffff', f);
    cloudMid = lerpColor('#ffb4a2', '#ffffff', f);
    cloudBottom = lerpColor('#e5989b', '#dce8f9', f);
    cloudShadowColor = lerpColor('#4a2545', '#0d47a1', f);
    cloudShadowOpacity = lerp(0.25, 0.12, f);

    windowGlowOpacity = lerp(0.5, 0, f);
    buildingWarmTint = '#e76f51';
    buildingWarmOpacity = lerp(0.28, 0, f);
    ambientTint = '#f4a261';
    ambientTintOpacity = lerp(0.2, 0, f);
    starsOpacity = 0;
  } else if (normP < 0.38) {
    // 0.08 -> 0.38: Pure Daytime (F CAM Canonical Visual Baseline)
    skyTop = '#1a73e8';
    skyMid = '#1e7bf2';
    skyBottom = '#1b6dd9';

    cloudTop = '#ffffff';
    cloudMid = '#ffffff';
    cloudBottom = '#dce8f9';
    cloudShadowColor = '#0d47a1';
    cloudShadowOpacity = 0.12;
    cloudOpacity = 1.0;

    windowGlowOpacity = 0;
    buildingWarmOpacity = 0;
    ambientTintOpacity = 0;
    starsOpacity = 0;
  } else if (normP < 0.46) {
    // 0.38 -> 0.46: Daytime to Golden Hour
    const f = (normP - 0.38) / 0.08;
    skyTop = lerpColor('#1a73e8', '#254e85', f);
    skyMid = lerpColor('#1e7bf2', '#da7b38', f);
    skyBottom = lerpColor('#1b6dd9', '#fca311', f);

    cloudTop = lerpColor('#ffffff', '#fff5eb', f);
    cloudMid = lerpColor('#ffffff', '#fbd1a2', f);
    cloudBottom = lerpColor('#dce8f9', '#e07a5f', f);
    cloudShadowColor = lerpColor('#0d47a1', '#703816', f);
    cloudShadowOpacity = lerp(0.12, 0.22, f);

    windowGlowOpacity = lerp(0, 0.3, f);
    buildingWarmTint = '#d4651f';
    buildingWarmOpacity = lerp(0, 0.3, f);
    ambientTint = '#f48c06';
    ambientTintOpacity = lerp(0, 0.25, f);
    starsOpacity = 0;
  } else if (normP < 0.54) {
    // 0.46 -> 0.54: Sunset into Twilight
    const f = (normP - 0.46) / 0.08;
    skyTop = lerpColor('#254e85', '#161935', f);
    skyMid = lerpColor('#da7b38', '#7b2d56', f);
    skyBottom = lerpColor('#fca311', '#c73e46', f);

    cloudTop = lerpColor('#fff5eb', '#f28482', f);
    cloudMid = lerpColor('#fbd1a2', '#a23b72', f);
    cloudBottom = lerpColor('#dce8f9', '#491131', f);
    cloudShadowColor = lerpColor('#703816', '#2b0922', f);
    cloudShadowOpacity = lerp(0.22, 0.3, f);

    windowGlowOpacity = lerp(0.3, 0.75, f);
    buildingWarmTint = '#c1121f';
    buildingWarmOpacity = lerp(0.3, 0.25, f);
    ambientTint = '#d90429';
    ambientTintOpacity = lerp(0.25, 0.2, f);
    starsOpacity = lerp(0, 0.25, f);
  } else if (normP < 0.62) {
    // 0.54 -> 0.62: Dusk (Blue Hour) into Deep Night
    const f = (normP - 0.54) / 0.08;
    skyTop = lerpColor('#161935', '#060a17', f);
    skyMid = lerpColor('#7b2d56', '#0b1428', f);
    skyBottom = lerpColor('#c73e46', '#12203e', f);

    cloudTop = lerpColor('#f28482', '#1a2947', f);
    cloudMid = lerpColor('#a23b72', '#17233d', f);
    cloudBottom = lerpColor('#491131', '#101a2e', f);
    cloudShadowColor = lerpColor('#2b0922', '#020610', f);
    cloudShadowOpacity = lerp(0.3, 0.35, f);
    cloudOpacity = lerp(0.95, 0.75, f);

    windowGlowOpacity = lerp(0.75, 0.95, f);
    buildingWarmTint = lerpColor('#c1121f', '#101e38', f);
    buildingWarmOpacity = lerp(0.25, 0.45, f);
    ambientTint = lerpColor('#d90429', '#09152e', f);
    ambientTintOpacity = lerp(0.2, 0.38, f);
    starsOpacity = lerp(0.25, 0.9, f);
  } else if (normP < 0.92) {
    // 0.62 -> 0.92: Deep Starry Night (Midnight peak)
    skyTop = '#060a17';
    skyMid = '#0b1428';
    skyBottom = '#12203e';

    cloudTop = '#1a2947';
    cloudMid = '#17233d';
    cloudBottom = '#101a2e';
    cloudShadowColor = '#020610';
    cloudShadowOpacity = 0.35;
    cloudOpacity = 0.75;

    windowGlowOpacity = 0.95;
    buildingWarmTint = '#101e38';
    buildingWarmOpacity = 0.45;
    ambientTint = '#09152e';
    ambientTintOpacity = 0.38;
    starsOpacity = 0.92;
  } else {
    // 0.92 -> 1.00: Pre-dawn transition returning seamlessly to Sunrise
    const f = (normP - 0.92) / 0.08;
    skyTop = lerpColor('#060a17', '#1b3260', f);
    skyMid = lerpColor('#0b1428', '#d06450', f);
    skyBottom = lerpColor('#12203e', '#ffaa5a', f);

    cloudTop = lerpColor('#1a2947', '#ffe5ec', f);
    cloudMid = lerpColor('#17233d', '#ffb4a2', f);
    cloudBottom = lerpColor('#101a2e', '#e5989b', f);
    cloudShadowColor = lerpColor('#020610', '#4a2545', f);
    cloudShadowOpacity = lerp(0.35, 0.25, f);
    cloudOpacity = lerp(0.75, 0.95, f);

    windowGlowOpacity = lerp(0.95, 0.5, f);
    buildingWarmTint = lerpColor('#101e38', '#e76f51', f);
    buildingWarmOpacity = lerp(0.45, 0.28, f);
    ambientTint = lerpColor('#09152e', '#f4a261', f);
    ambientTintOpacity = lerp(0.38, 0.2, f);
    starsOpacity = lerp(0.92, 0, f);
  }

  return {
    cycleProgress: normP,
    phase,
    phaseLabel,
    isDay,
    skyTop,
    skyMid,
    skyBottom,
    sunVisible,
    sunX,
    sunY,
    sunOpacity,
    sunColor,
    sunGlowColor,
    sunGlowOpacity,
    sunRadius,
    moonVisible,
    moonX,
    moonY,
    moonOpacity,
    moonPhaseIndex,
    starsOpacity,
    cloudTop,
    cloudMid,
    cloudBottom,
    cloudShadowColor,
    cloudShadowOpacity,
    cloudOpacity,
    buildingWarmTint,
    buildingWarmOpacity,
    buildingShadowMultiplier,
    windowGlowOpacity,
    windowGlowColor,
    ambientTint,
    ambientTintOpacity,
    solarElevation: isDay ? Math.sin(Math.PI * Math.min(1, normP / 0.5)) * 60 : -30,
    shadowLength: isDay ? 24 + (1 - Math.sin(Math.PI * Math.min(1, normP / 0.5))) * 30 : 20,
    shadowOpacity: isDay ? 0.28 * sunOpacity : 0,
  };
}

/**
 * Convenience helper to get AtmosphereLighting directly for a given Date.
 */
export function getAtmosphereForDate(date: Date = new Date()): AtmosphereLighting {
  const p = getCycleProgressFromDate(date);
  return getContinuousAtmosphere(p);
}
