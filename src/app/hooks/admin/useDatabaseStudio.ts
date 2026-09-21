// app/hooks/admin/useDatabaseStudio.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminKeys, useAdminQuery, useInvalidateAdmin } from './query';
import toast from 'react-hot-toast';
import {
  createDatabaseRecord,
  deleteDatabaseRecords,
  describeDatabaseModel,
  exportDatabaseRecords,
  listDatabaseModels,
  listDatabaseRecords,
  updateDatabaseRecord,
} from '@/app/requests/admin/database';

export interface DatabaseModel {
  name: string;
  displayName: string;
  count: number;
  icon?: string;
  category: 'core' | 'content' | 'social' | 'system' | 'admin';
  totalFields?: number;
}

export interface DatabaseRecord {
  id: string;
  [key: string]: any;
}

export interface ModelSchema {
  name: string;
  fields: ModelField[];
  indexes: string[];
}

export interface ModelField {
  name: string;
  type: string;
  kind: 'scalar' | 'object' | 'enum' | 'unsupported'; // 🔧 ADICIONADO
  isRequired: boolean;
  isUnique: boolean;
  isId: boolean;
  isList: boolean;
  isReadOnly?: boolean; // 🔧 ADICIONADO
  hasDefaultValue?: boolean; // 🔧 ADICIONADO
  defaultValue?: any;
  relationTo?: string;

  // Campos de segurança
  isSensitive?: boolean;
  isEditableByConfig?: boolean;
  requiresConfirmation?: boolean;

  // Campos para enums
  enumValues?: string[];

  // Campos para inputs
  inputType?: string;
  filterOperators?: Array<{ value: string; label: string }>;
}
export interface FieldFilter {
  field: string;
  operator:
    | 'equals'
    | 'contains'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'in'
    | 'notIn';
  value: any;
}

interface UseDatabaseStudioReturn {
  // Estado
  models: DatabaseModel[];
  selectedModel: string | null;
  records: DatabaseRecord[];
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  loadingRecords: boolean;
  searchQuery: string;
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  selectedRecords: Set<string>;
  modelSchema: ModelSchema | null;
  selectedFields: string[];
  availableFields: string[];
  activeFilters: Record<string, any>;
  schemaStats: {
    totalFields: number;
    displayableFields: number;
    editableFields: number;
    searchableFields: number;
  } | null;

  // Ações
  selectModel: (modelName: string) => Promise<void>;
  loadRecords: (page?: number) => Promise<void>;
  createRecord: (data: any) => Promise<void>;
  updateRecord: (id: string, data: any) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  deleteMultipleRecords: (ids: string[]) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSort: (field: string) => void;
  setPageSize: (size: number) => void;
  toggleRecordSelection: (id: string) => void;
  selectAllRecords: () => void;
  clearSelection: () => void;
  refreshModels: () => Promise<void>;
  exportData: (format: 'json' | 'csv') => Promise<void>;

  // Seleção de campos
  toggleFieldSelection: (field: string) => void;
  selectAllFields: () => void;
  clearFieldSelection: () => void;
  setSelectedFields: (fields: string[]) => void;

  // Filtros
  addFilter: (field: string, value: any) => void;
  removeFilter: (field: string) => void;
  clearFilters: () => void;
  updateFilter: (field: string, value: any) => void;

  // Utilidades
  getFieldValue: (record: any, field: string) => any;
  formatFieldValue: (value: any, field: ModelField) => string;
}

/**
 * Estúdio de banco. Os models, o schema do model escolhido e a página de
 * registros são estado de servidor (TanStack Query): a chave dos registros
 * leva model, página, busca, ordenação, campos e filtros, então voltar a uma
 * combinação já vista mostra o cache enquanto revalida. Cada escrita invalida
 * a página.
 */
