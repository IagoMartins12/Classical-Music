import type { NextRequest } from 'next/server';

/**
 * A score file through the site's own address, so the app can keep it on
 * the device ("Guardar no aparelho") and open it without network.
 *
 * The PDFs live on the IMSLP and on Cloudinary; a file from another origin
 * cannot be read by the page (no CORS), so it could only be cached as an
 * opaque response the browser will not open offline. Here the server fetches
 * it and streams it back, same-origin.
 *
 * Only known hosts: anything else would turn this into an open proxy.
 */
const HOSTS = [/(^|\.)imslp\.org$/, /^imslp\.eu$/, /^res\.cloudinary\.com$/];
const TYPES = /^(application\/pdf|image\/)/;

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('url');
  let alvo: URL;
  try {
    alvo = new URL(raw ?? '');
  } catch {
    return new Response('Endereço inválido', { status: 400 });
  }
  if (alvo.protocol !== 'https:' || !HOSTS.some((h) => h.test(alvo.hostname)))
    return new Response('Host não permitido', { status: 400 });

  const origem = await fetch(alvo, {
    redirect: 'follow',
    headers: { 'User-Agent': 'OpusAtlas/1.0 (+https://opusatlas.com.br)' },
    cache: 'no-store',
  }).catch(() => null);
  if (!origem?.ok || !origem.body)
    return new Response('Arquivo indisponível', { status: 502 });

  const tipo = origem.headers.get('content-type') ?? 'application/pdf';
  // A redirect to a disclaimer page (some IMSLP files) is HTML, not a score.
  if (!TYPES.test(tipo))
    return new Response('O arquivo não é uma partitura', { status: 415 });

  const headers = new Headers({
    'Content-Type': tipo,
    'Content-Disposition': 'inline',
    'Cache-Control': 'private, max-age=86400',
    'X-Content-Type-Options': 'nosniff',
  });
  const tamanho = origem.headers.get('content-length');
  if (tamanho) headers.set('Content-Length', tamanho);
  return new Response(origem.body, { headers });
}
