'use client';

// O aluno sem turma ativa (04/10/2026, revoga "aluno sem professor entra"):
// com convite pendente, o convite — aceitar ou recusar ali mesmo, no estilo
// do esboço B; sem convite, a orientação: como entrar numa turma, o estudo
// que continua na biblioteca e o histórico das turmas que terminaram.

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CSSProperties } from 'react';
import { PiSignOut } from 'react-icons/pi';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import {
  errorText,
  useMyClasses,
  usePortalMutation,
} from '@/app/hooks/portal/query';
import { refreshSessionData, signOut, useSession } from '@/app/libs/session';
import * as api from '@/app/requests/portal/api';
import { dayOf, shortDateYear } from '../format';
import { Avatar, Brand, ScreenError, ScreenLoading, Section } from '../pieces';
import { PortalProvider } from '../PortalProvider';
import { HelpButton } from '../help/HelpButton';

const teacherName = (t: {
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
}) =>
  [t.user.firstName, t.user.lastName].filter(Boolean).join(' ') ||
  t.user.email ||
  'Professor';

export function StudentGate() {
  return (
    <PortalProvider role="student">
      <div className="min-h-dvh bg-fundo text-texto">
        <header className="sticky top-0 z-barra border-b border-linha bg-fundo">
          <div className="mx-auto flex h-16 w-full max-w-[var(--largura-conteudo)] items-center gap-3 px-4 sm:px-6">
            <Brand role="student" />
            <span className="ml-auto flex items-center gap-1">
              <HelpButton
                role="student"
                screen="dashboard"
                pathname="/student/convite"
              />
              <ThemeToggle variant="compact" />
              <Button
                variante="fantasma"
                icone={PiSignOut}
                rotulo="Sair"
                onClick={() => signOut({ callbackUrl: '/', redirect: true })}
              />
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[var(--largura-conteudo)] px-4 pb-24 pt-12 sm:px-6 sm:pt-16">
          <Gate />
        </main>
      </div>
    </PortalProvider>
  );
}

