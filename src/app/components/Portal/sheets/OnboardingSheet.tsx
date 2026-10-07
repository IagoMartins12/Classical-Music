'use client';

// As boas-vindas da primeira visita a cada papel (a marca é do servidor:
// `POST /dashboard/onboarding`).
// Professor (refeitas em 05/10, a pedido do dono — estavam rasas): o que o
// portal faz por ele, como são as aulas (com uma tarde desenhada), quando
// atende (modelos e a faixa de cada dia), pedidos e lembretes — tudo salvo de
// verdade — e o resumo. Aluno: o que cada tela faz e o seu estudo.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  PiBell,
  PiCalendarCheck,
  PiChartLineUp,
  PiShieldCheck,
  PiUsers,
} from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Chip } from '@/app/components/ui/Badge';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import {
  portalKeys,
  useAvailability,
  usePortalMutation,
  useSchedulingSettings,
} from '@/app/hooks/portal/query';
import { useSession } from '@/app/libs/session';
import * as api from '@/app/requests/portal/api';
import { duration } from '../format';
import { TOUR_EVENT } from '../help/HelpButton';
import { SCREENS, type ScreenId } from '../navigation';
import { Options } from '../pieces';
import type { SheetProps } from '../PortalProvider';
import {
  WeekHoursEditor,
  weekMinutes,
  type WeekHours,
} from '../schedule/WeekHoursEditor';

const WHAT: Record<ScreenId, string> = {
  dashboard: 'O que pede você hoje: a próxima aula e o que está esperando.',
  calendar: 'Aulas, horas livres e bloqueios, por semana ou mês.',
  lessons: 'Marcar, remarcar, cancelar e fechar aulas.',
  assignments: 'O que estudar entre as aulas, com entrega e retorno.',
  students: 'Cada aluno: prática, repertório, plano de estudos.',
  study: 'Sua prática e o que você quer aprender ou já aprendeu.',
  reports: 'O progresso do período, com conversa.',
  history: 'Tudo o que aconteceu no portal.',
  notifications: 'O que chegou para você.',
  profile: 'Como você aparece e como quer ser avisado.',
};

const PILLARS: Array<{ icon: typeof PiUsers; title: string; text: string }> = [
  {
    icon: PiShieldCheck,
    title: 'Uma agenda que confere por você',
    text: 'Cada aula marcada é conferida contra as suas outras aulas, as do aluno em outras turmas, seus bloqueios, a folga e o deslocamento — e o portal sugere horários livres.',
  },
  {
    icon: PiUsers,
    title: 'Alunos que estudam entre as aulas',
    text: 'Tarefas com entrega e retorno, o diário de prática deles e o repertório que querem aprender, à mão antes de cada aula.',
  },
  {
    icon: PiChartLineUp,
    title: 'Relatórios que se montam sozinhos',
    text: 'Presença, tarefas e evolução do período saem dos dados das aulas. Você escreve a mensagem e decide quem vê.',
  },
  {
    icon: PiCalendarCheck,
    title: 'No seu celular',
    text: 'Assine a agenda no calendário do celular e receba os avisos por e-mail, com horário de silêncio.',
  },
];

const BUFFERS = [0, 10, 15, 20, 30, 45, 60];
const TRAVELS = [0, 15, 20, 30, 40, 60, 90];
const LEADS = [2, 6, 12, 24, 48];
const HORIZONS = [14, 30, 45, 60, 90];

function Step({ children }: { children: ReactNode }) {
  return <div className="portal-passo flex flex-col gap-6">{children}</div>;
}

