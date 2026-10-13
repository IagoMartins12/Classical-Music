'use client';

import { useEffect, useRef, useState } from 'react';
import { PiBookmarkSimple, PiCheckCircle } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { NotasSobem } from '@/app/components/ui/NotasSobem';
import { usePulso } from '@/app/components/ui/usePulso';
import { WORK } from '@/app/conteudo/site/work';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { useLearningStore } from '@/app/stores/useLearningStore';
import { LearningModalHost } from '../LearningModalHost';
import { useStudy, type StudyContext } from './useStudy';

const badge =
  'inline-flex min-h-[var(--alvo)] items-center gap-2 rounded-controle tint-ouro px-4 text-ouro-na-tinta';

/** "Quero estudar" / "Já aprendi", or where the visitor already is. */
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
  // The new state pulses once when the person changes it, not on load.
  const { pulsar, pulso } = usePulso();
  const state = learned ? 'learned' : studying ? 'studying' : 'none';
  const previous = useRef<string | null>(null);
  const [celebrate, setCelebrate] = useState(0);
  // "Quero aprender": the bookmark drops into the page like a ribbon.
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

  return (
    <>
      {learned ? (
        <span className={`relative ${badge}`} {...pulso}>
          {celebrate > 0 && <NotasSobem key={celebrate} />}
          <Icon de={PiCheckCircle} /> {copy.done}
        </span>
      ) : studying ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={cx(badge, marked > 0 && 'marcado-agora')}
            onClick={() => open('want-to-learn')}
            {...pulso}
          >
            <span className={cx('grid', marked > 0 && 'marcador-cai')}>
              <Icon de={PiBookmarkSimple} />
            </span>{' '}
            {copy.studying}
          </button>
          <Button icone={PiCheckCircle} onClick={() => open('learned')}>
            {copy.learned}
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            variante="primario"
            icone={PiBookmarkSimple}
            onClick={() => open('want-to-learn')}
          >
            {copy.want}
          </Button>
          <Button icone={PiCheckCircle} onClick={() => open('learned')}>
            {copy.learned}
          </Button>
        </div>
      )}
      <LearningModalHost />
    </>
  );
}
