import React from 'react';
import { FilmLanguageConcept } from '../../types/cinematography';

export interface FilmLanguageState {
  concept: FilmLanguageConcept;
  // 180° Rule
  axis180ActiveCam: 'cam-a' | 'cam-b' | 'cam-crossed';
  axis180AngleDeg: number;
  axis180Mode?: 'correct' | 'crossed';
  axis180Phase?: 'shot-a' | 'cut' | 'shot-b';
  // 30° Rule
  angle30DiffDeg: number;
  angle30ActiveShot: 'shot-a' | 'shot-b' | 'compare';
  angle30Phase?: 'shot-a' | 'cut' | 'shot-b';
  angle30Mode?: 'safe' | 'unsafe';
  // Eyeline Match
  eyelineGazeDir: 'right' | 'left';
  eyelineGazeElevation: number; // -30 to +30 deg
  eyelineTargetElevation: number; // -30 to +30 deg
  eyelinePhase?: 'shot-a' | 'cut' | 'shot-b';
  // Screen Direction
  screenDirMode: 'consistent' | 'reversed';
  screenDirStep: 1 | 2;
  screenDirPhase?: 'shot-a' | 'cut' | 'shot-b';
  screenDirProgress?: number; // 0 to 1
  // Physical Continuity
  continuityMode: 'matched' | 'error';
  continuityStep: 1 | 2;
  // Match Cut
  matchCutProgress: number; // 0 to 100
  matchCutType: 'circle-eye' | 'silhouette-vector';
  matchCutPhase?: 'shot-a' | 'match-element' | 'cut' | 'shot-b';
  // Jump Cut
  jumpCutState: 'shot-a' | 'shot-b';
  jumpCutType: 'temporal' | 'spatial';
  jumpCutPhase?: 'shot-a' | 'cut' | 'shot-b';
  jumpCutOffset?: number; // e.g. 24 to 96 frames (default 48)
  // Establishing Shot
  establishingScale: 'extreme-wide' | 'wide';
  establishingShot?: 'wide' | 'medium' | 'close-up';
  establishingPhase?: 'wide' | 'medium' | 'close-up' | 'cut';
  masterStagingZone: 'full' | 'two-shot';
  masterView?: 'master' | 'coverage';
  masterProgress?: number;
  masterIsPlaying?: boolean;
  // Scene Coverage
  coverageShot: 'master' | 'wide' | 'medium' | 'close' | 'reaction' | 'insert';
  // Reaction Shot
  reactionView?: 'action' | 'reaction';
  reactionEmotion?: 'surprise' | 'concern' | 'happiness' | 'confusion' | 'listening' | 'realization' | 'disapproval';
  reactionDof?: 'shallow' | 'medium';
  // Eye Trace
  eyeTracePattern: 'triangle' | 'horizontal' | 'diagonal';
  eyeTraceActiveNode: 0 | 1 | 2 | 3;
  eyeTraceShowGuide?: boolean;
}

interface FilmLanguageOverlayProps {
  state: FilmLanguageState;
  faceAnchorX: number;
  faceAnchorY: number;
  groundContactY?: number;
  totalSubjectScale?: number;
}

