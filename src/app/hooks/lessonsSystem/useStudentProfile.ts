// app/hooks/lessonsSystem/useStudentProfile.ts - Hook CORRIGIDO para melhor integração

import { StudentProfileData } from '@/app/(student)/student/profile/pageServer';
import { useState, useCallback } from 'react';

interface UpdateProfileData {
  userData?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    city?: string;
    state?: string;
    country?: string;
    image?: string;
    experienceLevel?: string;
  };
  studentData?: {
    level?: string;
    mainInstrument?: string;
    musicalGoals?: string;
    preferredGenres?: string[];
    musicalBackground?: string;
    allowPublicProgress?: boolean;
    allowProgressShare?: boolean;
    profileVisibility?: string;
    practiceTime?: number;
    practiceSchedule?: any;
    learningPace?: string;
    specialNeeds?: string;
    preferredContact?: string;
    reminderPreferences?: any;
  };
}

interface UseStudentProfileState {
  profile: StudentProfileData['profile'] | null;
  studyData: StudentProfileData['studyData'] | null;
  loading: {
    profile: boolean;
    updateProfile: boolean;
    updateField: boolean;
    refreshStudyData: boolean;
  };
  error: string | null;
}

interface UseStudentProfileActions {
  setInitialData: (data: StudentProfileData) => void;
  updateProfile: (updates: UpdateProfileData) => Promise<boolean>;
  updateField: (
    field: string,
    value: any,
    action?: 'set' | 'add' | 'remove'
  ) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  refreshStudyData: () => Promise<void>;
  clearError: () => void;
}

