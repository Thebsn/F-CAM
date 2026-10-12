import React, { useState } from 'react';
import { CameraPOVView } from '../scene/CameraPOVView';
import { ParameterControl } from '../common/ParameterControl';
import { TechnicalResult } from '../common/TechnicalResult';
import { PresetButton } from '../common/PresetButton';
import { ToolWorkspaceLayout } from '../layout/ToolWorkspaceLayout';
import { LightingPattern, DistanceUnit } from '../../types/cinematography';
import { kelvinToRgb, convertDistance, convertToMeters } from '../../utils/calculations';

interface PatternData {
  id: LightingPattern;
  label: string;
  keyAngle: number;
  fillAngle: number;
  rimAngle: number;
  distanceM: number;
  keyIntensity: number;
  fillIntensity: number;
  rimIntensity: number;
  ratio: string;
  description: string;
}

const LIGHTING_PATTERNS: PatternData[] = [
  {
    id: 'rembrandt',
    label: 'Rembrandt',
    keyAngle: -45,
    fillAngle: 40,
    rimAngle: 135,
    distanceM: 2.2,
    keyIntensity: 85,
    fillIntensity: 35,
    rimIntensity: 65,
    ratio: '4:1 (2 stops)',
    description: 'Iconic illuminated triangle on shadow cheek beneath eye, 45° key.',
  },
  {
    id: 'loop',
    label: 'Loop',
    keyAngle: -35,
    fillAngle: 35,
    rimAngle: 140,
    distanceM: 2.4,
    keyIntensity: 80,
    fillIntensity: 45,
    rimIntensity: 50,
    ratio: '3:1 (1.5 stops)',
    description: 'Small distinct shadow of nose creating loop downward toward mouth corner.',
  },
  {
    id: 'butterfly',
    label: 'Butterfly (Paramount)',
    keyAngle: 0,
    fillAngle: 25,
    rimAngle: -150,
    distanceM: 2.0,
    keyIntensity: 90,
    fillIntensity: 50,
    rimIntensity: 70,
    ratio: '2:1 (1 stop)',
    description: 'High frontal key creating butterfly shadow directly under nose.',
  },
  {
    id: 'split',
    label: 'Split',
    keyAngle: -85,
    fillAngle: 45,
    rimAngle: 130,
    distanceM: 2.1,
    keyIntensity: 95,
    fillIntensity: 15,
    rimIntensity: 60,
    ratio: '8:1 (3 stops)',
    description: 'Hard 90° side light carving subject face exactly in half between light and shadow.',
  },
  {
    id: 'broad',
    label: 'Broad',
    keyAngle: -30,
    fillAngle: 45,
    rimAngle: 140,
    distanceM: 2.5,
    keyIntensity: 80,
    fillIntensity: 45,
    rimIntensity: 40,
    ratio: '3:1 (1.5 stops)',
    description: 'Key illuminates the broad side of the face turned toward the camera.',
  },
  {
    id: 'short',
    label: 'Short',
    keyAngle: -60,
    fillAngle: 35,
    rimAngle: 135,
    distanceM: 2.3,
    keyIntensity: 85,
    fillIntensity: 25,
    rimIntensity: 75,
    ratio: '5:1 (2.3 stops)',
    description: 'Key illuminates side turned away from lens; sculpted, slimming, cinematic.',
  },
];

