import React, { useState } from 'react';
import { CameraPOVView } from '../scene/CameraPOVView';
import { ParameterControl } from '../common/ParameterControl';
import { TechnicalResult } from '../common/TechnicalResult';
import { PresetButton } from '../common/PresetButton';
import { ToolWorkspaceLayout } from '../layout/ToolWorkspaceLayout';
import { ColorHarmony } from '../../types/cinematography';
import { kelvinToRgb } from '../../utils/calculations';

interface HarmonyPreset {
  id: ColorHarmony;
  label: string;
  sublabel: string;
  kelvin: number;
  tint: number;
  saturation: number;
  contrast: number;
  description: string;
}

const COLOR_HARMONIES: HarmonyPreset[] = [
  { id: 'natural', label: 'Natural Daylight', sublabel: '5600K', kelvin: 5600, tint: 0, saturation: 100, contrast: 100, description: 'True-to-life balanced daylight balance.' },
  { id: 'warm', label: 'Warm Golden Hour', sublabel: '3200K Tungsten', kelvin: 3200, tint: 8, saturation: 115, contrast: 105, description: 'Romantic sunset / amber tungsten warmth.' },
  { id: 'cool', label: 'Cool Twilight / Blue Hour', sublabel: '7500K Sky', kelvin: 7500, tint: -6, saturation: 95, contrast: 108, description: 'Melancholic, crisp, Scandinavian cinema mood.' },
  { id: 'complementary', label: 'Complementary (Teal & Orange)', sublabel: 'Split Tone', kelvin: 5000, tint: 12, saturation: 135, contrast: 125, description: 'Hollywood blockbuster dual color contrast: warm skin against cyan shadows.' },
  { id: 'triadic', label: 'Triadic Harmony', sublabel: '3 Equal Hues', kelvin: 5800, tint: 4, saturation: 120, contrast: 110, description: 'Three points balanced equally around the 360° color wheel.' },
  { id: 'analogous', label: 'Analogous Hues', sublabel: 'Adjacent', kelvin: 4600, tint: -10, saturation: 105, contrast: 95, description: 'Harmonious adjacent spectral colors generating serenity.' },
  { id: 'split-complementary', label: 'Split Complementary', sublabel: 'Tension', kelvin: 5400, tint: 16, saturation: 125, contrast: 115, description: 'Base color paired with the two colors adjacent to its complement.' },
  { id: 'monochromatic', label: 'Monochromatic / B&W', sublabel: 'Film Noir', kelvin: 5600, tint: 0, saturation: 0, contrast: 130, description: 'High contrast black and white / single tone drama.' },
];

export const ColorWhiteBalanceSection: React.FC = () => {
  const [kelvin, setKelvin] = useState<number>(5600);
  const [tint, setTint] = useState<number>(0);
  const [saturation, setSaturation] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [exposureDelta, setExposureDelta] = useState<number>(0);
  const [harmony, setHarmony] = useState<ColorHarmony>('natural');

  const handleSelectHarmony = (h: HarmonyPreset) => {
    setHarmony(h.id);
    setKelvin(h.kelvin);
    setTint(h.tint);
    setSaturation(h.saturation);
    setContrast(h.contrast);
  };

  const kelvinRgb = kelvinToRgb(kelvin);
  const mired = Math.round(1000000 / kelvin);

  return (
    <ToolWorkspaceLayout
      title="Color & White Balance"
      subtitle="Correlated color temperature, green-magenta tint, saturation, and cinematic harmonies"
      visualization={
        <CameraPOVView
          isColorReferenceScene={true}
          colorKelvin={kelvin}
          tint={tint}
          saturation={saturation}
          contrast={contrast}
          exposureEV={12 + exposureDelta}
          colorHarmony={harmony}
          customOverlayText={`${kelvin}K · Tint ${tint >= 0 ? '+' : ''}${tint} · ${mired} MK⁻¹`}
        />
      }
      results={
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <TechnicalResult
            label="Correlated Temp"
            value={`${kelvin}K`}
            unit={`${mired} MK⁻¹`}
            subtext={kelvin < 3500 ? 'Warm Tungsten' : kelvin > 7000 ? 'Cool Overcast' : 'Daylight 5600K'}
            highlight
          />
          <TechnicalResult
            label="Tint (CC)"
            value={`${tint >= 0 ? '+' : ''}${tint}`}
            subtext={tint > 0 ? 'Magenta shift' : tint < 0 ? 'Green shift' : 'Neutral CC 0'}
          />
          <TechnicalResult
            label="Saturation"
            value={`${saturation}%`}
            subtext={saturation === 0 ? 'Monochrome' : saturation > 120 ? 'Hyper-vivid' : 'Natural'}
          />
          <TechnicalResult
            label="Contrast"
            value={`${contrast}%`}
            subtext={`EV ${exposureDelta >= 0 ? '+' : ''}${exposureDelta.toFixed(1)}`}
          />
        </div>
      }
      controls={
        <div className="space-y-4">
          {/* Color Harmony Schemes */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Cinematography Color Harmonies
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
              {COLOR_HARMONIES.map((h) => (
                <PresetButton
                  key={h.id}
                  label={h.label}
                  sublabel={h.sublabel}
                  active={harmony === h.id}
                  onClick={() => handleSelectHarmony(h)}
                />
              ))}
            </div>
          </div>

          {/* Temperature & Tint */}
          <div className="space-y-3.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <ParameterControl
              label="White Balance Kelvin"
              value={kelvin}
              min={2000}
              max={10000}
              step={50}
              unit="K"
              onChange={setKelvin}
              description="2000K (Candlelight) - 5600K (Daylight) - 10000K (Deep Shade)"
            />

            <ParameterControl
              label="Tint (Green / Magenta)"
              value={tint}
              min={-50}
              max={50}
              step={1}
              unit="CC"
              onChange={setTint}
              description="Green correction for fluorescent lighting"
            />
          </div>

          {/* Saturation & Contrast */}
          <div className="space-y-3.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <ParameterControl
              label="Saturation"
              value={saturation}
              min={0}
              max={200}
              step={1}
              unit="%"
              onChange={setSaturation}
              description="Color chrominance intensity"
            />

            <ParameterControl
              label="Contrast"
              value={contrast}
              min={50}
              max={160}
              step={1}
              unit="%"
              onChange={setContrast}
              description="Tonal separation between highlights and shadows"
            />
          </div>
        </div>
      }
    />
  );
};
