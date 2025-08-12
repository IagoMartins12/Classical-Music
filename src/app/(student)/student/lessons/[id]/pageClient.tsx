// app/student/lessons/[id]/pageClient.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiArrowLeft,
  FiMapPin,
  FiBookOpen,
  FiMessageSquare,
  FiTarget,
  FiRefreshCw,
  FiRepeat,
  FiInfo,
  FiMusic,
  FiDownload,
  FiExternalLink,
  FiX,
  FiUserX,
  FiEdit3,
  FiSave,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../../components/animation/AnimatedComponents';
import { StudentLessonDetail } from './pageServer';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Modal from '@/app/components/Modal';
import { useToast } from '@/app/hooks/useToast';

interface StudentLessonDetailPageClientProps {
  initialData: StudentLessonDetail | null;
  errorMessage?: string;
}

export default function StudentLessonDetailPageClient({
  initialData,
  errorMessage,
}: StudentLessonDetailPageClientProps) {
  const router = useRouter();
  const [lesson, setLesson] = useState<StudentLessonDetail | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorMessage || null);

  // Estados para feedback do aluno
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [studentFeedback, setStudentFeedback] = useState('');
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  // Estados para modal de ações do aluno
  const [showStudentActionModal, setShowStudentActionModal] = useState(false);
  const [studentActionType, setStudentActionType] = useState<
    'cancel' | 'reschedule'
  >('cancel');

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
      const response = await fetch(`/api/lessons/${lesson.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLesson(data.lesson);
          setError(null);
        }
      }
      toast.success('Aula atualizada com sucesso.');
    } catch (error) {
      toast.error('Erro ao atualizar aula.');

      console.error('Erro ao atualizar aula:', error);
    } finally {
      setLoading(false);
    }
  }, [lesson?.id]);

  // Função para salvar feedback do aluno
  const handleSaveFeedback = useCallback(async () => {
    if (!lesson?.id || !studentFeedback.trim()) return;

    setLoadingFeedback(true);
    try {
      const response = await fetch(`/api/lessons/${lesson.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentFeedback: studentFeedback.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLesson({ ...lesson, studentFeedback: studentFeedback.trim() });
          setIsEditingFeedback(false);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar feedback:', error);
    } finally {
      setLoadingFeedback(false);
    }
  }, [lesson, studentFeedback]);

  // Handlers para ações do aluno (placeholder)
  const handleStudentAction = useCallback(
    (actionType: 'cancel' | 'reschedule') => {
      setStudentActionType(actionType);
      setShowStudentActionModal(true);
    },
    []
  );

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
    switch (status) {
      case 'COMPLETED':
        return 'Concluída';
      case 'CANCELLED':
        return 'Cancelada';
      case 'NO_SHOW':
        return 'Faltou';
      case 'SCHEDULED':
        return 'Agendada';
      default:
        return status;
    }
  };

  // Render error state
  if ((error || errorMessage) && !lesson) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiBookOpen className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              Erro ao Carregar Aula
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {error || errorMessage}
            </p>
            <div className="space-y-3">
              <button
                onClick={refreshLesson}
                disabled={loading}
                className="btn-classical-primary flex items-center space-x-2 w-full justify-center"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                />
                <span>{loading ? 'Carregando...' : 'Tentar Novamente'}</span>
              </button>
              <Link
                href="/student/lessons"
                className="btn-classical-secondary w-full text-center block"
              >
                Voltar às Aulas
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!lesson) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center">
            <FiRefreshCw className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-4" />
            <p className="text-theme-secondary">
              Carregando detalhes da aula...
            </p>
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
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link
                href="/student/lessons"
                className="w-10 h-10 rounded-lg bg-theme-elevated hover:bg-interactive-hover transition-colors flex items-center justify-center"
              >
                <FiArrowLeft className="w-5 h-5 text-theme-tertiary" />
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-theme-primary classical-title">
                  Detalhes da Aula
                </h1>
                <p className="text-theme-secondary classical-subtitle">
                  Visualize informações completas sobre sua aula
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  lesson.status
                )}`}
              >
                {getStatusLabel(lesson.status)}
              </span>

              {/* Ações do Aluno - apenas para aulas agendadas */}
              {lesson.status === 'SCHEDULED' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleStudentAction('cancel')}
                    className="btn-classical-secondary text-accent-red border-accent-red/30 hover:bg-accent-red/10 flex items-center space-x-2 text-sm"
                  >
                    <FiUserX className="w-4 h-4" />
                    <span>Não poderei comparecer</span>
                  </button>
                  <button
                    onClick={() => handleStudentAction('reschedule')}
                    className="btn-classical-secondary text-accent-blue border-accent-blue/30 hover:bg-accent-blue/10 flex items-center space-x-2 text-sm"
                  >
                    <FiCalendar className="w-4 h-4" />
                    <span>Reagendar</span>
                  </button>
                </div>
              )}

              <button
                onClick={refreshLesson}
                disabled={loading}
                className="btn-classical-secondary flex items-center space-x-2"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                />
                <span>Atualizar</span>
              </button>
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
                  <h2 className="text-lg font-bold text-theme-primary flex items-center space-x-2">
                    <FiCalendar className="w-5 h-5" />
                    <span>Informações da Aula</span>
                  </h2>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-theme-primary">
                    {lesson.title}
                  </h3>
                  {lesson.description && (
                    <p className="text-theme-secondary">{lesson.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 text-theme-secondary">
                      <FiCalendar className="w-4 h-4" />
                      <span>{formatDateTime(lesson.scheduledAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-theme-secondary">
                      <FiClock className="w-4 h-4" />
                      <span>{formatDuration(lesson.duration)}</span>
                    </div>
                  </div>

                  {lesson.location && (
                    <div className="flex items-center space-x-2 text-theme-secondary">
                      <FiMapPin className="w-4 h-4" />
                      <span>{lesson.location}</span>
                    </div>
                  )}

                  {/* Recurrence Info */}
                  {lesson.isRecurring && (
                    <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-accent-blue mb-2">
                        <FiRepeat className="w-4 h-4" />
                        <span className="font-medium">Aula Recorrente</span>
                      </div>
                      <p className="text-sm text-theme-secondary">
                        Esta aula faz parte de uma série recorrente.
                      </p>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Peças Musicais - COM LINKS */}
            {lesson.workScores && lesson.workScores.length > 0 && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <div className="flex items-center mb-4">
                    <h2 className="text-lg font-bold text-theme-primary flex items-center space-x-2">
                      <FiMusic className="w-5 h-5" />
                      <span>Peças Musicais</span>
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {lesson.workScores.map((workScore, index) => (
                      <div
                        key={workScore.id}
                        className="bg-theme-elevated border border-theme-secondary rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="w-10 h-10 bg-accent-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FiMusic className="w-5 h-5 text-accent-blue" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-bold text-theme-primary">
                                  {workScore.workTitle}
                                </h4>
                                <span className="text-xs bg-theme-secondary/20 text-theme-secondary px-2 py-0.5 rounded">
                                  #{index + 1}
                                </span>
                              </div>

                              {/* Link para o Compositor */}
                              <Link
                                href={`/composer/${workScore.composer
                                  .replace(/\s+/g, '-')
                                  .toLowerCase()}`}
                                className="text-sm text-accent-blue hover:text-accent-blue/80 font-medium inline-flex items-center space-x-1 mb-2"
                              >
                                <span>{workScore.composer}</span>
                                <FiExternalLink className="w-3 h-3" />
                              </Link>

                              <div className="space-y-2">
                                {/* Link para a Obra */}
                                <div>
                                  <Link
                                    href={`/works/${workScore.id}`}
                                    className="text-sm text-accent-purple hover:text-accent-purple/80 inline-flex items-center space-x-1"
                                  >
                                    <FiBookOpen className="w-3 h-3" />
                                    <span>Ver obra completa</span>
                                    <FiExternalLink className="w-3 h-3" />
                                  </Link>
                                </div>

                                {/* Informações da Partitura */}
                                <div className="text-xs text-theme-tertiary space-y-1">
                                  <div>
                                    <span className="font-medium">
                                      Partitura:
                                    </span>{' '}
                                    {workScore.title}
                                  </div>
                                  <div>
                                    <span className="font-medium">Tipo:</span>{' '}
                                    {workScore.type}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Link de Download da Partitura */}
                          {workScore.downloadUrl && (
                            <div className="flex-shrink-0 ml-4">
                              <a
                                href={workScore.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-classical-secondary flex items-center space-x-2 text-sm bg-accent-green/10 border-accent-green/30 text-accent-green hover:bg-accent-green/20"
                              >
                                <FiDownload className="w-4 h-4" />
                                <span>Download</span>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </AnimatedCard>
              </AnimatedItem>
            )}

            {/* Objectives */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <div className="flex items-center mb-4">
                  <h2 className="text-lg font-bold text-theme-primary flex items-center space-x-2">
                    <FiTarget className="w-5 h-5" />
                    <span>Objetivos da Aula</span>
                  </h2>
                </div>

                <div className="space-y-2">
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
                      Nenhum objetivo definido para esta aula.
                    </p>
                  )}
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Topics & Techniques */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <div className="flex items-center mb-4">
                  <h2 className="text-lg font-bold text-theme-primary flex items-center space-x-2">
                    <FiBookOpen className="w-5 h-5" />
                    <span>Tópicos e Técnicas</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-theme-primary mb-3">
                      Tópicos Abordados
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
                        <span className="text-theme-tertiary italic text-sm">
                          Nenhum tópico registrado
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-theme-primary mb-3">
                      Técnicas Trabalhadas
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
                        <span className="text-theme-tertiary italic text-sm">
                          Nenhuma técnica registrada
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Notes Section */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-theme-primary flex items-center space-x-2">
                    <FiMessageSquare className="w-5 h-5" />
                    <span>Notas e Observações</span>
                  </h2>
                </div>

                <div className="space-y-4">
                  {lesson.publicNotes && (
                    <div>
                      <h3 className="font-medium text-theme-primary mb-2">
                        Notas do Professor
                      </h3>
                      <div className="bg-accent-blue/5 border border-accent-blue/20 rounded-lg p-4">
                        <p className="text-theme-secondary whitespace-pre-wrap">
                          {lesson.publicNotes}
                        </p>
                      </div>
                    </div>
                  )}

                  {lesson.lessonSummary && (
                    <div>
                      <h3 className="font-medium text-theme-primary mb-2">
                        Resumo da Aula
                      </h3>
                      <div className="bg-accent-green/5 border border-accent-green/20 rounded-lg p-4">
                        <p className="text-theme-secondary whitespace-pre-wrap">
                          {lesson.lessonSummary}
                        </p>
                      </div>
                    </div>
                  )}

                  {lesson.homework && (
                    <div>
                      <h3 className="font-medium text-theme-primary mb-2">
                        Lição de Casa
                      </h3>
                      <div className="bg-accent-purple/5 border border-accent-purple/20 rounded-lg p-4">
                        <p className="text-theme-secondary whitespace-pre-wrap">
                          {lesson.homework}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Student Feedback Section */}
                  {lesson.permissions.canAddFeedback && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-theme-primary">
                          Seu Feedback
                        </h3>
                        {!isEditingFeedback && lesson.studentFeedback ? (
                          <button
                            onClick={() => setIsEditingFeedback(true)}
                            className="btn-classical-secondary flex items-center space-x-1 text-sm"
                          >
                            <FiEdit3 className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                        ) : null}
                      </div>

                      {isEditingFeedback ? (
                        <div className="space-y-3">
                          <textarea
                            value={studentFeedback}
                            onChange={(e) => setStudentFeedback(e.target.value)}
                            className="input-classical-2 w-full h-24"
                            placeholder="Compartilhe sua experiência sobre esta aula..."
                          />
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={handleSaveFeedback}
                              disabled={
                                loadingFeedback || !studentFeedback.trim()
                              }
                              className="btn-classical-primary flex items-center space-x-1 text-sm"
                            >
                              {loadingFeedback ? (
                                <FiRefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <FiSave className="w-3 h-3" />
                              )}
                              <span>Salvar</span>
                            </button>
                            <button
                              onClick={() => setIsEditingFeedback(false)}
                              className="btn-classical-secondary flex items-center space-x-1 text-sm"
                            >
                              <FiX className="w-3 h-3" />
                              <span>Cancelar</span>
                            </button>
                          </div>
                        </div>
                      ) : lesson.studentFeedback ? (
                        <div className="bg-accent-yellow/5 border border-accent-yellow/20 rounded-lg p-4">
                          <p className="text-theme-secondary whitespace-pre-wrap">
                            {lesson.studentFeedback}
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsEditingFeedback(true)}
                          className="w-full p-4 border-2 border-dashed border-theme-secondary/30 rounded-lg text-theme-tertiary hover:border-brand-primary/50 hover:text-brand-primary transition-colors"
                        >
                          Clique para adicionar seu feedback sobre a aula
                        </button>
                      )}
                    </div>
                  )}

                  {/* Display existing feedback for completed lessons */}
                  {lesson.studentFeedback &&
                    !lesson.permissions.canAddFeedback && (
                      <div>
                        <h3 className="font-medium text-theme-primary mb-2">
                          Seu Feedback
                        </h3>
                        <div className="bg-accent-yellow/5 border border-accent-yellow/20 rounded-lg p-4">
                          <p className="text-theme-secondary whitespace-pre-wrap">
                            {lesson.studentFeedback}
                          </p>
                        </div>
                      </div>
                    )}

                  {!lesson.publicNotes &&
                    !lesson.lessonSummary &&
                    !lesson.homework &&
                    !lesson.studentFeedback &&
                    !lesson.permissions.canAddFeedback && (
                      <p className="text-theme-tertiary italic">
                        Nenhuma nota registrada ainda.
                      </p>
                    )}
                </div>
              </AnimatedCard>
            </AnimatedItem>
          </div>

          {/* Right Column - Teacher & Info */}
          <div className="space-y-6">
            {/* Teacher Info */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h2 className="text-lg font-bold text-theme-primary mb-4">
                  Professor
                </h2>

                <div className="flex items-center space-x-4 mb-6">
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
                      <FiUser className="w-8 h-8 text-theme-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-theme-primary">
                      {lesson.teacher.name}
                    </h3>
                    <p className="text-sm text-theme-tertiary">
                      {lesson.teacher.email}
                    </p>
                  </div>
                </div>

                {/* Relationship Stats */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">Total de Aulas:</span>
                    <span className="text-theme-primary font-medium">
                      {lesson.relationship.totalLessons}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">Concluídas:</span>
                    <span className="text-theme-primary font-medium">
                      {lesson.relationship.completedLessons}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">Estudando há:</span>
                    <span className="text-theme-primary font-medium">
                      {lesson.relationship.relationshipDuration}
                    </span>
                  </div>
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Attendance Status */}
            {lesson.studentPresent !== undefined && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h2 className="text-lg font-bold text-theme-primary mb-4">
                    Status de Presença
                  </h2>

                  <div
                    className={`p-4 rounded-lg ${
                      lesson.studentPresent
                        ? 'bg-accent-green/10 border border-accent-green/30'
                        : 'bg-accent-red/10 border border-accent-red/30'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {lesson.studentPresent ? (
                        <FiUser className="w-5 h-5 text-accent-green" />
                      ) : (
                        <FiUserX className="w-5 h-5 text-accent-red" />
                      )}
                      <span
                        className={`font-medium ${
                          lesson.studentPresent
                            ? 'text-accent-green'
                            : 'text-accent-red'
                        }`}
                      >
                        {lesson.studentPresent ? 'Presente' : 'Faltou'}
                      </span>
                    </div>

                    {lesson.punctuality && (
                      <p className="text-sm text-theme-secondary">
                        Pontualidade:{' '}
                        {lesson.punctuality === 'on_time'
                          ? 'No horário'
                          : lesson.punctuality === 'late'
                          ? 'Atrasou'
                          : 'Adiantou'}
                      </p>
                    )}

                    {lesson.engagement && (
                      <p className="text-sm text-theme-secondary">
                        Engajamento: {lesson.engagement}/5
                      </p>
                    )}

                    {lesson.preparation && (
                      <p className="text-sm text-theme-secondary">
                        Preparação: {lesson.preparation}/5
                      </p>
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
                    Progresso da Aula
                  </h2>

                  <div className="space-y-4">
                    {lesson.skillsWorked.length > 0 && (
                      <div>
                        <h4 className="font-medium text-theme-primary mb-2">
                          Habilidades Trabalhadas
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
                      </div>
                    )}

                    {lesson.improvements.length > 0 && (
                      <div>
                        <h4 className="font-medium text-theme-primary mb-2">
                          Melhorias
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
                      </div>
                    )}

                    {lesson.challenges.length > 0 && (
                      <div>
                        <h4 className="font-medium text-theme-primary mb-2">
                          Desafios
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
                      </div>
                    )}
                  </div>
                </AnimatedCard>
              </AnimatedItem>
            )}

            {/* Assignments */}
            {lesson.assignments && lesson.assignments.length > 0 && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h2 className="text-lg font-bold text-theme-primary mb-4">
                    Tarefas da Aula
                  </h2>

                  <div className="space-y-3">
                    {lesson.assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="p-3 border border-theme-secondary rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-theme-primary">
                            {assignment.title}
                          </h4>
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              assignment.isCompleted
                                ? 'bg-accent-green/10 text-accent-green'
                                : 'bg-accent-yellow/10 text-accent-yellow'
                            }`}
                          >
                            {assignment.isCompleted
                              ? 'Concluída'
                              : assignment.status}
                          </span>
                        </div>
                        <p className="text-sm text-theme-secondary mt-1">
                          {assignment.description}
                        </p>
                        {assignment.dueDate && (
                          <p className="text-xs text-theme-tertiary mt-1">
                            Prazo: {formatDateTime(assignment.dueDate)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </AnimatedCard>
              </AnimatedItem>
            )}

            {/* Tips for Students */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                  Dicas de Estudo
                </h3>
                <div className="space-y-3 text-sm text-theme-secondary">
                  <div className="flex items-start space-x-2">
                    <FiTarget className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>Pratique os objetivos definidos pelo seu professor</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <FiMusic className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>
                      Use os links para acessar as partituras e estudar as obras
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <FiMessageSquare className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>
                      Deixe seu feedback para ajudar seu professor a melhorar as
                      aulas
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <FiBookOpen className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>
                      Explore as informações dos compositores para enriquecer
                      seu estudo
                    </p>
                  </div>
                </div>
              </AnimatedCard>
            </AnimatedItem>
          </div>
        </div>
      </AnimatedContainer>

      {/* Modal para Ações do Aluno */}
      {showStudentActionModal && (
        <Modal
          isOpen
          onClose={() => setShowStudentActionModal(false)}
          maxWidth="md"
        >
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  studentActionType === 'cancel'
                    ? 'bg-accent-red/10'
                    : 'bg-accent-blue/10'
                }`}
              >
                {studentActionType === 'cancel' ? (
                  <FiUserX className="w-6 h-6 text-accent-red" />
                ) : (
                  <FiCalendar className="w-6 h-6 text-accent-blue" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-primary">
                  {studentActionType === 'cancel'
                    ? 'Informar Ausência'
                    : 'Solicitar Reagendamento'}
                </h2>
                <p className="text-theme-secondary">
                  {studentActionType === 'cancel'
                    ? 'Informe que não poderá comparecer à aula'
                    : 'Solicite um novo horário para sua aula'}
                </p>
              </div>
            </div>

            <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <FiInfo className="w-5 h-5 text-accent-blue mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-accent-blue mb-1">
                    Em desenvolvimento
                  </p>
                  <p className="text-theme-secondary">
                    Esta funcionalidade estará disponível em breve. Por
                    enquanto, entre em contato diretamente com seu professor
                    para{' '}
                    {studentActionType === 'cancel'
                      ? 'informar sua ausência'
                      : 'reagendar a aula'}
                    .
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowStudentActionModal(false)}
                className="btn-classical-secondary"
              >
                Entendi
              </button>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}
