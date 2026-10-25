'use client';

// Os avisos — esboço B (04/10/2026). O sino abre a folha dos últimos; aqui
// está a lista inteira, com os não lidos à parte. Tocar num aviso leva ao que
// ele fala. O professor envia aviso daqui.

import { useRouter } from 'next/navigation';
import { abrirPagina } from '@/app/components/ui/transicao';
import { useState } from 'react';
import { PiBell, PiEnvelopeSimple, PiTrash } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { cx } from '@/app/components/ui/cx';
import {
  errorText,
  portalKeys,
  useNotifications,
  usePortalMutation,
} from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import type { PortalNotification, Role } from '@/app/requests/portal/api';
import { ago } from '../format';
import {
  Empty,
  FilterChips,
  PageHeader,
  ScreenError,
  ScreenLoading,
} from '../pieces';
import { usePortal } from '../PortalProvider';

type Filter = 'all' | 'UNREAD';
const PAGE = 30;

export function NotificationsScreen({ role }: { role: Role }) {
  const router = useRouter();
  const { open } = usePortal();
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(1);
  const list = useNotifications({
    page,
    limit: PAGE,
    ...(filter === 'UNREAD' ? { status: 'UNREAD' } : {}),
  });
  const invalidate = [['portal', 'notifications'], portalKeys.unread];
  const read = usePortalMutation((id: string) => api.markNotificationRead(id), {
    invalidate,
  });
  const readAll = usePortalMutation(() => api.markAllNotificationsRead(), {
    success: 'Todos os avisos marcados como lidos.',
    invalidate,
  });
  const remove = usePortalMutation((id: string) => api.deleteNotification(id), {
    invalidate,
  });

  const items = list.data?.notifications ?? [];
  const pages = list.data?.pagination.totalPages ?? 1;
  const unread =
    list.data?.unreadCount ?? items.filter((n) => n.status === 'UNREAD').length;

  const go = (n: PortalNotification) => {
    if (n.status === 'UNREAD') read.mutate(n.id);
    // Obra ou compositor: espera a página ficar pronta (`abrirPagina`).
    if (n.actionUrl)
      abrirPagina(n.actionUrl, router.push, {
        origem: document.activeElement as HTMLElement | null,
        preCarregar: router.prefetch,
      });
  };

  return (
    <>
      <PageHeader
        title="Avisos"
        description="Aula marcada, tarefa entregue, pedido de aula, relatório. Por onde eles chegam fora do portal você escolhe no Perfil."
        actions={
          <>
            {unread > 0 && (
              <Button
                variante="fantasma"
                carregando={readAll.isPending}
                onClick={() => readAll.mutate(undefined)}
              >
                Marcar todos como lidos
              </Button>
            )}
            {role === 'teacher' && (
              <Button
                variante="primario"
                icone={PiEnvelopeSimple}
                onClick={() => open({ type: 'announce' })}
              >
                Enviar aviso
              </Button>
            )}
          </>
        }
      />
      <div className="flex flex-col gap-6">
        <FilterChips
          value={filter}
          onChange={(f) => (setFilter(f), setPage(1))}
          label="Quais avisos"
          options={[
            ['all', 'Todos'],
            ['UNREAD', 'Não lidos', unread || undefined],
          ]}
        />
        {list.isPending ? (
          <ScreenLoading rows={6} label="Carregando os avisos" />
        ) : list.error ? (
          <ScreenError message={errorText(list.error)} />
        ) : items.length === 0 ? (
          <Empty
            icone={PiBell}
            titulo={
              filter === 'UNREAD'
                ? 'Nenhum aviso por ler'
                : 'Nenhum aviso ainda'
            }
          />
        ) : (
          <ul
            data-ajuda="lista"
            className={cx(
              'flex flex-col transition-opacity',
              list.isFetching && 'opacity-70'
            )}
          >
            {items.map((n) => {
              const isUnread = n.status === 'UNREAD';
              return (
                <li
                  key={n.id}
                  className="group/aviso flex items-start gap-2 border-b border-linha last:border-0"
                >
                  <button
                    type="button"
                    onClick={() => go(n)}
                    className="flex min-w-0 flex-1 gap-3 py-4 text-left"
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
                          isUnread
                            ? 'font-medium text-texto'
                            : 'text-texto-suave'
                        )}
                      >
                        {n.title}
                      </span>
                      <span className="text-sm text-texto-suave">
                        {n.message}
                      </span>
                      <span className="t-legenda">
                        {ago(n.createdAt)}
                        {n.actionText ? ` · ${n.actionText}` : ''}
                        {isUnread && (
                          <span className="sr-only"> · não lido</span>
                        )}
                      </span>
                    </span>
                  </button>
                  <Button
                    variante="fantasma"
                    tamanho="p"
                    icone={PiTrash}
                    rotulo="Apagar o aviso"
                    className="mt-3 opacity-60 group-hover/aviso:opacity-100"
                    onClick={() => remove.mutate(n.id)}
                  />
                </li>
              );
            })}
          </ul>
        )}
        {pages > 1 && (
          <div className="flex items-center gap-3">
            <Button
              variante="fantasma"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anteriores
            </Button>
            <span className="t-dado text-sm text-texto-suave">
              {page} de {pages}
            </span>
            <Button
              variante="fantasma"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Seguintes
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
