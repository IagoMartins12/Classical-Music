// app/learning/LearningPageClient.tsx - COM BOTÃO DE FILTROS
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FiTarget,
  FiCheckCircle,
  FiGrid,
  FiList,
  FiSearch,
  FiMusic,
  FiBookOpen,
  FiFilter,
  FiX,
} from 'react-icons/fi';
import {
  useLearningStore,
  WantToLearnItem,
  LearnedItem,
} from '@/app/stores/useLearningStore';
import { useAuth } from '@/app/hooks/useAuth';
import LearningModal from '@/app/components/LearningModal';
import { StatCard } from './StatCard';
import { EmptyState } from './EmptyState';
import { LearningCard } from './LearningCard';
import Select from '../Common/Select';

type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
type ViewMode = 'grid' | 'list';
type FilterTab = 'all' | 'want-to-learn' | 'learned';

interface LearningPageClientProps {
  initialData: {
    wantToLearn: WantToLearnItem[];
    learned: LearnedItem[];
    totalWantToLearn: number;
    totalLearned: number;
  };
}

const LearningPageClient = ({ initialData }: LearningPageClientProps) => {
  const { user, isAuthenticated } = useAuth();
  const { wantToLearn, learned, initializeLearning, initialized } =
    useLearningStore();

  console.log('initialData', { wantToLearn, learned });

  // States
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<
    DifficultyLevel | 'all'
  >('all');
  const [priorityFilter, setPriorityFilter] = useState<number | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false); // ✨ NOVO: Estado para mostrar/esconder filtros
  const [modalConfig, setModalConfig] = useState<{
    workId: string;
    workTitle: string;
    composerName: string;
    type: 'want-to-learn' | 'learned';
  } | null>(null);

  // ✅ CORREÇÃO: Remover initializeLearning das dependências
  useEffect(() => {
    if (!initialized && initialData) {
      initializeLearning(initialData.wantToLearn, initialData.learned);
    }
  }, [initialData]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if has active filters
  const hasActiveFilters = useMemo(() => {
    return (
      difficultyFilter !== 'all' ||
      priorityFilter !== 'all' ||
      searchQuery !== ''
    );
  }, [difficultyFilter, priorityFilter, searchQuery]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setDifficultyFilter('all');
    setPriorityFilter('all');
  };

  // Filter and search logic
  const filteredData = useMemo(() => {
    let wantToLearnFiltered = [...wantToLearn];
    let learnedFiltered = [...learned];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      wantToLearnFiltered = wantToLearnFiltered.filter(
        (item) =>
          item.work?.title.toLowerCase().includes(query) ||
          item.work?.composer.name.toLowerCase().includes(query) ||
          item.work?.composer.fullName.toLowerCase().includes(query)
      );
      learnedFiltered = learnedFiltered.filter(
        (item) =>
          item.work?.title.toLowerCase().includes(query) ||
          item.work?.composer.name.toLowerCase().includes(query) ||
          item.work?.composer.fullName.toLowerCase().includes(query)
      );
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      wantToLearnFiltered = wantToLearnFiltered.filter(
        (item) => item.difficulty === difficultyFilter
      );
      learnedFiltered = learnedFiltered.filter(
        (item) => item.difficulty === difficultyFilter
      );
    }

    // Priority filter (only for want-to-learn)
    if (priorityFilter !== 'all') {
      wantToLearnFiltered = wantToLearnFiltered.filter(
        (item) => item.priority === priorityFilter
      );
    }

    return { wantToLearn: wantToLearnFiltered, learned: learnedFiltered };
  }, [wantToLearn, learned, searchQuery, difficultyFilter, priorityFilter]);

  const priorityOptions = [
    { value: 'all', label: 'Todas as prioridades' },
    { value: '5', label: 'Prioridade Alta (5)' },
    { value: '4', label: 'Prioridade Média-Alta (4)' },
    { value: '3', label: 'Prioridade Média (3)' },
    { value: '2', label: 'Prioridade Baixa-Média (2)' },
    { value: '1', label: 'Prioridade Baixa (1)' },
  ];

  const dificultyOptions = [
    { value: 'all', label: 'Todas as dificuldades' },
    { value: 'BEGINNER', label: 'Iniciante' },
    { value: 'INTERMEDIATE', label: 'Intermediário' },
    { value: 'ADVANCED', label: 'Avançado' },
  ];

  // Statistics
  const stats = useMemo(() => {
    const totalItems = wantToLearn.length + learned.length;
    const avgPriority =
      wantToLearn.reduce((acc, item) => acc + item.priority, 0) /
      (wantToLearn.length || 1);
    const avgMastery =
      learned.reduce((acc, item) => acc + item.mastery, 0) /
      (learned.length || 1);
    const highPriorityCount = wantToLearn.filter(
      (item) => item.priority >= 4
    ).length;
    const expertLevelCount = learned.filter((item) => item.mastery >= 4).length;

    return {
      totalItems,
      wantToLearnCount: wantToLearn.length,
      learnedCount: learned.length,
      avgPriority: Math.round(avgPriority * 10) / 10,
      avgMastery: Math.round(avgMastery * 10) / 10,
      highPriorityCount,
      expertLevelCount,
    };
  }, [wantToLearn, learned]);

  const handleEditItem = (
    item: WantToLearnItem | LearnedItem,
    type: 'want-to-learn' | 'learned'
  ) => {
    if (!item.work) return;

    setModalConfig({
      workId: item.workId,
      workTitle: item.work.title,
      composerName: item.work.composer.fullName,
      type,
    });
    setShowModal(true);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-theme-secondary">Carregando seu aprendizado...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center classical-card p-8 max-w-md">
          <FiBookOpen className="w-16 h-16 text-brand-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-theme-primary mb-2">
            Acesso Necessário
          </h1>
          <p className="text-theme-secondary mb-6">
            Faça login para acessar seu progresso musical
          </p>
          <Link href="/login" className="btn-classical-primary">
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-gradient-primary">
      <div className="section-wrap space-y-8 relative z-10">
        {/* Header */}
        <div className="animate-fade-in-up">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Meu Aprendizado Musical
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Acompanhe seu progresso e gerencie suas listas de estudo
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon={<FiMusic className="w-6 h-6 text-theme-primary" />}
              title="Total de Obras"
              value={stats.totalItems}
              color="brand"
            />

            <StatCard
              icon={<FiTarget className="w-6 h-6 text-theme-primary" />}
              title="Quero Aprender"
              value={stats.wantToLearnCount}
              subtitle={
                stats.highPriorityCount > 0
                  ? `${stats.highPriorityCount} alta prioridade`
                  : undefined
              }
              color="blue"
            />

            <StatCard
              icon={<FiCheckCircle className="w-6 h-6 text-theme-primary" />}
              title="Já Aprendi"
              value={stats.learnedCount}
              subtitle={
                stats.expertLevelCount > 0
                  ? `${stats.expertLevelCount} nível expert`
                  : undefined
              }
              color="green"
            />
          </div>
        </div>

        {/* Controls */}
        <div
          className="classical-card p-6 animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="space-y-4">
            {/* Main Controls Row */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Tabs */}
              <div className="flex bg-theme-secondary rounded-xl p-1">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'all'
                      ? 'bg-brand-primary bg-theme-tertiary text-theme-primary shadow-md'
                      : 'text-theme-tertiary hover:text-theme-primary'
                  }`}
                >
                  Todas ({stats.totalItems})
                </button>
                <button
                  onClick={() => setActiveTab('want-to-learn')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'want-to-learn'
                      ? 'bg-theme-tertiary text-theme-primary shadow-md'
                      : 'text-theme-tertiary hover:text-theme-primary'
                  }`}
                >
                  Quero Aprender ({stats.wantToLearnCount})
                </button>
                <button
                  onClick={() => setActiveTab('learned')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'learned'
                      ? 'bg-theme-tertiary text-theme-primary shadow-md'
                      : 'text-theme-tertiary hover:text-theme-primary'
                  }`}
                >
                  Já Aprendi ({stats.learnedCount})
                </button>
              </div>

              {/* Search, Filter Button and View Mode */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar obras ou compositores..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-classical w-full sm:w-96"
                  />
                </div>

                {/* Filter Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-all font-medium ${
                    showFilters
                      ? 'bg-brand-primary text-theme-primary border-brand-primary shadow-md'
                      : hasActiveFilters
                      ? 'bg-accent-blue/10 text-accent-blue border-accent-blue/30 shadow-sm'
                      : 'bg-theme-elevated text-theme-primary border-theme-secondary hover:border-brand-primary hover:bg-interactive-hover'
                  }`}
                >
                  <FiFilter className="w-4 h-4" />
                  <span className="text-sm">
                    Filtros
                    {hasActiveFilters && (
                      <span className="ml-1 px-1.5 py-0.5 bg-accent-blue text-white text-xs rounded-full">
                        {
                          [
                            searchQuery && 'busca',
                            difficultyFilter !== 'all' && 'dificuldade',
                            priorityFilter !== 'all' && 'prioridade',
                          ].filter(Boolean).length
                        }
                      </span>
                    )}
                  </span>
                </button>

                {/* View Mode Toggle */}
                <div className="bg-theme-secundary border border-theme-primary rounded-lg p-1 flex">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all duration-300 ${
                      viewMode === 'list'
                        ? 'bg-brand-gradient text-brand-primary shadow-theme-glow'
                        : 'text-theme-tertiary hover:text-theme-primary hover:bg-interactive-hover'
                    }`}
                  >
                    <FiList className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all duration-300 ${
                      viewMode === 'grid'
                        ? 'bg-brand-gradient text-brand-primary shadow-theme-glow'
                        : 'text-theme-tertiary hover:text-theme-primary'
                    }`}
                  >
                    <FiGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* ✨ NOVO: Filtros Expandidos */}
            {showFilters && (
              <div className="bg-theme-secondary rounded-xl p-4 border border-theme-primary animate-fade-in-scale">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-theme-primary flex items-center space-x-2">
                    <FiFilter className="w-4 h-4" />
                    <span>Filtros Avançados</span>
                  </h3>
                  <div className="flex items-center space-x-2">
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-theme-tertiary hover:text-accent-red transition-colors px-2 py-1 rounded border border-theme-tertiary hover:border-accent-red"
                      >
                        Limpar tudo
                      </button>
                    )}
                    <button
                      onClick={() => setShowFilters(false)}
                      className="w-6 h-6 rounded-full bg-theme-primary text-theme-tertiary hover:text-theme-primary transition-colors flex items-center justify-center"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Difficulty Filter */}
                  <div>
                    <label className="block text-xs font-medium text-theme-tertiary mb-2">
                      Dificuldade
                    </label>
                    <Select
                      options={dificultyOptions}
                      value={difficultyFilter}
                      onChange={(e) =>
                        setDifficultyFilter(
                          e.target.value as DifficultyLevel | 'all'
                        )
                      }
                      className="input-classical-2 w-full px-4 text-sm"
                    ></Select>
                  </div>

                  {/* Priority Filter (only for want-to-learn) */}
                  {(activeTab === 'all' || activeTab === 'want-to-learn') && (
                    <div>
                      <label className="block text-xs font-medium text-theme-tertiary mb-2">
                        Prioridade
                      </label>
                      <Select
                        options={priorityOptions}
                        value={priorityFilter}
                        onChange={(e) =>
                          setPriorityFilter(
                            e.target.value === 'all'
                              ? 'all'
                              : Number(e.target.value)
                          )
                        }
                        className="input-classical-2 w-full text-sm"
                      ></Select>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Want to Learn Section */}
          {(activeTab === 'all' || activeTab === 'want-to-learn') && (
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
                  <FiTarget className="w-5 h-5 text-theme-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-theme-primary classical-title">
                    Quero Aprender
                  </h2>
                  <p className="text-theme-tertiary">
                    {filteredData.wantToLearn.length} de {wantToLearn.length}{' '}
                    obras
                  </p>
                </div>
              </div>

              {filteredData.wantToLearn.length === 0 ? (
                <EmptyState
                  type="want-to-learn"
                  searchQuery={searchQuery}
                  hasFilters={hasActiveFilters}
                />
              ) : (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }
                >
                  {filteredData.wantToLearn.map((item, index) => (
                    <LearningCard
                      key={item.id}
                      item={item}
                      type="want-to-learn"
                      viewMode={viewMode}
                      onEdit={() => handleEditItem(item, 'want-to-learn')}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Learned Section */}
          {(activeTab === 'all' || activeTab === 'learned') && (
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center">
                  <FiCheckCircle className="w-5 h-5 text-theme-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-theme-primary classical-title">
                    Já Aprendi
                  </h2>
                  <p className="text-theme-tertiary">
                    {filteredData.learned.length} de {learned.length} obras
                  </p>
                </div>
              </div>

              {filteredData.learned.length === 0 ? (
                <EmptyState
                  type="learned"
                  searchQuery={searchQuery}
                  hasFilters={hasActiveFilters}
                />
              ) : (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }
                >
                  {filteredData.learned.map((item, index) => (
                    <LearningCard
                      key={item.id}
                      item={item}
                      type="learned"
                      viewMode={viewMode}
                      onEdit={() => handleEditItem(item, 'learned')}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalConfig && (
        <LearningModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setModalConfig(null);
          }}
          workId={modalConfig.workId}
          workTitle={modalConfig.workTitle}
          composerName={modalConfig.composerName}
          type={modalConfig.type}
        />
      )}
    </div>
  );
};

export default LearningPageClient;
