import type { IconType } from 'react-icons';
import {
  PiCompass,
  PiEnvelopeSimpleOpen,
  PiKey,
  PiMoonStars,
  PiReceipt,
  PiScales,
  PiSparkle,
  PiUsersThree,
} from 'react-icons/pi';
import type { Emblema } from './emails';

/**
 * The engraved emblem of each email, in the hand of the site's orbits: a
 * graduated rim, two rings, four stars and a symbol in the middle. Inline
 * SVG in the sketch; the final templates ship it as a PNG (Gmail and
 * Outlook drop SVG), rendered from this same drawing.
 */
const SIMBOLO: Record<Emblema, IconType> = {
  bussola: PiCompass,
  envelope: PiEnvelopeSimpleOpen,
  chave: PiKey,
  turma: PiUsersThree,
  recibo: PiReceipt,
  balanca: PiScales,
  estrela: PiSparkle,
  lua: PiMoonStars,
};

export function EmblemaGravado({
  tipo,
  cor,
  fundo,
  tamanho = 120,
}: {
  tipo: Emblema;
  cor: string;
  fundo: string;
  tamanho?: number;
}) {
  const Simbolo = SIMBOLO[tipo];
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 200 200"
      role="img"
      aria-hidden="true"
      style={{ display: 'block', color: cor }}
    >
      <circle cx={100} cy={100} r={96} fill={fundo} />
      {Array.from({ length: 60 }, (_, k) => k * 6).map((deg) => (
        <line
          key={deg}
          x1={100}
          y1={deg % 30 ? 10 : 6}
          x2={100}
          y2={15}
          stroke="currentColor"
          strokeWidth={deg % 30 ? 0.7 : 1.3}
          opacity={0.55}
          transform={`rotate(${deg} 100 100)`}
        />
      ))}
      <circle
        cx={100}
        cy={100}
        r={92}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.2}
        opacity={0.75}
      />
      <circle
        cx={100}
        cy={100}
        r={74}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.9}
        opacity={0.5}
      />
      <circle
        cx={100}
        cy={100}
        r={50}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.8}
        opacity={0.35}
        strokeDasharray="2 4"
      />
      <ellipse
        cx={100}
        cy={100}
        rx={88}
        ry={34}
        transform="rotate(-24 100 100)"
        fill="none"
        stroke="currentColor"
        strokeWidth={0.8}
        opacity={0.3}
      />
      {[
        [100, 26],
        [174, 100],
        [100, 174],
        [26, 100],
      ].map(([x, y]) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={2.4}
          fill="currentColor"
          opacity={0.8}
        />
      ))}
      <svg x={70} y={70} width={60} height={60} viewBox="0 0 256 256">
        <Simbolo size={256} />
      </svg>
    </svg>
  );
}

/**
 * A wide slice of the orbits, for the night band and the ticket's
 * watermark: rings off-center, the dashed ecliptic and a few stars.
 */
export function OrbitaDeFundo({
  cor,
  altura = 220,
  opacidade = 1,
}: {
  cor: string;
  altura?: number;
  opacidade?: number;
}) {
  const estrelas = [
    [60, 40],
    [140, 170],
    [250, 30],
    [520, 60],
    [560, 180],
    [430, 200],
    [330, 150],
    [90, 120],
  ];
  return (
    <svg
      width="100%"
      height={altura}
      viewBox="0 0 600 220"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ display: 'block', color: cor, opacity: opacidade }}
    >
      {[70, 120, 170, 230, 300].map((r, i) => (
        <circle
          key={r}
          cx={300}
          cy={110}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.5 - i * 0.07}
        />
      ))}
      <ellipse
        cx={300}
        cy={110}
        rx={290}
        ry={70}
        transform="rotate(-12 300 110)"
        fill="none"
        stroke="currentColor"
        strokeWidth={0.9}
        opacity={0.35}
        strokeDasharray="2 6"
      />
      <path
        d="M0 110 H600 M300 0 V220"
        stroke="currentColor"
        strokeWidth={0.6}
        opacity={0.18}
      />
      {estrelas.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i % 3 ? 1.3 : 2}
          fill="currentColor"
          opacity={0.7}
        />
      ))}
    </svg>
  );
}
