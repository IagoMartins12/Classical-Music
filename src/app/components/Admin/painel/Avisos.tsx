'use client';

import { useEffect, useRef } from 'react';
import { Toaster, useToasterStore } from 'react-hot-toast';

/**
 * Os avisos rápidos do painel ("Cupom criado", "Não foi possível salvar").
 *
 * Sempre no canto superior direito e **sempre por cima**: modais e folhas
 * abrem na camada de topo do navegador (`<dialog>`), onde nenhum z-index
 * alcança — o aviso de "Atualizado" ficava escondido atrás do diálogo que o
 * disparou. O contêiner é um `popover` (também camada de topo) e volta ao
 * topo da pilha a cada aviso novo.
 *
 * Nas cores do sistema: a superfície alta de diálogo, texto de texto, e a
 * cor de estado só no ícone.
 */
export function Avisos() {
  const ref = useRef<HTMLDivElement>(null);
  const { toasts } = useToasterStore();
  const visiveis = toasts.filter((t) => t.visible).length;

  useEffect(() => {
    const camada = ref.current;
    if (!camada || !('showPopover' in camada)) return;
    try {
      // Esconder e mostrar de novo põe o popover acima do diálogo mais novo.
      if (camada.matches(':popover-open')) camada.hidePopover();
      camada.showPopover();
    } catch {
      // Navegador sem popover: fica o z-index, como antes.
    }
  }, [toasts]);

  return (
    <div
      ref={ref}
      popover="manual"
      aria-hidden={visiveis === 0 ? true : undefined}
      className="pointer-events-none fixed inset-0 z-aviso m-0 h-full max-h-none w-full max-w-none overflow-visible border-0 bg-transparent p-0"
    >
      <Toaster
        position="top-right"
        containerStyle={{ pointerEvents: 'none' }}
        toastOptions={{
          duration: 4000,
          style: {
            pointerEvents: 'auto',
            background: 'var(--sup-alta)',
            color: 'var(--texto)',
            border: '1px solid var(--linha-forte)',
            borderRadius: 'var(--r-controle)',
            boxShadow: 'var(--sombra-alta)',
            fontSize: '0.9375rem',
            maxWidth: '420px',
          },
          success: {
            iconTheme: {
              primary: 'var(--ouro)',
              secondary: 'var(--sobre-ouro)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--erro)',
              secondary: 'var(--sobre-erro)',
            },
          },
          loading: {
            iconTheme: { primary: 'var(--ouro)', secondary: 'var(--linha)' },
          },
        }}
      />
    </div>
  );
}
