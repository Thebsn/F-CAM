import React from 'react';
import { DistanceUnit } from '../../types/cinematography';

interface UnitSelectorProps {
  currentUnit: DistanceUnit;
  units?: DistanceUnit[];
  onChange: (unit: DistanceUnit) => void;
  className?: string;
}

const DEFAULT_UNITS: DistanceUnit[] = ['m', 'cm', 'mm', 'ft', 'in'];

export const UnitSelector: React.FC<UnitSelectorProps> = React.memo(({
  currentUnit,
  units = DEFAULT_UNITS,
  onChange,
  className = '',
}) => {
  return (
    <div className={`inline-flex rounded-md bg-slate-900 border border-slate-700/80 p-0.5 ${className}`}>
      {units.map((unit) => {
        const isActive = currentUnit === unit;
        return (
          <button
            key={unit}
            type="button"
            onClick={() => onChange(unit)}
            className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
              isActive
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {unit}
          </button>
        );
      })}
    </div>
  );
});
