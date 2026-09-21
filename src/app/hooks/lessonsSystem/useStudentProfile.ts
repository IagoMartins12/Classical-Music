// app/hooks/lessonsSystem/useStudentProfile.ts - Hook CORRIGIDO para melhor integração

import type { StudentProfileData } from '@/app/(student)/student/profile/pageServer';
import { useState, useCallback } from 'react';
import {
  saveStudentProfile,
  updateStudentField,
} from '@/app/requests/portal/profile-actions';
import {
  loadStudentProfile,
  loadStudentStudyData,
} from '@/app/requests/portal/student';

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

        const profile = await saveStudentProfile(updates);

        // ✅ Atualizar estado local com o perfil relido da API
        setState((prev) => ({
          ...prev,
          profile,
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

        const profile = await updateStudentField(
          state.profile,
          field,
          value,
          action
        );

        // ✅ Atualizar estado local com o perfil relido da API
        setState((prev) => ({
          ...prev,
          profile,
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
    [state.profile, setLoading, setError]
  );

  // 🔧 REFRESH PROFILE CORRIGIDO
  const refreshProfile = useCallback(async () => {
    setLoading('profile', true);
    setError(null);

    try {
      console.log('🔄 [HOOK] Recarregando perfil...');

      const data = await loadStudentProfile();

      if (!data) {
        throw new Error('Perfil de aluno não encontrado');
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

      // Os mesmos dados de estudo do painel: obras em estudo, aprendidas e
      // as anotações recentes do próprio aluno (públicas ou não).
      const study = await loadStudentStudyData();

      setState((prev) => ({
        ...prev,
        studyData: {
          wantToLearn: study.currentWorks,
          learned: study.learnedWorks,
          recentAnnotations: study.recentAnnotations,
        },
      }));
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
