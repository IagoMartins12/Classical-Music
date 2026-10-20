'use client';

// components/Portal/PortalShell.tsx — a casca do portal (esboço A, 04/10/2026)
//
// A casca do painel administrativo trazida para o portal: lateral fixa com as
// telas agrupadas no computador; no tablet e no telefone a mesma lateral mora
// numa folha aberta pelo botão do topo. Quem já usa o admin não aprende nada
// novo. O título de cada tela fica na própria tela (o topo animado); a barra
// mostra só onde a pessoa está, o "?" da tela, o sino e a ação do dia.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  PiArrowSquareOut,
  PiCalendarPlus,
  PiCaretLeft,
  PiCaretRight,
  PiList,
  PiSignOut,
  PiTimer,
} from 'react-icons/pi';
import { GiGrandPiano } from 'react-icons/gi';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import { signOut, useSession } from '@/app/libs/session';
import {
  useStudentDashboard,
  useTeacherDashboard,
  useUnreadCount,
} from '@/app/hooks/portal/query';
import type { Role } from '@/app/requests/portal/api';
import { HelpButton } from './help/HelpButton';
import { NotificationsMenu } from './notifications/NotificationsMenu';
import {
  GROUPS,
  SCREENS,
  currentScreen,
  switchHref,
  type ScreenId,
} from './navigation';
import { Avatar, Brand, ProgressBar } from './pieces';
import { PortalProvider, usePortal } from './PortalProvider';
import { PLAN_NAME } from './plans';

const COLLAPSED_KEY = 'portal:lateral-recolhida';

