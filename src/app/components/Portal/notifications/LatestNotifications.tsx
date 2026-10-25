'use client';

// Os últimos avisos — o mesmo conteúdo em dois lugares: o menu que abre
// embaixo do sino no computador e a folha no celular (pedido de 05/10).

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { abrirPagina } from '@/app/components/ui/transicao';
import { PiArrowRight } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import {
  errorText,
  portalKeys,
  useNotifications,
  usePortalMutation,
} from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import type { Role } from '@/app/requests/portal/api';
import { ago } from '../format';
import { ScreenError } from '../pieces';
import { Skeleton } from '@/app/components/ui/Skeleton';

const LATEST = 8;

export function useLatestNotifications(onNavigate: () => void) {
  const router = useRouter();
  const list = useNotifications({ page: 1, limit: LATEST });
  const invalidate = [['portal', 'notifications'], portalKeys.unread];
  const read = usePortalMutation((id: string) => api.markNotificationRead(id), {
    invalidate,
  });
  const readAll = usePortalMutation(() => api.markAllNotificationsRead(), {
    success: 'Todos os avisos marcados como lidos.',
    invalidate,
  });
  const items = list.data?.notifications ?? [];
  const go = (n: api.PortalNotification) => {
    if (n.status === 'UNREAD') read.mutate(n.id);
    // Obra ou compositor: espera a página ficar pronta (`abrirPagina`).
    if (n.actionUrl)
      abrirPagina(
        n.actionUrl,
        (href) => {
          onNavigate();
          router.push(href);
        },
        {
          origem: document.activeElement as HTMLElement | null,
          preCarregar: router.prefetch,
        }
      );
  };
  return {
    list,
    items,
    unread: items.filter((n) => n.status === 'UNREAD').length,
    readAll,
    go,
  };
}

export function LatestNotificationsList({
  state,
}: {
  state: ReturnType<typeof useLatestNotifications>;
}) {
  const { list, items, go } = state;
  if (list.isPending)
    return (
      <div className="flex flex-col gap-3 py-2" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} forma="bloco" className="h-12 w-full" />
        ))}
      </div>
    );
  if (list.error) return <ScreenError message={errorText(list.error)} />;
  if (!items.length)
    return (
      <p className="py-2 text-[0.9375rem] text-texto-suave">
        Nenhum aviso por enquanto. Aula marcada, tarefa entregue e pedidos
        aparecem aqui.
      </p>
    );
  return (
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
                <span className="line-clamp-2 text-sm text-texto-suave">
                  {n.message}
                </span>
                <span className="t-legenda">
                  {ago(n.createdAt)}
                  {isUnread && <span className="sr-only"> · não lido</span>}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** "Marcar todos como lidos" (se houver não lidos) e o caminho para a tela de avisos. */
export function NotificationsFooter({
  role,
  state,
  onLeave,
}: {
  role: Role;
  state: ReturnType<typeof useLatestNotifications>;
  onLeave: () => void;
}) {
  return (
    <>
      {state.unread > 0 && (
        <Button
          variante="fantasma"
          tamanho="p"
          carregando={state.readAll.isPending}
          onClick={() => state.readAll.mutate(undefined)}
        >
          Marcar todos como lidos
        </Button>
      )}
      <Link
        href={`/${role}/notifications`}
        onClick={onLeave}
        className="ml-auto inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-ouro-texto [@media(pointer:coarse)]:min-h-[var(--alvo)]"
      >
        Ver todos <Icon de={PiArrowRight} tamanho="p" />
      </Link>
    </>
  );
}
