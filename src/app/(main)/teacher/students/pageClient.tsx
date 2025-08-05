// app/teacher/students/pageClient.tsx - Client Component para Gestão de Alunos
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FiUsers,
  FiSearch,
  FiPlus,
  FiEye,
  FiClock,
  FiCalendar,
  FiMail,
  FiMapPin,
  FiMusic,
  FiTarget,
  FiTrendingUp,
  FiCheckCircle,
  FiXCircle,
  FiPause,
  FiPlay,
  FiBarChart2,
  FiUserPlus,
  FiRefreshCw,
  FiX,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
  SequentialGrid,
} from '../../../components/animation/AnimatedComponents';
import ViewModeToggle, { ViewMode } from '../../../components/ViewModeToggle';
import { TeacherStudentsServerData } from '@/app/(main)/teacher/students/pageServer';
import Modal from '@/app/components/Modal';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';

interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: number;
}

interface TeacherStudentsPageClientProps {
  initialData: TeacherStudentsServerData;
  teacherProfile: TeacherProfile;
  errorMessage?: string;
}

type FilterTab = 'all' | 'active' | 'inactive' | 'paused';
type SortOption =
  | 'name'
  | 'startDate'
  | 'totalLessons'
  | 'nextLesson'
  | 'completionRate';

interface StudentSearchResult {
  id: string;
  name: string;
  email: string;
  image?: string;
  location?: string;
  experienceLevel?: string;
  mainInstrument?: string;
  studentLevel?: string;
  isAlreadyStudent: boolean;
  relationshipId?: string;
  hasStudentProfile: boolean;
}

