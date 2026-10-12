import React, { useState, useCallback } from 'react';
import { CameraPOVView } from '../scene/CameraPOVView';
import { ParameterControl } from '../common/ParameterControl';
import { TechnicalResult } from '../common/TechnicalResult';
import { PresetButton } from '../common/PresetButton';
import { Dropdown } from '../common/PresetButton';
import { ToolWorkspaceLayout } from '../layout/ToolWorkspaceLayout';
import { DistanceUnit, SENSOR_PRESETS } from '../../types/cinematography';
import {
  calculateHorizontalFoV,
  calculateVerticalFoV,
  calculateDepthOfField,
  calculateHyperfocal,
  calculateMinFocusDistance,
  calculateCompressionFactor,
  convertDistance,
  convertToMeters,
} from '../../utils/calculations';

const FOCAL_PRESETS = [24, 35, 50, 85, 135];
const APERTURE_PRESETS = [1.4, 2.0, 2.8, 4.0, 5.6, 8.0, 11, 16];

const SENSOR_OPTIONS = Object.entries(SENSOR_PRESETS).map(([key, s]) => ({
  value: key,
  label: `${s.name} (${s.cropFactor}x)`,
}));

export const CameraLensSection: React.FC = () => {
  const [focalLength, setFocalLength] = useState<number>(50);
  const [distanceMeters, setDistanceMeters] = useState<number>(3.0);
  const [aperture, setAperture] = useState<number>(2.8);
  const [sensor, setSensor] = useState<string>('full-frame');
  const [unit, setUnit] = useState<DistanceUnit>('m');

  // Optical calculations
  const hFov = calculateHorizontalFoV(focalLength, sensor);
  const vFov = calculateVerticalFoV(focalLength, sensor);
  const hyperfocalM = calculateHyperfocal(focalLength, aperture, sensor);
  const dof = calculateDepthOfField(focalLength, aperture, distanceMeters, sensor);
  const minFocusM = calculateMinFocusDistance(focalLength);
  const compression = calculateCompressionFactor(focalLength);
  const currentSensor = SENSOR_PRESETS[sensor] || SENSOR_PRESETS['full-frame'];
  const equivFocalLength = Math.round(focalLength * currentSensor.cropFactor);

  // Distance in selected unit
  const displayDist = parseFloat(convertDistance(distanceMeters, unit).toFixed(2));

  const handleDistanceChange = useCallback((val: number) => {
    setDistanceMeters(convertToMeters(val, unit));
  }, [unit]);

  return (
    <ToolWorkspaceLayout
      title="Camera & Lens"
      subtitle="Optics, field of view, perspective compression, and depth of field calculation"
      headerAction={
        <div className="w-56 sm:w-64">
          <Dropdown
            label="Sensor Format"
            value={sensor}
            options={SENSOR_OPTIONS}
            onChange={setSensor}
          />
        </div>
      }
      visualization={
        <CameraPOVView
          focalLengthMm={focalLength}
          distanceM={distanceMeters}
          aperture={aperture}
          sensorKey={sensor}
          customOverlayText={`${focalLength}mm · f/${aperture} · ${currentSensor.name}`}
        />
      }
      results={
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <TechnicalResult
            label="Field of View (H)"
            value={`${hFov.toFixed(1)}°`}
            unit={`V: ${vFov.toFixed(1)}°`}
            subtext="Angle of view"
            highlight
          />
          <TechnicalResult
            label="Depth of Field"
            value={
              dof.totalM === 'infinity'
                ? '∞'
                : `${convertDistance(dof.totalM, unit).toFixed(2)}`
            }
            unit={dof.totalM === 'infinity' ? '' : unit}
            subtext={`Near: ${convertDistance(dof.nearM, unit).toFixed(2)}${unit}`}
          />
          <TechnicalResult
            label="Hyperfocal Distance"
            value={convertDistance(hyperfocalM, unit).toFixed(2)}
            unit={unit}
            subtext="Sharp to infinity"
          />
          <TechnicalResult
            label="Min Focus Distance"
            value={convertDistance(minFocusM, unit).toFixed(2)}
            unit={unit}
            subtext="Closest rack focus"
          />
          <TechnicalResult
            label="Perspective Compression"
            value={`${compression.toFixed(2)}x`}
            subtext={compression > 1.2 ? 'Telephoto' : compression < 0.8 ? 'Wide' : 'Natural eye'}
          />
          <TechnicalResult
            label="Crop Equiv. Focal"
            value={`${equivFocalLength}mm`}
            subtext={`Factor ${currentSensor.cropFactor}x`}
          />
        </div>
      }
      controls={
        <div className="space-y-4">
          {/* Focal Length & Presets Box */}
          <div className="space-y-3.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Focal Length Presets
              </span>
              <span className="text-xs font-mono text-blue-400 font-bold">{focalLength}mm</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {FOCAL_PRESETS.map((f) => (
                <PresetButton
                  key={f}
                  label={`${f}mm`}
                  sublabel={f === 24 ? 'Wide' : f === 50 ? 'Standard' : f === 85 ? 'Portrait' : f === 135 ? 'Tele' : 'Story'}
                  active={focalLength === f}
                  onClick={() => setFocalLength(f)}
                />
              ))}
            </div>

            <ParameterControl
              label="Focal Length"
              value={focalLength}
              min={14}
              max={200}
              step={1}
              unit="mm"
              onChange={setFocalLength}
              description="Adjusts magnification and perspective compression"
            />
          </div>

          {/* Subject Distance Box */}
          <div className="space-y-3.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <ParameterControl
              label="Subject Distance"
              value={displayDist}
              min={0.5}
              max={convertDistance(20, unit)}
              step={unit === 'm' || unit === 'ft' ? 0.1 : 5}
              onChange={handleDistanceChange}
              currentDistanceUnit={unit}
              distanceUnits={['m', 'cm', 'mm', 'ft', 'in']}
              onDistanceUnitChange={setUnit}
              description="Distance from camera lens to subject"
            />
          </div>

          {/* Aperture Box */}
          <div className="space-y-3.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Aperture (f-stop)
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold">f/{aperture}</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {APERTURE_PRESETS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAperture(a)}
                  className={`py-1 text-xs font-mono rounded border transition-colors cursor-pointer ${
                    aperture === a
                      ? 'bg-amber-600 text-white border-amber-500 font-bold'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  f/{a}
                </button>
              ))}
            </div>
            <ParameterControl
              label="Aperture Fine Tune"
              value={aperture}
              min={1.2}
              max={22}
              step={0.1}
              unit="f/"
              onChange={setAperture}
              description="Controls depth of field and exposure light transmission"
            />
          </div>
        </div>
      }
    />
  );
};
