'use client';

import { useEffect } from 'react';
import { ErrorView } from '@/app/components/site/status/StatusViews';

/**
 * "Op. 500": a failure on our side, with a full reload and the error id to
 * report. Next's `reset` only re-renders the segment; a failure is better
 * met with fresh code and data.
 */
export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);
  return <ErrorView digest={error.digest} />;
}
