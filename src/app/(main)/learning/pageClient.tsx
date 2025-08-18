// app/learning/LearningPageClient.tsx - ATUALIZADO COM OPENDIALOG CORRIGIDO
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  FiTarget,
  FiCheckCircle,
  FiSearch,
  FiFilter,
  FiX,
} from 'react-icons/fi';
import {
  useLearningStore,
  WantToLearnItem,
  LearnedItem,
} from '@/app/stores/useLearningStore';
import {
  useLearningModalStore,
  type SelectedWorkScore,
} from '@/app/stores/useLearningModalStore';
import { EmptyState } from '../../components/LearningPageClient/EmptyState';
import { LearningCard } from '../../components/LearningPageClient/LearningCard';
import Select from '../../components/Common/Select';
import ViewModeToggle, { ViewMode } from '../../components/ViewModeToggle';
import { PiTarget } from 'react-icons/pi';
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
  SequentialGrid,
} from '../../components/animation/AnimatedComponents';
import LearningModal from '../../components/LearningModal';

type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
type FilterTab = 'all' | 'want-to-learn' | 'learned';

interface LearningPageClientProps {
  initialData: {
    wantToLearn: WantToLearnItem[];
    learned: LearnedItem[];
    totalWantToLearn: number;
    totalLearned: number;
  };
}

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

