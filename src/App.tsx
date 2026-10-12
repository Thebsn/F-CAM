/**
 * F CAM Cinematography Explorer
 * See. Adjust. Understand.
 */

import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { HomeIllustration } from './components/scene/HomeIllustration';
import { CameraLensSection } from './components/sections/CameraLensSection';
import { ExposureSection } from './components/sections/ExposureSection';
import { CameraAnglesSection } from './components/sections/CameraAnglesSection';
import { ShotTypesSection } from './components/sections/ShotTypesSection';
import { CompositionSection } from './components/sections/CompositionSection';
import { LightingSection } from './components/sections/LightingSection';
import { MovementSection } from './components/sections/MovementSection';
import { ColorWhiteBalanceSection } from './components/sections/ColorWhiteBalanceSection';
import { FrameRateMotionSection } from './components/sections/FrameRateMotionSection';
import { AspectRatioSection } from './components/sections/AspectRatioSection';
import { FilmLanguageSection } from './components/sections/FilmLanguageSection';
import { SettingsSection } from './components/sections/SettingsSection';
import { SectionId } from './types/cinematography';
import { Menu } from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleSelectSection = useCallback((section: SectionId) => {
    setActiveSection(section);
  }, []);

  const handleCloseMobile = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleOpenMobile = useCallback(() => {
    setMobileMenuOpen(true);
  }, []);

  const handleStartExploring = useCallback(() => {
    setActiveSection('camera-lens');
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return (
          <HomeIllustration
            onStartExploring={handleStartExploring}
          />
        );
      case 'camera-lens':
        return <CameraLensSection />;
      case 'exposure':
        return <ExposureSection />;
      case 'camera-angles':
        return <CameraAnglesSection />;
      case 'shot-types':
        return <ShotTypesSection />;
      case 'composition':
        return <CompositionSection />;
      case 'lighting':
        return <LightingSection />;
      case 'movement':
        return <MovementSection />;
      case 'color-wb':
        return <ColorWhiteBalanceSection />;
      case 'framerate':
        return <FrameRateMotionSection />;
      case 'aspect-ratio':
        return <AspectRatioSection />;
      case 'film-language':
        return <FilmLanguageSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <CameraLensSection />;
    }
  };

  const isHome = activeSection === 'home';

  return (
    <div className="min-h-screen bg-[#08101e] text-slate-100 flex flex-col lg:flex-row antialiased font-sans">
      {/* Fixed Left Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={handleCloseMobile}
      />

      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#08101e] border-b border-[#15233e] sticky top-0 z-30">
        <button
          onClick={handleOpenMobile}
          className="p-1.5 text-slate-300 hover:text-white rounded-md bg-slate-900 border border-slate-800 cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-base font-black tracking-tight text-white leading-none">F CAM</span>
          <span className="text-[10px] font-medium text-slate-400">See. Adjust. Understand.</span>
        </div>
        <button
          onClick={() => handleSelectSection('settings')}
          className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-600/30 text-blue-300 border border-blue-500/40 cursor-pointer"
        >
          v1.0
        </button>
      </div>

      {/* Main Content Area */}
      <main
        className={`flex-1 lg:ml-64 min-h-screen transition-all ${
          isHome
            ? 'p-0 overflow-hidden'
            : 'p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full'
        }`}
      >
        {renderContent()}
      </main>
    </div>
  );
}
