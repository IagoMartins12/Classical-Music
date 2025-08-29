// app/(student)/student/progress/[reportId]/pageClient.tsx - Client Component para Relatório Compartilhado do Aluno

'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FiArrowLeft,
  FiRefreshCw,
  FiTrendingUp,
  FiTarget,
  FiBookOpen,
  FiClock,
  FiAward,
  FiBarChart2,
  FiMusic,
  FiUser,
  FiAlertCircle,
  FiMessageSquare,
  FiSend,
  FiEye,
  FiCalendar,
  FiClock as FiTime,
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
} from '../../../../components/animation/AnimatedComponents';

// Chart colors constant
const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  purple: '#8B5CF6',
  pink: '#EC4899',
  orange: '#F97316',
  gradient: [
    '#3B82F6',
    '#8B5CF6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#06B6D4',
    '#EC4899',
    '#F97316',
  ],
} as const;

interface SharedReportData {
  id: string;
  title: string;
  description?: string;
  teacherMessage?: string;
  selectedSections: {
    overview: boolean;
    evolution: boolean;
    preferences: boolean;
    engagement: boolean;
    insights: boolean;
    assignments: boolean;
    repertoire: boolean;
    attendance: boolean;
    comparisons: boolean;
    achievements: boolean;
    recommendations: boolean;
  };
  allowComments: boolean;
  reportData: any;
  metadata: {
    periodStart: Date;
    periodEnd: Date;
    periodLabel: string;
    createdAt: Date;
    expiresAt?: Date;
    viewCount: number;
    lastViewedAt: Date;
  };
  teacher: {
    id: string;
    name: string;
    image?: string;
    specialties: string[];
  };
  student: {
    id: string;
    name: string;
    image?: string;
    level: string;
  };
  comments: Array<{
    id: string;
    content: string;
    section?: string;
    createdAt: Date;
    isRead: boolean;
    student: {
      name: string;
      image?: string;
    };
  }>;
}

interface StudentSharedReportPageClientProps {
  reportId: string;
  userId: string;
  initialData: SharedReportData | null;
  errorMessage?: string;
}

