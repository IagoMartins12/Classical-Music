// app/requests/portal/progress-report.ts — relatório de progresso do professor pela API (Etapa 4)
//
// A API gera o relatório a partir dos dados (`GET /reports/progress/:studentId`)
// e só afirma o que tem amostra: taxa sem denominador vem `null`. O formato do
// legado (`types/teacherProgressReport.ts`) tinha muitas seções calculadas com
// números sorteados ou fixos — estilo de aprendizado, avaliação por habilidade,
// percentis, medalhas. Aqui essas seções vêm vazias ou zeradas; o que a API
// mede entra no campo equivalente. Isomórfico: servidor passa o token.
import { apiFetch } from '@/app/libs/api/client';
import type {
  PeriodOption,
  ProgressOverview,
  TeacherProgressReportResponse,
} from '@/app/types/teacherProgressReport';
import { portalGet, relationshipDuration, toDate } from './common';
import { loadRelationships, type ApiRelationship } from './teacher';

interface ApiOverview {
  totalLessons: number;
  completedLessons: number;
  cancelledLessons: number;
  noShowLessons: number;
  scheduledLessons: number;
  lessonMinutes: number;
  attendanceRate: number | null;
  totalAssignments: number;
  completedAssignments: number;
  assignmentCompletionRate: number | null;
  avgEngagement: number | null;
  avgPreparation: number | null;
  avgTeacherRating: number | null;
  worksLearned: number;
}

export interface ApiProgressReport {
  student: {
    id: string;
    userId: string;
    name: string;
    image: string | null;
    level: string;
  };
  teacher: { id: string; userId: string; name: string };
  period: { start: string; end: string; label: string };
  relationship: { startDate: string; isActive: boolean };
  coverage: {
    lessons: number;
    assignments: number;
    truncated: { lessons: boolean; assignments: boolean };
  };
  sections: string[];
  report: {
    overview: ApiOverview;
    attendance?: {
      months: Array<{
        month: string;
        attended: number;
        missed: number;
        attendanceRate: number | null;
        punctualityRate: number | null;
      }>;
      trend: number | null;
    };
    evolution?: Array<{
      month: string;
      lessons: number;
      minutes: number;
      completedAssignments: number;
      avgEngagement: number | null;
    }>;
    assignments?: {
      overdue: number;
      punctualityRate: number | null;
      byType: Array<{
        type: string;
        total: number;
        completed: number;
        completionRate: number | null;
        onTimeRate: number | null;
        difficultyRating: number | null;
        timeRatio: number | null;
      }>;
    };
    repertoire?: {
      worksLearned: number;
      worksInProgress: number;
      avgMastery: number | null;
      satisfactionRate: number | null;
      difficultyMix: Array<{
        level: string;
        count: number;
        share: number | null;
      }>;
      topComposers: Array<{ composer: string; count: number }>;
    };
    engagement?: {
      avgEngagement: number | null;
      byWeekday: Array<{
        weekday: number;
        lessons: number;
        avgEngagement: number | null;
      }>;
    };
    insights?: {
      strengths: Array<{ item: string; count: number }>;
      challenges: Array<{ item: string; count: number }>;
      skillsWorked: Array<{ item: string; count: number }>;
      signals: Array<{ kind: string; detail: string; value: number }>;
    };
    comparison?: {
      previous: ApiOverview;
      change: {
        completedLessons: number;
        completedAssignments: number;
        attendanceRate: number | null;
        assignmentCompletionRate: number | null;
        avgEngagement: number | null;
      };
    };
    recommendations?: {
      pieces: Array<{
        workId: string;
        title: string;
        composer: string;
        studentAppeal: number;
      }>;
    };
  };
  generatedAt: string;
}

const PERIOD_LABELS: Record<string, string> = {
  '1month': 'Último mês',
  '3months': 'Últimos 3 meses',
  '6months': 'Últimos 6 meses',
  '1year': 'Último ano',
  all: 'Todo o período',
};

const WEEKDAYS = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

const DIFFICULTY_WEIGHT: Record<string, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
};

const round1 = (value: number) => Math.round(value * 10) / 10;

