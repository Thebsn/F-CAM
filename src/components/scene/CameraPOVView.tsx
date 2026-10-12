import React, { useRef, useEffect } from 'react';
import {
  CameraAngle,
  ShotType,
  CompositionGuide,
  LightingPattern,
  CameraMovement,
  ColorHarmony,
  FilmLanguageConcept,
  SENSOR_PRESETS,
} from '../../types/cinematography';
import { FilmLanguageOverlay, FilmLanguageState } from './FilmLanguageOverlay';
import { kelvinToRgb, calculateLayerBlurPx } from '../../utils/calculations';
import { renderCameraPOVToCanvas, RenderSceneOptions } from './canvasRenderer';
import { CharacterExpression } from '../character/masterCharacterCanvas';

export interface CameraPOVViewProps {
  // Optical
  focalLengthMm?: number;
  distanceM?: number;
  aperture?: number;
  sensorKey?: string;

  // Exposure
  exposureEV?: number;
  iso?: number;
  shutterSpeedSec?: number;
  showFalseColor?: boolean;
  showZebra?: boolean;

  // Angle & Framing
  cameraAngle?: CameraAngle;
  shotType?: ShotType;
  customPitchDeg?: number;
  customRollDeg?: number;
  customHeightM?: number;

  // Composition
  compositionGuide?: CompositionGuide | null;
  showGrid?: boolean;

  // Lighting
  keyIntensity?: number; // 0 - 100
  keyAngleDeg?: number; // -90 to +90
  fillIntensity?: number; // 0 - 100
  fillAngleDeg?: number; // -90 to +90
  rimIntensity?: number; // 0 - 100
  rimAngleDeg?: number; // -180 to +180
  lightingPattern?: LightingPattern;
  lightKelvin?: number;
  lightDistanceM?: number;
  fillDistanceM?: number;
  rimDistanceM?: number;
  isLightingInteractive?: boolean;
  isStudioLighting?: boolean;
  keyPos?: { x: number; y: number };
  fillPos?: { x: number; y: number };
  rimPos?: { x: number; y: number };
  keyRotationDeg?: number;
  fillRotationDeg?: number;
  rimRotationDeg?: number;
  selectedLight?: 'key' | 'fill' | 'rim';
  onSelectLight?: (light: 'key' | 'fill' | 'rim') => void;
  onKeyLightChange?: (data: { x: number; y: number; distanceM: number; angleDeg: number; rotationDeg: number }) => void;
  onFillLightChange?: (data: { x: number; y: number; distanceM: number; angleDeg: number; rotationDeg: number }) => void;
  onRimLightChange?: (data: { x: number; y: number; distanceM: number; angleDeg: number; rotationDeg: number }) => void;
  onKeyLightDrag?: (distanceM: number, angleDeg: number) => void;
  onFillLightDrag?: (angleDeg: number) => void;
  onRimLightDrag?: (angleDeg: number) => void;

  // Movement
  movement?: CameraMovement;
  movementProgress?: number; // 0 to 1
  isMoving?: boolean;

  // Color & White Balance
  colorKelvin?: number; // 2000 - 10000
  tint?: number; // -50 to +50
  saturation?: number; // 0 to 200
  contrast?: number; // 50 to 150
  colorHarmony?: ColorHarmony;
  isColorReferenceScene?: boolean;

  // Motion & Frame Rate
  motionBlurPx?: number;

  // Aspect Ratio & Mattes
  letterboxHeight?: number;
  pillarboxWidth?: number;
  showSafeAreas?: boolean;

  // Film Language
  filmConcept?: FilmLanguageConcept;
  filmLanguageState?: FilmLanguageState;

  // UI Overlays
  customSubjectOffsetX?: number;
  customSubjectOffsetY?: number;
  customShotMultiplier?: number;
  guideOpacity?: number;
  showMeasurements?: boolean;
  customOverlayText?: string;
  className?: string;
}

// Module-level shared offscreen canvas for Dutch Angle / rotated projections
let sharedRotatedCanvas: HTMLCanvasElement | null = null;
function getSharedRotatedCanvas(): HTMLCanvasElement {
  if (!sharedRotatedCanvas) {
    sharedRotatedCanvas = document.createElement('canvas');
    sharedRotatedCanvas.width = 2400;
    sharedRotatedCanvas.height = 2400;
  }
  return sharedRotatedCanvas;
}

