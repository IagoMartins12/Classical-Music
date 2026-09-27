// app/(teacher)/teacher/students/[studentId]/progress/pageClient.tsx - Client Component para Relatório de Progresso

'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from '@/app/components/SmartImage';
import {
  PiArrowLeft,
  PiArrowsClockwise,
  PiBookOpen,
  PiCaretRight,
  PiChartBar,
  PiCheckCircle,
  PiClock,
  PiHeart,
  PiMedal,
  PiMusicNotes,
  PiShareNetwork,
  PiTarget,
  PiTrendUp,
  PiUser,
  PiWarningCircle,
} from 'react-icons/pi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
  SequentialGrid,
} from '../../../../../components/animation/AnimatedComponents';
import {
  useTeacherProgressReport,
  getDifficultyLabel,
  CHART_COLORS,
  PERIOD_FILTER_OPTIONS,
} from '@/app/hooks/lessonsSystem/useTeacherProgressReport';
import {
  TeacherProgressReportResponse,
  PeriodOption,
} from '@/app/types/teacherProgressReport';
import Select from '@/app/components/Common/Select';
import { useTranslation } from '@/app/context/TranslationContext';
import ShareReportModal, {
  ShareReportData,
} from '@/app/components/TeacherSystem/ShareReportModal';
import { shareProgressReport } from '@/app/requests/portal/progress-report';
import dynamic from 'next/dynamic';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';

/**
 * Os gráficos descem à parte — ver `charts.tsx`.
 */
const MonthlyEvolutionChart = dynamic(
  () => import('./charts').then((m) => m.MonthlyEvolutionChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 w-full rounded-xl bg-theme-elevated animate-pulse" />
    ),
  }
);
const BeforeAfterChart = dynamic(
  () => import('./charts').then((m) => m.BeforeAfterChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 w-full rounded-xl bg-theme-elevated animate-pulse" />
    ),
  }
);
const SkillsRadarChart = dynamic(
  () => import('./charts').then((m) => m.SkillsRadarChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 w-full rounded-xl bg-theme-elevated animate-pulse" />
    ),
  }
);

interface TeacherProgressPageClientProps {
  studentId: string;
  initialData: TeacherProgressReportResponse | null;
  errorMessage?: string;
  initialPeriod: PeriodOption;
}

