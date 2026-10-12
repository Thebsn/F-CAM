import React from 'react';
import { Toggle } from '../common/PresetButton';
import { Dropdown } from '../common/PresetButton';
import { Slider } from '../common/Slider';
import { DistanceUnit } from '../../types/cinematography';
import { useSettings } from '../../context/SettingsContext';

export const SettingsSection: React.FC = () => {
  const { settings, updateSetting, updateSettings } = useSettings();

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="pb-3 border-b border-slate-800">
        <h2 className="text-2xl font-black tracking-tight text-white">Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure units, cinematography defaults, display overlays, and accessibility preferences
        </p>
      </div>

      {/* 1. Units Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Units &amp; Standards</h3>
          <span className="h-px flex-1 bg-slate-800" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-300">Primary Measurement System</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  updateSettings({ unitSystem: 'metric', distanceUnit: 'm' });
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded border transition-colors ${
                  settings.unitSystem === 'metric'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Metric (m / cm / mm)
              </button>
              <button
                type="button"
                onClick={() => {
                  updateSettings({ unitSystem: 'imperial', distanceUnit: 'ft' });
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded border transition-colors ${
                  settings.unitSystem === 'imperial'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Imperial (ft / in)
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
            <Dropdown
              label="Default Distance Unit"
              value={settings.distanceUnit}
              options={[
                { value: 'm', label: 'Meters (m)' },
                { value: 'cm', label: 'Centimeters (cm)' },
                { value: 'mm', label: 'Millimeters (mm)' },
                { value: 'ft', label: 'Feet (ft)' },
                { value: 'in', label: 'Inches (in)' },
              ]}
              onChange={(val) => updateSetting('distanceUnit', val as DistanceUnit)}
            />
          </div>

          <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
            <Dropdown
              label="Temperature Scale"
              value={settings.tempUnit}
              options={[
                { value: 'K', label: 'Kelvin (K)' },
                { value: 'Mired', label: 'Micro Reciprocal Degrees (MK⁻¹)' },
              ]}
              onChange={(val) => updateSetting('tempUnit', val as 'K' | 'Mired')}
            />
          </div>
        </div>
      </section>

      {/* 2. Cinematography Defaults */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Cinematography Defaults</h3>
          <span className="h-px flex-1 bg-slate-800" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <Dropdown
              label="Sensor Format Baseline"
              value={settings.defaultSensor}
              options={[
                { value: 'full-frame', label: 'Full Frame 35mm (36×24mm)' },
                { value: 'super-35', label: 'Super 35 / APS-C (24.9×18.7mm)' },
                { value: 'micro-43', label: 'Micro Four Thirds (17.3×13mm)' },
                { value: 'large-format', label: 'Large Format (Arri LF / 65)' },
              ]}
              onChange={(val) => updateSetting('defaultSensor', val)}
            />
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <Dropdown
              label="Master Project Frame Rate"
              value={settings.defaultFps}
              options={[
                { value: '23.976', label: '23.976 FPS (NTSC Cinema)' },
                { value: '24', label: '24.00 FPS (Standard Theatrical)' },
                { value: '25', label: '25.00 FPS (PAL Broadcast)' },
                { value: '29.97', label: '29.97 FPS (NTSC Broadcast)' },
                { value: '60', label: '60.00 FPS (High Frame Rate)' },
              ]}
              onChange={(val) => updateSetting('defaultFps', val)}
            />
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <Dropdown
              label="Default Shutter Angle"
              value={settings.defaultShutterAngle}
              options={[
                { value: '180', label: '180° (Standard Cinema Cadence)' },
                { value: '90', label: '90° (Crisp Action / Staccato)' },
                { value: '45', label: '45° (Extreme Sharpness)' },
                { value: '360', label: '360° (Maximum Light / Dreamy)' },
              ]}
              onChange={(val) => updateSetting('defaultShutterAngle', val)}
            />
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <Dropdown
              label="Default Aspect Ratio"
              value={settings.defaultAspectRatio}
              options={[
                { value: '2.39:1', label: '2.39:1 (Scope Anamorphic)' },
                { value: '1.85:1', label: '1.85:1 (Theatrical Flat)' },
                { value: '16:9', label: '16:9 (Standard 1.78:1 HD)' },
                { value: '2.00:1', label: '2.00:1 (Univisium Series)' },
                { value: '4:3', label: '4:3 (Academy / Classic TV)' },
              ]}
              onChange={(val) => updateSetting('defaultAspectRatio', val)}
            />
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <Dropdown
              label="Baseline White Balance"
              value={settings.defaultWb}
              options={[
                { value: '5600', label: '5600K (Standard Daylight)' },
                { value: '3200', label: '3200K (Tungsten Studio)' },
                { value: '4300', label: '4300K (Fluorescent)' },
                { value: '6500', label: '6500K (Overcast Sky)' },
              ]}
              onChange={(val) => updateSetting('defaultWb', val)}
            />
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <Dropdown
              label="Render Quality"
              value={settings.previewQuality}
              options={[
                { value: 'high', label: 'High Precision (60 FPS Vector)' },
                { value: 'medium', label: 'Balanced Performance' },
                { value: 'low', label: 'Low Resource Mode' },
              ]}
              onChange={(val) => updateSetting('previewQuality', val)}
            />
          </div>
        </div>
      </section>

      {/* 3. Display & Technical Overlays */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Display &amp; Technical Overlays</h3>
          <span className="h-px flex-1 bg-slate-800" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Toggle
            label="Technical Overlays"
            checked={settings.showOverlays}
            onChange={(val) => updateSetting('showOverlays', val)}
            description="Viewfinder HUD and metadata"
          />
          <Toggle
            label="Measurement Scales"
            checked={settings.showScales}
            onChange={(val) => updateSetting('showScales', val)}
            description="Dynamic rulers and meters"
          />
          <Toggle
            label="Composition Grids"
            checked={settings.showGridGuides}
            onChange={(val) => updateSetting('showGridGuides', val)}
            description="Thirds and perspective guides"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <Slider
              label="Guide Overlay Opacity"
              value={settings.guideOpacity}
              min={20}
              max={100}
              step={5}
              unit="%"
              onChange={(val) => updateSetting('guideOpacity', val)}
            />
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <Slider
              label="Measurement Scale Opacity"
              value={settings.measurementOpacity}
              min={20}
              max={100}
              step={5}
              unit="%"
              onChange={(val) => updateSetting('measurementOpacity', val)}
            />
          </div>
        </div>
      </section>

      {/* 4. Accessibility */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Accessibility</h3>
          <span className="h-px flex-1 bg-slate-800" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Toggle
            label="Reduced Motion"
            checked={settings.reducedMotion}
            onChange={(val) => updateSetting('reducedMotion', val)}
            description="Disable camera animations"
          />
          <Toggle
            label="Larger Typography"
            checked={settings.largerText}
            onChange={(val) => updateSetting('largerText', val)}
            description="Increase HUD font size"
          />
          <Toggle
            label="High Contrast"
            checked={settings.highContrast}
            onChange={(val) => updateSetting('highContrast', val)}
            description="Sharper guide line borders"
          />
          <Toggle
            label="Keyboard Shortcuts"
            checked={settings.keyboardNav}
            onChange={(val) => updateSetting('keyboardNav', val)}
            description="Quick slider adjustments"
          />
        </div>
      </section>

      {/* 5. About F CAM */}
      <section className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">About F CAM</h3>
          <span className="h-px flex-1 bg-slate-800" />
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-black text-white">F CAM</h4>
              <p className="text-xs text-slate-400">
                See. Adjust. Understand.
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-md">
              v1.0.0
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <div>
              <span className="font-semibold text-slate-300">Philosophy:</span>
              <p className="mt-0.5">Adjust → Observe → Understand. Pure interactive cinematography calculation.</p>
            </div>
            <div>
              <span className="font-semibold text-slate-300">Physics Engine:</span>
              <p className="mt-0.5">True optical FoV, circle of confusion, hyperfocal, and shutter angle formulas.</p>
            </div>
            <div>
              <span className="font-semibold text-slate-300">Platform:</span>
              <p className="mt-0.5">High-precision real-time responsive vector cinematography suite.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
