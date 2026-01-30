// app/hooks/admin/useDatabaseStudio.ts
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

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

export const useDatabaseStudio = (): UseDatabaseStudioReturn => {
  const [models, setModels] = useState<DatabaseModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [records, setRecords] = useState<DatabaseRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [loading, setLoading] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(
    new Set()
  );
  const [modelSchema, setModelSchema] = useState<ModelSchema | null>(null);
  const [selectedFields, setSelectedFieldsState] = useState<string[]>([]);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [schemaStats, setSchemaStats] = useState<{
    totalFields: number;
    displayableFields: number;
    editableFields: number;
    searchableFields: number;
  } | null>(null);

  // Carregar lista de models
  const fetchModels = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/database/models');
      const data = await response.json();

      if (data.success) {
        setModels(data.models);
      } else {
        toast.error(data.error || 'Erro ao carregar models');
      }
    } catch (error) {
      console.error('Erro ao buscar models:', error);
      toast.error('Erro ao carregar models');
    } finally {
      setLoading(false);
    }
  }, []);

  // Selecionar um model
  const selectModel = useCallback(async (modelName: string) => {
    setSelectedModel(modelName);
    setCurrentPage(1);
    setSearchQuery('');
    setSortField(null);
    setSelectedRecords(new Set());
    setActiveFilters({});
    setSelectedFieldsState([]);

    // Buscar schema do model
    try {
      const response = await fetch(
        `/api/admin/database/schema?model=${modelName}`
      );
      const data = await response.json();

      if (data.success) {
        setModelSchema(data.schema);

        // Extrair campos disponíveis de displayableFields
        const fields = data.displayableFields.map((f: any) => f.name);
        setAvailableFields(fields);

        // Salvar estatísticas
        setSchemaStats({
          totalFields: data.totalFields || 0,
          displayableFields: data.totalDisplayableFields || 0,
          editableFields: data.totalEditableFields || 0,
          searchableFields: data.searchableFields?.length || 0,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar schema:', error);
      setSchemaStats(null);
    }
  }, []);

  // Carregar registros
  const loadRecords = useCallback(
    async (page?: number) => {
      if (!selectedModel) return;

      const targetPage = page || currentPage;
      setLoadingRecords(true);

      try {
        const params = new URLSearchParams({
          model: selectedModel,
          page: targetPage.toString(),
          pageSize: pageSize.toString(),
          ...(searchQuery && { search: searchQuery }),
          ...(sortField && { sortField, sortDirection }),
          ...(selectedFields.length > 0 && {
            fields: selectedFields.join(','),
          }),
          ...(Object.keys(activeFilters).length > 0 && {
            filters: JSON.stringify(activeFilters),
          }),
        });

        const response = await fetch(`/api/admin/database/records?${params}`);
        const data = await response.json();

        if (data.success) {
          setRecords(data.records);
          setTotalRecords(data.total);
          setCurrentPage(targetPage);
        } else {
          toast.error(data.error || 'Erro ao carregar registros');
        }
      } catch (error) {
        console.error('Erro ao buscar registros:', error);
        toast.error('Erro ao carregar registros');
      } finally {
        setLoadingRecords(false);
      }
    },
    [
      selectedModel,
      currentPage,
      pageSize,
      searchQuery,
      sortField,
      sortDirection,
      selectedFields,
      activeFilters,
    ]
  );

  // Criar registro
  const createRecord = useCallback(
    async (data: any) => {
      if (!selectedModel) return;

      const toastId = toast.loading('Criando registro...');

      try {
        const response = await fetch('/api/admin/database/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: selectedModel, data }),
        });

        const result = await response.json();

        if (result.success) {
          toast.success('Registro criado com sucesso!', { id: toastId });
          await loadRecords(1);
        } else {
          toast.error(result.error || 'Erro ao criar registro', {
            id: toastId,
          });
        }
      } catch (error) {
        console.error('Erro ao criar registro:', error);
        toast.error('Erro ao criar registro', { id: toastId });
      }
    },
    [selectedModel, loadRecords]
  );

  // Atualizar registro
  const updateRecord = useCallback(
    async (id: string, data: any) => {
      if (!selectedModel) return;

      const toastId = toast.loading('Atualizando registro...');

      try {
        const response = await fetch('/api/admin/database/records', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: selectedModel, id, data }),
        });

        const result = await response.json();

        if (result.success) {
          toast.success('Registro atualizado com sucesso!', { id: toastId });
          await loadRecords();
        } else {
          toast.error(result.error || 'Erro ao atualizar registro', {
            id: toastId,
          });
        }
      } catch (error) {
        console.error('Erro ao atualizar registro:', error);
        toast.error('Erro ao atualizar registro', { id: toastId });
      }
    },
    [selectedModel, loadRecords]
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
        const response = await fetch('/api/admin/database/records', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: selectedModel, ids: [id] }),
        });

        const result = await response.json();

        if (result.success) {
          toast.success('Registro deletado com sucesso!', { id: toastId });
          setSelectedRecords((prev) => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
          await loadRecords();
        } else {
          toast.error(result.error || 'Erro ao deletar registro', {
            id: toastId,
          });
        }
      } catch (error) {
        console.error('Erro ao deletar registro:', error);
        toast.error('Erro ao deletar registro', { id: toastId });
      }
    },
    [selectedModel, loadRecords]
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
        const response = await fetch('/api/admin/database/records', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: selectedModel, ids }),
        });

        const result = await response.json();

        if (result.success) {
          toast.success(`${ids.length} registro(s) deletado(s) com sucesso!`, {
            id: toastId,
          });
          setSelectedRecords(new Set());
          await loadRecords();
        } else {
          toast.error(result.error || 'Erro ao deletar registros', {
            id: toastId,
          });
        }
      } catch (error) {
        console.error('Erro ao deletar registros:', error);
        toast.error('Erro ao deletar registros', { id: toastId });
      }
    },
    [selectedModel, loadRecords]
  );

  // Exportar dados
  const exportData = useCallback(
    async (format: 'json' | 'csv') => {
      if (!selectedModel) return;

      const toastId = toast.loading('Exportando dados...');

      try {
        const params = new URLSearchParams({
          model: selectedModel,
          format,
          ...(searchQuery && { search: searchQuery }),
          ...(sortField && { sortField, sortDirection }),
          ...(selectedFields.length > 0 && {
            fields: selectedFields.join(','),
          }),
          ...(Object.keys(activeFilters).length > 0 && {
            filters: JSON.stringify(activeFilters),
          }),
        });

        const response = await fetch(`/api/admin/database/export?${params}`);

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${selectedModel}_${new Date().toISOString()}.${format}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          toast.success('Dados exportados com sucesso!', { id: toastId });
        } else {
          toast.error('Erro ao exportar dados', { id: toastId });
        }
      } catch (error) {
        console.error('Erro ao exportar:', error);
        toast.error('Erro ao exportar dados', { id: toastId });
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

  const refreshModels = useCallback(async () => {
    await fetchModels();
  }, [fetchModels]);

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

  // Carregar models no mount
  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  // Recarregar registros quando necessário
  useEffect(() => {
    if (selectedModel) {
      loadRecords();
    }
  }, [
    selectedModel,
    pageSize,
    sortField,
    sortDirection,
    selectedFields,
    activeFilters,
  ]);

  // Debounce da busca
  useEffect(() => {
    if (!selectedModel) return;

    const timer = setTimeout(() => {
      loadRecords(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