export default function StudentSharedReportPageClient({
  reportId,
  initialData,
  errorMessage,
}: StudentSharedReportPageClientProps) {
  const [reportData, setReportData] = useState<SharedReportData | null>(
    initialData
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorMessage || null);
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>('');

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

  // Refresh report data
  const refreshReport = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/student/progress/${reportId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao carregar relatório');
      }

      setReportData(data.report);
    } catch (err) {
      console.error('Error refreshing report:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  // Add comment
  const addComment = useCallback(async () => {
    if (!newComment.trim()) return;

    setAddingComment(true);
    try {
      const response = await fetch(`/api/student/progress/${reportId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment.trim(),
          section: selectedSection || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao adicionar comentário');
      }

      // Update comments in local state
      setReportData((prev) =>
        prev
          ? {
              ...prev,
              comments: [data.comment, ...prev.comments],
            }
          : null
      );

      setNewComment('');
      setSelectedSection('');
    } catch (err) {
      console.error('Error adding comment:', err);
      alert(
        err instanceof Error ? err.message : 'Erro ao adicionar comentário'
      );
    } finally {
      setAddingComment(false);
    }
  }, [reportId, newComment, selectedSection]);

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
              Erro ao carregar relatório
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {error || errorMessage}
            </p>
            <div className="space-y-3">
              <button
                onClick={refreshReport}
                disabled={loading}
                className="btn-classical-primary flex items-center space-x-2 w-full justify-center"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                />
                <span>{loading ? 'Carregando...' : 'Tentar Novamente'}</span>
              </button>
              <Link
                href="/student/progress"
                className="btn-classical-secondary w-full"
              >
                Voltar ao Progresso
              </Link>
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
            <p className="text-theme-secondary">Carregando relatório...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const { selectedSections, reportData: progressData } = reportData;

  return (
    <PageContainer showBackground={true} className="min-h-screen">
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 pt-4">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <Link
                href="/student/progress"
                className="w-12 h-12 rounded-xl bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group"
              >
                <FiArrowLeft className="w-5 h-5 text-theme-tertiary group-hover:text-brand-primary transition-colors" />
              </Link>

              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gradient-brand classical-title">
                  {reportData.title}
                </h1>
                <p className="text-lg text-theme-secondary">
                  Relatório criado por {reportData.teacher.name}
                </p>
                <p className="text-sm text-theme-tertiary">
                  {reportData.metadata.periodLabel}
                </p>
              </div>
            </div>

            <button
              onClick={refreshReport}
              disabled={loading}
              className="btn-classical-secondary p-3"
              title="Atualizar dados"
            >
              <FiRefreshCw
                className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </AnimatedItem>

        {/* Teacher Info & Description */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Teacher Card */}
            <AnimatedCard hover="lift" className="classical-card p-6">
              <div className="flex items-center space-x-4 mb-4">
                {reportData.teacher.image ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-primary/20">
                    <Image
                      src={reportData.teacher.image}
                      alt={reportData.teacher.name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center">
                    <FiUser className="w-6 h-6 text-theme-primary" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-theme-primary">
                    {reportData.teacher.name}
                  </h3>
                  <p className="text-sm text-theme-tertiary">Seu Professor</p>
                </div>
              </div>

              {reportData.teacher.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {reportData.teacher.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-brand-primary/10 text-brand-primary rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              )}
            </AnimatedCard>

            {/* Report Info */}
            <AnimatedCard hover="lift" className="classical-card p-6">
              <h3 className="text-lg font-bold text-theme-primary mb-4">
                Informações do Relatório
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-theme-secondary flex items-center">
                    <FiCalendar className="w-4 h-4 mr-2" />
                    Criado em
                  </span>
                  <span className="text-theme-primary font-medium">
                    {/* {reportData.metadata.createdAt.toLocaleDateString('pt-BR')} */}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-theme-secondary flex items-center">
                    <FiEye className="w-4 h-4 mr-2" />
                    Visualizações
                  </span>
                  <span className="text-theme-primary font-medium">
                    {reportData.metadata.viewCount}
                  </span>
                </div>
                {reportData.metadata.expiresAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-theme-secondary flex items-center">
                      <FiTime className="w-4 h-4 mr-2" />
                      Expira em
                    </span>
                    <span className="text-theme-primary font-medium">
                      {/* {reportData.metadata.expiresAt.toLocaleDateString(
                        'pt-BR'
                      )} */}
                    </span>
                  </div>
                )}
              </div>
            </AnimatedCard>
          </div>
        </AnimatedItem>

        {/* Teacher Message */}
        {reportData.teacherMessage && (
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard
              hover="lift"
              className="classical-card p-6 border-l-4 border-brand-primary mb-8"
            >
              <h3 className="text-lg font-bold text-theme-primary mb-3 flex items-center">
                <FiMessageSquare className="w-5 h-5 mr-2" />
                Mensagem do Professor
              </h3>
              <div className="text-theme-secondary whitespace-pre-wrap">
                {reportData.teacherMessage}
              </div>
            </AnimatedCard>
          </AnimatedItem>
        )}

        {/* Description */}
        {reportData.description && (
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard hover="lift" className="classical-card p-6 mb-8">
              <h3 className="text-lg font-bold text-theme-primary mb-3">
                Sobre este Relatório
              </h3>
              <p className="text-theme-secondary">{reportData.description}</p>
            </AnimatedCard>
          </AnimatedItem>
        )}

        {/* Overview Stats */}
        {selectedSections.overview && (
          <AnimatedItem direction="up" springType="gentle">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-theme-primary classical-title mb-6 flex items-center">
                <FiBarChart2 className="w-6 h-6 mr-3 text-brand-primary" />
                Visão Geral
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
                    {progressData.overview.completedLessons}
                  </div>
                  <div className="text-sm text-theme-tertiary mb-2">
                    Aulas Concluídas
                  </div>
                  <div className="text-xs text-accent-blue">
                    {progressData.overview.completionRate}% de conclusão
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
                    {progressData.overview.totalStudyHours}h
                  </div>
                  <div className="text-sm text-theme-tertiary mb-2">
                    Horas de Estudo
                  </div>
                  <div className="text-xs text-accent-green">
                    {progressData.overview.attendanceRate}% presença
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
                    {progressData.overview.piecesStudied}
                  </div>
                  <div className="text-sm text-theme-tertiary mb-2">
                    Peças Estudadas
                  </div>
                  <div className="text-xs text-accent-purple">
                    {progressData.overview.favoritePieces} favoritadas
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
                    {progressData.overview.currentStreak}
                  </div>
                  <div className="text-sm text-theme-tertiary mb-2">
                    Sequência Atual
                  </div>
                  <div className="text-xs text-accent-orange">
                    Máximo: {progressData.overview.longestStreak}
                  </div>
                </AnimatedCard>
              </SequentialGrid>
            </div>
          </AnimatedItem>
        )}

        {/* Progress Evolution Charts */}
        {selectedSections.evolution && (
          <AnimatedItem direction="up" springType="gentle">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-theme-primary classical-title mb-6 flex items-center">
                <FiTrendingUp className="w-6 h-6 mr-3 text-brand-primary" />
                Evolução do Progresso
              </h2>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Monthly Evolution */}
                <AnimatedCard hover="lift" className="classical-card p-6">
                  <h3 className="text-lg font-bold text-theme-primary mb-4">
                    Progresso Mensal
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={progressData.evolution.monthly}>
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
                          name="Aulas Concluídas"
                        />
                        <Line
                          type="monotone"
                          dataKey="studyHours"
                          stroke={CHART_COLORS.success}
                          strokeWidth={3}
                          name="Horas de Estudo"
                        />
                        <Line
                          type="monotone"
                          dataKey="attendanceRate"
                          stroke={CHART_COLORS.warning}
                          strokeWidth={3}
                          name="Taxa de Presença"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </AnimatedCard>

                {/* Before/After Comparison */}
                <AnimatedCard hover="lift" className="classical-card p-6">
                  <h3 className="text-lg font-bold text-theme-primary mb-4">
                    Antes/Depois das Aulas
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          {
                            metric: 'Obras',
                            'Antes das Aulas':
                              progressData.evolution.beforeAfter.beforeClasses
                                .totalWorks,
                            'Depois das Aulas':
                              progressData.evolution.beforeAfter.afterClasses
                                .totalWorks,
                          },
                          {
                            metric: 'Favoritas',
                            'Antes das Aulas':
                              progressData.evolution.beforeAfter.beforeClasses
                                .favoriteWorks,
                            'Depois das Aulas':
                              progressData.evolution.beforeAfter.afterClasses
                                .favoriteWorks,
                          },
                          {
                            metric: 'Anotações',
                            'Antes das Aulas':
                              progressData.evolution.beforeAfter.beforeClasses
                                .annotations,
                            'Depois das Aulas':
                              progressData.evolution.beforeAfter.afterClasses
                                .annotations,
                          },
                        ]}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#374151"
                          opacity={0.3}
                        />
                        <XAxis
                          dataKey="metric"
                          stroke="#9CA3AF"
                          fontSize={12}
                        />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                          dataKey="Antes das Aulas"
                          fill={CHART_COLORS.secondary}
                        />
                        <Bar
                          dataKey="Depois das Aulas"
                          fill={CHART_COLORS.primary}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </AnimatedCard>
              </div>
            </div>
          </AnimatedItem>
        )}

        {/* Skills Assessment */}
        {selectedSections.insights && (
          <AnimatedItem direction="up" springType="gentle">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-theme-primary classical-title mb-6 flex items-center">
                <FiTarget className="w-6 h-6 mr-3 text-brand-primary" />
                Avaliação de Habilidades
              </h2>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Skills Radar */}
                <AnimatedCard hover="lift" className="classical-card p-6">
                  <h3 className="text-lg font-bold text-theme-primary mb-4">
                    Habilidades Musicais
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        data={[
                          {
                            skill: 'Técnica',
                            value:
                              progressData.insights.skillsAssessment.technique,
                            fullMark: 5,
                          },
                          {
                            skill: 'Interpretação',
                            value:
                              progressData.insights.skillsAssessment
                                .interpretation,
                            fullMark: 5,
                          },
                          {
                            skill: 'Ritmo',
                            value:
                              progressData.insights.skillsAssessment.rhythm,
                            fullMark: 5,
                          },
                          {
                            skill: 'Afinação',
                            value: progressData.insights.skillsAssessment.pitch,
                            fullMark: 5,
                          },
                          {
                            skill: 'Expressão',
                            value:
                              progressData.insights.skillsAssessment.expression,
                            fullMark: 5,
                          },
                          {
                            skill: 'Leitura',
                            value:
                              progressData.insights.skillsAssessment
                                .sightReading,
                            fullMark: 5,
                          },
                        ]}
                      >
                        <PolarGrid />
                        <PolarAngleAxis dataKey="skill" />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} />
                        <Radar
                          name="Seu Nível"
                          dataKey="value"
                          stroke={CHART_COLORS.primary}
                          fill={CHART_COLORS.primary}
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </AnimatedCard>

                {/* Strengths and Areas for Improvement */}
                <div className="space-y-6">
                  <AnimatedCard hover="lift" className="classical-card p-6">
                    <h3 className="text-lg font-bold text-theme-primary mb-4">
                      Suas Áreas Fortes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {progressData.insights.strongAreas.map(
                        (area: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-accent-green/10 text-accent-green rounded-full text-sm font-medium"
                          >
                            {area}
                          </span>
                        )
                      )}
                    </div>
                  </AnimatedCard>

                  <AnimatedCard hover="lift" className="classical-card p-6">
                    <h3 className="text-lg font-bold text-theme-primary mb-4">
                      Áreas para Melhorar
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {progressData.insights.improvementAreas.map(
                        (area: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-accent-yellow/10 text-accent-yellow rounded-full text-sm font-medium"
                          >
                            {area}
                          </span>
                        )
                      )}
                    </div>
                  </AnimatedCard>
                </div>
              </div>
            </div>
          </AnimatedItem>
        )}

        {/* Comments Section */}
        {reportData.allowComments && (
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard hover="lift" className="classical-card p-6 mb-8">
              <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center">
                <FiMessageSquare className="w-6 h-6 mr-3 text-brand-primary" />
                Comentários ({reportData.comments.length})
              </h3>

              {/* Add Comment Form */}
              <div className="space-y-4 mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Deixe um comentário sobre este relatório..."
                  rows={3}
                  className="input-classical w-full"
                />

                <div className="flex items-center justify-between">
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="input-classical w-auto"
                  >
                    <option value="">Comentário geral</option>
                    <option value="overview">Visão Geral</option>
                    <option value="evolution">Evolução</option>
                    <option value="insights">Insights</option>
                    <option value="recommendations">Recomendações</option>
                  </select>

                  <button
                    onClick={addComment}
                    disabled={!newComment.trim() || addingComment}
                    className="btn-classical-primary flex items-center space-x-2"
                  >
                    {addingComment ? (
                      <FiRefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <FiSend className="w-4 h-4" />
                    )}
                    <span>{addingComment ? 'Enviando...' : 'Enviar'}</span>
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {reportData.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 bg-theme-elevated rounded-lg border border-theme-secondary"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <FiUser className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-medium text-theme-primary">
                              {comment.student.name}
                            </span>
                            {comment.section && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-brand-primary/10 text-brand-primary rounded">
                                {comment.section}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-theme-tertiary">
                            {comment.createdAt.toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-theme-secondary">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {reportData.comments.length === 0 && (
                  <div className="text-center py-8 text-theme-tertiary">
                    Ainda não há comentários. Seja o primeiro a comentar!
                  </div>
                )}
              </div>
            </AnimatedCard>
          </AnimatedItem>
        )}
      </AnimatedContainer>
    </PageContainer>
  );
}
