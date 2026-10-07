'use client';

// O pedido de aula, do lado do professor: aceitar (vira aula, com a mesma
// verificação de agenda), recusar com um recado ou propor outro horário.

import { useMemo, useState } from 'react';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Sheet } from '@/app/components/ui/Sheet';
import {
  usePortalMutation,
  useTeacherDashboard,
} from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import {
  dayOf,
  duration,
  firstName,
  longDate,
  spokenTime,
  when,
} from '../format';
import { ScreenLoading } from '../pieces';
import type { SheetProps } from '../PortalProvider';
import {
  ScheduleCheckPanel,
  canSave,
  useScheduleCheck,
} from '../schedule/ScheduleCheckPanel';

export default function LessonRequestSheet({
  request,
  onClose,
  closeAll,
  open,
}: SheetProps<{ type: 'lesson-request'; id: string }>) {
  const dashboard = useTeacherDashboard();
  const item = dashboard.data?.lessonRequests.find((r) => r.id === request.id);
  const [answer, setAnswer] = useState('');
  const [declining, setDeclining] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const draft = useMemo(
    () =>
      item?.student
        ? {
            studentId: item.student.id,
            scheduledAt: item.scheduledAt,
            duration: item.duration,
          }
        : null,
    [item]
  );
  const check = useScheduleCheck(draft);
  const name = item?.student ? firstName(item.student.name) : '';

  const accept = usePortalMutation(
    () =>
      api.acceptLessonRequest(request.id, {
        force: check.data?.severity === 'conflict' && acknowledged,
      }),
    {
      success: () =>
        `Aula marcada: ${when(dayOf(item!.scheduledAt))}, ${spokenTime(item!.scheduledAt)}, com ${name}.`,
      onSuccess: closeAll,
    }
  );
  const decline = usePortalMutation(
    () => api.declineLessonRequest(request.id, answer.trim() || undefined),
    {
      success: `Pedido recusado. ${name} recebeu o aviso.`,
      onSuccess: closeAll,
    }
  );

  if (!item)
    return (
      <Sheet aberto aoFechar={onClose} titulo="Pedido de aula" largura="p">
        {dashboard.isPending ? (
          <ScreenLoading rows={2} />
        ) : (
          <p className="text-[0.9375rem] text-texto-suave">
            Este pedido já foi respondido ou cancelado.
          </p>
        )}
      </Sheet>
    );

  return (
    <Sheet
      aberto
      aoFechar={onClose}
      titulo={`${name} pediu uma aula`}
      descricao={`${longDate(dayOf(item.scheduledAt))}, ${spokenTime(item.scheduledAt)} · ${duration(item.duration)}`.replace(
        /^./,
        (c) => c.toUpperCase()
      )}
      largura="m"
      rodape={
        declining ? (
          <>
            <Button variante="fantasma" onClick={() => setDeclining(false)}>
              Voltar
            </Button>
            <Button
              variante="primario"
              carregando={decline.isPending}
              onClick={() => decline.mutate(undefined)}
            >
              Recusar pedido
            </Button>
          </>
        ) : (
          <>
            <Button variante="fantasma" onClick={() => setDeclining(true)}>
              Recusar
            </Button>
            <Button
              onClick={() =>
                open({
                  type: 'schedule',
                  studentId: item.student?.id,
                  start: item.scheduledAt,
                  duration: item.duration,
                })
              }
            >
              Outro horário
            </Button>
            <Button
              variante="primario"
              disabled={!canSave(check.data, acknowledged)}
              carregando={accept.isPending}
              onClick={() => accept.mutate(undefined)}
            >
              Aceitar
            </Button>
          </>
        )
      }
    >
      <div className="flex flex-col gap-5">
        {item.note && (
          <blockquote className="font-display text-xl leading-snug text-texto">
            &ldquo;{item.note}&rdquo;
          </blockquote>
        )}
        {declining ? (
          <Field.Area
            label="Recado (opcional)"
            rows={3}
            value={answer}
            maxLength={500}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Nesse dia não consigo; que tal quinta às 17h?"
          />
        ) : (
          <ScheduleCheckPanel
            check={check.data}
            loading={check.isFetching}
            acknowledged={acknowledged}
            onAcknowledge={setAcknowledged}
            onPick={(iso) =>
              open({
                type: 'schedule',
                studentId: item.student?.id,
                start: iso,
                duration: item.duration,
              })
            }
          />
        )}
      </div>
    </Sheet>
  );
}
