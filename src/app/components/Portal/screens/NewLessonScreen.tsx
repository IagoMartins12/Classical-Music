'use client';

// Nova aula — a criação completa, esboço A (04/10/2026), com o topo animado.
// Para quem (com o plano, a prática e a biblioteca do aluno), quando (o dia
// desenhado e a agenda conferindo de verdade), a série com cada data
// conferida, onde, o conteúdo, o repertório do acervo (compositor → obra →
// partitura da base; sem "edição" à parte) e a preparação.

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { PiCalendarPlus, PiCheck, PiTrash, PiWarning } from 'react-icons/pi';
import { Chip } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { CampoDeFichas } from '@/app/components/ui/CampoDeFichas';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import {
  useAvailability,
  useCalendar,
  usePortalMutation,
  usePractice,
  useRepertoire,
  useSchedulingSettings,
  useStudents,
} from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import type { StudentRow } from '@/app/requests/portal/api';
import {
  addDays,
  clock,
  dayOf,
  duration,
  firstName,
  longDate,
  minuteOfDay,
  shortDate,
  spokenTime,
  startOfDay,
  today,
  toInstant,
  weekday,
  when,
} from '../format';
import { WorkPicker, type PickedWork } from '../catalog/WorkPicker';
import { ScorePick } from '../catalog/ScorePick';
import {
  Avatar,
  Empty,
  FindingsList,
  PageHeader,
  PracticeWeek,
  ScreenLoading,
  SlotSuggestions,
  WorkCited,
} from '../pieces';
import { usePortal } from '../PortalProvider';
import { useScheduleCheck } from '../schedule/ScheduleCheckPanel';

type Repeat = 'NONE' | 'WEEKLY' | 'BIWEEKLY';
type Decision = 'skip' | 'move' | 'keep';
const PLACES = ['Estúdio', 'Online', 'Casa do aluno'];
const LEVEL: Record<string, string> = {
  BEGINNER: 'Iniciante',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
};
const DAY_NAME: Record<string, string> = {
  monday: 'segunda',
  tuesday: 'terça',
  wednesday: 'quarta',
  thursday: 'quinta',
  friday: 'sexta',
  saturday: 'sábado',
  sunday: 'domingo',
};

export function NewLessonScreen() {
  const params = useSearchParams();
  const students = useStudents({ inviteStatus: 'ACCEPTED', limit: 100 });
  if (students.isPending)
    return <ScreenLoading label="Preparando a criação de aula" />;
  const rows = students.data?.students ?? [];
  if (!rows.length)
    return (
      <>
        <PageHeader
          title="Nova aula"
          back={{ href: '/teacher/lessons', label: 'Aulas' }}
        />
        <Empty
          titulo="Nenhum aluno com convite aceito"
          descricao="A aula se marca com quem já aceitou o convite. Convide pela tela de Alunos."
        />
      </>
    );
  return (
    <Form
      rows={rows}
      initial={{
        student: params.get('student'),
        start: params.get('start'),
        duration: Number(params.get('duration')) || 0,
      }}
    />
  );
}

