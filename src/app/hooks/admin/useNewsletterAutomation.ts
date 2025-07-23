// app/hooks/admin/useNewsletterAutomation.ts
import { useState, useCallback } from 'react';

interface AutomationRule {
  id: string;
  name: string;
  type: 'WELCOME' | 'DRIP_CAMPAIGN' | 'BEHAVIOR_TRIGGER' | 'SCHEDULED';
  trigger: string;
  isActive: boolean;
  conditions: any;
  actions: any;
  schedule?: string;
  lastRun?: string;
  nextRun?: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  createdAt: string;
}

interface AutomationStats {
  totalAutomations: number;
  activeAutomations: number;
  executionsToday: number;
  successRate: number;
  totalExecutionsLast30Days: number;
  failedExecutionsLast30Days: number;
}

interface UseNewsletterAutomationReturn {
  automations: AutomationRule[] | null;
  stats: AutomationStats | null;
  loading: boolean;
  error: string | null;
  fetchAutomations: () => Promise<void>;
  createAutomation: (automation: any) => Promise<AutomationRule>;
  updateAutomation: (id: string, data: any) => Promise<AutomationRule>;
  deleteAutomation: (id: string) => Promise<void>;
  toggleAutomation: (id: string, isActive: boolean) => Promise<void>;
  executeAutomation: (id: string) => Promise<void>;
}

export const useNewsletterAutomation = (): UseNewsletterAutomationReturn => {
  const [automations, setAutomations] = useState<AutomationRule[] | null>(null);
  const [stats, setStats] = useState<AutomationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAutomations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/newsletter/automation');
      const result = await response.json();

      if (result.success) {
        setAutomations(result.automations);
        setStats(result.stats);
      } else {
        setError(result.error || 'Erro ao carregar automações');
      }
    } catch (err) {
      console.error('Erro ao buscar automações:', err);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAutomation = useCallback(
    async (automationData: any): Promise<AutomationRule> => {
      try {
        const response = await fetch('/api/admin/newsletter/automation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(automationData),
        });

        const result = await response.json();

        if (result.success) {
          const newAutomation = result.automation;
          setAutomations((prev) =>
            prev ? [newAutomation, ...prev] : [newAutomation]
          );
          return newAutomation;
        } else {
          throw new Error(result.error || 'Erro ao criar automação');
        }
      } catch (err) {
        console.error('Erro ao criar automação:', err);
        throw err;
      }
    },
    []
  );

  const updateAutomation = useCallback(
    async (id: string, data: any): Promise<AutomationRule> => {
      try {
        const response = await fetch(`/api/admin/newsletter/automation/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
          const updatedAutomation = result.automation;
          setAutomations((prev) =>
            prev
              ? prev.map((automation) =>
                  automation.id === id
                    ? { ...automation, ...updatedAutomation }
                    : automation
                )
              : null
          );
          return updatedAutomation;
        } else {
          throw new Error(result.error || 'Erro ao atualizar automação');
        }
      } catch (err) {
        console.error('Erro ao atualizar automação:', err);
        throw err;
      }
    },
    []
  );

  const deleteAutomation = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/admin/newsletter/automation/${id}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (result.success) {
          setAutomations((prev) =>
            prev ? prev.filter((automation) => automation.id !== id) : null
          );
          // Atualizar stats
          if (stats) {
            setStats((prev) =>
              prev
                ? {
                    ...prev,
                    totalAutomations: prev.totalAutomations - 1,
                    activeAutomations: prev.activeAutomations - 1, // Simplificado
                  }
                : null
            );
          }
        } else {
          throw new Error(result.error || 'Erro ao deletar automação');
        }
      } catch (err) {
        console.error('Erro ao deletar automação:', err);
        throw err;
      }
    },
    [stats]
  );

  const toggleAutomation = useCallback(
    async (id: string, isActive: boolean) => {
      try {
        const response = await fetch(
          `/api/admin/newsletter/automation/${id}/toggle`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isActive }),
          }
        );

        const result = await response.json();

        if (result.success) {
          setAutomations((prev) =>
            prev
              ? prev.map((automation) =>
                  automation.id === id
                    ? { ...automation, isActive }
                    : automation
                )
              : null
          );

          // Atualizar stats
          if (stats) {
            const delta = isActive ? 1 : -1;
            setStats((prev) =>
              prev
                ? {
                    ...prev,
                    activeAutomations: prev.activeAutomations + delta,
                  }
                : null
            );
          }
        } else {
          throw new Error(result.error || 'Erro ao alternar automação');
        }
      } catch (err) {
        console.error('Erro ao alternar automação:', err);
        throw err;
      }
    },
    [stats]
  );

  const executeAutomation = useCallback(async (id: string) => {
    try {
      const response = await fetch(
        `/api/admin/newsletter/automation/${id}/execute`,
        {
          method: 'POST',
        }
      );

      const result = await response.json();

      if (result.success) {
        // Atualizar contadores de execução
        setAutomations((prev) =>
          prev
            ? prev.map((automation) =>
                automation.id === id
                  ? {
                      ...automation,
                      totalExecutions: automation.totalExecutions + 1,
                      successfulExecutions: result.success
                        ? automation.successfulExecutions + 1
                        : automation.successfulExecutions,
                      failedExecutions: result.success
                        ? automation.failedExecutions
                        : automation.failedExecutions + 1,
                      lastRun: new Date().toISOString(),
                    }
                  : automation
              )
            : null
        );
      } else {
        throw new Error(result.error || 'Erro ao executar automação');
      }
    } catch (err) {
      console.error('Erro ao executar automação:', err);
      throw err;
    }
  }, []);

  return {
    automations,
    stats,
    loading,
    error,
    fetchAutomations,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    toggleAutomation,
    executeAutomation,
  };
};
