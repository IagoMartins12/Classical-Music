// app/student/progress/pageClient.tsx - Client Component para Progresso do Aluno

'use client';

import { useCallback, useEffect } from 'react';
import {
  PiArrowsClockwise,
  PiBookOpen,
  PiCalendarBlank,
  PiCheckCircle,
  PiClock,
  PiFire,
  PiHeart,
  PiMedal,
  PiMusicNotes,
  PiStar,
  PiTarget,
  PiTrendUp,
  PiUser,
  PiUsers,
  PiWarningCircle,
} from 'react-icons/pi';
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
  PERIOD_OPTIONS,
} from '@/app/hooks/lessonsSystem/useStudentProgress';
import Select from '@/app/components/Common/Select';
import Image from '@/app/components/SmartImage';
import Link from 'next/link';
import { useTranslation } from '@/app/context/TranslationContext';
import dynamic from 'next/dynamic';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';

/**
 * Os gráficos descem à parte: o `recharts` pesa mais que o resto desta tela
 * somada e nada nele é preciso para a primeira pintura. Ver `charts.tsx`.
 */
const ProgressCharts = dynamic(() => import('./charts'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
      <div className="classical-card p-6 h-[26rem] animate-pulse" />
      <div className="classical-card p-6 h-[26rem] animate-pulse" />
    </div>
  ),
});

interface StudentProgressPageClientProps {
  initialData: StudentProgressResponse | null;
  errorMessage?: string;
}

