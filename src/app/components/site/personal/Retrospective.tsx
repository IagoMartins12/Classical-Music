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
import { Aba, Abas } from '@/app/components/ui/Abas';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { RETROSPECTIVE } from '@/app/conteudo/site/retrospective';
import { PranchaDoAno, TextoDoCartao } from './PranchaDoAno';
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
export function RetrospectiveButton({ className }: { className?: string }) {
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
          className={cx(classesDeBotao('secundario', 'p'), className)}
        >
          <Icon de={PiLockSimple} tamanho="pp" /> {copy.button}
          <span className="tint-ouro rounded-full px-2.5 py-0.5 text-[0.8125rem] font-medium text-ouro-na-tinta">
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
        className={className}
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
    // Sempre noturna (`.noite`): o céu do globo da home, em qualquer tema.
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.button}
      className="noite fixed inset-0 z-dialogo flex items-center justify-center bg-[var(--bg-overlay)] sm:p-6"
    >
      <div className="relative flex h-full w-full max-w-[28rem] flex-col overflow-hidden bg-fundo sm:h-[min(54rem,100%)] sm:rounded-folha sm:border sm:border-linha sm:shadow-[var(--sombra-alta)]">
        {/* A régua do cartão: um traço por cartão, o atual enchendo em ouro. */}
        <div className="flex gap-1.5 px-5 pt-[max(1rem,env(safe-area-inset-top))]">
          {(retro?.cards ?? [0, 1, 2]).map((_, i) => (
            <span
              key={i}
              className="h-[2px] flex-1 overflow-hidden rounded-full bg-linha-forte"
            >
              <span
                className={cx(
                  'block h-full bg-ouro',
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

        <div className="flex items-center justify-between gap-2 px-3 pt-2">
          <Abas rotulo={copy.periodLabel}>
            {(['year', 'all'] as RetroPeriod[]).map((p) => (
              <Aba
                key={p}
                ativa={period === p}
                disabled={busy || (p === 'year' && !yearOk)}
                onClick={() => setPeriod(p)}
              >
                {p === 'year'
                  ? copy.periods.year(status.year)
                  : copy.periods.all}
              </Aba>
            ))}
          </Abas>
          <Button
            ref={closeRef}
            variante="fantasma"
            icone={PiX}
            rotulo={copy.close}
            onClick={onClose}
          />
        </div>

        <div
          className="relative flex min-h-0 flex-1 flex-col items-stretch justify-center gap-7 px-7 pb-2"
          onPointerDown={() => setPaused(true)}
          onPointerUp={() => setPaused(false)}
          onPointerLeave={() => setPaused(false)}
        >
          {/* Toque à esquerda volta, à direita avança. O cartão passa por cima
              sem pegar o toque, menos nos links das próximas obras. */}
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

          {busy || !card ? (
            <div role="status" className="flex flex-col gap-7">
              <PranchaDoAno
                card={null}
                chave="gerando"
                idioma={language}
                gerando
                className="w-[min(100%,42dvh)]"
              />
              <div className="flex flex-col gap-2">
                <p className="font-display text-[clamp(1.75rem,7vw,2.125rem)] leading-tight text-balance">
                  {copy.generating}
                </p>
                <p key={step} className="rise t-corpo text-texto-suave">
                  {copy.generatingSteps[step % copy.generatingSteps.length]}
                </p>
              </div>
            </div>
          ) : (
            <div
              key={`${period}-${index}`}
              className="pointer-events-none relative flex flex-col gap-7 [&_a]:pointer-events-auto"
            >
              <PranchaDoAno
                card={card}
                chave={`${period}-${index}`}
                idioma={retro?.language ?? language}
                className="w-[min(100%,42dvh)]"
              />
              <TextoDoCartao
                card={card}
                idioma={retro?.language ?? language}
                className="retro-entra"
              />
            </div>
          )}
        </div>

        {retro && (
          <div className="flex flex-col gap-2 border-t border-linha px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            {info.saved?.stale && <p className="t-legenda">{copy.stale}</p>}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`/og/retro/${retro.shareId}?card=${index}&download=1`}
                className={cx(classesDeBotao('primario', 'p'), 'w-full')}
              >
                <Icon de={PiDownloadSimple} tamanho="pp" /> {copy.download}
              </a>
              <Button
                tamanho="p"
                icone={PiLinkSimple}
                className="w-full"
                onClick={() => {
                  void navigator.clipboard?.writeText(shareUrl);
                  toast.success(copy.copied);
                }}
              >
                {copy.copyLink}
              </Button>
            </div>
            {/* Gerar de novo à esquerda; a paginação (‹ 3 / 11 ›) à direita. */}
            <div className="flex min-h-11 items-center justify-between gap-2">
              {info.saved ? (
                <Button
                  tamanho="p"
                  variante="fantasma"
                  icone={PiArrowClockwise}
                  className="-ml-3"
                  onClick={() => void load(period, true)}
                >
                  {copy.regenerate}
                </Button>
              ) : (
                <span />
              )}
              <span className="flex items-center gap-1">
                <Button
                  tamanho="p"
                  variante="fantasma"
                  icone={PiCaretLeft}
                  rotulo={copy.previous}
                  onClick={() => go(-1)}
                  disabled={index === 0}
                />
                <span className="t-dado min-w-[3.5rem] text-center text-[0.8125rem] text-texto-suave tabular-nums">
                  {index + 1} / {total}
                </span>
                <Button
                  tamanho="p"
                  variante="fantasma"
                  icone={PiCaretRight}
                  rotulo={copy.next}
                  onClick={() => go(1)}
                  disabled={index >= total - 1}
                  className="-mr-3"
                />
              </span>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
