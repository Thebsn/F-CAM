import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CameraPOVView } from '../scene/CameraPOVView';
import { ParameterControl } from '../common/ParameterControl';
import { TechnicalResult } from '../common/TechnicalResult';
import { ToolWorkspaceLayout } from '../layout/ToolWorkspaceLayout';
import { shutterAngleToSpeed, formatShutterSpeed } from '../../utils/calculations';
import { Play, Pause, RotateCcw } from 'lucide-react';

const FPS_OPTIONS = [23.976, 24, 25, 29.97, 30, 50, 59.94, 60, 120, 240];

export const FrameRateMotionSection: React.FC = () => {
  const [fps, setFps] = useState<number>(24);
  const [shutterAngle, setShutterAngle] = useState<number>(180);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [motionAmount, setMotionAmount] = useState<number>(50);
  const [clipDurationSec, setClipDurationSec] = useState<number>(5.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);

  // Mathematical relationship calculation
  const exposureTimeSec = shutterAngleToSpeed(shutterAngle, fps);
  const exposureTimeStr = formatShutterSpeed(exposureTimeSec);

  // Motion blur index: higher shutter angle + higher motion amount = more blur
  const motionBlurPx = Math.max(0, Math.round((shutterAngle / 180) * (motionAmount / 100) * 8));

  // Timecode formatting: HH:MM:SS:FF
  const currentFrame = Math.floor(currentTimeSec * fps);
  const totalFrames = Math.floor(clipDurationSec * fps);
  const seconds = Math.floor(currentTimeSec % 60);
  const minutes = Math.floor(currentTimeSec / 60);
  const frames = Math.floor(currentFrame % fps);
  const timecode = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;

  const animationRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      lastTimestampRef.current = null;
      return;
    }

    const step = (now: number) => {
      if (lastTimestampRef.current !== null) {
        const delta = ((now - lastTimestampRef.current) / 1000) * playbackSpeed;
        setCurrentTimeSec((t) => {
          const next = t + delta;
          return next >= clipDurationSec ? 0 : next;
        });
      }
      lastTimestampRef.current = now;
      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, playbackSpeed, clipDurationSec]);

  // Motion animation progress
  const motionProgress = (currentTimeSec / clipDurationSec) % 1;

  const resultsContent = useMemo(() => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      <TechnicalResult
        label="180° Shutter Formula"
        value={`${fps} FPS + ${shutterAngle}°`}
        unit={`= ${exposureTimeStr}`}
        subtext="t = θ / (360 × FPS)"
        highlight
      />
      <TechnicalResult
        label="Frame Exposure"
        value={`${(exposureTimeSec * 1000).toFixed(2)} ms`}
        subtext={`Duty ${(shutterAngle / 360 * 100).toFixed(0)}%`}
      />
      <TechnicalResult
        label="Motion Blur"
        value={`${motionBlurPx} px`}
        subtext={shutterAngle === 180 ? 'Natural cadence' : shutterAngle < 90 ? 'Staccato streak' : 'Temporal smear'}
      />
      <TechnicalResult
        label="Slow Motion"
        value={fps > 24 ? `${(fps / 24).toFixed(1)}x Slo-Mo` : '1.0x Real-time'}
        subtext="Conformed 24fps"
      />
    </div>
  ), [fps, shutterAngle, exposureTimeStr, exposureTimeSec, motionBlurPx]);

  const controlsContent = useMemo(() => (
    <div className="space-y-4">
      {/* FPS Presets Grid */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Cinema &amp; High-Speed Rates
          </span>
          <span className="text-xs font-mono text-blue-400 font-bold">{fps} FPS</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {FPS_OPTIONS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFps(f)}
              className={`py-1.5 px-2 text-xs font-mono rounded border transition-colors ${
                fps === f
                  ? 'bg-blue-600 text-white border-blue-500 font-bold'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Numerical Sliders */}
      <div className="space-y-3.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <ParameterControl
          label="Shutter Angle"
          value={shutterAngle}
          min={11.25}
          max={360}
          step={11.25}
          unit="°"
          onChange={setShutterAngle}
          description="Rotary shutter disc opening"
        />

        <ParameterControl
          label="Motion Velocity Amount"
          value={motionAmount}
          min={0}
          max={100}
          step={5}
          unit="%"
          onChange={setMotionAmount}
          description="Physical speed of in-frame action"
        />

        <ParameterControl
          label="Clip Duration"
          value={clipDurationSec}
          min={1}
          max={30}
          step={0.5}
          unit="s"
          onChange={setClipDurationSec}
          description="Master timeline sequence length"
        />
      </div>
    </div>
  ), [fps, shutterAngle, motionAmount, clipDurationSec]);

  return (
    <ToolWorkspaceLayout
      title="Frame Rate & Motion"
      subtitle="Temporal sampling frequency, 180° shutter rule, exposure duration, and motion cadence"
      visualization={
        <div className="space-y-3">
          <CameraPOVView
            movement="pan"
            movementProgress={motionProgress}
            isMoving={isPlaying}
            motionBlurPx={motionBlurPx}
            customOverlayText={`${fps} FPS · ${shutterAngle}° (${exposureTimeStr}) · TC ${timecode}`}
          />
          {/* Playback Controls & Timeline Bar */}
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
                onClick={() => setCurrentTimeSec(0)}
                className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                aria-label="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Timeline Scrubber */}
            <div className="flex-1 w-full flex items-center gap-3">
              <span className="text-xs font-mono text-slate-300 font-bold tracking-wider">{timecode}</span>
              <div className="relative flex-1 flex items-center h-5">
                <input
                  type="range"
                  min={0}
                  max={clipDurationSec}
                  step={1 / fps}
                  value={currentTimeSec}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCurrentTimeSec(parseFloat(e.target.value));
                  }}
                  className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <span className="text-xs font-mono text-blue-400 font-bold">
                F#{currentFrame} / {totalFrames}
              </span>
            </div>

            {/* Playback Speed selector */}
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-md border border-slate-800 shrink-0">
              {[0.25, 0.5, 1.0, 2.0].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-1.5 py-0.5 text-xs font-mono rounded ${
                    playbackSpeed === spd
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      results={resultsContent}
      controls={controlsContent}
    />
  );
};
