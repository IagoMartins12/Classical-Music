'use client';

// Pedir aula num horário livre — o lado do aluno. Só aparece o que dá para
// pedir de fato: o atendimento do professor menos as aulas dele, dentro da
// antecedência e do horizonte que ele aceita, e sem chocar com as aulas do
// aluno em outra turma (a API recorta). Nada fica marcado até a resposta.

import { useMemo, useState } from 'react';
import { Chip } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Sheet } from '@/app/components/ui/Sheet';
import {
  errorText,
  portalKeys,
  usePortalMutation,
  useStudentDashboard,
  useTeacherFreeSlots,
} from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import {
  addDays,
  clock,
  dayOf,
  duration,
  firstName,
  longDate,
  spokenTime,
  startOfDay,
  today,
  when,
} from '../format';
import { Options, ScreenError, ScreenLoading } from '../pieces';
import type { SheetProps } from '../PortalProvider';

const STEP = 30;

/** Os inícios possíveis dentro de cada janela livre, de meia em meia hora. */
function startsWithin(
  slots: Array<{ start: string; end: string }>,
  minutes: number
) {
  const byDay = new Map<string, string[]>();
  for (const slot of slots) {
    const end = new Date(slot.end).getTime();
    const start = new Date(slot.start);
    // Arredonda o começo para a próxima meia hora cheia.
    const rounded =
      Math.ceil(start.getTime() / (STEP * 60_000)) * STEP * 60_000;
    for (let t = rounded; t + minutes * 60_000 <= end; t += STEP * 60_000) {
      const iso = new Date(t).toISOString();
      const day = dayOf(iso);
      byDay.set(day, [...(byDay.get(day) ?? []), iso]);
    }
  }
  return [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export default function RequestLessonSheet({
  request,
  onClose,
  closeAll,
}: SheetProps<{ type: 'request'; teacherId?: string; start?: string }>) {
  const dashboard = useStudentDashboard();
  const teachers = dashboard.data?.teachers ?? [];
  const [teacherId, setTeacherId] = useState(request.teacherId ?? '');
  const teacher =
    teachers.find((t) => t.teacherId === teacherId) ??
    (teachers.length === 1 ? teachers[0] : undefined);
  const [minutes, setMinutes] = useState(60);
  const [chosen, setChosen] = useState<string | null>(request.start ?? null);
  const [note, setNote] = useState('');

  // Janela estável por dia: a chave da consulta não muda a cada render.
  const range = useMemo(
    () => ({
      from: startOfDay(today()).toISOString(),
      to: startOfDay(addDays(today(), 60)).toISOString(),
    }),
    []
  );
  const free = useTeacherFreeSlots(teacher?.userId, {
    ...range,
    minMinutes: minutes,
  });
  const days = useMemo(
    () => startsWithin(free.data?.slots ?? [], minutes),
    [free.data, minutes]
  );

  const send = usePortalMutation(
    () =>
      api.createLessonRequest({
        teacherId: teacher!.teacherId,
        scheduledAt: chosen!,
        duration: minutes,
        note: note.trim() || undefined,
      }),
    {
      success: () =>
        `Pedido enviado: ${when(dayOf(chosen!))}, ${spokenTime(chosen!)}. ${firstName(teacher!.name)} responde por aqui.`,
      invalidate: [
        portalKeys.dashboard('student'),
        portalKeys.requests('student'),
        ['portal', 'free-slots'],
      ],
      onSuccess: closeAll,
    }
  );

  const name = teacher ? firstName(teacher.name) : '';
  const rules = free.data?.requests;

  return (
    <Sheet
      aberto
      aoFechar={onClose}
      titulo="Pedir uma aula"
      descricao="O professor confirma ou sugere outro horário. Nada fica marcado até lá."
      largura="m"
      rodape={
        <>
          <Button variante="fantasma" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variante="primario"
            disabled={!teacher || !chosen}
            carregando={send.isPending}
            onClick={() => send.mutate(undefined)}
          >
            Enviar pedido
          </Button>
        </>
      }
    >
      {dashboard.isPending ? (
        <ScreenLoading rows={3} />
      ) : teachers.length === 0 ? (
        <p className="rounded-controle bg-sup-2 p-4 text-sm text-texto-suave">
          Para pedir aula é preciso estar numa turma. Seu professor convida pelo
          seu e-mail.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {teachers.length > 1 && (
            <Options
              label="Com quem"
              value={teacher?.teacherId ?? ''}
              onChange={(v) => (setTeacherId(v), setChosen(null))}
              options={teachers.map((t) => ({
                value: t.teacherId,
                label: t.name,
              }))}
            />
          )}
          <Options
            label="Duração"
            value={minutes}
            onChange={(m) => (setMinutes(m), setChosen(null))}
            options={[30, 45, 60, 90].map((m) => ({
              value: m,
              label: duration(m),
            }))}
          />
          {free.isPending ? (
            <ScreenLoading rows={2} label="Buscando os horários livres" />
          ) : free.error ? (
            <ScreenError message={errorText(free.error)} />
          ) : rules && !rules.accepts ? (
            <p className="rounded-controle bg-sup-2 p-4 text-sm text-texto-suave">
              {name} não está recebendo pedidos de aula pelo portal agora.
              Combine pelo recado da próxima aula.
            </p>
          ) : free.data?.freeHours === null && !days.length ? (
            <p className="rounded-controle bg-sup-2 p-4 text-sm text-texto-suave">
              {name} ainda não declarou os horários em que atende, então o
              portal não sabe quando há horário livre — e não inventa. Peça pelo
              recado da próxima aula.
            </p>
          ) : days.length === 0 ? (
            <p className="rounded-controle bg-sup-2 p-4 text-sm text-texto-suave">
              Nenhum horário livre de {duration(minutes)} nas próximas semanas.
              Tente uma duração menor.
            </p>
          ) : (
            <fieldset className="flex flex-col gap-5">
              <legend className="t-rotulo mb-1 font-medium text-texto">
                Horários livres de {name}
              </legend>
              {rules && (
                <p className="t-legenda -mt-2">
                  {name} aceita pedidos com {rules.leadHours} h de antecedência
                  e até {rules.horizonDays} dias à frente. Os horários que
                  chocam com suas outras aulas não aparecem.
                </p>
              )}
              {days.slice(0, 14).map(([day, starts]) => (
                <div key={day} className="flex flex-col gap-2">
                  <span className="t-legenda first-letter:uppercase">
                    {longDate(day)}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {starts.map((iso) => (
                      <Chip
                        key={iso}
                        selecionado={chosen === iso}
                        onClick={() => setChosen(iso)}
                      >
                        <span className="t-dado">{clock(iso)}</span>
                      </Chip>
                    ))}
                  </div>
                </div>
              ))}
            </fieldset>
          )}
          <Field.Area
            label="Recado"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            placeholder="Para que é a aula extra?"
          />
        </div>
      )}
    </Sheet>
  );
}
