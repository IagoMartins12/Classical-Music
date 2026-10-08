'use client';

import { useEffect, useState } from 'react';
import { PiBookmarkSimple, PiCheckCircle } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
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

  return (
    <>
      {learned ? (
        <span className={badge}>
          <Icon de={PiCheckCircle} /> {copy.done}
        </span>
      ) : studying ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={badge}
            onClick={() => open('want-to-learn')}
          >
            <Icon de={PiBookmarkSimple} /> {copy.studying}
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
