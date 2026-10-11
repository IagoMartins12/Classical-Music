import type { CSSProperties, ReactNode } from 'react';
import { ENDERECO, RODAPES, type Email } from './emails';
import { PALETAS, SANS, SERIFA, selo, type Tema } from './paleta';

/**
 * The three layout directions. Each draws any email of `emails.ts`, in
 * either theme, at desktop (600px) or phone width. Built with inline
 * styles and plain blocks, as an email has to be; the final templates in
 * the API turn the chosen one into tables.
 */
export interface Props {
  e: Email;
  tema: Tema;
  celular: boolean;
}

/* eslint-disable @next/next/no-img-element -- an email has no next/image. */

function Botao({
  e,
  tema,
  alinhar = 'center',
}: Props & { alinhar?: 'center' | 'left' }) {
  const p = PALETAS[tema];
  return (
    <div style={{ textAlign: alinhar, margin: '32px 0 0' }}>
      <a
        href="#"
        style={{
          display: 'inline-block',
          background: p.botao,
          color: p.botaoTexto,
          fontFamily: SANS,
          fontSize: 16,
          fontWeight: 600,
          textDecoration: 'none',
          padding: '15px 30px',
          borderRadius: 999,
        }}
      >
        {e.acao.rotulo}
      </a>
      {e.acao.dica && (
        <p
          style={{
            margin: '14px 0 0',
            fontFamily: SANS,
            fontSize: 13,
            color: p.fraco,
          }}
        >
          {e.acao.dica}
        </p>
      )}
    </div>
  );
}

function Paragrafos({
  e,
  tema,
  serifa = false,
  alinhar = 'left',
}: Props & { serifa?: boolean; alinhar?: CSSProperties['textAlign'] }) {
  const p = PALETAS[tema];
  return (
    <>
      {e.paragrafos.map((t) => (
        <p
          key={t}
          style={{
            margin: '16px 0 0',
            fontFamily: serifa ? SERIFA : SANS,
            fontSize: serifa ? 19 : 16,
            lineHeight: serifa ? 1.55 : 1.65,
            color: serifa ? p.texto : p.suave,
            textAlign: alinhar,
          }}
        >
          {t}
        </p>
      ))}
    </>
  );
}

function Rodape({
  e,
  tema,
  alinhar = 'center',
}: Props & { alinhar?: 'center' | 'left' }) {
  const p = PALETAS[tema];
  return (
    <div
      style={{
        maxWidth: 520,
        margin: '0 auto',
        padding: '28px 24px 40px',
        textAlign: alinhar,
        fontFamily: SANS,
        fontSize: 12.5,
        lineHeight: 1.6,
        color: p.fraco,
      }}
    >
      <p style={{ margin: 0 }}>{RODAPES[e.rodape]}</p>
      <p style={{ margin: '10px 0 0' }}>{ENDERECO}</p>
    </div>
  );
}

