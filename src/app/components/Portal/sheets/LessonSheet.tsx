'use client';

// A aula — folha usada no tablet e no telefone e onde não há painel ao lado.
// O conteúdo é o mesmo `LessonDetail` do painel lateral das telas de aula.

import { Sheet } from '@/app/components/ui/Sheet';
import { useLesson } from '@/app/hooks/portal/query';
import { lessonTitle } from '../lesson/lessonText';
import { LessonActions, LessonDetail } from '../lesson/LessonDetail';
import type { SheetProps } from '../PortalProvider';
import { ScreenError, ScreenLoading } from '../pieces';
import { errorText } from '@/app/hooks/portal/query';

export default function LessonSheet({
  request,
  role,
  onClose,
  open,
}: SheetProps<{ type: 'lesson'; id: string }>) {
  const { data: lesson, error, isPending, refetch } = useLesson(request.id);
  const head = lesson ? lessonTitle(lesson) : null;

  return (
    <Sheet
      aberto
      aoFechar={onClose}
      titulo={head?.title ?? 'Aula'}
      descricao={head?.subtitle}
      largura="g"
      rodape={
        lesson ? (
          <LessonActions
            lesson={lesson}
            role={role}
            open={open}
            onDone={onClose}
          />
        ) : undefined
      }
    >
      {isPending ? (
        <ScreenLoading label="Carregando a aula" rows={3} />
      ) : error || !lesson ? (
        <ScreenError message={errorText(error)} onRetry={() => refetch()} />
      ) : (
        <LessonDetail lesson={lesson} role={role} open={open} />
      )}
    </Sheet>
  );
}
