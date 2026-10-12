/**
 * Canvas Renderer for F CAM Cinematography Explorer
 * See. Adjust. Understand.
 * 
 * Implements the camera projection pipeline:
 * WORLD / SCENE -> CAMERA PROJECTION -> OVERSIZED RENDER SURFACE -> ROTATE AROUND ROLL CENTER -> CROP TO 1920x1080 VIEWPORT
 */

export interface RenderSceneOptions {
  viewportWidth: number;
  viewportHeight: number;
  focalLengthMm: number;
  effectiveFocal: number;
  distanceM: number;
  aperture: number;
  shotMultiplier: number;
  totalSubjectScale: number;
  bgScale: number;
  dofBlur: number;
  dofBlurDistant?: number;
  dofBlurMidground?: number;
  rollDeg: number;
  pitchDeg: number;
  horizonShiftY: number;
  subjectOffsetX: number;
  subjectOffsetY: number;
  normalizedFaceAnchorX: number;
  normalizedFaceAnchorY: number;
  keyIntensity: number;
  rimIntensity: number;
  lightingPattern: string;
  lightColorHex: string;
  fillIntensity?: number;
  lightDistanceM?: number;
  keyAngleDeg?: number;
  fillAngleDeg?: number;
  rimAngleDeg?: number;
  isStudioLighting?: boolean;
  isColorReferenceScene?: boolean;
  colorKelvin?: number;
  tint?: number;
  keyPos?: { x: number; y: number };
  fillPos?: { x: number; y: number };
  rimPos?: { x: number; y: number };
  keyRotationDeg?: number;
  fillRotationDeg?: number;
  rimRotationDeg?: number;
  fillDistanceM?: number;
  rimDistanceM?: number;
  moveX: number;
  moveY: number;
  moveZoom: number;
  moveRoll: number;
  shotType?: string;
  compositionMode?: string;
  colorHarmony?: string;
  hideActor?: boolean;
  flipActorX?: boolean;
  actorExpression?: CharacterExpression;
  actorShirtColorHex?: string;
  actorHeadTiltDeg?: number;
  actorHeadShiftY?: number;
  actorGestureAngleDeg?: number;
  actorHeldProp?: 'none' | 'red-cup-right' | 'red-cup-left';
  twoCharactersMode?: {
    char1X: number;
    char1Flip?: boolean;
    char1Expression?: CharacterExpression;
    char1ShirtColorHex?: string;
    char1GestureAngleDeg?: number;
    char1HeadTiltDeg?: number;
    char1HeadShiftY?: number;
    char2X: number;
    char2Flip?: boolean;
    char2Expression?: CharacterExpression;
    char2ShirtColorHex?: string;
    char2GestureAngleDeg?: number;
    char2HeadTiltDeg?: number;
    char2HeadShiftY?: number;
    scale?: number;
  };
  masterCharactersMode?: {
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
  };
  isEstablishingScene?: boolean;
  establishingShot?: 'wide' | 'medium' | 'close-up';
}

import { drawMasterCharacter, CharacterExpression } from '../character/masterCharacterCanvas';

// Cached Path2D objects for background clouds
let cloudPaths: { cloudL: Path2D; cloudR: Path2D } | null = null;

function getCloudPaths() {
  if (cloudPaths) return cloudPaths;
  cloudPaths = {
    cloudL: new Path2D(
      'M 40 70 Q 20 70 15 50 Q 10 25 35 20 Q 50 -5 85 5 Q 115 -15 145 10 Q 175 10 185 35 Q 200 45 195 70 Z'
    ),
    cloudR: new Path2D(
      'M 30 55 Q 10 55 5 40 Q 0 20 25 15 Q 45 -8 75 0 Q 100 -12 130 5 Q 155 5 165 30 Q 180 38 175 55 Z'
    ),
  };
  return cloudPaths;
}

/**
 * Draws the canonical Master Character Actor matching the Home page reference.
 * The character remains completely stable, intact, and consistent across all pages.
 */
function drawActor(
  ctx: CanvasRenderingContext2D,
  scale: number,
  keyIntensity: number = 80,
  rimIntensity: number = 60,
  keyAngleDeg: number = -45,
  rimAngleDeg: number = 135,
  lightColorHex: string = '#ffffff'
) {
  drawMasterCharacter(ctx, scale, {
    keyIntensity,
    rimIntensity,
    keyAngleDeg,
    rimAngleDeg,
    lightColorHex,
  });
}

// Cached offscreen canvas for the static city skyline
let cachedSkylineCanvas: HTMLCanvasElement | null = null;
const SKY_ORIGIN_X = -1650;
const SKY_ORIGIN_Y = 180;
const SKY_WIDTH = 5350;
const SKY_HEIGHT = 950;

function getCachedSkylineCanvas(): HTMLCanvasElement {
  if (cachedSkylineCanvas) return cachedSkylineCanvas;
  cachedSkylineCanvas = document.createElement('canvas');
  cachedSkylineCanvas.width = SKY_WIDTH;
  cachedSkylineCanvas.height = SKY_HEIGHT;
  const sCtx = cachedSkylineCanvas.getContext('2d');
  if (!sCtx) return cachedSkylineCanvas;

  sCtx.save();
  sCtx.translate(-SKY_ORIGIN_X, -SKY_ORIGIN_Y);

  // Leftward extended skyline towers
  const buildings = [
    { x: -1600, y: 320, w: 170, h: 580, c: '#181c3c' },
    { x: -1410, y: 270, w: 180, h: 630, c: '#22264d' },
    { x: -1210, y: 340, w: 160, h: 560, c: '#1b1f40' },
    { x: -1030, y: 290, w: 170, h: 610, c: '#252954' },
    { x: -840, y: 330, w: 160, h: 570, c: '#1d2146' },
    { x: -660, y: 280, w: 170, h: 620, c: '#282b58' },
    { x: -470, y: 310, w: 160, h: 590, c: '#1e2246' },
    { x: -290, y: 270, w: 170, h: 630, c: '#242852' },
    { x: -100, y: 330, w: 150, h: 570, c: '#1e2246' },
    { x: 70, y: 290, w: 160, h: 610, c: '#2b2d56' },

    // Central skyline
    { x: 250, y: 300, w: 160, h: 600, c: '#242852' },
    { x: 430, y: 360, w: 140, h: 540, c: '#1d2146' },
    { x: 590, y: 420, w: 120, h: 480, c: '#2b2d56' },
    { x: 730, y: 340, w: 180, h: 560, c: '#1e2246' },
    { x: 970, y: 260, w: 190, h: 640, c: '#2f2b58' },
    { x: 1220, y: 370, w: 140, h: 530, c: '#23284e' },
    { x: 1390, y: 310, w: 190, h: 590, c: '#292e5a' },
    { x: 1620, y: 390, w: 150, h: 510, c: '#1b1f40' },

    // Rightward extended skyline
    { x: 1800, y: 330, w: 180, h: 570, c: '#22264d' },
    { x: 2000, y: 290, w: 170, h: 610, c: '#1a1e3e' },
    { x: 2190, y: 350, w: 160, h: 550, c: '#242852' },
    { x: 2370, y: 310, w: 160, h: 590, c: '#1d2146' },
    { x: 2550, y: 280, w: 170, h: 620, c: '#282b58' },
    { x: 2740, y: 340, w: 160, h: 560, c: '#1e2246' },
    { x: 2920, y: 300, w: 170, h: 600, c: '#23284e' },
    { x: 3110, y: 330, w: 180, h: 570, c: '#1b1f40' },
    { x: 3310, y: 290, w: 170, h: 610, c: '#252954' },
  ];

  buildings.forEach((b) => {
    sCtx.fillStyle = b.c;
    sCtx.fillRect(b.x, b.y, b.w, b.h);
  });

  // Antennas
  sCtx.strokeStyle = '#1e2246';
  sCtx.lineWidth = 4;
  sCtx.beginPath();
  sCtx.moveTo(820, 340);
  sCtx.lineTo(820, 280);
  sCtx.stroke();

  sCtx.strokeStyle = '#2f2b58';
  sCtx.lineWidth = 5;
  sCtx.beginPath();
  sCtx.moveTo(1065, 260);
  sCtx.lineTo(1065, 190);
  sCtx.stroke();

  // Windows
  sCtx.fillStyle = '#6f79be';
  sCtx.globalAlpha = 0.65;
  [
    [755, 400], [795, 400], [835, 400], [875, 400],
    [755, 450], [795, 450], [835, 450],
  ].forEach(([wx, wy]) => sCtx.fillRect(wx, wy, 16, 24));

  sCtx.fillStyle = '#635999';
  sCtx.globalAlpha = 0.75;
  [
    [995, 320], [1035, 320], [1075, 320], [1115, 320],
  ].forEach(([wx, wy]) => sCtx.fillRect(wx, wy, 20, 26));
  sCtx.globalAlpha = 1.0;

  // Foliage trees
  sCtx.fillStyle = '#22833f';
  sCtx.beginPath();
  sCtx.arc(670, 720, 60, 0, Math.PI * 2);
  sCtx.arc(1290, 730, 65, 0, Math.PI * 2);
  sCtx.fill();

  sCtx.fillStyle = '#2ba652';
  sCtx.beginPath();
  sCtx.arc(710, 730, 50, 0, Math.PI * 2);
  sCtx.arc(1335, 740, 50, 0, Math.PI * 2);
  sCtx.fill();

  // Angular yellow rooftops
  sCtx.fillStyle = '#e2a637';
  sCtx.strokeStyle = '#222222';
  sCtx.lineWidth = 3;

  sCtx.beginPath();
  sCtx.moveTo(-1600, 620);
  sCtx.lineTo(760, 690);
  sCtx.lineTo(760, 1100);
  sCtx.lineTo(-1600, 1100);
  sCtx.closePath();
  sCtx.fill();
  sCtx.stroke();

  sCtx.beginPath();
  sCtx.moveTo(1200, 660);
  sCtx.lineTo(3600, 710);
  sCtx.lineTo(3600, 1100);
  sCtx.lineTo(1200, 1100);
  sCtx.closePath();
  sCtx.fill();
  sCtx.stroke();

  sCtx.restore();
  return cachedSkylineCanvas;
}

