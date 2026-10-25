'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import {
  PiArrowClockwise,
  PiCaretLeft,
  PiCaretRight,
  PiDownloadSimple,
  PiLinkSimple,
  PiLockSimple,
  PiSparkle,
  PiX,
} from 'react-icons/pi';
import { RecursoDoPlano } from '@/app/components/site/RecursoDoPlano';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { RETROSPECTIVE } from '@/app/conteudo/site/retrospective';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import {
  generateRetrospective,
  myRetrospective,
  retrospectiveStatus,
  type RetroPeriod,
  type RetroStatus,
  type Retrospective as Retro,
} from '@/app/requests/retrospective';

/**
 * "Ver meu histórico" (Plus): a retrospectiva de estudo no estilo da do
 * Spotify. O botão fica nos estudos; sem o Plus ele leva aos planos, e sem
 * obras suficientes diz quantas faltam. Ao abrir, a tela gera (ou reabre a
 * já gerada) e mostra um cartão por vez, como stories.
 */
export function RetrospectiveButton() {
  const { language } = useRouteLanguage();
  const copy = RETROSPECTIVE[language];
  const [status, setStatus] = useState<RetroStatus | null>(null);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(
    () =>
      retrospectiveStatus(language)
        .then(setStatus)
        .catch(() => setStatus(null)),
    [language]
  );
  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!status) return null;

  if (!status.unlocked) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={classesDeBotao('secundario', 'p')}
        >
          <Icon de={PiLockSimple} tamanho="pp" /> {copy.button}
          <span className="tint-ouro rounded-full px-2 py-0.5 text-[0.6875rem] font-medium text-ouro-na-tinta">
            {copy.plus}
          </span>
        </button>
        <RecursoDoPlano
          recurso="history"
          aberto={open}
          aoFechar={() => setOpen(false)}
        />
      </>
    );
  }

  const any = status.periods.all.eligible;
  return (
    <>
      <Button
        variante="primario"
        tamanho="p"
        icone={PiSparkle}
        disabled={!any}
        title={any ? undefined : copy.missing(status.periods.all.missing)}
        onClick={() => setOpen(true)}
      >
        {copy.button}
      </Button>
      {!any && (
        <span className="t-legenda">
          {copy.missing(status.periods.all.missing)}
        </span>
      )}
      {open && (
        <RetrospectiveStory
          status={status}
          onClose={() => {
            setOpen(false);
            void refresh();
          }}
        />
      )}
    </>
  );
}

const STORY_MS = 6500;

