import React from 'react';
import { LightingPattern } from '../../types/cinematography';

export interface BlueCharacterActorProps {
  lightingPattern?: LightingPattern;
  lightColorHex?: string;
  keyOpacity?: number;
  rimOpacity?: number;
  className?: string;
}

/**
 * BlueCharacterActor
 * 
 * A coherent 2D vector character with strictly connected anatomy.
 * Torso, clothing, shorts, legs, and feet are permanently connected with zero gaps.
 * 
 * COORDINATE SYSTEM:
 * The FACE/EYE ANCHOR is strictly at (0, 0).
 * - Eyes: (-18, 0) and (+18, 0)
 * - Head Top: Y = -72
 * - Snout & Lips: Y = +50 to +75
 * - Neck & Collar: Y = +92
 * - T-Shirt Torso: Y = +92 to +205
 * - Red Shorts: Y = +190 to +265 (overlaps shirt by 15px)
 * - Cyan Legs: Y = +245 to +335 (overlaps shorts by 20px)
 * - Flipper Feet: Y = +335 to +358 (bottom rests at Y = +358)
 * 
 * When scaled around (0, 0), the face/eyes stay locked at the screen anchor,
 * while feet remain at Y = 358 * scale, perfectly matching the ground plane!
 */
export const BlueCharacterActor: React.FC<BlueCharacterActorProps> = ({
  lightingPattern = 'rembrandt',
  lightColorHex = '#ffffff',
  keyOpacity = 0.8,
  rimOpacity = 0.5,
  className = '',
}) => {
  const rembrandtPatch = lightingPattern === 'rembrandt';

  return (
    <g id="blue-character-face-anchored" className={className}>
      <defs>
        <linearGradient id="actorSkinGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4bc5f8" />
          <stop offset="100%" stopColor="#1a96db" />
        </linearGradient>

        <linearGradient id="actorShirtGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e9eff7" />
        </linearGradient>

        <linearGradient id="actorShortsGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fa5252" />
          <stop offset="100%" stopColor="#e02424" />
        </linearGradient>
      </defs>

      {/* ================= 1. LEGS (Starts at Y = 245 inside shorts down to ankles at Y = 335) ================= */}
      {/* Left Leg */}
      <rect
        x="-50"
        y="245"
        width="22"
        height="95"
        rx="6"
        fill="url(#actorSkinGrad)"
        stroke="#111"
        strokeWidth="3.5"
      />
      {/* Left Flipper Foot (bottom at Y = 358) */}
      <path
        d="M -66 335 
           C -72 342 -66 358 -44 358 
           C -28 358 -22 345 -28 335 
           Z"
        fill="url(#actorSkinGrad)"
        stroke="#111"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Right Leg */}
      <rect
        x="28"
        y="245"
        width="22"
        height="95"
        rx="6"
        fill="url(#actorSkinGrad)"
        stroke="#111"
        strokeWidth="3.5"
      />
      {/* Right Flipper Foot (bottom at Y = 358) */}
      <path
        d="M 28 335 
           C 22 345 28 358 44 358 
           C 66 358 72 342 66 335 
           Z"
        fill="url(#actorSkinGrad)"
        stroke="#111"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* ================= 2. RED SWIM SHORTS ================= */}
      {/* Starts at Y = 190, overlapping shirt by 15px, down to Y = 265 */}
      <path
        d="M -62 190 
           C -30 186 30 186 62 190 
           L 70 262 
           C 42 272 16 270 0 256 
           C -16 270 -42 272 -70 262 
           Z"
        fill="url(#actorShortsGrad)"
        stroke="#111"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M -48 205 C -36 226 -36 242 -46 252" stroke="#991b1b" strokeWidth="2.5" fill="none" />
      <path d="M 48 205 C 36 226 36 242 46 252" stroke="#991b1b" strokeWidth="2.5" fill="none" />

      {/* ================= 3. WHITE T-SHIRT & TORSO ================= */}
      {/* Starts at collar Y = 95 down to Y = 205 */}
      <path
        d="M -56 100 
           C -25 94 25 94 56 100 
           L 62 205 
           C 30 208 -30 208 -62 205 
           Z"
        fill="url(#actorShirtGrad)"
        stroke="#111"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Left Short Sleeve */}
      <path
        d="M -56 100 L -84 142 L -62 156 L -48 122 Z"
        fill="url(#actorShirtGrad)"
        stroke="#111"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Left Arm & Hand */}
      <path
        d="M -72 145 C -75 175 -66 195 -58 198"
        fill="none"
        stroke="url(#actorSkinGrad)"
        strokeWidth="16"
        strokeLinecap="round"
      />

      {/* Right Short Sleeve */}
      <path
        d="M 56 100 L 84 142 L 62 156 L 48 122 Z"
        fill="url(#actorShirtGrad)"
        stroke="#111"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Right Arm & Hand */}
      <path
        d="M 72 145 C 75 175 66 195 58 198"
        fill="none"
        stroke="url(#actorSkinGrad)"
        strokeWidth="16"
        strokeLinecap="round"
      />

      {/* Crew neck collar */}
      <path
        d="M -24 96 C -12 110 12 110 24 96"
        stroke="#111"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* ================= 4. DORSAL FIN ================= */}
      <path
        d="M 45 -40 
           C 85 -20 100 45 72 85 
           C 58 65 50 25 45 -10 
           Z"
        fill="#0284c7"
        stroke="#111"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* ================= 5. HEAD & SNOUT ================= */}
      <path
        d="M -54 30 
           C -62 -35 -25 -72 15 -72 
           C 55 -72 72 -25 68 40 
           C 64 78 52 92 46 96 
           L -46 96 
           C -52 75 -48 55 -54 30 
           Z"
        fill="url(#actorSkinGrad)"
        stroke="#111"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Dark blue freckles on back of head */}
      <circle cx="42" cy="-20" r="3.5" fill="#0369a1" />
      <circle cx="52" cy="-5" r="4" fill="#0369a1" />
      <circle cx="38" cy="12" r="3.5" fill="#0369a1" />
      <circle cx="50" cy="28" r="4" fill="#0369a1" />

      {/* Prominent Pink Fish Lips (Protruding deadpan snout) */}
      <path
        d="M -68 50 
           C -42 42 0 42 22 50 
           C 2 76 -46 76 -68 50 
           Z"
        fill="#fb7185"
        stroke="#111"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <line x1="-58" y1="54" x2="12" y2="54" stroke="#be123c" strokeWidth="2.5" />

      {/* ================= 6. EYES (LOCATED STRICTLY AT Y = 0) ================= */}
      {/* Left Eye: Center at (-18, 0) */}
      <g id="left-eye-anchored">
        <circle cx="-18" cy="0" r="15" fill="#ffffff" stroke="#111" strokeWidth="3" />
        <circle cx="-20" cy="2" r="5.5" fill="#111" />
        <circle cx="-18" cy="-1" r="1.5" fill="#ffffff" />
        <path
          d="M -33 -3 C -27 4 -9 4 -3 -3 L -3 -15 L -33 -15 Z"
          fill="url(#actorSkinGrad)"
          stroke="#111"
          strokeWidth="3"
        />
      </g>

      {/* Right Eye: Center at (+18, 0) */}
      <g id="right-eye-anchored">
        <circle cx="18" cy="0" r="15" fill="#ffffff" stroke="#111" strokeWidth="3" />
        <circle cx="15" cy="2" r="5.5" fill="#111" />
        <circle cx="17" cy="-1" r="1.5" fill="#ffffff" />
        <path
          d="M 3 -3 C 9 4 27 4 33 -3 L 33 -15 L 3 -15 Z"
          fill="url(#actorSkinGrad)"
          stroke="#111"
          strokeWidth="3"
        />
      </g>

      {/* ================= 7. SUBTLE CINEMATOGRAPHY LIGHTING OVERLAYS ================= */}
      {keyOpacity > 0.05 && (
        <path
          d="M -50 -10 C -45 -55 -15 -68 10 -68 L 10 20 C -25 20 -45 10 -50 -10 Z"
          fill={lightColorHex}
          opacity={keyOpacity * 0.25}
          style={{ mixBlendMode: 'overlay' }}
        />
      )}

      {rembrandtPatch && (
        <polygon
          points="12,18 26,18 19,30"
          fill={lightColorHex}
          opacity={keyOpacity * 0.5}
        />
      )}

      {rimOpacity > 0.1 && (
        <path
          d="M 45 -40 C 85 -20 100 45 72 85"
          stroke="#ffffff"
          strokeWidth="4"
          fill="none"
          opacity={rimOpacity * 0.7}
        />
      )}
    </g>
  );
};
