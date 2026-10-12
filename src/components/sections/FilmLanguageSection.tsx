import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CameraPOVView } from '../scene/CameraPOVView';
import { TechnicalResult } from '../common/TechnicalResult';
import { PresetButton } from '../common/PresetButton';
import { Slider } from '../common/Slider';
import { ToolWorkspaceLayout } from '../layout/ToolWorkspaceLayout';
import { FilmLanguageConcept } from '../../types/cinematography';
import { FilmLanguageState } from '../scene/FilmLanguageOverlay';

interface FilmRuleData {
  id: FilmLanguageConcept;
  label: string;
  tag: string;
  rule: string;
  consequence: string;
}

const FILM_CONCEPTS_LIST: FilmRuleData[] = [
  {
    id: '180-degree',
    label: '180° Rule (Axis of Action)',
    tag: 'Spatial Geometry',
    rule: 'An imaginary axis drawn between characters that all cameras must stay on one side of.',
    consequence: 'Crossing the line flips screen direction, confusing audience mental geography.',
  },
  {
    id: '30-degree',
    label: '30° Rule (Angle Cut Safety)',
    tag: 'Edit Continuity',
    rule: 'Between two sequential shots of the same subject, change camera angle by at least 30° or change focal length significantly.',
    consequence: 'Cuts with < 30° difference feel like accidental, jarring jump cuts.',
  },
  {
    id: 'eyeline',
    label: 'Eyeline Match',
    tag: 'Gaze Vector',
    rule: 'The angle and direction of an actor’s gaze must accurately align with what they are looking at in the subsequent shot.',
    consequence: 'Misaligned eyelines destroy the psychological illusion of shared space.',
  },
  {
    id: 'screen-direction',
    label: 'Screen Direction Continuity',
    tag: 'Vector Continuity',
    rule: 'If a character exits frame left-to-right, they must enter the next frame from screen left to maintain continuous travel.',
    consequence: 'Reversing screen direction without an in-between turn makes them appear to turn back.',
  },
  {
    id: 'continuity',
    label: 'Physical Continuity',
    tag: 'Consistency',
    rule: 'Matching props, hand positions, costumes, and environmental state across different takes and camera setups.',
    consequence: 'Inconsistencies shatter narrative immersion.',
  },
  {
    id: 'match-cut',
    label: 'Match Cut',
    tag: 'Graphic / Audio',
    rule: 'Cutting between two distinct scenes using a matching graphic shape, motion vector, or audio bridge.',
    consequence: 'Connects ideas, epochs, or characters thematically (e.g. bone to spaceship in 2001).',
  },
  {
    id: 'jump-cut',
    label: 'Jump Cut',
    tag: 'Elliptical Time',
    rule: 'A sudden cut between two shots of the exact same subject with minimal camera movement.',
    consequence: 'Compresses time elastically or introduces frantic anxiety (French New Wave).',
  },
  {
    id: 'establishing',
    label: 'Establishing Shot',
    tag: 'Orientation',
    rule: 'A wide or extreme wide shot placed at the head of a scene to anchor location and time.',
    consequence: 'Gives the audience spatial bearings before intimate close-up coverage.',
  },
  {
    id: 'master-shot',
    label: 'Master Shot',
    tag: 'Scene Foundation',
    rule: 'A continuous recording of the entire scene from start to finish encompassing all characters.',
    consequence: 'Serves as safety net in the edit suite and reference for coverage continuity.',
  },
  {
    id: 'coverage',
    label: 'Scene Coverage',
    tag: 'Production Architecture',
    rule: 'Shooting complementary angles (mediums, over-the-shoulders, close-ups, inserts) to give the editor narrative options.',
    consequence: 'Enables pacing control, performance selection, and musical rhythm.',
  },
  {
    id: 'reaction-shot',
    label: 'Reaction Shot',
    tag: 'Emotional Resonance',
    rule: 'Cutting to a listening character to witness their internal response to dialogue or events.',
    consequence: 'Cinema is built in the reaction: teaches the audience how to feel about the plot.',
  },
  {
    id: 'eye-trace',
    label: 'Eye Trace',
    tag: 'Perceptual Flow',
    rule: 'Orchestrating composition so the viewer’s focal point at the end of Shot A matches the start of Shot B.',
    consequence: 'Creates seamless, invisible Hollywood continuity editing.',
  },
];

