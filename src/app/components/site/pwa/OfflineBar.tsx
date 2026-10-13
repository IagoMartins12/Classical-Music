'use client';

import Link from 'next/link';
import { PiWifiSlash } from 'react-icons/pi';
import { PWA } from '@/app/conteudo/site/pwa';
import { useOnline } from '@/app/hooks/useOnline';
import { useOverlayLanguage } from '@/app/hooks/useRouteLanguage';

/**
 * Without network, a quiet pill at the bottom says the page is the saved
 * copy and leads to what is on the device. Nothing when online.
 */
export function OfflineBar() {
  const online = useOnline();
  const copy = PWA[useOverlayLanguage()].offline;
  if (online) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-4 z-aviso flex justify-center px-4 pointer-events-none"
    >
      <p className="pointer-events-auto flex max-w-full flex-wrap items-center gap-x-3 gap-y-1 rounded-full border border-[var(--linha-forte)] bg-[var(--sup-alta)] px-4 py-2 text-[0.875rem] text-texto shadow-[var(--sombra-alta)]">
        <PiWifiSlash aria-hidden className="h-4 w-4 shrink-0 text-ouro-texto" />
        <span>{copy.faixa}</span>
        <Link
          href="/offline"
          className="text-ouro-texto underline decoration-transparent underline-offset-4 hover:decoration-[var(--ouro)]"
        >
          {copy.noAparelho}
        </Link>
      </p>
    </div>
  );
}
