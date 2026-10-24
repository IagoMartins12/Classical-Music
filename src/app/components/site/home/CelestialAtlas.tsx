import type { IconType } from 'react-icons';
import { CamadaQueGira } from '../orbits/CamadaQueGira';
import {
  PiArticle,
  PiBookmarkSimple,
  PiChalkboardTeacher,
  PiFileText,
  PiHourglassMedium,
  PiPlay,
  PiUser,
  PiPianoKeys,
} from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Icon } from '@/app/components/ui/Icon';
import type { HomeCopy } from '@/app/conteudo/site/home';
import { BrandSeal } from '../BrandSeal';

type OrbitKey = keyof HomeCopy['hero']['orbits'];

interface Orbit {
  key: OrbitKey;
  href: string;
  /** Radius (% of the map) and angle (degrees, 0 = right). */
  r: number;
  angle: number;
  icon: IconType;
}

const ORBITS: readonly Orbit[] = [
  { key: 'composers', href: '/composers', r: 25, angle: -125, icon: PiUser },
  { key: 'scores', href: '/works', r: 25, angle: -35, icon: PiFileText },
  { key: 'recordings', href: '/works', r: 25, angle: 55, icon: PiPlay },
  {
    key: 'history',
    href: '/music-history',
    r: 25,
    angle: 145,
    icon: PiHourglassMedium,
  },
  {
    key: 'studies',
    href: '/learning',
    r: 43,
    angle: -80,
    icon: PiBookmarkSimple,
  },
  {
    key: 'lessons',
    href: '/for-teachers',
    r: 43,
    angle: 10,
    icon: PiChalkboardTeacher,
  },
  { key: 'reading', href: '/blog', r: 43, angle: 100, icon: PiArticle },
  {
    key: 'instruments',
    href: '/instruments',
    r: 43,
    angle: 190,
    icon: PiPianoKeys,
  },
];

const STARS = [
  [62, 48],
  [530, 92],
  [548, 470],
  [88, 520],
  [300, 22],
  [24, 300],
  [576, 300],
  [300, 578],
  [140, 120],
  [470, 160],
  [450, 520],
  [150, 470],
] as const;

/** Rounded so the server and the browser print the same coordinates. */
const pos = (r: number, angle: number) => {
  const rad = (angle * Math.PI) / 180;
  return {
    left: `${Math.round((50 + r * Math.cos(rad)) * 100) / 100}%`,
    top: `${Math.round((50 + r * Math.sin(rad)) * 100) / 100}%`,
  };
};

/**
 * Hero A (tablet and desktop): an engraved celestial atlas with the seal in
 * the middle and every part of the site in orbit — the hero is also a map.
 */
export function CelestialAtlas({ copy }: { copy: HomeCopy['hero'] }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[27rem]">
      <svg
        viewBox="0 0 600 600"
        aria-hidden="true"
        className="engraving absolute inset-0 h-full w-full text-[var(--ouro)]"
      >
        {[
          { r: 150, o: 0.55, w: 1.2 },
          { r: 258, o: 0.5, w: 1.2 },
          { r: 96, o: 0.25, w: 1 },
          { r: 206, o: 0.22, w: 1 },
        ].map((c, i) => (
          <circle
            key={c.r}
            pathLength={1}
            cx={300}
            cy={300}
            r={c.r}
            fill="none"
            stroke="currentColor"
            strokeWidth={c.w}
            opacity={c.o}
            style={{ ['--i' as string]: i }}
          />
        ))}
        <ellipse
          pathLength={1}
          cx={300}
          cy={300}
          rx={286}
          ry={110}
          transform="rotate(-24 300 300)"
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.28}
          strokeDasharray="2 6"
          style={{ ['--i' as string]: 4 }}
        />
        <path
          pathLength={1}
          d="M300 14 V586 M14 300 H586"
          stroke="currentColor"
          strokeWidth={0.8}
          opacity={0.16}
          style={{ ['--i' as string]: 5 }}
        />
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
      <CamadaQueGira opacity={0.45} className="text-[var(--ouro)]">
        {Array.from({ length: 72 }, (_, k) => k * 5).map((deg) => (
          <line
            key={deg}
            x1={300}
            y1={deg % 30 ? 22 : 14}
            x2={300}
            y2={30}
            stroke="currentColor"
            strokeWidth={deg % 30 ? 0.8 : 1.4}
            transform={`rotate(${deg} 300 300)`}
          />
        ))}
      </CamadaQueGira>

      <BrandSeal
        reveal
        className="absolute left-1/2 top-1/2 w-[23%] -translate-x-1/2 -translate-y-1/2"
      />

      <ul aria-label={copy.atlasLabel}>
        {ORBITS.map((orbit, i) => (
          <li
            key={orbit.key}
            className="rise absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              ...pos(orbit.r, orbit.angle),
              ['--delay' as string]: `${900 + i * 120}ms`,
            }}
          >
            <Link
              href={orbit.href}
              className="group flex flex-col items-center gap-1.5 text-center"
            >
              <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-[var(--fundo)] text-ouro-texto shadow-[0_0_0_1px_var(--linha-forte),var(--sombra-1)] transition-shadow duration-[var(--t-resposta)] group-hover:shadow-[0_0_0_2px_var(--ouro),var(--sombra-2)] xl:h-12 xl:w-12">
                <Icon de={orbit.icon} tamanho="m" />
              </span>
              <span className="whitespace-nowrap rounded-[6px] bg-fundo px-1.5 py-0.5 font-display text-[0.9375rem] leading-tight group-hover:text-ouro-texto">
                {copy.orbits[orbit.key]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
