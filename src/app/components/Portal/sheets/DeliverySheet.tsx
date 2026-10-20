'use client';

// A entrega esperando retorno: o professor ouve (ou vê) o que o aluno mandou,
// dá a nota e escreve o retorno. O aluno recebe o aviso.

import { useState } from 'react';
import { PiFileText } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import {
  errorText,
  useAssignment,
  usePortalMutation,
} from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import { ago, firstName } from '../format';
import { Block, Rating, ScreenError, ScreenLoading } from '../pieces';
import type { SheetProps } from '../PortalProvider';

export default function DeliverySheet({
  request,
  onClose,
  closeAll,
}: SheetProps<{ type: 'delivery'; id: string }>) {
  const assignment = useAssignment(request.id);
  const [rating, setRating] = useState(4);
  const [feedback, setFeedback] = useState('');
  const a = assignment.data;
  const student = a ? firstName(api.nameOf(a.student)) : '';

  const send = usePortalMutation(
    () =>
      api.giveAssignmentFeedback(request.id, {
        feedback: feedback.trim(),
        rating,
      }),
    {
      success: `Retorno enviado para ${student}.`,
      onSuccess: closeAll,
    }
  );

  return (
    <Sheet
      aberto
      aoFechar={onClose}
      titulo={a?.title ?? 'Entrega'}
      descricao={
        a
          ? `${api.nameOf(a.student)} entregou ${a.completedAt ? ago(a.completedAt) : ''}`.trim()
          : undefined
      }
      largura="m"
      rodape={
        a && (
          <Button
            variante="primario"
            disabled={feedback.trim().length < 2}
            carregando={send.isPending}
            onClick={() => send.mutate(undefined)}
          >
            Enviar retorno
          </Button>
        )
      }
    >
      {assignment.isPending ? (
        <ScreenLoading rows={3} />
      ) : assignment.error || !a ? (
        <ScreenError message={errorText(assignment.error)} />
      ) : (
        <div className="flex flex-col gap-6">
          {a.submissions.entries.length > 0 ? (
            <Block title="O que chegou">
              <ul className="flex flex-col gap-3">
                {a.submissions.entries.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-col gap-2 rounded-card bg-sup-2 p-4"
                  >
                    {s.url && s.kind === 'audio' && (
                      <audio
                        controls
                        preload="none"
                        src={s.url}
                        className="w-full"
                      />
                    )}
                    {s.url && s.kind === 'video' && (
                      <video
                        controls
                        preload="none"
                        src={s.url}
                        className="w-full rounded-controle"
                      />
                    )}
                    {s.url && (s.kind === 'document' || s.kind === 'image') && (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-ouro-texto"
                      >
                        <Icon de={PiFileText} tamanho="p" /> Abrir o arquivo
                      </a>
                    )}
                    {s.note && (
                      <p className="whitespace-pre-line text-[0.9375rem] text-texto-suave">
                        {s.note}
                      </p>
                    )}
                    <span className="t-legenda">
                      Enviado {ago(s.submittedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </Block>
          ) : (
            <p className="rounded-controle bg-sup-2 p-4 text-sm text-texto-suave">
              {student} marcou a tarefa como feita, sem arquivo.
            </p>
          )}
          {a.studentNotes && (
            <Block title={`O que ${student} disse`}>
              <p className="whitespace-pre-line text-[0.9375rem] text-texto-suave">
                {a.studentNotes}
              </p>
            </Block>
          )}
          <Rating
            label="Avaliação"
            value={rating}
            onChange={setRating}
            ends={['Refazer', 'Pronta']}
          />
          <Field.Area
            label="Retorno"
            rows={4}
            value={feedback}
            maxLength={5000}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={`O que ${student} deve ouvir na própria gravação.`}
          />
        </div>
      )}
    </Sheet>
  );
}
