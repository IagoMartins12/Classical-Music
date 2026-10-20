'use client';

// components/Portal/help/HelpButton.tsx — o "?" de cada tela e o tour
//
// O tour acende uma parte por vez (o resto escurece), diz o que ela faz e
// anda pelo teclado — setas e Esc. Começa também pelo evento `portal:tour`,
// que o último passo das boas-vindas dispara.

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { PiQuestion } from 'react-icons/pi';
import { cx } from '@/app/components/ui/cx';
import type { Role } from '@/app/requests/portal/api';
import type { ScreenId } from '../navigation';
import { stepsFor, type HelpScreen } from './steps';

const Tour = dynamic(() => import('./Tour'), { ssr: false });

export const TOUR_EVENT = 'portal:tour';

/** A tela de ajuda pela rota, para as que não têm item no menu. */
function helpScreen(screen: ScreenId, pathname: string): HelpScreen {
  if (pathname === '/student/convite') return 'invite';
  if (pathname.startsWith('/teacher/lessons/create')) return 'lesson-new';
  if (/^\/teacher\/students\/[^/]+/.test(pathname)) return 'student-page';
  return screen;
}

export function HelpButton({
  role,
  screen,
  pathname,
  className,
}: {
  role: Role;
  screen: ScreenId;
  pathname: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const start = () => setOpen(true);
    window.addEventListener(TOUR_EVENT, start);
    return () => window.removeEventListener(TOUR_EVENT, start);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <button
        type="button"
        data-ajuda="ajuda"
        onClick={() => setOpen(true)}
        aria-label="Ajuda: o que cada parte desta tela faz"
        className={cx(
          'grid h-11 w-11 shrink-0 place-items-center rounded-full text-texto-suave transition-colors duration-[var(--t-toque)] hover:bg-sup-2 hover:text-texto',
          className
        )}
      >
        <PiQuestion aria-hidden="true" className="h-5 w-5" />
      </button>
      {open && (
        <Tour
          steps={stepsFor(role, helpScreen(screen, pathname))}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
