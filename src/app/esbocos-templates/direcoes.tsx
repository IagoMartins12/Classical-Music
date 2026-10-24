import type { CSSProperties, ReactNode } from 'react';
import { EmblemaGravado, OrbitaDeFundo } from './emblemas';
import { ENDERECO, RODAPES, type Email } from './emails';
import {
  NOITE,
  PALETAS,
  SANS,
  SERIFA,
  selo,
  type Paleta,
  type Tema,
} from './paleta';

/**
 * Three layout directions (second round, 11/10). The owner liked the
 * ticket (A) and the letter (C) of the first round; D joins them, E and F
 * redo each one. All three carry the engraved emblem of the site's orbits
 * and set the one figure worth seeing from afar (the amount, the deadline,
 * the result) in large Garamond. Inline styles and plain blocks, as an
 * email has to be; the API turns the chosen one into tables and the SVG
 * into PNG.
 */
export interface Props {
  e: Email;
  tema: Tema;
  celular: boolean;
}

/* eslint-disable @next/next/no-img-element -- an email has no next/image. */

function Botao({
  e,
  p,
  alinhar = 'left',
}: {
  e: Email;
  p: Paleta;
  alinhar?: 'left' | 'center';
}) {
  return (
    <div style={{ textAlign: alinhar, margin: '30px 0 0' }}>
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
    </div>
  );
}

function Texto({
  e,
  p,
  capitular = false,
  tamanho = 19,
}: {
  e: Email;
  p: Paleta;
  capitular?: boolean;
  tamanho?: number;
}) {
  return (
    <>
      {e.paragrafos.map((t, i) => (
        <p
          key={t}
          style={{
            margin: '16px 0 0',
            fontFamily: SERIFA,
            fontSize: tamanho,
            lineHeight: 1.55,
            color: i === 0 ? p.texto : p.suave,
          }}
        >
          {capitular && i === 0 ? (
            <>
              <span
                style={{
                  float: 'left',
                  fontSize: tamanho * 3.3,
                  lineHeight: 0.82,
                  margin: '6px 10px 0 0',
                  color: p.ouroTexto,
                }}
              >
                {t[0]}
              </span>
              {t.slice(1)}
            </>
          ) : (
            t
          )}
        </p>
      ))}
    </>
  );
}

function Assinatura({
  p,
  tema,
  selo: comSelo = true,
}: {
  p: Paleta;
  tema: Tema;
  selo?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        margin: '30px 0 0',
      }}
    >
      {comSelo && <img src={selo(tema)} alt="" width={44} height={44} />}
      <p
        style={{
          margin: 0,
          fontFamily: SERIFA,
          fontSize: 18,
          lineHeight: 1.35,
          color: p.texto,
        }}
      >
        <span style={{ fontStyle: 'italic', color: p.suave }}>
          Com carinho,
        </span>
        <br />
        Equipe Opus Atlas
      </p>
    </div>
  );
}

function Destaque({
  e,
  p,
  alinhar = 'left',
}: {
  e: Email;
  p: Paleta;
  alinhar?: CSSProperties['textAlign'];
}) {
  if (!e.destaque) return null;
  return (
    <div style={{ textAlign: alinhar }}>
      <p
        style={{
          margin: 0,
          fontFamily: SERIFA,
          fontSize: 40,
          lineHeight: 1,
          color: p.ouroTexto,
          fontVariantNumeric: 'lining-nums tabular-nums',
        }}
      >
        {e.destaque.valor}
      </p>
      <p
        style={{
          margin: '8px 0 0',
          fontFamily: SERIFA,
          fontStyle: 'italic',
          fontSize: 16,
          color: p.fraco,
        }}
      >
        {e.destaque.rotulo}
      </p>
    </div>
  );
}

