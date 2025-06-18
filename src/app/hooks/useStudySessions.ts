// hooks/useStudySessions.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';

export interface StudySessionData {
  id: string;
  workId: string;
  durationMin: number;
  date: string;
  focus: string;
  rating?: number;
  notes?: string;
  metronomeUsed: boolean;
  sectionsWorked: string[];
  practiceGoals: string[];
  work: {
    id: string;
    title: string;
    opOrCatalog?: string;
    composer: {
      name: string;
      fullName: string;
    };
  };
}

export interface StudySessionStats {
  totalSessions: number;
  totalMinutes: number;
  averageMinutes: number;
  averageRating: number;
}

interface UseStudySessionsReturn {
  // Data
  sessions: StudySessionData[];
  stats: StudySessionStats;

  // State
  loading: boolean;
  error: string | null;

  // Pagination
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
  };

  // Actions
  fetchSessions: (
    workId?: string,
    limit?: number,
    offset?: number
  ) => Promise<void>;
  updateSession: (
    id: string,
    updates: Partial<StudySessionData>
  ) => Promise<boolean>;
  deleteSession: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;

  // Helpers
  getSessionsByWork: (workId: string) => StudySessionData[];
  getTotalStudyTime: () => number;
  getAverageSessionDuration: () => number;
  getSessionsThisWeek: () => StudySessionData[];
  getSessionsThisMonth: () => StudySessionData[];
  getMostStudiedWorks: () => Array<{
    workId: string;
    workTitle: string;
    totalMinutes: number;
    sessionCount: number;
  }>;
}

export function useStudySessions(
  initialWorkId?: string
): UseStudySessionsReturn {
  const { isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<StudySessionData[]>([]);
  const [stats, setStats] = useState<StudySessionStats>({
    totalSessions: 0,
    totalMinutes: 0,
    averageMinutes: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasNext: false,
  });

  // Fetch sessions
  const fetchSessions = useCallback(
    async (workId?: string, limit = 10, offset = 0) => {
      if (!isAuthenticated) return;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          limit: limit.toString(),
          offset: offset.toString(),
        });

        if (workId) {
          params.append('workId', workId);
        }

        const response = await fetch(`/api/study-sessions?${params}`);

        if (!response.ok) {
          throw new Error('Erro ao carregar sessões de estudo');
        }

        const data = await response.json();

        if (data.success) {
          setSessions(
            offset === 0
              ? data.studySessions
              : (prev) => [...prev, ...data.studySessions]
          );
          setStats(data.stats);
          setPagination(data.pagination);
        } else {
          throw new Error(data.error || 'Erro desconhecido');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao carregar sessões';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Update session
  const updateSession = useCallback(
    async (
      id: string,
      updates: Partial<StudySessionData>
    ): Promise<boolean> => {
      if (!isAuthenticated) return false;

      try {
        const response = await fetch('/api/study-sessions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...updates }),
        });

        const data = await response.json();

        if (data.success) {
          setSessions((prev) =>
            prev.map((session) =>
              session.id === id ? { ...session, ...updates } : session
            )
          );
          toast.success('Sessão atualizada com sucesso!');
          return true;
        } else {
          throw new Error(data.error || 'Erro ao atualizar sessão');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao atualizar sessão';
        toast.error(errorMessage);
        return false;
      }
    },
    [isAuthenticated]
  );

  // Delete session
  const deleteSession = useCallback(
    async (id: string): Promise<boolean> => {
      if (!isAuthenticated) return false;

      try {
        const response = await fetch(`/api/study-sessions?id=${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          setSessions((prev) => prev.filter((session) => session.id !== id));
          setStats((prev) => ({
            ...prev,
            totalSessions: prev.totalSessions - 1,
          }));
          toast.success('Sessão removida com sucesso!');
          return true;
        } else {
          throw new Error(data.error || 'Erro ao remover sessão');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao remover sessão';
        toast.error(errorMessage);
        return false;
      }
    },
    [isAuthenticated]
  );

  // Refetch
  const refetch = useCallback(() => {
    return fetchSessions(initialWorkId, pagination.limit, 0);
  }, [fetchSessions, initialWorkId, pagination.limit]);

  // Helper functions
  const getSessionsByWork = useCallback(
    (workId: string) => {
      return sessions.filter((session) => session.workId === workId);
    },
    [sessions]
  );

  const getTotalStudyTime = useCallback(() => {
    return sessions.reduce((total, session) => total + session.durationMin, 0);
  }, [sessions]);

  const getAverageSessionDuration = useCallback(() => {
    if (sessions.length === 0) return 0;
    return Math.round(getTotalStudyTime() / sessions.length);
  }, [sessions, getTotalStudyTime]);

  const getSessionsThisWeek = useCallback(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return sessions.filter((session) => new Date(session.date) >= oneWeekAgo);
  }, [sessions]);

  const getSessionsThisMonth = useCallback(() => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return sessions.filter((session) => new Date(session.date) >= oneMonthAgo);
  }, [sessions]);

  const getMostStudiedWorks = useCallback(() => {
    const workStats = new Map<
      string,
      {
        workTitle: string;
        totalMinutes: number;
        sessionCount: number;
      }
    >();

    sessions.forEach((session) => {
      const current = workStats.get(session.workId) || {
        workTitle: session.work.title,
        totalMinutes: 0,
        sessionCount: 0,
      };

      workStats.set(session.workId, {
        workTitle: current.workTitle,
        totalMinutes: current.totalMinutes + session.durationMin,
        sessionCount: current.sessionCount + 1,
      });
    });

    return Array.from(workStats.entries())
      .map(([workId, stats]) => ({ workId, ...stats }))
      .sort((a, b) => b.totalMinutes - a.totalMinutes);
  }, [sessions]);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchSessions(initialWorkId);
    }
  }, [isAuthenticated, initialWorkId, fetchSessions]);

  return {
    // Data
    sessions,
    stats,

    // State
    loading,
    error,

    // Pagination
    pagination,

    // Actions
    fetchSessions,
    updateSession,
    deleteSession,
    refetch,

    // Helpers
    getSessionsByWork,
    getTotalStudyTime,
    getAverageSessionDuration,
    getSessionsThisWeek,
    getSessionsThisMonth,
    getMostStudiedWorks,
  };
}
