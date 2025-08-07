// app/hooks/useStudentProfile.ts - Hook para gerenciar perfil do aluno

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

  // Update profile
  const updateProfile = useCallback(
    async (updates: UpdateProfileData): Promise<boolean> => {
      setLoading('updateProfile', true);
      setError(null);

      try {
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

        // Update local state
        setState((prev) => ({
          ...prev,
          profile: prev.profile
            ? { ...prev.profile, ...data.profile }
            : data.profile,
        }));

        console.log('✅ Perfil atualizado com sucesso!');
        return true;
      } catch (error) {
        console.error('❌ Erro ao atualizar perfil:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('updateProfile', false);
      }
    },
    [setLoading, setError]
  );

  // Update specific field
  const updateField = useCallback(
    async (
      field: string,
      value: any,
      action: 'set' | 'add' | 'remove' = 'set'
    ): Promise<boolean> => {
      setLoading('updateField', true);
      setError(null);

      try {
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

        // Update local state
        setState((prev) => ({
          ...prev,
          profile: prev.profile
            ? { ...prev.profile, ...data.profile }
            : data.profile,
        }));

        console.log(`✅ Campo ${field} atualizado com sucesso!`);
        return true;
      } catch (error) {
        console.error(`❌ Erro ao atualizar campo ${field}:`, error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('updateField', false);
      }
    },
    [setLoading, setError]
  );

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    setLoading('profile', true);
    setError(null);

    try {
      const response = await fetch('/api/student/profile');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erro ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro ao carregar perfil');
      }

      setState((prev) => ({
        ...prev,
        profile: data.profile,
      }));

      console.log('✅ Perfil recarregado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao recarregar perfil:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading('profile', false);
    }
  }, [setLoading, setError]);

  // Refresh study data
  const refreshStudyData = useCallback(async () => {
    setLoading('refreshStudyData', true);
    setError(null);

    try {
      // Fetch want-to-learn, learned, and annotations in parallel
      const [wantToLearnResponse, learnedResponse, annotationsResponse] =
        await Promise.all([
          fetch('/api/want-to-learn?limit=10'),
          fetch('/api/learned?limit=10'),
          fetch('/api/annotations?limit=5&public=true'),
        ]);

      const wantToLearnData = wantToLearnResponse.ok
        ? (await wantToLearnResponse.json()).works || []
        : [];

      const learnedData = learnedResponse.ok
        ? (await learnedResponse.json()).works || []
        : [];

      const annotationsData = annotationsResponse.ok
        ? (await annotationsResponse.json()).annotations || []
        : [];

      setState((prev) => ({
        ...prev,
        studyData: {
          wantToLearn: wantToLearnData,
          learned: learnedData,
          recentAnnotations: annotationsData,
        },
      }));

      console.log('✅ Dados de estudo recarregados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao recarregar dados de estudo:', error);
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
