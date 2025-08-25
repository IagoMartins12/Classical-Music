// app/student/assignments/pageClient.tsx - Client Component para Tarefas do Aluno - ATUALIZADO

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
  FiTrendingUp,
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
import ViewModeToggle, { ViewMode } from '@/app/components/ViewModeToggle';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/app/hooks/useTranslation';

interface StudentAssignmentsPageClientProps {
  initialData: StudentAssignmentsData | null;
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
  errorMessage,
}: StudentAssignmentsPageClientProps) {
  const { t } = useTranslation({ sections: ['student/assignments'] });

  // Initialize hook with server data
  const {
    assignments,
    stats,
    loading,
    error,
    setInitialData,
    refreshAssignments,
    completeAssignment,
    updateProgress,
    clearError,
  } = useStudentAssignments();

  // 🆕 VIEW MODE STATE
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Local UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<AssignmentFilter>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

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
  const router = useRouter();

  // 🆕 CHECK IF ASSIGNMENT HAS WORK SCORES
  const hasWorkScores = useCallback((assignment: any) => {
    return assignment.workScoreIds && assignment.workScoreIds.length > 0;
  }, []);

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
        if (!assignment.dueDate) return setTimeFilter('all');

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
        label: t('student_assignments_status_completed'),
        icon: FiCheck,
      };
    }

    if (assignment.isOverdue) {
      return {
        color: 'border-red-400 text-red-400',
        label: t('student_assignments_status_overdue'),
        icon: FiAlertTriangle,
      };
    }

    if (assignment.status === 'IN_PROGRESS') {
      return {
        color: 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue',
        label: t('student_assignments_status_in_progress'),
        icon: FiTrendingUp,
      };
    }

    return {
      color: 'bg-accent-yellow/10 border-accent-yellow/30 text-accent-yellow',
      label: t('student_assignments_status_pending'),
      icon: FiClock,
    };
  };

  const handleRouter = (id: string) => {
    router.push(`/student/assignments/${id}`);
  };

  // 🆕 RENDER ASSIGNMENT CARD COMPONENT
  const renderAssignmentCard = useCallback(
    (assignment: (typeof assignments)[0], index: number) => {
      const statusInfo = getAssignmentStatusInfo(assignment);
      const StatusIcon = statusInfo.icon;
      const TypeIcon =
        typeIcons[assignment.type as keyof typeof typeIcons] || FiTarget;
      const priorityColor =
        priorityColors[assignment.priority as keyof typeof priorityColors] ||
        'text-theme-secondary';
      const hasScores = hasWorkScores(assignment);

      const priorityLabel =
        assignment.priority === 'high'
          ? t('student_assignments_priority_high')
          : assignment.priority === 'medium'
          ? t('student_assignments_priority_medium')
          : t('student_assignments_priority_low');

      return (
        <AnimatedCard
          key={assignment.id}
          hover="lift"
          className={`classical-card p-6 relative cursor-pointer ${
            assignment.isOverdue ? 'ring-2 ring-accent-red/30' : ''
          }`}
          delay={index * 0.1}
          onClick={() => handleRouter(assignment.id)}
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
              <span className={`text-xs font-medium ${priorityColor}`}>
                {priorityLabel}
              </span>
              {/* 🆕 WORK SCORE INDICATOR */}
              {hasScores && (
                <div
                  className="w-5 h-5 bg-accent-purple/10 border border-accent-purple/30 text-accent-purple rounded-full flex items-center justify-center"
                  title="Tem partituras vinculadas"
                >
                  <FiMusic className="w-3 h-3" />
                </div>
              )}
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
                {t('student_assignments_due_date')}{' '}
                {formatDate(assignment.dueDate)}
                {assignment.daysUntilDue !== null && (
                  <span
                    className={`ml-1 font-medium ${
                      assignment.daysUntilDue && assignment.daysUntilDue < 0
                        ? 'text-accent-red'
                        : assignment.daysUntilDue &&
                          assignment.daysUntilDue <= 2
                        ? 'text-accent-yellow'
                        : 'text-theme-secondary'
                    }`}
                  >
                    (
                    {assignment.daysUntilDue && assignment.daysUntilDue < 0
                      ? t('student_assignments_days_ago', {
                          days: Math.abs(assignment.daysUntilDue),
                        })
                      : assignment.daysUntilDue === 0
                      ? t('student_assignments_today')
                      : t('student_assignments_days_left', {
                          days: `${assignment.daysUntilDue}`,
                        })}
                    )
                  </span>
                )}
              </div>
            )}

            {assignment.estimatedTime && (
              <div className="flex items-center text-sm text-theme-secondary">
                <FiClock className="w-4 h-4 mr-2" />
                {formatTime(assignment.estimatedTime)}{' '}
                {t('student_assignments_estimated_time')}
              </div>
            )}

            {/* 🆕 WORK SCORES INFO */}
            {hasScores && (
              <div className="flex items-center text-sm text-accent-purple">
                <FiMusic className="w-4 h-4 mr-2" />
                {t('student_assignments_scores_linked', {
                  count: assignment.workScoreIds.length,
                  plural: assignment.workScoreIds.length !== 1 ? 's' : '',
                })}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {assignment.progress !== null &&
            assignment.progress !== undefined && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-theme-tertiary">
                    {t('student_assignments_progress_label')}
                  </span>
                  <span className="text-xs text-theme-primary">
                    {assignment.progress}%
                  </span>
                </div>
                <div className="w-full bg-theme-secondary rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      assignment.progress >= 100
                        ? 'bg-green-400'
                        : assignment.progress >= 50
                        ? 'bg-blue-400'
                        : 'bg-yellow-400'
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
                {t('student_assignments_objectives')}
              </div>
              <div className="flex flex-wrap gap-1">
                {assignment.practiceGoals.slice(0, 2).map((goal, idx) => (
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
              {t('student_assignments_created_at')}{' '}
              {formatDate(assignment.createdAt)}
            </div>
            <Link
              className="text-sm text-brand-primary flex gap-2"
              href={`assignments/${assignment.id}`}
            >
              <FiEye className="w-4 h-4 text-brand-primary" />
              <span>{t('student_assignments_view_details')}</span>
            </Link>
          </div>
        </AnimatedCard>
      );
    },
    [getAssignmentStatusInfo, hasWorkScores, formatDate, formatTime, t]
  );

  // 🆕 RENDER ASSIGNMENT LIST ITEM COMPONENT
  const renderAssignmentListItem = useCallback(
    (assignment: any, index: number) => {
      const statusInfo = getAssignmentStatusInfo(assignment);
      const StatusIcon = statusInfo.icon;
      const TypeIcon =
        typeIcons[assignment.type as keyof typeof typeIcons] || FiTarget;
      const priorityColor =
        priorityColors[assignment.priority as keyof typeof priorityColors] ||
        'text-theme-secondary';

      const priorityLabel =
        assignment.priority === 'high'
          ? t('student_assignments_priority_high')
          : assignment.priority === 'medium'
          ? t('student_assignments_priority_medium')
          : t('student_assignments_priority_low');

      return (
        <AnimatedCard
          key={assignment.id}
          hover="lift"
          className={`classical-card p-6 relative cursor-pointer ${
            assignment.isOverdue ? 'ring-2 ring-accent-red/30' : ''
          }`}
          delay={index * 0.1}
          onClick={() => handleRouter(assignment.id)}
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
              <span className={`text-xs font-medium ${priorityColor}`}>
                {priorityLabel}
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
                {t('student_assignments_due_date')}{' '}
                {formatDate(assignment.dueDate)}
                {assignment.daysUntilDue !== null && (
                  <span
                    className={`ml-1 font-medium ${
                      assignment.daysUntilDue && assignment.daysUntilDue < 0
                        ? 'text-accent-red'
                        : assignment.daysUntilDue &&
                          assignment.daysUntilDue <= 2
                        ? 'text-accent-yellow'
                        : 'text-theme-secondary'
                    }`}
                  >
                    (
                    {assignment.daysUntilDue && assignment.daysUntilDue < 0
                      ? t('student_assignments_days_ago', {
                          days: Math.abs(assignment.daysUntilDue),
                        })
                      : assignment.daysUntilDue === 0
                      ? t('student_assignments_today')
                      : t('student_assignments_days_left', {
                          days: assignment.daysUntilDue,
                        })}
                    )
                  </span>
                )}
              </div>
            )}

            {assignment.estimatedTime && (
              <div className="flex items-center text-sm text-theme-secondary">
                <FiClock className="w-4 h-4 mr-2" />
                {formatTime(assignment.estimatedTime)}{' '}
                {t('student_assignments_estimated_time')}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {assignment.progress !== null &&
            assignment.progress !== undefined && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-theme-tertiary">
                    {t('student_assignments_progress_label')}
                  </span>
                  <span className="text-xs text-theme-primary">
                    {assignment.progress}%
                  </span>
                </div>
                <div className="w-full bg-theme-secondary rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      assignment.progress >= 100
                        ? 'bg-green-400'
                        : assignment.progress >= 50
                        ? 'bg-blue-400'
                        : 'bg-yellow-400'
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
                {t('student_assignments_objectives')}
              </div>
              <div className="flex flex-wrap gap-1">
                {assignment.practiceGoals
                  .slice(0, 2)
                  .map((goal: any, idx: number) => (
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
              {t('student_assignments_created_at')}{' '}
              {formatDate(assignment.createdAt)}
            </div>
            <Link
              className="text-sm text-brand-primary flex gap-2"
              href={`assignments/${assignment.id}`}
            >
              <FiEye className="w-4 h-4 text-brand-primary" />
              <span>{t('student_assignments_view_details')}</span>
            </Link>
          </div>
        </AnimatedCard>
      );
    },
    [getAssignmentStatusInfo, hasWorkScores, formatDate, formatTime, t]
  );

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
              {t('student_assignments_no_teacher_title')}
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {t('student_assignments_no_teacher_description')}
            </p>
            <Link href="/student" className="btn-classical-primary">
              {t('student_assignments_no_teacher_back')}
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
              {t('student_assignments_error_title')}
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
                  {loading.assignments
                    ? t('student_assignments_error_try_again') + '...'
                    : t('student_assignments_error_try_again')}
                </span>
              </button>
              {error && (
                <button
                  onClick={clearError}
                  className="btn-classical-secondary w-full"
                >
                  {t('student_assignments_error_clear')}
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
              {t('student_assignments_header_title')}
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              {t('student_assignments_header_subtitle')}
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
              <div className="text-sm text-theme-tertiary">
                {t('student_assignments_stats_total')}
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
                {displayStats.pending}
              </div>
              <div className="text-sm text-theme-tertiary">
                {t('student_assignments_stats_pending')}
              </div>
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
              <div className="text-sm text-theme-tertiary">
                {t('student_assignments_stats_in_progress')}
              </div>
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
              <div className="text-sm text-theme-tertiary">
                {t('student_assignments_stats_completed')}
              </div>
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
              <div className="text-sm text-theme-tertiary">
                {t('student_assignments_stats_overdue')}
              </div>
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
                  placeholder={t('student_assignments_search_placeholder')}
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
                  <span>{t('student_assignments_filters')}</span>
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
                  <span>{t('student_assignments_refresh')}</span>
                </button>
                {/* 🆕 VIEW MODE TOGGLE */}
                <ViewModeToggle
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-theme-secondary grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-tertiary mb-2">
                    Professor
                  </label>
                  <Select
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                    options={[
                      {
                        value: 'all',
                        label: t('student_assignments_filter_all_teachers'),
                      },
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
                      {
                        value: 'all',
                        label: t('student_assignments_filter_all_status'),
                      },
                      {
                        value: 'pending',
                        label: t('student_assignments_filter_pending'),
                      },
                      {
                        value: 'in_progress',
                        label: t('student_assignments_filter_in_progress'),
                      },
                      {
                        value: 'completed',
                        label: t('student_assignments_filter_completed'),
                      },
                      {
                        value: 'overdue',
                        label: t('student_assignments_filter_overdue'),
                      },
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
                      {
                        value: 'all',
                        label: t('student_assignments_filter_all_periods'),
                      },
                      {
                        value: 'today',
                        label: t('student_assignments_filter_today'),
                      },
                      {
                        value: 'this_week',
                        label: t('student_assignments_filter_this_week'),
                      },
                      {
                        value: 'overdue',
                        label: t('student_assignments_filter_overdue'),
                      },
                      {
                        value: 'upcoming',
                        label: t('student_assignments_filter_upcoming'),
                      },
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
                {t('student_assignments_results_showing', {
                  filtered: filteredAssignments.length,
                  total: displayAssignments.length,
                })}
                {searchTerm &&
                  ` ${t('student_assignments_results_for_search', {
                    searchTerm,
                  })}`}
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
                  ? t('student_assignments_empty_filtered')
                  : t('student_assignments_empty_all')}
              </h3>
              <p className="text-theme-tertiary">
                {filteredAssignments.length === 0 &&
                displayAssignments.length > 0
                  ? t('student_assignments_empty_filtered_desc')
                  : t('student_assignments_empty_all_desc')}
              </p>
            </div>
          ) : (
            <>
              {/* 🆕 CONDITIONAL RENDERING BASED ON VIEW MODE */}
              {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedAssignments.map(renderAssignmentCard)}
                </div>
              ) : (
                <div className="space-y-3">
                  {paginatedAssignments.map(renderAssignmentListItem)}
                </div>
              )}
            </>
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
                <span>{t('student_assignments_pagination_previous')}</span>
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
                <span>{t('student_assignments_pagination_next')}</span>
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </AnimatedItem>
        )}
      </AnimatedContainer>
    </PageContainer>
  );
}
