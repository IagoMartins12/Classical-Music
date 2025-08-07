// app/student/assignments/pageClient.tsx - Client Component para Tarefas do Aluno

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  FiClipboard,
  FiUser,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiCheck,
  FiClock,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiTarget,
  FiBookOpen,
  FiHeadphones,
  FiMusic,
  FiEdit3,
  FiMic,
  FiCalendar,
  FiAlertTriangle,
  FiStar,
  FiUpload,
  FiMessageSquare,
  FiTrendingUp,
  FiPlayCircle,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../components/animation/AnimatedComponents';
import { StudentAssignmentsData } from './pageServer';
import Link from 'next/link';
import { useStudentAssignments } from '@/app/hooks/lessonsSystem/useStudentAssignments';
import Select from '@/app/components/Common/Select';
import Input from '@/app/components/Common/Inputs';

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: number;
}

interface StudentAssignmentsPageClientProps {
  initialData: StudentAssignmentsData | null;
  studentProfile: StudentProfile;
  errorMessage?: string;
}

type AssignmentFilter =
  | 'all'
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'overdue';
type TimeFilter = 'all' | 'today' | 'this_week' | 'overdue' | 'upcoming';

const typeIcons = {
  practice: FiTarget,
  theory: FiBookOpen,
  listening: FiHeadphones,
  composition: FiEdit3,
  performance: FiMic,
  reading: FiMusic,
};

const priorityColors = {
  low: 'text-accent-green',
  medium: 'text-accent-yellow',
  high: 'text-accent-red',
};

