import React, { useState, useEffect } from 'react';
import { MasterCharacterSVG } from '../character/MasterCharacter';
import {
  getContinuousAtmosphere,
  getCycleProgressFromDate,
  AtmosphereLighting,
} from '../../utils/solarAtmosphere';

interface HomeIllustrationProps {
  onStartExploring: () => void;
}

export const HomeIllustration: React.FC<HomeIllustrationProps> = ({ onStartExploring }) => {
  // Current cycle progress derived directly from user's real device time (new Date())
  // Initial state calculated synchronously so first render matches current time immediately
  const [cycleProgress, setCycleProgress] = useState<number>(() =>
    getCycleProgressFromDate(new Date())
  );

  useEffect(() => {
    // Derive position directly from current timestamp: 1 real minute = 1 real minute
    const updateProgress = () => {
      setCycleProgress(getCycleProgressFromDate(new Date()));
    };

    // Immediate initial sync
    updateProgress();

    // 1-second interval ensures precision with zero accumulated drift
    const intervalId = window.setInterval(updateProgress, 1000);

    // Immediately recalculate on visibility change or window focus
    // (when page loads, refreshes, or returns from background tab/device wake)
    const handleVisibilityOrFocus = () => {
      if (!document.hidden) {
        updateProgress();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, []);

  // Compute atmospheric lighting based on current real-time continuous cycle progress
  const atmosphere: AtmosphereLighting = getContinuousAtmosphere(cycleProgress);

  // Pre-generate star positions (deterministic SVG elements)
  const stars = [
    { cx: 220, cy: 90, r: 1.6, opacity: 0.9 },
    { cx: 380, cy: 140, r: 1.2, opacity: 0.7 },
    { cx: 540, cy: 80, r: 2.0, opacity: 0.95 },
    { cx: 720, cy: 160, r: 1.4, opacity: 0.8 },
    { cx: 910, cy: 70, r: 1.8, opacity: 0.9 },
    { cx: 1080, cy: 120, r: 1.3, opacity: 0.75 },
    { cx: 1240, cy: 90, r: 2.2, opacity: 1.0 },
    { cx: 1420, cy: 150, r: 1.5, opacity: 0.8 },
    { cx: 1580, cy: 85, r: 1.7, opacity: 0.9 },
    { cx: 1750, cy: 110, r: 2.0, opacity: 0.85 },
    { cx: 1840, cy: 180, r: 1.4, opacity: 0.7 },
    { cx: 150, cy: 220, r: 1.5, opacity: 0.65 },
    { cx: 460, cy: 250, r: 1.8, opacity: 0.75 },
    { cx: 800, cy: 230, r: 1.2, opacity: 0.6 },
    { cx: 1150, cy: 260, r: 1.6, opacity: 0.7 },
    { cx: 1350, cy: 220, r: 2.1, opacity: 0.9 },
    { cx: 1650, cy: 260, r: 1.3, opacity: 0.7 },
    { cx: 310, cy: 60, r: 1.5, opacity: 0.85 },
    { cx: 620, cy: 110, r: 1.2, opacity: 0.8 },
    { cx: 990, cy: 140, r: 1.7, opacity: 0.85 },
    { cx: 1490, cy: 60, r: 1.9, opacity: 0.9 },
  ];

  return (
    <div
      className="relative w-full h-full min-h-[calc(100vh-2rem)] lg:min-h-screen overflow-hidden flex flex-col justify-between select-none transition-colors duration-1000"
      style={{ backgroundColor: atmosphere.skyMid }}
    >
      {/* Background SVG Scene with Dynamic Atmosphere */}
      <svg
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle cloud shadow filter */}
          <filter id="cloudShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow
              dx="0"
              dy="8"
              stdDeviation="4"
              floodColor={atmosphere.cloudShadowColor}
              floodOpacity={atmosphere.cloudShadowOpacity}
            />
          </filter>

          {/* Dynamic Sky Gradient */}
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1080" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={atmosphere.skyTop} />
            <stop offset="50%" stopColor={atmosphere.skyMid} />
            <stop offset="100%" stopColor={atmosphere.skyBottom} />
          </linearGradient>

          {/* Dynamic Cloud Gradient */}
          <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={atmosphere.cloudTop} />
            <stop offset="85%" stopColor={atmosphere.cloudMid} />
            <stop offset="100%" stopColor={atmosphere.cloudBottom} />
          </linearGradient>

          {/* Sun Radial Glow */}
          <radialGradient id="sunAtmosphereGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={atmosphere.sunColor} stopOpacity="1" />
            <stop offset="40%" stopColor={atmosphere.sunGlowColor} stopOpacity={atmosphere.sunGlowOpacity} />
            <stop offset="100%" stopColor={atmosphere.sunGlowColor} stopOpacity="0" />
          </radialGradient>

          {/* Moon Gradient */}
          <linearGradient id="moonGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          {/* Yellow cameraman fish skin */}
          <linearGradient id="yellowFishGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffd83b" />
            <stop offset="100%" stopColor="#f5b300" />
          </linearGradient>

          {/* Blue subject fish skin */}
          <linearGradient id="blueFishGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4bc5f8" />
            <stop offset="100%" stopColor="#1d97dc" />
          </linearGradient>
        </defs>

        {/* Sky Base */}
        <rect width="1920" height="1080" fill="url(#skyGrad)" />

        {/* Starry Night Sky Layer (fades in as night falls) */}
        {atmosphere.starsOpacity > 0.05 && (
          <g id="night-stars" opacity={atmosphere.starsOpacity}>
            {stars.map((star, idx) => (
              <circle
                key={idx}
                cx={star.cx}
                cy={star.cy}
                r={star.r}
                fill="#ffffff"
                opacity={star.opacity}
              />
            ))}
          </g>
        )}

        {/* Moon Element (visible during night, dusk, and early dawn) */}
        {atmosphere.moonVisible && (
          <g
            id="moon-group"
            transform={`translate(${atmosphere.moonX}, ${atmosphere.moonY})`}
            opacity={atmosphere.moonOpacity}
          >
            {/* Moon soft halo glow */}
            <circle cx="0" cy="0" r="60" fill="#93c5fd" opacity="0.15" />
            <circle cx="0" cy="0" r="45" fill="#e0f2fe" opacity="0.25" />
            {/* Moon body */}
            <circle cx="0" cy="0" r="32" fill="url(#moonGrad)" />
            {/* Subtle moon surface crater details */}
            <circle cx="-10" cy="-6" r="6" fill="#cbd5e1" opacity="0.45" />
            <circle cx="8" cy="10" r="8" fill="#cbd5e1" opacity="0.4" />
            <circle cx="12" cy="-8" r="4" fill="#cbd5e1" opacity="0.35" />
          </g>
        )}

        {/* Sun Element with Atmosphere Glow */}
        {atmosphere.sunVisible && (
          <g id="sun-group" opacity={atmosphere.sunOpacity}>
            {/* Atmospheric Corona Glow */}
            <circle
              cx={atmosphere.sunX}
              cy={atmosphere.sunY}
              r={atmosphere.sunRadius * 2.2}
              fill="url(#sunAtmosphereGlow)"
              opacity={atmosphere.sunGlowOpacity}
            />
            {/* Solar Disc */}
            <circle
              cx={atmosphere.sunX}
              cy={atmosphere.sunY}
              r={atmosphere.sunRadius}
              fill={atmosphere.sunColor}
            />
          </g>
        )}

        {/* Clouds with seamless right-to-left drift animation */}
        <style>{`
          @keyframes cloudDriftSlow {
            0% { transform: translateX(0px); }
            100% { transform: translateX(-1920px); }
          }
          @keyframes cloudDriftMed {
            0% { transform: translateX(0px); }
            100% { transform: translateX(-1920px); }
          }
          @keyframes cloudDriftFast {
            0% { transform: translateX(0px); }
            100% { transform: translateX(-1920px); }
          }

          .cloud-track-1 {
            animation: cloudDriftMed 78s linear infinite;
            transform-box: view-box;
            will-change: transform;
          }
          .cloud-track-2 {
            animation: cloudDriftSlow 102s linear infinite;
            transform-box: view-box;
            will-change: transform;
          }
          .cloud-track-3 {
            animation: cloudDriftFast 62s linear infinite;
            transform-box: view-box;
            will-change: transform;
          }

          @media (prefers-reduced-motion: reduce) {
            .cloud-track-1,
            .cloud-track-2,
            .cloud-track-3 {
              animation: none !important;
            }
          }
        `}</style>

        {/* Cloud 1 - Top Left Track (Drifting right to left) */}
        <g className="cloud-track-1" opacity={atmosphere.cloudOpacity}>
          <g transform="translate(140, 220)" filter="url(#cloudShadow)">
            <path
              d="M 40 70 
                 Q 20 70 15 50 
                 Q 10 25 35 20 
                 Q 50 -5 85 5 
                 Q 115 -15 145 10 
                 Q 175 10 185 35 
                 Q 200 45 195 70 Z"
              fill="url(#cloudGrad)"
            />
          </g>
          {/* Seamless loop twin */}
          <g transform="translate(2060, 220)" filter="url(#cloudShadow)">
            <path
              d="M 40 70 
                 Q 20 70 15 50 
                 Q 10 25 35 20 
                 Q 50 -5 85 5 
                 Q 115 -15 145 10 
                 Q 175 10 185 35 
                 Q 200 45 195 70 Z"
              fill="url(#cloudGrad)"
            />
          </g>
        </g>

        {/* Cloud 2 - Mid Left Track (Drifting right to left) */}
        <g className="cloud-track-2" opacity={atmosphere.cloudOpacity}>
          <g transform="translate(260, 360)" filter="url(#cloudShadow)">
            <path
              d="M 30 55 
                 Q 10 55 5 40 
                 Q 0 20 25 15 
                 Q 40 -5 70 2 
                 Q 95 -12 120 8 
                 Q 145 5 155 30 
                 Q 170 38 165 55 Z"
              fill="url(#cloudGrad)"
            />
          </g>
          {/* Seamless loop twin */}
          <g transform="translate(2180, 360)" filter="url(#cloudShadow)">
            <path
              d="M 30 55 
                 Q 10 55 5 40 
                 Q 0 20 25 15 
                 Q 40 -5 70 2 
                 Q 95 -12 120 8 
                 Q 145 5 155 30 
                 Q 170 38 165 55 Z"
              fill="url(#cloudGrad)"
            />
          </g>
        </g>

        {/* Cloud 3 - Top Right Track (Drifting right to left) */}
        <g className="cloud-track-3" opacity={atmosphere.cloudOpacity}>
          <g transform="translate(1720, 70)" filter="url(#cloudShadow)">
            <path
              d="M 30 55 
                 Q 10 55 5 40 
                 Q 0 20 25 15 
                 Q 45 -8 75 0 
                 Q 100 -12 130 5 
                 Q 155 5 165 30 
                 Q 180 38 175 55 Z"
              fill="url(#cloudGrad)"
            />
          </g>
          {/* Seamless loop twin */}
          <g transform="translate(3640, 70)" filter="url(#cloudShadow)">
            <path
              d="M 30 55 
                 Q 10 55 5 40 
                 Q 0 20 25 15 
                 Q 45 -8 75 0 
                 Q 100 -12 130 5 
                 Q 155 5 165 30 
                 Q 180 38 175 55 Z"
              fill="url(#cloudGrad)"
            />
          </g>
        </g>

        {/* ================= BACKGROUND CITY BUILDINGS ================= */}
        {/* Deep navy/purple-blue skyscrapers */}
        <g id="skyline-back">
          {/* Building 1 (Far Left) */}
          <rect x="180" y="380" width="130" height="700" fill="#242852" />
          <line x1="245" y1="380" x2="245" y2="340" stroke="#242852" strokeWidth="4" />
          {/* Windows */}
          <rect x="200" y="420" width="14" height="22" fill="#5b64a4" opacity="0.7" />
          <rect x="235" y="420" width="14" height="22" fill="#5b64a4" opacity="0.7" />
          <rect x="270" y="420" width="14" height="22" fill="#5b64a4" opacity="0.7" />
          <rect x="200" y="465" width="14" height="22" fill="#5b64a4" opacity="0.7" />
          <rect x="235" y="465" width="14" height="22" fill="#5b64a4" opacity="0.7" />
          <rect x="270" y="465" width="14" height="22" fill="#5b64a4" opacity="0.7" />

          {/* Building 2 */}
          <rect x="285" y="460" width="105" height="620" fill="#1b1e42" />

          {/* Central skyline clusters */}
          <rect x="870" y="560" width="100" height="520" fill="#1b2046" />
          <rect x="895" y="600" width="14" height="18" fill="#4b5588" opacity="0.6" />
          <rect x="930" y="600" width="14" height="18" fill="#4b5588" opacity="0.6" />
          <rect x="895" y="640" width="14" height="18" fill="#4b5588" opacity="0.6" />
          <rect x="930" y="640" width="14" height="18" fill="#4b5588" opacity="0.6" />

          {/* Center Tall Tower */}
          <rect x="1160" y="550" width="150" height="530" fill="#2d2850" />
          <rect x="1185" y="600" width="18" height="22" fill="#5b538c" opacity="0.7" />
          <rect x="1220" y="600" width="18" height="22" fill="#5b538c" opacity="0.7" />
          <rect x="1255" y="600" width="18" height="22" fill="#5b538c" opacity="0.7" />
          <rect x="1185" y="650" width="18" height="22" fill="#5b538c" opacity="0.7" />
          <rect x="1220" y="650" width="18" height="22" fill="#5b538c" opacity="0.7" />

          {/* Spire Tower in middle */}
          <rect x="1015" y="620" width="45" height="460" fill="#2b4372" />
          <line x1="1037" y1="620" x2="1037" y2="585" stroke="#2b4372" strokeWidth="3" />

          {/* Tower 4 Right */}
          <rect x="1540" y="440" width="180" height="640" fill="#232a52" />
          <rect x="1565" y="500" width="18" height="24" fill="#57639c" opacity="0.6" />
          <rect x="1605" y="500" width="18" height="24" fill="#57639c" opacity="0.6" />
          <rect x="1645" y="500" width="18" height="24" fill="#57639c" opacity="0.6" />
          <rect x="1685" y="500" width="18" height="24" fill="#57639c" opacity="0.6" />
          <rect x="1565" y="545" width="18" height="24" fill="#57639c" opacity="0.6" />
          <rect x="1605" y="545" width="18" height="24" fill="#57639c" opacity="0.6" />
          <rect x="1645" y="545" width="18" height="24" fill="#57639c" opacity="0.6" />
          <rect x="1685" y="545" width="18" height="24" fill="#57639c" opacity="0.6" />

          {/* Rightmost building */}
          <rect x="1780" y="490" width="140" height="590" fill="#1a2040" />

          {/* Night Warm Window Illuminations Overlay */}
          {atmosphere.windowGlowOpacity > 0.05 && (
            <g id="skyline-window-lights" opacity={atmosphere.windowGlowOpacity}>
              {/* Building 1 warm windows */}
              <rect x="200" y="420" width="14" height="22" fill={atmosphere.windowGlowColor} opacity="0.85" />
              <rect x="235" y="420" width="14" height="22" fill={atmosphere.windowGlowColor} opacity="0.8" />
              <rect x="270" y="465" width="14" height="22" fill={atmosphere.windowGlowColor} opacity="0.9" />
              {/* Central tower warm lights */}
              <rect x="895" y="600" width="14" height="18" fill={atmosphere.windowGlowColor} opacity="0.85" />
              <rect x="930" y="640" width="14" height="18" fill={atmosphere.windowGlowColor} opacity="0.75" />
              <rect x="1185" y="600" width="18" height="22" fill={atmosphere.windowGlowColor} opacity="0.9" />
              <rect x="1255" y="600" width="18" height="22" fill={atmosphere.windowGlowColor} opacity="0.85" />
              <rect x="1220" y="650" width="18" height="22" fill={atmosphere.windowGlowColor} opacity="0.8" />
              {/* Tower 4 warm windows */}
              <rect x="1565" y="500" width="18" height="24" fill={atmosphere.windowGlowColor} opacity="0.8" />
              <rect x="1645" y="500" width="18" height="24" fill={atmosphere.windowGlowColor} opacity="0.85" />
              <rect x="1605" y="545" width="18" height="24" fill={atmosphere.windowGlowColor} opacity="0.9" />
              <rect x="1685" y="545" width="18" height="24" fill={atmosphere.windowGlowColor} opacity="0.75" />
            </g>
          )}
        </g>

        {/* ================= MIDGROUND ROOFTOPS & ARCHITECTURE ================= */}
        <g id="rooftops-mid">
          {/* Lush green bushes behind yellow building */}
          <circle cx="1060" cy="770" r="55" fill="#278241" />
          <circle cx="1090" cy="780" r="45" fill="#309c50" />
          <circle cx="1580" cy="790" r="60" fill="#278241" />
          <circle cx="1620" cy="800" r="48" fill="#309c50" />

          {/* Warm ochre/yellow building complex */}
          {/* Main yellow building structure */}
          <polygon points="720,710 1200,790 1200,1080 720,1080" fill="#e5aa37" stroke="#222" strokeWidth="3" />
          
          {/* Roof penthouse / ladder access box */}
          <polygon points="840,685 915,700 915,780 840,760" fill="#f0be4d" stroke="#222" strokeWidth="2.5" />
          <polygon points="915,700 970,690 970,770 915,780" fill="#d9992a" stroke="#222" strokeWidth="2.5" />
          {/* Roof ladder */}
          <line x1="860" y1="675" x2="860" y2="735" stroke="#222" strokeWidth="2.5" />
          <line x1="875" y1="675" x2="875" y2="735" stroke="#222" strokeWidth="2.5" />
          <line x1="860" y1="685" x2="875" y2="685" stroke="#222" strokeWidth="2" />
          <line x1="860" y1="700" x2="875" y2="700" stroke="#222" strokeWidth="2" />
          <line x1="860" y1="715" x2="875" y2="715" stroke="#222" strokeWidth="2" />
          <line x1="860" y1="730" x2="875" y2="730" stroke="#222" strokeWidth="2" />

          {/* Roof coping/cornice */}
          <polygon points="690,705 1200,785 1200,805 690,725" fill="#f3be4e" stroke="#222" strokeWidth="3" />

          {/* Mid yellow building windows */}
          <rect x="880" y="805" width="28" height="38" fill="#222" stroke="#222" strokeWidth="2" />
          <rect x="884" y="809" width="20" height="30" fill="#71869e" />

          <rect x="1140" y="865" width="38" height="42" fill="#222" stroke="#222" strokeWidth="2" />
          <rect x="1144" y="869" width="30" height="34" fill="#3c526d" />

          {/* Left building section behind yellow cameraman */}
          <polygon points="350,680 730,735 730,1080 350,1080" fill="#e0a334" stroke="#222" strokeWidth="3" />
          <polygon points="340,670 730,725 730,745 340,690" fill="#f3be4e" stroke="#222" strokeWidth="3" />

          {/* Windows in left building */}
          {/* Big industrial grid window 1 */}
          <rect x="365" y="735" width="130" height="190" fill="#2b313d" stroke="#222" strokeWidth="3" />
          <rect x="372" y="742" width="54" height="85" fill="#6f8194" />
          <rect x="434" y="742" width="54" height="85" fill="#6f8194" />
          <rect x="372" y="834" width="54" height="84" fill="#58687a" />
          <rect x="434" y="834" width="54" height="84" fill="#58687a" />

          {/* Big industrial window 2 */}
          <rect x="525" y="760" width="105" height="190" fill="#2b313d" stroke="#222" strokeWidth="3" />
          <rect x="532" y="767" width="42" height="85" fill="#6f8194" />
          <rect x="581" y="767" width="42" height="85" fill="#6f8194" />
          <rect x="532" y="859" width="42" height="84" fill="#58687a" />
          <rect x="581" y="859" width="42" height="84" fill="#58687a" />

          {/* Big industrial window 3 */}
          <rect x="660" y="780" width="85" height="190" fill="#2b313d" stroke="#222" strokeWidth="3" />
          <rect x="667" y="787" width="70" height="85" fill="#6f8194" />
          <rect x="667" y="879" width="70" height="84" fill="#58687a" />

          {/* Right building behind blue character */}
          <polygon points="1600,740 1920,775 1920,1080 1600,1080" fill="#e0a334" stroke="#222" strokeWidth="3" />
          <polygon points="1590,730 1920,765 1920,785 1590,750" fill="#f3be4e" stroke="#222" strokeWidth="3" />
          <rect x="1640" y="785" width="24" height="34" fill="#222" stroke="#222" strokeWidth="2" />
          <rect x="1644" y="789" width="16" height="26" fill="#6d7f94" />

          {/* Night / Dusk cozy interior window glows in midground buildings */}
          {atmosphere.windowGlowOpacity > 0.05 && (
            <g id="midground-window-glows" opacity={atmosphere.windowGlowOpacity}>
              <rect x="884" y="809" width="20" height="30" fill={atmosphere.windowGlowColor} opacity="0.85" />
              <rect x="1144" y="869" width="30" height="34" fill={atmosphere.windowGlowColor} opacity="0.8" />
              <rect x="372" y="742" width="54" height="85" fill={atmosphere.windowGlowColor} opacity="0.65" />
              <rect x="581" y="767" width="42" height="85" fill={atmosphere.windowGlowColor} opacity="0.7" />
              <rect x="532" y="859" width="42" height="84" fill={atmosphere.windowGlowColor} opacity="0.75" />
              <rect x="667" y="787" width="70" height="85" fill={atmosphere.windowGlowColor} opacity="0.6" />
              <rect x="1644" y="789" width="16" height="26" fill={atmosphere.windowGlowColor} opacity="0.85" />
            </g>
          )}

          {/* Atmospheric Environmental Tint on Architecture */}
          {atmosphere.buildingWarmOpacity > 0.02 && (
            <rect
              x="300"
              y="650"
              width="1620"
              height="430"
              fill={atmosphere.buildingWarmTint}
              opacity={atmosphere.buildingWarmOpacity}
              style={{ mixBlendMode: 'color' }}
            />
          )}
        </g>

        {/* Foreground Rooftop Wall / Parapet (Where both characters stand on the same ground plane) */}
        <g id="rooftop-foreground">
          {/* Main dark navy parapet block */}
          <polygon points="0,866 1920,905 1920,1080 0,1080" fill="#0d1b2a" stroke="#050b14" strokeWidth="4" />
          {/* Ledge top cap */}
          <polygon points="0,856 1920,895 1920,915 0,876" fill="#1b2e4b" stroke="#050b14" strokeWidth="3" />
          {/* Parapet front trim line */}
          <line x1="0" y1="894" x2="1920" y2="933" stroke="#2a4269" strokeWidth="3" />
        </g>

        {/* Dynamic Ground Shadows (matching sun angle and elevation) */}
        {atmosphere.isDay && (
          <g id="dynamic-ground-shadows" opacity={atmosphere.shadowOpacity}>
            {/* Yellow cameraman shadow on roof cap */}
            <ellipse
              cx={510 + (995 - atmosphere.sunX) * 0.04}
              cy={860}
              rx={atmosphere.shadowLength * 1.4}
              ry="10"
              fill="#060c16"
              opacity="0.6"
            />
            {/* Blue character shadow on roof cap */}
            <ellipse
              cx={1502 + (995 - atmosphere.sunX) * 0.035}
              cy={880}
              rx={atmosphere.shadowLength * 1.3}
              ry="10"
              fill="#060c16"
              opacity="0.6"
            />
          </g>
        )}

        {/* ================= LEFT CHARACTER: YELLOW CAMERAMAN FISH ================= */}
        {/* Grounded firmly on the rooftop surface aligned with the rooftop perspective */}
        <g id="yellow-cameraman" transform="translate(0, -84)">
          {/* Legs & Pants */}
          {/* Unified Pelvis / Hip base connecting directly beneath black waist section */}
          <path
            d="M 460 762
               L 530 775
               C 536 790 535 802 522 812
               C 505 818 494 814 488 805
               C 476 814 462 805 455 785
               Z"
            fill="#153678"
            stroke="#111"
            strokeWidth="4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Back leg (shadowed navy tone in deeper perspective) */}
          <g id="yellow-cameraman-back-leg">
            <path
              d="M 530 775
                 C 550 805 572 828 574 842
                 C 576 852 568 875 558 895
                 L 528 895
                 C 536 875 540 852 538 848
                 C 535 830 508 812 488 805
                 Z"
              fill="#102b5e"
              stroke="#111"
              strokeWidth="4"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Back Foot (Flipper Shoe) resting firmly on rooftop surface */}
            <path
              d="M 526 895
                 C 524 888 532 878 544 876
                 C 560 873 574 882 580 892
                 C 582 896 580 900 574 900
                 L 528 900
                 C 525 900 525 897 526 895
                 Z"
              fill="#0a1a36"
              stroke="#111"
              strokeWidth="3.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </g>

          {/* Front leg (primary bright navy tone, anatomically grounded) */}
          <g id="yellow-cameraman-front-leg">
            <path
              d="M 458 780
                 C 455 808 450 838 450 855
                 C 450 872 454 892 458 934
                 L 494 934
                 C 488 895 484 872 484 855
                 C 484 838 496 812 498 800
                 C 496 790 480 782 458 780
                 Z"
              fill="#1b4294"
              stroke="#111"
              strokeWidth="4"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Front Foot (Flipper Shoe) resting visibly flat on the rooftop ledge */}
            <path
              d="M 454 934
                 C 450 924 456 910 472 908
                 C 490 906 504 916 512 928
                 C 515 934 514 940 505 940
                 L 456 940
                 C 452 940 452 936 454 934
                 Z"
              fill="#0f2654"
              stroke="#111"
              strokeWidth="3.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </g>

          {/* Yellow Fish Body (Cameraman) */}
          <g id="yellow-cameraman-torso">
            {/* Main torso path */}
            <path
              d="M 420 730
                 C 400 680 395 620 420 540
                 C 450 440 540 420 600 450
                 C 640 470 660 510 650 560
                 C 640 610 620 670 600 710
                 C 580 750 520 760 480 755
                 Z"
              fill="url(#yellowFishGrad)"
              stroke="#111"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Belly highlight / fish volume */}
            <path
              d="M 435 710
                 C 420 660 415 620 435 560
                 C 455 500 500 470 540 460
                 C 490 490 460 550 450 630
                 C 445 670 450 695 460 715
                 Z"
              fill="#ffe875"
              opacity="0.6"
            />
          </g>

          {/* Cameraman Black Belt / Waist section */}
          <path
            d="M 450 740 C 490 750 540 755 590 735 L 595 765 C 545 780 485 775 445 760 Z"
            fill="#181c24"
            stroke="#111"
            strokeWidth="3.5"
          />

          {/* Fish dorsal fin (top) */}
          <path
            d="M 490 435
               C 500 390 530 375 550 370
               C 555 385 550 410 535 430
               Z"
            fill="#e5a700"
            stroke="#111"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Yellow fish big expressive eye (concentrating through viewfinder) */}
          <ellipse cx="585" cy="495" rx="26" ry="32" fill="#fff" stroke="#111" strokeWidth="4" />
          <ellipse cx="594" cy="495" rx="14" ry="17" fill="#111" />
          <circle cx="598" cy="490" r="4.5" fill="#fff" />
          {/* Eyebrow / focusing brow */}
          <path d="M 565 470 C 585 465 605 472 615 480" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" />

          {/* Camera Operator Headphones */}
          <path
            d="M 525 435 C 555 420 595 430 620 460"
            fill="none"
            stroke="#222"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Ear cup */}
          <rect x="520" y="470" width="22" height="38" rx="8" fill="#1e293b" stroke="#111" strokeWidth="3" />
          <rect x="525" y="475" width="12" height="28" rx="4" fill="#475569" />

          {/* Professional Cinema Camera (Held by Yellow Cameraman) */}
          {/* Matte box / Sunhood */}
          <polygon points="680,480 760,450 760,570 680,540" fill="#1e2430" stroke="#111" strokeWidth="4" />
          <polygon points="685,490 750,465 750,555 685,530" fill="#0f131a" />

          {/* Camera main body */}
          <rect x="590" y="500" width="100" height="95" rx="8" fill="#2d3748" stroke="#111" strokeWidth="4" />
          {/* Battery pack on rear */}
          <rect x="560" y="525" width="35" height="60" rx="4" fill="#1a202c" stroke="#111" strokeWidth="3.5" />
          {/* Top handle */}
          <path d="M 605 500 L 605 470 L 675 470 L 675 500" fill="none" stroke="#111" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 605 500 L 605 470 L 675 470 L 675 500" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Cinema lens barrel */}
          <polygon points="675,532 725,536 725,566 675,570" fill="#282f3d" stroke="#111" strokeWidth="3" />
          {/* Focus rings */}
          <line x1="690" y1="534" x2="690" y2="568" stroke="#0ea5e9" strokeWidth="3" />
          <line x1="705" y1="535" x2="705" y2="567" stroke="#111" strokeWidth="2.5" />
          {/* Lens Front Hood */}
          <polygon points="725,530 750,524 750,578 725,572" fill="#181c24" stroke="#111" strokeWidth="3.5" />
          {/* Glass glare */}
          <ellipse cx="748" cy="551" rx="2" ry="24" fill="#38bdf8" opacity="0.8" />

          {/* Front arm & hand wrapping camera */}
          <path
            d="M 525 625 C 555 650 610 660 645 640 L 660 600"
            fill="none"
            stroke="#111"
            strokeWidth="28"
            strokeLinecap="round"
          />
          <path
            d="M 525 625 C 555 650 610 660 645 640 L 660 600"
            fill="none"
            stroke="#ffd83b"
            strokeWidth="20"
            strokeLinecap="round"
          />
          {/* Fingers clutching lens */}
          <circle cx="670" cy="590" r="8" fill="#ffd83b" stroke="#111" strokeWidth="2.5" />
          <circle cx="682" cy="585" r="7.5" fill="#ffd83b" stroke="#111" strokeWidth="2.5" />
          <circle cx="692" cy="578" r="7" fill="#ffd83b" stroke="#111" strokeWidth="2.5" />
        </g>

        {/* ================= RIGHT CHARACTER: BLUE FISH HERO ACTOR (MASTER REFERENCE) ================= */}
        <MasterCharacterSVG x={1462.5 + 40} y={525 - 10} />

        {/* Overall Atmosphere Ambient Tint Overlay (Soft warm light at sunrise/sunset, deep moonlit glaze at night) */}
        {atmosphere.ambientTintOpacity > 0.02 && (
          <rect
            width="1920"
            height="1080"
            fill={atmosphere.ambientTint}
            opacity={atmosphere.ambientTintOpacity}
            style={{ mixBlendMode: 'color' }}
          />
        )}
      </svg>

      {/* Foreground Hero Content (Centered Title, Subtitle, and Button) */}
      <div className="relative z-10 flex flex-col items-center justify-start pt-16 md:pt-20 lg:pt-24 px-6 text-center select-none pointer-events-auto">
        {/* Yellow Radiating Spark Lines: \ | / */}
        <div className="flex items-end justify-center gap-3 mb-2">
          {/* Left angled ray */}
          <div className="w-1.5 h-7 bg-[#ffd83b] rounded-full transform -rotate-30" />
          {/* Center vertical ray */}
          <div className="w-1.5 h-9 bg-[#ffd83b] rounded-full mb-1" />
          {/* Right angled ray */}
          <div className="w-1.5 h-7 bg-[#ffd83b] rounded-full transform rotate-30" />
        </div>

        {/* Main Title: F CAM */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-white tracking-tight drop-shadow-sm font-sans">
          F CAM
        </h1>

        {/* Tagline */}
        <p className="mt-3 text-lg sm:text-xl md:text-2xl font-semibold text-white/90 max-w-2xl tracking-wide drop-shadow-xs">
          See. Adjust. Understand.
        </p>

        {/* CTA Button: Start Exploring → */}
        <div className="mt-7">
          <button
            type="button"
            onClick={onStartExploring}
            className="group inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-[#1873ea] hover:bg-[#1365d4] active:scale-98 text-white text-lg font-bold rounded-xl border border-blue-400/40 shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
          >
            <span>Start Exploring</span>
            <span className="text-xl transform group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
