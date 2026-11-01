'use client';

// Horário de atendimento — a agenda que a API já tinha e a tela não. Os
// alunos veem os horários livres e pedem aula neles; a agenda informa, não
// impede: o professor continua podendo marcar fora dela.

import { useEffect, useState } from 'react';
import { PiCopySimple, PiInfo, PiPlus, PiTrash } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { cx } from '@/app/components/ui/cx';
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
import { useConfirmar } from '@/app/components/ui/useConfirmar';

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

/** Two windows of one day that share any minute (touching is fine). */
const clashes = (a: Slot, b: Slot) =>
  a.weekday === b.weekday &&
  minutesOf(a.startTime) < minutesOf(b.endTime) &&
  minutesOf(b.startTime) < minutesOf(a.endTime);

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** A new window starts where the day's last one ends, so it never clashes. */
function nextSlot(weekday: number, list: Slot[]): Slot {
  const last = list
    .filter((s) => s.weekday === weekday)
    .map((s) => s.endTime)
    .sort()
    .pop();
  if (!last) return { weekday, startTime: '14:00', endTime: '18:00' };
  const end = Math.min(minutesOf(last) + 120, 23 * 60 + 45);
  const hhmm = (m: number) =>
    `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  return { weekday, startTime: last, endTime: hhmm(end) };
}

export default function AvailabilitySheet({ onClose, closeAll }: SheetProps) {
  const availability = useAvailability();
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [block, setBlock] = useState({
    from: addDays(today(), 7),
    to: addDays(today(), 14),
    reason: '',
  });
  // The day being copied, and the days chosen to receive it.
  const [copying, setCopying] = useState<number | null>(null);
  const [targets, setTargets] = useState<number[]>([]);
  const [help, setHelp] = useState(false);

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
  const { confirmar, modal } = useConfirmar();
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
  const clashing = (slot: Slot, index: number) =>
    slots.some((other, i) => i !== index && clashes(slot, other));
  const invalid = slots.some(
    (s, i) => minutesOf(s.endTime) <= minutesOf(s.startTime) || clashing(s, i)
  );
  const startCopy = (weekday: number) => {
    setCopying(weekday);
    setTargets(WEEK_ORDER.filter((d) => d !== weekday && d >= 1 && d <= 5));
  };
  const applyCopy = () => {
    if (copying === null) return;
    const source = slots.filter((s) => s.weekday === copying);
    setSlots([
      ...slots.filter((s) => !targets.includes(s.weekday)),
      ...targets.flatMap((weekday) => source.map((s) => ({ ...s, weekday }))),
    ]);
    setCopying(null);
  };
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
        <div className="flex items-center justify-between gap-3">
          <p className="t-rotulo min-w-0 text-texto-suave">
            <span className="t-dado text-texto">{duration(total)}</span> por
            semana · fuso {availability.data.timezone}
          </p>
          <Button
            variante="fantasma"
            icone={PiInfo}
            rotulo="Como funciona o horário de atendimento"
            onClick={() => setHelp(true)}
          />
        </div>
        <ul className="flex flex-col">
          {WEEK_ORDER.map((weekday) => {
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
                  {day.map((s) => {
                    const backwards =
                      minutesOf(s.endTime) <= minutesOf(s.startTime);
                    const clash = !backwards && clashing(s, s.i);
                    return (
                      <div key={s.i} className="flex flex-col gap-1">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-center gap-2 sm:max-w-sm">
                          <input
                            type="time"
                            aria-label={`${WEEKDAYS[weekday]}, início`}
                            value={s.startTime}
                            step={900}
                            onChange={(e) =>
                              change(s.i, 'startTime', e.target.value)
                            }
                            className="input-classical t-dado w-full min-w-0"
                          />
                          <span className="text-texto-fraco">até</span>
                          <input
                            type="time"
                            aria-label={`${WEEKDAYS[weekday]}, fim`}
                            value={s.endTime}
                            step={900}
                            onChange={(e) =>
                              change(s.i, 'endTime', e.target.value)
                            }
                            className="input-classical t-dado w-full min-w-0"
                            aria-invalid={backwards || clash || undefined}
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
                        </div>
                        {(backwards || clash) && (
                          <span className="text-sm text-erro">
                            {backwards
                              ? 'O fim precisa vir depois do início.'
                              : 'Este horário cruza com outro do mesmo dia.'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  <div className="flex flex-wrap gap-x-4">
                    <button
                      type="button"
                      onClick={() =>
                        setSlots((list) => [
                          ...(list ?? []),
                          nextSlot(weekday, list ?? []),
                        ])
                      }
                      className="inline-flex min-h-9 w-fit items-center gap-1.5 text-sm font-medium text-ouro-texto [@media(pointer:coarse)]:min-h-[var(--alvo)]"
                    >
                      <Icon de={PiPlus} tamanho="p" /> Acrescentar horário
                    </button>
                    {day.length > 0 && (
                      <button
                        type="button"
                        aria-expanded={copying === weekday}
                        onClick={() =>
                          copying === weekday
                            ? setCopying(null)
                            : startCopy(weekday)
                        }
                        className="inline-flex min-h-9 w-fit items-center gap-1.5 text-sm font-medium text-ouro-texto [@media(pointer:coarse)]:min-h-[var(--alvo)]"
                      >
                        <Icon de={PiCopySimple} tamanho="p" /> Repetir em outros
                        dias
                      </button>
                    )}
                  </div>
                  {copying === weekday && (
                    <div className="flex flex-col gap-3 rounded-controle bg-sup-2 p-3">
                      <span className="text-sm text-texto-suave">
                        Os dias marcados passam a ter os mesmos horários de{' '}
                        {WEEKDAYS[weekday].toLowerCase()}.
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {WEEK_ORDER.filter((d) => d !== weekday).map((d) => {
                          const on = targets.includes(d);
                          return (
                            <button
                              key={d}
                              type="button"
                              aria-pressed={on}
                              onClick={() =>
                                setTargets((list) =>
                                  on
                                    ? list.filter((x) => x !== d)
                                    : [...list, d]
                                )
                              }
                              className={cx(
                                'inline-flex min-h-9 items-center rounded-full px-3 text-sm [@media(pointer:coarse)]:min-h-[var(--alvo)]',
                                on
                                  ? 'fill-ouro font-medium text-sobre-ouro'
                                  : 'bg-sup-1 text-texto-suave'
                              )}
                            >
                              {WEEKDAYS[d].slice(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variante="fantasma"
                          onClick={() => setCopying(null)}
                        >
                          Fechar
                        </Button>
                        <Button
                          disabled={targets.length === 0}
                          onClick={applyCopy}
                        >
                          Repetir
                        </Button>
                      </div>
                    </div>
                  )}
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
                    onClick={() =>
                      confirmar({
                        titulo: 'Desfazer este bloqueio?',
                        texto:
                          'Os dias voltam a aceitar pedidos de aula no seu horário de atendimento.',
                        botao: 'Desfazer o bloqueio',
                        acao: () => removeBlock.mutate(b.id),
                      })
                    }
                  />
                }
              />
            ))}
            <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-[1fr_1fr_minmax(0,2fr)_auto] sm:items-end [&>*]:min-w-0 max-sm:[&>*:nth-child(n+3)]:col-span-2">
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
      {modal}
      <Sheet
        aberto={help}
        aoFechar={() => setHelp(false)}
        titulo="Como funciona"
        largura="p"
      >
        <ul className="t-corpo flex list-disc flex-col gap-3 pl-5">
          <li>
            Cada janela é um período em que você atende. Os alunos veem os
            horários livres dentro dela e pedem aula.
          </li>
          <li>
            Um dia pode ter mais de uma janela, desde que elas não se cruzem:
            08:00–12:00 e 14:00–18:00 valem; 08:00–18:00 e 14:00–18:00 não.
          </li>
          <li>
            Para um intervalo no meio do dia, divida o dia em duas janelas.
          </li>
          <li>
            “Repetir em outros dias” copia os horários de um dia. O que já havia
            nos dias marcados é substituído.
          </li>
          <li>
            Aulas marcadas e períodos em “Quando não atende” saem dos horários
            livres. A agenda informa, não impede: você pode marcar fora dela.
          </li>
        </ul>
      </Sheet>
    </Sheet>
  );
}
