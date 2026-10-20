// app/calendar-feed/[token]/route.ts — o calendário assinado, no domínio do site
//
// O Google Agenda e o Calendário da Apple buscam este endereço sem login, de
// tempos em tempos. Ele repassa para a API (`GET /calendar/feed/:token`), que
// confere o token. O endereço é do site — é o domínio que a pessoa reconhece
// na lista de calendários dela.
import { apiUrl } from '@/app/libs/api/client';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  // Token é base64url; o `.ics` do fim é opcional. Qualquer outra coisa nem vai à API.
  if (!/^[A-Za-z0-9_-]{20,100}(\.ics)?$/.test(token)) {
    return new Response('Calendário não encontrado', { status: 404 });
  }

  const upstream = await fetch(
    apiUrl(`/calendar/feed/${encodeURIComponent(token)}`),
    {
      cache: 'no-store',
      headers: { Accept: 'text/calendar' },
    }
  ).catch(() => null);

  if (!upstream)
    return new Response('Calendário indisponível', { status: 502 });
  if (!upstream.ok) {
    return new Response(
      upstream.status === 404
        ? 'Calendário não encontrado'
        : 'Calendário indisponível',
      {
        status: upstream.status === 404 ? 404 : 502,
      }
    );
  }

  return new Response(await upstream.text(), {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'private, max-age=300',
      'Content-Disposition': 'inline; filename="opus-atlas.ics"',
      'X-Robots-Tag': 'noindex',
    },
  });
}
