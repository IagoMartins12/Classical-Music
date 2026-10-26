import { ImageResponse } from 'next/og';
import {
  sharedRetrospective,
  type RetroCard,
} from '@/app/requests/retrospective';
import { CORPOS_DO_PROXIMO, ponto, pranchaSvg } from '@/app/utils/pranchaRetro';

export const revalidate = 300;

/**
 * Um cartão da retrospectiva como imagem 9:16 (`/og/retro/<id>?card=2`), no
 * tamanho dos stories. Com `download=1` o navegador baixa em vez de abrir.
 * `card` ausente é a capa, usada também como imagem de compartilhamento.
 *
 * É a mesma prancha da tela (`utils/pranchaRetro`): as órbitas do globo, as
 * estrelas ou o arco do número, e o número no centro, nas cores do tema
 * escuro do Opus (a retrospectiva é sempre noturna). O renderizador não lê o
 * CSS do site, então as cores vêm escritas aqui, iguais às de `globals.css`.
 */
const FUNDO = '#0c0d12';
const OURO = '#d4af37';
const OURO_TEXTO = '#e0bc5c';
const TEXTO = '#f3f1ec';
const SUAVE = '#b5b1c0';
const LINHA = 'rgba(243, 241, 236, 0.1)';
/** O lado da prancha na imagem, em pixels. */
const LADO = 888;

/**
 * As fontes do site, buscadas uma vez por processo no Google Fonts (o
 * renderizador pede TTF, que um navegador antigo recebe). Sem rede, a imagem
 * sai na fonte padrão do renderizador em vez de falhar.
 */
const fontes = new Map<string, Promise<ArrayBuffer | null>>();
function fonte(familia: string, peso: number) {
  const chave = `${familia}:${peso}`;
  let pedido = fontes.get(chave);
  if (!pedido) {
    pedido = fetch(
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(familia)}:wght@${peso}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
        },
      }
    )
      .then((r) => (r.ok ? r.text() : ''))
      .then((css) => css.match(/src:\s*url\(([^)]+)\)/)?.[1] ?? null)
      .then((url) => (url ? fetch(url).then((r) => r.arrayBuffer()) : null))
      .catch(() => null);
    fontes.set(chave, pedido);
  }
  return pedido;
}

function tamanhoDoTitulo(texto: string) {
  if (texto.length > 70) return 70;
  if (texto.length > 40) return 84;
  return 96;
}

function desenhar(card: RetroCard, nome: string) {
  const prancha = `data:image/svg+xml;base64,${Buffer.from(pranchaSvg(card, OURO)).toString('base64')}`;
  const valor = card.value;
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: FUNDO,
        padding: '96px 96px 88px',
        fontFamily: 'Geist',
      }}
    >
      <div
        style={{
          display: 'flex',
          position: 'relative',
          width: LADO,
          height: LADO,
          alignSelf: 'center',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- imagem do renderizador */}
        <img src={prancha} width={LADO} height={LADO} alt="" />
        {valor && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: LADO,
              height: LADO,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: TEXTO,
              fontFamily: 'EB Garamond',
              fontSize: valor.length > 5 ? 96 : 136,
              lineHeight: 1,
            }}
          >
            {valor}
          </div>
        )}
        {/* "Próximo capítulo": o número de cada obra no seu corpo. */}
        {card.kind === 'next' &&
          (card.list ?? []).slice(0, 3).map((_, i) => {
            const { x, y } = ponto(
              CORPOS_DO_PROXIMO[i].r,
              CORPOS_DO_PROXIMO[i].deg
            );
            const lado = 64;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: (x / 600) * LADO - lado / 2,
                  top: (y / 600) * LADO - lado / 2,
                  width: lado,
                  height: lado,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: OURO_TEXTO,
                  fontFamily: 'EB Garamond',
                  fontSize: 40,
                }}
              >
                {i + 1}
              </div>
            );
          })}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
          marginTop: 72,
          flex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            color: TEXTO,
            fontFamily: 'EB Garamond',
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
              fontSize: 38,
              lineHeight: 1.35,
            }}
          >
            {card.detail}
          </div>
        )}
        {card.list && card.list.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {card.list.slice(0, 3).map((item, i) => (
              <div
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 26,
                  color: TEXTO,
                  fontSize: 40,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    color: OURO_TEXTO,
                    fontFamily: 'EB Garamond',
                    fontSize: 46,
                  }}
                >
                  {i + 1}
                </div>
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
          borderTop: `1px solid ${LINHA}`,
          paddingTop: 36,
        }}
      >
        <div
          style={{
            display: 'flex',
            color: OURO_TEXTO,
            fontFamily: 'EB Garamond',
            fontSize: 44,
            letterSpacing: 6,
          }}
        >
          OPUS ATLAS
        </div>
        <div style={{ display: 'flex', color: SUAVE, fontSize: 32 }}>
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
  const [garamond, geist] = await Promise.all([
    fonte('EB Garamond', 400),
    fonte('Geist', 400),
  ]);
  const image = new ImageResponse(
    desenhar(retro.cards[index], retro.firstName),
    {
      width: 1080,
      height: 1920,
      fonts: [
        ...(garamond
          ? [{ name: 'EB Garamond', data: garamond, weight: 400 as const }]
          : []),
        ...(geist
          ? [{ name: 'Geist', data: geist, weight: 400 as const }]
          : []),
      ],
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
