// stores/useScoreSelectionStore.ts - ATUALIZADO PARA APENAS SELEÇÃO
import { create } from 'zustand';
import { IMSLPScore } from '@/app/libs/imslp-score-scraper-incremental';
import {
  useLearningModalStore,
  type LearningType,
} from './useLearningModalStore';

// ✅ Interface mantida para compatibilidade
export interface SelectedWorkScore {
  id: string; // WorkScore ID
  sourceId: string; // ID original (IMSLP, etc.)
  source: 'IMSLP' | 'CUSTOM' | 'UPLOAD';
  title: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
  fileSize?: string;
  pageCount?: string;
  fileFormat: string;
  type: string; // SCORES, PARTS, etc.
  // Metadados extras do WorkScore
  editor?: string;
  publisher?: string;
  copyright?: string;
  uploadDate?: string;
  uploader?: string;
  notes?: string;
}

interface ScoreSelectionState {
  // Estado atual da seleção
  isSelectionMode: boolean;
  activeType: LearningType | null;
  workId: string | null;
  workTitle: string | null;
  composerName: string | null;

  // WorkScore temporariamente selecionado (antes de confirmar)
  tempSelectedWorkScore: SelectedWorkScore | null;

  // Actions
  startScoreSelection: (params: {
    type: LearningType;
    workId: string;
    workTitle: string;
    composerName: string;
    currentWorkScore?: SelectedWorkScore | null; // ✅ NOVO: Partitura atual
  }) => void;

  selectTempWorkScore: (workScore: SelectedWorkScore) => void;
  selectFromIMSLPScore: (
    imslpScore: IMSLPScore,
    workId: string
  ) => Promise<void>;
  selectFromWorkScore: (workScore: any) => void; // ✅ NOVA: selecionar WorkScore existente
  confirmScoreSelection: () => void;
  cancelScoreSelection: () => void;
  clearSelection: () => void;
}

