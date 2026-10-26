'use client';

// As aulas — escolha de 04/10/2026: o índice por semana do esboço B, com o
// detalhe da aula ao lado no computador (como no C, no lugar do modal), a
// escolha do aluno (ou do professor, para o aluno), e a folha no tablet e no
// telefone. As fichas de filtro correm de lado no telefone.

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { PiCalendarBlank, PiPlus } from 'react-icons/pi';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import {
  errorText,
  useLessons,
  useStudentDashboard,
  useTeacherDashboard,
} from '@/app/hooks/portal/query';
import type { Lesson, LessonListQuery, Role } from '@/app/requests/portal/api';
import { nameOf } from '@/app/requests/portal/api';
import {
  addDays,
  clock,
  dayOf,
  dayOfMonth,
  dayShort,
  daysBetween,
  shortDate,
  startOfDay,
  today,
  weekStart,
} from '../format';
import { LessonPanel, useLessonSelection } from '../lesson/LessonPanel';
import {
  Empty,
  FilterChips,
  LessonStatusLabel,
  PageHeader,
  ScreenError,
  ScreenLoading,
  SearchBox,
  SectionTitle,
} from '../pieces';
import { usePortal } from '../PortalProvider';
import { useDebounced } from '../useDebounced';

type Filter = 'window' | 'upcoming' | 'pending' | 'past';
const PAGE = 50;