function RetrospectiveStory({
  status,
  onClose,
}: {
  status: RetroStatus;
  onClose: () => void;
}) {
  const { language } = useRouteLanguage();
  const copy = RETROSPECTIVE[language];
  const yearOk = status.periods.year.eligible;
  const [period, setPeriod] = useState<RetroPeriod>(yearOk ? 'year' : 'all');
  const [retro, setRetro] = useState<Retro | null>(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const info = status.periods[period];

  const load = useCallback(
    async (p: RetroPeriod, again = false) => {
      setBusy(true);
      setRetro(null);
      setIndex(0);
      try {
        const saved = status.periods[p].saved;
        const r =
          saved && !again
            ? await myRetrospective(p, language)
            : await generateRetrospective(p, language);
        setRetro(r);
      } catch {
        toast.error(copy.failed);
        onClose();
      } finally {
        setBusy(false);
      }
    },
    [status, language, copy.failed, onClose]
  );

  useEffect(() => {
    void load(period);
  }, [period, load]);

  // As frases de "gerando" giram enquanto espera.
  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => setStep((s) => s + 1), 1400);
    return () => clearInterval(t);
  }, [busy]);

  const total = retro?.cards.length ?? 0;
  const go = useCallback(
    (d: 1 | -1) =>
      setIndex((i) => Math.min(Math.max(i + d, 0), Math.max(total - 1, 0))),
    [total]
  );

  // Avança sozinho, como stories; pausa enquanto o dedo (ou o mouse) segura.
  useEffect(() => {
    if (!retro || paused || index >= total - 1) return;
    const t = setTimeout(() => go(1), STORY_MS);
    return () => clearTimeout(t);
  }, [retro, paused, index, total, go]);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [go, onClose]);

  const card = retro?.cards[index];
  const shareUrl = retro
    ? `${window.location.origin}/retrospective/${retro.shareId}`
    : '';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.button}
      className="retro fixed inset-0 z-dialogo flex items-center justify-center bg-[#0c0a07]/95 p-0 sm:p-6"
    >
      <div className="relative flex h-full w-full max-w-[28rem] flex-col overflow-hidden bg-[#14110d] text-[#f3ece0] sm:h-[min(52rem,100%)] sm:rounded-[1.5rem]">
        {/* Barras de progresso, uma por cartão. */}
        <div className="flex gap-1 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
          {(retro?.cards ?? [0, 1, 2]).map((_, i) => (
            <span
              key={i}
              className="h-1 flex-1 overflow-hidden rounded-full bg-white/15"
            >
              <span
                className={cx(
                  'block h-full bg-[#d4af37]',
                  i < index
                    ? 'w-full'
                    : i === index && retro
                      ? 'retro-barra'
                      : 'w-0'
                )}
                style={
                  i === index && retro
                    ? {
                        animationDuration: `${STORY_MS}ms`,
                        animationPlayState: paused ? 'paused' : 'running',
                      }
                    : undefined
                }
              />
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 px-4 pt-3">
          <div className="flex gap-1 rounded-full bg-white/10 p-1">
            {(['year', 'all'] as RetroPeriod[]).map((p) => (
              <button
                key={p}
                type="button"
                disabled={busy || (p === 'year' && !yearOk)}
                onClick={() => setPeriod(p)}
                className={cx(
                  'rounded-full px-3 py-1 text-[0.8125rem] transition-colors disabled:opacity-40',
                  period === p
                    ? 'bg-[#d4af37] text-[#14110d]'
                    : 'text-[#f3ece0]/80'
                )}
              >
                {p === 'year'
                  ? copy.periods.year(status.year)
                  : copy.periods.all}
              </button>
            ))}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full text-[#f3ece0]/80 hover:bg-white/10"
          >
            <Icon de={PiX} rotulo={copy.close} />
          </button>
        </div>

        <div
          className="relative flex flex-1 flex-col justify-center px-7"
          onPointerDown={() => setPaused(true)}
          onPointerUp={() => setPaused(false)}
          onPointerLeave={() => setPaused(false)}
        >
          {busy || !card ? (
            <div role="status" className="flex flex-col items-start gap-5">
              <span className="retro-pulso h-14 w-14 rounded-full bg-[#d4af37]/80" />
              <p className="font-display text-[2rem] leading-tight">
                {copy.generating}
              </p>
              <p key={step} className="rise text-[#f3ece0]/70">
                {copy.generatingSteps[step % copy.generatingSteps.length]}
              </p>
            </div>
          ) : (
            <div
              key={`${period}-${index}`}
              className="retro-entra flex flex-col gap-5"
            >
              <span className="text-[0.8125rem] uppercase tracking-[0.2em] text-[#d4af37]">
                {card.eyebrow}
              </span>
              {card.value && (
                <span className="font-display text-[clamp(4rem,22vw,6.5rem)] leading-none text-[#d4af37]">
                  {card.value}
                </span>
              )}
              <h2 className="font-display text-[clamp(1.875rem,8vw,2.5rem)] leading-[1.08]">
                {card.title}
              </h2>
              {card.detail && (
                <p className="text-[1.0625rem] text-[#f3ece0]/75">
                  {card.detail}
                </p>
              )}
              {card.list && card.list.length > 0 && (
                <ol className="flex flex-col gap-2 pt-2">
                  {card.list.map((item, i) => (
                    <li key={item} className="flex gap-3 text-[1.0625rem]">
                      <span className="text-[#d4af37]">{i + 1}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}

          {/* Toque à esquerda volta, à direita avança. */}
          {retro && (
            <>
              <button
                type="button"
                aria-label={copy.previous}
                onClick={() => go(-1)}
                className="absolute inset-y-0 left-0 w-1/3"
              />
              <button
                type="button"
                aria-label={copy.next}
                onClick={() => go(1)}
                className="absolute inset-y-0 right-0 w-2/3"
              />
            </>
          )}
        </div>

        {retro && (
          <div className="flex flex-col gap-3 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {info.saved?.stale && (
              <p className="text-[0.8125rem] text-[#f3ece0]/70">{copy.stale}</p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`/og/retro/${retro.shareId}?card=${index}&download=1`}
                className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#d4af37] px-4 text-[0.875rem] font-medium text-[#14110d]"
              >
                <Icon de={PiDownloadSimple} tamanho="pp" /> {copy.download}
              </a>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard?.writeText(shareUrl);
                  toast.success(copy.copied);
                }}
                className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-[0.875rem]"
              >
                <Icon de={PiLinkSimple} tamanho="pp" /> {copy.copyLink}
              </button>
              {info.saved && (
                <button
                  type="button"
                  onClick={() => void load(period, true)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-[0.875rem] text-[#f3ece0]/80 hover:bg-white/10"
                >
                  <Icon de={PiArrowClockwise} tamanho="pp" /> {copy.regenerate}
                </button>
              )}
              <span className="ml-auto flex gap-1">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  disabled={index === 0}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/10 disabled:opacity-30"
                >
                  <Icon de={PiCaretLeft} rotulo={copy.previous} />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  disabled={index >= total - 1}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/10 disabled:opacity-30"
                >
                  <Icon de={PiCaretRight} rotulo={copy.next} />
                </button>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
