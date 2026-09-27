// app/teacher/assignments/[id]/pageClient.tsx - ATUALIZADO COM TRADUÇÕES

'use client';

import { useState, useCallback } from 'react';
import {
  PiArrowLeft,
  PiArrowsClockwise,
  PiBookOpen,
  PiCalendarBlank,
  PiCheck,
  PiClock,
  PiDownloadSimple,
  PiFloppyDisk,
  PiPencilLine,
  PiPlay,
  PiStar,
  PiStarFill,
  PiTarget,
  PiUser,
  PiVideoCamera,
  PiWarningCircle,
  PiX,
} from 'react-icons/pi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../../components/animation/AnimatedComponents';
import { AssignmentDetailsData } from './pageServer';
import Image from '@/app/components/SmartImage';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAssignmentDetails } from '@/app/hooks/lessonsSystem/useAssignmentDetails';
import MusicalPiecesSection from '@/app/components/TeacherSystem/MusicalPiecesSection';
import Modal from '@/app/components/Modal';
import { useTranslation } from '@/app/context/TranslationContext';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';

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
  low: 'bg-ok/10 border-ok/30 text-ok',
  medium: 'bg-atencao/10 border-atencao/30 text-atencao',
  high: 'bg-erro/10 border-erro/30 text-erro',
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

    if (assignment.isOverdue) return 'bg-erro/10 border-erro/30 text-erro';
    if (assignment.isCompleted) return 'bg-ok/10 border-ok/30 text-ok';
    if (assignment.status === 'IN_PROGRESS')
      return 'bg-aviso/10 border-aviso/30 text-aviso';
    return 'bg-atencao/10 border-atencao/30 text-atencao';
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
          <Card densidade="larga" className="text-center max-w-md">
            <div className="w-16 h-16 bg-erro rounded-3xl flex items-center justify-center mx-auto mb-6">
              <PiWarningCircle className="w-8 h-8 text-theme-primary" />
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
          </Card>
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
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 items-start sm:items-center justify-between mb-8">
            <Inline gap={4}>
              <Link
                href="/teacher/assignments"
                className="w-10 h-10 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-ouro transition-all flex items-center justify-center group"
              >
                <PiArrowLeft className="w-4 h-4 text-theme-tertiary group-hover:text-ouro-texto transition-colors" />
              </Link>
              <div>
                <div className="flex items-center gap-4 justify-center">
                  <h1 className="text-3xl font-bold text-gradient-brand classical-title">
                    {assignment.title}
                  </h1>
                  <span
                    className={`px-3 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                      assignment
                    )}`}
                  >
                    {getStatusText(assignment)}
                  </span>
                </div>
                <p className="text-theme-secondary classical-subtitle">
                  {t('assignment_by')} {assignment.student.name}
                </p>
              </div>
            </Inline>

            {/* Quick Actions */}
            <div className="flex w-full sm:w-auto items-end justify-end space-x-3">
              {/* 🆕 Indicador de vídeo */}
              {videoSubmission && (
                <Inline
                  as="span"
                  gap={1}
                  className="px-3 py-2 rounded-full text-sm font-medium border bg-ouro/10 border-ouro/30 text-ouro-texto"
                >
                  <PiVideoCamera className="w-3 h-3" />
                  <span>{t('has_video')}</span>
                </Inline>
              )}

              {!assignment.isCompleted && initialData.canGiveFeedback && (
                <Inline
                  as="button"
                  gap={2}
                  onClick={() => setShowApproveModal(true)}
                  className="btn-classical-primary"
                >
                  <PiCheck className="w-4 h-4" />
                  <span>{t('approve_assignment')}</span>
                </Inline>
              )}
            </div>
          </div>
        </AnimatedItem>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 order-2 lg:order-1 space-y-8 mb-8 sm:mb-0">
            {/* Assignment Info */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h2 className="text-xl font-bold text-theme-primary classical-title mb-6">
                  {t('assignment_details')}
                </h2>

                <Stack gap={6}>
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Stack gap={2}>
                      <label className="text-sm font-medium text-theme-tertiary block">
                        {t('assignment_type')}
                      </label>
                      <div className="text-theme-primary">
                        {t(
                          ASSIGNMENT_TYPES[
                            assignment.type as keyof typeof ASSIGNMENT_TYPES
                          ]
                        ) || assignment.type}
                      </div>
                    </Stack>

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
                      <Stack gap={2}>
                        <label className="text-sm font-medium text-theme-tertiary block">
                          {t('due_date')}
                        </label>
                        <Inline gap={2} className="text-theme-primary">
                          <PiCalendarBlank className="w-4 h-4" />
                          <span>{formatDate(assignment.dueDate)}</span>
                          {assignment.daysUntilDue !== null && (
                            <span
                              className={`text-sm ${
                                assignment.isOverdue
                                  ? 'text-erro'
                                  : (assignment.daysUntilDue ?? 0 <= 1)
                                    ? 'text-atencao'
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
                        </Inline>
                      </Stack>
                    )}

                    {assignment.estimatedTime && (
                      <Stack gap={2}>
                        <label className="text-sm font-medium text-theme-tertiary block">
                          {t('estimated_time')}
                        </label>
                        <Inline gap={2} className="text-theme-primary">
                          <PiClock className="w-4 h-4" />
                          <span>
                            {assignment.estimatedTime} {t('minutes')}
                          </span>
                          {assignment.actualTime && (
                            <Text papel="rotulo" tom="fraco">
                              (Real: {assignment.actualTime} min)
                            </Text>
                          )}
                        </Inline>
                      </Stack>
                    )}
                  </div>

                  {/* Description */}
                  <Stack gap={2}>
                    <label className="text-sm font-medium text-theme-tertiary block">
                      {t('description')}
                    </label>
                    <div className="text-theme-primary whitespace-pre-wrap">
                      {assignment.description}
                    </div>
                  </Stack>

                  {/* Goals */}
                  {assignment.practiceGoals.length > 0 && (
                    <Stack gap={2}>
                      <label className="text-sm font-medium text-theme-tertiary block">
                        {t('practice_goals')}
                      </label>
                      <Stack gap={2}>
                        {assignment.practiceGoals.map((goal, index) => (
                          <Inline
                            gap={2}
                            key={index}
                            className="text-theme-primary"
                          >
                            <PiTarget className="w-4 h-4 text-aviso" />
                            <span>{goal}</span>
                          </Inline>
                        ))}
                      </Stack>
                    </Stack>
                  )}

                  {assignment.technicalGoals.length > 0 && (
                    <Stack gap={2}>
                      <label className="text-sm font-medium text-theme-tertiary block">
                        {t('technical_goals')}
                      </label>
                      <Stack gap={2}>
                        {assignment.technicalGoals.map((goal, index) => (
                          <Inline
                            gap={2}
                            key={index}
                            className="text-theme-primary"
                          >
                            <PiTarget className="w-4 h-4 text-ok" />
                            <span>{goal}</span>
                          </Inline>
                        ))}
                      </Stack>
                    </Stack>
                  )}

                  {assignment.exercises.length > 0 && (
                    <Stack gap={2}>
                      <label className="text-sm font-medium text-theme-tertiary block">
                        {t('exercises')}
                      </label>
                      <Stack gap={2}>
                        {assignment.exercises.map((exercise, index) => (
                          <Inline
                            gap={2}
                            key={index}
                            className="text-theme-primary"
                          >
                            <PiBookOpen className="w-4 h-4 text-ouro-texto" />
                            <span>{exercise}</span>
                          </Inline>
                        ))}
                      </Stack>
                    </Stack>
                  )}

                  {/* Progress */}
                  {assignment.progress !== null &&
                    assignment.progress !== undefined && (
                      <Stack gap={2}>
                        <label className="text-sm font-medium text-theme-tertiary block">
                          {t('progress')}
                        </label>
                        <Inline gap={4}>
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
                        </Inline>
                      </Stack>
                    )}
                </Stack>
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
                        <Inline gap={4}>
                          <div className="w-12 h-12 bg-ouro/10 border border-ouro/30 rounded-lg flex items-center justify-center">
                            <PiVideoCamera className="w-6 h-6 text-ouro-texto" />
                          </div>
                          <Stack gap={1}>
                            <h4 className="font-medium text-theme-primary">
                              {videoSubmission.originalName}
                            </h4>
                            <Inline
                              gap={4}
                              className="text-sm text-theme-secondary"
                            >
                              <span>
                                {formatFileSize(videoSubmission.fileSize)}
                              </span>
                              <span>
                                {t('uploaded_at')}{' '}
                                {formatDateTime(videoSubmission.uploadedAt)}
                              </span>
                            </Inline>
                          </Stack>
                        </Inline>
                        <Inline gap={2}>
                          <Inline
                            as="button"
                            gap={2}
                            onClick={() => setShowVideoModal(true)}
                            className="btn-classical-primary"
                          >
                            <PiPlay className="w-4 h-4" />
                            <span>{t('watch')}</span>
                          </Inline>
                          <Inline
                            as="a"
                            gap={2}
                            href={videoSubmission.filePath}
                            download={videoSubmission.originalName}
                            className="btn-classical-secondary"
                          >
                            <PiDownloadSimple className="w-4 h-4" />
                            <span>{t('download')}</span>
                          </Inline>
                        </Inline>
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
                    <Text papel="rotulo" tom="fraco" as="div" className="mb-4">
                      {t('submitted_on', {
                        date: formatDateTime(assignment.submissionDate),
                      })}
                    </Text>
                  )}

                  {/* Student Notes */}
                  {assignment.studentNotes && (
                    <Stack gap={2} className="mb-6">
                      <label className="text-sm font-medium text-theme-tertiary block">
                        {t('student_comments')}
                      </label>
                      <div className="p-4 bg-sup-1/10 rounded-lg bg-theme-elevated">
                        <div className="text-theme-primary whitespace-pre-wrap">
                          {assignment.studentNotes}
                        </div>
                      </div>
                    </Stack>
                  )}

                  {/* Student Rating */}
                  {assignment.studentRating && (
                    <Stack gap={2} className="mb-6">
                      <label className="text-sm font-medium text-theme-tertiary block">
                        {t('student_rating')}
                      </label>
                      <Inline gap={2}>
                        {[1, 2, 3, 4, 5].map((star) =>
                          star <= assignment.studentRating! ? (
                            <PiStarFill
                              key={star}
                              className={`w-5 h-5 ${
                                star <= assignment.studentRating!
                                  ? 'text-atencao fill-current'
                                  : 'text-theme-tertiary'
                              }`}
                            />
                          ) : (
                            <PiStar
                              key={star}
                              className={`w-5 h-5 ${
                                star <= assignment.studentRating!
                                  ? 'text-atencao fill-current'
                                  : 'text-theme-tertiary'
                              }`}
                            />
                          )
                        )}
                        <span className="text-theme-primary ml-2">
                          {assignment.studentRating}/5
                        </span>
                      </Inline>
                    </Stack>
                  )}

                  {/* 🆕 Progress Milestones do aluno */}
                  {assignment.submissions?.progressMilestones && (
                    <Stack gap={3} className="mb-6">
                      <label className="text-sm font-medium text-theme-tertiary block">
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
                              <Inline
                                gap={2}
                                key={key}
                                className="bg-theme-elevated p-2 rounded-lg"
                              >
                                <PiCheck className="w-4 h-4 text-ok" />
                                <Text papel="rotulo" tom="forte">
                                  {milestoneLabels[key] || key}
                                </Text>
                              </Inline>
                            );
                          })}
                      </div>
                    </Stack>
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
                    <Inline
                      as="button"
                      gap={2}
                      onClick={() => setIsEditingFeedback(true)}
                      className="btn-classical-secondary"
                    >
                      <PiPencilLine className="w-4 h-4" />
                      <span>{t('edit')}</span>
                    </Inline>
                  )}
                </div>

                <Stack>
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
                            ? 'bg-sup-1/10 border-linha/20'
                            : 'bg-sup-1/5 border-linha/10'
                        }`}
                      >
                        <div className="text-theme-primary whitespace-pre-wrap">
                          {feedbackData.teacherFeedback || t('no_feedback_yet')}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Teacher Rating */}
                  <Stack gap={2}>
                    <label className="text-sm font-medium text-theme-tertiary block">
                      {t('your_rating')}
                    </label>
                    <Inline gap={2}>
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
                          {star <= feedbackData.teacherRating ? (
                            <PiStarFill
                              className={`w-6 h-6 ${
                                star <= feedbackData.teacherRating
                                  ? 'text-atencao fill-current'
                                  : 'text-theme-tertiary'
                              }`}
                            />
                          ) : (
                            <PiStar
                              className={`w-6 h-6 ${
                                star <= feedbackData.teacherRating
                                  ? 'text-atencao fill-current'
                                  : 'text-theme-tertiary'
                              }`}
                            />
                          )}
                        </button>
                      ))}
                      <span className="text-theme-primary ml-2">
                        {feedbackData.teacherRating
                          ? `${feedbackData.teacherRating}/5`
                          : '0/5'}
                      </span>
                    </Inline>
                  </Stack>

                  {/* Edit Actions */}
                  {isEditingFeedback && (
                    <Inline
                      gap={3}
                      className="justify-end pt-4 border-t border-theme-secondary"
                    >
                      <Button
                        variante="secundario"
                        type="submit"
                        onClick={() => setIsEditingFeedback(false)}
                        disabled={loading.updateFeedback}
                      >
                        {t('cancel')}
                      </Button>
                      <Inline
                        as="button"
                        gap={2}
                        onClick={handleSaveFeedback}
                        disabled={loading.updateFeedback}
                        className="btn-classical-primary"
                      >
                        {loading.updateFeedback ? (
                          <PiArrowsClockwise className="w-4 h-4 animate-spin" />
                        ) : (
                          <PiFloppyDisk className="w-4 h-4" />
                        )}
                        <span>
                          {loading.updateFeedback
                            ? t('saving')
                            : t('save_feedback')}
                        </span>
                      </Inline>
                    </Inline>
                  )}
                </Stack>
              </AnimatedCard>
            </AnimatedItem>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 order-1 lg:order-2">
            {/* Student Info */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                  {t('student')}
                </h3>

                <Inline gap={3} className="mb-4">
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
                    <div className="w-12 h-12 fill-ouro rounded-full flex items-center justify-center">
                      <PiUser className="w-6 h-6 text-theme-primary" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-theme-primary">
                      {assignment.student.name}
                    </div>
                    <Link
                      href={`/teacher/students/${assignment.student.id}`}
                      className="text-sm text-brand-primary hover:text-ouro-texto"
                    >
                      {t('view_student_profile')}
                    </Link>
                  </div>
                </Inline>
              </AnimatedCard>
            </AnimatedItem>

            {/* Assignment Info */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                  {t('information')}
                </h3>
                <Stack gap={3} className="text-sm">
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
                      <span className="text-ouro-texto">
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
                        className="block text-brand-primary hover:text-ouro-texto mt-1"
                      >
                        {assignment.lesson.title}
                      </Link>
                    </div>
                  )}
                </Stack>
              </AnimatedCard>
            </AnimatedItem>

            {/* Quick Actions */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                  {t('actions')}
                </h3>
                <Stack gap={2}>
                  <Link
                    href={`/teacher/assignments/${assignment.id}/edit`}
                    className="w-full btn-classical-secondary flex items-center justify-center space-x-2"
                  >
                    <PiPencilLine className="w-4 h-4" />
                    <span>{t('edit_assignment')}</span>
                  </Link>

                  {/* 🆕 Botão de visualizar vídeo */}
                  {videoSubmission && (
                    <Inline
                      as="button"
                      gap={2}
                      onClick={() => setShowVideoModal(true)}
                      className="w-full btn-classical-secondary justify-center bg-ouro/10 border-ouro/30 text-ouro-texto hover:bg-ouro/20"
                    >
                      <PiVideoCamera className="w-4 h-4" />
                      <span>{t('watch_video')}</span>
                    </Inline>
                  )}

                  {assignment.lesson && (
                    <Link
                      href={`/teacher/lessons/${assignment.lesson.id}`}
                      className="w-full btn-classical-secondary flex items-center justify-center space-x-2"
                    >
                      <PiBookOpen className="w-4 h-4" />
                      <span>{t('view_lesson')}</span>
                    </Link>
                  )}

                  <Link
                    href={`/teacher/students/${assignment.student.id}`}
                    className="w-full btn-classical-secondary flex items-center justify-center space-x-2"
                  >
                    <PiUser className="w-4 h-4" />
                    <span>{t('student_profile')}</span>
                  </Link>
                </Stack>
              </AnimatedCard>
            </AnimatedItem>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-6 right-6 bg-erro/90 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg max-w-md">
            <Inline gap={3}>
              <PiWarningCircle className="w-5 h-5 text-white" />
              <div>
                <p className="font-medium">Erro</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="ml-auto text-white hover:text-texto-fraco"
              >
                <PiX className="w-4 h-4" />
                <NomeAcao acao="fechar" />
              </button>
            </Inline>
          </div>
        )}

        {/* Approve Modal */}
        {showApproveModal && (
          <div className="fixed inset-0 bg-veu backdrop-blur-sm z-dialogo flex items-center justify-center p-4">
            <AnimatedCard
              hover="none"
              className="classical-card w-full max-w-md"
            >
              <Stack className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-theme-primary classical-title">
                    {t('approve_assignment')}
                  </h2>
                  <button
                    onClick={() => setShowApproveModal(false)}
                    className="text-theme-tertiary hover:text-texto"
                  >
                    <PiX className="w-5 h-5" />
                    <NomeAcao acao="fechar" />
                  </button>
                </div>

                <p className="text-theme-secondary">
                  {t('confirm_approval_message')}
                </p>

                <Inline gap={3} className="justify-end">
                  <Button
                    variante="secundario"
                    type="submit"
                    onClick={() => setShowApproveModal(false)}
                    disabled={loading.approve}
                  >
                    {t('cancel')}
                  </Button>
                  <Inline
                    as="button"
                    gap={2}
                    onClick={handleApproveAssignment}
                    disabled={loading.approve}
                    className="btn-classical-primary bg-ok border-ok hover:bg-ok/90"
                  >
                    {loading.approve ? (
                      <PiArrowsClockwise className="w-4 h-4 animate-spin" />
                    ) : (
                      <PiCheck className="w-4 h-4" />
                    )}
                    <span>
                      {loading.approve
                        ? t('approving')
                        : t('approve_assignment')}
                    </span>
                  </Inline>
                </Inline>
              </Stack>
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
              <Stack gap={6} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      {t('video_modal_title')}
                    </h2>
                    <Text papel="rotulo" tom="suave" as="p">
                      {videoSubmission.originalName} •{' '}
                      {formatFileSize(videoSubmission.fileSize)} •{' '}
                      {formatDateTime(videoSubmission.uploadedAt)}
                    </Text>
                  </div>
                  <Inline gap={2}>
                    <Inline
                      as="a"
                      gap={2}
                      href={videoSubmission.filePath}
                      download={videoSubmission.originalName}
                      className="btn-classical-secondary"
                    >
                      <PiDownloadSimple className="w-4 h-4" />
                      <span>{t('download')}</span>
                    </Inline>
                    <button
                      onClick={() => setShowVideoModal(false)}
                      className="text-theme-tertiary hover:text-texto"
                    >
                      <PiX className="w-5 h-5" />
                      <NomeAcao acao="fechar" />
                    </button>
                  </Inline>
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
              </Stack>
            </AnimatedCard>
          </Modal>
        )}
      </AnimatedContainer>
    </PageContainer>
  );
}
