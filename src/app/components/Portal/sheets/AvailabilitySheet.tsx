'use client';

// Horário de atendimento — a agenda que a API já tinha e a tela não. Os
// alunos veem os horários livres e pedem aula neles; a agenda informa, não
// impede: o professor continua podendo marcar fora dela.

import { useEffect, useState } from 'react';
import { PiPlus, PiTrash } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Row } from '@/app/components/ui/Row';
import { Sheet } from '@/app/components/ui/Sheet';
import {
  errorText,
  portalKeys,
  useAvailability,
  usePortalMutation,
} from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import {
  addDays,
  dayOf,
  duration,
  shortDate,
  startOfDay,
  today,
} from '../format';
import { Block, ScreenError, ScreenLoading } from '../pieces';
import type { SheetProps } from '../PortalProvider';

const WEEKDAYS = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];
type Slot = api.Availability['slots'][number];

const minutesOf = (t: string) =>
  Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));

export default function AvailabilitySheet({ onClose, closeAll }: SheetProps) {
  const availability = useAvailability();
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [block, setBlock] = useState({
    from: addDays(today(), 7),
    to: addDays(today(), 14),
    reason: '',
  });

  useEffect(() => {
    if (availability.data && slots === null) setSlots(availability.data.slots);
  }, [availability.data, slots]);

  const save = usePortalMutation(
    () => api.replaceAvailability({ slots: slots ?? [] }),
    {
      success: 'Horário salvo. Os horários livres já mudaram.',
      onSuccess: closeAll,
    }
  );
  const addBlock = usePortalMutation(
    () =>
      api.addAvailabilityBlock({
        startsAt: startOfDay(block.from).toISOString(),
        // Até o fim do último dia.
        endsAt: startOfDay(addDays(block.to, 1)).toISOString(),
        reason: block.reason.trim() || undefined,
      }),
    {
      success: 'Bloqueio criado.',
      invalidate: [
        portalKeys.availability,
        ['portal', 'calendar'],
        ['portal', 'dashboard'],
      ],
    }
  );
  const removeBlock = usePortalMutation(
    (id: string) => api.removeAvailabilityBlock(id),
    {
      success: 'Bloqueio desfeito.',
      invalidate: [
        portalKeys.availability,
        ['portal', 'calendar'],
        ['portal', 'dashboard'],
      ],
    }
  );

  if (availability.isPending || availability.error || !slots)
    return (
      <Sheet
        aberto
        aoFechar={onClose}
        titulo="Horário de atendimento"
        largura="g"
      >
        {availability.error ? (
          <ScreenError message={errorText(availability.error)} />
        ) : (
          <ScreenLoading rows={4} />
        )}
      </Sheet>
    );

  const total = slots.reduce(
    (s, x) => s + Math.max(0, minutesOf(x.endTime) - minutesOf(x.startTime)),
    0
  );
  const invalid = slots.some(
    (s) => minutesOf(s.endTime) <= minutesOf(s.startTime)
  );
  const change = (
    index: number,
    field: 'startTime' | 'endTime',
    value: string
  ) =>
    setSlots((list) =>
      (list ?? []).map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );

  return (
    <Sheet
      aberto
      aoFechar={onClose}
      titulo="Horário de atendimento"
      descricao="Seus alunos veem os horários livres e pedem aula neles. A agenda informa, não impede: você continua podendo marcar fora dela."
      largura="g"
      rodape={
        <>
          <Button variante="fantasma" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variante="primario"
            disabled={invalid}
            carregando={save.isPending}
            onClick={() => save.mutate(undefined)}
          >
            Salvar horário
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-8">
        <p className="t-rotulo text-texto-suave">
          <span className="t-dado text-texto">{duration(total)}</span> por
          semana · fuso {availability.data.timezone}
        </p>
        <ul className="flex flex-col">
          {[1, 2, 3, 4, 5, 6, 0].map((weekday) => {
            const day = slots
              .map((s, i) => ({ ...s, i }))
              .filter((s) => s.weekday === weekday);
            return (
              <li
                key={weekday}
                className="grid gap-3 border-b border-linha py-4 first:pt-0 last:border-0 sm:grid-cols-[120px_minmax(0,1fr)]"
              >
                <span className="pt-2 font-medium text-texto">
                  {WEEKDAYS[weekday]}
                </span>
                <div className="flex flex-col gap-2">
                  {day.length === 0 && (
                    <span className="pt-2 text-sm text-texto-fraco">
                      Não atende
                    </span>
                  )}
                  {day.map((s) => (
                    <div
                      key={s.i}
                      className="flex flex-wrap items-center gap-2"
                    >
                      <input
                        type="time"
                        aria-label={`${WEEKDAYS[weekday]}, início`}
                        value={s.startTime}
                        step={900}
                        onChange={(e) =>
                          change(s.i, 'startTime', e.target.value)
                        }
                        className="input-classical t-dado w-[7.5rem]"
                      />
                      <span className="text-texto-fraco">até</span>
                      <input
                        type="time"
                        aria-label={`${WEEKDAYS[weekday]}, fim`}
                        value={s.endTime}
                        step={900}
                        onChange={(e) => change(s.i, 'endTime', e.target.value)}
                        className="input-classical t-dado w-[7.5rem]"
                        aria-invalid={
                          minutesOf(s.endTime) <= minutesOf(s.startTime) ||
                          undefined
                        }
                      />
                      <Button
                        variante="fantasma"
                        icone={PiTrash}
                        rotulo={`Tirar ${s.startTime}–${s.endTime} de ${WEEKDAYS[weekday]}`}
                        onClick={() =>
                          setSlots((list) =>
                            (list ?? []).filter((_, k) => k !== s.i)
                          )
                        }
                      />
                      {minutesOf(s.endTime) <= minutesOf(s.startTime) && (
                        <span className="w-full text-sm text-erro">
                          O fim precisa vir depois do início.
                        </span>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setSlots((list) => [
                        ...(list ?? []),
                        { weekday, startTime: '14:00', endTime: '18:00' },
                      ])
                    }
                    className="inline-flex min-h-9 w-fit items-center gap-1.5 text-sm font-medium text-ouro-texto [@media(pointer:coarse)]:min-h-[var(--alvo)]"
                  >
                    <Icon de={PiPlus} tamanho="p" /> Acrescentar horário
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <Block title="Quando não atende">
          <div className="flex flex-col gap-2">
            {availability.data.blocks.length === 0 && (
              <p className="text-sm text-texto-fraco">
                Nenhum período bloqueado. Férias e feriados entram aqui.
              </p>
            )}
            {availability.data.blocks.map((b) => (
              <Row
                key={b.id}
                className="rounded-controle bg-sup-2 px-4"
                titulo={b.reason || 'Sem atendimento'}
                detalhe={`${shortDate(dayOf(b.startsAt))} a ${shortDate(dayOf(new Date(new Date(b.endsAt).getTime() - 1)))}`}
                depois={
                  <Button
                    variante="fantasma"
                    icone={PiTrash}
                    rotulo={`Desfazer ${b.reason || 'bloqueio'}`}
                    carregando={
                      removeBlock.isPending && removeBlock.variables === b.id
                    }
                    onClick={() => removeBlock.mutate(b.id)}
                  />
                }
              />
            ))}
            <div className="grid gap-3 pt-2 sm:grid-cols-[1fr_1fr_minmax(0,2fr)_auto] sm:items-end">
              <Field
                label="De"
                type="date"
                min={today()}
                value={block.from}
                onChange={(e) =>
                  setBlock((b) => ({ ...b, from: e.target.value }))
                }
              />
              <Field
                label="Até"
                type="date"
                min={block.from}
                value={block.to}
                onChange={(e) =>
                  setBlock((b) => ({ ...b, to: e.target.value }))
                }
              />
              <Field
                label="Motivo"
                value={block.reason}
                maxLength={200}
                placeholder="Recesso de fim de ano"
                onChange={(e) =>
                  setBlock((b) => ({ ...b, reason: e.target.value }))
                }
              />
              <Button
                carregando={addBlock.isPending}
                disabled={block.to < block.from}
                onClick={() => addBlock.mutate(undefined)}
              >
                Bloquear
              </Button>
            </div>
          </div>
        </Block>
      </div>
    </Sheet>
  );
}