// Pre-blurred skyline cache: avoids expensive runtime Gaussian blur across 5 million pixels on every slider tick
const blurredSkylineCanvases = new Map<number, HTMLCanvasElement>();

function getBlurredSkylineCanvas(radius: number): HTMLCanvasElement {
  const roundedRadius = Math.max(0, Math.min(10, Math.round(radius)));
  if (roundedRadius === 0) return getCachedSkylineCanvas();

  let cached = blurredSkylineCanvases.get(roundedRadius);
  if (cached) return cached;

  const base = getCachedSkylineCanvas();
  cached = document.createElement('canvas');
  cached.width = base.width;
  cached.height = base.height;
  const bCtx = cached.getContext('2d');
  if (bCtx) {
    bCtx.filter = `blur(${roundedRadius}px)`;
    bCtx.drawImage(base, 0, 0);
  }
  blurredSkylineCanvases.set(roundedRadius, cached);
  return cached;
}

/**
 * Draws the city skyline buildings, antennas, windows, and foliage.
 * Uses cached offscreen canvas bitmap for near-zero rendering overhead.
 */
function drawSkyline(ctx: CanvasRenderingContext2D, anchorX: number, anchorY: number, bgScale: number, dofBlur: number) {
  ctx.save();
  ctx.translate(anchorX, anchorY);
  ctx.scale(bgScale, bgScale);
  ctx.translate(-anchorX, -anchorY);

  const blurRadius = dofBlur > 0.4 ? Math.min(10, Math.round(dofBlur)) : 0;
  const skyCanvas = blurRadius > 0 ? getBlurredSkylineCanvas(blurRadius) : getCachedSkylineCanvas();
  ctx.drawImage(skyCanvas, SKY_ORIGIN_X, SKY_ORIGIN_Y);

  ctx.restore();
}

// Module-level offscreen canvas for character lighting compositing
let sharedCharCanvas: HTMLCanvasElement | null = null;
function getSharedCharCanvas(): HTMLCanvasElement {
  if (!sharedCharCanvas) {
    sharedCharCanvas = document.createElement('canvas');
    sharedCharCanvas.width = 800;
    sharedCharCanvas.height = 1000;
  }
  return sharedCharCanvas;
}

/**
 * Renders the controlled neutral reference environment specifically for the Color & White Balance page.
 * Replaces the busy colorful outdoor scene with a dark neutral gray studio cyc,
 * neutral reference surfaces (18% gray card, white sphere, grayscale steps),
 * and controlled color calibration swatches alongside the canonical master character.
 */
