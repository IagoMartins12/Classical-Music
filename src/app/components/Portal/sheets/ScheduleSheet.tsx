'use client';

// Marcar rápido e remarcar — aluno, dia, hora, duração e lugar, com a agenda
// conferindo de verdade. Série, repertório, objetivos e avisos ficam na
// criação completa (`/teacher/lessons/create`), que recebe o que já foi
// escolhido aqui.

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { PiArrowRight, PiCalendarPlus } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import {
  errorText,
  useLesson,
  usePortalMutation,
  useSchedulingSettings,
  useTeacherDashboard,
} from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import {
  addDays,
  clock,
  dayOf,
  duration,
  firstName,
  spokenTime,
  today,
  toInstant,
  when,
} from '../format';
import { counterpartOf, lessonTitle } from '../lesson/lessonText';
import { Options, ScreenError, ScreenLoading } from '../pieces';
import type { SheetProps, SheetRequest } from '../PortalProvider';
import {
  ScheduleCheckPanel,
  canSave,
  useScheduleCheck,
} from '../schedule/ScheduleCheckPanel';

const PLACES = ['Estúdio', 'Online', 'Casa do aluno'];

export default function ScheduleSheet(
  props: SheetProps<Extract<SheetRequest, { type: 'schedule' | 'reschedule' }>>
) {
  const { request } = props;
  const original = useLesson(request.type === 'reschedule' ? request.id : null);
  if (
    request.type === 'reschedule' &&
    (original.isPending || original.error || !original.data)
  )
    return (
      <Sheet aberto aoFechar={props.onClose} titulo="Remarcar aula" largura="m">
        {original.isPending ? (
          <ScreenLoading rows={3} />
        ) : (
          <ScreenError
            message={errorText(original.error)}
            onRetry={() => original.refetch()}
          />
        )}
      </Sheet>
    );
  return (
    <ScheduleForm
      {...props}
      original={request.type === 'reschedule' ? original.data : undefined}
    />
  );
}

