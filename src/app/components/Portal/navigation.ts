// components/Portal/navigation.ts — as telas do portal, por papel
import {
  PiBell,
  PiCalendarBlank,
  PiChalkboardTeacher,
  PiChartLineUp,
  PiClipboardText,
  PiClockCounterClockwise,
  PiHouse,
  PiMusicNotes,
  PiUserCircle,
  PiUsers,
} from 'react-icons/pi';
import type { Role } from '@/app/requests/portal/api';

export type ScreenId =
  | 'dashboard'
  | 'calendar'
  | 'lessons'
  | 'assignments'
  | 'students'
  | 'study'
  | 'reports'
  | 'history'
  | 'notifications'
  | 'profile';

export interface Screen {
  id: ScreenId;
  label: string;
  group: 'Dia a dia' | 'Acompanhamento' | 'Conta';
  href: string;
  icon: typeof PiHouse;
}

const ICON: Record<ScreenId, typeof PiHouse> = {
  dashboard: PiHouse,
  calendar: PiCalendarBlank,
  lessons: PiChalkboardTeacher,
  assignments: PiClipboardText,
  students: PiUsers,
  study: PiMusicNotes,
  reports: PiChartLineUp,
  history: PiClockCounterClockwise,
  notifications: PiBell,
  profile: PiUserCircle,
};

const screen = (
  role: Role,
  id: ScreenId,
  label: string,
  group: Screen['group'],
  path: string
): Screen => ({
  id,
  label,
  group,
  href: `/${role}${path}`,
  icon: ICON[id],
});

/**
 * As rotas antigas continuam valendo (avisos e e-mails já enviados apontam
 * para elas): `/student/progress` segue sendo os relatórios do aluno e
 * `/teacher/lessons/create` a criação de aula.
 */
export const SCREENS: Record<Role, Screen[]> = {
  teacher: [
    screen('teacher', 'dashboard', 'Painel', 'Dia a dia', ''),
    screen('teacher', 'calendar', 'Calendário', 'Dia a dia', '/calendar'),
    screen('teacher', 'lessons', 'Aulas', 'Dia a dia', '/lessons'),
    screen('teacher', 'assignments', 'Tarefas', 'Dia a dia', '/assignments'),
    screen('teacher', 'students', 'Alunos', 'Acompanhamento', '/students'),
    screen('teacher', 'reports', 'Relatórios', 'Acompanhamento', '/reports'),
    screen('teacher', 'history', 'Histórico', 'Acompanhamento', '/history'),
    screen('teacher', 'notifications', 'Avisos', 'Conta', '/notifications'),
    screen('teacher', 'profile', 'Perfil do portal', 'Conta', '/profile'),
  ],
  student: [
    screen('student', 'dashboard', 'Painel', 'Dia a dia', ''),
    screen('student', 'calendar', 'Calendário', 'Dia a dia', '/calendar'),
    screen('student', 'lessons', 'Aulas', 'Dia a dia', '/lessons'),
    screen('student', 'assignments', 'Tarefas', 'Dia a dia', '/assignments'),
    screen('student', 'study', 'Estudo', 'Acompanhamento', '/study'),
    screen('student', 'reports', 'Relatórios', 'Acompanhamento', '/progress'),
    screen('student', 'history', 'Histórico', 'Acompanhamento', '/history'),
    screen('student', 'notifications', 'Avisos', 'Conta', '/notifications'),
    screen('student', 'profile', 'Perfil do portal', 'Conta', '/profile'),
  ],
};

export const GROUPS: Screen['group'][] = [
  'Dia a dia',
  'Acompanhamento',
  'Conta',
];

/** A tela em que a pessoa está: a de prefixo mais longo que casa. */
export function currentScreen(
  role: Role,
  pathname: string
): Screen | undefined {
  const list = SCREENS[role];
  return [...list]
    .sort((a, b) => b.href.length - a.href.length)
    .find(
      (s) =>
        pathname === s.href ||
        pathname.startsWith(`${s.href}/`) ||
        (s.id === 'dashboard' && pathname === s.href)
    );
}

/** Para onde a troca de papel leva: a mesma tela no outro papel, se existir. */
export function switchHref(to: Role, from: Role, pathname: string): string {
  const here = currentScreen(from, pathname);
  const twin = here && SCREENS[to].find((s) => s.id === here.id);
  return twin?.href ?? `/${to}`;
}

export const roleOfPath = (pathname: string): Role =>
  pathname.startsWith('/student') ? 'student' : 'teacher';