/** "2026-03" → "mar", para os gráficos mês a mês do legado. */
function monthLabel(key: string): { month: string; year: number } {
  const [year, month] = key.split('-').map(Number);
  return {
    month: new Date(year, month - 1, 1).toLocaleDateString('pt-BR', {
      month: 'short',
    }),
    year,
  };
}

function legacyOverview(
  overview: ApiOverview,
  relationship: ApiRelationship | undefined
): ProgressOverview {
  return {
    totalLessons: overview.totalLessons,
    completedLessons: overview.completedLessons,
    totalStudyHours: round1(overview.lessonMinutes / 60),
    attendanceRate: overview.attendanceRate ?? 0,
    completionRate:
      overview.totalLessons > 0
        ? round1((overview.completedLessons / overview.totalLessons) * 100)
        : 0,
    piecesStudied: overview.worksLearned,
    favoritePieces: 0,
    avgLessonRating: overview.avgEngagement ?? 0,
    currentStreak: relationship?.student.currentStreak ?? 0,
    longestStreak: 0,
    totalAssignments: overview.totalAssignments,
    completedAssignments: overview.completedAssignments,
    avgCompletionTime: 0,
  };
}

function dataQuality(
  report: ApiProgressReport
): TeacherProgressReportResponse['reportMetadata']['dataQuality'] {
  const lessons = report.coverage.lessons;
  if (lessons >= 20) return 'excellent';
  if (lessons >= 10) return 'good';
  if (lessons >= 4) return 'fair';
  return 'limited';
}

