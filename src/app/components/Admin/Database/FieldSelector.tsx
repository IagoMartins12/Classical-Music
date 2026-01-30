// app/components/Admin/Database/FieldSelector.tsx
'use client';

import { useState, useMemo } from 'react';
import { FiCheck, FiLock, FiAlertTriangle, FiSearch } from 'react-icons/fi';
import Modal from '@/app/components/Modal';
import Button from '@/app/components/Common/Button';
import Input from '@/app/components/Common/Inputs';
import Checkbox from '@/app/components/Common/Checkbox';
import { ModelSchema, ModelField } from '@/app/hooks/admin/useDatabaseStudio';

interface FieldSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  availableFields: string[];
  selectedFields: string[];
  modelSchema: ModelSchema | null;
  onToggleField: (field: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onApply: () => void;
}

export default function FieldSelector({
  isOpen,
  onClose,
  availableFields,
  selectedFields,
  modelSchema,
  onToggleField,
  onSelectAll,
  onClearSelection,
  onApply,
}: FieldSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSensitive, setShowSensitive] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  // Agrupar campos por tipo
  const fieldsByCategory = useMemo(() => {
    if (!modelSchema) return {};

    const categories: Record<
      string,
      Array<ModelField & { fieldName: string }>
    > = {
      system: [],
      sensitive: [],
      editable: [],
      readonly: [],
      relations: [],
    };

    modelSchema.fields.forEach((field) => {
      const fieldWithName = { ...field, fieldName: field.name };

      // Categorização
      if ((field as any).isSensitive) {
        categories.sensitive.push(fieldWithName);
      } else if (
        field.isId ||
        field.name === 'createdAt' ||
        field.name === 'updatedAt'
      ) {
        categories.system.push(fieldWithName);
      } else if (field.kind === 'object') {
        categories.relations.push(fieldWithName);
      } else if (field.isRequired && !field.hasDefaultValue) {
        categories.editable.push(fieldWithName);
      } else {
        categories.readonly.push(fieldWithName);
      }
    });

    return categories;
  }, [modelSchema]);

  // Filtrar campos
  const filteredFields = useMemo(() => {
    let fields = [...availableFields];

    // Filtro por busca
    if (searchQuery) {
      fields = fields.filter((f) =>
        f.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por tipo
    if (filterType !== 'all') {
      const category = fieldsByCategory[filterType] || [];
      const categoryNames = category.map((f) => f.fieldName);
      fields = fields.filter((f) => categoryNames.includes(f));
    }

    // Ocultar sensíveis se não marcado
    if (!showSensitive && fieldsByCategory.sensitive) {
      const sensitiveNames = fieldsByCategory.sensitive.map((f) => f.fieldName);
      fields = fields.filter((f) => !sensitiveNames.includes(f));
    }

    return fields;
  }, [
    availableFields,
    searchQuery,
    filterType,
    showSensitive,
    fieldsByCategory,
  ]);

  const handleApply = () => {
    onApply();
    onClose();
  };

  const getFieldInfo = (fieldName: string) => {
    return modelSchema?.fields.find((f) => f.name === fieldName);
  };

  const getFieldBadge = (fieldName: string) => {
    const field = getFieldInfo(fieldName);
    if (!field) return null;

    if ((field as any).isSensitive) {
      return (
        <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-xs rounded-full flex items-center space-x-1">
          <FiLock className="w-3 h-3" />
          <span>Sensível</span>
        </span>
      );
    }

    if (field.isRequired && !(field as any).isEditableByConfig) {
      return (
        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-500 text-xs rounded-full flex items-center space-x-1">
          <FiAlertTriangle className="w-3 h-3" />
          <span>Somente leitura</span>
        </span>
      );
    }

    if ((field as any).requiresConfirmation) {
      return (
        <span className="px-2 py-0.5 bg-orange-500/20 text-orange-500 text-xs rounded-full">
          Exige confirmação
        </span>
      );
    }

    if (field.kind === 'object') {
      return (
        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-500 text-xs rounded-full">
          Relação
        </span>
      );
    }

    return null;
  };

  const stats = {
    total: availableFields.length,
    selected: selectedFields.length,
    sensitive: fieldsByCategory.sensitive?.length || 0,
    readonly:
      (fieldsByCategory.readonly?.length || 0) +
      (fieldsByCategory.system?.length || 0),
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Selecionar Campos"
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Header com estatísticas */}
        <div className="grid grid-cols-4 gap-4">
          <div className="classical-card p-4">
            <div className="text-2xl font-bold text-brand-primary">
              {stats.total}
            </div>
            <div className="text-sm text-theme-tertiary">Total</div>
          </div>
          <div className="classical-card p-4">
            <div className="text-2xl font-bold text-green-500">
              {stats.selected}
            </div>
            <div className="text-sm text-theme-tertiary">Selecionados</div>
          </div>
          <div className="classical-card p-4">
            <div className="text-2xl font-bold text-red-500">
              {stats.sensitive}
            </div>
            <div className="text-sm text-theme-tertiary">Sensíveis</div>
          </div>
          <div className="classical-card p-4">
            <div className="text-2xl font-bold text-amber-500">
              {stats.readonly}
            </div>
            <div className="text-sm text-theme-tertiary">Somente leitura</div>
          </div>
        </div>

        {/* Controles */}
        <div className="space-y-4">
          {/* Busca */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
            <Input
              type="text"
              placeholder="Buscar campos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filterType === 'all'
                    ? 'bg-brand-primary text-white'
                    : 'bg-theme-secondary text-theme-tertiary hover:text-theme-primary'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterType('editable')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filterType === 'editable'
                    ? 'bg-brand-primary text-white'
                    : 'bg-theme-secondary text-theme-tertiary hover:text-theme-primary'
                }`}
              >
                Editáveis
              </button>
              <button
                onClick={() => setFilterType('readonly')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filterType === 'readonly'
                    ? 'bg-brand-primary text-white'
                    : 'bg-theme-secondary text-theme-tertiary hover:text-theme-primary'
                }`}
              >
                Somente leitura
              </button>
              <button
                onClick={() => setFilterType('relations')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filterType === 'relations'
                    ? 'bg-brand-primary text-white'
                    : 'bg-theme-secondary text-theme-tertiary hover:text-theme-primary'
                }`}
              >
                Relações
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={showSensitive}
                  onChange={(e) => setShowSensitive(e.target.checked)}
                />
                <span className="text-sm text-theme-secondary">
                  Mostrar sensíveis
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Lista de campos */}
        <div className="classical-card p-4 max-h-96 overflow-y-auto classical-scrollbar">
          <div className="space-y-2">
            {filteredFields.length === 0 ? (
              <div className="text-center py-8 text-theme-tertiary">
                Nenhum campo encontrado
              </div>
            ) : (
              filteredFields.map((field) => {
                const isSelected = selectedFields.includes(field);
                const fieldInfo = getFieldInfo(field);
                const badge = getFieldBadge(field);

                return (
                  <div
                    key={field}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-brand-primary bg-brand-primary/5'
                        : 'border-theme-primary hover:border-brand-primary/50'
                    }`}
                    onClick={() => onToggleField(field)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => {}}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-theme-primary">
                              {field}
                            </span>
                            {badge}
                          </div>
                          {fieldInfo && (
                            <div className="text-xs text-theme-tertiary mt-1">
                              {fieldInfo.type}
                              {fieldInfo.isList && '[]'}
                              {fieldInfo.isRequired && ' • Obrigatório'}
                              {fieldInfo.isUnique && ' • Único'}
                            </div>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <FiCheck className="w-5 h-5 text-brand-primary" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={onSelectAll}>
              Selecionar Todos
            </Button>
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              Limpar Seleção
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleApply}>
              Aplicar ({selectedFields.length} campos)
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
