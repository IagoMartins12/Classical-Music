'use client';

import { NomeAcao } from './NomeAcao';
import { useEffect, useRef } from 'react';
import {
  ToastBar,
  Toaster,
  resolveValue,
  toast,
  useToasterStore,
  type ToastType,
} from 'react-hot-toast';
import { PiX } from 'react-icons/pi';

/**
 * Os avisos rápidos ("Coleção criada", "Não foi possível salvar"), um só para
 * o site, o blog, os portais e o painel.
 *
 * **Sempre por cima.** Modais e folhas abrem na camada de topo do navegador
 * (`<dialog>`), onde nenhum z-index alcança. O contêiner é um `popover`, que
 * também vive nessa camada, e volta ao topo da pilha a cada aviso novo e a
 * cada diálogo que abre enquanto há aviso na tela.
 *
 * **Na cara do Opus.** A superfície alta dos diálogos e o sinal gravado das
 * órbitas: um anel fino que se traça, com o visto em ouro, a exclamação na cor
 * de erro, ou um astro girando enquanto carrega. A cor fica só no sinal.
 */
export function Avisos() {
  const ref = useRef<HTMLDivElement>(null);
  const { toasts } = useToasterStore();
  const visiveis = toasts.filter((t) => t.visible).length;

  useEffect(() => {
    const camada = ref.current;
    if (!camada || !('showPopover' in camada) || visiveis === 0) return;

    const subir = () => {
      try {
        // Esconder e mostrar de novo põe o popover acima do diálogo mais novo.
        if (camada.matches(':popover-open')) camada.hidePopover();
        camada.showPopover();
      } catch {
        // Navegador sem popover: fica o z-index.
      }
    };
    subir();

    const observador = new MutationObserver((mudancas) => {
      if (
        mudancas.some(
          (m) =>
            m.target instanceof HTMLDialogElement &&
            m.target.hasAttribute('open')
        )
      )
        subir();
    });
    observador.observe(document.body, {
      subtree: true,
      attributeFilter: ['open'],
    });
    return () => observador.disconnect();
  }, [toasts, visiveis]);

  return (
    <div
      ref={ref}
      popover="manual"
      aria-hidden={visiveis === 0 ? true : undefined}
      className="pointer-events-none fixed inset-0 z-aviso m-0 h-full max-h-none w-full max-w-none overflow-visible border-0 bg-transparent p-0"
    >
      <Toaster
        position="top-right"
        gutter={10}
        containerStyle={{ pointerEvents: 'none', inset: 20 }}
        toastOptions={{ duration: 4000 }}
      >
        {(t) => (
          <ToastBar
            toast={t}
            style={{
              pointerEvents: 'auto',
              maxWidth: 'min(26rem, calc(100vw - 2.5rem))',
              padding: 0,
              background: 'var(--sup-alta)',
              color: 'var(--texto)',
              border: '1px solid var(--linha-forte)',
              borderRadius: 'var(--r-controle)',
              boxShadow: 'var(--sombra-alta)',
            }}
          >
            {() => (
              <div className="flex w-full items-center gap-3 py-3 pl-3.5 pr-2">
                <Sinal tipo={t.type} />
                <div className="aviso-texto min-w-0 flex-1 text-[0.9375rem] leading-snug">
                  {resolveValue(t.message, t)}
                </div>
                {t.type !== 'loading' && (
                  <button
                    type="button"
                    onClick={() => toast.dismiss(t.id)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-texto-suave transition-colors hover:bg-[var(--interactive-hover)] hover:text-texto focus-visible:outline-2 focus-visible:outline-ouro"
                  >
                    <PiX aria-hidden="true" className="h-4 w-4" />
                    <NomeAcao acao="fecharAviso" />
                  </button>
                )}
              </div>
            )}
          </ToastBar>
        )}
      </Toaster>
    </div>
  );
}

/** O sinal gravado: anel fino e o traço do estado dentro. */
function Sinal({ tipo }: { tipo: ToastType }) {
  const cor = tipo === 'error' ? 'text-erro' : 'text-ouro';

  if (tipo === 'loading') {
    return (
      <svg
        viewBox="0 0 28 28"
        aria-hidden="true"
        className="aviso-sinal h-7 w-7 shrink-0 text-ouro"
      >
        <circle
          cx="14"
          cy="14"
          r="11"
          fill="none"
          stroke="var(--linha-forte)"
          strokeWidth="1"
        />
        <g className="aviso-astro">
          <path
            d="M14 3a11 11 0 0 1 11 11"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <circle cx="25" cy="14" r="2" fill="currentColor" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`aviso-sinal aviso-traca h-7 w-7 shrink-0 ${cor}`}
    >
      <circle
        pathLength={1}
        cx="14"
        cy="14"
        r="11"
        strokeWidth="1"
        transform="rotate(-90 14 14)"
      />
      {tipo === 'error' ? (
        <path pathLength={1} d="M14 8.5v6.5M14 19.2v.1" strokeWidth="1.8" />
      ) : tipo === 'success' ? (
        <path pathLength={1} d="M9 14.4l3.4 3.4L19.2 11" strokeWidth="1.8" />
      ) : (
        <circle cx="14" cy="14" r="2.2" fill="currentColor" stroke="none" />
      )}
    </svg>
  );
}
