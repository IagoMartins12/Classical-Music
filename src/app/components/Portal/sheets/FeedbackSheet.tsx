'use client';

// "Como foi a aula?" — o retorno do aluno, que o professor lê antes da
// próxima. Uma vez por aula (a API recusa a segunda).

import { useState } from 'react';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Sheet } from '@/app/components/ui/Sheet';
import { useLesson, usePortalMutation } from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import { firstName } from '../format';
import { lessonTitle } from '../lesson/lessonText';
import { Options } from '../pieces';
import type { SheetProps } from '../PortalProvider';

const OVERALL = { hard: 'Difícil', good: 'Boa', great: 'Ótima' } as const;

export default function FeedbackSheet({
  request,
  onClose,
  closeAll,
}: SheetProps<{ type: 'feedback'; id: string }>) {
  const { data: lesson } = useLesson(request.id);
  const [overall, setOverall] = useState<keyof typeof OVERALL>('good');
  const [text, setText] = useState('');
  const teacher = lesson
    ? firstName(api.nameOf(lesson.teacher))
    : 'Seu professor';

  const send = usePortalMutation(
    () =>
      api.giveLessonFeedback(
        request.id,
        `${OVERALL[overall]}.${text.trim() ? ` ${text.trim()}` : ''}`
      ),
    {
      success: `Obrigado. ${teacher} lê antes da próxima aula.`,
      onSuccess: closeAll,
    }
  );

  return (
    <Sheet
      aberto
      aoFechar={onClose}
      titulo="Como foi a aula?"
      descricao={
        lesson ? `${lesson.title} · ${lessonTitle(lesson).subtitle}` : undefined
      }
      largura="p"
      rodape={
        <Button
          variante="primario"
          carregando={send.isPending}
          onClick={() => send.mutate(undefined)}
        >
          Enviar
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <Options
          label="De modo geral"
          value={overall}
          onChange={setOverall}
          options={(Object.keys(OVERALL) as Array<keyof typeof OVERALL>).map(
            (k) => ({ value: k, label: OVERALL[k] })
          )}
        />
        <Field.Area
          label="O que ficou claro, o que não ficou"
          rows={3}
          value={text}
          maxLength={1900}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
    </Sheet>
  );
}
