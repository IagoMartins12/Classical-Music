'use client';

import { useCallback, useState } from 'react';

/**
 * A short pulse on the element that just did something (copied, saved,
 * marked). Spread `pulso` on it and call `pulsar()` when the action lands.
 *
 * The attribute alternates between `a` and `b`, two identical animations in
 * `globals.css`, so each call restarts it without remounting the element:
 * the focus stays where it was. Without motion preference, nothing moves.
 */
export function usePulso() {
  const [fase, setFase] = useState<'a' | 'b' | undefined>();
  const pulsar = useCallback(() => setFase((f) => (f === 'a' ? 'b' : 'a')), []);
  return { pulsar, pulso: { 'data-pulso': fase } };
}
