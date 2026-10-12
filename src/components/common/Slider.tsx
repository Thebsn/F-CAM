import React from 'react';

interface SliderProps {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
  disabled?: boolean;
  className?: string;
}

export const Slider: React.FC<SliderProps> = React.memo(({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = '',
  disabled = false,
  className = '',
}) => {
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
          <span>{label}</span>
          <span className="font-mono text-blue-400 tabular-nums">
            {value} {unit}
          </span>
        </div>
      )}
      <div className="relative flex items-center h-6 select-none touch-none">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
        />
        {/* Track background */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
          <div
            className="h-full bg-blue-600"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {/* Thumb */}
        <div
          className="absolute w-4 h-4 bg-white border-2 border-blue-600 rounded-full shadow-md pointer-events-none -translate-x-1/2"
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  );
});