function Gate() {
  const router = useRouter();
  const { data: session } = useSession();
  const classes = useMyClasses();
  const done = async () => {
    await refreshSessionData();
    router.refresh();
  };
  const accept = usePortalMutation((id: string) => api.acceptInvite(id), {
    success: 'Bem-vindo à turma.',
    onSuccess: done,
  });
  const decline = usePortalMutation((id: string) => api.declineInvite(id), {
    success: 'Convite recusado.',
    onSuccess: done,
  });

  if (classes.isPending) return <ScreenLoading label="Carregando" />;
  if (classes.error)
    return (
      <ScreenError
        message={errorText(classes.error)}
        onRetry={() => classes.refetch()}
      />
    );
  const { invitations, past, teachers } = classes.data!;
  const name = session?.user?.firstName ?? '';

  // Turma aceita em outro aparelho: a sessão ainda não sabia.
  if (teachers.length > 0 && invitations.length === 0)
    return (
      <section className="flex flex-col items-start gap-5">
        <h1 className="entra font-display text-[2.5rem] leading-tight">
          Sua turma está pronta.
        </h1>
        <Button variante="primario" onClick={done}>
          Abrir o portal
        </Button>
      </section>
    );

  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col gap-5">
        <h1
          className="entra font-display text-[2.5rem] leading-[1.05] sm:text-[3.25rem]"
          style={{ '--i': 0 } as CSSProperties}
        >
          {invitations.length
            ? `${name ? `${name}, você` : 'Você'} tem um convite.`
            : `Olá${name ? `, ${name}` : ''}.`}
        </h1>
        <p
          className="entra max-w-[44ch] text-balance font-display text-[1.375rem] leading-[1.4] text-texto-suave"
          style={{ '--i': 1 } as CSSProperties}
        >
          {invitations.length
            ? 'Aceitando, as aulas, as tarefas e o calendário com o professor passam a aparecer aqui.'
            : 'Você não está em nenhuma turma agora. O portal abre quando um professor te convida e você aceita.'}
        </p>
      </section>

      {invitations.length > 0 && (
        <ul data-ajuda="convite" className="grid gap-4 sm:grid-cols-2">
          {invitations.map((i) => (
            <li
              key={i.relationshipId}
              className="flex flex-col gap-5 rounded-card bg-sup-2 p-6"
            >
              <span className="flex items-center gap-3">
                <Avatar
                  name={teacherName(i.teacher)}
                  image={i.teacher.user.image}
                  size="g"
                />
                <span className="flex flex-col gap-1">
                  <span className="font-display text-2xl leading-tight">
                    {teacherName(i.teacher)}
                  </span>
                  <span className="t-legenda">
                    {[...i.teacher.instruments, ...i.teacher.specialties]
                      .slice(0, 3)
                      .join(' · ') || 'Professor'}
                  </span>
                </span>
              </span>
              {i.teacher.bio && (
                <p className="line-clamp-4 text-[0.9375rem] text-texto-suave">
                  {i.teacher.bio}
                </p>
              )}
              <span className="t-legenda">
                Convite de {shortDateYear(dayOf(i.invitedAt))} · vale até{' '}
                {shortDateYear(dayOf(i.expiresAt))}
              </span>
              <span className="flex flex-wrap gap-2">
                <Button
                  variante="primario"
                  carregando={
                    accept.isPending && accept.variables === i.relationshipId
                  }
                  disabled={decline.isPending}
                  onClick={() => accept.mutate(i.relationshipId)}
                >
                  Aceitar o convite
                </Button>
                <Button
                  variante="fantasma"
                  carregando={
                    decline.isPending && decline.variables === i.relationshipId
                  }
                  disabled={accept.isPending}
                  onClick={() => decline.mutate(i.relationshipId)}
                >
                  Recusar
                </Button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {invitations.length === 0 && (
        <div className="grid gap-12 lg:grid-cols-2">
          <Section title="Como entrar numa turma">
            <ol className="flex flex-col gap-3 text-[0.9375rem] text-texto-suave">
              <li>
                1. Passe ao seu professor o e-mail desta conta (
                {session?.user?.email}).
              </li>
              <li>2. Ele te convida pelo portal do professor.</li>
              <li>
                3. O convite chega por e-mail e aparece aqui; você aceita com um
                toque.
              </li>
            </ol>
          </Section>
          <Section title="Seu estudo continua">
            <p className="text-[0.9375rem] text-texto-suave">
              O que você quer aprender e o que já aprendeu ficam na sua
              biblioteca, com ou sem professor.
            </p>
            <Link
              href="/learning"
              className={classesDeBotao('secundario', 'm') + ' self-start'}
            >
              Abrir a biblioteca
            </Link>
          </Section>
        </div>
      )}

      {past.length > 0 && (
        <div data-ajuda="turmas">
          <Section
            title="Turmas que terminaram"
            detail="O histórico continua seu"
          >
            <ul className="flex flex-col">
              {past.map((p) => (
                <li
                  key={p.relationshipId}
                  className="flex items-center gap-3 border-b border-linha py-4 last:border-0"
                >
                  <Avatar
                    name={teacherName(p.teacher)}
                    image={p.teacher.user.image}
                  />
                  <span className="flex flex-col">
                    <span className="font-medium">
                      {teacherName(p.teacher)}
                    </span>
                    <span className="t-legenda">
                      {shortDateYear(dayOf(p.startDate))} a{' '}
                      {p.endDate ? shortDateYear(dayOf(p.endDate)) : '—'} ·{' '}
                      {p.totalLessons} {p.totalLessons === 1 ? 'aula' : 'aulas'}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      )}
    </div>
  );
}

/** Convite novo para quem já tem turma: aparece no topo do painel. */
export function PendingInvites() {
  const classes = useMyClasses();
  const invalidate = [
    ['portal', 'classes'],
    ['portal', 'dashboard'],
  ];
  const accept = usePortalMutation((id: string) => api.acceptInvite(id), {
    success: 'Bem-vindo à turma.',
    invalidate,
  });
  const decline = usePortalMutation((id: string) => api.declineInvite(id), {
    success: 'Convite recusado.',
    invalidate,
  });
  const invitations = classes.data?.invitations ?? [];
  if (!invitations.length) return null;
  return (
    <ul className="mb-12 flex flex-col gap-3">
      {invitations.map((i) => (
        <li
          key={i.relationshipId}
          className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-sup-2 p-5"
        >
          <span className="flex items-center gap-3">
            <Avatar
              name={teacherName(i.teacher)}
              image={i.teacher.user.image}
            />
            <span className="flex flex-col">
              <span className="font-medium">
                {teacherName(i.teacher)} te convidou para a turma dele
              </span>
              <span className="t-legenda">
                Vale até {shortDateYear(dayOf(i.expiresAt))}
              </span>
            </span>
          </span>
          <span className="flex gap-2">
            <Button
              variante="fantasma"
              carregando={
                decline.isPending && decline.variables === i.relationshipId
              }
              onClick={() => decline.mutate(i.relationshipId)}
            >
              Recusar
            </Button>
            <Button
              variante="primario"
              carregando={
                accept.isPending && accept.variables === i.relationshipId
              }
              onClick={() => accept.mutate(i.relationshipId)}
            >
              Aceitar
            </Button>
          </span>
        </li>
      ))}
    </ul>
  );
}
