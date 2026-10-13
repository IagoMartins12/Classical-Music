import type { ReactNode } from 'react';
import { CamadaQueGira } from './CamadaQueGira';
import type { IconType } from 'react-icons';
import {
  PiArticle,
  PiBell,
  PiBookOpenText,
  PiBookmarkSimple,
  PiBooks,
  PiChalkboardTeacher,
  PiClipboardText,
  PiUploadSimple,
  PiVideoCamera,
} from 'react-icons/pi';
import { cx } from '@/app/components/ui/cx';
import { BrandSeal } from '../BrandSeal';

/**
 * Engraved orbits in the hand of the home atlas (`home/CelestialAtlas`):
 * rings that draw themselves, a slow tick ring, a few stars, the seal in
 * the middle. Each page gets one that says something: the plans nest like
 * orbits, the site turns like an astrolabe, a class circles its teacher.
 * Decorative (`aria-hidden`): every fact in them is also in the text.
 */

const C = 300;
const DISPLAY = 'var(--fonte-display)';

const STARS = [
  [62, 48],
  [530, 92],
  [548, 470],
  [88, 520],
  [300, 16],
  [20, 300],
  [580, 300],
  [140, 120],
  [470, 160],
  [450, 530],
  [150, 470],
] as const;

/** Rounded so the server and the browser print the same numbers. */
const r2 = (n: number) => Math.round(n * 100) / 100;
const at = (r: number, deg: number) => {
  const rad = (deg * Math.PI) / 180;
  return { x: r2(C + r * Math.cos(rad)), y: r2(C + r * Math.sin(rad)) };
};

/** A circle path that starts at `deg`, for text that follows a ring. */
const arc = (r: number, deg: number) => {
  const a = at(r, deg);
  const b = at(r, deg + 180);
  return `M ${a.x} ${a.y} A ${r} ${r} 0 1 1 ${b.x} ${b.y} A ${r} ${r} 0 1 1 ${a.x} ${a.y}`;
};

function Moldura({
  children,
  seal = true,
  regua,
  className,
}: {
  children: ReactNode;
  seal?: boolean;
  /** The graduated rim, turning on its own layer (`CamadaQueGira`). */
  regua?: ReactNode;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cx(
        'orbitas relative mx-auto hidden aspect-square w-full max-w-[26rem] lg:block',
        className
      )}
    >
      <svg
        viewBox="0 0 600 600"
        className="engraving absolute inset-0 h-full w-full"
      >
        {children}
        {STARS.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i % 3 ? 1.3 : 2}
            fill="currentColor"
            opacity={0.5}
          />
        ))}
      </svg>
      {regua}
      {seal && (
        <BrandSeal className="absolute left-1/2 top-1/2 w-[20%] -translate-x-1/2 -translate-y-1/2" />
      )}
    </div>
  );
}

function Anel({
  r,
  i,
  o = 0.45,
  w = 1.1,
  tracejado,
}: {
  r: number;
  i: number;
  o?: number;
  w?: number;
  tracejado?: string;
}) {
  return (
    <circle
      pathLength={tracejado ? undefined : 1}
      cx={C}
      cy={C}
      r={r}
      fill="none"
      stroke="currentColor"
      strokeWidth={w}
      opacity={o}
      strokeDasharray={tracejado}
      style={{ ['--i' as string]: i }}
    />
  );
}

/** The graduated rim, turning very slowly, as on the home atlas. */
function Regua({ r = 278, o = 0.4 }: { r?: number; o?: number }) {
  return (
    <CamadaQueGira opacity={o}>
      {Array.from({ length: 72 }, (_, k) => k * 5).map((deg) => (
        <line
          key={deg}
          x1={C}
          y1={C - r + (deg % 30 ? 8 : 0)}
          x2={C}
          y2={C - r + 14}
          stroke="currentColor"
          strokeWidth={deg % 30 ? 0.8 : 1.4}
          transform={`rotate(${deg} 300 300)`}
        />
      ))}
    </CamadaQueGira>
  );
}

/** Small capitals that follow a ring. */
function Rotulo({
  r,
  deg,
  children,
  tamanho = 15,
  id,
}: {
  r: number;
  deg: number;
  children: string;
  tamanho?: number;
  id: string;
}) {
  return (
    <>
      <path id={id} d={arc(r, deg)} fill="none" />
      <text
        fill="currentColor"
        fontFamily={DISPLAY}
        fontSize={tamanho}
        letterSpacing="0.18em"
        opacity={0.85}
      >
        <textPath href={`#${id}`}>{children}</textPath>
      </text>
    </>
  );
}

/**
 * A body on an orbit: a disc with an icon, kept upright while its orbit
 * turns (`orbita-gira` on the group, `orbita-de-pe` on the body).
 */
function Corpo({
  r,
  deg,
  icone: Icone,
  tamanho = 46,
  texto,
}: {
  r: number;
  deg: number;
  icone?: IconType;
  tamanho?: number;
  texto?: string;
}) {
  const { x, y } = at(r, deg);
  const h = tamanho / 2;
  return (
    <g className="orbita-de-pe">
      <circle
        cx={x}
        cy={y}
        r={h}
        fill="var(--fundo)"
        stroke="currentColor"
        strokeWidth={1.2}
      />
      {Icone && (
        <svg
          x={x - h * 0.5}
          y={y - h * 0.5}
          width={h}
          height={h}
          viewBox="0 0 256 256"
          className="text-ouro-texto"
        >
          <Icone size={256} />
        </svg>
      )}
      {texto && (
        <text
          x={x}
          y={y + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--ouro-texto)"
          fontFamily={DISPLAY}
          fontSize={h * 0.95}
        >
          {texto}
        </text>
      )}
    </g>
  );
}

