'use client';

// O que a agenda diz de um horário: `POST /lessons/check`, a mesma regra que
// a API aplica ao salvar (choque com as aulas do professor e com as do aluno
// em qualquer turma, bloqueios, folga, deslocamento, atendimento, limites).

import { useQuery } from '@tanstack/react-query';
import * as api from '@/app/requests/portal/api';
import type { ScheduleCheck } from '@/app/requests/portal/api';
import { FindingsList, SlotSuggestions } from '../pieces';
import { useDebounced } from '../useDebounced';

export type CheckDraft = Parameters<typeof api.checkLesson>[0];

/** A consulta, com a proposta estabilizada (não consulta a cada tecla). */
export function useScheduleCheck(draft: CheckDraft | null) {
  const settled = useDebounced(draft, 350);
  return useQuery({
    queryKey: ['portal', 'check', settled],
    queryFn: () => api.checkLesson(settled as CheckDraft),
    enabled: Boolean(settled?.studentId && settled.scheduledAt),
    staleTime: 15_000,
    placeholderData: (previous) => previous,
  });
}

export function ScheduleCheckPanel({
  check,
  loading,
  onPick,
  acknowledged,
  onAcknowledge,
  title = 'A agenda diz',
}: {
  check: ScheduleCheck | undefined;
  loading: boolean;
  onPick: (iso: string) => void;
  acknowledged: boolean;
  onAcknowledge: (v: boolean) => void;
  title?: string;
}) {
  const first = check?.occurrences[0];
  return (
    <section
      data-ajuda="verificacao"
      className="flex flex-col gap-4 rounded-card bg-sup-2 p-4"
      aria-busy={loading}
    >
      <h3 className="t-rotulo font-medium text-texto">{title}</h3>
      {!check ? (
        <p className="text-sm text-texto-fraco">
          {loading
            ? 'Conferindo a agenda…'
            : 'Escolha o aluno, o dia e a hora.'}
        </p>
      ) : (
        <>
          <FindingsList findings={first?.findings ?? []} />
          {check.severity !== 'ok' && (
            <SlotSuggestions slots={first?.suggestions ?? []} onPick={onPick} />
          )}
          {check.severity === 'conflict' && (
            <label className="flex cursor-pointer items-start gap-3 border-t border-linha pt-4 text-sm text-texto-suave">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => onAcknowledge(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--ouro)]"
              />
              Entendi o conflito e quero marcar assim mesmo.
            </label>
          )}
        </>
      )}
    </section>
  );
}

/** Pode salvar? Bloqueio nunca; conflito só com o "assim mesmo". */
export const canSave = (
  check: ScheduleCheck | undefined,
  acknowledged: boolean
) =>
  Boolean(check) &&
  check!.severity !== 'blocking' &&
  (check!.severity !== 'conflict' || acknowledged);
