import React, { useState } from 'react';
import { CameraPOVView } from '../scene/CameraPOVView';
import { TechnicalResult } from '../common/TechnicalResult';
import { PresetButton } from '../common/PresetButton';
import { ToolWorkspaceLayout } from '../layout/ToolWorkspaceLayout';
import { ShotType } from '../../types/cinematography';

interface ShotTypeData {
  id: ShotType;
  label: string;
  abbreviation: string;
  framing: string;
  purpose: string;
}

const SHOT_TYPES_LIST: ShotTypeData[] = [
  {
    id: 'extreme-wide',
    label: 'Extreme Wide Shot',
    abbreviation: 'EWS',
    framing: 'Subject is tiny, background environment dominates',
    purpose: 'Establishing spatial context, solitude, or vast scale',
  },
  {
    id: 'wide',
    label: 'Wide Shot',
    abbreviation: 'WS',
    framing: 'Subject full body with ample room around',
    purpose: 'Situates character within location and relative physical geography',
  },
  {
    id: 'full',
    label: 'Full Shot',
    abbreviation: 'FS',
    framing: 'Head to toe fits snug in the frame',
    purpose: 'Body language, costume, physical action, and silhouette',
  },
  {
    id: 'medium',
    label: 'Medium Shot',
    abbreviation: 'MS',
    framing: 'Waist-up framing',
    purpose: 'Standard dialogue shot balancing facial expression and hand gestures',
  },
  {
    id: 'medium-close-up',
    label: 'Medium Close-Up',
    abbreviation: 'MCU',
    framing: 'Chest / shoulders up',
    purpose: 'Intimacy and nuance without fully isolating character from setting',
  },
  {
    id: 'close-up',
    label: 'Close-Up',
    abbreviation: 'CU',
    framing: 'Face fills frame from chin to forehead',
    purpose: 'Peak emotional resonance, micro-expressions, vulnerability',
  },
  {
    id: 'extreme-close-up',
    label: 'Extreme Close-Up',
    abbreviation: 'ECU',
    framing: 'Eyes or mouth fills the frame',
    purpose: 'Intense drama, tension, shock, or sensory detail',
  },
  {
    id: 'ots',
    label: 'Over The Shoulder',
    abbreviation: 'OTS',
    framing: 'Looking past the shoulder of foreground character',
    purpose: 'Dialogue exchange, establishing conversational relationship',
  },
  {
    id: 'pov',
    label: 'Point of View',
    abbreviation: 'POV',
    framing: 'Direct first-person sightline of the character',
    purpose: 'Subjective immersion: viewer sees exactly what character sees',
  },
  {
    id: 'two-shot',
    label: 'Two Shot',
    abbreviation: '2S',
    framing: 'Two characters framed together in the same composition',
    purpose: 'Interpersonal tension, romance, rivalry, or parity',
  },
  {
    id: 'insert',
    label: 'Insert Shot',
    abbreviation: 'INS',
    framing: 'Tight isolate on a specific inanimate prop or document',
    purpose: 'Transfers critical plot information directly to audience',
  },
  {
    id: 'cutaway',
    label: 'Cutaway',
    abbreviation: 'CA',
    framing: 'Intercut to an adjacent object, sky, or reaction',
    purpose: 'Rhythm pacing, masking continuity jumps, thematic metaphor',
  },
  {
    id: 'reaction',
    label: 'Reaction Shot',
    abbreviation: 'RXN',
    framing: 'Close-up capture of character listening or responding',
    purpose: 'Guides the emotional reaction of the audience',
  },
];

export const ShotTypesSection: React.FC = () => {
  const [selectedShot, setSelectedShot] = useState<ShotType>('medium');

  const current = SHOT_TYPES_LIST.find((s) => s.id === selectedShot) || SHOT_TYPES_LIST[3];

  return (
    <ToolWorkspaceLayout
      title="Shot Types"
      subtitle="Framing scale, subject proportion, emotional intimacy, and cinematic coverage"
      visualization={
        <CameraPOVView
          shotType={selectedShot}
          customOverlayText={`${current.label} (${current.abbreviation})`}
        />
      }
      results={
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <TechnicalResult
            label="Active Shot Type"
            value={`${current.label} (${current.abbreviation})`}
            subtext="Coverage scale"
            highlight
          />
          <TechnicalResult
            label="Framing Specification"
            value={current.framing}
            subtext="Physical subject boundary"
          />
          <TechnicalResult
            label="Narrative & Emotional Purpose"
            value={current.purpose}
            subtext="Cinematographic intent"
          />
        </div>
      }
      controls={
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Standard Cinematography Shot Sizes
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SHOT_TYPES_LIST.map((shot) => (
                <PresetButton
                  key={shot.id}
                  label={shot.label}
                  sublabel={shot.abbreviation}
                  active={selectedShot === shot.id}
                  onClick={() => setSelectedShot(shot.id)}
                />
              ))}
            </div>
          </div>
        </div>
      }
    />
  );
};
