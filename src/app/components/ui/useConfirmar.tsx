'use client';

import { useState } from 'react';
import ConfirmModal from '@/app/components/ConfirmModal';

interface Pedido {
  titulo: string;
  texto: string;
  /** The confirm button: the action, named ("Apagar o aviso"). */
  botao: string;
  /** Defaults to Portuguese, like `ConfirmModal`. */
  cancelar?: string;
  acao: () => unknown;
}

/**
 * Asks before deleting or removing anything that is saved: the same
 * `ConfirmModal` everywhere, without each screen keeping its own state.
 *
 * ```tsx
 * const { confirmar, modal } = useConfirmar();
 * <Button onClick={() => confirmar({ titulo, texto, botao, acao })} />
 * {modal}
 * ```
 */
export function useConfirmar() {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const modal = (
    <ConfirmModal
      isOpen={!!pedido}
      onClose={() => setPedido(null)}
      onConfirm={async () => {
        await pedido?.acao();
        setPedido(null);
      }}
      type="danger"
      title={pedido?.titulo ?? ''}
      message={pedido?.texto ?? ''}
      confirmText={pedido?.botao}
      cancelText={pedido?.cancelar}
    />
  );
  return { confirmar: setPedido, modal };
}
