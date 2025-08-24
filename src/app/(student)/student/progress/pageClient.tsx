// app/student/progress/pageClient.tsx - Client Component para Progresso do Aluno

'use client';

import { useCallback, useEffect } from 'react';
import {
  FiTrendingUp,
  FiBookOpen,
  FiClock,
  FiAward,
  FiTarget,
  FiUsers,
  FiCalendar,
  FiBarChart2,
  FiRefreshCw,
  FiCheckCircle,
  FiMusic,
  FiHeart,
  FiStar,
  FiUser,
  FiAlertCircle,
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
  SequentialGrid,
} from '../../../components/animation/AnimatedComponents';
import { StudentProgressResponse } from '@/app/requests/student-progress-requests';
import {
  useStudentProgress,
  formatPeriodLabel,
  getProgressColor,
  getStreakEmoji,
  getAssignmentTypeLabel,
  PERIOD_OPTIONS,
  CHART_COLORS,
} from '@/app/hooks/lessonsSystem/useStudentProgress';
import Select from '@/app/components/Common/Select';
import Image from 'next/image';
import Link from 'next/link';
import { FaFire } from 'react-icons/fa';

interface StudentProgressPageClientProps {
  initialData: StudentProgressResponse | null;
  errorMessage?: string;
}

export default function StudentProgressPageClient({
  initialData,
  errorMessage,
}: StudentProgressPageClientProps) {
  const {
    progressData,
    loading,
    error,
    currentPeriod,
    setInitialData,
    refreshProgress,
    changePeriod,
    clearError,
  } = useStudentProgress(initialData, '6months');

  // Initialize with server data
  useEffect(() => {
    if (initialData) {
      setInitialData(initialData);
    }
  }, [initialData, setInitialData]);

  // Handle period change
  const handlePeriodChange = useCallback(
    async (newPeriod: string) => {
      await changePeriod(newPeriod);
    },
    [changePeriod]
  );

  // Custom tooltip para gráficos
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-theme-elevated border border-theme-primary rounded-lg p-3 shadow-theme-medium">
          <p className="text-theme-primary font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name.includes('Horas') && 'h'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Error state
  if ((error || errorMessage) && !progressData) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiAlertCircle className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              Erro ao Carregar Progresso
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {error || errorMessage}
            </p>
            <div className="space-y-3">
              <button
                onClick={refreshProgress}
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

  if (!progressData) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center">
            <FiRefreshCw className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-4" />
            <p className="text-theme-secondary">Carregando progresso...</p>
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
                <FiTrendingUp className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Meu Progresso Musical
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Acompanhe sua jornada de aprendizado e evolução
            </p>
          </div>
        </AnimatedItem>

        {/* Period Selector */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-bold text-theme-primary">
                {formatPeriodLabel(currentPeriod)}
              </h2>
              {progressData.period.start && (
                <span className="text-sm text-theme-tertiary">
                  {new Date(progressData.period.start).toLocaleDateString(
                    'pt-BR'
                  )}{' '}
                  -{' '}
                  {new Date(progressData.period.end).toLocaleDateString(
                    'pt-BR'
                  )}{' '}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <Select
                value={currentPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                disabled={loading.changingPeriod}
                options={PERIOD_OPTIONS}
                className="input-classical w-auto min-w-48"
              />
              <button
                onClick={refreshProgress}
                disabled={loading.refreshing}
                className="btn-classical-secondary p-3"
              >
                <FiRefreshCw
                  className={`w-5 h-5 ${
                    loading.refreshing ? 'animate-spin' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </AnimatedItem>

        {/* Main Stats Grid */}
        <AnimatedItem direction="up" springType="gentle">
          <SequentialGrid
            cols={4}
            gap={6}
            delayBetweenItems={0.1}
            className="mb-8"
          >
            {/* Total Lessons */}
            <AnimatedCard hover="scale" className="classical-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-theme-primary">
                    {progressData.stats.completedLessons}
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    Aulas Completadas
                  </div>
                  <div className="text-xs text-accent-blue mt-1">
                    {progressData.stats.attendanceRate?.toFixed(1)}% presença
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
                  <FiBookOpen className="w-6 h-6 text-theme-primary" />
                </div>
              </div>
            </AnimatedCard>

            {/* Study Hours */}
            <AnimatedCard hover="scale" className="classical-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-theme-primary">
                    {progressData.stats.totalStudyHours}
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    Tempo de Estudo
                  </div>
                  <div className="text-xs text-accent-green mt-1">
                    Média:{' '}
                    {(
                      progressData.stats.totalStudyHours /
                      Math.max(1, progressData.stats.completedLessons)
                    ).toFixed(1)}
                    h/aula
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center">
                  <FiClock className="w-6 h-6 text-theme-primary" />
                </div>
              </div>
            </AnimatedCard>

            {/* Learned Works */}
            <AnimatedCard hover="scale" className="classical-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-theme-primary">
                    {progressData.stats.learnedWorks}
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    Obras Aprendidas
                  </div>
                  <div className="text-xs text-accent-purple mt-1">
                    {progressData.stats.wantToLearnWorks} na lista
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-pink rounded-xl flex items-center justify-center">
                  <FiMusic className="w-6 h-6 text-theme-primary" />
                </div>
              </div>
            </AnimatedCard>

            {/* Current Streak */}
            <AnimatedCard hover="scale" className="classical-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-theme-primary flex items-center">
                    {progressData.stats.currentStreak}
                    <span className="ml-2 text-base">
                      {getStreakEmoji(progressData.stats.currentStreak)}
                    </span>
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    Dias Consecutivos
                  </div>
                  <div className="text-xs text-accent-orange mt-1">
                    Recorde: {progressData.stats.longestStreak}
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-accent-orange to-accent-red rounded-xl flex items-center justify-center">
                  <FaFire className="w-6 h-6 text-theme-primary" />
                </div>
              </div>
            </AnimatedCard>
          </SequentialGrid>
        </AnimatedItem>

        {/* Secondary Stats */}
        <AnimatedItem direction="up" springType="gentle">
          <SequentialGrid
            cols={3}
            gap={6}
            delayBetweenItems={0.1}
            className="mb-8"
          >
            {/* Assignment Progress */}
            <AnimatedCard hover="lift" className="classical-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-theme-primary">
                  Tarefas
                </h3>
                <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
                  <FiTarget className="w-5 h-5 text-theme-primary" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-theme-secondary">Completadas</span>
                  <span className="font-bold text-theme-primary">
                    {progressData.stats.completedAssignments}/
                    {progressData.stats.totalAssignments}
                  </span>
                </div>

                <div className="w-full bg-theme-secondary rounded-full h-2">
                  <div
                    className="progress-bar h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${progressData.stats.assignmentCompletionRate}%`,
                    }}
                  />
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-medium ${getProgressColor(
                      progressData.stats.assignmentCompletionRate
                    )}`}
                  >
                    {progressData.stats.assignmentCompletionRate?.toFixed(1)}%
                  </span>
                </div>
              </div>
            </AnimatedCard>

            {/* Study Consistency */}
            <AnimatedCard hover="lift" className="classical-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-theme-primary">
                  Consistência
                </h3>
                <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center">
                  <FiCalendar className="w-5 h-5 text-theme-primary" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-theme-secondary">Semanas ativas</span>
                  <span className="font-bold text-theme-primary">
                    {Math.round(progressData.stats.studyConsistency)}%
                  </span>
                </div>

                <div className="w-full bg-theme-secondary rounded-full h-2">
                  <div
                    className="progress-bar h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${progressData.stats.studyConsistency}%`,
                    }}
                  />
                </div>

                <div className="text-center">
                  <span
                    className={`text-sm font-medium ${getProgressColor(
                      progressData.stats.studyConsistency
                    )}`}
                  >
                    {progressData.stats.studyConsistency >= 80
                      ? 'Excelente!'
                      : progressData.stats.studyConsistency >= 60
                      ? 'Muito bom!'
                      : progressData.stats.studyConsistency >= 40
                      ? 'Pode melhorar'
                      : 'Precisa de foco'}
                  </span>
                </div>
              </div>
            </AnimatedCard>

            {/* Annotations */}
            <AnimatedCard hover="lift" className="classical-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-theme-primary">
                  Anotações
                </h3>
                <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-pink rounded-xl flex items-center justify-center">
                  <FiBookOpen className="w-5 h-5 text-theme-primary" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-theme-secondary">Total</span>
                  <span className="font-bold text-theme-primary">
                    {progressData.stats.totalAnnotations}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-theme-secondary">Úteis</span>
                  <span className="font-bold text-accent-green">
                    {progressData.stats.helpfulAnnotations}
                  </span>
                </div>

                {progressData.stats.totalAnnotations > 0 && (
                  <div className="text-center">
                    <span className="text-sm font-medium text-accent-blue">
                      {(
                        (progressData.stats.helpfulAnnotations /
                          progressData.stats.totalAnnotations) *
                        100
                      ).toFixed(1)}
                      % úteis
                    </span>
                  </div>
                )}
              </div>
            </AnimatedCard>
          </SequentialGrid>
        </AnimatedItem>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Monthly Progress Chart */}
          <AnimatedItem direction="left" springType="smooth">
            <AnimatedCard hover="lift" className="classical-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-theme-primary">
                  Evolução Mensal
                </h3>
                <FiBarChart2 className="w-6 h-6 text-brand-primary" />
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData.monthlyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      opacity={0.3}
                    />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="completedLessons"
                      stroke={CHART_COLORS.primary}
                      strokeWidth={3}
                      dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 4 }}
                      name="Aulas Completadas"
                    />
                    <Line
                      type="monotone"
                      dataKey="studyHours"
                      stroke={CHART_COLORS.secondary}
                      strokeWidth={3}
                      dot={{
                        fill: CHART_COLORS.secondary,
                        strokeWidth: 2,
                        r: 4,
                      }}
                      name="Horas de Estudo"
                    />
                    <Line
                      type="monotone"
                      dataKey="learnedWorks"
                      stroke={CHART_COLORS.success}
                      strokeWidth={3}
                      dot={{ fill: CHART_COLORS.success, strokeWidth: 2, r: 4 }}
                      name="Obras Aprendidas"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </AnimatedCard>
          </AnimatedItem>

          {/* Assignment Types Chart */}
          <AnimatedItem direction="right" springType="smooth">
            <AnimatedCard hover="lift" className="classical-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-theme-primary">
                  Tipos de Tarefas concluidas
                </h3>
                <FiTarget className="w-6 h-6 text-brand-primary" />
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={progressData.assignmentBreakdown?.map(
                        (item, index) => ({
                          name: getAssignmentTypeLabel(item.type),
                          value: item.completed,
                          fill: CHART_COLORS.gradient[
                            index % CHART_COLORS.gradient.length
                          ],
                        })
                      )}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        percent > 0.05
                          ? `${name} (${(percent * 100).toFixed(0)}%)`
                          : ''
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {progressData.assignmentBreakdown?.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            CHART_COLORS.gradient[
                              index % CHART_COLORS.gradient.length
                            ]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </AnimatedCard>
          </AnimatedItem>
        </div>

        {/* Teachers Breakdown */}
        {progressData.teacherBreakdown &&
          progressData.teacherBreakdown.length > 0 && (
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-theme-primary">
                    Progresso por Professor
                  </h3>
                  <FiUsers className="w-6 h-6 text-brand-primary" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {progressData.teacherBreakdown.map((teacher, index) => (
                    <AnimatedItem
                      key={teacher.teacherId}
                      hover="scale"
                      springType="bouncy"
                      delay={index * 0.1}
                    >
                      <div className="p-4 bg-theme-elevated rounded-lg border border-theme-secondary hover:border-brand-primary transition-all duration-300">
                        <div className="flex items-center space-x-3 mb-4">
                          {teacher.teacherImage ? (
                            <div className="w-10 h-10 relative rounded-full overflow-hidden">
                              <Image
                                src={teacher.teacherImage}
                                alt={teacher.teacherName}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center">
                              <FiUser className="w-5 h-5 text-theme-primary" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-theme-primary text-sm">
                              {teacher.teacherName}
                            </h4>
                            <p className="text-xs text-theme-tertiary">
                              {teacher.relationshipDuration}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-theme-secondary">Aulas</span>
                            <span className="text-theme-primary font-medium">
                              {teacher.completedLessons}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-theme-secondary">Horas</span>
                            <span className="text-theme-primary font-medium">
                              {teacher.studyHours}h
                            </span>
                          </div>
                          {teacher.avgRating > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-theme-secondary">
                                Avaliação
                              </span>
                              <div className="flex items-center space-x-1">
                                <span className="text-accent-yellow font-medium">
                                  {teacher.avgRating.toFixed(1)}
                                </span>
                                <FiStar className="w-3 h-3 text-accent-yellow" />
                              </div>
                            </div>
                          )}
                        </div>

                        {teacher.specialties.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {teacher.specialties
                              .slice(0, 2)
                              .map((specialty, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 text-xs bg-brand-primary/10 text-brand-primary rounded-full"
                                >
                                  {specialty}
                                </span>
                              ))}
                            {teacher.specialties.length > 2 && (
                              <span className="px-2 py-1 text-xs bg-theme-secondary text-theme-tertiary rounded-full">
                                +{teacher.specialties.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </AnimatedItem>
                  ))}
                </div>
              </AnimatedCard>
            </AnimatedItem>
          )}

        {/* Achievements */}
        {progressData.achievements && progressData.achievements.length > 0 && (
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard hover="lift" className="classical-card p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-theme-primary">
                  Conquistas
                </h3>
                <FiAward className="w-6 h-6 text-brand-primary" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {progressData.achievements.map((achievement, index) => (
                  <AnimatedItem
                    key={achievement.id}
                    hover="scale"
                    springType="bouncy"
                    delay={index * 0.1}
                  >
                    <div className="p-4 bg-gradient-to-r from-accent-green/5 to-accent-blue/5 border border-accent-green/30 rounded-lg">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-full flex items-center justify-center">
                          <FiAward className="w-4 h-4 text-theme-primary" />
                        </div>
                        <h4 className="font-bold text-theme-primary">
                          {achievement.title}
                        </h4>
                      </div>
                      <p className="text-sm text-theme-secondary">
                        {achievement.description}
                      </p>
                      <div className="text-xs text-accent-green mt-2">
                        Conquistado em{' '}
                        {achievement.earnedAt.toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </AnimatedItem>
                ))}
              </div>
            </AnimatedCard>
          </AnimatedItem>
        )}

        {/* Recent Works Progress */}
        <AnimatedItem direction="up" springType="gentle">
          <AnimatedCard hover="lift" className="classical-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-theme-primary">
                Progresso de Obras
              </h3>
              <Link
                href="/learning"
                className="text-brand-primary hover:text-brand-secondary transition-colors flex items-center space-x-1"
              >
                <span>Ver todas</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Learned Works */}
              <div>
                <h4 className="font-bold text-theme-primary mb-4 flex items-center">
                  <FiCheckCircle className="w-5 h-5 mr-2 text-accent-green" />
                  Obras Aprendidas ({progressData.stats.learnedWorks})
                </h4>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {progressData.workProgress
                    ?.filter((work) => work.status === 'learned')
                    .slice(0, 5)
                    .map((work, index) => (
                      <AnimatedItem
                        key={work.workId}
                        hover="scale"
                        springType="gentle"
                        delay={index * 0.05}
                      >
                        <div className="p-3 bg-theme-elevated rounded-lg border border-theme-secondary">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h5 className="font-medium text-theme-primary text-sm">
                                {work.workTitle}
                              </h5>
                              <p className="text-xs text-theme-tertiary">
                                {work.composer}
                              </p>
                              {work.difficulty && (
                                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-accent-blue/10 text-accent-blue rounded">
                                  {work.difficulty}
                                </span>
                              )}
                            </div>
                            {work.mastery && (
                              <div className="flex items-center space-x-1 ml-3">
                                <span className="text-xs text-theme-secondary">
                                  {work.mastery}/5
                                </span>
                                <FiStar className="w-3 h-3 text-accent-yellow" />
                              </div>
                            )}
                          </div>
                          {work.learnedDate && (
                            <div className="text-xs text-accent-green mt-2">
                              Aprendida em{' '}
                              {work.learnedDate.toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                      </AnimatedItem>
                    ))}
                </div>
              </div>

              {/* Want to Learn */}
              <div>
                <h4 className="font-bold text-theme-primary mb-4 flex items-center">
                  <FiHeart className="w-5 h-5 mr-2 text-accent-blue" />
                  Quero Aprender ({progressData.stats.wantToLearnWorks})
                </h4>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {progressData.workProgress
                    ?.filter((work) => work.status === 'wanting')
                    .slice(0, 5)
                    .map((work, index) => (
                      <AnimatedItem
                        key={work.workId}
                        hover="scale"
                        springType="gentle"
                        delay={index * 0.05}
                      >
                        <div className="p-3 bg-theme-elevated rounded-lg border border-theme-secondary">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h5 className="font-medium text-theme-primary text-sm">
                                {work.workTitle}
                              </h5>
                              <p className="text-xs text-theme-tertiary">
                                {work.composer}
                              </p>
                              {work.difficulty && (
                                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-accent-blue/10 text-accent-blue rounded">
                                  {work.difficulty}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-theme-secondary mt-2">
                            Adicionada em{' '}
                            {work.addedDate.toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </AnimatedItem>
                    ))}
                </div>
              </div>
            </div>
          </AnimatedCard>
        </AnimatedItem>
      </AnimatedContainer>
    </PageContainer>
  );
}
