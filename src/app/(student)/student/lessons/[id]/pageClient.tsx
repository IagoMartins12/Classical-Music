// app/student/lessons/[id]/pageClient.tsx - ATUALIZADO com modais funcionais e traduções

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  PiArrowLeft,
  PiArrowsClockwise,
  PiBookOpen,
  PiCalendarBlank,
  PiChatCenteredText,
  PiCheck,
  PiClock,
  PiFloppyDisk,
  PiInfo,
  PiMapPin,
  PiMusicNotes,
  PiPaperPlaneRight,
  PiPencilLine,
  PiRepeat,
  PiTarget,
  PiUser,
  PiUserMinus,
  PiX,
} from 'react-icons/pi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../../components/animation/AnimatedComponents';
import { StudentLessonDetail } from './pageServer';
import Link from 'next/link';
import Image from '@/app/components/SmartImage';
import Modal from '@/app/components/Modal';
import { useToast } from '@/app/hooks/useToast';
import MusicalPiecesSection from '@/app/components/TeacherSystem/MusicalPiecesSection';
import { useTranslation } from '@/app/context/TranslationContext';
import { apiFetch } from '@/app/libs/api/client';
import { loadStudentLesson } from '@/app/requests/portal/student';
import { sendStudentLessonNotice } from '@/app/requests/portal/lesson-actions';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Field } from '@/app/components/ui/Field';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';

interface StudentLessonDetailPageClientProps {
  initialData: StudentLessonDetail | null;
  errorMessage?: string;
}

const translatePendingAssignments = (status: string, t: any) => {
  const statusMap: { [key: string]: string } = {
    PENDING: t('assignment_status_pending'),
    IN_PROGRESS: t('assignment_status_in_progress'),
    COMPLETED: t('assignment_status_completed'),
    OVERDUE: t('assignment_status_overdue'),
  };
  return statusMap[status] || t('assignment_status_unknown');
};

