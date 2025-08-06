// app/student/pageClient.tsx - Dashboard Completo do Aluno
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FiUser,
  FiCalendar,
  FiClock,
  FiBookOpen,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiBarChart2,
  FiChevronRight,
  FiRefreshCw,
  FiMusic,
  FiTarget,
  FiAward,
  FiUserCheck,
  FiHeart,
  FiHome,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
  SequentialGrid,
} from '../../components/animation/AnimatedComponents';
import { StudentDashboardData } from './pageServer';
import { useStudentDashboard } from '@/app/hooks/lessonsSystem/useStudentDashboard';

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: number;
}

interface StudentPageClientProps {
  initialDashboardData: StudentDashboardData | null;
  studentProfile: StudentProfile;
  teachersInfo?: any[];
  errorMessage?: string;
}

export default function StudentPageClient({
  initialDashboardData,
  studentProfile,
  teachersInfo = [],
  errorMessage,
}: StudentPageClientProps) {
  // Initialize hook with server data
  const {
    // State do hook
    dashboardData,
    loading,
    error,

    // Actions do hook
    refreshDashboard,
    setInitialData,
    clearError,
  } = useStudentDashboard(initialDashboardData);

  // Initialize hook data on mount
  useEffect(() => {
    if (initialDashboardData) {
      setInitialData(initialDashboardData);
    }
  }, [initialDashboardData, setInitialData]);

  // Computed values
  const stats = useMemo(() => {
    if (!dashboardData?.dashboard?.stats) {
      return {
        totalLessons: 0,
        completedLessons: 0,
        upcomingLessons: 0,
        missedLessons: 0,
        totalStudyTime: 0,
        averageAttendance: 0,
        currentStreak: 0,
        longestStreak: 0,
      };
    }
    return dashboardData.dashboard.stats;
  }, [dashboardData]);

  const todayLessons = useMemo(() => {
    return dashboardData?.dashboard?.todayLessons || [];
  }, [dashboardData]);

  const upcomingLessons = useMemo(() => {
    return dashboardData?.dashboard?.upcomingLessons?.slice(0, 5) || [];
  }, [dashboardData]);

  const recentLessons = useMemo(() => {
    return dashboardData?.dashboard?.recentLessons?.slice(0, 5) || [];
  }, [dashboardData]);

  const studyProgress = useMemo(() => {
    return (
      dashboardData?.dashboard?.studyProgress || {
        currentWorks: [],
        learnedWorks: [],
        recentAnnotations: [],
      }
    );
  }, [dashboardData]);

  const teachers = useMemo(() => {
    return dashboardData?.dashboard?.teachers || teachersInfo || [];
  }, [dashboardData, teachersInfo]);

  // Function to refresh data
  const handleRefreshData = useCallback(async () => {
    await refreshDashboard();
  }, [refreshDashboard]);

  // Format functions
  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
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

  // Render estado sem professores
  if (error === 'no_teachers' || errorMessage === 'no_teachers') {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center max-w-lg">
            <div className="w-20 h-20 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiUserCheck className="w-10 h-10 text-theme-primary" />
            </div>
            <h1 className="text-2xl font-bold text-theme-primary classical-title mb-4">
              Você ainda não tem um professor
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              Para acessar sua área do aluno, você precisa ser vinculado a pelo
              menos um professor da plataforma. Entre em contato com seu
              professor para que ele adicione você como aluno.
            </p>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-lg border border-theme-primary/20 p-4">
                <h3 className="font-semibold text-theme-primary mb-2">
                  Como funciona?
                </h3>
                <div className="text-sm text-theme-secondary space-y-2">
                  <p>
                    1. Seu professor fará uma busca pelo seu email na plataforma
                  </p>
                  <p>2. Ele adicionará você como aluno dele</p>
                  <p>3. Você receberá acesso completo à área do aluno</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/contact" className="btn-classical-primary">
                  Falar com um Professor
                </Link>
                <Link href="/" className="btn-classical-secondary">
                  Voltar à Página Inicial
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Render estado de erro
  if (
    (error || errorMessage) &&
    error !== 'no_teachers' &&
    errorMessage !== 'no_teachers' &&
    !dashboardData
  ) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiXCircle className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              Erro ao Carregar Dashboard
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {error || errorMessage}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleRefreshData}
                disabled={loading.refreshing}
                className="btn-classical-primary flex items-center space-x-2 w-full justify-center"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${
                    loading.refreshing ? 'animate-spin' : ''
                  }`}
                />
                <span>
                  {loading.refreshing ? 'Carregando...' : 'Tentar Novamente'}
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
                <FiUser className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Meu Painel de Estudos
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Bem-vindo de volta, {studentProfile.name}! Continue seu progresso
              musical
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
                <FiBookOpen className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.totalLessons}
              </div>
              <div className="text-sm text-theme-tertiary">Total de Aulas</div>
              <div className="text-xs text-accent-green mt-1">
                {stats.completedLessons} concluídas
              </div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiCalendar className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.upcomingLessons}
              </div>
              <div className="text-sm text-theme-tertiary">Próximas Aulas</div>
              <div className="text-xs text-accent-blue mt-1">
                {todayLessons.length} hoje
              </div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiClock className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {formatDuration(stats.totalStudyTime).split(' ')[0]}
              </div>
              <div className="text-sm text-theme-tertiary">Horas de Estudo</div>
              <div className="text-xs text-accent-green mt-1">
                {stats.averageAttendance}% presença
              </div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-red rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiAward className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.currentStreak}
              </div>
              <div className="text-sm text-theme-tertiary">Sequência Atual</div>
              <div className="text-xs text-theme-tertiary mt-1">
                Recorde: {stats.longestStreak}
              </div>
            </AnimatedCard>
          </SequentialGrid>
        </AnimatedItem>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center">
                      <FiTarget className="w-5 h-5 text-theme-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-theme-primary classical-title">
                        Ações Rápidas
                      </h2>
                      <p className="text-theme-tertiary text-sm">
                        Acesse rapidamente suas atividades
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRefreshData}
                    disabled={loading.refreshing}
                    className="w-8 h-8 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group"
                  >
                    <FiRefreshCw
                      className={`w-4 h-4 text-theme-tertiary group-hover:text-brand-primary transition-all ${
                        loading.refreshing ? 'animate-spin' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    href="/student/calendar"
                    className="classical-card-2 p-4 text-left hover:border-brand-primary transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FiCalendar className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-theme-primary group-hover:text-brand-primary transition-colors">
                          Ver Calendário
                        </div>
                        <div className="text-sm text-theme-tertiary">
                          Suas aulas e cronograma
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/student/progress"
                    className="classical-card-2 p-4 text-left hover:border-brand-primary transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FiBarChart2 className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-theme-primary group-hover:text-brand-primary transition-colors">
                          Meu Progresso
                        </div>
                        <div className="text-sm text-theme-tertiary">
                          Estatísticas detalhadas
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/explore?filter=want-to-learn"
                    className="classical-card-2 p-4 text-left hover:border-brand-primary transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-red rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FiMusic className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-theme-primary group-hover:text-brand-primary transition-colors">
                          Explorar Obras
                        </div>
                        <div className="text-sm text-theme-tertiary">
                          Adicionar aos estudos
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </AnimatedCard>
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
                      <h2 className="text-xl font-bold text-theme-primary classical-title">
                        Aulas Recentes
                      </h2>
                      <p className="text-theme-tertiary text-sm">
                        {recentLessons.length} aulas concluídas recentemente
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/student/calendar"
                    className="text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <span>Ver todas</span>
                    <FiChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {recentLessons.slice(0, 4).map((lesson, index) => (
                    <AnimatedItem
                      key={lesson.id}
                      direction="left"
                      hover="lift"
                      style={{
                        animationDelay: `${index * 0.1}s`,
                        animationFillMode: 'backwards',
                      }}
                    >
                      <div className="classical-card-2 p-4 group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-theme-primary group-hover:text-brand-primary transition-colors">
                              {lesson.title}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-theme-tertiary mt-1">
                              <span>Prof. {lesson.teacher.name}</span>
                              <span>•</span>
                              <span>
                                {formatDate(lesson.scheduledAt)} •{' '}
                                {formatTime(lesson.scheduledAt)}
                              </span>
                              <span>•</span>
                              <span>{lesson.duration}min</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded-full text-xs font-medium">
                              Concluída
                            </span>
                            <Link
                              href={`/student/lessons/${lesson.id}`}
                              className="w-8 h-8 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group/btn"
                            >
                              <FiEye className="w-4 h-4 text-theme-tertiary group-hover/btn:text-brand-primary transition-colors" />
                            </Link>
                          </div>
                        </div>

                        {/* Lesson Details */}
                        {(lesson.skillsWorked.length > 0 ||
                          lesson.improvements.length > 0) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-theme-secondary">
                            {lesson.skillsWorked.length > 0 && (
                              <div>
                                <div className="text-xs font-medium text-theme-tertiary mb-1">
                                  Habilidades Trabalhadas:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {lesson.skillsWorked
                                    .slice(0, 3)
                                    .map((skill, skillIndex) => (
                                      <span
                                        key={skillIndex}
                                        className="px-2 py-1 bg-theme-elevated text-theme-secondary rounded text-xs"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  {lesson.skillsWorked.length > 3 && (
                                    <span className="px-2 py-1 bg-theme-elevated text-theme-tertiary rounded text-xs">
                                      +{lesson.skillsWorked.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {lesson.improvements.length > 0 && (
                              <div>
                                <div className="text-xs font-medium text-theme-tertiary mb-1">
                                  Melhorias:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {lesson.improvements
                                    .slice(0, 2)
                                    .map((improvement, impIndex) => (
                                      <span
                                        key={impIndex}
                                        className="px-2 py-1 bg-accent-green/10 text-accent-green rounded text-xs"
                                      >
                                        {improvement}
                                      </span>
                                    ))}
                                  {lesson.improvements.length > 2 && (
                                    <span className="px-2 py-1 bg-accent-green/10 text-accent-green rounded text-xs">
                                      +{lesson.improvements.length - 2}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Homework */}
                        {lesson.homework && (
                          <div className="mt-3 p-3 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-lg border border-theme-primary/20">
                            <div className="text-xs text-theme-tertiary mb-1">
                              Tarefa de Casa:
                            </div>
                            <div className="text-sm text-theme-primary line-clamp-2">
                              {lesson.homework}
                            </div>
                          </div>
                        )}
                      </div>
                    </AnimatedItem>
                  ))}

                  {recentLessons.length === 0 && (
                    <div className="text-center py-8">
                      <FiClock className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                      <p className="text-theme-tertiary">
                        Nenhuma aula recente ainda
                      </p>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Study Progress */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center">
                      <FiMusic className="w-5 h-5 text-theme-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-theme-primary classical-title">
                        Meus Estudos
                      </h2>
                      <p className="text-theme-tertiary text-sm">
                        Suas obras em estudo e já aprendidas
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/student/progress"
                    className="text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <span>Ver progresso</span>
                    <FiChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current Works */}
                  <div>
                    <h3 className="font-semibold text-theme-primary mb-3 flex items-center space-x-2">
                      <FiBookOpen className="w-4 h-4 text-accent-blue" />
                      <span>
                        Estudando Agora ({studyProgress.currentWorks.length})
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {studyProgress.currentWorks
                        .slice(0, 4)
                        .map((work, index) => (
                          <div
                            key={work.workId}
                            className="classical-card-2 p-3"
                          >
                            <div className="font-medium text-theme-primary text-sm">
                              {work.title}
                            </div>
                            <div className="text-xs text-theme-tertiary">
                              {work.composer}
                            </div>
                            {work.selectedScore && (
                              <div className="text-xs text-accent-blue mt-1">
                                {work.selectedScore.title} (
                                {work.selectedScore.type})
                              </div>
                            )}
                          </div>
                        ))}
                      {studyProgress.currentWorks.length === 0 && (
                        <p className="text-sm text-theme-tertiary py-4">
                          Nenhuma obra em estudo no momento
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Learned Works */}
                  <div>
                    <h3 className="font-semibold text-theme-primary mb-3 flex items-center space-x-2">
                      <FiCheckCircle className="w-4 h-4 text-accent-green" />
                      <span>
                        Já Aprendi ({studyProgress.learnedWorks.length})
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {studyProgress.learnedWorks
                        .slice(0, 4)
                        .map((work, index) => (
                          <div
                            key={work.workId}
                            className="classical-card-2 p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-theme-primary text-sm">
                                  {work.title}
                                </div>
                                <div className="text-xs text-theme-tertiary">
                                  {work.composer}
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <div className="text-xs text-accent-green font-medium">
                                  {work.mastery}%
                                </div>
                                {work.wouldRecommend && (
                                  <FiHeart className="w-3 h-3 text-accent-red" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      {studyProgress.learnedWorks.length === 0 && (
                        <p className="text-sm text-theme-tertiary py-4">
                          Nenhuma obra concluída ainda
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </AnimatedItem>
          </div>

          {/* Right Column - 1/3 */}
          <div className="lg:col-span-1 space-y-6">
            {/* Today's Schedule */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center">
                    <FiCalendar className="w-4 h-4 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-theme-primary">Hoje</h3>
                    <p className="text-xs text-theme-tertiary">
                      {todayLessons.length} aulas agendadas
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {todayLessons.slice(0, 4).map((lesson, index) => (
                    <div key={lesson.id} className="classical-card-2 p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-12 bg-brand-primary rounded-full"></div>
                        <div className="flex-1">
                          <div className="font-medium text-theme-primary text-sm">
                            {formatTime(lesson.scheduledAt)}
                          </div>
                          <div className="text-xs text-theme-tertiary">
                            Prof. {lesson.teacher.name}
                          </div>
                          <div className="text-xs text-accent-blue">
                            {lesson.duration}min
                          </div>
                        </div>
                        <Link
                          href={`/student/lessons/${lesson.id}`}
                          className="w-6 h-6 rounded bg-theme-elevated hover:bg-interactive-hover transition-colors flex items-center justify-center"
                        >
                          <FiEye className="w-3 h-3 text-theme-tertiary" />
                        </Link>
                      </div>
                    </div>
                  ))}

                  {todayLessons.length === 0 && (
                    <div className="text-center py-6">
                      <FiCalendar className="w-8 h-8 text-theme-tertiary mx-auto mb-2" />
                      <p className="text-sm text-theme-tertiary">
                        Nenhuma aula hoje
                      </p>
                    </div>
                  )}
                </div>

                {todayLessons.length > 0 && (
                  <Link
                    href="/student/calendar"
                    className="mt-4 block text-center text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors"
                  >
                    Ver agenda completa
                  </Link>
                )}
              </AnimatedCard>
            </AnimatedItem>

            {/* Upcoming Lessons */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-lg flex items-center justify-center">
                    <FiClock className="w-4 h-4 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-theme-primary">
                      Próximas Aulas
                    </h3>
                    <p className="text-xs text-theme-tertiary">Esta semana</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {upcomingLessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between py-2 border-b border-theme-secondary last:border-0"
                    >
                      <div>
                        <div className="text-sm font-medium text-theme-primary">
                          Prof. {lesson.teacher.name}
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          {formatDate(lesson.scheduledAt)} •{' '}
                          {formatTime(lesson.scheduledAt)}
                        </div>
                      </div>
                      <div className="text-xs text-accent-blue font-medium">
                        {lesson.duration}min
                      </div>
                    </div>
                  ))}

                  {upcomingLessons.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-theme-tertiary">
                        Nenhuma aula agendada
                      </p>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Teachers */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-red rounded-lg flex items-center justify-center">
                    <FiUserCheck className="w-4 h-4 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-theme-primary">
                      Meus Professores
                    </h3>
                    <p className="text-xs text-theme-tertiary">
                      {teachers.length} professor(es) vinculado(s)
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {teachers.map((teacher, index) => (
                    <div
                      key={teacher.teacherId}
                      className="classical-card-2 p-3"
                    >
                      <div className="flex items-center space-x-3">
                        {/* Avatar */}
                        <div className="relative w-10 h-10">
                          {teacher.teacherImage ? (
                            <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-brand-primary/20">
                              <Image
                                src={teacher.teacherImage}
                                alt={teacher.teacherName}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center border-2 border-brand-primary/20">
                              <FiUserCheck className="w-5 h-5 text-theme-primary" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="font-medium text-theme-primary text-sm">
                            {teacher.teacherName}
                          </div>
                          <div className="text-xs text-theme-tertiary">
                            {teacher.totalLessonsWithTeacher} aulas realizadas
                          </div>
                          {teacher.nextLessonAt && (
                            <div className="text-xs text-accent-blue">
                              Próxima: {formatDate(teacher.nextLessonAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {teachers.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-theme-tertiary">
                        Nenhum professor vinculado
                      </p>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            </AnimatedItem>
          </div>
        </div>
      </AnimatedContainer>
    </PageContainer>
  );
}
