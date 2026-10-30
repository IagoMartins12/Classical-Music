/**
 * The IndexNow key (`/indexnow.txt`): the file the engines read to confirm
 * that the pages the API announces (`seo/indexnow.service.ts` there) are this
 * site's. The same `INDEXNOW_KEY` in both; without it, 404 and nothing is
 * announced.
 */
export const dynamic = 'force-dynamic';

export function GET() {
  const key = process.env.INDEXNOW_KEY?.trim();
  if (!key) return new Response('Not found', { status: 404 });
  return new Response(key, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
