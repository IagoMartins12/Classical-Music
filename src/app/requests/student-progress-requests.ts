// app/requests/student-progress-requests.ts — progresso do aluno pela API (Etapa 4)
//
// Só para a página servidora; o cálculo mora em `portal/student-progress.ts`,
// que o hook do navegador também usa.
import { loadStudentProgress } from './portal/student-progress';
import { withServerToken } from './portal/server';

export type {
  AssignmentTypeBreakdown,
  MonthlyProgressData,
  StudentProgressResponse,
  StudentProgressStats,
  TeacherProgressBreakdown,
  WorkProgressData,
} from './portal/student-progress';

/** `period`: '3months', '6months' (padrão), '1year' ou 'all'. */
export const getStudentProgressData = (
  _userId: string,
  period: string = '6months'
) =>
  withServerToken('STUDENT-PROGRESS', (token) =>
    loadStudentProgress(period, token)
  );
