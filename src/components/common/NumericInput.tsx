import React, { useState, useEffect } from 'react';

interface NumericInputProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
  disabled?: boolean;
  className?: string;
}

export const NumericInput: React.FC<NumericInputProps> = React.memo(({
  value,
  min,
  max,
  step = 1,
  onChange,
  unit,
  disabled = false,
  className = '',
}) => {
  const [localStr, setLocalStr] = useState<string>(value.toString());

  useEffect(() => {
    setLocalStr(value.toString());
  }, [value]);

  const handleBlur = () => {
    let parsed = parseFloat(localStr);
    if (isNaN(parsed)) {
      setLocalStr(value.toString());
      return;
    }
    if (min !== undefined && parsed < min) parsed = min;
    if (max !== undefined && parsed > max) parsed = max;
    setLocalStr(parsed.toString());
    onChange(parsed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div
      className={`inline-flex items-center bg-slate-900 border border-slate-700/80 rounded-md px-2.5 py-1 text-sm font-mono text-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 ${className}`}
    >
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        value={localStr}
        onChange={(e) => setLocalStr(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-16 bg-transparent text-right outline-none text-slate-100 tabular-nums focus:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      {unit && <span className="ml-1 text-slate-400 text-xs font-sans font-medium select-none">{unit}</span>}
    </div>
  );
});
