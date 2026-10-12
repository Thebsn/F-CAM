import React, { createContext, useContext, useState, useCallback } from 'react';

export const DEFAULT_SPLIT_PERCENT = 58.33; // 7/12 ratio (~58.333% default F CAM desktop layout)
export const MIN_SPLIT_PERCENT = 35.0;
export const MAX_SPLIT_PERCENT = 72.0;
export const WORKSPACE_STORAGE_KEY = 'fcam-workspace-split';

interface WorkspaceLayoutContextValue {
  splitPercent: number;
  setSplitPercent: (percent: number) => void;
  resetLayout: () => void;
  isCustom: boolean;
}

const WorkspaceLayoutContext = createContext<WorkspaceLayoutContextValue | undefined>(undefined);

function getSavedSplit(): number {
  if (typeof window === 'undefined') return DEFAULT_SPLIT_PERCENT;
  try {
    const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) return DEFAULT_SPLIT_PERCENT;
    const val = parseFloat(raw);
    if (!isNaN(val) && val >= MIN_SPLIT_PERCENT && val <= MAX_SPLIT_PERCENT) {
      return Math.round(val * 100) / 100;
    }
  } catch {
    // fallback
  }
  return DEFAULT_SPLIT_PERCENT;
}

export const WorkspaceLayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [splitPercent, setSplitState] = useState<number>(getSavedSplit);

  const setSplitPercent = useCallback((val: number) => {
    const clamped = Math.min(MAX_SPLIT_PERCENT, Math.max(MIN_SPLIT_PERCENT, Math.round(val * 100) / 100));
    setSplitState(clamped);
    try {
      localStorage.setItem(WORKSPACE_STORAGE_KEY, clamped.toString());
    } catch {
      // ignore
    }
  }, []);

  const resetLayout = useCallback(() => {
    setSplitState(DEFAULT_SPLIT_PERCENT);
    try {
      localStorage.removeItem(WORKSPACE_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const isCustom = Math.abs(splitPercent - DEFAULT_SPLIT_PERCENT) > 0.5;

  return (
    <WorkspaceLayoutContext.Provider value={{ splitPercent, setSplitPercent, resetLayout, isCustom }}>
      {children}
    </WorkspaceLayoutContext.Provider>
  );
};

export function useWorkspaceLayout(): WorkspaceLayoutContextValue {
  const ctx = useContext(WorkspaceLayoutContext);
  if (!ctx) {
    return {
      splitPercent: DEFAULT_SPLIT_PERCENT,
      setSplitPercent: () => {},
      resetLayout: () => {},
      isCustom: false,
    };
  }
  return ctx;
}
