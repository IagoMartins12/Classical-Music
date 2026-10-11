'use client';

import { useCallback, useEffect, useState } from 'react';
import { PiArrowClockwise } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { COMPOSER } from '@/app/conteudo/site/composer';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { composerBiography } from '@/app/requests/composer-biography';
import { QuillOnPaper } from '../QuillOnPaper';
import { BiographyText } from './BiographyText';

type State =
  | { kind: 'writing' }
  | { kind: 'done'; text: string; ai: boolean }
  | { kind: 'unavailable' }
  | { kind: 'error' };

/** How long to wait before asking again when the API is still writing. */
const DEFAULT_RETRY_S = 4;
const MAX_ATTEMPTS = 20;

/**
 * No stored biography: ask the API to write one and show it being written
 * (pen and paper) until it is ready. "Unavailable" (the AI does not know the
 * composer) and failures each get their own, calmer drawing.
 */
export function BiographyWriter({
  composerId,
  name,
}: {
  composerId: string;
  name: string;
}) {
  const { language } = useRouteLanguage();
  const copy = COMPOSER[language].bio;
  const [state, setState] = useState<State>({ kind: 'writing' });
  const [attempt, setAttempt] = useState(0);

  const request = useCallback(
    (signal: AbortSignal) =>
      composerBiography(composerId, language, signal)
        .then((result) => {
          if (result.biography !== null) {
            setState({
              kind: 'done',
              text: result.biography,
              ai: result.source === 'generated',
            });
          } else if (result.status === 'generating') {
            setTimeout(
              () => setAttempt((n) => (n < MAX_ATTEMPTS ? n + 1 : n)),
              (result.retryAfter ?? DEFAULT_RETRY_S) * 1000
            );
          } else {
            setState({ kind: 'unavailable' });
          }
        })
        .catch((error: unknown) => {
          if ((error as Error)?.name !== 'AbortError')
            setState({ kind: 'error' });
        }),
    [composerId, language]
  );

  useEffect(() => {
    if (state.kind !== 'writing') return;
    const controller = new AbortController();
    void request(controller.signal);
    return () => controller.abort();
    // `attempt` re-runs the request while the API is still writing.
  }, [attempt, request, state.kind]);

  if (state.kind === 'done') {
    return (
      <BiographyText text={state.text} aiNote={state.ai ? copy.aiNote : null} />
    );
  }

  const writing = state.kind === 'writing';
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-6 rounded-card bg-sup-2 px-6 py-10 text-center"
    >
      {writing ? <QuillOnPaper /> : <BlottedPaper />}
      <div className="flex max-w-[44ch] flex-col items-center gap-2">
        <p className="font-display text-[1.375rem] leading-snug">
          {writing
            ? copy.writing(name)
            : state.kind === 'unavailable'
              ? copy.unavailable(name)
              : copy.error}
        </p>
        <p className="t-rotulo text-texto-suave">
          {writing
            ? copy.writingText
            : state.kind === 'unavailable'
              ? copy.unavailableText
              : copy.errorText}
        </p>
        {state.kind === 'error' && (
          <Button
            tamanho="p"
            icone={PiArrowClockwise}
            className="mt-1"
            onClick={() => {
              setState({ kind: 'writing' });
              setAttempt((n) => n + 1);
            }}
          >
            {copy.retry}
          </Button>
        )}
      </div>
    </div>
  );
}

/** The same paper, with an ink blot: something went wrong, calmly. */
function BlottedPaper() {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      className="h-24 w-24 shrink-0 text-[var(--ouro)]"
    >
      <rect
        x="14"
        y="10"
        width="72"
        height="96"
        rx="4"
        fill="var(--fundo)"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.9"
      />
      {[30, 44].map((y) => (
        <path
          key={y}
          d={`M24 ${y} H76`}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
      ))}
      <path
        className="bio-blot"
        d="M50 66 c10 -8 22 -2 20 9 c6 4 2 14 -6 12 c-3 8 -15 7 -16 -1 c-9 1 -12 -10 -4 -14 c-3 -4 1 -8 6 -6 z"
        fill="currentColor"
        opacity="0.75"
      />
    </svg>
  );
}
