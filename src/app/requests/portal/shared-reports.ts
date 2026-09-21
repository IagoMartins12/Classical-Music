// app/requests/portal/shared-reports.ts — relatório compartilhado com o aluno pela API (Etapa 4)
//
// A API guarda o relatório gerado no servidor no momento do compartilhamento
// (só a parte `report`); o cabeçalho (aluno, professor, período) vem do
// próprio registro. Aqui os dois voltam a formar o relatório no formato que a
// página do aluno já desenha. Isomórfico: servidor passa o token.
import { apiFetch } from '@/app/libs/api/client';
import type { TeacherProgressReportResponse } from '@/app/types/teacherProgressReport';
import { personName, portalGet, toDate, toOptionalDate } from './common';
import {
  apiSectionOf,
  legacySectionsFrom,
  toLegacyReport,
  type ApiProgressReport,
  type LegacySections,
} from './progress-report';

interface ApiSharedPerson {
  id: string;
  userId: string;
  user: {
    firstName: string | null;
    lastName: string | null;
    image: string | null;
  };
}

interface ApiSharedReport {
  id: string;
  title: string;
  description: string | null;
  teacherMessage: string | null;
  periodStart: string;
  periodEnd: string;
  periodLabel: string;
  selectedSections: string[];
  allowComments: boolean;
  isActive: boolean;
  viewCount: number;
  lastViewedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  teacher: ApiSharedPerson;
  student: ApiSharedPerson;
  reportData: ApiProgressReport['report'];
  viewerRole: 'teacher' | 'student';
}

export interface ApiReportComment {
  id: string;
  content: string;
  section: string | null;
  isRead: boolean;
  createdAt: string;
  student: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
      image: string | null;
    };
  };
}

export interface SharedReportView {
  id: string;
  title: string;
  description?: string;
  teacherMessage?: string;
  selectedSections: LegacySections;
  allowComments: boolean;
  reportData: TeacherProgressReportResponse;
  metadata: {
    periodStart: Date;
    periodEnd: Date;
    periodLabel: string;
    createdAt: Date;
    expiresAt?: Date;
    viewCount: number;
    lastViewedAt: Date;
  };
  teacher: { id: string; name: string; image?: string; specialties: string[] };
  student: { id: string; name: string; image?: string; level: string };
  comments: Array<{
    id: string;
    content: string;
    section?: string;
    createdAt: Date;
    isRead: boolean;
    student: { name: string; image?: string };
  }>;
}

export function legacyComment(
  comment: ApiReportComment
): SharedReportView['comments'][number] {
  return {
    id: comment.id,
    content: comment.content,
    section: comment.section ?? undefined,
    createdAt: toDate(comment.createdAt),
    isRead: comment.isRead,
    student: {
      name: personName(comment.student?.user),
      image: comment.student?.user.image ?? undefined,
    },
  };
}

/**
 * Relatório compartilhado para quem participa dele (aluno ou o professor que
 * compartilhou). O nível do aluno e o início do vínculo não ficam gravados no
 * compartilhamento: o nível vem vazio e a duração do vínculo conta do início
 * do período.
 */
export async function loadSharedReport(
  reportId: string,
  token?: string
): Promise<SharedReportView> {
  const [report, comments, teachers] = await Promise.all([
    portalGet<ApiSharedReport>(`/reports/shared/${reportId}`, undefined, token),
    portalGet<{ comments: ApiReportComment[] }>(
      `/reports/shared/${reportId}/comments`,
      undefined,
      token
    ),
    // Especialidades do professor, pela lista de professores do aluno. Quem
    // abre como professor não tem essa lista; aí ficam vazias.
    portalGet<{
      teachers: Array<{ teacher: { id: string; specialties: string[] } }>;
    }>('/student/teachers', undefined, token).catch(() => ({ teachers: [] })),
  ]);

  const specialties =
    teachers.teachers.find((row) => row.teacher.id === report.teacher.id)
      ?.teacher.specialties ?? [];

  const studentName = personName(report.student.user);
  const teacherName = personName(report.teacher.user);
  const overview = report.reportData?.overview;

  const legacy = toLegacyReport(
    {
      student: {
        id: report.student.id,
        userId: report.student.userId,
        name: studentName,
        image: report.student.user.image,
        level: '',
      },
      teacher: {
        id: report.teacher.id,
        userId: report.teacher.userId,
        name: teacherName,
      },
      period: {
        start: report.periodStart,
        end: report.periodEnd,
        label: report.periodLabel,
      },
      relationship: { startDate: report.periodStart, isActive: true },
      coverage: {
        lessons: overview?.totalLessons ?? 0,
        assignments: overview?.totalAssignments ?? 0,
        truncated: { lessons: false, assignments: false },
      },
      sections: report.selectedSections,
      report: report.reportData,
      generatedAt: report.createdAt,
    },
    undefined,
    { specialties }
  );

  return {
    id: report.id,
    title: report.title,
    description: report.description ?? undefined,
    teacherMessage: report.teacherMessage ?? undefined,
    selectedSections: legacySectionsFrom(report.selectedSections),
    allowComments: report.allowComments,
    reportData: legacy,
    metadata: {
      periodStart: toDate(report.periodStart),
      periodEnd: toDate(report.periodEnd),
      periodLabel: legacy.reportMetadata.periodLabel,
      createdAt: toDate(report.createdAt),
      expiresAt: toOptionalDate(report.expiresAt),
      viewCount: report.viewCount,
      lastViewedAt: toDate(report.lastViewedAt ?? report.createdAt),
    },
    teacher: {
      id: report.teacher.userId,
      name: teacherName,
      image: report.teacher.user.image ?? undefined,
      specialties,
    },
    student: {
      id: report.student.userId,
      name: studentName,
      image: report.student.user.image ?? undefined,
      level: '',
    },
    comments: comments.comments.map(legacyComment),
  };
}

/**
 * Comentário do aluno; a seção usa os nomes da API. A resposta não traz o
 * autor (é quem chamou): a tela passa o nome e a foto que já tem.
 */
export async function addSharedReportComment(
  reportId: string,
  content: string,
  section?: string | null,
  author?: { name: string; image?: string }
) {
  const comment = await apiFetch<ApiReportComment>(
    `/reports/shared/${reportId}/comments`,
    {
      method: 'POST',
      body: {
        content,
        ...(apiSectionOf(section) ? { section: apiSectionOf(section) } : {}),
      },
    }
  );

  const mapped = legacyComment(comment);

  return author && !mapped.student.name
    ? { ...mapped, student: { name: author.name, image: author.image } }
    : mapped;
}
