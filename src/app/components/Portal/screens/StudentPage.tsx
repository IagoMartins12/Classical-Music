'use client';

// A página do aluno — esboço B (04/10/2026): os números, e por abas a visão
// geral, o repertório, as aulas, as tarefas, os relatórios e o plano de
// estudos (que se edita aqui, e onde se encerra o vínculo).

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  PiCalendarPlus,
  PiChartLineUp,
  PiClipboardText,
  PiEnvelopeSimple,
} from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Aba, Abas } from '@/app/components/ui/Abas';
import { Chip } from '@/app/components/ui/Badge';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Row } from '@/app/components/ui/Row';
import {
  errorText,
  useAssignments,
  useLessons,
  usePortalMutation,
  useStudent,
} from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import type { Lesson, StudentRow } from '@/app/requests/portal/api';
import {
  dayOf,
  duration,
  firstName,
  longDate,
  shortDateYear,
  timeRange,
  when,
} from '../format';
import { assignmentState, typeLabel } from '../assignment/assignmentText';
import {
  Empty,
  LessonStatusLabel,
  PageHeader,
  ProgressBar,
  ScreenError,
  ScreenLoading,
  Section,
} from '../pieces';
import { usePortal } from '../PortalProvider';
import { StudentPractice } from '../student/StudentPractice';
import { StudentRepertoire } from '../student/StudentRepertoire';

type Tab = 'overview' | 'repertoire' | 'lessons' | 'assignments' | 'plan';

const LEVEL: Record<string, string> = {
  BEGINNER: 'Iniciante',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
};

export function StudentPage({ studentId }: { studentId: string }) {
  const query = useStudent(studentId);
  if (query.isPending) return <ScreenLoading label="Carregando o aluno" />;
  if (query.error || !query.data)
    return <ScreenError message={errorText(query.error)} />;
  return <Page row={query.data} />;
}