export function toLegacyReport(
  report: ApiProgressReport,
  relationship: ApiRelationship | undefined,
  teacherProfile: { specialties?: string[]; experience?: string | null } | null
): TeacherProgressReportResponse {
  const { overview } = report.report;
  const attendanceMonths = report.report.attendance?.months ?? [];
  const evolution = report.report.evolution ?? [];
  const byType = report.report.assignments?.byType ?? [];
  const repertoire = report.report.repertoire;
  const insights = report.report.insights;
  const comparison = report.report.comparison;
  const pieces = report.report.recommendations?.pieces ?? [];
  const currentOverview = legacyOverview(overview, relationship);

  const attendanceByMonth = new Map(
    attendanceMonths.map((month) => [month.month, month])
  );

  const difficultyMix = repertoire?.difficultyMix ?? [];
  const weighted = difficultyMix.filter((mix) => DIFFICULTY_WEIGHT[mix.level]);
  const weightedCount = weighted.reduce((sum, mix) => sum + mix.count, 0);
  const countOf = (level: string) =>
    difficultyMix.find((mix) => mix.level === level)?.count ?? 0;

  const periodLabel =
    PERIOD_LABELS[report.period.label] ??
    `${toDate(report.period.start).toLocaleDateString('pt-BR')} - ${toDate(
      report.period.end
    ).toLocaleDateString('pt-BR')}`;

  return {
    studentInfo: {
      id: report.student.userId,
      name: report.student.name,
      image: report.student.image ?? undefined,
      level: report.student.level,
      startDate: toDate(report.relationship.startDate),
      relationshipDuration: relationshipDuration(report.relationship.startDate),
    },
    teacherInfo: {
      id: report.teacher.userId,
      name: report.teacher.name,
      specialties: teacherProfile?.specialties ?? [],
      experience: teacherProfile?.experience ?? undefined,
    },
    reportMetadata: {
      generatedAt: toDate(report.generatedAt),
      periodStart: toDate(report.period.start),
      periodEnd: toDate(report.period.end),
      periodLabel,
      dataQuality: dataQuality(report),
      analysisDepth:
        report.coverage.truncated.lessons ||
        report.coverage.truncated.assignments
          ? 'partial'
          : 'complete',
    },
    overview: currentOverview,
    evolution: {
      monthly: evolution.map((month) => ({
        ...monthLabel(month.month),
        lessonsCompleted: month.lessons,
        studyHours: round1(month.minutes / 60),
        piecesLearned: 0,
        assignmentsCompleted: month.completedAssignments,
        attendanceRate: attendanceByMonth.get(month.month)?.attendanceRate ?? 0,
        engagementScore: month.avgEngagement ?? 0,
        avgRating: month.avgEngagement ?? 0,
      })),
      weekly: [],
      beforeAfter: {
        beforeClasses: {
          totalWorks: 0,
          favoriteWorks: 0,
          annotations: 0,
          averageRating: 0,
          practiceTime: 0,
        },
        afterClasses: {
          totalWorks: 0,
          favoriteWorks: 0,
          annotations: 0,
          averageRating: 0,
          practiceTime: 0,
          improvement: {
            works: 0,
            favorites: 0,
            annotations: 0,
            rating: 0,
            practice: 0,
          },
        },
      },
    },
    preferences: {
      favoriteComposers: (repertoire?.topComposers ?? []).map((composer) => ({
        name: composer.composer,
        epoch: '',
        worksCount: composer.count,
        studiedCount: composer.count,
        favoriteCount: 0,
        percentage:
          repertoire && repertoire.worksLearned > 0
            ? round1((composer.count / repertoire.worksLearned) * 100)
            : 0,
      })),
      favoritePeriods: [],
      studiedVsFavorites: [],
      difficultyProgression:
        weightedCount > 0
          ? [
              {
                period: periodLabel,
                beginner: countOf('BEGINNER'),
                intermediate: countOf('INTERMEDIATE'),
                advanced: countOf('ADVANCED'),
                expert: countOf('EXPERT'),
                averageDifficulty: round1(
                  weighted.reduce(
                    (sum, mix) =>
                      sum + DIFFICULTY_WEIGHT[mix.level] * mix.count,
                    0
                  ) / weightedCount
                ),
              },
            ]
          : [],
    },
    engagement: {
      bestStudyTimes: [],
      productiveDays: (report.report.engagement?.byWeekday ?? [])
        .filter((day) => day.lessons > 0)
        .map((day) => ({
          dayOfWeek: WEEKDAYS[day.weekday],
          attendanceRate: 0,
          completionRate: 0,
          avgEngagement: day.avgEngagement ?? 0,
          lessonsCount: day.lessons,
        })),
      attendancePatterns: attendanceMonths.map((month) => {
        const resolved = month.attended + month.missed;
        return {
          month: monthLabel(month.month).month,
          attendanceRate: month.attendanceRate ?? 0,
          punctualityRate: month.punctualityRate ?? 0,
          cancellationRate: 0,
          noShowRate:
            resolved > 0 ? round1((month.missed / resolved) * 100) : 0,
        };
      }),
      homeworkCompliance: {
        overallRate: overview.assignmentCompletionRate ?? 0,
        byDifficulty: [],
        byType: byType.map((type) => ({
          type: type.type,
          completionRate: type.completionRate ?? 0,
          avgScore: 0,
          preferenceScore: 0,
        })),
      },
    },
    insights: {
      learningStyle: {
        primary: '',
        characteristics: [],
        strengths: [],
        preferences: [],
      },
      skillsAssessment: {
        technique: 0,
        interpretation: 0,
        rhythm: 0,
        pitch: 0,
        expression: 0,
        sightReading: 0,
      },
      strongAreas: (insights?.strengths ?? []).map((entry) => entry.item),
      improvementAreas: (insights?.challenges ?? []).map((entry) => entry.item),
      recommendedFocus: (insights?.skillsWorked ?? []).map(
        (entry) => entry.item
      ),
      nextSteps: (insights?.signals ?? []).map((signal) => signal.detail),
      teachingNotes: [],
    },
    assignments: {
      byType: byType.map((type) => ({
        type: type.type,
        total: type.total,
        completed: type.completed,
        avgCompletionTime: 0,
        avgScore: 0,
        difficultyRating: type.difficultyRating ?? 0,
      })),
      completionTrends: evolution.map((month) => ({
        month: monthLabel(month.month).month,
        submitted: 0,
        completed: month.completedAssignments,
        overdue: 0,
        avgQuality: 0,
      })),
      difficultyVsPerformance: [],
      timePatterns: [],
    },
    repertoire: {
      composersStudied: (repertoire?.topComposers ?? []).map((composer) => ({
        name: composer.composer,
        period: '',
        worksCount: composer.count,
        completionRate: 100,
        avgDifficulty: 0,
        studyTime: 0,
      })),
      periodsDistribution: [],
      genrePreferences: [],
      complexityEvolution: [],
    },
    attendance: {
      absenceReasons: [],
      makeupLessons: {
        requested: 0,
        scheduled: 0,
        completed: 0,
        efficiency: 0,
      },
      improvementTrend: attendanceMonths.map((month, index) => {
        const previous = attendanceMonths[index - 1]?.attendanceRate ?? null;
        return {
          month: monthLabel(month.month).month,
          attendanceRate: month.attendanceRate ?? 0,
          punctualityRate: month.punctualityRate ?? 0,
          improvement:
            previous !== null && month.attendanceRate !== null
              ? round1(month.attendanceRate - previous)
              : 0,
        };
      }),
      timeAnalysis: {
        bestAttendanceTimes: [],
        worstAttendanceTimes: [],
        seasonalPatterns: [],
      },
    },
    comparisons: {
      periodComparison: {
        current: currentOverview,
        previous: comparison
          ? legacyOverview(comparison.previous, undefined)
          : legacyOverview(
              {
                ...overview,
                totalLessons: 0,
                completedLessons: 0,
                lessonMinutes: 0,
                attendanceRate: null,
                totalAssignments: 0,
                completedAssignments: 0,
                assignmentCompletionRate: null,
                avgEngagement: null,
                worksLearned: 0,
              },
              undefined
            ),
        improvement: {
          lessons: comparison?.change.completedLessons ?? 0,
          attendance: comparison?.change.attendanceRate ?? 0,
          completion: comparison?.change.assignmentCompletionRate ?? 0,
          engagement: comparison?.change.avgEngagement ?? 0,
        },
      },
      levelPeers: {
        studentLevel: report.student.level,
        comparison: {
          lessons: {
            student: overview.completedLessons,
            average: 0,
            percentile: 0,
          },
          attendance: {
            student: overview.attendanceRate ?? 0,
            average: 0,
            percentile: 0,
          },
          assignments: {
            student: overview.assignmentCompletionRate ?? 0,
            average: 0,
            percentile: 0,
          },
          engagement: {
            student: overview.avgEngagement ?? 0,
            average: 0,
            percentile: 0,
          },
        },
      },
      progressVelocity: {
        current: 0,
        trend: 'stable',
        projectedMilestones: [],
      },
    },
    achievements: {
      learningMilestones: [],
      consistencyAwards: [],
      skillBadges: [],
      progressCertificates: [],
    },
    recommendations: {
      studyPlanAdjustments: [],
      difficultyRecommendations: {
        currentLevel: report.student.level,
        nextLevel: '',
        readinessScore: 0,
        recommendedPieces: pieces.map((piece) => ({
          title: piece.title,
          composer: piece.composer,
          difficulty: '',
          reasoning: '',
        })),
      },
      repertoireSuggestions: pieces.map((piece) => ({
        composer: piece.composer,
        work: piece.title,
        difficulty: '',
        estimatedTime: '',
        pedagogicalValue: '',
        studentAppeal: piece.studentAppeal,
      })),
      techniqueFocus: [],
      practiceSchedule: {
        recommendedFrequency: 0,
        sessionDuration: 0,
        focusAreas: [],
        breakdownSuggestion: [],
      },
    },
  };
}

