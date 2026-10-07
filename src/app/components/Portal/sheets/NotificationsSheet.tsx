'use client';

// No celular o sino abre esta folha: os últimos avisos, cada um levando ao
// que fala, e o caminho para a tela de avisos. No computador o mesmo conteúdo
// abre como menu embaixo do sino (NotificationsMenu, pedido de 05/10).

import { Sheet } from '@/app/components/ui/Sheet';
import {
  LatestNotificationsList,
  NotificationsFooter,
  useLatestNotifications,
} from '../notifications/LatestNotifications';
import type { SheetProps } from '../PortalProvider';

export default function NotificationsSheet({
  role,
  onClose,
  closeAll,
}: SheetProps) {
  const state = useLatestNotifications(closeAll);
  return (
    <Sheet
      aberto
      aoFechar={onClose}
      titulo="Avisos"
      largura="p"
      rodape={
        <NotificationsFooter role={role} state={state} onLeave={closeAll} />
      }
    >
      <LatestNotificationsList state={state} />
    </Sheet>
  );
}
