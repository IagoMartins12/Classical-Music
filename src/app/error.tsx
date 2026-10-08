'use client';

import { useEffect } from 'react';
import { ErrorView } from '@/app/components/site/status/StatusViews';

/** "Op. 500": a failure on our side, with a retry and the error id to report. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);
  return <ErrorView reset={reset} digest={error.digest} />;
}