function renderColorReferenceEnvironment(
  ctx: CanvasRenderingContext2D,
  opts: RenderSceneOptions,
  rollCenterX: number,
  rollCenterY: number,
  groundY: number
) {
  // 1. Neutral Dark Studio Cyclorama Wall
  const wallGrad = ctx.createLinearGradient(0, rollCenterY - 800, 0, groundY);
  wallGrad.addColorStop(0, '#0e131d');
  wallGrad.addColorStop(0.5, '#161c28');
  wallGrad.addColorStop(1, '#1e2636');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(rollCenterX - 1500, rollCenterY - 1500, 3000, 3000);

  // Subtle studio wall architectural grid accents
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1.5;
  for (let x = rollCenterX - 1200; x <= rollCenterX + 1200; x += 300) {
    ctx.beginPath();
    ctx.moveTo(x, rollCenterY - 1000);
    ctx.lineTo(x, groundY);
    ctx.stroke();
  }

  // 2. Neutral Studio Floor Plane
  const floorGrad = ctx.createLinearGradient(0, groundY, 0, groundY + 700);
  floorGrad.addColorStop(0, '#1a2230');
  floorGrad.addColorStop(0.2, '#121822');
  floorGrad.addColorStop(1, '#070a10');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(rollCenterX - 1500, groundY, 3000, 1500);

  // Studio horizon seam line (infinity cyc cove curve)
  ctx.strokeStyle = '#2d3748';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(rollCenterX - 1500, groundY);
  ctx.lineTo(rollCenterX + 1500, groundY);
  ctx.stroke();

  // 3. Stage Left: Matte Neutral White 3D Sphere & Pedestal
  const pedX = rollCenterX - 430;
  const pedW = 140;
  const pedH = 220;
  const pedY = groundY - pedH;

  // Contact shadow under pedestal
  ctx.save();
  ctx.fillStyle = 'rgba(5, 8, 15, 0.65)';
  ctx.beginPath();
  ctx.ellipse(pedX, groundY + 2, 80, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Pedestal body
  ctx.fillStyle = '#222938';
  ctx.strokeStyle = '#384357';
  ctx.lineWidth = 2;
  ctx.fillRect(pedX - pedW / 2, pedY, pedW, pedH);
  ctx.strokeRect(pedX - pedW / 2, pedY, pedW, pedH);

  // Pedestal top rim
  ctx.fillStyle = '#2e374a';
  ctx.beginPath();
  ctx.ellipse(pedX, pedY, pedW / 2, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Sphere contact shadow on pedestal top
  ctx.save();
  ctx.fillStyle = 'rgba(8, 12, 20, 0.6)';
  ctx.beginPath();
  ctx.ellipse(pedX, pedY, 46, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Neutral White Sphere (56px radius)
  const sphereR = 56;
  const sphereY = pedY - sphereR;
  const sphereGrad = ctx.createRadialGradient(
    pedX - 18,
    sphereY - 18,
    6,
    pedX,
    sphereY,
    sphereR
  );
  sphereGrad.addColorStop(0, '#ffffff'); // Clean specular highlight
  sphereGrad.addColorStop(0.35, '#e2e8f0'); // Light midtone
  sphereGrad.addColorStop(0.7, '#94a3b8'); // Shadow core
  sphereGrad.addColorStop(0.9, '#64748b'); // Terminator
  sphereGrad.addColorStop(1, '#475569'); // Reflected shadow bounce
  ctx.fillStyle = sphereGrad;
  ctx.beginPath();
  ctx.arc(pedX, sphereY, sphereR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Pedestal labels
  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('WHITE REFERENCE SPHERE', pedX, groundY + 22);
  ctx.fillStyle = '#64748b';
  ctx.font = '10px monospace';
  ctx.fillText('100% SPECULAR & DIFFUSE', pedX, groundY + 36);

  // 4. Stage Right: Calibration Stand with 18% Gray Card & Color Checker
  const boardX = rollCenterX + 430;
  const boardW = 340;
  const boardH = 270;
  const boardY = groundY - 380;

  // Easel legs
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(boardX, groundY - 260);
  ctx.lineTo(boardX - 80, groundY);
  ctx.moveTo(boardX, groundY - 260);
  ctx.lineTo(boardX + 80, groundY);
  ctx.stroke();

  // Easel foot contact shadows
  ctx.save();
  ctx.fillStyle = 'rgba(5, 8, 15, 0.55)';
  ctx.beginPath();
  ctx.ellipse(boardX - 80, groundY + 1, 18, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(boardX + 80, groundY + 1, 18, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Calibration board surface
  ctx.fillStyle = '#171c26';
  ctx.strokeStyle = '#384357';
  ctx.lineWidth = 2.5;
  ctx.fillRect(boardX - boardW / 2, boardY, boardW, boardH);
  ctx.strokeRect(boardX - boardW / 2, boardY, boardW, boardH);

  // Board Header
  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CINEMATOGRAPHY REFERENCE TARGET', boardX, boardY + 18);
  ctx.fillStyle = '#64748b';
  ctx.font = '9px monospace';
  ctx.fillText('REC.709 · D65 CALIBRATION STANDARD', boardX, boardY + 30);

  // Tonal Reference Cards (Top Row)
  const cardW = 92;
  const cardH = 50;
  const cardY = boardY + 40;

  // Black card
  ctx.fillStyle = '#080808';
  ctx.fillRect(boardX - boardW / 2 + 16, cardY, cardW, cardH);
  ctx.strokeStyle = '#27272a';
  ctx.lineWidth = 1;
  ctx.strokeRect(boardX - boardW / 2 + 16, cardY, cardW, cardH);
  ctx.fillStyle = '#a1a1aa';
  ctx.font = 'bold 9.5px sans-serif';
  ctx.fillText('BLACK 0%', boardX - boardW / 2 + 16 + cardW / 2, cardY + cardH + 13);

  // 18% Gray card (Centerpiece of White Balance!)
  ctx.fillStyle = '#737373'; // Exactly 18% reflectance neutral gray
  ctx.fillRect(boardX - cardW / 2, cardY, cardW, cardH);
  ctx.strokeStyle = '#52525b';
  ctx.strokeRect(boardX - cardW / 2, cardY, cardW, cardH);
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('18% GRAY (WB)', boardX, cardY + cardH + 13);

  // 90% White card
  ctx.fillStyle = '#f4f4f5';
  ctx.fillRect(boardX + boardW / 2 - 16 - cardW, cardY, cardW, cardH);
  ctx.strokeStyle = '#d4d4d8';
  ctx.strokeRect(boardX + boardW / 2 - 16 - cardW, cardY, cardW, cardH);
  ctx.fillStyle = '#a1a1aa';
  ctx.font = 'bold 9.5px sans-serif';
  ctx.fillText('WHITE 90%', boardX + boardW / 2 - 16 - cardW / 2, cardY + cardH + 13);

  // 6-Step Grayscale Ramp
  const rampY = cardY + cardH + 24;
  const rampSteps = ['#050505', '#333333', '#666666', '#999999', '#cccccc', '#f5f5f5'];
  const stepW = (boardW - 32) / rampSteps.length;
  for (let i = 0; i < rampSteps.length; i++) {
    ctx.fillStyle = rampSteps[i];
    ctx.fillRect(boardX - boardW / 2 + 16 + i * stepW, rampY, stepW, 16);
  }
  ctx.strokeStyle = '#3f3f46';
  ctx.lineWidth = 1;
  ctx.strokeRect(boardX - boardW / 2 + 16, rampY, boardW - 32, 16);

  // Step Labels underneath ramp
  ctx.fillStyle = '#64748b';
  ctx.font = '8px monospace';
  ['0%', '20%', '40%', '60%', '80%', '100%'].forEach((lbl, i) => {
    ctx.fillText(lbl, boardX - boardW / 2 + 16 + i * stepW + stepW / 2, rampY + 26);
  });

  // Chromatic Calibration Swatches (Color Checker rows)
  const swatchY = rampY + 34;
  const swatchesRow1 = ['#dc2626', '#16a34a', '#2563eb', '#06b6d4']; // Red, Green, Blue, Cyan
  const swatchesRow2 = ['#d946ef', '#eab308', '#dfa684', '#8a5438']; // Magenta, Yellow, Skin 1, Skin 2
  const swW = (boardW - 32) / 4;
  const swH = 26;

  for (let i = 0; i < swatchesRow1.length; i++) {
    ctx.fillStyle = swatchesRow1[i];
    ctx.fillRect(boardX - boardW / 2 + 16 + i * swW + 2, swatchY, swW - 4, swH);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.strokeRect(boardX - boardW / 2 + 16 + i * swW + 2, swatchY, swW - 4, swH);
  }

  for (let i = 0; i < swatchesRow2.length; i++) {
    ctx.fillStyle = swatchesRow2[i];
    ctx.fillRect(boardX - boardW / 2 + 16 + i * swW + 2, swatchY + swH + 5, swW - 4, swH);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.strokeRect(boardX - boardW / 2 + 16 + i * swW + 2, swatchY + swH + 5, swW - 4, swH);
  }

  // Board label
  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('COLOR & EXPOSURE CHART', boardX, groundY + 22);
  ctx.fillStyle = '#64748b';
  ctx.font = '10px monospace';
  ctx.fillText('18% GRAY / COLOR CHECKER', boardX, groundY + 36);

  // 5. Contact Shadow under Character
  ctx.save();
  ctx.fillStyle = 'rgba(5, 8, 15, 0.65)';
  ctx.beginPath();
  ctx.ellipse(rollCenterX, groundY + 4, 110 * opts.totalSubjectScale, 18 * opts.totalSubjectScale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 6. Canonical Master Character (Pristine, consistent with all pages)
  ctx.save();
  ctx.translate(rollCenterX, rollCenterY);
  drawActor(
    ctx,
    opts.totalSubjectScale,
    opts.keyIntensity ?? 80,
    opts.rimIntensity ?? 60,
    opts.keyAngleDeg ?? -45,
    opts.rimAngleDeg ?? 135,
    opts.lightColorHex ?? '#ffffff'
  );
  ctx.restore();

  // 7. PHOTOGRAPHIC COLOR TEMPERATURE & WHITE BALANCE GRADING PASS
  const kelvin = opts.colorKelvin ?? 5600;
  const tint = opts.tint ?? 0;
  const harmony = opts.colorHarmony || 'natural';

  // A. Kelvin White Balance Color Temperature Shift (2000K to 10000K, baseline 5600K)
  if (kelvin !== 5600) {
    if (kelvin < 5600) {
      // Warm golden/amber shift (2000K to 5600K)
      const t = Math.min(1, Math.max(0, (5600 - kelvin) / 3600));
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      const r = 255;
      const g = Math.round(255 - t * 80);
      const b = Math.round(255 - t * 190);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(rollCenterX - 1500, rollCenterY - 1500, 3000, 3000);
      ctx.restore();

      // Warm highlight bloom
      if (t > 0.08) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(255, 170, 50, ${t * 0.16})`;
        ctx.fillRect(rollCenterX - 1500, rollCenterY - 1500, 3000, 3000);
        ctx.restore();
      }
    } else {
      // Cool twilight/sky blue shift (5600K to 10000K)
      const t = Math.min(1, Math.max(0, (kelvin - 5600) / 4400));
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      const r = Math.round(255 - t * 125);
      const g = Math.round(255 - t * 50);
      const b = 255;
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(rollCenterX - 1500, rollCenterY - 1500, 3000, 3000);
      ctx.restore();

      // Cool highlight bloom
      if (t > 0.08) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(100, 170, 255, ${t * 0.15})`;
        ctx.fillRect(rollCenterX - 1500, rollCenterY - 1500, 3000, 3000);
        ctx.restore();
      }
    }
  }

  // B. Tint (Green-Magenta CC) Color Correction (-50 to +50)
  if (tint !== 0) {
    if (tint > 0) {
      // Magenta / Rose shift (+1 to +50)
      const t = Math.min(1, Math.max(0, tint / 50));
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      const r = 255;
      const g = Math.round(255 - t * 110);
      const b = Math.round(255 - t * 35);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(rollCenterX - 1500, rollCenterY - 1500, 3000, 3000);
      ctx.restore();

      // Subtle magenta screen
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = `rgba(244, 63, 140, ${t * 0.14})`;
      ctx.fillRect(rollCenterX - 1500, rollCenterY - 1500, 3000, 3000);
      ctx.restore();
    } else {
      // Green shift (-1 to -50)
      const t = Math.min(1, Math.max(0, Math.abs(tint) / 50));
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      const r = Math.round(255 - t * 105);
      const g = 255;
      const b = Math.round(255 - t * 105);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(rollCenterX - 1500, rollCenterY - 1500, 3000, 3000);
      ctx.restore();

      // Subtle green screen
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = `rgba(34, 197, 94, ${t * 0.14})`;
      ctx.fillRect(rollCenterX - 1500, rollCenterY - 1500, 3000, 3000);
      ctx.restore();
    }
  }

  // C. Cinematic Color Harmonies
  if (harmony === 'complementary') {
    // Hollywood Teal & Orange dual contrast
    ctx.save();
    ctx.globalCompositeOperation = 'color-burn';
    ctx.fillStyle = 'rgba(6, 182, 212, 0.22)'; // Teal shadows
    ctx.fillRect(rollCenterX - 1500, rollCenterY - 1500, 3000, 3000);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(245, 158, 11, 0.18)'; // Orange highlights
    ctx.fillRect(rollCenterX - 1500, rollCenterY - 1500, 3000, 3000);
    ctx.restore();
  } else if (harmony === 'triadic') {
    ctx.save();
    ctx.globalCompositeOperation = 'color-dodge';
    ctx.fillStyle = 'rgba(99, 102, 241, 0.10)';
    ctx.fillRect(rollCenterX - 1500, rollCenterY - 1500, 3000, 3000);
    ctx.restore();
  } else if (harmony === 'analogous') {
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.fillRect(rollCenterX - 1500, rollCenterY - 1500, 3000, 3000);
    ctx.restore();
  } else if (harmony === 'split-complementary') {
    ctx.save();
    ctx.globalCompositeOperation = 'color-burn';
    ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
    ctx.fillRect(rollCenterX - 1500, rollCenterY - 1500, 3000, 3000);
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(234, 179, 8, 0.12)';
    ctx.fillRect(rollCenterX - 1500, rollCenterY - 1500, 3000, 3000);
    ctx.restore();
  }
}

/**
 * Renders the restrained dark neutral studio environment specifically for the Lighting page.
 * Keeps the canonical master character pristine while providing high contrast so lighting
 * changes (Key intensity, distance, position, rotation, Fill shadow contrast, Rim edge separation, Kelvin)
 * are immediately observable.
 */
function renderStudioLightingEnvironment(
  ctx: CanvasRenderingContext2D,
  opts: RenderSceneOptions,
  rollCenterX: number,
  rollCenterY: number,
  groundY: number
) {
  const faceAnchorX = rollCenterX;
  const faceAnchorY = rollCenterY;

  // 1. Dark Neutral Studio Backdrop
  const wallGrad = ctx.createLinearGradient(0, rollCenterY - 600, 0, groundY);
  wallGrad.addColorStop(0, '#050811');
  wallGrad.addColorStop(0.6, '#090e1c');
  wallGrad.addColorStop(1, '#0e1628');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(rollCenterX - 1500, rollCenterY - 1500, 3000, 3000);

  // 2. Studio Floor Plane
  const floorGrad = ctx.createLinearGradient(0, groundY, 0, groundY + 700);
  floorGrad.addColorStop(0, '#0d1424');
  floorGrad.addColorStop(0.25, '#070b16');
  floorGrad.addColorStop(1, '#03050a');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(rollCenterX - 1500, groundY, 3000, 1500);

  // Subtle studio cove line (cyc wall seam)
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(rollCenterX - 1500, groundY);
  ctx.lineTo(rollCenterX + 1500, groundY);
  ctx.stroke();

  // 3. Directional Key Light Pool on Wall & Floor
  const keyX = opts.keyPos?.x ?? (faceAnchorX - 360);
  const keyY = opts.keyPos?.y ?? (faceAnchorY - 210);
  const keyRot = opts.keyRotationDeg ?? ((Math.atan2(faceAnchorY - keyY, faceAnchorX - keyX) * 180) / Math.PI);
  const keyRad = (keyRot * Math.PI) / 180;
  const keyDistM = opts.lightDistanceM ?? 2.2;

  // Calculate alignment from key light to character
  const toCharKeyX = faceAnchorX - keyX;
  const toCharKeyY = faceAnchorY - keyY;
  const aimAngleKey = (Math.atan2(toCharKeyY, toCharKeyX) * 180) / Math.PI;
  let keyAngleDiff = Math.abs(keyRot - aimAngleKey) % 360;
  if (keyAngleDiff > 180) keyAngleDiff = 360 - keyAngleDiff;
  const aimFactorKey = Math.max(0, Math.cos((keyAngleDiff * Math.PI) / 180)) ** 1.3;
  const effKeyFactor = (opts.keyIntensity / 100) * aimFactorKey * Math.min(2.2, (2.2 / Math.max(0.6, keyDistM)) ** 1.15);

  if (opts.keyIntensity > 2) {
    ctx.save();
    const beamTargetX = keyX + Math.cos(keyRad) * (keyDistM * 180);
    const beamTargetY = keyY + Math.sin(keyRad) * (keyDistM * 180);

    const poolGrad = ctx.createRadialGradient(
      beamTargetX,
      beamTargetY,
      20,
      beamTargetX,
      beamTargetY,
      Math.max(120, keyDistM * 120)
    );
    poolGrad.addColorStop(0, opts.lightColorHex);
    poolGrad.addColorStop(0.5, opts.lightColorHex);
    poolGrad.addColorStop(1, 'transparent');

    ctx.globalAlpha = Math.min(0.35, effKeyFactor * 0.30);
    ctx.fillStyle = poolGrad;
    ctx.beginPath();
    ctx.ellipse(
      beamTargetX,
      Math.min(groundY + 80, beamTargetY),
      Math.max(150, keyDistM * 130),
      Math.max(90, keyDistM * 80),
      keyRad * 0.25,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }

  // 4. Directional Fill Light Pool on Wall & Floor
  const fillX = opts.fillPos?.x ?? (faceAnchorX + 320);
  const fillY = opts.fillPos?.y ?? (faceAnchorY - 180);
  const fillRot = opts.fillRotationDeg ?? ((Math.atan2(faceAnchorY - fillY, faceAnchorX - fillX) * 180) / Math.PI);
  const fillRad = (fillRot * Math.PI) / 180;
  const fillDistM = opts.fillDistanceM ?? 2.5;

  const toCharFillX = faceAnchorX - fillX;
  const toCharFillY = faceAnchorY - fillY;
  const aimAngleFill = (Math.atan2(toCharFillY, toCharFillX) * 180) / Math.PI;
  let fillAngleDiff = Math.abs(fillRot - aimAngleFill) % 360;
  if (fillAngleDiff > 180) fillAngleDiff = 360 - fillAngleDiff;
  const aimFactorFill = Math.max(0, Math.cos((fillAngleDiff * Math.PI) / 180)) ** 1.3;
  const effFillFactor = ((opts.fillIntensity ?? 35) / 100) * aimFactorFill * Math.min(2.0, (2.5 / Math.max(0.6, fillDistM)) ** 1.1);

  if ((opts.fillIntensity ?? 0) > 2) {
    ctx.save();
    const fillTargetX = fillX + Math.cos(fillRad) * (fillDistM * 160);
    const fillTargetY = fillY + Math.sin(fillRad) * (fillDistM * 160);
    const fillPoolGrad = ctx.createRadialGradient(
      fillTargetX,
      fillTargetY,
      20,
      fillTargetX,
      fillTargetY,
      Math.max(120, fillDistM * 120)
    );
    fillPoolGrad.addColorStop(0, '#93c5fd');
    fillPoolGrad.addColorStop(0.5, '#60a5fa');
    fillPoolGrad.addColorStop(1, 'transparent');

    ctx.globalAlpha = Math.min(0.24, effFillFactor * 0.22);
    ctx.fillStyle = fillPoolGrad;
    ctx.beginPath();
    ctx.ellipse(
      fillTargetX,
      Math.min(groundY + 80, fillTargetY),
      Math.max(140, fillDistM * 120),
      Math.max(80, fillDistM * 75),
      fillRad * 0.25,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }

  // 5. Directional Rim Light Pool on Wall & Floor
  const rimX = opts.rimPos?.x ?? (faceAnchorX + 280);
  const rimY = opts.rimPos?.y ?? (faceAnchorY + 190);
  const rimRot = opts.rimRotationDeg ?? ((Math.atan2(faceAnchorY - rimY, faceAnchorX - rimX) * 180) / Math.PI);
  const rimRad = (rimRot * Math.PI) / 180;
  const rimDistM = opts.rimDistanceM ?? 2.0;

  const toCharRimX = faceAnchorX - rimX;
  const toCharRimY = faceAnchorY - rimY;
  const aimAngleRim = (Math.atan2(toCharRimY, toCharRimX) * 180) / Math.PI;
  let rimAngleDiff = Math.abs(rimRot - aimAngleRim) % 360;
  if (rimAngleDiff > 180) rimAngleDiff = 360 - rimAngleDiff;
  const aimFactorRim = Math.max(0, Math.cos((rimAngleDiff * Math.PI) / 180)) ** 1.3;
  const effRimFactor = ((opts.rimIntensity ?? 65) / 100) * aimFactorRim * Math.min(2.0, (2.0 / Math.max(0.6, rimDistM)) ** 1.1);

  if ((opts.rimIntensity ?? 0) > 2) {
    ctx.save();
    const rimTargetX = rimX + Math.cos(rimRad) * (rimDistM * 150);
    const rimTargetY = rimY + Math.sin(rimRad) * (rimDistM * 150);
    const rimPoolGrad = ctx.createRadialGradient(
      rimTargetX,
      rimTargetY,
      15,
      rimTargetX,
      rimTargetY,
      Math.max(100, rimDistM * 100)
    );
    rimPoolGrad.addColorStop(0, '#f8fafc');
    rimPoolGrad.addColorStop(0.5, '#cbd5e1');
    rimPoolGrad.addColorStop(1, 'transparent');

    ctx.globalAlpha = Math.min(0.20, effRimFactor * 0.18);
    ctx.fillStyle = rimPoolGrad;
    ctx.beginPath();
    ctx.ellipse(
      rimTargetX,
      Math.min(groundY + 80, rimTargetY),
      Math.max(120, rimDistM * 110),
      Math.max(70, rimDistM * 65),
      rimRad * 0.25,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }

  // 6. Contact Shadow on Floor (shifts opposite to Key position)
  const shadowDistX = -((keyX - faceAnchorX) / 360) * 26 * opts.totalSubjectScale;
  const shadowAlpha = Math.max(0.25, Math.min(0.92, 0.40 + effKeyFactor * 0.45));
  ctx.save();
  ctx.fillStyle = `rgba(2, 4, 8, ${shadowAlpha})`;
  ctx.beginPath();
  ctx.ellipse(
    rollCenterX + shadowDistX,
    groundY - 1,
    56 * opts.totalSubjectScale * (1 + Math.abs(keyX - faceAnchorX) / 600),
    8 * opts.totalSubjectScale,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();

  // 7. Canonical Master Character (Completely intact artwork with photographic lighting)
  const cCanvas = getSharedCharCanvas();
  const cCtx = cCanvas.getContext('2d');
  if (cCtx) {
    cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height);
    cCtx.save();
    cCtx.translate(400, 480);

    const keyAngle = Math.atan2(keyX - faceAnchorX, faceAnchorY - keyY) * (180 / Math.PI);
    const rimAngle = Math.atan2(rimX - faceAnchorX, faceAnchorY - rimY) * (180 / Math.PI);

    // Draw untouched canonical master character
    drawMasterCharacter(cCtx, opts.totalSubjectScale, {
      keyIntensity: Math.round(effKeyFactor * 100),
      rimIntensity: Math.round(effRimFactor * 100),
      keyAngleDeg: Math.round(keyAngle),
      rimAngleDeg: Math.round(rimAngle),
      lightColorHex: opts.lightColorHex,
    });

    // Apply photographic lighting overlay ONLY within the character silhouette
    cCtx.save();
    cCtx.globalCompositeOperation = 'source-atop';

    const keySideDir = keyX < faceAnchorX ? -1 : 1;
    const fillSideDir = fillX < faceAnchorX ? -1 : 1;
    const rimSideDir = rimX > faceAnchorX ? 1 : -1;

    // A. Directional Shadow on unlit side:
    // If Fill Light is on the opposite side of Key Light, it lifts the shadow!
    // If Fill Light is on the SAME side as Key Light, shadow on the unlit side is deeper!
    const fillLifting = fillSideDir !== keySideDir ? effFillFactor : 0;
    const maxShadowDarkness = Math.max(0.08, Math.min(0.74, 0.76 - fillLifting * 0.65));
    const shadowGrad = cCtx.createLinearGradient(
      keySideDir * -130 * opts.totalSubjectScale,
      0,
      keySideDir * 130 * opts.totalSubjectScale,
      0
    );
    shadowGrad.addColorStop(0, 'rgba(2, 6, 16, 0)');
    shadowGrad.addColorStop(0.35, `rgba(2, 6, 16, ${maxShadowDarkness * 0.45})`);
    shadowGrad.addColorStop(1, `rgba(2, 6, 16, ${maxShadowDarkness})`);

    cCtx.fillStyle = shadowGrad;
    cCtx.fillRect(-400, -480, 800, 1000);

    // B. Overall Studio Underexposure when Key Light is low
    if (effKeyFactor < 0.9) {
      const underexposeDarkness = (0.9 - effKeyFactor) * (1.0 - effFillFactor * 0.55) * 0.62;
      cCtx.fillStyle = `rgba(2, 5, 14, ${underexposeDarkness})`;
      cCtx.fillRect(-400, -480, 800, 1000);
    }

    // C. Directional Key Light Illumination & Kelvin Emitter Color
    if (effKeyFactor > 0.04) {
      const keyWashGrad = cCtx.createLinearGradient(
        keySideDir * 140 * opts.totalSubjectScale,
        0,
        keySideDir * -60 * opts.totalSubjectScale,
        0
      );
      const washAlpha = Math.min(0.42, effKeyFactor * 0.32);
      keyWashGrad.addColorStop(0, opts.lightColorHex);
      keyWashGrad.addColorStop(0.5, opts.lightColorHex);
      keyWashGrad.addColorStop(1, 'transparent');

      cCtx.globalAlpha = washAlpha;
      cCtx.fillStyle = keyWashGrad;
      cCtx.fillRect(-400, -480, 800, 1000);
      cCtx.globalAlpha = 1.0;
    }

    // D. Directional Fill Light Wash (wherever Fill Light is positioned!)
    if (effFillFactor > 0.04) {
      const fillWashGrad = cCtx.createLinearGradient(
        fillSideDir * 130 * opts.totalSubjectScale,
        0,
        fillSideDir * -40 * opts.totalSubjectScale,
        0
      );
      const fillWashAlpha = Math.min(0.28, effFillFactor * 0.24);
      fillWashGrad.addColorStop(0, '#93c5fd');
      fillWashGrad.addColorStop(0.4, '#bfdbfe');
      fillWashGrad.addColorStop(1, 'transparent');

      cCtx.globalAlpha = fillWashAlpha;
      cCtx.fillStyle = fillWashGrad;
      cCtx.fillRect(-400, -480, 800, 1000);
      cCtx.globalAlpha = 1.0;
    }

    // E. Classic Cinematography Lighting Pattern Signatures
    if (opts.lightingPattern === 'rembrandt' && effKeyFactor > 0.15) {
      const shadowCheekX = -keySideDir * 28 * opts.totalSubjectScale;
      const shadowCheekY = 28 * opts.totalSubjectScale;
      const remGrad = cCtx.createRadialGradient(
        shadowCheekX,
        shadowCheekY,
        2,
        shadowCheekX,
        shadowCheekY,
        18 * opts.totalSubjectScale
      );
      remGrad.addColorStop(0, opts.lightColorHex);
      remGrad.addColorStop(0.7, opts.lightColorHex);
      remGrad.addColorStop(1, 'transparent');
      cCtx.globalAlpha = Math.min(0.42, effKeyFactor * 0.35);
      cCtx.fillStyle = remGrad;
      cCtx.beginPath();
      cCtx.ellipse(shadowCheekX, shadowCheekY, 15 * opts.totalSubjectScale, 19 * opts.totalSubjectScale, 0, 0, Math.PI * 2);
      cCtx.fill();
      cCtx.globalAlpha = 1.0;
    } else if (opts.lightingPattern === 'split' && effKeyFactor > 0.15) {
      const splitGrad = cCtx.createLinearGradient(
        -keySideDir * 4,
        0,
        -keySideDir * 55 * opts.totalSubjectScale,
        0
      );
      splitGrad.addColorStop(0, 'rgba(2, 5, 14, 0)');
      splitGrad.addColorStop(1, `rgba(2, 5, 14, ${Math.max(0.2, 0.70 - fillLifting * 0.55)})`);
      cCtx.fillStyle = splitGrad;
      cCtx.fillRect(-400, -480, 800, 1000);
    } else if (opts.lightingPattern === 'butterfly' && effKeyFactor > 0.15) {
      const noseShadowGrad = cCtx.createRadialGradient(
        0,
        52 * opts.totalSubjectScale,
        2,
        0,
        52 * opts.totalSubjectScale,
        24 * opts.totalSubjectScale
      );
      noseShadowGrad.addColorStop(0, `rgba(2, 5, 14, ${Math.max(0.12, 0.58 - fillLifting * 0.45)})`);
      noseShadowGrad.addColorStop(1, 'transparent');
      cCtx.fillStyle = noseShadowGrad;
      cCtx.beginPath();
      cCtx.ellipse(0, 52 * opts.totalSubjectScale, 20 * opts.totalSubjectScale, 13 * opts.totalSubjectScale, 0, 0, Math.PI * 2);
      cCtx.fill();
    }

    // F. Rim / Edge Separation Highlighting (wherever Rim Light is positioned!)
    if (effRimFactor > 0.12) {
      const rimAlpha = Math.min(0.85, effRimFactor * 0.80);
      const rimEdgeGrad = cCtx.createLinearGradient(
        rimSideDir * 125 * opts.totalSubjectScale,
        0,
        rimSideDir * 45 * opts.totalSubjectScale,
        0
      );
      rimEdgeGrad.addColorStop(0, '#ffffff');
      rimEdgeGrad.addColorStop(0.35, '#c7d2fe');
      rimEdgeGrad.addColorStop(1, 'transparent');

      cCtx.globalAlpha = rimAlpha;
      cCtx.fillStyle = rimEdgeGrad;
      cCtx.fillRect(-400, -480, 800, 1000);
      cCtx.globalAlpha = 1.0;
    }

    cCtx.restore();
    cCtx.restore();

    // Composite completed actor onto main canvas
    ctx.drawImage(cCanvas, rollCenterX - 400, rollCenterY - 480);
  }
}

/**
 * Renders all world scene visual elements into the target canvas context.
 * Implements layered depth-of-field:
 * - Distant Background (Sky, Sun, Clouds, Skyline): softens according to distant CoC blur
 * - Midground (Parapet wall, accent trim): softens moderately according to midground CoC blur
 * - Focus Plane (Coping top strip, contact shadow): on focus plane, sharp
 * - Subject (Blue Character): permanently the sharp reference plane
 */
function renderSceneElements(
  ctx: CanvasRenderingContext2D,
  opts: RenderSceneOptions,
  rollCenterX: number,
  rollCenterY: number,
  groundY: number
) {
  if (opts.isColorReferenceScene) {
    renderColorReferenceEnvironment(ctx, opts, rollCenterX, rollCenterY, groundY);
    return;
  }

  if (opts.isStudioLighting) {
    renderStudioLightingEnvironment(ctx, opts, rollCenterX, rollCenterY, groundY);
    return;
  }

  const distantBlur = opts.dofBlurDistant !== undefined ? opts.dofBlurDistant : (opts.dofBlur || 0);
  const midBlur = opts.dofBlurMidground !== undefined ? opts.dofBlurMidground : Math.max(0, distantBlur * 0.65);

  // A. Extended Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, rollCenterY - 1500, 0, groundY + 800);
  skyGrad.addColorStop(0, '#1a73e8');
  skyGrad.addColorStop(0.5, '#1e7bf2');
  skyGrad.addColorStop(1, '#1b6dd9');

  ctx.fillStyle = skyGrad;
  ctx.fillRect(rollCenterX - 1500, rollCenterY - 1500, 3000, 3000);

  // B & C. Distant Celestial Layer: Sun & Clouds
  let sunX = 1540 + (50 - opts.focalLengthMm) * 1.5;
  let sunY = 230 + opts.horizonShiftY * 0.25;
  let sunRadius = 65 * Math.min(1.35, opts.bgScale);

  if (opts.compositionMode === 'rule-of-thirds') {
    sunX = 1280;
    sunY = 260;
  } else if (opts.compositionMode === 'visual-balance') {
    sunX = 1500;
    sunY = 220;
    sunRadius = 78 * Math.min(1.35, opts.bgScale);
  } else if (opts.compositionMode === 'diagonal') {
    sunX = 1560;
    sunY = 220;
    sunRadius = 68 * Math.min(1.35, opts.bgScale);
  }

  ctx.save();
  if (distantBlur > 1.2) {
    ctx.filter = `blur(${Math.min(8, Math.round(distantBlur * 0.85))}px)`;
  }

  // Sun
  ctx.fillStyle = '#ffd83b';
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
  ctx.fill();

  // Clouds
  const paths = getCloudPaths();
  ctx.save();
  ctx.translate(180 + opts.horizonShiftY * 0.15, 130 + opts.horizonShiftY * 0.2);
  ctx.scale(opts.bgScale * 0.9, opts.bgScale * 0.9);
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.95;
  ctx.fill(paths.cloudL);
  ctx.restore();

  ctx.save();
  ctx.translate(1380 - opts.horizonShiftY * 0.1, 80 + opts.horizonShiftY * 0.2);
  ctx.scale(opts.bgScale * 0.8, opts.bgScale * 0.8);
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.9;
  ctx.fill(paths.cloudR);
  ctx.restore();

  ctx.restore(); // Restore sun & clouds filter

  // D. City Skyline (Distant Background: uses pre-cached / pre-blurred bitmaps)
  drawSkyline(ctx, rollCenterX, rollCenterY, opts.bgScale, distantBlur);

  // Composition-Specific Background & Midground Architectural Structures
  if (opts.compositionMode === 'visual-balance') {
    // Heavy right-side architectural tower to counterbalance left-side subject
    ctx.fillStyle = '#132138';
    ctx.strokeStyle = '#050b14';
    ctx.lineWidth = 3.5;
    ctx.fillRect(1380, 260, 240, groundY - 260);
    ctx.strokeRect(1380, 260, 240, groundY - 260);

    // Glowing warm windows
    ctx.fillStyle = '#ffd83b';
    [
      [1420, 320], [1480, 320], [1540, 320],
      [1420, 390], [1480, 390], [1540, 390],
      [1420, 460], [1480, 460], [1540, 460],
    ].forEach(([wx, wy]) => ctx.fillRect(wx, wy, 24, 34));

    // Decorative tower cornice
    ctx.fillStyle = '#e2a637';
    ctx.beginPath();
    ctx.moveTo(1360, 260);
    ctx.lineTo(1500, 190);
    ctx.lineTo(1640, 260);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (opts.compositionMode === 'triangles') {
    // Triangular architectural gable pediment behind subject
    ctx.fillStyle = '#0f1c30';
    ctx.strokeStyle = '#050b14';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(320, groundY);
    ctx.lineTo(rollCenterX, rollCenterY - 180);
    ctx.lineTo(1600, groundY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Central circular rosette window inside gable
    ctx.fillStyle = '#1b2e4b';
    ctx.beginPath();
    ctx.arc(rollCenterX, rollCenterY - 90, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Vertical apex antenna spire
    ctx.strokeStyle = '#2a4269';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(rollCenterX, rollCenterY - 180);
    ctx.lineTo(rollCenterX, rollCenterY - 270);
    ctx.stroke();
  } else if (opts.compositionMode === 'symmetry') {
    // Symmetrical flanking architectural pillars
    ctx.fillStyle = '#0d1b2a';
    ctx.strokeStyle = '#050b14';
    ctx.lineWidth = 3;
    ctx.fillRect(440, groundY - 260, 70, 260);
    ctx.strokeRect(440, groundY - 260, 70, 260);
    ctx.fillRect(1410, groundY - 260, 70, 260);
    ctx.strokeRect(1410, groundY - 260, 70, 260);

    ctx.fillStyle = '#1b2e4b';
    ctx.fillRect(430, groundY - 275, 90, 16);
    ctx.fillRect(1400, groundY - 275, 90, 16);
  } else if (opts.compositionMode === 'diagonal') {
    // Dynamic Diagonal Architectural Feature:
    // Sleek modern angled rooftop canopy cantilever structural beam sloping through midground
    ctx.save();
    if (midBlur > 1.4) {
      ctx.filter = `blur(${Math.min(4, Math.round(midBlur * 0.7))}px)`;
    }

    // 1. Structural Stanchion Mast / Apex Tower at upper-left terrace (anchor of the diagonal)
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#050b14';
    ctx.lineWidth = 3.5;
    ctx.fillRect(128, 140, 24, groundY - 140);
    ctx.strokeRect(128, 140, 24, groundY - 140);

    // Warm apex luminaire / signal beacon
    ctx.fillStyle = '#ffd83b';
    ctx.beginPath();
    ctx.arc(140, 138, 7, 0, Math.PI * 2);
    ctx.fill();

    // 2. Slender Structural Tension Rods / Cable Stays
    // Dropping from the diagonal beam to the rooftop floor or structure
    ctx.strokeStyle = '#2a4269';
    ctx.lineWidth = 2;
    [400, 720, 1040, 1360, 1680].forEach((rx) => {
      const ry = 180 + ((rx - 140) * (840 - 180)) / (1780 - 140);
      ctx.beginPath();
      ctx.moveTo(rx, ry + 10);
      ctx.lineTo(rx, groundY);
      ctx.stroke();

      // Small tension bracket clevis at base
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(rx - 4, groundY - 8, 8, 8);
    });

    // 3. Primary Diagonal Cantilever Beam (Narrow, elegant architectural spar)
    // Runs from (140, 180) to (1780, 840)
    const beamAngle = Math.atan2(840 - 180, 1780 - 140);
    const beamLen = Math.hypot(1780 - 140, 840 - 180);

    ctx.save();
    ctx.translate(140, 180);
    ctx.rotate(beamAngle);

    // Main steel beam body (20px narrow profile)
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#050b14';
    ctx.lineWidth = 3.5;
    ctx.fillRect(-10, -10, beamLen + 20, 20);
    ctx.strokeRect(-10, -10, beamLen + 20, 20);

    // Inner shadow flange
    ctx.fillStyle = '#0a101d';
    ctx.fillRect(0, 0, beamLen, 8);

    // Vibrant cyan architectural highlight strip along top edge
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-10, -10, beamLen + 20, 3.5);

    // Hardware rivets/bolts along beam
    ctx.fillStyle = '#475569';
    for (let bx = 60; bx < beamLen; bx += 140) {
      ctx.beginPath();
      ctx.arc(bx, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // 4. Sloping Balustrade / Handrail Segment in midground (reinforcing the diagonal flow)
    ctx.strokeStyle = '#2a4269';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(140, 220);
    ctx.lineTo(1780, 880);
    ctx.stroke();

    ctx.restore();
  }

  // Establishing Shot Architectural Location Features:
  // Rooftop Observatory Terrace Entrance Pavilion, Warm Ambient Portal, and Railings
  if (opts.isEstablishingScene) {
    const isWide = opts.establishingShot === 'wide';
    ctx.save();
    if (midBlur > 1.4 && !isWide) {
      ctx.filter = `blur(${Math.min(4.5, Math.round(midBlur * 0.7))}px)`;
    }

    // 1. Sleek Rooftop Observatory Antenna / Beacon Spire rising in background
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(340, groundY - 280);
    ctx.lineTo(340, groundY - 480);
    ctx.stroke();

    // Beacon crossbars & signal lights
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(320, groundY - 420);
    ctx.lineTo(360, groundY - 420);
    ctx.moveTo(325, groundY - 370);
    ctx.lineTo(355, groundY - 370);
    ctx.stroke();

    // Red beacon lamp top
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(340, groundY - 482, 5, 0, Math.PI * 2);
    ctx.fill();

    // 2. Observatory Entrance Pavilion Main Structure (Left Terrace)
    // Structure Base
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#050b14';
    ctx.lineWidth = 3.5;
    ctx.fillRect(180, groundY - 310, 320, 310);
    ctx.strokeRect(180, groundY - 310, 320, 310);

    // Architectural Canopy / Overhang Roof
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(160, groundY - 325, 360, 25);
    ctx.strokeRect(160, groundY - 325, 360, 25);

    // Cyan architectural trim accent line
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(160, groundY - 304, 360, 4);

    // 3. Illuminated Entrance Doorway / Archway
    // Warm inviting golden ambient interior glow
    const doorGrad = ctx.createLinearGradient(0, groundY - 220, 0, groundY);
    doorGrad.addColorStop(0, '#f59e0b');
    doorGrad.addColorStop(0.7, '#d97706');
    doorGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = doorGrad;
    ctx.fillRect(260, groundY - 220, 150, 220);
    ctx.strokeStyle = '#050b14';
    ctx.lineWidth = 3;
    ctx.strokeRect(260, groundY - 220, 150, 220);

    // Interior hallway silhouette / glass mullion divider
    ctx.strokeStyle = 'rgba(5, 11, 20, 0.4)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(335, groundY - 220);
    ctx.lineTo(335, groundY);
    ctx.stroke();

    // Doorway Header / Transom Plate
    ctx.fillStyle = '#090d16';
    ctx.fillRect(250, groundY - 250, 170, 24);
    ctx.strokeRect(250, groundY - 250, 170, 24);

    // Subtle transom text
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('OBSERVATORY ENTRANCE', 335, groundY - 235);

    // Modern Terrace Wall Sconce / Lantern emitting warm downlight
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(445, groundY - 200, 7, 0, Math.PI * 2);
    ctx.fill();

    // Soft warm lantern pool of light
    ctx.save();
    ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
    ctx.beginPath();
    ctx.moveTo(445, groundY - 200);
    ctx.lineTo(410, groundY);
    ctx.lineTo(490, groundY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 4. Modern Glass Stanchion Terrace Railing along coping
    const railXStart = 500;
    const railXEnd = 1750;
    const railH = 75;

    // Top Handrail
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(railXStart, groundY - railH);
    ctx.lineTo(railXEnd, groundY - railH);
    ctx.stroke();

    // Glass panel tint
    ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.fillRect(railXStart, groundY - railH, railXEnd - railXStart, railH - 14);

    // Vertical Stanchion Posts every 110px
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    for (let rx = railXStart; rx <= railXEnd; rx += 110) {
      ctx.beginPath();
      ctx.moveTo(rx, groundY - railH);
      ctx.lineTo(rx, groundY - 14);
      ctx.stroke();
    }

    ctx.restore();
  }

  // E. Ground Plane (Rooftop Stage): Natural width and thickness
  // Parapet wall body & Trim accent line (Midground): softens progressively when DOF is shallow
  ctx.save();
  if (midBlur > 1.4) {
    ctx.filter = `blur(${Math.min(5, Math.round(midBlur * 0.75))}px)`;
  }
  ctx.fillStyle = '#0d1b2a';
  ctx.strokeStyle = '#050b14';
  ctx.lineWidth = 4;
  ctx.fillRect(rollCenterX - 1500, groundY, 3000, 2000);
  ctx.strokeRect(rollCenterX - 1500, groundY, 3000, 2000);

  // Trim accent line
  ctx.strokeStyle = '#2a4269';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(rollCenterX - 1500, groundY + 14);
  ctx.lineTo(rollCenterX + 1500, groundY + 14);
  ctx.stroke();
  ctx.restore();

  // Coping top strip (floor line where feet contact): STRICTLY ON FOCUS PLANE (SHARP & CRISP)
  ctx.fillStyle = '#1b2e4b';
  ctx.fillRect(rollCenterX - 1500, groundY - 14, 3000, 26);
  ctx.strokeRect(rollCenterX - 1500, groundY - 14, 3000, 26);

  // Composition-Specific Floor Perspective Lines (Leading Lines)
  if (opts.compositionMode === 'leading-lines') {
    ctx.strokeStyle = '#2a4269';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 1080);
    ctx.lineTo(rollCenterX - 25, groundY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(1920, 1080);
    ctx.lineTo(rollCenterX + 25, groundY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(480, 1080);
    ctx.lineTo(rollCenterX - 8, groundY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(1440, 1080);
    ctx.lineTo(rollCenterX + 8, groundY);
    ctx.stroke();
  }

  // Composition-Specific Floor Perspective Lines (Diagonal mode dynamic floor joints)
  if (opts.compositionMode === 'diagonal') {
    ctx.strokeStyle = '#223854';
    ctx.lineWidth = 2.5;
    [
      [180, 1080, 680, groundY],
      [580, 1080, 1080, groundY],
      [980, 1080, 1480, groundY],
      [1380, 1080, 1880, groundY],
    ].forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });
  }

  // Composition-Specific Secondary Internal Frame (Frame within Frame)
  if (opts.compositionMode === 'frame-in-frame') {
    ctx.fillStyle = '#0a1626';
    ctx.strokeStyle = '#050b14';
    ctx.lineWidth = 4;
    // Left post
    ctx.fillRect(360, 150, 55, groundY - 150);
    ctx.strokeRect(360, 150, 55, groundY - 150);
    // Right post
    ctx.fillRect(1505, 150, 55, groundY - 150);
    ctx.strokeRect(1505, 150, 55, groundY - 150);
    // Top lintel beam
    ctx.fillRect(340, 150, 1240, 55);
    ctx.strokeRect(340, 150, 1240, 55);
    // Inner trim
    ctx.fillStyle = '#1b2e4b';
    ctx.fillRect(355, 205, 1210, 12);
  }

  // Contact shadow directly beneath feet (dynamically shifts opposite to key light)
  const keyAngle = opts.keyAngleDeg ?? -45;
  const shadowShiftX = -(keyAngle / 45) * 18 * opts.totalSubjectScale;
  // F. Characters: Master Character Anchor
  if (!opts.hideActor) {
    if (opts.masterCharactersMode) {
      const mode = opts.masterCharactersMode;
      const chars = [mode.char1, mode.char2];
      for (const char of chars) {
        if (!char) continue;
        const charScale = (opts.totalSubjectScale ?? 1) * (char.scale ?? 0.85);
        const cX = char.x;
        // Strict ground plane guarantee: soles of feet at local y=358 align with groundY
        const cY = groundY - 358 * charScale;

        // Contact shadow directly beneath feet
        ctx.save();
        ctx.fillStyle = 'rgba(4, 9, 18, 0.65)';
        ctx.beginPath();
        ctx.ellipse(
          cX + shadowShiftX,
          groundY - 1,
          58 * charScale * (1 + Math.abs(keyAngle) / 140),
          8 * charScale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.restore();

        // Actor
        ctx.save();
        ctx.translate(cX, cY);
        if (char.flip) {
          ctx.scale(-1, 1);
        }
        drawMasterCharacter(ctx, charScale, {
          keyIntensity: opts.keyIntensity,
          rimIntensity: opts.rimIntensity,
          keyAngleDeg: opts.keyAngleDeg,
          rimAngleDeg: opts.rimAngleDeg,
          lightColorHex: opts.lightColorHex,
          shirtColorHex: char.shirtColorHex,
          headTiltDeg: char.headTiltDeg,
          headShiftY: char.headShiftY,
          gestureAngleDeg: char.gestureAngleDeg,
        });
        ctx.restore();
      }
    } else if (opts.twoCharactersMode) {
      const mode = opts.twoCharactersMode;
      const charScale = (opts.totalSubjectScale ?? 1) * (mode.scale ?? 0.88);
      const cY = groundY - 358 * charScale;

      // Character 1 shadow & actor
      const c1X = mode.char1X;
      ctx.save();
      ctx.fillStyle = 'rgba(4, 9, 18, 0.65)';
      ctx.beginPath();
      ctx.ellipse(
        c1X + shadowShiftX,
        groundY - 1,
        58 * charScale * (1 + Math.abs(keyAngle) / 140),
        8 * charScale,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(c1X, cY);
      if (mode.char1Flip) {
        ctx.scale(-1, 1);
      }
      drawMasterCharacter(ctx, charScale, {
        keyIntensity: opts.keyIntensity,
        rimIntensity: opts.rimIntensity,
        keyAngleDeg: opts.keyAngleDeg,
        rimAngleDeg: opts.rimAngleDeg,
        lightColorHex: opts.lightColorHex,
        shirtColorHex: mode.char1ShirtColorHex,
        expression: mode.char1Expression,
        gestureAngleDeg: mode.char1GestureAngleDeg,
        headTiltDeg: mode.char1HeadTiltDeg,
        headShiftY: mode.char1HeadShiftY,
      });
      ctx.restore();

      // Character 2 shadow & actor
      const c2X = mode.char2X;
      ctx.save();
      ctx.fillStyle = 'rgba(4, 9, 18, 0.65)';
      ctx.beginPath();
      ctx.ellipse(
        c2X + shadowShiftX,
        groundY - 1,
        58 * charScale * (1 + Math.abs(keyAngle) / 140),
        8 * charScale,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(c2X, cY);
      if (mode.char2Flip) {
        ctx.scale(-1, 1);
      }
      drawMasterCharacter(ctx, charScale, {
        keyIntensity: opts.keyIntensity,
        rimIntensity: opts.rimIntensity,
        keyAngleDeg: opts.keyAngleDeg,
        rimAngleDeg: opts.rimAngleDeg,
        lightColorHex: opts.lightColorHex,
        shirtColorHex: mode.char2ShirtColorHex,
        expression: mode.char2Expression,
        gestureAngleDeg: mode.char2GestureAngleDeg,
        headTiltDeg: mode.char2HeadTiltDeg,
        headShiftY: mode.char2HeadShiftY,
      });
      ctx.restore();
    } else {
      // Single character (default)
      ctx.save();
      ctx.fillStyle = 'rgba(4, 9, 18, 0.65)';
      ctx.beginPath();
      ctx.ellipse(
        rollCenterX + shadowShiftX,
        groundY - 1,
        58 * opts.totalSubjectScale * (1 + Math.abs(keyAngle) / 140),
        8 * opts.totalSubjectScale,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(rollCenterX, rollCenterY);
      if (opts.flipActorX) {
        ctx.scale(-1, 1);
      }
      drawMasterCharacter(ctx, opts.totalSubjectScale, {
        keyIntensity: opts.keyIntensity,
        rimIntensity: opts.rimIntensity,
        keyAngleDeg: opts.keyAngleDeg,
        rimAngleDeg: opts.rimAngleDeg,
        lightColorHex: opts.lightColorHex,
        shirtColorHex: opts.actorShirtColorHex,
        headTiltDeg: opts.actorHeadTiltDeg,
        headShiftY: opts.actorHeadShiftY,
        gestureAngleDeg: opts.actorGestureAngleDeg,
        expression: opts.actorExpression,
        heldProp: opts.actorHeldProp,
      });
      ctx.restore();
    }
  }

  // Composition-Specific Foreground Depth Layer (Depth mode foreground separation)
  if (opts.compositionMode === 'depth') {
    ctx.save();
    // Out-of-focus foreground rooftop railing in bottom-left corner
    ctx.filter = 'blur(10px)';
    ctx.fillStyle = '#060d18';
    ctx.fillRect(-60, 800, 480, 290);
    ctx.fillStyle = '#081324';
    ctx.fillRect(160, 720, 55, 370);
    ctx.fillRect(-60, 760, 520, 48);
    ctx.restore();
  }
}

/**
 * Main render function executing the camera projection pipeline.
 */
export function renderCameraPOVToCanvas(
  mainCanvas: HTMLCanvasElement,
  offscreenCanvas: HTMLCanvasElement,
  opts: RenderSceneOptions
): void {
  const mainCtx = mainCanvas.getContext('2d');
  if (!mainCtx) return;

  const W = opts.viewportWidth;
  const H = opts.viewportHeight;

  // 1. CALCULATE DUTCH ROLL & BOUNDING BOX OVERSIZED DIMENSIONS
  const totalRoll = opts.rollDeg + opts.moveRoll;
  const rollCenterX = W * opts.normalizedFaceAnchorX + opts.subjectOffsetX + opts.moveX;
  const rollCenterY = H * opts.normalizedFaceAnchorY + opts.subjectOffsetY + opts.horizonShiftY * 0.4 + opts.moveY;
  const groundY = rollCenterY + 358 * opts.totalSubjectScale;

  // FAST PATH: Direct to 1920x1080 Viewport when no rotation or optical zoom is applied
  if (totalRoll === 0 && opts.moveZoom === 1.0) {
    mainCtx.clearRect(0, 0, W, H);
    renderSceneElements(mainCtx, opts, rollCenterX, rollCenterY, groundY);
    return;
  }

  // ROTATED PATH (Dutch Angle / Handheld Roll / Zoom):
  const offCtx = offscreenCanvas.getContext('2d');
  if (!offCtx) return;

  const theta = (totalRoll * Math.PI) / 180;
  const FIXED_BUFFER_SIZE = 2400;

  if (offscreenCanvas.width !== FIXED_BUFFER_SIZE || offscreenCanvas.height !== FIXED_BUFFER_SIZE) {
    offscreenCanvas.width = FIXED_BUFFER_SIZE;
    offscreenCanvas.height = FIXED_BUFFER_SIZE;
  }

  const offCenterX = FIXED_BUFFER_SIZE / 2;
  const offCenterY = FIXED_BUFFER_SIZE / 2;
  const shiftX = offCenterX - rollCenterX;
  const shiftY = offCenterY - rollCenterY;

  offCtx.save();
  offCtx.clearRect(0, 0, FIXED_BUFFER_SIZE, FIXED_BUFFER_SIZE);
  offCtx.translate(shiftX, shiftY);

  renderSceneElements(offCtx, opts, rollCenterX, rollCenterY, groundY);

  offCtx.restore();

  // Draw and rotate transformed scene into 1920x1080 viewport canvas
  mainCtx.clearRect(0, 0, W, H);
  mainCtx.save();
  mainCtx.translate(rollCenterX, rollCenterY);
  if (opts.moveZoom !== 1.0) {
    mainCtx.scale(opts.moveZoom, opts.moveZoom);
  }
  mainCtx.rotate(theta);
  mainCtx.translate(-offCenterX, -offCenterY);
  mainCtx.drawImage(offscreenCanvas, 0, 0);
  mainCtx.restore();
}
