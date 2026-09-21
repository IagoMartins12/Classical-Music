// app/requests/student-requests.ts — telas do aluno pela API (Etapa 4)
//
// Só para as páginas servidoras. A API identifica o aluno pelo token do
// cookie; o `userId` fica na assinatura só para as páginas não mudarem. Sem
// sessão ou com erro, `null`, como no legado. Dado de uma pessoa só: sem cache.
import { getServerAccessToken } from '@/app/libs/api/server-session';
import {
  loadStudentAssignmentDetails,
  loadStudentAssignments,
  loadStudentCalendar,
  loadStudentDashboard,
  loadStudentLesson,
  loadStudentLessons,
  loadStudentProfile,
  loadStudentStudyData,
  type StudentAssignmentDetailsResponse,
  type StudentAssignmentFilters,
  type StudentCalendarOptions,
  type StudentLessonFilters,
} from './portal/student';
import { apiErrorMessage, withServerToken } from './portal/server';

export type {
  StudentAssignmentDetailsData,
  StudentAssignmentDetailsResponse,
  StudentCalendarEvent,
  StudentDashboard,
  StudentProfile,
} from './portal/student';

export const getStudentDashboardForPageServer = (_userId: string) =>
  withServerToken('STUDENT-DASHBOARD', loadStudentDashboard);

export const getStudentProfileForPageServer = (_userId: string) =>
  withServerToken('STUDENT-PROFILE', loadStudentProfile);

/** Obras em estudo, aprendidas e anotações recentes do aluno. */
export const getStudentStudyDataForPageServer = (_userId: string) =>
  withServerToken('STUDENT-STUDY', loadStudentStudyData);

export const getStudentCalendarForPageServer = (
  _userId: string,
  startDate: Date,
  endDate: Date,
  options: StudentCalendarOptions = {}
) =>
  withServerToken('STUDENT-CALENDAR', (token) =>
    loadStudentCalendar(startDate, endDate, options, token)
  );

export const getStudentLessonsForPageServer = (
  _userId: string,
  filters: StudentLessonFilters = {}
) =>
  withServerToken('STUDENT-LESSONS', (token) =>
    loadStudentLessons(filters, token)
  );

export const getStudentLessonForPageServer = (
  _userId: string,
  lessonId: string
) =>
  withServerToken('STUDENT-LESSON', (token) =>
    loadStudentLesson(lessonId, token)
  );

export const getStudentAssignmentsForPageServer = (
  _userId: string,
  filters: StudentAssignmentFilters = {}
) =>
  withServerToken('STUDENT-ASSIGNMENTS', (token) =>
    loadStudentAssignments(filters, token)
  );

export async function getStudentAssignmentDetailsData(
  assignmentId: string,
  _userId: string,
  _userRole: number = 0
): Promise<StudentAssignmentDetailsResponse> {
  const token = await getServerAccessToken();

  if (!token) {
    return { success: false, error: 'Sessão expirada' };
  }

  try {
    return await loadStudentAssignmentDetails(assignmentId, token);
  } catch (error) {
    return {
      success: false,
      error: apiErrorMessage(error, 'Tarefa não encontrada ou acesso negado'),
    };
  }
}
