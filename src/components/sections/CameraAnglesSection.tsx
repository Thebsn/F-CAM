import React, { useState } from 'react';
import { CameraPOVView } from '../scene/CameraPOVView';
import { ParameterControl } from '../common/ParameterControl';
import { TechnicalResult } from '../common/TechnicalResult';
import { PresetButton } from '../common/PresetButton';
import { ToolWorkspaceLayout } from '../layout/ToolWorkspaceLayout';
import { CameraAngle, DistanceUnit } from '../../types/cinematography';
import { convertDistance, convertToMeters } from '../../utils/calculations';

interface AnglePresetData {
  id: CameraAngle;
  label: string;
  sublabel: string;
  heightM: number;
  pitchDeg: number;
  rollDeg: number;
  description: string;
}

const ANGLE_PRESETS: AnglePresetData[] = [
  {
    id: 'eye-level',
    label: 'Eye Level',
    sublabel: '0° Neutral',
    heightM: 1.65,
    pitchDeg: 0,
    rollDeg: 0,
    description: 'Human eye height; creates empathy, equality and direct emotional connection.',
  },
  {
    id: 'low-angle',
    label: 'Low Angle',
    sublabel: '-22° Heroic',
    heightM: 0.8,
    pitchDeg: -22,
    rollDeg: 0,
    description: 'Camera placed below subject looking up; conveys power, dominance or authority.',
  },
  {
    id: 'high-angle',
    label: 'High Angle',
    sublabel: '+24° Vulnerable',
    heightM: 2.8,
    pitchDeg: 24,
    rollDeg: 0,
    description: 'Camera placed above subject looking down; conveys vulnerability, isolation or helplessness.',
  },
  {
    id: 'birds-eye',
    label: "Bird's Eye",
    sublabel: '+65° Aerial',
    heightM: 6.0,
    pitchDeg: 65,
    rollDeg: 0,
    description: 'Extreme high angle survey; reveals geographic context, patterns, or fate.',
  },
  {
    id: 'worms-eye',
    label: "Worm's Eye",
    sublabel: '-50° Ground',
    heightM: 0.15,
    pitchDeg: -50,
    rollDeg: 0,
    description: 'Extreme low ground-level angle looking sharply up; exaggerates scale and majesty.',
  },
  {
    id: 'dutch-angle',
    label: 'Dutch Angle',
    sublabel: 'Roll 18° Canted',
    heightM: 1.65,
    pitchDeg: 0,
    rollDeg: 18,
    description: 'Canted or tilted roll axis; produces psychological unease, disorientation, or delirium.',
  },
  {
    id: 'overhead',
    label: 'Overhead',
    sublabel: '+80° Plan',
    heightM: 4.5,
    pitchDeg: 80,
    rollDeg: 0,
    description: 'Looking directly down (90° plan view); clinical, graphic, or detached viewpoint.',
  },
  {
    id: 'ground-level',
    label: 'Ground Level',
    sublabel: 'Floor Track',
    heightM: 0.25,
    pitchDeg: -12,
    rollDeg: 0,
    description: 'Camera placed directly on the floor; emphasizes footsteps and physical tactile action.',
  },
];

export const CameraAnglesSection: React.FC = () => {
  const [selectedAngle, setSelectedAngle] = useState<CameraAngle>('eye-level');
  const [cameraHeightM, setCameraHeightM] = useState<number>(1.65);
  const [pitchDeg, setPitchDeg] = useState<number>(0);
  const [rollDeg, setRollDeg] = useState<number>(0);
  const [distanceM, setDistanceM] = useState<number>(3.0);
  const [unit, setUnit] = useState<DistanceUnit>('m');

  const handleSelectPreset = (preset: AnglePresetData) => {
    setSelectedAngle(preset.id);
    setCameraHeightM(preset.heightM);
    setPitchDeg(preset.pitchDeg);
    setRollDeg(preset.rollDeg);
  };

  const currentPreset = ANGLE_PRESETS.find((p) => p.id === selectedAngle) || ANGLE_PRESETS[0];

  return (
    <ToolWorkspaceLayout
      title="Camera Angles"
      subtitle="Vertical angle, camera height, canted tilt, and psychological perspective"
      visualization={
        <CameraPOVView
          cameraAngle={selectedAngle}
          customPitchDeg={pitchDeg}
          customRollDeg={rollDeg}
          distanceM={distanceM}
          customHeightM={cameraHeightM}
          customOverlayText={`${currentPreset.label} · Pitch ${pitchDeg}° · Height ${convertDistance(cameraHeightM, unit).toFixed(2)}${unit}`}
        />
      }
      results={
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <TechnicalResult
            label="Selected Angle"
            value={currentPreset.label}
            subtext={currentPreset.description}
            highlight
          />
          <TechnicalResult
            label="Vertical Pitch Angle"
            value={`${pitchDeg >= 0 ? '+' : ''}${pitchDeg}°`}
            subtext={pitchDeg > 0 ? 'Looking downward' : pitchDeg < 0 ? 'Looking upward' : 'Level with horizon'}
          />
          <TechnicalResult
            label="Dutch Roll Axis"
            value={`${rollDeg}°`}
            subtext={rollDeg !== 0 ? 'Canted / Off-kilter axis' : 'Strictly horizontal'}
          />
          <TechnicalResult
            label="Camera Lens Height"
            value={convertDistance(cameraHeightM, unit).toFixed(2)}
            unit={unit}
            subtext={`Distance: ${convertDistance(distanceM, unit).toFixed(2)}${unit}`}
          />
        </div>
      }
      controls={
        <div className="space-y-4">
          {/* Angle Presets Grid */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Standard Cinematography Camera Angles
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ANGLE_PRESETS.map((preset) => (
                <PresetButton
                  key={preset.id}
                  label={preset.label}
                  sublabel={preset.sublabel}
                  active={selectedAngle === preset.id}
                  onClick={() => handleSelectPreset(preset)}
                />
              ))}
            </div>
          </div>

          {/* Numerical Sliders & Inputs */}
          <div className="space-y-3.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <ParameterControl
              label="Camera Height"
              value={parseFloat(convertDistance(cameraHeightM, unit).toFixed(2))}
              min={convertDistance(0.1, unit)}
              max={convertDistance(10, unit)}
              step={unit === 'm' || unit === 'ft' ? 0.05 : 5}
              onChange={(val) => setCameraHeightM(convertToMeters(val, unit))}
              currentDistanceUnit={unit}
              distanceUnits={['m', 'cm', 'mm', 'ft', 'in']}
              onDistanceUnitChange={setUnit}
              description="Tripod / crane elevation from ground"
            />

            <ParameterControl
              label="Vertical Pitch"
              value={pitchDeg}
              min={-80}
              max={85}
              step={1}
              unit="°"
              onChange={setPitchDeg}
              description="Tilt up (-) or down (+)"
            />

            <ParameterControl
              label="Dutch Roll"
              value={rollDeg}
              min={-45}
              max={45}
              step={1}
              unit="°"
              onChange={setRollDeg}
              description="Horizontal canted rotation"
            />
          </div>
        </div>
      }
    />
  );
};