export default function TeacherStudentsPageClient({
  initialData,
  teacherProfile,
  errorMessage,
}: TeacherStudentsPageClientProps) {
  // States
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(errorMessage);

  // Filter and sort students
  const filteredAndSortedStudents = useMemo(() => {
    let filtered = [...data.students];

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

    // Filter by search
    if (searchQuery.trim()) {
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
  }, [data.students, activeTab, searchQuery, sortBy]);

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

  // Search students function
  const searchStudents = useCallback(async (email: string) => {
    if (email.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `/api/teacher/students/search?email=${encodeURIComponent(
          email
        )}&limit=10`
      );

      if (!response.ok) {
        throw new Error('Erro na busca');
      }

      const searchData = await response.json();

      if (searchData.success) {
        setSearchResults(searchData.students || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Handle search input change
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (showAddStudent && searchQuery.trim()) {
        searchStudents(searchQuery.trim());
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, searchStudents, showAddStudent]);

  // Add student function
  const addStudent = useCallback(async (studentUserId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/teacher/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentUserId,
          maxLessonsPerWeek: 1,
          lessonDuration: 60,
          preferredDays: [],
          preferredTimes: [],
          learningPlan: '',
          currentFocus: [],
          teacherNotes: '',
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar aluno');
      }

      const result = await response.json();

      if (result.success) {
        // Refresh data
        await refreshData();
        setSearchQuery('');
        setSearchResults([]);
        setShowAddStudent(false);

        console.log('Aluno adicionado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao adicionar aluno:', error);
      setError('Erro ao adicionar aluno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh data function
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate refresh - in real app, you'd fetch new data
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      setRefreshing(false);
    }
  }, []);

  // Pause/Resume student
  const toggleStudentStatus = useCallback(
    async (relationshipId: string, isPaused: boolean) => {
      try {
        const response = await fetch('/api/teacher/students', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            relationshipId,
            pausedAt: isPaused ? null : new Date(),
            pauseReason: isPaused ? null : 'Pausado pelo professor',
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao atualizar status');
        }

        const result = await response.json();

        if (result.success) {
          // Update local state
          setData((prev) => ({
            ...prev,
            students: prev.students.map((student) =>
              student.relationshipId === relationshipId
                ? {
                    ...student,
                    relationship: {
                      ...student.relationship,
                      pausedAt: isPaused ? null : new Date(),
                      pauseReason: isPaused ? null : 'Pausado pelo professor',
                    },
                  }
                : student
            ),
          }));
        }
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
        setError('Erro ao atualizar status do aluno.');
      }
    },
    []
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

  // Render error state
  if (error && data.students.length === 0) {
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
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-classical-primary flex items-center space-x-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Recarregar Página</span>
            </button>
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

        {/* Stats Cards */}
        <AnimatedItem direction="up" springType="gentle">
          <SequentialGrid
            cols={4}
            gap={6}
            delayBetweenItems={0.1}
            className="mb-8"
          >
            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiUsers className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {data.summary.total}
              </div>
              <div className="text-sm text-theme-tertiary">Total de Alunos</div>
              <div className="text-xs text-accent-green mt-1">
                {data.summary.active} ativos
              </div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiCheckCircle className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {filteredStats.avgCompletionRate}%
              </div>
              <div className="text-sm text-theme-tertiary">
                Taxa de Conclusão
              </div>
              <div className="text-xs text-accent-green mt-1">Média geral</div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiBarChart2 className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {filteredStats.avgLessons}
              </div>
              <div className="text-sm text-theme-tertiary">Aulas/Aluno</div>
              <div className="text-xs text-theme-tertiary mt-1">
                Média histórica
              </div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-red rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiTrendingUp className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {filteredAndSortedStudents.filter((s) => s.nextLesson).length}
              </div>
              <div className="text-sm text-theme-tertiary">
                Com Próxima Aula
              </div>
              <div className="text-xs text-accent-blue mt-1">Esta semana</div>
            </AnimatedCard>
          </SequentialGrid>
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
                    Todos ({data.summary.total})
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
                    onClick={refreshData}
                    disabled={refreshing}
                    className="w-10 h-10 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group"
                  >
                    <FiRefreshCw
                      className={`w-4 h-4 text-theme-tertiary group-hover:text-brand-primary transition-all ${
                        refreshing ? 'animate-spin' : ''
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

        {/* Students List */}
        <AnimatedItem direction="up" springType="gentle">
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
                  hover="lift"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: 'backwards',
                  }}
                >
                  <StudentCard
                    studentRelationship={studentRel}
                    viewMode={viewMode}
                    onToggleStatus={toggleStudentStatus}
                    formatDate={formatDate}
                    formatTime={formatTime}
                  />
                </AnimatedItem>
              ))}
            </div>
          )}
        </AnimatedItem>
      </AnimatedContainer>

      {/* Add Student Modal */}
      {showAddStudent && (
        <AddStudentModal
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          searchLoading={searchLoading}
          loading={loading}
          onClose={() => {
            setShowAddStudent(false);
            setSearchQuery('');
            setSearchResults([]);
          }}
          onAddStudent={addStudent}
        />
      )}
    </PageContainer>
  );
}

// Student Card Component
interface StudentCardProps {
  studentRelationship: TeacherStudentsServerData['students'][0];
  viewMode: ViewMode;
  onToggleStatus: (relationshipId: string, isPaused: boolean) => void;
  formatDate: (date: Date | string) => string;
  formatTime: (date: Date | string) => string;
}

function StudentCard({
  studentRelationship,
  viewMode,
  onToggleStatus,
  formatDate,
  formatTime,
}: StudentCardProps) {
  const { student, relationship, stats, nextLesson } = studentRelationship;

  const isActive = relationship.isActive && !relationship.pausedAt;
  const isPaused = relationship.isActive && !!relationship.pausedAt;
  const isInactive = !relationship.isActive;

  const getStatusColor = () => {
    if (isActive) return 'accent-green';
    if (isPaused) return 'accent-yellow';
    return 'accent-red';
  };

  const getStatusText = () => {
    if (isActive) return 'Ativo';
    if (isPaused) return 'Pausado';
    return 'Inativo';
  };

  return (
    <div
      className={`classical-card p-6 group hover:shadow-theme-glow transition-all ${
        viewMode === 'list' ? 'flex items-center space-x-6' : ''
      }`}
    >
      <div
        className={`${
          viewMode === 'list' ? 'flex items-center space-x-4 flex-1' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar */}
          <div className="relative w-16 h-16">
            {student.image ? (
              <div className="relative w-full h-full rounded-full overflow-hidden border-3 border-brand-primary/20 group-hover:border-brand-primary/50 transition-all">
                <Image
                  src={student.image}
                  alt={student.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center border-3 border-brand-primary/20 group-hover:border-brand-primary/50 transition-all">
                <FiUsers className="w-8 h-8 text-theme-primary" />
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <h3 className="font-bold text-theme-primary group-hover:text-brand-primary transition-colors text-lg">
              {student.name}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-theme-tertiary">
              <FiMail className="w-3 h-3" />
              <span>{student.email}</span>
            </div>
            {student.location && (
              <div className="flex items-center space-x-2 text-sm text-theme-tertiary">
                <FiMapPin className="w-3 h-3" />
                <span>{student.location}</span>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="flex flex-col items-end space-y-2">
            <span
              className={`px-3 py-1 border rounded-full text-xs font-medium bg-${getStatusColor()}/10 border-${getStatusColor()}/30 text-${getStatusColor()}`}
            >
              {getStatusText()}
            </span>
            <div className="flex items-center space-x-1">
              <Link
                href={`/teacher/students/${student.id}`}
                className="w-8 h-8 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group/btn"
              >
                <FiEye className="w-4 h-4 text-theme-tertiary group-hover/btn:text-brand-primary transition-colors" />
              </Link>
              {isActive && (
                <button
                  onClick={() =>
                    onToggleStatus(studentRelationship.relationshipId, false)
                  }
                  className="w-8 h-8 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-accent-yellow transition-all flex items-center justify-center group/btn"
                  title="Pausar aluno"
                >
                  <FiPause className="w-4 h-4 text-theme-tertiary group-hover/btn:text-accent-yellow transition-colors" />
                </button>
              )}
              {isPaused && (
                <button
                  onClick={() =>
                    onToggleStatus(studentRelationship.relationshipId, true)
                  }
                  className="w-8 h-8 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-accent-green transition-all flex items-center justify-center group/btn"
                  title="Reativar aluno"
                >
                  <FiPlay className="w-4 h-4 text-theme-tertiary group-hover/btn:text-accent-green transition-colors" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Student Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <FiTarget className="w-4 h-4 text-accent-blue" />
              <span className="text-theme-secondary">Nível:</span>
              <span className="text-theme-primary font-medium">
                {student.level}
              </span>
            </div>
            {student.mainInstrument && (
              <div className="flex items-center space-x-2 text-sm">
                <FiMusic className="w-4 h-4 text-accent-purple" />
                <span className="text-theme-primary font-medium">
                  {student.mainInstrument}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <FiCalendar className="w-4 h-4 text-accent-green" />
              <span className="text-theme-secondary">Início:</span>
              <span className="text-theme-primary">
                {formatDate(relationship.startDate)}
              </span>
            </div>
            <div className="text-xs text-theme-tertiary">
              {relationship.maxLessonsPerWeek}x por semana •{' '}
              {relationship.lessonDuration}min
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-brand-primary">
              {stats.totalLessons}
            </div>
            <div className="text-xs text-theme-tertiary">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-accent-green">
              {stats.completedLessons}
            </div>
            <div className="text-xs text-theme-tertiary">Concluídas</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-accent-blue">
              {stats.completionRate}%
            </div>
            <div className="text-xs text-theme-tertiary">Taxa</div>
          </div>
        </div>

        {/* Next Lesson */}
        {nextLesson && isActive && (
          <div className="p-3 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-lg border border-theme-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-theme-primary">
                  Próxima aula
                </div>
                <div className="text-xs text-theme-tertiary">
                  {formatDate(nextLesson.scheduledAt)} às{' '}
                  {formatTime(nextLesson.scheduledAt)}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <FiClock className="w-4 h-4 text-brand-primary" />
                <span className="text-xs text-brand-primary font-medium">
                  {nextLesson.duration}min
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Pause/Inactive Reason */}
        {(isPaused || isInactive) && relationship.pauseReason && (
          <div className="p-3 bg-gradient-to-r from-accent-red/5 to-accent-red/10 rounded-lg border border-accent-red/20">
            <div className="text-sm text-accent-red">
              <strong>Motivo:</strong> {relationship.pauseReason}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-theme-secondary">
          <Link
            href={`/teacher/students/${student.id}`}
            className="text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors flex items-center space-x-1"
          >
            <span>Ver Detalhes</span>
            <FiEye className="w-3 h-3" />
          </Link>

          <div className="flex items-center space-x-2">
            <Link
              href={`/teacher/lessons/create?studentId=${student.id}`}
              className="text-accent-blue hover:text-accent-purple text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <FiPlus className="w-3 h-3" />
              <span>Nova Aula</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add Student Modal Component
interface AddStudentModalProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: StudentSearchResult[];
  searchLoading: boolean;
  loading: boolean;
  onClose: () => void;
  onAddStudent: (studentUserId: string) => void;
}

function AddStudentModal({
  searchQuery,
  setSearchQuery,
  searchResults,
  searchLoading,
  loading,
  onClose,
  onAddStudent,
}: AddStudentModalProps) {
  return (
    <Modal isOpen onClose={onClose}>
      <AnimatedCard
        hover="none"
        className="classical-card w-full max-w-2xl max-h-[80vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-theme-primary classical-title">
                Adicionar Novo Aluno
              </h2>
              <p className="text-theme-tertiary">
                Busque o aluno pelo email completo
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-theme-elevated hover:bg-interactive-hover transition-colors flex items-center justify-center"
            >
              <FiX className="w-4 h-4 text-theme-tertiary" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-6">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4" />
            <Input
              type="email"
              placeholder="Digite o email completo do aluno..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-classical w-full"
            />
            {searchLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-theme-primary">
                Resultados da busca ({searchResults.length})
              </h3>

              {searchResults.map((student) => (
                <div key={student.id} className="classical-card-2 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Avatar */}
                      <div className="relative w-10 h-10">
                        {student.image ? (
                          <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-brand-primary/20">
                            <Image
                              src={student.image}
                              alt={student.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center border-2 border-brand-primary/20">
                            <FiUsers className="w-5 h-5 text-theme-primary" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="font-semibold text-theme-primary">
                          {student.name}
                        </div>
                        <div className="text-sm text-theme-tertiary">
                          {student.email}
                        </div>
                        {student.location && (
                          <div className="text-xs text-theme-tertiary flex items-center">
                            <FiMapPin className="w-3 h-3 mr-1" />
                            {student.location}
                          </div>
                        )}
                        {student.experienceLevel && (
                          <div className="text-xs text-accent-blue">
                            Nível: {student.experienceLevel}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div>
                      {student.isAlreadyStudent ? (
                        <span className="px-3 py-1 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded-full text-xs font-medium">
                          Já é seu aluno
                        </span>
                      ) : (
                        <button
                          onClick={() => onAddStudent(student.id)}
                          disabled={loading}
                          className="btn-classical-primary text-sm px-4 py-2 flex items-center space-x-2"
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-theme-primary/30 border-t-theme-primary rounded-full animate-spin"></div>
                              <span>Adicionando...</span>
                            </>
                          ) : (
                            <>
                              <FiPlus className="w-4 h-4" />
                              <span>Adicionar</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty States */}
          {searchQuery.length >= 3 &&
            searchResults.length === 0 &&
            !searchLoading && (
              <div className="text-center py-8">
                <FiSearch className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                <h3 className="font-semibold text-theme-primary mb-2">
                  Nenhum aluno encontrado
                </h3>
                <p className="text-theme-tertiary text-sm">
                  Verifique se o email está correto ou se o usuário já se
                  cadastrou na plataforma.
                </p>
              </div>
            )}

          {searchQuery.length < 3 && (
            <div className="text-center py-8">
              <FiUserPlus className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
              <h3 className="font-semibold text-theme-primary mb-2">
                Como adicionar um aluno
              </h3>
              <div className="text-theme-tertiary text-sm space-y-2">
                <p>1. Digite o email completo do aluno no campo acima</p>
                <p>2. O aluno deve estar cadastrado na plataforma</p>
                <p>3. Clique em "Adicionar" quando encontrar o aluno</p>
              </div>
            </div>
          )}
        </div>
      </AnimatedCard>
    </Modal>
  );
}
