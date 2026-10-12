import React from 'react';
import {
  Home,
  Camera,
  Sun,
  User,
  Image as ImageIcon,
  LayoutGrid,
  Lightbulb,
  Play,
  Activity,
  Tv,
  Film,
  Settings,
  X,
} from 'lucide-react';
import { SectionId } from '../../types/cinematography';

interface SidebarProps {
  activeSection: SectionId;
  onSelectSection: (section: SectionId) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Custom 3-circles icon for Color & White Balance to match the reference exactly
const ColorWheelIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <circle cx="12" cy="8.5" r="4.5" />
    <circle cx="8.5" cy="14.5" r="4.5" />
    <circle cx="15.5" cy="14.5" r="4.5" />
  </svg>
);

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'camera-lens', label: 'Camera & Lens', icon: Camera },
  { id: 'exposure', label: 'Exposure', icon: Sun },
  { id: 'camera-angles', label: 'Camera Angles', icon: User },
  { id: 'shot-types', label: 'Shot Types', icon: ImageIcon },
  { id: 'composition', label: 'Composition', icon: LayoutGrid },
  { id: 'lighting', label: 'Lighting', icon: Lightbulb },
  { id: 'movement', label: 'Movement', icon: Play },
  { id: 'color-wb', label: 'Color & White Balance', icon: ColorWheelIcon },
  { id: 'framerate', label: 'Frame Rate & Motion', icon: Activity },
  { id: 'aspect-ratio', label: 'Aspect Ratio', icon: Tv },
  { id: 'film-language', label: 'Film Language', icon: Film },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = React.memo(({
  activeSection,
  onSelectSection,
  mobileOpen,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#08101e] border-r border-[#15233e] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-20 flex items-center justify-between px-6 pt-3 shrink-0">
          <button
            onClick={() => {
              onSelectSection('home');
              onCloseMobile();
            }}
            className="flex flex-col items-start hover:opacity-90 transition-opacity cursor-pointer group text-left"
          >
            <span className="text-2xl font-black tracking-tight text-white leading-none">
              F CAM
            </span>
            <span className="text-[11px] font-medium tracking-normal text-slate-400 group-hover:text-slate-300 transition-colors mt-1">
              See. Adjust. Understand.
            </span>
          </button>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectSection(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all select-none text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#1873ea] text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
});