export default function TeacherProgressPageClient({
  studentId,
  initialData,
  errorMessage,
  initialPeriod,
}: TeacherProgressPageClientProps) {
  const { t } = useTranslation({ sections: ['teacher/progress'] });

  const [shareSuccess, setShareSuccess] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingReport, setSharingReport] = useState(false);

  const {
    reportData,
    loading,
    error,
    currentPeriod,
    setInitialData,
    refreshReport,
    changePeriod,
    clearError,
  } = useTeacherProgressReport(studentId, initialData, initialPeriod);

  // Initialize with server data
  useEffect(() => {
    if (initialData) {
      setInitialData(initialData);
    }
  }, [initialData, setInitialData]);

  // Handle period change
  const handlePeriodChange = useCallback(
    async (newPeriod: string) => {
      await changePeriod(newPeriod as PeriodOption);
    },
    [changePeriod]
  );

  // Handle share with student
  const handleShareWithStudent = useCallback(
    async (shareData: ShareReportData) => {
      setSharingReport(true);
      try {
        // A API gera o conteúdo compartilhado a partir dos dados do período;
        // daqui vão só aluno, janela, seções e textos.
        await shareProgressReport(studentId, currentPeriod, shareData);

        setShareSuccess('Relatório compartilhado com sucesso!');
        setTimeout(() => setShareSuccess(null), 5000);
        return true;
      } catch (error) {
        console.error('Error sharing report:', error);
        return false;
      } finally {
        setSharingReport(false);
      }
    },
    [studentId, currentPeriod]
  );

  // Error state
  if ((error || errorMessage) && !reportData) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <Card densidade="larga" className="text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <PiWarningCircle className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              {t('error_loading_report')}
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {error || errorMessage}
            </p>
            <div className="space-y-3">
              <Inline
                as="button"
                gap={2}
                onClick={refreshReport}
                disabled={loading.refreshing}
                className="btn-classical-primary w-full justify-center"
              >
                <PiArrowsClockwise
                  className={`w-4 h-4 ${
                    loading.refreshing ? 'animate-spin' : ''
                  }`}
                />
                <span>
                  {loading.refreshing ? t('loading_report') : t('try_again')}
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

  if (!reportData) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <Card densidade="larga" className="text-center">
            <PiArrowsClockwise className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-4" />
            <p className="text-theme-secondary">{t('loading_report')}</p>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true} className="min-h-screen">
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Breadcrumb & Navigation */}
        <AnimatedItem direction="down" springType="gentle">
          <Inline
            as="nav"
            gap={2}
            className="text-sm text-theme-tertiary mb-6 pt-4"
          >
            <Link
              href="/teacher"
              className="hover:text-brand-primary transition-colors duration-300 font-medium"
            >
              {t('breadcrumb_dashboard')}
            </Link>
            <PiCaretRight className="w-4 h-4" />
            <Link
              href="/teacher/students"
              className="hover:text-brand-primary transition-colors duration-300 font-medium"
            >
              {t('breadcrumb_students')}
            </Link>
            <PiCaretRight className="w-4 h-4" />
            <Link
              href={`/teacher/students/${studentId}`}
              className="hover:text-brand-primary transition-colors duration-300 font-medium"
            >
              {t('breadcrumb_student_detail')}
            </Link>
            <PiCaretRight className="w-4 h-4" />
            <span className="text-theme-primary font-medium">
              {t('breadcrumb_progress_report')}
            </span>
          </Inline>
        </AnimatedItem>

        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
            <Inline gap={4} className="mb-4 lg:mb-0">
              <Link
                href={`/teacher/students/${studentId}`}
                className="w-12 h-12 rounded-xl bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group"
              >
                <PiArrowLeft className="w-5 h-5 text-theme-tertiary group-hover:text-brand-primary transition-colors" />
              </Link>

              <Inline gap={4}>
                {reportData.studentInfo.image ? (
                  <div className="w-14 h-14 rounded-full overflow-hidden border-3 border-brand-primary/20">
                    <Image
                      src={reportData.studentInfo.image}
                      alt={reportData.studentInfo.name}
                      width={56}
                      height={56}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center">
                    <PiUser className="w-7 h-7 text-theme-primary" />
                  </div>
                )}

                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gradient-brand classical-title">
                    {t('page_title')}
                  </h1>
                  <p className="text-lg text-theme-secondary">
                    {reportData.studentInfo.name} •{' '}
                    {getDifficultyLabel(reportData.studentInfo.level)}
                  </p>
                  <Text papel="rotulo" tom="fraco" as="p">
                    {t('data_period', {
                      start:
                        reportData.reportMetadata.periodStart.toLocaleDateString(
                          'pt-BR'
                        ),
                      end: reportData.reportMetadata.periodEnd.toLocaleDateString(
                        'pt-BR'
                      ),
                    })}
                  </Text>
                </div>
              </Inline>
            </Inline>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <Select
                value={currentPeriod.type}
                onChange={(e) => handlePeriodChange(e.target.value)}
                disabled={loading.changingPeriod}
                options={PERIOD_FILTER_OPTIONS}
                className="input-classical w-full sm:w-48"
              />

              <div className="flex space-x-3">
                <Button
                  variante="secundario"
                  type="submit"
                  onClick={refreshReport}
                  disabled={loading.refreshing}
                  title={t('btn_refresh_data')}
                >
                  <PiArrowsClockwise
                    className={`w-5 h-5 ${
                      loading.refreshing ? 'animate-spin' : ''
                    }`}
                  />
                </Button>

                <Inline
                  as="button"
                  gap={2}
                  onClick={() => setShowShareModal(true)}
                  disabled={!reportData}
                  className="btn-classical-primary"
                >
                  <PiShareNetwork className="w-4 h-4" />
                  <span>{t('btn_share_with_student')}</span>
                </Inline>
              </div>
            </div>
          </div>
        </AnimatedItem>

        {/* Success Message */}
        {shareSuccess && (
          <AnimatedItem direction="up" springType="gentle">
            <Card
              densidade="compacta"
              className="border-l-4 border-accent-green mb-6"
            >
              <Inline gap={3}>
                <PiCheckCircle className="w-5 h-5 text-accent-green" />
                <span className="text-accent-green font-medium">
                  {shareSuccess}
                </span>
              </Inline>
            </Card>
          </AnimatedItem>
        )}

        {/* Overview Stats */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-theme-primary classical-title mb-6 flex items-center">
              <PiChartBar className="w-6 h-6 mr-3 text-brand-primary" />
              {t('overview_section')}
            </h2>

            <SequentialGrid cols={4} gap={6} delayBetweenItems={0.1}>
              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mx-auto mb-3">
                  <PiBookOpen className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {reportData.overview.completedLessons}
                </div>
                <Text papel="rotulo" tom="fraco" as="div" className="mb-2">
                  {t('total_lessons')}
                </Text>
                <div className="text-xs text-accent-blue">
                  {reportData.overview.completionRate}% {t('completion_rate')}
                </div>
              </AnimatedCard>

              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-3">
                  <PiClock className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {reportData.overview.totalStudyHours}h
                </div>
                <Text papel="rotulo" tom="fraco" as="div" className="mb-2">
                  {t('study_hours')}
                </Text>
                <div className="text-xs text-accent-green">
                  {reportData.overview.attendanceRate}% {t('attendance_rate')}
                </div>
              </AnimatedCard>

              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-pink rounded-xl flex items-center justify-center mx-auto mb-3">
                  <PiMusicNotes className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {reportData.overview.piecesStudied}
                </div>
                <Text papel="rotulo" tom="fraco" as="div" className="mb-2">
                  {t('pieces_studied')}
                </Text>
                <div className="text-xs text-accent-purple">
                  {reportData.overview.favoritePieces} {t('favorite_pieces')}
                </div>
              </AnimatedCard>

              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-accent-orange to-accent-red rounded-xl flex items-center justify-center mx-auto mb-3">
                  <PiMedal className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {reportData.overview.currentStreak}
                </div>
                <Text papel="rotulo" tom="fraco" as="div" className="mb-2">
                  {t('current_streak')}
                </Text>
                <div className="text-xs text-accent-orange">
                  Max: {reportData.overview.longestStreak}
                </div>
              </AnimatedCard>
            </SequentialGrid>
          </div>
        </AnimatedItem>

        {/* Progress Evolution Charts */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-theme-primary classical-title mb-6 flex items-center">
              <PiTrendUp className="w-6 h-6 mr-3 text-brand-primary" />
              {t('progress_evolution')}
            </h2>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Monthly Evolution */}
              <AnimatedCard hover="lift" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary mb-4">
                  {t('monthly_progress')}
                </h3>
                <div className="h-80">
                  <MonthlyEvolutionChart reportData={reportData} t={t} />
                </div>
              </AnimatedCard>

              {/* Before/After Comparison */}
              <AnimatedCard hover="lift" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary mb-4">
                  {t('before_after_analysis')}
                </h3>
                <div className="h-80">
                  <BeforeAfterChart reportData={reportData} t={t} />
                </div>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedItem>

        {/* Musical Preferences */}
        {reportData.preferences.favoriteComposers.length > 0 && (
          <AnimatedItem direction="up" springType="gentle">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-theme-primary classical-title mb-6 flex items-center">
                <PiHeart className="w-6 h-6 mr-3 text-brand-primary" />
                {t('musical_preferences')}
              </h2>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Favorite Composers */}
                <AnimatedCard hover="lift" className="classical-card p-6">
                  <h3 className="text-lg font-bold text-theme-primary mb-4">
                    {t('favorite_composers')}
                  </h3>
                  <div className="space-y-3">
                    {reportData.preferences.favoriteComposers
                      .slice(0, 6)
                      .map((composer, index) => (
                        <div
                          key={composer.name}
                          className="flex items-center justify-between p-3 bg-theme-elevated rounded-lg"
                        >
                          <Inline gap={3}>
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                              style={{
                                backgroundColor:
                                  CHART_COLORS.gradient[
                                    index % CHART_COLORS.gradient.length
                                  ],
                              }}
                            >
                              {composer.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-theme-primary">
                                {composer.name}
                              </div>
                              <Text papel="legenda" tom="fraco" as="div">
                                {composer.epoch}
                              </Text>
                            </div>
                          </Inline>
                          <div className="text-right">
                            <Text
                              papel="rotulo"
                              tom="forte"
                              as="div"
                              className="font-medium"
                            >
                              {composer.studiedCount}/{composer.worksCount}
                            </Text>
                            <Text papel="legenda" tom="fraco" as="div">
                              {composer.percentage}% estudado
                            </Text>
                          </div>
                        </div>
                      ))}
                  </div>
                </AnimatedCard>

                {/* Skills Assessment Radar */}
                <AnimatedCard hover="lift" className="classical-card p-6">
                  <h3 className="text-lg font-bold text-theme-primary mb-4">
                    Avaliação de Habilidades
                  </h3>
                  <div className="h-80">
                    <SkillsRadarChart reportData={reportData} t={t} />
                  </div>
                </AnimatedCard>
              </div>
            </div>
          </AnimatedItem>
        )}

        {/* Pedagogical Insights */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-theme-primary classical-title mb-6 flex items-center">
              <PiTarget className="w-6 h-6 mr-3 text-brand-primary" />
              {t('pedagogical_insights')}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Learning Style */}
              <AnimatedCard hover="lift" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary mb-4">
                  {t('learning_style')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="inline-block px-3 py-1 bg-brand-primary text-white rounded-full text-sm font-medium">
                      {reportData.insights.learningStyle.primary}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-theme-primary mb-2">
                      {t('strong_areas')}
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {reportData.insights.strongAreas.map((area, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-accent-green/10 text-accent-green rounded text-sm"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-theme-primary mb-2">
                      {t('improvement_areas')}
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {reportData.insights.improvementAreas.map(
                        (area, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-accent-yellow/10 text-accent-yellow rounded text-sm"
                          >
                            {area}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </AnimatedCard>

              {/* Recommendations */}
              <AnimatedCard hover="lift" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary mb-4">
                  {t('recommended_focus')}
                </h3>
                <div className="space-y-3">
                  {reportData.insights.recommendedFocus.map((focus, index) => (
                    <Inline gap={3} key={index}>
                      <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                      <Text papel="rotulo" tom="forte">
                        {focus}
                      </Text>
                    </Inline>
                  ))}
                </div>
              </AnimatedCard>

              {/* Next Steps */}
              <AnimatedCard hover="lift" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary mb-4">
                  {t('next_steps')}
                </h3>
                <div className="space-y-3">
                  {reportData.insights.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-white">
                          {index + 1}
                        </span>
                      </div>
                      <Text papel="rotulo" tom="forte">
                        {step}
                      </Text>
                    </div>
                  ))}
                </div>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedItem>

        {/* Report Metadata */}
        <AnimatedItem direction="up" springType="gentle">
          <Card
            densidade="compacta"
            className="bg-theme-elevated/50 border border-theme-secondary/50"
          >
            <Text
              papel="rotulo"
              tom="fraco"
              as="div"
              className="flex flex-col sm:flex-row items-center justify-between"
            >
              <Inline gap={4} className="mb-2 sm:mb-0">
                <span>
                  {t('report_generated', {
                    date: reportData.reportMetadata.generatedAt.toLocaleString(
                      'pt-BR'
                    ),
                  })}
                </span>
                <span>•</span>
                <span
                  className={`px-2 py-1 rounded ${
                    reportData.reportMetadata.dataQuality === 'excellent'
                      ? 'bg-accent-green/10 text-accent-green'
                      : reportData.reportMetadata.dataQuality === 'good'
                        ? 'bg-accent-blue/10 text-accent-blue'
                        : 'bg-accent-yellow/10 text-accent-yellow'
                  }`}
                >
                  Qualidade: {reportData.reportMetadata.dataQuality}
                </span>
              </Inline>
              <div className="text-xs">{t('analysis_disclaimer')}</div>
            </Text>
          </Card>
        </AnimatedItem>

        {/* Share Report Modal */}
        <ShareReportModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          onShare={handleShareWithStudent}
          loading={sharingReport}
          studentName={reportData.studentInfo.name}
          periodLabel={reportData.reportMetadata.periodLabel}
        />
      </AnimatedContainer>
    </PageContainer>
  );
}
