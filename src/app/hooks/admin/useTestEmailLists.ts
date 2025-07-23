// app/hooks/useTestEmailLists.ts
import { useState, useCallback, useEffect } from 'react';

interface TestEmailList {
  id: string;
  name: string;
  description?: string;
  emails: string[];
  color: string;
  isActive: boolean;
  totalEmails: number;
  timesUsed: number;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface TestEmailListStats {
  total: number;
  active: number;
  inactive: number;
  totalEmails: number;
  totalUses: number;
}

interface CreateListData {
  name: string;
  description?: string;
  emails?: string[];
  color?: string;
  isActive?: boolean;
}

interface UpdateListData extends Partial<CreateListData> {}

interface TestEmailListsState {
  lists: TestEmailList[];
  stats: TestEmailListStats | null;
  loading: boolean;
  error: string | null;
  selectedLists: string[];
}

interface SendTestEmailData {
  testListIds: string[];
  templateType: string;
  customSubject?: string;
  testVariables?: Record<string, any>;
  sendMode?: 'bulk' | 'individual';
}

interface SendTestResult {
  success: boolean;
  message: string;
  results: {
    total: number;
    successful: number;
    failed: number;
    successRate: string;
    errors?: string[];
    hasMoreErrors?: boolean;
  };
  lists: Array<{
    id: string;
    name: string;
    emailCount: number;
  }>;
  template: {
    type: string;
    subject: string;
  };
}

export const useTestEmailLists = () => {
  const [state, setState] = useState<TestEmailListsState>({
    lists: [],
    stats: null,
    loading: false,
    error: null,
    selectedLists: [],
  });

  // Buscar todas as listas
  const fetchLists = useCallback(
    async (filters?: {
      search?: string;
      isActive?: boolean;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const searchParams = new URLSearchParams();

        if (filters?.search) searchParams.set('search', filters.search);
        if (filters?.isActive !== undefined)
          searchParams.set('isActive', filters.isActive.toString());
        if (filters?.sortBy) searchParams.set('sortBy', filters.sortBy);
        if (filters?.sortOrder)
          searchParams.set('sortOrder', filters.sortOrder);

        const response = await fetch(
          `/api/admin/newsletter/test-lists?${searchParams}`
        );
        const result = await response.json();

        if (result.success) {
          setState((prev) => ({
            ...prev,
            lists: result.lists,
            stats: result.stats,
            loading: false,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            error: result.error || 'Erro ao carregar listas',
            loading: false,
          }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: 'Erro de conexão',
          loading: false,
        }));
      }
    },
    []
  );

  // Buscar lista específica
  const fetchList = useCallback(
    async (id: string): Promise<TestEmailList | null> => {
      try {
        const response = await fetch(`/api/admin/newsletter/test-lists/${id}`);
        const result = await response.json();

        if (result.success) {
          return result.list;
        } else {
          setState((prev) => ({ ...prev, error: result.error }));
          return null;
        }
      } catch (error) {
        setState((prev) => ({ ...prev, error: 'Erro de conexão' }));
        return null;
      }
    },
    []
  );

  // Criar nova lista
  const createList = useCallback(
    async (
      data: CreateListData
    ): Promise<{ success: boolean; list?: TestEmailList; error?: string }> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch('/api/admin/newsletter/test-lists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
          // Adicionar nova lista ao estado
          setState((prev) => ({
            ...prev,
            lists: [...prev.lists, result.list],
            loading: false,
          }));

          return { success: true, list: result.list };
        } else {
          setState((prev) => ({
            ...prev,
            error: result.error || 'Erro ao criar lista',
            loading: false,
          }));

          return { success: false, error: result.error };
        }
      } catch (error) {
        const errorMessage = 'Erro de conexão';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));

