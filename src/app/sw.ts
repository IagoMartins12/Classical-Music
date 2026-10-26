/// <reference types="@serwist/next/typings" />
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkFirst,
  NetworkOnly,
  Serwist,
  StaleWhileRevalidate,
} from 'serwist';
import {
  CACHE_PAGES_PESSOAIS,
  CACHE_PAGINAS,
  CACHE_API_PESSOAL,
  CACHE_API_PUBLICA,
  CACHE_PARTITURAS,
  ROTA_PARTITURA_OFFLINE,
  ehRotaPessoal,
  ehApiPessoal,
  ehApiFresca,
} from './libs/pwa/caches';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const CACHE_ABERTURA = 'opus-atlas-abertura';

/** Same-origin Next routes that must never be cached. */
const ROTAS_DO_NEXT = ['/api/', '/_next/webpack-hmr'];

/** The API the browser calls (another origin in production). */
const ehApi = (url: URL) =>
  url.origin !== self.location.origin && url.pathname.startsWith('/api/');

/**
 * The Opus Atlas service worker: one app for the main site, the blog and
 * the portal, offline-first. Registered only by the installed app
 * (`libs/pwa/app.ts`); in a browser tab the site is always the live one.
 *
 * - **Pages** the person visited open without network (network first, the
 *   saved copy when there is none). Personal and portal pages live in their
 *   own cache, emptied on logout and when another account signs in
 *   (`libs/pwa/limpar.ts`); the admin panels are never cached.
 * - **Public API** answers (catalog, blog) are served from cache and
 *   refreshed behind; **personal** ones (studies, favorites, annotations,
 *   portal) go network first, with the saved copy offline, read-only.
 * - **Scores saved on the device** come from their own cache, filled only by
 *   the "Guardar no aparelho" button, never evicted by the worker.
 * - Without network and without a saved copy, a page falls back to
 *   `/offline`, which lists what is on the device.
 */
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url, sameOrigin }) =>
        sameOrigin && ROTAS_DO_NEXT.some((r) => url.pathname.startsWith(r)),
      handler: new NetworkOnly(),
      method: 'GET',
    },
    {
      // The app's opening (`public/abertura.html`) comes from the device at
      // once, and is refreshed behind for the next time.
      matcher: ({ url, sameOrigin }) =>
        sameOrigin && url.pathname === '/abertura.html',
      handler: new StaleWhileRevalidate({ cacheName: CACHE_ABERTURA }),
    },
    {
      matcher: ({ url, sameOrigin }) =>
        sameOrigin && url.pathname === ROTA_PARTITURA_OFFLINE,
      handler: new CacheFirst({ cacheName: CACHE_PARTITURAS }),
    },
    {
      matcher: ({ request, url, sameOrigin }) =>
        sameOrigin &&
        request.mode === 'navigate' &&
        (url.pathname.startsWith('/admin') ||
          url.pathname.startsWith('/blog/admin')),
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ request, url, sameOrigin }) =>
        sameOrigin &&
        request.mode === 'navigate' &&
        ehRotaPessoal(url.pathname),
      handler: new NetworkFirst({
        cacheName: CACHE_PAGES_PESSOAIS,
        networkTimeoutSeconds: 4,
        plugins: [new ExpirationPlugin({ maxEntries: 60 })],
      }),
    },
    {
      matcher: ({ request, sameOrigin }) =>
        sameOrigin && request.mode === 'navigate',
      handler: new NetworkFirst({
        cacheName: CACHE_PAGINAS,
        networkTimeoutSeconds: 4,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 150,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          }),
        ],
      }),
    },
    {
      matcher: ({ url, request }) =>
        request.method === 'GET' && ehApi(url) && ehApiPessoal(url.pathname),
      handler: new NetworkFirst({
        cacheName: CACHE_API_PESSOAL,
        networkTimeoutSeconds: 5,
        plugins: [new ExpirationPlugin({ maxEntries: 200 })],
      }),
    },
    {
      matcher: ({ url, request }) =>
        request.method === 'GET' && ehApi(url) && ehApiFresca(url.pathname),
      handler: new NetworkFirst({
        cacheName: CACHE_API_PUBLICA,
        networkTimeoutSeconds: 4,
        plugins: [new ExpirationPlugin({ maxEntries: 100 })],
      }),
    },
    {
      matcher: ({ url, request }) => request.method === 'GET' && ehApi(url),
      handler: new StaleWhileRevalidate({
        cacheName: CACHE_API_PUBLICA,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 400,
            maxAgeSeconds: 60 * 60 * 24 * 7,
          }),
        ],
      }),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
});

serwist.addEventListeners();
