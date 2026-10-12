import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { CameraPOVView } from '../scene/CameraPOVView';
import { ParameterControl } from '../common/ParameterControl';
import { TechnicalResult } from '../common/TechnicalResult';
import { PresetButton } from '../common/PresetButton';
import { ToolWorkspaceLayout } from '../layout/ToolWorkspaceLayout';
import { CameraMovement, DistanceUnit } from '../../types/cinematography';
import { convertDistance, convertToMeters } from '../../utils/calculations';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface MovementData {
  id: CameraMovement;
  label: string;
  axis: string;
  defaultSpeed: number; // m/s or deg/s
  description: string;
}

const MOVEMENTS_LIST: MovementData[] = [
  { id: 'static', label: 'Static', axis: 'Locked Off', defaultSpeed: 0, description: 'Locked tripod shot; anchors scene stability and lets subject action speak.' },
  { id: 'pan', label: 'Pan', axis: 'X-Axis Horizontal', defaultSpeed: 15, description: 'Horizontal camera rotation on a fixed vertical axis from left to right.' },
  { id: 'tilt', label: 'Tilt', axis: 'Y-Axis Vertical', defaultSpeed: 12, description: 'Vertical camera rotation pointing the lens upward or downward.' },
  { id: 'dolly-in', label: 'Dolly In', axis: 'Z-Axis Forward', defaultSpeed: 1.2, description: 'Wheeled camera moves physically closer to the subject, increasing psychological intimacy.' },
  { id: 'dolly-out', label: 'Dolly Out', axis: 'Z-Axis Backward', defaultSpeed: 1.2, description: 'Camera moves physically away from subject, revealing environment and isolation.' },
  { id: 'tracking', label: 'Tracking', axis: 'Parallel Track', defaultSpeed: 2.0, description: 'Camera moves alongside the moving character at matching speed.' },
  { id: 'truck', label: 'Truck', axis: 'Lateral X-Axis', defaultSpeed: 1.5, description: 'Lateral movement perpendicular to the subject along a straight line.' },
  { id: 'pedestal', label: 'Pedestal', axis: 'Vertical Height', defaultSpeed: 0.8, description: 'Physical elevation or lowering of the entire camera rig without tilting.' },
  { id: 'crane', label: 'Crane / Jib', axis: 'Radial Arc Boom', defaultSpeed: 1.8, description: 'Long mechanical arm sweeping from ground level into high grand vista.' },
  { id: 'orbit', label: 'Orbit', axis: '360° Circular', defaultSpeed: 20, description: 'Camera circles continuously around the subject, creating dynamic rotational energy.' },
  { id: 'arc', label: 'Arc', axis: 'Curved Path', defaultSpeed: 1.6, description: 'Curved dolly path combining truck and push-in around subject.' },
  { id: 'zoom', label: 'Zoom (Optical)', axis: 'Focal Length Shift', defaultSpeed: 25, description: 'Focal length change with stationary camera; flat two-dimensional compression.' },
  { id: 'dolly-zoom', label: 'Dolly Zoom (Vertigo)', axis: 'Push + Pull', defaultSpeed: 1.5, description: 'Dolly physically inward while zooming out simultaneously (Hitchcock Vertigo effect).' },
  { id: 'whip-pan', label: 'Whip Pan', axis: 'Rapid X Swish', defaultSpeed: 120, description: 'Extremely fast pan generating heavy motion blur to disguise transition cuts.' },
  { id: 'handheld', label: 'Handheld', axis: 'Organic 6-DoF', defaultSpeed: 0.5, description: 'Shoulder or body mounted; adds visceral immediacy, realism, and tension.' },
  { id: 'steadicam', label: 'Steadicam', axis: 'Gimbal Iso-Elastic', defaultSpeed: 1.8, description: 'Counter-weighted floating arm; smooth, fluid, ghostlike character following.' },
  { id: 'gimbal', label: '3-Axis Gimbal', axis: 'Motorized Stabilized', defaultSpeed: 2.2, description: 'Brushless motorized gyro stabilization for agile dynamic tracking.' },
];

