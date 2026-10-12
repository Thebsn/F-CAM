import React from 'react';
import { Slider } from './Slider';
import { NumericInput } from './NumericInput';
import { UnitSelector } from './UnitSelector';
import { DistanceUnit } from '../../types/cinematography';

interface ParameterControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  unit?: string;
  distanceUnits?: DistanceUnit[];
  currentDistanceUnit?: DistanceUnit;
  onDistanceUnitChange?: (unit: DistanceUnit) => void;
  description?: string;
  className?: string;
}

export const ParameterControl: React.FC<ParameterControlProps> = React.memo(({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit,
  distanceUnits,
  currentDistanceUnit,
  onDistanceUnitChange,
  description,
  className = '',
}) => {
  return (
    <div className={`p-3 bg-slate-900/90 rounded-lg border border-slate-800 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">{label}</span>
          {description && <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>}
        </div>
        <div className="flex items-center gap-1.5">
          <NumericInput
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={onChange}
            unit={currentDistanceUnit || unit}
          />
          {distanceUnits && currentDistanceUnit && onDistanceUnitChange && (
            <UnitSelector
              currentUnit={currentDistanceUnit}
              units={distanceUnits}
              onChange={onDistanceUnitChange}
            />
          )}
        </div>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
      />
    </div>
  );
});
