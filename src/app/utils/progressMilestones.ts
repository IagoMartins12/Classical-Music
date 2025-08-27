// utils/progressMilestones.ts
import {
  FiPlay,
  FiClock,
  FiTarget,
  FiTrendingUp,
  FiMusic,
  FiUsers,
  FiHeart,
} from 'react-icons/fi';

export interface ProgressMilestone {
  key: string;
  labelKey: string;
  icon: any;
  color: string;
  weight: number;
}

export interface ProgressMilestones {
  [key: string]: boolean;
}

// MILESTONES PARA PIANO
export const PIANO_MILESTONES: ProgressMilestone[] = [
  {
    key: 'learnedLeftHand',
    labelKey: 'milestone_piano_learned_left_hand',
    icon: FiPlay,
    color: 'text-accent-blue',
    weight: 15,
  },
  {
    key: 'learnedRightHand',
    labelKey: 'milestone_piano_learned_right_hand',
    icon: FiPlay,
    color: 'text-accent-blue',
    weight: 15,
  },
  {
    key: 'playedWithMetronome',
    labelKey: 'milestone_piano_metronome',
    icon: FiClock,
    color: 'text-accent-purple',
    weight: 20,
  },
  {
    key: 'memorized',
    labelKey: 'milestone_piano_memorized',
    icon: FiTarget,
    color: 'text-accent-green',
    weight: 15,
  },
  {
    key: 'playedAtTempo',
    labelKey: 'milestone_piano_tempo',
    icon: FiTrendingUp,
    color: 'text-accent-yellow',
    weight: 20,
  },
  {
    key: 'masteredDynamics',
    labelKey: 'milestone_piano_dynamics',
    icon: FiMusic,
    color: 'text-accent-purple',
    weight: 10,
  },
  {
    key: 'performedForOthers',
    labelKey: 'milestone_piano_performed',
    icon: FiUsers,
    color: 'text-accent-red',
    weight: 5,
  },
];

// MILESTONES PARA VIOLINO
export const VIOLIN_MILESTONES: ProgressMilestone[] = [
  {
    key: 'learnedBowing',
    labelKey: 'milestone_violin_learned_bowing',
    icon: FiPlay,
    color: 'text-accent-blue',
    weight: 20,
  },
  {
    key: 'learnedFingering',
    labelKey: 'milestone_violin_learned_fingering',
    icon: FiTarget,
    color: 'text-accent-green',
    weight: 15,
  },
  {
    key: 'intonationCorrect',
    labelKey: 'milestone_violin_intonation',
    icon: FiMusic,
    color: 'text-accent-purple',
    weight: 20,
  },
  {
    key: 'playedWithMetronome',
    labelKey: 'milestone_violin_metronome',
    icon: FiClock,
    color: 'text-accent-purple',
    weight: 15,
  },
  {
    key: 'memorized',
    labelKey: 'milestone_violin_memorized',
    icon: FiHeart,
    color: 'text-accent-green',
    weight: 10,
  },
  {
    key: 'playedAtTempo',
    labelKey: 'milestone_violin_tempo',
    icon: FiTrendingUp,
    color: 'text-accent-yellow',
    weight: 15,
  },
  {
    key: 'performedForOthers',
    labelKey: 'milestone_violin_performed',
    icon: FiUsers,
    color: 'text-accent-red',
    weight: 5,
  },
];

