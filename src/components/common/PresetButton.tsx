import React from 'react';

interface PresetButtonProps {
  label: string;
  sublabel?: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}

export const PresetButton: React.FC<PresetButtonProps> = React.memo(({
  label,
  sublabel,
  active,
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all select-none whitespace-nowrap text-left ${
        active
          ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
      } ${className}`}
    >
      <div className="font-mono">{label}</div>
      {sublabel && <div className="text-[10px] text-slate-400 font-sans font-normal opacity-80">{sublabel}</div>}
    </button>
  );
});

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = React.memo(({
  label,
  checked,
  onChange,
  description,
  className = '',
}) => {
  return (
    <label
      className={`flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 cursor-pointer select-none hover:border-slate-700/80 transition-colors ${className}`}
    >
      <div>
        <div className="text-xs font-semibold text-slate-200">{label}</div>
        {description && <div className="text-[11px] text-slate-400 mt-0.5">{description}</div>}
      </div>
      <div className="relative inline-flex items-center ml-3 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 border border-slate-700"></div>
      </div>
    </label>
  );
});

interface DropdownOption<T extends string | number> {
  value: T;
  label: string;
}

interface DropdownProps<T extends string | number> {
  label?: string;
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

function DropdownComponent<T extends string | number>({
  label,
  value,
  options,
  onChange,
  className = '',
}: DropdownProps<T>) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-xs font-semibold text-slate-300">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full bg-slate-900 border border-slate-700/80 text-slate-100 text-xs font-medium rounded-lg px-2.5 py-1.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export const Dropdown = React.memo(DropdownComponent) as typeof DropdownComponent;
