import { ImageResponse } from 'next/og';

/**
 * O cartão de compartilhamento (WhatsApp, iMessage, Telegram, redes): 1200×630,
 * desenhado aqui em vez de apontar para o retrato do IMSLP.
 *
 * Por que não o retrato: a imagem vinha do IMSLP, que limita acesso de robô,
 * tem tamanho e proporção imprevisíveis, e o WhatsApp descarta a pré-visualização
 * quando não consegue baixá-la a tempo. O cartão sai do próprio site, sempre
 * leve, na proporção certa e no mesmo host da página (o endereço fixo do
 * domínio de produção deixava a homologação sem imagem nenhuma).
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_TYPE = 'image/png';

const FUNDO = '#14110d';
const OURO = '#d4af37';
const TEXTO = '#f3ece0';
const SUAVE = '#a89f90';

function tamanhoDoTitulo(texto: string) {
  if (texto.length > 60) return 56;
  if (texto.length > 36) return 68;
  return 84;
}

export function cartaoDeCompartilhamento(input: {
  rotulo: string;
  titulo: string;
  linhas: string[];
}) {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: FUNDO,
        padding: '72px 80px',
        fontFamily: 'serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          color: OURO,
          fontSize: 28,
          letterSpacing: 6,
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{ width: 56, height: 2, background: OURO, display: 'flex' }}
        />
        {input.rotulo}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div
          style={{
            color: TEXTO,
            fontSize: tamanhoDoTitulo(input.titulo),
            lineHeight: 1.05,
            display: 'flex',
          }}
        >
          {input.titulo}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            color: SUAVE,
            fontSize: 34,
            fontFamily: 'sans-serif',
          }}
        >
          {input.linhas.filter(Boolean).map((linha) => (
            <div key={linha} style={{ display: 'flex' }}>
              {linha}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: OURO,
          fontSize: 34,
        }}
      >
        <div style={{ display: 'flex' }}>Opus Atlas</div>
        <div
          style={{
            display: 'flex',
            color: SUAVE,
            fontSize: 26,
            fontFamily: 'sans-serif',
          }}
        >
          opusatlas.com.br
        </div>
      </div>
    </div>,
    { ...OG_SIZE }
  );
}

/** O retrato como imagem de compartilhamento: quadrado, do próprio site. */
export const RETRATO_SIZE = { width: 600, height: 600 };

/**
 * O retrato do IMSLP vem em miniatura de 180 px, que estoura no cartão. Tenta
 * o original (`/images/thumb/3/34/X.jpg/180px-X.jpg` → `/images/3/34/X.jpg`)
 * e, se ele não vier ou for grande demais, fica a miniatura. Uma miniatura
 * maior (600 px) não serve: o IMSLP responde 502 para as que não gerou.
 */
const candidatos = (url: string) => {
  const original = url.replace(/\/thumb(\/.+)\/\d+px-[^/]+$/, '$1');
  return original === url ? [url] : [original, url];
};

async function baixar(url: string): Promise<string | null> {
  try {
    const resposta = await fetch(url, {
      signal: AbortSignal.timeout(4000),
      headers: { 'User-Agent': 'OpusAtlas/1.0 (+https://opusatlas.com.br)' },
      next: { revalidate: 86400 },
    });
    const tipo = resposta.headers.get('content-type') ?? '';
    // O desenho do cartão só lê JPEG e PNG.
    if (!resposta.ok || !/image\/(jpe?g|png)/.test(tipo)) return null;
    const bytes = Buffer.from(await resposta.arrayBuffer());
    if (bytes.length > 4_000_000) return null;
    return `data:${tipo};base64,${bytes.toString('base64')}`;
  } catch {
    return null;
  }
}

/** A foto do IMSLP como dados, já no tamanho que se consegue ler; ou nada. */
export async function retratoComoDados(url: string | null | undefined) {
  if (!url) return null;
  for (const candidato of candidatos(url)) {
    const dados = await baixar(candidato);
    if (dados) return dados;
  }
  return null;
}

/**
 * O cartão de uma coleção: o título e o que ela reúne à esquerda, e à
 * direita os retratos de quem está nela, em leque (até quatro), cada um
 * num aro de ouro fino. Sem retrato nenhum, o cartão desenhado de sempre.
 */
export function cartaoDeColecao(input: {
  rotulo: string;
  titulo: string;
  linhas: string[];
  retratos: string[];
}) {
  if (!input.retratos.length) return cartaoDeCompartilhamento(input);
  const retratos = input.retratos.slice(0, 4);
  const LADO = 200;
  const PASSO = 104;
  const largura = LADO + PASSO * (retratos.length - 1);
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 56,
        background: FUNDO,
        padding: '72px 80px',
        fontFamily: 'serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            color: OURO,
            fontSize: 26,
            letterSpacing: 6,
            textTransform: 'uppercase',
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{ width: 48, height: 2, background: OURO, display: 'flex' }}
          />
          {input.rotulo}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              color: TEXTO,
              fontSize: Math.min(tamanhoDoTitulo(input.titulo), 64),
              lineHeight: 1.05,
              display: 'flex',
            }}
          >
            {input.titulo}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              color: SUAVE,
              fontSize: 30,
              fontFamily: 'sans-serif',
            }}
          >
            {input.linhas.filter(Boolean).map((linha) => (
              <div key={linha} style={{ display: 'flex' }}>
                {linha}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', color: OURO, fontSize: 32 }}>
          Opus Atlas
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          position: 'relative',
          width: largura,
          height: LADO,
          flexShrink: 0,
        }}
      >
        {retratos.map((dados, i) => (
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
          <img
            key={i}
            src={dados}
            width={LADO}
            height={LADO}
            style={{
              position: 'absolute',
              left: i * PASSO,
              top: 0,
              borderRadius: 9999,
              border: `3px solid ${OURO}`,
              boxShadow: `0 0 0 8px ${FUNDO}`,
              objectFit: 'cover',
              objectPosition: '50% 25%',
            }}
          />
        ))}
      </div>
    </div>,
    { ...OG_SIZE }
  );
}

/**
 * A foto do compositor como imagem de compartilhamento (compositor e obra).
 * Baixada aqui, no servidor, e servida do nosso endereço: o robô do WhatsApp
 * nunca vai ao IMSLP. `null` quando não há foto que se consiga ler — aí quem
 * chama usa o cartão desenhado.
 */
export async function retratoDeCompartilhamento(
  url: string | null | undefined
) {
  if (!url) return null;
  for (const candidato of candidatos(url)) {
    const dados = await baixar(candidato);
    if (!dados) continue;
    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: FUNDO,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img
          src={dados}
          width={RETRATO_SIZE.width}
          height={RETRATO_SIZE.height}
          style={{ objectFit: 'cover', objectPosition: '50% 25%' }}
        />
      </div>,
      { ...RETRATO_SIZE }
    );
  }
  return null;
}