export const LightingSection: React.FC = () => {
  const [pattern, setPattern] = useState<LightingPattern>('rembrandt');
  const [keyIntensity, setKeyIntensity] = useState<number>(85);
  const [fillIntensity, setFillIntensity] = useState<number>(35);
  const [rimIntensity, setRimIntensity] = useState<number>(65);
  const [lightDistanceM, setLightDistanceM] = useState<number>(2.2);
  const [fillDistanceM, setFillDistanceM] = useState<number>(2.5);
  const [rimDistanceM, setRimDistanceM] = useState<number>(2.0);
  const [kelvin, setKelvin] = useState<number>(5600);
  const [unit, setUnit] = useState<DistanceUnit>('m');

  const faceAnchorX = 960;
  const faceAnchorY = 410;

  // Directional Light Angles (degrees relative to subject)
  const [keyAngleDeg, setKeyAngleDeg] = useState<number>(-45);
  const [fillAngleDeg, setFillAngleDeg] = useState<number>(40);
  const [rimAngleDeg, setRimAngleDeg] = useState<number>(135);

  // Free Coordinates in 1920x1080 workspace
  const [keyPos, setKeyPos] = useState<{ x: number; y: number }>(() => {
    const distPx = 2.2 * 160;
    const rad = ((-45 - 90) * Math.PI) / 180;
    return { x: Math.round(960 + distPx * Math.cos(rad)), y: Math.round(410 + distPx * Math.sin(rad) * 0.85) };
  });

  const [fillPos, setFillPos] = useState<{ x: number; y: number }>(() => {
    const distPx = 2.5 * 160;
    const rad = ((40 - 90) * Math.PI) / 180;
    return { x: Math.round(960 + distPx * Math.cos(rad)), y: Math.round(410 + distPx * Math.sin(rad) * 0.85) };
  });

  const [rimPos, setRimPos] = useState<{ x: number; y: number }>(() => {
    const distPx = 2.0 * 160;
    const rad = ((135 - 90) * Math.PI) / 180;
    return { x: Math.round(960 + distPx * Math.cos(rad)), y: Math.round(410 + distPx * Math.sin(rad) * 0.85) };
  });

  const [keyRotationDeg, setKeyRotationDeg] = useState<number | undefined>(undefined);
  const [fillRotationDeg, setFillRotationDeg] = useState<number | undefined>(undefined);
  const [rimRotationDeg, setRimRotationDeg] = useState<number | undefined>(undefined);

  const [selectedLight, setSelectedLight] = useState<'key' | 'fill' | 'rim'>('key');

  const handleSelectPattern = (pat: PatternData) => {
    setPattern(pat.id);
    setKeyIntensity(pat.keyIntensity);
    setFillIntensity(pat.fillIntensity);
    setRimIntensity(pat.rimIntensity);
    setLightDistanceM(pat.distanceM);
    setKeyAngleDeg(pat.keyAngle);
    setFillAngleDeg(pat.fillAngle);
    setRimAngleDeg(pat.rimAngle);

    // Initial arrangement for preset without constraining subsequent movement
    const keyPx = pat.distanceM * 160;
    const keyRad = ((pat.keyAngle - 90) * Math.PI) / 180;
    const kx = Math.round(faceAnchorX + keyPx * Math.cos(keyRad));
    const ky = Math.round(faceAnchorY + keyPx * Math.sin(keyRad) * 0.85);
    setKeyPos({ x: kx, y: ky });
    let kRot = Math.round((Math.atan2(faceAnchorY - ky, faceAnchorX - kx) * 180) / Math.PI);
    if (kRot < 0) kRot += 360;
    setKeyRotationDeg(kRot);

    const fillPx = 2.5 * 160;
    const fillRad = ((pat.fillAngle - 90) * Math.PI) / 180;
    const fx = Math.round(faceAnchorX + fillPx * Math.cos(fillRad));
    const fy = Math.round(faceAnchorY + fillPx * Math.sin(fillRad) * 0.85);
    setFillPos({ x: fx, y: fy });
    let fRot = Math.round((Math.atan2(faceAnchorY - fy, faceAnchorX - fx) * 180) / Math.PI);
    if (fRot < 0) fRot += 360;
    setFillRotationDeg(fRot);

    const rimPx = 2.0 * 160;
    const rimRad = ((pat.rimAngle - 90) * Math.PI) / 180;
    const rx = Math.round(faceAnchorX + rimPx * Math.cos(rimRad));
    const ry = Math.round(faceAnchorY + rimPx * Math.sin(rimRad) * 0.85);
    setRimPos({ x: rx, y: ry });
    let rRot = Math.round((Math.atan2(faceAnchorY - ry, faceAnchorX - rx) * 180) / Math.PI);
    if (rRot < 0) rRot += 360;
    setRimRotationDeg(rRot);
  };

  const handleKeyLightChange = (data: { x: number; y: number; distanceM: number; angleDeg: number; rotationDeg: number }) => {
    setKeyPos({ x: data.x, y: data.y });
    setLightDistanceM(data.distanceM);
    setKeyAngleDeg(data.angleDeg);
    setKeyRotationDeg(data.rotationDeg);
  };

  const handleFillLightChange = (data: { x: number; y: number; distanceM: number; angleDeg: number; rotationDeg: number }) => {
    setFillPos({ x: data.x, y: data.y });
    setFillDistanceM(data.distanceM);
    setFillAngleDeg(data.angleDeg);
    setFillRotationDeg(data.rotationDeg);
  };

  const handleRimLightChange = (data: { x: number; y: number; distanceM: number; angleDeg: number; rotationDeg: number }) => {
    setRimPos({ x: data.x, y: data.y });
    setRimDistanceM(data.distanceM);
    setRimAngleDeg(data.angleDeg);
    setRimRotationDeg(data.rotationDeg);
  };

  const handleKeyLightDrag = (distM: number, angleDeg: number) => {
    setLightDistanceM(distM);
    setKeyAngleDeg(angleDeg);
  };

  const handleFillLightDrag = (angleDeg: number) => {
    setFillAngleDeg(angleDeg);
  };

  const handleRimLightDrag = (angleDeg: number) => {
    setRimAngleDeg(angleDeg);
  };

  // Slider distance updates move the corresponding light radially
  const handleKeyDistanceSliderChange = (newDistM: number) => {
    setLightDistanceM(newDistM);
    const dx = keyPos.x - faceAnchorX;
    const dy = keyPos.y - faceAnchorY;
    const curLen = Math.sqrt(dx * dx + dy * dy);
    if (curLen > 1) {
      const targetPx = newDistM * 160;
      setKeyPos({
        x: Math.round(faceAnchorX + (dx / curLen) * targetPx),
        y: Math.round(faceAnchorY + (dy / curLen) * targetPx),
      });
    }
  };

  const handleFillDistanceSliderChange = (newDistM: number) => {
    setFillDistanceM(newDistM);
    const dx = fillPos.x - faceAnchorX;
    const dy = fillPos.y - faceAnchorY;
    const curLen = Math.sqrt(dx * dx + dy * dy);
    if (curLen > 1) {
      const targetPx = newDistM * 160;
      setFillPos({
        x: Math.round(faceAnchorX + (dx / curLen) * targetPx),
        y: Math.round(faceAnchorY + (dy / curLen) * targetPx),
      });
    }
  };

  const handleRimDistanceSliderChange = (newDistM: number) => {
    setRimDistanceM(newDistM);
    const dx = rimPos.x - faceAnchorX;
    const dy = rimPos.y - faceAnchorY;
    const curLen = Math.sqrt(dx * dx + dy * dy);
    if (curLen > 1) {
      const targetPx = newDistM * 160;
      setRimPos({
        x: Math.round(faceAnchorX + (dx / curLen) * targetPx),
        y: Math.round(faceAnchorY + (dy / curLen) * targetPx),
      });
    }
  };

  // Lighting ratio calculation (Key + Fill) : Fill with physical distance falloff
  const distanceFactor = Math.pow(2.2 / Math.max(0.8, lightDistanceM), 1.2);
  const effectiveKey = keyIntensity * distanceFactor;
  const fillDistanceFactor = Math.pow(2.5 / Math.max(0.8, fillDistanceM), 1.1);
  const effectiveFill = fillIntensity * fillDistanceFactor;
  const safeFill = Math.max(1, effectiveFill);
  const ratioRaw = (effectiveKey + safeFill) / safeFill;
  const ratioStops = Math.max(0, Math.log2(ratioRaw)).toFixed(1);

  const activePat = LIGHTING_PATTERNS.find((p) => p.id === pattern) || LIGHTING_PATTERNS[0];
  const kelvinRgb = kelvinToRgb(kelvin);

  return (
    <ToolWorkspaceLayout
      title="Lighting"
      subtitle="Three-point lighting, classic portrait patterns, lighting ratios, and color temperature"
      visualization={
        <CameraPOVView
          lightingPattern={pattern}
          keyIntensity={keyIntensity}
          fillIntensity={fillIntensity}
          rimIntensity={rimIntensity}
          lightKelvin={kelvin}
          lightDistanceM={lightDistanceM}
          fillDistanceM={fillDistanceM}
          rimDistanceM={rimDistanceM}
          keyAngleDeg={keyAngleDeg}
          fillAngleDeg={fillAngleDeg}
          rimAngleDeg={rimAngleDeg}
          keyPos={keyPos}
          fillPos={fillPos}
          rimPos={rimPos}
          keyRotationDeg={keyRotationDeg}
          fillRotationDeg={fillRotationDeg}
          rimRotationDeg={rimRotationDeg}
          selectedLight={selectedLight}
          onSelectLight={setSelectedLight}
          isLightingInteractive={true}
          isStudioLighting={true}
          onKeyLightChange={handleKeyLightChange}
          onFillLightChange={handleFillLightChange}
          onRimLightChange={handleRimLightChange}
          onKeyLightDrag={handleKeyLightDrag}
          onFillLightDrag={handleFillLightDrag}
          onRimLightDrag={handleRimLightDrag}
          customOverlayText={`${activePat.label} · Ratio ${ratioRaw.toFixed(1)}:1 (${ratioStops} stops) · ${kelvin}K`}
        />
      }
      results={
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <TechnicalResult
            label="Lighting Pattern"
            value={activePat.label}
            subtext={activePat.description}
            highlight
          />
          <TechnicalResult
            label="Contrast Ratio"
            value={`${ratioRaw.toFixed(1)} : 1`}
            unit={`Δ ${ratioStops} stops`}
            subtext={ratioRaw > 6 ? 'High-key contrast' : ratioRaw < 3 ? 'Low-key fill' : 'Natural balanced'}
          />
          <TechnicalResult
            label="Key Light Distance"
            value={convertDistance(lightDistanceM, unit).toFixed(2)}
            unit={unit}
            subtext={`Inverse sq: ${Math.round(keyIntensity / (lightDistanceM * lightDistanceM))} lx`}
          />
          <TechnicalResult
            label="Color Temp"
            value={`${kelvin}K`}
            subtext={kelvin < 4000 ? 'Tungsten' : kelvin > 6500 ? 'Daylight sky' : 'Standard 5600K'}
          />
        </div>
      }
      controls={
        <div className="space-y-4">
          {/* Lighting Patterns Presets */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Standard Cinematography Lighting Setups
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {LIGHTING_PATTERNS.map((pat) => (
                <PresetButton
                  key={pat.id}
                  label={pat.label}
                  sublabel={pat.ratio}
                  active={pattern === pat.id}
                  onClick={() => handleSelectPattern(pat)}
                />
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Key & Fill */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3.5">
              <ParameterControl
                label="Key Light Intensity"
                value={keyIntensity}
                min={0}
                max={100}
                step={1}
                unit="%"
                onChange={setKeyIntensity}
                description="Primary modeling light source"
              />
              <ParameterControl
                label="Fill Light Intensity"
                value={fillIntensity}
                min={0}
                max={100}
                step={1}
                unit="%"
                onChange={setFillIntensity}
                description="Shadow contrast control"
              />
            </div>

            {/* Rim & Throw Distance */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3.5">
              <ParameterControl
                label="Rim / Back Light"
                value={rimIntensity}
                min={0}
                max={100}
                step={1}
                unit="%"
                onChange={setRimIntensity}
                description="Edge hair light for silhouette separation"
              />
              <ParameterControl
                label="Key Light Distance"
                value={parseFloat(convertDistance(lightDistanceM, unit).toFixed(2))}
                min={convertDistance(0.5, unit)}
                max={convertDistance(10, unit)}
                step={0.1}
                onChange={(val) => handleKeyDistanceSliderChange(convertToMeters(val, unit))}
                currentDistanceUnit={unit}
                distanceUnits={['m', 'cm', 'mm', 'ft', 'in']}
                onDistanceUnitChange={setUnit}
                description="Key stand throw distance"
              />
              <ParameterControl
                label="Fill Light Distance"
                value={parseFloat(convertDistance(fillDistanceM, unit).toFixed(2))}
                min={convertDistance(0.5, unit)}
                max={convertDistance(10, unit)}
                step={0.1}
                onChange={(val) => handleFillDistanceSliderChange(convertToMeters(val, unit))}
                currentDistanceUnit={unit}
                distanceUnits={['m', 'cm', 'mm', 'ft', 'in']}
                onDistanceUnitChange={setUnit}
                description="Fill stand throw distance"
              />
              <ParameterControl
                label="Rim Light Distance"
                value={parseFloat(convertDistance(rimDistanceM, unit).toFixed(2))}
                min={convertDistance(0.5, unit)}
                max={convertDistance(10, unit)}
                step={0.1}
                onChange={(val) => handleRimDistanceSliderChange(convertToMeters(val, unit))}
                currentDistanceUnit={unit}
                distanceUnits={['m', 'cm', 'mm', 'ft', 'in']}
                onDistanceUnitChange={setUnit}
                description="Rim stand throw distance"
              />
            </div>

            {/* Kelvin & Spectrum */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3.5">
              <ParameterControl
                label="Kelvin Color Temperature"
                value={kelvin}
                min={2000}
                max={10000}
                step={100}
                unit="K"
                onChange={setKelvin}
                description="2000K (Candle) to 10000K (Blue Sky)"
              />
              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Emitter Color</span>
                <div className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full border border-white/20 shadow-xs"
                    style={{ backgroundColor: kelvinRgb.hex }}
                  />
                  <span className="text-xs font-mono text-slate-300 uppercase">{kelvinRgb.hex}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
};