export function useStudentProfile(
  initialData?: StudentProfileData | null
): UseStudentProfileState & UseStudentProfileActions {
  const [state, setState] = useState<UseStudentProfileState>({
    profile: initialData?.profile || null,
    studyData: initialData?.studyData || null,
    loading: {
      profile: false,
      updateProfile: false,
      updateField: false,
      refreshStudyData: false,
    },
    error: null,
  });

  // Helper to update loading state
  const setLoading = useCallback(
    (key: keyof UseStudentProfileState['loading'], value: boolean) => {
      setState((prev) => ({
        ...prev,
        loading: {
          ...prev.loading,
          [key]: value,
        },
      }));
    },
    []
  );

  // Helper to set error
  const setError = useCallback((error: string | null) => {
    setState((prev) => ({
      ...prev,
      error,
    }));
  }, []);

  // Set initial data
  const setInitialData = useCallback((data: StudentProfileData) => {
    setState((prev) => ({
      ...prev,
      profile: data.profile,
      studyData: data.studyData,
    }));
  }, []);

  // 🔧 UPDATE PROFILE CORRIGIDO - Cache invalidado automaticamente no servidor
  const updateProfile = useCallback(
    async (updates: UpdateProfileData): Promise<boolean> => {
      setLoading('updateProfile', true);
      setError(null);

      try {
        console.log('📝 [HOOK] Enviando atualização de perfil:', updates);

        const response = await fetch('/api/student/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Erro ${response.status}`);
        }

        if (!data.success) {
          throw new Error(data.error || 'Erro ao atualizar perfil');
        }

        // ✅ Atualizar estado local com dados retornados pelo servidor
        setState((prev) => ({
          ...prev,
          profile: data.profile, // Use dados completos do servidor
        }));

        console.log('✅ [HOOK] Perfil atualizado com sucesso!');
        return true;
      } catch (error) {
        console.error('❌ [HOOK] Erro ao atualizar perfil:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('updateProfile', false);
      }
    },
    [setLoading, setError]
  );

  // 🔧 UPDATE FIELD CORRIGIDO - Cache invalidado automaticamente no servidor
  const updateField = useCallback(
    async (
      field: string,
      value: any,
      action: 'set' | 'add' | 'remove' = 'set'
    ): Promise<boolean> => {
      setLoading('updateField', true);
      setError(null);

      try {
        console.log(
          `📝 [HOOK] Atualizando campo ${field} com ação ${action}:`,
          value
        );

        const response = await fetch('/api/student/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ field, value, action }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Erro ${response.status}`);
        }

        if (!data.success) {
          throw new Error(data.error || 'Erro ao atualizar campo');
        }

        // ✅ Atualizar estado local com dados retornados pelo servidor
        setState((prev) => ({
          ...prev,
          profile: data.profile, // Use dados completos do servidor
        }));

        console.log(`✅ [HOOK] Campo ${field} atualizado com sucesso!`);
        return true;
      } catch (error) {
        console.error(`❌ [HOOK] Erro ao atualizar campo ${field}:`, error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('updateField', false);
      }
    },
    [setLoading, setError]
  );

  // 🔧 REFRESH PROFILE CORRIGIDO
  const refreshProfile = useCallback(async () => {
    setLoading('profile', true);
    setError(null);

    try {
      console.log('🔄 [HOOK] Recarregando perfil...');

      const response = await fetch('/api/student/profile');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erro ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro ao carregar perfil');
      }

      // ✅ Atualizar estado com dados completos
      setState((prev) => ({
        ...prev,
        profile: data.profile,
      }));

      console.log('✅ [HOOK] Perfil recarregado com sucesso!');
    } catch (error) {
      console.error('❌ [HOOK] Erro ao recarregar perfil:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading('profile', false);
    }
  }, [setLoading, setError]);

  // 🔄 REFRESH STUDY DATA MELHORADO - APIs corretas
  const refreshStudyData = useCallback(async () => {
    setLoading('refreshStudyData', true);
    setError(null);

    try {
      console.log('🔄 [HOOK] Refreshing study data...');

      // ✅ Fazer requisições paralelas para todos os dados de estudo
      const [wantToLearnResponse, learnedResponse, annotationsResponse] =
        await Promise.all([
          fetch('/api/learning/want-to-learn').catch(() => null),
          fetch('/api/learning/learned').catch(() => null),
          fetch('/api/annotations?limit=5&public=true').catch(() => null),
        ]);

      // Processar want-to-learn
      let wantToLearnData = [];
      if (wantToLearnResponse?.ok) {
        try {
          const wantToLearnJson = await wantToLearnResponse.json();
          if (wantToLearnJson.success && wantToLearnJson.items) {
            wantToLearnData = wantToLearnJson.items
              .slice(0, 10)
              .map((item: any) => ({
                workId: item.workId,
                title: item.work?.title || item.title,
                composer: item.work?.composer?.name || item.composer,
                addedAt: new Date(item.addedAt),
                difficulty: item.difficulty,
                selectedScore: item.selectedWorkScore
                  ? {
                      title: item.selectedWorkScore.title,
                      type: item.selectedWorkScore.type,
                    }
                  : undefined,
              }));
          }
        } catch (parseError) {
          console.warn(
            '⚠️ [HOOK] Erro ao processar want-to-learn:',
            parseError
          );
        }
      }

      // Processar learned
      let learnedData = [];
      if (learnedResponse?.ok) {
        try {
          const learnedJson = await learnedResponse.json();
          if (learnedJson.success && learnedJson.items) {
            learnedData = learnedJson.items.slice(0, 10).map((item: any) => ({
              workId: item.workId,
              title: item.work?.title || item.title,
              composer: item.work?.composer?.name || item.composer,
              learnedAt: new Date(item.learnedAt),
              mastery: item.mastery || 0,
              wouldRecommend: item.wouldRecommend || false,
            }));
          }
        } catch (parseError) {
          console.warn('⚠️ [HOOK] Erro ao processar learned:', parseError);
        }
      }

      // Processar annotations
      let annotationsData = [];
      if (annotationsResponse?.ok) {
        try {
          const annotationsJson = await annotationsResponse.json();
          if (annotationsJson.success && annotationsJson.annotations) {
            annotationsData = annotationsJson.annotations
              .slice(0, 5)
              .map((annotation: any) => ({
                id: annotation.id,
                workTitle: annotation.work?.title || 'Obra não encontrada',
                title: annotation.title,
                category: annotation.category,
                createdAt: new Date(annotation.createdAt),
              }));
          }
        } catch (parseError) {
          console.warn('⚠️ [HOOK] Erro ao processar annotations:', parseError);
        }
      }

      // ✅ Atualizar estado com novos dados
      setState((prev) => ({
        ...prev,
        studyData: {
          wantToLearn: wantToLearnData,
          learned: learnedData,
          recentAnnotations: annotationsData,
        },
      }));

      console.log(
        `✅ [HOOK] Dados de estudo recarregados! Want-to-learn: ${wantToLearnData.length}, Learned: ${learnedData.length}, Annotations: ${annotationsData.length}`
      );
    } catch (error) {
      console.error('❌ [HOOK] Erro ao recarregar dados de estudo:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading('refreshStudyData', false);
    }
  }, [setLoading, setError]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    // State
    ...state,

    // Actions
    setInitialData,
    updateProfile,
    updateField,
    refreshProfile,
    refreshStudyData,
    clearError,
  };
}
