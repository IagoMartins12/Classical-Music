const C = 300;
const R = 220;
const PARALLELS = [-60, -36, -12, 12, 36, 60];
const MERIDIANS = [20, 45, 70];
const STARS = [
  [40, 70],
  [110, 30],
  [520, 50],
  [570, 140],
  [560, 470],
  [500, 560],
  [70, 520],
  [20, 330],
  [585, 320],
  [300, 12],
  [300, 590],
  [150, 140],
  [455, 120],
  [150, 470],
] as const;
const round = (n: number) => Math.round(n * 10) / 10;

/**
 * Hero C (phones): the atlas without its points — an engraved celestial
 * globe behind the hero text, softened in the middle so the text reads.
 */
export function CelestialGlobe({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`hero-globe pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-[min(46rem,150vw)] -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(circle_at_50%_50%,rgb(0_0_0/0.3)_0%,rgb(0_0_0/0.45)_38%,rgb(0_0_0)_62%)] ${className ?? ''}`}
    >
      <svg
        viewBox="0 0 600 600"
        className="engraving absolute inset-0 h-full w-full text-[var(--globe-ink)]"
      >
        <circle
          pathLength={1}
          cx={C}
          cy={C}
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          opacity={0.65}
          style={{ ['--i' as string]: 0 }}
        />
        {PARALLELS.map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const rx = round(R * Math.cos(rad));
          return (
            <ellipse
              key={deg}
              pathLength={1}
              cx={C}
              cy={round(C - R * Math.sin(rad))}
              rx={rx}
              ry={round(rx * 0.2)}
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              opacity={0.3}
              style={{ ['--i' as string]: i + 1 }}
            />
          );
        })}
        <ellipse
          pathLength={1}
          cx={C}
          cy={C}
          rx={R}
          ry={R * 0.2}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
          opacity={0.5}
          style={{ ['--i' as string]: 2 }}
        />
        {MERIDIANS.map((deg, i) => (
          <ellipse
            key={deg}
            pathLength={1}
            cx={C}
            cy={C}
            rx={round(R * Math.cos((deg * Math.PI) / 180))}
            ry={R}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            opacity={0.28}
            style={{ ['--i' as string]: i + 3 }}
          />
        ))}
        <path
          pathLength={1}
          d={`M${C} ${C - R} V${C + R}`}
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.3}
          style={{ ['--i' as string]: 6 }}
        />
        <ellipse
          pathLength={1}
          cx={C}
          cy={C}
          rx={285}
          ry={78}
          transform={`rotate(-23 ${C} ${C})`}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          strokeDasharray="2 7"
          opacity={0.42}
          style={{ ['--i' as string]: 7 }}
        />
        {STARS.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i % 3 ? 1.4 : 2.2}
            fill="currentColor"
            opacity={0.55}
          />
        ))}
        <g
          className="engraving-ring"
          style={{ transformOrigin: `${C}px ${C}px` }}
          opacity={0.45}
        >
          {Array.from({ length: 90 }, (_, k) => k * 4).map((deg) => (
            <line
              key={deg}
              x1={C}
              y1={C - R - (deg % 40 ? 22 : 32)}
              x2={C}
              y2={C - R - 12}
              stroke="currentColor"
              strokeWidth={deg % 40 ? 0.8 : 1.4}
              transform={`rotate(${deg} ${C} ${C})`}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