// MILESTONES PARA VIOLONCELO
export const CELLO_MILESTONES: ProgressMilestone[] = [
  {
    key: 'learnedBowing',
    labelKey: 'milestone_cello_learned_bowing',
    icon: FiPlay,
    color: 'text-accent-blue',
    weight: 20,
  },
  {
    key: 'learnedFingering',
    labelKey: 'milestone_cello_learned_fingering',
    icon: FiTarget,
    color: 'text-accent-green',
    weight: 15,
  },
  {
    key: 'postureAndHolding',
    labelKey: 'milestone_cello_posture',
    icon: FiUsers,
    color: 'text-accent-yellow',
    weight: 10,
  },
  {
    key: 'intonationCorrect',
    labelKey: 'milestone_cello_intonation',
    icon: FiMusic,
    color: 'text-accent-purple',
    weight: 20,
  },
  {
    key: 'playedWithMetronome',
    labelKey: 'milestone_cello_metronome',
    icon: FiClock,
    color: 'text-accent-purple',
    weight: 15,
  },
  {
    key: 'memorized',
    labelKey: 'milestone_cello_memorized',
    icon: FiHeart,
    color: 'text-accent-green',
    weight: 10,
  },
  {
    key: 'playedAtTempo',
    labelKey: 'milestone_cello_tempo',
    icon: FiTrendingUp,
    color: 'text-accent-yellow',
    weight: 5,
  },
  {
    key: 'performedForOthers',
    labelKey: 'milestone_cello_performed',
    icon: FiUsers,
    color: 'text-accent-red',
    weight: 5,
  },
];

// MILESTONES GENÉRICOS
export const GENERIC_MILESTONES: ProgressMilestone[] = [
  {
    key: 'learnedBasics',
    labelKey: 'milestone_generic_learned_basics',
    icon: FiPlay,
    color: 'text-accent-blue',
    weight: 25,
  },
  {
    key: 'playedWithMetronome',
    labelKey: 'milestone_generic_metronome',
    icon: FiClock,
    color: 'text-accent-purple',
    weight: 20,
  },
  {
    key: 'memorized',
    labelKey: 'milestone_generic_memorized',
    icon: FiTarget,
    color: 'text-accent-green',
    weight: 15,
  },
  {
    key: 'playedAtTempo',
    labelKey: 'milestone_generic_tempo',
    icon: FiTrendingUp,
    color: 'text-accent-yellow',
    weight: 20,
  },
  {
    key: 'masteredExpression',
    labelKey: 'milestone_generic_expression',
    icon: FiMusic,
    color: 'text-accent-purple',
    weight: 15,
  },
  {
    key: 'performedForOthers',
    labelKey: 'milestone_generic_performed',
    icon: FiUsers,
    color: 'text-accent-red',
    weight: 5,
  },
];

// MAPEAMENTO DE INSTRUMENTOS PARA MILESTONES
export const INSTRUMENT_MILESTONES_MAP: { [key: string]: ProgressMilestone[] } =
  {
    // IDs dos instrumentos (você deve ajustar conforme seus IDs reais)
    piano: PIANO_MILESTONES,
    violin: VIOLIN_MILESTONES,
    violino: VIOLIN_MILESTONES,
    cello: CELLO_MILESTONES,
    violoncelo: CELLO_MILESTONES,
    violoncello: CELLO_MILESTONES,
  };

// FUNÇÃO PARA OBTER MILESTONES POR INSTRUMENTO
export function getMilestonesByInstrument(
  instrumentName?: string
): ProgressMilestone[] {
  if (!instrumentName) return GENERIC_MILESTONES;

  const normalizedName = instrumentName.toLowerCase().trim();
  return INSTRUMENT_MILESTONES_MAP[normalizedName] || GENERIC_MILESTONES;
}

// FUNÇÃO PARA CALCULAR PROGRESSO
export function calculateProgress(
  milestones: ProgressMilestones,
  availableMilestones: ProgressMilestone[]
): number {
  const completedMilestones = availableMilestones.filter(
    (milestone) => milestones[milestone.key]
  );
  const totalWeight = completedMilestones.reduce(
    (sum, milestone) => sum + milestone.weight,
    0
  );
  return Math.min(100, totalWeight);
}

// FUNÇÃO PARA CRIAR MILESTONES PADRÃO
export function createDefaultMilestones(
  availableMilestones: ProgressMilestone[]
): ProgressMilestones {
  const defaultMilestones: ProgressMilestones = {};
  availableMilestones.forEach((milestone) => {
    defaultMilestones[milestone.key] = false;
  });
  return defaultMilestones;
}
