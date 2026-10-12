import React, { useState } from 'react';
import { CameraPOVView } from '../scene/CameraPOVView';
import { ParameterControl } from '../common/ParameterControl';
import { TechnicalResult } from '../common/TechnicalResult';
import { Toggle } from '../common/PresetButton';
import { ToolWorkspaceLayout } from '../layout/ToolWorkspaceLayout';
import { calculateEV, shutterAngleToSpeed, formatShutterSpeed } from '../../utils/calculations';

const ISO_PRESETS = [100, 200, 400, 800, 1600, 3200, 6400];
const ND_PRESETS = [
  { label: 'Clear', stops: 0 },
  { label: 'ND 0.3 (1 stop)', stops: 1 },
  { label: 'ND 0.6 (2 stops)', stops: 2 },
  { label: 'ND 0.9 (3 stops)', stops: 3 },
  { label: 'ND 1.2 (4 stops)', stops: 4 },
  { label: 'ND 1.8 (6 stops)', stops: 6 },
];

export const ExposureSection: React.FC = () => {
  const [aperture, setAperture] = useState<number>(2.8);
  const [iso, setIso] = useState<number>(400);
  const [fps] = useState<number>(24);
  const [shutterAngle, setShutterAngle] = useState<number>(180);
  const [ndStops, setNdStops] = useState<number>(0);
  const [showFalseColor, setShowFalseColor] = useState<boolean>(false);

  // Derived shutter speed in seconds
  const shutterSpeedSec = shutterAngleToSpeed(shutterAngle, fps);

  // Effective EV accounting for ND filters
  const rawEv = calculateEV(aperture, shutterSpeedSec, iso);
  const effectiveEv = rawEv - ndStops;

  // Exposure status: centered around EV 12
  const stopsDiff = effectiveEv - 12;
  let exposureStatus = 'Correctly Exposed';
  if (stopsDiff > 0.5) exposureStatus = `Overexposed +${stopsDiff.toFixed(1)} stops`;
  else if (stopsDiff < -0.5) exposureStatus = `Underexposed ${stopsDiff.toFixed(1)} stops`;

  // Motion blur indicator (proportional to shutter time)
  const motionBlurEstimate = Math.max(0, Math.round(shutterSpeedSec * 240));

  return (
    <ToolWorkspaceLayout
      title="Exposure"
      subtitle="The exposure triangle: aperture, ISO, shutter angle, neutral density, and EV calculation"
      headerAction={
        <Toggle
          label="False Color (IRE)"
          checked={showFalseColor}
          onChange={setShowFalseColor}
          description="Luminance exposure meter"
        />
      }
      visualization={
        <CameraPOVView
          aperture={aperture}
          exposureEV={effectiveEv}
          iso={iso}
          shutterSpeedSec={shutterSpeedSec}
          showFalseColor={showFalseColor}
          motionBlurPx={motionBlurEstimate * 0.4}
          customOverlayText={`EV ${effectiveEv.toFixed(1)} · ${formatShutterSpeed(shutterSpeedSec)} · ISO ${iso}`}
        />
      }
      results={
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <TechnicalResult
            label="Exposure Value (EV)"
            value={effectiveEv.toFixed(1)}
            unit="EV"
            subtext={exposureStatus}
            highlight
          />
          <TechnicalResult
            label="Shutter Speed"
            value={formatShutterSpeed(shutterSpeedSec)}
            unit={`@ ${fps}fps`}
            subtext={`${shutterAngle}° rotary angle`}
          />
          <TechnicalResult
            label="Relative Exposure"
            value={`${stopsDiff >= 0 ? '+' : ''}${stopsDiff.toFixed(1)}`}
            unit="stops"
            subtext="Baseline EV 12.0"
          />
          <TechnicalResult
            label="ND Attenuation"
            value={`-${ndStops}`}
            unit="stops"
            subtext={ndStops > 0 ? `ND ${Math.pow(2, ndStops)} optical cut` : 'Clear optical path'}
          />
          <TechnicalResult
            label="Motion Blur Index"
            value={`${motionBlurEstimate}`}
            unit="px"
            subtext={shutterAngle === 180 ? 'Standard cinema' : shutterAngle < 90 ? 'Crisp action' : 'Motion smear'}
          />
          <TechnicalResult
            label="Sensor Gain"
            value={`+${(Math.log2(iso / 100) * 6).toFixed(0)} dB`}
            subtext={`Base ISO 100 to ${iso}`}
          />
        </div>
      }
      controls={
        <div className="space-y-4">
          {/* Aperture & ISO Controls Box */}
          <div className="space-y-3.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <ParameterControl
              label="Aperture (f-stop)"
              value={aperture}
              min={1.2}
              max={22}
              step={0.1}
              unit="f/"
              onChange={setAperture}
              description="Controls light transmission and depth of field"
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  ISO Sensitivity
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">{iso}</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 mb-3">
                {ISO_PRESETS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setIso(val)}
                    className={`py-1 text-xs font-mono rounded border transition-colors cursor-pointer ${
                      iso === val
                        ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <ParameterControl
                label="ISO Slider"
                value={iso}
                min={100}
                max={12800}
                step={100}
                unit="ISO"
                onChange={setIso}
              />
            </div>
          </div>

          {/* Shutter Angle & ND Filter Box */}
          <div className="space-y-3.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <ParameterControl
              label="Shutter Angle"
              value={shutterAngle}
              min={11.25}
              max={360}
              step={1}
              unit="°"
              onChange={setShutterAngle}
              description={`Standard 180° = 1/${fps * 2}s (Half-revolution rotary disc)`}
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  ND Filter (Neutral Density)
                </span>
                <span className="text-xs font-mono text-blue-400 font-bold">-{ndStops} stops</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {ND_PRESETS.map((nd) => (
                  <button
                    key={nd.stops}
                    type="button"
                    onClick={() => setNdStops(nd.stops)}
                    className={`py-1.5 px-2 text-xs font-medium rounded border transition-colors text-left ${
                      ndStops === nd.stops
                        ? 'bg-blue-600 text-white border-blue-500 font-bold'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {nd.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
};

