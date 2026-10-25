'use client';

import { useSyncExternalStore } from 'react';

const nada = () => () => {};

/**
 * False on the server and in the hydration render, true right after.
 *
 * For state the browser keeps on its own (a store persisted in
 * `localStorage`): the server cannot know it, so the first render must match
 * the server's HTML and the saved state shows in the render that follows.
 * Without this, React threw a hydration error and rebuilt the tree.
 */
export function useHidratado() {
  return useSyncExternalStore(
    nada,
    () => true,
    () => false
  );
}
