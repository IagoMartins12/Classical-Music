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
