// app/teacher/assignments/[id]/pageClient.tsx - ATUALIZADO COM TRADUÇÕES

'use client';

import { useState, useCallback } from 'react';
import {
  FiUser,
  FiStar,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiRefreshCw,
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiTarget,
  FiBookOpen,
  FiEdit3,
  FiSave,
  FiVideo,
  FiPlay,
  FiDownload,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../../components/animation/AnimatedComponents';
import { AssignmentDetailsData } from './pageServer';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAssignmentDetails } from '@/app/hooks/lessonsSystem/useAssignmentDetails';
import MusicalPiecesSection from '@/app/components/TeacherSystem/MusicalPiecesSection';
import Modal from '@/app/components/Modal';
import { useTranslation } from '@/app/context/TranslationContext';

interface AssignmentDetailsPageClientProps {
  initialData: AssignmentDetailsData | null;
  errorMessage?: string;
}

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

interface VideoSubmission {
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  uploadedAt: string;
  mimeType: string;
}

export default function AssignmentDetailsPageClient({
  initialData,
  errorMessage,
}: AssignmentDetailsPageClientProps) {
  const { t } = useTranslation({ sections: ['teacher/assignmentsId'] });

  const router = useRouter();
  const {
    updateAssignmentFeedback,
    approveAssignment,
    loading,
    error,
    clearError,
  } = useAssignmentDetails(initialData?.assignment || null);

  // Feedback state
  const [feedbackData, setFeedbackData] = useState({
    teacherFeedback: initialData?.assignment?.teacherFeedback || '',
    teacherRating: initialData?.assignment?.teacherRating || 0,
  });

  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);

  // 🆕 Estados para vídeo
  const [showVideoModal, setShowVideoModal] = useState(false);

  // 🆕 Extrair video submission
  const videoSubmission: VideoSubmission | null =
    initialData?.assignment?.submissions?.videoSubmission || null;

  // Update feedback data
  const updateFeedbackData = useCallback((field: string, value: any) => {
    setFeedbackData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Save feedback
  const handleSaveFeedback = useCallback(async () => {
    if (!initialData?.assignment?.id) return;

    const success = await updateAssignmentFeedback(
      initialData.assignment.id,
      feedbackData
    );

    if (success) {
      setIsEditingFeedback(false);
      console.log('Feedback salvo com sucesso!');
    }
  }, [initialData, feedbackData, updateAssignmentFeedback]);

  // Approve assignment
  const handleApproveAssignment = useCallback(async () => {
    if (!initialData?.assignment?.id) return;

    const success = await approveAssignment(initialData.assignment.id, {
      teacherFeedback: feedbackData.teacherFeedback || t('approved_by_teacher'),
      teacherRating: feedbackData.teacherRating || 5,
    });

    if (success) {
      setShowApproveModal(false);
      router.push('/teacher/assignments');
    }
  }, [initialData, feedbackData, approveAssignment, router, t]);

  // 🆕 Format file size
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Format date
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
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

  // Get status info
  const getStatusColor = (assignment: any) => {
    if (!assignment) return '';

    if (assignment.isOverdue)
      return 'bg-accent-red/10 border-accent-red/30 text-accent-red';
    if (assignment.isCompleted)
      return 'bg-accent-green/10 border-accent-green/30 text-accent-green';
    if (assignment.status === 'IN_PROGRESS')
      return 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue';
    return 'bg-accent-yellow/10 border-accent-yellow/30 text-accent-yellow';
  };

  const getStatusText = (assignment: any) => {
    if (!assignment) return '';

    if (assignment.isOverdue) return t('status_overdue');
    if (assignment.isCompleted) return t('status_completed');
    if (assignment.status === 'IN_PROGRESS') return t('status_in_progress');
    return t('status_pending');
  };

  // Render error state
  if (!initialData || errorMessage) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiAlertCircle className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              {t('error_loading')}
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {errorMessage || t('error_not_found')}
            </p>
            <Link href="/teacher/assignments" className="btn-classical-primary">
              {t('back_to_assignments')}
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  const assignment = initialData.assignment;

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link
                href="/teacher/assignments"
                className="w-10 h-10 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group"
              >
                <FiArrowLeft className="w-4 h-4 text-theme-tertiary group-hover:text-brand-primary transition-colors" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gradient-brand classical-title">
                  {assignment.title}
                </h1>
                <p className="text-theme-secondary classical-subtitle">
                  {t('assignment_by')}
                  {assignment.student.name}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <span
                className={`px-3 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                  assignment
                )}`}
              >
                {getStatusText(assignment)}
              </span>

              {/* 🆕 Indicador de vídeo */}
              {videoSubmission && (
                <span className="px-3 py-2 rounded-full text-sm font-medium border bg-accent-purple/10 border-accent-purple/30 text-accent-purple flex items-center space-x-1">
                  <FiVideo className="w-3 h-3" />
                  <span>{t('has_video')}</span>
                </span>
              )}

              {!assignment.isCompleted && initialData.canGiveFeedback && (
                <button
                  onClick={() => setShowApproveModal(true)}
                  className="btn-classical-primary flex items-center space-x-2"
                >
                  <FiCheck className="w-4 h-4" />
                  <span>{t('approve_assignment')}</span>
                </button>
              )}
            </div>
          </div>
        </AnimatedItem>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Assignment Info */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h2 className="text-xl font-bold text-theme-primary classical-title mb-6">
                  {t('assignment_details')}
                </h2>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-theme-tertiary block mb-2">
                        {t('assignment_type')}
                      </label>
                      <div className="text-theme-primary">
                        {t(
                          ASSIGNMENT_TYPES[
                            assignment.type as keyof typeof ASSIGNMENT_TYPES
                          ]
                        ) || assignment.type}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-theme-tertiary block mb-2">
                        {t('priority')}
                      </label>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${
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

                    {assignment.dueDate && (
                      <div>
                        <label className="text-sm font-medium text-theme-tertiary block mb-2">
                          {t('due_date')}
                        </label>
                        <div className="flex items-center space-x-2 text-theme-primary">
                          <FiCalendar className="w-4 h-4" />
                          <span>{formatDate(assignment.dueDate)}</span>
                          {assignment.daysUntilDue !== null && (
                            <span
                              className={`text-sm ${
                                assignment.isOverdue
                                  ? 'text-accent-red'
                                  : assignment.daysUntilDue ?? 0 <= 1
                                  ? 'text-accent-yellow'
                                  : 'text-theme-tertiary'
                              }`}
                            >
                              {assignment.isOverdue
                                ? t('days_overdue', {
                                    days: Math.abs(
                                      assignment.daysUntilDue ?? 0
                                    ),
                                  })
                                : assignment.daysUntilDue === 0
                                ? t('due_today')
                                : t('days_until_due', {
                                    days: `${assignment.daysUntilDue}`,
                                  })}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {assignment.estimatedTime && (
                      <div>
                        <label className="text-sm font-medium text-theme-tertiary block mb-2">
                          {t('estimated_time')}
                        </label>
                        <div className="flex items-center space-x-2 text-theme-primary">
                          <FiClock className="w-4 h-4" />
                          <span>
                            {assignment.estimatedTime} {t('minutes')}
                          </span>
                          {assignment.actualTime && (
                            <span className="text-sm text-theme-tertiary">
                              (Real: {assignment.actualTime} min)
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium text-theme-tertiary block mb-2">
                      {t('description')}
                    </label>
                    <div className="text-theme-primary whitespace-pre-wrap">
                      {assignment.description}
                    </div>
                  </div>

                  {/* Goals */}
                  {assignment.practiceGoals.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-theme-tertiary block mb-2">
                        {t('practice_goals')}
                      </label>
                      <div className="space-y-2">
                        {assignment.practiceGoals.map((goal, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 text-theme-primary"
                          >
                            <FiTarget className="w-4 h-4 text-accent-blue" />
                            <span>{goal}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {assignment.technicalGoals.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-theme-tertiary block mb-2">
                        {t('technical_goals')}
                      </label>
                      <div className="space-y-2">
                        {assignment.technicalGoals.map((goal, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 text-theme-primary"
                          >
                            <FiTarget className="w-4 h-4 text-accent-green" />
                            <span>{goal}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {assignment.exercises.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-theme-tertiary block mb-2">
                        {t('exercises')}
                      </label>
                      <div className="space-y-2">
                        {assignment.exercises.map((exercise, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 text-theme-primary"
                          >
                            <FiBookOpen className="w-4 h-4 text-accent-purple" />
                            <span>{exercise}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Progress */}
                  {assignment.progress !== null &&
                    assignment.progress !== undefined && (
                      <div>
                        <label className="text-sm font-medium text-theme-tertiary block mb-2">
                          {t('progress')}
                        </label>
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <div className="w-full bg-theme-secondary rounded-full h-3">
                              <div
                                className="progress-bar h-3 rounded-full transition-all duration-300"
                                style={{ width: `${assignment.progress}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-theme-primary font-medium">
                            {assignment.progress}%
                          </span>
                        </div>
                      </div>
                    )}
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* SEÇÃO DE PEÇAS MUSICAIS */}
            {assignment.workScores && assignment.workScores.length > 0 && (
              <MusicalPiecesSection
                workScores={assignment.workScores}
                title={t('musical_pieces')}
                emptyMessage={t('no_pieces_linked')}
              />
            )}

            {/* 🆕 SEÇÃO DE VÍDEO DO ALUNO */}
            {videoSubmission && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h3 className="text-xl font-bold text-theme-primary classical-title mb-4">
                    {t('performance_video')}
                  </h3>

                  <div className="space-y-4">
                    <div className="p-4 bg-theme-elevated rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-accent-purple/10 border border-accent-purple/30 rounded-lg flex items-center justify-center">
                            <FiVideo className="w-6 h-6 text-accent-purple" />
                          </div>
                          <div>
                            <h4 className="font-medium text-theme-primary mb-1">
                              {videoSubmission.originalName}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-theme-secondary">
                              <span>
                                {formatFileSize(videoSubmission.fileSize)}
                              </span>
                              <span>
                                {t('uploaded_at')}{' '}
                                {formatDateTime(videoSubmission.uploadedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setShowVideoModal(true)}
                            className="btn-classical-primary flex items-center space-x-2"
                          >
                            <FiPlay className="w-4 h-4" />
                            <span>{t('watch')}</span>
                          </button>
                          <a
                            href={videoSubmission.filePath}
                            download={videoSubmission.originalName}
                            className="btn-classical-secondary flex items-center space-x-2"
                          >
                            <FiDownload className="w-4 h-4" />
                            <span>{t('download')}</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Preview do vídeo */}
                    <video
                      src={videoSubmission.filePath}
                      controls
                      className="w-full"
                      style={{ maxHeight: '400px' }}
                    >
                      {t('browser_no_support')}
                    </video>
                  </div>
                </AnimatedCard>
              </AnimatedItem>
            )}

            {/* Student Submission */}
            {assignment.submissions && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h3 className="text-xl font-bold text-theme-primary classical-title mb-4">
                    {t('student_submission')}
                  </h3>

                  {assignment.submissionDate && (
                    <div className="mb-4 text-sm text-theme-tertiary">
                      {t('submitted_on', {
                        date: formatDateTime(assignment.submissionDate),
                      })}
                    </div>
                  )}

                  {/* Student Notes */}
                  {assignment.studentNotes && (
                    <div className="mb-6">
                      <label className="text-sm font-medium text-theme-tertiary block mb-2">
                        {t('student_comments')}
                      </label>
                      <div className="p-4 bg-theme-secondary/10 rounded-lg bg-theme-elevated">
                        <div className="text-theme-primary whitespace-pre-wrap">
                          {assignment.studentNotes}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Student Rating */}
                  {assignment.studentRating && (
                    <div className="mb-6">
                      <label className="text-sm font-medium text-theme-tertiary block mb-2">
                        {t('student_rating')}
                      </label>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            className={`w-5 h-5 ${
                              star <= assignment.studentRating!
                                ? 'text-accent-yellow fill-current'
                                : 'text-theme-tertiary'
                            }`}
                          />
                        ))}
                        <span className="text-theme-primary ml-2">
                          {assignment.studentRating}/5
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 🆕 Progress Milestones do aluno */}
                  {assignment.submissions?.progressMilestones && (
                    <div className="mb-6">
                      <label className="text-sm font-medium text-theme-tertiary block mb-3">
                        {t('student_achievements')}
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(
                          assignment.submissions.progressMilestones
                        )
                          .filter(([_, completed]) => completed)
                          .map(([key, _]) => {
                            const milestoneLabels: Record<string, string> = {
                              learnedLeftHand: t('learned_left_hand'),
                              learnedRightHand: t('learned_right_hand'),
                              playedWithMetronome: t('played_with_metronome'),
                              memorized: t('memorized'),
                              playedAtTempo: t('played_at_tempo'),
                              masteredDynamics: t('mastered_dynamics'),
                              performedForOthers: t('performed_for_others'),
                            };

                            return (
                              <div
                                key={key}
                                className="flex bg-theme-elevated items-center space-x-2 p-2  rounded-lg"
                              >
                                <FiCheck className="w-4 h-4 text-accent-green" />
                                <span className="text-sm text-theme-primary">
                                  {milestoneLabels[key] || key}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </AnimatedCard>
              </AnimatedItem>
            )}

            {/* Teacher Feedback */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-theme-primary classical-title">
                    {t('teacher_feedback')}
                  </h3>
                  {!isEditingFeedback && initialData.canGiveFeedback && (
                    <button
                      onClick={() => setIsEditingFeedback(true)}
                      className="btn-classical-secondary flex items-center space-x-2"
                    >
                      <FiEdit3 className="w-4 h-4" />
                      <span>{t('edit')}</span>
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Teacher Feedback Text */}
                  <div>
                    <label className="text-sm font-medium text-theme-tertiary block mb-2">
                      {t('comments')}
                    </label>
                    {isEditingFeedback ? (
                      <textarea
                        value={feedbackData.teacherFeedback}
                        onChange={(e) =>
                          updateFeedbackData('teacherFeedback', e.target.value)
                        }
                        rows={4}
                        className="input-classical w-full"
                        placeholder="Escreva seu feedback sobre o desempenho do aluno..."
                      />
                    ) : (
                      <div
                        className={`p-4 rounded-lg bg-theme-elevated ${
                          feedbackData.teacherFeedback
                            ? 'bg-theme-secondary/10 border-theme-secondary/20'
                            : 'bg-theme-secondary/5 border-theme-secondary/10'
                        }`}
                      >
                        <div className="text-theme-primary whitespace-pre-wrap">
                          {feedbackData.teacherFeedback || t('no_feedback_yet')}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Teacher Rating */}
                  <div>
                    <label className="text-sm font-medium text-theme-tertiary block mb-2">
                      {t('your_rating')}
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() =>
                            isEditingFeedback &&
                            updateFeedbackData('teacherRating', star)
                          }
                          disabled={!isEditingFeedback}
                          className={`w-6 h-6 ${
                            isEditingFeedback
                              ? 'hover:scale-110 transition-transform'
                              : ''
                          }`}
                        >
                          <FiStar
                            className={`w-6 h-6 ${
                              star <= feedbackData.teacherRating
                                ? 'text-accent-yellow fill-current'
                                : 'text-theme-tertiary'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-theme-primary ml-2">
                        {feedbackData.teacherRating
                          ? `${feedbackData.teacherRating}/5`
                          : '0/5'}
                      </span>
                    </div>
                  </div>

                  {/* Edit Actions */}
                  {isEditingFeedback && (
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-theme-secondary">
                      <button
                        onClick={() => setIsEditingFeedback(false)}
                        className="btn-classical-secondary"
                        disabled={loading.updateFeedback}
                      >
                        {t('cancel')}
                      </button>
                      <button
                        onClick={handleSaveFeedback}
                        disabled={loading.updateFeedback}
                        className="btn-classical-primary flex items-center space-x-2"
                      >
                        {loading.updateFeedback ? (
                          <FiRefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <FiSave className="w-4 h-4" />
                        )}
                        <span>
                          {loading.updateFeedback
                            ? t('saving')
                            : t('save_feedback')}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            </AnimatedItem>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Student Info */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                  {t('student')}
                </h3>

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
                    <Link
                      href={`/teacher/students/${assignment.student.id}`}
                      className="text-sm text-brand-primary hover:text-brand-secondary"
                    >
                      {t('view_student_profile')}
                    </Link>
                  </div>
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Assignment Info */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                  {t('information')}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">
                      {t('created_on')}
                    </span>
                    <span className="text-theme-primary">
                      {formatDate(assignment.createdAt)}
                    </span>
                  </div>

                  {assignment.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-theme-tertiary">
                        {t('completed_on')}
                      </span>
                      <span className="text-theme-primary">
                        {formatDate(assignment.completedAt)}
                      </span>
                    </div>
                  )}

                  {/* 🆕 Info do vídeo */}
                  {videoSubmission && (
                    <div className="flex justify-between">
                      <span className="text-theme-tertiary">
                        {t('video_uploaded')}
                      </span>
                      <span className="text-accent-purple">
                        {formatDate(videoSubmission.uploadedAt)}
                      </span>
                    </div>
                  )}

                  {assignment.lesson && (
                    <div>
                      <span className="text-theme-tertiary">
                        {t('related_lesson')}
                      </span>
                      <Link
                        href={`/teacher/lessons/${assignment.lesson.id}`}
                        className="block text-brand-primary hover:text-brand-secondary mt-1"
                      >
                        {assignment.lesson.title}
                      </Link>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Quick Actions */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                  {t('actions')}
                </h3>
                <div className="space-y-2">
                  <Link
                    href={`/teacher/assignments/${assignment.id}/edit`}
                    className="w-full btn-classical-secondary flex items-center justify-center space-x-2"
                  >
                    <FiEdit3 className="w-4 h-4" />
                    <span>{t('edit_assignment')}</span>
                  </Link>

                  {/* 🆕 Botão de visualizar vídeo */}
                  {videoSubmission && (
                    <button
                      onClick={() => setShowVideoModal(true)}
                      className="w-full btn-classical-secondary flex items-center justify-center space-x-2 bg-accent-purple/10 border-accent-purple/30 text-accent-purple hover:bg-accent-purple/20"
                    >
                      <FiVideo className="w-4 h-4" />
                      <span>{t('watch_video')}</span>
                    </button>
                  )}

                  {assignment.lesson && (
                    <Link
                      href={`/teacher/lessons/${assignment.lesson.id}`}
                      className="w-full btn-classical-secondary flex items-center justify-center space-x-2"
                    >
                      <FiBookOpen className="w-4 h-4" />
                      <span>{t('view_lesson')}</span>
                    </Link>
                  )}

                  <Link
                    href={`/teacher/students/${assignment.student.id}`}
                    className="w-full btn-classical-secondary flex items-center justify-center space-x-2"
                  >
                    <FiUser className="w-4 h-4" />
                    <span>{t('student_profile')}</span>
                  </Link>
                </div>
              </AnimatedCard>
            </AnimatedItem>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-6 right-6 bg-accent-red/90 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg max-w-md">
            <div className="flex items-center space-x-3">
              <FiAlertCircle className="w-5 h-5 text-white" />
              <div>
                <p className="font-medium">Erro</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="ml-auto text-white hover:text-gray-200"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Approve Modal */}
        {showApproveModal && (
          <div className="fixed inset-0 bg-bg-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <AnimatedCard
              hover="none"
              className="classical-card w-full max-w-md"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-theme-primary classical-title">
                    {t('approve_assignment')}
                  </h2>
                  <button
                    onClick={() => setShowApproveModal(false)}
                    className="text-theme-tertiary hover:text-theme-primary"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-theme-secondary mb-4">
                  {t('confirm_approval_message')}
                </p>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowApproveModal(false)}
                    className="btn-classical-secondary"
                    disabled={loading.approve}
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleApproveAssignment}
                    disabled={loading.approve}
                    className="btn-classical-primary bg-accent-green border-accent-green hover:bg-accent-green/90 flex items-center space-x-2"
                  >
                    {loading.approve ? (
                      <FiRefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <FiCheck className="w-4 h-4" />
                    )}
                    <span>
                      {loading.approve
                        ? t('approving')
                        : t('approve_assignment')}
                    </span>
                  </button>
                </div>
              </div>
            </AnimatedCard>
          </div>
        )}

        {/* 🆕 Video Modal */}
        {showVideoModal && videoSubmission && (
          <Modal
            isOpen={showVideoModal}
            onClose={() => setShowVideoModal(false)}
            maxWidth="6xl"
          >
            <AnimatedCard hover="none">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      {t('video_modal_title')}
                    </h2>
                    <p className="text-theme-secondary text-sm">
                      {videoSubmission.originalName} •{' '}
                      {formatFileSize(videoSubmission.fileSize)} •{' '}
                      {formatDateTime(videoSubmission.uploadedAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={videoSubmission.filePath}
                      download={videoSubmission.originalName}
                      className="btn-classical-secondary flex items-center space-x-2"
                    >
                      <FiDownload className="w-4 h-4" />
                      <span>{t('download')}</span>
                    </a>
                    <button
                      onClick={() => setShowVideoModal(false)}
                      className="text-theme-tertiary hover:text-theme-primary"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="rounded-lg overflow-hidden bg-black">
                  <video
                    src={videoSubmission.filePath}
                    controls
                    autoPlay
                    className="w-full"
                    style={{ maxHeight: '80vh' }}
                  >
                    {t('browser_no_support')}
                  </video>
                </div>
              </div>
            </AnimatedCard>
          </Modal>
        )}
      </AnimatedContainer>
    </PageContainer>
  );
}