function Form({
  rows,
  initial,
}: {
  rows: StudentRow[];
  initial: { student: string | null; start: string | null; duration: number };
}) {
  const router = useRouter();
  const { open } = usePortal();
  const settings = useSchedulingSettings();
  const [studentId, setStudentId] = useState(
    initial.student && rows.some((r) => r.student.id === initial.student)
      ? initial.student
      : rows[0].student.id
  );
  const row = rows.find((r) => r.student.id === studentId) ?? rows[0];
  const name =
    [row.student.user.firstName, row.student.user.lastName]
      .filter(Boolean)
      .join(' ') ||
    row.student.user.email ||
    'Aluno';
  const first = firstName(name);

  const [day, setDay] = useState(
    initial.start ? dayOf(initial.start) : addDays(today(), 1)
  );
  const [time, setTime] = useState(
    initial.start ? clock(initial.start) : '16:00'
  );
  const [minutes, setMinutes] = useState(
    initial.duration || row.lessonDuration || 60
  );
  const [repeat, setRepeat] = useState<Repeat>('NONE');
  const [until, setUntil] = useState(addDays(today(), 56));
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [acknowledged, setAcknowledged] = useState(false);
  const [place, setPlace] = useState('Estúdio');
  const [placeDetail, setPlaceDetail] = useState('');
  const [title, setTitle] = useState('');
  const [objectives, setObjectives] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [techniques, setTechniques] = useState<string[]>([]);
  const [works, setWorks] = useState<PickedWork[]>([]);
  const [composers, setComposers] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [prep, setPrep] = useState('');
  const [privateNote, setPrivateNote] = useState('');
  const [task, setTask] = useState({ on: false, title: '', minutes: 20 });

  // A duração padrão: a do aluno, senão a do esquema de aulas.
  useEffect(() => {
    if (!initial.duration)
      setMinutes(
        row.lessonDuration ?? settings.data?.defaultLessonDuration ?? 60
      );
  }, [row.lessonDuration, settings.data, initial.duration]);
  useEffect(
    () => setObjectives(row.currentFocus.slice(0, 3)),
    [row.relationshipId, row.currentFocus]
  );

  const scheduledAt = toInstant(day, time);
  const draft = useMemo(
    () => ({
      studentId,
      scheduledAt,
      duration: minutes,
      location: place,
      isRecurring: repeat !== 'NONE',
      recurrenceType: repeat === 'NONE' ? undefined : repeat,
      recurrenceEnd: repeat === 'NONE' ? undefined : toInstant(until, '23:59'),
    }),
    [studentId, scheduledAt, minutes, place, repeat, until]
  );
  const check = useScheduleCheck(draft);
  useEffect(() => (setAcknowledged(false), setDecisions({})), [draft]);

  const occurrences = check.data?.occurrences ?? [];
  const isSeries = repeat !== 'NONE';
  const problems = occurrences.filter(
    (o) => o.severity === 'conflict' || o.severity === 'blocking'
  );
  const pending = isSeries
    ? problems.filter(
        (o) =>
          !decisions[o.scheduledAt] ||
          (o.severity === 'blocking' && decisions[o.scheduledAt] === 'keep')
      )
    : [];
  const kept =
    isSeries && problems.some((o) => decisions[o.scheduledAt] === 'keep');
  const scheduled = occurrences.filter(
    (o) => decisions[o.scheduledAt] !== 'skip'
  ).length;
  const single = occurrences[0];
  const blocked = !check.data
    ? true
    : isSeries
      ? pending.length > 0 || scheduled === 0
      : single?.severity === 'blocking' ||
        (single?.severity === 'conflict' && !acknowledged);

  const create = usePortalMutation(
    async () => {
      const created = await api.createLesson({
        studentId,
        title: title.trim() || (works[0] ? works[0].work.title : 'Aula'),
        scheduledAt,
        duration: minutes,
        location: placeDetail.trim()
          ? `${place} — ${placeDetail.trim()}`
          : place,
        objectives,
        topics,
        techniques,
        worksIds: works.map((w) => w.work.id),
        workScoreIds: works.flatMap((w) => (w.score ? [w.score.id] : [])),
        composerIds: [
          ...new Set([
            ...composers.map((c) => c.id),
            ...works.map((w) => w.work.composer.id),
          ]),
        ],
        publicNotes: prep.trim() || undefined,
        teacherNotes: privateNote.trim() || undefined,
        isRecurring: isSeries || undefined,
        recurrenceType: isSeries ? repeat : undefined,
        recurrenceEnd: isSeries ? toInstant(until, '23:59') : undefined,
        skipOccurrences: isSeries
          ? occurrences
              .filter((o) => decisions[o.scheduledAt] === 'skip')
              .map((o) => o.scheduledAt)
          : undefined,
        moveOccurrences: isSeries
          ? occurrences
              .filter(
                (o) => decisions[o.scheduledAt] === 'move' && o.suggestions[0]
              )
              .map((o) => ({ from: o.scheduledAt, to: o.suggestions[0] }))
          : undefined,
        force:
          (isSeries ? kept : single?.severity === 'conflict' && acknowledged) ||
          undefined,
      });
      if (task.on && task.title.trim().length >= 2 && created.lessons[0]) {
        const next = created.lessons[1]?.scheduledAt;
        await api.createAssignment({
          lessonId: created.lessons[0].id,
          title: task.title.trim(),
          description: task.title.trim(),
          dueDate: next ?? toInstant(addDays(day, 7), '23:59'),
          estimatedTime: task.minutes || undefined,
          worksIds: works.map((w) => w.work.id),
        });
      }
      return created;
    },
    {
      success: (r) =>
        `${r.created > 1 ? `${r.created} aulas marcadas` : 'Aula marcada'} com ${first}. ${first} recebeu o aviso.`,
      onSuccess: (r) =>
        router.push(
          r.lessons[0]
            ? `/teacher/lessons/${r.lessons[0].id}`
            : '/teacher/lessons'
        ),
    }
  );

  const pickWork = (p: PickedWork) =>
    setWorks((list) =>
      list.some((w) => w.work.id === p.work.id) ? list : [...list, p]
    );

  const verification = (
    <section
      data-ajuda="verificacao"
      className="flex flex-col gap-4 rounded-card bg-sup-2 p-5"
    >
      <h3 className="t-rotulo font-medium text-texto">A agenda confere</h3>
      {!check.data ? (
        <p className="text-sm text-texto-fraco">
          {check.isFetching
            ? 'Conferindo a agenda…'
            : 'Escolha o dia e a hora.'}
        </p>
      ) : isSeries ? (
        <p className="text-sm text-texto-suave">
          <span className="t-dado text-texto">{scheduled}</span>{' '}
          {scheduled === 1 ? 'aula' : 'aulas'} ·{' '}
          {problems.length
            ? `${problems.length} com conflito`
            : 'nenhuma com conflito'}
          {pending.length > 0 && (
            <span className="block text-atencao">
              Decida o que fazer com{' '}
              {pending.length === 1
                ? 'a que choca'
                : `as ${pending.length} que chocam`}
              .
            </span>
          )}
        </p>
      ) : (
        <>
          <FindingsList findings={single?.findings ?? []} />
          {single && single.severity !== 'ok' && (
            <SlotSuggestions
              slots={single.suggestions}
              onPick={(iso) => (setDay(dayOf(iso)), setTime(clock(iso)))}
            />
          )}
          {single?.severity === 'conflict' && (
            <label className="flex cursor-pointer items-start gap-3 border-t border-linha pt-4 text-sm text-texto-suave">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--ouro)]"
              />
              Entendi o conflito e quero marcar assim mesmo.
            </label>
          )}
        </>
      )}
    </section>
  );

  return (
    <>
      <PageHeader
        title="Nova aula"
        back={{ href: '/teacher/lessons', label: 'Aulas' }}
        description="Para marcar só aluno, dia e hora, a marcação rápida resolve. Aqui ficam a série, o repertório, a preparação e a tarefa."
      />

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col">
          <Part title="Para quem" help="aluno">
            <div className="flex flex-wrap gap-2">
              {rows.map((r) => {
                const n =
                  [r.student.user.firstName, r.student.user.lastName]
                    .filter(Boolean)
                    .join(' ') ||
                  r.student.user.email ||
                  '';
                const on = r.student.id === studentId;
                return (
                  <button
                    key={r.relationshipId}
                    type="button"
                    aria-pressed={on}
                    onClick={() => (
                      setStudentId(r.student.id),
                      setWorks([]),
                      setComposers([])
                    )}
                    className={cx(
                      'flex min-h-[var(--alvo)] items-center gap-2.5 rounded-full border py-1 pl-1 pr-4 text-[0.9375rem] transition-[border-color,color] duration-[var(--t-resposta)] ease-saida',
                      on
                        ? 'border-ouro/60 text-ouro-texto'
                        : 'border-linha-forte text-texto-suave hover:border-ouro/40'
                    )}
                  >
                    <Avatar name={n} image={r.student.user.image} size="p" />
                    {n}
                  </button>
                );
              })}
            </div>
            <div className="grid gap-4 rounded-card bg-sup-2 p-5 sm:grid-cols-[minmax(0,1fr)_200px]">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {[
                  [
                    'Nível',
                    (row.student.level && LEVEL[row.student.level]) || '—',
                  ],
                  [
                    'Plano',
                    `${row.maxLessonsPerWeek ?? 1} aula${(row.maxLessonsPerWeek ?? 1) > 1 ? 's' : ''} por semana`,
                  ],
                  [
                    'Prefere',
                    row.preferredDays.map((d) => DAY_NAME[d] ?? d).join(', ') ||
                      'sem preferência',
                  ],
                  [
                    'Foco agora',
                    row.currentFocus.slice(0, 2).join(', ') || '—',
                  ],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-0.5">
                    <dt className="t-legenda">{k}</dt>
                    <dd className="text-texto">{v}</dd>
                  </div>
                ))}
              </dl>
              <StudentWeek studentId={studentId} />
            </div>
          </Part>

          <Part title="Quando" help="quando">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field
                label="Dia"
                type="date"
                min={today()}
                value={day}
                onChange={(e) => setDay(e.target.value)}
              />
              <Field
                label="Começa"
                type="time"
                step={900}
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
              <div className="col-span-2 flex flex-col gap-2 sm:col-span-1">
                <span className="t-rotulo font-medium text-texto">Termina</span>
                <span className="t-dado flex min-h-[var(--alvo)] items-center text-texto-suave">
                  {clock(
                    new Date(new Date(scheduledAt).getTime() + minutes * 60_000)
                  )}
                </span>
              </div>
            </div>
            <Chips
              label="Duração"
              value={minutes}
              onChange={setMinutes}
              options={[...new Set([30, 45, 60, 90, 120, minutes])]
                .sort((a, b) => a - b)
                .map((m) => [
                  m,
                  m === (settings.data?.defaultLessonDuration ?? 60)
                    ? `${duration(m)} · padrão`
                    : duration(m),
                ])}
            />
            <DayDrawing
              day={day}
              start={scheduledAt}
              minutes={minutes}
              conflict={
                single?.severity === 'conflict' ||
                single?.severity === 'blocking'
              }
            />
            <div className="xl:hidden">{verification}</div>
          </Part>

          <Part title="Repetição" help="serie">
            <Chips
              label="Repetir"
              value={repeat}
              onChange={setRepeat}
              options={[
                ['NONE', 'Só esta'],
                ['WEEKLY', 'Toda semana'],
                ['BIWEEKLY', 'A cada duas semanas'],
              ]}
            />
            {isSeries && (
              <>
                <Field
                  label="Até"
                  type="date"
                  min={addDays(day, 7)}
                  max={addDays(day, 180)}
                  value={until}
                  onChange={(e) => setUntil(e.target.value)}
                  ajuda="Uma série vai até seis meses."
                  className="max-w-56"
                />
                {occurrences.length > 0 && (
                  <ol className="flex flex-col rounded-card bg-sup-2 px-4">
                    {occurrences.map((o) => {
                      const problem =
                        o.findings.find(
                          (f) =>
                            f.severity === 'conflict' ||
                            f.severity === 'blocking'
                        ) ?? o.findings.find((f) => f.severity === 'warning');
                      const decision = decisions[o.scheduledAt];
                      const bad =
                        o.severity === 'conflict' || o.severity === 'blocking';
                      const set = (d: Decision) =>
                        setDecisions((all) => ({ ...all, [o.scheduledAt]: d }));
                      return (
                        <li
                          key={o.scheduledAt}
                          className={cx(
                            'grid grid-cols-[96px_minmax(0,1fr)] items-start gap-x-4 gap-y-2 border-b border-linha py-3 last:border-0 sm:grid-cols-[110px_minmax(0,1fr)_auto]',
                            decision === 'skip' && 'opacity-50'
                          )}
                        >
                          <span className="t-dado pt-0.5 text-sm text-texto">
                            {shortDate(dayOf(o.scheduledAt))}
                          </span>
                          <span className="flex min-w-0 items-start gap-2 text-sm">
                            <Icon
                              de={bad ? PiWarning : PiCheck}
                              tamanho="p"
                              className={cx(
                                'mt-0.5 shrink-0',
                                bad
                                  ? 'text-atencao'
                                  : o.severity === 'warning'
                                    ? 'text-texto-fraco'
                                    : 'text-ouro-texto'
                              )}
                            />
                            <span className="flex flex-col">
                              <span
                                className={
                                  bad ? 'text-texto' : 'text-texto-suave'
                                }
                              >
                                {o.severity === 'ok'
                                  ? 'Livre'
                                  : problem?.message}
                              </span>
                              {decision === 'move' && o.suggestions[0] && (
                                <span className="t-legenda">
                                  Vai para {when(dayOf(o.suggestions[0]))},{' '}
                                  {spokenTime(o.suggestions[0])}
                                </span>
                              )}
                            </span>
                          </span>
                          {bad && (
                            <span className="col-span-2 flex flex-wrap gap-1.5 sm:col-span-1">
                              {o.suggestions[0] && (
                                <Chip
                                  selecionado={decision === 'move'}
                                  onClick={() => set('move')}
                                >
                                  Mover
                                </Chip>
                              )}
                              <Chip
                                selecionado={decision === 'skip'}
                                onClick={() => set('skip')}
                              >
                                Pular
                              </Chip>
                              {o.severity === 'conflict' && (
                                <Chip
                                  selecionado={decision === 'keep'}
                                  onClick={() => set('keep')}
                                >
                                  Manter
                                </Chip>
                              )}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                )}
                <p className="t-legenda">
                  Os dias em que você bloqueou a agenda já aparecem com
                  conflito. Pular uma data não mexe nas outras.
                </p>
              </>
            )}
          </Part>

          <Part title="Onde">
            <Chips
              label="Lugar"
              value={place}
              onChange={(p) => (setPlace(p), setPlaceDetail(''))}
              options={PLACES.map((p) => [p, p])}
            />
            {place === 'Online' && (
              <Field
                label="Link da chamada"
                value={placeDetail}
                maxLength={250}
                onChange={(e) => setPlaceDetail(e.target.value)}
                placeholder="https://meet.google.com/…"
                ajuda={`${first} vê o link na aula.`}
              />
            )}
            {place === 'Casa do aluno' && (
              <Field
                label="Endereço"
                value={placeDetail}
                maxLength={250}
                onChange={(e) => setPlaceDetail(e.target.value)}
                ajuda={
                  settings.data
                    ? `A agenda conta ${settings.data.travelMinutes} min para chegar quando a aula vizinha é em outro lugar.`
                    : undefined
                }
              />
            )}
          </Part>

          <Part title="Conteúdo">
            <Field
              label="Assunto"
              value={title}
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={works[0] ? works[0].work.title : 'Aula'}
            />
            <CampoDeFichas
              rotulo="Objetivos"
              valores={objectives}
              aoMudar={setObjectives}
              ajuda={`Enter ou vírgula para acrescentar. ${first} vê.`}
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <CampoDeFichas
                rotulo="Tópicos"
                valores={topics}
                aoMudar={setTopics}
              />
              <CampoDeFichas
                rotulo="Técnicas"
                valores={techniques}
                aoMudar={setTechniques}
              />
            </div>
          </Part>

          <Part title="Repertório" help="repertorio">
            <LibraryChips
              studentId={studentId}
              first={first}
              picked={works.map((w) => w.work.id)}
              onPick={pickWork}
            />
            <WorkPicker
              onPick={pickWork}
              onPickComposer={(c) =>
                setComposers((l) =>
                  l.some((x) => x.id === c.id) ? l : [...l, c]
                )
              }
              selectedIds={works.map((w) => w.work.id)}
            />
            {composers.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="t-legenda">Compositores da aula</span>
                {composers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() =>
                      setComposers((l) => l.filter((x) => x.id !== c.id))
                    }
                    aria-label={`Tirar ${c.name}`}
                    className="inline-flex min-h-9 items-center gap-2 rounded-full bg-sup-2 px-3.5 font-display text-[0.9375rem]"
                  >
                    {c.name}{' '}
                    <Icon
                      de={PiTrash}
                      tamanho="pp"
                      className="text-texto-fraco"
                    />
                  </button>
                ))}
              </div>
            )}
            {works.length === 0 ? (
              <p className="rounded-card border border-dashed border-linha-forte p-5 text-sm text-texto-fraco">
                Nenhuma obra ainda. Aula de técnica ou de escuta pode ficar só
                com o compositor — ou sem nada.
              </p>
            ) : (
              <ul className="flex flex-col">
                {works.map((w) => (
                  <li
                    key={w.work.id}
                    className="flex items-start justify-between gap-3 border-b border-linha py-4 last:border-0"
                  >
                    <span className="flex min-w-0 flex-1 flex-col gap-3">
                      <WorkCited work={w.work} />
                      <ScorePick
                        work={w.work}
                        score={w.score}
                        onChange={(score) =>
                          setWorks((l) =>
                            l.map((x) =>
                              x.work.id === w.work.id ? { ...x, score } : x
                            )
                          )
                        }
                      />
                    </span>
                    <Button
                      variante="fantasma"
                      icone={PiTrash}
                      rotulo={`Tirar ${w.work.title}`}
                      onClick={() =>
                        setWorks((l) =>
                          l.filter((x) => x.work.id !== w.work.id)
                        )
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </Part>

          <Part title="Preparação" last>
            <Field.Area
              label={`Para ${first} ler antes`}
              rows={2}
              value={prep}
              maxLength={5000}
              onChange={(e) => setPrep(e.target.value)}
              ajuda="Aparece na aula, no portal dele."
            />
            <div className="flex flex-col gap-4 rounded-card bg-sup-2 p-5">
              <label className="flex cursor-pointer items-center justify-between gap-4">
                <span className="flex flex-col">
                  <span className="t-rotulo font-medium text-texto">
                    Passar tarefa junto
                  </span>
                  <span className="t-legenda">
                    {isSeries
                      ? 'Com prazo até a aula seguinte da série.'
                      : 'Com prazo de uma semana depois da aula.'}
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={task.on}
                  onChange={(e) =>
                    setTask((t) => ({ ...t, on: e.target.checked }))
                  }
                  className="h-5 w-5 shrink-0 accent-[var(--ouro)]"
                />
              </label>
              {task.on && (
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_140px]">
                  <Field
                    label="Tarefa"
                    value={task.title}
                    maxLength={200}
                    onChange={(e) =>
                      setTask((t) => ({ ...t, title: e.target.value }))
                    }
                    placeholder={
                      works[0] ? `${works[0].work.title}, devagar` : undefined
                    }
                  />
                  <Field
                    label="Minutos por dia"
                    type="number"
                    min={5}
                    step={5}
                    value={task.minutes}
                    onChange={(e) =>
                      setTask((t) => ({
                        ...t,
                        minutes: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              )}
            </div>
            <Field.Area
              label="Nota só sua"
              rows={2}
              value={privateNote}
              maxLength={5000}
              onChange={(e) => setPrivateNote(e.target.value)}
              ajuda="Não aparece para o aluno nem na exportação dos dados dele."
            />
            <p className="t-legenda">
              {first} recebe o aviso no portal e pelos canais que aceita. Os
              lembretes seguem o seu{' '}
              <button
                type="button"
                className="underline decoration-ouro/50 underline-offset-2 hover:text-texto"
                onClick={() => open({ type: 'availability' })}
              >
                horário de atendimento
              </button>
              .
            </p>
          </Part>
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-20 flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <span className="font-display text-2xl leading-tight">
                {title || works[0]?.work.title || 'Aula'}
              </span>
              <span className="text-sm text-texto-suave first-letter:uppercase">
                {name} · {longDate(day)}, {time}–
                {clock(
                  new Date(new Date(scheduledAt).getTime() + minutes * 60_000)
                )}{' '}
                · {place}
              </span>
              {isSeries && (
                <span className="t-legenda">
                  {repeat === 'WEEKLY' ? 'Toda semana' : 'A cada duas semanas'}{' '}
                  até {shortDate(until)} · {scheduled} aulas
                </span>
              )}
            </div>
            {verification}
            <div data-ajuda="acao" className="flex flex-col gap-2">
              <Button
                variante="primario"
                icone={PiCalendarPlus}
                disabled={blocked}
                carregando={create.isPending}
                onClick={() => create.mutate(undefined)}
                className="w-full"
              >
                {isSeries ? `Marcar ${scheduled} aulas` : 'Marcar aula'}
              </Button>
              {blocked && check.data && (
                <span className="t-legenda text-center">
                  Resolva o que a agenda apontou para marcar.
                </span>
              )}
            </div>
          </div>
        </aside>
      </div>

      <div className="sticky bottom-4 z-elevado mt-8 xl:hidden">
        <div className="sup-alta flex items-center justify-between gap-3 p-3">
          <span className="text-sm text-texto-suave">
            {!check.data
              ? 'Conferindo a agenda…'
              : blocked
                ? single?.severity === 'blocking'
                  ? 'Horário no passado'
                  : 'Há conflito para decidir'
                : `${scheduled} aula${scheduled > 1 ? 's' : ''} com ${first}`}
          </span>
          <Button
            variante="primario"
            icone={PiCalendarPlus}
            disabled={blocked}
            carregando={create.isPending}
            onClick={() => create.mutate(undefined)}
          >
            Marcar
          </Button>
        </div>
      </div>
    </>
  );
}

function Part({
  title,
  help,
  last = false,
  children,
}: {
  title: string;
  help?: string;
  last?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      data-ajuda={help}
      className={cx(
        'grid gap-6 py-10 first:pt-0 lg:grid-cols-[160px_minmax(0,1fr)]',
        !last && 'border-b border-linha'
      )}
    >
      <h2 className="font-display text-[1.5rem] leading-tight">{title}</h2>
      <div className="flex min-w-0 flex-col gap-5">{children}</div>
    </section>
  );
}

function Chips<T extends string | number>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: Array<[T, string]>;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="t-rotulo mb-2 font-medium text-texto">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([v, text]) => (
          <Chip
            key={String(v)}
            selecionado={v === value}
            onClick={() => onChange(v)}
          >
            {text}
          </Chip>
        ))}
      </div>
    </fieldset>
  );
}

/** A prática da semana do aluno escolhido. */
function StudentWeek({ studentId }: { studentId: string }) {
  const from = useMemo(() => addDays(today(), -6), []);
  const { data } = usePractice({ studentId, from });
  return (
    <div className="flex flex-col gap-2">
      <span className="t-legenda">
        Prática, 7 dias{data ? ` · ${duration(data.totalMinutes)}` : ''}
      </span>
      <PracticeWeek
        days={data?.days ?? []}
        goal={data?.weeklyGoalMinutes ?? null}
        height={48}
      />
    </div>
  );
}

/** As obras da biblioteca do aluno, para trazer com um toque. */
function LibraryChips({
  studentId,
  first,
  picked,
  onPick,
}: {
  studentId: string;
  first: string;
  picked: string[];
  onPick: (p: PickedWork) => void;
}) {
  const repertoire = useRepertoire(studentId);
  const r = repertoire.data;
  if (!r) return null;
  const items = [
    ...r.studying.map((s) => ({
      work: s.work,
      label: 'estudando',
      score: null as PickedWork['score'],
    })),
    ...r.wantToLearn.map((w) => ({
      work: w.work,
      label: 'quer aprender',
      score: w.score
        ? {
            id: w.score.id,
            title: w.score.title,
            source: w.score.source as 'IMSLP',
          }
        : null,
    })),
  ].filter(
    (i, k, all) =>
      i.work.composer && all.findIndex((x) => x.work.id === i.work.id) === k
  );
  if (!items.length) return null;
  return (
    <div className="flex flex-col gap-2">
      <span className="t-legenda">Da biblioteca de {first}</span>
      <div className="flex flex-wrap gap-2">
        {items.map((i) => {
          const on = picked.includes(i.work.id);
          return (
            <button
              key={i.work.id}
              type="button"
              aria-pressed={on}
              disabled={on}
              onClick={() =>
                onPick({
                  work: {
                    id: i.work.id,
                    title: i.work.title,
                    composer: i.work.composer!,
                  },
                  score: i.score,
                })
              }
              className={cx(
                'inline-flex min-h-9 items-center gap-2 rounded-full border px-3.5 text-sm transition-[border-color,color] duration-[var(--t-resposta)] [@media(pointer:coarse)]:min-h-[var(--alvo)]',
                on
                  ? 'border-ouro/50 text-ouro-texto'
                  : 'border-linha-forte text-texto-suave hover:border-ouro/40'
              )}
            >
              <span className="font-display text-[0.9375rem]">
                {i.work.title}
              </span>
              <span className="text-xs opacity-70">{i.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * O dia escolhido, desenhado: o atendimento (o resto riscado), as aulas que
 * já existem nele e a nova, onde ela cai.
 */
function DayDrawing({
  day,
  start,
  minutes,
  conflict,
}: {
  day: string;
  start: string;
  minutes: number;
  conflict: boolean;
}) {
  const from = 8 * 60;
  const to = 21 * 60;
  const x = (m: number) =>
    Math.max(0, Math.min(100, ((m - from) / (to - from)) * 100));
  const range = useMemo(
    () => ({
      as: 'teacher' as const,
      from: startOfDay(day).toISOString(),
      to: startOfDay(addDays(day, 1)).toISOString(),
    }),
    [day]
  );
  const calendar = useCalendar(range);
  const availability = useAvailability();
  const lessons = (calendar.data?.events ?? []).filter(
    (e) => e.type === 'lesson' && e.status !== 'CANCELLED'
  );
  const windows = (availability.data?.slots ?? []).filter(
    (s) => s.weekday === weekday(day)
  );
  const hasSchedule = (availability.data?.slots.length ?? 0) > 0;
  const begin = minuteOfDay(start);

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="t-legenda first-letter:uppercase">
        {longDate(day)} · {lessons.length} aula{lessons.length === 1 ? '' : 's'}{' '}
        sua{lessons.length === 1 ? '' : 's'}
        {hasSchedule && !windows.length ? ' · você não atende neste dia' : ''}
      </figcaption>
      <div
        className={cx(
          'relative h-20 overflow-hidden rounded-controle',
          hasSchedule ? 'portal-hachura' : 'bg-sup-2'
        )}
      >
        {windows.map((w) => {
          const a =
            Number(w.startTime.slice(0, 2)) * 60 + Number(w.startTime.slice(3));
          const b =
            Number(w.endTime.slice(0, 2)) * 60 + Number(w.endTime.slice(3));
          return (
            <span
              key={w.startTime}
              aria-hidden="true"
              className="absolute inset-y-0 bg-fundo"
              style={{ left: `${x(a)}%`, width: `${x(b) - x(a)}%` }}
            />
          );
        })}
        {lessons.map((e) => {
          const a = minuteOfDay(e.start);
          const len = e.lesson?.duration ?? 60;
          return (
            <span
              key={e.id}
              title={`${clock(e.start)} ${e.counterpart.name}`}
              className="absolute top-2 flex h-7 items-center overflow-hidden rounded-[6px] bg-sup-2 px-1.5 text-[0.6875rem] text-texto-suave ring-1 ring-linha-forte"
              style={{ left: `${x(a)}%`, width: `${x(a + len) - x(a)}%` }}
            >
              <span className="truncate">{firstName(e.counterpart.name)}</span>
            </span>
          );
        })}
        <span
          className={cx(
            'absolute bottom-2 flex h-7 items-center overflow-hidden rounded-[6px] px-1.5 text-[0.6875rem] font-medium transition-[left,width] duration-[var(--t-entrada)] ease-saida',
            conflict
              ? 'border border-dashed border-atencao bg-fundo text-atencao'
              : 'fill-ouro text-sobre-ouro'
          )}
          style={{
            left: `${x(begin)}%`,
            width: `${Math.max(x(begin + minutes) - x(begin), 3)}%`,
          }}
        >
          <span className="truncate">Nova</span>
        </span>
      </div>
      <div className="relative h-4" aria-hidden="true">
        {[9, 12, 15, 18, 21].map((h) => (
          <span
            key={h}
            className="t-dado absolute -translate-x-1/2 text-[0.6875rem] text-texto-fraco"
            style={{ left: `${x(h * 60)}%` }}
          >
            {h}h
          </span>
        ))}
      </div>
    </figure>
  );
}
