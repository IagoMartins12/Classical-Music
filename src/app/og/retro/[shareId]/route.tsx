import { ImageResponse } from 'next/og';
import {
  sharedRetrospective,
  type RetroCard,
} from '@/app/requests/retrospective';

export const revalidate = 300;

/**
 * Um cartão da retrospectiva como imagem 9:16 (`/og/retro/<id>?card=2`), no
 * tamanho dos stories. Com `download=1` o navegador baixa em vez de abrir.
 * `card` ausente é a capa, usada também como imagem de compartilhamento.
 */
const FUNDO = '#14110d';
const OURO = '#d4af37';
const TEXTO = '#f3ece0';
const SUAVE = '#a89f90';

function tamanhoDoTitulo(texto: string) {
  if (texto.length > 70) return 72;
  if (texto.length > 40) return 88;
  return 104;
}

function desenhar(card: RetroCard, nome: string) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: FUNDO,
        padding: '120px 96px',
        fontFamily: 'serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          color: OURO,
          fontSize: 34,
          letterSpacing: 7,
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{ width: 64, height: 3, background: OURO, display: 'flex' }}
        />
        {card.eyebrow}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {card.value && (
          <div
            style={{
              display: 'flex',
              color: OURO,
              fontSize: 220,
              lineHeight: 1,
            }}
          >
            {card.value}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            color: TEXTO,
            fontSize: tamanhoDoTitulo(card.title),
            lineHeight: 1.08,
          }}
        >
          {card.title}
        </div>
        {card.detail && (
          <div
            style={{
              display: 'flex',
              color: SUAVE,
              fontSize: 44,
              lineHeight: 1.3,
              fontFamily: 'sans-serif',
            }}
          >
            {card.detail}
          </div>
        )}
        {card.list && card.list.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {card.list.slice(0, 5).map((item, i) => (
              <div
                key={item}
                style={{ display: 'flex', gap: 28, color: TEXTO, fontSize: 46 }}
              >
                <div style={{ display: 'flex', color: OURO }}>{i + 1}</div>
                <div style={{ display: 'flex' }}>{item}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: OURO,
          fontSize: 44,
        }}
      >
        <div style={{ display: 'flex' }}>Opus Atlas</div>
        <div
          style={{
            display: 'flex',
            color: SUAVE,
            fontSize: 34,
            fontFamily: 'sans-serif',
          }}
        >
          {nome}
        </div>
      </div>
    </div>
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params;
  const query = new URL(request.url).searchParams;
  const retro = await sharedRetrospective(shareId).catch(() => null);

  if (!retro || retro.cards.length === 0) {
    return new Response('Not found', { status: 404 });
  }

  const index = Math.min(
    Math.max(Number.parseInt(query.get('card') ?? '0', 10) || 0, 0),
    retro.cards.length - 1
  );
  const image = new ImageResponse(
    desenhar(retro.cards[index], retro.firstName),
    {
      width: 1080,
      height: 1920,
    }
  );

  image.headers.set(
    'Cache-Control',
    'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
  );
  if (query.get('download') === '1') {
    image.headers.set(
      'Content-Disposition',
      `attachment; filename="opus-atlas-${retro.period}-${index + 1}.png"`
    );
  }
  return image;
}
