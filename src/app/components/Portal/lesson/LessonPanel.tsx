'use client';

// O detalhe da aula ao lado da lista (calendário e aulas, no computador) —
// a lateral de contexto do esboço C, pedida em 04/10 no lugar do modal. No
// tablet e no telefone a mesma aula abre na folha.

import { useCallback, useState } from 'react';
import { PiX } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { useMediaQuery } from '@/app/hooks/useMediaQuery';
import { errorText, useLesson } from '@/app/hooks/portal/query';
import type { Role } from '@/app/requests/portal/api';
import { ScreenError, ScreenLoading } from '../pieces';
import { usePortal } from '../PortalProvider';
import { LessonActions, LessonDetail } from './LessonDetail';
import { lessonTitle } from './lessonText';

/** Abre a aula ao lado (computador) ou na folha (tablet e telefone). */
export function useLessonSelection(initial: string | null = null) {
  const wide = useMediaQuery('(min-width: 1280px)');
  const { open } = usePortal();
  const [selected, setSelected] = useState<string | null>(initial);
  const select = useCallback(
    (id: string) => {
      if (wide) setSelected((current) => (current === id ? null : id));
      else open({ type: 'lesson', id });
    },
    [wide, open]
  );
  return {
    selected: wide ? selected : null,
    select,
    clear: () => setSelected(null),
    wide,
  };
}

/** Só aparece com uma aula escolhida (pedido de 05/10: sem painel vazio). */
export function LessonPanel({
  id,
  role,
  onClose,
}: {
  id: string;
  role: Role;
  onClose: () => void;
}) {
  const { open } = usePortal();
  const lesson = useLesson(id);

  return (
    <aside
      aria-label="Detalhe da aula"
      className="portal-contexto sticky top-20 flex max-h-[calc(100dvh-6rem)] flex-col overflow-hidden rounded-card bg-sup-2"
    >
      {lesson.isPending ? (
        <div className="p-5">
          <ScreenLoading rows={3} label="Carregando a aula" />
        </div>
      ) : lesson.error || !lesson.data ? (
        <div className="p-5">
          <ScreenError
            message={errorText(lesson.error)}
            onRetry={() => lesson.refetch()}
          />
        </div>
      ) : (
        <>
          <header
            key={id}
            className="entra flex items-start gap-3 border-b border-linha p-5"
          >
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <h2 className="font-display text-2xl leading-tight">
                {lesson.data.title}
              </h2>
              <span className="t-legenda">
                {lessonTitle(lesson.data).subtitle}
              </span>
            </span>
            <Button
              variante="fantasma"
              tamanho="p"
              icone={PiX}
              rotulo="Fechar o detalhe"
              onClick={onClose}
            />
          </header>
          <div
            key={`${id}-corpo`}
            className="entra min-h-0 flex-1 overflow-y-auto p-5 rolagem-discreta"
          >
            <LessonDetail lesson={lesson.data} role={role} open={open} />
          </div>
          {/* Painel estreito: as ações empilhadas na largura toda, a principal em cima. */}
          <footer className="flex flex-col-reverse gap-2 border-t border-linha p-4 empty:hidden [&>button]:w-full">
            <LessonActions
              lesson={lesson.data}
              role={role}
              open={open}
              onDone={onClose}
            />
          </footer>
        </>
      )}
    </aside>
  );
}