export default function StudentAssignmentsPageClient({
  initialData,
  studentProfile,
  errorMessage,
}: StudentAssignmentsPageClientProps) {
  // Initialize hook with server data
  const {
    assignments,
    stats,
    loading,
    error,
    pagination,
    setInitialData,
    refreshAssignments,
    completeAssignment,
    updateProgress,
    addSubmission,
    clearError,
  } = useStudentAssignments();

  // Local UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<AssignmentFilter>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Modal state
  const [selectedAssignment, setSelectedAssignment] = useState<
    (typeof assignments)[0] | null
  >(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<'details' | 'progress' | 'submit'>(
    'details'
  );

  // Form states for modal
  const [progressValue, setProgressValue] = useState(0);
  const [actualTime, setActualTime] = useState('');
  const [studentNotes, setStudentNotes] = useState('');
  const [studentRating, setStudentRating] = useState(0);

  // Initialize with server data
  useEffect(() => {
    if (initialData && initialData.assignments.length > 0) {
      setInitialData(initialData);
    } else if (!errorMessage && errorMessage !== 'no_teachers') {
      refreshAssignments();
    }
  }, [initialData, errorMessage, setInitialData, refreshAssignments]);

  // Use initial data or hook data
  const displayAssignments = initialData?.assignments || assignments;
  const displayStats = initialData?.stats || stats;
  const teachersOptions = initialData?.teachers || [];

  // Filter assignments
  const filteredAssignments = useMemo(() => {
    let filtered = [...displayAssignments];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (assignment) =>
          assignment.title.toLowerCase().includes(term) ||
          assignment.description.toLowerCase().includes(term) ||
          assignment.lesson.teacher.name.toLowerCase().includes(term) ||
          assignment.type.toLowerCase().includes(term)
      );
    }

    // Teacher filter
    if (selectedTeacher !== 'all') {
      filtered = filtered.filter((assignment) => {
        const teacherId = teachersOptions.find(
          (t) => t.teacherName === assignment.lesson.teacher.name
        )?.teacherId;
        return teacherId === selectedTeacher;
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((assignment) => {
        switch (statusFilter) {
          case 'pending':
            return assignment.status === 'PENDING';
          case 'in_progress':
            return assignment.status === 'IN_PROGRESS';
          case 'completed':
            return assignment.status === 'COMPLETED' || assignment.isCompleted;
          case 'overdue':
            return assignment.isOverdue;
          default:
            return true;
        }
      });
    }

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const today = new Date(now);
      today.setHours(23, 59, 59, 999);

      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() + 7);

      filtered = filtered.filter((assignment) => {
        if (!assignment.dueDate) return timeFilter === 'all';

        const dueDate = new Date(assignment.dueDate);

        switch (timeFilter) {
          case 'today':
            return (
              dueDate <= today &&
              dueDate >= new Date(today.getTime() - 24 * 60 * 60 * 1000)
            );
          case 'this_week':
            return dueDate <= weekEnd && dueDate >= now;
          case 'overdue':
            return dueDate < now && !assignment.isCompleted;
          case 'upcoming':
            return dueDate > now;
          default:
            return true;
        }
      });
    }

    return filtered.sort((a, b) => {
      // Sort by: overdue first, then by due date, then by created date
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [
    displayAssignments,
    searchTerm,
    selectedTeacher,
    statusFilter,
    timeFilter,
    teachersOptions,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssignments = filteredAssignments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Format functions
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}min`;
    }
    return `${minutes}min`;
  };

  // Get assignment status info
  const getAssignmentStatusInfo = (assignment: (typeof assignments)[0]) => {
    if (assignment.isCompleted) {
      return {
        color: 'bg-accent-green/10 border-accent-green/30 text-accent-green',
        label: 'Concluída',
        icon: FiCheck,
      };
    }

    if (assignment.isOverdue) {
      return {
        color: 'bg-accent-red/10 border-accent-red/30 text-accent-red',
        label: 'Atrasada',
        icon: FiAlertTriangle,
      };
    }

    if (assignment.status === 'IN_PROGRESS') {
      return {
        color: 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue',
        label: 'Em Progresso',
        icon: FiTrendingUp,
      };
    }

    return {
      color: 'bg-accent-yellow/10 border-accent-yellow/30 text-accent-yellow',
      label: 'Pendente',
      icon: FiClock,
    };
  };

  // Handle modal
  const openModal = useCallback((assignment: (typeof assignments)[0]) => {
    setSelectedAssignment(assignment);
    setProgressValue(assignment.progress || 0);
    setActualTime(
      assignment.actualTime ? assignment.actualTime.toString() : ''
    );
    setStudentNotes(assignment.studentNotes || '');
    setStudentRating(assignment.studentRating || 0);
    setModalTab('details');
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedAssignment(null);
    setModalTab('details');
  }, []);

  // Handle complete assignment
  const handleCompleteAssignment = useCallback(async () => {
    if (!selectedAssignment) return;

    const success = await completeAssignment(
      selectedAssignment.id,
      studentNotes,
      studentRating || undefined
    );

    if (success) {
      closeModal();
    }
  }, [
    selectedAssignment,
    studentNotes,
    studentRating,
    completeAssignment,
    closeModal,
  ]);

  // Handle progress update
  const handleProgressUpdate = useCallback(async () => {
    if (!selectedAssignment) return;

    const success = await updateProgress(
      selectedAssignment.id,
      progressValue,
      actualTime ? parseInt(actualTime) : undefined
    );

    if (success) {
      setSelectedAssignment((prev) =>
        prev
          ? {
              ...prev,
              progress: progressValue,
              actualTime: actualTime ? parseInt(actualTime) : prev.actualTime,
            }
          : null
      );
    }
  }, [selectedAssignment, progressValue, actualTime, updateProgress]);

  // Error state para "no teachers"
  if (errorMessage === 'no_teachers') {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiUser className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              Nenhum Professor Vinculado
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              Você ainda não tem professores vinculados à sua conta. Entre em
              contato com um professor para receber suas primeiras tarefas.
            </p>
            <Link href="/student" className="btn-classical-primary">
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Error state geral
  if ((error || errorMessage) && displayAssignments.length === 0) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiClipboard className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              Erro ao Carregar Tarefas
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {error || errorMessage}
            </p>
            <div className="space-y-3">
              <button
                onClick={refreshAssignments}
                disabled={loading.assignments}
                className="btn-classical-primary flex items-center space-x-2 w-full justify-center"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${
                    loading.assignments ? 'animate-spin' : ''
                  }`}
                />
                <span>
                  {loading.assignments ? 'Carregando...' : 'Tentar Novamente'}
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
                <FiClipboard className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Minhas Tarefas
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Acompanhe suas tarefas musicais e marque seu progresso
            </p>
          </div>
        </AnimatedItem>

        {/* Stats Cards */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiClipboard className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {displayStats.total}
              </div>
              <div className="text-sm text-theme-tertiary">Total</div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-yellow to-accent-orange rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiClock className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {displayStats.pending}
              </div>
              <div className="text-sm text-theme-tertiary">Pendentes</div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiTrendingUp className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {displayStats.inProgress}
              </div>
              <div className="text-sm text-theme-tertiary">Em Progresso</div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiCheck className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {displayStats.completed}
              </div>
              <div className="text-sm text-theme-tertiary">Concluídas</div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-red to-accent-purple rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiAlertTriangle className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {displayStats.overdue}
              </div>
              <div className="text-sm text-theme-tertiary">Atrasadas</div>
            </AnimatedCard>
          </div>
        </AnimatedItem>

        {/* Search and Filters */}
        <AnimatedItem direction="up" springType="gentle">
          <AnimatedCard hover="none" className="classical-card p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
                <input
                  type="text"
                  placeholder="Buscar tarefas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-classical pl-10 w-full"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn-classical-secondary flex items-center space-x-2 ${
                    showFilters ? 'bg-brand-primary/10 text-brand-primary' : ''
                  }`}
                >
                  <FiFilter className="w-4 h-4" />
                  <span>Filtros</span>
                </button>

                <button
                  onClick={refreshAssignments}
                  disabled={loading.assignments}
                  className="btn-classical-secondary flex items-center space-x-2"
                >
                  <FiRefreshCw
                    className={`w-4 h-4 ${
                      loading.assignments ? 'animate-spin' : ''
                    }`}
                  />
                  <span>Atualizar</span>
                </button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-theme-secondary grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-tertiary mb-2">
                    Professor
                  </label>
                  <Select
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                    options={[
                      { value: 'all', label: 'Todos os professores' },
                      ...teachersOptions.map((teacher) => ({
                        value: teacher.teacherId,
                        label: teacher.teacherName,
                      })),
                    ]}
                    className="input-classical w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-tertiary mb-2">
                    Status
                  </label>
                  <Select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as AssignmentFilter)
                    }
                    options={[
                      { value: 'all', label: 'Todos os status' },
                      { value: 'pending', label: 'Pendentes' },
                      { value: 'in_progress', label: 'Em Progresso' },
                      { value: 'completed', label: 'Concluídas' },
                      { value: 'overdue', label: 'Atrasadas' },
                    ]}
                    className="input-classical w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-tertiary mb-2">
                    Período
                  </label>
                  <Select
                    value={timeFilter}
                    onChange={(e) =>
                      setTimeFilter(e.target.value as TimeFilter)
                    }
                    options={[
                      { value: 'all', label: 'Todos os períodos' },
                      { value: 'today', label: 'Para hoje' },
                      { value: 'this_week', label: 'Esta semana' },
                      { value: 'overdue', label: 'Atrasadas' },
                      { value: 'upcoming', label: 'Futuras' },
                    ]}
                    className="input-classical w-full"
                  />
                </div>
              </div>
            )}
          </AnimatedCard>
        </AnimatedItem>

        {/* Results Info */}
        {filteredAssignments.length !== displayAssignments.length && (
          <AnimatedItem direction="up" springType="gentle">
            <div className="mb-6">
              <p className="text-theme-secondary text-sm">
                Mostrando {filteredAssignments.length} de{' '}
                {displayAssignments.length} tarefas
                {searchTerm && ` para "${searchTerm}"`}
              </p>
            </div>
          </AnimatedItem>
        )}

        {/* Assignments Grid */}
        <AnimatedItem direction="up" springType="gentle">
          {paginatedAssignments.length === 0 ? (
            <div className="text-center py-12">
              <FiClipboard className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
              <h3 className="text-lg font-bold text-theme-primary mb-2">
                {filteredAssignments.length === 0 &&
                displayAssignments.length > 0
                  ? 'Nenhuma tarefa encontrada'
                  : 'Nenhuma tarefa disponível'}
              </h3>
              <p className="text-theme-tertiary">
                {filteredAssignments.length === 0 &&
                displayAssignments.length > 0
                  ? 'Tente ajustar os filtros para ver mais resultados.'
                  : 'Suas tarefas aparecerão aqui quando forem criadas pelos professores.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedAssignments.map((assignment, index) => {
                const statusInfo = getAssignmentStatusInfo(assignment);
                const StatusIcon = statusInfo.icon;
                const TypeIcon =
                  typeIcons[assignment.type as keyof typeof typeIcons] ||
                  FiTarget;
                const priorityColor =
                  priorityColors[
                    assignment.priority as keyof typeof priorityColors
                  ] || 'text-theme-secondary';

                return (
                  <AnimatedCard
                    key={assignment.id}
                    hover="lift"
                    className={`classical-card p-6 relative cursor-pointer ${
                      assignment.isOverdue ? 'ring-2 ring-accent-red/30' : ''
                    }`}
                    delay={index * 0.1}
                    onClick={() => openModal(assignment)}
                  >
                    {/* Status and Priority */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
                      >
                        <StatusIcon className="w-3 h-3 inline mr-1" />
                        {statusInfo.label}
                      </span>
                      <div className="flex items-center space-x-2">
                        <TypeIcon className={`w-4 h-4 ${priorityColor}`} />
                        <span
                          className={`text-xs font-medium ${priorityColor}`}
                        >
                          {assignment.priority === 'high'
                            ? 'Alta'
                            : assignment.priority === 'medium'
                            ? 'Média'
                            : 'Baixa'}
                        </span>
                      </div>
                    </div>

                    {/* Assignment Info */}
                    <h3 className="font-bold text-theme-primary mb-2 line-clamp-2">
                      {assignment.title}
                    </h3>

                    <p className="text-sm text-theme-secondary mb-4 line-clamp-2">
                      {assignment.description}
                    </p>

                    {/* Meta Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-theme-secondary">
                        <FiUser className="w-4 h-4 mr-2" />
                        {assignment.lesson.teacher.name}
                      </div>

                      {assignment.dueDate && (
                        <div className="flex items-center text-sm text-theme-secondary">
                          <FiCalendar className="w-4 h-4 mr-2" />
                          Prazo: {formatDate(assignment.dueDate)}
                          {assignment.daysUntilDue !== null && (
                            <span
                              className={`ml-1 font-medium ${
                                assignment.daysUntilDue &&
                                assignment.daysUntilDue < 0
                                  ? 'text-accent-red'
                                  : assignment.daysUntilDue &&
                                    assignment.daysUntilDue <= 2
                                  ? 'text-accent-yellow'
                                  : 'text-theme-secondary'
                              }`}
                            >
                              (
                              {assignment.daysUntilDue &&
                              assignment.daysUntilDue < 0
                                ? `${Math.abs(
                                    assignment.daysUntilDue &&
                                      assignment.daysUntilDue
                                  )} dias atrás`
                                : assignment.daysUntilDue === 0
                                ? 'hoje'
                                : `${assignment.daysUntilDue} dias`}
                              )
                            </span>
                          )}
                        </div>
                      )}

                      {assignment.estimatedTime && (
                        <div className="flex items-center text-sm text-theme-secondary">
                          <FiClock className="w-4 h-4 mr-2" />
                          {formatTime(assignment.estimatedTime)} estimado
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {assignment.progress !== null &&
                      assignment.progress !== undefined && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-theme-tertiary">
                              Progresso
                            </span>
                            <span className="text-xs text-theme-primary">
                              {assignment.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-theme-secondary/20 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                assignment.progress >= 100
                                  ? 'bg-accent-green'
                                  : assignment.progress >= 50
                                  ? 'bg-accent-blue'
                                  : 'bg-accent-yellow'
                              }`}
                              style={{
                                width: `${Math.min(assignment.progress, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                    {/* Goals Preview */}
                    {assignment.practiceGoals.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs text-theme-tertiary mb-1">
                          Objetivos:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {assignment.practiceGoals
                            .slice(0, 2)
                            .map((goal, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-accent-blue/10 text-accent-blue text-xs rounded line-clamp-1"
                              >
                                {goal}
                              </span>
                            ))}
                          {assignment.practiceGoals.length > 2 && (
                            <span className="text-xs text-theme-tertiary">
                              +{assignment.practiceGoals.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Indicator */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-theme-tertiary">
                        Criado em {formatDate(assignment.createdAt)}
                      </div>
                      <FiEye className="w-4 h-4 text-brand-primary" />
                    </div>
                  </AnimatedCard>
                );
              })}
            </div>
          )}
        </AnimatedItem>

        {/* Pagination */}
        {totalPages > 1 && (
          <AnimatedItem direction="up" springType="gentle">
            <div className="flex items-center justify-center space-x-4 mt-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-classical-secondary flex items-center space-x-2 disabled:opacity-50"
              >
                <FiChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    const distance = Math.abs(page - currentPage);
                    return distance <= 2 || page === 1 || page === totalPages;
                  })
                  .map((page, index, array) => {
                    const prevPage = array[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <div key={page} className="flex items-center">
                        {showEllipsis && (
                          <span className="px-2 text-theme-tertiary">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all ${
                            currentPage === page
                              ? 'bg-brand-primary text-theme-primary'
                              : 'text-theme-secondary hover:bg-theme-elevated'
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="btn-classical-secondary flex items-center space-x-2 disabled:opacity-50"
              >
                <span>Próxima</span>
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </AnimatedItem>
        )}

        {/* Modal */}
        {showModal && selectedAssignment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="classical-card max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-theme-secondary">
                <div>
                  <h2 className="text-2xl font-bold text-theme-primary">
                    {selectedAssignment.title}
                  </h2>
                  <p className="text-theme-secondary">
                    {selectedAssignment.lesson.teacher.name} •{' '}
                    {selectedAssignment.type}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 rounded-lg bg-theme-secondary/20 flex items-center justify-center hover:bg-theme-secondary/40 transition-colors"
                >
                  <FiX className="w-5 h-5 text-theme-primary" />
                </button>
              </div>

              {/* Modal Tabs */}
              <div className="flex border-b border-theme-secondary">
                {[
                  { id: 'details', label: 'Detalhes', icon: FiEye },
                  { id: 'progress', label: 'Progresso', icon: FiTrendingUp },
                  { id: 'submit', label: 'Entrega', icon: FiUpload },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setModalTab(id as any)}
                    className={`px-6 py-3 font-medium transition-all flex items-center space-x-2 ${
                      modalTab === id
                        ? 'bg-brand-primary/10 text-brand-primary border-b-2 border-brand-primary'
                        : 'text-theme-secondary hover:text-theme-primary'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Details Tab */}
                {modalTab === 'details' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-theme-primary mb-2">
                        Descrição
                      </h3>
                      <p className="text-theme-secondary">
                        {selectedAssignment.description}
                      </p>
                    </div>

                    {selectedAssignment.practiceGoals.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-theme-primary mb-2">
                          Objetivos de Prática
                        </h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {selectedAssignment.practiceGoals.map((goal, idx) => (
                            <li key={idx} className="text-theme-secondary">
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedAssignment.technicalGoals.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-theme-primary mb-2">
                          Objetivos Técnicos
                        </h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {selectedAssignment.technicalGoals.map(
                            (goal, idx) => (
                              <li key={idx} className="text-theme-secondary">
                                {goal}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {selectedAssignment.exercises.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-theme-primary mb-2">
                          Exercícios
                        </h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {selectedAssignment.exercises.map((exercise, idx) => (
                            <li key={idx} className="text-theme-secondary">
                              {exercise}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 p-4 bg-theme-secondary/5 rounded-lg">
                      <div>
                        <span className="text-theme-tertiary">Status:</span>
                        <div className="font-medium text-theme-primary">
                          {getAssignmentStatusInfo(selectedAssignment).label}
                        </div>
                      </div>
                      <div>
                        <span className="text-theme-tertiary">Prioridade:</span>
                        <div
                          className={`font-medium ${
                            priorityColors[
                              selectedAssignment.priority as keyof typeof priorityColors
                            ]
                          }`}
                        >
                          {selectedAssignment.priority === 'high'
                            ? 'Alta'
                            : selectedAssignment.priority === 'medium'
                            ? 'Média'
                            : 'Baixa'}
                        </div>
                      </div>
                      {selectedAssignment.dueDate && (
                        <div>
                          <span className="text-theme-tertiary">Prazo:</span>
                          <div className="font-medium text-theme-primary">
                            {formatDate(selectedAssignment.dueDate)}
                          </div>
                        </div>
                      )}
                      {selectedAssignment.estimatedTime && (
                        <div>
                          <span className="text-theme-tertiary">
                            Tempo Estimado:
                          </span>
                          <div className="font-medium text-theme-primary">
                            {formatTime(selectedAssignment.estimatedTime)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Progress Tab */}
                {modalTab === 'progress' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-theme-primary mb-4">
                        Atualizar Progresso
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-theme-primary mb-2">
                            Progresso ({progressValue}%)
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={progressValue}
                            onChange={(e) =>
                              setProgressValue(parseInt(e.target.value))
                            }
                            className="w-full h-2 bg-theme-secondary/20 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-theme-tertiary mt-1">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-theme-primary mb-2">
                            Tempo Gasto (minutos)
                          </label>
                          <Input
                            type="number"
                            value={actualTime}
                            onChange={(e) => setActualTime(e.target.value)}
                            className="input-classical w-full"
                            placeholder="Ex: 30"
                          />
                        </div>

                        <button
                          onClick={handleProgressUpdate}
                          disabled={loading.updateAssignment}
                          className="btn-classical-primary flex items-center space-x-2"
                        >
                          {loading.updateAssignment ? (
                            <FiRefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <FiTrendingUp className="w-4 h-4" />
                          )}
                          <span>Atualizar Progresso</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Tab */}
                {modalTab === 'submit' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-theme-primary mb-4">
                        Entrega da Tarefa
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-theme-primary mb-2">
                            Suas Anotações
                          </label>
                          <textarea
                            value={studentNotes}
                            onChange={(e) => setStudentNotes(e.target.value)}
                            rows={4}
                            className="input-classical w-full"
                            placeholder="Conte como foi sua experiência com esta tarefa, dificuldades encontradas, etc."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-theme-primary mb-2">
                            Avaliação da Dificuldade (1-5 estrelas)
                          </label>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setStudentRating(star)}
                                className={`text-2xl transition-colors ${
                                  star <= studentRating
                                    ? 'text-accent-yellow'
                                    : 'text-theme-tertiary'
                                }`}
                              >
                                <FiStar
                                  className="w-6 h-6"
                                  fill={
                                    star <= studentRating
                                      ? 'currentColor'
                                      : 'none'
                                  }
                                />
                              </button>
                            ))}
                            <span className="ml-2 text-sm text-theme-secondary">
                              {studentRating === 0
                                ? 'Não avaliado'
                                : studentRating === 1
                                ? 'Muito fácil'
                                : studentRating === 2
                                ? 'Fácil'
                                : studentRating === 3
                                ? 'Médio'
                                : studentRating === 4
                                ? 'Difícil'
                                : 'Muito difícil'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {!selectedAssignment.isCompleted && (
                            <button
                              onClick={handleCompleteAssignment}
                              disabled={loading.updateAssignment}
                              className="btn-classical-primary flex items-center space-x-2"
                            >
                              {loading.updateAssignment ? (
                                <FiRefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <FiCheck className="w-4 h-4" />
                              )}
                              <span>Marcar como Concluída</span>
                            </button>
                          )}

                          {selectedAssignment.isCompleted && (
                            <div className="flex items-center space-x-2 text-accent-green">
                              <FiCheck className="w-5 h-5" />
                              <span className="font-medium">
                                Tarefa Concluída
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatedContainer>
    </PageContainer>
  );
}