function Page({ row }: { row: StudentRow }) {
  const { open } = usePortal();
  const [tab, setTab] = useState<Tab>('overview');
  const name =
    [row.student.user.firstName, row.student.user.lastName]
      .filter(Boolean)
      .join(' ') ||
    row.student.user.email ||
    'Aluno';
  const first = firstName(name);
  const id = row.student.id;
  const active = row.isActive && row.inviteStatus === 'ACCEPTED';
  const pending = row.inviteStatus === 'PENDING';
  const s = row.stats;

  const facts = [
    row.student.level && LEVEL[row.student.level],
    row.student.mainInstrument,
    `desde ${shortDateYear(dayOf(row.startDate))}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <PageHeader
        back={{ href: '/teacher/students', label: 'Alunos' }}
        title={name}
        description={
          <span className="flex flex-col gap-1">
            <span>{facts.replace(/^./, (c) => c.toUpperCase())}</span>
            {row.student.user.email && (
              <a
                href={`mailto:${row.student.user.email}`}
                className="w-fit break-all font-sans text-base text-texto-suave underline decoration-ouro/40 underline-offset-4 hover:text-ouro-texto"
              >
                {row.student.user.email}
              </a>
            )}
          </span>
        }
        actions={
          active ? (
            <>
              <Button
                variante="primario"
                icone={PiCalendarPlus}
                onClick={() => open({ type: 'schedule', studentId: id })}
              >
                Marcar aula
              </Button>
              <Button
                icone={PiClipboardText}
                onClick={() => open({ type: 'new-assignment', studentId: id })}
              >
                Passar tarefa
              </Button>
              <Link
                href={`/teacher/reports?student=${id}&new=1`}
                className={classesDeBotao('secundario', 'm')}
              >
                <PiChartLineUp aria-hidden="true" className="h-4 w-4" /> Gerar
                relatório
              </Link>
              <Button
                variante="fantasma"
                icone={PiEnvelopeSimple}
                onClick={() => open({ type: 'announce', studentIds: [id] })}
              >
                Avisar
              </Button>
            </>
          ) : undefined
        }
      />

      {!row.isActive && (
        <p className="mb-8 rounded-controle bg-sup-2 p-4 text-sm text-texto-suave">
          Vínculo encerrado
          {row.endDate ? ` em ${longDate(dayOf(row.endDate))}` : ''}. As aulas,
          as tarefas e os relatórios continuam aqui.
        </p>
      )}
      {pending && (
        <p className="mb-8 rounded-controle bg-sup-2 p-4 text-sm text-texto-suave">
          Convite enviado em {shortDateYear(dayOf(row.startDate))}. Enquanto{' '}
          {first} não aceita, não dá para marcar aula nem passar tarefa.
        </p>
      )}

      {s && (
        <dl
          data-ajuda="numeros"
          className="mb-10 grid grid-cols-2 gap-6 sm:grid-cols-4"
        >
          {[
            ['Aulas', String(row.totalLessons)],
            [
              'Presença',
              s.attendanceRate === null ? 'Sem dado' : `${s.attendanceRate}%`,
            ],
            [
              'Prática, 7 dias',
              s.practiceGoalMinutes
                ? `${duration(s.practiceMinutes7d)} de ${duration(s.practiceGoalMinutes)}`
                : duration(s.practiceMinutes7d),
            ],
            [
              'Tarefas abertas',
              s.overdueAssignments
                ? `${s.openAssignments} · ${s.overdueAssignments} atrasada${s.overdueAssignments > 1 ? 's' : ''}`
                : String(s.openAssignments),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1">
              <dt className="t-legenda">{label}</dt>
              <dd className="font-display text-[1.75rem] leading-none text-texto">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {!pending && (
        <>
          <div
            data-ajuda="abas"
            className="mb-8 overflow-x-auto [scrollbar-width:none]"
          >
            <Abas rotulo={`Sobre ${first}`}>
              {(
                [
                  ['overview', 'Visão geral'],
                  ['repertoire', 'Repertório'],
                  ['lessons', 'Aulas'],
                  ['assignments', 'Tarefas'],
                  ['plan', 'Plano de estudos'],
                ] as Array<[Tab, string]>
              ).map(([k, label]) => (
                <Aba key={k} ativa={tab === k} onClick={() => setTab(k)}>
                  {label}
                </Aba>
              ))}
            </Abas>
          </div>

          {tab === 'overview' && (
            <Overview row={row} first={first} onTab={setTab} />
          )}
          {tab === 'repertoire' && (
            <div data-ajuda="repertorio">
              <StudentRepertoire studentId={id} name={first} />
            </div>
          )}
          {tab === 'lessons' && <Lessons studentId={id} />}
          {tab === 'assignments' && (
            <Assignments studentId={id} first={first} active={active} />
          )}
          {tab === 'plan' && <Plan row={row} first={first} />}
        </>
      )}
    </>
  );
}

function LessonList({ lessons, empty }: { lessons: Lesson[]; empty: string }) {
  const { open } = usePortal();
  if (!lessons.length)
    return <p className="text-sm text-texto-fraco">{empty}</p>;
  return (
    <ul className="flex flex-col">
      {lessons.map((l) => (
        <Row
          as="li"
          key={l.id}
          clicavel
          onClick={() => open({ type: 'lesson', id: l.id })}
          className="border-b border-linha last:border-0"
          antes={
            <span className="t-dado w-24 text-sm text-texto-suave first-letter:uppercase">
              {when(dayOf(l.scheduledAt))}
            </span>
          }
          titulo={l.title}
          detalhe={`${timeRange(l.scheduledAt, l.duration)}${l.location ? ` · ${l.location}` : ''}`}
          depois={<LessonStatusLabel lesson={l} />}
        />
      ))}
    </ul>
  );
}

function Overview({
  row,
  first,
  onTab,
}: {
  row: StudentRow;
  first: string;
  onTab: (t: Tab) => void;
}) {
  const now = useMemo(() => new Date().toISOString(), []);
  const upcoming = useLessons({
    as: 'teacher',
    studentId: row.student.id,
    status: 'SCHEDULED',
    from: now,
    order: 'asc',
    limit: 4,
  });
  const last = useLessons({
    as: 'teacher',
    studentId: row.student.id,
    status: 'COMPLETED',
    order: 'desc',
    limit: 1,
  });
  const lastLesson = last.data?.items[0];

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <div className="flex flex-col gap-12">
        <Section title="Estudo" detail="Prática registrada pelo aluno">
          <StudentPractice studentId={row.student.id} compact />
        </Section>
        <Section
          title="Foco agora"
          action={
            <Button variante="texto" onClick={() => onTab('plan')}>
              Editar
            </Button>
          }
        >
          {row.currentFocus.length ? (
            <div className="flex flex-wrap gap-2">
              {row.currentFocus.map((f) => (
                <span
                  key={f}
                  className="rounded-full bg-sup-2 px-3 py-1.5 text-sm text-texto-suave"
                >
                  {f}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-texto-fraco">
              Nada anotado. O foco aparece na preparação de cada aula.
            </p>
          )}
        </Section>
      </div>
      <div className="flex flex-col gap-12">
        <Section title="Próximas aulas">
          {upcoming.isPending ? (
            <ScreenLoading rows={2} />
          ) : (
            <LessonList
              lessons={upcoming.data?.items ?? []}
              empty="Nenhuma aula marcada."
            />
          )}
        </Section>
        {lastLesson?.lessonSummary && (
          <Section
            title="Última aula"
            detail={`${when(dayOf(lastLesson.scheduledAt))} · ${lastLesson.title}`}
          >
            <p className="font-display text-lg leading-snug">
              &ldquo;{lastLesson.lessonSummary}&rdquo;
            </p>
            {lastLesson.nextLessonPrep && (
              <p className="t-legenda">
                Para a próxima: {lastLesson.nextLessonPrep}
              </p>
            )}
          </Section>
        )}
        <Section
          title="Repertório"
          action={
            <Button variante="texto" onClick={() => onTab('repertoire')}>
              Ver tudo
            </Button>
          }
        >
          <p className="text-sm text-texto-suave">
            O que {first} estuda, quer aprender e já aprendeu — e onde você
            sugere uma obra.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Lessons({ studentId }: { studentId: string }) {
  const now = useMemo(() => new Date().toISOString(), []);
  const next = useLessons({
    as: 'teacher',
    studentId,
    from: now,
    order: 'asc',
    limit: 20,
  });
  const past = useLessons({
    as: 'teacher',
    studentId,
    to: now,
    order: 'desc',
    limit: 30,
  });
  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <Section title="Próximas">
        {next.isPending ? (
          <ScreenLoading rows={2} />
        ) : (
          <LessonList
            lessons={next.data?.items ?? []}
            empty="Nenhuma aula marcada."
          />
        )}
      </Section>
      <Section
        title="Anteriores"
        detail={
          past.data ? `${past.data.pagination.total} no total` : undefined
        }
      >
        {past.isPending ? (
          <ScreenLoading rows={3} />
        ) : (
          <LessonList
            lessons={past.data?.items ?? []}
            empty="Nenhuma aula ainda."
          />
        )}
      </Section>
    </div>
  );
}

function Assignments({
  studentId,
  first,
  active,
}: {
  studentId: string;
  first: string;
  active: boolean;
}) {
  const { open } = usePortal();
  const list = useAssignments({
    as: 'teacher',
    studentId,
    order: 'desc',
    limit: 50,
  });
  if (list.isPending) return <ScreenLoading rows={3} />;
  const items = list.data?.assignments ?? [];
  if (!items.length)
    return (
      <Empty
        titulo={`Nenhuma tarefa para ${first}`}
        acao={
          active ? (
            <Button onClick={() => open({ type: 'new-assignment', studentId })}>
              Passar tarefa
            </Button>
          ) : undefined
        }
      />
    );
  return (
    <ul>
      {items.map((a) => {
        const state = assignmentState(a);
        const progress = a.isCompleted ? 100 : (a.progress ?? 0);
        return (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => open({ type: 'assignment', id: a.id })}
              className="group/tarefa flex w-full flex-col gap-3 border-b border-linha py-4 text-left"
            >
              <span className="flex items-baseline justify-between gap-4">
                <span className="font-display text-xl leading-tight group-hover/tarefa:text-ouro-texto">
                  {a.title}
                </span>
                <span className="t-legenda shrink-0">
                  {state === 'awaiting'
                    ? 'Esperando retorno'
                    : state === 'overdue'
                      ? 'Atrasada'
                      : state === 'done'
                        ? 'Concluída'
                        : a.dueDate
                          ? `Até ${when(dayOf(a.dueDate))}`
                          : 'Sem prazo'}
                </span>
              </span>
              <span className="flex items-center gap-3">
                <span className="t-legenda w-24 shrink-0">
                  {typeLabel(a.type)}
                </span>
                <ProgressBar
                  value={progress}
                  label={`Andamento de ${a.title}`}
                  className="flex-1"
                />
                <span className="t-dado w-10 text-right text-sm text-texto-suave">
                  {progress}%
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

const WEEKDAYS: Array<[string, string]> = [
  ['monday', 'seg'],
  ['tuesday', 'ter'],
  ['wednesday', 'qua'],
  ['thursday', 'qui'],
  ['friday', 'sex'],
  ['saturday', 'sáb'],
  ['sunday', 'dom'],
];

function Plan({ row, first }: { row: StudentRow; first: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    maxLessonsPerWeek: row.maxLessonsPerWeek ?? 1,
    lessonDuration: row.lessonDuration ?? 60,
    preferredDays: new Set(row.preferredDays),
    currentFocus: row.currentFocus.join(', '),
    learningPlan: row.learningPlan ?? '',
    nextGoals: row.nextGoals ?? '',
    teacherNotes: row.teacherNotes ?? '',
  });
  const [ending, setEnding] = useState(false);
  useEffect(() => setEnding(false), [row.relationshipId]);

  const save = usePortalMutation(
    () =>
      api.updateRelationship(row.relationshipId, {
        maxLessonsPerWeek: form.maxLessonsPerWeek,
        lessonDuration: form.lessonDuration,
        preferredDays: [...form.preferredDays],
        currentFocus: form.currentFocus
          .split(',')
          .map((f) => f.trim())
          .filter(Boolean),
        learningPlan: form.learningPlan.trim(),
        nextGoals: form.nextGoals.trim(),
        teacherNotes: form.teacherNotes.trim(),
      }),
    { success: 'Plano de estudos salvo.' }
  );
  const end = usePortalMutation(() => api.endRelationship(row.relationshipId), {
    success: `Vínculo com ${first} encerrado. O histórico ficou guardado.`,
    onSuccess: () => router.push('/teacher/students'),
  });

  if (!row.isActive)
    return (
      <dl className="flex max-w-2xl flex-col">
        {[
          [
            'Aulas',
            `${row.maxLessonsPerWeek ?? 1} por semana · ${duration(row.lessonDuration ?? 60)}`,
          ],
          ['Plano', row.learningPlan || '—'],
          ['Objetivos', row.nextGoals || '—'],
        ].map(([k, v]) => (
          <div
            key={k}
            className="grid grid-cols-[140px_minmax(0,1fr)] gap-4 border-b border-linha py-3"
          >
            <dt className="t-legenda pt-0.5">{k}</dt>
            <dd className="text-[0.9375rem] text-texto">{v}</dd>
          </div>
        ))}
      </dl>
    );

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Aulas por semana"
            type="number"
            min={1}
            max={7}
            value={form.maxLessonsPerWeek}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                maxLessonsPerWeek: Number(e.target.value),
              }))
            }
          />
          <Field
            label="Duração (min)"
            type="number"
            min={15}
            max={240}
            step={15}
            value={form.lessonDuration}
            onChange={(e) =>
              setForm((f) => ({ ...f, lessonDuration: Number(e.target.value) }))
            }
          />
        </div>
        <fieldset className="flex flex-col gap-2">
          <legend className="t-rotulo mb-2 font-medium text-texto">
            Dias que prefere
          </legend>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map(([k, label]) => (
              <Chip
                key={k}
                selecionado={form.preferredDays.has(k)}
                onClick={() =>
                  setForm((f) => {
                    const days = new Set(f.preferredDays);
                    if (days.has(k)) days.delete(k);
                    else days.add(k);
                    return { ...f, preferredDays: days };
                  })
                }
              >
                {label}
              </Chip>
            ))}
          </div>
        </fieldset>
        <Field
          label="Foco agora"
          ajuda="Separe por vírgula."
          value={form.currentFocus}
          onChange={(e) =>
            setForm((f) => ({ ...f, currentFocus: e.target.value }))
          }
        />
        <Field.Area
          label="Plano de estudos"
          rows={3}
          value={form.learningPlan}
          onChange={(e) =>
            setForm((f) => ({ ...f, learningPlan: e.target.value }))
          }
        />
        <Field.Area
          label="Próximos objetivos"
          rows={2}
          value={form.nextGoals}
          onChange={(e) =>
            setForm((f) => ({ ...f, nextGoals: e.target.value }))
          }
        />
        <Button
          variante="primario"
          className="self-start"
          carregando={save.isPending}
          onClick={() => save.mutate(undefined)}
        >
          Salvar plano
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        <Field.Area
          label="Nota só sua"
          ajuda={`${first} não vê, nem na exportação dos dados dele.`}
          rows={5}
          value={form.teacherNotes}
          onChange={(e) =>
            setForm((f) => ({ ...f, teacherNotes: e.target.value }))
          }
        />
        <div className="flex flex-col gap-2 rounded-card bg-sup-2 p-5">
          <span className="t-rotulo font-medium text-texto">
            Encerrar o vínculo
          </span>
          <p className="text-sm text-texto-suave">
            As aulas futuras são canceladas e a vaga do plano fica livre. Aulas,
            tarefas e relatórios ficam no histórico dos dois.
          </p>
          <Button
            variante="fantasma"
            className="self-start"
            onClick={() => setEnding(true)}
          >
            Encerrar vínculo
          </Button>
        </div>
      </div>
      <ConfirmModal
        isOpen={ending}
        onClose={() => setEnding(false)}
        onConfirm={() => end.mutate(undefined)}
        isLoading={end.isPending}
        type="warning"
        title={`Encerrar o vínculo com ${first}?`}
        message="As aulas futuras são canceladas e a vaga do plano fica livre. Aulas, tarefas e relatórios ficam no histórico dos dois."
        confirmText="Encerrar vínculo"
        cancelText="Voltar"
        acaoPerigosa
      />
    </div>
  );
}
