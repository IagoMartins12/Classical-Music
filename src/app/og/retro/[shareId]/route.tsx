import { ImageResponse } from 'next/og';
import type { ReactElement, ReactNode } from 'react';
import type { IconType } from 'react-icons';
import {
  sharedRetrospective,
  type RetroCard,
  type RetroFace,
} from '@/app/requests/retrospective';
import {
  LADO_DO_CORPO,
  RAIO_DO_RETRATO,
  desenhoDo,
  ponto,
  pranchaSvg,
  textoDo,
  type Desenho,
} from '@/app/utils/pranchaRetro';

export const revalidate = 300;

/**
 * Um cartão da retrospectiva como imagem 9:16 (`/og/retro/<id>?card=2`), no
 * tamanho dos stories. Com `download=1` o navegador baixa em vez de abrir.
 * `card` ausente é a capa, usada também como imagem de compartilhamento.
 *
 * É a mesma prancha da tela (`utils/pranchaRetro`): as órbitas do globo, o
 * desenho de cada cartão, e no centro o número, o retrato, o instrumento, a
 * época ou o mês, nas cores do tema
 * escuro do Opus (a retrospectiva é sempre noturna). O renderizador não lê o
 * CSS do site, então as cores vêm escritas aqui, iguais às de `globals.css`.
 */
const FUNDO = '#0c0d12';
const OURO = '#d4af37';
const OURO_TEXTO = '#e0bc5c';
const TEXTO = '#f3f1ec';
const SUAVE = '#b5b1c0';
const LINHA = 'rgba(243, 241, 236, 0.1)';
const SUPERFICIE = '#1e1f29';
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

/**
 * O ícone do react-icons como SVG em texto, na cor pedida: o renderizador
 * não roda componentes de terceiros, mas lê uma imagem SVG.
 */
type No = ReactElement<Record<string, unknown> & { children?: ReactNode }>;
const kebab = (k: string) =>
  k === 'viewBox' ? k : k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
function svgDoIcone(Icone: IconType, cor: string) {
  const raiz = Icone({}) as No;
  const attrs = (o: Record<string, unknown>) =>
    Object.entries(o)
      .filter(([k, v]) => k !== 'children' && typeof v !== 'object')
      .map(([k, v]) => `${kebab(k)}="${String(v)}"`)
      .join(' ');
  const filhos = (n: ReactNode): string =>
    (Array.isArray(n) ? n : n ? [n] : [])
      .map((f: No) =>
        typeof f.type === 'string'
          ? `<${f.type} ${attrs(f.props)}>${filhos(f.props.children)}</${f.type}>`
          : ''
      )
      .join('');
  // The icon's own attributes win over the defaults (a repeated one breaks the SVG).
  const svg = `<svg ${attrs({
    xmlns: 'http://www.w3.org/2000/svg',
    width: 256,
    height: 256,
    fill: 'currentColor',
    stroke: 'currentColor',
    strokeWidth: 0,
    ...(raiz.props.attr as Record<string, unknown>),
  })}>${filhos(raiz.props.children)}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg.replaceAll('currentColor', cor)).toString('base64')}`;
}

/**
 * Os retratos, baixados antes de desenhar: uma foto que demora ou falha vira
 * a inicial, em vez de derrubar a imagem inteira.
 */
async function retrato(rosto: RetroFace): Promise<string | null> {
  if (!rosto.url || /nocomposerphotoavailable/i.test(rosto.url)) return null;
  try {
    const r = await fetch(rosto.url, {
      signal: AbortSignal.timeout(4000),
      headers: { 'User-Agent': 'OpusAtlas/1.0 (https://opusatlas.com)' },
    });
    const tipo = r.headers.get('content-type') ?? '';
    if (!r.ok || !/^image\/(jpeg|png|webp|gif)/.test(tipo)) return null;
    const dados = Buffer.from(await r.arrayBuffer());
    return `data:${tipo.split(';')[0]};base64,${dados.toString('base64')}`;
  } catch {
    return null;
  }
}

/** Um rosto num círculo: a foto, ou a inicial em Garamond. */
function Rosto({
  foto,
  nome,
  lado,
}: {
  foto: string | null;
  nome: string;
  lado: number;
}) {
  return foto ? (
    // eslint-disable-next-line @next/next/no-img-element -- imagem do renderizador
    <img
      src={foto}
      width={lado}
      height={lado}
      alt=""
      style={{ borderRadius: lado, objectFit: 'cover', objectPosition: 'top' }}
    />
  ) : (
    <div
      style={{
        width: lado,
        height: lado,
        borderRadius: lado,
        background: SUPERFICIE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: SUAVE,
        fontFamily: 'EB Garamond',
        fontSize: lado * 0.42,
      }}
    >
      {nome.trim().charAt(0)}
    </div>
  );
}