export const FilmLanguageSection: React.FC = () => {
  const [selectedConcept, setSelectedConcept] = useState<FilmLanguageConcept>('180-degree');

  // 180° Rule State
  const [axis180ActiveCam, setAxis180ActiveCam] = useState<'cam-a' | 'cam-b' | 'cam-crossed'>('cam-a');
  const [axis180AngleDeg, setAxis180AngleDeg] = useState<number>(0);
  const [axis180Mode, setAxis180Mode] = useState<'correct' | 'crossed'>('correct');
  const [axis180Phase, setAxis180Phase] = useState<'shot-a' | 'cut' | 'shot-b'>('shot-a');
  const [axis180ReplayTrigger, setAxis180ReplayTrigger] = useState<number>(0);
  const isAxis180UserInteractingRef = useRef<boolean>(false);
  const axis180UserTimeoutRef = useRef<number | null>(null);

  const startAxis180AutoReplay = useCallback(() => {
    isAxis180UserInteractingRef.current = false;
    setAxis180ReplayTrigger((prev) => prev + 1);
  }, []);

  const handleAxis180ModeChange = (mode: 'correct' | 'crossed') => {
    isAxis180UserInteractingRef.current = true;
    if (axis180UserTimeoutRef.current !== null) {
      window.clearTimeout(axis180UserTimeoutRef.current);
    }
    setAxis180Mode(mode);
    setAxis180ActiveCam(mode === 'correct' ? 'cam-b' : 'cam-crossed');
    setAxis180Phase('shot-b');
    axis180UserTimeoutRef.current = window.setTimeout(() => {
      startAxis180AutoReplay();
    }, 3500);
  };

  const handleAxis180ShotA = () => {
    isAxis180UserInteractingRef.current = true;
    if (axis180UserTimeoutRef.current !== null) {
      window.clearTimeout(axis180UserTimeoutRef.current);
    }
    setAxis180Phase('shot-a');
    setAxis180ActiveCam('cam-a');
    axis180UserTimeoutRef.current = window.setTimeout(() => {
      startAxis180AutoReplay();
    }, 3500);
  };

  const handleAxis180Cut = () => {
    isAxis180UserInteractingRef.current = true;
    if (axis180UserTimeoutRef.current !== null) {
      window.clearTimeout(axis180UserTimeoutRef.current);
    }
    setAxis180Phase('cut');
    axis180UserTimeoutRef.current = window.setTimeout(() => {
      startAxis180AutoReplay();
    }, 3500);
  };

  const handleAxis180ShotB = () => {
    isAxis180UserInteractingRef.current = true;
    if (axis180UserTimeoutRef.current !== null) {
      window.clearTimeout(axis180UserTimeoutRef.current);
    }
    setAxis180Phase('shot-b');
    setAxis180ActiveCam(axis180Mode === 'correct' ? 'cam-b' : 'cam-crossed');
    axis180UserTimeoutRef.current = window.setTimeout(() => {
      startAxis180AutoReplay();
    }, 3500);
  };

  const handleTriggerAxis180Replay = () => {
    if (axis180UserTimeoutRef.current !== null) {
      window.clearTimeout(axis180UserTimeoutRef.current);
      axis180UserTimeoutRef.current = null;
    }
    startAxis180AutoReplay();
  };

  // 180° Rule Automatic Controlled Replay Animation
  useEffect(() => {
    if (selectedConcept !== '180-degree') return;

    let timerId: number | null = null;
    let isCancelled = false;

    const runSequence = () => {
      if (isCancelled || isAxis180UserInteractingRef.current) return;

      // Phase 1: SHOT A (2000ms)
      setAxis180Phase('shot-a');
      setAxis180ActiveCam('cam-a');

      timerId = window.setTimeout(() => {
        if (isCancelled || isAxis180UserInteractingRef.current) return;

        // Phase 2: HARD CUT (160ms)
        setAxis180Phase('cut');

        timerId = window.setTimeout(() => {
          if (isCancelled || isAxis180UserInteractingRef.current) return;

          // Phase 3: SHOT B (2200ms)
          setAxis180Phase('shot-b');
          setAxis180ActiveCam(axis180Mode === 'correct' ? 'cam-b' : 'cam-crossed');

          timerId = window.setTimeout(() => {
            if (isCancelled || isAxis180UserInteractingRef.current) return;

            // Loop again
            runSequence();
          }, 2200);
        }, 160);
      }, 2000);
    };

    runSequence();

    return () => {
      isCancelled = true;
      if (timerId !== null) window.clearTimeout(timerId);
      if (axis180UserTimeoutRef.current !== null) {
        window.clearTimeout(axis180UserTimeoutRef.current);
      }
    };
  }, [selectedConcept, axis180ReplayTrigger, axis180Mode]);

  // 30° Rule State
  const [angle30DiffDeg, setAngle30DiffDeg] = useState<number>(35);
  const [angle30Mode, setAngle30Mode] = useState<'safe' | 'unsafe'>('safe');
  const [angle30Phase, setAngle30Phase] = useState<'shot-a' | 'cut' | 'shot-b'>('shot-a');
  const [angle30ActiveShot, setAngle30ActiveShot] = useState<'shot-a' | 'shot-b' | 'compare'>('shot-a');
  const [angle30ReplayTrigger, setAngle30ReplayTrigger] = useState<number>(0);
  const isAngle30UserInteractingRef = useRef<boolean>(false);
  const angle30UserTimeoutRef = useRef<number | null>(null);

  const startAngle30AutoReplay = useCallback(() => {
    isAngle30UserInteractingRef.current = false;
    setAngle30ReplayTrigger((prev) => prev + 1);
  }, []);

  const handleAngle30ModeChange = (mode: 'safe' | 'unsafe') => {
    isAngle30UserInteractingRef.current = true;
    if (angle30UserTimeoutRef.current !== null) {
      window.clearTimeout(angle30UserTimeoutRef.current);
    }
    setAngle30Mode(mode);
    setAngle30DiffDeg(mode === 'safe' ? 35 : 12);
    setAngle30Phase('shot-b');
    setAngle30ActiveShot('shot-b');
    angle30UserTimeoutRef.current = window.setTimeout(() => {
      startAngle30AutoReplay();
    }, 3800);
  };

  const handleAngle30SliderChange = (newDeg: number) => {
    isAngle30UserInteractingRef.current = true;
    if (angle30UserTimeoutRef.current !== null) {
      window.clearTimeout(angle30UserTimeoutRef.current);
    }
    setAngle30DiffDeg(newDeg);
    setAngle30Mode(newDeg >= 30 ? 'safe' : 'unsafe');
    setAngle30Phase('shot-b');
    setAngle30ActiveShot('shot-b');
    angle30UserTimeoutRef.current = window.setTimeout(() => {
      startAngle30AutoReplay();
    }, 3800);
  };

  const handleAngle30ShotA = () => {
    isAngle30UserInteractingRef.current = true;
    if (angle30UserTimeoutRef.current !== null) {
      window.clearTimeout(angle30UserTimeoutRef.current);
    }
    setAngle30Phase('shot-a');
    setAngle30ActiveShot('shot-a');
    angle30UserTimeoutRef.current = window.setTimeout(() => {
      startAngle30AutoReplay();
    }, 3800);
  };

  const handleAngle30ShotB = () => {
    isAngle30UserInteractingRef.current = true;
    if (angle30UserTimeoutRef.current !== null) {
      window.clearTimeout(angle30UserTimeoutRef.current);
    }
    setAngle30Phase('shot-b');
    setAngle30ActiveShot('shot-b');
    angle30UserTimeoutRef.current = window.setTimeout(() => {
      startAngle30AutoReplay();
    }, 3800);
  };

  const handleTriggerAngle30Replay = () => {
    if (angle30UserTimeoutRef.current !== null) {
      window.clearTimeout(angle30UserTimeoutRef.current);
      angle30UserTimeoutRef.current = null;
    }
    startAngle30AutoReplay();
  };

  // 30° Rule Automatic Controlled Replay Animation: Shot A → CUT → Shot B
  useEffect(() => {
    if (selectedConcept !== '30-degree') return;

    let timerId: number | null = null;
    let isCancelled = false;

    const runSequence = () => {
      if (isCancelled || isAngle30UserInteractingRef.current) return;

      // Phase 1: SHOT A (Initial Framing & Camera Angle)
      setAngle30Phase('shot-a');
      setAngle30ActiveShot('shot-a');

      timerId = window.setTimeout(() => {
        if (isCancelled || isAngle30UserInteractingRef.current) return;

        // Phase 2: EDITORIAL CUT TRANSITION
        setAngle30Phase('cut');

        timerId = window.setTimeout(() => {
          if (isCancelled || isAngle30UserInteractingRef.current) return;

          // Phase 3: SHOT B (Safe Cut or Unsafe Cut Result)
          setAngle30Phase('shot-b');
          setAngle30ActiveShot('shot-b');

          timerId = window.setTimeout(() => {
            if (isCancelled || isAngle30UserInteractingRef.current) return;

            // Loop sequence
            runSequence();
          }, 2400);
        }, 180);
      }, 2000);
    };

    runSequence();

    return () => {
      isCancelled = true;
      if (timerId !== null) window.clearTimeout(timerId);
      if (angle30UserTimeoutRef.current !== null) {
        window.clearTimeout(angle30UserTimeoutRef.current);
      }
    };
  }, [selectedConcept, angle30ReplayTrigger, angle30Mode, angle30DiffDeg]);

  // Eyeline Match State
  const [eyelineGazeDir, setEyelineGazeDir] = useState<'right' | 'left'>('right');
  const [eyelineGazeElevation, setEyelineGazeElevation] = useState<number>(10);
  const [eyelineTargetElevation, setEyelineTargetElevation] = useState<number>(10);
  const [eyelinePhase, setEyelinePhase] = useState<'shot-a' | 'cut' | 'shot-b'>('shot-a');
  const [eyelineReplayTrigger, setEyelineReplayTrigger] = useState<number>(0);
  const isEyelineUserInteractingRef = useRef<boolean>(false);
  const eyelineUserTimeoutRef = useRef<number | null>(null);

  const startEyelineAutoReplay = useCallback(() => {
    isEyelineUserInteractingRef.current = false;
    setEyelineReplayTrigger((prev) => prev + 1);
  }, []);

  const handleEyelineShotA = () => {
    isEyelineUserInteractingRef.current = true;
    if (eyelineUserTimeoutRef.current !== null) {
      window.clearTimeout(eyelineUserTimeoutRef.current);
    }
    setEyelinePhase('shot-a');
    eyelineUserTimeoutRef.current = window.setTimeout(() => {
      startEyelineAutoReplay();
    }, 3500);
  };

  const handleEyelineShotB = () => {
    isEyelineUserInteractingRef.current = true;
    if (eyelineUserTimeoutRef.current !== null) {
      window.clearTimeout(eyelineUserTimeoutRef.current);
    }
    setEyelinePhase('shot-b');
    eyelineUserTimeoutRef.current = window.setTimeout(() => {
      startEyelineAutoReplay();
    }, 3500);
  };

  const handleEyelineGazeElevationChange = (val: number) => {
    isEyelineUserInteractingRef.current = true;
    if (eyelineUserTimeoutRef.current !== null) {
      window.clearTimeout(eyelineUserTimeoutRef.current);
    }
    setEyelineGazeElevation(val);
    eyelineUserTimeoutRef.current = window.setTimeout(() => {
      startEyelineAutoReplay();
    }, 3500);
  };

  const handleEyelineTargetElevationChange = (val: number) => {
    isEyelineUserInteractingRef.current = true;
    if (eyelineUserTimeoutRef.current !== null) {
      window.clearTimeout(eyelineUserTimeoutRef.current);
    }
    setEyelineTargetElevation(val);
    eyelineUserTimeoutRef.current = window.setTimeout(() => {
      startEyelineAutoReplay();
    }, 3500);
  };

  const handleEyelineGazeDirChange = (dir: 'right' | 'left') => {
    isEyelineUserInteractingRef.current = true;
    if (eyelineUserTimeoutRef.current !== null) {
      window.clearTimeout(eyelineUserTimeoutRef.current);
    }
    setEyelineGazeDir(dir);
    eyelineUserTimeoutRef.current = window.setTimeout(() => {
      startEyelineAutoReplay();
    }, 3500);
  };

  const handleAutoAlignEyeline = () => {
    isEyelineUserInteractingRef.current = true;
    if (eyelineUserTimeoutRef.current !== null) {
      window.clearTimeout(eyelineUserTimeoutRef.current);
    }
    setEyelineTargetElevation(eyelineGazeElevation);
    setEyelinePhase('shot-b');
    eyelineUserTimeoutRef.current = window.setTimeout(() => {
      startEyelineAutoReplay();
    }, 3500);
  };

  const handleInduceMismatch = () => {
    isEyelineUserInteractingRef.current = true;
    if (eyelineUserTimeoutRef.current !== null) {
      window.clearTimeout(eyelineUserTimeoutRef.current);
    }
    setEyelineTargetElevation(eyelineGazeElevation > 0 ? eyelineGazeElevation - 18 : eyelineGazeElevation + 18);
    setEyelinePhase('shot-b');
    eyelineUserTimeoutRef.current = window.setTimeout(() => {
      startEyelineAutoReplay();
    }, 3500);
  };

  const handleTriggerEyelineReplay = () => {
    if (eyelineUserTimeoutRef.current !== null) {
      window.clearTimeout(eyelineUserTimeoutRef.current);
      eyelineUserTimeoutRef.current = null;
    }
    startEyelineAutoReplay();
  };

  // Eyeline Match Automatic Controlled Replay Animation
  useEffect(() => {
    if (selectedConcept !== 'eyeline') return;

    let timerId: number | null = null;
    let isCancelled = false;

    const runSequence = () => {
      if (isCancelled || isEyelineUserInteractingRef.current) return;

      // Phase 1: SHOT A (Character look with sight-line guide, 1800ms)
      setEyelinePhase('shot-a');

      timerId = window.setTimeout(() => {
        if (isCancelled || isEyelineUserInteractingRef.current) return;

        // Phase 2: HARD CUT (150ms)
        setEyelinePhase('cut');

        timerId = window.setTimeout(() => {
          if (isCancelled || isEyelineUserInteractingRef.current) return;

          // Phase 3: SHOT B (Target reveal in matching elevation, 2200ms)
          setEyelinePhase('shot-b');

          timerId = window.setTimeout(() => {
            if (isCancelled || isEyelineUserInteractingRef.current) return;

            // Loop again
            runSequence();
          }, 2200);
        }, 150);
      }, 1800);
    };

    runSequence();

    return () => {
      isCancelled = true;
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
      if (eyelineUserTimeoutRef.current !== null) {
        window.clearTimeout(eyelineUserTimeoutRef.current);
      }
    };
  }, [selectedConcept, eyelineReplayTrigger]);

  // Screen Direction State
  const [screenDirMode, setScreenDirMode] = useState<'consistent' | 'reversed'>('consistent');
  const [screenDirStep, setScreenDirStep] = useState<1 | 2>(1);
  const [screenDirPhase, setScreenDirPhase] = useState<'shot-a' | 'cut' | 'shot-b'>('shot-a');
  const [screenDirProgress, setScreenDirProgress] = useState<number>(0);
  const [screenDirReplayTrigger, setScreenDirReplayTrigger] = useState<number>(0);
  const isScreenDirUserInteractingRef = useRef<boolean>(false);
  const screenDirUserTimeoutRef = useRef<number | null>(null);

  const startScreenDirAutoReplay = useCallback(() => {
    isScreenDirUserInteractingRef.current = false;
    setScreenDirReplayTrigger((prev) => prev + 1);
  }, []);

  const handleScreenDirModeChange = (mode: 'consistent' | 'reversed') => {
    isScreenDirUserInteractingRef.current = true;
    if (screenDirUserTimeoutRef.current !== null) {
      window.clearTimeout(screenDirUserTimeoutRef.current);
    }
    setScreenDirMode(mode);
    screenDirUserTimeoutRef.current = window.setTimeout(() => {
      startScreenDirAutoReplay();
    }, 3500);
  };

  const handleScreenDirShotA = () => {
    isScreenDirUserInteractingRef.current = true;
    if (screenDirUserTimeoutRef.current !== null) {
      window.clearTimeout(screenDirUserTimeoutRef.current);
    }
    setScreenDirPhase('shot-a');
    setScreenDirStep(1);
    setScreenDirProgress(0.5);
    screenDirUserTimeoutRef.current = window.setTimeout(() => {
      startScreenDirAutoReplay();
    }, 3500);
  };

  const handleScreenDirCut = () => {
    isScreenDirUserInteractingRef.current = true;
    if (screenDirUserTimeoutRef.current !== null) {
      window.clearTimeout(screenDirUserTimeoutRef.current);
    }
    setScreenDirPhase('cut');
    screenDirUserTimeoutRef.current = window.setTimeout(() => {
      startScreenDirAutoReplay();
    }, 3500);
  };

  const handleScreenDirShotB = () => {
    isScreenDirUserInteractingRef.current = true;
    if (screenDirUserTimeoutRef.current !== null) {
      window.clearTimeout(screenDirUserTimeoutRef.current);
    }
    setScreenDirPhase('shot-b');
    setScreenDirStep(2);
    setScreenDirProgress(0.5);
    screenDirUserTimeoutRef.current = window.setTimeout(() => {
      startScreenDirAutoReplay();
    }, 3500);
  };

  const handleScreenDirProgressChange = (val: number) => {
    isScreenDirUserInteractingRef.current = true;
    if (screenDirUserTimeoutRef.current !== null) {
      window.clearTimeout(screenDirUserTimeoutRef.current);
    }
    setScreenDirProgress(val);
    screenDirUserTimeoutRef.current = window.setTimeout(() => {
      startScreenDirAutoReplay();
    }, 3500);
  };

  const handleTriggerScreenDirReplay = () => {
    if (screenDirUserTimeoutRef.current !== null) {
      window.clearTimeout(screenDirUserTimeoutRef.current);
      screenDirUserTimeoutRef.current = null;
    }
    startScreenDirAutoReplay();
  };

  // Screen Direction Controlled Cinematic Playback
  useEffect(() => {
    if (selectedConcept !== 'screen-direction') return;

    let animFrameId: number | null = null;
    let startTime: number | null = null;
    let isCancelled = false;

    // Shot A: 2000ms (moves Left to Right)
    // Cut: 160ms (editorial flash)
    // Shot B: 2200ms (moves Left to Right if consistent, Right to Left if reversed)
    // Pause: 400ms
    const SHOT_A_DUR = 2000;
    const CUT_DUR = 160;
    const SHOT_B_DUR = 2200;
    const PAUSE_DUR = 400;
    const TOTAL_CYCLE = SHOT_A_DUR + CUT_DUR + SHOT_B_DUR + PAUSE_DUR;

    const tick = (now: number) => {
      if (isCancelled || isScreenDirUserInteractingRef.current) return;
      if (startTime === null) startTime = now;

      const elapsed = (now - startTime) % TOTAL_CYCLE;

      if (elapsed < SHOT_A_DUR) {
        const p = Math.min(1, Math.max(0, elapsed / SHOT_A_DUR));
        setScreenDirPhase('shot-a');
        setScreenDirStep(1);
        setScreenDirProgress(p);
      } else if (elapsed < SHOT_A_DUR + CUT_DUR) {
        setScreenDirPhase('cut');
      } else if (elapsed < SHOT_A_DUR + CUT_DUR + SHOT_B_DUR) {
        const bElapsed = elapsed - (SHOT_A_DUR + CUT_DUR);
        const p = Math.min(1, Math.max(0, bElapsed / SHOT_B_DUR));
        setScreenDirPhase('shot-b');
        setScreenDirStep(2);
        setScreenDirProgress(p);
      } else {
        setScreenDirPhase('shot-b');
        setScreenDirStep(2);
        setScreenDirProgress(1);
      }

      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);

    return () => {
      isCancelled = true;
      if (animFrameId !== null) cancelAnimationFrame(animFrameId);
      if (screenDirUserTimeoutRef.current !== null) {
        window.clearTimeout(screenDirUserTimeoutRef.current);
      }
    };
  }, [selectedConcept, screenDirReplayTrigger]);

  // Physical Continuity State
  const [continuityMode, setContinuityMode] = useState<'matched' | 'error'>('matched');
  const [continuityStep, setContinuityStep] = useState<1 | 2>(1);

  // Match Cut State
  const [matchCutProgress, setMatchCutProgress] = useState<number>(0);
  const [matchCutType, setMatchCutType] = useState<'circle-eye' | 'silhouette-vector'>('circle-eye');
  const [matchCutPhase, setMatchCutPhase] = useState<'shot-a' | 'match-element' | 'cut' | 'shot-b'>('shot-a');
  const [replayTrigger, setReplayTrigger] = useState<number>(0);
  const isUserInteractingRef = useRef<boolean>(false);
  const userInteractionTimeoutRef = useRef<number | null>(null);

  const startAutoReplay = useCallback(() => {
    isUserInteractingRef.current = false;
    setReplayTrigger((prev) => prev + 1);
  }, []);

  const handleManualScrub = (val: number) => {
    isUserInteractingRef.current = true;
    if (userInteractionTimeoutRef.current !== null) {
      window.clearTimeout(userInteractionTimeoutRef.current);
    }
    setMatchCutProgress(val);
    if (val <= 30) setMatchCutPhase('shot-a');
    else if (val < 70) setMatchCutPhase('match-element');
    else setMatchCutPhase('shot-b');

    // Resume automatic playback after 3.5s of inactivity
    userInteractionTimeoutRef.current = window.setTimeout(() => {
      startAutoReplay();
    }, 3500);
  };

  const handleSelectShotA = () => {
    isUserInteractingRef.current = true;
    if (userInteractionTimeoutRef.current !== null) {
      window.clearTimeout(userInteractionTimeoutRef.current);
    }
    setMatchCutProgress(0);
    setMatchCutPhase('shot-a');
    userInteractionTimeoutRef.current = window.setTimeout(() => {
      startAutoReplay();
    }, 3500);
  };

  const handleSelectMatchElement = () => {
    isUserInteractingRef.current = true;
    if (userInteractionTimeoutRef.current !== null) {
      window.clearTimeout(userInteractionTimeoutRef.current);
    }
    setMatchCutProgress(50);
    setMatchCutPhase('match-element');
    userInteractionTimeoutRef.current = window.setTimeout(() => {
      startAutoReplay();
    }, 3500);
  };

  const handleSelectShotB = () => {
    isUserInteractingRef.current = true;
    if (userInteractionTimeoutRef.current !== null) {
      window.clearTimeout(userInteractionTimeoutRef.current);
    }
    setMatchCutProgress(100);
    setMatchCutPhase('shot-b');
    userInteractionTimeoutRef.current = window.setTimeout(() => {
      startAutoReplay();
    }, 3500);
  };

  const handleTriggerReplay = () => {
    if (userInteractionTimeoutRef.current !== null) {
      window.clearTimeout(userInteractionTimeoutRef.current);
      userInteractionTimeoutRef.current = null;
    }
    startAutoReplay();
  };

  // Match Cut Automatic Controlled Replay Animation
  useEffect(() => {
    if (selectedConcept !== 'match-cut') return;

    let timerId: number | null = null;
    let isCancelled = false;

    const runSequence = () => {
      if (isCancelled || isUserInteractingRef.current) return;

      // Phase 1: SHOT A (1600ms)
      setMatchCutPhase('shot-a');
      setMatchCutProgress(0);

      timerId = window.setTimeout(() => {
        if (isCancelled || isUserInteractingRef.current) return;

        // Phase 2: MATCH ELEMENT Highlight (1200ms)
        setMatchCutPhase('match-element');
        setMatchCutProgress(35);

        timerId = window.setTimeout(() => {
          if (isCancelled || isUserInteractingRef.current) return;

          // Phase 3: THE CUT Flash (180ms)
          setMatchCutPhase('cut');
          setMatchCutProgress(50);

          timerId = window.setTimeout(() => {
            if (isCancelled || isUserInteractingRef.current) return;

            // Phase 4: SHOT B (2200ms)
            setMatchCutPhase('shot-b');
            setMatchCutProgress(100);

            timerId = window.setTimeout(() => {
              if (isCancelled || isUserInteractingRef.current) return;

              // Loop again!
              runSequence();
            }, 2200);
          }, 180);
        }, 1200);
      }, 1600);
    };

    runSequence();

    return () => {
      isCancelled = true;
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
      if (userInteractionTimeoutRef.current !== null) {
        window.clearTimeout(userInteractionTimeoutRef.current);
      }
    };
  }, [selectedConcept, replayTrigger]);

  // Jump Cut State
  const [jumpCutState, setJumpCutState] = useState<'shot-a' | 'shot-b'>('shot-b');
  const [jumpCutPhase, setJumpCutPhase] = useState<'shot-a' | 'cut' | 'shot-b'>('shot-b');
  const [jumpCutOffset, setJumpCutOffset] = useState<number>(48);
  const [jumpCutType, setJumpCutType] = useState<'temporal' | 'spatial'>('temporal');
  const [jumpCutReplayTrigger, setJumpCutReplayTrigger] = useState<number>(0);
  const isJumpCutUserInteractingRef = useRef<boolean>(false);
  const jumpCutUserTimeoutRef = useRef<number | null>(null);

  const startJumpCutAutoReplay = useCallback(() => {
    isJumpCutUserInteractingRef.current = false;
    setJumpCutReplayTrigger((prev) => prev + 1);
  }, []);

  const handleJumpCutShotA = () => {
    isJumpCutUserInteractingRef.current = true;
    if (jumpCutUserTimeoutRef.current !== null) {
      window.clearTimeout(jumpCutUserTimeoutRef.current);
    }
    setJumpCutState('shot-a');
    setJumpCutPhase('shot-a');
    jumpCutUserTimeoutRef.current = window.setTimeout(() => {
      startJumpCutAutoReplay();
    }, 3500);
  };

  const handleJumpCutShotB = () => {
    isJumpCutUserInteractingRef.current = true;
    if (jumpCutUserTimeoutRef.current !== null) {
      window.clearTimeout(jumpCutUserTimeoutRef.current);
    }
    setJumpCutState('shot-b');
    setJumpCutPhase('shot-b');
    jumpCutUserTimeoutRef.current = window.setTimeout(() => {
      startJumpCutAutoReplay();
    }, 3500);
  };

  const handleJumpCutOffsetChange = (val: number) => {
    isJumpCutUserInteractingRef.current = true;
    if (jumpCutUserTimeoutRef.current !== null) {
      window.clearTimeout(jumpCutUserTimeoutRef.current);
    }
    setJumpCutOffset(val);
    setJumpCutState('shot-b');
    setJumpCutPhase('shot-b');
    jumpCutUserTimeoutRef.current = window.setTimeout(() => {
      startJumpCutAutoReplay();
    }, 3500);
  };

  const handleTriggerJumpCutReplay = () => {
    if (jumpCutUserTimeoutRef.current !== null) {
      window.clearTimeout(jumpCutUserTimeoutRef.current);
      jumpCutUserTimeoutRef.current = null;
    }
    startJumpCutAutoReplay();
  };

  // Jump Cut Automatic Controlled Replay Animation
  useEffect(() => {
    if (selectedConcept !== 'jump-cut') return;

    let timerId: number | null = null;
    let isCancelled = false;

    const runSequence = () => {
      if (isCancelled || isJumpCutUserInteractingRef.current) return;

      // Phase 1: SHOT A (1600ms)
      setJumpCutPhase('shot-a');
      setJumpCutState('shot-a');

      timerId = window.setTimeout(() => {
        if (isCancelled || isJumpCutUserInteractingRef.current) return;

        // Phase 2: HARD CUT (150ms)
        setJumpCutPhase('cut');

        timerId = window.setTimeout(() => {
          if (isCancelled || isJumpCutUserInteractingRef.current) return;

          // Phase 3: SHOT B with jump (2200ms)
          setJumpCutPhase('shot-b');
          setJumpCutState('shot-b');

          timerId = window.setTimeout(() => {
            if (isCancelled || isJumpCutUserInteractingRef.current) return;

            // Loop again
            runSequence();
          }, 2200);
        }, 150);
      }, 1600);
    };

    runSequence();

    return () => {
      isCancelled = true;
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
      if (jumpCutUserTimeoutRef.current !== null) {
        window.clearTimeout(jumpCutUserTimeoutRef.current);
      }
    };
  }, [selectedConcept, jumpCutReplayTrigger]);

  // Establishing Shot State
  const [establishingShot, setEstablishingShot] = useState<'wide' | 'medium' | 'close-up'>('wide');
  const [establishingPhase, setEstablishingPhase] = useState<'wide' | 'medium' | 'close-up' | 'cut'>('wide');
  const [establishingScale, setEstablishingScale] = useState<'extreme-wide' | 'wide'>('extreme-wide');
  const [establishingReplayTrigger, setEstablishingReplayTrigger] = useState<number>(0);
  const isEstablishingUserInteractingRef = useRef<boolean>(false);
  const establishingUserTimeoutRef = useRef<number | null>(null);

  const startEstablishingAutoReplay = useCallback(() => {
    isEstablishingUserInteractingRef.current = false;
    setEstablishingReplayTrigger((prev) => prev + 1);
  }, []);

  const handleEstablishingShotChange = (shot: 'wide' | 'medium' | 'close-up') => {
    isEstablishingUserInteractingRef.current = true;
    if (establishingUserTimeoutRef.current !== null) {
      window.clearTimeout(establishingUserTimeoutRef.current);
    }
    setEstablishingShot(shot);
    setEstablishingPhase(shot);
    setEstablishingScale(shot === 'wide' ? 'extreme-wide' : 'wide');
    establishingUserTimeoutRef.current = window.setTimeout(() => {
      startEstablishingAutoReplay();
    }, 4500);
  };

  const handleTriggerEstablishingReplay = () => {
    if (establishingUserTimeoutRef.current !== null) {
      window.clearTimeout(establishingUserTimeoutRef.current);
      establishingUserTimeoutRef.current = null;
    }
    startEstablishingAutoReplay();
  };

  // Establishing Shot Automatic Controlled Sequence: WIDE → CUT → MEDIUM → CUT → CLOSE-UP
  useEffect(() => {
    if (selectedConcept !== 'establishing') return;

    let timerId: number | null = null;
    let isCancelled = false;

    const runSequence = () => {
      if (isCancelled || isEstablishingUserInteractingRef.current) return;

      // 1. ESTABLISHING SHOT - WIDE (2600ms)
      setEstablishingShot('wide');
      setEstablishingPhase('wide');
      setEstablishingScale('extreme-wide');

      timerId = window.setTimeout(() => {
        if (isCancelled || isEstablishingUserInteractingRef.current) return;

        // CUT TRANSITION (180ms)
        setEstablishingPhase('cut');

        timerId = window.setTimeout(() => {
          if (isCancelled || isEstablishingUserInteractingRef.current) return;

          // 2. ACTION SHOT - MEDIUM (2400ms)
          setEstablishingShot('medium');
          setEstablishingPhase('medium');
          setEstablishingScale('wide');

          timerId = window.setTimeout(() => {
            if (isCancelled || isEstablishingUserInteractingRef.current) return;

            // CUT TRANSITION (180ms)
            setEstablishingPhase('cut');

            timerId = window.setTimeout(() => {
              if (isCancelled || isEstablishingUserInteractingRef.current) return;

              // 3. DETAIL SHOT - CLOSE-UP (2400ms)
              setEstablishingShot('close-up');
              setEstablishingPhase('close-up');
              setEstablishingScale('wide');

              timerId = window.setTimeout(() => {
                if (isCancelled || isEstablishingUserInteractingRef.current) return;

                // CUT TRANSITION (180ms)
                setEstablishingPhase('cut');

                timerId = window.setTimeout(() => {
                  if (isCancelled || isEstablishingUserInteractingRef.current) return;

                  // Loop back to Wide
                  runSequence();
                }, 180);
              }, 2400);
            }, 180);
          }, 2400);
        }, 180);
      }, 2600);
    };

    runSequence();

    return () => {
      isCancelled = true;
      if (timerId !== null) window.clearTimeout(timerId);
      if (establishingUserTimeoutRef.current !== null) {
        window.clearTimeout(establishingUserTimeoutRef.current);
      }
    };
  }, [selectedConcept, establishingReplayTrigger]);

  // Master Shot State
  const [masterView, setMasterView] = useState<'master' | 'coverage'>('master');
  const [masterIsPlaying, setMasterIsPlaying] = useState<boolean>(true);
  const [masterProgress, setMasterProgress] = useState<number>(0);
  const [masterStagingZone, setMasterStagingZone] = useState<'full' | 'two-shot'>('full');

  // Master Shot Continuous Action Animation Loop
  useEffect(() => {
    if (selectedConcept !== 'master-shot') return;
    if (!masterIsPlaying) return;

    let rafId: number | null = null;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // 6.0 second loop for crossing action
      setMasterProgress((prev) => {
        const next = prev + dt / 6.0;
        return next >= 1 ? 0 : next;
      });

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [selectedConcept, masterIsPlaying]);

  // Scene Coverage State
  const [coverageShot, setCoverageShot] = useState<'master' | 'wide' | 'medium' | 'close' | 'reaction' | 'insert'>('medium');

  // Reaction Shot State
  const [reactionView, setReactionView] = useState<'action' | 'reaction'>('action');
  const reactionEmotion = 'surprise' as const;
  const [reactionDof, setReactionDof] = useState<'shallow' | 'medium'>('shallow');

  // Eye Trace State
  const [eyeTracePattern, setEyeTracePattern] = useState<'triangle' | 'horizontal' | 'diagonal'>('horizontal');
  const [eyeTraceShowGuide, setEyeTraceShowGuide] = useState<boolean>(true);
  const [eyeTraceActiveNode, setEyeTraceActiveNode] = useState<0 | 1 | 2 | 3>(0);

  const current = FILM_CONCEPTS_LIST.find((c) => c.id === selectedConcept) || FILM_CONCEPTS_LIST[0];

  const filmLanguageState: FilmLanguageState = {
    concept: selectedConcept,
    axis180ActiveCam,
    axis180AngleDeg,
    axis180Mode,
    axis180Phase,
    angle30DiffDeg,
    angle30ActiveShot,
    angle30Phase,
    angle30Mode,
    eyelineGazeDir,
    eyelineGazeElevation,
    eyelineTargetElevation,
    eyelinePhase,
    screenDirMode,
    screenDirStep,
    screenDirPhase,
    screenDirProgress,
    continuityMode,
    continuityStep,
    matchCutProgress,
    matchCutType,
    matchCutPhase,
    jumpCutState,
    jumpCutPhase,
    jumpCutOffset,
    jumpCutType,
    establishingScale,
    establishingShot,
    establishingPhase,
    masterStagingZone,
    masterView,
    masterIsPlaying,
    masterProgress,
    coverageShot,
    reactionView,
    reactionEmotion,
    reactionDof,
    eyeTracePattern,
    eyeTraceActiveNode,
    eyeTraceShowGuide,
  };

  // Determine dynamic live editorial status for Technical Result strip
  const getDynamicStatus = () => {
    switch (selectedConcept) {
      case '180-degree':
        if (axis180Phase === 'shot-a') {
          return 'SHOT A: Establishing Axis of Action (Camera A · Safe Side)';
        } else if (axis180Phase === 'cut') {
          return '[ EDITORIAL CUT TRANSITION ]';
        } else {
          return axis180Mode === 'correct'
            ? '✓ SAME SIDE — CONTINUITY PRESERVED: Both cameras remain on same side of 180° axis'
            : '⚠ CROSSED AXIS — SCREEN POSITIONS REVERSED: Camera crossed line of action!';
        }
      case '30-degree':
        if (angle30Phase === 'shot-a') {
          return 'SHOT A: Initial Framing & Baseline Camera Setup (0°)';
        } else if (angle30Phase === 'cut') {
          return '[ EDITORIAL CUT TRANSITION ]';
        } else {
          return angle30DiffDeg >= 30
            ? `✓ SAFE CUT (Δθ = ${angle30DiffDeg}° ≥ 30°): Distinct angle & framing preserves editorial continuity`
            : `⚠ JUMP-CUT RISK (Δθ = ${angle30DiffDeg}° < 30°): Angle difference too small — accidental jump cut`;
        }
      case 'eyeline':
        if (eyelinePhase === 'shot-a') {
          return `SHOT A: Character Look Vector (Gaze: ${eyelineGazeElevation >= 0 ? '+' : ''}${eyelineGazeElevation}°)`;
        } else if (eyelinePhase === 'cut') {
          return '[ EDITORIAL HARD CUT: REVEAL ]';
        } else {
          return Math.abs(eyelineGazeElevation - eyelineTargetElevation) <= 4
            ? `EYELINE MATCH: Shared Space Validated (Δθ: ${Math.abs(eyelineGazeElevation - eyelineTargetElevation)}°)`
            : `EYELINE MISMATCH: Disconnect of ${Math.abs(eyelineGazeElevation - eyelineTargetElevation)}° Breaks Illusion`;
        }
      case 'screen-direction':
        if (screenDirPhase === 'shot-a') {
          return 'SHOT A: Establishing Screen Direction (Travel Vector: Left → Right)';
        } else if (screenDirPhase === 'cut') {
          return '[ EDITORIAL CUT TRANSITION ]';
        } else {
          return screenDirMode === 'consistent'
            ? 'SHOT B: Screen Direction Continuity Preserved (Unbroken Forward Momentum)'
            : 'SHOT B: Screen Direction Break (180° Axis Crossed · False Opposition)';
        }
      case 'continuity':
        if (continuityStep === 1) {
          return 'SHOT A (BEFORE CUT): Actor holds small red cup in right hand';
        }
        return continuityMode === 'matched'
          ? '✓ SHOT B (AFTER CUT): Physical Continuity Preserved — Red cup held in right hand'
          : '⚠ SHOT B (AFTER CUT): Continuity Break — Red cup accidentally switched to left hand!';
      case 'match-cut':
        if (matchCutPhase === 'shot-a') {
          return 'SHOT A: Daytime Scene · Golden Sun';
        } else if (matchCutPhase === 'match-element') {
          return 'MATCH ELEMENT: Circular Geometry (Sun / Moon Target)';
        } else if (matchCutPhase === 'cut') {
          return '[ EDITORIAL CUT TRANSITION ]';
        } else {
          return 'SHOT B: Night Sky · Celestial Moon (Graphic Match Complete)';
        }
      case 'jump-cut':
        if (jumpCutPhase === 'shot-a') {
          return 'BASELINE SHOT A: Initial Position (T₁: 00:01:14:00)';
        } else if (jumpCutPhase === 'cut') {
          return '[ EDITORIAL HARD CUT: SPLICE ]';
        } else {
          return `DISCONTINUITY: Time Skipped (+${jumpCutOffset} Frames · ${(jumpCutOffset / 30).toFixed(1)}s Jump)`;
        }
      case 'establishing':
        if (establishingPhase === 'cut') {
          return '[ EDITORIAL CUT TRANSITION ]';
        } else if (establishingShot === 'wide') {
          return '1. ESTABLISHING SHOT (WIDE): Full Location, Entrance & Spatial Anchor';
        } else if (establishingShot === 'medium') {
          return '2. ACTION SHOT (MEDIUM): Characters Framed Within Known Environment';
        } else {
          return '3. DETAIL SHOT (CLOSE-UP): Emotional Focus Anchored in Established Scene';
        }
      case 'master-shot':
        return masterView === 'master'
          ? 'MASTER SHOT: Complete Scene Coverage (Both Characters Visible Continuously · 100% Action)'
          : 'COVERAGE SHOT: Closer Selective Coverage (Actor A Focused · Partial Scene Detail)';
      case 'coverage':
        return `ACTIVE COVERAGE: ${coverageShot.toUpperCase()} SHOT`;
      case 'reaction-shot':
        return reactionView === 'action'
          ? 'ACTION SHOT: Two-Shot Setup (Actor A Speaking · Actor B Listening)'
          : `REACTION SHOT: Close-Up on Listener (Actor B · ${reactionEmotion.toUpperCase()})`;
      case 'eye-trace':
        {
          const targetLabel =
            eyeTracePattern === 'horizontal'
              ? 'EYE-LEVEL BEACON'
              : eyeTracePattern === 'diagonal'
              ? 'LOW NARRATIVE PROP'
              : 'HIGH OVERHEAD LUMINAIRE';
          return `EYE TRACE: Character Gaze Directs Attention → ${targetLabel} (${eyeTraceShowGuide ? 'Guide Visible' : 'Guide Hidden'})`;
        }
      default:
        return current.rule;
    }
  };

  return (
    <ToolWorkspaceLayout
      title="Film Language"
      subtitle="Cinematic grammar: 180° rule, 30° rule, eyeline matching, screen direction, and eye trace"
      visualization={
        <CameraPOVView
          filmConcept={selectedConcept}
          filmLanguageState={filmLanguageState}
          customOverlayText={current.label}
        />
      }
      results={
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <TechnicalResult
            label="Active Cinematic Principle"
            value={current.label}
            subtext={current.tag}
            highlight
          />
          <TechnicalResult
            label="Live Editorial Status"
            value={getDynamicStatus()}
            subtext="Real-time optical evaluation"
          />
          <TechnicalResult
            label="Audience Perception & Risk"
            value={current.consequence}
            subtext="Cognitive impact on audience"
          />
        </div>
      }
      controls={
        <div className="space-y-4">
          {/* 1. Cinematic Principle Presets Selection */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Fundamental Rules of Film Language
            </span>
            <div className="grid grid-cols-2 gap-2">
              {FILM_CONCEPTS_LIST.map((concept) => (
                <PresetButton
                  key={concept.id}
                  label={concept.label}
                  sublabel={concept.tag}
                  active={selectedConcept === concept.id}
                  onClick={() => setSelectedConcept(concept.id)}
                />
              ))}
            </div>
          </div>

          {/* 2. Dedicated Interactive Demonstration Controls for Active Principle */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                {current.label} — Live Interactive Controls
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Interactive
              </span>
            </div>

            {/* 180° RULE CONTROLS */}
            {selectedConcept === '180-degree' && (
              <div className="space-y-3.5">
                {/* 1. Correct vs Broken Mode Toggle */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-300">Coverage Consistency Mode</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAxis180ModeChange('correct')}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        axis180Mode === 'correct'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-950'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Same Side (Preserved ✓)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAxis180ModeChange('crossed')}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        axis180Mode === 'crossed'
                          ? 'bg-red-600 text-white border-red-500 shadow-sm shadow-red-950'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Crossed Axis (Broken ⚠)
                    </button>
                  </div>
                </div>

                {/* 2. Sequence Playback */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-300">Sequence Playback</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={handleAxis180ShotA}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        axis180Phase === 'shot-a'
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Shot A (Cam A)
                    </button>
                    <button
                      type="button"
                      onClick={handleAxis180Cut}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        axis180Phase === 'cut'
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Cut
                    </button>
                    <button
                      type="button"
                      onClick={handleAxis180ShotB}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        axis180Phase === 'shot-b'
                          ? axis180Mode === 'correct'
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-red-600 text-white border-red-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Shot B {axis180Mode === 'correct' ? '(Cam B)' : '(Crossed)'}
                    </button>
                  </div>
                </div>

                {/* 3. Replay Full Sequence */}
                <button
                  type="button"
                  onClick={handleTriggerAxis180Replay}
                  className="w-full py-1.5 px-3 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>↺</span>
                  <span>Play Full Sequence (Shot A → Cut → Shot B)</span>
                </button>

                {/* 4. Axis of Action Angle Slider (Preserved existing control) */}
                <Slider
                  label="Axis of Action Angle"
                  value={axis180AngleDeg}
                  min={-30}
                  max={30}
                  step={1}
                  unit="°"
                  onChange={setAxis180AngleDeg}
                />

                {/* 5. Educational Explanation Box */}
                <div
                  className={`p-3 rounded-lg border text-xs font-medium leading-relaxed ${
                    axis180Mode === 'correct'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/40 border-red-500/40 text-red-300'
                  }`}
                >
                  {axis180Mode === 'correct'
                    ? '✓ SAME SIDE — CONTINUITY PRESERVED: Both Camera A and Camera B stay on the same side of the 180° line. Characters face inward toward each other across the cut (Left → vs ← Right).'
                    : '⚠ CROSSED AXIS — SCREEN POSITIONS REVERSED: Moving Camera B across the axis inverts characters\' screen positions, shattering spatial orientation!'}
                </div>
              </div>
            )}

            {/* 30° RULE CONTROLS */}
            {selectedConcept === '30-degree' && (
              <div className="space-y-3.5">
                {/* 1. Toggle Selector for Safe Cut (30°+) vs Unsafe Cut (under 30°) */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-300">Cut Classification</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAngle30ModeChange('safe')}
                      className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        angle30Mode === 'safe'
                          ? 'bg-emerald-600/90 text-white border-emerald-400 shadow-lg shadow-emerald-950/40'
                          : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        Safe Cut (30°+)
                      </span>
                      <span className="text-[10px] font-normal text-emerald-200/80">Continuous Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAngle30ModeChange('unsafe')}
                      className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        angle30Mode === 'unsafe'
                          ? 'bg-red-600/90 text-white border-red-400 shadow-lg shadow-red-950/40'
                          : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-400"></span>
                        Unsafe Cut (&lt; 30°)
                      </span>
                      <span className="text-[10px] font-normal text-red-200/80">Jump-Cut Risk</span>
                    </button>
                  </div>
                </div>

                {/* 2. Sequence State & Replay Controls */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-300">Shot Sequence (Shot A → CUT → Shot B)</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={handleAngle30ShotA}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        angle30Phase === 'shot-a'
                          ? 'bg-sky-600 text-white border-sky-400 shadow'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Shot A (0°)
                    </button>
                    <button
                      type="button"
                      onClick={handleAngle30ShotB}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        angle30Phase === 'shot-b'
                          ? angle30DiffDeg >= 30
                            ? 'bg-emerald-600 text-white border-emerald-400 shadow'
                            : 'bg-red-600 text-white border-red-400 shadow'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Shot B (Cut)
                    </button>
                    <button
                      type="button"
                      onClick={handleTriggerAngle30Replay}
                      className="py-1.5 px-2 text-xs font-semibold rounded border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>⟳</span> Replay
                    </button>
                  </div>
                </div>

                {/* 3. Angular Camera Difference Slider */}
                <Slider
                  label="Angular Camera Difference (Δθ)"
                  value={angle30DiffDeg}
                  min={5}
                  max={60}
                  step={1}
                  unit="°"
                  onChange={handleAngle30SliderChange}
                />

                {/* 4. Quick Presets */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-300">Angle Presets</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAngle30SliderChange(12)}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        angle30DiffDeg === 12
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      12° (Jump-Cut Risk)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAngle30SliderChange(35)}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        angle30DiffDeg === 35
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      35° (Safe Cut)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAngle30SliderChange(50)}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        angle30DiffDeg === 50
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      50° (Distinct)
                    </button>
                  </div>
                </div>

                {/* 5. Editorial Consequence Card */}
                <div
                  className={`p-3 rounded-lg border text-xs font-medium leading-relaxed ${
                    angle30DiffDeg < 30
                      ? 'bg-red-950/40 border-red-500/40 text-red-300'
                      : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  {angle30DiffDeg < 30
                    ? `⚠ JUMP-CUT RISK (Δθ = ${angle30DiffDeg}° < 30° Threshold): Camera angle changes by less than 30°. The framing is too similar to Shot A, creating an accidental, jarring jump cut.`
                    : `✓ SAFE CUT (Δθ = ${angle30DiffDeg}° ≥ 30° Threshold): Camera angle changes by at least 30°. The noticeably distinct framing and viewpoint feel purposeful, preserving smooth editorial continuity.`}
                </div>
              </div>
            )}

            {/* EYELINE MATCH CONTROLS */}
            {selectedConcept === 'eyeline' && (
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-300">Edit Cut State</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleEyelineShotA}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        eyelinePhase === 'shot-a'
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                      }`}
                    >
                      Shot A: Character Look
                    </button>
                    <button
                      type="button"
                      onClick={handleEyelineShotB}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        eyelinePhase === 'shot-b'
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                      }`}
                    >
                      Shot B: Target Reveal
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-300">Screen Gaze Direction</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleEyelineGazeDirChange('right')}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        eyelineGazeDir === 'right'
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                      }`}
                    >
                      Look Screen-Right →
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEyelineGazeDirChange('left')}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        eyelineGazeDir === 'left'
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                      }`}
                    >
                      ← Look Screen-Left
                    </button>
                  </div>
                </div>

                <Slider
                  label="Actor Gaze Elevation"
                  value={eyelineGazeElevation}
                  min={-25}
                  max={25}
                  step={1}
                  unit="°"
                  onChange={handleEyelineGazeElevationChange}
                />

                <Slider
                  label="Target Object Elevation"
                  value={eyelineTargetElevation}
                  min={-25}
                  max={25}
                  step={1}
                  unit="°"
                  onChange={handleEyelineTargetElevationChange}
                />

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleAutoAlignEyeline}
                    className="py-1.5 px-2 text-xs font-semibold rounded border bg-blue-600 text-white border-blue-500 hover:bg-blue-500 transition-colors cursor-pointer"
                  >
                    Auto-Align Eyeline (Match)
                  </button>
                  <button
                    type="button"
                    onClick={handleInduceMismatch}
                    className="py-1.5 px-2 text-xs font-semibold rounded border bg-slate-900 text-slate-300 border-slate-700 hover:text-white transition-colors cursor-pointer"
                  >
                    Induce Mismatch (Break)
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleTriggerEyelineReplay}
                    className="w-full py-1.5 px-3 text-xs font-semibold rounded border bg-slate-800/80 hover:bg-slate-700/80 text-sky-300 border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>▶</span>
                    <span>Replay Eyeline Sequence</span>
                  </button>
                </div>

                <div
                  className={`p-3 rounded-lg border text-xs font-medium leading-relaxed ${
                    Math.abs(eyelineGazeElevation - eyelineTargetElevation) <= 4
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-orange-950/40 border-orange-500/40 text-orange-300'
                  }`}
                >
                  {Math.abs(eyelineGazeElevation - eyelineTargetElevation) <= 4
                    ? '✓ EYELINE MATCH: The actor’s gaze vector and the subsequent target object align perfectly, validating shared spatial geography.'
                    : `⚠ EYELINE MISMATCH: Gaze vector misses the target object by ${Math.abs(eyelineGazeElevation - eyelineTargetElevation)}°, shattering psychological immersion.`}
                </div>
              </div>
            )}

            {/* SCREEN DIRECTION CONTROLS */}
            {selectedConcept === 'screen-direction' && (
              <div className="space-y-3.5">
                {/* 1. Travel Direction Continuity Mode Toggle */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-300">Direction Continuity Mode</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleScreenDirModeChange('consistent')}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        screenDirMode === 'consistent'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-950'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Continuous (Left → Right)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScreenDirModeChange('reversed')}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        screenDirMode === 'reversed'
                          ? 'bg-red-600 text-white border-red-500 shadow-sm shadow-red-950'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Reversed (Direction Break ⚠)
                    </button>
                  </div>
                </div>

                {/* 2. Sequence Shot State */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-300">Sequence Playback</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={handleScreenDirShotA}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        screenDirPhase === 'shot-a'
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Shot A
                    </button>
                    <button
                      type="button"
                      onClick={handleScreenDirCut}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        screenDirPhase === 'cut'
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Cut
                    </button>
                    <button
                      type="button"
                      onClick={handleScreenDirShotB}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        screenDirPhase === 'shot-b'
                          ? screenDirMode === 'consistent'
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-red-600 text-white border-red-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Shot B
                    </button>
                  </div>
                </div>

                {/* 3. Replay Full Sequence */}
                <button
                  type="button"
                  onClick={handleTriggerScreenDirReplay}
                  className="w-full py-1.5 px-3 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>↺</span>
                  <span>Play Full Sequence (Shot A → Cut → Shot B)</span>
                </button>

                {/* 4. Movement Position Scrubber */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">Movement Position</span>
                    <span className="font-mono text-slate-400">
                      {Math.round(screenDirProgress * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={screenDirProgress}
                    onChange={(e) => handleScreenDirProgressChange(parseFloat(e.target.value))}
                    className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Frame Left</span>
                    <span>Center</span>
                    <span>Frame Right</span>
                  </div>
                </div>

                {/* 5. Educational Explanation Box */}
                <div
                  className={`p-3 rounded-lg border text-xs font-medium leading-relaxed ${
                    screenDirMode === 'consistent'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/40 border-red-500/40 text-red-300'
                  }`}
                >
                  {screenDirMode === 'consistent'
                    ? '✓ SCREEN DIRECTION PRESERVED: Character moves Left → Right in Shot A and continues Left → Right in Shot B, maintaining unbroken spatial momentum.'
                    : '⚠ SCREEN DIRECTION BREAK: Character reverses direction across the edit (Left → Right then Right → Left), making them appear to turn back or collide head-on.'}
                </div>
              </div>
            )}

            {/* PHYSICAL CONTINUITY CONTROLS */}
            {selectedConcept === 'continuity' && (
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-300">Action Consistency</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setContinuityMode('matched')}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        continuityMode === 'matched'
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Matched Take (Seamless)
                    </button>
                    <button
                      type="button"
                      onClick={() => setContinuityMode('error')}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        continuityMode === 'error'
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Take Mismatch (Prop Error ⚠)
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-300">Shot Progression</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setContinuityStep(1)}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        continuityStep === 1
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Shot A: Before Cut (Wide)
                    </button>
                    <button
                      type="button"
                      onClick={() => setContinuityStep(2)}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        continuityStep === 2
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Shot B: After Cut (Close)
                    </button>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-lg border text-xs font-medium leading-relaxed ${
                    continuityStep === 1
                      ? 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                      : continuityMode === 'matched'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/40 border-red-500/40 text-red-300'
                  }`}
                >
                  {continuityStep === 1
                    ? 'Shot A (Before Cut): The blue character holds a small red cup in their right hand in a wider setup.'
                    : continuityMode === 'matched'
                    ? '✓ Physical Continuity: In Shot B after the cut, the character holds the same red cup in the same right hand, preserving physical consistency.'
                    : '⚠ Continuity Error: In Shot B after the cut, the cup has switched to the left hand, breaking physical continuity and jarring the viewer!'}
                </div>
              </div>
            )}

            {/* MATCH CUT CONTROLS */}
            {selectedConcept === 'match-cut' && (
              <div className="space-y-3.5">
                <Slider
                  label="Match Cut Blend Progress"
                  value={matchCutProgress}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={handleManualScrub}
                />

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleSelectShotA}
                    className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                      matchCutPhase === 'shot-a' && matchCutProgress <= 30
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                    }`}
                  >
                    Shot A: Sun
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectMatchElement}
                    className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                      matchCutPhase === 'match-element' || (matchCutProgress >= 40 && matchCutProgress <= 60)
                        ? 'bg-amber-600 text-white border-amber-500'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                    }`}
                  >
                    50% Graphic Match
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectShotB}
                    className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                      matchCutPhase === 'shot-b' && matchCutProgress >= 70
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                    }`}
                  >
                    Shot B: Moon
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleTriggerReplay}
                    className="w-full py-1.5 px-3 text-xs font-semibold rounded border bg-slate-800/80 hover:bg-slate-700/80 text-sky-300 border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>▶</span>
                    <span>Replay Match Cut Sequence</span>
                  </button>
                </div>

                <div className="p-3 rounded-lg border bg-sky-950/40 border-sky-500/40 text-sky-300 text-xs font-medium leading-relaxed">
                  MATCH CUT: A common circular graphic shape bridges two distinct worlds across time and space.
                </div>
              </div>
            )}

            {/* JUMP CUT CONTROLS */}
            {selectedConcept === 'jump-cut' && (
              <div className="space-y-3.5">
                <Slider
                  label="Temporal Discontinuity (Frame Offset)"
                  value={jumpCutOffset}
                  min={24}
                  max={96}
                  step={6}
                  unit=" frames"
                  onChange={handleJumpCutOffsetChange}
                />

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-300">Edit Cut State</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleJumpCutShotA}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        jumpCutPhase === 'shot-a'
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                      }`}
                    >
                      Shot A (T₁: Initial State)
                    </button>
                    <button
                      type="button"
                      onClick={handleJumpCutShotB}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        jumpCutPhase === 'shot-b'
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                      }`}
                    >
                      Shot B (T₂: Jump Cut ⚠)
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleTriggerJumpCutReplay}
                    className="w-full py-1.5 px-3 text-xs font-semibold rounded border bg-slate-800/80 hover:bg-slate-700/80 text-rose-300 border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>▶</span>
                    <span>Replay Jump Cut Sequence</span>
                  </button>
                </div>

                <div className="p-3 rounded-lg border bg-red-950/40 border-red-500/40 text-red-300 text-xs font-medium leading-relaxed">
                  JUMP CUT: Cutting within the same camera setup while skipping frames creates an unmistakable temporal jerk, jarring audience continuity or compressing narrative time.
                </div>
              </div>
            )}

            {/* ESTABLISHING SHOT CONTROLS */}
            {selectedConcept === 'establishing' && (
              <div className="space-y-3.5">
                {/* 1. Shot Hierarchy Selector */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-300">
                    Shot Sequence (Wide → Medium → Close-Up)
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleEstablishingShotChange('wide')}
                      className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        establishingShot === 'wide'
                          ? 'bg-sky-600 text-white border-sky-400 shadow-lg shadow-sky-950/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <span>1. Establishing</span>
                      <span className="text-[10px] font-normal text-sky-200/80">Wide View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEstablishingShotChange('medium')}
                      className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        establishingShot === 'medium'
                          ? 'bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-950/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <span>2. Action</span>
                      <span className="text-[10px] font-normal text-amber-200/80">Medium Shot</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEstablishingShotChange('close-up')}
                      className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        establishingShot === 'close-up'
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-950/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <span>3. Detail</span>
                      <span className="text-[10px] font-normal text-emerald-200/80">Close-Up</span>
                    </button>
                  </div>
                </div>

                {/* 2. Sequence Playback Controls */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleTriggerEstablishingReplay}
                    className="flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>⟳</span> Replay Sequence (Wide → Medium → Close-Up)
                  </button>
                </div>

                {/* 3. Educational Explanation Card */}
                <div
                  className={`p-3 rounded-lg border text-xs font-medium leading-relaxed transition-colors ${
                    establishingShot === 'wide'
                      ? 'bg-sky-950/40 border-sky-500/40 text-sky-200'
                      : establishingShot === 'medium'
                      ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                      : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  }`}
                >
                  {establishingShot === 'wide' && (
                    <>
                      <strong className="text-sky-300">1. ESTABLISHING SHOT (WIDE):</strong> Answers the audience's fundamental orientation question: <em>"Where are we?"</em> Reveals the entire environment, building entrance, terrace floor, and skyline context before dramatic intimacy begins.
                    </>
                  )}
                  {establishingShot === 'medium' && (
                    <>
                      <strong className="text-amber-300">2. ACTION SHOT (MEDIUM):</strong> Cuts closer to the characters to follow dialogue and action, while retaining recognizable background features (entrance portal, terrace parapet) to preserve continuous mental geography.
                    </>
                  )}
                  {establishingShot === 'close-up' && (
                    <>
                      <strong className="text-emerald-300">3. DETAIL SHOT (CLOSE-UP):</strong> Delivers maximum emotional resonance and intimacy. Because the spatial setting was established in Shot 1, the audience never feels disoriented or lost.
                    </>
                  )}
                </div>
              </div>
            )}

            {/* MASTER SHOT CONTROLS */}
            {selectedConcept === 'master-shot' && (
              <div className="space-y-3.5">
                {/* 1. View Hierarchy Selector */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-300">Coverage View</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMasterView('master')}
                      className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        masterView === 'master'
                          ? 'bg-sky-600 text-white border-sky-400 shadow-lg shadow-sky-950/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <span>1. Master Shot</span>
                      <span className="text-[10px] font-normal text-sky-200/80">Complete Scene (100%)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMasterView('coverage')}
                      className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        masterView === 'coverage'
                          ? 'bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-950/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <span>2. Coverage Shot</span>
                      <span className="text-[10px] font-normal text-amber-200/80">Closer View (Actor A)</span>
                    </button>
                  </div>
                </div>

                {/* 2. Action Playback Controls */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-300">Scene Action Playback</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMasterIsPlaying((prev) => !prev)}
                      className={`py-1.5 px-3 text-xs font-semibold rounded-lg border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                        masterIsPlaying
                          ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
                          : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500'
                      }`}
                    >
                      <span>{masterIsPlaying ? '⏸ Pause Action' : '▶ Play Action'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMasterProgress(0);
                        setMasterIsPlaying(true);
                      }}
                      className="py-1.5 px-3 text-xs font-semibold rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>⟳</span> Replay Action
                    </button>
                  </div>
                </div>

                {/* 3. Educational Description Card */}
                <div
                  className={`p-3 rounded-lg border text-xs font-medium leading-relaxed transition-colors ${
                    masterView === 'master'
                      ? 'bg-sky-950/40 border-sky-500/40 text-sky-200'
                      : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  }`}
                >
                  {masterView === 'master' ? (
                    <>
                      <strong className="text-sky-300">MASTER SHOT (COMPLETE SCENE COVERAGE):</strong> Covers the entire scene and both characters in one continuous take. Actors A &amp; B conversing on the terrace remain visible simultaneously, establishing unbroken spatial relationships.
                    </>
                  ) : (
                    <>
                      <strong className="text-amber-300">COVERAGE SHOT (SELECTIVE DETAIL):</strong> Shows a closer view focused on Actor A performing that same interaction. Notice that the scene action and character positions are identical, but this tighter framing captures only a portion of the full scene.
                    </>
                  )}
                </div>
              </div>
            )}

            {/* SCENE COVERAGE CONTROLS */}
            {selectedConcept === 'coverage' && (
              <div className="space-y-3.5">
                <span className="text-xs font-semibold text-slate-300">Coverage Camera Setups</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['master', 'wide', 'medium', 'close', 'reaction', 'insert'] as const).map((shot) => (
                    <button
                      key={shot}
                      type="button"
                      onClick={() => setCoverageShot(shot)}
                      className={`py-2 px-2 text-xs font-bold uppercase rounded border transition-colors cursor-pointer ${
                        coverageShot === shot
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {shot}
                    </button>
                  ))}
                </div>

                <div className="p-3 rounded-lg border bg-sky-950/40 border-sky-500/40 text-sky-300 text-xs font-medium leading-relaxed">
                  SCENE COVERAGE: Clicking each setup immediately cuts to that shot scale, demonstrating the editor’s building blocks.
                </div>
              </div>
            )}

            {/* REACTION SHOT CONTROLS */}
            {selectedConcept === 'reaction-shot' && (
              <div className="space-y-3.5">
                {/* 1. Shot Sequence Selector */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-300">Shot Framing</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setReactionView('action')}
                      className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        reactionView === 'action'
                          ? 'bg-sky-600 text-white border-sky-400 shadow-lg shadow-sky-950/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <span>1. Action Shot</span>
                      <span className="text-[10px] font-normal text-sky-200/80">Two-Shot (A Speaks)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setReactionView('reaction')}
                      className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        reactionView === 'reaction'
                          ? 'bg-pink-600 text-white border-pink-400 shadow-lg shadow-pink-950/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <span>2. Reaction Shot</span>
                      <span className="text-[10px] font-normal text-pink-200/80">Close-Up (B Surprised)</span>
                    </button>
                  </div>
                </div>

                {/* Educational Description Card */}
                <div
                  className={`p-3 rounded-lg border text-xs font-medium leading-relaxed transition-colors ${
                    reactionView === 'action'
                      ? 'bg-sky-950/40 border-sky-500/40 text-sky-200'
                      : 'bg-pink-950/40 border-pink-500/40 text-pink-200'
                  }`}
                >
                  {reactionView === 'action' ? (
                    <>
                      <strong className="text-sky-300">ACTION SHOT (SETUP):</strong> Shows both characters together in the same environment. Actor A delivers dialogue while Actor B listens in the established scene space.
                    </>
                  ) : (
                    <>
                      <strong className="text-pink-300">REACTION SHOT (EMOTIONAL IMPACT):</strong> Cuts in close to Actor B, revealing their immediate surprised reaction to Actor A&apos;s speech, deepening the audience&apos;s connection.
                    </>
                  )}
                </div>
              </div>
            )}

            {/* EYE TRACE CONTROLS */}
            {selectedConcept === 'eye-trace' && (
              <div className="space-y-3.5">
                {/* 1. Focal Object Position */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-300">Focal Object Position</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setEyeTracePattern('horizontal')}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        eyeTracePattern === 'horizontal'
                          ? 'bg-purple-600 text-white border-purple-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Eye-Level (Mid)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEyeTracePattern('diagonal')}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        eyeTracePattern === 'diagonal'
                          ? 'bg-purple-600 text-white border-purple-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Low Prop (Floor)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEyeTracePattern('triangle')}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        eyeTracePattern === 'triangle'
                          ? 'bg-purple-600 text-white border-purple-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      High Beacon (Top)
                    </button>
                  </div>
                </div>

                {/* 2. Directional Guide Toggle */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-300">Directional Guide</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEyeTraceShowGuide(true)}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        eyeTraceShowGuide
                          ? 'bg-sky-600 text-white border-sky-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Eye Trace Guide: On
                    </button>
                    <button
                      type="button"
                      onClick={() => setEyeTraceShowGuide(false)}
                      className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                        !eyeTraceShowGuide
                          ? 'bg-sky-600 text-white border-sky-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Eye Trace Guide: Off
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg border bg-purple-950/40 border-purple-500/40 text-purple-300 text-xs font-medium leading-relaxed">
                  <strong className="text-purple-200">EYE TRACE:</strong> The filmmaker aligns the character&apos;s gaze with a high-contrast focal destination, guiding the audience&apos;s attention seamlessly across the frame.
                </div>
              </div>
            )}
          </div>
        </div>
      }
    />
  );
};
