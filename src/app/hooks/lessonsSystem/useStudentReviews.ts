// app/hooks/useStudentReviews.ts - Hook para gerenciar avaliações de professores

import { useState, useCallback } from 'react';

export interface TeacherToReview {
  teacherId: string;
  teacherName: string;
  teacherImage?: string;
  teacherEmail?: string;
  specialties: string[];
  relationshipStart: Date;
  totalLessons: number;
  completedLessons: number;
  relationshipDuration: string;
  hasReview: boolean;
  currentReview?: {
    id: string;
    rating: number;
    comment?: string;
    teachingQuality?: number;
    communication?: number;
    punctuality?: number;
    preparation?: number;
    patience?: number;
    motivation?: number;
    wouldRecommend: boolean;
    createdAt: Date;
  };
}

export interface ReviewData {
  rating: number; // 1-5 obrigatório
  comment?: string;
  teachingQuality?: number; // 1-5
  communication?: number; // 1-5
  punctuality?: number; // 1-5
  preparation?: number; // 1-5
  patience?: number; // 1-5
  motivation?: number; // 1-5
  wouldRecommend: boolean;
}

interface UseStudentReviewsState {
  teachers: TeacherToReview[];
  loading: {
    teachers: boolean;
    submitReview: boolean;
    updateReview: boolean;
  };
  error: string | null;
  successMessage: string | null;
}

interface UseStudentReviewsActions {
  fetchTeachersToReview: () => Promise<void>;

  submitReview: (teacherId: string, reviewData: ReviewData) => Promise<boolean>;

  updateReview: (teacherId: string, reviewData: ReviewData) => Promise<boolean>;

  refreshTeachers: () => Promise<void>;

  clearError: () => void;

  clearSuccess: () => void;
}

export function useStudentReviews(): UseStudentReviewsState &
  UseStudentReviewsActions {
  const [state, setState] = useState<UseStudentReviewsState>({
    teachers: [],
    loading: {
      teachers: false,
      submitReview: false,
      updateReview: false,
    },
    error: null,
    successMessage: null,
  });

  // Helper function to update loading state
  const setLoading = useCallback(
    (key: keyof UseStudentReviewsState['loading'], value: boolean) => {
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

  // Helper function to set error
  const setError = useCallback((error: string | null) => {
    setState((prev) => ({
      ...prev,
      error,
      successMessage: null,
    }));
  }, []);

  // Helper function to set success message
  const setSuccess = useCallback((message: string | null) => {
    setState((prev) => ({
      ...prev,
      successMessage: message,
      error: null,
    }));
  }, []);

  // Fetch teachers to review
  const fetchTeachersToReview = useCallback(async () => {
    setLoading('teachers', true);
    setError(null);

    try {
      const response = await fetch('/api/reviews');

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao carregar professores');
      }

      setState((prev) => ({
        ...prev,
        teachers: data.teachers || [],
      }));
    } catch (error) {
      console.error('Erro ao buscar professores:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading('teachers', false);
    }
  }, [setLoading, setError]);

  // Submit new review
  const submitReview = useCallback(
    async (teacherId: string, reviewData: ReviewData): Promise<boolean> => {
      setLoading('submitReview', true);
      setError(null);

      try {
        const response = await fetch('/api/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            teacherId,
            ...reviewData,
          }),
        });

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erro ao enviar avaliação');
        }

        // Update teacher in state to reflect new review
        setState((prev) => ({
          ...prev,
          teachers: prev.teachers.map((teacher) =>
            teacher.teacherId === teacherId
              ? {
                  ...teacher,
                  hasReview: true,
                  currentReview: {
                    id: data.review.id,
                    rating: reviewData.rating,
                    comment: reviewData.comment,
                    teachingQuality: reviewData.teachingQuality,
                    communication: reviewData.communication,
                    punctuality: reviewData.punctuality,
                    preparation: reviewData.preparation,
                    patience: reviewData.patience,
                    motivation: reviewData.motivation,
                    wouldRecommend: reviewData.wouldRecommend,
                    createdAt: new Date(),
                  },
                }
              : teacher
          ),
        }));

        setSuccess('Avaliação enviada com sucesso!');
        return true;
      } catch (error) {
        console.error('Erro ao enviar avaliação:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('submitReview', false);
      }
    },
    [setLoading, setError, setSuccess]
  );

  // Update existing review
  const updateReview = useCallback(
    async (teacherId: string, reviewData: ReviewData): Promise<boolean> => {
      setLoading('updateReview', true);
      setError(null);

      try {
        const response = await fetch('/api/reviews', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            teacherId,
            ...reviewData,
          }),
        });

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erro ao atualizar avaliação');
        }

        // Update teacher in state to reflect updated review
        setState((prev) => ({
          ...prev,
          teachers: prev.teachers.map((teacher) =>
            teacher.teacherId === teacherId
              ? {
                  ...teacher,
                  currentReview: teacher.currentReview
                    ? {
                        ...teacher.currentReview,
                        rating: reviewData.rating,
                        comment: reviewData.comment,
                        teachingQuality: reviewData.teachingQuality,
                        communication: reviewData.communication,
                        punctuality: reviewData.punctuality,
                        preparation: reviewData.preparation,
                        patience: reviewData.patience,
                        motivation: reviewData.motivation,
                        wouldRecommend: reviewData.wouldRecommend,
                      }
                    : undefined,
                }
              : teacher
          ),
        }));

        setSuccess('Avaliação atualizada com sucesso!');
        return true;
      } catch (error) {
        console.error('Erro ao atualizar avaliação:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        return false;
      } finally {
        setLoading('updateReview', false);
      }
    },
    [setLoading, setError, setSuccess]
  );

  // Refresh teachers (wrapper for fetchTeachersToReview)
  const refreshTeachers = useCallback(async () => {
    await fetchTeachersToReview();
  }, [fetchTeachersToReview]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  // Clear success message
  const clearSuccess = useCallback(() => {
    setSuccess(null);
  }, [setSuccess]);

  return {
    // State
    ...state,

    // Actions
    fetchTeachersToReview,
    submitReview,
    updateReview,
    refreshTeachers,
    clearError,
    clearSuccess,
  };
}
