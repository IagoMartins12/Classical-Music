// app/components/Admin/Database/FieldSelector.tsx
'use client';

import { useState, useMemo } from 'react';
import { PiLock } from 'react-icons/pi';
import { Sheet } from '@/app/components/ui/Sheet';
import { Segmentos } from '@/app/components/Admin/painel/Controles';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { ModelSchema, ModelField } from '@/app/hooks/admin/useDatabaseStudio';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Badge } from '@/app/components/ui/Badge';
import { Icon } from '@/app/components/ui/Icon';

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
  const [filterType, setFilterType] = useState<
    'all' | 'editable' | 'readonly' | 'relations'
  >('all');

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
        <Badge>
          <Icon de={PiLock} tamanho="pp" /> Sensível
        </Badge>
      );
    }

    if (field.isRequired && !(field as any).isEditableByConfig) {
      return <Badge>Somente leitura</Badge>;
    }

    if ((field as any).requiresConfirmation) {
      return <Badge>Exige confirmação</Badge>;
    }

    if (field.kind === 'object') {
      return <Badge>Relação</Badge>;
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
    <Sheet
      aberto={isOpen}
      aoFechar={onClose}
      titulo="Campos da tabela"
      descricao="Quais colunas aparecem. O documento inteiro abre no editor."
      largura="g"
      rodape={
        <>
          <Button variante="fantasma" tamanho="p" onClick={onClose}>
            Cancelar
          </Button>
          <Button variante="primario" tamanho="p" onClick={handleApply}>
            Mostrar {selectedFields.length} campos
          </Button>
        </>
      }
    >
      <Stack gap={6}>
        <Text papel="rotulo" tom="suave" as="p" className="t-dado">
          {stats.selected} de {stats.total} campos selecionados ·{' '}
          {stats.sensitive} sensíveis · {stats.readonly} somente leitura
        </Text>

        <Stack gap={3}>
          <Field
            label="Buscar campo"
            rotuloOculto
            type="search"
            placeholder="Buscar campo"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmentos
              rotulo="Quais campos"
              valor={filterType}
              aoMudar={setFilterType}
              opcoes={[
                { valor: 'all', rotulo: 'Todos' },
                { valor: 'editable', rotulo: 'Editáveis' },
                { valor: 'readonly', rotulo: 'Somente leitura' },
                { valor: 'relations', rotulo: 'Relações' },
              ]}
            />
            <label className="flex min-h-11 cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={showSensitive}
                onChange={(e) => setShowSensitive(e.target.checked)}
                className="h-4 w-4 accent-[var(--ouro)]"
              />
              <Text papel="rotulo" tom="suave">
                Mostrar sensíveis
              </Text>
            </label>
          </div>
        </Stack>

        {filteredFields.length === 0 ? (
          <Text papel="rotulo" tom="suave" as="p" className="py-6 text-center">
            Nenhum campo com esse nome.
          </Text>
        ) : (
          <ul className="sup-2 max-h-96 overflow-y-auto rolagem-discreta !p-0">
            {filteredFields.map((field) => {
              const fieldInfo = getFieldInfo(field);
              return (
                <li
                  key={field}
                  className="border-t border-linha first:border-0"
                >
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[var(--interactive-hover)]">
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field)}
                      onChange={() => onToggleField(field)}
                      className="h-4 w-4 shrink-0 accent-[var(--ouro)]"
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="t-dado text-sm text-texto">
                          {field}
                        </span>
                        {getFieldBadge(field)}
                      </span>
                      {fieldInfo && (
                        <span className="t-legenda">
                          {fieldInfo.type}
                          {fieldInfo.isList && '[]'}
                          {fieldInfo.isRequired && ' · obrigatório'}
                          {fieldInfo.isUnique && ' · único'}
                        </span>
                      )}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}

        <Inline gap={2}>
          <Button variante="texto" tamanho="p" onClick={onSelectAll}>
            Marcar todos
          </Button>
          <Button variante="texto" tamanho="p" onClick={onClearSelection}>
            Desmarcar todos
          </Button>
        </Inline>
      </Stack>
    </Sheet>
  );
}