function ScheduleForm({
  request,
  onClose,
  closeAll,
  original,
}: SheetProps<Extract<SheetRequest, { type: 'schedule' | 'reschedule' }>> & {
  original?: api.Lesson;
}) {
  const dashboard = useTeacherDashboard();
  const settings = useSchedulingSettings();
  const students = dashboard.data?.students ?? [];
  const initial = request.type === 'schedule' ? request : undefined;
  const start =
    initial?.start ??
    (original ? addDaysIso(original.scheduledAt, 7) : undefined);

  const [studentId, setStudentId] = useState(
    original?.student.id ?? initial?.studentId ?? ''
  );
  const [day, setDay] = useState(start ? dayOf(start) : addDays(today(), 1));
  const [time, setTime] = useState(start ? clock(start) : '16:00');
  const [minutes, setMinutes] = useState(
    original?.duration ?? initial?.duration ?? 0
  );
  const [place, setPlace] = useState(original?.location ?? 'Estúdio');
  const [reason, setReason] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  // A duração padrão vem do esquema de aulas do professor.
  useEffect(() => {
    if (!minutes && settings.data)
      setMinutes(settings.data.defaultLessonDuration);
  }, [minutes, settings.data]);
  // Com um aluno só, ele já vem escolhido.
  useEffect(() => {
    if (!studentId && students.length === 1)
      setStudentId(students[0].studentId);
  }, [studentId, students]);

  const scheduledAt = day && time ? toInstant(day, time) : '';
  const draft = useMemo(
    () =>
      studentId && scheduledAt
        ? {
            studentId,
            scheduledAt,
            duration: minutes || 60,
            location: place,
            excludeLessonId: original?.id,
          }
        : null,
    [studentId, scheduledAt, minutes, place, original?.id]
  );
  const check = useScheduleCheck(draft);
  useEffect(() => setAcknowledged(false), [draft]);

  const name = firstName(
    original
      ? counterpartOf(original, 'teacher').name
      : (students.find((s) => s.studentId === studentId)?.name ?? '')
  );
  const force = check.data?.severity === 'conflict' && acknowledged;

  const save = usePortalMutation<void, unknown>(
    () =>
      original
        ? api.rescheduleLesson(original.id, {
            scheduledAt,
            duration: minutes,
            reason: reason.trim() || undefined,
            force,
          })
        : api.createLesson({
            studentId,
            title: 'Aula',
            scheduledAt,
            duration: minutes,
            location: place,
            force,
          }),
    {
      success: original
        ? `Remarcada para ${when(day)}, ${spokenTime(scheduledAt)}. ${name} recebeu o aviso.`
        : `Aula marcada com ${name}, ${when(day)}, ${spokenTime(scheduledAt)}.`,
      onSuccess: closeAll,
    }
  );

  const fullHref = `/teacher/lessons/create?${new URLSearchParams({
    ...(studentId ? { student: studentId } : {}),
    ...(scheduledAt ? { start: scheduledAt } : {}),
    ...(minutes ? { duration: String(minutes) } : {}),
  }).toString()}`;

  const durations = [...new Set([30, 45, 60, 90, minutes || 60])].sort(
    (a, b) => a - b
  );
  const places = [
    ...new Set([...PLACES, ...(original?.location ? [original.location] : [])]),
  ];

  return (
    <Sheet
      aberto
      aoFechar={onClose}
      titulo={original ? `Remarcar a aula de ${name}` : 'Marcar rápido'}
      descricao={
        original
          ? `Era ${lessonTitle(original).subtitle.toLowerCase()}. ${name} recebe o aviso com o motivo.`
          : 'Aluno, dia e hora. Série, repertório, objetivos e avisos ficam na criação completa.'
      }
      largura="m"
      rodape={
        <>
          {!original && (
            <Link
              href={fullHref}
              onClick={closeAll}
              className="mr-auto inline-flex min-h-[var(--alvo)] items-center gap-1.5 text-sm font-medium text-ouro-texto max-sm:w-full max-sm:justify-center"
            >
              Criação completa <Icon de={PiArrowRight} tamanho="p" />
            </Link>
          )}
          <Button variante="fantasma" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variante="primario"
            icone={PiCalendarPlus}
            carregando={save.isPending}
            disabled={!canSave(check.data, acknowledged) || check.isFetching}
            onClick={() => save.mutate(undefined)}
          >
            {original ? 'Remarcar' : 'Marcar'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        {!original &&
          (students.length === 0 && !dashboard.isPending ? (
            <p className="rounded-controle bg-sup-2 p-4 text-sm text-texto-suave">
              Você ainda não tem aluno com convite aceito. Convide pela tela de
              Alunos; a aula se marca quando ele aceitar.
            </p>
          ) : (
            <Field.Selecao
              label="Aluno"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">Escolha o aluno</option>
              {students.map((s) => (
                <option key={s.studentId} value={s.studentId}>
                  {s.name}
                </option>
              ))}
            </Field.Selecao>
          ))}
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Dia"
            type="date"
            value={day}
            min={today()}
            onChange={(e) => setDay(e.target.value)}
          />
          <Field
            label="Hora"
            type="time"
            step={900}
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        <Options
          label="Duração"
          value={minutes || 60}
          onChange={setMinutes}
          options={durations.map((m) => ({ value: m, label: duration(m) }))}
        />
        {!original && (
          <Options
            label="Onde"
            value={place}
            onChange={setPlace}
            options={places.map((p) => ({ value: p, label: p }))}
          />
        )}
        <ScheduleCheckPanel
          check={check.data}
          loading={check.isFetching}
          acknowledged={acknowledged}
          onAcknowledge={setAcknowledged}
          onPick={(iso) => {
            setDay(dayOf(iso));
            setTime(clock(iso));
          }}
        />
        {original && (
          <Field.Area
            label="Motivo"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            ajuda={`${name} lê o motivo no aviso.`}
            maxLength={500}
          />
        )}
      </div>
    </Sheet>
  );
}

/** A mesma hora, `n` dias depois. */
function addDaysIso(iso: string, n: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString();
}
