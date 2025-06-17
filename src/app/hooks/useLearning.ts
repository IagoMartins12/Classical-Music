// hooks/useLearning.ts
'use client';

import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useLearningStore } from '../stores/useLearningStore';

export function useLearning() {
  const { user, isAuthenticated } = useAuth();
  const { initializeLearning, initialized, reset } = useLearningStore();

  // Carregar dados de aprendizado quando usuário faz login
  useEffect(() => {
    if (isAuthenticated && user?.id && !initialized) {
      // Buscar dados do servidor apenas se não estiverem inicializados
      fetchLearningData();
    } else if (!isAuthenticated && initialized) {
      // Limpar dados quando usuário faz logout
      reset();
    }
  }, [isAuthenticated, user?.id, initialized, initializeLearning, reset]);

  const fetchLearningData = async () => {
    try {
      const [wantToLearnResponse, learnedResponse] = await Promise.all([
        fetch('/api/learning/want-to-learn'),
        fetch('/api/learning/learned'),
      ]);

      if (wantToLearnResponse.ok && learnedResponse.ok) {
        const [wantToLearnData, learnedData] = await Promise.all([
          wantToLearnResponse.json(),
          learnedResponse.json(),
        ]);

        initializeLearning(
          wantToLearnData.items || [],
          learnedData.items || []
        );
      }
    } catch (error) {
      console.error('Erro ao carregar dados de aprendizado:', error);
    }
  };

  return {
    initialized,
    refetch: fetchLearningData,
  };
}
