// app/teacher/assignments/pageClient.tsx - Client Component para Tarefas do Professor
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  FiClipboard,
  FiPlus,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiClock,
  FiUser,
  FiEye,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiRefreshCw,
  FiTarget,
  FiBookOpen,
  FiMusic,
  FiStar,
  FiPlay,
  FiCheckCircle,
  FiEdit,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
  SequentialGrid,
} from '../../../components/animation/AnimatedComponents';
import { TeacherAssignmentsData, TeacherAssignment } from './pageServer';
import Image from 'next/image';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import { useTeacherAssignments } from '@/app/hooks/lessonsSystem/useTeacherAssignments';
import Modal from '@/app/components/Modal';
import Link from 'next/link';
import Button from '@/app/components/Common/Button';

interface TeacherAssignmentsPageClientProps {
  initialData: TeacherAssignmentsData;
  errorMessage?: string;
}

type AssignmentFilter =
  | 'all'
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'overdue'
  | 'today';
type SortOption = 'due_date' | 'created' | 'student' | 'priority' | 'progress';

const filterOptions = [
  { value: 'all', label: 'Todos Status' },
  { value: 'today', label: 'Vence Hoje' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'completed', label: 'Concluídas' },
  { value: 'overdue', label: 'Atrasadas' },
];

const sortOptions = [
  { value: 'due_date', label: 'Por Prazo' },
  { value: 'priority', label: 'Por Prioridade' },
  { value: 'created', label: 'Mais Recentes' },
  { value: 'student', label: 'Por Aluno' },
  { value: 'progress', label: 'Por Progresso' },
];

const ASSIGNMENT_TYPES = {
  practice: 'Prática',
  theory: 'Teoria',
  listening: 'Escuta',
  composition: 'Composição',
  performance: 'Performance',
  reading: 'Leitura',
};

const PRIORITY_COLORS = {
  low: 'bg-accent-green/10 border-accent-green/30 text-accent-green',
  medium: 'bg-accent-yellow/10 border-accent-yellow/30 text-accent-yellow',
  high: 'bg-accent-red/10 border-accent-red/30 text-accent-red',
};

const PRIORITY_LABELS = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

const priorityOptions = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
];

