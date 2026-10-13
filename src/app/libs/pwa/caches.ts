/**
 * Cache names and route rules shared by the service worker (`app/sw.ts`) and
 * the page (saving scores, clearing on logout). One list, so the two never
 * disagree on what is personal.
 */

export const CACHE_PAGINAS = 'paginas';
export const CACHE_PAGES_PESSOAIS = 'paginas-pessoais';
export const CACHE_API_PUBLICA = 'api-publica';
export const CACHE_API_PESSOAL = 'api-pessoal';
export const CACHE_PARTITURAS = 'partituras-no-aparelho';

/** Caches that belong to one account: emptied on logout and account change. */
export const CACHES_PESSOAIS = [CACHE_PAGES_PESSOAIS, CACHE_API_PESSOAL];

/** The same-origin address of a score file saved on the device. */
export const ROTA_PARTITURA_OFFLINE = '/score-file';

/** Pages that depend on who is signed in (main personal pages, portals). */
const ROTAS_PESSOAIS = [
  '/profile',
  '/learning',
  '/favorites',
  '/annotations',
  '/achievements',
  '/my-collections',
  '/upload',
  '/subscription',
  '/student',
  '/teacher',
];

export const ehRotaPessoal = (path: string) =>
  ROTAS_PESSOAIS.some((r) => path === r || path.startsWith(`${r}/`));

/** API reads that depend on who is signed in. */
const API_PESSOAL = [
  '/api/profile',
  '/api/learning',
  '/api/favorites',
  '/api/annotations',
  '/api/collections/mine',
  '/api/uploads',
  '/api/notifications',
  '/api/achievements',
  // Portal
  '/api/dashboard',
  '/api/lessons',
  '/api/lesson-requests',
  '/api/assignments',
  '/api/availability',
  '/api/calendar',
  '/api/practice',
  '/api/reports',
  '/api/school-activities',
  '/api/student',
  '/api/teacher',
];

export const ehApiPessoal = (path: string) =>
  API_PESSOAL.some((r) => path === r || path.startsWith(`${r}/`)) ||
  path.startsWith('/api/admin');
