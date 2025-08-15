// app/teacher/students/pageClient.tsx - Client Component para Gestão de Alunos
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  FiUsers,
  FiSearch,
  FiXCircle,
  FiUserPlus,
  FiRefreshCw,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../components/animation/AnimatedComponents';
import ViewModeToggle, { ViewMode } from '../../../components/ViewModeToggle';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import { useTeacherStudents } from '@/app/hooks/lessonsSystem/useTeacherStudents';
import { TeacherStudentsServerData } from './pageServer';
import StudentCard from '@/app/components/TeacherSystem/StudentCard';
// 🆕 IMPORTAR O MODAL AVANÇADO
import AddStudentModal from '@/app/components/TeacherSystem/AddStudentModal';

interface TeacherStudentsPageClientProps {
  initialData: TeacherStudentsServerData;
  errorMessage?: string;
}

type FilterTab = 'all' | 'active' | 'inactive' | 'paused';
type SortOption =
  | 'name'
  | 'startDate'
  | 'totalLessons'
  | 'nextLesson'
  | 'completionRate';

// 🆕 INTERFACE PARA O PLANO DE ESTUDOS (mesmo do modal avançado)
interface StudyPlanData {
  maxLessonsPerWeek: number;
  lessonDuration: number;
  preferredDays: string[];
  preferredTimes: string[];
  currentFocus: string[];
  learningPlan?: string;
  studyGoals?: string;
  practiceFrequency?: string;
  homeworkExpectation?: string;
  specialInstructions?: string;
  teacherNotes?: string;
}

