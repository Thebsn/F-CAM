import React from 'react';

interface TechnicalResultProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  highlight?: boolean;
  className?: string;
}

export const TechnicalResult: React.FC<TechnicalResultProps> = React.memo(({
  label,
  value,
  unit,
  subtext,
  highlight = false,
  className = '',
}) => {
  return (
    <div
      className={`p-2.5 rounded-lg border transition-colors ${
        highlight
          ? 'bg-blue-950/40 border-blue-500/40'
          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80'
      } ${className}`}
    >
      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate mb-1">
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={`font-mono text-base font-bold tabular-nums tracking-tight ${
            highlight ? 'text-blue-400' : 'text-slate-100'
          }`}
        >
          {value}
        </span>
        {unit && <span className="text-xs font-sans text-slate-400 font-medium">{unit}</span>}
      </div>
      {subtext && <div className="text-[10px] text-slate-400 mt-1 truncate">{subtext}</div>}
    </div>
  );
});
