// app/hooks/useTestEmailLists.ts
import { useCallback, useMemo, useState } from 'react';
import { adminKeys, errorMessage as queryError, useAdminQuery } from './query';
import {
  type ApiTestList,
  createTestListRequest,
  deleteTestListRequest,
  listTemplatesRequest,
  listTestListsRequest,
  testListStats,
  updateTestListRequest,
} from '@/app/requests/admin/newsletter';

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
}

interface CreateListData {
  name: string;
  description?: string;
  emails?: string[];
  color?: string;
  isActive?: boolean;
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

const toList = (list: ApiTestList): TestEmailList => ({
  ...list,
  description: list.description ?? undefined,
  lastUsed: list.lastUsed ?? undefined,
  totalEmails: list.totalEmails ?? list.emails.length,
  timesUsed: list.timesUsed ?? 0,
});

const errorMessage = (err: unknown) =>
  err instanceof Error ? err.message : 'Erro de conexão';

/**
 * Listas de e-mails de teste pela API. A API tem criar, editar e remover; a
 * busca, a ordem, o duplicar e as ações sobre os e-mails são feitos aqui, sobre
 * a lista inteira que ela devolve.
 */
interface ListFilters {
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Listas de teste da newsletter. As listas vêm numa consulta só (TanStack
 * Query) e a filtragem é feita aqui — a API devolve todas. Cada escrita
 * (criar, editar, apagar, duplicar) invalida a consulta, em vez de mexer no
 * array da tela.
 */
export const useTestEmailLists = () => {
  const [filters, setFilters] = useState<ListFilters | undefined>();
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const query = useAdminQuery(adminKeys.area('test-lists'), async () =>
    (await listTestListsRequest()).map(toList)
  );

  const all = useMemo(() => query.data ?? [], [query.data]);

  const lists = useMemo(() => {
    const search = filters?.search?.toLowerCase();
    let filtered = all.filter(
      (list) =>
        (!search ||
          list.name.toLowerCase().includes(search) ||
          list.emails.some((email) => email.includes(search))) &&
        (filters?.isActive === undefined || list.isActive === filters.isActive)
    );

    if (filters?.sortBy) {
      const key = filters.sortBy as keyof TestEmailList;
      const direction = filters.sortOrder === 'desc' ? -1 : 1;
      filtered = [...filtered].sort((a, b) =>
        String(a[key] ?? '') > String(b[key] ?? '') ? direction : -direction
      );
    }

    return filtered;
  }, [all, filters]);

  const stats = useMemo(
    () => (query.data ? testListStats(query.data) : null),
    [query.data]
  );

  const run = useCallback(
    async <T>(
      action: () => Promise<T>
    ): Promise<{ success: boolean; value?: T; error?: string }> => {
      setBusy(true);
      setActionError(null);

      try {
        const value = await action();
        await query.refetch();
        return { success: true, value };
      } catch (error) {
        const message = queryError(error);
        setActionError(message);
        return { success: false, error: message };
      } finally {
        setBusy(false);
      }
    },
    [query]
  );

  const fetchLists = useCallback(
    async (nextFilters?: ListFilters) => {
      setFilters(nextFilters);
      await query.refetch();
    },
    [query]
  );

  const fetchList = useCallback(
    async (id: string): Promise<TestEmailList | null> =>
      all.find((list) => list.id === id) ?? null,
    [all]
  );

  const createList = useCallback(
    async (data: CreateListData) => {
      const result = await run(async () =>
        toList(
          await createTestListRequest({ emails: [], isActive: true, ...data })
        )
      );

      return {
        success: result.success,
        list: result.value,
        error: result.error,
      };
    },
    [run]
  );

  const updateList = useCallback(
    async (id: string, data: CreateListData) => {
      const result = await run(async () =>
        toList(await updateTestListRequest(id, { ...data }))
      );

      return {
        success: result.success,
        list: result.value,
        error: result.error,
      };
    },
    [run]
  );

  // A API remove uma lista por vez.
  const deleteLists = useCallback(
    async (listIds: string[]) => {
      const result = await run(async () => {
        for (const id of listIds) {
          await deleteTestListRequest(id);
        }
        return listIds.length;
      });

      if (result.success) {
        setSelectedLists((previous) =>
          previous.filter((id) => !listIds.includes(id))
        );
      }

      return {
        success: result.success,
        deletedCount: result.value,
        error: result.error,
      };
    },
    [run]
  );

  // Duplicar, ativar/desativar, limpar e adicionar e-mails: criar ou editar a lista.
  const performAction = useCallback(
    async (
      id: string,
      action: 'duplicate' | 'toggle-status' | 'clear-emails' | 'add-emails',
      payload?: any
    ) => {
      const current = all.find((list) => list.id === id);

      if (!current) {
        const error = 'Lista não encontrada';
        setActionError(error);
        return { success: false, error };
      }

      const result = await run(async () => {
        if (action === 'duplicate') {
          return toList(
            await createTestListRequest({
              name: `${current.name} (Cópia)`,
              description: current.description,
              emails: current.emails,
              color: current.color,
              isActive: current.isActive,
            })
          );
        }

        const changes =
          action === 'toggle-status'
            ? { isActive: !current.isActive }
            : action === 'clear-emails'
              ? { emails: [] }
              : {
                  emails: [
                    ...new Set([...current.emails, ...(payload?.emails ?? [])]),
                  ],
                };

        return toList(await updateTestListRequest(id, changes));
      });

      return {
        success: result.success,
        list: result.value,
        error: result.error,
      };
    },
    [all, run]
  );

  const selectList = useCallback((id: string) => {
    setSelectedLists((previous) =>
      previous.includes(id)
        ? previous.filter((listId) => listId !== id)
        : [...previous, id]
    );
  }, []);

  const selectAllLists = useCallback(
    (select: boolean = true) => {
      setSelectedLists(select ? lists.map((list) => list.id) : []);
    },
    [lists]
  );

  const clearSelection = useCallback(() => {
    setSelectedLists([]);
  }, []);

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

  const reset = useCallback(() => {
    setFilters(undefined);
    setSelectedLists([]);
    setActionError(null);
  }, []);

  return {
    lists,
    stats,
    loading: query.loading || busy,
    error: query.error ?? actionError,
    selectedLists,

    fetchLists,
    fetchList,
    createList,
    updateList,
    deleteLists,
    performAction,

    selectList,
    selectAllLists,
    clearSelection,

    validateEmails,
    reset,
  };
};

/**
 * Envio de modelo para as listas de teste. A rota do legado nunca existiu
 * (`/api/admin/newsletter/send-test`), e a API testa campanha, não modelo:
 * o teste é feito pela campanha ("Enviar teste").
 */
export const useTestEmailSending = () => {
  const [loading] = useState(false);
  const [result, setResult] = useState<SendTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendTestEmails = useCallback(
    async (_data: SendTestEmailData): Promise<SendTestResult | null> => {
      setResult(null);
      setError(
        'O envio de modelo para listas de teste não existe na API. Use "Enviar teste" na campanha.'
      );
      return null;
    },
    []
  );

  const getAvailableTemplates = useCallback(async () => {
    try {
      const templates = await listTemplatesRequest();
      return {
        templates,
        stats: {
          total: templates.length,
          active: templates.filter((template) => template.isActive).length,
        },
      };
    } catch (err) {
      setError(errorMessage(err));
      return null;
    }
  }, []);

  const reset = useCallback(() => {
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
