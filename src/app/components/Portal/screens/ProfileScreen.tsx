'use client';

// O perfil do portal — esboço B (04/10/2026). Professor: como os alunos o
// veem, o esquema de aulas (a régua da verificação de conflitos e dos
// lembretes), por onde é avisado e o calendário. Aluno: o estudo (nível,
// instrumento, meta de prática, o que os professores veem), por onde é
// avisado e as turmas. A conta (nome, foto, senha) mora no perfil do site.

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PiArrowSquareOut, PiCalendarCheck, PiClock } from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Chip } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { CampoDeFichas } from '@/app/components/ui/CampoDeFichas';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import {
  errorText,
  portalKeys,
  useMyClasses,
  useNotificationPreferences,
  usePortalMutation,
  usePortalProfile,
  usePractice,
  useSchedulingSettings,
} from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import type {
  NotificationPreferences,
  Role,
  SchedulingSettings,
} from '@/app/requests/portal/api';
import { dayOf, duration, firstName, shortDateYear } from '../format';
import {
  Avatar,
  Options,
  PageHeader,
  ScreenError,
  ScreenLoading,
  Section,
} from '../pieces';
import { usePortal } from '../PortalProvider';

export function ProfileScreen({ role }: { role: Role }) {
  const { open } = usePortal();
  return (
    <>
      <PageHeader
        title="Perfil do portal"
        description={
          role === 'teacher'
            ? 'Como os alunos te veem, o seu esquema de aulas e por onde você é avisado.'
            : 'O seu estudo, por onde você é avisado e as suas turmas.'
        }
        actions={
          <>
            <Button
              icone={PiCalendarCheck}
              onClick={() => open({ type: 'calendar-sync' })}
            >
              No seu calendário
            </Button>
            <Link
              href="/profile"
              className="inline-flex min-h-[var(--alvo)] items-center gap-1.5 px-2 text-sm font-medium text-ouro-texto"
            >
              Conta e foto <Icon de={PiArrowSquareOut} tamanho="p" />
            </Link>
          </>
        }
      />
      <div className="flex flex-col gap-16">
        {role === 'teacher' ? (
          <>
            <PublicProfile />
            <Schedule />
          </>
        ) : (
          <>
            <StudyProfile />
            <Classes />
          </>
        )}
        <Preferences role={role} />
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Professor
// ---------------------------------------------------------------------------

function PublicProfile() {
  const profile = usePortalProfile();
  const p = profile.data?.teacher?.profile;
  const [form, setForm] = useState<Partial<api.TeacherPortalProfile> | null>(
    null
  );
  useEffect(() => {
    if (p && !form) setForm(p);
  }, [p, form]);

  const save = usePortalMutation(
    () =>
      api.updatePortalProfile({
        teacher: {
          publicBio: form?.publicBio ?? null,
          specialties: form?.specialties ?? [],
          instruments: form?.instruments ?? [],
          teachingMethod: form?.teachingMethod ?? null,
          isPublicProfile: form?.isPublicProfile ?? false,
        },
      }),
    { success: 'Perfil salvo.', invalidate: [portalKeys.profile] }
  );

  return (
    <Section
      title="Como os alunos te veem"
      detail="Aparece no convite e na ficha que o aluno abre"
      help="perfil-publico"
    >
      {profile.isPending || !form ? (
        profile.error ? (
          <ScreenError
            message={errorText(profile.error)}
            onRetry={() => profile.refetch()}
          />
        ) : (
          <ScreenLoading rows={2} />
        )
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Field.Area
            label="Apresentação"
            rows={5}
            maxLength={2000}
            value={form.publicBio ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, publicBio: e.target.value }))
            }
            placeholder="Quem você é como professor, em poucas linhas."
          />
          <div className="flex flex-col gap-5">
            <CampoDeFichas
              rotulo="Instrumentos"
              valores={form.instruments ?? []}
              aoMudar={(v) => setForm((f) => ({ ...f, instruments: v }))}
            />
            <CampoDeFichas
              rotulo="Especialidades"
              valores={form.specialties ?? []}
              aoMudar={(v) => setForm((f) => ({ ...f, specialties: v }))}
            />
            <Field
              label="Método"
              maxLength={300}
              value={form.teachingMethod ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, teachingMethod: e.target.value }))
              }
            />
            <label className="flex cursor-pointer items-start gap-3 text-[0.9375rem] text-texto-suave">
              <input
                type="checkbox"
                checked={form.isPublicProfile ?? false}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isPublicProfile: e.target.checked }))
                }
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--ouro)]"
              />
              Aparecer no diretório de professores do site
            </label>
          </div>
          <Button
            variante="primario"
            className="self-start"
            carregando={save.isPending}
            onClick={() => save.mutate(undefined)}
          >
            Salvar perfil
          </Button>
        </div>
      )}
    </Section>
  );
}