export function PortalShell({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  return (
    <PortalProvider role={role}>
      <Shell role={role}>{children}</Shell>
    </PortalProvider>
  );
}

function Shell({ role, children }: { role: Role; children: ReactNode }) {
  const pathname = usePathname() ?? `/${role}`;
  const [menu, setMenu] = useState(false);
  const { open } = usePortal();
  const screen = currentScreen(role, pathname);
  const counts = useCounts(role);
  const unread = useUnreadCount().data?.unreadCount ?? 0;

  useEffect(() => setMenu(false), [pathname]);

  // Recolhível pelo chevron, como a lateral do painel (05/10): recolhida,
  // fica com 72px e só os ícones. A escolha fica guardada no navegador.
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSED_KEY) === '1');
    } catch {
      // navegador que bloqueia armazenamento: a lateral só não lembra
    }
  }, []);
  const toggleCollapsed = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSED_KEY, c ? '0' : '1');
      } catch {
        // idem
      }
      return !c;
    });

  // Primeira visita a este papel: as boas-vindas (a marca é do servidor).
  const teacherBoard = useTeacherDashboard(role === 'teacher');
  const studentBoard = useStudentDashboard(role === 'student');
  const board = role === 'teacher' ? teacherBoard.data : studentBoard.data;
  const welcomed = useRef(false);
  useEffect(() => {
    if (!board || board.onboardedAt || welcomed.current) return;
    welcomed.current = true;
    const t = setTimeout(() => open({ type: 'onboarding' }), 500);
    return () => clearTimeout(t);
  }, [board, open]);

  // A ação do dia mora na barra só nas três telas do dia; nas outras, a ação
  // é da própria tela.
  const daily =
    screen &&
    (['dashboard', 'calendar', 'lessons'] as ScreenId[]).includes(screen.id);
  const action =
    role === 'teacher'
      ? {
          label: 'Marcar aula',
          icon: PiCalendarPlus,
          run: () => open({ type: 'schedule' }),
        }
      : {
          label: 'Registrar prática',
          icon: PiTimer,
          run: () => open({ type: 'practice' }),
        };

  return (
    <div className="flex min-h-dvh bg-fundo text-texto">
      <aside
        className={cx(
          'sticky top-0 hidden h-dvh shrink-0 flex-col overflow-hidden border-r border-linha lg:flex',
          'transition-[width] duration-[var(--t-entrada)] ease-saida motion-reduce:transition-none',
          collapsed
            ? 'w-[72px] items-center gap-1 px-2 py-4'
            : 'w-[272px] gap-6 px-4 py-5'
        )}
      >
        {collapsed ? (
          <CollapsedNavigation
            role={role}
            pathname={pathname}
            counts={{ ...counts, notifications: unread }}
            onExpand={toggleCollapsed}
          />
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Brand role={role} small className="min-w-0 flex-1 pl-1" />
              <Button
                variante="fantasma"
                tamanho="p"
                icone={PiCaretLeft}
                rotulo="Recolher o menu"
                aria-expanded="true"
                onClick={toggleCollapsed}
              />
            </div>
            <Navigation
              role={role}
              pathname={pathname}
              counts={{ ...counts, notifications: unread }}
            />
          </>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-barra flex min-h-14 items-center gap-2 border-b border-linha bg-fundo px-4 py-2 max-sm:min-h-16 sm:px-6 lg:px-10">
          <Button
            variante="fantasma"
            icone={PiList}
            rotulo="Abrir o menu do portal"
            onClick={() => setMenu(true)}
            className="lg:hidden"
          />
          <span className="t-rotulo min-w-0 flex-1 truncate font-medium text-texto">
            <span className="text-texto-fraco max-sm:hidden">
              {screen?.group ?? 'Portal'} /{' '}
            </span>
            {screen?.label ?? 'Portal'}
          </span>
          <HelpButton
            role={role}
            screen={screen?.id ?? 'dashboard'}
            pathname={pathname}
          />
          <NotificationsMenu role={role} unread={unread} />
          {daily && (
            <>
              <span className="max-sm:hidden">
                <Button
                  variante="primario"
                  tamanho="p"
                  icone={action.icon}
                  onClick={action.run}
                >
                  {action.label}
                </Button>
              </span>
              <Button
                variante="primario"
                tamanho="p"
                icone={action.icon}
                rotulo={action.label}
                onClick={action.run}
                className="sm:hidden"
              />
            </>
          )}
        </header>
        {/* Recolhida a lateral, o conteúdo ganha a largura dela e o teto sobe,
            na mesma animação da lateral (como no painel). */}
        <main
          className={cx(
            'w-full flex-1 px-4 pb-28 pt-8 sm:px-6 lg:px-10 lg:pt-10',
            'transition-[max-width] duration-[var(--t-entrada)] ease-saida motion-reduce:transition-none',
            collapsed ? 'max-w-[1680px]' : 'max-w-[1440px]'
          )}
        >
          {children}
        </main>
      </div>

      <Sheet
        aberto={menu}
        aoFechar={() => setMenu(false)}
        titulo="Portal do Opus Atlas"
        largura="p"
      >
        <Navigation
          role={role}
          pathname={pathname}
          counts={{ ...counts, notifications: unread }}
          inSheet
        />
      </Sheet>
    </div>
  );
}

/** Quantos esperam em cada tela, a partir do painel (que já está em cache). */
function useCounts(role: Role): Partial<Record<ScreenId, number>> {
  const teacher = useTeacherDashboard(role === 'teacher');
  const student = useStudentDashboard(role === 'student');
  if (role === 'teacher') {
    const d = teacher.data;
    return d
      ? {
          lessons: d.pendingOutcome.length,
          assignments: d.assignmentsAwaitingFeedback.length,
        }
      : {};
  }
  const d = student.data;
  return d ? { assignments: d.overdueAssignments.length } : {};
}

function Navigation({
  role,
  pathname,
  counts,
  inSheet = false,
}: {
  role: Role;
  pathname: string;
  counts: Partial<Record<ScreenId, number>>;
  inSheet?: boolean;
}) {
  const { data: session } = useSession();
  const user = session?.user;
  const here = currentScreen(role, pathname);
  const both = Boolean(
    user?.isTeacher && (user.isStudent || user.studentInviteStatus)
  );
  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.name ||
    user?.email ||
    '';

  return (
    <div
      className={cx(
        'flex min-h-0 flex-1 flex-col gap-6',
        inSheet && 'min-h-[60dvh]'
      )}
    >
      {both && <RoleSwitch role={role} pathname={pathname} />}
      <nav
        data-ajuda="nav"
        aria-label="Portal"
        className="-mr-2 flex flex-col gap-5 overflow-y-auto pr-2 rolagem-discreta"
      >
        {GROUPS.map((group) => (
          <div key={group} className="flex flex-col gap-0.5">
            <span className="t-legenda px-3 pb-1">{group}</span>
            {SCREENS[role]
              .filter((s) => s.group === group)
              .map((s) => {
                const active = here?.id === s.id;
                const n = counts[s.id];
                return (
                  <Link
                    key={s.id}
                    href={s.href}
                    aria-current={active ? 'page' : undefined}
                    className={cx(
                      'flex min-h-10 items-center gap-3 rounded-controle px-3 text-[0.9375rem] [@media(pointer:coarse)]:min-h-[var(--alvo)]',
                      'transition-[background-color,color] duration-[var(--t-toque)] ease-saida',
                      active
                        ? 'bg-sup-2 font-medium text-texto'
                        : 'text-texto-suave hover:bg-sup-2 hover:text-texto'
                    )}
                  >
                    <Icon
                      de={s.icon}
                      tamanho="m"
                      className={active ? 'text-ouro-texto' : undefined}
                    />
                    {s.label}
                    {n ? (
                      <span className="t-dado ml-auto text-xs text-ouro-texto">
                        {n > 99 ? '99+' : n}
                        <span className="sr-only"> esperando</span>
                      </span>
                    ) : null}
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-3">
        {role === 'teacher' && <PlanCard />}
        <div className="flex items-center gap-3 px-1">
          <Avatar name={name} image={user?.image} size="p" />
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-sm font-medium">{name}</span>
            <Link
              href="/"
              className="t-legenda inline-flex items-center gap-1 hover:text-texto"
            >
              Ver o site <Icon de={PiArrowSquareOut} tamanho="pp" />
            </Link>
          </span>
          <ThemeToggle variant="compact" />
          <Button
            variante="fantasma"
            icone={PiSignOut}
            rotulo="Sair"
            onClick={() => signOut({ callbackUrl: '/', redirect: true })}
          />
        </div>
      </div>
    </div>
  );
}

function RoleSwitch({ role, pathname }: { role: Role; pathname: string }) {
  const roles: Array<{ id: Role; label: string }> = [
    { id: 'teacher', label: 'Dou aula' },
    { id: 'student', label: 'Estudo' },
  ];
  return (
    <nav
      data-ajuda="papel"
      aria-label="Trocar de papel"
      className="flex rounded-full bg-sup-2 p-1"
    >
      {roles.map((r) => (
        <Link
          key={r.id}
          href={r.id === role ? pathname : switchHref(r.id, role, pathname)}
          aria-current={r.id === role ? 'page' : undefined}
          className={cx(
            'flex min-h-9 flex-1 items-center justify-center whitespace-nowrap rounded-full px-3 text-sm font-medium [@media(pointer:coarse)]:min-h-[var(--alvo)]',
            'transition-[background-color,color] duration-[var(--t-resposta)] ease-saida',
            r.id === role
              ? 'fill-ouro text-sobre-ouro'
              : 'text-texto-suave hover:text-texto'
          )}
        >
          {r.label}
        </Link>
      ))}
    </nav>
  );
}

function PlanCard() {
  const { open } = usePortal();
  const plan = useTeacherDashboard().data?.plan;
  if (!plan) return null;
  const name = PLAN_NAME[plan.name] ?? plan.name;
  const limited = plan.maxStudents !== null && plan.maxStudents > 0;
  return (
    <button
      type="button"
      onClick={() => open({ type: 'upgrade' })}
      aria-label={
        limited
          ? `Plano ${name}, ${plan.activeStudents} de ${plan.maxStudents} alunos. Ver planos`
          : plan.maxStudents === 0
            ? `Plano ${name}, sem alunos incluídos. Ver planos`
            : `Plano ${name}, ${plan.activeStudents} alunos. Ver planos`
      }
      className="flex flex-col gap-2 rounded-controle bg-sup-2 p-3 text-left transition-[box-shadow] duration-[var(--t-toque)] hover:shadow-[var(--sombra-2)]"
    >
      <span className="flex justify-between text-sm">
        <span className="text-texto-suave">Plano {name}</span>
        <span className="t-dado text-texto">
          {limited
            ? `${plan.activeStudents} de ${plan.maxStudents}`
            : `${plan.activeStudents} alunos`}
        </span>
      </span>
      {limited && (
        <ProgressBar
          value={
            (plan.activeStudents / Math.max(1, plan.maxStudents ?? 1)) * 100
          }
          label="Vagas de aluno usadas"
        />
      )}
      <span className="text-xs font-medium text-ouro-texto">
        {plan.name === 'MAESTRO' ? 'Ver o plano' : 'Ver o Maestro'}
      </span>
    </button>
  );
}

/** A lateral recolhida: só os ícones, com o nome no `title` e no leitor de tela. */
function CollapsedNavigation({
  role,
  pathname,
  counts,
  onExpand,
}: {
  role: Role;
  pathname: string;
  counts: Partial<Record<ScreenId, number>>;
  onExpand: () => void;
}) {
  const { data: session } = useSession();
  const user = session?.user;
  const here = currentScreen(role, pathname);
  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.name ||
    user?.email ||
    '';
  return (
    <>
      <Link
        href={`/${role}`}
        className="mb-1 grid h-10 w-10 place-items-center"
        title="Portal do Opus Atlas"
      >
        <GiGrandPiano
          className="icon-glow h-7 w-7 text-ouro-texto"
          aria-hidden="true"
        />
        <span className="sr-only">Portal do Opus Atlas</span>
      </Link>
      <Button
        variante="fantasma"
        tamanho="p"
        icone={PiCaretRight}
        rotulo="Abrir o menu"
        aria-expanded="false"
        onClick={onExpand}
        className="mb-3"
      />
      <nav
        data-ajuda="nav"
        aria-label="Portal"
        className="flex flex-1 flex-col items-center gap-1 overflow-y-auto rolagem-discreta"
      >
        {GROUPS.map((group, gi) => (
          <div
            key={group}
            className={cx(
              'flex flex-col items-center gap-1',
              gi > 0 && 'border-t border-linha pt-2'
            )}
          >
            {SCREENS[role]
              .filter((s) => s.group === group)
              .map((s) => {
                const active = here?.id === s.id;
                const n = counts[s.id];
                return (
                  <Link
                    key={s.id}
                    href={s.href}
                    title={s.label}
                    aria-current={active ? 'page' : undefined}
                    className={cx(
                      'relative grid h-11 w-11 place-items-center rounded-controle transition-colors duration-[var(--t-toque)] ease-saida',
                      active
                        ? 'bg-sup-2 text-ouro-texto'
                        : 'text-texto-fraco hover:bg-sup-2 hover:text-texto'
                    )}
                  >
                    <Icon de={s.icon} tamanho="m" />
                    <span className="sr-only">
                      {s.label}
                      {n ? `, ${n} esperando` : ''}
                    </span>
                    {n ? (
                      <span
                        aria-hidden="true"
                        className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-ouro"
                      />
                    ) : null}
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>
      <div className="flex flex-col items-center gap-2 pt-2">
        <ThemeToggle variant="compact" />
        <span title={name}>
          <Avatar name={name} image={user?.image} size="p" />
        </span>
        <Button
          variante="fantasma"
          icone={PiSignOut}
          rotulo="Sair"
          onClick={() => signOut({ callbackUrl: '/', redirect: true })}
        />
      </div>
    </>
  );
}