/** Uma tarde (14h–20h) com as aulas e as folgas desenhadas. */
function AfternoonDrawing({
  length,
  buffer,
}: {
  length: number;
  buffer: number;
}) {
  const span = 6 * 60;
  const blocks: Array<{ start: number; kind: 'lesson' | 'gap' }> = [];
  for (let t = 0; t + length <= span; t += length + buffer) {
    blocks.push({ start: t, kind: 'lesson' });
    if (buffer && t + length + buffer <= span)
      blocks.push({ start: t + length, kind: 'gap' });
  }
  const lessons = blocks.filter((b) => b.kind === 'lesson').length;
  return (
    <figure className="flex flex-col gap-2 rounded-card bg-sup-2 p-4">
      <figcaption className="text-sm text-texto-suave">
        Numa tarde das 14h às 20h cabem{' '}
        <span className="t-dado text-texto">{lessons}</span>{' '}
        {lessons === 1 ? 'aula' : 'aulas'} de {duration(length)}
        {buffer
          ? `, com ${buffer} min de folga entre elas`
          : ', uma colada na outra'}
        .
      </figcaption>
      <div
        aria-hidden="true"
        className="relative h-9 overflow-hidden rounded-controle bg-fundo"
      >
        {blocks.map((b) => (
          <span
            key={`${b.kind}-${b.start}`}
            className={cx(
              'absolute inset-y-1 rounded-[6px] transition-[left,width] duration-[var(--t-entrada)] ease-saida',
              b.kind === 'lesson' ? 'fill-ouro' : 'portal-hachura'
            )}
            style={{
              left: `${(b.start / span) * 100}%`,
              width: `${((b.kind === 'lesson' ? length : buffer) / span) * 100}%`,
            }}
          />
        ))}
      </div>
      <div
        aria-hidden="true"
        className="flex justify-between text-[0.6875rem] text-texto-fraco"
      >
        <span>14h</span>
        <span>17h</span>
        <span>20h</span>
      </div>
    </figure>
  );
}

