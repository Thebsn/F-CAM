import React, { useState } from 'react';
import { CameraPOVView } from '../scene/CameraPOVView';
import { ParameterControl } from '../common/ParameterControl';
import { TechnicalResult } from '../common/TechnicalResult';
import { PresetButton } from '../common/PresetButton';
import { Toggle } from '../common/PresetButton';
import { ToolWorkspaceLayout } from '../layout/ToolWorkspaceLayout';
import { ASPECT_RATIOS } from '../../types/cinematography';
import { calculateAspectMattes } from '../../utils/calculations';

export const AspectRatioSection: React.FC = () => {
  const [selectedRatioId, setSelectedRatioId] = useState<string>('2.39:1');
  const [customRatio, setCustomRatio] = useState<number>(2.39);
  const [showSafeAreas, setShowSafeAreas] = useState<boolean>(true);

  // Active ratio float
  const activeRatioObj = ASPECT_RATIOS.find((r) => r.id === selectedRatioId);
  const effectiveRatio = selectedRatioId === 'custom' ? customRatio : activeRatioObj?.ratio || 2.39;

  // Compute mattes for standard 1920x1080 canvas
  const mattes = calculateAspectMattes(effectiveRatio, 1920, 1080);
  const totalPixels = 1920 * 1080;
  const visiblePixels = mattes.visibleWidth * mattes.visibleHeight;
  const visiblePercent = ((visiblePixels / totalPixels) * 100).toFixed(1);

  return (
    <ToolWorkspaceLayout
      title="Aspect Ratio"
      subtitle="Cinema framing formats, letterbox & pillarbox mattes, crop geometry, and safe areas"
      headerAction={
        <Toggle
          label="Safe Areas"
          checked={showSafeAreas}
          onChange={setShowSafeAreas}
          description="90% Action / 80% Title"
        />
      }
      visualization={
        <CameraPOVView
          letterboxHeight={mattes.letterboxHeight}
          pillarboxWidth={mattes.pillarboxWidth}
          showSafeAreas={showSafeAreas}
          customOverlayText={`${effectiveRatio.toFixed(2)}:1 · ${mattes.visibleWidth}×${mattes.visibleHeight} px`}
        />
      }
      results={
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <TechnicalResult
            label="Target Aspect Ratio"
            value={`${effectiveRatio.toFixed(2)} : 1`}
            subtext={activeRatioObj?.description || 'Custom Framing'}
            highlight
          />
          <TechnicalResult
            label="Visible Image Size"
            value={`${mattes.visibleWidth} × ${mattes.visibleHeight}`}
            unit="px"
            subtext="Active image area"
          />
          <TechnicalResult
            label="Letterbox Bars"
            value={mattes.letterboxHeight > 0 ? `${mattes.letterboxHeight}` : '0'}
            unit="px each"
            subtext={mattes.letterboxHeight > 0 ? `Total ${(mattes.letterboxHeight * 2)}px` : 'No vert crop'}
          />
          <TechnicalResult
            label="Pillarbox Bars"
            value={mattes.pillarboxWidth > 0 ? `${mattes.pillarboxWidth}` : '0'}
            unit="px each"
            subtext={mattes.pillarboxWidth > 0 ? `Total ${(mattes.pillarboxWidth * 2)}px` : 'No horiz crop'}
          />
          <TechnicalResult
            label="Masked Crop"
            value={`${mattes.cropPercent}%`}
            subtext={`${visiblePercent}% active`}
          />
          <TechnicalResult
            label="Frame Pixels"
            value={`${(visiblePixels / 1000000).toFixed(2)} MP`}
            subtext="Sensor utilization"
          />
        </div>
      }
      controls={
        <div className="space-y-4">
          {/* Aspect Ratio Presets Grid */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Standard Cinema &amp; Television Aspect Ratios
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ASPECT_RATIOS.map((preset) => (
                <PresetButton
                  key={preset.id}
                  label={preset.label}
                  sublabel={preset.description}
                  active={selectedRatioId === preset.id}
                  onClick={() => {
                    setSelectedRatioId(preset.id);
                    setCustomRatio(preset.ratio);
                  }}
                />
              ))}
              <PresetButton
                label="Custom Ratio"
                sublabel="User defined"
                active={selectedRatioId === 'custom'}
                onClick={() => setSelectedRatioId('custom')}
              />
            </div>
          </div>

          {/* Custom Aspect Ratio Slider & Inputs */}
          <div className="space-y-3.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <ParameterControl
              label="Custom Aspect Ratio Float"
              value={parseFloat(customRatio.toFixed(2))}
              min={0.5}
              max={3.0}
              step={0.01}
              unit=": 1"
              onChange={(val) => {
                setCustomRatio(val);
                setSelectedRatioId('custom');
              }}
              description="E.g. 1.33 (4:3), 1.78 (16:9), 2.39 (Scope)"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Format Dimension Reference
                </span>
                <div className="mt-2 space-y-1 text-xs font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span>Full HD 1080p:</span>
                    <span className="text-white font-bold">1920 × 1080</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DCI 2K Scope:</span>
                    <span className="text-blue-400 font-bold">2048 × 858</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DCI 4K Scope:</span>
                    <span className="text-emerald-400 font-bold">4096 × 1716</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Safe Area Dimensions (1080p)
                </span>
                <div className="mt-2 space-y-1 text-xs font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-sky-400">90% Action Safe:</span>
                    <span>1728 × 972 px</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-400">80% Title Safe:</span>
                    <span>1536 × 864 px</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
};
