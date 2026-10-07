'use client';

// components/Portal/help/Tour.tsx — os coachmarks, carregados só quando o "?" abre

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Button } from '@/app/components/ui/Button';
import { cx } from '@/app/components/ui/cx';
import type { Step } from './steps';

const visible = (el: Element) =>
  el.getClientRects().length > 0 && (el as HTMLElement).offsetParent !== null;
const targetOf = (step: Step) =>
  document.querySelector(`[data-ajuda="${step.target}"]`);

export default function Tour({
  steps,
  onClose,
}: {
  steps: Step[];
  onClose: () => void;
}) {
  // Só as partes que esta tela mostra neste tamanho de tela.
  const [valid] = useState(() =>
    steps.filter((s) => {
      const el = targetOf(s);
      return el && visible(el);
    })
  );
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const step = valid[i];

  const measure = useCallback(() => {
    if (!step) return;
    const el = targetOf(step);
    if (el) setRect(el.getBoundingClientRect());
  }, [step]);

  useLayoutEffect(() => {
    if (!step) return;
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    targetOf(step)?.scrollIntoView({
      block: 'center',
      behavior: reduced ? 'auto' : 'smooth',
    });
    measure();
    const t = setTimeout(measure, 380);
    card.current?.focus();
    return () => clearTimeout(t);
  }, [step, measure]);

  useEffect(() => {
    const frame = () => requestAnimationFrame(measure);
    window.addEventListener('scroll', frame, true);
    window.addEventListener('resize', frame);
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight')
        setI((x) => Math.min(x + 1, valid.length - 1));
      if (e.key === 'ArrowLeft') setI((x) => Math.max(x - 1, 0));
    };
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('scroll', frame, true);
      window.removeEventListener('resize', frame);
      window.removeEventListener('keydown', key);
    };
  }, [measure, onClose, valid.length]);

  if (!step) {
    return (
      <div
        className="fixed inset-0 z-dialogo grid place-items-center bg-[var(--bg-overlay)] p-4"
        onClick={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          className="sup-alta max-w-sm p-6 text-[0.9375rem] text-texto-suave"
        >
          Esta tela ainda não tem tour.
        </div>
      </div>
    );
  }

  const gap = 8;
  const width = 340;
  const phone = window.innerWidth < 640;
  const below = rect ? rect.bottom + 230 < window.innerHeight : true;
  const left = rect
    ? Math.min(Math.max(rect.left, 16), window.innerWidth - width - 16)
    : 16;

  return (
    <div className="fixed inset-0 z-dialogo">
      {/* O clique no véu fecha; o recorte deixa a parte explicada à vista. */}
      <div className="absolute inset-0" onClick={onClose} />
      {rect && (
        <div
          aria-hidden="true"
          className="portal-holofote pointer-events-none fixed rounded-card outline outline-2 outline-offset-2 outline-ouro/70"
          style={{
            top: rect.top - gap,
            left: rect.left - gap,
            width: rect.width + gap * 2,
            height: rect.height + gap * 2,
            boxShadow: '0 0 0 200vmax var(--bg-overlay)',
          }}
        />
      )}
      <div
        ref={card}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-titulo"
        aria-describedby="tour-texto"
        tabIndex={-1}
        className={cx(
          'portal-cartao-tour sup-alta fixed flex flex-col gap-4 p-5 outline-none',
          phone && 'inset-x-4 bottom-20'
        )}
        style={
          phone || !rect
            ? undefined
            : below
              ? { top: rect.bottom + gap + 14, left, width }
              : {
                  bottom: window.innerHeight - rect.top + gap + 14,
                  left,
                  width,
                }
        }
      >
        <span className="flex items-center justify-between">
          <span className="t-dado text-xs text-texto-fraco">
            {i + 1} de {valid.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-texto-fraco hover:text-texto"
          >
            Sair do tour
          </button>
        </span>
        <span className="flex flex-col gap-1.5">
          <span id="tour-titulo" className="font-display text-xl leading-tight">
            {step.title}
          </span>
          <span
            id="tour-texto"
            className="text-[0.9375rem] leading-relaxed text-texto-suave"
          >
            {step.text}
          </span>
        </span>
        <span className="flex items-center justify-between gap-2">
          <span className="flex gap-1" aria-hidden="true">
            {valid.map((s, k) => (
              <span
                key={s.target}
                className={cx(
                  'h-1.5 w-1.5 rounded-full',
                  k === i ? 'bg-ouro' : 'bg-linha-forte'
                )}
              />
            ))}
          </span>
          <span className="flex gap-2">
            {i > 0 && (
              <Button
                variante="fantasma"
                tamanho="p"
                onClick={() => setI(i - 1)}
              >
                Voltar
              </Button>
            )}
            <Button
              variante="primario"
              tamanho="p"
              onClick={() => (i === valid.length - 1 ? onClose() : setI(i + 1))}
            >
              {i === valid.length - 1 ? 'Entendi' : 'Próximo'}
            </Button>
          </span>
        </span>
      </div>
    </div>
  );
}
