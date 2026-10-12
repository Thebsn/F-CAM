import React, { useState, useRef, useEffect } from 'react';
import { CameraPOVView } from '../scene/CameraPOVView';
import { TechnicalResult } from '../common/TechnicalResult';
import { ParameterControl } from '../common/ParameterControl';
import { PresetButton } from '../common/PresetButton';
import { Toggle } from '../common/PresetButton';
import { ToolWorkspaceLayout } from '../layout/ToolWorkspaceLayout';
import { CompositionGuide } from '../../types/cinematography';

interface GuideData {
  id: CompositionGuide;
  label: string;
  description: string;
  keyRule: string;
  defaultOffsetX: number;
  defaultOffsetY: number;
  defaultScale: number;
  explanation: string;
}

const COMPOSITION_GUIDES: GuideData[] = [
  {
    id: 'rule-of-thirds',
    label: 'Rule of Thirds',
    description: 'Divides the frame into 3x3 grid; places focal subjects along lines or at four intersection power points.',
    keyRule: 'Intersecting 4 Power Points: (640, 360), (1280, 360), (640, 720), (1280, 720)',
    defaultOffsetX: -320,
    defaultOffsetY: -94,
    defaultScale: 1.0,
    explanation: 'Subject aligned at left power intersection (640, 360), counterbalanced by upper-right sun.',
  },
  {
    id: 'center',
    label: 'Center',
    description: 'Places key subject directly on central crosshairs; creates direct confrontation and formal gravity (Kubrick style).',
    keyRule: 'Direct convergence on viewport center (960, 540)',
    defaultOffsetX: 0,
    defaultOffsetY: 0,
    defaultScale: 1.0,
    explanation: 'Subject dead-center on crosshairs with balanced symmetrical vertical architecture.',
  },
  {
    id: 'golden-ratio',
    label: 'Golden Ratio (Phi)',
    description: 'Fibonacci logarithmic spiral (1:1.618); guides the viewer’s eye naturally towards the focal point in harmonic flow.',
    keyRule: 'Phi ratio 1.6180339 harmonic proportion',
    defaultOffsetX: 228,
    defaultOffsetY: -42,
    defaultScale: 1.0,
    explanation: 'Subject eye rests precisely inside the logarithmic Fibonacci phi focal apex at (1188, 412).',
  },
  {
    id: 'symmetry',
    label: 'Symmetry',
    description: 'Mirrors elements across the central vertical axis; produces solemnity, order, grandeur, or surreal stillness (Wes Anderson).',
    keyRule: 'Bilateral vertical equilibrium across X = 960px',
    defaultOffsetX: 0,
    defaultOffsetY: 0,
    defaultScale: 1.0,
    explanation: 'Bilateral order with matching architectural columns at X: 480 and X: 1440 across the central axis.',
  },
  {
    id: 'leading-lines',
    label: 'Leading Lines',
    description: 'Natural environmental lines (parapet, rooflines, buildings) converge toward the character, pulling viewer attention directly.',
    keyRule: 'Orthogonal perspective convergence toward focal anchor',
    defaultOffsetX: 140,
    defaultOffsetY: 0,
    defaultScale: 1.05,
    explanation: 'Physical rooftop stage joints and coping lines angle from bottom corners directly to subject feet.',
  },
  {
    id: 'diagonal',
    label: 'Diagonal',
    description: 'Dynamic diagonal lines create motion, tension, speed, and narrative instability across the screen.',
    keyRule: 'Opposing corner vectors generating kinetic tension',
    defaultOffsetX: -280,
    defaultOffsetY: 40,
    defaultScale: 0.95,
    explanation: 'Diagonal architectural cantilever and dynamic tension vector guide viewer eye along dynamic diagonal visual flow.',
  },
  {
    id: 'triangles',
    label: 'Triangles',
    description: 'Arranges visual weights into a pyramidal or triangular structure; conveys stability or dynamic hierarchy.',
    keyRule: 'Triadic balance between head, hands, and environment',
    defaultOffsetX: 0,
    defaultOffsetY: -50,
    defaultScale: 1.0,
    explanation: 'Architectural gable pediment behind character establishes a solid Renaissance triangular pyramid.',
  },
  {
    id: 'negative-space',
    label: 'Negative Space',
    description: 'Deliberately leaves large open breathing areas (sky or wall) around subject to convey loneliness or anticipation.',
    keyRule: 'Positive subject mass < 30% of total frame surface',
    defaultOffsetX: 540,
    defaultOffsetY: 100,
    defaultScale: 0.82,
    explanation: 'Subject placed in lower-right corner; over 76% of frame surface opens into serene negative sky.',
  },
  {
    id: 'frame-in-frame',
    label: 'Frame Within Frame',
    description: 'Uses architectural elements, doorways, or window frames to box the subject, adding psychological depth or trapping.',
    keyRule: 'Secondary internal framing boundary',
    defaultOffsetX: 0,
    defaultOffsetY: 10,
    defaultScale: 0.95,
    explanation: 'Architectural pergola uprights and lintel beam frame the character in a secondary internal portal.',
  },
  {
    id: 'visual-balance',
    label: 'Visual Balance',
    description: 'Balancing visual weights across the composition (e.g. character mass counterbalanced by sun and architecture).',
    keyRule: 'Left/Right visual mass moment equilibrium',
    defaultOffsetX: -380,
    defaultOffsetY: 0,
    defaultScale: 1.0,
    explanation: 'Left subject mass is dynamically counterbalanced by prominent right architectural tower and sun.',
  },
  {
    id: 'depth',
    label: 'Depth (Foreground/Mid/Back)',
    description: 'Layers foreground elements, subject midground, and background city to produce deep 3D spatial presence in a 2D plane.',
    keyRule: 'Three-plane spatial separation (z-axis)',
    defaultOffsetX: 60,
    defaultOffsetY: 0,
    defaultScale: 1.0,
    explanation: 'Blurred foreground railing, sharp midground actor, and soft distant skyline establish deep 3D presence.',
  },
];

