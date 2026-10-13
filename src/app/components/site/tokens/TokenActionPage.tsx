'use client';

import { useParams } from 'next/navigation';
import { recarregarTudo } from '@/app/libs/pwa/recarregar';
import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
  type SVGProps,
} from 'react';
import {
  PiArrowClockwise,
  PiEnvelopeSimple,
  PiWarningCircle,
} from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { TOKENS } from '@/app/conteudo/site/tokens';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { TokenFrame } from './TokenFrame';

/** What the compat layer answers for every token action. */
export interface TokenResult {
  success: boolean;
  errorCode?: string;
  alreadyConfirmed?: boolean;
  message?: string;
  [key: string]: unknown;
}

/** The compat layer flags throttling apart from the token code. */
export const failureCode = (result: TokenResult) =>
  result.rateLimited ? 'RATE_LIMITED' : (result.errorCode ?? 'INVALID_TOKEN');

type State =
  | { kind: 'running' }
  | { kind: 'done'; result: TokenResult }
  | { kind: 'failed'; code: string };

/**
 * One e-mail link, one action. It runs once per token (never twice: the link
 * is single-use and React may mount twice in development), then shows the
 * outcome. An expired link can ask for a new one when the flow allows.
 */
export function TokenActionPage({
  icon,
  loading,
  run,
  resend,
  success,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  loading: string;
  run: (token: string) => Promise<TokenResult>;
  resend?: (token: string) => Promise<TokenResult>;
  success: (result: TokenResult) => {
    title: string;
    text: ReactNode;
    actions: ReactNode;
  };
}) {
  const copy = TOKENS[useRouteLanguage().language];
  const token = String(useParams()?.token ?? '');
  const [state, setState] = useState<State>({ kind: 'running' });
  const [resent, setResent] = useState<'idle' | 'sending' | 'sent' | 'failed'>(
    'idle'
  );
  const started = useRef<string | null>(null);

  const start = () => {
    if (!token) return setState({ kind: 'failed', code: 'NO_TOKEN' });
    setState({ kind: 'running' });
    run(token).then(
      (result) =>
        setState(
          result.success
            ? { kind: 'done', result }
            : { kind: 'failed', code: failureCode(result) }
        ),
      () => setState({ kind: 'failed', code: 'CONNECTION_ERROR' })
    );
  };

  useEffect(() => {
    if (started.current === token) return;
    started.current = token;
    start();
  }, [token]);

  if (state.kind === 'running')
    return <TokenFrame icon={icon} title={loading} busy />;

  if (state.kind === 'done') {
    const s = success(state.result);
    return (
      <TokenFrame icon={icon} title={s.title} text={s.text} done>
        {s.actions}
      </TokenFrame>
    );
  }

  const [title, text] = copy.errors[state.code] ?? copy.errors.INVALID_TOKEN;
  const canResend =
    !!resend && state.code === 'EXPIRED_TOKEN' && resent !== 'sent';
  return (
    <TokenFrame
      icon={PiWarningCircle}
      title={title}
      text={resent === 'sent' ? copy.resent : text}
    >
      {canResend && (
        <Button
          variante="primario"
          icone={PiEnvelopeSimple}
          carregando={resent === 'sending'}
          onClick={async () => {
            setResent('sending');
            const result = await resend!(token).catch(() => null);
            setResent(result?.success ? 'sent' : 'failed');
          }}
        >
          {copy.resend}
        </Button>
      )}
      {state.code === 'CONNECTION_ERROR' && (
        <Button
          variante="primario"
          icone={PiArrowClockwise}
          onClick={() => void recarregarTudo()}
        >
          {copy.retry}
        </Button>
      )}
      <Link href="/" className={classesDeBotao()}>
        {copy.home}
      </Link>
    </TokenFrame>
  );
}
