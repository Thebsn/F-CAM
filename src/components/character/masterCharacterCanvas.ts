/**
 * Master Character Canvas Renderer
 * Single source of truth for the F CAM character artwork across all pages.
 * Exactly matches the Home page master reference character.
 */

// Cached Path2D objects for Master Character
let masterPaths: {
  leftLegAndFoot: Path2D;
  rightLegAndFoot: Path2D;
  shorts: Path2D;
  shortsLineL: Path2D;
  shortsLineR: Path2D;
  shirt: Path2D;
  sleeveL: Path2D;
  armL: Path2D;
  sleeveR: Path2D;
  armR: Path2D;
  collar: Path2D;
  dorsalFin: Path2D;
  head: Path2D;
  lips: Path2D;
  eyelidL: Path2D;
  eyelidR: Path2D;
} | null = null;

export function getMasterCharacterPaths() {
  if (masterPaths) return masterPaths;

  // Exact coordinates normalized to eye center (0, 0)
  // X_local = X_home - 1462.5, Y_local = Y_home - 525
  // Ground plane is strictly aligned at Y = 358
  masterPaths = {
    // Left leg & foot: continuous anatomical silhouette originating inside shorts (Y=240)
    // and resting flat on the ground plane at Y = 358
    leftLegAndFoot: new Path2D(
      'M -25 240 L -25 334 C -26 338 -38 344 -36 348 C -36 354 -36 358 -32 358 L 8 358 C 18 358 18 346 8 338 C 4 336 2 334 1 334 L 1 240 Z'
    ),
    // Right leg & foot: continuous anatomical silhouette originating inside shorts (Y=240)
    // and resting flat on the ground plane at Y = 358
    rightLegAndFoot: new Path2D(
      'M 35 240 L 35 334 C 34 338 22 344 24 348 C 24 354 24 358 28 358 L 68 358 C 78 358 78 346 68 338 C 64 336 62 334 61 334 L 61 240 Z'
    ),
    shorts: new Path2D(
      'M -47.5 200 C -12.5 195 57.5 195 87.5 200 L 97.5 270 C 67.5 280 32.5 280 17.5 265 C 2.5 280 -32.5 280 -57.5 270 Z'
    ),
    shortsLineL: new Path2D('M -32.5 215 C -17.5 240 -17.5 255 -27.5 265'),
    shortsLineR: new Path2D('M 72.5 215 C 57.5 240 57.5 255 67.5 265'),
    shirt: new Path2D(
      'M -42.5 110 C -12.5 105 37.5 105 67.5 110 L 92.5 210 C 57.5 215 -32.5 215 -62.5 210 Z'
    ),
    armL: new Path2D('M -57.5 155 C -62.5 185 -52.5 205 -42.5 210'),
    armR: new Path2D('M 87.5 155 C 92.5 185 82.5 205 72.5 210'),
    sleeveL: new Path2D('M -42.5 110 L -67.5 150 L -42.5 165 L -32.5 130 Z'),
    sleeveR: new Path2D('M 67.5 110 L 102.5 150 L 77.5 165 L 62.5 130 Z'),
    collar: new Path2D('M -7.5 107 C 12.5 120 32.5 120 47.5 107'),
    dorsalFin: new Path2D(
      'M 62.5 5 C 102.5 25 122.5 95 92.5 145 C 77.5 125 67.5 85 62.5 45 Z'
    ),
    head: new Path2D(
      'M -42.5 35 C -52.5 -25 -17.5 -55 22.5 -55 C 67.5 -55 87.5 -10 82.5 55 C 77.5 95 67.5 110 62.5 115 L -37.5 115 C -42.5 95 -37.5 65 -42.5 35 Z'
    ),
    lips: new Path2D(
      'M -62.5 55 C -37.5 45 -2.5 45 22.5 55 C 2.5 80 -42.5 80 -62.5 55 Z'
    ),
    eyelidL: new Path2D(
      'M -33.5 -3 C -27.5 3 -7.5 3 -1.5 -3 L -1.5 -15 L -33.5 -15 Z'
    ),
    eyelidR: new Path2D(
      'M 1.5 -3 C 7.5 3 27.5 3 33.5 -3 L 33.5 -15 L 1.5 -15 Z'
    ),
  };

  return masterPaths;
}

export type CharacterExpression =
  | 'deadpan'
  | 'speaking'
  | 'surprise'
  | 'concern'
  | 'happiness'
  | 'confusion';

