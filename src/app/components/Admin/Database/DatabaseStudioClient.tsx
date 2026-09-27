// app/components/Admin/Database/DatabaseStudioClient.tsx
'use client';

import { useState } from 'react';
import {
  PiArrowsClockwise,
  PiCaretLeft,
  PiCaretRight,
  PiColumns,
  PiDatabase,
  PiDownloadSimple,
  PiEye,
  PiFunnel,
  PiListBullets,
  PiLock,
  PiMagnifyingGlass,
  PiPencilSimple,
  PiPlus,
  PiSquaresFour,
  PiStack,
  PiTrash,
  PiX,
} from 'react-icons/pi';
import {
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import Checkbox from '@/app/components/Common/Checkbox';
import LoadingAdminState from '../Common/LoadingState';
import RecordEditorModal from './RecordEditorModal';
import FieldSelector from './FieldSelector';
import FilterPanel from './FilterPanel';
import ConfirmationModal from './ConfirmationModal';
import { useDatabaseStudio } from '@/app/hooks/admin/useDatabaseStudio';
import { CONFIRMATION_MESSAGES } from './confirmations';
import { deleteConfirmationPhrase } from '@/app/requests/admin/database';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';

export default function DatabaseStudioClient() {
  const {
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
    formatFieldValue,
    toggleFieldSelection,
    selectAllFields,
    clearFieldSelection,
    addFilter,
    removeFilter,
    clearFilters,
  } = useDatabaseStudio();

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showEditor, setShowEditor] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [showFieldSelector, setShowFieldSelector] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Estados para confirmação
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'single' | 'multiple';
    ids: string[];
  } | null>(null);

  // Agrupar models por categoria
  const modelsByCategory = models.reduce(
    (acc, model) => {
      if (!acc[model.category]) {
        acc[model.category] = [];
      }
      acc[model.category].push(model);
      return acc;
    },
    {} as Record<string, typeof models>
  );

  const categoryLabels: Record<string, string> = {
    core: 'Núcleo',
    content: 'Conteúdo',
    social: 'Social',
    admin: 'Administração',
    system: 'Sistema',
  };

  const categoryColors: Record<string, string> = {
    core: 'from-blue-500 to-blue-600',
    content: 'from-purple-500 to-purple-600',
    social: 'from-pink-500 to-pink-600',
    admin: 'from-amber-500 to-amber-600',
    system: 'from-gray-500 to-gray-600',
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setShowEditor(true);
  };

  const handleCreate = () => {
    setEditingRecord(null);
    setShowEditor(true);
  };

  const handleSave = async (data: any) => {
    if (editingRecord) {
      await updateRecord(editingRecord.id, data);
    } else {
      await createRecord(data);
    }
    setShowEditor(false);
    setEditingRecord(null);
  };

  // DELETE com confirmação
  const handleDeleteClick = (id: string) => {
    setDeleteTarget({ type: 'single', ids: [id] });
    setShowDeleteConfirmation(true);
  };

  const handleDeleteMultipleClick = () => {
    setDeleteTarget({
      type: 'multiple',
      ids: Array.from(selectedRecords),
    });
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'single') {
      await deleteRecord(deleteTarget.ids[0]);
    } else {
      await deleteMultipleRecords(deleteTarget.ids);
    }

    setShowDeleteConfirmation(false);
    setDeleteTarget(null);
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  // Campos visíveis
  const visibleFields =
    selectedFields.length > 0 ? selectedFields : availableFields.slice(0, 100); // Primeiros 6 se nenhum selecionado

  const activeFilterCount = Object.keys(activeFilters).length;

  // Verificar se campo é sensível
  const isFieldSensitive = (fieldName: string): boolean => {
    const field = modelSchema?.fields.find((f) => f.name === fieldName);
    return (field as any)?.isSensitive || false;
  };

  if (loading && models.length === 0) {
    return (
      <PageContainer showBackground={true}>
        <LoadingAdminState loadingName="Database Studio" />
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true}>
      <div className="flex h-[calc(100vh-100px)] gap-4">
        {/* Sidebar com lista de models */}
        <AnimatedItem direction="left">
          <div className="w-80 flex-shrink-0">
            <AnimatedCard
              className="classical-card h-full p-4 overflow-y-auto"
              hover="none"
            >
              {/* Header da Sidebar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <Inline gap={2}>
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center shadow-theme-glow">
                      <PiDatabase className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-theme-primary">
                        Database Studio
                      </h2>
                      <Text papel="legenda" tom="fraco" as="p">
                        {models.length} tabelas
                      </Text>
                    </div>
                  </Inline>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={
                      <PiArrowsClockwise
                        className={loading ? 'animate-spin' : ''}
                      />
                    }
                    onClick={refreshModels}
                    disabled={loading}
                  />
                </div>

                {/* Busca de models */}
                <div className="relative">
                  <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                  <Input
                    type="text"
                    placeholder="Buscar tabela..."
                    className="pl-10 text-sm"
                  />
                </div>
              </div>

              {/* Lista de models por categoria */}
              <Stack>
                {Object.entries(modelsByCategory).map(
                  ([category, categoryModels]) => (
                    <Stack gap={2} key={category}>
                      <Inline gap={2}>
                        <div
                          className={`w-2 h-2 rounded-full bg-gradient-to-r ${categoryColors[category]}`}
                        />
                        <h3 className="text-xs font-bold text-theme-tertiary uppercase tracking-wider">
                          {categoryLabels[category]}
                        </h3>
                        <div className="flex-1 h-px bg-theme-primary" />
                      </Inline>

                      <div className="space-y-1">
                        {categoryModels.map((model) => (
                          <button
                            key={model.name}
                            onClick={() => selectModel(model.name)}
                            className={`w-full flex items-center justify-between p-2 rounded-lg transition-all group ${
                              selectedModel === model.name
                                ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg'
                                : 'hover:bg-theme-secondary text-theme-primary'
                            }`}
                          >
                            <Inline gap={2} className="flex-1 min-w-0">
                              <PiStack className="w-4 h-4 flex-shrink-0" />
                              <span className="text-sm font-medium truncate">
                                {model.displayName}
                              </span>
                            </Inline>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                selectedModel === model.name
                                  ? 'bg-white/20 text-white'
                                  : 'bg-theme-secondary text-theme-tertiary'
                              }`}
                            >
                              {model.count}
                            </span>
                          </button>
                        ))}
                      </div>
                    </Stack>
                  )
                )}
              </Stack>
            </AnimatedCard>
          </div>
        </AnimatedItem>

        {/* Área principal de conteúdo */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedModel ? (
            <>
              {/* Toolbar */}
              <AnimatedItem direction="down" springType="gentle">
                <AnimatedCard className="classical-card p-4 mb-4" hover="none">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <Inline gap={4} className="flex-1 min-w-0">
                      {/* Busca */}
                      <div className="relative flex-1 max-w-md">
                        <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                        <Input
                          type="text"
                          placeholder="Buscar registros..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      {/* Seleção múltipla */}
                      {selectedRecords.size > 0 && (
                        <Inline
                          gap={2}
                          className="px-3 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-lg"
                        >
                          <Text
                            papel="rotulo"
                            tom="ouro"
                            className="font-medium"
                          >
                            {selectedRecords.size} selecionado(s)
                          </Text>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<PiTrash />}
                            onClick={handleDeleteMultipleClick}
                            className="text-accent-red hover:bg-accent-red/10"
                          >
                            Deletar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<PiX />}
                            onClick={clearSelection}
                          >
                            Limpar
                          </Button>
                        </Inline>
                      )}
                    </Inline>

                    {/* Ações */}
                    <Inline gap={2}>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<PiColumns />}
                        onClick={() => setShowFieldSelector(true)}
                        className={
                          selectedFields.length > 0
                            ? 'bg-brand-primary/10 text-brand-primary'
                            : ''
                        }
                      >
                        Campos
                        {selectedFields.length > 0 && (
                          <span className="ml-1 px-1.5 py-0.5 bg-brand-primary text-white rounded text-xs">
                            {selectedFields.length}
                          </span>
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<PiFunnel />}
                        onClick={() => setShowFilterPanel(true)}
                        className={
                          activeFilterCount > 0
                            ? 'bg-brand-primary/10 text-brand-primary'
                            : ''
                        }
                      >
                        Filtros
                        {activeFilterCount > 0 && (
                          <span className="ml-1 px-1.5 py-0.5 bg-brand-primary text-white rounded text-xs">
                            {activeFilterCount}
                          </span>
                        )}
                      </Button>

                      <Inline
                        gap={1}
                        className="bg-theme-secondary p-1 rounded-lg"
                      >
                        <button
                          onClick={() => setViewMode('table')}
                          className={`p-2 rounded transition-colors ${
                            viewMode === 'table'
                              ? 'bg-theme-tertiary text-white'
                              : 'text-theme-tertiary hover:text-theme-primary'
                          }`}
                        >
                          <PiListBullets className="w-4 h-4" />
                          <NomeAcao acao="verEmLista" />
                        </button>
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded transition-colors ${
                            viewMode === 'grid'
                              ? 'bg-theme-tertiary text-white'
                              : 'text-theme-tertiary hover:text-theme-primary'
                          }`}
                        >
                          <PiSquaresFour className="w-4 h-4" />
                          <NomeAcao acao="verEmGrade" />
                        </button>
                      </Inline>

                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<PiDownloadSimple />}
                        onClick={() => exportData('json')}
                      >
                        Exportar
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<PiPlus />}
                        onClick={handleCreate}
                      >
                        Novo
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={
                          <PiArrowsClockwise
                            className={loadingRecords ? 'animate-spin' : ''}
                          />
                        }
                        onClick={() => loadRecords()}
                        disabled={loadingRecords}
                      />
                    </Inline>
                  </div>

                  {/* Filtros ativos */}
                  {activeFilterCount > 0 && (
                    <div className="flex items-center flex-wrap gap-2 pt-3 border-t border-theme-primary">
                      <Text papel="rotulo" tom="fraco" className="font-medium">
                        Filtros ativos:
                      </Text>
                      {Object.entries(activeFilters).map(([field, value]) => (
                        <Inline
                          gap={2}
                          key={field}
                          className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-sm"
                        >
                          <span className="font-medium">{field}:</span>
                          <span>
                            {typeof value === 'object'
                              ? JSON.stringify(value)
                              : String(value)}
                          </span>
                          <button
                            onClick={() => removeFilter(field)}
                            className="hover:text-accent-red transition-colors"
                          >
                            <PiX className="w-3 h-3" />
                            <NomeAcao acao="fechar" />
                          </button>
                        </Inline>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-accent-red hover:bg-accent-red/10"
                      >
                        Limpar todos
                      </Button>
                    </div>
                  )}
                </AnimatedCard>
              </AnimatedItem>

              {/* Card de Estatísticas do Schema */}
              {schemaStats && (
                <AnimatedItem direction="down" springType="gentle">
                  <AnimatedCard
                    className="classical-card p-4 mb-4"
                    hover="none"
                  >
                    <div className="flex items-center justify-between">
                      <Inline gap={6}>
                        <Inline gap={2}>
                          <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                            <PiDatabase className="w-4 h-4 text-brand-primary" />
                          </div>
                          <div>
                            <Text papel="legenda" tom="fraco" as="p">
                              Total de Campos
                            </Text>
                            <p className="text-lg font-bold text-theme-primary">
                              {schemaStats.totalFields}
                            </p>
                          </div>
                        </Inline>

                        <div className="h-8 w-px bg-theme-primary" />

                        <Inline gap={2}>
                          <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                            <PiEye className="w-4 h-4 text-green-500" />
                          </div>
                          <div>
                            <Text papel="legenda" tom="fraco" as="p">
                              Exibíveis
                            </Text>
                            <p className="text-lg font-bold text-theme-primary">
                              {schemaStats.displayableFields}
                            </p>
                          </div>
                        </Inline>

                        <div className="h-8 w-px bg-theme-primary" />

                        <Inline gap={2}>
                          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <PiPencilSimple className="w-4 h-4 text-blue-500" />
                          </div>
                          <div>
                            <Text papel="legenda" tom="fraco" as="p">
                              Editáveis
                            </Text>
                            <p className="text-lg font-bold text-theme-primary">
                              {schemaStats.editableFields}
                            </p>
                          </div>
                        </Inline>

                        <div className="h-8 w-px bg-theme-primary" />

                        <Inline gap={2}>
                          <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                            <PiMagnifyingGlass className="w-4 h-4 text-purple-500" />
                          </div>
                          <div>
                            <Text papel="legenda" tom="fraco" as="p">
                              Pesquisáveis
                            </Text>
                            <p className="text-lg font-bold text-theme-primary">
                              {schemaStats.searchableFields}
                            </p>
                          </div>
                        </Inline>
                      </Inline>

                      <Inline
                        gap={2}
                        className="px-4 py-2 bg-brand-primary/10 rounded-lg"
                      >
                        <Text papel="rotulo" tom="ouro" className="font-medium">
                          {selectedFields.length === 0
                            ? `Exibindo ${Math.min(100, schemaStats.displayableFields)} campos`
                            : `${selectedFields.length} campos selecionados`}
                        </Text>
                      </Inline>
                    </div>
                  </AnimatedCard>
                </AnimatedItem>
              )}

              {/* Área de dados */}
              <AnimatedItem
                direction="up"
                springType="gentle"
                className="flex-1 min-h-0"
              >
                <AnimatedCard
                  className="classical-card h-full flex flex-col"
                  hover="none"
                >
                  {loadingRecords ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <PiArrowsClockwise className="w-12 h-12 text-brand-primary animate-spin mx-auto mb-4" />
                        <p className="text-theme-secondary">
                          Carregando registros...
                        </p>
                      </div>
                    </div>
                  ) : records.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center py-12">
                        <PiDatabase className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-theme-primary mb-2">
                          Nenhum registro encontrado
                        </h3>
                        <p className="text-theme-secondary mb-6">
                          {searchQuery || activeFilterCount > 0
                            ? 'Nenhum resultado para sua busca/filtros'
                            : 'Esta tabela ainda não possui registros'}
                        </p>
                        {!searchQuery && activeFilterCount === 0 && (
                          <Button
                            variant="primary"
                            leftIcon={<PiPlus />}
                            onClick={handleCreate}
                          >
                            Criar Primeiro Registro
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Tabela de registros */}
                      <div className="flex-1 overflow-auto">
                        <table className="w-full">
                          <thead className="sticky top-0 bg-theme-secondary z-10">
                            <tr>
                              <th className="p-3 text-left">
                                <Checkbox
                                  checked={
                                    selectedRecords.size === records.length
                                  }
                                  onChange={() => {
                                    if (
                                      selectedRecords.size === records.length
                                    ) {
                                      clearSelection();
                                    } else {
                                      selectAllRecords();
                                    }
                                  }}
                                />
                              </th>
                              <th className="p-3 text-left text-xs font-bold text-theme-tertiary uppercase tracking-wider">
                                ID
                              </th>
                              {visibleFields.map((fieldName) => {
                                const isSensitive = isFieldSensitive(fieldName);
                                return (
                                  <th
                                    key={fieldName}
                                    className="p-3 text-left text-xs font-bold text-theme-tertiary uppercase tracking-wider cursor-pointer hover:bg-theme-primary transition-colors"
                                    onClick={() =>
                                      !isSensitive && setSort(fieldName)
                                    }
                                  >
                                    <Inline gap={1}>
                                      {isSensitive && (
                                        <PiLock className="w-3 h-3 text-red-500" />
                                      )}
                                      <span>{fieldName}</span>
                                      {sortField === fieldName && (
                                        <span className="text-brand-primary">
                                          {sortDirection === 'asc' ? '↑' : '↓'}
                                        </span>
                                      )}
                                    </Inline>
                                  </th>
                                );
                              })}
                              <th className="p-3 text-right text-xs font-bold text-theme-tertiary uppercase tracking-wider">
                                Ações
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {records.map((record, index) => (
                              <tr
                                key={record.id}
                                className={`border-t border-theme-primary hover:bg-theme-secondary transition-colors ${
                                  index % 2 === 0 ? '' : 'bg-theme-secondary/50'
                                }`}
                              >
                                <td className="p-3">
                                  <Checkbox
                                    checked={selectedRecords.has(record.id)}
                                    onChange={() =>
                                      toggleRecordSelection(record.id)
                                    }
                                  />
                                </td>
                                <td className="p-3">
                                  <Text
                                    papel="legenda"
                                    tom="fraco"
                                    as="div"
                                    className="font-mono truncate max-w-[100px]"
                                  >
                                    {record.id}
                                  </Text>
                                </td>
                                {visibleFields.map((fieldName) => {
                                  const field = modelSchema?.fields.find(
                                    (f) => f.name === fieldName
                                  );
                                  return (
                                    <td key={fieldName} className="p-3">
                                      <Text
                                        papel="rotulo"
                                        tom="forte"
                                        as="div"
                                        className="max-w-xs truncate"
                                      >
                                        {field
                                          ? formatFieldValue(
                                              record[fieldName],
                                              field
                                            )
                                          : String(record[fieldName] || '-')}
                                      </Text>
                                    </td>
                                  );
                                })}
                                <td className="p-3">
                                  <Inline gap={2} className="justify-end">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      leftIcon={<PiPencilSimple />}
                                      onClick={() => handleEdit(record)}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      leftIcon={<PiTrash />}
                                      onClick={() =>
                                        handleDeleteClick(record.id)
                                      }
                                      className="text-accent-red hover:bg-accent-red/10"
                                    />
                                  </Inline>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Paginação */}
                      <div className="border-t border-theme-primary p-4">
                        <div className="flex items-center justify-between">
                          <Inline gap={4}>
                            <Text papel="rotulo" tom="suave">
                              {totalRecords} registros no total
                            </Text>
                            <Inline gap={2}>
                              <Text papel="rotulo" tom="fraco">
                                Exibir:
                              </Text>
                              <Select
                                value={pageSize.toString()}
                                onChange={(e) =>
                                  setPageSize(parseInt(e.target.value))
                                }
                                options={[
                                  { value: '10', label: '10' },
                                  { value: '25', label: '25' },
                                  { value: '50', label: '50' },
                                  { value: '100', label: '100' },
                                ]}
                                className="w-20"
                              />
                            </Inline>
                          </Inline>

                          <Inline gap={2}>
                            <Text papel="rotulo" tom="suave">
                              Página {currentPage} de {totalPages}
                            </Text>
                            <Inline gap={1}>
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<PiCaretLeft />}
                                onClick={() => loadRecords(currentPage - 1)}
                                disabled={currentPage === 1}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<PiCaretRight />}
                                onClick={() => loadRecords(currentPage + 1)}
                                disabled={currentPage === totalPages}
                              />
                            </Inline>
                          </Inline>
                        </div>
                      </div>
                    </>
                  )}
                </AnimatedCard>
              </AnimatedItem>
            </>
          ) : (
            // Estado vazio - nenhum model selecionado
            <AnimatedItem direction="up" springType="gentle" className="flex-1">
              <AnimatedCard className="classical-card h-full flex items-center justify-center">
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl flex items-center justify-center shadow-theme-glow mx-auto mb-6">
                    <PiDatabase className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-theme-primary mb-2">
                    Selecione uma Tabela
                  </h3>
                  <p className="text-theme-secondary max-w-md mx-auto">
                    Escolha uma tabela na barra lateral para visualizar, editar
                    ou deletar registros
                  </p>
                </div>
              </AnimatedCard>
            </AnimatedItem>
          )}
        </div>
      </div>

      {/* Modals */}
      {showEditor && selectedModel && modelSchema && (
        <RecordEditorModal
          isOpen={showEditor}
          onClose={() => {
            setShowEditor(false);
            setEditingRecord(null);
          }}
          onSave={handleSave}
          record={editingRecord}
          schema={modelSchema}
          modelName={selectedModel}
        />
      )}

      {showFieldSelector && (
        <FieldSelector
          isOpen={showFieldSelector}
          onClose={() => setShowFieldSelector(false)}
          availableFields={availableFields}
          selectedFields={selectedFields}
          modelSchema={modelSchema}
          onToggleField={toggleFieldSelection}
          onSelectAll={selectAllFields}
          onClearSelection={clearFieldSelection}
          onApply={() => loadRecords(1)}
        />
      )}

      {showFilterPanel && (
        <FilterPanel
          isOpen={showFilterPanel}
          onClose={() => setShowFilterPanel(false)}
          availableFields={availableFields}
          activeFilters={activeFilters}
          modelSchema={modelSchema}
          onAddFilter={addFilter}
          onRemoveFilter={removeFilter}
          onClearFilters={clearFilters}
          onApply={() => loadRecords(1)}
        />
      )}

      {/* Modal de confirmação de delete */}
      {showDeleteConfirmation && deleteTarget && (
        <ConfirmationModal
          isOpen={showDeleteConfirmation}
          onClose={() => {
            setShowDeleteConfirmation(false);
            setDeleteTarget(null);
          }}
          onConfirm={handleConfirmDelete}
          title={
            deleteTarget.type === 'single'
              ? CONFIRMATION_MESSAGES.delete.title
              : CONFIRMATION_MESSAGES.deleteMultiple.title
          }
          message={
            deleteTarget.type === 'single'
              ? CONFIRMATION_MESSAGES.delete.message
              : CONFIRMATION_MESSAGES.deleteMultiple.message(
                  deleteTarget.ids.length
                )
          }
          // A frase que a API exige, com o alvo: apagar 3 não confirma apagar 300.
          keyword={deleteConfirmationPhrase(
            selectedModel ?? '',
            deleteTarget.ids.length
          )}
          placeholder={`Digite "${deleteConfirmationPhrase(
            selectedModel ?? '',
            deleteTarget.ids.length
          )}" para confirmar`}
          type="danger"
        />
      )}
    </PageContainer>
  );
}