export const CameraPOVView: React.FC<CameraPOVViewProps> = React.memo(({
  focalLengthMm = 50,
  distanceM = 3.0,
  aperture = 2.8,
  sensorKey = 'full-frame',
  exposureEV = 12,
  iso = 400,
  showFalseColor = false,
  cameraAngle = 'eye-level',
  shotType = 'medium',
  customPitchDeg,
  customRollDeg,
  compositionGuide,
  keyIntensity = 80,
  keyAngleDeg = -45,
  fillIntensity = 40,
  fillAngleDeg = 40,
  rimIntensity = 60,
  rimAngleDeg = 135,
  lightingPattern = 'rembrandt',
  lightKelvin = 5600,
  lightDistanceM = 2.2,
  fillDistanceM = 2.5,
  rimDistanceM = 2.0,
  isLightingInteractive = false,
  isStudioLighting = false,
  isColorReferenceScene = false,
  keyPos,
  fillPos,
  rimPos,
  keyRotationDeg,
  fillRotationDeg,
  rimRotationDeg,
  selectedLight = 'key',
  onSelectLight,
  onKeyLightChange,
  onFillLightChange,
  onRimLightChange,
  onKeyLightDrag,
  onFillLightDrag,
  onRimLightDrag,
  movement = 'static',
  movementProgress = 0,
  colorKelvin = 5600,
  tint = 0,
  saturation = 100,
  contrast = 100,
  colorHarmony = 'natural',
  motionBlurPx = 0,
  letterboxHeight = 0,
  pillarboxWidth = 0,
  showSafeAreas = false,
  filmConcept,
  filmLanguageState,
  customSubjectOffsetX = 0,
  customSubjectOffsetY = 0,
  customShotMultiplier = 1.0,
  guideOpacity = 0.8,
  showMeasurements = true,
  customOverlayText,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafIdRef = useRef<number | null>(null);

  // 1. SENSOR & OPTICAL MAGNIFICATION
  const sensor = SENSOR_PRESETS[sensorKey] || SENSOR_PRESETS['full-frame'];
  const cropFactor = sensor.cropFactor;
  const effectiveFocal = focalLengthMm * cropFactor;

  // 2. PRIMARY SCREEN-SPACE FRAMING ANCHOR (FACE/EYE ANCHOR)
  // Dedicated normalized face anchor:
  // faceAnchorX = 0.50 (X = 960 in 1920 canvas)
  // faceAnchorY = 0.42 (Y = 453.6px in 1080 canvas)
  const normalizedFaceAnchorX = 0.50;
  const normalizedFaceAnchorY = 0.42;

  let subjectOffsetX = customSubjectOffsetX;
  let subjectOffsetY = customSubjectOffsetY;

  let shotMultiplier = customShotMultiplier;
  switch (shotType) {
    case 'extreme-wide':
      shotMultiplier *= 0.42;
      break;
    case 'wide':
      shotMultiplier *= 0.68;
      break;
    case 'full':
      shotMultiplier *= 0.95;
      break;
    case 'medium':
      shotMultiplier *= 1.0;
      break;
    case 'medium-close-up':
      shotMultiplier *= 1.45;
      break;
    case 'close-up':
      shotMultiplier *= 2.2;
      break;
    case 'extreme-close-up':
      shotMultiplier *= 3.6;
      break;
    case 'ots':
      shotMultiplier *= 1.25;
      subjectOffsetX += 120;
      break;
    case 'two-shot':
      shotMultiplier *= 0.9;
      subjectOffsetX += 140;
      break;
    case 'reaction':
      shotMultiplier *= 1.8;
      break;
    case 'insert':
      shotMultiplier *= 2.6;
      break;
    case 'cutaway':
      shotMultiplier *= 0.6;
      break;
    default:
      shotMultiplier *= 1.0;
      break;
  }

  // Film Language Specific Subject Framing & Offsets
  if (filmLanguageState) {
    switch (filmLanguageState.concept) {
      case 'establishing':
        {
          const shot = filmLanguageState.establishingShot ?? (filmLanguageState.establishingScale === 'wide' ? 'medium' : 'wide');
          if (shot === 'wide') {
            shotMultiplier = 0.32;
            subjectOffsetX = 220;
            subjectOffsetY = 135;
          } else if (shot === 'medium') {
            shotMultiplier = 1.05;
            subjectOffsetX = 0;
            subjectOffsetY = 10;
          } else {
            shotMultiplier = 2.15;
            subjectOffsetX = 0;
            subjectOffsetY = -45;
          }
        }
        break;
      case 'master-shot':
        {
          const isCoverage = filmLanguageState.masterView === 'coverage';
          if (isCoverage) {
            // COVERAGE SHOT: Tighter medium framing focused directly on Actor A
            shotMultiplier = 1.45;
            subjectOffsetX = 320;
            subjectOffsetY = -20;
          } else {
            // MASTER SHOT: Balanced medium-wide framing covering both characters & environment
            shotMultiplier = 0.72;
            subjectOffsetX = 0;
            subjectOffsetY = 40;
          }
        }
        break;
      case 'reaction-shot':
        {
          const isReaction = filmLanguageState.reactionView === 'reaction';
          if (isReaction) {
            // REACTION SHOT: Close-up focusing on Actor B's reaction
            shotMultiplier = 2.15;
            subjectOffsetX = 0;
            subjectOffsetY = -50;
          } else {
            // ACTION SHOT: Two-shot setup showing Actor A speaking to Actor B
            shotMultiplier = 0.85;
            subjectOffsetX = 0;
            subjectOffsetY = 25;
          }
        }
        break;
      case 'coverage':
        switch (filmLanguageState.coverageShot) {
          case 'master':
            shotMultiplier = 0.68;
            subjectOffsetY = 40;
            break;
          case 'wide':
            shotMultiplier = 0.92;
            break;
          case 'medium':
            shotMultiplier = 1.0;
            break;
          case 'close':
            shotMultiplier = 2.15;
            break;
          case 'reaction':
            shotMultiplier = 1.8;
            subjectOffsetX = 110;
            break;
          case 'insert':
            shotMultiplier = 3.2;
            subjectOffsetY = 80;
            break;
        }
        break;
      case 'eye-trace':
        shotMultiplier = 0.95;
        subjectOffsetX = -360;
        subjectOffsetY = 20;
        break;
      case 'continuity':
        {
          const step = filmLanguageState.continuityStep ?? 1;
          if (step === 1) {
            // SHOT A — Before Cut: Standard medium framing
            shotMultiplier = 1.0;
            subjectOffsetX = 0;
            subjectOffsetY = 0;
          } else {
            // SHOT B — After Cut: Closer framing to emphasize the action and prop
            shotMultiplier = 1.48;
            subjectOffsetX = 0;
            subjectOffsetY = -35;
          }
        }
        break;
      case '180-degree':
        subjectOffsetX = 0;
        break;
      case '30-degree':
        {
          const phase = filmLanguageState.angle30Phase ?? (filmLanguageState.angle30ActiveShot === 'shot-a' ? 'shot-a' : 'shot-b');
          const angle = filmLanguageState.angle30DiffDeg ?? 30;

          if (phase === 'shot-a') {
            subjectOffsetX = 0;
            shotMultiplier = 1.0;
          } else if (phase === 'cut') {
            subjectOffsetX = 0;
          } else {
            // Shot B: Driven by angle30DiffDeg
            if (angle >= 30) {
              // SAFE CUT (30°+): Noticeably different framing & camera angle
              const ratio = Math.min(2.0, angle / 30);
              subjectOffsetX = Math.round(180 * ratio);
              subjectOffsetY = Math.round(20 * ratio);
              shotMultiplier = 1.0 + 0.32 * ratio;
            } else {
              // UNSAFE CUT (< 30°): Tiny, nearly identical change (accidental jump cut)
              const tinyRatio = Math.max(0.2, angle / 30);
              subjectOffsetX = Math.round(14 * tinyRatio);
              subjectOffsetY = Math.round(3 * tinyRatio);
              shotMultiplier = 1.0 + 0.015 * tinyRatio;
            }
          }
        }
        break;
      case 'jump-cut':
        {
          const isJumpShotB = filmLanguageState.jumpCutPhase
            ? filmLanguageState.jumpCutPhase === 'shot-b'
            : filmLanguageState.jumpCutState === 'shot-b';

          if (isJumpShotB) {
            const offsetFrames = filmLanguageState.jumpCutOffset ?? 48;
            const jumpRatio = Math.max(0.4, Math.min(2.5, offsetFrames / 48));
            subjectOffsetX += Math.round(180 * jumpRatio);
            subjectOffsetY += Math.round(42 * jumpRatio);
            shotMultiplier *= (1.0 + 0.12 * jumpRatio);
          }
        }
        break;
      case 'eyeline':
        {
          const eyelineDir = filmLanguageState.eyelineGazeDir ?? 'right';
          subjectOffsetX = eyelineDir === 'right' ? -280 : 280;
          shotMultiplier = 1.35;
        }
        break;
      case 'screen-direction':
        {
          const progress = filmLanguageState.screenDirProgress ?? (filmLanguageState.screenDirStep === 1 ? 0.3 : 0.7);
          const phase = filmLanguageState.screenDirPhase ?? (filmLanguageState.screenDirStep === 1 ? 'shot-a' : 'shot-b');
          const mode = filmLanguageState.screenDirMode ?? 'consistent';

          if (phase === 'shot-a') {
            // Shot A: Character travels from screen-left to screen-right
            subjectOffsetX = -450 + progress * 900;
          } else if (phase === 'cut') {
            subjectOffsetX = 0;
          } else {
            // Shot B:
            if (mode === 'consistent') {
              // Continuous: maintains movement screen-left to screen-right
              subjectOffsetX = -450 + progress * 900;
            } else {
              // Reversed: moves screen-right to screen-left
              subjectOffsetX = 450 - progress * 900;
            }
          }
        }
        break;
      case 'match-cut':
        subjectOffsetX = 0;
        break;
    }
  }

  // Camera angle vertical shift & pitch
  let pitchDeg = 0;
  let rollDeg = 0;
  let horizonShiftY = 0;

  switch (cameraAngle) {
    case 'eye-level':
      pitchDeg = 0;
      horizonShiftY = 0;
      break;
    case 'low-angle':
      pitchDeg = -20;
      horizonShiftY = 90;
      break;
    case 'high-angle':
      pitchDeg = 20;
      horizonShiftY = -90;
      break;
    case 'birds-eye':
      pitchDeg = 50;
      horizonShiftY = -210;
      break;
    case 'worms-eye':
      pitchDeg = -40;
      horizonShiftY = 170;
      break;
    case 'dutch-angle':
      rollDeg = 18;
      break;
    case 'overhead':
      pitchDeg = 70;
      horizonShiftY = -260;
      break;
    case 'ground-level':
      pitchDeg = -12;
      horizonShiftY = 130;
      break;
  }

  if (customPitchDeg !== undefined) pitchDeg = customPitchDeg;
  if (customRollDeg !== undefined) rollDeg = customRollDeg;

  // The locked face/eye anchor coordinates in the 1920x1080 viewport
  const faceAnchorX = 1920 * normalizedFaceAnchorX + subjectOffsetX;
  const faceAnchorY = 1080 * normalizedFaceAnchorY + subjectOffsetY + horizonShiftY * 0.4;

  // 3. OPTICAL FOCAL-LENGTH TRANSFORMATION
  const opticalMagnification = (effectiveFocal / 50) * (3.0 / Math.max(0.4, distanceM));
  const totalSubjectScale = Math.max(
    0.35,
    Math.min(3.8, shotMultiplier * Math.pow(opticalMagnification, 0.82))
  );

  // 4. WORLD CONSTRAINT: GROUND CONTACT
  const groundContactY = faceAnchorY + 358 * totalSubjectScale;

  // 5. BACKGROUND PERSPECTIVE COMPRESSION
  const bgScale = Math.max(0.68, Math.min(2.1, 0.74 + (effectiveFocal / 50) * 0.26));

  // 6. DEPTH OF FIELD BLUR (ACCURATE LAYER-BASED CIRCLE OF CONFUSION)
  // Distance positions for visual layers:
  // - Distant background (Skyline, Clouds, Sun): ~150m
  // - Midground stage (Parapet wall): ~5.5m
  // - Focus plane (Coping floor strip, contact shadow): distanceM (sharp reference plane)
  // - Subject reference plane (Actor): distanceM (sharp reference plane)
  const dofBlurDistant = calculateLayerBlurPx(150, distanceM, focalLengthMm, aperture, sensorKey);
  const dofBlurMidground = calculateLayerBlurPx(5.5, distanceM, focalLengthMm, aperture, sensorKey);
  const dofBlur = dofBlurDistant;

  // 7. MOVEMENT OFFSETS
  let moveX = 0;
  let moveY = 0;
  let moveZoom = 1.0;
  let moveRoll = 0;
  const p = movementProgress;

  switch (movement) {
    case 'pan':
      moveX = (p - 0.5) * 360;
      break;
    case 'tilt':
      moveY = (p - 0.5) * 220;
      break;
    case 'dolly-in':
      moveZoom = 1.0 + p * 0.45;
      break;
    case 'dolly-out':
      moveZoom = 1.3 - p * 0.4;
      break;
    case 'tracking':
    case 'truck':
      moveX = (p - 0.5) * 400;
      break;
    case 'pedestal':
    case 'crane':
      moveY = -(p - 0.5) * 260;
      break;
    case 'orbit':
    case 'arc':
      moveX = Math.sin(p * Math.PI * 2) * 150;
      moveY = Math.cos(p * Math.PI * 2) * 40;
      break;
    case 'zoom':
      moveZoom = 1.0 + p * 0.75;
      break;
    case 'dolly-zoom':
      moveZoom = 1.0 + p * 0.3;
      break;
    case 'whip-pan':
      moveX = (p - 0.5) * 700;
      break;
    case 'handheld':
      moveX = Math.sin(p * 18) * 5 + Math.cos(p * 11) * 3;
      moveY = Math.cos(p * 14) * 3 + Math.sin(p * 9) * 2.5;
      moveRoll = Math.sin(p * 12) * 0.7;
      break;
    case 'steadicam':
    case 'gimbal':
      moveX = Math.sin(p * 6) * 2.5;
      moveY = Math.cos(p * 5) * 1.8;
      break;
  }

  // 8. DUTCH ANGLE & CAMERA PROJECTION
  const totalRollDeg = rollDeg + moveRoll;

  // 9. EXPOSURE & TONE
  const exposureDelta = (exposureEV - 12) * 0.18;
  const brightnessMultiplier = Math.max(0.2, Math.min(2.5, 1.0 + exposureDelta));
  const lightColor = kelvinToRgb(lightKelvin);

  let customTone = '';
  if (!isColorReferenceScene) {
    if (colorHarmony === 'warm') {
      customTone = 'sepia(0.18) saturate(1.15) hue-rotate(-8deg)';
    } else if (colorHarmony === 'cool') {
      customTone = 'hue-rotate(20deg) saturate(1.08)';
    } else if (colorHarmony === 'monochromatic') {
      customTone = 'grayscale(1) contrast(1.18)';
    } else if (colorHarmony === 'complementary') {
      customTone = 'contrast(1.18) saturate(1.25)';
    }
  }

  // 10. LIGHT FIXTURE COORDINATES IN 1920x1080 VIEWPORT SPACE
  const keyDistPx = Math.max(160, Math.min(650, (lightDistanceM ?? 2.2) * 160));
  const keyRad = ((keyAngleDeg ?? -45) - 90) * (Math.PI / 180);
  const keyX = keyPos?.x ?? Math.max(90, Math.min(1830, faceAnchorX + keyDistPx * Math.cos(keyRad)));
  const keyY = keyPos?.y ?? Math.max(80, Math.min(1000, faceAnchorY + keyDistPx * Math.sin(keyRad) * 0.85));

  const fillDistPx = Math.max(160, Math.min(650, (fillDistanceM ?? 2.5) * 160));
  const fillRad = ((fillAngleDeg ?? 40) - 90) * (Math.PI / 180);
  const fillX = fillPos?.x ?? Math.max(90, Math.min(1830, faceAnchorX + fillDistPx * Math.cos(fillRad)));
  const fillY = fillPos?.y ?? Math.max(80, Math.min(1000, faceAnchorY + fillDistPx * Math.sin(fillRad) * 0.85));

  const rimDistPx = Math.max(160, Math.min(650, (rimDistanceM ?? 2.0) * 160));
  const rimRad = ((rimAngleDeg ?? 135) - 90) * (Math.PI / 180);
  const rimX = rimPos?.x ?? Math.max(90, Math.min(1830, faceAnchorX + rimDistPx * Math.cos(rimRad)));
  const rimY = rimPos?.y ?? Math.max(80, Math.min(1000, faceAnchorY + rimDistPx * Math.sin(rimRad) * 0.85));

  const defaultKeyRot = Math.round((Math.atan2(faceAnchorY - keyY, faceAnchorX - keyX) * 180) / Math.PI);
  const defaultFillRot = Math.round((Math.atan2(faceAnchorY - fillY, faceAnchorX - fillX) * 180) / Math.PI);
  const defaultRimRot = Math.round((Math.atan2(faceAnchorY - rimY, faceAnchorX - rimX) * 180) / Math.PI);

  const keyRotDeg = keyRotationDeg ?? (defaultKeyRot < 0 ? defaultKeyRot + 360 : defaultKeyRot);
  const fillRotDeg = fillRotationDeg ?? (defaultFillRot < 0 ? defaultFillRot + 360 : defaultFillRot);
  const rimRotDeg = rimRotationDeg ?? (defaultRimRot < 0 ? defaultRimRot + 360 : defaultRimRot);

  // Directional beam throw cones oriented with actual light rotation
  const calcBeamGeometry = (
    posX: number,
    posY: number,
    rotDegVal: number,
    distMVal: number,
    halfSpread = 0.44
  ) => {
    const rotRad = (rotDegVal * Math.PI) / 180;
    const beamLen = Math.max(240, distMVal * 165);
    const dirX = Math.cos(rotRad);
    const dirY = Math.sin(rotRad);
    const perpX = -Math.sin(rotRad);
    const perpY = Math.cos(rotRad);
    const tipX = posX + dirX * beamLen;
    const tipY = posY + dirY * beamLen;
    const spreadW = beamLen * Math.tan(halfSpread);
    const p1X = tipX + perpX * spreadW;
    const p1Y = tipY + perpY * spreadW;
    const p2X = tipX - perpX * spreadW;
    const p2Y = tipY - perpY * spreadW;
    return {
      points: `${posX},${posY} ${p1X.toFixed(1)},${p1Y.toFixed(1)} ${p2X.toFixed(1)},${p2Y.toFixed(1)}`,
      tipX,
      tipY,
    };
  };

  const keyBeam = calcBeamGeometry(keyX, keyY, keyRotDeg, lightDistanceM ?? 2.2, 0.44);
  const fillBeam = calcBeamGeometry(fillX, fillY, fillRotDeg, fillDistanceM ?? 2.5, 0.50);
  const rimBeam = calcBeamGeometry(rimX, rimY, rimRotDeg, rimDistanceM ?? 2.0, 0.38);

  // 11. RENDER CAMERA POV SCENE TO CANVAS
  useEffect(() => {
    if (!canvasRef.current) return;

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      if (!canvasRef.current) return;

      // Two-Character Staging Setup
      let twoCharactersMode: RenderSceneOptions['twoCharactersMode'] = undefined;
      if (filmLanguageState?.concept === '180-degree') {
        const isCrossed = filmLanguageState?.axis180Mode === 'crossed' || filmLanguageState?.axis180ActiveCam === 'cam-crossed';
        const isShotB = filmLanguageState?.axis180Phase === 'shot-b' || filmLanguageState?.axis180ActiveCam === 'cam-b' || filmLanguageState?.axis180ActiveCam === 'cam-crossed';

        if (isShotB && isCrossed) {
          // Rule Broken (Crossed Axis): Screen positions reversed across the edit!
          twoCharactersMode = {
            char1X: 1280,
            char1Flip: false, // Subject 1 on right, looking left
            char2X: 640,
            char2Flip: true,  // Subject 2 on left, looking right
            scale: 0.88,
          };
        } else {
          // Shot A or Shot B (Same Side / Correct):
          twoCharactersMode = {
            char1X: 640,
            char1Flip: true,  // Subject 1 on left, looking right
            char2X: 1280,
            char2Flip: false, // Subject 2 on right, looking left
            scale: 0.88,
          };
        }
      } else if (filmLanguageState?.concept === 'reaction-shot') {
        const isReaction = filmLanguageState.reactionView === 'reaction';
        if (!isReaction) {
          // Action Shot: Two characters together. Actor A speaks, Actor B listens
          twoCharactersMode = {
            char1X: 680,
            char1Flip: true, // Actor A on left, facing right toward Actor B
            char1ShirtColorHex: '#ffffff', // Canonical white shirt
            char1Expression: 'speaking',
            char1GestureAngleDeg: -22,
            char1HeadTiltDeg: 2.5,
            char2X: 1240,
            char2Flip: false, // Actor B on right, facing left listening to Actor A
            char2ShirtColorHex: '#e0f2fe', // Soft cyan shirt
            char2Expression: 'deadpan',
            char2GestureAngleDeg: 0,
            char2HeadTiltDeg: -1,
            scale: 0.88,
          };
        }
      }

      // Master Shot 3-Character Staging Setup
      let masterCharactersMode: {
        char1: {
          x: number;
          flip?: boolean;
          scale?: number;
          shirtColorHex?: string;
          headTiltDeg?: number;
          headShiftY?: number;
          gestureAngleDeg?: number;
        };
        char2: {
          x: number;
          flip?: boolean;
          scale?: number;
          shirtColorHex?: string;
          headTiltDeg?: number;
          headShiftY?: number;
          gestureAngleDeg?: number;
        };
        activeCoverage?: 'none' | 'char1';
      } | undefined = undefined;

      if (filmLanguageState?.concept === 'master-shot') {
        const isCoverage = filmLanguageState.masterView === 'coverage';
        const progress = filmLanguageState.masterProgress ?? 0;
        const camShift = subjectOffsetX;

        // Continuous subtle conversation animation loop (0.0 to 1.0)
        const t = progress % 1;
        let char1Gesture = 0;
        let char1Tilt = 0;
        let char1ShiftY = 0;
        let char2Gesture = 0;
        let char2Tilt = 0;
        let char2ShiftY = 0;

        if (t < 0.45) {
          // Phase 1: Actor A speaks and gestures; Actor B listens and nods
          const env = Math.sin((t / 0.45) * Math.PI);
          char1Gesture = -22 * env * (0.85 + 0.15 * Math.sin(t * 24));
          char1Tilt = 3 * env + 1.2 * Math.sin(t * 18);
          char1ShiftY = Math.sin(t * 20) * 1.5;

          // Actor B listening nod
          if (t >= 0.20 && t <= 0.32) {
            char2ShiftY = Math.sin(((t - 0.20) / 0.12) * Math.PI) * 2.8;
            char2Tilt = -1.5;
          }
        } else if (t < 0.55) {
          // Phase 2: Natural conversational pause
          char1Gesture = 0;
          char1Tilt = 0;
          char2Gesture = 0;
          char2Tilt = 0;
        } else {
          // Phase 3: Actor B responds and gestures; Actor A listens and nods
          const bProg = (t - 0.55) / 0.45;
          const env = Math.sin(bProg * Math.PI);
          char2Gesture = -20 * env * (0.85 + 0.15 * Math.sin(bProg * 22));
          char2Tilt = 2.5 * env + 1.0 * Math.sin(bProg * 16);
          char2ShiftY = Math.sin(bProg * 18) * 1.5;

          // Actor A listening nod
          if (t >= 0.74 && t <= 0.86) {
            char1ShiftY = Math.sin(((t - 0.74) / 0.12) * Math.PI) * 2.8;
            char1Tilt = 1.0;
          }
        }

        masterCharactersMode = {
          char1: {
            x: 660 + camShift,
            flip: true, // Actor A facing right toward Actor B
            scale: isCoverage ? 1.05 : 0.85,
            shirtColorHex: '#ffffff', // Canonical white shirt
            headTiltDeg: char1Tilt,
            headShiftY: char1ShiftY,
            gestureAngleDeg: char1Gesture,
          },
          char2: {
            x: 1260 + camShift,
            flip: false, // Actor B facing left toward Actor A
            scale: isCoverage ? 1.05 : 0.85,
            shirtColorHex: '#e0f2fe', // Soft cyan/ice-blue shirt
            headTiltDeg: char2Tilt,
            headShiftY: char2ShiftY,
            gestureAngleDeg: char2Gesture,
          },
          activeCoverage: isCoverage ? 'char1' : 'none',
        };
      }

      renderCameraPOVToCanvas(canvasRef.current, getSharedRotatedCanvas(), {
        viewportWidth: 1920,
        viewportHeight: 1080,
        focalLengthMm,
        effectiveFocal,
        distanceM,
        aperture,
        shotMultiplier,
        totalSubjectScale,
        bgScale,
        dofBlur,
        dofBlurDistant,
        dofBlurMidground,
        rollDeg,
        pitchDeg,
        horizonShiftY,
        subjectOffsetX,
        subjectOffsetY,
        normalizedFaceAnchorX,
        normalizedFaceAnchorY,
        keyIntensity,
        rimIntensity,
        fillIntensity,
        lightDistanceM,
        fillDistanceM,
        rimDistanceM,
        keyAngleDeg,
        fillAngleDeg,
        rimAngleDeg,
        lightingPattern,
        lightColorHex: lightColor.hex,
        isStudioLighting,
        isColorReferenceScene,
        colorKelvin,
        tint,
        colorHarmony,
        keyPos: { x: keyX, y: keyY },
        fillPos: { x: fillX, y: fillY },
        rimPos: { x: rimX, y: rimY },
        keyRotationDeg: keyRotDeg,
        fillRotationDeg: fillRotDeg,
        rimRotationDeg: rimRotDeg,
        moveX,
        moveY,
        moveZoom,
        moveRoll,
        shotType,
        compositionMode: compositionGuide || undefined,
        hideActor:
          (filmLanguageState?.concept === 'eyeline' && (filmLanguageState?.eyelinePhase === 'shot-b' || filmLanguageState?.eyelinePhase === 'cut')) ||
          (filmLanguageState?.concept === 'screen-direction' && filmLanguageState?.screenDirPhase === 'cut') ||
          (filmLanguageState?.concept === '180-degree' && filmLanguageState?.axis180Phase === 'cut') ||
          (filmLanguageState?.concept === '30-degree' && filmLanguageState?.angle30Phase === 'cut') ||
          (filmLanguageState?.concept === 'establishing' && filmLanguageState?.establishingPhase === 'cut'),
        flipActorX:
          (filmLanguageState?.concept === 'eyeline' && filmLanguageState?.eyelineGazeDir === 'left') ||
          (filmLanguageState?.concept === 'screen-direction' &&
            (filmLanguageState?.screenDirPhase === 'shot-b' || filmLanguageState?.screenDirStep === 2) &&
            filmLanguageState?.screenDirMode === 'reversed') ||
          filmLanguageState?.concept === 'eye-trace',
        actorExpression:
          filmLanguageState?.concept === 'reaction-shot' && filmLanguageState?.reactionView === 'reaction'
            ? 'surprise'
            : undefined,
        actorShirtColorHex:
          filmLanguageState?.concept === 'reaction-shot' && filmLanguageState?.reactionView === 'reaction'
            ? '#e0f2fe'
            : undefined,
        actorHeadTiltDeg:
          filmLanguageState?.concept === 'reaction-shot' && filmLanguageState?.reactionView === 'reaction'
            ? 3.5
            : filmLanguageState?.concept === 'eye-trace'
            ? filmLanguageState?.eyeTracePattern === 'diagonal'
              ? -8
              : filmLanguageState?.eyeTracePattern === 'triangle'
              ? 8
              : 0
            : undefined,
        actorHeadShiftY:
          filmLanguageState?.concept === 'reaction-shot' && filmLanguageState?.reactionView === 'reaction'
            ? -3
            : filmLanguageState?.concept === 'eye-trace'
            ? filmLanguageState?.eyeTracePattern === 'diagonal'
              ? 2
              : filmLanguageState?.eyeTracePattern === 'triangle'
              ? -2
              : 0
            : undefined,
        actorHeldProp:
          filmLanguageState?.concept === 'continuity'
            ? filmLanguageState?.continuityStep === 2 && filmLanguageState?.continuityMode === 'error'
              ? 'red-cup-left'
              : 'red-cup-right'
            : undefined,
        twoCharactersMode,
        masterCharactersMode,
        isEstablishingScene: filmLanguageState?.concept === 'establishing',
        establishingShot: filmLanguageState?.concept === 'establishing'
          ? (filmLanguageState?.establishingShot ?? (filmLanguageState?.establishingScale === 'wide' ? 'medium' : 'wide'))
          : undefined,
      });
    });

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [
    focalLengthMm,
    effectiveFocal,
    distanceM,
    aperture,
    shotMultiplier,
    totalSubjectScale,
    bgScale,
    dofBlur,
    dofBlurDistant,
    dofBlurMidground,
    sensorKey,
    rollDeg,
    pitchDeg,
    horizonShiftY,
    subjectOffsetX,
    subjectOffsetY,
    normalizedFaceAnchorX,
    normalizedFaceAnchorY,
    keyIntensity,
    fillIntensity,
    rimIntensity,
    lightDistanceM,
    fillDistanceM,
    rimDistanceM,
    keyAngleDeg,
    fillAngleDeg,
    rimAngleDeg,
    lightingPattern,
    lightColor.hex,
    isStudioLighting,
    keyX,
    keyY,
    fillX,
    fillY,
    rimX,
    rimY,
    keyRotDeg,
    fillRotDeg,
    rimRotDeg,
    moveX,
    moveY,
    moveZoom,
    moveRoll,
    shotType,
    compositionGuide,
    filmLanguageState,
  ]);

  // Interactive Light Dragging State & Handlers
  const [draggingLight, setDraggingLight] = React.useState<'key' | 'fill' | 'rim' | null>(null);
  const [dragMode, setDragMode] = React.useState<'move' | 'rotate' | null>(null);

  const handleLightMoveStart = (e: React.PointerEvent, lightType: 'key' | 'fill' | 'rim') => {
    e.stopPropagation();
    e.preventDefault();
    onSelectLight?.(lightType);
    setDraggingLight(lightType);
    setDragMode('move');
  };

  const handleLightRotateStart = (e: React.PointerEvent, lightType: 'key' | 'fill' | 'rim') => {
    e.stopPropagation();
    e.preventDefault();
    onSelectLight?.(lightType);
    setDraggingLight(lightType);
    setDragMode('rotate');
  };

  useEffect(() => {
    if (!draggingLight || !dragMode) return;

    const onPointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scaleX = 1920 / rect.width;
      const scaleY = 1080 / rect.height;
      const curX = (e.clientX - rect.left) * scaleX;
      const curY = (e.clientY - rect.top) * scaleY;

      // FREE DRAGGING / POSITIONING: clamped only to screen boundary (50px margin)
      const clampedX = Math.max(50, Math.min(1870, curX));
      const clampedY = Math.max(50, Math.min(1030, curY));

      if (dragMode === 'move') {
        const dx = clampedX - faceAnchorX;
        const dy = clampedY - faceAnchorY;
        const pixelDist = Math.sqrt(dx * dx + dy * dy);
        const newDistM = parseFloat(Math.max(0.5, Math.min(8.0, pixelDist / 160)).toFixed(2));
        const rawAngle = Math.round((Math.atan2(dx, -dy) * 180) / Math.PI);
        const aimRot = Math.round((Math.atan2(faceAnchorY - clampedY, faceAnchorX - clampedX) * 180) / Math.PI);
        const normAimRot = aimRot < 0 ? aimRot + 360 : aimRot;

        if (draggingLight === 'key') {
          onKeyLightChange?.({ x: clampedX, y: clampedY, distanceM: newDistM, angleDeg: rawAngle, rotationDeg: normAimRot });
          onKeyLightDrag?.(newDistM, rawAngle);
        } else if (draggingLight === 'fill') {
          onFillLightChange?.({ x: clampedX, y: clampedY, distanceM: newDistM, angleDeg: rawAngle, rotationDeg: normAimRot });
          onFillLightDrag?.(rawAngle);
        } else if (draggingLight === 'rim') {
          onRimLightChange?.({ x: clampedX, y: clampedY, distanceM: newDistM, angleDeg: rawAngle, rotationDeg: normAimRot });
          onRimLightDrag?.(rawAngle);
        }
      } else if (dragMode === 'rotate') {
        let lx = keyX;
        let ly = keyY;
        if (draggingLight === 'fill') {
          lx = fillX;
          ly = fillY;
        } else if (draggingLight === 'rim') {
          lx = rimX;
          ly = rimY;
        }

        const rotRad = Math.atan2(curY - ly, curX - lx);
        let rotDeg = Math.round((rotRad * 180) / Math.PI);
        if (rotDeg < 0) rotDeg += 360;

        if (draggingLight === 'key') {
          onKeyLightChange?.({ x: keyX, y: keyY, distanceM: lightDistanceM ?? 2.2, angleDeg: keyAngleDeg ?? -45, rotationDeg: rotDeg });
        } else if (draggingLight === 'fill') {
          onFillLightChange?.({ x: fillX, y: fillY, distanceM: fillDistanceM ?? 2.5, angleDeg: fillAngleDeg ?? 40, rotationDeg: rotDeg });
        } else if (draggingLight === 'rim') {
          onRimLightChange?.({ x: rimX, y: rimY, distanceM: rimDistanceM ?? 2.0, angleDeg: rimAngleDeg ?? 135, rotationDeg: rotDeg });
        }
      }
    };

    const onPointerUp = () => {
      setDraggingLight(null);
      setDragMode(null);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [
    draggingLight,
    dragMode,
    faceAnchorX,
    faceAnchorY,
    keyX,
    keyY,
    fillX,
    fillY,
    rimX,
    rimY,
    lightDistanceM,
    fillDistanceM,
    rimDistanceM,
    keyAngleDeg,
    fillAngleDeg,
    rimAngleDeg,
    onKeyLightChange,
    onFillLightChange,
    onRimLightChange,
    onKeyLightDrag,
    onFillLightDrag,
    onRimLightDrag,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-video max-h-[46vh] sm:max-h-[50vh] xl:max-h-[54vh] bg-[#050914] rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center select-none ${
        draggingLight ? 'cursor-grabbing' : ''
      } ${className}`}
    >
      {/* 
        The Viewport Container:
        Strictly rectangular, completely filled 1920x1080 frame with zero rotation.
        The border, technical overlays, and HUD remain perfectly level and horizontal.
      */}
      <div
        className="relative w-full h-full overflow-hidden"
        style={{
          filter: `brightness(${brightnessMultiplier}) contrast(${contrast}%) saturate(${saturation}%) ${customTone} ${
            motionBlurPx > 0 ? `blur(${motionBlurPx}px)` : ''
          }`,
        }}
      >
        {/* Fixed 1920x1080 Camera Viewport Canvas */}
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover block"
        />

        {/* 
          ================= CAMERA OVERLAYS (STRICTLY LEVEL & HORIZONTAL) =================
          Viewfinder brackets, focus reticle, mattes, and composition guides
          remain perfectly horizontal as in a professional camera monitor.
        */}
        <svg
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          {/* Subtle Optical Face Reticle */}
          <g
            transform={`translate(${faceAnchorX}, ${faceAnchorY})`}
            opacity="0.32"
            stroke="#38bdf8"
            strokeWidth="1.2"
            fill="none"
            style={{ transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <path d="M -24 -12 L -30 -12 L -30 12 L -24 12" />
            <path d="M 24 -12 L 30 -12 L 30 12 L 24 12" />
            <circle cx="0" cy="0" r="1.5" fill="#38bdf8" />
          </g>

          {/* Color & White Balance Calibration Target Overlays */}
          {isColorReferenceScene && (
            <g id="color-calibration-targets-layer" opacity={0.88}>
              {/* White Reference Reticle (Stage Left) */}
              <g transform={`translate(${faceAnchorX - 430}, ${groundContactY - 276})`}>
                <circle cx="0" cy="0" r="62" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="5 4" opacity="0.6" />
                <line x1="-70" y1="0" x2="-55" y2="0" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="55" y1="0" x2="70" y2="0" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="0" y1="-70" x2="0" y2="-55" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="0" y1="55" x2="0" y2="70" stroke="#38bdf8" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="2.5" fill="#38bdf8" />
                <rect x="-62" y="-92" width="124" height="18" rx="4" fill="#090d16" stroke="#38bdf8" strokeWidth="1" opacity="0.92" />
                <text x="0" y="-79" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  WHITE POINT (100%)
                </text>
              </g>

              {/* 18% Neutral Gray Card Reticle (Stage Right) */}
              <g transform={`translate(${faceAnchorX + 430}, ${groundContactY - 315})`}>
                <rect x="-48" y="-28" width="96" height="56" rx="3" stroke="#f59e0b" strokeWidth="1.4" strokeDasharray="5 4" fill="none" opacity="0.75" />
                <line x1="-58" y1="0" x2="-44" y2="0" stroke="#f59e0b" strokeWidth="1.5" />
                <line x1="44" y1="0" x2="58" y2="0" stroke="#f59e0b" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="2.5" fill="#f59e0b" />
                <rect x="-68" y="-48" width="136" height="18" rx="4" fill="#090d16" stroke="#f59e0b" strokeWidth="1" opacity="0.92" />
                <text x="0" y="-35" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  18% NEUTRAL GRAY REF
                </text>
              </g>

              {/* Bottom Reference Status Badge */}
              <g transform={`translate(${faceAnchorX}, ${groundContactY + 88})`}>
                <rect x="-140" y="-12" width="280" height="24" rx="6" fill="#090d16" stroke="#475569" strokeWidth="1" opacity="0.9" />
                <text x="0" y="4" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  REC.709 D65 CALIBRATION ENVIRONMENT
                </text>
              </g>
            </g>
          )}

          {/* Composition Guides */}
          {compositionGuide && (
            <g id="composition-guides-layer" opacity={guideOpacity}>
              {compositionGuide === 'rule-of-thirds' && (
                <g id="guide-rule-of-thirds" stroke="#38bdf8" strokeWidth="1.2">
                  <line x1="640" y1="0" x2="640" y2="1080" strokeDasharray="6 4" />
                  <line x1="1280" y1="0" x2="1280" y2="1080" strokeDasharray="6 4" />
                  <line x1="0" y1="360" x2="1920" y2="360" strokeDasharray="6 4" />
                  <line x1="0" y1="720" x2="1920" y2="720" strokeDasharray="6 4" />
                  <circle cx="640" cy="360" r="7" fill="#38bdf8" />
                  <circle cx="1280" cy="360" r="7" fill="#38bdf8" />
                  <circle cx="640" cy="720" r="7" fill="#38bdf8" />
                  <circle cx="1280" cy="720" r="7" fill="#38bdf8" />
                  {/* Active Power Point Halo near Subject */}
                  <circle cx="640" cy="360" r="16" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 3" opacity="0.9" />
                </g>
              )}

              {compositionGuide === 'center' && (
                <g id="guide-center" stroke="#38bdf8" strokeWidth="1.2">
                  <line x1="960" y1="0" x2="960" y2="1080" strokeDasharray="4 4" />
                  <line x1="0" y1="540" x2="1920" y2="540" strokeDasharray="4 4" />
                  <circle cx="960" cy="540" r="50" fill="none" strokeWidth="1.5" />
                  <circle cx="960" cy="540" r="3.5" fill="#38bdf8" />
                </g>
              )}

              {compositionGuide === 'golden-ratio' && (
                <g id="guide-golden-ratio" stroke="#facc15" strokeWidth="1.5" fill="none">
                  <path d="M 0,0 L 1920,0 L 1920,1080 L 733,1080 L 733,412 L 1466,412 L 1466,825 L 1012,825 L 1012,570 L 1292,570" strokeDasharray="4 4" />
                  <path
                    d="M 0 1080 A 1920 1920 0 0 1 1920 0 A 1186 1186 0 0 1 734 1080 A 733 733 0 0 1 1467 412 A 453 453 0 0 1 1012 825 A 280 280 0 0 1 1292 570"
                    strokeWidth="2.2"
                  />
                  {/* Golden Eye Nexus */}
                  <circle cx="1188" cy="412" r="8" fill="#facc15" />
                  <circle cx="1188" cy="412" r="18" stroke="#facc15" strokeWidth="1.5" strokeDasharray="4 3" />
                </g>
              )}

              {compositionGuide === 'symmetry' && (
                <g id="guide-symmetry" stroke="#a855f7" strokeWidth="1.5">
                  <line x1="960" y1="0" x2="960" y2="1080" />
                  <polygon points="960,110 945,140 975,140" fill="#a855f7" />
                  <polygon points="960,970 945,940 975,940" fill="#a855f7" />
                  {/* Symmetrical Axis Balancers */}
                  <line x1="440" y1="540" x2="520" y2="540" strokeWidth="2" />
                  <line x1="1400" y1="540" x2="1480" y2="540" strokeWidth="2" />
                </g>
              )}

              {compositionGuide === 'leading-lines' && (
                <g id="guide-leading-lines" stroke="#22c55e" strokeWidth="2.2" strokeDasharray="8 6">
                  <line x1="0" y1="1080" x2={faceAnchorX - 25} y2={faceAnchorY + 180} />
                  <line x1="1920" y1="1080" x2={faceAnchorX + 25} y2={faceAnchorY + 180} />
                  <line x1="480" y1="1080" x2={faceAnchorX - 8} y2={faceAnchorY + 180} />
                  <line x1="1440" y1="1080" x2={faceAnchorX + 8} y2={faceAnchorY + 180} />
                  <circle cx={faceAnchorX} cy={faceAnchorY + 180} r="10" fill="#22c55e" fillOpacity="0.3" stroke="#22c55e" strokeWidth="2" />
                </g>
              )}

              {compositionGuide === 'diagonal' && (
                <g id="guide-diagonal">
                  {/* Primary Dynamic Diagonal Axis (overlaid directly on the environmental architectural cantilever) */}
                  <line
                    x1="140"
                    y1="180"
                    x2="1780"
                    y2="840"
                    stroke="#ec4899"
                    strokeWidth="1.8"
                    strokeDasharray="8 5"
                    opacity="0.9"
                  />

                  {/* Secondary floor perspective diagonal reference */}
                  <line
                    x1="180"
                    y1="1080"
                    x2="1480"
                    y2={groundContactY}
                    stroke="#ec4899"
                    strokeWidth="1.2"
                    strokeDasharray="6 4"
                    opacity="0.4"
                  />

                  {/* Dynamic tension guide connecting subject anchor to the primary diagonal */}
                  {(() => {
                    const x1 = 140;
                    const y1 = 180;
                    const x2 = 1780;
                    const y2 = 840;
                    const dx = x2 - x1;
                    const dy = y2 - y1;
                    const lenSq = dx * dx + dy * dy;
                    const u = Math.max(0, Math.min(1, ((faceAnchorX - x1) * dx + (faceAnchorY - y1) * dy) / lenSq));
                    const projX = x1 + u * dx;
                    const projY = y1 + u * dy;
                    return (
                      <g>
                        <line
                          x1={faceAnchorX}
                          y1={faceAnchorY}
                          x2={projX}
                          y2={projY}
                          stroke="#ec4899"
                          strokeWidth="1.3"
                          strokeDasharray="4 4"
                          opacity="0.55"
                        />
                        <circle cx={projX} cy={projY} r="4.5" fill="#ec4899" opacity="0.85" />
                      </g>
                    );
                  })()}

                  {/* Apex and terminal anchor points */}
                  <circle cx="140" cy="180" r="5" fill="#ec4899" />
                  <circle cx="1780" cy="840" r="5" fill="#ec4899" />

                  {/* Intermediate vector flow node */}
                  <circle cx="960" cy="510" r="4.5" fill="#ec4899" opacity="0.8" />

                  {/* Subject dynamic focal point node */}
                  <circle
                    cx={faceAnchorX}
                    cy={faceAnchorY}
                    r="6"
                    fill="#ec4899"
                    fillOpacity="0.3"
                    stroke="#ec4899"
                    strokeWidth="1.5"
                  />

                  {/* Diagonal guide tag positioned along the dynamic axis */}
                  <g transform="translate(1220, 615)">
                    <rect
                      x="-115"
                      y="-13"
                      width="230"
                      height="26"
                      rx="5"
                      fill="#090d16"
                      fillOpacity="0.9"
                      stroke="#ec4899"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="4"
                      fill="#f472b6"
                      fontSize="11"
                      fontFamily="sans-serif"
                      textAnchor="middle"
                      fontWeight="bold"
                      letterSpacing="0.5"
                    >
                      DYNAMIC DIAGONAL AXIS
                    </text>
                  </g>
                </g>
              )}

              {compositionGuide === 'triangles' && (
                <g id="guide-triangles" stroke="#eab308" strokeWidth="1.8" fill="none">
                  <polygon points={`320,920 ${faceAnchorX},${faceAnchorY - 140} 1600,920`} strokeDasharray="7 5" />
                  <circle cx={faceAnchorX} cy={faceAnchorY - 140} r="6" fill="#eab308" />
                </g>
              )}

              {compositionGuide === 'negative-space' && (
                <g id="guide-negative-space">
                  <rect x="60" y="60" width="1340" height="740" rx="10" stroke="#38bdf8" strokeWidth="2" strokeDasharray="8 6" fill="#0284c7" fillOpacity="0.08" />
                  <g transform="translate(730, 430)">
                    <rect x="-240" y="-18" width="480" height="36" rx="6" fill="#090d16" stroke="#38bdf8" strokeWidth="1.2" />
                    <text x="0" y="5" fill="#38bdf8" fontSize="14" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                      OPEN NEGATIVE SPACE (76% FRAME SURFACE)
                    </text>
                  </g>
                </g>
              )}

              {compositionGuide === 'frame-in-frame' && (
                <g id="guide-frame-in-frame" stroke="#f97316" strokeWidth="2.5" fill="none">
                  <rect x="360" y="150" width="1200" height="770" rx="8" strokeDasharray="8 6" />
                  <rect x="830" y="125" width="260" height="26" rx="4" fill="#090d16" stroke="#f97316" strokeWidth="1" />
                  <text x="960" y="142" fill="#f97316" fontSize="13" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                    INTERNAL FRAME
                  </text>
                </g>
              )}

              {compositionGuide === 'visual-balance' && (
                <g id="guide-visual-balance" stroke="#38bdf8">
                  <line x1="960" y1="200" x2="960" y2="880" strokeWidth="1.5" strokeDasharray="6 4" />
                  <polygon points="960,540 940,570 980,570" fill="#38bdf8" />
                  <line x1="380" y1="540" x2="1540" y2="540" strokeWidth="2" />
                  <circle cx={faceAnchorX} cy="540" r="14" fill="#0284c7" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="2" />
                  <text x={faceAnchorX} y="515" fill="#38bdf8" fontSize="13" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                    SUBJECT MASS
                  </text>
                  <circle cx="1500" cy="540" r="14" fill="#f59e0b" fillOpacity="0.4" stroke="#fbbf24" strokeWidth="2" />
                  <text x="1500" y="515" fill="#fbbf24" fontSize="13" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                    ENVIRONMENT MASS
                  </text>
                  <rect x="830" y="590" width="260" height="26" rx="5" fill="#090d16" stroke="#38bdf8" strokeWidth="1" />
                  <text x="960" y="608" fill="#e2e8f0" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                    ASYMMETRIC DYNAMIC EQUILIBRIUM
                  </text>
                </g>
              )}

              {compositionGuide === 'depth' && (
                <g id="guide-depth" stroke="#22c55e">
                  <rect x="60" y="780" width="300" height="180" rx="8" strokeWidth="2" strokeDasharray="6 4" fill="#22c55e" fillOpacity="0.08" />
                  <text x="210" y="875" fill="#22c55e" fontSize="14" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                    [1] FOREGROUND (Z: ~1.2m)
                  </text>
                  <rect x={faceAnchorX - 110} y={faceAnchorY - 60} width="220" height="380" rx="8" strokeWidth="2" fill="none" stroke="#38bdf8" />
                  <text x={faceAnchorX} y={faceAnchorY - 75} fill="#38bdf8" fontSize="14" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                    [2] MIDGROUND ACTOR (Z: 3.0m)
                  </text>
                  <rect x="740" y="240" width="440" height="150" rx="8" strokeWidth="1.5" strokeDasharray="6 4" fill="#a855f7" fillOpacity="0.08" stroke="#a855f7" />
                  <text x="960" y="325" fill="#a855f7" fontSize="14" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                    [3] BACKGROUND SKYLINE (Z: ~150m)
                  </text>
                </g>
              )}
            </g>
          )}

          {/* Film Language Overlays */}
          {filmLanguageState ? (
            <FilmLanguageOverlay
              state={filmLanguageState}
              faceAnchorX={faceAnchorX}
              faceAnchorY={faceAnchorY}
              groundContactY={groundContactY}
              totalSubjectScale={totalSubjectScale}
            />
          ) : (
            <>
              {filmConcept === '180-degree' && (
                <g id="overlay-180" opacity="0.85">
                  <line x1="100" y1="540" x2="1820" y2="540" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="12 6" />
                  <rect x="800" y="515" width="320" height="35" rx="4" fill="#b91c1c" />
                  <text x="960" y="539" fill="#ffffff" fontSize="15" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                    AXIS OF ACTION (180° RULE)
                  </text>
                  <path d="M 300 540 A 660 660 0 0 0 1620 540" fill="#22c55e" fillOpacity="0.1" stroke="#22c55e" strokeWidth="1.8" />
                  <text x="960" y="740" fill="#22c55e" fontSize="18" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                    PERMITTED CAMERA ZONE (180°)
                  </text>
                </g>
              )}

              {filmConcept === 'eyeline' && (
                <g id="overlay-eyeline" opacity="0.85">
                  <line x1={faceAnchorX} y1={faceAnchorY} x2="300" y2={faceAnchorY} stroke="#38bdf8" strokeWidth="2.5" />
                  <circle cx={faceAnchorX} cy={faceAnchorY} r="5" fill="#38bdf8" />
                  <polygon points={`300,${faceAnchorY - 7} 280,${faceAnchorY} 300,${faceAnchorY + 7}`} fill="#38bdf8" />
                  <rect x="520" y={faceAnchorY - 35} width="220" height="28" rx="4" fill="#0369a1" />
                  <text x="630" y={faceAnchorY - 16} fill="#ffffff" fontSize="13" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                    ACTOR EYELINE MATCH
                  </text>
                </g>
              )}

              {filmConcept === '30-degree' && (
                <g id="overlay-30deg" opacity="0.85">
                  <path d={`M ${faceAnchorX} ${faceAnchorY} L 760 980`} stroke="#facc15" strokeWidth="2.5" />
                  <path d={`M ${faceAnchorX} ${faceAnchorY} L 1160 980`} stroke="#facc15" strokeWidth="2.5" />
                  <path d="M 830 880 A 240 240 0 0 1 1090 880" fill="none" stroke="#facc15" strokeWidth="2.5" strokeDasharray="6 4" />
                  <text x="960" y="870" fill="#facc15" fontSize="20" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                    Δθ &gt; 30° CUT SAFETY
                  </text>
                </g>
              )}
            </>
          )}

          {/* Aspect Ratio Mattes (Letterbox & Pillarbox) */}
          {letterboxHeight > 0 && (
            <>
              <rect x="0" y="0" width="1920" height={letterboxHeight} fill="#000000" />
              <rect x="0" y={1080 - letterboxHeight} width="1920" height={letterboxHeight} fill="#000000" />
            </>
          )}

          {pillarboxWidth > 0 && (
            <>
              <rect x="0" y="0" width={pillarboxWidth} height="1080" fill="#000000" />
              <rect x={1920 - pillarboxWidth} y="0" width={pillarboxWidth} height="1080" fill="#000000" />
            </>
          )}

          {/* Safe Area Guides */}
          {showSafeAreas && (
            <g id="safe-areas" strokeWidth="1.2" fill="none">
              <rect x="96" y="54" width="1728" height="972" stroke="#38bdf8" strokeDasharray="8 6" opacity="0.5" />
              <text x="110" y="78" fill="#38bdf8" fontSize="13" fontFamily="sans-serif" opacity="0.75">
                90% ACTION SAFE
              </text>
              <rect x="192" y="108" width="1536" height="864" stroke="#eab308" strokeDasharray="6 6" opacity="0.6" />
              <text x="206" y="132" fill="#eab308" fontSize="13" fontFamily="sans-serif" opacity="0.75">
                80% TITLE SAFE
              </text>
            </g>
          )}

          {/* Viewfinder Brackets & Crosshair: Always strictly level & horizontal */}
          <g id="viewfinder-crosshair" stroke="#ffffff" strokeWidth="1.5" opacity="0.35">
            <path d="M 40 70 L 40 40 L 70 40" fill="none" />
            <path d="M 1880 70 L 1880 40 L 1850 40" fill="none" />
            <path d="M 40 1010 L 40 1040 L 70 1040" fill="none" />
            <path d="M 1880 1010 L 1880 1040 L 1850 1040" fill="none" />
            <line x1="952" y1="540" x2="968" y2="540" />
            <line x1="960" y1="532" x2="960" y2="548" />
          </g>

          {/* Interactive Lighting Fixtures & Draggable Handles */}
          {isLightingInteractive && (
            <g id="interactive-lighting-fixtures">
              <defs>
                <linearGradient id="keyLightBeamGrad" x1={keyX} y1={keyY} x2={keyBeam.tipX} y2={keyBeam.tipY} gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor={lightColor.hex} stopOpacity={0.28 * (keyIntensity / 100)} />
                  <stop offset="60%" stopColor={lightColor.hex} stopOpacity={0.08 * (keyIntensity / 100)} />
                  <stop offset="100%" stopColor={lightColor.hex} stopOpacity="0" />
                </linearGradient>
                <linearGradient id="fillLightBeamGrad" x1={fillX} y1={fillY} x2={fillBeam.tipX} y2={fillBeam.tipY} gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#93c5fd" stopOpacity={0.22 * (fillIntensity / 100)} />
                  <stop offset="60%" stopColor="#93c5fd" stopOpacity={0.05 * (fillIntensity / 100)} />
                  <stop offset="100%" stopColor="#93c5fd" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="rimLightBeamGrad" x1={rimX} y1={rimY} x2={rimBeam.tipX} y2={rimBeam.tipY} gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity={0.26 * (rimIntensity / 100)} />
                  <stop offset="60%" stopColor="#ffffff" stopOpacity={0.06 * (rimIntensity / 100)} />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Light Throw Cones (accurately oriented to fixture rotation) */}
              {keyIntensity > 0 && <polygon points={keyBeam.points} fill="url(#keyLightBeamGrad)" pointerEvents="none" />}
              {fillIntensity > 0 && <polygon points={fillBeam.points} fill="url(#fillLightBeamGrad)" pointerEvents="none" />}
              {rimIntensity > 0 && <polygon points={rimBeam.points} fill="url(#rimLightBeamGrad)" pointerEvents="none" />}

              {/* KEY LIGHT (Softbox representation - Freely Draggable & Freely Rotatable) */}
              <g transform={`translate(${keyX}, ${keyY})`} pointerEvents="auto">
                {/* Active selection / drag halo */}
                {(draggingLight === 'key' || selectedLight === 'key') && (
                  <circle r="46" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.8" pointerEvents="none" />
                )}

                {/* Softbox Fixture Head (rotates with keyRotDeg) */}
                <g transform={`rotate(${keyRotDeg})`}>
                  {/* Housing */}
                  <rect x="-44" y="-25" width="88" height="50" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="2.5" pointerEvents="none" />
                  {/* Emitter face tinted with kelvin */}
                  <rect x="36" y="-21" width="8" height="42" rx="2" fill={lightColor.hex} pointerEvents="none" />
                  {/* Softbox rear bracket */}
                  <path d="M -44 -14 L -58 0 L -44 14" stroke="#64748b" strokeWidth="3" fill="none" pointerEvents="none" />
                  {/* Aim guide line to rotation handle */}
                  <line x1="44" y1="0" x2="62" y2="0" stroke={draggingLight === 'key' && dragMode === 'rotate' ? '#fbbf24' : '#64748b'} strokeWidth="2" strokeDasharray="2 2" pointerEvents="none" />

                  {/* ROTATION HANDLE */}
                  <g transform="translate(68, 0)">
                    {/* Large invisible hit area */}
                    <circle
                      r="22"
                      fill="transparent"
                      className="cursor-crosshair"
                      pointerEvents="auto"
                      onPointerDown={(e) => handleLightRotateStart(e, 'key')}
                    />
                    {/* Rotation Knob */}
                    <circle
                      r="10"
                      fill="#0f172a"
                      stroke={draggingLight === 'key' && dragMode === 'rotate' ? '#f59e0b' : '#fbbf24'}
                      strokeWidth={draggingLight === 'key' && dragMode === 'rotate' ? 3 : 2}
                      pointerEvents="none"
                    />
                    <circle r="3.5" fill="#fbbf24" pointerEvents="none" />
                    {/* Rotate Badge / Label */}
                    <rect x="-24" y="-28" width="48" height="16" rx="4" fill="#090d16" stroke="#fbbf24" strokeWidth="1" pointerEvents="none" />
                    <text x="0" y="-17" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="bold" fontFamily="monospace" pointerEvents="none">
                      ROTATE
                    </text>
                  </g>
                </g>

                {/* Center Stand Base Handle (Drag anywhere to move) */}
                <g>
                  {/* Large invisible hit area for moving */}
                  <circle
                    r="34"
                    fill="transparent"
                    className="cursor-grab active:cursor-grabbing"
                    pointerEvents="auto"
                    onPointerDown={(e) => handleLightMoveStart(e, 'key')}
                  />
                  <circle
                    r="17"
                    fill="#1e3a8a"
                    stroke={draggingLight === 'key' && dragMode === 'move' ? '#fbbf24' : '#60a5fa'}
                    strokeWidth={draggingLight === 'key' && dragMode === 'move' ? 3.5 : 2.5}
                    pointerEvents="none"
                  />
                  <circle r="6" fill="#93c5fd" pointerEvents="none" />
                </g>

                {/* Technical Badge */}
                <g transform="translate(0, -42)" pointerEvents="none">
                  <rect
                    x="-82"
                    y="-12"
                    width="164"
                    height="24"
                    rx="6"
                    fill="#090d16"
                    stroke={draggingLight === 'key' || selectedLight === 'key' ? '#f59e0b' : '#475569'}
                    strokeWidth="1.5"
                  />
                  <text x="0" y="4" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="bold" fontFamily="monospace">
                    KEY {keyIntensity}% · {(lightDistanceM ?? 2.2).toFixed(1)}m · {Math.round(keyRotDeg)}°
                  </text>
                </g>
              </g>

              {/* FILL LIGHT (Reflector panel representation - Freely Draggable & Freely Rotatable) */}
              <g transform={`translate(${fillX}, ${fillY})`} pointerEvents="auto">
                {/* Active selection / drag halo */}
                {(draggingLight === 'fill' || selectedLight === 'fill') && (
                  <circle r="42" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.8" pointerEvents="none" />
                )}

                {/* Reflector Panel Head (rotates with fillRotDeg) */}
                <g transform={`rotate(${fillRotDeg})`}>
                  {/* Housing */}
                  <rect x="-35" y="-20" width="70" height="40" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="2" pointerEvents="none" />
                  {/* Diffuse face */}
                  <rect x="29" y="-16" width="6" height="32" rx="2" fill="#bfdbfe" pointerEvents="none" />
                  {/* Aim guide line to rotation handle */}
                  <line x1="35" y1="0" x2="52" y2="0" stroke={draggingLight === 'fill' && dragMode === 'rotate' ? '#38bdf8' : '#64748b'} strokeWidth="2" strokeDasharray="2 2" pointerEvents="none" />

                  {/* ROTATION HANDLE */}
                  <g transform="translate(60, 0)">
                    {/* Large invisible hit area */}
                    <circle
                      r="20"
                      fill="transparent"
                      className="cursor-crosshair"
                      pointerEvents="auto"
                      onPointerDown={(e) => handleLightRotateStart(e, 'fill')}
                    />
                    {/* Rotation Knob */}
                    <circle
                      r="9"
                      fill="#0f172a"
                      stroke={draggingLight === 'fill' && dragMode === 'rotate' ? '#38bdf8' : '#7dd3fc'}
                      strokeWidth={draggingLight === 'fill' && dragMode === 'rotate' ? 3 : 2}
                      pointerEvents="none"
                    />
                    <circle r="3" fill="#38bdf8" pointerEvents="none" />
                    {/* Rotate Badge / Label */}
                    <rect x="-24" y="-26" width="48" height="15" rx="4" fill="#090d16" stroke="#38bdf8" strokeWidth="1" pointerEvents="none" />
                    <text x="0" y="-16" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace" pointerEvents="none">
                      ROTATE
                    </text>
                  </g>
                </g>

                {/* Center Stand Base Handle (Drag anywhere to move) */}
                <g>
                  {/* Large invisible hit area for moving */}
                  <circle
                    r="32"
                    fill="transparent"
                    className="cursor-grab active:cursor-grabbing"
                    pointerEvents="auto"
                    onPointerDown={(e) => handleLightMoveStart(e, 'fill')}
                  />
                  <circle
                    r="15"
                    fill="#0369a1"
                    stroke={draggingLight === 'fill' && dragMode === 'move' ? '#38bdf8' : '#60a5fa'}
                    strokeWidth={draggingLight === 'fill' && dragMode === 'move' ? 3.5 : 2.5}
                    pointerEvents="none"
                  />
                  <circle r="5" fill="#bae6fd" pointerEvents="none" />
                </g>

                {/* Technical Badge */}
                <g transform="translate(0, -36)" pointerEvents="none">
                  <rect
                    x="-75"
                    y="-11"
                    width="150"
                    height="22"
                    rx="5"
                    fill="#090d16"
                    stroke={draggingLight === 'fill' || selectedLight === 'fill' ? '#38bdf8' : '#475569'}
                    strokeWidth="1.5"
                  />
                  <text x="0" y="4" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">
                    FILL {fillIntensity}% · {(fillDistanceM ?? 2.5).toFixed(1)}m · {Math.round(fillRotDeg)}°
                  </text>
                </g>
              </g>

              {/* RIM / BACK LIGHT (Fresnel spot representation - Freely Draggable & Freely Rotatable) */}
              <g transform={`translate(${rimX}, ${rimY})`} pointerEvents="auto">
                {/* Active selection / drag halo */}
                {(draggingLight === 'rim' || selectedLight === 'rim') && (
                  <circle r="38" fill="none" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.8" pointerEvents="none" />
                )}

                {/* Fresnel Spot Head (rotates with rimRotDeg) */}
                <g transform={`rotate(${rimRotDeg})`}>
                  {/* Housing */}
                  <rect x="-28" y="-17" width="56" height="34" rx="5" fill="#0f172a" stroke="#475569" strokeWidth="2" pointerEvents="none" />
                  {/* Lens face */}
                  <rect x="22" y="-13" width="6" height="26" rx="2" fill="#ffffff" pointerEvents="none" />
                  {/* Aim guide line to rotation handle */}
                  <line x1="28" y1="0" x2="48" y2="0" stroke={draggingLight === 'rim' && dragMode === 'rotate' ? '#f8fafc' : '#64748b'} strokeWidth="2" strokeDasharray="2 2" pointerEvents="none" />

                  {/* ROTATION HANDLE */}
                  <g transform="translate(56, 0)">
                    {/* Large invisible hit area */}
                    <circle
                      r="18"
                      fill="transparent"
                      className="cursor-crosshair"
                      pointerEvents="auto"
                      onPointerDown={(e) => handleLightRotateStart(e, 'rim')}
                    />
                    {/* Rotation Knob */}
                    <circle
                      r="8.5"
                      fill="#0f172a"
                      stroke={draggingLight === 'rim' && dragMode === 'rotate' ? '#f8fafc' : '#cbd5e1'}
                      strokeWidth={draggingLight === 'rim' && dragMode === 'rotate' ? 3 : 2}
                      pointerEvents="none"
                    />
                    <circle r="3" fill="#ffffff" pointerEvents="none" />
                    {/* Rotate Badge / Label */}
                    <rect x="-24" y="-25" width="48" height="15" rx="4" fill="#090d16" stroke="#f8fafc" strokeWidth="1" pointerEvents="none" />
                    <text x="0" y="-15" textAnchor="middle" fill="#f8fafc" fontSize="9" fontWeight="bold" fontFamily="monospace" pointerEvents="none">
                      ROTATE
                    </text>
                  </g>
                </g>

                {/* Center Stand Base Handle (Drag anywhere to move) */}
                <g>
                  {/* Large invisible hit area for moving */}
                  <circle
                    r="30"
                    fill="transparent"
                    className="cursor-grab active:cursor-grabbing"
                    pointerEvents="auto"
                    onPointerDown={(e) => handleLightMoveStart(e, 'rim')}
                  />
                  <circle
                    r="14"
                    fill="#334155"
                    stroke={draggingLight === 'rim' && dragMode === 'move' ? '#f8fafc' : '#94a3b8'}
                    strokeWidth={draggingLight === 'rim' && dragMode === 'move' ? 3.5 : 2.5}
                    pointerEvents="none"
                  />
                  <circle r="5" fill="#ffffff" pointerEvents="none" />
                </g>

                {/* Technical Badge */}
                <g transform="translate(0, -32)" pointerEvents="none">
                  <rect
                    x="-70"
                    y="-11"
                    width="140"
                    height="22"
                    rx="5"
                    fill="#090d16"
                    stroke={draggingLight === 'rim' || selectedLight === 'rim' ? '#f8fafc' : '#475569'}
                    strokeWidth="1.5"
                  />
                  <text x="0" y="4" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold" fontFamily="monospace">
                    RIM {rimIntensity}% · {(rimDistanceM ?? 2.0).toFixed(1)}m · {Math.round(rimRotDeg)}°
                  </text>
                </g>
              </g>
            </g>
          )}
        </svg>

        {/* FALSE COLOR OVERLAY */}
        {showFalseColor && (
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-purple-900/60 via-green-600/40 to-yellow-500/60 mix-blend-color flex items-start justify-end p-4">
            <span className="bg-black/80 text-yellow-400 text-xs font-mono px-2 py-1 rounded">
              FALSE COLOR IRE 70-80 (SKIN)
            </span>
          </div>
        )}
      </div>

      {/* Real Measurement Scales & Technical HUD Overlays: Always level & horizontal */}
      {showMeasurements && (
        <div className="absolute inset-0 pointer-events-none p-3.5 flex flex-col justify-between select-none">
          {/* Top HUD: Technical Metadata */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-800/80">
              <span className="text-blue-400 font-bold">POV</span>
              <span>1920×1080</span>
              <span className="text-slate-500">|</span>
              <span className="text-emerald-400">{focalLengthMm}mm</span>
              <span className="text-slate-500">|</span>
              <span className="text-amber-400">f/{aperture}</span>
            </div>

            {customOverlayText && (
              <div className="bg-blue-900/80 backdrop-blur-xs px-2.5 py-1 rounded-md border border-blue-600 text-white font-semibold">
                {customOverlayText}
              </div>
            )}

            <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-800/80">
              <span className="text-slate-400">DIST:</span>
              <span className="text-white font-bold">{distanceM.toFixed(2)}m</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">PITCH:</span>
              <span className="text-white font-bold">{pitchDeg}°</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">DUTCH ROLL:</span>
              <span className={`font-bold ${totalRollDeg !== 0 ? 'text-amber-400' : 'text-slate-200'}`}>
                {totalRollDeg}°
              </span>
            </div>
          </div>

          {/* Bottom HUD: Live Optical Scales */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-300">
            <div className="bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-800/80 flex items-center gap-2">
              <span className="text-slate-400">H-FOV:</span>
              <span className="text-blue-400 font-bold">
                {(2 * Math.atan(sensor.width / (2 * focalLengthMm)) * (180 / Math.PI)).toFixed(1)}°
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">MAG:</span>
              <span className="text-slate-200 font-bold">{opticalMagnification.toFixed(2)}x</span>
            </div>

            <div className="bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-800/80 flex items-center gap-2">
              <span className="text-slate-400">ISO</span>
              <span className="text-slate-200 font-bold">{iso}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">EV</span>
              <span className="text-slate-200 font-bold">{exposureEV.toFixed(1)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