export default function TeacherAssignmentsPageClient({
  initialData,
  errorMessage,
}: TeacherAssignmentsPageClientProps) {
  // Initialize hook with server data
  const {
    // State do hook
    assignments,
    stats,
    students,
    pagination,
    loading,
    error,

    // Actions do hook
    refreshAssignments,
    setInitialData,
    createAssignment,
    updateAssignment,

    clearError,
  } = useTeacherAssignments(initialData);

  // Local UI states (não relacionados aos dados das tarefas)
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<AssignmentFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('due_date');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [selectedAssignment, setSelectedAssignment] =
    useState<TeacherAssignment | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Create assignment form
  const [createForm, setCreateForm] = useState({
    lessonId: '',
    studentUserId: '',
    title: '',
    description: '',
    type: 'practice',
    priority: 'medium',
    dueDate: '',
    estimatedTime: 60,
    practiceGoals: [''],
    technicalGoals: [''],
    musicalGoals: [''],
  });

  // Initialize hook data on mount
  useEffect(() => {
    if (initialData && initialData.assignments.length > 0) {
      setInitialData(initialData);
    }
  }, [initialData, setInitialData]);

  // Filter and sort assignments
  const filteredAndSortedAssignments = useMemo(() => {
    let filtered = [...assignments];
    const now = new Date();
    const today = now.toDateString();

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(
        (assignment) =>
          assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          assignment.student.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply student filter
    if (selectedStudent !== 'all') {
      filtered = filtered.filter(
        (assignment) => assignment.student.id === selectedStudent
      );
    }

    // Apply status filter
    switch (filter) {
      case 'pending':
        filtered = filtered.filter(
          (assignment) => assignment.status === 'PENDING'
        );
        break;
      case 'in_progress':
        filtered = filtered.filter(
          (assignment) => assignment.status === 'IN_PROGRESS'
        );
        break;
      case 'completed':
        filtered = filtered.filter((assignment) => assignment.isCompleted);
        break;
      case 'overdue':
        filtered = filtered.filter((assignment) => assignment.isOverdue);
        break;
      case 'today':
        filtered = filtered.filter(
          (assignment) =>
            assignment.dueDate &&
            new Date(assignment.dueDate).toDateString() === today
        );
        break;
      default:
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'due_date':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'created':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'student':
          return a.student.name.localeCompare(b.student.name);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (
            (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
            (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
          );
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [assignments, searchTerm, filter, selectedStudent, sortBy]);

  // Helper functions
  const formatDueDate = (dueDate: Date | string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays === -1) return 'Ontem';
    if (diffDays < 0) return `${Math.abs(diffDays)} dias atrás`;
    if (diffDays <= 7) return `Em ${diffDays} dias`;

    return date.toLocaleDateString('pt-BR');
  };

  const getStatusColor = (assignment: TeacherAssignment) => {
    if (assignment.isOverdue)
      return 'bg-accent-red/10 border-accent-red/30 text-accent-red';
    if (assignment.isCompleted)
      return 'bg-accent-green/10 border-accent-green/30 text-accent-green';
    if (assignment.status === 'IN_PROGRESS')
      return 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue';
    return 'bg-accent-yellow/10 border-accent-yellow/30 text-accent-yellow';
  };

  const getStatusText = (assignment: TeacherAssignment) => {
    if (assignment.isOverdue) return 'Atrasada';
    if (assignment.isCompleted) return 'Concluída';
    if (assignment.status === 'IN_PROGRESS') return 'Em Andamento';
    return 'Pendente';
  };

  const getStatusIcon = (assignment: TeacherAssignment) => {
    if (assignment.isOverdue) return <FiAlertCircle className="w-4 h-4" />;
    if (assignment.isCompleted) return <FiCheckCircle className="w-4 h-4" />;
    if (assignment.status === 'IN_PROGRESS')
      return <FiPlay className="w-4 h-4" />;
    return <FiClock className="w-4 h-4" />;
  };

  // Actions using hook
  const handleCreateAssignment = useCallback(async () => {
    if (
      !createForm.title ||
      !createForm.description ||
      !createForm.studentUserId
    ) {
      return;
    }

    const success = await createAssignment(createForm);

    if (success) {
      setShowCreateModal(false);
      setCreateForm({
        lessonId: '',
        studentUserId: '',
        title: '',
        description: '',
        type: 'practice',
        priority: 'medium',
        dueDate: '',
        estimatedTime: 60,
        practiceGoals: [''],
        technicalGoals: [''],
        musicalGoals: [''],
      });
      console.log('Tarefa criada com sucesso!');
    }
  }, [createForm, createAssignment]);

  const updateAssignmentStatus = useCallback(
    async (assignmentId: string, updates: any) => {
      setActionLoading(assignmentId);
      try {
        const success = await updateAssignment(assignmentId, updates);
        if (success) {
          console.log('Tarefa atualizada com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao atualizar tarefa:', error);
      } finally {
        setActionLoading(null);
      }
    },
    [updateAssignment]
  );

  // Render error state
  if ((error || errorMessage) && assignments.length === 0) {
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
              Gerenciar Tarefas
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Crie, acompanhe e gerencie todas as tarefas dos seus alunos
            </p>
          </div>
        </AnimatedItem>

        {/* Stats Cards */}
        <AnimatedItem direction="up" springType="gentle">
          <SequentialGrid
            cols={5}
            gap={6}
            delayBetweenItems={0.1}
            className="mb-8"
          >
            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiClipboard className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.total}
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
                {stats.pending}
              </div>
              <div className="text-sm text-theme-tertiary">Pendentes</div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiPlay className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.inProgress}
              </div>
              <div className="text-sm text-theme-tertiary">Em Andamento</div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiCheckCircle className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.completed}
              </div>
              <div className="text-sm text-theme-tertiary">Concluídas</div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-red to-accent-purple rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiAlertCircle className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.overdue}
              </div>
              <div className="text-sm text-theme-tertiary">Atrasadas</div>
            </AnimatedCard>
          </SequentialGrid>
        </AnimatedItem>

        {/* Controls */}
        <AnimatedItem direction="up" springType="gentle">
          <AnimatedCard hover="none" className="classical-card p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Buscar tarefas, alunos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-classical-2 pl-10 w-full"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary hover:text-theme-primary transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Student Filter */}
                <Select
                  options={[
                    { value: 'all', label: 'Todos os Alunos' },
                    ...students.map((student) => ({
                      label: student.name,
                      value: student.id,
                    })),
                  ]}
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="input-classical-2 w-auto min-w-48"
                />
                {/* Status Filter */}
                <Select
                  options={filterOptions}
                  value={filter}
                  onChange={(e) =>
                    setFilter(e.target.value as AssignmentFilter)
                  }
                  className="input-classical-2 w-auto min-w-40"
                />

                {/* Sort */}
                <Select
                  options={sortOptions}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="input-classical-2 w-auto min-w-40"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={refreshAssignments}
                  disabled={loading.assignments}
                  className="w-10 h-10 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group"
                >
                  <FiRefreshCw
                    className={`w-4 h-4 text-theme-tertiary group-hover:text-brand-primary transition-all ${
                      loading.assignments ? 'animate-spin' : ''
                    }`}
                  />
                </button>

                <Link href={'assignments/create'}>
                  <Button variant="primary">
                    <span>Nova Tarefa</span>
                  </Button>
                </Link>
                {/* 
                <Button
                  onClick={() => setShowCreateModal(true)}
                  variant="outline"
                >
                  <span>Nova Tarefa Rápida</span>
                </Button> */}
              </div>
            </div>

            {/* Filter Summary */}
            {(searchTerm || filter !== 'all' || selectedStudent !== 'all') && (
              <div className="flex items-center justify-between pt-4 border-t border-theme-secondary mt-4">
                <div className="flex items-center space-x-2 text-sm text-theme-secondary">
                  <FiFilter className="w-4 h-4" />
                  <span>
                    Mostrando {filteredAndSortedAssignments.length} de{' '}
                    {assignments.length} tarefas
                  </span>
                  {searchTerm && (
                    <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary rounded">
                      &quot;{searchTerm}&quot;
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilter('all');
                    setSelectedStudent('all');
                    setSortBy('due_date');
                  }}
                  className="text-sm text-theme-tertiary hover:text-theme-primary transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            )}
          </AnimatedCard>
        </AnimatedItem>

        {/* Loading State */}
        {loading.assignments && (
          <AnimatedItem direction="up" springType="gentle">
            <div className="text-center py-8">
              <FiRefreshCw className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-4" />
              <p className="text-theme-secondary">Carregando tarefas...</p>
            </div>
          </AnimatedItem>
        )}

        {/* Assignments List */}
        {!loading.assignments && (
          <AnimatedItem direction="up" springType="gentle">
            <div className="space-y-4">
              {filteredAndSortedAssignments.length === 0 ? (
                <AnimatedCard hover="none" className="classical-card">
                  <div className="text-center py-16">
                    <FiClipboard className="w-16 h-16 text-theme-tertiary mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-theme-primary mb-4">
                      {searchTerm ||
                      filter !== 'all' ||
                      selectedStudent !== 'all'
                        ? 'Nenhuma tarefa encontrada'
                        : 'Nenhuma tarefa cadastrada'}
                    </h3>
                    <p className="text-theme-tertiary mb-6">
                      {searchTerm ||
                      filter !== 'all' ||
                      selectedStudent !== 'all'
                        ? 'Tente ajustar os filtros para encontrar suas tarefas'
                        : 'Comece criando sua primeira tarefa para acompanhar o progresso dos alunos'}
                    </p>
                    {searchTerm ||
                    filter !== 'all' ||
                    selectedStudent !== 'all' ? (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setFilter('all');
                          setSelectedStudent('all');
                        }}
                        className="btn-classical-secondary"
                      >
                        Limpar Filtros
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-classical-primary"
                      >
                        Criar Primeira Tarefa
                      </button>
                    )}
                  </div>
                </AnimatedCard>
              ) : (
                filteredAndSortedAssignments.map((assignment, index) => (
                  <AnimatedCard
                    key={assignment.id}
                    hover="lift"
                    className="classical-card"
                    delay={index * 0.05}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start space-x-4">
                            {/* Student Avatar */}
                            <div className="flex-shrink-0">
                              {assignment.student.image ? (
                                <div className="w-12 h-12 relative rounded-full overflow-hidden">
                                  <Image
                                    src={assignment.student.image}
                                    alt={assignment.student.name}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center">
                                  <FiUser className="w-6 h-6 text-theme-primary" />
                                </div>
                              )}
                            </div>

                            {/* Assignment Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="font-bold text-lg text-theme-primary classical-title truncate">
                                    {assignment.title}
                                  </h3>
                                  <div className="flex items-center space-x-4 text-sm text-theme-secondary mt-1">
                                    <div className="flex items-center space-x-1">
                                      <FiUser className="w-4 h-4" />
                                      <span>{assignment.student.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <FiBookOpen className="w-4 h-4" />
                                      <span>
                                        {ASSIGNMENT_TYPES[
                                          assignment.type as keyof typeof ASSIGNMENT_TYPES
                                        ] || assignment.type}
                                      </span>
                                    </div>
                                    {assignment.dueDate && (
                                      <div className="flex items-center space-x-1">
                                        <FiCalendar className="w-4 h-4" />
                                        <span>
                                          {formatDueDate(assignment.dueDate)}
                                        </span>
                                      </div>
                                    )}
                                    {assignment.estimatedTime && (
                                      <div className="flex items-center space-x-1">
                                        <FiClock className="w-4 h-4" />
                                        <span>
                                          {assignment.estimatedTime}min
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                  <span
                                    className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${getStatusColor(
                                      assignment
                                    )}`}
                                  >
                                    {getStatusIcon(assignment)}
                                    <span>{getStatusText(assignment)}</span>
                                  </span>

                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium border ${
                                      PRIORITY_COLORS[
                                        assignment.priority as keyof typeof PRIORITY_COLORS
                                      ]
                                    }`}
                                  >
                                    {
                                      PRIORITY_LABELS[
                                        assignment.priority as keyof typeof PRIORITY_LABELS
                                      ]
                                    }
                                  </span>
                                </div>
                              </div>

                              {/* Description */}
                              <p className="text-theme-secondary text-sm mb-4 line-clamp-2">
                                {assignment.description}
                              </p>

                              {/* Progress Bar */}
                              {assignment.progress !== undefined && (
                                <div className="mb-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-theme-tertiary">
                                      Progresso
                                    </span>
                                    <span className="text-sm font-medium text-theme-primary">
                                      {assignment.progress}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-theme-secondary rounded-full h-2">
                                    <div
                                      className="progress-bar h-2 rounded-full transition-all duration-300"
                                      style={{
                                        width: `${assignment.progress}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Goals */}
                              <div className="flex flex-wrap gap-2 mb-4">
                                {assignment.practiceGoals
                                  .slice(0, 2)
                                  .map((goal, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded text-xs flex items-center space-x-1"
                                    >
                                      <FiTarget className="w-3 h-3" />
                                      <span>{goal}</span>
                                    </span>
                                  ))}
                                {assignment.technicalGoals
                                  .slice(0, 1)
                                  .map((goal, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded text-xs flex items-center space-x-1"
                                    >
                                      <FiMusic className="w-3 h-3" />
                                      <span>{goal}</span>
                                    </span>
                                  ))}
                                {assignment.practiceGoals.length +
                                  assignment.technicalGoals.length +
                                  assignment.musicalGoals.length >
                                  3 && (
                                  <span className="text-xs text-theme-tertiary">
                                    +
                                    {assignment.practiceGoals.length +
                                      assignment.technicalGoals.length +
                                      assignment.musicalGoals.length -
                                      3}{' '}
                                    mais
                                  </span>
                                )}
                              </div>

                              {/* Stats */}
                              <div className="flex items-center space-x-6 text-sm text-theme-tertiary">
                                <div className="flex items-center space-x-1">
                                  <FiCalendar className="w-4 h-4" />
                                  <span>
                                    Criada{' '}
                                    {new Date(
                                      assignment.createdAt
                                    ).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                                {assignment.completedAt && (
                                  <div className="flex items-center space-x-1">
                                    <FiCheck className="w-4 h-4" />
                                    <span>
                                      Concluída{' '}
                                      {new Date(
                                        assignment.completedAt
                                      ).toLocaleDateString('pt-BR')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowAssignmentModal(true);
                            }}
                            className="w-8 h-8 rounded-lg bg-theme-elevated hover:bg-interactive-hover transition-colors flex items-center justify-center group"
                          >
                            <FiEye className="w-4 h-4 text-theme-tertiary group-hover:text-brand-primary transition-colors" />
                          </button>

                          <Link href={`assignments/${assignment.id}/edit`}>
                            <button className="w-8 h-8 rounded-lg bg-theme-elevated hover:bg-interactive-hover transition-colors flex items-center justify-center group">
                              <FiEdit className="w-4 h-4 text-theme-tertiary group-hover:text-brand-primary transition-colors" />
                            </button>
                          </Link>

                          {/* Status Actions */}
                          {!assignment.isCompleted && (
                            <button
                              onClick={() =>
                                updateAssignmentStatus(assignment.id, {
                                  teacherFeedback: 'Aprovada pelo professor',
                                  teacherRating: 5,
                                  isCompleted: true,
                                  status: 'COMPLETED',
                                })
                              }
                              disabled={actionLoading === assignment.id}
                              className="w-8 h-8 rounded-lg bg-accent-green/10 hover:bg-accent-green/20 transition-colors flex items-center justify-center group"
                              title="Aprovar Tarefa"
                            >
                              {actionLoading === assignment.id ? (
                                <FiRefreshCw className="w-4 h-4 text-accent-green animate-spin" />
                              ) : (
                                <FiCheck className="w-4 h-4 text-accent-green" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                ))
              )}
            </div>
          </AnimatedItem>
        )}

        {/* Load More */}
        {pagination.hasMore && (
          <AnimatedItem direction="up" springType="gentle">
            <div className="text-center mt-8">
              <button
                onClick={() => {
                  // TODO: Implement load more using hook
                }}
                disabled={loading.assignments}
                className="btn-classical-secondary flex items-center space-x-2"
              >
                {loading.assignments ? (
                  <FiRefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <FiPlus className="w-4 h-4" />
                )}
                <span>Carregar Mais Tarefas</span>
              </button>
            </div>
          </AnimatedItem>
        )}
      </AnimatedContainer>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <CreateAssignmentModal
          students={students}
          createForm={createForm}
          setCreateForm={setCreateForm}
          onSubmit={handleCreateAssignment}
          onClose={() => setShowCreateModal(false)}
          loading={loading.createAssignment}
        />
      )}

      {/* Assignment Details Modal */}
      {showAssignmentModal && selectedAssignment && (
        <AssignmentDetailsModal
          assignment={selectedAssignment}
          onClose={() => {
            setShowAssignmentModal(false);
            setSelectedAssignment(null);
          }}
          onUpdate={updateAssignmentStatus}
          actionLoading={actionLoading}
        />
      )}
    </PageContainer>
  );
}

// Create Assignment Modal Component (unchanged but simplified)
interface CreateAssignmentModalProps {
  students: Array<{
    id: string;
    name: string;
    image?: string | null;
    level: string;
  }>;
  createForm: any;
  setCreateForm: (form: any) => void;
  onSubmit: () => void;
  onClose: () => void;
  loading: boolean;
}

function CreateAssignmentModal({
  students,
  createForm,
  setCreateForm,
  onSubmit,
  onClose,
  loading,
}: CreateAssignmentModalProps) {
  const addGoal = (field: string) => {
    setCreateForm((prev: any) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const updateGoal = (field: string, index: number, value: string) => {
    setCreateForm((prev: any) => ({
      ...prev,
      [field]: prev[field].map((goal: string, i: number) =>
        i === index ? value : goal
      ),
    }));
  };

  const removeGoal = (field: string, index: number) => {
    setCreateForm((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index),
    }));
  };

  return (
    <Modal maxWidth="4xl" isOpen onClose={onClose}>
      <AnimatedCard hover="none">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-theme-primary classical-title">
              Nova Tarefa
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-theme-elevated hover:bg-interactive-hover transition-colors flex items-center justify-center"
            >
              <FiX className="w-4 h-4 text-theme-tertiary" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Aluno *
                </label>
                <Select
                  options={[
                    { value: '', label: 'Selecione um aluno...' },
                    ...students.map((student) => ({
                      value: student.id,
                      label: student.name,
                    })),
                  ]}
                  value={createForm.studentUserId}
                  onChange={(e) =>
                    setCreateForm((prev: any) => ({
                      ...prev,
                      studentUserId: e.target.value,
                    }))
                  }
                  className="input-classical w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Tipo
                </label>
                <Select
                  options={Object.entries(ASSIGNMENT_TYPES).map(
                    ([key, label]) => ({
                      label: label,
                      value: key,
                    })
                  )}
                  value={createForm.type}
                  onChange={(e) =>
                    setCreateForm((prev: any) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  className="input-classical w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Título *
              </label>
              <Input
                type="text"
                value={createForm.title}
                onChange={(e) =>
                  setCreateForm((prev: any) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="input-classical w-full"
                placeholder="Ex: Praticar escalas de Dó maior"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Descrição *
              </label>
              <textarea
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm((prev: any) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="input-classical w-full"
                placeholder="Descreva detalhadamente o que o aluno deve fazer..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Prioridade
                </label>
                <Select
                  options={priorityOptions}
                  value={createForm.priority}
                  onChange={(e) =>
                    setCreateForm((prev: any) => ({
                      ...prev,
                      priority: e.target.value,
                    }))
                  }
                  className="input-classical w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Prazo
                </label>
                <Input
                  type="date"
                  value={createForm.dueDate}
                  onChange={(e) =>
                    setCreateForm((prev: any) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                  className="input-classical w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Tempo Estimado (min)
                </label>
                <Input
                  type="number"
                  value={createForm.estimatedTime}
                  onChange={(e) =>
                    setCreateForm((prev: any) => ({
                      ...prev,
                      estimatedTime: parseInt(e.target.value) || 0,
                    }))
                  }
                  min={1}
                  className="input-classical w-full"
                />
              </div>
            </div>

            {/* Goals Sections */}
            <div className="space-y-4">
              {/* Practice Goals */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-theme-primary">
                    Objetivos de Prática
                  </label>
                  <button
                    type="button"
                    onClick={() => addGoal('practiceGoals')}
                    className="text-brand-primary hover:text-brand-secondary text-sm flex items-center space-x-1"
                  >
                    <FiPlus className="w-3 h-3" />
                    <span>Adicionar</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {createForm.practiceGoals.map(
                    (goal: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          type="text"
                          value={goal}
                          onChange={(e) =>
                            updateGoal('practiceGoals', index, e.target.value)
                          }
                          className="input-classical flex-1"
                          placeholder="Ex: Tocar em andamento 120 BPM"
                        />
                        {createForm.practiceGoals.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeGoal('practiceGoals', index)}
                            className="text-accent-red"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Technical Goals */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-theme-primary">
                    Objetivos Técnicos
                  </label>
                  <button
                    type="button"
                    onClick={() => addGoal('technicalGoals')}
                    className="text-brand-primary hover:text-brand-secondary text-sm flex items-center space-x-1"
                  >
                    <FiPlus className="w-3 h-3" />
                    <span>Adicionar</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {createForm.technicalGoals.map(
                    (goal: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          type="text"
                          value={goal}
                          onChange={(e) =>
                            updateGoal('technicalGoals', index, e.target.value)
                          }
                          className="input-classical flex-1"
                          placeholder="Ex: Melhorar articulação"
                        />
                        {createForm.technicalGoals.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeGoal('technicalGoals', index)}
                            className="text-accent-red"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-theme-secondary">
              <button
                onClick={onClose}
                disabled={loading}
                className="btn-classical-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={onSubmit}
                disabled={
                  loading ||
                  !createForm.title ||
                  !createForm.description ||
                  !createForm.studentUserId
                }
                className="btn-classical-primary flex items-center space-x-2"
              >
                {loading ? (
                  <FiRefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <FiCheck className="w-4 h-4" />
                )}
                <span>Criar Tarefa</span>
              </button>
            </div>
          </div>
        </div>
      </AnimatedCard>
    </Modal>
  );
}

// Assignment Details Modal Component (simplified)
interface AssignmentDetailsModalProps {
  assignment: TeacherAssignment;
  onClose: () => void;
  onUpdate: (assignmentId: string, updates: any) => Promise<void>;
  actionLoading: string | null;
}

function AssignmentDetailsModal({
  assignment,
  onClose,
  onUpdate,
  actionLoading,
}: AssignmentDetailsModalProps) {
  const [feedback, setFeedback] = useState(assignment.teacherFeedback || '');
  const [rating, setRating] = useState(assignment.teacherRating || 0);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (assignment: TeacherAssignment) => {
    if (assignment.isOverdue)
      return 'bg-accent-red/10 border-accent-red/30 text-accent-red';
    if (assignment.isCompleted)
      return 'bg-accent-green/10 border-accent-green/30 text-accent-green';
    if (assignment.status === 'IN_PROGRESS')
      return 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue';
    return 'bg-accent-yellow/10 border-accent-yellow/30 text-accent-yellow';
  };

  const getStatusText = (assignment: TeacherAssignment) => {
    if (assignment.isOverdue) return 'Atrasada';
    if (assignment.isCompleted) return 'Concluída';
    if (assignment.status === 'IN_PROGRESS') return 'Em Andamento';
    return 'Pendente';
  };

  const saveFeedback = async () => {
    if (feedback.trim()) {
      await onUpdate(assignment.id, {
        teacherFeedback: feedback,
        teacherRating: rating,
      });
    }
  };

  const approveAssignment = async () => {
    await onUpdate(assignment.id, {
      isCompleted: true,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      teacherFeedback: feedback || 'Aprovada pelo professor',
      teacherRating: rating || 5,
    });
  };

  return (
    <Modal isOpen onClose={onClose} maxWidth="4xl">
      <AnimatedCard hover="none">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-theme-primary classical-title">
                {assignment.title}
              </h2>
              <div className="flex items-center space-x-3 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    assignment
                  )}`}
                >
                  {getStatusText(assignment)}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium border ${
                    PRIORITY_COLORS[
                      assignment.priority as keyof typeof PRIORITY_COLORS
                    ]
                  }`}
                >
                  {
                    PRIORITY_LABELS[
                      assignment.priority as keyof typeof PRIORITY_LABELS
                    ]
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="text-sm font-medium text-theme-tertiary block mb-2">
                  Descrição
                </label>
                <div className="text-theme-primary whitespace-pre-wrap">
                  {assignment.description}
                </div>
              </div>

              {/* Teacher Feedback Section */}
              <div>
                <label className="text-sm font-medium text-theme-tertiary block mb-2">
                  Seu Feedback
                </label>
                <div className="space-y-4">
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    className="input-classical w-full"
                    placeholder="Adicione seu feedback sobre o desempenho do aluno..."
                  />

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-theme-tertiary">
                        Avaliação:
                      </span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className={`w-6 h-6 ${
                              star <= rating
                                ? 'text-accent-yellow'
                                : 'text-theme-tertiary'
                            } hover:text-accent-yellow transition-colors`}
                          >
                            <FiStar
                              className={`w-4 h-4 ${
                                star <= rating ? 'fill-current' : ''
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={saveFeedback}
                      disabled={
                        actionLoading === assignment.id || !feedback.trim()
                      }
                      className="btn-classical-secondary text-sm flex items-center space-x-1"
                    >
                      {actionLoading === assignment.id ? (
                        <FiRefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <FiCheck className="w-3 h-3" />
                      )}
                      <span>Salvar Feedback</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Student Info */}
              <div className="classical-card-2 p-4">
                <h3 className="font-bold text-theme-primary mb-4">Aluno</h3>
                <div className="flex items-center space-x-3 mb-4">
                  {assignment.student.image ? (
                    <div className="w-12 h-12 relative rounded-full overflow-hidden">
                      <Image
                        src={assignment.student.image}
                        alt={assignment.student.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center">
                      <FiUser className="w-6 h-6 text-theme-primary" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-theme-primary">
                      {assignment.student.name}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="classical-card-2 p-4">
                <h3 className="font-bold text-theme-primary mb-4">Ações</h3>
                <div className="space-y-4">
                  {!assignment.isCompleted && (
                    <button
                      onClick={approveAssignment}
                      disabled={actionLoading === assignment.id}
                      className="w-full btn-classical-primary flex items-center justify-center space-x-2"
                    >
                      {actionLoading === assignment.id ? (
                        <FiRefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <FiCheck className="w-4 h-4" />
                      )}
                      <span>Aprovar Tarefa</span>
                    </button>
                  )}

                  <Link href={`assignments/${assignment.id}`}>
                    <button
                      disabled={actionLoading === assignment.id}
                      className="w-full btn-classical-secondary flex items-center justify-center space-x-2"
                    >
                      <FiEye className="w-4 h-4" />

                      <span>Ver mais detalhes</span>
                    </button>
                  </Link>
                </div>
              </div>

              {/* Assignment Info */}
              <div className="classical-card-2 p-4">
                <h3 className="font-bold text-theme-primary mb-4">
                  Informações
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">Criado em:</span>
                    <span className="text-theme-primary">
                      {formatDate(assignment.createdAt)}
                    </span>
                  </div>

                  {assignment.estimatedTime && (
                    <div className="flex justify-between">
                      <span className="text-theme-tertiary">
                        Tempo estimado:
                      </span>
                      <span className="text-theme-primary">
                        {assignment.estimatedTime}min
                      </span>
                    </div>
                  )}

                  {assignment.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-theme-tertiary">Concluída em:</span>
                      <span className="text-theme-primary">
                        {formatDate(assignment.completedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedCard>
    </Modal>
  );
}
