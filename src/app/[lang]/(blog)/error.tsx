'use client';

import { ErroNaCasca } from '@/app/components/site/status/ErroNaCasca';

/** Falha numa página deste grupo: aparece dentro da casca, que segue de pé. */
export default function Error(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErroNaCasca {...props} />;
}