const REMINDERS: Array<[number, string]> = [
  [1440, 'Na véspera'],
  [30, '30 minutos antes'],
];

function Schedule() {
  const { open } = usePortal();
  const settings = useSchedulingSettings();
  const [form, setForm] = useState<SchedulingSettings | null>(null);
  useEffect(() => {
    if (settings.data && !form)
      // Lista vazia é o padrão da API: os dois lembretes.
      setForm({
        ...settings.data,
        lessonReminderMinutes: settings.data.lessonReminderMinutes.length
          ? settings.data.lessonReminderMinutes
          : [1440, 30],
      });
  }, [settings.data, form]);

  const save = usePortalMutation(
    () =>
      api.updateSchedulingSettings({
        defaultLessonDuration: form!.defaultLessonDuration,
        bufferMinutes: form!.bufferMinutes,
        travelMinutes: form!.travelMinutes,
        maxLessonsPerDay: form!.maxLessonsPerDay,
        maxLessonsPerWeek: form!.maxLessonsPerWeek,
        acceptsLessonRequests: form!.acceptsLessonRequests,
        requestLeadHours: form!.requestLeadHours,
        requestHorizonDays: form!.requestHorizonDays,
        lessonReminderMinutes: form!.lessonReminderMinutes,
      }),
    {
      success: 'Esquema de aulas salvo. A agenda já confere com ele.',
      invalidate: [portalKeys.settings, ['portal', 'check']],
    }
  );

  if (settings.error)
    return (
      <ScreenError
        message={errorText(settings.error)}
        onRetry={() => settings.refetch()}
      />
    );
  if (!form) return <ScreenLoading rows={3} />;
  const set = <K extends keyof SchedulingSettings>(
    k: K,
    v: SchedulingSettings[K]
  ) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const num = (v: string) => (v === '' ? null : Math.max(0, Number(v)));

  return (
    <Section
      title="Seu esquema de aulas"
      detail="A régua da verificação de conflitos, dos pedidos de aula e dos lembretes"
      help="perfil-aulas"
      action={
        <Button icone={PiClock} onClick={() => open({ type: 'availability' })}>
          Horário de atendimento
        </Button>
      }
    >
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <Options
            label="Duração padrão"
            value={form.defaultLessonDuration}
            onChange={(v) => set('defaultLessonDuration', v)}
            options={[30, 45, 60, 90].map((m) => ({
              value: m,
              label: duration(m),
            }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Folga entre aulas (min)"
              type="number"
              min={0}
              max={120}
              step={5}
              value={form.bufferMinutes}
              onChange={(e) => set('bufferMinutes', Number(e.target.value))}
            />
            <Field
              label="Deslocamento (min)"
              type="number"
              min={0}
              max={240}
              step={5}
              value={form.travelMinutes}
              onChange={(e) => set('travelMinutes', Number(e.target.value))}
              ajuda="Entre lugares físicos diferentes."
            />
            <Field
              label="Máximo por dia"
              type="number"
              min={1}
              max={20}
              value={form.maxLessonsPerDay ?? ''}
              placeholder="Sem limite"
              onChange={(e) => set('maxLessonsPerDay', num(e.target.value))}
            />
            <Field
              label="Máximo por semana"
              type="number"
              min={1}
              max={80}
              value={form.maxLessonsPerWeek ?? ''}
              placeholder="Sem limite"
              onChange={(e) => set('maxLessonsPerWeek', num(e.target.value))}
            />
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <label className="flex cursor-pointer items-start gap-3 text-[0.9375rem] text-texto-suave">
            <input
              type="checkbox"
              checked={form.acceptsLessonRequests}
              onChange={(e) => set('acceptsLessonRequests', e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--ouro)]"
            />
            Os alunos podem pedir aula nos seus horários livres
          </label>
          {form.acceptsLessonRequests && (
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Antecedência (horas)"
                type="number"
                min={1}
                max={168}
                value={form.requestLeadHours}
                onChange={(e) =>
                  set('requestLeadHours', Number(e.target.value))
                }
              />
              <Field
                label="Até quantos dias à frente"
                type="number"
                min={1}
                max={90}
                value={form.requestHorizonDays}
                onChange={(e) =>
                  set('requestHorizonDays', Number(e.target.value))
                }
              />
            </div>
          )}
          <fieldset className="flex flex-col gap-2">
            <legend className="t-rotulo mb-2 font-medium text-texto">
              Lembretes de aula
            </legend>
            <div className="flex flex-wrap gap-2">
              {REMINDERS.map(([m, label]) => {
                const on = form.lessonReminderMinutes.includes(m);
                return (
                  <Chip
                    key={m}
                    selecionado={on}
                    // Pelo menos um: lembrete nenhum faria aluno esquecer aula.
                    onClick={() =>
                      set(
                        'lessonReminderMinutes',
                        on
                          ? form.lessonReminderMinutes.length > 1
                            ? form.lessonReminderMinutes.filter((x) => x !== m)
                            : form.lessonReminderMinutes
                          : [...form.lessonReminderMinutes, m]
                      )
                    }
                  >
                    {label}
                  </Chip>
                );
              })}
            </div>
            <p className="t-legenda">
              Para você e para o aluno, no portal e pelos canais que cada um
              aceita.
            </p>
          </fieldset>
        </div>
      </div>
      <Button
        variante="primario"
        className="self-start"
        carregando={save.isPending}
        onClick={() => save.mutate(undefined)}
      >
        Salvar esquema
      </Button>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Aluno
// ---------------------------------------------------------------------------

const LEVELS: Array<{
  value: NonNullable<api.StudentPortalProfile['level']>;
  label: string;
}> = [
  { value: 'BEGINNER', label: 'Iniciante' },
  { value: 'INTERMEDIATE', label: 'Intermediário' },
  { value: 'ADVANCED', label: 'Avançado' },
];

function StudyProfile() {
  const profile = usePortalProfile();
  const practice = usePractice({});
  const p = profile.data?.student?.profile;
  const [form, setForm] = useState<{
    level: api.StudentPortalProfile['level'];
    mainInstrument: string;
    musicalGoals: string;
    allowProgressShare: boolean;
  } | null>(null);
  const [goal, setGoal] = useState<number | null>(null);
  useEffect(() => {
    if (p && !form)
      setForm({
        level: p.level,
        mainInstrument: p.mainInstrument ?? '',
        musicalGoals: p.musicalGoals ?? '',
        allowProgressShare: p.allowProgressShare,
      });
  }, [p, form]);
  useEffect(() => {
    if (practice.data && goal === null)
      setGoal(practice.data.weeklyGoalMinutes ?? 0);
  }, [practice.data, goal]);

  const save = usePortalMutation(
    async () => {
      await api.updatePortalProfile({
        student: {
          level: form!.level,
          mainInstrument: form!.mainInstrument.trim() || null,
          musicalGoals: form!.musicalGoals.trim() || null,
          allowProgressShare: form!.allowProgressShare,
        },
      });
      if (goal !== null && goal !== (practice.data?.weeklyGoalMinutes ?? 0))
        await api.setPracticeGoal(goal);
    },
    {
      success: 'Perfil salvo.',
      invalidate: [
        portalKeys.profile,
        ['portal', 'practice'],
        ['portal', 'dashboard'],
      ],
    }
  );

  return (
    <Section
      title="Seu estudo"
      detail="Seus professores veem para planejar as aulas"
    >
      {profile.error ? (
        <ScreenError
          message={errorText(profile.error)}
          onRetry={() => profile.refetch()}
        />
      ) : !form ? (
        <ScreenLoading rows={2} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <Options
              label="Nível"
              value={form.level ?? 'BEGINNER'}
              onChange={(v) => setForm((f) => f && { ...f, level: v })}
              options={LEVELS}
            />
            <Field
              label="Instrumento principal"
              maxLength={100}
              value={form.mainInstrument}
              onChange={(e) =>
                setForm((f) => f && { ...f, mainInstrument: e.target.value })
              }
            />
            <Options
              label="Meta de prática por semana"
              value={goal ?? 0}
              onChange={setGoal}
              options={[0, 60, 120, 180, 300, 420].map((m) => ({
                value: m,
                label: m === 0 ? 'Sem meta' : duration(m),
              }))}
            />
          </div>
          <div className="flex flex-col gap-5">
            <Field.Area
              label="O que você quer alcançar"
              rows={4}
              maxLength={2000}
              value={form.musicalGoals}
              onChange={(e) =>
                setForm((f) => f && { ...f, musicalGoals: e.target.value })
              }
            />
            <label className="flex cursor-pointer items-start gap-3 text-[0.9375rem] text-texto-suave">
              <input
                type="checkbox"
                checked={form.allowProgressShare}
                onChange={(e) =>
                  setForm(
                    (f) => f && { ...f, allowProgressShare: e.target.checked }
                  )
                }
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--ouro)]"
              />
              Meus professores veem a minha biblioteca (quero aprender e já
              aprendi)
            </label>
          </div>
          <Button
            variante="primario"
            className="self-start"
            carregando={save.isPending}
            onClick={() => save.mutate(undefined)}
          >
            Salvar
          </Button>
        </div>
      )}
    </Section>
  );
}

function Classes() {
  const classes = useMyClasses();
  const [leaving, setLeaving] = useState<
    api.MyClasses['teachers'][number] | null
  >(null);
  const leave = usePortalMutation((id: string) => api.leaveClass(id), {
    success: 'Você saiu da turma. O histórico ficou guardado.',
    onSuccess: () => setLeaving(null),
  });
  const name = (t: {
    user: {
      firstName: string | null;
      lastName: string | null;
      email: string | null;
    };
  }) =>
    [t.user.firstName, t.user.lastName].filter(Boolean).join(' ') ||
    t.user.email ||
    'Professor';

  return (
    <Section title="Suas turmas">
      {classes.isPending ? (
        <ScreenLoading rows={2} />
      ) : classes.error ? (
        <ScreenError
          message={errorText(classes.error)}
          onRetry={() => classes.refetch()}
        />
      ) : (
        <ul className="flex flex-col">
          {classes.data!.teachers.map((c) => (
            <li
              key={c.relationshipId}
              className="flex flex-wrap items-center justify-between gap-4 border-b border-linha py-4"
            >
              <span className="flex items-center gap-3">
                <Avatar name={name(c.teacher)} image={c.teacher.user.image} />
                <span className="flex flex-col">
                  <span className="font-medium">{name(c.teacher)}</span>
                  <span className="t-legenda">
                    Desde {shortDateYear(dayOf(c.startDate))}
                    {c.teacher.instruments.length
                      ? ` · ${c.teacher.instruments.join(', ')}`
                      : ''}
                  </span>
                </span>
              </span>
              <Button variante="fantasma" onClick={() => setLeaving(c)}>
                Sair da turma
              </Button>
            </li>
          ))}
          {classes.data!.past.map((c) => (
            <li
              key={c.relationshipId}
              className="flex items-center gap-3 border-b border-linha py-4 text-texto-suave"
            >
              <Avatar
                name={name(c.teacher)}
                image={c.teacher.user.image}
                size="p"
              />
              <span className="t-rotulo">
                {name(c.teacher)} · {c.totalLessons} aulas · terminou{' '}
                {c.endDate ? shortDateYear(dayOf(c.endDate)) : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
      <ConfirmModal
        isOpen={leaving !== null}
        onClose={() => setLeaving(null)}
        onConfirm={() => {
          if (leaving) leave.mutate(leaving.relationshipId);
        }}
        isLoading={leave.isPending}
        type="warning"
        title="Sair desta turma?"
        message={
          leaving
            ? `As aulas futuras com ${firstName(name(leaving.teacher))} são canceladas. Aulas, tarefas e relatórios ficam no seu histórico.`
            : ''
        }
        confirmText="Sair da turma"
        cancelText="Voltar"
        acaoPerigosa
      />
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Avisos fora do portal
// ---------------------------------------------------------------------------

function Preferences({ role }: { role: Role }) {
  const prefs = useNotificationPreferences();
  const [form, setForm] = useState<NotificationPreferences | null>(null);
  useEffect(() => {
    if (prefs.data && !form) setForm(prefs.data);
  }, [prefs.data, form]);

  const save = usePortalMutation(
    () =>
      api.updateNotificationPreferences({
        channels: Object.fromEntries(
          form!.topics.map((t) => [t.key, { email: t.email, sms: t.sms }])
        ),
        quietHoursStart: form!.quietHoursStart || null,
        quietHoursEnd: form!.quietHoursEnd || null,
      }),
    {
      success: 'Preferências de aviso salvas.',
      invalidate: [portalKeys.preferences],
    }
  );

  return (
    <Section
      title={role === 'teacher' ? 'Por onde você é avisado' : 'Como te avisar'}
      detail="No portal, sempre. Fora dele, só o que você escolher."
      help="perfil-avisos"
    >
      {prefs.error ? (
        <ScreenError
          message={errorText(prefs.error)}
          onRetry={() => prefs.refetch()}
        />
      ) : !form ? (
        <ScreenLoading rows={3} />
      ) : (
        <div className="flex flex-col gap-6">
          {!form.hasEmail && (
            <p className="rounded-controle bg-sup-2 p-4 text-sm text-texto-suave">
              Sua conta não tem e-mail: por enquanto os avisos chegam só no
              portal.
            </p>
          )}
          <table className="w-full max-w-2xl text-left text-[0.9375rem]">
            <thead className="text-xs text-texto-fraco">
              <tr className="border-b border-linha">
                <th className="py-2 pr-4 font-normal">Aviso</th>
                <th className="w-24 py-2 pr-4 text-center font-normal">
                  E-mail
                </th>
                <th className="w-24 py-2 text-center font-normal">SMS</th>
              </tr>
            </thead>
            <tbody>
              {form.topics.map((t, i) => (
                <tr key={t.key} className="border-b border-linha last:border-0">
                  <td className="py-3 pr-4 text-texto-suave">{t.label}</td>
                  <td className="py-3 pr-4 text-center">
                    <input
                      type="checkbox"
                      aria-label={`${t.label} por e-mail`}
                      disabled={!form.hasEmail}
                      checked={t.email}
                      onChange={(e) =>
                        setForm(
                          (f) =>
                            f && {
                              ...f,
                              topics: f.topics.map((x, k) =>
                                k === i ? { ...x, email: e.target.checked } : x
                              ),
                            }
                        )
                      }
                      className="h-5 w-5 accent-[var(--ouro)]"
                    />
                  </td>
                  <td className="py-3 text-center">
                    <span className="t-legenda">
                      {form.smsAvailable ? '' : 'Em breve'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-col gap-2">
            <span className="t-rotulo font-medium text-texto">
              Horário de silêncio
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="time"
                aria-label="Começo do silêncio"
                value={form.quietHoursStart ?? ''}
                onChange={(e) =>
                  setForm(
                    (f) =>
                      f && { ...f, quietHoursStart: e.target.value || null }
                  )
                }
                className="input-classical t-dado w-[7.5rem]"
              />
              <span className="text-texto-fraco">até</span>
              <input
                type="time"
                aria-label="Fim do silêncio"
                value={form.quietHoursEnd ?? ''}
                onChange={(e) =>
                  setForm(
                    (f) => f && { ...f, quietHoursEnd: e.target.value || null }
                  )
                }
                className="input-classical t-dado w-[7.5rem]"
              />
              {(form.quietHoursStart || form.quietHoursEnd) && (
                <Button
                  variante="texto"
                  onClick={() =>
                    setForm(
                      (f) =>
                        f && {
                          ...f,
                          quietHoursStart: null,
                          quietHoursEnd: null,
                        }
                    )
                  }
                >
                  Sem silêncio
                </Button>
              )}
            </div>
            <p className="t-legenda">
              Fora do portal, nada chega nesse intervalo: o aviso espera o fim
              do silêncio.
            </p>
          </div>
          <Button
            variante="primario"
            className="self-start"
            carregando={save.isPending}
            onClick={() => save.mutate(undefined)}
          >
            Salvar avisos
          </Button>
        </div>
      )}
    </Section>
  );
}
