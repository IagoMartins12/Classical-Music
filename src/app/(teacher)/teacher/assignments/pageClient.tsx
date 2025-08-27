// app/teacher/assignments/pageClient.tsx - Client Component para Tarefas do Professor - ATUALIZADO COM TRADUÇÕES

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
  FiVideo,
  FiSave,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../components/animation/AnimatedComponents';
import { TeacherAssignmentsData, TeacherAssignment } from './pageServer';
import Image from 'next/image';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import ViewModeToggle, { ViewMode } from '@/app/components/ViewModeToggle';
import { useTeacherAssignments } from '@/app/hooks/lessonsSystem/useTeacherAssignments';
import Modal from '@/app/components/Modal';
import Link from 'next/link';
import Button from '@/app/components/Common/Button';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useToast } from '@/app/hooks/useToast';

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

const ASSIGNMENT_TYPES = {
  practice: 'assignment_type_practice',
  theory: 'assignment_type_theory',
  listening: 'assignment_type_listening',
  composition: 'assignment_type_composition',
  performance: 'assignment_type_performance',
  reading: 'assignment_type_reading',
};

const PRIORITY_COLORS = {
  low: 'bg-accent-green/10 border-accent-green/30 text-accent-green',
  medium: 'bg-accent-yellow/10 border-accent-yellow/30 text-accent-yellow',
  high: 'bg-accent-red/10 border-accent-red/30 text-accent-red',
};

const PRIORITY_LABELS = {
  low: 'priority_low',
  medium: 'priority_medium',
  high: 'priority_high',
};