export const useScoreSelectionStore = create<ScoreSelectionState>(
  (set, get) => ({
    // Estado inicial
    isSelectionMode: false,
    activeType: null,
    workId: null,
    workTitle: null,
    composerName: null,
    tempSelectedWorkScore: null,

    // ✅ Iniciar processo de seleção (integrado com LearningModalStore)
    startScoreSelection: (params) => {
      console.log('🎯 [SCORE-SELECTION] Iniciando seleção:', params);

      set({
        isSelectionMode: true,
        activeType: params.type,
        workId: params.workId,
        workTitle: params.workTitle,
        composerName: params.composerName,
        tempSelectedWorkScore: params.currentWorkScore || null, // ✅ NOVO: Inicializar com partitura atual
      });
    },

    // ✅ Selecionar WorkScore diretamente (NOVA)
    selectTempWorkScore: (workScore) => {
      console.log('📝 [SCORE-SELECTION] Seleção temporária:', workScore.title);
      set({ tempSelectedWorkScore: workScore });
    },

    // ✅ MODIFICADO: Selecionar a partir de WorkScore existente (sem criar)
    selectFromWorkScore: (workScore: any) => {
      console.log(
        '🔍 [SCORE-SELECTION] Selecionando WorkScore existente:',
        workScore.title
      );

      const selectedWorkScore: SelectedWorkScore = {
        id: workScore.id,
        sourceId: workScore.sourceId,
        source: workScore.source,
        title: workScore.title,
        downloadUrl: workScore.downloadUrl,
        thumbnailUrl: workScore.thumbnailUrl,
        fileSize: workScore.fileSize,
        pageCount: workScore.pageCount,
        fileFormat: workScore.fileFormat,
        type: workScore.type,
        editor: workScore.editor,
        publisher: workScore.publisher,
        copyright: workScore.copyright,
        uploadDate: workScore.uploadDate,
        uploader: workScore.uploader,
        notes: workScore.notes,
      };

      set({ tempSelectedWorkScore: selectedWorkScore });
    },

    // ✅ MODIFICADO: Selecionar a partir de IMSLPScore (buscar WorkScore, não criar)
    selectFromIMSLPScore: async (imslpScore: IMSLPScore, workId: string) => {
      try {
        console.log(
          '🔍 [SCORE-SELECTION] Buscando WorkScore para IMSLPScore:',
          imslpScore.title
        );

        // ✅ BUSCAR WorkScore existente (não criar)
        const response = await fetch(
          `/api/work-scores?workId=${workId}&sourceId=${imslpScore.id}&source=IMSLP`
        );

        if (!response.ok) {
          throw new Error('Erro ao buscar partitura');
        }

        const result = await response.json();

        if (result.success && result.workScore) {
          const workScore: SelectedWorkScore = {
            id: result.workScore.id,
            sourceId: result.workScore.sourceId,
            source: result.workScore.source,
            title: result.workScore.title,
            downloadUrl: result.workScore.downloadUrl,
            thumbnailUrl: result.workScore.thumbnailUrl,
            fileSize: result.workScore.fileSize,
            pageCount: result.workScore.pageCount,
            fileFormat: result.workScore.fileFormat,
            type: result.workScore.type,
            editor: result.workScore.editor,
            publisher: result.workScore.publisher,
            copyright: result.workScore.copyright,
            uploadDate: result.workScore.uploadDate,
            uploader: result.workScore.uploader,
            notes: result.workScore.notes,
          };

          console.log(
            '✅ [SCORE-SELECTION] WorkScore encontrado:',
            workScore.id
          );
          set({ tempSelectedWorkScore: workScore });
        } else {
          console.warn(
            '⚠️ [SCORE-SELECTION] WorkScore não encontrado para IMSLPScore:',
            imslpScore.id
          );
          // TODO: Mostrar toast informando que a partitura não está disponível
        }
      } catch (error) {
        console.error('❌ [SCORE-SELECTION] Erro ao buscar WorkScore:', error);
        // TODO: Mostrar toast de erro
      }
    },

    // ✅ Confirmar seleção (integrado com LearningModalStore)
    confirmScoreSelection: () => {
      const { tempSelectedWorkScore } = get();

      if (tempSelectedWorkScore) {
        console.log(
          '✅ [SCORE-SELECTION] Confirmando seleção:',
          tempSelectedWorkScore.title
        );

        // ✅ Integrar com LearningModalStore
        const learningModalStore = useLearningModalStore.getState();
        learningModalStore.finishScoreSelection(tempSelectedWorkScore);

        // Limpar estado
        set({
          isSelectionMode: false,
          activeType: null,
          workId: null,
          workTitle: null,
          composerName: null,
          tempSelectedWorkScore: null,
        });
      }
    },

    // ✅ Cancelar seleção (integrado com LearningModalStore)
    cancelScoreSelection: () => {
      console.log('❌ [SCORE-SELECTION] Cancelando seleção');

      // ✅ Integrar com LearningModalStore
      const learningModalStore = useLearningModalStore.getState();
      learningModalStore.cancelScoreSelection();

      // Limpar estado
      set({
        isSelectionMode: false,
        activeType: null,
        workId: null,
        workTitle: null,
        composerName: null,
        tempSelectedWorkScore: null,
      });
    },

    // Limpar tudo
    clearSelection: () => {
      set({
        isSelectionMode: false,
        activeType: null,
        workId: null,
        workTitle: null,
        composerName: null,
        tempSelectedWorkScore: null,
      });
    },
  })
);

// ✅ Helper para verificar se duas partituras são iguais (mantido)
export const isSameWorkScore = (
  a: SelectedWorkScore | null,
  b: SelectedWorkScore | null
): boolean => {
  if (!a || !b) return false;
  return a.id === b.id;
};

// ✅ Helper para criar SelectedWorkScore a partir de dados da API (mantido)
export const createSelectedWorkScore = (apiData: any): SelectedWorkScore => ({
  id: apiData.id,
  sourceId: apiData.sourceId,
  source: apiData.source,
  title: apiData.title,
  downloadUrl: apiData.downloadUrl,
  thumbnailUrl: apiData.thumbnailUrl,
  fileSize: apiData.fileSize,
  pageCount: apiData.pageCount,
  fileFormat: apiData.fileFormat,
  type: apiData.type,
  editor: apiData.editor,
  publisher: apiData.publisher,
  copyright: apiData.copyright,
  uploadDate: apiData.uploadDate,
  uploader: apiData.uploader,
  notes: apiData.notes,
});
