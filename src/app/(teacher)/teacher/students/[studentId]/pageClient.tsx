// app/teacher/students/[studentId]/pageClient.tsx - Client Component para Detalhes do Aluno
'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiMusic,
  FiTarget,
  FiTrendingUp,
  FiCheckCircle,
  FiXCircle,
  FiPause,
  FiPlay,
  FiEdit3,
  FiBookOpen,
  FiBarChart2,
  FiArrowLeft,
  FiPlus,
  FiEye,
  FiAward,
  FiActivity,
  FiMessageSquare,
  FiFileText,
  FiSettings,
  FiRefreshCw,
  FiChevronRight,
  FiStar,
  FiTrendingDown,
  FiX,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
  SequentialGrid,
} from '../../../../components/animation/AnimatedComponents';
import { StudentDetailData } from '@/app/(main)/teacher/students/[studentId]/pageServer';
import { useTeacherStudentDetail } from '@/app/hooks/lessonsSystem/useTeacherStudentDetail';

interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: number;
}

interface TeacherStudentDetailPageClientProps {
  studentData: StudentDetailData;
  teacherProfile: TeacherProfile;
}

export default function TeacherStudentDetailPageClient({
  studentData,
  teacherProfile,
}: TeacherStudentDetailPageClientProps) {
  // Initialize hook with server data
  const {
    // State do hook
    studentData: currentStudentData,
    loading,
    error,

    // Actions do hook
    refreshStudentData,
    setInitialData,
    updateTeacherNotes,
    toggleStudentStatus,
    updateRelationship,
    updateStudentDataInState,
    clearError,
  } = useTeacherStudentDetail(studentData);

  // Local UI states (não relacionados aos dados do aluno)
  const [editingNotes, setEditingNotes] = useState(false);
  const [teacherNotes, setTeacherNotes] = useState(
    studentData.relationship.teacherNotes || ''
  );

  // Initialize hook data on mount
  useEffect(() => {
    setInitialData(studentData);
  }, [studentData, setInitialData]);

  // Update local notes when studentData changes
  useEffect(() => {
    setTeacherNotes(currentStudentData.relationship.teacherNotes || '');
  }, [currentStudentData.relationship.teacherNotes]);

  const {
    student,
    studentProfile,
    relationship,
    stats,
    recentLessons,
    upcomingLessons,
    assignments,
  } = currentStudentData;

  // Status helpers
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

  // Update teacher notes using hook
  const handleUpdateTeacherNotes = useCallback(async () => {
    const success = await updateTeacherNotes(teacherNotes);

    if (success) {
      setEditingNotes(false);
      console.log('Anotações atualizadas com sucesso!');
    }
  }, [teacherNotes, updateTeacherNotes]);

  // Toggle student status using hook
  const handleToggleStudentStatus = useCallback(async () => {
    const success = await toggleStudentStatus();

    if (success) {
      console.log('Status do aluno atualizado com sucesso!');
    }
  }, [toggleStudentStatus]);

  // Format functions
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Breadcrumb */}
        <AnimatedItem direction="down" springType="gentle">
          <nav className="flex items-center space-x-2 text-sm text-theme-tertiary mb-6 pt-4">
            <Link
              href="/teacher"
              className="hover:text-brand-primary transition-colors duration-300 font-medium"
            >
              Dashboard
            </Link>
            <FiChevronRight className="w-4 h-4" />
            <Link
              href="/teacher/students"
              className="hover:text-brand-primary transition-colors duration-300 font-medium"
            >
              Alunos
            </Link>
            <FiChevronRight className="w-4 h-4" />
            <span className="text-theme-primary font-medium">
              {student.name}
            </span>
          </nav>
        </AnimatedItem>

        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link
                href="/teacher/students"
                className="w-10 h-10 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group"
              >
                <FiArrowLeft className="w-5 h-5 text-theme-tertiary group-hover:text-brand-primary transition-colors" />
              </Link>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gradient-brand classical-title">
                  {student.name}
                </h1>
                <p className="text-theme-secondary">
                  Aluno desde {formatDate(relationship.startDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span
                className={`px-4 py-2 border rounded-full text-sm font-medium bg-${getStatusColor()}/10 border-${getStatusColor()}/30 text-${getStatusColor()}`}
              >
                {getStatusText()}
              </span>
              <button
                onClick={handleToggleStudentStatus}
                disabled={loading.toggleStatus}
                className={`btn-classical-secondary flex items-center space-x-2 ${
                  isPaused
                    ? 'hover:bg-accent-green/10 hover:border-accent-green/30 hover:text-accent-green'
                    : 'hover:bg-accent-yellow/10 hover:border-accent-yellow/30 hover:text-accent-yellow'
                }`}
              >
                {loading.toggleStatus ? (
                  <FiRefreshCw className="w-4 h-4 animate-spin" />
                ) : isPaused ? (
                  <FiPlay className="w-4 h-4" />
                ) : (
                  <FiPause className="w-4 h-4" />
                )}
                <span>
                  {loading.toggleStatus
                    ? 'Aguarde...'
                    : isPaused
                    ? 'Reativar'
                    : 'Pausar'}
                </span>
              </button>
              <Link
                href={`/teacher/lessons/create?studentId=${student.id}`}
                className="btn-classical-primary flex items-center space-x-2"
              >
                <FiPlus className="w-4 h-4" />
                <span>Nova Aula</span>
              </Link>
            </div>
          </div>
        </AnimatedItem>

        {/* Error Message */}
        {error && (
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard
              hover="lift"
              className="classical-card p-4 border-l-4 border-accent-red mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FiXCircle className="w-5 h-5 text-accent-red" />
                  <span className="text-accent-red font-medium">{error}</span>
                </div>
                <button
                  onClick={clearError}
                  className="text-accent-red hover:text-accent-red/80 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </AnimatedCard>
          </AnimatedItem>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Student Info Card */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center space-x-6 mb-6">
                  {/* Avatar */}
                  <div className="relative w-20 h-20">
                    {student.image ? (
                      <div className="relative w-full h-full rounded-full overflow-hidden border-3 border-brand-primary/20">
                        <Image
                          src={student.image}
                          alt={student.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center border-3 border-brand-primary/20">
                        <FiUser className="w-10 h-10 text-theme-primary" />
                      </div>
                    )}
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-theme-primary classical-title mb-2">
                      {student.name}
                    </h2>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2 text-theme-secondary">
                        <FiMail className="w-4 h-4" />
                        <span>{student.email}</span>
                      </div>
                      {student.phone && (
                        <div className="flex items-center space-x-2 text-theme-secondary">
                          <FiPhone className="w-4 h-4" />
                          <span>{student.phone}</span>
                        </div>
                      )}
                      {(student.city || student.state) && (
                        <div className="flex items-center space-x-2 text-theme-secondary">
                          <FiMapPin className="w-4 h-4" />
                          <span>
                            {[student.city, student.state]
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Student Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-theme-tertiary">
                        Nível Musical
                      </label>
                      <p className="text-theme-primary font-semibold">
                        {studentProfile.level}
                      </p>
                    </div>
                    {studentProfile.mainInstrument && (
                      <div>
                        <label className="text-sm font-medium text-theme-tertiary">
                          Instrumento Principal
                        </label>
                        <p className="text-theme-primary font-semibold">
                          {studentProfile.mainInstrument}
                        </p>
                      </div>
                    )}
                    {student.experienceLevel && (
                      <div>
                        <label className="text-sm font-medium text-theme-tertiary">
                          Experiência
                        </label>
                        <p className="text-theme-primary font-semibold">
                          {student.experienceLevel}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-theme-tertiary">
                        Frequência de Aulas
                      </label>
                      <p className="text-theme-primary font-semibold">
                        {relationship.maxLessonsPerWeek}x por semana •{' '}
                        {relationship.lessonDuration}min
                      </p>
                    </div>
                    {studentProfile.practiceTime && (
                      <div>
                        <label className="text-sm font-medium text-theme-tertiary">
                          Tempo de Prática
                        </label>
                        <p className="text-theme-primary font-semibold">
                          {studentProfile.practiceTime}min/dia
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-theme-tertiary">
                        Membro desde
                      </label>
                      <p className="text-theme-primary font-semibold">
                        {formatDate(student.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Musical Goals */}
                {studentProfile.musicalGoals &&
                  typeof studentProfile.musicalGoals === 'string' &&
                  studentProfile.musicalGoals.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-theme-secondary">
                      <label className="text-sm font-medium text-theme-tertiary block mb-3">
                        Objetivos Musicais
                      </label>
                      <div className="text-theme-primary">
                        {studentProfile.musicalGoals}
                      </div>
                    </div>
                  )}

                {/* Current Focus */}
                {relationship.currentFocus &&
                  relationship.currentFocus.length > 0 && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-theme-tertiary block mb-3">
                        Foco Atual
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {relationship.currentFocus.map((focus, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary rounded-full text-sm"
                          >
                            {focus}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </AnimatedCard>
            </AnimatedItem>

            {/* Progress Stats */}
            <AnimatedItem direction="up" springType="gentle">
              <SequentialGrid cols={4} gap={6} delayBetweenItems={0.1}>
                <AnimatedCard
                  hover="scale"
                  className="classical-card p-6 text-center"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FiBookOpen className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div className="text-2xl font-bold text-theme-primary mb-1">
                    {stats.totalLessons}
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    Total de Aulas
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
                    {stats.completionRate}%
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    Taxa de Conclusão
                  </div>
                </AnimatedCard>

                <AnimatedCard
                  hover="scale"
                  className="classical-card p-6 text-center"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-red rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FiClock className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div className="text-2xl font-bold text-theme-primary mb-1">
                    {formatDuration(stats.totalStudyTime).split(' ')[0]}
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    Horas de Estudo
                  </div>
                </AnimatedCard>

                <AnimatedCard
                  hover="scale"
                  className="classical-card p-6 text-center"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FiActivity className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div className="text-2xl font-bold text-theme-primary mb-1">
                    {stats.streakDays}
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    Dias de Streak
                  </div>
                </AnimatedCard>
              </SequentialGrid>
            </AnimatedItem>

            {/* Recent Lessons */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center">
                      <FiClock className="w-5 h-5 text-theme-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-theme-primary classical-title">
                        Aulas Recentes
                      </h3>
                      <p className="text-theme-tertiary text-sm">
                        Últimas {recentLessons.length} aulas realizadas
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/teacher/lessons?studentId=${student.id}`}
                    className="text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <span>Ver todas</span>
                    <FiChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {recentLessons.slice(0, 5).map((lesson, index) => (
                    <div key={lesson.id} className="classical-card-2 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-theme-primary">
                              {lesson.title}
                            </h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                lesson.status === 'COMPLETED'
                                  ? 'bg-accent-green/10 border border-accent-green/30 text-accent-green'
                                  : lesson.status === 'CANCELLED'
                                  ? 'bg-accent-red/10 border border-accent-red/30 text-accent-red'
                                  : 'bg-accent-blue/10 border border-accent-blue/30 text-accent-blue'
                              }`}
                            >
                              {lesson.status === 'COMPLETED'
                                ? 'Concluída'
                                : lesson.status === 'CANCELLED'
                                ? 'Cancelada'
                                : lesson.status}
                            </span>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-theme-tertiary mb-2">
                            <span>{formatDateTime(lesson.scheduledAt)}</span>
                            <span>•</span>
                            <span>{lesson.duration}min</span>
                          </div>

                          {lesson.topics.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {lesson.topics
                                .slice(0, 3)
                                .map((topic, topicIndex) => (
                                  <span
                                    key={topicIndex}
                                    className="px-2 py-1 bg-theme-elevated text-theme-secondary rounded text-xs"
                                  >
                                    {topic}
                                  </span>
                                ))}
                              {lesson.topics.length > 3 && (
                                <span className="px-2 py-1 bg-theme-elevated text-theme-tertiary rounded text-xs">
                                  +{lesson.topics.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {lesson.homework && (
                            <div className="mt-2 p-2 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded border border-theme-primary/20">
                              <div className="text-xs text-theme-tertiary mb-1">
                                Tarefa:
                              </div>
                              <div className="text-sm text-theme-primary line-clamp-2">
                                {lesson.homework}
                              </div>
                            </div>
                          )}
                        </div>

                        <Link
                          href={`/teacher/lessons/${lesson.id}`}
                          className="w-8 h-8 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center ml-4"
                        >
                          <FiEye className="w-4 h-4 text-theme-tertiary hover:text-brand-primary transition-colors" />
                        </Link>
                      </div>
                    </div>
                  ))}

                  {recentLessons.length === 0 && (
                    <div className="text-center py-8">
                      <FiClock className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                      <p className="text-theme-tertiary">
                        Nenhuma aula realizada ainda
                      </p>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Teacher Notes */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-red rounded-xl flex items-center justify-center">
                      <FiMessageSquare className="w-5 h-5 text-theme-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-theme-primary classical-title">
                        Anotações do Professor
                      </h3>
                      <p className="text-theme-tertiary text-sm">
                        Suas observações sobre o aluno
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingNotes(!editingNotes)}
                    disabled={loading.updateNotes}
                    className="w-8 h-8 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center"
                  >
                    {loading.updateNotes ? (
                      <FiRefreshCw className="w-4 h-4 animate-spin text-theme-tertiary" />
                    ) : (
                      <FiEdit3 className="w-4 h-4 text-theme-tertiary hover:text-brand-primary transition-colors" />
                    )}
                  </button>
                </div>

                {editingNotes ? (
                  <div className="space-y-4">
                    <textarea
                      value={teacherNotes}
                      onChange={(e) => setTeacherNotes(e.target.value)}
                      placeholder="Adicione suas observações sobre o aluno, progresso, dificuldades, pontos fortes..."
                      className="input-classical-2 w-full h-32 resize-none"
                      disabled={loading.updateNotes}
                    />
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleUpdateTeacherNotes}
                        disabled={loading.updateNotes}
                        className="btn-classical-primary text-sm flex items-center space-x-2"
                      >
                        {loading.updateNotes && (
                          <FiRefreshCw className="w-4 h-4 animate-spin" />
                        )}
                        <span>
                          {loading.updateNotes ? 'Salvando...' : 'Salvar'}
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingNotes(false);
                          setTeacherNotes(relationship.teacherNotes || '');
                        }}
                        disabled={loading.updateNotes}
                        className="btn-classical-secondary text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-lg border border-theme-primary/20 p-4">
                    {teacherNotes ? (
                      <p className="text-theme-primary whitespace-pre-wrap">
                        {teacherNotes}
                      </p>
                    ) : (
                      <p className="text-theme-tertiary italic">
                        Nenhuma anotação ainda. Clique no ícone de edição para
                        adicionar suas observações.
                      </p>
                    )}
                  </div>
                )}
              </AnimatedCard>
            </AnimatedItem>
          </div>

          {/* Right Column - 1/3 */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upcoming Lessons */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center">
                    <FiCalendar className="w-4 h-4 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-theme-primary">
                      Próximas Aulas
                    </h3>
                    <p className="text-xs text-theme-tertiary">
                      {upcomingLessons.length} agendadas
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {upcomingLessons.slice(0, 4).map((lesson) => (
                    <div key={lesson.id} className="classical-card-2 p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-12 bg-brand-primary rounded-full"></div>
                        <div className="flex-1">
                          <div className="font-medium text-theme-primary text-sm">
                            {lesson.title}
                          </div>
                          <div className="text-xs text-theme-tertiary">
                            {formatDate(lesson.scheduledAt)} •{' '}
                            {formatTime(lesson.scheduledAt)}
                          </div>
                          <div className="text-xs text-accent-blue">
                            {lesson.duration}min
                          </div>
                        </div>
                        <Link
                          href={`/teacher/lessons/${lesson.id}`}
                          className="w-6 h-6 rounded bg-theme-elevated hover:bg-interactive-hover transition-colors flex items-center justify-center"
                        >
                          <FiEye className="w-3 h-3 text-theme-tertiary" />
                        </Link>
                      </div>
                    </div>
                  ))}

                  {upcomingLessons.length === 0 && (
                    <div className="text-center py-6">
                      <FiCalendar className="w-8 h-8 text-theme-tertiary mx-auto mb-2" />
                      <p className="text-sm text-theme-tertiary">
                        Nenhuma aula agendada
                      </p>
                    </div>
                  )}
                </div>

                {upcomingLessons.length > 0 && (
                  <Link
                    href={`/teacher/lessons?studentId=${student.id}`}
                    className="mt-4 block text-center text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors"
                  >
                    Ver todas as aulas
                  </Link>
                )}
              </AnimatedCard>
            </AnimatedItem>

            {/* Current Assignments */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-lg flex items-center justify-center">
                    <FiFileText className="w-4 h-4 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-theme-primary">
                      Tarefas Ativas
                    </h3>
                    <p className="text-xs text-theme-tertiary">
                      {assignments.filter((a) => !a.isCompleted).length}{' '}
                      pendentes
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {assignments
                    .filter((a) => !a.isCompleted)
                    .slice(0, 4)
                    .map((assignment) => (
                      <div key={assignment.id} className="classical-card-2 p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-theme-primary text-sm line-clamp-1">
                              {assignment.title}
                            </div>
                            <div className="text-xs text-theme-tertiary line-clamp-2">
                              {assignment.description}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                              assignment.priority === 'high'
                                ? 'bg-accent-red/10 border border-accent-red/30 text-accent-red'
                                : assignment.priority === 'medium'
                                ? 'bg-accent-yellow/10 border border-accent-yellow/30 text-accent-yellow'
                                : 'bg-accent-green/10 border border-accent-green/30 text-accent-green'
                            }`}
                          >
                            {assignment.priority === 'high'
                              ? 'Alta'
                              : assignment.priority === 'medium'
                              ? 'Média'
                              : 'Baixa'}
                          </span>
                        </div>

                        {assignment.dueDate && (
                          <div className="text-xs text-theme-tertiary mb-2">
                            Prazo: {formatDate(assignment.dueDate)}
                          </div>
                        )}

                        <div className="w-full bg-theme-secondary rounded-full h-2">
                          <div
                            className="bg-brand-primary rounded-full h-2 transition-all"
                            style={{ width: `${assignment.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}

                  {assignments.filter((a) => !a.isCompleted).length === 0 && (
                    <div className="text-center py-4">
                      <FiCheckCircle className="w-8 h-8 text-accent-green mx-auto mb-2" />
                      <p className="text-sm text-theme-tertiary">
                        Todas as tarefas concluídas!
                      </p>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Quick Actions */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-red rounded-lg flex items-center justify-center">
                    <FiSettings className="w-4 h-4 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-theme-primary">
                      Ações Rápidas
                    </h3>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    href={`/teacher/lessons/create?studentId=${student.id}`}
                    className="w-full classical-card-2 p-3 text-left hover:border-brand-primary transition-all group block"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-lg flex items-center justify-center">
                        <FiPlus className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-theme-primary group-hover:text-brand-primary transition-colors">
                          Agendar Aula
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          Nova aula para este aluno
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href={`/teacher/assignments/create?studentId=${student.id}`}
                    className="w-full classical-card-2 p-3 text-left hover:border-brand-primary transition-all group block"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center">
                        <FiFileText className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-theme-primary group-hover:text-brand-primary transition-colors">
                          Criar Tarefa
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          Atribuir nova tarefa
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href={`/teacher/students/${student.id}/progress`}
                    className="w-full classical-card-2 p-3 text-left hover:border-brand-primary transition-all group block"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center">
                        <FiBarChart2 className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-theme-primary group-hover:text-brand-primary transition-colors">
                          Relatório Detalhado
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          Progresso completo
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Refresh Button */}
            <AnimatedItem direction="up" springType="gentle">
              <button
                onClick={refreshStudentData}
                disabled={loading.refresh}
                className="w-full btn-classical-secondary flex items-center justify-center space-x-2"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${loading.refresh ? 'animate-spin' : ''}`}
                />
                <span>
                  {loading.refresh ? 'Atualizando...' : 'Atualizar Dados'}
                </span>
              </button>
            </AnimatedItem>
          </div>
        </div>
      </AnimatedContainer>
    </PageContainer>
  );
}