const LearningPageClient = ({ initialData }: LearningPageClientProps) => {
  // States
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<
    DifficultyLevel | 'all'
  >('all');
  const [priorityFilter, setPriorityFilter] = useState<number | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const { wantToLearn, learned, initializeLearning, initialized } =
    useLearningStore();

  console.log('wantToLearn', wantToLearn);

  // ✅ Store global do modal atualizado
  const { openModal } = useLearningModalStore();

  useEffect(() => {
    if (!initialized && initialData) {
      initializeLearning(initialData.wantToLearn, initialData.learned);
    }
  }, [initialData]);

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

  // Filter and search logic (mantido igual)
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

  // Statistics (mantido igual)
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

  // ✅ CORRIGIDO: função para editar usando store global com dados iniciais completos
  const handleEditItem = (
    item: WantToLearnItem | LearnedItem,
    type: 'want-to-learn' | 'learned'
  ) => {
    if (!item.work) return;

    console.log(`🎵 [LEARNING-PAGE] Editando item:`, item.work.title, item);

    // ✅ Preparar dados iniciais COMPLETOS
    let initialWantToLearnData = {};
    let initialLearnedData = {};
    let initialWorkScore: SelectedWorkScore | null = null;

    if (type === 'want-to-learn') {
      const wantItem = item as WantToLearnItem;
      initialWantToLearnData = {
        priority: wantItem.priority || 0,
        notes: wantItem.notes || '',
        targetDate: wantItem.targetDate
          ? wantItem.targetDate.split('T')[0]
          : '',
        estimatedStudyTime: wantItem.estimatedStudyTime || undefined,
        difficulty: wantItem.difficulty || undefined,
        motivation: wantItem.motivation || '',
        context: wantItem.context || '',
        selectedWorkScoreId: wantItem.selectedWorkScoreId,
      };

      // ✅ WorkScore se existir
      if (wantItem.selectedWorkScore) {
        console.log(
          '📄 [LEARNING-PAGE] Aplicando WorkScore inicial:',
          wantItem.selectedWorkScore.title
        );
        initialWorkScore = {
          id: wantItem.selectedWorkScore.id,
          sourceId: wantItem.selectedWorkScore.sourceId,
          source: wantItem.selectedWorkScore.source,
          title: wantItem.selectedWorkScore.title,
          downloadUrl: wantItem.selectedWorkScore.downloadUrl,
          thumbnailUrl: wantItem.selectedWorkScore.thumbnailUrl,
          fileSize: wantItem.selectedWorkScore.fileSize,
          pageCount: wantItem.selectedWorkScore.pageCount,
          fileFormat: wantItem.selectedWorkScore.fileFormat,
          type: wantItem.selectedWorkScore.type,
          editor: wantItem.selectedWorkScore.editor,
          publisher: wantItem.selectedWorkScore.publisher,
          copyright: wantItem.selectedWorkScore.copyright,
          uploadDate: wantItem.selectedWorkScore.uploadDate,
          uploader: wantItem.selectedWorkScore.uploader,
          notes: wantItem.selectedWorkScore.notes,
        };
      }
    } else {
      const learnedItem = item as LearnedItem;
      initialLearnedData = {
        mastery: learnedItem.mastery || 0,
        studyStartDate: learnedItem.studyStartDate
          ? learnedItem.studyStartDate.split('T')[0]
          : '',
        studyDuration: learnedItem.studyDuration || undefined,
        notes: learnedItem.notes || '',
        wouldRecommend: learnedItem.wouldRecommend ?? true,
        publicPerformance: learnedItem.publicPerformance || false,
        difficulty: learnedItem.difficulty || undefined,
        enjoyment: learnedItem.enjoyment || undefined,
        technicalChallenges: learnedItem.technicalChallenges || '',
        musicalInsights: learnedItem.musicalInsights || '',
        selectedWorkScoreId: learnedItem.selectedWorkScoreId,
      };

      // ✅ WorkScore se existir
      if (learnedItem.selectedWorkScore) {
        console.log(
          '📄 [LEARNING-PAGE] Aplicando WorkScore inicial:',
          learnedItem.selectedWorkScore.title
        );
        initialWorkScore = {
          id: learnedItem.selectedWorkScore.id,
          sourceId: learnedItem.selectedWorkScore.sourceId,
          source: learnedItem.selectedWorkScore.source,
          title: learnedItem.selectedWorkScore.title,
          downloadUrl: learnedItem.selectedWorkScore.downloadUrl,
          thumbnailUrl: learnedItem.selectedWorkScore.thumbnailUrl,
          fileSize: learnedItem.selectedWorkScore.fileSize,
          pageCount: learnedItem.selectedWorkScore.pageCount,
          fileFormat: learnedItem.selectedWorkScore.fileFormat,
          type: learnedItem.selectedWorkScore.type,
          editor: learnedItem.selectedWorkScore.editor,
          publisher: learnedItem.selectedWorkScore.publisher,
          copyright: learnedItem.selectedWorkScore.copyright,
          uploadDate: learnedItem.selectedWorkScore.uploadDate,
          uploader: learnedItem.selectedWorkScore.uploader,
          notes: learnedItem.selectedWorkScore.notes,
        };
      }
    }

    // ✅ Abrir modal com TODOS os dados iniciais
    console.log('🚀 [LEARNING-PAGE] Abrindo modal com dados:', {
      workId: item.workId,
      type,
      isCurrentlyActive: true,
      initialWorkScore: initialWorkScore?.title || 'nenhuma',
      initialWantToLearnData,
      initialLearnedData,
    });

    openModal({
      workId: item.workId,
      workTitle: item.work.title,
      composerName: item.work.composer.fullName,
      type,
      isCurrentlyActive: true, // ✅ SEMPRE TRUE para edição
      initialWantToLearnData,
      initialLearnedData,
      initialWorkScore, // ✅ PASSAR O WORKSCORE INICIAL
    });
  };

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-16">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl flex items-center justify-center shadow-theme-glow">
                <PiTarget className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Meu Aprendizado Musical
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Acompanhe seu progresso e gerencie suas listas de estudo
            </p>
          </div>
        </AnimatedItem>

        {/* Controls (mantido igual) */}
        <AnimatedItem direction="up" springType="gentle">
          <AnimatedCard hover="none" className="classical-card p-6">
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
                  <ViewModeToggle
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                  />
                </div>
              </div>

              {/* Filtros Expandidos (mantido igual) */}
              {showFilters && (
                <AnimatedItem direction="scale" springType="gentle">
                  <div className="bg-theme-secondary rounded-xl p-4 border border-theme-primary">
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
                      {(activeTab === 'all' ||
                        activeTab === 'want-to-learn') && (
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
                </AnimatedItem>
              )}
            </div>
          </AnimatedCard>
        </AnimatedItem>

        {/* Content (mantido igual, apenas mudança na função onEdit) */}
        <div className="space-y-8">
          {/* Want to Learn Section */}
          {(activeTab === 'all' || activeTab === 'want-to-learn') && (
            <AnimatedItem direction="up" springType="gentle" className="mt-4">
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
                <>
                  {viewMode === 'cards' ? (
                    <SequentialGrid cols={3} gap={6} className="">
                      {filteredData.wantToLearn.map((item) => (
                        <LearningCard
                          key={item.id}
                          item={item}
                          type="want-to-learn"
                          viewMode={viewMode}
                          onEdit={() => handleEditItem(item, 'want-to-learn')}
                        />
                      ))}
                    </SequentialGrid>
                  ) : (
                    <div className="space-y-4">
                      {filteredData.wantToLearn.map((item, index) => (
                        <AnimatedItem
                          key={item.id}
                          direction="left"
                          hover="lift"
                          style={{
                            animationDelay: `${index * 0.1}s`,
                            animationFillMode: 'backwards',
                          }}
                        >
                          <LearningCard
                            item={item}
                            type="want-to-learn"
                            viewMode={viewMode}
                            onEdit={() => handleEditItem(item, 'want-to-learn')}
                          />
                        </AnimatedItem>
                      ))}
                    </div>
                  )}
                </>
              )}
            </AnimatedItem>
          )}

          {/* Learned Section */}
          {(activeTab === 'all' || activeTab === 'learned') && (
            <AnimatedItem direction="up" springType="gentle" className="mt-4">
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
                <AnimatedItem direction="scale" springType="bouncy">
                  <EmptyState
                    type="learned"
                    searchQuery={searchQuery}
                    hasFilters={hasActiveFilters}
                  />
                </AnimatedItem>
              ) : (
                <>
                  {viewMode === 'cards' ? (
                    <SequentialGrid
                      cols={3}
                      gap={6}
                      delayBetweenItems={0.1}
                      className=""
                    >
                      {filteredData.learned.map((item) => (
                        <LearningCard
                          key={item.id}
                          item={item}
                          type="learned"
                          viewMode={viewMode}
                          onEdit={() => handleEditItem(item, 'learned')}
                        />
                      ))}
                    </SequentialGrid>
                  ) : (
                    <div className="space-y-4">
                      {filteredData.learned.map((item, index) => (
                        <AnimatedItem
                          key={item.id}
                          direction="left"
                          hover="lift"
                          style={{
                            animationDelay: `${index * 0.1}s`,
                            animationFillMode: 'backwards',
                          }}
                        >
                          <LearningCard
                            item={item}
                            type="learned"
                            viewMode={viewMode}
                            onEdit={() => handleEditItem(item, 'learned')}
                          />
                        </AnimatedItem>
                      ))}
                    </div>
                  )}
                </>
              )}
            </AnimatedItem>
          )}
        </div>
      </AnimatedContainer>

      {/* ✅ Modal global (sem condicional) */}
      <LearningModal />
    </PageContainer>
  );
};

export default LearningPageClient;
