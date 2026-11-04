'use client';

import { useEffect } from 'react';

/**
 * An error is never out of sight, anywhere (04/11).
 *
 * After a submit — or a click on an action button (primary or `submit`),
 * which is how most sheets of the portal and the panel save — the form, or
 * the sheet, or the page around it is watched for a few seconds. The first
 * error to appear (the form's own check or the API's answer) is brought to
 * the middle of the screen when it is out of view, and its field gets the
 * focus. A submit also takes an error already on screen (saving again
 * without fixing it); a click reacts only to a new one, so a button never
 * jumps the page to an old message.
 *
 * Mounted once in the root layout; no form needs to know about it.
 */

/**
 * What marks an error: the field itself (`Field`, `Selecao` and the search
 * fields set `aria-invalid`), the red caption under a hand-built field, or
 * an error notice (`Aviso tom="erro"`, `Erro`).
 */
const ERRO =
  '[aria-invalid="true"], .t-legenda.text-erro:not(:empty), [role="alert"]';

/** How long after the action an error can still show up (the API answering). */
const VIGIA_MS = 8000;

/** The control that triggers the watch on a click. */
const ACAO = 'button[type="submit"], button[data-variante="primario"]';

let parar: (() => void) | null = null;

function escopo(el: Element): Element {
  return (
    el.closest('form') ??
    el.closest('dialog, [role="dialog"]') ??
    el.closest('main') ??
    document.body
  );
}

function visivel(el: Element): boolean {
  const r = el.getBoundingClientRect();
  if (r.top < 0 || r.bottom > window.innerHeight) return false;
  // Inside a scrolling area (a sheet's body): within its own edges too.
  let pai = el.parentElement;
  while (pai && pai !== document.body) {
    const ov = getComputedStyle(pai).overflowY;
    if (ov === 'auto' || ov === 'scroll') {
      const p = pai.getBoundingClientRect();
      return r.top >= p.top && r.bottom <= p.bottom;
    }
    pai = pai.parentElement;
  }
  return true;
}

function levar(erro: Element) {
  if (!visivel(erro)) {
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)')
      .matches;
    erro.scrollIntoView({
      block: 'center',
      behavior: suave ? 'smooth' : 'auto',
    });
  }
  // The field to fix: the invalid control itself, or the one the red
  // caption sits under.
  const campo = erro.matches('input, select, textarea, button')
    ? erro
    : erro
        .closest('div, section, label')
        ?.querySelector(
          'input:not([type=hidden]):not([type=file]), select, textarea, [role=combobox]'
        );
  if (campo instanceof HTMLElement && campo !== document.activeElement) {
    campo.focus({ preventScroll: true });
  }
}

function vigiar(raiz: Element, aceitaOQueJaHavia: boolean) {
  parar?.();
  const antes = aceitaOQueJaHavia
    ? new Set<Element>()
    : new Set(raiz.querySelectorAll(ERRO));
  let feito = false;
  const procurar = () => {
    if (feito) return;
    const erro = [...raiz.querySelectorAll(ERRO)].find((e) => !antes.has(e));
    if (!erro) return;
    feito = true;
    fim();
    levar(erro);
  };
  const observador = new MutationObserver(procurar);
  observador.observe(raiz, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['aria-invalid', 'role'],
  });
  const prazo = window.setTimeout(() => fim(), VIGIA_MS);
  const quadro = requestAnimationFrame(() => requestAnimationFrame(procurar));
  function fim() {
    observador.disconnect();
    window.clearTimeout(prazo);
    cancelAnimationFrame(quadro);
    if (parar === fim) parar = null;
  }
  parar = fim;
}

export function ErroAVista() {
  useEffect(() => {
    const aoEnviar = (e: Event) => {
      if (e.target instanceof HTMLFormElement) vigiar(e.target, true);
    };
    const aoClicar = (e: MouseEvent) => {
      const botao = (e.target as Element | null)?.closest?.(ACAO);
      if (!botao || botao.closest('.lista-flutuante')) return;
      // A submit button runs the submit watch above; this one is for the
      // sheets that save on a click.
      if (botao.matches('[type="submit"]')) return;
      vigiar(escopo(botao), false);
    };
    document.addEventListener('submit', aoEnviar, true);
    document.addEventListener('click', aoClicar, true);
    return () => {
      document.removeEventListener('submit', aoEnviar, true);
      document.removeEventListener('click', aoClicar, true);
      parar?.();
    };
  }, []);
  return null;
}