export function LessonsScreen({
  role,
  initialId,
}: {
  role: Role;
  initialId?: string;
}) {
  const { open } = usePortal();
  const [filter, setFilter] = useState<Filter>('window');
  const [person, setPerson] = useState('');
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const q = useDebounced(search.trim(), 300);
  const { selected, select, clear, wide } = useLessonSelection(
    initialId ?? null
  );

  // Link direto para uma aula (avisos, e-mails): no computador ela abre ao
  // lado; no tablet e no telefone, na folha.
  useEffect(() => {
    if (initialId && !window.matchMedia('(min-width: 1280px)').matches)
      open({ type: 'lesson', id: initialId });
  }, [initialId]);

  const teacherBoard = useTeacherDashboard(role === 'teacher');
  const studentBoard = useStudentDashboard(role === 'student');
  const people =
    role === 'teacher'
      ? (teacherBoard.data?.students ?? []).map((s) => ({
          id: s.studentId,
          name: s.name,
        }))
      : (studentBoard.data?.teachers ?? []).map((t) => ({
          id: t.teacherId,
          name: t.name,
        }));
  const pendingCount = teacherBoard.data?.pendingOutcome.length ?? 0;

  const query = useMemo<LessonListQuery>(() => {
    const now = new Date().toISOString();
    const base: LessonListQuery = {
      as: role,
      limit,
      q: q || undefined,
      ...(person
        ? role === 'teacher'
          ? { studentId: person }
          : { teacherId: person }
        : {}),
    };
    if (filter === 'upcoming')
      return { ...base, status: 'SCHEDULED', from: now, order: 'asc' };
    if (filter === 'pending')
      return { ...base, pendingOutcome: true, order: 'desc' };
    if (filter === 'past') return { ...base, to: now, order: 'desc' };
    // Padrão: de duas semanas atrás até quatro à frente — o que se consulta no dia a dia.
    const start = weekStart(today());
    return {
      ...base,
      from: startOfDay(addDays(start, -14)).toISOString(),
      to: startOfDay(addDays(start, 35)).toISOString(),
      order: 'asc',
    };
    // A hora de "agora" entra só quando o filtro muda.
  }, [role, filter, person, q, limit]);

  const lessons = useLessons(query);
  const items = useMemo(() => {
    const list = lessons.data?.items ?? [];
    // Sem desfecho de verdade: a que já terminou.
    return filter === 'pending'
      ? list.filter(
          (l) =>
            new Date(l.scheduledAt).getTime() + l.duration * 60_000 <=
            Date.now()
        )
      : list;
  }, [lessons.data, filter]);

  const groups = useMemo(() => {
    const map = new Map<string, Lesson[]>();
    for (const l of items) {
      const w = weekStart(dayOf(l.scheduledAt));
      map.set(w, [...(map.get(w) ?? []), l]);
    }
    return [...map.entries()];
  }, [items]);

  const weekName = (start: string) => {
    const n = Math.round(daysBetween(weekStart(today()), start) / 7);
    if (n === 0) return 'Esta semana';
    if (n === 1) return 'Semana que vem';
    if (n === -1) return 'Semana passada';
    return `Semana de ${shortDate(start)}`;
  };

  const total = lessons.data?.pagination.total ?? 0;
  const filters: Array<[Filter, string, number?]> = [
    ['window', 'Estas semanas'],
    ['upcoming', 'Próximas'],
    ...(role === 'teacher'
      ? ([['pending', 'Sem desfecho', pendingCount]] as Array<
          [Filter, string, number?]
        >)
      : []),
    ['past', 'Anteriores'],
  ];

  return (
    <div
      className={cx(
        'grid gap-10',
        wide && selected && 'xl:grid-cols-[minmax(0,1fr)_380px]'
      )}
    >
      <div className="flex min-w-0 flex-col gap-10">
        <PageHeader
          className="!pb-0"
          title="Aulas"
          description={
            role === 'teacher'
              ? 'Aula não se apaga: se cancela, e fica no histórico do aluno. A que passou sem desfecho se fecha daqui mesmo.'
              : 'Suas aulas com todos os professores. Na aula, guarde as obras no seu “quero aprender” ou “já aprendi”.'
          }
          actions={
            role === 'teacher' ? (
              <>
                <Button
                  onClick={() =>
                    open({ type: 'schedule', studentId: person || undefined })
                  }
                >
                  Marcar rápido
                </Button>
                <Link
                  href={`/teacher/lessons/create${person ? `?student=${person}` : ''}`}
                  className={classesDeBotao('primario', 'm')}
                >
                  <Icon de={PiPlus} tamanho="p" /> Nova aula
                </Link>
              </>
            ) : (
              <Button
                variante="primario"
                icone={PiCalendarBlank}
                onClick={() => open({ type: 'request' })}
              >
                Pedir aula
              </Button>
            )
          }
        />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <FilterChips
            value={filter}
            onChange={(f) => (setFilter(f), setLimit(PAGE))}
            options={filters}
            label="Quais aulas"
          />
          <div className="flex flex-col gap-3 sm:flex-row md:shrink-0">
            {people.length > 1 && (
              <Field.Selecao
                label={role === 'teacher' ? 'Aluno' : 'Professor'}
                rotuloOculto
                value={person}
                onChange={(e) => (setPerson(e.target.value), setLimit(PAGE))}
                className="sm:w-56"
              >
                <option value="">
                  {role === 'teacher'
                    ? 'Todos os alunos'
                    : 'Todos os professores'}
                </option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Field.Selecao>
            )}
            <SearchBox
              value={search}
              onChange={setSearch}
              label={role === 'teacher' ? 'Aula ou aluno' : 'Aula ou professor'}
              className="sm:w-64"
            />
          </div>
        </div>

        {lessons.isPending ? (
          <ScreenLoading rows={6} label="Carregando as aulas" />
        ) : lessons.error ? (
          <ScreenError message={errorText(lessons.error)} />
        ) : groups.length === 0 ? (
          <Empty
            titulo={
              filter === 'pending'
                ? 'Nenhuma aula esperando desfecho'
                : 'Nenhuma aula aqui'
            }
            descricao={
              search || person
                ? 'Troque o filtro, o aluno ou a busca.'
                : filter === 'window'
                  ? 'Nada marcado entre duas semanas atrás e o mês que vem.'
                  : undefined
            }
            acao={
              role === 'teacher' && filter !== 'pending' ? (
                <Button onClick={() => open({ type: 'schedule' })}>
                  Marcar aula
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div
            data-ajuda="lista"
            className={cx(
              'flex flex-col gap-12 transition-opacity',
              lessons.isFetching && 'opacity-70'
            )}
          >
            {groups.map(([start, list]) => (
              <section key={start} className="flex flex-col gap-1">
                <SectionTitle
                  detail={`${shortDate(start)} a ${shortDate(addDays(start, 6))} · ${list.length} ${list.length === 1 ? 'aula' : 'aulas'}`}
                >
                  {weekName(start)}
                </SectionTitle>
                <ol>
                  {list.map((l) => (
                    <li key={l.id}>
                      <LessonLine
                        lesson={l}
                        role={role}
                        selected={selected === l.id}
                        onSelect={select}
                      />
                    </li>
                  ))}
                </ol>
              </section>
            ))}
            {total > items.length && filter !== 'pending' && (
              <Button
                variante="secundario"
                className="self-start"
                carregando={lessons.isFetching}
                onClick={() => setLimit((n) => Math.min(100, n + PAGE))}
                disabled={limit >= 100}
              >
                {limit >= 100
                  ? `Mostrando 100 de ${total}: refine o filtro`
                  : 'Mostrar mais'}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* O detalhe só aparece quando uma aula é escolhida (pedido de 05/10). */}
      {wide && selected && (
        <LessonPanel id={selected} role={role} onClose={clear} />
      )}
    </div>
  );
}

function LessonLine({
  lesson,
  role,
  selected,
  onSelect,
}: {
  lesson: Lesson;
  role: Role;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const day = dayOf(lesson.scheduledAt);
  const who = nameOf(role === 'teacher' ? lesson.student : lesson.teacher);
  const works = lesson.works ?? [];
  const composers = lesson.composers ?? [];
  const repertoire = works.length
    ? works.map((w) => w.title).join(', ')
    : composers.map((c) => c.name).join(', ');
  return (
    <button
      type="button"
      onClick={() => onSelect(lesson.id)}
      aria-pressed={selected || undefined}
      className={cx(
        'group/aula grid w-full grid-cols-[minmax(52px,auto)_minmax(0,1fr)_auto] items-center gap-4 border-b border-linha py-4 text-left transition-colors sm:grid-cols-[64px_minmax(0,1fr)_minmax(0,1fr)_auto]',
        selected && 'bg-sup-2/70'
      )}
    >
      <span className="flex flex-col pl-1">
        <span
          className={cx(
            't-dado text-2xl leading-none',
            day === today() ? 'text-ouro-texto' : 'text-texto'
          )}
        >
          {String(dayOfMonth(day)).padStart(2, '0')}
        </span>
        {/* One line: on a phone the column is narrow, and "qui · 15:00"
            broke in two. */}
        <span className="whitespace-nowrap text-xs text-texto-fraco">
          {dayShort(day)} · {clock(lesson.scheduledAt)}
        </span>
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-display text-xl leading-tight transition-colors duration-[var(--t-toque)] group-hover/aula:text-ouro-texto">
          {lesson.title}
        </span>
        <span className="truncate text-sm text-texto-suave">{who}</span>
      </span>
      <span className="truncate text-sm italic text-texto-fraco max-sm:hidden">
        {repertoire}
      </span>
      <LessonStatusLabel lesson={lesson} role={role} />
    </button>
  );
}
