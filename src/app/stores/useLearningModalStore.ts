// stores/useLearningModalStore.ts - ATUALIZADO COM INSTRUMENTNAME
import { create } from 'zustand';

export type LearningType = 'want-to-learn' | 'learned';
export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface SelectedWorkScore {
  id: string;
  sourceId: string;
  source: 'IMSLP' | 'CUSTOM' | 'UPLOAD';
  title: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
  fileSize?: string;
  pageCount?: string;
  fileFormat: string;
  type: string;
  editor?: string;
  publisher?: string;
  copyright?: string;
  uploadDate?: string;
  uploader?: string;
  notes?: string;
}

export interface WantToLearnFormData {
  priority: number;
  notes?: string;
  targetDate?: string;
  estimatedStudyTime?: number;
  difficulty?: DifficultyLevel;
  motivation?: string;
  context?: string;
  selectedWorkScoreId?: string;
}

export interface LearnedFormData {
  mastery: number;
  studyStartDate?: string;
  studyDuration?: number;
  notes?: string;
  wouldRecommend: boolean;
  publicPerformance: boolean;
  difficulty?: DifficultyLevel;
  enjoyment?: number;
  technicalChallenges?: string;
  musicalInsights?: string;
  selectedWorkScoreId?: string;
}

interface LearningModalState {
  // Estado do modal
  isOpen: boolean;
  isInSelectionMode: boolean;

  // Dados da obra
  workId: string | null;
  workTitle: string | null;
  composerName: string | null;
  instrumentName: string | null; // 🆕 NOVO: Nome do instrumento
  epochName: string | null;
  type: LearningType | null;
  isCurrentlyActive: boolean;

  // Formulários
  wantToLearnForm: WantToLearnFormData;
  learnedForm: LearnedFormData;

  // WorkScore selecionado
  selectedWorkScore: SelectedWorkScore | null;

  // Backup da partitura original (para restaurar se cancelar)
  originalWorkScore: SelectedWorkScore | null;

  // Actions
  openModal: (params: {
    workId: string;
    workTitle: string;
    epochName?: string;
    composerName: string;
    instrumentName?: string; // 🆕 NOVO: Parâmetro do instrumento
    type: LearningType;
    isCurrentlyActive?: boolean;
    initialWantToLearnData?: Partial<WantToLearnFormData>;
    initialLearnedData?: Partial<LearnedFormData>;
    initialWorkScore?: SelectedWorkScore | null;
  }) => void;

  closeModal: () => void;

  // Gerenciar formulários
  updateWantToLearnForm: (data: Partial<WantToLearnFormData>) => void;
  updateLearnedForm: (data: Partial<LearnedFormData>) => void;

  // Gerenciar WorkScore
  setSelectedWorkScore: (workScore: SelectedWorkScore | null) => void;

  // Modo de seleção
  startScoreSelection: () => void;
  finishScoreSelection: (workScore?: SelectedWorkScore) => void;
  cancelScoreSelection: () => void;

  // Limpeza
  reset: () => void;
  clearFormData: () => void;
}

const defaultWantToLearnForm: WantToLearnFormData = {
  priority: 0,
};

const defaultLearnedForm: LearnedFormData = {
  mastery: 0,
  wouldRecommend: true,
  publicPerformance: false,
};

