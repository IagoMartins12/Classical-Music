// app/components/Admin/SelectiveBackupSection.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FiDownload,
  FiTrash2,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
  FiActivity,
  FiInfo,
  FiTarget,
  FiCheck,
  FiX,
  FiLayers,
  FiFilter,
  FiToggleLeft,
  FiToggleRight,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedItem,
} from '@/app/components/animation/AnimatedComponents';
import { useSelectiveBackup } from '@/app/hooks/admin/useSelectiveBackup';
import Button from '@/app/components/Common/Button';
import Modal from '@/app/components/Modal';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';

interface SelectiveBackupSectionProps {
  className?: string;
}

export default function SelectiveBackupSection({
  className = '',
}: SelectiveBackupSectionProps) {
  const {
    selectiveBackups,
    availableCollections,
    maxBackups,
    totalBackups,
    loading,
    error,
    isCreatingBackup,
    lastUpdated,
    refreshBackups,
    createSelectiveBackup,
    deleteSelectiveBackup,
    formatBackupDate,
    getBackupAge,
    getStatusColor,
    getStatusLabel,
    resolveDependencies,
    getCollectionsByCategory,
  } = useSelectiveBackup();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [includeDependencies, setIncludeDependencies] = useState(true);
  const [backupName, setBackupName] = useState('');
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCollectionToggle = (collectionName: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionName)
        ? prev.filter((c) => c !== collectionName)
        : [...prev, collectionName]
    );
  };

  const handleSelectAll = () => {
    const filteredCollections = getFilteredCollections();
    const allSelected = filteredCollections.every((c) =>
      selectedCollections.includes(c.name)
    );

    if (allSelected) {
      // Desselecionar todos os filtrados
      setSelectedCollections((prev) =>
        prev.filter((c) => !filteredCollections.some((fc) => fc.name === c))
      );
    } else {
      // Selecionar todos os filtrados
      const newCollections = [...selectedCollections];
      filteredCollections.forEach((c) => {
        if (!newCollections.includes(c.name)) {
          newCollections.push(c.name);
        }
      });
      setSelectedCollections(newCollections);
    }
  };

  const handleCreateBackup = async () => {
    if (selectedCollections.length === 0) {
      return;
    }

    await createSelectiveBackup(
      selectedCollections,
      includeDependencies,
      backupName
    );

    // Reset form
    setShowCreateForm(false);
    setSelectedCollections([]);
    setBackupName('');
    setIncludeDependencies(true);
  };

  const getFilteredCollections = () => {
    let filtered = availableCollections;

    // Filtro por categoria
    if (categoryFilter !== 'all') {
      const categorizedCollections = getCollectionsByCategory();
      filtered = categorizedCollections[categoryFilter] || [];
    }

    // Filtro por busca
    if (searchFilter) {
      filtered = filtered.filter(
        (c) =>
          c.displayName.toLowerCase().includes(searchFilter.toLowerCase()) ||
          c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
          c.description.toLowerCase().includes(searchFilter.toLowerCase())
      );
    }

    return filtered;
  };

  const getSelectedCollectionsWithDeps = () => {
    return includeDependencies
      ? resolveDependencies(selectedCollections)
      : selectedCollections;
  };

  const getMinutesSinceUpdate = () => {
    if (!mounted || !lastUpdated) return 0;
    return Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60));
  };

  const rawCategories = Object.keys(getCollectionsByCategory());
  const filteredCollections = getFilteredCollections();
  const allFilteredSelected =
    filteredCollections.length > 0 &&
    filteredCollections.every((c) => selectedCollections.includes(c.name));
  const finalCollections = getSelectedCollectionsWithDeps();

  const categoryOptions = [
    { value: 'all', label: 'Todas as Categorias' },
    ...rawCategories.map((category) => ({
      value: category,
      label: category,
    })),
  ];
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <AnimatedItem direction="up" springType="gentle">
        <AnimatedCard className="classical-card p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
                <FiTarget className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-theme-primary">
                  Backup Seletivo
                </h3>
                <p className="text-theme-secondary">
                  Backup de tabelas específicas (Limite: {maxBackups} backups)
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-sm text-theme-secondary">
                {totalBackups}/{maxBackups} backups
              </div>
              <Button
                variant="primary"
                leftIcon={<FiDownload />}
                onClick={() => setShowCreateForm(true)}
                disabled={isCreatingBackup}
              >
                Novo Backup Seletivo
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={
                  <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                }
                onClick={refreshBackups}
                disabled={loading}
              >
                <span className="sr-only">Atualizar</span>
              </Button>
            </div>
          </div>
        </AnimatedCard>
      </AnimatedItem>

      {/* Lista de Backups Seletivos */}
      <AnimatedItem direction="up" springType="gentle">
        <AnimatedCard className="classical-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-theme-primary">
              Backups Seletivos Recentes
            </h4>
            {mounted && lastUpdated && (
              <span className="text-xs text-theme-tertiary">
                {getMinutesSinceUpdate() === 0
                  ? 'Atualizado agora'
                  : `Atualizado há ${getMinutesSinceUpdate()} min`}
              </span>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-accent-red/10 border border-accent-red/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <FiAlertTriangle className="w-5 h-5 text-accent-red" />
                <p className="text-accent-red font-medium">{error}</p>
              </div>
            </div>
          )}

          {selectiveBackups.length === 0 ? (
            <div className="text-center py-12">
              <FiTarget className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
              <h4 className="text-lg font-medium text-theme-primary mb-2">
                Nenhum backup seletivo encontrado
              </h4>
              <p className="text-theme-secondary mb-6">
                Crie um backup seletivo para tabelas específicas
              </p>
              <Button
                variant="primary"
                leftIcon={<FiDownload />}
                onClick={() => setShowCreateForm(true)}
              >
                Criar Primeiro Backup Seletivo
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {selectiveBackups.map((backup) => (
                <div
                  key={backup.id}
                  className={`p-4 border rounded-xl transition-all cursor-pointer ${
                    selectedBackup === backup.id
                      ? 'border-brand-primary bg-brand-primary/5'
                      : 'border-theme-primary hover:border-theme-secondary'
                  }`}
                  onClick={() =>
                    setSelectedBackup(
                      selectedBackup === backup.id ? null : backup.id
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {backup.status === 'completed' && (
                          <FiCheckCircle className="w-6 h-6 text-accent-green" />
                        )}
                        {backup.status === 'failed' && (
                          <FiAlertTriangle className="w-6 h-6 text-accent-red" />
                        )}
                        {backup.status === 'in_progress' && (
                          <FiActivity className="w-6 h-6 text-accent-amber animate-pulse" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className="font-medium text-theme-primary truncate">
                            {backup.name}
                          </h4>
                          <span
                            className={`text-sm font-medium px-2 py-1 rounded-lg ${getStatusColor(
                              backup.status
                            )}`}
                          >
                            {getStatusLabel(backup.status)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-theme-secondary">
                          <span>{formatBackupDate(backup.date)}</span>
                          <span>{backup.size}</span>
                          <span>{backup.collections.length} tabelas</span>
                          {backup.totalRecords && (
                            <span>
                              {backup.totalRecords.toLocaleString()} registros
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-theme-tertiary">
                        {mounted ? getBackupAge(backup.date) : ''}
                      </span>
                    </div>
                  </div>

                  {/* Detalhes expandidos */}
                  {selectedBackup === backup.id && (
                    <div className="mt-4 pt-4 border-t border-theme-primary">
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-theme-primary mb-2">
                          Tabelas incluídas:
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {backup.collections.map((collection) => (
                            <span
                              key={collection}
                              className="px-2 py-1 text-xs bg-theme-secondary text-theme-primary rounded-lg"
                            >
                              {availableCollections.find(
                                (c) => c.name === collection
                              )?.displayName || collection}
                            </span>
                          ))}
                        </div>
                      </div>

                      {backup.error && (
                        <div className="mb-4 p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg">
                          <p className="text-sm text-accent-red">
                            <strong>Erro:</strong> {backup.error}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FiInfo className="w-4 h-4 text-theme-tertiary" />
                          <span className="text-sm text-theme-secondary">
                            Backup seletivo -{' '}
                            {backup.duration || 'Duração não informada'}
                          </span>
                        </div>

                        <Button
                          variant="delete"
                          size="sm"
                          leftIcon={<FiTrash2 />}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSelectiveBackup(backup.id);
                          }}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </AnimatedCard>
      </AnimatedItem>

      {/* Modal de Criação */}
      {showCreateForm && (
        <Modal isOpen maxWidth="4xl" onClose={() => setShowCreateForm(false)}>
          <div className="bg-theme-elevated p-6  overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-theme-primary">
                Criar Backup Seletivo
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateForm(false)}
              >
                <FiX className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Nome do Backup */}
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Nome do Backup (Opcional)
                </label>
                <Input
                  type="text"
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                  className="w-full"
                  placeholder="Ex: Backup Usuários e Obras"
                />
              </div>

              {/* Configurações */}
              <div className="p-4 bg-theme-secondary rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-theme-primary">
                      Incluir Dependências
                    </h4>
                    <p className="text-sm text-theme-secondary">
                      Incluir automaticamente tabelas necessárias
                    </p>
                  </div>
                  <button
                    onClick={() => setIncludeDependencies(!includeDependencies)}
                    className="flex items-center"
                  >
                    {includeDependencies ? (
                      <FiToggleRight className="w-8 h-8 text-accent-green" />
                    ) : (
                      <FiToggleLeft className="w-8 h-8 text-theme-tertiary" />
                    )}
                  </button>
                </div>
              </div>

              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    Buscar Tabelas
                  </label>
                  <Input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full"
                    placeholder="Digite para buscar..."
                    leftIcon={<FiFilter />}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    Categoria
                  </label>
                  <Select
                    value={categoryFilter}
                    options={categoryOptions}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-theme-secondary border border-theme-primary rounded-lg text-theme-primary"
                  />
                </div>
              </div>

              {/* Seleção de Tabelas */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-theme-primary">
                    Selecionar Tabelas ({selectedCollections.length}{' '}
                    selecionadas)
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    leftIcon={allFilteredSelected ? <FiX /> : <FiCheck />}
                  >
                    {allFilteredSelected ? 'Desselecionar' : 'Selecionar'} Todas
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-4 bg-theme-secondary rounded-xl">
                  {filteredCollections.map((collection) => (
                    <label
                      key={collection.name}
                      className="flex items-start space-x-3 p-3 bg-theme-primary hover:bg-theme-tertiary rounded-lg cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCollections.includes(collection.name)}
                        onChange={() => handleCollectionToggle(collection.name)}
                        className="mt-1 rounded text-brand-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-theme-primary">
                            {collection.displayName}
                          </p>
                          {collection.dependencies.length > 0 && (
                            <FiLayers
                              className="w-4 h-4 text-theme-tertiary"
                              title="Tem dependências"
                            />
                          )}
                        </div>
                        <p className="text-xs text-theme-secondary">
                          {collection.description}
                        </p>
                        {collection.dependencies.length > 0 && (
                          <p className="text-xs text-accent-amber mt-1">
                            Depende de: {collection.dependencies.join(', ')}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preview das Tabelas Finais */}
              {selectedCollections.length > 0 && (
                <div className="p-4 bg-accent-blue/10 border border-accent-blue/20 rounded-xl">
                  <h5 className="text-sm font-medium text-theme-primary mb-2">
                    Tabelas que serão incluídas no backup:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {finalCollections.map((collection) => (
                      <span
                        key={collection}
                        className={`px-2 py-1 text-xs rounded-lg ${
                          selectedCollections.includes(collection)
                            ? 'bg-accent-green/20 text-accent-green'
                            : 'bg-accent-amber/20 text-accent-amber'
                        }`}
                      >
                        {availableCollections.find((c) => c.name === collection)
                          ?.displayName || collection}
                        {!selectedCollections.includes(collection) &&
                          ' (dependência)'}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-theme-secondary mt-2">
                    Total: {finalCollections.length} tabelas
                    {includeDependencies &&
                      finalCollections.length > selectedCollections.length && (
                        <>
                          {' '}
                          (incluindo{' '}
                          {finalCollections.length -
                            selectedCollections.length}{' '}
                          dependências)
                        </>
                      )}
                  </p>
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end space-x-3 mt-8">
              <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateBackup}
                disabled={selectedCollections.length === 0 || isCreatingBackup}
                isLoading={isCreatingBackup}
                leftIcon={<FiDownload />}
              >
                {isCreatingBackup ? 'Criando Backup...' : 'Criar Backup'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
