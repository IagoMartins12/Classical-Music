'use client';

import { useState } from 'react';
import { PiCaretDown } from 'react-icons/pi';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { COMPOSER } from '@/app/conteudo/site/composer';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';

const SHOWN = 3;

/** "Também conhecido como": three names, the rest behind "e mais N". */
export function AlternativeNames({ names }: { names: string[] }) {
  const copy = COMPOSER[useRouteLanguage().language].facts;
  const [all, setAll] = useState(false);
  if (!names.length) return null;
  const visible = all ? names : names.slice(0, SHOWN);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="t-legenda">{copy.alsoKnownAs}</span>
      <p className="t-rotulo text-texto-suave">
        {visible.join(' · ')}
        {names.length > SHOWN && (
          <button
            type="button"
            aria-expanded={all}
            onClick={() => setAll(!all)}
            className="ml-2 inline-flex items-center gap-1 text-ouro-texto underline decoration-transparent underline-offset-4 hover:decoration-[var(--ouro)]"
          >
            {all ? copy.less : copy.more(names.length - SHOWN)}
            <Icon
              de={PiCaretDown}
              tamanho="pp"
              className={cx('transition-transform', all && 'rotate-180')}
            />
          </button>
        )}
      </p>
    </div>
  );
}
