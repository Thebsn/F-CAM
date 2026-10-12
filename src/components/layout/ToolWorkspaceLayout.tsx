import React, { useRef, useState, useEffect, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import {
  useWorkspaceLayout,
  MIN_SPLIT_PERCENT,
  MAX_SPLIT_PERCENT,
} from '../../context/WorkspaceLayoutContext';

export interface ToolWorkspaceLayoutProps {
  title: string;
  subtitle: string;
  headerAction?: React.ReactNode;
  visualization: React.ReactNode;
  results?: React.ReactNode;
  controls: React.ReactNode;
  extraContent?: React.ReactNode;
}

export const ToolWorkspaceLayout: React.FC<ToolWorkspaceLayoutProps> = React.memo(({
  title,
  subtitle,
  headerAction,
  visualization,
  results,
  controls,
  extraContent,
}) => {
  const { splitPercent, setSplitPercent, resetLayout, isCustom } = useWorkspaceLayout();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const activeSplitRef = useRef(splitPercent);

  // Synchronize CSS variable when splitPercent changes (e.g., page load or reset)
  useEffect(() => {
    if (containerRef.current && !isDragging) {
      containerRef.current.style.setProperty('--fcam-split', `${splitPercent}%`);
      activeSplitRef.current = splitPercent;
    }
  }, [splitPercent, isDragging]);

  // Clean up global cursor style on unmount
  useEffect(() => {
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only primary mouse button
    if (!containerRef.current) return;

    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const containerWidth = rect.width;

    if (containerWidth <= 0) return;

    // Enforce reasonable minimum dimensions for both columns
    const minLeftPx = Math.max(360, containerWidth * (MIN_SPLIT_PERCENT / 100));
    const maxLeftPx = Math.min(containerWidth - 300 - 16, containerWidth * (MAX_SPLIT_PERCENT / 100));

    const clampedX = Math.min(maxLeftPx, Math.max(minLeftPx, rawX));
    const newPercent = Math.round((clampedX / containerWidth) * 10000) / 100;

    activeSplitRef.current = newPercent;
    containerRef.current.style.setProperty('--fcam-split', `${newPercent}%`);
  }, [isDragging]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    setSplitPercent(activeSplitRef.current);
  }, [isDragging, setSplitPercent]);

  return (
    <div className="space-y-4 lg:space-y-5">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">{title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2.5 sm:self-center">
          {/* Reset Layout button (visible on desktop) */}
          <button
            type="button"
            onClick={resetLayout}
            disabled={!isCustom}
            title={isCustom ? "Reset workspace layout to default proportions" : "Workspace is at default proportions"}
            className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
              isCustom
                ? 'bg-slate-900 text-blue-400 border-blue-500/40 hover:bg-blue-950/40 hover:text-blue-300 hover:border-blue-400 shadow-sm'
                : 'bg-slate-900/40 text-slate-500 border-slate-800/60 opacity-60 hover:opacity-80'
            }`}
          >
            <RotateCcw className={`w-3 h-3 ${isCustom ? 'text-blue-400' : 'text-slate-500'}`} />
            <span>Reset Layout</span>
          </button>
          {headerAction && <div>{headerAction}</div>}
        </div>
      </div>

      {/* Main Two-Column Desktop Workspace / Responsive Sticky Workspace */}
      <div
        ref={containerRef}
        className="flex flex-col lg:flex-row items-start w-full relative"
        style={{
          '--fcam-split': `${splitPercent}%`,
        } as React.CSSProperties}
      >
        {/* Left Column: Live 1920x1080 Visualization + Live Results (Sticky on desktop) */}
        <div className="fcam-workspace-left w-full lg:sticky lg:top-4 z-10 space-y-3.5 lg:shrink-0 min-w-0">
          {/* Live Visualization Container */}
          <div className="w-full">
            {visualization}
          </div>

          {/* Live Technical Results Strip */}
          {results && (
            <div className="w-full">
              {results}
            </div>
          )}

          {/* Extra informational content on desktop if provided */}
          {extraContent && (
            <div className="hidden lg:block">
              {extraContent}
            </div>
          )}
        </div>

        {/* Draggable Divider (Desktop only) */}
        <div
          className="hidden lg:flex self-stretch items-center justify-center relative w-4 shrink-0 -mx-2 cursor-col-resize select-none group z-20"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDoubleClick={resetLayout}
          role="separator"
          aria-orientation="vertical"
          aria-valuenow={splitPercent}
          aria-label="Resize workspace columns"
          title="Drag to resize workspace • Double-click to reset"
        >
          {/* Vertical Divider Line */}
          <div
            className={`w-px h-full transition-colors ${
              isDragging
                ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                : 'bg-slate-800/80 group-hover:bg-blue-500/70'
            }`}
          />

          {/* Centered Grip Handle Pill (Sticky so it stays visible while scrolling) */}
          <div
            className={`absolute sticky top-[30vh] -translate-y-1/2 w-4 h-11 rounded-full border flex flex-col items-center justify-center gap-1 transition-all ${
              isDragging
                ? 'bg-blue-950 border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.5)] scale-105'
                : 'bg-[#0b1329] border-slate-700/80 group-hover:border-blue-500/80 group-hover:bg-[#0f1b38] shadow-md'
            }`}
          >
            <div className={`w-0.5 h-1 rounded-full ${isDragging ? 'bg-blue-300' : 'bg-slate-400 group-hover:bg-blue-400'}`} />
            <div className={`w-0.5 h-2.5 rounded-full ${isDragging ? 'bg-blue-300' : 'bg-slate-400 group-hover:bg-blue-400'}`} />
            <div className={`w-0.5 h-1 rounded-full ${isDragging ? 'bg-blue-300' : 'bg-slate-400 group-hover:bg-blue-400'}`} />
          </div>
        </div>

        {/* Right Column: Controls & Presets (Can scroll independently if tall) */}
        <div className="fcam-workspace-right w-full min-w-0 space-y-4 lg:flex-1 mt-4 lg:mt-0">
          {controls}

          {/* Extra informational content on mobile / tablets */}
          {extraContent && (
            <div className="lg:hidden">
              {extraContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
