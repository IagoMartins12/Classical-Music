// app/(teacher)/teacher/students/[studentId]/progress/pageClient.tsx - Client Component para Relatório de Progresso

'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FiArrowLeft,
  FiShare2,
  FiRefreshCw,
  FiTrendingUp,
  FiTarget,
  FiBookOpen,
  FiClock,
  FiAward,
  FiBarChart2,
  FiHeart,
  FiMusic,
  FiCheckCircle,
  FiAlertCircle,
  FiUser,
  FiChevronRight,
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
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
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
        // First, save the shared report to database
        const response = await fetch(
          `/api/teacher/students/${studentId}/progress-report/shared`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: shareData.title,
              description: shareData.description,
              teacherMessage: shareData.teacherMessage,
              selectedSections: shareData.selectedSections,
              allowComments: shareData.allowComments,
              expiresInDays: shareData.expiresInDays,
              reportData: reportData, // Full report data
              periodStart: reportData?.reportMetadata.periodStart,
              periodEnd: reportData?.reportMetadata.periodEnd,
              periodLabel: reportData?.reportMetadata.periodLabel,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Erro ao compartilhar relatório');
        }

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
    [studentId, reportData]
  );

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-theme-elevated border border-theme-primary rounded-lg p-3 shadow-theme-medium">
          <p className="text-theme-primary font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name.includes('Rate') || entry.name.includes('Taxa')
                ? '%'
                : ''}
              {entry.name.includes('Hours') || entry.name.includes('Horas')
                ? 'h'
                : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Error state
  if ((error || errorMessage) && !reportData) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiAlertCircle className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              {t('error_loading_report')}
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {error || errorMessage}
            </p>
            <div className="space-y-3">
              <button
                onClick={refreshReport}
                disabled={loading.refreshing}
                className="btn-classical-primary flex items-center space-x-2 w-full justify-center"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${
                    loading.refreshing ? 'animate-spin' : ''
                  }`}
                />
                <span>
                  {loading.refreshing ? t('loading_report') : t('try_again')}
                </span>
              </button>
              {error && (
                <button
                  onClick={clearError}
                  className="btn-classical-secondary w-full"
                >
                  {t('clear_error')}
                </button>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!reportData) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center">
            <FiRefreshCw className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-4" />
            <p className="text-theme-secondary">{t('loading_report')}</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true} className="min-h-screen">
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Breadcrumb & Navigation */}
        <AnimatedItem direction="down" springType="gentle">
          <nav className="flex items-center space-x-2 text-sm text-theme-tertiary mb-6 pt-4">
            <Link
              href="/teacher"
              className="hover:text-brand-primary transition-colors duration-300 font-medium"
            >
              {t('breadcrumb_dashboard')}
            </Link>
            <FiChevronRight className="w-4 h-4" />
            <Link
              href="/teacher/students"
              className="hover:text-brand-primary transition-colors duration-300 font-medium"
            >
              {t('breadcrumb_students')}
            </Link>
            <FiChevronRight className="w-4 h-4" />
            <Link
              href={`/teacher/students/${studentId}`}
              className="hover:text-brand-primary transition-colors duration-300 font-medium"
            >
              {t('breadcrumb_student_detail')}
            </Link>
            <FiChevronRight className="w-4 h-4" />
            <span className="text-theme-primary font-medium">
              {t('breadcrumb_progress_report')}
            </span>
          </nav>
        </AnimatedItem>

        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <Link
                href={`/teacher/students/${studentId}`}
                className="w-12 h-12 rounded-xl bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group"
              >
                <FiArrowLeft className="w-5 h-5 text-theme-tertiary group-hover:text-brand-primary transition-colors" />
              </Link>

              <div className="flex items-center space-x-4">
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
                    <FiUser className="w-7 h-7 text-theme-primary" />
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
                  <p className="text-sm text-theme-tertiary">
                    {t('data_period', {
                      start:
                        reportData.reportMetadata.periodStart.toLocaleDateString(
                          'pt-BR'
                        ),
                      end: reportData.reportMetadata.periodEnd.toLocaleDateString(
                        'pt-BR'
                      ),
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <Select
                value={currentPeriod.type}
                onChange={(e) => handlePeriodChange(e.target.value)}
                disabled={loading.changingPeriod}
                options={PERIOD_FILTER_OPTIONS}
                className="input-classical w-full sm:w-48"
              />

              <div className="flex space-x-3">
                <button
                  onClick={refreshReport}
                  disabled={loading.refreshing}
                  className="btn-classical-secondary p-3"
                  title={t('btn_refresh_data')}
                >
                  <FiRefreshCw
                    className={`w-5 h-5 ${
                      loading.refreshing ? 'animate-spin' : ''
                    }`}
                  />
                </button>

                <button
                  onClick={() => setShowShareModal(true)}
                  disabled={!reportData}
                  className="btn-classical-primary flex items-center space-x-2"
                >
                  <FiShare2 className="w-4 h-4" />
                  <span>{t('btn_share_with_student')}</span>
                </button>
              </div>
            </div>
          </div>
        </AnimatedItem>

        {/* Success Message */}
        {shareSuccess && (
          <AnimatedItem direction="up" springType="gentle">
            <div className="classical-card p-4 border-l-4 border-accent-green mb-6">
              <div className="flex items-center space-x-3">
                <FiCheckCircle className="w-5 h-5 text-accent-green" />
                <span className="text-accent-green font-medium">
                  {shareSuccess}
                </span>
              </div>
            </div>
          </AnimatedItem>
        )}

        {/* Overview Stats */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-theme-primary classical-title mb-6 flex items-center">
              <FiBarChart2 className="w-6 h-6 mr-3 text-brand-primary" />
              {t('overview_section')}
            </h2>

            <SequentialGrid cols={4} gap={6} delayBetweenItems={0.1}>
              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiBookOpen className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {reportData.overview.completedLessons}
                </div>
                <div className="text-sm text-theme-tertiary mb-2">
                  {t('total_lessons')}
                </div>
                <div className="text-xs text-accent-blue">
                  {reportData.overview.completionRate}% {t('completion_rate')}
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
                  {reportData.overview.totalStudyHours}h
                </div>
                <div className="text-sm text-theme-tertiary mb-2">
                  {t('study_hours')}
                </div>
                <div className="text-xs text-accent-green">
                  {reportData.overview.attendanceRate}% {t('attendance_rate')}
                </div>
              </AnimatedCard>

              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-pink rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiMusic className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {reportData.overview.piecesStudied}
                </div>
                <div className="text-sm text-theme-tertiary mb-2">
                  {t('pieces_studied')}
                </div>
                <div className="text-xs text-accent-purple">
                  {reportData.overview.favoritePieces} {t('favorite_pieces')}
                </div>
              </AnimatedCard>

              <AnimatedCard
                hover="scale"
                className="classical-card p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-accent-orange to-accent-red rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiAward className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="text-2xl font-bold text-theme-primary mb-1">
                  {reportData.overview.currentStreak}
                </div>
                <div className="text-sm text-theme-tertiary mb-2">
                  {t('current_streak')}
                </div>
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
              <FiTrendingUp className="w-6 h-6 mr-3 text-brand-primary" />
              {t('progress_evolution')}
            </h2>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Monthly Evolution */}
              <AnimatedCard hover="lift" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary mb-4">
                  {t('monthly_progress')}
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reportData.evolution.monthly}>
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
                        dataKey="lessonsCompleted"
                        stroke={CHART_COLORS.primary}
                        strokeWidth={3}
                        name={t('chart_lessons_completed')}
                      />
                      <Line
                        type="monotone"
                        dataKey="studyHours"
                        stroke={CHART_COLORS.success}
                        strokeWidth={3}
                        name={t('chart_study_hours')}
                      />
                      <Line
                        type="monotone"
                        dataKey="attendanceRate"
                        stroke={CHART_COLORS.warning}
                        strokeWidth={3}
                        name={t('chart_attendance_rate')}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </AnimatedCard>

              {/* Before/After Comparison */}
              <AnimatedCard hover="lift" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary mb-4">
                  {t('before_after_analysis')}
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          metric: 'Obras',
                          [t('before_classes')]:
                            reportData.evolution.beforeAfter.beforeClasses
                              .totalWorks,
                          [t('after_classes')]:
                            reportData.evolution.beforeAfter.afterClasses
                              .totalWorks,
                        },
                        {
                          metric: 'Favoritas',
                          [t('before_classes')]:
                            reportData.evolution.beforeAfter.beforeClasses
                              .favoriteWorks,
                          [t('after_classes')]:
                            reportData.evolution.beforeAfter.afterClasses
                              .favoriteWorks,
                        },
                        {
                          metric: 'Anotações',
                          [t('before_classes')]:
                            reportData.evolution.beforeAfter.beforeClasses
                              .annotations,
                          [t('after_classes')]:
                            reportData.evolution.beforeAfter.afterClasses
                              .annotations,
                        },
                        {
                          metric: 'Prática (min)',
                          [t('before_classes')]:
                            reportData.evolution.beforeAfter.beforeClasses
                              .practiceTime,
                          [t('after_classes')]:
                            reportData.evolution.beforeAfter.afterClasses
                              .practiceTime,
                        },
                      ]}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#374151"
                        opacity={0.3}
                      />
                      <XAxis dataKey="metric" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar
                        dataKey={t('before_classes')}
                        fill={CHART_COLORS.secondary}
                      />
                      <Bar
                        dataKey={t('after_classes')}
                        fill={CHART_COLORS.primary}
                      />
                    </BarChart>
                  </ResponsiveContainer>
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
                <FiHeart className="w-6 h-6 mr-3 text-brand-primary" />
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
                          <div className="flex items-center space-x-3">
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
                              <div className="text-xs text-theme-tertiary">
                                {composer.epoch}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-theme-primary">
                              {composer.studiedCount}/{composer.worksCount}
                            </div>
                            <div className="text-xs text-theme-tertiary">
                              {composer.percentage}% estudado
                            </div>
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
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        data={[
                          {
                            skill: 'Técnica',
                            value:
                              reportData.insights.skillsAssessment.technique,
                            fullMark: 5,
                          },
                          {
                            skill: 'Interpretação',
                            value:
                              reportData.insights.skillsAssessment
                                .interpretation,
                            fullMark: 5,
                          },
                          {
                            skill: 'Ritmo',
                            value: reportData.insights.skillsAssessment.rhythm,
                            fullMark: 5,
                          },
                          {
                            skill: 'Afinação',
                            value: reportData.insights.skillsAssessment.pitch,
                            fullMark: 5,
                          },
                          {
                            skill: 'Expressão',
                            value:
                              reportData.insights.skillsAssessment.expression,
                            fullMark: 5,
                          },
                          {
                            skill: 'Leitura',
                            value:
                              reportData.insights.skillsAssessment.sightReading,
                            fullMark: 5,
                          },
                        ]}
                      >
                        <PolarGrid />
                        <PolarAngleAxis dataKey="skill" />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} />
                        <Radar
                          name="Nível Atual"
                          dataKey="value"
                          stroke={CHART_COLORS.primary}
                          fill={CHART_COLORS.primary}
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
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
              <FiTarget className="w-6 h-6 mr-3 text-brand-primary" />
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
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                      <span className="text-sm text-theme-primary">
                        {focus}
                      </span>
                    </div>
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
                      <span className="text-sm text-theme-primary">{step}</span>
                    </div>
                  ))}
                </div>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedItem>

        {/* Report Metadata */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="classical-card p-4 bg-theme-elevated/50 border border-theme-secondary/50">
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-theme-tertiary">
              <div className="flex items-center space-x-4 mb-2 sm:mb-0">
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
              </div>
              <div className="text-xs">{t('analysis_disclaimer')}</div>
            </div>
          </div>
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
