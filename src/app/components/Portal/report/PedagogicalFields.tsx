'use client';

// O relatório pedagógico do Maestro, na hora de gerar: as próximas peças (o
// motor sugere, o professor escolhe e explica) e as dicas (a IA rascunha, o
// professor edita). O aluno só vê o que sair daqui.

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { PiPlus, PiSparkle, PiX } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { RECOMMENDATIONS } from '@/app/conteudo/site/recommendations';
import { errorText } from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import { ScreenError, ScreenLoading } from '../pieces';

export const MAX_PIECES = 5;
export const MAX_TIPS = 6;

export type PieceChoice = { workId: string; note: string };

export function NextPiecesPicker({
  studentId,
  name,
  value,
  onChange,
}: {
  studentId: string;
  name: string;
  value: PieceChoice[];
  onChange: (next: PieceChoice[]) => void;
}) {
  const suggestions = useQuery({
    queryKey: ['portal', 'next-pieces', studentId],
    queryFn: () => api.nextPiecesFor(studentId),
    staleTime: 10 * 60_000,
  });
  const reasons = RECOMMENDATIONS.pt.reasons;
  const chosen = new Map(value.map((p) => [p.workId, p]));

  const toggle = (workId: string) =>
    onChange(
      chosen.has(workId)
        ? value.filter((p) => p.workId !== workId)
        : value.length >= MAX_PIECES
          ? value
          : [...value, { workId, note: '' }]
    );

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="t-rotulo mb-1 font-medium text-texto">
        Para estudar a seguir
      </legend>
      <p className="t-legenda">
        Sugestões a partir do que {name || 'o aluno'} já estudou e quer estudar.
        Escolha até {MAX_PIECES}; {name || 'o aluno'} só vê as que você marcar.
      </p>
      {suggestions.isPending ? (
        <ScreenLoading rows={3} />
      ) : suggestions.error ? (
        <ScreenError message={errorText(suggestions.error)} />
      ) : suggestions.data.items.length === 0 ? (
        <p className="text-sm text-texto-fraco">
          Ainda sem sugestões: {name || 'o aluno'} precisa ter obras nas listas
          de estudo.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {suggestions.data.items.map((work) => {
            const picked = chosen.get(work.id);
            return (
              <li
                key={work.id}
                className={cx(
                  'flex flex-col gap-2 rounded-controle p-3',
                  picked && 'bg-sup-2'
                )}
              >
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={Boolean(picked)}
                    disabled={!picked && value.length >= MAX_PIECES}
                    onChange={() => toggle(work.id)}
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--ouro)]"
                  />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="font-display text-[1.0625rem] leading-snug text-texto">
                      {[work.title, work.opOrCatalog]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                    <span className="t-legenda">
                      {work.composer.name}
                      {work.reasons.length > 0 &&
                        ` · ${work.reasons.map((r) => reasons[r]).join(' · ')}`}
                    </span>
                  </span>
                </label>
                {picked && (
                  <Field
                    label="Por que esta peça"
                    rotuloOculto
                    value={picked.note}
                    maxLength={300}
                    placeholder="Por que esta peça (opcional)"
                    onChange={(e) =>
                      onChange(
                        value.map((p) =>
                          p.workId === work.id
                            ? { ...p, note: e.target.value }
                            : p
                        )
                      )
                    }
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </fieldset>
  );
}

export function TipsEditor({
  studentId,
  period,
  name,
  value,
  onChange,
}: {
  studentId: string;
  period: api.ReportPeriod;
  name: string;
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const draft = async () => {
    setDrafting(true);
    setError(null);
    try {
      const { tips } = await api.draftTips(studentId, { period });
      onChange(tips.slice(0, MAX_TIPS));
    } catch (e) {
      setError(errorText(e));
    } finally {
      setDrafting(false);
    }
  };

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="t-rotulo mb-1 font-medium text-texto">
        Dicas para {name || 'o aluno'}
      </legend>
      <p className="t-legenda">
        A IA lê os números do período e rascunha; você revisa, edita e só então
        elas vão no relatório.
      </p>
      {value.map((tip, i) => (
        <div key={i} className="flex items-start gap-2">
          <Field.Area
            label={`Dica ${i + 1}`}
            rotuloOculto
            rows={2}
            value={tip}
            maxLength={500}
            onChange={(e) =>
              onChange(value.map((t, j) => (j === i ? e.target.value : t)))
            }
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-texto-suave hover:bg-sup-2"
          >
            <Icon de={PiX} rotulo={`Tirar a dica ${i + 1}`} />
          </button>
        </div>
      ))}
      {error && <p className="text-sm text-erro">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button
          tamanho="p"
          variante="secundario"
          carregando={drafting}
          onClick={() => void draft()}
        >
          <Icon de={PiSparkle} />
          {value.length ? 'Rascunhar de novo' : 'Rascunhar com IA'}
        </Button>
        {value.length < MAX_TIPS && (
          <Button
            tamanho="p"
            variante="fantasma"
            onClick={() => onChange([...value, ''])}
          >
            <Icon de={PiPlus} />
            Escrever uma dica
          </Button>
        )}
      </div>
    </fieldset>
  );
}