        return { success: false, error: errorMessage };
      }
    },
    []
  );

  // Atualizar lista
  const updateList = useCallback(
    async (
      id: string,
      data: UpdateListData
    ): Promise<{ success: boolean; list?: TestEmailList; error?: string }> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(`/api/admin/newsletter/test-lists/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
          // Atualizar lista no estado
          setState((prev) => ({
            ...prev,
            lists: prev.lists.map((list) =>
              list.id === id ? result.list : list
            ),
            loading: false,
          }));

          return { success: true, list: result.list };
        } else {
          setState((prev) => ({
            ...prev,
            error: result.error || 'Erro ao atualizar lista',
            loading: false,
          }));

          return { success: false, error: result.error };
        }
      } catch (error) {
        const errorMessage = 'Erro de conexão';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));

        return { success: false, error: errorMessage };
      }
    },
    []
  );

  // Deletar lista(s)
  const deleteLists = useCallback(
    async (
      listIds: string[]
    ): Promise<{ success: boolean; deletedCount?: number; error?: string }> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch('/api/admin/newsletter/test-lists', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ listIds }),
        });

        const result = await response.json();

        if (result.success) {
          // Remover listas deletadas do estado
          setState((prev) => ({
            ...prev,
            lists: prev.lists.filter((list) => !listIds.includes(list.id)),
            selectedLists: prev.selectedLists.filter(
              (id) => !listIds.includes(id)
            ),
            loading: false,
          }));

          return { success: true, deletedCount: result.deletedCount };
        } else {
          setState((prev) => ({
            ...prev,
            error: result.error || 'Erro ao deletar listas',
            loading: false,
          }));

          return { success: false, error: result.error };
        }
      } catch (error) {
        const errorMessage = 'Erro de conexão';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));

        return { success: false, error: errorMessage };
      }
    },
    []
  );

  // Ações especiais (duplicar, toggle status, etc.)
  const performAction = useCallback(
    async (
      id: string,
      action: 'duplicate' | 'toggle-status' | 'clear-emails' | 'add-emails',
      payload?: any
    ): Promise<{ success: boolean; list?: TestEmailList; error?: string }> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(`/api/admin/newsletter/test-lists/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action, ...payload }),
        });

        const result = await response.json();

        if (result.success) {
          if (action === 'duplicate') {
            // Adicionar lista duplicada
            setState((prev) => ({
              ...prev,
              lists: [...prev.lists, result.list],
              loading: false,
            }));
          } else {
            // Atualizar lista existente
            setState((prev) => ({
              ...prev,
              lists: prev.lists.map((list) =>
                list.id === id ? result.list : list
              ),
              loading: false,
            }));
          }

          return { success: true, list: result.list };
        } else {
          setState((prev) => ({
            ...prev,
            error: result.error || 'Erro na ação',
            loading: false,
          }));

          return { success: false, error: result.error };
        }
      } catch (error) {
        const errorMessage = 'Erro de conexão';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));

        return { success: false, error: errorMessage };
      }
    },
    []
  );

  // Gerenciar seleção de listas
  const selectList = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      selectedLists: prev.selectedLists.includes(id)
        ? prev.selectedLists.filter((listId) => listId !== id)
        : [...prev.selectedLists, id],
    }));
  }, []);

  const selectAllLists = useCallback((select: boolean = true) => {
    setState((prev) => ({
      ...prev,
      selectedLists: select ? prev.lists.map((list) => list.id) : [],
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState((prev) => ({ ...prev, selectedLists: [] }));
  }, []);

  // Validar emails
  const validateEmails = useCallback(
    (emails: string[]): { valid: string[]; invalid: string[] } => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const valid: string[] = [];
      const invalid: string[] = [];

      emails.forEach((email) => {
        const trimmedEmail = email.trim();
        if (emailRegex.test(trimmedEmail)) {
          valid.push(trimmedEmail.toLowerCase());
        } else {
          invalid.push(trimmedEmail);
        }
      });

      return { valid: [...new Set(valid)], invalid };
    },
    []
  );

  // Reset do estado
  const reset = useCallback(() => {
    setState({
      lists: [],
      stats: null,
      loading: false,
      error: null,
      selectedLists: [],
    });
  }, []);

  // Carregar listas na inicialização
  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  return {
    // Estado
    lists: state.lists,
    stats: state.stats,
    loading: state.loading,
    error: state.error,
    selectedLists: state.selectedLists,

    // Ações CRUD
    fetchLists,
    fetchList,
    createList,
    updateList,
    deleteLists,
    performAction,

    // Seleção
    selectList,
    selectAllLists,
    clearSelection,

    // Utilitários
    validateEmails,
    reset,
  };
};

// Hook separado para envio de emails de teste
export const useTestEmailSending = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SendTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendTestEmails = useCallback(
    async (data: SendTestEmailData): Promise<SendTestResult | null> => {
      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const response = await fetch('/api/admin/newsletter/send-test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
          setResult(result);
          setLoading(false);
          return result;
        } else {
          setError(result.error || 'Erro ao enviar emails de teste');
          setLoading(false);
          return null;
        }
      } catch (error) {
        const errorMessage = 'Erro de conexão';
        setError(errorMessage);
        setLoading(false);
        return null;
      }
    },
    []
  );

  const getAvailableTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/newsletter/send-test');
      const result = await response.json();

      if (result.success) {
        return {
          templates: result.templates,
          stats: result.stats,
        };
      } else {
        setError(result.error || 'Erro ao carregar templates');
        return null;
      }
    } catch (error) {
      setError('Erro de conexão');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setResult(null);
    setError(null);
  }, []);

  return {
    loading,
    result,
    error,
    sendTestEmails,
    getAvailableTemplates,
    reset,
  };
};
