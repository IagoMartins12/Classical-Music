'use client';

import { ErrorView } from '@/app/components/site/status/StatusViews';
import { useRecarregarPorCodigoAntigo } from '@/app/components/site/status/useRecarregarPorCodigoAntigo';

/**
 * "Op. 500": a failure on our side, with a full reload and the error id to
 * report. Next's `reset` only re-renders the segment; a failure is better
 * met with fresh code and data. Stale code after a deploy reloads by itself
 * instead (see the hook).
 *
 * This is the page-wide one, for what has no shell of its own. Each route
 * group with a shell has an `error.tsx` that keeps it standing.
 */
export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const recarregar = useRecarregarPorCodigoAntigo(error);

  // The reload veil is on screen; the error page would only flash under it.
  if (recarregar) return null;
  return <ErrorView digest={error.digest} />;
}