export const CompositionSection: React.FC = () => {
  const [selectedGuide, setSelectedGuide] = useState<CompositionGuide>('rule-of-thirds');
  const [showOverlays, setShowOverlays] = useState<boolean>(true);

  const initialPreset = COMPOSITION_GUIDES[0];
  const [subjectOffsetX, setSubjectOffsetX] = useState<number>(initialPreset.defaultOffsetX);
  const [subjectOffsetY, setSubjectOffsetY] = useState<number>(initialPreset.defaultOffsetY);
  const [subjectScale, setSubjectScale] = useState<number>(initialPreset.defaultScale);
  const [guideOpacity, setGuideOpacity] = useState<number>(0.8);

  const animRef = useRef<number | null>(null);
  const currentXRef = useRef<number>(subjectOffsetX);
  const currentYRef = useRef<number>(subjectOffsetY);
  const currentScaleRef = useRef<number>(subjectScale);

  useEffect(() => {
    currentXRef.current = subjectOffsetX;
  }, [subjectOffsetX]);

  useEffect(() => {
    currentYRef.current = subjectOffsetY;
  }, [subjectOffsetY]);

  useEffect(() => {
    currentScaleRef.current = subjectScale;
  }, [subjectScale]);

  const active = COMPOSITION_GUIDES.find((g) => g.id === selectedGuide) || COMPOSITION_GUIDES[0];

  const animateToPreset = (targetX: number, targetY: number, targetScale: number) => {
    if (animRef.current !== null) {
      cancelAnimationFrame(animRef.current);
    }

    const startX = currentXRef.current;
    const startY = currentYRef.current;
    const startScale = currentScaleRef.current;
    const startTime = performance.now();
    const duration = 280; // Fast, snappy, subtle transition

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease-out cubic: 1 - (1 - progress)^3
      const ease = 1 - Math.pow(1 - progress, 3);

      const nextX = Math.round(startX + (targetX - startX) * ease);
      const nextY = Math.round(startY + (targetY - startY) * ease);
      const nextScale = parseFloat((startScale + (targetScale - startScale) * ease).toFixed(3));

      setSubjectOffsetX(nextX);
      setSubjectOffsetY(nextY);
      setSubjectScale(nextScale);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        animRef.current = null;
      }
    };

    animRef.current = requestAnimationFrame(step);
  };

  const handleSelectGuide = (guide: GuideData) => {
    setSelectedGuide(guide.id);
    setShowOverlays(true);
    animateToPreset(guide.defaultOffsetX, guide.defaultOffsetY, guide.defaultScale);
  };

  const handleResetToPreset = () => {
    animateToPreset(active.defaultOffsetX, active.defaultOffsetY, active.defaultScale);
  };

  const isManuallyAdjusted =
    Math.abs(subjectOffsetX - active.defaultOffsetX) > 5 ||
    Math.abs(subjectOffsetY - active.defaultOffsetY) > 5 ||
    Math.abs(subjectScale - active.defaultScale) > 0.05;

  return (
    <ToolWorkspaceLayout
      title="Composition"
      subtitle="Geometric framing guides, power points, harmonic proportion, and visual balance"
      headerAction={
        <div className="flex items-center gap-3">
          <Toggle
            label="Guide Overlay"
            checked={showOverlays}
            onChange={setShowOverlays}
            description="Technical CAD grid on frame"
          />
        </div>
      }
      visualization={
        <CameraPOVView
          compositionGuide={showOverlays ? selectedGuide : null}
          customSubjectOffsetX={subjectOffsetX}
          customSubjectOffsetY={subjectOffsetY}
          customShotMultiplier={subjectScale}
          guideOpacity={showOverlays ? guideOpacity : 0}
          customOverlayText={showOverlays ? `${active.label} · ${active.keyRule}` : 'Clean Viewfinder'}
        />
      }
      results={
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <TechnicalResult
            label="Active Composition System"
            value={active.label}
            subtext={active.explanation}
            highlight
          />
          <TechnicalResult
            label="Guiding Geometric Principle"
            value={active.keyRule}
            subtext={active.description}
          />
          <TechnicalResult
            label="Frame Position & Scale"
            value={`X: ${Math.round(960 + subjectOffsetX)}px · Y: ${Math.round(454 + subjectOffsetY)}px`}
            unit={`${subjectScale.toFixed(2)}x scale`}
            subtext={isManuallyAdjusted ? 'Fine-tuned by user' : 'Preset aligned focal anchor'}
          />
        </div>
      }
      controls={
        <div className="space-y-4">
          {/* Compositional Presets */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Compositional Principles &amp; Setups
              </span>
              {isManuallyAdjusted && (
                <button
                  type="button"
                  onClick={handleResetToPreset}
                  className="text-xs font-medium text-amber-400 hover:text-amber-300 underline cursor-pointer transition-colors"
                >
                  Reset to Preset
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMPOSITION_GUIDES.map((guide) => (
                <PresetButton
                  key={guide.id}
                  label={guide.label}
                  active={selectedGuide === guide.id}
                  onClick={() => handleSelectGuide(guide)}
                />
              ))}
            </div>
          </div>

          {/* Framing Fine-Tuning Controls */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3.5">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Subject Placement &amp; Viewfinder Controls
            </span>
            <ParameterControl
              label="Subject Horizontal Offset"
              value={subjectOffsetX}
              min={-600}
              max={600}
              step={10}
              unit="px"
              onChange={(val) => setSubjectOffsetX(val)}
              description="Shift focal anchor horizontally across thirds lines"
            />
            <ParameterControl
              label="Subject Vertical Offset"
              value={subjectOffsetY}
              min={-200}
              max={200}
              step={5}
              unit="px"
              onChange={(val) => setSubjectOffsetY(val)}
              description="Adjust eye level relative to horizontal guidelines"
            />
            <ParameterControl
              label="Framing Scale"
              value={parseFloat(subjectScale.toFixed(2))}
              min={0.5}
              max={1.8}
              step={0.05}
              unit="x"
              onChange={(val) => setSubjectScale(val)}
              description="Actor visual mass relative to frame surface"
            />
            <ParameterControl
              label="Guide Overlay Opacity"
              value={Math.round(guideOpacity * 100)}
              min={10}
              max={100}
              step={5}
              unit="%"
              onChange={(val) => setGuideOpacity(val / 100)}
              description="CAD guide overlay visibility on viewfinder"
            />
          </div>
        </div>
      }
    />
  );
};