export const useDatabaseStudio = (): UseDatabaseStudioReturn => {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  // A busca só vai ao servidor meio segundo depois da última tecla.
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(
    new Set()
  );
  const [selectedFields, setSelectedFieldsState] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const invalidate = useInvalidateAdmin();

  const modelsQuery = useAdminQuery(
    adminKeys.area('db-models'),
    listDatabaseModels
  );

  // Campos do model (o que a tela mostra e o que aceita escrita)
  const schemaQuery = useAdminQuery(
    adminKeys.list('db-schema', selectedModel),
    () => describeDatabaseModel(selectedModel as string),
    { enabled: !!selectedModel }
  );

  const recordsQuery = useAdminQuery(
    adminKeys.list('db-records', {
      model: selectedModel,
      page: currentPage,
      pageSize,
      search: debouncedSearch,
      sortField,
      sortDirection,
      selectedFields,
      activeFilters,
    }),
    () =>
      listDatabaseRecords(
        {
          model: selectedModel as string,
          search: debouncedSearch,
          sortField,
          sortDirection,
          fields: selectedFields,
          filters: activeFilters,
        },
        currentPage,
        pageSize
      ),
    { enabled: !!selectedModel }
  );

  const models = useMemo(() => modelsQuery.data ?? [], [modelsQuery.data]);
  const modelSchema = schemaQuery.data?.schema ?? null;
  const availableFields = useMemo(
    () => schemaQuery.data?.availableFields ?? [],
    [schemaQuery.data]
  );
  const schemaStats = schemaQuery.data?.stats ?? null;
  const records = (recordsQuery.data?.records ?? []) as DatabaseRecord[];
  const totalRecords = recordsQuery.data?.total ?? 0;
  const loading = modelsQuery.loading;
  const loadingRecords = recordsQuery.loading || recordsQuery.fetching;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Selecionar um model
  const selectModel = useCallback(async (modelName: string) => {
    setSelectedModel(modelName);
    setCurrentPage(1);
    setSearchQuery('');
    setDebouncedSearch('');
    setSortField(null);
    setSelectedRecords(new Set());
    setActiveFilters({});
    setSelectedFieldsState([]);
  }, []);

  const loadRecords = useCallback(
    async (page?: number) => {
      if (!selectedModel) return;

      if (page && page !== currentPage) {
        setCurrentPage(page);
        return;
      }

      await recordsQuery.refetch();
    },
    [selectedModel, currentPage, recordsQuery]
  );

  const afterWrite = useCallback(async () => {
    await invalidate('db-records');
  }, [invalidate]);

  // Criar registro
  const createRecord = useCallback(
    async (data: any) => {
      if (!selectedModel) return;

      const toastId = toast.loading('Criando registro...');

      try {
        await createDatabaseRecord(selectedModel, data, modelSchema);
        toast.success('Registro criado com sucesso!', { id: toastId });
        setCurrentPage(1);
        await afterWrite();
      } catch (error) {
        console.error('Erro ao criar registro:', error);
        toast.error(
          error instanceof Error ? error.message : 'Erro ao criar registro',
          { id: toastId }
        );
      }
    },
    [selectedModel, modelSchema, afterWrite]
  );

  // Atualizar registro
  const updateRecord = useCallback(
    async (id: string, data: any) => {
      if (!selectedModel) return;

      const toastId = toast.loading('Atualizando registro...');

      try {
        await updateDatabaseRecord(selectedModel, id, data, modelSchema);
        toast.success('Registro atualizado com sucesso!', { id: toastId });
        await afterWrite();
      } catch (error) {
        console.error('Erro ao atualizar registro:', error);
        toast.error(
          error instanceof Error ? error.message : 'Erro ao atualizar registro',
          { id: toastId }
        );
      }
    },
    [selectedModel, modelSchema, afterWrite]
  );

  // Deletar registro
  const deleteRecord = useCallback(
    async (id: string) => {
      if (!selectedModel) return;

      const confirmed = window.confirm(
        'Tem certeza que deseja deletar este registro? Esta ação não pode ser desfeita.'
      );
      if (!confirmed) return;

      const toastId = toast.loading('Deletando registro...');

      try {
        await deleteDatabaseRecords(selectedModel, [id]);
        toast.success('Registro deletado com sucesso!', { id: toastId });
        setSelectedRecords((previous) => {
          const next = new Set(previous);
          next.delete(id);
          return next;
        });
        await afterWrite();
      } catch (error) {
        console.error('Erro ao deletar registro:', error);
        toast.error(
          error instanceof Error ? error.message : 'Erro ao deletar registro',
          { id: toastId }
        );
      }
    },
    [selectedModel, afterWrite]
  );

  // Deletar múltiplos registros
  const deleteMultipleRecords = useCallback(
    async (ids: string[]) => {
      if (!selectedModel || ids.length === 0) return;

      const confirmed = window.confirm(
        `Tem certeza que deseja deletar ${ids.length} registro(s)? Esta ação não pode ser desfeita.`
      );
      if (!confirmed) return;

      const toastId = toast.loading(`Deletando ${ids.length} registro(s)...`);

      try {
        const result = await deleteDatabaseRecords(selectedModel, ids);
        toast.success(
          `${result.deletedCount} registro(s) deletado(s) com sucesso!`,
          { id: toastId }
        );
        setSelectedRecords(new Set());
        await afterWrite();
      } catch (error) {
        console.error('Erro ao deletar registros:', error);
        toast.error(
          error instanceof Error ? error.message : 'Erro ao deletar registros',
          { id: toastId }
        );
      }
    },
    [selectedModel, afterWrite]
  );

  // Exportar dados
  const exportData = useCallback(
    async (format: 'json' | 'csv') => {
      if (!selectedModel) return;

      const toastId = toast.loading('Exportando dados...');

      try {
        await exportDatabaseRecords(
          {
            model: selectedModel,
            search: searchQuery,
            sortField,
            sortDirection,
            fields: selectedFields,
            filters: activeFilters,
          },
          format
        );
        toast.success('Dados exportados com sucesso!', { id: toastId });
      } catch (error) {
        console.error('Erro ao exportar:', error);
        toast.error(
          error instanceof Error ? error.message : 'Erro ao exportar dados',
          { id: toastId }
        );
      }
    },
    [
      selectedModel,
      searchQuery,
      sortField,
      sortDirection,
      selectedFields,
      activeFilters,
    ]
  );

  // Alternar ordenação
  const setSort = useCallback(
    (field: string) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
      setCurrentPage(1);
    },
    [sortField]
  );

  // Seleção de registros
  const toggleRecordSelection = useCallback((id: string) => {
    setSelectedRecords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAllRecords = useCallback(() => {
    setSelectedRecords(new Set(records.map((r) => r.id)));
  }, [records]);

  const clearSelection = useCallback(() => {
    setSelectedRecords(new Set());
  }, []);

  const refreshModels = modelsQuery.refetch;

  // Seleção de campos
  const toggleFieldSelection = useCallback((field: string) => {
    setSelectedFieldsState((prev) => {
      if (prev.includes(field)) {
        return prev.filter((f) => f !== field);
      } else {
        return [...prev, field];
      }
    });
  }, []);

  const selectAllFields = useCallback(() => {
    setSelectedFieldsState(availableFields);
  }, [availableFields]);

  const clearFieldSelection = useCallback(() => {
    setSelectedFieldsState([]);
  }, []);

  const setSelectedFields = useCallback((fields: string[]) => {
    setSelectedFieldsState(fields);
  }, []);

  // Filtros
  const addFilter = useCallback((field: string, value: any) => {
    setActiveFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCurrentPage(1);
  }, []);

  const removeFilter = useCallback((field: string) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[field];
      return newFilters;
    });
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters({});
    setCurrentPage(1);
  }, []);

  const updateFilter = useCallback(
    (field: string, value: any) => {
      if (value === null || value === undefined || value === '') {
        removeFilter(field);
      } else {
        addFilter(field, value);
      }
    },
    [addFilter, removeFilter]
  );

  // Utilidades
  const getFieldValue = useCallback((record: any, field: string) => {
    return record[field];
  }, []);

  const formatFieldValue = useCallback(
    (value: any, field: ModelField): string => {
      if (value === null || value === undefined) {
        return '-';
      }

      if (field.type === 'DateTime' && value) {
        return new Date(value).toLocaleString('pt-BR');
      }

      if (field.type === 'Boolean') {
        return value ? 'Sim' : 'Não';
      }

      if (Array.isArray(value)) {
        return `[${value.length} itens]`;
      }

      if (typeof value === 'object') {
        return '[Object]';
      }

      return String(value);
    },
    []
  );

  // Limpar ordenação se o campo não existir no model atual
  useEffect(() => {
    if (selectedModel && sortField) {
      const fieldExists = modelSchema?.fields.some((f) => f.name === sortField);
      if (!fieldExists) {
        setSortField(null);
        setSortDirection('asc');
      }
    }
  }, [selectedModel, sortField, modelSchema]);

  return {
    models,
    selectedModel,
    records,
    totalRecords,
    currentPage,
    pageSize,
    loading,
    loadingRecords,
    searchQuery,
    sortField,
    sortDirection,
    selectedRecords,
    modelSchema,
    selectedFields,
    availableFields,
    activeFilters,
    schemaStats,
    selectModel,
    loadRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    deleteMultipleRecords,
    setSearchQuery,
    setSort,
    setPageSize,
    toggleRecordSelection,
    selectAllRecords,
    clearSelection,
    refreshModels,
    exportData,
    toggleFieldSelection,
    selectAllFields,
    clearFieldSelection,
    setSelectedFields,
    addFilter,
    removeFilter,
    clearFilters,
    updateFilter,
    getFieldValue,
    formatFieldValue,
  };
};