/** Uma medida do desenho (caixa de 600) em pixels da imagem. */
const px = (n: number) => (n / 600) * LADO;

function Centro({
  d,
  fotos,
}: {
  d: Desenho;
  fotos: Map<string, string | null>;
}) {
  const caixa = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: LADO,
    height: LADO,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  };
  const c = d.centro;
  if (c.tipo === 'numero')
    return (
      <div
        style={{
          ...caixa,
          color: TEXTO,
          fontFamily: 'EB Garamond',
          fontSize: c.valor.length > 5 ? 96 : 136,
          lineHeight: 1,
        }}
      >
        {c.valor}
      </div>
    );
  if (c.tipo === 'retrato')
    return (
      <div style={caixa}>
        <Rosto
          foto={fotos.get(c.rosto.url ?? '') ?? null}
          nome={c.rosto.name}
          lado={px(RAIO_DO_RETRATO * 2)}
        />
      </div>
    );
  if (c.tipo === 'icone')
    return (
      <div style={caixa}>
        {/* eslint-disable-next-line @next/next/no-img-element -- imagem do renderizador */}
        <img
          src={svgDoIcone(c.icone, OURO_TEXTO)}
          width={px(156)}
          height={px(156)}
          alt=""
        />
      </div>
    );
  if (c.tipo === 'palavra')
    return (
      <div style={{ ...caixa, gap: 14 }}>
        <div
          style={{
            display: 'flex',
            color: TEXTO,
            fontFamily: 'EB Garamond',
            fontSize: c.texto.length > 10 ? 50 : 66,
            lineHeight: 1,
          }}
        >
          {c.texto}
        </div>
        {c.legenda && (
          <div
            style={{
              display: 'flex',
              color: OURO_TEXTO,
              fontSize: 26,
              letterSpacing: 3,
            }}
          >
            {c.legenda}
          </div>
        )}
      </div>
    );
  return null;
}

function desenhar(
  card: RetroCard,
  nome: string,
  idioma: 'pt' | 'en',
  fotos: Map<string, string | null>
) {
  const d = desenhoDo(card, idioma);
  const t = textoDo(card, d);
  const prancha = `data:image/svg+xml;base64,${Buffer.from(pranchaSvg(d, OURO)).toString('base64')}`;
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
        <Centro d={d} fotos={fotos} />
        {d.corpos.map((c, i) => {
          const { x, y } = ponto(c.r, c.deg);
          const lado = px(c.texto && c.texto.length > 2 ? 76 : LADO_DO_CORPO);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: px(x) - lado / 2,
                top: px(y) - lado / 2,
                width: lado,
                height: lado,
                borderRadius: lado,
                border: `1.5px solid ${OURO}`,
                background: FUNDO,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                color: OURO_TEXTO,
                fontFamily: 'EB Garamond',
                fontSize: lado * 0.42,
              }}
            >
              {c.rosto ? (
                <Rosto
                  foto={fotos.get(c.rosto.url ?? '') ?? null}
                  nome={c.rosto.name}
                  lado={lado - 3}
                />
              ) : c.icone ? (
                // eslint-disable-next-line @next/next/no-img-element -- imagem do renderizador
                <img
                  src={svgDoIcone(c.icone, OURO_TEXTO)}
                  width={lado / 2}
                  height={lado / 2}
                  alt=""
                />
              ) : (
                c.texto
              )}
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
            fontSize: tamanhoDoTitulo(t.titulo),
            lineHeight: 1.08,
          }}
        >
          {t.titulo}
        </div>
        {t.detalhe && (
          <div
            style={{
              display: 'flex',
              color: SUAVE,
              fontSize: 38,
              lineHeight: 1.35,
            }}
          >
            {t.detalhe}
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
  const card = retro.cards[index];
  const rostos = [
    ...(card.art?.portrait ? [card.art.portrait] : []),
    ...(card.art?.faces ?? []),
  ];
  const [garamond, geist, ...baixadas] = await Promise.all([
    fonte('EB Garamond', 400),
    fonte('Geist', 400),
    ...rostos.map(retrato),
  ]);
  const fotos = new Map(rostos.map((r, i) => [r.url ?? '', baixadas[i]]));
  const image = new ImageResponse(
    desenhar(card, retro.firstName, retro.language, fotos),
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