function Imagem({ e, tema, margem }: Props & { margem: string }) {
  if (!e.imagem) return null;
  const p = PALETAS[tema];
  return (
    <img
      src={
        tema === 'claro'
          ? e.imagem.src.replace('.webp', '-claro.webp')
          : e.imagem.src
      }
      alt={e.imagem.alt}
      width={e.imagem.largura}
      height={e.imagem.altura}
      style={{
        display: 'block',
        width: '100%',
        height: 'auto',
        margin: margem,
        color: p.fraco,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// A · O ingresso
// ---------------------------------------------------------------------------

/**
 * Each email is an admission ticket: the message above, a perforated tear
 * line, and a stub with what is worth keeping (amount, deadline, who).
 */
export function Ingresso(props: Props) {
  const { e, tema, celular } = props;
  const p = PALETAS[tema];
  const pad = celular ? 24 : 48;
  const furo = (lado: 'left' | 'right'): CSSProperties => ({
    position: 'absolute',
    top: -14,
    [lado]: -14,
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: p.fora,
  });
  const canhoto: { rotulo: string; valor: string }[] = e.dados ?? [
    { rotulo: 'Para', valor: 'Marina Duarte' },
    { rotulo: 'Emitido em', valor: '11 out 2026' },
  ];

  return (
    <div
      style={{
        background: p.fora,
        padding: celular ? '24px 12px 0' : '48px 24px 0',
      }}
    >
      <div
        style={{
          maxWidth: 600,
          margin: '0 auto',
          background: p.papel,
          borderRadius: 18,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: `${pad}px ${pad}px ${pad - 8}px` }}>
          <img
            src={selo(tema)}
            alt="Opus Atlas"
            width={72}
            height={73}
            style={{ display: 'block' }}
          />
          <Imagem {...props} margem={`${celular ? 24 : 32}px 0 0`} />
          <h1
            style={{
              margin: `${celular ? 24 : 32}px 0 0`,
              fontFamily: SERIFA,
              fontWeight: 500,
              fontSize: celular ? 30 : 38,
              lineHeight: 1.08,
              letterSpacing: '-0.01em',
              color: p.texto,
            }}
          >
            {e.titulo}
          </h1>
          <Paragrafos {...props} />
          <Botao {...props} alinhar="left" />
        </div>

        {/* The tear line: a notch on each edge and a dashed rule between. */}
        <div style={{ position: 'relative', margin: `0 ${pad}px` }}>
          <span style={furo('left')} />
          <span style={furo('right')} />
          <div
            style={{ borderTop: `2px dashed ${p.linha}`, margin: '0 -2px' }}
          />
        </div>

        <div
          style={{
            padding: `${celular ? 22 : 28}px ${pad}px ${celular ? 26 : 32}px`,
            background: p.papel2,
          }}
        >
          {e.caminhos ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: celular ? '1fr' : 'repeat(3, 1fr)',
                gap: celular ? 18 : 24,
              }}
            >
              {e.caminhos.map((c) => (
                <div key={c.titulo}>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: SERIFA,
                      fontSize: 19,
                      color: p.texto,
                    }}
                  >
                    {c.titulo}
                  </p>
                  <p
                    style={{
                      margin: '6px 0 0',
                      fontFamily: SANS,
                      fontSize: 13.5,
                      lineHeight: 1.55,
                      color: p.suave,
                    }}
                  >
                    {c.texto}
                  </p>
                  <a
                    href="#"
                    style={{
                      display: 'inline-block',
                      marginTop: 8,
                      fontFamily: SANS,
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: p.ouroTexto,
                      textDecoration: 'underline',
                      textUnderlineOffset: 4,
                    }}
                  >
                    {c.link}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${celular ? 2 : Math.min(canhoto.length, 4)}, 1fr)`,
                gap: '16px 24px',
              }}
            >
              {canhoto.map((d) => (
                <div key={d.rotulo}>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: SANS,
                      fontSize: 11,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: p.fraco,
                    }}
                  >
                    {d.rotulo}
                  </p>
                  <p
                    style={{
                      margin: '4px 0 0',
                      fontFamily: SERIFA,
                      fontSize: 20,
                      color: p.texto,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {d.valor}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {e.notas && <NotasIngresso {...props} />}
      <Rodape {...props} />
    </div>
  );
}

function NotasIngresso(props: Props) {
  const { e, tema, celular } = props;
  const p = PALETAS[tema];
  return (
    <div
      style={{
        maxWidth: 600,
        margin: '16px auto 0',
        display: 'grid',
        gridTemplateColumns: celular ? '1fr' : '1fr 1fr',
        gap: 16,
      }}
    >
      {e.notas!.map((n) => (
        <div
          key={n.titulo}
          style={{ background: p.papel, borderRadius: 18, padding: 24 }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: SANS,
              fontSize: 12,
              color: p.fraco,
            }}
          >
            {n.rotulo}
          </p>
          <p
            style={{
              margin: '6px 0 0',
              fontFamily: SERIFA,
              fontSize: 22,
              color: p.texto,
            }}
          >
            {n.titulo}
          </p>
          <p
            style={{
              margin: '6px 0 0',
              fontFamily: SANS,
              fontSize: 14,
              lineHeight: 1.55,
              color: p.suave,
            }}
          >
            {n.texto}
          </p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// B · A folha de partitura
// ---------------------------------------------------------------------------

/** Five hairlines: the staff, as header ornament and as section break. */
function Pauta({
  cor,
  largura = '100%',
  espaco = 6,
}: {
  cor: string;
  largura?: string;
  espaco?: number;
}) {
  return (
    <div style={{ width: largura, margin: '0 auto' }} aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{ height: 1, background: cor, marginTop: i ? espaco : 0 }}
        />
      ))}
    </div>
  );
}

/**
 * Each email is the first page of a score: the staff across the top, the
 * title centered like a work's, "Opus Atlas" credited at the right like a
 * composer, the data as measures between bar lines, and the double bar
 * that closes a piece before the footer.
 */
export function Partitura(props: Props) {
  const { e, tema, celular } = props;
  const p = PALETAS[tema];
  const pad = celular ? 24 : 56;
  return (
    <div
      style={{
        background: p.fora,
        padding: celular ? '24px 12px 0' : '48px 24px 0',
      }}
    >
      <div
        style={{
          maxWidth: 600,
          margin: '0 auto',
          background: p.papel,
          padding: `${pad}px ${pad}px ${pad - 8}px`,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <img
            src={selo(tema)}
            alt="Opus Atlas"
            width={64}
            height={65}
            style={{ display: 'inline-block' }}
          />
        </div>
        <div style={{ marginTop: 20 }}>
          <Pauta cor={p.linha} />
        </div>
        <Imagem {...props} margem={`${celular ? 24 : 36}px 0 0`} />
        <h1
          style={{
            margin: `${celular ? 28 : 40}px 0 0`,
            textAlign: 'center',
            fontFamily: SERIFA,
            fontWeight: 500,
            fontSize: celular ? 30 : 40,
            lineHeight: 1.08,
            color: p.texto,
          }}
        >
          {e.titulo}
        </h1>
        <p
          style={{
            margin: '10px 0 0',
            textAlign: 'center',
            fontFamily: SERIFA,
            fontStyle: 'italic',
            fontSize: 18,
            color: p.ouroTexto,
          }}
        >
          {e.previa}
        </p>
        <p
          style={{
            margin: '18px 0 0',
            textAlign: 'right',
            fontFamily: SERIFA,
            fontSize: 15,
            color: p.fraco,
          }}
        >
          Opus Atlas
        </p>
        <div style={{ maxWidth: 440, margin: '0 auto' }}>
          <Paragrafos {...props} alinhar={celular ? 'left' : 'center'} />
        </div>

        {e.dados && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${celular ? 2 : e.dados.length}, 1fr)`,
              margin: '32px 0 0',
              borderLeft: `1px solid ${p.linha}`,
            }}
          >
            {e.dados.map((d) => (
              <div
                key={d.rotulo}
                style={{
                  borderRight: `1px solid ${p.linha}`,
                  borderTop: `1px solid ${p.linha}`,
                  borderBottom: `1px solid ${p.linha}`,
                  padding: '12px 14px',
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontFamily: SERIFA,
                    fontStyle: 'italic',
                    fontSize: 14,
                    color: p.fraco,
                  }}
                >
                  {d.rotulo}
                </p>
                <p
                  style={{
                    margin: '4px 0 0',
                    fontFamily: SERIFA,
                    fontSize: 19,
                    color: p.texto,
                  }}
                >
                  {d.valor}
                </p>
              </div>
            ))}
          </div>
        )}

        {e.caminhos && (
          <div style={{ margin: '36px 0 0' }}>
            {e.caminhos.map((c, i) => (
              <div
                key={c.titulo}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '44px 1fr',
                  gap: 12,
                  padding: '16px 0',
                  borderTop: `1px solid ${p.linha}`,
                }}
              >
                <span
                  style={{
                    fontFamily: SERIFA,
                    fontSize: 22,
                    color: p.ouroTexto,
                  }}
                >
                  {['I.', 'II.', 'III.'][i]}
                </span>
                <span>
                  <span
                    style={{
                      display: 'block',
                      fontFamily: SERIFA,
                      fontSize: 20,
                      color: p.texto,
                    }}
                  >
                    {c.titulo}
                  </span>
                  <span
                    style={{
                      display: 'block',
                      marginTop: 4,
                      fontFamily: SANS,
                      fontSize: 14,
                      lineHeight: 1.55,
                      color: p.suave,
                    }}
                  >
                    {c.texto}{' '}
                    <a
                      href="#"
                      style={{
                        color: p.ouroTexto,
                        fontWeight: 600,
                        textUnderlineOffset: 4,
                      }}
                    >
                      {c.link}
                    </a>
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}

        {e.notas && (
          <div style={{ margin: '36px 0 0' }}>
            <Pauta cor={p.linha} largura="40%" espaco={4} />
            {e.notas.map((n) => (
              <div
                key={n.titulo}
                style={{ marginTop: 24, textAlign: 'center' }}
              >
                <p
                  style={{
                    margin: 0,
                    fontFamily: SERIFA,
                    fontStyle: 'italic',
                    fontSize: 15,
                    color: p.fraco,
                  }}
                >
                  {n.rotulo}
                </p>
                <p
                  style={{
                    margin: '4px 0 0',
                    fontFamily: SERIFA,
                    fontSize: 22,
                    color: p.texto,
                  }}
                >
                  {n.titulo}
                </p>
                <p
                  style={{
                    margin: '4px auto 0',
                    maxWidth: 400,
                    fontFamily: SANS,
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: p.suave,
                  }}
                >
                  {n.texto}
                </p>
              </div>
            ))}
          </div>
        )}

        <Botao {...props} />

        {/* The double bar: a thin line and a thick one, end of the piece. */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 3,
            margin: '40px 0 0',
          }}
          aria-hidden="true"
        >
          <span style={{ width: 1, height: 34, background: p.fraco }} />
          <span style={{ width: 4, height: 34, background: p.fraco }} />
        </div>
      </div>
      <Rodape {...props} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// C · A carta com selo
// ---------------------------------------------------------------------------

/**
 * Each email is a letter from the team: the seal and the date as
 * letterhead, the message set in Garamond like handwriting's printed
 * cousin, a signature, and the data as a note clipped to the letter.
 */
export function Carta(props: Props) {
  const { e, tema, celular } = props;
  const p = PALETAS[tema];
  const pad = celular ? 26 : 60;
  const assinatura: ReactNode = (
    <p
      style={{
        margin: '28px 0 0',
        fontFamily: SERIFA,
        fontSize: 19,
        lineHeight: 1.4,
        color: p.texto,
      }}
    >
      <span style={{ fontStyle: 'italic', color: p.suave }}>Com carinho,</span>
      <br />
      Equipe Opus Atlas
    </p>
  );
  return (
    <div
      style={{
        background: p.fora,
        padding: celular ? '24px 12px 0' : '48px 24px 0',
      }}
    >
      <div
        style={{
          maxWidth: 600,
          margin: '0 auto',
          background: p.papel,
          padding: `${pad - 12}px ${pad}px ${pad}px`,
          borderRadius: 4,
          boxShadow:
            tema === 'claro'
              ? '0 18px 40px -24px rgba(60, 45, 10, 0.35)'
              : undefined,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <img
            src={selo(tema)}
            alt="Opus Atlas"
            width={56}
            height={57}
            style={{ display: 'block' }}
          />
          <span
            style={{
              fontFamily: SERIFA,
              fontStyle: 'italic',
              fontSize: 15,
              color: p.fraco,
              textAlign: 'right',
            }}
          >
            São Paulo, 11 de outubro de 2026
          </span>
        </div>
        <div style={{ height: 1, background: p.linha, margin: '20px 0 0' }} />
        <Imagem {...props} margem="28px 0 0" />
        <h1
          style={{
            margin: '32px 0 0',
            fontFamily: SERIFA,
            fontWeight: 500,
            fontSize: celular ? 28 : 34,
            lineHeight: 1.12,
            color: p.texto,
          }}
        >
          {e.titulo}
        </h1>
        <Paragrafos {...props} serifa />

        {e.dados && (
          <div
            style={{
              margin: '28px 0 0',
              padding: '14px 0',
              borderTop: `1px solid ${p.linha}`,
              borderBottom: `1px solid ${p.linha}`,
            }}
          >
            {e.dados.map((d) => (
              <div
                key={d.rotulo}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 16,
                  padding: '5px 0',
                  fontFamily: SANS,
                  fontSize: 15,
                }}
              >
                <span style={{ color: p.fraco }}>{d.rotulo}</span>
                <span
                  style={{
                    color: p.texto,
                    fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {d.valor}
                </span>
              </div>
            ))}
          </div>
        )}

        {e.notas &&
          e.notas.map((n) => (
            <div key={n.titulo} style={{ margin: '24px 0 0' }}>
              <p
                style={{
                  margin: 0,
                  fontFamily: SERIFA,
                  fontSize: 21,
                  color: p.texto,
                }}
              >
                {n.titulo}{' '}
                <span
                  style={{ fontStyle: 'italic', fontSize: 16, color: p.fraco }}
                >
                  · {n.rotulo}
                </span>
              </p>
              <p
                style={{
                  margin: '4px 0 0',
                  fontFamily: SERIFA,
                  fontSize: 17,
                  lineHeight: 1.5,
                  color: p.suave,
                }}
              >
                {n.texto}
              </p>
            </div>
          ))}

        <Botao {...props} alinhar="left" />
        {assinatura}

        {e.caminhos && (
          <div
            style={{
              margin: '28px 0 0',
              fontFamily: SERIFA,
              fontSize: 17,
              lineHeight: 1.55,
              color: p.suave,
            }}
          >
            <p style={{ margin: 0 }}>
              <span style={{ color: p.ouroTexto, fontStyle: 'italic' }}>
                P.S.
              </span>{' '}
              Três jeitos de começar, quando quiser:
            </p>
            {e.caminhos.map((c) => (
              <p key={c.titulo} style={{ margin: '8px 0 0' }}>
                <span style={{ color: p.texto }}>{c.titulo}.</span> {c.texto}{' '}
                <a
                  href="#"
                  style={{
                    color: p.ouroTexto,
                    fontFamily: SANS,
                    fontSize: 14,
                    fontWeight: 600,
                    textUnderlineOffset: 4,
                  }}
                >
                  {c.link}
                </a>
              </p>
            ))}
          </div>
        )}
      </div>
      <Rodape {...props} />
    </div>
  );
}