function periodQuery(
  period: PeriodOption,
  custom?: { start: Date; end: Date }
): Record<string, string> {
  if (period === 'custom') {
    return custom
      ? { from: custom.start.toISOString(), to: custom.end.toISOString() }
      : { period: '6months' };
  }

  return { period };
}

/**
 * Relatório de um aluno do professor (id de **usuário** do aluno, como na
 * rota). `null` quando o aluno não está entre os vínculos do professor.
 */
export async function loadTeacherProgressReport(
  studentUserId: string,
  period: PeriodOption = '6months',
  custom?: { start: Date; end: Date },
  token?: string
): Promise<TeacherProgressReportResponse | null> {
  const relationships = await loadRelationships(token);
  const relationship = relationships.find(
    (row) =>
      row.student.userId === studentUserId || row.student.id === studentUserId
  );

  if (!relationship) {
    return null;
  }

  const [report, profile] = await Promise.all([
    portalGet<ApiProgressReport>(
      `/reports/progress/${relationship.student.id}`,
      periodQuery(period, custom),
      token
    ),
    portalGet<{
      teacher: {
        profile: { specialties?: string[]; experience?: string | null };
      } | null;
    }>('/profile', { include: 'teacher' }, token),
  ]);

  return toLegacyReport(report, relationship, profile.teacher?.profile ?? null);
}