export const useLearningModalStore = create<LearningModalState>((set, get) => ({
  // Estado inicial
  isOpen: false,
  isInSelectionMode: false,
  workId: null,
  workTitle: null,
  epochName: null,
  composerName: null,
  instrumentName: null, // 🆕 NOVO: Inicializar como null
  type: null,
  isCurrentlyActive: false,
  wantToLearnForm: { ...defaultWantToLearnForm },
  learnedForm: { ...defaultLearnedForm },
  selectedWorkScore: null,
  originalWorkScore: null,

  // Abrir modal
  openModal: (params) => {
    console.log('🎵 [LEARNING-MODAL-STORE] Abrindo modal:', params);

    set({
      isOpen: true,
      isInSelectionMode: false,
      workId: params.workId,
      workTitle: params.workTitle,
      epochName: params.epochName,
      composerName: params.composerName,
      instrumentName: params.instrumentName || null, // 🆕 NOVO: Definir instrumentName
      type: params.type,
      isCurrentlyActive: params.isCurrentlyActive || false,
      wantToLearnForm: {
        ...defaultWantToLearnForm,
        ...params.initialWantToLearnData,
      },
      learnedForm: {
        ...defaultLearnedForm,
        ...params.initialLearnedData,
      },
      selectedWorkScore: params.initialWorkScore || null,
    });
  },

  // Fechar modal
  closeModal: () => {
    console.log('❌ [LEARNING-MODAL-STORE] Fechando modal');

    set({
      isOpen: false,
      isInSelectionMode: false,
    });

    // Limpar dados após um delay para evitar flickers
    setTimeout(() => {
      const state = get();
      if (!state.isOpen && !state.isInSelectionMode) {
        state.reset();
      }
    }, 300);
  },

  // Atualizar formulário want-to-learn
  updateWantToLearnForm: (data) => {
    set((state) => ({
      wantToLearnForm: {
        ...state.wantToLearnForm,
        ...data,
      },
    }));
  },

  // Atualizar formulário learned
  updateLearnedForm: (data) => {
    set((state) => ({
      learnedForm: {
        ...state.learnedForm,
        ...data,
      },
    }));
  },

  // Definir WorkScore selecionado
  setSelectedWorkScore: (workScore) => {
    console.log(
      '🎼 [LEARNING-MODAL-STORE] WorkScore selecionado:',
      workScore?.title
    );

    set({ selectedWorkScore: workScore });

    // Atualizar formulário correspondente
    if (workScore) {
      const { type } = get();
      if (type === 'want-to-learn') {
        get().updateWantToLearnForm({ selectedWorkScoreId: workScore.id });
      } else if (type === 'learned') {
        get().updateLearnedForm({ selectedWorkScoreId: workScore.id });
      }
    } else {
      // Remover WorkScore dos formulários
      const { type } = get();
      if (type === 'want-to-learn') {
        get().updateWantToLearnForm({ selectedWorkScoreId: undefined });
      } else if (type === 'learned') {
        get().updateLearnedForm({ selectedWorkScoreId: undefined });
      }
    }
  },

  // Iniciar processo de seleção
  startScoreSelection: () => {
    console.log('🎯 [LEARNING-MODAL-STORE] Iniciando seleção de partitura');

    const { selectedWorkScore } = get();

    set({
      isInSelectionMode: true,
      isOpen: false, // Fechar modal temporariamente
      originalWorkScore: selectedWorkScore, // Fazer backup da partitura atual
    });
  },

  // Finalizar seleção (sucesso)
  finishScoreSelection: (workScore) => {
    console.log(
      '✅ [LEARNING-MODAL-STORE] Finalizando seleção:',
      workScore?.title
    );

    if (workScore) {
      get().setSelectedWorkScore(workScore);
    }

    set({
      isInSelectionMode: false,
      isOpen: true, // Reabrir modal
      originalWorkScore: null, // Limpar backup pois confirmou nova seleção
    });
  },

  // Cancelar seleção
  cancelScoreSelection: () => {
    console.log('❌ [LEARNING-MODAL-STORE] Cancelando seleção');

    const { originalWorkScore } = get();

    set({
      isInSelectionMode: false,
      isOpen: true, // Reabrir modal
      selectedWorkScore: originalWorkScore, // Restaurar partitura original
      originalWorkScore: null, // Limpar backup
    });
  },

  // Reset completo
  reset: () => {
    console.log('🔄 [LEARNING-MODAL-STORE] Reset completo');

    set({
      isOpen: false,
      isInSelectionMode: false,
      workId: null,
      workTitle: null,
      epochName: null,
      composerName: null,
      instrumentName: null, // 🆕 NOVO: Limpar instrumentName
      type: null,
      isCurrentlyActive: false,
      wantToLearnForm: { ...defaultWantToLearnForm },
      learnedForm: { ...defaultLearnedForm },
      selectedWorkScore: null,
      originalWorkScore: null,
    });
  },

  // Limpar apenas dados dos formulários
  clearFormData: () => {
    console.log('🧹 [LEARNING-MODAL-STORE] Limpando dados dos formulários');

    set({
      wantToLearnForm: { ...defaultWantToLearnForm },
      learnedForm: { ...defaultLearnedForm },
      selectedWorkScore: null,
      originalWorkScore: null,
    });
  },
}));
