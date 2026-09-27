// app/(student)/student/progress/[reportId]/pageClient.tsx - Client Component para Relatório Compartilhado do Aluno

'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import Image from '@/app/components/SmartImage';
import {
  PiArrowLeft,
  PiArrowsClockwise,
  PiBookOpen,
  PiCalendarBlank,
  PiChartBar,
  PiChatCenteredText,
  PiClock,
  PiEye,
  PiMedal,
  PiMusicNotes,
  PiPaperPlaneRight,
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
} from '../../../../components/animation/AnimatedComponents';
import {
  addSharedReportComment,
  loadSharedReport,
} from '@/app/requests/portal/shared-reports';
import dynamic from 'next/dynamic';
import { Stack, Inline } from '@/app/components/ui/Layout';
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

  // Refresh report data
  const refreshReport = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setReportData(await loadSharedReport(reportId));
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
      const comment = await addSharedReportComment(
        reportId,
        newComment.trim(),
        selectedSection || null,
        reportData?.student
      );

      // Update comments in local state
      setReportData((prev) =>
        prev
          ? {
              ...prev,
              comments: [comment, ...prev.comments],
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
          <Card densidade="larga" className="text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <PiWarningCircle className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              Erro ao carregar relatório
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {error || errorMessage}
            </p>
            <div className="space-y-3">
              <Inline
                as="button"
                gap={2}
                onClick={refreshReport}
                disabled={loading}
                className="btn-classical-primary w-full justify-center"
              >
                <PiArrowsClockwise
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                />
                <span>{loading ? 'Carregando...' : 'Tentar Novamente'}</span>
              </Inline>
              <Link
                href="/student/progress"
                className="btn-classical-secondary w-full"
              >
                Voltar ao Progresso
              </Link>
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
            <p className="text-theme-secondary">Carregando relatório...</p>
          </Card>
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
            <Inline gap={4} className="mb-4 lg:mb-0">
              <Link
                href="/student/progress"
                className="w-12 h-12 rounded-xl bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group"
              >
                <PiArrowLeft className="w-5 h-5 text-theme-tertiary group-hover:text-brand-primary transition-colors" />
              </Link>

              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gradient-brand classical-title">
                  {reportData.title}
                </h1>
                <p className="text-lg text-theme-secondary">
                  Relatório criado por {reportData.teacher.name}
                </p>
                <Text papel="rotulo" tom="fraco" as="p">
                  {reportData.metadata.periodLabel}
                </Text>
              </div>
            </Inline>

            <Button
              variante="secundario"
              type="submit"
              onClick={refreshReport}
              disabled={loading}
              title="Atualizar dados"
            >
              <PiArrowsClockwise
                className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </AnimatedItem>

        {/* Teacher Info & Description */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Teacher Card */}
            <AnimatedCard hover="lift" className="classical-card p-6">
              <Inline gap={4} className="mb-4">
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
                    <PiUser className="w-6 h-6 text-theme-primary" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-theme-primary">
                    {reportData.teacher.name}
                  </h3>
                  <Text papel="rotulo" tom="fraco" as="p">
                    Seu Professor
                  </Text>
                </div>
              </Inline>

              {reportData.teacher.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {reportData.teacher.specialties.map((specialty, index) => (
                    <Text
                      papel="legenda"
                      tom="ouro"
                      key={index}
                      className="px-2 py-1 bg-brand-primary/10 rounded-full"
                    >
                      {specialty}
                    </Text>
                  ))}
                </div>
              )}
            </AnimatedCard>

            {/* Report Info */}
            <AnimatedCard hover="lift" className="classical-card p-6">
              <h3 className="text-lg font-bold text-theme-primary mb-4">
                Informações do Relatório
              </h3>
              <Stack gap={3}>
                <div className="flex items-center justify-between">
                  <span className="text-theme-secondary flex items-center">
                    <PiCalendarBlank className="w-4 h-4 mr-2" />
                    Criado em
                  </span>
                  <span className="text-theme-primary font-medium">
                    {/* {reportData.metadata.createdAt.toLocaleDateString('pt-BR')} */}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-theme-secondary flex items-center">
                    <PiEye className="w-4 h-4 mr-2" />
                    Visualizações
                  </span>
                  <span className="text-theme-primary font-medium">
                    {reportData.metadata.viewCount}
                  </span>
                </div>
                {reportData.metadata.expiresAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-theme-secondary flex items-center">
                      <PiClock className="w-4 h-4 mr-2" />
                      Expira em
                    </span>
                    <span className="text-theme-primary font-medium">
                      {/* {reportData.metadata.expiresAt.toLocaleDateString(
                        'pt-BR'
                      )} */}
                    </span>
                  </div>
                )}
              </Stack>
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
                <PiChatCenteredText className="w-5 h-5 mr-2" />
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
                <PiChartBar className="w-6 h-6 mr-3 text-brand-primary" />
                Visão Geral
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
                    {progressData.overview.completedLessons}
                  </div>
                  <Text papel="rotulo" tom="fraco" as="div" className="mb-2">
                    Aulas Concluídas
                  </Text>
                  <div className="text-xs text-accent-blue">
                    {progressData.overview.completionRate}% de conclusão
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
                    {progressData.overview.totalStudyHours}h
                  </div>
                  <Text papel="rotulo" tom="fraco" as="div" className="mb-2">
                    Horas de Estudo
                  </Text>
                  <div className="text-xs text-accent-green">
                    {progressData.overview.attendanceRate}% presença
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
                    {progressData.overview.piecesStudied}
                  </div>
                  <Text papel="rotulo" tom="fraco" as="div" className="mb-2">
                    Peças Estudadas
                  </Text>
                  <div className="text-xs text-accent-purple">
                    {progressData.overview.favoritePieces} favoritadas
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
                    {progressData.overview.currentStreak}
                  </div>
                  <Text papel="rotulo" tom="fraco" as="div" className="mb-2">
                    Sequência Atual
                  </Text>
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
            <Stack gap={6} className="mb-8">
              <h2 className="text-2xl font-bold text-theme-primary classical-title flex items-center">
                <PiTrendUp className="w-6 h-6 mr-3 text-brand-primary" />
                Evolução do Progresso
              </h2>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Monthly Evolution */}
                <AnimatedCard hover="lift" className="classical-card p-6">
                  <h3 className="text-lg font-bold text-theme-primary mb-4">
                    Progresso Mensal
                  </h3>
                  <div className="h-80">
                    <MonthlyEvolutionChart progressData={progressData} />
                  </div>
                </AnimatedCard>

                {/* Before/After Comparison */}
                <AnimatedCard hover="lift" className="classical-card p-6">
                  <h3 className="text-lg font-bold text-theme-primary mb-4">
                    Antes/Depois das Aulas
                  </h3>
                  <div className="h-80">
                    <BeforeAfterChart progressData={progressData} />
                  </div>
                </AnimatedCard>
              </div>
            </Stack>
          </AnimatedItem>
        )}

        {/* Skills Assessment */}
        {selectedSections.insights && (
          <AnimatedItem direction="up" springType="gentle">
            <Stack gap={6} className="mb-8">
              <h2 className="text-2xl font-bold text-theme-primary classical-title flex items-center">
                <PiTarget className="w-6 h-6 mr-3 text-brand-primary" />
                Avaliação de Habilidades
              </h2>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Skills Radar */}
                <AnimatedCard hover="lift" className="classical-card p-6">
                  <h3 className="text-lg font-bold text-theme-primary mb-4">
                    Habilidades Musicais
                  </h3>
                  <div className="h-80">
                    <SkillsRadarChart progressData={progressData} />
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
            </Stack>
          </AnimatedItem>
        )}

        {/* Comments Section */}
        {reportData.allowComments && (
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard hover="lift" className="classical-card p-6 mb-8">
              <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center">
                <PiChatCenteredText className="w-6 h-6 mr-3 text-brand-primary" />
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

                  <Inline
                    as="button"
                    gap={2}
                    onClick={addComment}
                    disabled={!newComment.trim() || addingComment}
                    className="btn-classical-primary"
                  >
                    {addingComment ? (
                      <PiArrowsClockwise className="w-4 h-4 animate-spin" />
                    ) : (
                      <PiPaperPlaneRight className="w-4 h-4" />
                    )}
                    <span>{addingComment ? 'Enviando...' : 'Enviar'}</span>
                  </Inline>
                </div>
              </div>

              {/* Comments List */}
              <Stack>
                {reportData.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 bg-theme-elevated rounded-lg border border-theme-secondary"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <PiUser className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-medium text-theme-primary">
                              {comment.student.name}
                            </span>
                            {comment.section && (
                              <Text
                                papel="legenda"
                                tom="ouro"
                                className="ml-2 px-2 py-0.5 bg-brand-primary/10 rounded"
                              >
                                {comment.section}
                              </Text>
                            )}
                          </div>
                          <Text papel="legenda" tom="fraco">
                            {comment.createdAt.toLocaleDateString('pt-BR')}
                          </Text>
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
              </Stack>
            </AnimatedCard>
          </AnimatedItem>
        )}
      </AnimatedContainer>
    </PageContainer>
  );
}
