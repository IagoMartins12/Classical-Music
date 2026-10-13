import { BrandSeal } from '@/app/components/site/BrandSeal';
import { CamadaQueGira } from '@/app/components/site/orbits/CamadaQueGira';

const STARS = [
  [70, 90],
  [520, 70],
  [560, 420],
  [60, 470],
  [470, 540],
  [130, 300],
] as const;

/**
 * The installed app, engraved in the hand of the home atlas: a phone whose
 * screen holds a staff and the seal, crossed by two orbits — one of them
 * turning slowly with its body (`CamadaQueGira`, on the GPU). Decorative.
 */
export function AppGravado() {
  return (
    <div
      aria-hidden="true"
      className="orbitas relative mx-auto aspect-square w-full max-w-[24rem]"
    >
      <svg
        viewBox="0 0 600 600"
        className="engraving absolute inset-0 h-full w-full"
      >
        <ellipse
          pathLength={1}
          cx={300}
          cy={300}
          rx={270}
          ry={96}
          transform="rotate(-18 300 300)"
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          strokeDasharray="2 7"
          opacity={0.35}
          style={{ ['--i' as string]: 0 }}
        />
        <rect
          x={196}
          y={86}
          width={208}
          height={428}
          rx={42}
          fill="var(--fundo)"
          stroke="currentColor"
          strokeWidth={1.6}
          opacity={0.9}
        />
        <rect
          x={212}
          y={118}
          width={176}
          height={364}
          rx={22}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.9}
          opacity={0.45}
        />
        <path
          pathLength={1}
          d="M276 101 H324"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.6}
          style={{ ['--i' as string]: 1 }}
        />
        {/* A staff on the screen, under the seal. */}
        {[392, 404, 416, 428, 440].map((y, i) => (
          <path
            key={y}
            pathLength={1}
            d={`M232 ${y} H368`}
            stroke="currentColor"
            strokeWidth={0.8}
            opacity={0.5}
            style={{ ['--i' as string]: 2 + i * 0.3 }}
          />
        ))}
        <ellipse
          cx={262}
          cy={428}
          rx={6}
          ry={4.5}
          transform="rotate(-20 262 428)"
          fill="currentColor"
          opacity={0.7}
        />
        <path
          d="M267.5 426 V394"
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.7}
        />
        <ellipse
          cx={318}
          cy={416}
          rx={6}
          ry={4.5}
          transform="rotate(-20 318 416)"
          fill="currentColor"
          opacity={0.7}
        />
        <path
          d="M323.5 414 V382"
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.7}
        />
        <path
          d="M267.5 394 L323.5 382"
          stroke="currentColor"
          strokeWidth={2.4}
          opacity={0.7}
        />
        <path
          pathLength={1}
          d="M300 470 m-14 0 h28"
          stroke="currentColor"
          strokeWidth={1.4}
          strokeLinecap="round"
          opacity={0.5}
          style={{ ['--i' as string]: 4 }}
        />
        {STARS.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i % 2 ? 1.4 : 2}
            fill="currentColor"
            opacity={0.55}
          />
        ))}
      </svg>

      <CamadaQueGira className="[animation-duration:90s]" opacity={0.75}>
        <ellipse
          cx={300}
          cy={300}
          rx={252}
          ry={252}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.9}
          opacity={0.4}
        />
        <circle
          cx={300}
          cy={48}
          r={7}
          fill="var(--fundo)"
          stroke="currentColor"
          strokeWidth={1.4}
        />
        <circle cx={300} cy={48} r={2.5} fill="currentColor" />
      </CamadaQueGira>

      <BrandSeal className="absolute left-1/2 top-[36%] w-[22%] -translate-x-1/2 -translate-y-1/2" />
    </div>
  );
}
