'use client';

// O repertório do aluno visto pelo professor: o que ele está estudando (das
// aulas e tarefas), o que quer aprender e o que já aprendeu — a mesma
// biblioteca do site. Sugerir uma obra põe ela no "quero aprender" dele, com
// o nome de quem sugeriu.

import { useState } from 'react';
import { PiPlus } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { ApiError } from '@/app/libs/api/client';
import {
  errorText,
  portalKeys,
  usePortalMutation,
  useRepertoire,
} from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import { dayOf, shortDateYear } from '../format';
import { WorkPicker, type PickedWork } from '../catalog/WorkPicker';
import {
  Empty,
  ScreenError,
  ScreenLoading,
  Section,
  WorkCited,
} from '../pieces';

/** O domínio do "já aprendi" é de 1 a 5 estrelas, como no modal da biblioteca. */
const MASTERY: Record<number, string> = {
  1: 'iniciante',
  2: 'básico',
  3: 'intermediário',
  4: 'avançado',
  5: 'domina',
};

export function StudentRepertoire({
  studentId,
  name,
}: {
  studentId: string;
  name: string;
}) {
  const repertoire = useRepertoire(studentId);
  const [suggesting, setSuggesting] = useState(false);
  const [picked, setPicked] = useState<PickedWork | null>(null);
  const [note, setNote] = useState('');

  const suggest = usePortalMutation(
    () =>
      api.suggestWork(studentId, {
        workId: picked!.work.id,
        workScoreId: picked!.score?.id,
        note: note.trim() || undefined,
      }),
    {
      success: `Obra sugerida. Entrou no "quero aprender" de ${name}.`,
      invalidate: [portalKeys.repertoire(studentId)],
      onSuccess: () => (setPicked(null), setNote(''), setSuggesting(false)),
    }
  );

  if (repertoire.isPending)
    return <ScreenLoading rows={3} label="Carregando o repertório" />;
  if (repertoire.error) {
    const hidden =
      repertoire.error instanceof ApiError && repertoire.error.status === 403;
    return hidden ? (
      <Empty
        titulo="Repertório fechado"
        descricao={`${name} escolheu não compartilhar a biblioteca dele. As obras das aulas continuam nas aulas.`}
      />
    ) : (
      <ScreenError
        message={errorText(repertoire.error)}
        onRetry={() => repertoire.refetch()}
      />
    );
  }
  const r = repertoire.data!;
  const known = [
    ...r.studying.map((s) => s.work.id),
    ...r.wantToLearn.map((w) => w.work.id),
    ...r.learned.map((l) => l.work.id),
  ];

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4 rounded-card bg-sup-2 p-5">
        {suggesting ? (
          picked ? (
            <div className="flex flex-col gap-4">
              <WorkCited work={picked.work} />
              {picked.score && (
                <span className="t-legenda">
                  Partitura: {picked.score.title}
                </span>
              )}
              <Field.Area
                label="Por que esta obra (opcional)"
                rows={2}
                value={note}
                maxLength={500}
                onChange={(e) => setNote(e.target.value)}
              />
              <span className="flex gap-2">
                <Button variante="fantasma" onClick={() => setPicked(null)}>
                  Outra obra
                </Button>
                <Button
                  variante="primario"
                  carregando={suggest.isPending}
                  onClick={() => suggest.mutate(undefined)}
                >
                  Sugerir a {name}
                </Button>
              </span>
            </div>
          ) : (
            <>
              <span className="flex items-center justify-between">
                <span className="t-rotulo font-medium text-texto">
                  Sugerir uma obra do acervo
                </span>
                <Button variante="texto" onClick={() => setSuggesting(false)}>
                  Fechar
                </Button>
              </span>
              <WorkPicker withScore onPick={setPicked} selectedIds={known} />
            </>
          )
        ) : (
          <span className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[0.9375rem] text-texto-suave">
              Sugira uma obra: ela entra no &ldquo;quero aprender&rdquo; de{' '}
              {name}, com o seu nome.
            </span>
            <Button icone={PiPlus} onClick={() => setSuggesting(true)}>
              Sugerir obra
            </Button>
          </span>
        )}
      </div>

      <div className="grid gap-12 lg:grid-cols-3">
        <Section title="Estudando" detail="Das aulas e tarefas">
          {r.studying.length === 0 ? (
            <p className="text-sm text-texto-fraco">
              Nenhuma obra ligada às aulas e tarefas ainda.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {r.studying.map((s) => (
                <li key={s.work.id}>
                  <WorkCited work={s.work} compact />
                </li>
              ))}
            </ul>
          )}
        </Section>
        <Section title="Quer aprender">
          {r.wantToLearn.length === 0 ? (
            <p className="text-sm text-texto-fraco">Vazio por enquanto.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {r.wantToLearn.map((w) => (
                <li key={w.id} className="flex flex-col gap-1">
                  <WorkCited work={w.work} compact />
                  <span className="t-legenda">
                    {w.suggestedBy
                      ? `Sugerida por ${w.suggestedBy}`
                      : `Desde ${shortDateYear(dayOf(w.addedAt))}`}
                    {w.score ? ` · ${w.score.title}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
        <Section title="Já aprendeu">
          {r.learned.length === 0 ? (
            <p className="text-sm text-texto-fraco">Vazio por enquanto.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {r.learned.map((l) => (
                <li key={l.id} className="flex flex-col gap-1">
                  <WorkCited work={l.work} compact />
                  <span className="t-legenda">
                    Em {shortDateYear(dayOf(l.learnedAt))}
                    {MASTERY[l.mastery] ? ` · ${MASTERY[l.mastery]}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}
