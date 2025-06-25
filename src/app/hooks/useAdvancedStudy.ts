// hooks/useAdvancedStudy.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAdvancedStudyStore } from '@/app/stores/useAdvancedStudyStore';
import { toast } from 'react-hot-toast';

export interface StudyMetrics {
  focusScore: number;
  efficiencyScore: number;
  progressScore: number;
  consistencyScore: number;
  qualityScore: number;
  overallScore: number;
}

export interface StudyAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  nextSteps: string[];
  estimatedTimeToGoal: number;
  difficultyTrend: 'increasing' | 'stable' | 'decreasing';
}

export interface StudySession {
  startTime: Date;
  duration: number;
  isActive: boolean;
  isPaused: boolean;
  pauseCount: number;
  focusTime: number;
  breakTime: number;
  productivity: number;
}

export function useAdvancedStudy() {
  const store = useAdvancedStudyStore();
  const [metrics, setMetrics] = useState<StudyMetrics>({
    focusScore: 0,
    efficiencyScore: 0,
    progressScore: 0,
    consistencyScore: 0,
    qualityScore: 0,
    overallScore: 0,
  });

  const [analysis, setAnalysis] = useState<StudyAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Refs para timers e intervals
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const focusTrackerRef = useRef<NodeJS.Timeout | null>(null);
  const activityRef = useRef<{ lastActivity: number; isActive: boolean }>({
    lastActivity: Date.now(),
    isActive: true,
  });

  // Auto-save interval
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar timers quando sessão inicia
  useEffect(() => {
    if (store.currentSession?.isActive && !store.currentSession?.isPaused) {
      startTimers();
    } else {
      stopTimers();
    }

    return () => {
      stopTimers();
    };
  }, [store.currentSession?.isActive, store.currentSession?.isPaused]);

  // Auto-save
  useEffect(() => {
    if (store.userPreferences.autoSave && store.currentSession) {
      autoSaveRef.current = setInterval(() => {
        store.saveSession();
      }, store.userPreferences.saveInterval * 1000);
    }

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [store.currentSession, store.userPreferences.autoSave]);

  // Iniciar timers
  const startTimers = useCallback(() => {
    // Timer principal
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        store.updateTimer();
        updateMetrics();
      }, 1000);
    }

    // Tracker de foco
    if (!focusTrackerRef.current) {
      focusTrackerRef.current = setInterval(() => {
        trackFocus();
      }, 5000); // Check every 5 seconds
    }

    // Activity listener
    const handleActivity = () => {
      activityRef.current = {
        lastActivity: Date.now(),
        isActive: true,
      };
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, []);

  // Parar timers
  const stopTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (focusTrackerRef.current) {
      clearInterval(focusTrackerRef.current);
      focusTrackerRef.current = null;
    }
  }, []);

  // Rastrear foco
  const trackFocus = useCallback(() => {
    const now = Date.now();
    const timeSinceActivity = now - activityRef.current.lastActivity;
    const isCurrentlyActive = timeSinceActivity < 10000; // 10 seconds threshold

    if (isCurrentlyActive && activityRef.current.isActive) {
      store.addFocusTime();
    }

    activityRef.current.isActive = isCurrentlyActive;
  }, []);

  // Atualizar métricas em tempo real
  const updateMetrics = useCallback(() => {
    if (!store.currentSession) return;

    const session = store.currentSession;
    const efficiency =
      session.duration > 0 ? (session.focusTime / session.duration) * 100 : 0;
    const consistency = calculateConsistency();
    const progress = calculateProgress();
    const quality = calculateQuality();
    const focus = calculateFocusScore();

    const newMetrics: StudyMetrics = {
      focusScore: Math.round(focus),
      efficiencyScore: Math.round(efficiency),
      progressScore: Math.round(progress),
      consistencyScore: Math.round(consistency),
      qualityScore: Math.round(quality),
      overallScore: Math.round(
        (focus + efficiency + progress + consistency + quality) / 5
      ),
    };

    setMetrics(newMetrics);
  }, [store.currentSession]);

  // Calcular pontuação de foco
  const calculateFocusScore = useCallback((): number => {
    if (!store.currentSession) return 0;

    const session = store.currentSession;
    if (session.duration === 0) return 100;

    const focusRatio = session.focusTime / session.duration;
    return Math.min(focusRatio * 100, 100);
  }, [store.currentSession]);

  // Calcular consistência
  const calculateConsistency = useCallback((): number => {
    // Baseado no histórico de sessões
    const streakBonus = Math.min(store.analytics.streak * 5, 50);
    const sessionRegularity = store.analytics.practiceConsistency;
    return Math.min(sessionRegularity + streakBonus, 100);
  }, [store.analytics]);

  // Calcular progresso
  const calculateProgress = useCallback((): number => {
    if (!store.currentSession) return 0;

    const goalsCompleted = store.currentSession.goals.filter(
      (g) => g.completed
    ).length;
    const totalGoals = store.currentSession.goals.length;

    if (totalGoals === 0) return 50; // Neutral score if no goals

    return (goalsCompleted / totalGoals) * 100;
  }, [store.currentSession]);

  // Calcular qualidade
  const calculateQuality = useCallback((): number => {
    if (!store.currentSession) return 0;

    const session = store.currentSession;
    let qualityScore = 100;

    // Penalizar por muitas pausas
    if (session.pauseCount > 3) {
      qualityScore -= (session.pauseCount - 3) * 5;
    }

    // Penalizar por muitos restarts
    if (session.restartCount > 2) {
      qualityScore -= (session.restartCount - 2) * 10;
    }

    // Bonus por seções completadas com qualidade
    const avgSectionQuality =
      session.sections.reduce((acc, s) => acc + s.quality, 0) /
      session.sections.length;
    if (!isNaN(avgSectionQuality)) {
      qualityScore = (qualityScore + avgSectionQuality * 20) / 2;
    }

    return Math.max(qualityScore, 0);
  }, [store.currentSession]);

  // Analisar sessão com IA
  const analyzeSession = useCallback(async (): Promise<StudyAnalysis> => {
    setIsAnalyzing(true);

    try {
      // Simular análise de IA (em produção seria uma chamada real para API)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const session = store.currentSession;
      if (!session) throw new Error('No active session');

      const analysis: StudyAnalysis = {
        strengths: generateStrengths(session, metrics),
        weaknesses: generateWeaknesses(session, metrics),
        recommendations: generateRecommendations(session, metrics),
        nextSteps: generateNextSteps(session),
        estimatedTimeToGoal: estimateTimeToGoal(session),
        difficultyTrend: analyzeDifficultyTrend(session),
      };

      setAnalysis(analysis);
      return analysis;
    } catch (error) {
      console.error('Error analyzing session:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [store.currentSession, metrics]);

  // Gerar pontos fortes
  const generateStrengths = (session: any, metrics: StudyMetrics): string[] => {
    const strengths: string[] = [];

    if (metrics.focusScore >= 80) {
      strengths.push('Excelente concentração mantida durante a sessão');
    }

    if (metrics.efficiencyScore >= 75) {
      strengths.push('Alta eficiência no uso do tempo de prática');
    }

    if (session.sectionsRepeated >= 5) {
      strengths.push('Boa dedicação à repetição e aperfeiçoamento');
    }

    if (session.pauseCount <= 2) {
      strengths.push('Conseguiu manter foco com poucas interrupções');
    }

    if (session.goals.some((g: any) => g.completed)) {
      strengths.push('Alcançou objetivos definidos para a sessão');
    }

    return strengths.length > 0
      ? strengths
      : ['Completou uma sessão de estudo dedicada'];
  };

  // Gerar pontos fracos
  const generateWeaknesses = (
    session: any,
    metrics: StudyMetrics
  ): string[] => {
    const weaknesses: string[] = [];

    if (metrics.focusScore < 60) {
      weaknesses.push('Dificuldade em manter concentração consistente');
    }

    if (session.pauseCount > 5) {
      weaknesses.push('Muitas interrupções durante a prática');
    }

    if (session.restartCount > 3) {
      weaknesses.push(
        'Tendência a reiniciar frequentemente - trabalhe a paciência'
      );
    }

    if (metrics.efficiencyScore < 50) {
      weaknesses.push('Tempo de prática poderia ser mais eficiente');
    }

    if (session.mistakeCount > 10) {
      weaknesses.push('Alto número de erros - considere reduzir o andamento');
    }

    return weaknesses;
  };

  // Gerar recomendações
  const generateRecommendations = (
    session: any,
    metrics: StudyMetrics
  ): string[] => {
    const recommendations: string[] = [];

    if (metrics.focusScore < 70) {
      recommendations.push(
        'Experimente sessões mais curtas (20-30 min) para melhorar o foco'
      );
      recommendations.push('Elimine distrações do ambiente de estudo');
    }

    if (session.pauseCount > 4) {
      recommendations.push('Defina horários específicos para pausas');
      recommendations.push(
        'Use a técnica Pomodoro (25 min estudo + 5 min pausa)'
      );
    }

    if (session.sectionsRepeated < 3) {
      recommendations.push(
        'Aumente o número de repetições para melhor memorização'
      );
    }

    if (metrics.qualityScore < 60) {
      recommendations.push(
        'Pratique em andamento mais lento para maior precisão'
      );
      recommendations.push('Defina objetivos específicos para cada seção');
    }

    if (session.metronome.isActive === false) {
      recommendations.push('Use metrônomo para desenvolver senso rítmico');
    }

    return recommendations.length > 0
      ? recommendations
      : ['Continue mantendo a regularidade na prática'];
  };

  // Gerar próximos passos
  const generateNextSteps = (session: any): string[] => {
    const nextSteps: string[] = [];

    const incompleteSections = session.sections.filter(
      (s: any) => s.quality < 4
    );
    if (incompleteSections.length > 0) {
      nextSteps.push(
        `Revisar ${incompleteSections.length} seção(ões) que precisam de mais trabalho`
      );
    }

    const incompleteGoals = session.goals.filter((g: any) => !g.completed);
    if (incompleteGoals.length > 0) {
      nextSteps.push(
        `Focar nos ${incompleteGoals.length} objetivo(s) não alcançados`
      );
    }

    nextSteps.push('Definir metas específicas para a próxima sessão');
    nextSteps.push('Revisar gravações da sessão, se disponíveis');

    if (session.duration < 30 * 60) {
      // Less than 30 minutes
      nextSteps.push('Considerar sessões mais longas para maior progresso');
    }

    return nextSteps;
  };

  // Estimar tempo para atingir objetivo
  const estimateTimeToGoal = (session: any): number => {
    // Algoritmo simplificado baseado no progresso atual
    const averageProgress = metrics.progressScore;
    const remainingProgress = 100 - averageProgress;
    const sessionsNeeded = Math.ceil(
      remainingProgress / Math.max(averageProgress / 10, 5)
    );

    return sessionsNeeded;
  };

  // Analisar tendência de dificuldade
  const analyzeDifficultyTrend = (
    session: any
  ): 'increasing' | 'stable' | 'decreasing' => {
    const recentSections = session.sections.slice(-3);
    if (recentSections.length < 2) return 'stable';

    const avgDifficulty =
      recentSections.reduce((acc: number, s: any) => acc + s.difficulty, 0) /
      recentSections.length;
    const firstDifficulty = recentSections[0]?.difficulty || 5;

    if (avgDifficulty > firstDifficulty + 1) return 'increasing';
    if (avgDifficulty < firstDifficulty - 1) return 'decreasing';
    return 'stable';
  };

  // Gerenciar pausa inteligente
  const smartBreak = useCallback(
    (force = false) => {
      if (!store.currentSession) return;

      const session = store.currentSession;
      const shouldBreak =
        force ||
        (session.duration >= store.userPreferences.breakInterval * 60 &&
          metrics.focusScore < 70);

      if (shouldBreak) {
        store.pauseSession();
        toast.success('Hora de uma pausa! Sua concentração diminuiu.', {
          duration: 5000,
          icon: '☕',
        });

        // Auto-resume após 5 minutos se configurado
        setTimeout(() => {
          if (
            store.currentSession?.isPaused &&
            store.userPreferences.autoStartTimer
          ) {
            store.resumeSession();
            toast.success('Pausa terminada. Vamos continuar!');
          }
        }, 5 * 60 * 1000);
      }
    },
    [store.currentSession, metrics.focusScore]
  );

  // Sugerir ajustes durante a sessão
  const provideLiveFeedback = useCallback(() => {
    if (!store.currentSession) return;

    const session = store.currentSession;

    // Feedback sobre foco
    if (metrics.focusScore < 50 && session.duration > 10 * 60) {
      toast('Sua concentração diminuiu. Considere fazer uma pausa.', {
        icon: '🧠',
        duration: 4000,
      });
    }

    // Feedback sobre progresso
    if (session.duration > 30 * 60 && metrics.progressScore < 30) {
      toast('Que tal definir objetivos específicos para esta sessão?', {
        icon: '🎯',
        duration: 4000,
      });
    }

    // Feedback sobre qualidade
    if (session.mistakeCount > 15 && session.duration > 20 * 60) {
      toast('Muitos erros detectados. Tente praticar mais devagar.', {
        icon: '⚡',
        duration: 4000,
      });
    }
  }, [store.currentSession, metrics]);

  // Executar feedback ao vivo a cada 5 minutos
  useEffect(() => {
    if (!store.currentSession?.isActive || store.currentSession?.isPaused)
      return;

    const interval = setInterval(provideLiveFeedback, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [
    store.currentSession?.isActive,
    store.currentSession?.isPaused,
    provideLiveFeedback,
  ]);

  // Backup automático para cloud
  const backupToCloud = useCallback(async () => {
    if (!store.userPreferences.cloudSync) return;

    try {
      const sessionData = {
        session: store.currentSession,
        metrics,
        analysis,
        timestamp: Date.now(),
      };

      // Simular backup (em produção seria uma chamada real)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Backup realizado com sucesso!', { icon: '☁️' });
    } catch (error) {
      toast.error('Erro ao fazer backup na nuvem');
    }
  }, [store.currentSession, metrics, analysis]);

  // Validar configuração de dispositivos
  const validateDeviceSetup = useCallback(async () => {
    try {
      // Verificar permissões de mídia
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      stream.getTracks().forEach((track) => track.stop());

      return { audio: true, message: 'Dispositivos configurados corretamente' };
    } catch (error) {
      return { audio: false, message: 'Erro ao acessar microfone' };
    }
  }, []);

  // Gerar insights personalizados
  const generatePersonalizedInsights = useCallback(() => {
    if (!store.analytics) return [];

    const insights = [];

    // Insight sobre melhor horário
    if (store.analytics.sessionsToday > 0) {
      insights.push({
        type: 'time',
        title: 'Melhor Horário',
        message: 'Você tende a ser mais produtivo às 19h',
        action: 'Agendar próximas sessões neste horário',
      });
    }

    // Insight sobre consistência
    if (store.analytics.streak >= 7) {
      insights.push({
        type: 'consistency',
        title: 'Excelente Consistência!',
        message: `${store.analytics.streak} dias seguidos praticando`,
        action: 'Continue assim para máximo progresso',
      });
    }

    // Insight sobre eficiência
    if (metrics.efficiencyScore >= 80) {
      insights.push({
        type: 'efficiency',
        title: 'Alta Eficiência',
        message: 'Você está aproveitando bem seu tempo',
        action: 'Considere aumentar a duração das sessões',
      });
    }

    return insights;
  }, [store.analytics, metrics]);

  return {
    // Estado
    metrics,
    analysis,
    isAnalyzing,

    // Dados da store
    currentSession: store.currentSession,
    analytics: store.analytics,
    isStudyModeOpen: store.isStudyModeOpen,

    // Ações principais
    startSession: store.startAdvancedSession,
    pauseSession: store.pauseSession,
    resumeSession: store.resumeSession,
    endSession: store.endSession,
    saveSession: store.saveSession,

    // Ferramentas e configurações
    updateMetronome: store.updateMetronome,
    toggleMetronome: store.toggleMetronome,
    addGoal: store.addGoal,
    updateGoal: store.updateGoal,
    completeGoal: store.completeGoal,
    removeGoal: store.removeGoal,

    // Seções e anotações
    startSection: store.startSection,
    endSection: store.endSection,
    addAnnotation: store.addAnnotation,
    updateAnnotation: store.updateAnnotation,
    removeAnnotation: store.removeAnnotation,

    // Gravações
    startRecording: store.startRecording,
    stopRecording: store.stopRecording,
    deleteRecording: store.deleteRecording,

    // UI Controls
    setActiveTab: store.setActiveTab,
    openStudyMode: store.openStudyMode,
    closeStudyMode: store.closeStudyMode,

    // Analytics avançadas
    analyzeSession,
    updateMetrics,
    smartBreak,
    provideLiveFeedback,
    backupToCloud,
    validateDeviceSetup,
    generatePersonalizedInsights,

    // Helpers
    getWeeklyProgress: store.getWeeklyProgress,
    getTodayProgress: store.getTodayProgress,
    getStreak: store.getStreak,
    exportSession: store.exportSession,
    importSession: store.importSession,

    // Cleanup
    cleanup: store.cleanup,
  };
}