export default function OnboardingSheet({ role, onClose, open }: SheetProps) {
  const { data: session } = useSession();
  const name = session?.user?.firstName ?? '';
  const teacher = role === 'teacher';
  const titles = teacher
    ? [
        `Bem-vindo ao portal${name ? `, ${name}` : ''}`,
        'Como são suas aulas',
        'Quando você atende',
        'Pedidos de aula e lembretes',
        'Tudo pronto',
      ]
    : [
        `Bem-vindo ao portal${name ? `, ${name}` : ''}`,
        'Seu estudo',
        'Tudo pronto',
      ];
  const total = titles.length;
  const lastConfig = total - 2;
  const [step, setStep] = useState(0);
  const settings = useSchedulingSettings(teacher);
  const availability = useAvailability(teacher);

  // Professor
  const [length, setLength] = useState(60);
  const [buffer, setBuffer] = useState(15);
  const [travel, setTravel] = useState(40);
  const [accepts, setAccepts] = useState(true);
  const [lead, setLead] = useState(12);
  const [horizon, setHorizon] = useState(45);
  const [reminders, setReminders] = useState<number[]>([1440, 30]);
  const [days, setDays] = useState<WeekHours>(() =>
    Object.fromEntries(
      [0, 1, 2, 3, 4, 5, 6].map((d) => [
        d,
        { on: d >= 1 && d <= 5, from: '14:00', to: '20:00' },
      ])
    )
  );
  // Quem já declarou atendimento parte dele; a agenda só é regravada se a
  // pessoa mexer nos dias aqui (a folha não tem os intervalos do meio).
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    const slots = availability.data?.slots ?? [];
    if (!slots.length) return;
    setDays(
      Object.fromEntries(
        [0, 1, 2, 3, 4, 5, 6].map((d) => {
          const own = slots
            .filter((x) => x.weekday === d)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
          return [
            d,
            {
              on: own.length > 0,
              from: own[0]?.startTime ?? '14:00',
              to: own[own.length - 1]?.endTime ?? '20:00',
            },
          ];
        })
      )
    );
  }, [availability.data]);
  useEffect(() => {
    const s = settings.data;
    if (!s) return;
    setLength(s.defaultLessonDuration);
    setBuffer(s.bufferMinutes);
    setTravel(s.travelMinutes);
    setAccepts(s.acceptsLessonRequests);
    setLead(s.requestLeadHours);
    setHorizon(s.requestHorizonDays);
    if (s.lessonReminderMinutes.length) setReminders(s.lessonReminderMinutes);
  }, [settings.data]);

  // Aluno
  const [instrument, setInstrument] = useState('');
  const [level, setLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>(
    'BEGINNER'
  );
  const [goal, setGoal] = useState(240);

  // A primeira visita fica marcada mesmo se a pessoa fechar sem terminar.
  const marked = useRef(false);
  const mark = () => {
    if (marked.current) return;
    marked.current = true;
    void api.finishOnboarding(role).catch(() => undefined);
  };
  const close = () => (mark(), onClose());

  const weekly = weekMinutes(days);
  const invalidDays = Object.values(days).some((d) => d.on && d.to <= d.from);

  const save = usePortalMutation(
    async () => {
      if (teacher) {
        await api.updateSchedulingSettings({
          defaultLessonDuration: length,
          bufferMinutes: buffer,
          travelMinutes: travel,
          acceptsLessonRequests: accepts,
          requestLeadHours: lead,
          requestHorizonDays: horizon,
          lessonReminderMinutes: reminders,
        });
        const slots = Object.entries(days)
          .filter(([, d]) => d.on && d.to > d.from)
          .map(([weekday, d]) => ({
            weekday: Number(weekday),
            startTime: d.from,
            endTime: d.to,
          }));
        if (touched || !(availability.data?.slots.length ?? 0))
          await api.replaceAvailability({ slots });
      } else {
        await api.updatePortalProfile({
          student: { mainInstrument: instrument.trim() || null, level },
        });
        await api.setPracticeGoal(goal);
      }
      mark();
    },
    {
      success: 'Pronto: o portal está do seu jeito.',
      invalidate: [
        portalKeys.settings,
        portalKeys.availability,
        portalKeys.profile,
        ['portal', 'dashboard'],
        ['portal', 'practice'],
        ['portal', 'calendar'],
      ],
      onSuccess: () => setStep(total - 1),
    }
  );

  const footer =
    step === 0 ? (
      <>
        <Button variante="fantasma" onClick={close}>
          Explorar sozinho
        </Button>
        <Button variante="primario" onClick={() => setStep(1)}>
          {teacher ? 'Configurar minhas aulas' : 'Começar'}
        </Button>
      </>
    ) : step < total - 1 ? (
      <>
        <Button variante="fantasma" onClick={() => setStep((s) => s - 1)}>
          Voltar
        </Button>
        {step === lastConfig ? (
          <Button
            variante="primario"
            disabled={invalidDays}
            carregando={save.isPending}
            onClick={() => save.mutate(undefined)}
          >
            Salvar e continuar
          </Button>
        ) : (
          <Button
            variante="primario"
            disabled={step === 2 && teacher && invalidDays}
            onClick={() => setStep((s) => s + 1)}
          >
            Continuar
          </Button>
        )}
      </>
    ) : (
      <>
        <Button
          variante="fantasma"
          onClick={() => (
            close(),
            setTimeout(
              () => window.dispatchEvent(new CustomEvent(TOUR_EVENT)),
              360
            )
          )}
        >
          Fazer o tour desta tela
        </Button>
        <Button
          variante="primario"
          onClick={() => (
            close(),
            setTimeout(
              () => open(teacher ? { type: 'invite' } : { type: 'practice' }),
              360
            )
          )}
        >
          {teacher
            ? 'Convidar o primeiro aluno'
            : 'Registrar a primeira prática'}
        </Button>
      </>
    );

  return (
    <Sheet
      aberto
      aoFechar={close}
      titulo={titles[step]}
      largura="g"
      rodape={footer}
    >
      <div className="flex flex-col gap-8">
        <div
          className="flex items-center gap-3"
          aria-label={`Passo ${step + 1} de ${total}`}
        >
          <div className="flex flex-1 gap-1" aria-hidden="true">
            {titles.map((t, i) => (
              <span
                key={t}
                className={cx(
                  'h-1 flex-1 rounded-full transition-colors duration-[var(--t-entrada)]',
                  i <= step ? 'bg-ouro' : 'bg-linha'
                )}
              />
            ))}
          </div>
          <span className="t-dado text-xs text-texto-fraco">
            {step + 1}/{total}
          </span>
        </div>

        {step === 0 && teacher && (
          <Step key="t0">
            <p className="max-w-[58ch] font-display text-xl leading-snug text-texto-suave">
              Aqui você organiza aulas, alunos e o estudo deles entre uma aula e
              outra. Em dois minutos o portal fica do seu jeito: quanto dura sua
              aula, quando você atende e como os alunos podem pedir aula.
            </p>
            <ul className="grid gap-5 sm:grid-cols-2">
              {PILLARS.map((p) => (
                <li
                  key={p.title}
                  className="flex gap-3 rounded-card bg-sup-2 p-4"
                >
                  <Icon
                    de={p.icon}
                    tamanho="m"
                    className="mt-0.5 shrink-0 text-ouro-texto"
                  />
                  <span className="flex flex-col gap-1">
                    <span className="font-medium">{p.title}</span>
                    <span className="text-sm text-texto-suave">{p.text}</span>
                  </span>
                </li>
              ))}
            </ul>
            <details className="group/telas">
              <summary className="cursor-pointer text-sm font-medium text-ouro-texto">
                O que tem em cada tela
              </summary>
              <ul className="grid gap-x-8 gap-y-3 pt-4 sm:grid-cols-2">
                {SCREENS.teacher.map((s) => (
                  <li key={s.id} className="flex gap-3">
                    <Icon
                      de={s.icon}
                      tamanho="p"
                      className="mt-0.5 shrink-0 text-texto-fraco"
                    />
                    <span className="flex flex-col">
                      <span className="text-[0.9375rem] font-medium">
                        {s.label}
                      </span>
                      <span className="t-legenda">{WHAT[s.id]}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          </Step>
        )}

        {step === 0 && !teacher && (
          <Step key="s0">
            <p className="max-w-[56ch] font-display text-xl leading-snug text-texto-suave">
              Aqui ficam suas aulas, tarefas e o seu estudo. Em um minuto o
              portal fica do seu jeito.
            </p>
            <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {SCREENS.student.map((s) => (
                <li key={s.id} className="flex gap-3">
                  <Icon
                    de={s.icon}
                    tamanho="m"
                    className="mt-0.5 shrink-0 text-ouro-texto"
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="font-medium">{s.label}</span>
                    <span className="t-legenda">{WHAT[s.id]}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="t-legenda">
              Em toda tela, o botão de ajuda mostra o que cada parte faz.
            </p>
          </Step>
        )}

        {teacher && step === 1 && (
          <Step key="t1">
            <p className="text-[0.9375rem] text-texto-suave">
              É o padrão de toda aula nova e a régua da verificação de
              conflitos. Dá para mudar aula a aula.
            </p>
            <Options
              label="Duração de uma aula"
              value={length}
              onChange={setLength}
              options={[30, 45, 50, 60, 90, 120].map((m) => ({
                value: m,
                label: duration(m),
              }))}
            />
            <Options
              label="Folga entre uma aula e outra"
              value={buffer}
              onChange={setBuffer}
              options={BUFFERS.map((m) => ({
                value: m,
                label: m ? `${m} min` : 'Nenhuma',
              }))}
            />
            <AfternoonDrawing length={length} buffer={buffer} />
            <Options
              label="Tempo para mudar de lugar"
              value={travel}
              onChange={setTravel}
              options={TRAVELS.map((m) => ({
                value: m,
                label: m ? duration(m) : 'Não dou aula fora',
              }))}
            />
            <p className="t-legenda -mt-3">
              Conta só entre lugares físicos diferentes (estúdio e casa do
              aluno, por exemplo). Aula online não tem deslocamento.
            </p>
          </Step>
        )}

        {teacher && step === 2 && (
          <Step key="t2">
            <p className="text-[0.9375rem] text-texto-suave">
              Os alunos veem as horas livres e pedem aula nelas. Férias e
              feriados você bloqueia depois, no calendário. A agenda informa,
              não impede: você continua podendo marcar fora dela.
            </p>
            <WeekHoursEditor
              days={days}
              onChange={(d) => (setTouched(true), setDays(d))}
            />
          </Step>
        )}

        {teacher && step === 3 && (
          <Step key="t3">
            <label className="flex cursor-pointer items-start gap-3 rounded-card bg-sup-2 p-4 text-[0.9375rem]">
              <input
                type="checkbox"
                checked={accepts}
                onChange={(e) => setAccepts(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--ouro)]"
              />
              <span className="flex flex-col gap-1">
                <span className="font-medium text-texto">
                  Os alunos podem pedir aula nos meus horários livres
                </span>
                <span className="text-sm text-texto-suave">
                  Nada fica marcado até você aceitar. Você recebe o pedido no
                  painel e no sino.
                </span>
              </span>
            </label>
            {accepts && (
              <>
                <Options
                  label="Com quanta antecedência"
                  value={lead}
                  onChange={setLead}
                  options={LEADS.map((h) => ({
                    value: h,
                    label: `${h} h antes`,
                  }))}
                />
                <Options
                  label="Até quantos dias à frente"
                  value={horizon}
                  onChange={setHorizon}
                  options={HORIZONS.map((d) => ({
                    value: d,
                    label: `${d} dias`,
                  }))}
                />
              </>
            )}
            <fieldset className="flex flex-col gap-2">
              <legend className="t-rotulo mb-2 flex items-center gap-2 font-medium text-texto">
                <Icon de={PiBell} tamanho="p" className="text-texto-fraco" />{' '}
                Lembretes de aula, para você e para o aluno
              </legend>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    [1440, 'Na véspera'],
                    [30, '30 minutos antes'],
                  ] as Array<[number, string]>
                ).map(([m, label]) => {
                  const on = reminders.includes(m);
                  return (
                    <Chip
                      key={m}
                      selecionado={on}
                      onClick={() =>
                        setReminders((r) =>
                          on
                            ? r.length > 1
                              ? r.filter((x) => x !== m)
                              : r
                            : [...r, m]
                        )
                      }
                    >
                      {label}
                    </Chip>
                  );
                })}
              </div>
              <p className="t-legenda">
                No portal e pelos canais que cada um aceita. Tudo isso muda
                depois, no Perfil do portal.
              </p>
            </fieldset>
          </Step>
        )}

        {!teacher && step === 1 && (
          <Step key="s1">
            <Field
              label="Instrumento"
              value={instrument}
              maxLength={100}
              onChange={(e) => setInstrument(e.target.value)}
              placeholder="Piano"
            />
            <Options
              label="Nível"
              value={level}
              onChange={setLevel}
              options={[
                { value: 'BEGINNER', label: 'Iniciante' },
                { value: 'INTERMEDIATE', label: 'Intermediário' },
                { value: 'ADVANCED', label: 'Avançado' },
              ]}
            />
            <Options
              label="Meta de prática por semana"
              value={goal}
              onChange={setGoal}
              options={[120, 240, 360, 600].map((m) => ({
                value: m,
                label: duration(m),
              }))}
            />
          </Step>
        )}

        {step === total - 1 && (
          <Step key="end">
            {teacher ? (
              <dl className="grid gap-4 rounded-card bg-sup-2 p-5 sm:grid-cols-2">
                {[
                  [
                    'Aulas',
                    `${duration(length)}, ${buffer ? `${buffer} min de folga` : 'sem folga'}`,
                  ],
                  [
                    'Atendimento',
                    weekly
                      ? `${duration(weekly)} por semana`
                      : 'sem horário declarado',
                  ],
                  [
                    'Pedidos de aula',
                    accepts
                      ? `com ${lead} h de antecedência, até ${horizon} dias`
                      : 'desligados',
                  ],
                  [
                    'Lembretes',
                    reminders
                      .map((m) => (m >= 720 ? 'na véspera' : `${m} min antes`))
                      .join(' e '),
                  ],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-0.5">
                    <dt className="t-legenda">{k}</dt>
                    <dd className="text-[0.9375rem] text-texto">{v}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="font-display text-xl leading-snug text-texto-suave">
                Meta de {duration(goal)} por semana
                {instrument ? `, ${instrument.toLowerCase()}` : ''}.
              </p>
            )}
            <p className="text-[0.9375rem] text-texto-suave">
              {teacher
                ? 'Toda aula que você marcar passa por essa régua: o portal avisa choque de horário, folga curta, deslocamento, limites e a outra agenda do aluno — e sugere horários livres. O próximo passo é convidar um aluno.'
                : 'Tudo isso muda quando quiser, no Perfil do portal.'}
            </p>
          </Step>
        )}
      </div>
    </Sheet>
  );
}