export default function StudentProgressPageClient({
  initialData,
  errorMessage,
}: StudentProgressPageClientProps) {
  const { t } = useTranslation({ sections: ['student/progress'] });

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

  // Error state
  if ((error || errorMessage) && !progressData) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <Card densidade="larga" className="text-center max-w-md">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <PiWarningCircle className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              {t('error_loading_progress')}
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {error || errorMessage}
            </p>
            <div className="space-y-3">
              <Inline
                as="button"
                gap={2}
                onClick={refreshProgress}
                disabled={loading.refreshing}
                className="btn-classical-primary w-full justify-center"
              >
                <PiArrowsClockwise
                  className={`w-4 h-4 ${
                    loading.refreshing ? 'animate-spin' : ''
                  }`}
                />
                <span>
                  {loading.refreshing ? t('loading') : t('try_again')}
                </span>
              </Inline>
              {error && (
                <Button
                  variante="secundario"
                  type="submit"
                  onClick={clearError}
                  className="w-full"
                >
                  {t('clear_error')}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </PageContainer>
    );
  }

  if (!progressData) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <Card densidade="larga" className="text-center">
            <PiArrowsClockwise className="w-8 h-8 animate-spin text-ouro-texto mx-auto mb-4" />
            <p className="text-theme-secondary">{t('loading_progress')}</p>
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
          <div className="text-center mb-8 py-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-theme-glow">
                <PiTrendUp className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              {t('title')}
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              {t('subtitle')}
            </p>
          </div>
        </AnimatedItem>

        {/* Period Selector */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <Inline gap={4}>
              <h2 className="text-lg font-bold text-theme-primary">
                {formatPeriodLabel(currentPeriod)}
              </h2>
              {progressData.period.start && (
                <Text papel="rotulo" tom="fraco">
                  {new Date(progressData.period.start).toLocaleDateString(
                    'pt-BR'
                  )}{' '}
                  -{' '}
                  {new Date(progressData.period.end).toLocaleDateString(
                    'pt-BR'
                  )}{' '}
                </Text>
              )}
            </Inline>

            <Inline gap={3}>
              <Select
                value={currentPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                disabled={loading.changingPeriod}
                options={PERIOD_OPTIONS}
                className="input-classical w-auto min-w-48"
              />
              <Button
                variante="secundario"
                type="submit"
                onClick={refreshProgress}
                disabled={loading.refreshing}
              >
                <PiArrowsClockwise
                  className={`w-5 h-5 ${
                    loading.refreshing ? 'animate-spin' : ''
                  }`}
                />
                <NomeAcao acao="atualizar" />
              </Button>
            </Inline>
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
                  <Text papel="rotulo" tom="fraco" as="div">
                    {t('completed_lessons')}
                  </Text>
                  <div className="text-xs mt-1">
                    {progressData.stats.attendanceRate?.toFixed(1)}%{' '}
                    {t('attendance_rate')}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                  <PiBookOpen className="w-6 h-6 text-theme-primary" />
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
                  <Text papel="rotulo" tom="fraco" as="div">
                    {t('study_time')}
                  </Text>
                  <div className="text-xs mt-1">
                    {t('average_per_lesson')}:{' '}
                    {(
                      progressData.stats.totalStudyHours /
                      Math.max(1, progressData.stats.completedLessons)
                    ).toFixed(1)}
                    {t('per_lesson')}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                  <PiClock className="w-6 h-6 text-theme-primary" />
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
                  <Text papel="rotulo" tom="fraco" as="div">
                    {t('learned_works')}
                  </Text>
                  <div className="text-xs mt-1">
                    {progressData.stats.wantToLearnWorks} {t('in_list')}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                  <PiMusicNotes className="w-6 h-6 text-theme-primary" />
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
                  <Text papel="rotulo" tom="fraco" as="div">
                    {t('consecutive_days')}
                  </Text>
                  <div className="text-xs mt-1">
                    {t('record')}: {progressData.stats.longestStreak}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                  <PiFire className="w-6 h-6 text-theme-primary" />
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
                  {t('assignments')}
                </h3>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                  <PiTarget className="w-5 h-5 text-theme-primary" />
                </div>
              </div>

              <Stack gap={3}>
                <div className="flex justify-between items-center">
                  <span className="text-theme-secondary">{t('completed')}</span>
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
              </Stack>
            </AnimatedCard>

            {/* Study Consistency */}
            <AnimatedCard hover="lift" className="classical-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-theme-primary">
                  {t('consistency')}
                </h3>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                  <PiCalendarBlank className="w-5 h-5 text-theme-primary" />
                </div>
              </div>

              <Stack gap={3}>
                <div className="flex justify-between items-center">
                  <span className="text-theme-secondary">
                    {t('active_weeks')}
                  </span>
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
                      ? t('excellent')
                      : progressData.stats.studyConsistency >= 60
                        ? t('very_good')
                        : progressData.stats.studyConsistency >= 40
                          ? t('can_improve')
                          : t('needs_focus')}
                  </span>
                </div>
              </Stack>
            </AnimatedCard>

            {/* Annotations */}
            <AnimatedCard hover="lift" className="classical-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-theme-primary">
                  {t('annotations')}
                </h3>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                  <PiBookOpen className="w-5 h-5 text-theme-primary" />
                </div>
              </div>

              <Stack gap={3}>
                <div className="flex justify-between items-center">
                  <span className="text-theme-secondary">{t('total')}</span>
                  <span className="font-bold text-theme-primary">
                    {progressData.stats.totalAnnotations}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-theme-secondary">{t('useful')}</span>
                  <span className="font-bold">
                    {progressData.stats.helpfulAnnotations}
                  </span>
                </div>

                {progressData.stats.totalAnnotations > 0 && (
                  <div className="text-center">
                    <span className="text-sm font-medium">
                      {(
                        (progressData.stats.helpfulAnnotations /
                          progressData.stats.totalAnnotations) *
                        100
                      ).toFixed(1)}
                      % {t('useful_percentage')}
                    </span>
                  </div>
                )}
              </Stack>
            </AnimatedCard>
          </SequentialGrid>
        </AnimatedItem>

        {/* Charts Section — `recharts` só desce quando esta parte da tela
            entra em cena; ver `charts.tsx`. */}
        <ProgressCharts progressData={progressData} t={t} />

        {/* Teachers Breakdown */}
        {progressData.teacherBreakdown &&
          progressData.teacherBreakdown.length > 0 && (
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-theme-primary">
                    {t('progress_by_teacher')}
                  </h3>
                  <PiUsers className="w-6 h-6 text-ouro-texto" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {progressData.teacherBreakdown.map((teacher, index) => (
                    <AnimatedItem
                      key={teacher.teacherId}
                      hover="scale"
                      springType="bouncy"
                      delay={index * 0.1}
                    >
                      <div className="p-4 bg-theme-elevated rounded-lg border border-theme-secondary transition-all duration-300">
                        <Inline gap={3} className="mb-4">
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
                            <div className="w-10 h-10 rounded-full flex items-center justify-center">
                              <PiUser className="w-5 h-5 text-theme-primary" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-theme-primary text-sm">
                              {teacher.teacherName}
                            </h4>
                            <Text papel="legenda" tom="fraco" as="p">
                              {teacher.relationshipDuration}
                            </Text>
                          </div>
                        </Inline>

                        <Stack gap={2}>
                          <div className="flex justify-between text-sm">
                            <span className="text-theme-secondary">
                              {t('lessons')}
                            </span>
                            <span className="text-theme-primary font-medium">
                              {teacher.completedLessons}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-theme-secondary">
                              {t('hours')}
                            </span>
                            <span className="text-theme-primary font-medium">
                              {teacher.studyHours}h
                            </span>
                          </div>
                          {teacher.avgRating > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-theme-secondary">
                                {t('rating')}
                              </span>
                              <Inline gap={1}>
                                <span className="font-medium">
                                  {teacher.avgRating.toFixed(1)}
                                </span>
                                <PiStar className="w-3 h-3" />
                              </Inline>
                            </div>
                          )}
                        </Stack>

                        {teacher.specialties.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {teacher.specialties
                              .slice(0, 2)
                              .map((specialty, idx) => (
                                <Text
                                  papel="legenda"
                                  tom="ouro"
                                  key={idx}
                                  className="px-2 py-1 rounded-full"
                                >
                                  {specialty}
                                </Text>
                              ))}
                            {teacher.specialties.length > 2 && (
                              <Text
                                papel="legenda"
                                tom="fraco"
                                className="px-2 py-1 bg-theme-secondary rounded-full"
                              >
                                +{teacher.specialties.length - 2}
                              </Text>
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
                  {t('achievements')}
                </h3>
                <PiMedal className="w-6 h-6 text-ouro-texto" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {progressData.achievements.map((achievement, index) => (
                  <AnimatedItem
                    key={achievement.id}
                    hover="scale"
                    springType="bouncy"
                    delay={index * 0.1}
                  >
                    <div className="p-4 border rounded-lg">
                      <Inline gap={3} className="mb-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center">
                          <PiMedal className="w-4 h-4 text-theme-primary" />
                        </div>
                        <h4 className="font-bold text-theme-primary">
                          {achievement.title}
                        </h4>
                      </Inline>
                      <Text papel="rotulo" tom="suave" as="p">
                        {achievement.description}
                      </Text>
                      <div className="text-xs mt-2">
                        {t('achieved_on')}{' '}
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
                {t('works_progress')}
              </h3>
              <Link
                href="/learning"
                className="text-ouro-texto transition-colors flex items-center space-x-1"
              >
                <span>{t('view_all')}</span>
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
              <Stack>
                <h4 className="font-bold text-theme-primary flex items-center">
                  <PiCheckCircle className="w-5 h-5 mr-2" />
                  {t('already_learned')} ({progressData.stats.learnedWorks})
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
                              <Text papel="legenda" tom="fraco" as="p">
                                {work.composer}
                              </Text>
                              {work.difficulty && (
                                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded">
                                  {work.difficulty}
                                </span>
                              )}
                            </div>
                            {work.mastery && (
                              <Inline gap={1} className="ml-3">
                                <Text papel="legenda" tom="suave">
                                  {work.mastery}/5
                                </Text>
                                <PiStar className="w-3 h-3" />
                              </Inline>
                            )}
                          </div>
                          {work.learnedDate && (
                            <div className="text-xs mt-2">
                              {t('learned_on')}{' '}
                              {work.learnedDate.toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                      </AnimatedItem>
                    ))}
                </div>
              </Stack>

              {/* Want to Learn */}
              <Stack>
                <h4 className="font-bold text-theme-primary flex items-center">
                  <PiHeart className="w-5 h-5 mr-2" />
                  {t('want_to_learn')} ({progressData.stats.wantToLearnWorks})
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
                              <Text papel="legenda" tom="fraco" as="p">
                                {work.composer}
                              </Text>
                              {work.difficulty && (
                                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded">
                                  {work.difficulty}
                                </span>
                              )}
                            </div>
                          </div>
                          <Text
                            papel="legenda"
                            tom="suave"
                            as="div"
                            className="mt-2"
                          >
                            {t('added_on')}{' '}
                            {work.addedDate.toLocaleDateString('pt-BR')}
                          </Text>
                        </div>
                      </AnimatedItem>
                    ))}
                </div>
              </Stack>
            </div>
          </AnimatedCard>
        </AnimatedItem>
      </AnimatedContainer>
    </PageContainer>
  );
}
