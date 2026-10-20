'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { profileApi, type ListView } from '@/app/libs/api/profile';
import type { ProfileAccount } from '@/app/libs/api/profile';
import { SESSION_QUERY_KEY, useSession } from '@/app/libs/session';

const STORAGE_KEY = 'opus-atlas:list-view';
const DEFAULT_VIEW: ListView = 'cards';
const listeners = new Set<() => void>();

function readStored(): ListView | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'cards' || value === 'list' ? value : null;
  } catch {
    return null;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

/**
 * Cards or list, the same on every page that has the toggle. Signed in, the
 * choice lives in the profile (it follows the person across devices); for
 * visitors, in this browser. The server render always starts on cards.
 */
export function useListView(): [ListView, (view: ListView) => void] {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const stored = useSyncExternalStore(subscribe, readStored, () => null);
  const view = session?.user.listView ?? stored ?? DEFAULT_VIEW;

  const setView = useCallback(
    (next: ListView) => {
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {}
      listeners.forEach((listener) => listener());
      if (!session) return;
      queryClient.setQueryData<ProfileAccount | null>(
        SESSION_QUERY_KEY,
        (account) => (account ? { ...account, listView: next } : account)
      );
      profileApi.update({ account: { listView: next } }).catch(() => {});
    },
    [session, queryClient]
  );

  return [view, setView];
}
