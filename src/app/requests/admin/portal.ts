/**
 * O portal de estudo visto do painel (`/admin/portal/*`): aulas, tarefas,
 * professores e alunos. Só leitura — quem dá aula e passa tarefa é o portal.
 */
import { apiFetch } from '@/app/libs/api/client';

const noStore = { cache: 'no-store' as const };

/** Uma pessoa do portal: o id do perfil (professor ou aluno) e o da conta. */
export interface PessoaDoPortal {
  id: string;
  userId?: string;
  nome?: string | null;
  email?: string | null;
  imagem?: string | null;
}

export type EstadoDaAula =
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'RESCHEDULED';

export const NOME_DO_ESTADO_DA_AULA: Record<EstadoDaAula, string> = {
  SCHEDULED: 'Agendada',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'Aluno faltou',
  RESCHEDULED: 'Reagendada',
};

export const NOME_DO_TIPO_DE_AULA: Record<string, string> = {
  INDIVIDUAL: 'Individual',
  GROUP: 'Em grupo',
  THEORY: 'Teoria',
  PRACTICE: 'Prática',
  MASTERCLASS: 'Masterclass',
};

export interface VisaoDoPortal {
  dias: number;
  professores: { total: number; verificados: number; comAulaNoPeriodo: number };
  alunos: { total: number; comAulaNoPeriodo: number };
  vinculos: { ativos: number; convitesPendentes: number };
  aulas: {
    proximos7Dias: number;
    noPeriodo: number;
    porStatus: Partial<Record<EstadoDaAula, number>>;
    semDesfecho: number;
    presenca: number | null;
  };
  tarefas: {
    porStatus: Record<string, number>;
    atrasadas: number;
    entreguesNoPeriodo: number;
  };
}

export const getVisaoDoPortal = (dias: number) =>
  apiFetch<VisaoDoPortal>('/admin/portal/overview', {
    ...noStore,
    query: { dias },
  });

export interface AulaDoPortal {
  id: string;
  titulo: string;
  quando: string;
  duracao: number;
  status: EstadoDaAula;
  tipo: string;
  local: string | null;
  recorrente: boolean;
  motivoDoCancelamento: string | null;
  presente: boolean | null;
  tarefas: number;
  professor: PessoaDoPortal;
  aluno: PessoaDoPortal;
}

export interface FiltroDeAulas {
  quando?: 'proximas' | 'passadas' | 'sem-desfecho';
  status?: string;
  teacherId?: string;
  studentId?: string;
  from?: string;
  to?: string;
  search?: string;
}

interface Paginado<T> {
  items: T[];
  pagination: { page: number; total: number; totalPages: number };
}

export const getAulasDoPortal = (f: FiltroDeAulas, page = 1) =>
  apiFetch<Paginado<AulaDoPortal>>('/admin/portal/lessons', {
    ...noStore,
    query: { ...f, page, limit: 30 },
  });

/** Uma aula inteira: o que foi trabalhado, notas, presença, tarefas. */
export interface AulaCompleta {
  id: string;
  title: string;
  description: string | null;
  objectives: string[];
  scheduledAt: string;
  duration: number;
  actualStartTime: string | null;
  actualEndTime: string | null;
  status: EstadoDaAula;
  type: string;
  location: string | null;
  isRecurring: boolean;
  topics: string[];
  techniques: string[];
  repertoire: string[];
  homework: string | null;
  practiceGoals: string[];
  lessonSummary: string | null;
  publicNotes: string | null;
  studentFeedback: string | null;
  skillsWorked: string[];
  improvements: string[];
  challenges: string[];
  studentPresent: boolean | null;
  punctuality: string | null;
  engagement: number | null;
  preparation: number | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  rescheduledFrom: string | null;
  rescheduleReason: string | null;
  createdAt: string;
  professor: PessoaDoPortal;
  aluno: PessoaDoPortal;
  assignments: Array<{
    id: string;
    title: string;
    status: string;
    dueDate: string | null;
    isCompleted: boolean;
  }>;
}

export const getAulaDoPortal = (id: string) =>
  apiFetch<AulaCompleta>(`/admin/portal/lessons/${id}`, noStore);

export const NOME_DA_SITUACAO: Record<string, string> = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluída',
  OVERDUE: 'Atrasada',
};

export interface TarefaDoPortal {
  id: string;
  titulo: string;
  tipo: string;
  prioridade: string;
  status: string;
  prazo: string | null;
  concluida: boolean;
  concluidaEm: string | null;
  atrasada: boolean;
  progresso: number | null;
  nota: number | null;
  criadaEm: string;
  aluno: PessoaDoPortal;
  aula: { id: string; titulo: string };
  professor: PessoaDoPortal;
}

export interface FiltroDeTarefas {
  situacao?: 'em-vigor' | 'atrasadas' | 'concluidas';
  teacherId?: string;
  studentId?: string;
  search?: string;
}

export const getTarefasDoPortal = (f: FiltroDeTarefas, page = 1) =>
  apiFetch<Paginado<TarefaDoPortal>>('/admin/portal/assignments', {
    ...noStore,
    query: { ...f, page, limit: 30 },
  });

export interface TarefaCompleta {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  dueDate: string | null;
  estimatedTime: number | null;
  actualTime: number | null;
  isCompleted: boolean;
  completedAt: string | null;
  progress: number | null;
  exercises: string[];
  practiceGoals: string[];
  technicalGoals: string[];
  musicalGoals: string[];
  teacherFeedback: string | null;
  teacherRating: number | null;
  studentNotes: string | null;
  studentRating: number | null;
  submissionDate: string | null;
  createdAt: string;
  aluno: PessoaDoPortal;
  aula: { id: string; titulo: string; quando: string };
  professor: PessoaDoPortal;
}

export const getTarefaDoPortal = (id: string) =>
  apiFetch<TarefaCompleta>(`/admin/portal/assignments/${id}`, noStore);

export interface ProfessorDoPortal extends PessoaDoPortal {
  status: string;
  verificado: boolean;
  instrumentos: string[];
  desde: string;
  alunosAtivos: number;
  aulas30Dias: number;
  proximasAulas: number;
}

export const getProfessoresDoPortal = (search: string, page = 1) =>
  apiFetch<Paginado<ProfessorDoPortal>>('/admin/portal/teachers', {
    ...noStore,
    query: { search: search || undefined, page, limit: 30 },
  });

export interface AlunoDoPortal extends PessoaDoPortal {
  status: string;
  nivel: string;
  instrumento: string | null;
  ultimaAula: string | null;
  desde: string;
  professores: PessoaDoPortal[];
  tarefasAbertas: number;
  tarefasAtrasadas: number;
  tarefasConcluidas: number;
}

export const getAlunosDoPortal = (search: string, page = 1) =>
  apiFetch<Paginado<AlunoDoPortal>>('/admin/portal/students', {
    ...noStore,
    query: { search: search || undefined, page, limit: 30 },
  });