function Dados({ e, p }: { e: Email; p: Paleta }) {
  if (!e.dados) return null;
  return (
    <div>
      {e.dados.map((d) => (
        <div
          key={d.rotulo}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            padding: '7px 0',
            borderBottom: `1px solid ${p.linha}`,
            fontFamily: SANS,
            fontSize: 14.5,
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
  );
}

function Caminhos({ e, p, colunas }: { e: Email; p: Paleta; colunas: number }) {
  if (!e.caminhos) return null;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${colunas}, 1fr)`,
        gap: 22,
      }}
    >
      {e.caminhos.map((c) => (
        <div key={c.titulo}>
          <p
            style={{
              margin: 0,
              fontFamily: SERIFA,
              fontSize: 20,
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
              textUnderlineOffset: 4,
            }}
          >
            {c.link}
          </a>
        </div>
      ))}
    </div>
  );
}

function Notas({ e, p, colunas }: { e: Email; p: Paleta; colunas: number }) {
  if (!e.notas) return null;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${colunas}, 1fr)`,
        gap: 22,
      }}
    >
      {e.notas.map((n) => (
        <div key={n.titulo}>
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

function Rodape({ e, p }: { e: Email; p: Paleta }) {
  return (
    <div
      style={{
        maxWidth: 500,
        margin: '0 auto',
        padding: '28px 24px 40px',
        textAlign: 'center',
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

/** The tear line: a notch on each edge and a dashed rule between. */
function Picote({ p, vertical = false }: { p: Paleta; vertical?: boolean }) {
  const furo = (pos: CSSProperties): CSSProperties => ({
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: '50%',
    background: p.fora,
    ...pos,
  });
  if (vertical) {
    return (
      <div
        style={{
          position: 'relative',
          width: 0,
          borderLeft: `2px dashed ${p.linha}`,
          margin: '18px 0',
        }}
      >
        <span style={furo({ top: -31, left: -14 })} />
        <span style={furo({ bottom: -31, left: -14 })} />
      </div>
    );
  }
  return (
    <div
      style={{
        position: 'relative',
        height: 0,
        borderTop: `2px dashed ${p.linha}`,
        margin: '0 18px',
      }}
    >
      <span style={furo({ left: -31, top: -14 })} />
      <span style={furo({ right: -31, top: -14 })} />
    </div>
  );
}

/** A hairline gold frame set inside the paper, like a printed card. */
const filete = (p: Paleta, celular: boolean): CSSProperties => ({
  border: `1px solid ${p.filete}`,
  borderRadius: 10,
  padding: celular ? '26px 20px' : '44px 46px',
});

// ---------------------------------------------------------------------------
// D · A carta com canhoto (A + C)
// ---------------------------------------------------------------------------

/**
 * The letter of C with the stub of A: the team writes, signs, and below
 * the tear line hands over what is worth keeping, the figure in large
 * Garamond (amount, deadline, result) or, on the welcome, the three ways
 * in. The emblem stands at the head of the letter like a wax seal.
 */
export function CartaComCanhoto({ e, tema, celular }: Props) {
  const p = PALETAS[tema];
  const temCanhoto = e.destaque || e.dados || e.caminhos || e.notas;
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
          borderRadius: 16,
          padding: celular ? 10 : 14,
        }}
      >
        <div style={filete(p, celular)}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <img src={selo(tema)} alt="Opus Atlas" width={50} height={50} />
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              margin: '26px 0 0',
            }}
          >
            <EmblemaGravado
              tipo={e.emblema}
              cor={p.ouroTexto}
              fundo={p.papel}
              tamanho={celular ? 96 : 116}
            />
          </div>
          <h1
            style={{
              margin: '24px 0 0',
              textAlign: 'center',
              fontFamily: SERIFA,
              fontWeight: 500,
              fontSize: celular ? 30 : 38,
              lineHeight: 1.08,
              color: p.texto,
            }}
          >
            {e.titulo}
          </h1>
          <div
            style={{
              width: 56,
              height: 1,
              background: p.filete,
              margin: '22px auto 0',
            }}
          />
          <Texto e={e} p={p} />
          <Botao e={e} p={p} />
          {e.acao.dica && !e.destaque && (
            <p
              style={{
                margin: '12px 0 0',
                fontFamily: SANS,
                fontSize: 13,
                color: p.fraco,
              }}
            >
              {e.acao.dica}
            </p>
          )}
          <Assinatura p={p} tema={tema} selo={false} />
        </div>
      </div>

      {temCanhoto && (
        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative' }}>
          <div
            style={{
              background: p.papel2,
              borderRadius: 16,
              padding: celular ? 10 : 14,
              marginTop: -2,
            }}
          >
            <Picote p={p} />
            <div
              style={{
                ...filete(p, celular),
                padding: celular ? '24px 20px' : '30px 46px',
                marginTop: 14,
              }}
            >
              {e.destaque && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      celular || !e.dados ? '1fr' : '1fr 1.2fr',
                    gap: 28,
                    alignItems: 'center',
                  }}
                >
                  <Destaque e={e} p={p} />
                  <Dados e={e} p={p} />
                </div>
              )}
              {!e.destaque && e.dados && <Dados e={e} p={p} />}
              <Caminhos e={e} p={p} colunas={celular ? 1 : 3} />
              <Notas e={e} p={p} colunas={celular ? 1 : 2} />
            </div>
          </div>
        </div>
      )}
      <Rodape e={e} p={p} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// E · O ingresso, refeito
// ---------------------------------------------------------------------------

/**
 * A real ticket, wide on the desktop: the message on the main part over a
 * slice of the orbits, a vertical tear line, and the stub at the right with
 * the figure set large. On the phone the stub drops below.
 */
export function IngressoCeleste({ e, tema, celular }: Props) {
  const p = PALETAS[tema];
  const canhoto = (
    <div
      style={{
        padding: celular ? '24px 22px 26px' : '40px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      {e.destaque ? (
        <Destaque e={e} p={p} />
      ) : e.caminhos ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {e.caminhos.map((c) => (
            <a key={c.titulo} href="#" style={{ textDecoration: 'none' }}>
              <span
                style={{
                  display: 'block',
                  fontFamily: SERIFA,
                  fontSize: 19,
                  color: p.texto,
                }}
              >
                {c.titulo}
              </span>
              <span
                style={{
                  display: 'block',
                  marginTop: 3,
                  fontFamily: SANS,
                  fontSize: 13,
                  color: p.ouroTexto,
                  fontWeight: 600,
                }}
              >
                {c.link}
              </span>
            </a>
          ))}
        </div>
      ) : e.notas ? (
        <Notas e={e} p={p} colunas={1} />
      ) : null}
      {e.dados && <Dados e={e} p={p} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src={selo(tema)} alt="" width={34} height={34} />
        <span
          style={{
            fontFamily: SERIFA,
            fontStyle: 'italic',
            fontSize: 14,
            color: p.fraco,
          }}
        >
          11 out 2026
        </span>
      </div>
    </div>
  );

  return (
    <div
      style={{
        background: p.fora,
        padding: celular ? '24px 12px 0' : '48px 20px 0',
      }}
    >
      <div
        style={{
          maxWidth: 640,
          margin: '0 auto',
          background: p.papel,
          borderRadius: 18,
          overflow: 'hidden',
          display: celular ? 'block' : 'flex',
          border: `1px solid ${p.filete}`,
        }}
      >
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          <div style={{ position: 'relative' }}>
            <OrbitaDeFundo
              cor={p.ouro}
              altura={celular ? 130 : 160}
              opacidade={0.55}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <EmblemaGravado
                tipo={e.emblema}
                cor={p.ouroTexto}
                fundo={p.papel}
                tamanho={celular ? 92 : 108}
              />
            </div>
          </div>
          <div style={{ padding: celular ? '6px 22px 30px' : '8px 40px 40px' }}>
            <h1
              style={{
                margin: 0,
                fontFamily: SERIFA,
                fontWeight: 500,
                fontSize: celular ? 30 : 36,
                lineHeight: 1.08,
                color: p.texto,
              }}
            >
              {e.titulo}
            </h1>
            <Texto e={e} p={p} tamanho={18} />
            <Botao e={e} p={p} />
            {e.acao.dica && (
              <p
                style={{
                  margin: '12px 0 0',
                  fontFamily: SANS,
                  fontSize: 13,
                  color: p.fraco,
                }}
              >
                {e.acao.dica}
              </p>
            )}
          </div>
        </div>
        {celular ? (
          <div style={{ background: p.papel2 }}>
            <Picote p={p} />
            {canhoto}
          </div>
        ) : (
          <>
            <Picote p={p} vertical />
            <div style={{ width: 200, flexShrink: 0, background: p.papel2 }}>
              {canhoto}
            </div>
          </>
        )}
      </div>
      <Rodape e={e} p={p} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// F · A carta, refeita
// ---------------------------------------------------------------------------

/**
 * The letter under a night sky: a band of orbits with the emblem at its
 * center opens every email, then the letter on paper, with a drop cap, the
 * figure set apart, the signature and, on the welcome, a P.S.
 */
export function CartaCeleste({ e, tema, celular }: Props) {
  const p = PALETAS[tema];
  const pad = celular ? 24 : 56;
  const ps: ReactNode = e.caminhos && (
    <div
      style={{
        margin: '30px 0 0',
        paddingTop: 22,
        borderTop: `1px solid ${p.linha}`,
      }}
    >
      <p
        style={{ margin: 0, fontFamily: SERIFA, fontSize: 18, color: p.suave }}
      >
        <span style={{ color: p.ouroTexto, fontStyle: 'italic' }}>P.S.</span>{' '}
        Três jeitos de começar, quando quiser:
      </p>
      <div style={{ marginTop: 16 }}>
        <Caminhos e={e} p={p} colunas={celular ? 1 : 3} />
      </div>
    </div>
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
          borderRadius: 16,
          overflow: 'hidden',
          background: p.papel,
        }}
      >
        <div
          style={{
            position: 'relative',
            background: NOITE.fundo,
            borderBottom: `1px solid ${p.filete}`,
          }}
        >
          <OrbitaDeFundo
            cor={NOITE.ouro}
            altura={celular ? 170 : 210}
            opacidade={0.8}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <EmblemaGravado
              tipo={e.emblema}
              cor={NOITE.ouro}
              fundo={NOITE.fundo}
              tamanho={celular ? 104 : 128}
            />
          </div>
        </div>
        <div style={{ padding: `${pad - 16}px ${pad}px ${pad}px` }}>
          <h1
            style={{
              margin: 0,
              fontFamily: SERIFA,
              fontWeight: 500,
              fontSize: celular ? 30 : 38,
              lineHeight: 1.08,
              color: p.texto,
            }}
          >
            {e.titulo}
          </h1>
          <Texto e={e} p={p} capitular />
          {(e.destaque || e.dados) && (
            <div
              style={{
                margin: '28px 0 0',
                padding: '22px 0',
                borderTop: `1px solid ${p.filete}`,
                borderBottom: `1px solid ${p.filete}`,
                display: 'grid',
                gridTemplateColumns:
                  celular || !e.dados || !e.destaque ? '1fr' : '1fr 1.2fr',
                gap: 26,
                alignItems: 'center',
              }}
            >
              <Destaque e={e} p={p} />
              <Dados e={e} p={p} />
            </div>
          )}
          {e.notas && (
            <div style={{ margin: '28px 0 0' }}>
              <Notas e={e} p={p} colunas={celular ? 1 : 2} />
            </div>
          )}
          <Botao e={e} p={p} />
          {e.acao.dica && !e.destaque && (
            <p
              style={{
                margin: '12px 0 0',
                fontFamily: SANS,
                fontSize: 13,
                color: p.fraco,
              }}
            >
              {e.acao.dica}
            </p>
          )}
          <Assinatura p={p} tema={tema} />
          {ps}
        </div>
      </div>
      <Rodape e={e} p={p} />
    </div>
  );
}
