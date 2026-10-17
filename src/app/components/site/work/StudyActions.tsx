'use client';

import { useEffect, useRef, useState } from 'react';
import { PiBookmarkSimple, PiCheckCircle } from 'react-icons/pi';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { NotasSobem } from '@/app/components/ui/NotasSobem';
import { usePulso } from '@/app/components/ui/usePulso';
import { WORK } from '@/app/conteudo/site/work';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { useLearningStore } from '@/app/stores/useLearningStore';
import { LearningModalHost } from '../LearningModalHost';
import { useStudy, type StudyContext } from './useStudy';

/**
 * "Quero estudar" and "Já aprendi" as one segmented control, equal in weight:
 * neutral surface, gold icons, and the state the person is in drawn in the
 * gold tint. Both sides always answer — the active one edits, the other
 * moves the work to its list — so a learned work can go back to studying.
 */
export function StudyActions({ context }: { context: StudyContext }) {
  const copy = WORK[useRouteLanguage().language].study;
  const open = useStudy(context);
  // The learning store fills in the browser; render the neutral state first.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const studying = useLearningStore(
    (s) => mounted && s.isWantToLearn(context.workId)
  );
  const learned = useLearningStore(
    (s) => mounted && s.isLearned(context.workId)
  );

  // The new state moves once when the person changes it, not on load.
  const { pulsar, pulso } = usePulso();
  const state = learned ? 'learned' : studying ? 'studying' : 'none';
  const previous = useRef<string | null>(null);
  const [celebrate, setCelebrate] = useState(0);
  // "Quero estudar": the bookmark drops into the page like a ribbon.
  const [marked, setMarked] = useState(0);
  useEffect(() => {
    if (!mounted) return;
    if (previous.current && previous.current !== state) {
      pulsar();
      if (state === 'learned') setCelebrate((n) => n + 1);
      if (state === 'studying') setMarked((n) => n + 1);
    }
    previous.current = state;
  }, [mounted, state, pulsar]);

  const lado = (ativo: boolean) =>
    cx(
      // On a phone the two halves share the width: tighter padding, one line,
      // and the label truncates instead of breaking the button in two.
      'relative inline-flex min-h-[var(--alvo)] min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-[0.875rem] font-medium sm:flex-none sm:gap-2 sm:px-4 sm:text-[0.9375rem]',
      'transition-colors duration-[var(--t-toque)] ease-saida',
      ativo
        ? 'tint-ouro text-ouro-na-tinta'
        : 'text-texto-suave hover:bg-[var(--interactive-hover)] hover:text-texto'
    );

  return (
    <>
      <div
        role="group"
        aria-label={copy.label}
        className="inline-flex w-full gap-1 rounded-xl bg-sup-2 p-1 sm:w-auto sm:self-start"
      >
        <button
          type="button"
          aria-pressed={studying}
          onClick={() => open('want-to-learn')}
          className={cx(
            lado(studying),
            studying && marked > 0 && 'marcado-agora'
          )}
          {...(studying ? pulso : {})}
        >
          <span
            className={cx(
              'grid shrink-0 text-ouro-texto',
              studying && marked > 0 && 'marcador-cai'
            )}
          >
            <Icon de={PiBookmarkSimple} />
          </span>
          <span className="truncate">
            {studying ? copy.studying : copy.want}
          </span>
        </button>
        <button
          type="button"
          aria-pressed={learned}
          onClick={() => open('learned')}
          className={lado(learned)}
          {...(learned ? pulso : {})}
        >
          {learned && celebrate > 0 && <NotasSobem key={celebrate} />}
          <span className="grid shrink-0 text-ouro-texto">
            <Icon de={PiCheckCircle} />
          </span>
          <span className="truncate">{learned ? copy.done : copy.learned}</span>
        </button>
      </div>
      <LearningModalHost />
    </>
  );
}