export interface MasterCharacterDrawOptions {
  keyIntensity?: number;
  rimIntensity?: number;
  keyAngleDeg?: number;
  rimAngleDeg?: number;
  lightColorHex?: string;
  shirtColorHex?: string;
  headTiltDeg?: number;
  headShiftY?: number;
  gestureAngleDeg?: number;
  expression?: CharacterExpression;
  heldProp?: 'none' | 'red-cup-right' | 'red-cup-left';
}

/**
 * Draws the canonical red cup firmly grasped in either the right or left hand.
 * Used for the Physical Continuity demonstration.
 */
function drawRedCup(ctx: CanvasRenderingContext2D, hand: 'right' | 'left') {
  ctx.save();
  if (hand === 'right') {
    // Right hand end at (72.5, 210)
    const cx = 83;
    const cy = 202;
    const topW = 24;
    const botW = 18;
    const h = 28;
    const topY = cy - h / 2; // 188
    const botY = cy + h / 2; // 216

    // 1. Cup Handle (extends outward on the right side)
    ctx.beginPath();
    ctx.arc(cx + topW / 2 + 1, cy + 1, 6.5, -Math.PI / 2, Math.PI / 2, false);
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 2. Cup Body (Tapered mug profile)
    ctx.beginPath();
    ctx.moveTo(cx - topW / 2, topY);
    ctx.lineTo(cx - botW / 2, botY);
    ctx.quadraticCurveTo(cx, botY + 3.5, cx + botW / 2, botY);
    ctx.lineTo(cx + topW / 2, topY);
    ctx.closePath();

    ctx.fillStyle = '#ef4444';
    ctx.fill();

    // Subtle 2D shading
    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(cx + 2, topY - 5, topW, h + 15);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.fillRect(cx - topW / 2 + 2, topY, 3.5, h);
    ctx.restore();

    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 3.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // 3. Top Opening & Interior Liquid
    ctx.beginPath();
    ctx.ellipse(cx, topY, topW / 2, 4.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#991b1b';
    ctx.fill();
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx, topY, topW / 2 - 1, 3.5, 0, Math.PI, Math.PI * 2);
    ctx.strokeStyle = 'rgba(254, 202, 202, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 4. Character's Blue Fingers and Thumb securely holding the cup
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 3;

    // Fingers grasping front of cup
    ctx.beginPath();
    ctx.ellipse(cx - topW / 2 + 2, cy + 2, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Thumb rested naturally above
    ctx.beginPath();
    ctx.ellipse(cx - topW / 2 + 3, cy - 6, 4, 3, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    // Left hand end at (-42.5, 210)
    const cx = -53;
    const cy = 202;
    const topW = 24;
    const botW = 18;
    const h = 28;
    const topY = cy - h / 2; // 188
    const botY = cy + h / 2; // 216

    // 1. Cup Handle (extends outward on the left side)
    ctx.beginPath();
    ctx.arc(cx - topW / 2 - 1, cy + 1, 6.5, Math.PI / 2, -Math.PI / 2, false);
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 2. Cup Body
    ctx.beginPath();
    ctx.moveTo(cx - topW / 2, topY);
    ctx.lineTo(cx - botW / 2, botY);
    ctx.quadraticCurveTo(cx, botY + 3.5, cx + botW / 2, botY);
    ctx.lineTo(cx + topW / 2, topY);
    ctx.closePath();

    ctx.fillStyle = '#ef4444';
    ctx.fill();

    // Subtle 2D shading
    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(cx - topW / 2, topY - 5, topW / 2, h + 15);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.fillRect(cx + topW / 2 - 5.5, topY, 3.5, h);
    ctx.restore();

    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 3.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // 3. Top Opening & Interior Liquid
    ctx.beginPath();
    ctx.ellipse(cx, topY, topW / 2, 4.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#991b1b';
    ctx.fill();
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx, topY, topW / 2 - 1, 3.5, 0, Math.PI, Math.PI * 2);
    ctx.strokeStyle = 'rgba(254, 202, 202, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 4. Character's Blue Fingers and Thumb
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 3;

    // Fingers grasping front
    ctx.beginPath();
    ctx.ellipse(cx + topW / 2 - 2, cy + 2, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Thumb rested naturally above
    ctx.beginPath();
    ctx.ellipse(cx + topW / 2 - 3, cy - 6, 4, 3, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Draws the canonical Master Character onto any 2D canvas context.
 * Strictly preserves the Home page character artwork:
 * - Pure white shirt (or configurable for multi-actor staging)
 * - True blue skin tone
 * - Coral red shorts
 * - Deadpan half-lidded eyes
 * - Accurate line weights, seamless leg-to-shorts connections, and flat ground contact
 */
export function drawMasterCharacter(
  ctx: CanvasRenderingContext2D,
  scale: number = 1.0,
  options?: MasterCharacterDrawOptions
) {
  const p = getMasterCharacterPaths();

  ctx.save();
  ctx.scale(scale, scale);

  // Exact Master Skin Gradient (#4bc5f8 -> #1d97dc)
  const skinGrad = ctx.createLinearGradient(0, -55, 0, 115);
  skinGrad.addColorStop(0, '#4bc5f8');
  skinGrad.addColorStop(1, '#1d97dc');

  // 1. LEGS & FEET: Clean, continuous geometry originating inside shorts (Y=240)
  // Both feet rest solidly on the ground plane at Y = 358
  ctx.fillStyle = '#38bdf8';
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Left leg & foot flipper
  ctx.fill(p.leftLegAndFoot);
  ctx.stroke(p.leftLegAndFoot);

  // Right leg & foot flipper
  ctx.fill(p.rightLegAndFoot);
  ctx.stroke(p.rightLegAndFoot);

  // 2. RED SWIM SHORTS (Y = 200 to 270)
  // Neatly covers the top of both legs
  ctx.fillStyle = '#f85151';
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 4.5;
  ctx.fill(p.shorts);
  ctx.stroke(p.shorts);

  // Shorts seam lines
  ctx.strokeStyle = '#b91c1c';
  ctx.lineWidth = 3;
  ctx.stroke(p.shortsLineL);
  ctx.stroke(p.shortsLineR);

  // 3. SHIRT & ARMS
  // Blue forearms & hands (drawn under shirt and sleeves)
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.stroke(p.armL);

  // Front arm gesture animation (rotates smoothly around shoulder joint inside sleeve)
  const gestureAngle = options?.gestureAngleDeg ?? 0;
  ctx.save();
  if (gestureAngle !== 0) {
    ctx.translate(87.5, 155);
    ctx.rotate((gestureAngle * Math.PI) / 180);
    ctx.translate(-87.5, -155);
  }
  ctx.stroke(p.armR);
  ctx.restore();

  // Torso shirt
  const shirtColor = options?.shirtColorHex ?? '#ffffff';
  ctx.fillStyle = shirtColor;
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 4.5;
  ctx.fill(p.shirt);
  ctx.stroke(p.shirt);

  // Left & Right sleeves with dark outline
  ctx.lineWidth = 4;
  ctx.fill(p.sleeveL);
  ctx.stroke(p.sleeveL);

  ctx.fill(p.sleeveR);
  ctx.stroke(p.sleeveR);

  // Crew neck collar
  ctx.lineWidth = 3.5;
  ctx.stroke(p.collar);

  // Held Prop (Physical Continuity: canonical red cup)
  if (options?.heldProp === 'red-cup-right') {
    drawRedCup(ctx, 'right');
  } else if (options?.heldProp === 'red-cup-left') {
    drawRedCup(ctx, 'left');
  }

  // 4. HEAD, EYES, LIPS & PHOTOGRAPHIC ACCENTS
  // Head movement rotates smoothly around collar pivot (12.5, 110)
  const headTilt = options?.headTiltDeg ?? 0;
  const headShiftY = options?.headShiftY ?? 0;

  ctx.save();
  if (headTilt !== 0 || headShiftY !== 0) {
    ctx.translate(12.5, 110);
    ctx.rotate((headTilt * Math.PI) / 180);
    ctx.translate(-12.5, -110 + headShiftY);
  }

  // Dorsal Fin (Back of head)
  ctx.fillStyle = '#0284c7';
  ctx.lineWidth = 4;
  ctx.fill(p.dorsalFin);
  ctx.stroke(p.dorsalFin);

  // Head & Snout (Blue Fish)
  ctx.fillStyle = skinGrad;
  ctx.lineWidth = 4.5;
  ctx.fill(p.head);
  ctx.stroke(p.head);

  // Dark blue freckles on back of head
  ctx.fillStyle = '#0369a1';
  ctx.beginPath();
  ctx.arc(57.5, -10, 3.5, 0, Math.PI * 2);
  ctx.arc(67.5, 5, 4.5, 0, Math.PI * 2);
  ctx.arc(52.5, 20, 3, 0, Math.PI * 2);
  ctx.arc(69.5, 35, 4, 0, Math.PI * 2);
  ctx.fill();

  // 6. EYES & EXPRESSION
  const expr = options?.expression ?? 'deadpan';

  // Eyeballs (Both white sclerae)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 3.5;

  // Left eye
  ctx.beginPath();
  ctx.arc(-17.5, 0, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Right eye
  ctx.beginPath();
  ctx.arc(17.5, 0, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Expression-specific pupils, eyelids, brows, and mouth
  if (expr === 'surprise') {
    // Dilated wide pupils
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(-17.5, 0, 7.5, 0, Math.PI * 2);
    ctx.arc(17.5, 0, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // High arched surprised eyebrows
    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-32, -25);
    ctx.quadraticCurveTo(-17.5, -35, -3, -25);
    ctx.moveTo(3, -25);
    ctx.quadraticCurveTo(17.5, -35, 32, -25);
    ctx.stroke();

    // Clean pink fish lips with bold dark outline (matching canonical character)
    ctx.fillStyle = '#fb7185';
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fill(p.lips);
    ctx.stroke(p.lips);

    // Smooth, curved cartoon smile
    ctx.strokeStyle = '#be123c';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-51, 55);
    ctx.quadraticCurveTo(-20, 71, 11, 55);
    ctx.stroke();
  } else if (expr === 'concern') {
    // Worried furrowed pupils looking slightly inward
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(-18.5, 2, 6, 0, Math.PI * 2);
    ctx.arc(15.5, 2, 6, 0, Math.PI * 2);
    ctx.fill();

    // Drooping concerned eyelids angled inward
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-33.5, 2);
    ctx.quadraticCurveTo(-17.5, -8, -1.5, 0);
    ctx.lineTo(-1.5, -16);
    ctx.lineTo(-33.5, -16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(1.5, 0);
    ctx.quadraticCurveTo(17.5, -8, 33.5, 2);
    ctx.lineTo(33.5, -16);
    ctx.lineTo(1.5, -16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Furrowed concerned eyebrows angled downward toward center
    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-32, -18);
    ctx.quadraticCurveTo(-17.5, -26, -4, -28);
    ctx.moveTo(4, -28);
    ctx.quadraticCurveTo(17.5, -26, 32, -18);
    ctx.stroke();

    // Subtle worry crease between brows
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -28);
    ctx.lineTo(0, -20);
    ctx.stroke();

    // Fish Lips with downturned concerned frown
    ctx.fillStyle = '#fb7185';
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 4;
    ctx.fill(p.lips);
    ctx.stroke(p.lips);

    ctx.strokeStyle = '#be123c';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-52.5, 66);
    ctx.quadraticCurveTo(-20, 52, 12.5, 66);
    ctx.stroke();
  } else if (expr === 'happiness') {
    // Cheerful bright pupils with catchlight emphasis
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(-18.5, -1, 6, 0, Math.PI * 2);
    ctx.arc(15.5, -1, 6, 0, Math.PI * 2);
    ctx.fill();

    // Upturned joyful smiling lower eye creases
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-33.5, 5);
    ctx.quadraticCurveTo(-17.5, -5, -1.5, 5);
    ctx.lineTo(-1.5, 16);
    ctx.lineTo(-33.5, 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(1.5, 5);
    ctx.quadraticCurveTo(17.5, -5, 33.5, 5);
    ctx.lineTo(33.5, 16);
    ctx.lineTo(1.5, 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cheerful raised eyebrows
    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-30, -23);
    ctx.quadraticCurveTo(-17.5, -30, -5, -23);
    ctx.moveTo(5, -23);
    ctx.quadraticCurveTo(17.5, -30, 30, -23);
    ctx.stroke();

    // Fish Lips with wide joyful smile
    ctx.fillStyle = '#fb7185';
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 4;
    ctx.fill(p.lips);
    ctx.stroke(p.lips);

    // Warm smiling mouth opening
    ctx.fillStyle = '#881337';
    ctx.beginPath();
    ctx.moveTo(-45, 57);
    ctx.quadraticCurveTo(-20, 73, 5, 57);
    ctx.quadraticCurveTo(-20, 61, -45, 57);
    ctx.fill();

    ctx.strokeStyle = '#be123c';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-52.5, 55);
    ctx.quadraticCurveTo(-20, 75, 12.5, 55);
    ctx.stroke();
  } else if (expr === 'confusion') {
    // Asymmetric curious pupils
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(-18.5, 0, 7, 0, Math.PI * 2); // Left eye wide
    ctx.arc(14.5, 3, 5.5, 0, Math.PI * 2); // Right eye squinting
    ctx.fill();

    // Right eyelid squinting lower
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 3.5;
    ctx.fill(p.eyelidR);
    ctx.stroke(p.eyelidR);

    // Asymmetric puzzled eyebrows (Left high, Right low/skeptical)
    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-32, -28);
    ctx.quadraticCurveTo(-17.5, -38, -3, -28); // Raised brow
    ctx.moveTo(3, -19);
    ctx.quadraticCurveTo(17.5, -24, 32, -18); // Furrowed low brow
    ctx.stroke();

    // Fish Lips with crooked wavy perplexed line
    ctx.fillStyle = '#fb7185';
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 4;
    ctx.fill(p.lips);
    ctx.stroke(p.lips);

    ctx.strokeStyle = '#be123c';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-52.5, 65);
    ctx.bezierCurveTo(-35, 53, -10, 69, 12.5, 57);
    ctx.stroke();
  } else if (expr === 'speaking') {
    // Deadpan pupils
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(-20.5, 3, 6, 0, Math.PI * 2);
    ctx.arc(13.5, 3, 6, 0, Math.PI * 2);
    ctx.fill();

    // Drooping eyelids
    ctx.fillStyle = '#38bdf8';
    ctx.fill(p.eyelidL);
    ctx.stroke(p.eyelidL);
    ctx.fill(p.eyelidR);
    ctx.stroke(p.eyelidR);

    // Fish Lips with open speaking mouth cavity
    ctx.fillStyle = '#fb7185';
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 4;
    ctx.fill(p.lips);
    ctx.stroke(p.lips);

    ctx.fillStyle = '#881337';
    ctx.beginPath();
    ctx.ellipse(-20, 61, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#be123c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-52.5, 60);
    ctx.lineTo(-34, 60);
    ctx.moveTo(-6, 60);
    ctx.lineTo(12.5, 60);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(-20, 61, 14, 6, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // Canonical deadpan half-lidded eyes
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(-20.5, 3, 6, 0, Math.PI * 2);
    ctx.arc(13.5, 3, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.fill(p.eyelidL);
    ctx.stroke(p.eyelidL);
    ctx.fill(p.eyelidR);
    ctx.stroke(p.eyelidR);

    // Pink Fish Lips
    ctx.fillStyle = '#fb7185';
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 4;
    ctx.fill(p.lips);
    ctx.stroke(p.lips);

    // Dark pink mouth line
    ctx.strokeStyle = '#be123c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-52.5, 60);
    ctx.lineTo(12.5, 60);
    ctx.stroke();
  }

  // Subtle eye catchlight inside pupils
  const keyIntensity = options?.keyIntensity ?? 80;
  if (keyIntensity > 20) {
    const keyAngle = options?.keyAngleDeg ?? -45;
    const dotXOffset = keyAngle < -15 ? -2 : keyAngle > 15 ? 2 : 0;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-20.5 + dotXOffset, 1.5, 1.8, 0, Math.PI * 2);
    ctx.arc(13.5 + dotXOffset, 1.5, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle silhouette rim separation
  const rimIntensity = options?.rimIntensity ?? 0;
  if (rimIntensity > 25) {
    const rimAngle = options?.rimAngleDeg ?? 135;
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.globalAlpha = Math.min(0.85, (rimIntensity / 100) * 0.85);

    if (rimAngle >= 0) {
      ctx.beginPath();
      ctx.moveTo(62.5, 15);
      ctx.bezierCurveTo(90, 35, 110, 85, 90, 135);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(-42.5, 30);
      ctx.bezierCurveTo(-50, -10, -25, -45, 15, -50);
      ctx.stroke();
    }
    ctx.restore();
  }

  ctx.restore(); // Restore head transform

  ctx.restore(); // Restore root scale
}
