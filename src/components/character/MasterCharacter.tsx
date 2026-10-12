/**
 * Master Character SVG Component
 * Canonical vector asset matching the Home page reference character.
 */
import React from 'react';

export interface MasterCharacterSVGProps {
  x?: number;
  y?: number;
  scale?: number;
  className?: string;
}

export const MasterCharacterSVG: React.FC<MasterCharacterSVGProps> = ({
  x = 0,
  y = 0,
  scale = 1.0,
  className = '',
}) => {
  return (
    <g
      id="fcam-canonical-character"
      transform={`translate(${x}, ${y}) scale(${scale})`}
      className={className}
    >
      <defs>
        <linearGradient id="canonicalBlueFishGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4bc5f8" />
          <stop offset="100%" stopColor="#1d97dc" />
        </linearGradient>
      </defs>

      {/* Blue legs & feet (anatomical cartoon construction with defined joints and grounded soles) */}
      {/* Left leg and foot flipper */}
      <g id="blue-character-left-leg">
        <path
          d="M -24 240
             C -24 270 -23 298 -23 315
             C -23 328 -24 336 -24 336
             C -28 338 -38 346 -37 354
             C -36 360 -35 362 -32 362
             L 8 362
             C 14 362 16 354 11 346
             C 7 340 3 336 -3 336
             C -2 336 -1 328 -1 315
             C -1 298 0 270 0 240
             Z"
          fill="#38bdf8"
          stroke="#111"
          strokeWidth={4}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Subtle ankle joint definition */}
        <path
          d="M -19 338 C -14 342 -9 342 -5 338"
          fill="none"
          stroke="#111"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      </g>

      {/* Right leg and foot flipper */}
      <g id="blue-character-right-leg">
        <path
          d="M 36 240
             C 36 270 37 298 37 315
             C 37 328 38 336 39 336
             C 35 338 25 346 26 354
             C 27 360 28 362 31 362
             L 71 362
             C 77 362 79 354 74 346
             C 70 340 66 336 60 336
             C 60 336 60 328 60 315
             C 60 298 60 270 60 240
             Z"
          fill="#38bdf8"
          stroke="#111"
          strokeWidth={4}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Subtle ankle joint definition */}
        <path
          d="M 43 338 C 48 342 53 342 57 338"
          fill="none"
          stroke="#111"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      </g>

      {/* Red/coral swim shorts (covers tops of legs naturally) */}
      <path
        d="M -47.5 200 C -12.5 195 57.5 195 87.5 200 L 97.5 270 C 67.5 280 32.5 280 17.5 265 C 2.5 280 -32.5 280 -57.5 270 Z"
        fill="#f85151"
        stroke="#111"
        strokeWidth={4.5}
      />
      {/* Shorts pocket / seam */}
      <path d="M -32.5 215 C -17.5 240 -17.5 255 -27.5 265" stroke="#b91c1c" strokeWidth={3} fill="none" />
      <path d="M 72.5 215 C 57.5 240 57.5 255 67.5 265" stroke="#b91c1c" strokeWidth={3} fill="none" />

      {/* White T-shirt (pure crisp white) */}
      <path
        d="M -42.5 110 C -12.5 105 37.5 105 67.5 110 L 92.5 210 C 57.5 215 -32.5 215 -62.5 210 Z"
        fill="#ffffff"
        stroke="#111"
        strokeWidth={4.5}
      />

      {/* Left & Right forearms (drawn under sleeves) */}
      <path
        d="M -57.5 155 C -62.5 185 -52.5 205 -42.5 210"
        fill="none"
        stroke="#38bdf8"
        strokeWidth={16}
        strokeLinecap="round"
      />
      <path
        d="M 87.5 155 C 92.5 185 82.5 205 72.5 210"
        fill="none"
        stroke="#38bdf8"
        strokeWidth={16}
        strokeLinecap="round"
      />

      {/* Left sleeve (dark outline) */}
      <path
        d="M -42.5 110 L -67.5 150 L -42.5 165 L -32.5 130 Z"
        fill="#ffffff"
        stroke="#111"
        strokeWidth={4}
      />

      {/* Right sleeve (matching dark outline) */}
      <path
        d="M 67.5 110 L 102.5 150 L 77.5 165 L 62.5 130 Z"
        fill="#ffffff"
        stroke="#111"
        strokeWidth={4}
      />

      {/* Crew neck collar */}
      <path d="M -7.5 107 C 12.5 120 32.5 120 47.5 107" stroke="#111" strokeWidth={3.5} fill="none" />

      {/* Dorsal Fin on back of head */}
      <path
        d="M 62.5 5 C 102.5 25 122.5 95 92.5 145 C 77.5 125 67.5 85 62.5 45 Z"
        fill="#0284c7"
        stroke="#111"
        strokeWidth={4}
      />

      {/* Head & Body (Blue Fish) */}
      <path
        d="M -42.5 35 C -52.5 -25 -17.5 -55 22.5 -55 C 67.5 -55 87.5 -10 82.5 55 C 77.5 95 67.5 110 62.5 115 L -37.5 115 C -42.5 95 -37.5 65 -42.5 35 Z"
        fill="url(#canonicalBlueFishGrad)"
        stroke="#111"
        strokeWidth={4.5}
      />

      {/* Dark blue freckles on back of head */}
      <circle cx={57.5} cy={-10} r={3.5} fill="#0369a1" />
      <circle cx={67.5} cy={5} r={4.5} fill="#0369a1" />
      <circle cx={52.5} cy={20} r={3} fill="#0369a1" />
      <circle cx={69.5} cy={35} r={4} fill="#0369a1" />

      {/* Deadpan half-lidded eyes */}
      {/* Left eye */}
      <g>
        <circle cx={-17.5} cy={0} r={16} fill="#ffffff" stroke="#111" strokeWidth={3.5} />
        <circle cx={-20.5} cy={3} r={6} fill="#111" />
        <path
          d="M -33.5 -3 C -27.5 3 -7.5 3 -1.5 -3 L -1.5 -15 L -33.5 -15 Z"
          fill="#38bdf8"
          stroke="#111"
          strokeWidth={3.5}
        />
      </g>

      {/* Right eye */}
      <g>
        <circle cx={17.5} cy={0} r={16} fill="#ffffff" stroke="#111" strokeWidth={3.5} />
        <circle cx={13.5} cy={3} r={6} fill="#111" />
        <path
          d="M 1.5 -3 C 7.5 3 27.5 3 33.5 -3 L 33.5 -15 L 1.5 -15 Z"
          fill="#38bdf8"
          stroke="#111"
          strokeWidth={3.5}
        />
      </g>

      {/* Big pink fish lips (deadpan / skeptical) */}
      <path
        d="M -62.5 55 C -37.5 45 -2.5 45 22.5 55 C 2.5 80 -42.5 80 -62.5 55 Z"
        fill="#fb7185"
        stroke="#111"
        strokeWidth={4}
      />
      <line x1={-52.5} y1={60} x2={12.5} y2={60} stroke="#be123c" strokeWidth={3} />
    </g>
  );
};