function Gira({
  segundos,
  children,
  reverso = false,
}: {
  segundos: number;
  children: ReactNode;
  reverso?: boolean;
}) {
  return (
    <g
      className={cx('orbita-gira', reverso && 'orbita-gira-reverso')}
      style={{ ['--orbita' as string]: `${segundos}s` }}
    >
      {children}
    </g>
  );
}

// ---------------------------------------------------------------------------

/**
 * /pricing: the plans as nested orbits. Free at the core, then Plus,
 * Mentor and Maestro outward; each ring holds the ones inside it, as each
 * plan includes the ones before.
 */
export function OrbitaDosPlanos() {
  const aneis = [
    { r: 92, nome: 'FREE', icone: PiBookOpenText, deg: 200, s: 90 },
    { r: 152, nome: 'PLUS', icone: PiUploadSimple, deg: -40, s: 130 },
    { r: 210, nome: 'MENTOR', icone: PiChalkboardTeacher, deg: 120, s: 170 },
    { r: 266, nome: 'MAESTRO', icone: PiVideoCamera, deg: 20, s: 220 },
  ];
  return (
    <Moldura>
      {aneis.map((a, i) => (
        <Anel key={a.r} r={a.r} i={i} o={0.28 + i * 0.08} w={1 + i * 0.15} />
      ))}
      {aneis.map((a, i) => (
        <Rotulo
          key={a.nome}
          id={`plano-${a.nome}`}
          r={a.r + 9}
          deg={-100 - i * 4}
        >
          {a.nome}
        </Rotulo>
      ))}
      {aneis.map((a) => (
        <Gira key={a.nome} segundos={a.s}>
          <Corpo r={a.r} deg={a.deg} icone={a.icone} tamanho={40} />
        </Gira>
      ))}
    </Moldura>
  );
}

/**
 * /about-us: the site as an astrolabe. The eras run around the rim, the
 * four parts of the site sit on the plate, and the rule across the middle
 * turns slowly over them.
 */
export function AstrolabioDoSite() {
  const epocas = [
    'MEDIEVAL',
    'RENASCIMENTO',
    'BARROCO',
    'CLÁSSICO',
    'ROMÂNTICO',
    'MODERNO',
    'CONTEMPORÂNEO',
  ];
  const partes = [
    { deg: -135, icone: PiBooks },
    { deg: -45, icone: PiBookmarkSimple },
    { deg: 45, icone: PiChalkboardTeacher },
    { deg: 135, icone: PiArticle },
  ];
  return (
    <Moldura>
      <Anel r={286} i={0} o={0.5} w={1.3} />
      <Anel r={252} i={1} o={0.45} />
      <Anel r={170} i={2} o={0.3} />
      <Anel r={96} i={3} o={0.22} />
      <ellipse
        pathLength={1}
        cx={C}
        cy={C}
        rx={250}
        ry={128}
        transform="rotate(-18 300 300)"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        opacity={0.26}
        strokeDasharray="2 6"
        style={{ ['--i' as string]: 4 }}
      />
      {epocas.map((nome, i) => (
        <Rotulo
          key={nome}
          id={`epoca-${i}`}
          r={262}
          deg={-90 + (i * 360) / epocas.length - 18}
          tamanho={12.5}
        >
          {nome}
        </Rotulo>
      ))}
      <Gira segundos={160}>
        <path
          d="M300 60 V540"
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.35}
        />
        <circle cx={C} cy={60} r={4} fill="currentColor" opacity={0.6} />
        <circle cx={C} cy={540} r={4} fill="currentColor" opacity={0.6} />
      </Gira>
      {partes.map((p) => (
        <Corpo key={p.deg} r={170} deg={p.deg} icone={p.icone} />
      ))}
    </Moldura>
  );
}

/**
 * /for-teachers: a class around its teacher. The days of the week mark
 * the rim, the students circle on their orbit, and the assignments and
 * reminders travel the inner, dashed one.
 */
export function TurmaEmOrbita() {
  const dias = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
  const alunos = [
    { deg: -60, texto: 'M' },
    { deg: 30, texto: 'P' },
    { deg: 115, texto: 'A' },
    { deg: 200, texto: 'L' },
    { deg: 255, texto: 'J' },
  ];
  return (
    <Moldura seal={false} regua={<Regua r={268} o={0.3} />}>
      <Anel r={280} i={0} o={0.45} w={1.2} />
      <Anel r={200} i={1} o={0.42} w={1.1} />
      <Anel r={122} i={2} tracejado="3 7" o={0.4} />
      {dias.map((d, i) => (
        <Rotulo
          key={d}
          id={`dia-${d}`}
          r={248}
          deg={-96 + (i * 360) / dias.length}
          tamanho={14}
        >
          {d}
        </Rotulo>
      ))}
      <Gira segundos={140}>
        {alunos.map((a) => (
          <Corpo
            key={a.texto}
            r={200}
            deg={a.deg}
            texto={a.texto}
            tamanho={40}
          />
        ))}
      </Gira>
      <Gira segundos={70} reverso>
        <Corpo r={122} deg={-20} icone={PiClipboardText} tamanho={32} />
        <Corpo r={122} deg={160} icone={PiBell} tamanho={32} />
      </Gira>
      <circle
        cx={C}
        cy={C}
        r={52}
        fill="var(--fundo)"
        stroke="currentColor"
        strokeWidth={1.4}
      />
      <svg
        x={C - 26}
        y={C - 30}
        width={52}
        height={52}
        viewBox="0 0 256 256"
        className="text-ouro-texto"
      >
        <PiChalkboardTeacher size={256} />
      </svg>
    </Moldura>
  );
}
