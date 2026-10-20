'use client';

// O sino do cabeçalho. No computador abre um menu pequeno logo embaixo dele,
// como era antes; no celular abre a folha de avisos (pedido de 05/10). O menu
// fecha com Esc, com clique fora e ao trocar de página.

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { PiBell } from 'react-icons/pi';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { useMediaQuery } from '@/app/hooks/useMediaQuery';
import type { Role } from '@/app/requests/portal/api';
import { usePortal } from '../PortalProvider';
import {
  LatestNotificationsList,
  NotificationsFooter,
  useLatestNotifications,
} from './LatestNotifications';

export function NotificationsMenu({
  role,
  unread,
}: {
  role: Role;
  unread: number;
}) {
  const { open: openSheet } = usePortal();
  const desktop = useMediaQuery('(min-width: 768px)');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const bell = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname, desktop]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      bell.current?.focus();
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={box} className="relative">
      <button
        ref={bell}
        type="button"
        data-ajuda="avisos"
        onClick={() =>
          desktop ? setOpen((o) => !o) : openSheet({ type: 'notifications' })
        }
        aria-label={unread ? `Avisos, ${unread} não lidos` : 'Avisos'}
        aria-expanded={desktop ? open : undefined}
        aria-controls={desktop && open ? 'portal-avisos' : undefined}
        className={cx(
          'relative grid h-11 w-11 place-items-center rounded-controle text-texto-suave transition-colors hover:bg-sup-2 hover:text-texto',
          open && 'bg-sup-2 text-texto'
        )}
      >
        <Icon de={PiBell} tamanho="m" />
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-ouro"
          />
        )}
      </button>
      {open && <Dropdown role={role} onClose={() => setOpen(false)} />}
    </div>
  );
}

// Montado só quando aberto: a busca dos avisos começa ao abrir o menu.
function Dropdown({ role, onClose }: { role: Role; onClose: () => void }) {
  const state = useLatestNotifications(onClose);
  return (
    <div
      id="portal-avisos"
      role="dialog"
      aria-label="Avisos"
      className="sup-alta absolute right-0 top-full z-menu mt-2 flex w-96 flex-col overflow-hidden shadow-[var(--sombra-2)]"
    >
      <p className="t-rotulo px-4 pb-1 pt-4 font-medium text-texto">Avisos</p>
      <div className="max-h-[min(28rem,70dvh)] overflow-y-auto px-3">
        <LatestNotificationsList state={state} />
      </div>
      <div className="flex items-center gap-2 border-t border-linha px-4 py-2">
        <NotificationsFooter role={role} state={state} onLeave={onClose} />
      </div>
    </div>
  );
}
