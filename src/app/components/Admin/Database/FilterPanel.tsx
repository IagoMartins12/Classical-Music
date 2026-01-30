// app/components/Admin/Database/FilterPanel.tsx
'use client';

import { useState } from 'react';
import { FiPlus, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import Modal from '@/app/components/Modal';
import Button from '@/app/components/Common/Button';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import { ModelSchema, ModelField } from '@/app/hooks/admin/useDatabaseStudio';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  availableFields: string[];
  activeFilters: Record<string, any>;
  modelSchema: ModelSchema | null;
  onAddFilter: (field: string, value: any) => void;
  onRemoveFilter: (field: string) => void;
  onClearFilters: () => void;
  onApply: () => void;
}

export default function FilterPanel({
  isOpen,
  onClose,
  availableFields,
  activeFilters,
  modelSchema,
  onAddFilter,
  onRemoveFilter,
  onClearFilters,
  onApply,
}: FilterPanelProps) {
  const [newField, setNewField] = useState('');
  const [newOperator, setNewOperator] = useState('equals');
  const [newValue, setNewValue] = useState('');

  const getFieldInfo = (fieldName: string): ModelField | undefined => {
    return modelSchema?.fields.find((f) => f.name === fieldName);
  };

  const getOperatorsForField = (fieldName: string) => {
    const field = getFieldInfo(fieldName);
    if (!field) return [];

    // Operadores baseados no tipo do campo
    if (field.type === 'String') {
      return [
        { value: 'equals', label: 'Igual a' },
        { value: 'contains', label: 'Contém' },
        { value: 'startsWith', label: 'Começa com' },
        { value: 'endsWith', label: 'Termina com' },
        { value: 'not', label: 'Diferente de' },
      ];
    }

    if (field.type === 'Int' || field.type === 'Float') {
      return [
        { value: 'equals', label: 'Igual a' },
        { value: 'gt', label: 'Maior que' },
        { value: 'gte', label: 'Maior ou igual' },
        { value: 'lt', label: 'Menor que' },
        { value: 'lte', label: 'Menor ou igual' },
        { value: 'not', label: 'Diferente de' },
      ];
    }

    if (field.type === 'Boolean') {
      return [{ value: 'equals', label: 'Igual a' }];
    }

    if (field.type === 'DateTime') {
      return [
        { value: 'equals', label: 'Igual a' },
        { value: 'gt', label: 'Depois de' },
        { value: 'gte', label: 'A partir de' },
        { value: 'lt', label: 'Antes de' },
        { value: 'lte', label: 'Até' },
      ];
    }

    if (field.kind === 'enum') {
      return [
        { value: 'equals', label: 'Igual a' },
        { value: 'not', label: 'Diferente de' },
        { value: 'in', label: 'Em (múltiplos)' },
      ];
    }

    return [{ value: 'equals', label: 'Igual a' }];
  };

  const renderValueInput = (fieldName: string) => {
    const field = getFieldInfo(fieldName);
    if (!field) return null;

    // Boolean
    if (field.type === 'Boolean') {
      return (
        <Select
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          options={[
            { value: 'true', label: 'Sim' },
            { value: 'false', label: 'Não' },
          ]}
        />
      );
    }

    // Enum
    if (field.kind === 'enum' && (field as any).enumValues) {
      const enumValues = (field as any).enumValues as string[];
      return (
        <Select
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          options={enumValues.map((v) => ({ value: v, label: v }))}
        />
      );
    }

    // DateTime
    if (field.type === 'DateTime') {
      return (
        <Input
          type="datetime-local"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
        />
      );
    }

    // Number
    if (field.type === 'Int' || field.type === 'Float') {
      return (
        <Input
          type="number"
          step={field.type === 'Float' ? '0.01' : '1'}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Digite um número..."
        />
      );
    }

    // String padrão
    return (
      <Input
        type="text"
        value={newValue}
        onChange={(e) => setNewValue(e.target.value)}
        placeholder="Digite o valor..."
      />
    );
  };

  const handleAddFilter = () => {
    if (!newField || !newValue) return;

    const field = getFieldInfo(newField);
    if (!field) return;

    // Processar valor baseado no tipo
    let processedValue: any = newValue;

    if (field.type === 'Int') {
      processedValue = parseInt(newValue);
    } else if (field.type === 'Float') {
      processedValue = parseFloat(newValue);
    } else if (field.type === 'Boolean') {
      processedValue = newValue === 'true';
    } else if (field.type === 'DateTime') {
      processedValue = new Date(newValue).toISOString();
    }

    // Construir filtro complexo se operador não for equals
    if (newOperator !== 'equals') {
      processedValue = { [newOperator]: processedValue };
    }

    onAddFilter(newField, processedValue);

    // Resetar form
    setNewField('');
    setNewOperator('equals');
    setNewValue('');
  };

  const handleApply = () => {
    onApply();
    onClose();
  };

  // Filtrar campos disponíveis (remover sensíveis e já filtrados)
  const filterableFields = availableFields.filter((fieldName) => {
    const field = getFieldInfo(fieldName);
    if (!field) return false;
    if ((field as any).isSensitive) return false; // Não filtrar sensíveis
    if (activeFilters[fieldName] !== undefined) return false; // Já tem filtro
    return true;
  });

  const formatFilterValue = (field: string, value: any): string => {
    const fieldInfo = getFieldInfo(field);
    if (!fieldInfo) return String(value);

    if (typeof value === 'object' && !Array.isArray(value)) {
      // Filtro complexo (ex: { gte: 10 })
      const operator = Object.keys(value)[0];
      const val = value[operator];
      const operatorLabel =
        getOperatorsForField(field).find((op) => op.value === operator)
          ?.label || operator;
      return `${operatorLabel} ${val}`;
    }

    if (fieldInfo.type === 'Boolean') {
      return value ? 'Sim' : 'Não';
    }

    if (fieldInfo.type === 'DateTime') {
      return new Date(value).toLocaleString('pt-BR');
    }

    return String(value);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Filtros Avançados"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Filtros ativos */}
        {Object.keys(activeFilters).length > 0 && (
          <div className="classical-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-theme-primary">
                Filtros Ativos ({Object.keys(activeFilters).length})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-accent-red hover:bg-accent-red/10"
              >
                Limpar Todos
              </Button>
            </div>

            <div className="space-y-2">
              {Object.entries(activeFilters).map(([field, value]) => (
                <div
                  key={field}
                  className="flex items-center justify-between p-3 bg-theme-secondary rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-theme-primary text-sm">
                      {field}
                    </div>
                    <div className="text-xs text-theme-tertiary mt-1">
                      {formatFilterValue(field, value)}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveFilter(field)}
                    className="p-2 hover:bg-accent-red/10 text-accent-red rounded transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Adicionar novo filtro */}
        <div className="classical-card p-4">
          <h3 className="font-semibold text-theme-primary mb-4">
            Adicionar Filtro
          </h3>

          {filterableFields.length === 0 ? (
            <div className="text-center py-8 text-theme-tertiary">
              <FiAlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum campo disponível para filtrar</p>
              <p className="text-xs mt-1">
                Todos os campos já possuem filtros ou são sensíveis
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selecionar campo */}
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  Campo
                </label>
                <Select
                  value={newField}
                  onChange={(e) => {
                    setNewField(e.target.value);
                    setNewOperator('equals');
                    setNewValue('');
                  }}
                  options={[
                    { value: '', label: 'Selecione um campo...' },
                    ...filterableFields.map((f) => ({ value: f, label: f })),
                  ]}
                />
              </div>

              {/* Selecionar operador */}
              {newField && (
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Operador
                  </label>
                  <Select
                    value={newOperator}
                    onChange={(e) => setNewOperator(e.target.value)}
                    options={getOperatorsForField(newField)}
                  />
                </div>
              )}

              {/* Valor */}
              {newField && (
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Valor
                  </label>
                  {renderValueInput(newField)}
                </div>
              )}

              {/* Botão adicionar */}
              {newField && newValue && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<FiPlus />}
                  onClick={handleAddFilter}
                  className="w-full"
                >
                  Adicionar Filtro
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end space-x-3">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleApply}>
            Aplicar Filtros
          </Button>
        </div>
      </div>
    </Modal>
  );
}
