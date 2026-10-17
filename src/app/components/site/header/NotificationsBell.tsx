'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TentarDeNovo } from '@/app/components/ui/TentarDeNovo';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { PiBell } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { cx } from '@/app/components/ui/cx';
import type { HeaderCopy } from '@/app/conteudo/site/header';
import { useMediaQuery } from '@/app/hooks/useMediaQuery';
import { useNotifications, useUnreadCount } from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import { relativeTime } from '../relativeTime';

type Copy = HeaderCopy['notifications'];
const LATEST = 8;

/**
 * The bell of the main site, built like the portal's: a small menu under it
 * on desktop, a sheet on the phone. It shares the portal's query keys, so
 * reading a notice in one place clears the dot in the other. The list is
 * only fetched once it opens; the count polls every minute.
 */
export function NotificationsBell({
  copy,
  language,
}: {
  copy: Copy;
  language: 'pt' | 'en';
}) {
  const desktop = useMediaQuery('(min-width: 768px)');
  const unread = useUnreadCount().data?.unreadCount ?? 0;
  const [open, setOpen] = useState(false);
  // The bell rings when the count goes up after the first load.
  const seen = useRef<number | null>(null);
  const [ring, setRing] = useState(0);
  useEffect(() => {
    if (seen.current !== null && unread > seen.current) setRing((n) => n + 1);
    seen.current = unread;
  }, [unread]);
  const box = useRef<HTMLDivElement>(null);
  const bell = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [desktop]);
  useEffect(() => {
    if (!open || !desktop) return;
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
  }, [open, desktop]);

  const close = () => setOpen(false);

  return (
    <div ref={box} className="relative">
      <button
        ref={bell}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={unread ? copy.unread(unread) : copy.label}
        aria-expanded={open}
        aria-controls={desktop && open ? 'site-avisos' : undefined}
        className={cx(
          'relative grid h-10 w-10 place-items-center rounded-full text-texto-suave transition-colors hover:bg-sup-2 hover:text-texto',
          open && 'bg-sup-2 text-texto'
        )}
      >
        <span key={ring} className={cx('grid', ring > 0 && 'sino-toca')}>
          <Icon de={PiBell} />
        </span>
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="ponto-surge absolute right-2 top-2 h-2 w-2 rounded-full bg-ouro"
          />
        )}
      </button>
      {desktop ? (
        open && (
          <div
            id="site-avisos"
            role="dialog"
            aria-label={copy.label}
            className="sup-alta absolute right-0 top-full z-menu mt-2 flex w-96 flex-col overflow-hidden shadow-[var(--sombra-2)]"
          >
            <p className="t-rotulo px-4 pb-1 pt-4 font-medium text-texto">
              {copy.label}
            </p>
            <Latest copy={copy} language={language} onLeave={close} />
          </div>
        )
      ) : (
        <Sheet aberto={open} aoFechar={close} titulo={copy.label} largura="p">
          {open && <Latest copy={copy} language={language} onLeave={close} />}
        </Sheet>
      )}
    </div>
  );
}

function Latest({
  copy,
  language,
  onLeave,
}: {
  copy: Copy;
  language: 'pt' | 'en';
  onLeave: () => void;
}) {
  const router = useRouter();
  const client = useQueryClient();
  const list = useNotifications({ page: 1, limit: LATEST });
  const refresh = () =>
    client.invalidateQueries({ queryKey: ['portal'] as const });
  const read = useMutation({
    mutationFn: api.markNotificationRead,
    onSuccess: refresh,
  });
  const readAll = useMutation({
    mutationFn: api.markAllNotificationsRead,
    onSuccess: refresh,
  });
  const items = list.data?.notifications ?? [];
  const hasUnread = items.some((n) => n.status === 'UNREAD');
  const go = (n: api.PortalNotification) => {
    if (n.status === 'UNREAD') read.mutate(n.id);
    if (n.actionUrl) {
      onLeave();
      router.push(n.actionUrl);
    }
  };

  let body;
  if (list.isPending)
    body = (
      <div className="flex flex-col gap-3 py-2" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} forma="bloco" className="h-12 w-full" />
        ))}
      </div>
    );
  else if (list.error)
    body = (
      <div className="flex flex-col items-start gap-2 py-2">
        <p className="text-[0.9375rem] text-texto-suave">{copy.failed}</p>
        <TentarDeNovo variante="fantasma" tamanho="p">
          {copy.retry}
        </TentarDeNovo>
      </div>
    );
  else if (!items.length)
    body = (
      <p className="py-2 text-[0.9375rem] text-texto-suave">{copy.empty}</p>
    );
  else
    body = (
      <ul className="flex flex-col">
        {items.map((n) => {
          const isUnread = n.status === 'UNREAD';
          return (
            <li key={n.id} className="border-b border-linha last:border-0">
              <button
                type="button"
                onClick={() => go(n)}
                className="flex w-full gap-3 rounded-controle px-1 py-3 text-left transition-colors hover:bg-sup-2/60 [@media(pointer:coarse)]:min-h-[var(--alvo)]"
              >
                <span
                  aria-hidden="true"
                  className={cx(
                    'mt-2 h-2 w-2 shrink-0 rounded-full',
                    isUnread ? 'bg-ouro' : 'bg-transparent'
                  )}
                />
                <span className="flex min-w-0 flex-col gap-1">
                  <span
                    className={cx(
                      'text-[0.9375rem]',
                      isUnread ? 'font-medium text-texto' : 'text-texto-suave'
                    )}
                  >
                    {n.title}
                  </span>
                  <span className="line-clamp-3 text-sm text-texto-suave">
                    {n.message}
                  </span>
                  <span className="t-legenda">
                    {relativeTime(n.createdAt, language)}
                    {isUnread && (
                      <span className="sr-only"> · {copy.unreadMark}</span>
                    )}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    );

  return (
    <>
      <div className="max-h-[min(28rem,70dvh)] overflow-y-auto px-3 max-md:px-0">
        {body}
      </div>
      {hasUnread && (
        <div className="flex items-center border-t border-linha px-4 py-2 max-md:px-0">
          <Button
            variante="fantasma"
            tamanho="p"
            carregando={readAll.isPending}
            onClick={() => readAll.mutate()}
          >
            {copy.readAll}
          </Button>
        </div>
      )}
    </>
  );
}