export const MovementSection: React.FC = () => {
  const [selectedMovement, setSelectedMovement] = useState<CameraMovement>('pan');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0.2);
  const [durationSec, setDurationSec] = useState<number>(4.0);
  const [travelDistanceM, setTravelDistanceM] = useState<number>(3.5);
  const [travelAngleDeg, setTravelAngleDeg] = useState<number>(45);
  const [unit, setUnit] = useState<DistanceUnit>('m');

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      lastTimeRef.current = null;
      return;
    }

    const animate = (time: number) => {
      if (lastTimeRef.current !== null) {
        const delta = (time - lastTimeRef.current) / 1000;
        setProgress((prev) => {
          const next = prev + delta / durationSec;
          return next >= 1 ? 0 : next;
        });
      }
      lastTimeRef.current = time;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, durationSec]);

  const activeMove = MOVEMENTS_LIST.find((m) => m.id === selectedMovement) || MOVEMENTS_LIST[0];

  // Calculated speed
  const speedMS = (travelDistanceM / durationSec).toFixed(2);
  const speedDegS = (travelAngleDeg / durationSec).toFixed(1);

  const handleTravelDistanceChange = useCallback((val: number) => {
    setTravelDistanceM(convertToMeters(val, unit));
  }, [unit]);

  const resultsContent = useMemo(() => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      <TechnicalResult
        label="Active Move"
        value={activeMove.label}
        subtext={activeMove.axis}
        highlight
      />
      <TechnicalResult
        label="Linear Velocity"
        value={speedMS}
        unit={`${unit}/s`}
        subtext={`Dist: ${convertDistance(travelDistanceM, unit).toFixed(2)}${unit}`}
      />
      <TechnicalResult
        label="Angular Velocity"
        value={speedDegS}
        unit="°/s"
        subtext={`Arc: ${travelAngleDeg}°`}
      />
      <TechnicalResult
        label="Duration"
        value={`${durationSec.toFixed(1)}s`}
        subtext={`${(durationSec * 24).toFixed(0)} frames`}
      />
    </div>
  ), [activeMove, speedMS, speedDegS, durationSec, unit, travelDistanceM, travelAngleDeg]);

  const controlsContent = useMemo(() => (
    <div className="space-y-4">
      {/* Movement Presets Grid */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Cinematic Movement Types
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {MOVEMENTS_LIST.map((m) => (
            <PresetButton
              key={m.id}
              label={m.label}
              sublabel={m.axis}
              active={selectedMovement === m.id}
              onClick={() => setSelectedMovement(m.id)}
            />
          ))}
        </div>
      </div>

      {/* Numerical Parameters */}
      <div className="space-y-3.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <ParameterControl
          label="Move Duration"
          value={durationSec}
          min={1}
          max={15}
          step={0.5}
          unit="s"
          onChange={setDurationSec}
          description="Total execution time"
        />

        <ParameterControl
          label="Travel Distance"
          value={parseFloat(convertDistance(travelDistanceM, unit).toFixed(2))}
          min={convertDistance(0.5, unit)}
          max={convertDistance(20, unit)}
          step={0.1}
          onChange={handleTravelDistanceChange}
          currentDistanceUnit={unit}
          distanceUnits={['m', 'cm', 'mm', 'ft', 'in']}
          onDistanceUnitChange={setUnit}
          description="Dolly / crane track stroke"
        />

        <ParameterControl
          label="Angular Sweep"
          value={travelAngleDeg}
          min={10}
          max={360}
          step={5}
          unit="°"
          onChange={setTravelAngleDeg}
          description="Pan or orbit sweep angle"
        />
      </div>
    </div>
  ), [selectedMovement, durationSec, travelDistanceM, travelAngleDeg, unit, handleTravelDistanceChange]);

  return (
    <ToolWorkspaceLayout
      title="Movement"
      subtitle="Dynamic camera moves, track trajectories, dolly zoom, and kinetic velocities"
      visualization={
        <div className="space-y-3">
          <CameraPOVView
            movement={selectedMovement}
            movementProgress={progress}
            isMoving={isPlaying}
            customOverlayText={`${activeMove.label} · ${speedMS} m/s · Progress ${(progress * 100).toFixed(0)}%`}
          />
          {/* Playback & Scrub Bar */}
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 sm:p-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-lg transition-colors cursor-pointer"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setProgress(0)}
                className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                aria-label="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Timeline Scrubber */}
            <div className="flex-1 w-full flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">00:00</span>
              <div className="relative flex-1 flex items-center h-5">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={progress}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setProgress(parseFloat(e.target.value));
                  }}
                  className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <span className="text-xs font-mono text-blue-400 font-bold">
                {(progress * durationSec).toFixed(1)}s / {durationSec.toFixed(1)}s
              </span>
            </div>
          </div>
        </div>
      }
      results={resultsContent}
      controls={controlsContent}
    />
  );
};