export default function StudentLessonDetailPageClient({
  initialData,
  errorMessage,
}: StudentLessonDetailPageClientProps) {
  const { t } = useTranslation({ sections: ['student/lessonsId'] });

  const [lesson, setLesson] = useState<StudentLessonDetail | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorMessage || null);

  // Estados para feedback do aluno
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [studentFeedback, setStudentFeedback] = useState('');
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  // Estados para modal de ação do aluno
  const [showStudentActionModal, setShowStudentActionModal] = useState(false);
  const [studentActionType, setStudentActionType] = useState<
    'absence' | 'reschedule'
  >('absence');
  const [studentMessage, setStudentMessage] = useState('');
  const [loadingStudentAction, setLoadingStudentAction] = useState(false);
  const [actionSent, setActionSent] = useState(false);

  const toast = useToast();

  // Inicializar feedback se existir
  useEffect(() => {
    if (lesson?.studentFeedback) {
      setStudentFeedback(lesson.studentFeedback);
    }
  }, [lesson?.studentFeedback]);

  // Função para atualizar dados da aula
  const refreshLesson = useCallback(async () => {
    if (!lesson?.id) return;

    setLoading(true);
    try {
      setLesson(await loadStudentLesson(lesson.id));
      setError(null);
      toast.success(t('refresh'));
    } catch (error) {
      toast.error(t('error_loading_lesson'));
      console.error('Erro ao atualizar aula:', error);
    } finally {
      setLoading(false);
    }
  }, [lesson?.id, toast, t]);

  // Função para salvar feedback do aluno
  const handleSaveFeedback = useCallback(async () => {
    if (!lesson?.id || !studentFeedback.trim()) return;

    setLoadingFeedback(true);
    try {
      await apiFetch(`/lessons/${lesson.id}/feedback`, {
        method: 'PATCH',
        body: { feedback: studentFeedback.trim() },
      });

      setLesson({ ...lesson, studentFeedback: studentFeedback.trim() });
      setIsEditingFeedback(false);
      toast.success('Feedback salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar feedback:', error);
      toast.error('Erro ao salvar feedback.');
    } finally {
      setLoadingFeedback(false);
    }
  }, [lesson, studentFeedback, toast]);

  // Handlers para ações do aluno
  const handleStudentAction = useCallback(
    (actionType: 'absence' | 'reschedule') => {
      setStudentActionType(actionType);
      setStudentMessage('');
      setShowStudentActionModal(true);
    },
    []
  );

  // Função para enviar ação do aluno
  const executeStudentAction = useCallback(async () => {
    if (!lesson?.id) return;

    setLoadingStudentAction(true);

    try {
      // A API responde com erro quando algo dá errado; não há mais o
      // `response.ok` do `fetch` cru para conferir aqui.
      await sendStudentLessonNotice(
        lesson.id,
        studentActionType,
        studentMessage.trim() || undefined
      );

      setActionSent(true);

      const actionText =
        studentActionType === 'absence'
          ? t('absence_notified')
          : t('reschedule_notified');

      toast.success(
        `${t('message_sent')} ${t('professor_notified')} ${actionText}.`
      );

      // Fechar modal após 2 segundos
      setTimeout(() => {
        setShowStudentActionModal(false);
        setActionSent(false);
      }, 2000);
    } catch (error) {
      console.error('Erro ao enviar ação:', error);
      toast.error('Erro ao enviar mensagem.');
    } finally {
      setLoadingStudentAction(false);
    }
  }, [lesson?.id, studentMessage, studentActionType, toast, t]);

  // Função para formatar data/hora
  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
    });
  };

  // Função para formatar duração
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
    }
    return `${mins}min`;
  };

  // Função para cores do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-accent-green/10 border-accent-green/30 text-accent-green';
      case 'CANCELLED':
        return 'bg-accent-red/10 border-accent-red/30 text-accent-red';
      case 'NO_SHOW':
        return 'bg-accent-yellow/10 border-accent-yellow/30 text-accent-yellow';
      case 'SCHEDULED':
        return 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue';
      default:
        return 'bg-theme-secondary/10 border-theme-secondary/30 text-theme-secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      COMPLETED: 'Concluída',
      CANCELLED: 'Cancelada',
      NO_SHOW: 'Faltou',
      SCHEDULED: 'Agendada',
    };
    return statusMap[status] || status;
  };

  // Render error state
  if ((error || errorMessage) && !lesson) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <Card densidade="larga" className="text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <PiBookOpen className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              {t('error_loading_lesson')}
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {error || errorMessage}
            </p>
            <Stack gap={3}>
              <Inline
                as="button"
                gap={2}
                onClick={refreshLesson}
                disabled={loading}
                className="btn-classical-primary w-full justify-center"
              >
                <PiArrowsClockwise
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                />
                <span>{loading ? t('loading') : t('try_again')}</span>
              </Inline>
              <Link
                href="/student/lessons"
                className="btn-classical-secondary w-full text-center block"
              >
                {t('back_to_lessons')}
              </Link>
            </Stack>
          </Card>
        </div>
      </PageContainer>
    );
  }

  if (!lesson) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <Card densidade="larga" className="text-center">
            <PiArrowsClockwise className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-4" />
            <p className="text-theme-secondary">{t('loading_lesson')}</p>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex flex-col gap-4 sm:gap-0 sm:flex-row items-center justify-between mb-8">
            <Inline gap={4}>
              <Link
                href="/student/lessons"
                className="w-10 h-10 rounded-lg bg-theme-elevated hover:bg-interactive-hover transition-colors flex items-center justify-center"
              >
                <PiArrowLeft className="w-5 h-5 text-theme-tertiary" />
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-theme-primary classical-title">
                  {t('lesson_details')}
                </h1>
                <p className="text-theme-secondary classical-subtitle">
                  {t('lesson_details_subtitle')}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  lesson.status
                )}`}
              >
                {getStatusLabel(lesson.status)}
              </span>
            </Inline>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 items-center space-x-3">
              {/* Ações do Aluno - apenas para aulas agendadas */}
              {lesson.status === 'SCHEDULED' && (
                <Inline gap={2}>
                  <Inline
                    as="button"
                    gap={2}
                    onClick={() => handleStudentAction('absence')}
                    className="btn-classical-secondary text-accent-red border-accent-red/30 hover:bg-accent-red/10 text-sm"
                  >
                    <PiUserMinus className="w-4 h-4" />
                    <span>{t('cannot_attend')}</span>
                  </Inline>
                  <Inline
                    as="button"
                    gap={2}
                    onClick={() => handleStudentAction('reschedule')}
                    className="btn-classical-secondary text-accent-blue border-accent-blue/30 hover:bg-accent-blue/10 text-sm"
                  >
                    <PiCalendarBlank className="w-4 h-4" />
                    <span>{t('reschedule')}</span>
                  </Inline>
                </Inline>
              )}

              <Inline
                as="button"
                gap={2}
                onClick={refreshLesson}
                disabled={loading}
                className="btn-classical-secondary"
              >
                <PiArrowsClockwise
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                />
                <span>{t('refresh')}</span>
              </Inline>
            </div>
          </div>
        </AnimatedItem>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <div className="flex items-center mb-4">
                  <Inline
                    as="h2"
                    gap={2}
                    className="text-lg font-bold text-theme-primary"
                  >
                    <PiCalendarBlank className="w-5 h-5" />
                    <span>{t('lesson_info')}</span>
                  </Inline>
                </div>

                <Stack>
                  <h3 className="text-xl font-bold text-theme-primary">
                    {lesson.title}
                  </h3>
                  {lesson.description && (
                    <p className="text-theme-secondary">{lesson.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <Inline gap={2} className="text-theme-secondary">
                      <PiCalendarBlank className="w-4 h-4" />
                      <span>{formatDateTime(lesson.scheduledAt)}</span>
                    </Inline>
                    <Inline gap={2} className="text-theme-secondary">
                      <PiClock className="w-4 h-4" />
                      <span>{formatDuration(lesson.duration)}</span>
                    </Inline>
                  </div>

                  {lesson.location && (
                    <Inline gap={2} className="text-theme-secondary">
                      <PiMapPin className="w-4 h-4" />
                      <span>{lesson.location}</span>
                    </Inline>
                  )}

                  {/* Recurrence Info */}
                  {lesson.isRecurring && (
                    <Stack gap={2} className="bg-theme-elevated rounded-lg p-4">
                      <Inline gap={2} className="text-accent-blue">
                        <PiRepeat className="w-4 h-4" />
                        <span className="font-medium">
                          {t('recurring_lesson')}
                        </span>
                      </Inline>
                      <Text papel="rotulo" tom="suave" as="p">
                        {t('recurring_lesson_description')}
                      </Text>
                    </Stack>
                  )}
                </Stack>
              </AnimatedCard>
            </AnimatedItem>

            {/* Peças Musicais */}
            {lesson.workScores && lesson.workScores.length > 0 && (
              <MusicalPiecesSection
                workScores={lesson.workScores}
                title={t('musical_pieces')}
                emptyMessage={t('no_musical_pieces')}
              />
            )}

            {/* Objectives */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <div className="flex items-center mb-4">
                  <Inline
                    as="h2"
                    gap={2}
                    className="text-lg font-bold text-theme-primary"
                  >
                    <PiTarget className="w-5 h-5" />
                    <span>{t('lesson_objectives')}</span>
                  </Inline>
                </div>

                <Stack gap={2}>
                  {lesson.objectives.length > 0 ? (
                    lesson.objectives.map((objective, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-brand-primary rounded-full mt-2"></div>
                        <span className="text-theme-secondary">
                          {objective}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-theme-tertiary italic">
                      {t('no_objectives')}
                    </p>
                  )}
                </Stack>
              </AnimatedCard>
            </AnimatedItem>

            {/* Topics & Techniques */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <div className="flex items-center mb-4">
                  <Inline
                    as="h2"
                    gap={2}
                    className="text-lg font-bold text-theme-primary"
                  >
                    <PiBookOpen className="w-5 h-5" />
                    <span>{t('topics_techniques')}</span>
                  </Inline>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Stack gap={3}>
                    <h3 className="font-medium text-theme-primary">
                      {t('topics_covered')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {lesson.topics.length > 0 ? (
                        lesson.topics.map((topic, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded-full text-sm"
                          >
                            {topic}
                          </span>
                        ))
                      ) : (
                        <Text papel="rotulo" tom="fraco" className="italic">
                          {t('no_topics')}
                        </Text>
                      )}
                    </div>
                  </Stack>

                  <Stack gap={3}>
                    <h3 className="font-medium text-theme-primary">
                      {t('techniques_worked')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {lesson.techniques.length > 0 ? (
                        lesson.techniques.map((technique, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-accent-purple/10 border border-accent-purple/30 text-accent-purple rounded-full text-sm"
                          >
                            {technique}
                          </span>
                        ))
                      ) : (
                        <Text papel="rotulo" tom="fraco" className="italic">
                          {t('no_techniques')}
                        </Text>
                      )}
                    </div>
                  </Stack>
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Notes Section */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <Inline
                    as="h2"
                    gap={2}
                    className="text-lg font-bold text-theme-primary"
                  >
                    <PiChatCenteredText className="w-5 h-5" />
                    <span>{t('notes_observations')}</span>
                  </Inline>
                </div>

                <Stack>
                  {lesson.publicNotes && (
                    <Stack gap={2}>
                      <h3 className="font-medium text-theme-primary">
                        {t('teacher_notes')}
                      </h3>
                      <div className="bg-theme-elevated rounded-lg p-4">
                        <p className="text-theme-secondary whitespace-pre-wrap">
                          {lesson.publicNotes}
                        </p>
                      </div>
                    </Stack>
                  )}

                  {lesson.lessonSummary && (
                    <Stack gap={2}>
                      <h3 className="font-medium text-theme-primary">
                        {t('lesson_summary')}
                      </h3>
                      <div className="bg-theme-elevated rounded-lg p-4">
                        <p className="text-theme-secondary whitespace-pre-wrap">
                          {lesson.lessonSummary}
                        </p>
                      </div>
                    </Stack>
                  )}

                  {lesson.homework && (
                    <Stack gap={2}>
                      <h3 className="font-medium text-theme-primary">
                        {t('homework')}
                      </h3>
                      <div className="bg-theme-elevated rounded-lg p-4">
                        <p className="text-theme-secondary whitespace-pre-wrap">
                          {lesson.homework}
                        </p>
                      </div>
                    </Stack>
                  )}

                  {/* Student Feedback Section */}
                  {lesson.permissions.canAddFeedback && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-theme-primary">
                          {t('your_feedback')}
                        </h3>
                        {!isEditingFeedback && lesson.studentFeedback ? (
                          <Inline
                            as="button"
                            gap={1}
                            onClick={() => setIsEditingFeedback(true)}
                            className="btn-classical-secondary text-sm"
                          >
                            <PiPencilLine className="w-3 h-3" />
                            <span>{t('edit')}</span>
                          </Inline>
                        ) : null}
                      </div>

                      {isEditingFeedback ? (
                        <div className="space-y-3">
                          <textarea
                            value={studentFeedback}
                            onChange={(e) => setStudentFeedback(e.target.value)}
                            className="input-classical-2 w-full h-24"
                            placeholder={t('share_experience')}
                          />
                          <Inline gap={2}>
                            <Inline
                              as="button"
                              gap={1}
                              onClick={handleSaveFeedback}
                              disabled={
                                loadingFeedback || !studentFeedback.trim()
                              }
                              className="btn-classical-primary text-sm"
                            >
                              {loadingFeedback ? (
                                <PiArrowsClockwise className="w-3 h-3 animate-spin" />
                              ) : (
                                <PiFloppyDisk className="w-3 h-3" />
                              )}
                              <span>{t('save')}</span>
                            </Inline>
                            <Inline
                              as="button"
                              gap={1}
                              onClick={() => setIsEditingFeedback(false)}
                              className="btn-classical-secondary text-sm"
                            >
                              <PiX className="w-3 h-3" />
                              <span>{t('cancel')}</span>
                            </Inline>
                          </Inline>
                        </div>
                      ) : lesson.studentFeedback ? (
                        <div className="bg-theme-elevated rounded-lg p-4 mt-4">
                          <p className="text-theme-secondary whitespace-pre-wrap">
                            {lesson.studentFeedback}
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsEditingFeedback(true)}
                          className="w-full p-4 border-2 border-dashed border-theme-secondary/30 rounded-lg text-theme-tertiary hover:border-brand-primary/50 hover:text-brand-primary transition-colors"
                        >
                          {t('add_feedback')}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Display existing feedback for completed lessons */}
                  {lesson.studentFeedback &&
                    !lesson.permissions.canAddFeedback && (
                      <Stack gap={2}>
                        <h3 className="font-medium text-theme-primary">
                          {t('your_feedback')}
                        </h3>
                        <div className="bg-accent-yellow/5 border border-accent-yellow/20 rounded-lg p-4">
                          <p className="text-theme-secondary whitespace-pre-wrap">
                            {lesson.studentFeedback}
                          </p>
                        </div>
                      </Stack>
                    )}

                  {!lesson.publicNotes &&
                    !lesson.lessonSummary &&
                    !lesson.homework &&
                    !lesson.studentFeedback &&
                    !lesson.permissions.canAddFeedback && (
                      <p className="text-theme-tertiary italic">
                        {t('no_notes_yet')}
                      </p>
                    )}
                </Stack>
              </AnimatedCard>
            </AnimatedItem>
          </div>

          {/* Right Column - Teacher & Info */}
          <div className="space-y-6">
            {/* Teacher Info */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h2 className="text-lg font-bold text-theme-primary mb-4">
                  {t('teacher')}
                </h2>

                <Inline gap={4} className="mb-6">
                  {lesson.teacher.image ? (
                    <div className="w-16 h-16 relative rounded-full overflow-hidden">
                      <Image
                        src={lesson.teacher.image}
                        alt={lesson.teacher.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center">
                      <PiUser className="w-8 h-8 text-theme-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-theme-primary">
                      {lesson.teacher.name}
                    </h3>
                    <Text papel="rotulo" tom="fraco" as="p">
                      {lesson.teacher.email}
                    </Text>
                  </div>
                </Inline>

                {/* Relationship Stats */}
                <Stack gap={2} className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">
                      {t('teaching_since')}:
                    </span>
                    <span className="text-theme-primary font-medium">
                      {lesson.relationship.relationshipDuration}
                    </span>
                  </div>
                </Stack>
              </AnimatedCard>
            </AnimatedItem>

            {/* Attendance Status */}
            {lesson.studentPresent !== undefined && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h2 className="text-lg font-bold text-theme-primary mb-4">
                    {t('attendance_status')}
                  </h2>

                  <div
                    className={`p-4 rounded-lg ${
                      lesson.studentPresent
                        ? 'bg-accent-green/10 border border-accent-green/30'
                        : 'bg-accent-red/10 border border-accent-red/30'
                    }`}
                  >
                    <Inline gap={2} className="mb-2">
                      {lesson.studentPresent ? (
                        <PiUser className="w-5 h-5 text-accent-green" />
                      ) : (
                        <PiUserMinus className="w-5 h-5 text-accent-red" />
                      )}
                      <span
                        className={`font-medium ${
                          lesson.studentPresent
                            ? 'text-accent-green'
                            : 'text-accent-red'
                        }`}
                      >
                        {lesson.studentPresent ? t('present') : t('absent')}
                      </span>
                    </Inline>

                    {lesson.punctuality && (
                      <Text papel="rotulo" tom="suave" as="p">
                        {t('punctuality')}:{' '}
                        {lesson.punctuality === 'on_time'
                          ? t('on_time')
                          : lesson.punctuality === 'late'
                            ? t('late')
                            : t('early')}
                      </Text>
                    )}

                    {lesson.engagement && (
                      <Text papel="rotulo" tom="suave" as="p">
                        {t('engagement')}: {lesson.engagement}/5
                      </Text>
                    )}

                    {lesson.preparation && (
                      <Text papel="rotulo" tom="suave" as="p">
                        {t('preparation')}: {lesson.preparation}/5
                      </Text>
                    )}
                  </div>
                </AnimatedCard>
              </AnimatedItem>
            )}

            {/* Progress Summary */}
            {(lesson.skillsWorked.length > 0 ||
              lesson.improvements.length > 0 ||
              lesson.challenges.length > 0) && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h2 className="text-lg font-bold text-theme-primary mb-4">
                    {t('lesson_progress')}
                  </h2>

                  <Stack>
                    {lesson.skillsWorked.length > 0 && (
                      <Stack gap={2}>
                        <h4 className="font-medium text-theme-primary">
                          {t('skills_worked')}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {lesson.skillsWorked.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-accent-blue/10 text-accent-blue text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </Stack>
                    )}

                    {lesson.improvements.length > 0 && (
                      <Stack gap={2}>
                        <h4 className="font-medium text-theme-primary">
                          {t('improvements')}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {lesson.improvements.map((improvement, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-accent-green/10 text-accent-green text-xs rounded"
                            >
                              {improvement}
                            </span>
                          ))}
                        </div>
                      </Stack>
                    )}

                    {lesson.challenges.length > 0 && (
                      <Stack gap={2}>
                        <h4 className="font-medium text-theme-primary">
                          {t('challenges')}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {lesson.challenges.map((challenge, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-accent-yellow/10 text-accent-yellow text-xs rounded"
                            >
                              {challenge}
                            </span>
                          ))}
                        </div>
                      </Stack>
                    )}
                  </Stack>
                </AnimatedCard>
              </AnimatedItem>
            )}

            {/* Assignments */}
            {lesson.assignments && lesson.assignments.length > 0 && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h2 className="text-lg font-bold text-theme-primary mb-4">
                    {t('lesson_assignments')}
                  </h2>

                  <div className="space-y-3">
                    {lesson.assignments.map((assignment) => (
                      <Link
                        href={`/student/assignments/${assignment.id}`}
                        key={assignment.id}
                      >
                        <div className="p-3 border border-theme-secondary rounded-lg">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-theme-primary">
                              {assignment.title}
                            </h4>
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                assignment.isCompleted
                                  ? 'text-green-400'
                                  : 'text-yellow-400'
                              }`}
                            >
                              {translatePendingAssignments(
                                assignment.status,
                                t
                              )}
                            </span>
                          </div>
                          <Text
                            papel="rotulo"
                            tom="suave"
                            as="p"
                            className="mt-1"
                          >
                            {assignment.description}
                          </Text>
                          {assignment.dueDate && (
                            <Text
                              papel="legenda"
                              tom="fraco"
                              as="p"
                              className="mt-1"
                            >
                              {t('deadline')}:{' '}
                              {formatDateTime(assignment.dueDate)}
                            </Text>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </AnimatedCard>
              </AnimatedItem>
            )}

            {/* Tips for Students */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                  {t('study_tips')}
                </h3>
                <Text papel="rotulo" tom="suave" as="div" className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <PiTarget className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>{t('practice_objectives')}</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <PiMusicNotes className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>{t('use_sheet_links')}</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <PiChatCenteredText className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>{t('leave_feedback')}</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <PiBookOpen className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>{t('explore_composers')}</p>
                  </div>
                </Text>
              </AnimatedCard>
            </AnimatedItem>
          </div>
        </div>
      </AnimatedContainer>

      {/* Modal para ações do aluno */}
      {showStudentActionModal && (
        <Modal
          isOpen
          onClose={() => setShowStudentActionModal(false)}
          maxWidth="md"
        >
          <div className="p-6">
            <Inline gap={3} className="mb-6">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  studentActionType === 'absence'
                    ? 'bg-accent-red/10'
                    : 'bg-accent-blue/10'
                }`}
              >
                {studentActionType === 'absence' ? (
                  <PiUserMinus className="w-6 h-6 text-accent-red" />
                ) : (
                  <PiCalendarBlank className="w-6 h-6 text-accent-blue" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-primary">
                  {studentActionType === 'absence'
                    ? t('inform_absence')
                    : t('request_reschedule')}
                </h2>
                <p className="text-theme-secondary">
                  {studentActionType === 'absence'
                    ? t('inform_absence_description')
                    : t('request_reschedule_description')}
                </p>
              </div>
            </Inline>

            {!actionSent ? (
              <>
                <div className="mb-6">
                  <Field.Area
                    label={t('message_optional')}
                    value={studentMessage}
                    onChange={(e) => setStudentMessage(e.target.value)}
                    rows={4}
                    placeholder={
                      studentActionType === 'absence'
                        ? t('absence_placeholder')
                        : t('reschedule_placeholder')
                    }
                  />
                </div>

                <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <PiInfo className="w-5 h-5 text-accent-blue mt-0.5" />
                    <Stack gap={1} className="text-sm">
                      <p className="font-medium text-accent-blue">
                        {t('confirmation')}
                      </p>
                      <p className="text-theme-secondary">
                        {studentActionType === 'absence'
                          ? t('absence_confirmation')
                          : t('reschedule_confirmation')}
                      </p>
                    </Stack>
                  </div>
                </div>

                <Inline gap={3} className="justify-end">
                  <Button
                    variante="secundario"
                    type="submit"
                    onClick={() => setShowStudentActionModal(false)}
                    disabled={loadingStudentAction}
                  >
                    {t('cancel')}
                  </Button>
                  <button
                    onClick={executeStudentAction}
                    disabled={loadingStudentAction}
                    className={`btn-classical-primary flex items-center space-x-2 ${
                      studentActionType === 'absence'
                        ? 'bg-accent-red border-accent-red hover:bg-accent-red/90'
                        : ''
                    }`}
                  >
                    {loadingStudentAction ? (
                      <PiArrowsClockwise className="w-4 h-4 animate-spin" />
                    ) : (
                      <PiPaperPlaneRight className="w-4 h-4" />
                    )}
                    <span>
                      {loadingStudentAction
                        ? t('sending')
                        : t('send_notification')}
                    </span>
                  </button>
                </Inline>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-accent-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PiCheck className="w-8 h-8 text-accent-green" />
                </div>
                <h3 className="text-lg font-bold text-theme-primary mb-2">
                  {t('message_sent')}
                </h3>
                <p className="text-theme-secondary">
                  {t('professor_notified')}{' '}
                  {studentActionType === 'absence'
                    ? t('absence_notified')
                    : t('reschedule_notified')}
                  .
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}