export default function TeacherAssignmentsPageClient({
  initialData,
  errorMessage,
}: TeacherAssignmentsPageClientProps) {
  const { t } = useTranslation({ sections: ['teacher/assignments'] });

  // Initialize hook with server data
  const {
    // State do hook
    assignments,
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

  // 🆕 VIEW MODE STATE
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

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

  // Define filter and sort options with translations
  const filterOptions = [
    { value: 'all', label: t('filter_all_status') },
    { value: 'today', label: t('filter_today') },
    { value: 'pending', label: t('filter_pending') },
    { value: 'in_progress', label: t('filter_in_progress') },
    { value: 'completed', label: t('filter_completed') },
    { value: 'overdue', label: t('filter_overdue') },
  ];

  const sortOptions = [
    { value: 'due_date', label: t('sort_due_date') },
    { value: 'priority', label: t('sort_priority') },
    { value: 'created', label: t('sort_created') },
    { value: 'student', label: t('sort_student') },
    { value: 'progress', label: t('sort_progress') },
  ];

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

  // 🆕 CHECK IF ASSIGNMENT HAS WORK SCORES
  const hasWorkScores = useCallback((assignment: TeacherAssignment) => {
    return assignment.workScoreIds && assignment.workScoreIds.length > 0;
  }, []);

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
    if (assignment.isOverdue) return ' border-red-400 text-red-400';
    if (assignment.isCompleted) return 'border-green-400 text-green-400';
    if (assignment.status === 'IN_PROGRESS')
      return 'border-blue-300 text-blue-300';
    return ' border-yellow-30 text-yellow-300';
  };

  const getStatusText = (assignment: TeacherAssignment) => {
    if (assignment.isOverdue) return t('status_overdue');
    if (assignment.isCompleted) return t('status_completed');
    if (assignment.status === 'IN_PROGRESS') return t('status_in_progress');
    return t('status_pending');
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

  const toast = useToast();
  const updateAssignmentStatus = useCallback(
    async (assignmentId: string, updates: any) => {
      setActionLoading(assignmentId);
      try {
        const success = await updateAssignment(assignmentId, updates);
        if (success) {
          toast.success('Tarefa atualizada com sucesso!');
        }
      } catch {
        toast.error('Erro ao atualizar tarefa');
      } finally {
        setActionLoading(null);
      }
    },
    [updateAssignment]
  );

  // 🆕 RENDER ASSIGNMENT CARD COMPONENT
  const renderAssignmentCard = useCallback(
    (assignment: TeacherAssignment, index: number) => {
      const hasScores = hasWorkScores(assignment);

      return (
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

                  {/* Assignment Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
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

                            <h3 className="font-bold text-lg text-theme-primary classical-title truncate">
                              {assignment.title}
                            </h3>
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
                              {t(
                                PRIORITY_LABELS[
                                  assignment.priority as keyof typeof PRIORITY_LABELS
                                ]
                              )}
                            </span>

                            {/* 🆕 WORK SCORE INDICATOR */}
                            {hasScores && (
                              <div
                                className="w-6 h-6 bg-accent-purple/10 border border-accent-purple/30 text-accent-purple rounded-full flex items-center justify-center"
                                title={t('has_scores')}
                              >
                                <FiMusic className="w-3 h-3" />
                              </div>
                            )}

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
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-theme-secondary mt-1">
                          <div className="flex items-center space-x-1">
                            <FiUser className="w-4 h-4" />
                            <span>{assignment.student.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FiBookOpen className="w-4 h-4" />
                            <span>
                              {t(
                                ASSIGNMENT_TYPES[
                                  assignment.type as keyof typeof ASSIGNMENT_TYPES
                                ]
                              ) || assignment.type}
                            </span>
                          </div>
                          {assignment.dueDate && (
                            <div className="flex items-center space-x-1">
                              <FiCalendar className="w-4 h-4" />
                              <span>{formatDueDate(assignment.dueDate)}</span>
                            </div>
                          )}
                          {assignment.estimatedTime && (
                            <div className="flex items-center space-x-1">
                              <FiClock className="w-4 h-4" />
                              <span>{assignment.estimatedTime}min</span>
                            </div>
                          )}
                        </div>
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
                            {t('progress_label')}
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
                      {assignment.practiceGoals.slice(0, 2).map((goal, idx) => (
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
                          {t('more_goals', {
                            count:
                              assignment.practiceGoals.length +
                              assignment.technicalGoals.length +
                              assignment.musicalGoals.length -
                              3,
                          })}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-6 text-sm text-theme-tertiary">
                      <div className="flex items-center space-x-1">
                        <FiCalendar className="w-4 h-4" />
                        <span>
                          {t('created_date', {
                            date: new Date(
                              assignment.createdAt
                            ).toLocaleDateString('pt-BR'),
                          })}
                        </span>
                      </div>
                      {assignment.completedAt && (
                        <div className="flex items-center space-x-1">
                          <FiCheck className="w-4 h-4" />
                          <span>
                            {t('completed_date', {
                              date: new Date(
                                assignment.completedAt
                              ).toLocaleDateString('pt-BR'),
                            })}
                          </span>
                        </div>
                      )}
                      {hasScores && (
                        <div className="flex items-center space-x-1 text-accent-purple">
                          <FiMusic className="w-4 h-4" />
                          <span>
                            {t('scores_count', {
                              count: assignment.workScoreIds.length,
                              plural:
                                assignment.workScoreIds.length !== 1 ? 's' : '',
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>
      );
    },
    [
      hasWorkScores,
      getStatusColor,
      getStatusText,
      getStatusIcon,
      formatDueDate,
      updateAssignmentStatus,
      actionLoading,
      t,
    ]
  );

  // 🆕 RENDER ASSIGNMENT LIST ITEM COMPONENT
  const renderAssignmentListItem = useCallback(
    (assignment: TeacherAssignment, index: number) => {
      return (
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
                              {t(
                                ASSIGNMENT_TYPES[
                                  assignment.type as keyof typeof ASSIGNMENT_TYPES
                                ]
                              ) || assignment.type}
                            </span>
                          </div>
                          {assignment.dueDate && (
                            <div className="flex items-center space-x-1">
                              <FiCalendar className="w-4 h-4" />
                              <span>{formatDueDate(assignment.dueDate)}</span>
                            </div>
                          )}
                          {assignment.estimatedTime && (
                            <div className="flex items-center space-x-1">
                              <FiClock className="w-4 h-4" />
                              <span>{assignment.estimatedTime}min</span>
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
                          {t(
                            PRIORITY_LABELS[
                              assignment.priority as keyof typeof PRIORITY_LABELS
                            ]
                          )}
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
                            {t('progress_label')}
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
                      {assignment.practiceGoals.slice(0, 2).map((goal, idx) => (
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
                          {t('more_goals', {
                            count:
                              assignment.practiceGoals.length +
                              assignment.technicalGoals.length +
                              assignment.musicalGoals.length -
                              3,
                          })}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-6 text-sm text-theme-tertiary">
                      <div className="flex items-center space-x-1">
                        <FiCalendar className="w-4 h-4" />
                        <span>
                          {t('created_date', {
                            date: new Date(
                              assignment.createdAt
                            ).toLocaleDateString('pt-BR'),
                          })}
                        </span>
                      </div>
                      {assignment.completedAt && (
                        <div className="flex items-center space-x-1">
                          <FiCheck className="w-4 h-4" />
                          <span>
                            {t('completed_date', {
                              date: new Date(
                                assignment.completedAt
                              ).toLocaleDateString('pt-BR'),
                            })}
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
              </div>
            </div>
          </div>
        </AnimatedCard>
      );
    },
    [
      hasWorkScores,
      getStatusColor,
      getStatusText,
      updateAssignmentStatus,
      actionLoading,
      t,
    ]
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
              {t('error_loading_tasks')}
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
                  {loading.assignments ? t('loading_tasks') : t('try_again')}
                </span>
              </button>
              {error && (
                <button
                  onClick={clearError}
                  className="btn-classical-secondary w-full"
                >
                  {t('clear_error')}
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
              {t('page_title')}
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              {t('page_subtitle')}
            </p>
          </div>
        </AnimatedItem>

        {/* Stats Cards */}
        {/* <AnimatedItem direction="up" springType="gentle">
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
              <div className="text-sm text-theme-tertiary">
                {t('stats_total')}
              </div>
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
              <div className="text-sm text-theme-tertiary">
                {t('stats_pending')}
              </div>
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
              <div className="text-sm text-theme-tertiary">
                {t('stats_in_progress')}
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
                {stats.completed}
              </div>
              <div className="text-sm text-theme-tertiary">
                {t('stats_completed')}
              </div>
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
              <div className="text-sm text-theme-tertiary">
                {t('stats_overdue')}
              </div>
            </AnimatedCard>
          </SequentialGrid>
        </AnimatedItem> */}

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
                    placeholder={t('search_placeholder')}
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
                    { value: 'all', label: t('filter_all_students') },
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

                {/* 🆕 VIEW MODE TOGGLE */}
                <ViewModeToggle
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />

                <Link href={'assignments/create'}>
                  <Button variant="primary">
                    <span>{t('new_task')}</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Filter Summary */}
            {(searchTerm || filter !== 'all' || selectedStudent !== 'all') && (
              <div className="flex items-center justify-between pt-4 border-t border-theme-secondary mt-4">
                <div className="flex items-center space-x-2 text-sm text-theme-secondary">
                  <FiFilter className="w-4 h-4" />
                  <span>
                    {t('showing_results', {
                      count: filteredAndSortedAssignments.length,
                      total: assignments.length,
                    })}
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
                  {t('clear_filters')}
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
              <p className="text-theme-secondary">{t('loading_tasks')}</p>
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
                        ? t('no_tasks_found')
                        : t('no_tasks_registered')}
                    </h3>
                    <p className="text-theme-tertiary mb-6">
                      {searchTerm ||
                      filter !== 'all' ||
                      selectedStudent !== 'all'
                        ? t('adjust_filters')
                        : t('create_first_task')}
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
                        {t('clear_filters')}
                      </button>
                    ) : (
                      <Link href={'assignments/create'}>
                        <Button variant="primary">
                          <span>{t('create_first_task_button')}</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                </AnimatedCard>
              ) : (
                <>
                  {/* 🆕 CONDITIONAL RENDERING BASED ON VIEW MODE */}
                  {viewMode === 'cards' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                      {filteredAndSortedAssignments.map(renderAssignmentCard)}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredAndSortedAssignments.map(
                        renderAssignmentListItem
                      )}
                    </div>
                  )}
                </>
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
                <span>{t('load_more_tasks')}</span>
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
          t={t}
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
          t={t}
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
  t: (key: string, params?: any) => string;
}

function CreateAssignmentModal({
  students,
  createForm,
  setCreateForm,
  onSubmit,
  onClose,
  loading,
  t,
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
              {t('new_assignment_modal_title')}
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
                  {t('student_required')}
                </label>
                <Select
                  options={[
                    { value: '', label: t('select_student') },
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
                  {t('assignment_type')}
                </label>
                <Select
                  options={Object.entries(ASSIGNMENT_TYPES).map(
                    ([key, labelKey]) => ({
                      label: t(labelKey),
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
                {t('assignment_title')}
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
                {t('assignment_description')}
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
                  {t('priority')}
                </label>
                <Select
                  options={[
                    { value: 'low', label: t('priority_low') },
                    { value: 'medium', label: t('priority_medium') },
                    { value: 'high', label: t('priority_high') },
                  ]}
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
                  {t('due_date')}
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
                  {t('estimated_time')}
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
                    {t('practice_goals')}
                  </label>
                  <button
                    type="button"
                    onClick={() => addGoal('practiceGoals')}
                    className="text-brand-primary hover:text-brand-secondary text-sm flex items-center space-x-1"
                  >
                    <FiPlus className="w-3 h-3" />
                    <span>{t('add')}</span>
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
                    {t('technical_goals')}
                  </label>
                  <button
                    type="button"
                    onClick={() => addGoal('technicalGoals')}
                    className="text-brand-primary hover:text-brand-secondary text-sm flex items-center space-x-1"
                  >
                    <FiPlus className="w-3 h-3" />
                    <span>{t('add')}</span>
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
                {t('cancel')}
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
                <span>{loading ? t('creating_task') : t('create_task')}</span>
              </button>
            </div>
          </div>
        </div>
      </AnimatedCard>
    </Modal>
  );
}

interface AssignmentDetailsModalProps {
  assignment: TeacherAssignment;
  onClose: () => void;
  onUpdate: (assignmentId: string, updates: any) => Promise<void>;
  actionLoading: string | null;
  t: (key: string, params?: any) => string;
}

function AssignmentDetailsModal({
  assignment,
  onClose,
  onUpdate,
  actionLoading,
}: AssignmentDetailsModalProps) {
  const [feedback, setFeedback] = useState(assignment.teacherFeedback || '');
  const [rating, setRating] = useState(assignment.teacherRating || 0);

  // 🆕 Extrair video submission
  const videoSubmission = assignment.submissions?.videoSubmission || null;
  const progressMilestones = assignment.submissions?.progressMilestones || {};

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  const milestoneLabels: Record<string, string> = {
    learnedLeftHand: 'Aprendeu a mão esquerda',
    learnedRightHand: 'Aprendeu a mão direita',
    playedWithMetronome: 'Tocou com metrônomo',
    memorized: 'Memorizou a peça',
    playedAtTempo: 'Tocou no andamento original',
    masteredDynamics: 'Dominou dinâmicas',
    performedForOthers: 'Apresentou para outros',
  };

  const completedMilestones = Object.entries(progressMilestones)
    .filter(([_, completed]) => completed)
    .map(([key, _]) => key);

  return (
    <Modal isOpen onClose={onClose} maxWidth="6xl">
      <AnimatedCard hover="none">
        <div className="p-6">
          {/* Header melhorado */}
          <div className="flex items-start justify-between mb-6 pb-4 border-b border-theme-secondary">
            <div className="flex items-start space-x-4">
              {/* Student Avatar */}
              <div className="flex-shrink-0">
                {assignment.student.image ? (
                  <div className="w-16 h-16 relative rounded-full overflow-hidden">
                    <Image
                      src={assignment.student.image}
                      alt={assignment.student.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center">
                    <FiUser className="w-8 h-8 text-theme-primary" />
                  </div>
                )}
              </div>

              {/* Assignment Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-theme-primary classical-title mb-2">
                  {assignment.title}
                </h2>
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center space-x-2 text-theme-secondary">
                    <FiUser className="w-4 h-4" />
                    <span className="font-medium">
                      {assignment.student.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-theme-secondary">
                    <FiBookOpen className="w-4 h-4" />
                    <span>
                      {ASSIGNMENT_TYPES[
                        assignment.type as keyof typeof ASSIGNMENT_TYPES
                      ] || assignment.type}
                    </span>
                  </div>
                  {assignment.dueDate && (
                    <div className="flex items-center space-x-2 text-theme-secondary">
                      <FiCalendar className="w-4 h-4" />
                      <span>{formatDate(assignment.dueDate)}</span>
                    </div>
                  )}
                </div>

                {/* Status e Indicadores */}
                <div className="flex items-center space-x-3">
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

                  {/* 🆕 Indicadores visuais */}
                  {videoSubmission && (
                    <span className="px-2 py-1 bg-accent-purple/10 border border-accent-purple/30 text-accent-purple rounded text-xs flex items-center space-x-1">
                      <FiVideo className="w-3 h-3" />
                      <span>Vídeo</span>
                    </span>
                  )}

                  {assignment.workScoreIds &&
                    assignment.workScoreIds.length > 0 && (
                      <span className="px-2 py-1 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded text-xs flex items-center space-x-1">
                        <FiMusic className="w-3 h-3" />
                        <span>{assignment.workScoreIds.length}</span>
                      </span>
                    )}

                  {completedMilestones.length > 0 && (
                    <span className="px-2 py-1 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded text-xs flex items-center space-x-1">
                      <FiTarget className="w-3 h-3" />
                      <span>{completedMilestones.length} conquistas</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <label className="text-sm font-medium text-theme-tertiary block mb-2">
                  Descrição
                </label>
                <div className="text-theme-primary whitespace-pre-wrap p-4 bg-theme-tertiary rounded-lg ">
                  {assignment.description}
                </div>
              </div>

              {/* Progress */}
              {assignment.progress !== undefined && (
                <div>
                  <label className="text-sm font-medium text-theme-tertiary block mb-3">
                    Progresso do Aluno
                  </label>
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex-1">
                      <div className="w-full bg-theme-secondary rounded-full h-3">
                        <div
                          className="progress-bar h-3 rounded-full transition-all duration-300"
                          style={{ width: `${assignment.progress}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-theme-primary font-medium min-w-[3rem]">
                      {assignment.progress}%
                    </span>
                  </div>
                </div>
              )}

              {/* 🆕 Seção de Vídeo */}
              {videoSubmission && (
                <div>
                  <label className="text-sm font-medium text-theme-tertiary block mb-3">
                    Vídeo da Performance
                  </label>
                  <div className="p-4 bg-theme-elevated rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-accent-purple/10 border border-accent-purple/30 rounded-lg flex items-center justify-center">
                          <FiVideo className="w-5 h-5 text-accent-purple" />
                        </div>
                        <div>
                          <div className="font-medium text-theme-primary text-sm">
                            {videoSubmission.originalName}
                          </div>
                          <div className="text-xs text-theme-secondary">
                            {formatFileSize(videoSubmission.fileSize)} •{' '}
                            {formatDateTime(videoSubmission.uploadedAt)}
                          </div>
                        </div>
                      </div>
                      <a
                        href={videoSubmission.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-classical-secondary text-xs px-3 py-1 flex items-center space-x-1"
                      >
                        <FiPlay className="w-3 h-3" />
                        <span>Assistir</span>
                      </a>
                    </div>

                    {/* Video preview */}
                    <video
                      src={videoSubmission.filePath}
                      controls
                      className="w-full rounded-lg"
                      style={{ maxHeight: '200px' }}
                    >
                      Seu navegador não suporta a reprodução de vídeo.
                    </video>
                  </div>
                </div>
              )}

              {/* Goals resumo */}
              {(assignment.practiceGoals.length > 0 ||
                assignment.technicalGoals.length > 0) && (
                <div>
                  <label className="text-sm font-medium text-theme-tertiary block mb-3">
                    Objetivos
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {assignment.practiceGoals.slice(0, 3).map((goal, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-2 text-sm p-2 bg-accent-blue/5 border border-accent-blue/20 rounded"
                      >
                        <FiTarget className="w-3 h-3 text-accent-blue" />
                        <span className="text-theme-primary truncate">
                          {goal}
                        </span>
                      </div>
                    ))}
                    {assignment.technicalGoals.slice(0, 3).map((goal, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-2 text-sm p-2 bg-accent-green/5 border border-accent-green/20 rounded"
                      >
                        <FiMusic className="w-3 h-3 text-accent-green" />
                        <span className="text-theme-primary truncate">
                          {goal}
                        </span>
                      </div>
                    ))}
                  </div>
                  {assignment.practiceGoals.length +
                    assignment.technicalGoals.length >
                    6 && (
                    <div className="text-xs text-theme-tertiary mt-2">
                      +
                      {assignment.practiceGoals.length +
                        assignment.technicalGoals.length -
                        6}{' '}
                      objetivos adicionais
                    </div>
                  )}
                </div>
              )}

              {/* Submissão do aluno */}
              {(assignment.studentNotes || assignment.studentRating) && (
                <div>
                  <label className="text-sm font-medium text-theme-tertiary block mb-3">
                    Submissão do Aluno
                  </label>
                  <div className="space-y-3">
                    {assignment.studentNotes && (
                      <div className="p-3 bg-theme-secondary/5 rounded-lg border">
                        <div className="text-sm font-medium text-theme-primary mb-1">
                          Comentários:
                        </div>
                        <div className="text-sm text-theme-secondary">
                          {assignment.studentNotes}
                        </div>
                      </div>
                    )}

                    {assignment.studentRating && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-theme-tertiary">
                          Avaliação de dificuldade:
                        </span>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FiStar
                              key={star}
                              className={`w-4 h-4 ${
                                star <= assignment.studentRating!
                                  ? 'text-accent-yellow fill-current'
                                  : 'text-theme-tertiary'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-theme-primary">
                          ({assignment.studentRating}/5)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Teacher Feedback Section */}
              <div>
                <label className="text-sm font-medium text-theme-tertiary block mb-3">
                  Seu Feedback
                </label>
                <div className="space-y-4">
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    className="input-classical w-full text-sm"
                    placeholder="Adicione seu feedback sobre o desempenho do aluno..."
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-theme-tertiary">
                        Avaliação:
                      </span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="w-5 h-5 text-theme-tertiary hover:text-accent-yellow transition-colors"
                          >
                            <FiStar
                              className={`w-4 h-4 ${
                                star <= rating
                                  ? 'text-accent-yellow fill-current'
                                  : ''
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
                        <FiSave className="w-3 h-3" />
                      )}
                      <span>Salvar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Quick Stats */}
              <div className="classical-card-2 p-4">
                <h3 className="font-bold text-theme-primary mb-3 text-sm">
                  Informações
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">Criado:</span>
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

                  {assignment.actualTime && (
                    <div className="flex justify-between">
                      <span className="text-theme-tertiary">Tempo real:</span>
                      <span className="text-theme-primary">
                        {assignment.actualTime}min
                      </span>
                    </div>
                  )}

                  {assignment.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-theme-tertiary">Concluído:</span>
                      <span className="text-theme-primary">
                        {formatDateTime(assignment.completedAt)}
                      </span>
                    </div>
                  )}

                  {assignment.workScoreIds &&
                    assignment.workScoreIds.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">Partituras:</span>
                        <span className="text-accent-blue">
                          {assignment.workScoreIds.length}
                        </span>
                      </div>
                    )}

                  {videoSubmission && (
                    <div className="flex justify-between">
                      <span className="text-theme-tertiary">
                        Vídeo enviado em:
                      </span>
                      <span className="text-accent-purple">
                        {formatDateTime(videoSubmission.uploadedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="classical-card-2  p-4">
                <h3 className="font-bold text-theme-primary mb-3 text-sm">
                  Ações Rápidas
                </h3>
                <div className=" flex flex-col gap-2">
                  {!assignment.isCompleted && (
                    <button
                      onClick={approveAssignment}
                      disabled={actionLoading === assignment.id}
                      className="w-full btn-classical-primary text-sm flex items-center justify-center space-x-2"
                    >
                      {actionLoading === assignment.id ? (
                        <FiRefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <FiCheck className="w-3 h-3" />
                      )}
                      <span>Aprovar</span>
                    </button>
                  )}

                  <Link href={`assignments/${assignment.id}`}>
                    <button className="w-full btn-classical-secondary text-sm flex items-center justify-center space-x-2">
                      <FiEye className="w-3 h-3" />
                      <span>Ver mais detalhes</span>
                    </button>
                  </Link>

                  <Link href={`assignments/${assignment.id}/edit`}>
                    <button className="w-full btn-classical-secondary text-sm flex items-center justify-center space-x-2">
                      <FiEdit className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  </Link>

                  {videoSubmission && (
                    <a
                      href={videoSubmission.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full btn-classical-secondary text-sm flex items-center justify-center space-x-2"
                    >
                      <FiVideo className="w-3 h-3" />
                      <span>Assistir Vídeo</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Progress Overview */}
              {completedMilestones.length > 0 && (
                <div className="classical-card-2 p-4">
                  <h3 className="font-bold text-theme-primary mb-3 text-sm">
                    Conquistas do Aluno
                  </h3>
                  <div className="space-y-1">
                    {completedMilestones.slice(0, 4).map((key) => (
                      <div
                        key={key}
                        className="flex items-center space-x-2 text-xs"
                      >
                        <FiCheckCircle className="w-3 h-3 text-accent-green" />
                        <span className="text-theme-primary">
                          {milestoneLabels[key] || key}
                        </span>
                      </div>
                    ))}
                    {completedMilestones.length > 4 && (
                      <div className="text-xs text-theme-tertiary">
                        +{completedMilestones.length - 4} mais...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </AnimatedCard>
    </Modal>
  );
}