export default function TeacherStudentsPageClient({
  initialData,
  errorMessage,
}: TeacherStudentsPageClientProps) {
  // Initialize hook with server data
  const {
    // State do hook
    students,
    summary,
    loading,
    error,
    searchResults,

    // Actions do hook
    refreshStudents,
    setInitialData,
    searchStudents,
    addStudent,
    toggleStudentStatus,
    clearError,
    clearSearchResults,
  } = useTeacherStudents(initialData);

  // Local UI states (não relacionados aos dados dos alunos)
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [showAddStudent, setShowAddStudent] = useState(false);

  // Initialize hook data on mount
  useEffect(() => {
    if (initialData && initialData.students.length > 0) {
      setInitialData(initialData);
    }
  }, [initialData, setInitialData]);

  // Handle search input change (debounced) - 🔄 ATUALIZADO para funcionar com o modal avançado
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);

      // Debounce logic
      const timeoutId = setTimeout(() => {
        if (value.trim()) {
          searchStudents(value.trim());
        } else {
          clearSearchResults();
        }
      }, 600);

      return () => clearTimeout(timeoutId);
    },
    [searchStudents, clearSearchResults]
  );

  // Filter and sort students
  const filteredAndSortedStudents = useMemo(() => {
    let filtered = [...students];

    // Filter by tab
    switch (activeTab) {
      case 'active':
        filtered = filtered.filter(
          (s) => s.relationship.isActive && !s.relationship.pausedAt
        );
        break;
      case 'inactive':
        filtered = filtered.filter((s) => !s.relationship.isActive);
        break;
      case 'paused':
        filtered = filtered.filter(
          (s) => s.relationship.isActive && s.relationship.pausedAt
        );
        break;
      case 'all':
      default:
        // Show all
        break;
    }

    // Filter by search (somente quando não estiver no modal)
    if (searchQuery.trim() && !showAddStudent) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.student.name.toLowerCase().includes(query) ||
          student?.student?.email?.toLowerCase().includes(query) ||
          student.student.mainInstrument?.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.student.name.localeCompare(b.student.name);
        case 'startDate':
          return (
            new Date(b.relationship.startDate).getTime() -
            new Date(a.relationship.startDate).getTime()
          );
        case 'totalLessons':
          return b.stats.totalLessons - a.stats.totalLessons;
        case 'nextLesson':
          if (!a.nextLesson && !b.nextLesson) return 0;
          if (!a.nextLesson) return 1;
          if (!b.nextLesson) return -1;
          return (
            new Date(a.nextLesson.scheduledAt).getTime() -
            new Date(b.nextLesson.scheduledAt).getTime()
          );
        case 'completionRate':
          return b.stats.completionRate - a.stats.completionRate;
        default:
          return 0;
      }
    });

    return filtered;
  }, [students, activeTab, searchQuery, sortBy, showAddStudent]);

  // Statistics for filtered data
  const filteredStats = useMemo(() => {
    const total = filteredAndSortedStudents.length;
    const active = filteredAndSortedStudents.filter(
      (s) => s.relationship.isActive && !s.relationship.pausedAt
    ).length;
    const inactive = filteredAndSortedStudents.filter(
      (s) => !s.relationship.isActive
    ).length;
    const paused = filteredAndSortedStudents.filter(
      (s) => s.relationship.isActive && s.relationship.pausedAt
    ).length;

    const totalLessons = filteredAndSortedStudents.reduce(
      (sum, s) => sum + s.stats.totalLessons,
      0
    );
    const avgLessons = total > 0 ? totalLessons / total : 0;

    const totalCompletionRate = filteredAndSortedStudents.reduce(
      (sum, s) => sum + s.stats.completionRate,
      0
    );
    const avgCompletionRate = total > 0 ? totalCompletionRate / total : 0;

    return {
      total,
      active,
      inactive,
      paused,
      avgLessons: Math.round(avgLessons * 10) / 10,
      avgCompletionRate: Math.round(avgCompletionRate * 10) / 10,
    };
  }, [filteredAndSortedStudents]);

  // 🆕 FUNÇÃO ATUALIZADA PARA FUNCIONAR COM PLANO DE ESTUDOS
  const handleAddStudentWithPlan = useCallback(
    async (studentUserId: string, studyPlan?: StudyPlanData) => {
      console.log('🎯 [STUDENTS-PAGE] Adicionando aluno com plano:', {
        studentUserId,
        hasStudyPlan: !!studyPlan,
        studyPlan: studyPlan
          ? {
              maxLessonsPerWeek: studyPlan.maxLessonsPerWeek,
              lessonDuration: studyPlan.lessonDuration,
              preferredDaysCount: studyPlan.preferredDays?.length || 0,
              preferredTimesCount: studyPlan.preferredTimes?.length || 0,
              currentFocusCount: studyPlan.currentFocus?.length || 0,
            }
          : null,
      });

      // 🔥 PREPARAR DADOS DO PLANO DE ESTUDOS OU USAR VALORES PADRÃO
      const studyPlanData = studyPlan
        ? {
            maxLessonsPerWeek: studyPlan.maxLessonsPerWeek,
            lessonDuration: studyPlan.lessonDuration,
            preferredDays: studyPlan.preferredDays,
            preferredTimes: studyPlan.preferredTimes,
            learningPlan: studyPlan.learningPlan || '',
            currentFocus: studyPlan.currentFocus,
            studyGoals: studyPlan.studyGoals || '',
            practiceFrequency: studyPlan.practiceFrequency || '',
            homeworkExpectation: studyPlan.homeworkExpectation || '',
            specialInstructions: studyPlan.specialInstructions || '',
            teacherNotes: studyPlan.teacherNotes || '',
          }
        : undefined;

      // ⚠️ IMPORTANTE: O hook addStudent precisa ser atualizado para aceitar studyPlanData
      // Por enquanto, vou usar só o studentUserId - você precisará atualizar o hook
      const success = await addStudent(studentUserId, studyPlanData);

      if (success) {
        setSearchQuery('');
        clearSearchResults();
        setShowAddStudent(false);
        console.log('✅ [STUDENTS-PAGE] Aluno adicionado com sucesso!');
      }
    },
    [addStudent, clearSearchResults]
  );

  // Toggle student status using hook
  const handleToggleStudentStatus = useCallback(
    async (relationshipId: string, isPaused: boolean) => {
      await toggleStudentStatus(relationshipId, isPaused);
    },
    [toggleStudentStatus]
  );

  // Format functions
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 🆕 FUNÇÃO PARA FECHAR O MODAL
  const handleCloseModal = () => {
    setShowAddStudent(false);
    setSearchQuery('');
    clearSearchResults();
  };

  // Render error state
  if ((error || errorMessage) && students.length === 0) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiXCircle className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              Erro ao Carregar Alunos
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {error || errorMessage}
            </p>
            <div className="space-y-3">
              <button
                onClick={refreshStudents}
                disabled={loading.students}
                className="btn-classical-primary flex items-center space-x-2 w-full justify-center"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${
                    loading.students ? 'animate-spin' : ''
                  }`}
                />
                <span>
                  {loading.students ? 'Carregando...' : 'Tentar Novamente'}
                </span>
              </button>
              {error && (
                <button
                  onClick={clearError}
                  className="btn-classical-secondary w-full"
                >
                  Limpar Erro
                </button>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiUsers className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Meus Alunos
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Gerencie seus alunos e acompanhe o progresso musical de cada um
            </p>
          </div>
        </AnimatedItem>

        {/* Controls */}
        <AnimatedItem direction="up" springType="gentle">
          <AnimatedCard hover="none" className="classical-card p-6">
            <div className="space-y-4">
              {/* Main Controls Row */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Tabs */}
                <div className="flex bg-theme-secondary rounded-xl p-1 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === 'all'
                        ? 'bg-theme-tertiary text-theme-primary shadow-md'
                        : 'text-theme-tertiary hover:text-theme-primary'
                    }`}
                  >
                    Todos ({summary.total})
                  </button>
                  <button
                    onClick={() => setActiveTab('active')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === 'active'
                        ? 'bg-theme-tertiary text-theme-primary shadow-md'
                        : 'text-theme-tertiary hover:text-theme-primary'
                    }`}
                  >
                    Ativos ({filteredStats.active})
                  </button>
                  <button
                    onClick={() => setActiveTab('inactive')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === 'inactive'
                        ? 'bg-theme-tertiary text-theme-primary shadow-md'
                        : 'text-theme-tertiary hover:text-theme-primary'
                    }`}
                  >
                    Inativos ({filteredStats.inactive})
                  </button>
                  <button
                    onClick={() => setActiveTab('paused')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === 'paused'
                        ? 'bg-theme-tertiary text-theme-primary shadow-md'
                        : 'text-theme-tertiary hover:text-theme-primary'
                    }`}
                  >
                    Pausados ({filteredStats.paused})
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowAddStudent(true)}
                    className="btn-classical-primary flex items-center space-x-2"
                  >
                    <FiUserPlus className="w-4 h-4" />
                    <span>Adicionar Aluno</span>
                  </button>

                  <button
                    onClick={refreshStudents}
                    disabled={loading.students}
                    className="w-10 h-10 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group"
                  >
                    <FiRefreshCw
                      className={`w-4 h-4 text-theme-tertiary group-hover:text-brand-primary transition-all ${
                        loading.students ? 'animate-spin' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Buscar alunos por nome, email ou instrumento..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-classical w-full"
                  />
                </div>

                {/* Sort Select */}
                <Select
                  options={[
                    { value: 'name', label: 'Ordenar por Nome' },
                    { value: 'startDate', label: 'Data de Início' },
                    { value: 'totalLessons', label: 'Total de Aulas' },
                    { value: 'nextLesson', label: 'Próxima Aula' },
                    { value: 'completionRate', label: 'Taxa de Conclusão' },
                  ]}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="input-classical-2 w-auto min-w-48"
                />
                {/* View Mode Toggle */}
                <ViewModeToggle
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              </div>
            </div>
          </AnimatedCard>
        </AnimatedItem>

        {/* Loading State */}
        {loading.students && (
          <AnimatedItem direction="up" springType="gentle">
            <div className="text-center py-8">
              <FiRefreshCw className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-4" />
              <p className="text-theme-secondary">Carregando alunos...</p>
            </div>
          </AnimatedItem>
        )}

        {/* Students List */}
        {!loading.students && (
          <AnimatedItem direction="up" springType="gentle" className="mt-4">
            {filteredAndSortedStudents.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-theme-tertiary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FiUsers className="w-8 h-8 text-theme-tertiary" />
                </div>
                <h3 className="text-xl font-bold text-theme-primary classical-title mb-2">
                  {searchQuery || activeTab !== 'all'
                    ? 'Nenhum aluno encontrado'
                    : 'Você ainda não tem alunos'}
                </h3>
                <p className="text-theme-secondary max-w-md mx-auto mb-6">
                  {searchQuery || activeTab !== 'all'
                    ? 'Tente ajustar os filtros ou termos de busca.'
                    : 'Comece adicionando seus primeiros alunos para começar a usar a plataforma.'}
                </p>
                {!searchQuery && activeTab === 'all' && (
                  <button
                    onClick={() => setShowAddStudent(true)}
                    className="btn-classical-primary flex items-center space-x-2 mx-auto"
                  >
                    <FiUserPlus className="w-4 h-4" />
                    <span>Adicionar Primeiro Aluno</span>
                  </button>
                )}
              </div>
            ) : (
              <div
                className={
                  viewMode === 'cards'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {filteredAndSortedStudents.map((studentRel, index) => (
                  <AnimatedItem
                    key={studentRel.relationshipId}
                    direction={viewMode === 'cards' ? 'up' : 'left'}
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animationFillMode: 'backwards',
                    }}
                  >
                    <StudentCard
                      studentRelationship={studentRel}
                      viewMode={viewMode}
                      onToggleStatus={handleToggleStudentStatus}
                      formatDate={formatDate}
                      formatTime={formatTime}
                    />
                  </AnimatedItem>
                ))}
              </div>
            )}
          </AnimatedItem>
        )}
      </AnimatedContainer>

      {/* 🆕 MODAL AVANÇADO COM PLANO DE ESTUDOS */}
      <AddStudentModal
        addStudent={handleAddStudentWithPlan} // 🔥 Função que agora recebe studyPlan
        handleSearchChange={handleSearchChange}
        isOpen={showAddStudent}
        loading={loading.addStudent}
        onClose={handleCloseModal}
        searchLoading={loading.searchStudents}
        searchQuery={searchQuery}
        searchResults={searchResults}
      />
    </PageContainer>
  );
}