// ====================================
// SEÇÕES (tela do legado ↔ API)
// ====================================

export type LegacySectionKey =
  | 'overview'
  | 'evolution'
  | 'preferences'
  | 'engagement'
  | 'insights'
  | 'assignments'
  | 'repertoire'
  | 'attendance'
  | 'comparisons'
  | 'achievements'
  | 'recommendations';

export type LegacySections = Record<LegacySectionKey, boolean>;

/**
 * A tela escolhia seções que a API não tem: "preferências" sai do repertório,
 * e "conquistas" (medalhas sorteadas no legado) não existe mais.
 */
const API_SECTION_OF: Record<LegacySectionKey, string | null> = {
  overview: 'overview',
  evolution: 'evolution',
  preferences: 'repertoire',
  engagement: 'engagement',
  insights: 'insights',
  assignments: 'assignments',
  repertoire: 'repertoire',
  attendance: 'attendance',
  comparisons: 'comparison',
  achievements: null,
  recommendations: 'recommendations',
};

export function apiSectionsFrom(selected: Partial<LegacySections>): string[] {
  const sections = new Set<string>(['overview']);

  for (const [key, enabled] of Object.entries(selected)) {
    const section = API_SECTION_OF[key as LegacySectionKey];
    if (enabled && section) sections.add(section);
  }

  return [...sections];
}

export function legacySectionsFrom(sections: string[]): LegacySections {
  const has = new Set(sections);

  return Object.fromEntries(
    (Object.keys(API_SECTION_OF) as LegacySectionKey[]).map((key) => {
      const section = API_SECTION_OF[key];
      return [key, section !== null && has.has(section)];
    })
  ) as LegacySections;
}

/** Seção de um comentário: a API usa os nomes dela. */
export function apiSectionOf(key?: string | null): string | undefined {
  if (!key) return undefined;
  return API_SECTION_OF[key as LegacySectionKey] ?? undefined;
}

export interface ShareDetails {
  title?: string;
  description?: string;
  teacherMessage?: string;
  selectedSections?: Partial<LegacySections>;
  allowComments?: boolean;
  expiresInDays?: number;
}

/**
 * Compartilha com o aluno. A API gera o conteúdo do relatório a partir dos
 * dados do período — o cliente diz aluno, janela, seções e textos; os números
 * que o aluno lê não saem do navegador.
 */
export async function shareProgressReport(
  studentUserId: string,
  period: {
    type: PeriodOption;
    startDate?: Date;
    endDate?: Date;
    label: string;
  },
  details: ShareDetails = {}
): Promise<void> {
  const relationships = await loadRelationships();
  const relationship = relationships.find(
    (row) =>
      row.student.userId === studentUserId || row.student.id === studentUserId
  );

  if (!relationship) {
    throw new Error('Aluno não está entre os seus vínculos');
  }

  await apiFetch('/reports/shared', {
    method: 'POST',
    body: {
      studentId: relationship.student.id,
      title:
        details.title?.trim() || `Relatório de progresso — ${period.label}`,
      ...(details.description?.trim()
        ? { description: details.description.trim() }
        : {}),
      ...(details.teacherMessage?.trim()
        ? { teacherMessage: details.teacherMessage.trim() }
        : {}),
      ...(details.selectedSections
        ? { sections: apiSectionsFrom(details.selectedSections) }
        : {}),
      ...(details.allowComments !== undefined
        ? { allowComments: details.allowComments }
        : {}),
      ...(details.expiresInDays
        ? { expiresInDays: details.expiresInDays }
        : {}),
      ...periodQuery(
        period.type,
        period.startDate && period.endDate
          ? { start: period.startDate, end: period.endDate }
          : undefined
      ),
    },
  });
}