export const FilmLanguageOverlay: React.FC<FilmLanguageOverlayProps> = ({
  state,
  faceAnchorX,
  faceAnchorY,
  groundContactY,
  totalSubjectScale,
}) => {
  const { concept } = state;

  return (
    <g id="film-language-interactive-layer" className="select-none">
      {/* =========================================================================
          1. 180° RULE (AXIS OF ACTION)
      ========================================================================= */}
      {concept === '180-degree' && (
        <g id="demo-180-rule">
          {(() => {
            const isCrossed = state.axis180Mode === 'crossed' || state.axis180ActiveCam === 'cam-crossed';
            const phase = state.axis180Phase ?? (state.axis180ActiveCam === 'cam-a' ? 'shot-a' : 'shot-b');
            const isShotA = phase === 'shot-a';
            const isCut = phase === 'cut';
            const isShotB = phase === 'shot-b';

            // Angle of the axis of action (default 0 deg = vertical line)
            const angleDeg = state.axis180AngleDeg ?? 0;
            const rad = (angleDeg * Math.PI) / 180;
            const tanVal = Math.tan(rad);

            const statusColor = isShotA
              ? '#38bdf8'
              : !isCrossed
              ? '#10b981'
              : '#ef4444';
            const statusBgColor = isShotA
              ? '#0f172a'
              : !isCrossed
              ? '#064e3b'
              : '#7f1d1d';

            // Character positions in the scene (Left: ~640, Right: ~1280, Eyeline: ~480)
            const charLeftX = 640;
            const charRightX = 1280;
            const charEyeY = 480;

            // In Shot B when crossed, characters swap screen positions
            const isReversed = isShotB && isCrossed;

            return (
              <>
                {/* -------------------------------------------------------------
                    1. TOP HUD STATUS BADGE
                ------------------------------------------------------------- */}
                <g transform="translate(960, 68)">
                  {isShotA && (
                    <g>
                      <rect
                        x="-330"
                        y="-22"
                        width="660"
                        height="44"
                        rx="8"
                        fill="#0f172a"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                      />
                      <circle cx="-300" cy="0" r="5" fill="#38bdf8" />
                      <text
                        x="0"
                        y="6"
                        fill="#ffffff"
                        fontSize="14"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight="black"
                        letterSpacing="1"
                      >
                        SHOT A · CAMERA A (ESTABLISH 180° AXIS OF ACTION)
                      </text>
                    </g>
                  )}

                  {isCut && (
                    <g>
                      <rect
                        x="-130"
                        y="-22"
                        width="260"
                        height="44"
                        rx="8"
                        fill="#991b1b"
                        stroke="#ef4444"
                        strokeWidth="2.5"
                      />
                      <text
                        x="0"
                        y="6"
                        fill="#ffffff"
                        fontSize="16"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight="black"
                        letterSpacing="2"
                      >
                        [ EDITORIAL CUT ]
                      </text>
                    </g>
                  )}

                  {isShotB && (
                    <g>
                      <rect
                        x="-360"
                        y="-22"
                        width="720"
                        height="44"
                        rx="8"
                        fill={statusBgColor}
                        stroke={statusColor}
                        strokeWidth="2.5"
                      />
                      <circle cx="-330" cy="0" r="5" fill={statusColor} />
                      <text
                        x="0"
                        y="6"
                        fill="#ffffff"
                        fontSize="14"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight="black"
                        letterSpacing="1"
                      >
                        {!isCrossed
                          ? '✓ SAME SIDE — CONTINUITY PRESERVED (SHOT B · CAM B)'
                          : '⚠ CROSSED AXIS — SCREEN POSITIONS REVERSED (SHOT B · CROSSED)'}
                      </text>
                    </g>
                  )}
                </g>

                {/* -------------------------------------------------------------
                    2. EDITORIAL CUT FULL-FRAME FLASH / SPLICE CARD
                ------------------------------------------------------------- */}
                {isCut && (
                  <g id="axis-180-cut-overlay">
                    <rect x="0" y="0" width="1920" height="1080" fill="#000000" fillOpacity="0.75" />
                    <g transform="translate(960, 540)">
                      <rect
                        x="-200"
                        y="-45"
                        width="400"
                        height="90"
                        rx="10"
                        fill="#0b0f19"
                        stroke="#ef4444"
                        strokeWidth="3"
                      />
                      <text
                        x="0"
                        y="-8"
                        fill="#ef4444"
                        fontSize="22"
                        fontFamily="monospace"
                        fontWeight="black"
                        textAnchor="middle"
                        letterSpacing="3"
                      >
                        EDITORIAL CUT
                      </text>
                      <text
                        x="0"
                        y="22"
                        fill="#94a3b8"
                        fontSize="12"
                        fontFamily="monospace"
                        textAnchor="middle"
                        letterSpacing="1"
                      >
                        SPLICE POINT · TRANSITION TO NEXT CAMERA SETUP
                      </text>
                    </g>
                  </g>
                )}

                {/* -------------------------------------------------------------
                    3. AXIS OF ACTION (180° LINE) & HEMISPHERE ZONE
                ------------------------------------------------------------- */}
                {!isCut && (
                  <g id="axis-180-geometry">
                    {/* Permitted Safe Hemisphere Arc on Camera Side */}
                    <path
                      d="M 380 540 A 580 420 0 0 0 1540 540"
                      fill="#10b981"
                      fillOpacity="0.04"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeDasharray="8 6"
                      opacity="0.7"
                    />

                    {/* Axis of Action Line */}
                    <line
                      x1={960 - tanVal * 460}
                      y1="80"
                      x2={960 + tanVal * 460}
                      y2="1000"
                      stroke="#ef4444"
                      strokeWidth="2.5"
                      strokeDasharray="12 6"
                      opacity="0.85"
                    />

                    {/* Axis of Action Central Label Badge */}
                    <g transform={`translate(${960}, 500)`}>
                      <rect
                        x="-130"
                        y="-15"
                        width="260"
                        height="30"
                        rx="6"
                        fill="#0f172a"
                        stroke="#ef4444"
                        strokeWidth="1.8"
                        fillOpacity="0.92"
                      />
                      <text
                        x="0"
                        y="5"
                        fill="#f87171"
                        fontSize="11"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight="bold"
                        letterSpacing="1"
                      >
                        AXIS OF ACTION (180° LINE)
                      </text>
                    </g>
                  </g>
                )}

                {/* -------------------------------------------------------------
                    4. CHARACTER DIRECTION GUIDES & INWARD EYELINES
                ------------------------------------------------------------- */}
                {!isCut && (
                  <g id="character-eyelines-and-labels">
                    {/* Left Character (x = 640) */}
                    <g transform={`translate(${charLeftX}, 340)`}>
                      <rect
                        x="-90"
                        y="-14"
                        width="180"
                        height="28"
                        rx="6"
                        fill="#090d16"
                        stroke={isReversed ? '#f87171' : '#38bdf8'}
                        strokeWidth="1.8"
                        opacity="0.95"
                      />
                      <text
                        x="0"
                        y="5"
                        fill={isReversed ? '#f87171' : '#38bdf8'}
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {isReversed ? 'SUBJECT 2 [REVERSED]' : 'SUBJECT 1 (SCREEN-LEFT)'}
                      </text>

                      {/* Direction arrow */}
                      <g transform="translate(0, 24)">
                        <rect x="-60" y="-8" width="120" height="16" rx="4" fill="#0284c7" fillOpacity="0.3" />
                        <text x="0" y="4" fill="#bae6fd" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                          LOOKS RIGHT →
                        </text>
                      </g>
                    </g>

                    {/* Right Character (x = 1280) */}
                    <g transform={`translate(${charRightX}, 340)`}>
                      <rect
                        x="-90"
                        y="-14"
                        width="180"
                        height="28"
                        rx="6"
                        fill="#090d16"
                        stroke={isReversed ? '#f87171' : '#fbbf24'}
                        strokeWidth="1.8"
                        opacity="0.95"
                      />
                      <text
                        x="0"
                        y="5"
                        fill={isReversed ? '#f87171' : '#fbbf24'}
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {isReversed ? 'SUBJECT 1 [REVERSED]' : 'SUBJECT 2 (SCREEN-RIGHT)'}
                      </text>

                      {/* Direction arrow */}
                      <g transform="translate(0, 24)">
                        <rect x="-60" y="-8" width="120" height="16" rx="4" fill="#d97706" fillOpacity="0.3" />
                        <text x="0" y="4" fill="#fde68a" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                          ← LOOKS LEFT
                        </text>
                      </g>
                    </g>

                    {/* Eyeline Sight-Line Guide connecting characters across axis */}
                    <g transform={`translate(0, ${charEyeY})`}>
                      <line
                        x1="720"
                        y1="0"
                        x2="1200"
                        y2="0"
                        stroke={isReversed ? '#ef4444' : '#10b981'}
                        strokeWidth="2"
                        strokeDasharray="6 4"
                        opacity="0.65"
                      />
                      {/* Left arrow pointing Right */}
                      <polygon points="760,-4 772,0 760,4" fill={isReversed ? '#ef4444' : '#10b981'} />
                      {/* Right arrow pointing Left */}
                      <polygon points="1160,-4 1148,0 1160,4" fill={isReversed ? '#ef4444' : '#10b981'} />

                      <g transform="translate(960, -22)">
                        <rect
                          x="-120"
                          y="-10"
                          width="240"
                          height="20"
                          rx="4"
                          fill="#090d16"
                          stroke={isReversed ? '#ef4444' : '#10b981'}
                          strokeWidth="1"
                          opacity="0.9"
                        />
                        <text
                          x="0"
                          y="4"
                          fill={isReversed ? '#fca5a5' : '#6ee7b7'}
                          fontSize="10"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          {isReversed
                            ? '⚠ SCREEN POSITIONS REVERSED'
                            : '✓ INWARD EYELINES PRESERVED'}
                        </text>
                      </g>
                    </g>
                  </g>
                )}

                {/* -------------------------------------------------------------
                    5. SIMPLE CAMERA-POSITION DIAGRAM MARKERS (SAFE VS CROSSED)
                ------------------------------------------------------------- */}
                {!isCut && (
                  <g id="camera-diagram-markers">
                    {/* CAMERA A (Safe Side - screen left) */}
                    <g
                      transform="translate(680, 890)"
                      className="cursor-pointer"
                      opacity={isShotA ? 1 : 0.6}
                    >
                      {/* Active FOV Coverage Cone */}
                      {isShotA && (
                        <polygon
                          points="0,-20 -90,-260 90,-260"
                          fill="#38bdf8"
                          fillOpacity="0.14"
                        />
                      )}
                      <rect
                        x="-45"
                        y="-22"
                        width="90"
                        height="44"
                        rx="8"
                        fill="#0f172a"
                        stroke="#38bdf8"
                        strokeWidth={isShotA ? 3 : 1.5}
                      />
                      <text x="0" y="2" fill="#38bdf8" fontSize="13" fontFamily="monospace" textAnchor="middle" fontWeight="black">
                        CAM A
                      </text>
                      <text x="0" y="16" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">
                        SAFE SIDE
                      </text>
                      {isShotA && (
                        <circle cx="32" cy="-14" r="4" fill="#38bdf8" />
                      )}
                    </g>

                    {/* CAMERA B (Safe Side - screen right) */}
                    {!isCrossed && (
                      <g
                        transform="translate(1240, 890)"
                        className="cursor-pointer"
                        opacity={isShotB ? 1 : 0.6}
                      >
                        {/* Active FOV Coverage Cone */}
                        {isShotB && (
                          <polygon
                            points="0,-20 -90,-260 90,-260"
                            fill="#10b981"
                            fillOpacity="0.14"
                          />
                        )}
                        <rect
                          x="-45"
                          y="-22"
                          width="90"
                          height="44"
                          rx="8"
                          fill="#064e3b"
                          stroke="#10b981"
                          strokeWidth={isShotB ? 3 : 1.5}
                        />
                        <text x="0" y="2" fill="#34d399" fontSize="13" fontFamily="monospace" textAnchor="middle" fontWeight="black">
                          CAM B
                        </text>
                        <text x="0" y="16" fill="#a7f3d0" fontSize="9" fontFamily="monospace" textAnchor="middle">
                          SAME SIDE ✓
                        </text>
                        {isShotB && (
                          <circle cx="32" cy="-14" r="4" fill="#34d399" />
                        )}
                      </g>
                    )}

                    {/* CAMERA B (CROSSED AXIS - Opposite side of the line) */}
                    {isCrossed && (
                      <g
                        transform="translate(960, 200)"
                        className="cursor-pointer"
                        opacity={isShotB ? 1 : 0.65}
                      >
                        {/* Dashed trajectory showing axis jump */}
                        <path
                          d="M 280 690 C 350 400, 120 180, 0 35"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="2"
                          strokeDasharray="6 4"
                          opacity="0.7"
                        />

                        {/* Active FOV Warning Cone pointing down through the axis */}
                        {isShotB && (
                          <polygon
                            points="0,22 -110,280 110,280"
                            fill="#ef4444"
                            fillOpacity="0.18"
                          />
                        )}
                        <rect
                          x="-65"
                          y="-22"
                          width="130"
                          height="44"
                          rx="8"
                          fill="#450a0a"
                          stroke="#ef4444"
                          strokeWidth={isShotB ? 3.5 : 1.8}
                        />
                        <text x="0" y="2" fill="#fca5a5" fontSize="12" fontFamily="monospace" textAnchor="middle" fontWeight="black">
                          CAM B (CROSSED)
                        </text>
                        <text x="0" y="16" fill="#f87171" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                          LINE CROSSED ⚠
                        </text>
                        {isShotB && (
                          <circle cx="52" cy="-14" r="4" fill="#ef4444" />
                        )}
                      </g>
                    )}

                    {/* Bottom Zone Status Guide */}
                    <g transform="translate(960, 970)">
                      <rect
                        x="-200"
                        y="-12"
                        width="400"
                        height="24"
                        rx="12"
                        fill="#090d16"
                        stroke="#334155"
                        strokeWidth="1"
                        opacity="0.85"
                      />
                      <text x="0" y="4" fill="#94a3b8" fontSize="11" fontFamily="monospace" textAnchor="middle">
                        {!isCrossed
                          ? 'PERMITTED 180° ZONE · BOTH CAMERAS ON SAME SIDE'
                          : 'AXIS CROSSED · OPPOSING CAMERA PERSPECTIVE ACTIVE'}
                      </text>
                    </g>
                  </g>
                )}
              </>
            );
          })()}
        </g>
      )}

      {/* =========================================================================
          2. 30° RULE (ANGLE CUT SAFETY)
      ========================================================================= */}
      {concept === '30-degree' && (
        <g id="demo-30-rule">
          {(() => {
            const angle = state.angle30DiffDeg ?? 30;
            const phase = state.angle30Phase ?? (state.angle30ActiveShot === 'shot-a' ? 'shot-a' : 'shot-b');
            const isShotA = phase === 'shot-a';
            const isCut = phase === 'cut';
            const isShotB = phase === 'shot-b';

            const isSafe = angle >= 30;
            const statusColor = isShotA
              ? '#38bdf8'
              : isSafe
              ? '#10b981'
              : '#ef4444';
            const statusBgColor = isShotA
              ? '#0f172a'
              : isSafe
              ? '#064e3b'
              : '#7f1d1d';

            // Top-down diagram trigonometry (radius 62 inside diagram card)
            const rad = ((90 - angle) * Math.PI) / 180;
            const diagR = 64;
            const camBx = diagR * Math.cos(rad);
            const camBy = diagR * Math.sin(rad);

            return (
              <>
                {/* -------------------------------------------------------------
                    1. TOP HUD STATUS BADGE
                ------------------------------------------------------------- */}
                <g transform="translate(960, 68)">
                  {isShotA && (
                    <g>
                      <rect
                        x="-330"
                        y="-22"
                        width="660"
                        height="44"
                        rx="8"
                        fill="#0f172a"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                      />
                      <circle cx="-300" cy="0" r="5" fill="#38bdf8" />
                      <text
                        x="0"
                        y="6"
                        fill="#ffffff"
                        fontSize="14"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight="black"
                        letterSpacing="1"
                      >
                        SHOT A · BASELINE FRAMING (CAMERA A · 0°)
                      </text>
                    </g>
                  )}

                  {isCut && (
                    <g>
                      <rect
                        x="-130"
                        y="-22"
                        width="260"
                        height="44"
                        rx="8"
                        fill="#991b1b"
                        stroke="#ef4444"
                        strokeWidth="2.5"
                      />
                      <text
                        x="0"
                        y="6"
                        fill="#ffffff"
                        fontSize="16"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight="black"
                        letterSpacing="2"
                      >
                        [ EDITORIAL CUT ]
                      </text>
                    </g>
                  )}

                  {isShotB && (
                    <g>
                      <rect
                        x="-360"
                        y="-22"
                        width="720"
                        height="44"
                        rx="8"
                        fill={statusBgColor}
                        stroke={statusColor}
                        strokeWidth="2.5"
                      />
                      <circle cx="-330" cy="0" r="5" fill={statusColor} />
                      <text
                        x="0"
                        y="6"
                        fill="#ffffff"
                        fontSize="14"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight="black"
                        letterSpacing="1"
                      >
                        {isSafe
                          ? `✓ SAFE CUT · ANGLE DIFFERENCE: +${angle}° (CLEAN PERSPECTIVE CHANGE)`
                          : `⚠ JUMP-CUT RISK · ANGLE DIFFERENCE: +${angle}° (< 30° THRESHOLD)`}
                      </text>
                    </g>
                  )}
                </g>

                {/* -------------------------------------------------------------
                    2. EDITORIAL CUT FULL-FRAME FLASH / SPLICE CARD
                ------------------------------------------------------------- */}
                {isCut && (
                  <g id="angle30-cut-overlay">
                    <rect x="0" y="0" width="1920" height="1080" fill="#000000" fillOpacity="0.75" />
                    <g transform="translate(960, 540)">
                      <rect
                        x="-200"
                        y="-45"
                        width="400"
                        height="90"
                        rx="10"
                        fill="#0b0f19"
                        stroke="#ef4444"
                        strokeWidth="3"
                      />
                      <text
                        x="0"
                        y="-8"
                        fill="#ef4444"
                        fontSize="22"
                        fontFamily="monospace"
                        fontWeight="black"
                        textAnchor="middle"
                        letterSpacing="3"
                      >
                        EDITORIAL CUT
                      </text>
                      <text
                        x="0"
                        y="22"
                        fill="#94a3b8"
                        fontSize="12"
                        fontFamily="monospace"
                        textAnchor="middle"
                        letterSpacing="1"
                      >
                        SPLICE POINT · TRANSITION TO NEXT SHOT
                      </text>
                    </g>
                  </g>
                )}

                {/* -------------------------------------------------------------
                    3. RESTRAINED MAIN VIEWPORT SCENE ANNOTATIONS
                ------------------------------------------------------------- */}
                {!isCut && (
                  <g id="angle30-scene-labels">
                    {/* Character Tracking Tag */}
                    <g transform={`translate(${faceAnchorX}, ${faceAnchorY - 95})`}>
                      <rect
                        x="-110"
                        y="-14"
                        width="220"
                        height="28"
                        rx="6"
                        fill="#090d16"
                        stroke={statusColor}
                        strokeWidth="1.8"
                        opacity="0.95"
                      />
                      <text
                        x="0"
                        y="5"
                        fill={statusColor}
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {isShotA
                          ? 'SHOT A · 0° BASELINE'
                          : isSafe
                          ? `SHOT B · SAFE CUT (+${angle}°)`
                          : `SHOT B · JUMP-CUT RISK (+${angle}°)`}
                      </text>
                    </g>
                  </g>
                )}

                {/* -------------------------------------------------------------
                    4. COMPACT TOP-DOWN CAMERA ANGLE DIAGRAM CARD (LOWER-LEFT)
                ------------------------------------------------------------- */}
                {!isCut && (
                  <g id="angle30-top-down-diagram" transform="translate(320, 870)">
                    {/* Diagram Panel Backdrop */}
                    <rect
                      x="-190"
                      y="-100"
                      width="380"
                      height="200"
                      rx="12"
                      fill="#070c18"
                      fillOpacity="0.92"
                      stroke="#334155"
                      strokeWidth="1.5"
                    />

                    {/* Header */}
                    <text
                      x="0"
                      y="-76"
                      fill="#94a3b8"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fontWeight="bold"
                      letterSpacing="1"
                    >
                      TOP-DOWN CAMERA ANGLE DIAGRAM
                    </text>

                    {/* Circular Reference Guide Orbit */}
                    <circle cx="0" cy="-5" r={diagR} fill="none" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 4" />

                    {/* Central Subject Node */}
                    <g transform="translate(0, -5)">
                      <circle cx="0" cy="0" r="11" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                      <text x="0" y="3" fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        SUBJ
                      </text>
                    </g>

                    {/* Sightline: Subject to Camera A (straight down, 0°) */}
                    <line x1="0" y1="-5" x2="0" y2={-5 + diagR} stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" />

                    {/* Sightline: Subject to Camera B (offset by angle) */}
                    <line x1="0" y1="-5" x2={camBx} y2={-5 + camBy} stroke={statusColor} strokeWidth="2" />

                    {/* Angle Arc Measurement */}
                    <path
                      d={`M 0 ${-5 + 38} A 38 38 0 0 1 ${38 * Math.cos(rad)} ${-5 + 38 * Math.sin(rad)}`}
                      fill="none"
                      stroke={statusColor}
                      strokeWidth="2.5"
                    />

                    {/* Angle Difference Label */}
                    <text
                      x="28"
                      y="13"
                      fill={statusColor}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      letterSpacing="0.5"
                    >
                      ANGLE DIFFERENCE
                    </text>
                    <text
                      x="28"
                      y="26"
                      fill={statusColor}
                      fontSize="13"
                      fontFamily="monospace"
                      fontWeight="black"
                    >
                      Δθ = {angle}°
                    </text>

                    {/* Camera A Marker (Baseline) */}
                    <g
                      transform={`translate(0, ${-5 + diagR})`}
                      opacity={isShotA ? 1 : 0.6}
                    >
                      <rect
                        x="-24"
                        y="-10"
                        width="48"
                        height="20"
                        rx="4"
                        fill="#0f172a"
                        stroke="#38bdf8"
                        strokeWidth={isShotA ? 2 : 1}
                      />
                      <text x="0" y="4" fill="#38bdf8" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        CAM A
                      </text>
                    </g>

                    {/* Camera B Marker (Offset by Δθ) */}
                    <g
                      transform={`translate(${camBx}, ${-5 + camBy})`}
                      opacity={isShotB ? 1 : 0.6}
                    >
                      <rect
                        x="-24"
                        y="-10"
                        width="48"
                        height="20"
                        rx="4"
                        fill={isSafe ? '#064e3b' : '#7f1d1d'}
                        stroke={isSafe ? '#10b981' : '#ef4444'}
                        strokeWidth={isShotB ? 2 : 1}
                      />
                      <text x="0" y="4" fill="#ffffff" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        CAM B
                      </text>
                    </g>

                    {/* Status Pill at Bottom of Diagram Card */}
                    <g transform="translate(0, 80)">
                      <rect
                        x="-140"
                        y="-10"
                        width="280"
                        height="20"
                        rx="10"
                        fill={isSafe ? '#064e3b' : '#7f1d1d'}
                        stroke={isSafe ? '#10b981' : '#ef4444'}
                        strokeWidth="1"
                        fillOpacity="0.85"
                      />
                      <text
                        x="0"
                        y="4"
                        fill="#ffffff"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {isSafe
                          ? `✓ SAFE CUT (Δθ = ${angle}° ≥ 30° THRESHOLD)`
                          : `⚠ JUMP-CUT RISK (Δθ = ${angle}° < 30° THRESHOLD)`}
                      </text>
                    </g>
                  </g>
                )}
              </>
            );
          })()}
        </g>
      )}

      {/* =========================================================================
          3. EYELINE MATCH
      ========================================================================= */}
      {concept === 'eyeline' && (() => {
        const phase = state.eyelinePhase || 'shot-a';
        const isRight = state.eyelineGazeDir !== 'left';
        const gazeDeg = state.eyelineGazeElevation;
        const targetElev = state.eyelineTargetElevation;
        const diff = Math.abs(gazeDeg - targetElev);
        const isMatch = diff <= 4;
        const statusColor = isMatch ? '#10b981' : '#f97316';

        const isShotA = phase === 'shot-a';
        const isCut = phase === 'cut';
        const isShotB = phase === 'shot-b';

        // Shot A character eye coordinates
        const charEyeX = faceAnchorX + (isRight ? 36 : -36);
        const charEyeY = faceAnchorY - 14;
        const edgeX = isRight ? 1920 : 0;
        const deltaX = Math.abs(edgeX - charEyeX);
        const gazeY = charEyeY - Math.tan((gazeDeg * Math.PI) / 180) * deltaX;

        // Shot B target coordinates
        const targetX = isRight ? 1380 : 540;
        const enterX = isRight ? 0 : 1920;
        const targetY = Math.max(220, Math.min(820, 480 - Math.tan((targetElev * Math.PI) / 180) * 720));
        const projectedTargetY = Math.max(160, Math.min(880, 480 - Math.tan((gazeDeg * Math.PI) / 180) * 720));

        return (
          <g id="demo-eyeline">
            {/* -------------------------------------------------------------
                1. EDITORIAL HARD CUT TRANSITION
            ------------------------------------------------------------- */}
            {isCut && (
              <g id="eyeline-cut-screen">
                <rect width="1920" height="1080" fill="#020617" />
                <g transform="translate(960, 540)">
                  <rect x="-80" y="-36" width="160" height="72" rx="8" fill="#dc2626" stroke="#ffffff" strokeWidth="2.5" />
                  <text x="0" y="8" fill="#ffffff" fontSize="24" fontFamily="sans-serif" textAnchor="middle" fontWeight="black" letterSpacing="2">
                    CUT
                  </text>
                </g>
              </g>
            )}

            {/* -------------------------------------------------------------
                2. SHOT A: CHARACTER LOOK
            ------------------------------------------------------------- */}
            {isShotA && (
              <g id="eyeline-shot-a">
                {/* Character Eye Focus Reticle */}
                <g transform={`translate(${charEyeX}, ${charEyeY})`}>
                  <circle cx="0" cy="0" r="18" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 3" />
                  <circle cx="0" cy="0" r="4" fill="#38bdf8" />
                  <rect x={isRight ? -140 : 20} y="-32" width="120" height="20" rx="4" fill="#090d16" stroke="#38bdf8" strokeWidth="1" opacity="0.92" />
                  <text x={isRight ? -80 : 80} y="-18" fill="#7dd3fc" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    LOOK ORIGIN
                  </text>
                </g>

                {/* Eyeline Sight-Line Guide Beam */}
                <line
                  x1={charEyeX}
                  y1={charEyeY}
                  x2={edgeX}
                  y2={gazeY}
                  stroke="#38bdf8"
                  strokeWidth="3"
                  strokeDasharray="10 6"
                />

                {/* Sight-line Arrowhead at Edge */}
                <polygon
                  points={
                    isRight
                      ? `${edgeX},${gazeY} ${edgeX - 22},${gazeY - 9} ${edgeX - 16},${gazeY} ${edgeX - 22},${gazeY + 9}`
                      : `${edgeX},${gazeY} ${edgeX + 22},${gazeY - 9} ${edgeX + 16},${gazeY} ${edgeX + 22},${gazeY + 9}`
                  }
                  fill="#38bdf8"
                />

                {/* Vector Technical Badge */}
                <g transform={`translate(${charEyeX + (isRight ? 1 : -1) * deltaX * 0.45}, ${charEyeY - Math.tan((gazeDeg * Math.PI) / 180) * deltaX * 0.45 - 22})`}>
                  <rect x="-140" y="-13" width="280" height="26" rx="5" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" opacity="0.95" />
                  <text x="0" y="4" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    EYELINE · GAZE DIRECTION ({gazeDeg >= 0 ? '+' : ''}${gazeDeg}°) {isRight ? '→' : '←'}
                  </text>
                </g>
              </g>
            )}

            {/* -------------------------------------------------------------
                3. SHOT B: TARGET REVEAL
            ------------------------------------------------------------- */}
            {isShotB && (
              <g id="eyeline-shot-b">
                {/* Incoming Sight-line Beam entering from frame edge */}
                {isMatch ? (
                  <>
                    <line
                      x1={enterX}
                      y1={480}
                      x2={targetX}
                      y2={targetY}
                      stroke="#10b981"
                      strokeWidth="3.5"
                      strokeDasharray="10 5"
                    />
                    {/* Beam Label */}
                    <g transform={`translate(${(enterX + targetX) / 2}, ${(480 + targetY) / 2 - 20})`}>
                      <rect x="-120" y="-12" width="240" height="24" rx="5" fill="#064e3b" stroke="#10b981" strokeWidth="1.2" opacity="0.95" />
                      <text x="0" y="4" fill="#6ee7b7" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                        ✓ EYELINE MATCH (ALIGNED)
                      </text>
                    </g>
                  </>
                ) : (
                  <>
                    {/* Projected trajectory missing the target */}
                    <line
                      x1={enterX}
                      y1={480}
                      x2={targetX}
                      y2={projectedTargetY}
                      stroke="#f97316"
                      strokeWidth="3"
                      strokeDasharray="8 5"
                    />
                    {/* Mismatch connector between projected eyeline and target */}
                    <line
                      x1={targetX}
                      y1={projectedTargetY}
                      x2={targetX}
                      y2={targetY}
                      stroke="#ef4444"
                      strokeWidth="2.5"
                      strokeDasharray="4 4"
                    />
                    {/* Disconnect indicator */}
                    <circle cx={targetX} cy={projectedTargetY} r="6" fill="#ef4444" />
                    <g transform={`translate(${(enterX + targetX) / 2}, ${(480 + projectedTargetY) / 2 - 20})`}>
                      <rect x="-130" y="-12" width="260" height="24" rx="5" fill="#7c2d12" stroke="#ea580c" strokeWidth="1.2" opacity="0.95" />
                      <text x="0" y="4" fill="#fdba74" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                        ⚠ EYELINE MISMATCH (${diff.toFixed(0)}° DISCONNECT)
                      </text>
                    </g>
                  </>
                )}

                {/* Architectural Rooftop Pedestal Mounting */}
                <g id="target-pedestal" opacity="0.9">
                  <rect
                    x={targetX - 28}
                    y={targetY + 44}
                    width="56"
                    height={Math.max(60, 960 - (targetY + 44))}
                    fill="#1e293b"
                    stroke="#334155"
                    strokeWidth="2"
                    rx="4"
                  />
                  <ellipse cx={targetX} cy={targetY + 44} rx="34" ry="8" fill="#334155" />
                </g>

                {/* Target Focal Object (Rooftop Optical Beacon / Point of Interest) */}
                <g id="target-focal-object" transform={`translate(${targetX}, ${targetY})`}>
                  {/* Outer Calibration Ring */}
                  <circle cx="0" cy="0" r="46" fill="#0f172a" stroke={statusColor} strokeWidth="3" />
                  {/* Inner Optical Reticle */}
                  <circle cx="0" cy="0" r="32" fill={isMatch ? '#064e3b' : '#431407'} stroke={statusColor} strokeWidth="1.8" strokeDasharray="5 3" />
                  {/* Glowing Core */}
                  <circle cx="0" cy="0" r="12" fill={isMatch ? '#34d399' : '#fb923c'} />
                  {/* Crosshairs */}
                  <line x1="-30" y1="0" x2="-14" y2="0" stroke="#ffffff" strokeWidth="1.5" />
                  <line x1="14" y1="0" x2="30" y2="0" stroke="#ffffff" strokeWidth="1.5" />
                  <line x1="0" y1="-30" x2="0" y2="-14" stroke="#ffffff" strokeWidth="1.5" />
                  <line x1="0" y1="14" x2="0" y2="30" stroke="#ffffff" strokeWidth="1.5" />

                  {/* Target Label */}
                  <g transform="translate(0, 72)">
                    <rect x="-105" y="-12" width="210" height="24" rx="4" fill="#090d16" stroke={statusColor} strokeWidth="1.2" opacity="0.95" />
                    <text x="0" y="4" fill={isMatch ? '#6ee7b7' : '#fed7aa'} fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                      TARGET ({targetElev >= 0 ? '+' : ''}${targetElev}° ELEVATION)
                    </text>
                  </g>
                </g>
              </g>
            )}

            {/* -------------------------------------------------------------
                4. TOP HUD CENTER TECHNICAL LABELS
            ------------------------------------------------------------- */}
            <g transform="translate(960, 70)">
              {isShotA && (
                <g>
                  <rect x="-140" y="-20" width="280" height="40" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                  <text x="0" y="6" fill="#38bdf8" fontSize="15" fontFamily="monospace" textAnchor="middle" fontWeight="black" letterSpacing="1.5">
                    SHOT A · CHARACTER LOOK
                  </text>
                </g>
              )}

              {isCut && (
                <g>
                  <rect x="-65" y="-20" width="130" height="40" rx="8" fill="#991b1b" stroke="#ef4444" strokeWidth="2" />
                  <text x="0" y="6" fill="#ffffff" fontSize="15" fontFamily="monospace" textAnchor="middle" fontWeight="black" letterSpacing="1.5">
                    CUT
                  </text>
                </g>
              )}

              {isShotB && (
                <g>
                  <rect
                    x="-200"
                    y="-20"
                    width="400"
                    height="40"
                    rx="8"
                    fill={isMatch ? '#064e3b' : '#451a03'}
                    stroke={isMatch ? '#10b981' : '#ea580c'}
                    strokeWidth="2"
                  />
                  <circle cx="-175" cy="0" r="5" fill={isMatch ? '#34d399' : '#fb923c'} />
                  <text x="10" y="6" fill="#ffffff" fontSize="14" fontFamily="monospace" textAnchor="middle" fontWeight="black" letterSpacing="1.2">
                    {isMatch ? 'SHOT B · TARGET REVEAL (EYELINE MATCH ✓)' : 'SHOT B · TARGET REVEAL (EYELINE MISMATCH ⚠)'}
                  </text>
                </g>
              )}
            </g>
          </g>
        );
      })()}

      {/* =========================================================================
          4. SCREEN DIRECTION CONTINUITY
      ========================================================================= */}
      {concept === 'screen-direction' && (
        <g id="demo-screen-direction">
          {(() => {
            const isConsistent = state.screenDirMode === 'consistent';
            const phase = state.screenDirPhase ?? (state.screenDirStep === 1 ? 'shot-a' : 'shot-b');
            const isShotA = phase === 'shot-a';
            const isCut = phase === 'cut';
            const isShotB = phase === 'shot-b';

            const statusColor = isShotA
              ? '#38bdf8'
              : isConsistent
              ? '#10b981'
              : '#ef4444';
            const statusBgColor = isShotA
              ? '#0f172a'
              : isConsistent
              ? '#064e3b'
              : '#7f1d1d';

            // Ground line coordinate (default ~840px in 1080p viewport)
            const groundY = groundContactY ?? 840;

            return (
              <>
                {/* -------------------------------------------------------------
                    1. TOP HUD STATUS BADGE
                ------------------------------------------------------------- */}
                <g transform="translate(960, 68)">
                  {isShotA && (
                    <g>
                      <rect
                        x="-330"
                        y="-22"
                        width="660"
                        height="44"
                        rx="8"
                        fill="#0f172a"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                      />
                      <circle cx="-300" cy="0" r="5" fill="#38bdf8" />
                      <text
                        x="0"
                        y="6"
                        fill="#ffffff"
                        fontSize="14"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight="black"
                        letterSpacing="1"
                      >
                        SHOT A · ESTABLISH DIRECTION (TRAVEL VECTOR: LEFT → RIGHT)
                      </text>
                    </g>
                  )}

                  {isCut && (
                    <g>
                      <rect
                        x="-130"
                        y="-22"
                        width="260"
                        height="44"
                        rx="8"
                        fill="#991b1b"
                        stroke="#ef4444"
                        strokeWidth="2.5"
                      />
                      <text
                        x="0"
                        y="6"
                        fill="#ffffff"
                        fontSize="16"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight="black"
                        letterSpacing="2"
                      >
                        [ EDITORIAL CUT ]
                      </text>
                    </g>
                  )}

                  {isShotB && (
                    <g>
                      <rect
                        x="-350"
                        y="-22"
                        width="700"
                        height="44"
                        rx="8"
                        fill={statusBgColor}
                        stroke={statusColor}
                        strokeWidth="2.5"
                      />
                      <circle cx="-320" cy="0" r="5" fill={statusColor} />
                      <text
                        x="0"
                        y="6"
                        fill="#ffffff"
                        fontSize="14"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight="black"
                        letterSpacing="1"
                      >
                        {isConsistent
                          ? '✓ SHOT B · SAME DIRECTION (SCREEN DIRECTION CONTINUITY)'
                          : '⚠ SHOT B · OPPOSITE DIRECTION (SCREEN DIRECTION BREAK / AXIS CROSSED)'}
                      </text>
                    </g>
                  )}
                </g>

                {/* -------------------------------------------------------------
                    2. EDITORIAL CUT FULL-FRAME FLASH / SPLICE CARD
                ------------------------------------------------------------- */}
                {isCut && (
                  <g id="screen-dir-cut-overlay">
                    <rect x="0" y="0" width="1920" height="1080" fill="#000000" fillOpacity="0.75" />
                    <g transform="translate(960, 540)">
                      <rect
                        x="-200"
                        y="-45"
                        width="400"
                        height="90"
                        rx="10"
                        fill="#0b0f19"
                        stroke="#ef4444"
                        strokeWidth="3"
                      />
                      <text
                        x="0"
                        y="-8"
                        fill="#ef4444"
                        fontSize="22"
                        fontFamily="monospace"
                        fontWeight="black"
                        textAnchor="middle"
                        letterSpacing="3"
                      >
                        EDITORIAL CUT
                      </text>
                      <text
                        x="0"
                        y="22"
                        fill="#94a3b8"
                        fontSize="12"
                        fontFamily="monospace"
                        textAnchor="middle"
                        letterSpacing="1"
                      >
                        SPLICE POINT · TRANSITION TO NEXT SETUP
                      </text>
                    </g>
                  </g>
                )}

                {/* -------------------------------------------------------------
                    3. MOVEMENT DIRECTION VECTOR ARROW BANNER (ACTIVE SHOTS)
                ------------------------------------------------------------- */}
                {!isCut && (
                  <g id="movement-direction-banner" transform="translate(960, 136)">
                    {/* Background capsule */}
                    <rect
                      x="-280"
                      y="-18"
                      width="560"
                      height="36"
                      rx="18"
                      fill="#070c18"
                      stroke={statusColor}
                      strokeWidth="1.8"
                      fillOpacity="0.9"
                    />

                    {/* Vector representation */}
                    {(isShotA || (isShotB && isConsistent)) ? (
                      // Left-to-Right Vector
                      <g>
                        <line
                          x1="-240"
                          y1="0"
                          x2="180"
                          y2="0"
                          stroke={statusColor}
                          strokeWidth="3.5"
                          strokeDasharray="12 6"
                        />
                        <polygon
                          points="200,0 180,-8 180,8"
                          fill={statusColor}
                        />
                        <text
                          x="-10"
                          y="4"
                          fill="#ffffff"
                          fontSize="12"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                          letterSpacing="1.2"
                        >
                          {isShotA
                            ? 'MOVEMENT DIRECTION →'
                            : 'SCREEN DIRECTION CONTINUITY →'}
                        </text>
                      </g>
                    ) : (
                      // Right-to-Left Reversed Vector
                      <g>
                        <polygon
                          points="-200,0 -180,-8 -180,8"
                          fill={statusColor}
                        />
                        <line
                          x1="-180"
                          y1="0"
                          x2="240"
                          y2="0"
                          stroke={statusColor}
                          strokeWidth="3.5"
                          strokeDasharray="12 6"
                        />
                        <text
                          x="10"
                          y="4"
                          fill="#ffffff"
                          fontSize="12"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                          letterSpacing="1.2"
                        >
                          ← REVERSED DIRECTION (SCREEN DIRECTION BREAK)
                        </text>
                      </g>
                    )}
                  </g>
                )}

                {/* -------------------------------------------------------------
                    4. HORIZONTAL MOVEMENT RUNWAY & SPATIAL VECTORS (ON STAGE)
                ------------------------------------------------------------- */}
                {!isCut && (
                  <g id="screen-dir-stage-guides">
                    {/* Subtle Motion Runway along Ground */}
                    <g transform={`translate(960, ${groundY})`}>
                      {/* Track Guide */}
                      <line
                        x1="-650"
                        y1="0"
                        x2="650"
                        y2="0"
                        stroke="#334155"
                        strokeWidth="1.5"
                        strokeDasharray="8 6"
                        opacity="0.6"
                      />

                      {/* Direction Chevrons along track */}
                      {(isShotA || (isShotB && isConsistent)) ? (
                        <g opacity="0.45" stroke={statusColor} strokeWidth="2" fill="none">
                          <path d="M -500 -12 L -485 0 L -500 12" />
                          <path d="M -250 -12 L -235 0 L -250 12" />
                          <path d="M 0 -12 L 15 0 L 0 12" />
                          <path d="M 250 -12 L 265 0 L 250 12" />
                          <path d="M 500 -12 L 515 0 L 500 12" />
                        </g>
                      ) : (
                        <g opacity="0.45" stroke={statusColor} strokeWidth="2" fill="none">
                          <path d="M -500 -12 L -515 0 L -500 12" />
                          <path d="M -250 -12 L -265 0 L -250 12" />
                          <path d="M 0 -12 L -15 0 L 0 12" />
                          <path d="M 250 -12 L 235 0 L 250 12" />
                          <path d="M 500 -12 L 485 0 L 500 12" />
                        </g>
                      )}

                      {/* Left Boundary Tag */}
                      <g transform="translate(-650, 24)">
                        <rect x="-65" y="-10" width="130" height="20" rx="4" fill="#090d16" stroke="#475569" strokeWidth="1" opacity="0.85" />
                        <text x="0" y="4" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">
                          {(isShotA || (isShotB && isConsistent)) ? 'SCREEN LEFT [ENTER]' : 'SCREEN LEFT [EXIT]'}
                        </text>
                      </g>

                      {/* Right Boundary Tag */}
                      <g transform="translate(650, 24)">
                        <rect x="-65" y="-10" width="130" height="20" rx="4" fill="#090d16" stroke="#475569" strokeWidth="1" opacity="0.85" />
                        <text x="0" y="4" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">
                          {(isShotA || (isShotB && isConsistent)) ? 'SCREEN RIGHT [EXIT]' : 'SCREEN RIGHT [ENTER]'}
                        </text>
                      </g>
                    </g>

                    {/* Character Dynamic Target & Direction Indicator */}
                    <g transform={`translate(${faceAnchorX}, ${faceAnchorY})`}>
                      {/* Floating Direction Tag above Character Head */}
                      <g transform="translate(0, -95)">
                        <rect
                          x="-80"
                          y="-13"
                          width="160"
                          height="26"
                          rx="13"
                          fill="#090d16"
                          stroke={statusColor}
                          strokeWidth="1.8"
                          opacity="0.95"
                        />
                        <text
                          x="0"
                          y="4"
                          fill={statusColor}
                          fontSize="11"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {(isShotA || (isShotB && isConsistent)) ? 'TRAVEL VECTOR →' : '← TRAVEL VECTOR'}
                        </text>
                      </g>

                      {/* Velocity Vector Arrow pointing from character */}
                      {(isShotA || (isShotB && isConsistent)) ? (
                        <g>
                          <line
                            x1="35"
                            y1="0"
                            x2="95"
                            y2="0"
                            stroke={statusColor}
                            strokeWidth="3"
                          />
                          <polygon
                            points="105,0 93,-6 93,6"
                            fill={statusColor}
                          />
                        </g>
                      ) : (
                        <g>
                          <line
                            x1="-35"
                            y1="0"
                            x2="-95"
                            y2="0"
                            stroke={statusColor}
                            strokeWidth="3"
                          />
                          <polygon
                            points="-105,0 -93,-6 -93,6"
                            fill={statusColor}
                          />
                        </g>
                      )}

                      {/* Ground Contact Reticle beneath Actor */}
                      <ellipse
                        cx="0"
                        cy={groundY - faceAnchorY}
                        rx="50"
                        ry="9"
                        fill="none"
                        stroke={statusColor}
                        strokeWidth="1.8"
                        strokeDasharray="5 3"
                        opacity="0.8"
                      />
                    </g>
                  </g>
                )}
              </>
            );
          })()}
        </g>
      )}

      {/* =========================================================================
          5. PHYSICAL CONTINUITY
      ========================================================================= */}
      {concept === 'continuity' && (
        <g id="demo-physical-continuity">
          {(() => {
            const isStep1 = state.continuityStep === 1;
            const isMatched = state.continuityMode === 'matched';
            const isError = !isStep1 && !isMatched;

            // Geometry corresponding directly to CameraPOVView & canvasRenderer character positions:
            // Step 1: scale = 1.0, anchorY = 475.2
            // Step 2: scale = 1.48, anchorY = 475.2 - 35 = 440.2
            const scale = isStep1 ? 1.0 : 1.48;
            const anchorY = isStep1 ? 475.2 : 440.2;

            // Right hand cup: local (83, 202) -> screen coordinates
            const rightCupX = 960 + 83 * scale;
            const rightCupY = anchorY + 202 * scale;

            // Left hand cup (error): local (-53, 202) -> screen coordinates
            const leftCupX = 960 - 53 * scale;
            const leftCupY = anchorY + 202 * scale;

            // Active tracked cup location
            const activeCupX = isError ? leftCupX : rightCupX;
            const activeCupY = isError ? leftCupY : rightCupY;
            const reticleR = isStep1 ? 38 : 48;

            const themeColor = isStep1 ? '#38bdf8' : isMatched ? '#10b981' : '#ef4444';

            return (
              <>
                {/* 1. Shot Indicator Badge (Top Left) */}
                <g transform="translate(60, 52)">
                  <rect
                    x="0"
                    y="0"
                    width={isStep1 ? 260 : isMatched ? 310 : 330}
                    height="36"
                    rx="6"
                    fill="#0f172a"
                    stroke={themeColor}
                    strokeWidth="2"
                    fillOpacity="0.92"
                  />
                  <circle cx="18" cy="18" r="6" fill={themeColor} />
                  <text
                    x="32"
                    y="23"
                    fill="#ffffff"
                    fontSize="13"
                    fontFamily="monospace"
                    fontWeight="bold"
                    letterSpacing="0.5"
                  >
                    {isStep1
                      ? 'SHOT A: BEFORE CUT (WIDE)'
                      : isMatched
                      ? 'SHOT B: AFTER CUT · MATCHED'
                      : 'SHOT B: AFTER CUT · ERROR ⚠'}
                  </text>
                </g>

                {/* 2. Prop Tracker Reticle directly over the Red Cup */}
                <g transform={`translate(${activeCupX}, ${activeCupY})`}>
                  {/* Dashed Target Ring */}
                  <circle
                    cx="0"
                    cy="0"
                    r={reticleR}
                    fill="none"
                    stroke={themeColor}
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                  />
                  {/* Outer corner tick marks */}
                  <line x1={-reticleR - 8} y1="0" x2={-reticleR + 2} y2="0" stroke={themeColor} strokeWidth="2.5" />
                  <line x1={reticleR - 2} y1="0" x2={reticleR + 8} y2="0" stroke={themeColor} strokeWidth="2.5" />
                  <line x1="0" y1={-reticleR - 8} x2="0" y2={-reticleR + 2} stroke={themeColor} strokeWidth="2.5" />
                  <line x1="0" y1={reticleR - 2} x2="0" y2={reticleR + 8} stroke={themeColor} strokeWidth="2.5" />
                  {/* Center Dot */}
                  <circle cx="0" cy="0" r="4" fill={themeColor} />

                  {/* Callout Label Tag */}
                  <g transform={`translate(0, ${reticleR + 24})`}>
                    <rect
                      x={isStep1 ? -110 : isMatched ? -130 : -140}
                      y="-14"
                      width={isStep1 ? 220 : isMatched ? 260 : 280}
                      height="26"
                      rx="5"
                      fill="#0f172a"
                      stroke={themeColor}
                      strokeWidth="1.5"
                      fillOpacity="0.95"
                    />
                    <text
                      x="0"
                      y="4"
                      fill={themeColor}
                      fontSize="12"
                      fontFamily="sans-serif"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {isStep1
                        ? 'PROP: RED CUP (RIGHT HAND)'
                        : isMatched
                        ? '✓ MATCHED PROP: RIGHT HAND'
                        : '⚠ CONTINUITY ERROR: LEFT HAND'}
                    </text>
                  </g>
                </g>

                {/* 3. If Continuity Error in Shot B: Show Expected Position Ghost at Right Hand */}
                {isError && (
                  <g transform={`translate(${rightCupX}, ${rightCupY})`}>
                    <circle
                      cx="0"
                      cy="0"
                      r={reticleR}
                      fill="rgba(239, 68, 68, 0.08)"
                      stroke="#94a3b8"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    {/* Ghost X */}
                    <line x1="-12" y1="-12" x2="12" y2="12" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="12" y1="-12" x2="-12" y2="12" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                    <g transform={`translate(0, ${reticleR + 22})`}>
                      <rect x="-95" y="-12" width="190" height="24" rx="4" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
                      <text x="0" y="4" fill="#94a3b8" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                        MISSING FROM RIGHT HAND
                      </text>
                    </g>
                    {/* Indicator arc showing mismatch from right to left */}
                    <path
                      d={`M -20 -10 Q ${(leftCupX - rightCupX) / 2} -70 ${leftCupX - rightCupX + 25} -10`}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeDasharray="5 3"
                    />
                  </g>
                )}

                {/* 4. Top Explanatory Status Banner */}
                <g transform="translate(960, 52)">
                  <rect
                    x="-340"
                    y="-20"
                    width="680"
                    height="42"
                    rx="8"
                    fill={isStep1 ? '#0f2942' : isMatched ? '#064e3b' : '#7f1d1d'}
                    stroke={themeColor}
                    strokeWidth="2"
                    fillOpacity="0.95"
                  />
                  <text
                    x="0"
                    y="6"
                    fill="#ffffff"
                    fontSize="14"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {isStep1
                      ? 'SHOT A — BEFORE CUT: Character holds red cup in right hand'
                      : isMatched
                      ? '✓ PHYSICAL CONTINUITY: Red cup preserved in right hand across cut'
                      : '⚠ CONTINUITY BREAK: Prop switched from right hand to left hand!'}
                  </text>
                </g>
              </>
            );
          })()}
        </g>
      )}

      {/* =========================================================================
          6. MATCH CUT
      ========================================================================= */}
      {concept === 'match-cut' && (
        <g id="demo-match-cut">
          <defs>
            {/* Night Sky Gradient for Shot B */}
            <linearGradient id="matchcut-nightsky" x1="0" y1="0" x2="0" y2="1080" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#020617" />
              <stop offset="50%" stopColor="#0b1329" />
              <stop offset="85%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* Daytime Golden Sun Corona Glow */}
            <radialGradient id="matchcut-sun-glow" cx="1280" cy="280" r="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fde047" stopOpacity="0.55" />
              <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="75%" stopColor="#f59e0b" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>

            {/* Nighttime Celestial Moon Glow */}
            <radialGradient id="matchcut-moon-glow" cx="1280" cy="280" r="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.50" />
              <stop offset="45%" stopColor="#cbd5e1" stopOpacity="0.22" />
              <stop offset="75%" stopColor="#38bdf8" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>

            {/* Moon Disk Gradient */}
            <radialGradient id="matchcut-moon-disk" cx="1260" cy="260" r="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#e2e8f0" />
              <stop offset="90%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </radialGradient>
          </defs>

          {(() => {
            const phase = state.matchCutPhase || (
              state.matchCutProgress <= 30 ? 'shot-a' :
              state.matchCutProgress < 70 ? 'match-element' : 'shot-b'
            );
            const isBlend50 = state.matchCutProgress >= 40 && state.matchCutProgress <= 60 && !state.matchCutPhase;
            const isCut = phase === 'cut' && !isBlend50;
            const isShotB = (phase === 'shot-b' || isBlend50) && !isCut;
            const isShotA = (phase === 'shot-a' || phase === 'match-element' || isBlend50) && !isCut;
            const isHighlight = phase === 'match-element' || isBlend50;

            const CIRCLE_X = 1280;
            const CIRCLE_Y = 280;
            const CIRCLE_R = 75;

            return (
              <>
                {/* -------------------------------------------------------------
                    SHOT B LAYER: NIGHT SKY & CELESTIAL MOON
                ------------------------------------------------------------- */}
                {isShotB && (
                  <g id="matchcut-shot-b" opacity={isBlend50 ? 0.6 : 1.0}>
                    {/* Deep Midnight Blue Night Sky */}
                    <rect width="1920" height="1080" fill="url(#matchcut-nightsky)" />

                    {/* Subtle Night Stars in Upper Sky */}
                    <g opacity="0.8">
                      {([
                        [160, 120, 1.4], [280, 200, 1.2], [440, 95, 1.6], [620, 180, 1.2],
                        [780, 110, 1.5], [920, 75, 1.8], [1080, 130, 1.4], [1460, 95, 1.6],
                        [1620, 190, 1.3], [1780, 110, 1.7], [240, 360, 1.2], [420, 320, 1.4],
                        [1560, 310, 1.3], [1720, 260, 1.5], [1840, 380, 1.2], [100, 460, 1.3],
                      ] as [number, number, number][]).map(([sx, sy, sr], idx) => (
                        <circle key={idx} cx={sx} cy={sy} r={sr} fill="#f8fafc" opacity={0.5 + (idx % 3) * 0.25} />
                      ))}
                    </g>

                    {/* Distant Horizon Silhouette along Bottom */}
                    <path
                      d="M 0 910 Q 240 870 480 890 Q 720 860 960 880 Q 1200 855 1440 885 Q 1680 865 1920 895 L 1920 1080 L 0 1080 Z"
                      fill="#070c16"
                      stroke="#1e293b"
                      strokeWidth="1.2"
                    />

                    {/* Distant City Night Lights */}
                    <g opacity="0.85">
                      {([
                        [220, 915, '#fef08a'], [340, 920, '#67e8f9'], [480, 910, '#fef08a'],
                        [640, 905, '#fef08a'], [760, 910, '#67e8f9'], [1120, 905, '#fef08a'],
                        [1240, 910, '#67e8f9'], [1420, 905, '#fef08a'], [1580, 910, '#67e8f9'],
                      ] as [number, number, string][]).map(([lx, ly, col], idx) => (
                        <circle key={idx} cx={lx} cy={ly} r="2" fill={col} />
                      ))}
                    </g>

                    {/* CELESTIAL MOON (MATCHING CIRCULAR ELEMENT AT 1280, 280 · R: 75px) */}
                    <circle cx={CIRCLE_X} cy={CIRCLE_Y} r={CIRCLE_R + 85} fill="url(#matchcut-moon-glow)" />
                    <circle cx={CIRCLE_X} cy={CIRCLE_Y} r={CIRCLE_R} fill="url(#matchcut-moon-disk)" stroke="#f8fafc" strokeWidth="1.5" />

                    {/* Subtle Lunar Surface Markings */}
                    <g opacity="0.32">
                      <circle cx={CIRCLE_X - 18} cy={CIRCLE_Y + 12} r={10} fill="#64748b" />
                      <circle cx={CIRCLE_X + 22} cy={CIRCLE_Y - 14} r={8} fill="#64748b" />
                      <circle cx={CIRCLE_X + 10} cy={CIRCLE_Y + 24} r={6} fill="#64748b" />
                      <path d={`M ${CIRCLE_X - 25} ${CIRCLE_Y - 20} Q ${CIRCLE_X} ${CIRCLE_Y - 35} ${CIRCLE_X + 30} ${CIRCLE_Y - 15} Q ${CIRCLE_X + 10} ${CIRCLE_Y} ${CIRCLE_X - 15} ${CIRCLE_Y - 5} Z`} fill="#64748b" />
                    </g>
                  </g>
                )}

                {/* -------------------------------------------------------------
                    SHOT A LAYER: GOLDEN SUN CIRCULAR ELEMENT AT (1280, 280 · R: 75px)
                ------------------------------------------------------------- */}
                {isShotA && (
                  <g id="matchcut-shot-a">
                    {/* Golden Sun Corona Glow */}
                    <circle cx={CIRCLE_X} cy={CIRCLE_Y} r={CIRCLE_R + 85} fill="url(#matchcut-sun-glow)" />

                    {/* Golden Sun Disk */}
                    <circle
                      cx={CIRCLE_X}
                      cy={CIRCLE_Y}
                      r={CIRCLE_R}
                      fill="#ffd83b"
                      stroke="#fef08a"
                      strokeWidth="2.5"
                    />

                    {/* Radiant Solar Core Highlight */}
                    <circle cx={CIRCLE_X - 14} cy={CIRCLE_Y - 14} r={28} fill="#ffffff" fillOpacity="0.45" />
                  </g>
                )}

                {/* -------------------------------------------------------------
                    MATCH ELEMENT EMPHASIS RETICLE AT (1280, 280 · R: 75px)
                ------------------------------------------------------------- */}
                {(isHighlight || isShotB) && !isCut && (
                  <g id="matchcut-reticle" opacity="0.95">
                    {/* Matching Circle Reticle */}
                    <circle
                      cx={CIRCLE_X}
                      cy={CIRCLE_Y}
                      r={CIRCLE_R + 10}
                      stroke={isShotB ? '#10b981' : '#f59e0b'}
                      strokeWidth="2"
                      strokeDasharray="6 4"
                      fill="none"
                    />
                    {/* Crosshair Ticks */}
                    <line x1={CIRCLE_X - CIRCLE_R - 22} y1={CIRCLE_Y} x2={CIRCLE_X - CIRCLE_R - 5} y2={CIRCLE_Y} stroke={isShotB ? '#10b981' : '#f59e0b'} strokeWidth="1.5" />
                    <line x1={CIRCLE_X + CIRCLE_R + 5} y1={CIRCLE_Y} x2={CIRCLE_X + CIRCLE_R + 22} y2={CIRCLE_Y} stroke={isShotB ? '#10b981' : '#f59e0b'} strokeWidth="1.5" />
                    <line x1={CIRCLE_X} y1={CIRCLE_Y - CIRCLE_R - 22} x2={CIRCLE_X} y2={CIRCLE_Y - CIRCLE_R - 5} stroke={isShotB ? '#10b981' : '#f59e0b'} strokeWidth="1.5" />
                    <line x1={CIRCLE_X} y1={CIRCLE_Y + CIRCLE_R + 5} x2={CIRCLE_X} y2={CIRCLE_Y + CIRCLE_R + 22} stroke={isShotB ? '#10b981' : '#f59e0b'} strokeWidth="1.5" />
                  </g>
                )}

                {/* -------------------------------------------------------------
                    CUT TRANSITION FLASH (EDITORIAL CUT)
                ------------------------------------------------------------- */}
                {isCut && (
                  <g id="matchcut-cut-screen">
                    <rect width="1920" height="1080" fill="#020617" />
                    <g transform="translate(960, 540)">
                      <rect x="-80" y="-35" width="160" height="70" rx="8" fill="#dc2626" stroke="#ffffff" strokeWidth="2.5" />
                      <text x="0" y="8" fill="#ffffff" fontSize="24" fontFamily="sans-serif" textAnchor="middle" fontWeight="black" letterSpacing="2">
                        CUT
                      </text>
                    </g>
                  </g>
                )}

                {/* -------------------------------------------------------------
                    MINIMAL TECHNICAL LABELS (ONLY IN TOP HUD)
                ------------------------------------------------------------- */}
                <g transform="translate(960, 70)">
                  {isShotA && phase === 'shot-a' && (
                    <g>
                      <rect x="-80" y="-20" width="160" height="40" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                      <text x="0" y="6" fill="#38bdf8" fontSize="15" fontFamily="monospace" textAnchor="middle" fontWeight="black" letterSpacing="1.5">
                        SHOT A
                      </text>
                    </g>
                  )}

                  {phase === 'match-element' && (
                    <g>
                      <rect x="-115" y="-20" width="230" height="40" rx="8" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                      <text x="0" y="6" fill="#f59e0b" fontSize="15" fontFamily="monospace" textAnchor="middle" fontWeight="black" letterSpacing="1.5">
                        MATCH ELEMENT
                      </text>
                    </g>
                  )}

                  {isCut && (
                    <g>
                      <rect x="-60" y="-20" width="120" height="40" rx="8" fill="#991b1b" stroke="#ef4444" strokeWidth="2" />
                      <text x="0" y="6" fill="#ffffff" fontSize="15" fontFamily="monospace" textAnchor="middle" fontWeight="black" letterSpacing="1.5">
                        CUT
                      </text>
                    </g>
                  )}

                  {isShotB && phase === 'shot-b' && (
                    <g>
                      <rect x="-80" y="-20" width="160" height="40" rx="8" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
                      <text x="0" y="6" fill="#10b981" fontSize="15" fontFamily="monospace" textAnchor="middle" fontWeight="black" letterSpacing="1.5">
                        SHOT B
                      </text>
                    </g>
                  )}

                  {(isBlend50 || (isShotB && state.matchCutProgress === 100 && !phase)) && (
                    <g>
                      <rect x="-95" y="-20" width="190" height="40" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                      <text x="0" y="6" fill="#38bdf8" fontSize="15" fontFamily="monospace" textAnchor="middle" fontWeight="black" letterSpacing="1.5">
                        MATCH CUT
                      </text>
                    </g>
                  )}
                </g>
              </>
            );
          })()}
        </g>
      )}

      {/* =========================================================================
          7. JUMP CUT
      ========================================================================= */}
      {concept === 'jump-cut' && (() => {
        const phase = state.jumpCutPhase || state.jumpCutState;
        const offsetFrames = state.jumpCutOffset ?? 48;
        const jumpRatio = Math.max(0.4, Math.min(2.5, offsetFrames / 48));
        const isShotA = phase === 'shot-a';
        const isCut = phase === 'cut';
        const isShotB = phase === 'shot-b';

        const deltaX = Math.round(180 * jumpRatio);
        const deltaY = Math.round(42 * jumpRatio);

        // Baseline Shot A ground & face anchor positions
        const baselineGroundY = groundContactY ?? (faceAnchorY + 358);
        const shotAX = isShotB ? faceAnchorX - deltaX : faceAnchorX;
        const shotAY = isShotB ? faceAnchorY - deltaY : faceAnchorY;
        const shotAGroundY = isShotB ? baselineGroundY - deltaY : baselineGroundY;
        const shotBGroundY = isShotB ? baselineGroundY : baselineGroundY + deltaY;

        return (
          <g id="demo-jump-cut">
            {/* -------------------------------------------------------------
                1. EDITORIAL HARD CUT TRANSITION SPLICE
            ------------------------------------------------------------- */}
            {isCut && (
              <g id="jumpcut-cut-splice">
                <rect width="1920" height="1080" fill="#020617" />
                <g transform="translate(960, 540)">
                  <rect x="-90" y="-36" width="180" height="72" rx="8" fill="#dc2626" stroke="#ffffff" strokeWidth="2.5" />
                  <text x="0" y="8" fill="#ffffff" fontSize="24" fontFamily="sans-serif" textAnchor="middle" fontWeight="black" letterSpacing="2">
                    HARD CUT
                  </text>
                </g>
              </g>
            )}

            {/* -------------------------------------------------------------
                2. SHOT A INITIAL BASELINE POSITION
            ------------------------------------------------------------- */}
            {isShotA && (
              <g id="jumpcut-shot-a">
                {/* Stable Floor Reference Ring Under Character */}
                <g transform={`translate(${shotAX}, ${shotAGroundY})`}>
                  <ellipse cx="0" cy="0" rx="96" ry="16" fill="none" stroke="#38bdf8" strokeWidth="1.6" strokeDasharray="6 4" opacity="0.85" />
                  <circle cx="0" cy="0" r="3" fill="#38bdf8" />
                  <rect x="-85" y="10" width="170" height="22" rx="4" fill="#090d16" stroke="#38bdf8" strokeWidth="1" opacity="0.92" />
                  <text x="0" y="25" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    T₁ POSITION · 00:01:14:00
                  </text>
                </g>
              </g>
            )}

            {/* -------------------------------------------------------------
                3. SHOT B JUMP DISCONTINUITY OVERLAYS
            ------------------------------------------------------------- */}
            {isShotB && (
              <g id="jumpcut-shot-b">
                {/* Ghost Outline of Shot A Position at T1 */}
                <g opacity="0.6" transform={`translate(${shotAX}, ${shotAGroundY})`}>
                  {/* Floor reference ellipse */}
                  <ellipse cx="0" cy="0" rx="90" ry="15" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
                  {/* Ghost character silhouette marker */}
                  <rect x="-50" y="-370" width="100" height="370" rx="14" fill="#1e293b" fillOpacity="0.3" stroke="#64748b" strokeWidth="1.8" strokeDasharray="6 4" />
                  <circle cx="0" cy="-320" r="32" fill="none" stroke="#64748b" strokeWidth="1.8" strokeDasharray="5 3" />
                  {/* Label */}
                  <rect x="-80" y="-405" width="160" height="22" rx="4" fill="#090d16" stroke="#64748b" strokeWidth="1" opacity="0.92" />
                  <text x="0" y="-390" fill="#cbd5e1" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    SHOT A (T₁ START POS)
                  </text>
                </g>

                {/* Spatial Jump Displacement Vector on Pavement */}
                <g id="jumpcut-vector">
                  <path
                    d={`M ${shotAX + 60} ${shotAGroundY} Q ${shotAX + deltaX * 0.5} ${shotAGroundY + 45} ${faceAnchorX - 40} ${shotBGroundY}`}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3.5"
                    strokeDasharray="8 5"
                  />
                  {/* Arrowhead */}
                  <polygon
                    points={`${faceAnchorX - 40},${shotBGroundY} ${faceAnchorX - 58},${shotBGroundY - 8} ${faceAnchorX - 52},${shotBGroundY + 7}`}
                    fill="#ef4444"
                  />

                  {/* Discontinuity Tag Badge midway along arc */}
                  <g transform={`translate(${(shotAX + faceAnchorX) / 2}, ${(shotAGroundY + shotBGroundY) / 2 + 40})`}>
                    <rect x="-120" y="-14" width="240" height="28" rx="6" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" opacity="0.95" />
                    <text x="0" y="4" fill="#fee2e2" fontSize="11" fontFamily="monospace" fontWeight="black" textAnchor="middle">
                      ⚠ TIME JUMP (+{offsetFrames} FRAMES)
                    </text>
                  </g>
                </g>

                {/* Shot B character floor anchor */}
                <g transform={`translate(${faceAnchorX}, ${shotBGroundY})`}>
                  <ellipse cx="0" cy="0" rx="105" ry="18" fill="none" stroke="#f87171" strokeWidth="1.8" opacity="0.85" />
                  <rect x="-85" y="10" width="170" height="22" rx="4" fill="#090d16" stroke="#f87171" strokeWidth="1" opacity="0.92" />
                  <text x="0" y="25" fill="#f87171" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    T₂ SHOT B · JUMPED FORWARD
                  </text>
                </g>
              </g>
            )}

            {/* -------------------------------------------------------------
                4. TOP HUD CENTER TECHNICAL LABELS
            ------------------------------------------------------------- */}
            <g transform="translate(960, 70)">
              {isShotA && (
                <g>
                  <rect x="-120" y="-20" width="240" height="40" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                  <text x="0" y="6" fill="#38bdf8" fontSize="15" fontFamily="monospace" textAnchor="middle" fontWeight="black" letterSpacing="1.5">
                    SHOT A (BASELINE)
                  </text>
                </g>
              )}

              {isCut && (
                <g>
                  <rect x="-65" y="-20" width="130" height="40" rx="8" fill="#991b1b" stroke="#ef4444" strokeWidth="2" />
                  <text x="0" y="6" fill="#ffffff" fontSize="15" fontFamily="monospace" textAnchor="middle" fontWeight="black" letterSpacing="1.5">
                    CUT
                  </text>
                </g>
              )}

              {isShotB && (
                <g>
                  <rect x="-175" y="-20" width="350" height="40" rx="8" fill="#450a0a" stroke="#ef4444" strokeWidth="2" />
                  <circle cx="-150" cy="0" r="5" fill="#ef4444" />
                  <text x="10" y="6" fill="#fee2e2" fontSize="14" fontFamily="monospace" textAnchor="middle" fontWeight="black" letterSpacing="1.2">
                    SHOT B · JUMP CUT DISCONTINUITY
                  </text>
                </g>
              )}
            </g>
          </g>
        );
      })()}

      {/* =========================================================================
          8. ESTABLISHING SHOT
      ========================================================================= */}
      {concept === 'establishing' && (() => {
        const shot = state.establishingShot ?? (state.establishingScale === 'wide' ? 'medium' : 'wide');
        const phase = state.establishingPhase ?? shot;
        const isCut = phase === 'cut';

        const isWide = shot === 'wide';
        const isMedium = shot === 'medium';
        const isCloseUp = shot === 'close-up';

        const activeColor = isWide
          ? '#38bdf8'
          : isMedium
          ? '#f59e0b'
          : '#10b981';

        const activeBgColor = isWide
          ? '#0c2340'
          : isMedium
          ? '#451a03'
          : '#064e3b';

        return (
          <g id="demo-establishing">
            {/* 1. TOP HUD STATUS BADGE */}
            <g transform="translate(960, 68)">
              {isCut ? (
                <g>
                  <rect
                    x="-140"
                    y="-22"
                    width="280"
                    height="44"
                    rx="8"
                    fill="#991b1b"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                  />
                  <text
                    x="0"
                    y="6"
                    fill="#ffffff"
                    fontSize="16"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fontWeight="black"
                    letterSpacing="2"
                  >
                    [ EDITORIAL CUT ]
                  </text>
                </g>
              ) : (
                <g>
                  <rect
                    x="-350"
                    y="-22"
                    width="700"
                    height="44"
                    rx="8"
                    fill={activeBgColor}
                    stroke={activeColor}
                    strokeWidth="2.5"
                  />
                  <circle cx="-320" cy="0" r="5" fill={activeColor} />
                  <text
                    x="0"
                    y="6"
                    fill="#ffffff"
                    fontSize="14"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fontWeight="black"
                    letterSpacing="1"
                  >
                    {isWide && '1. ESTABLISHING SHOT · WIDE (LOCATION & SPATIAL ANCHOR)'}
                    {isMedium && '2. ACTION SHOT · MEDIUM (CHARACTERS IN KNOWN SPACE)'}
                    {isCloseUp && '3. DETAIL SHOT · CLOSE-UP (EMOTIONAL FOCUS · LOCATION ROOTED)'}
                  </text>
                </g>
              )}
            </g>

            {/* 2. EDITORIAL CUT SPLICE CARD */}
            {isCut && (
              <g id="establishing-cut-overlay">
                <rect x="0" y="0" width="1920" height="1080" fill="#000000" fillOpacity="0.75" />
                <g transform="translate(960, 540)">
                  <rect
                    x="-200"
                    y="-45"
                    width="400"
                    height="90"
                    rx="10"
                    fill="#0b0f19"
                    stroke="#ef4444"
                    strokeWidth="3"
                  />
                  <text
                    x="0"
                    y="-8"
                    fill="#ef4444"
                    fontSize="22"
                    fontFamily="monospace"
                    fontWeight="black"
                    textAnchor="middle"
                    letterSpacing="3"
                  >
                    EDITORIAL CUT
                  </text>
                  <text
                    x="0"
                    y="22"
                    fill="#94a3b8"
                    fontSize="12"
                    fontFamily="monospace"
                    textAnchor="middle"
                    letterSpacing="1"
                  >
                    SPATIAL CONTINUITY TRANSITION
                  </text>
                </g>
              </g>
            )}

            {/* 3. RESTRAINED VIEWPORT SPATIAL TAGS & ANNOTATIONS */}
            {!isCut && (
              <g id="establishing-spatial-tags">
                {isWide && (
                  <>
                    {/* Location Entrance Tag */}
                    <g transform="translate(340, 480)">
                      <rect x="-130" y="-14" width="260" height="28" rx="6" fill="#090d16" fillOpacity="0.9" stroke="#38bdf8" strokeWidth="1.5" />
                      <text x="0" y="4" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                        LOCATION ENTRANCE · OBSERVATORY
                      </text>
                      <line x1="0" y1="14" x2="0" y2="45" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
                      <circle cx="0" cy="45" r="3" fill="#38bdf8" />
                    </g>

                    {/* Surrounding Scenery Tag */}
                    <g transform="translate(1540, 320)">
                      <rect x="-120" y="-14" width="240" height="28" rx="6" fill="#090d16" fillOpacity="0.9" stroke="#94a3b8" strokeWidth="1.5" />
                      <text x="0" y="4" fill="#cbd5e1" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                        SURROUNDING CITY CONTEXT
                      </text>
                    </g>

                    {/* Small Subject in Space Tag */}
                    <g transform={`translate(${faceAnchorX}, ${faceAnchorY - 55})`}>
                      <rect x="-90" y="-12" width="180" height="24" rx="5" fill="#090d16" fillOpacity="0.9" stroke="#38bdf8" strokeWidth="1.5" />
                      <text x="0" y="4" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                        SUBJECT IN ENVIRONMENT
                      </text>
                    </g>
                  </>
                )}

                {isMedium && (
                  <>
                    {/* Preserved Midground Context Tag */}
                    <g transform="translate(320, 420)">
                      <rect x="-130" y="-14" width="260" height="28" rx="6" fill="#090d16" fillOpacity="0.9" stroke="#f59e0b" strokeWidth="1.5" />
                      <text x="0" y="4" fill="#fbbf24" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                        RECOGNIZABLE MIDGROUND PORTAL
                      </text>
                    </g>

                    {/* Character Oriented Tag */}
                    <g transform={`translate(${faceAnchorX}, ${faceAnchorY - 95})`}>
                      <rect x="-120" y="-14" width="240" height="28" rx="6" fill="#090d16" fillOpacity="0.9" stroke="#f59e0b" strokeWidth="1.5" />
                      <text x="0" y="4" fill="#fbbf24" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                        ACTION FRAMING (MEDIUM SHOT)
                      </text>
                    </g>
                  </>
                )}

                {isCloseUp && (
                  <>
                    {/* Intimate Framing Tag */}
                    <g transform={`translate(${faceAnchorX}, ${faceAnchorY - 145})`}>
                      <rect x="-130" y="-14" width="260" height="28" rx="6" fill="#090d16" fillOpacity="0.9" stroke="#10b981" strokeWidth="1.5" />
                      <text x="0" y="4" fill="#34d399" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                        DETAIL & INTIMACY · LOCATION ANCHORED
                      </text>
                    </g>
                  </>
                )}
              </g>
            )}

            {/* 4. SEQUENCE PROGRESSION BAR (BOTTOM-CENTER) */}
            {!isCut && (
              <g id="establishing-sequence-tracker" transform="translate(960, 1020)">
                <rect
                  x="-280"
                  y="-18"
                  width="560"
                  height="36"
                  rx="18"
                  fill="#070c18"
                  fillOpacity="0.92"
                  stroke="#334155"
                  strokeWidth="1.5"
                />

                {/* Step 1: Wide */}
                <g transform="translate(-170, 0)">
                  <rect
                    x="-65"
                    y="-12"
                    width="130"
                    height="24"
                    rx="12"
                    fill={isWide ? '#0284c7' : '#0f172a'}
                    stroke={isWide ? '#38bdf8' : '#1e293b'}
                    strokeWidth={isWide ? 2 : 1}
                  />
                  <text
                    x="0"
                    y="4"
                    fill={isWide ? '#ffffff' : '#64748b'}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    1. WIDE
                  </text>
                </g>

                {/* Arrow 1 */}
                <text x="-90" y="4" fill="#475569" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  →
                </text>

                {/* Step 2: Medium */}
                <g transform="translate(0, 0)">
                  <rect
                    x="-65"
                    y="-12"
                    width="130"
                    height="24"
                    rx="12"
                    fill={isMedium ? '#d97706' : '#0f172a'}
                    stroke={isMedium ? '#f59e0b' : '#1e293b'}
                    strokeWidth={isMedium ? 2 : 1}
                  />
                  <text
                    x="0"
                    y="4"
                    fill={isMedium ? '#ffffff' : '#64748b'}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    2. MEDIUM
                  </text>
                </g>

                {/* Arrow 2 */}
                <text x="90" y="4" fill="#475569" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  →
                </text>

                {/* Step 3: Close-Up */}
                <g transform="translate(170, 0)">
                  <rect
                    x="-65"
                    y="-12"
                    width="130"
                    height="24"
                    rx="12"
                    fill={isCloseUp ? '#059669' : '#0f172a'}
                    stroke={isCloseUp ? '#10b981' : '#1e293b'}
                    strokeWidth={isCloseUp ? 2 : 1}
                  />
                  <text
                    x="0"
                    y="4"
                    fill={isCloseUp ? '#ffffff' : '#64748b'}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    3. CLOSE-UP
                  </text>
                </g>
              </g>
            )}
          </g>
        );
      })()}

      {/* =========================================================================
          9. MASTER SHOT
      ========================================================================= */}
      {concept === 'master-shot' && (() => {
        const isCoverage = state.masterView === 'coverage';
        const progress = state.masterProgress ?? 0;

        // Coordinates of characters in screen space
        // When in Coverage mode, camera is shifted by +320px
        const camShift = isCoverage ? 320 : 0;
        const char1ScreenX = 660 + camShift;
        const char2ScreenX = 1260 + camShift;

        return (
          <g id="demo-master-shot">
            {/* 1. TOP HUD STATUS BADGE */}
            <g transform="translate(960, 68)">
              <rect
                x="-360"
                y="-22"
                width="720"
                height="44"
                rx="8"
                fill={isCoverage ? '#451a03' : '#0c2340'}
                stroke={isCoverage ? '#f59e0b' : '#38bdf8'}
                strokeWidth="2.5"
              />
              <circle cx="-330" cy="0" r="5" fill={isCoverage ? '#f59e0b' : '#38bdf8'} />
              <text
                x="0"
                y="6"
                fill="#ffffff"
                fontSize="14"
                fontFamily="monospace"
                textAnchor="middle"
                fontWeight="black"
                letterSpacing="1"
              >
                {isCoverage
                  ? 'COVERAGE SHOT · CLOSER SELECTIVE VIEW (ACTOR A FOCUS · PARTIAL SCENE)'
                  : 'MASTER SHOT · CONTINUOUS SCENE COVERAGE (BOTH CHARACTERS VISIBLE)'}
              </text>
            </g>

            {/* 2. MAIN SCENE CHARACTER ANNOTATION TAGS */}
            <g id="master-shot-character-tags">
              {/* Actor A Tag */}
              <g transform={`translate(${char1ScreenX}, ${faceAnchorY - (isCoverage ? 120 : 70)})`}>
                <rect x="-70" y="-12" width="140" height="24" rx="5" fill="#090d16" fillOpacity="0.9" stroke="#38bdf8" strokeWidth="1.5" />
                <text x="0" y="4" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  {progress < 0.45 ? 'ACTOR A [SPEAKING]' : 'ACTOR A [LISTENING]'}
                </text>
              </g>

              {/* Actor B Tag (visible in Master Shot, pushed to side/offscreen in Coverage) */}
              {char2ScreenX < 1860 && (
                <g transform={`translate(${char2ScreenX}, ${faceAnchorY - (isCoverage ? 120 : 70)})`}>
                  <rect x="-70" y="-12" width="140" height="24" rx="5" fill="#090d16" fillOpacity="0.9" stroke="#22d3ee" strokeWidth="1.5" />
                  <text x="0" y="4" fill="#22d3ee" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    {progress >= 0.55 ? 'ACTOR B [SPEAKING]' : 'ACTOR B [LISTENING]'}
                  </text>
                </g>
              )}
            </g>

            {/* 3. MASTER SHOT ACTION BOUNDARY (when in Master view) */}
            {!isCoverage && (
              <g id="master-staging-envelope">
                <rect
                  x="240"
                  y="180"
                  width="1440"
                  height="720"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                  strokeDasharray="8 6"
                  opacity="0.5"
                  rx="12"
                />
                <text
                  x="960"
                  y="210"
                  fill="#7dd3fc"
                  fontSize="12"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                  letterSpacing="1"
                >
                  COMPLETE ACTION STAGING ENVELOPE · UNBROKEN GEOMETRY
                </text>
              </g>
            )}

            {/* 4. COVERAGE SHOT BOUNDARY INDICATION (when in Coverage view) */}
            {isCoverage && (
              <g id="coverage-crop-indicator">
                <rect
                  x="560"
                  y="160"
                  width="800"
                  height="760"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="10 6"
                  opacity="0.6"
                  rx="10"
                />
                <text
                  x="960"
                  y="190"
                  fill="#fcd34d"
                  fontSize="12"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                  letterSpacing="1"
                >
                  COVERAGE FRAME · SELECTIVE PERFORMANCE DETAIL
                </text>
              </g>
            )}

            {/* 5. UNOBTRUSIVE STAGING RADAR / CHARACTER POSITION INDICATOR (LOWER-LEFT) */}
            <g id="master-staging-radar" transform="translate(240, 890)">
              <rect
                x="-140"
                y="-48"
                width="280"
                height="96"
                rx="10"
                fill="#070c18"
                fillOpacity="0.94"
                stroke="#334155"
                strokeWidth="1.5"
              />
              <text
                x="0"
                y="-30"
                fill="#94a3b8"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
                letterSpacing="1"
              >
                STAGING RADAR · ACTOR POSITIONS
              </text>

              {/* Stage floor line */}
              <line x1="-110" y1="12" x2="110" y2="12" stroke="#475569" strokeWidth="2" />

              {/* Actor 1 marker on radar (world 660 mapped to stage at -48) */}
              <circle cx="-48" cy="12" r="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="-48" y="26" fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                [A]
              </text>

              {/* Actor 2 marker on radar (world 1260 mapped to stage at +48) */}
              <circle cx="48" cy="12" r="6" fill="#0891b2" stroke="#22d3ee" strokeWidth="1.5" />
              <text x="48" y="26" fill="#22d3ee" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                [B]
              </text>

              {/* Camera Framing Frustum Envelope on Radar */}
              {isCoverage ? (
                // Narrow coverage box over Actor A
                <rect
                  x="-75"
                  y="-15"
                  width="54"
                  height="35"
                  rx="4"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.8"
                  strokeDasharray="3 2"
                />
              ) : (
                // Full wide coverage box covering both actors
                <rect
                  x="-85"
                  y="-15"
                  width="170"
                  height="35"
                  rx="4"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                  strokeDasharray="4 3"
                />
              )}

              {/* Radar status caption */}
              <text
                x="0"
                y="-14"
                fill={isCoverage ? '#f59e0b' : '#38bdf8'}
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                {isCoverage ? 'CAMERA: CLOSE COVERAGE [A]' : 'CAMERA: MASTER TWO-SHOT [A + B]'}
              </text>
            </g>
          </g>
        );
      })()}

      {/* =========================================================================
          10. SCENE COVERAGE
      ========================================================================= */}
      {concept === 'coverage' && (
        <g id="demo-coverage">
          {/* Active Coverage Hierarchy Indicator */}
          <g transform="translate(960, 70)">
            <rect x="-330" y="-24" width="660" height="48" rx="8" fill="#0369a1" stroke="#38bdf8" strokeWidth="2" />
            <text x="0" y="6" fill="#ffffff" fontSize="15" fontFamily="sans-serif" textAnchor="middle" fontWeight="black">
              COVERAGE SETUP: {state.coverageShot.toUpperCase()} SHOT (Architectural Editing Option)
            </text>
          </g>

          {/* Framing Target HUD */}
          <rect x="680" y="260" width="560" height="520" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.6" />
          <text x="960" y="760" fill="#7dd3fc" fontSize="13" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
            CAMERA FIELD OF VIEW FOR {state.coverageShot.toUpperCase()}
          </text>
        </g>
      )}

      {/* =========================================================================
          11. REACTION SHOT
      ========================================================================= */}
      {concept === 'reaction-shot' && (() => {
        const isReaction = state.reactionView === 'reaction';
        const emotion = state.reactionEmotion || 'surprise';

        return (
          <g id="demo-reaction-shot">
            {/* Top HUD Status Badge */}
            <g transform="translate(960, 68)">
              <rect
                x="-360"
                y="-22"
                width="720"
                height="44"
                rx="8"
                fill={isReaction ? '#500724' : '#0c2340'}
                stroke={isReaction ? '#f43f5e' : '#38bdf8'}
                strokeWidth="2.5"
              />
              <circle cx="-330" cy="0" r="5" fill={isReaction ? '#f43f5e' : '#38bdf8'} />
              <text
                x="0"
                y="6"
                fill="#ffffff"
                fontSize="14"
                fontFamily="monospace"
                textAnchor="middle"
                fontWeight="black"
                letterSpacing="1"
              >
                {isReaction
                  ? 'REACTION SHOT · CLOSE-UP ON LISTENER (ACTOR B: SURPRISE)'
                  : 'ACTION SHOT · TWO-SHOT SETUP (ACTOR A SPEAKS · ACTOR B LISTENS)'}
              </text>
            </g>

            {/* In Action Shot: Two character tags and speech vector */}
            {!isReaction && (
              <g id="reaction-action-tags">
                {/* Actor A Tag */}
                <g transform={`translate(680, ${faceAnchorY - 90})`}>
                  <rect x="-70" y="-12" width="140" height="24" rx="5" fill="#090d16" fillOpacity="0.9" stroke="#38bdf8" strokeWidth="1.5" />
                  <text x="0" y="4" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    ACTOR A [SPEAKING]
                  </text>
                </g>

                {/* Actor B Tag */}
                <g transform={`translate(1240, ${faceAnchorY - 90})`}>
                  <rect x="-70" y="-12" width="140" height="24" rx="5" fill="#090d16" fillOpacity="0.9" stroke="#22d3ee" strokeWidth="1.5" />
                  <text x="0" y="4" fill="#22d3ee" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    ACTOR B [LISTENING]
                  </text>
                </g>

                {/* Speech Vector from A to B */}
                <path
                  d="M 760 520 L 1150 520"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  opacity="0.6"
                />
                <polygon points="1155,520 1145,515 1145,525" fill="#38bdf8" opacity="0.8" />
                <text x="955" y="505" fill="#7dd3fc" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  SPEECH / ACTION VECTOR →
                </text>
              </g>
            )}

            {/* In Reaction Shot: Close-up Emotional Reticle & Off-Screen Source Indicator */}
            {isReaction && (
              <g id="reaction-closeup-focus">
                {/* Subtle reticle corners around Actor B's face */}
                <g transform={`translate(${faceAnchorX}, ${faceAnchorY})`}>
                  <circle cx="0" cy="0" r="100" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.6" />
                  <circle cx="0" cy="0" r="5" fill="#f43f5e" />

                  {/* Corner framing brackets */}
                  <path d="M -130 -120 L -100 -120 M -130 -120 L -130 -90" stroke="#fb7185" strokeWidth="2.5" fill="none" />
                  <path d="M 130 -120 L 100 -120 M 130 -120 L 130 -90" stroke="#fb7185" strokeWidth="2.5" fill="none" />
                  <path d="M -130 120 L -100 120 M -130 120 L -130 90" stroke="#fb7185" strokeWidth="2.5" fill="none" />
                  <path d="M 130 120 L 100 120 M 130 120 L 130 90" stroke="#fb7185" strokeWidth="2.5" fill="none" />

                  {/* Reaction Tag Badge */}
                  <rect x="-110" y="-160" width="220" height="26" rx="6" fill="#090d16" fillOpacity="0.92" stroke="#f43f5e" strokeWidth="1.5" />
                  <text x="0" y="-143" fill="#fda4af" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="1">
                    ACTOR B · SURPRISE REACTION
                  </text>
                </g>

                {/* Off-screen Actor A prompt indicator */}
                <g transform="translate(180, 540)">
                  <rect x="-125" y="-16" width="250" height="32" rx="6" fill="#090d16" fillOpacity="0.92" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 3" />
                  <text x="0" y="4" fill="#7dd3fc" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    ← OFF-SCREEN: ACTOR A (DIALOGUE)
                  </text>
                </g>
              </g>
            )}
          </g>
        );
      })()}

      {/* =========================================================================
          12. EYE TRACE
      ========================================================================= */}
      {concept === 'eye-trace' && (() => {
        const pattern = state.eyeTracePattern || 'horizontal';
        const showGuide = state.eyeTraceShowGuide !== false;

        // Character Eye Anchor (Starting Point: Character Gaze)
        // Character is on the left, flipped facing right toward the focal object
        const startX = faceAnchorX + 22;
        const startY = faceAnchorY - 12;

        // Focal Object Destination Coordinates
        let targetX = 1380;
        let targetY = 460;
        let targetType: 'mid-beacon' | 'low-prop' | 'high-luminaire' = 'mid-beacon';

        if (pattern === 'diagonal') {
          targetX = 1380;
          targetY = 720;
          targetType = 'low-prop';
        } else if (pattern === 'triangle') {
          targetX = 1380;
          targetY = 250;
          targetType = 'high-luminaire';
        } else {
          targetX = 1380;
          targetY = 460;
          targetType = 'mid-beacon';
        }

        // Direction vector math for subtle trajectory guide
        const dx = targetX - startX;
        const dy = targetY - startY;
        const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

        const p1X = startX + dx * 0.38;
        const p1Y = startY + dy * 0.38;
        const p2X = startX + dx * 0.68;
        const p2Y = startY + dy * 0.68;

        return (
          <g id="demo-eye-trace">
            {/* 1. CLEARLY VISIBLE, CONTRASTING FOCAL OBJECT */}
            {targetType === 'low-prop' && (
              <g id="focal-object-low-prop">
                {/* Architectural Studio Pedestal */}
                <rect
                  x={targetX - 44}
                  y={targetY + 36}
                  width="88"
                  height={Math.max(80, (groundContactY || 860) - (targetY + 36))}
                  fill="#0f172a"
                  stroke="#334155"
                  strokeWidth="2"
                  rx="4"
                />
                <ellipse cx={targetX} cy={targetY + 36} rx="50" ry="12" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />

                {/* Narrative Prop: Illuminated Gold/Brass Artifact */}
                <g transform={`translate(${targetX}, ${targetY})`}>
                  <circle cx="0" cy="0" r="48" fill="#f59e0b" opacity="0.18" />
                  <rect x="-34" y="-22" width="68" height="44" rx="6" fill="#78350f" stroke="#f59e0b" strokeWidth="2.5" />
                  <rect x="-24" y="-14" width="48" height="28" rx="4" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" />
                  <circle cx="0" cy="0" r="8" fill="#fbbf24" />
                  <rect x="-4" y="-24" width="8" height="6" fill="#fde68a" />
                  <line x1="-30" y1="0" x2="-24" y2="0" stroke="#fde68a" strokeWidth="2" />
                  <line x1="24" y1="0" x2="30" y2="0" stroke="#fde68a" strokeWidth="2" />
                </g>
              </g>
            )}

            {targetType === 'mid-beacon' && (
              <g id="focal-object-mid-beacon">
                {/* Mid-level studio stand */}
                <line x1={targetX} y1={targetY + 40} x2={targetX} y2={(groundContactY || 860)} stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
                <line x1={targetX - 35} y1={(groundContactY || 860)} x2={targetX + 35} y2={(groundContactY || 860)} stroke="#334155" strokeWidth="6" strokeLinecap="round" />

                {/* Optical Beacon / Amber Lantern */}
                <g transform={`translate(${targetX}, ${targetY})`}>
                  <circle cx="0" cy="0" r="54" fill="#f59e0b" opacity="0.2" />
                  <circle cx="0" cy="0" r="38" fill="#0f172a" stroke="#f59e0b" strokeWidth="3" />
                  <circle cx="0" cy="0" r="28" fill="#78350f" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6 3" />
                  <circle cx="0" cy="0" r="14" fill="#fef08a" />
                  <line x1="-34" y1="0" x2="-26" y2="0" stroke="#ffffff" strokeWidth="2" />
                  <line x1="26" y1="0" x2="34" y2="0" stroke="#ffffff" strokeWidth="2" />
                  <line x1="0" y1="-34" x2="0" y2="-26" stroke="#ffffff" strokeWidth="2" />
                  <line x1="0" y1="26" x2="0" y2="34" stroke="#ffffff" strokeWidth="2" />
                </g>
              </g>
            )}

            {targetType === 'high-luminaire' && (
              <g id="focal-object-high-luminaire">
                {/* Overhead suspended mount */}
                <line x1={targetX} y1="0" x2={targetX} y2={targetY - 32} stroke="#334155" strokeWidth="6" />
                <rect x={targetX - 16} y={targetY - 36} width="32" height="8" rx="2" fill="#475569" />

                {/* Overhead luminaire */}
                <g transform={`translate(${targetX}, ${targetY})`}>
                  <polygon points="-60,10 60,10 80,90 -80,90" fill="#f59e0b" opacity="0.12" />
                  <path d="M -36 -24 L 36 -24 L 46 16 L -46 16 Z" fill="#0f172a" stroke="#f59e0b" strokeWidth="2.5" />
                  <ellipse cx="0" cy="16" rx="46" ry="12" fill="#78350f" stroke="#fbbf24" strokeWidth="2" />
                  <ellipse cx="0" cy="16" rx="28" ry="7" fill="#fef08a" />
                </g>
              </g>
            )}

            {/* 2. DESTINATION: FOCAL OBJECT IDENTIFICATION */}
            <g id="destination-reticle" transform={`translate(${targetX}, ${targetY})`}>
              {/* Subtle corner framing brackets */}
              <path d="M -44 -26 L -44 -44 L -26 -44" fill="none" stroke="#f59e0b" strokeWidth="2" />
              <path d="M 26 -44 L 44 -44 L 44 -26" fill="none" stroke="#f59e0b" strokeWidth="2" />
              <path d="M 44 26 L 44 44 L 26 44" fill="none" stroke="#f59e0b" strokeWidth="2" />
              <path d="M -26 44 L -44 44 L -44 26" fill="none" stroke="#f59e0b" strokeWidth="2" />

              {/* Destination Identification Badge */}
              <g transform="translate(0, 58)">
                <rect x="-95" y="-12" width="190" height="24" rx="4" fill="#090d16" stroke="#f59e0b" strokeWidth="1.2" opacity="0.95" />
                <text x="0" y="4" fill="#fde68a" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  DESTINATION · FOCAL OBJECT
                </text>
              </g>
            </g>

            {/* 3. STARTING POINT: CHARACTER / GAZE IDENTIFICATION */}
            <g id="start-gaze-reticle">
              {/* Subtle gaze focus ring around eyes */}
              <circle cx={startX} cy={startY} r="18" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="4 3" />
              <circle cx={startX} cy={startY} r="3.5" fill="#38bdf8" />

              {/* Starting Point Identification Badge */}
              <g transform={`translate(${startX - 20}, ${startY - 38})`}>
                <rect x="-95" y="-12" width="190" height="24" rx="4" fill="#090d16" stroke="#38bdf8" strokeWidth="1.2" opacity="0.95" />
                <text x="0" y="4" fill="#7dd3fc" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  START · CHARACTER / GAZE
                </text>
              </g>
            </g>

            {/* 4. SUBTLE DIRECTIONAL GUIDE (Thin & Unobtrusive) */}
            {showGuide && (
              <g id="directional-eye-trace-guide">
                {/* Thin dashed trajectory vector from character eyes to focal object */}
                <line
                  x1={startX}
                  y1={startY}
                  x2={targetX}
                  y2={targetY}
                  stroke="#c084fc"
                  strokeWidth="2"
                  strokeDasharray="7 5"
                  opacity="0.85"
                />

                {/* Directional Chevron 1 (38% along path) */}
                <g transform={`translate(${p1X}, ${p1Y}) rotate(${angleDeg})`}>
                  <polygon points="-8,-5 2,0 -8,5" fill="#e9d5ff" stroke="#a855f7" strokeWidth="1" />
                </g>

                {/* Directional Chevron 2 (68% along path) */}
                <g transform={`translate(${p2X}, ${p2Y}) rotate(${angleDeg})`}>
                  <polygon points="-8,-5 2,0 -8,5" fill="#e9d5ff" stroke="#a855f7" strokeWidth="1" />
                </g>

                {/* Mid-trajectory trajectory label */}
                <g transform={`translate(${(startX + targetX) / 2}, ${(startY + targetY) / 2 - 18})`}>
                  <rect x="-85" y="-11" width="170" height="22" rx="4" fill="#3b0764" stroke="#c084fc" strokeWidth="1" opacity="0.92" />
                  <text x="0" y="4" fill="#f3e8ff" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    EYE TRACE TRAJECTORY →
                  </text>
                </g>
              </g>
            )}

            {/* Top HUD Status Banner */}
            <g transform="translate(960, 56)">
              <rect x="-310" y="-18" width="620" height="36" rx="6" fill="#090d16" stroke="#c084fc" strokeWidth="1.2" opacity="0.92" />
              <text x="0" y="5" fill="#f3e8ff" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                EYE TRACE: Guiding Viewer Attention from Character Gaze to Focal Object
              </text>
            </g>
          </g>
        );
      })()}
    </g>
  );
};
