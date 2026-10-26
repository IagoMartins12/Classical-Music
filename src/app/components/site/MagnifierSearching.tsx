/** The three staves on the sheet: where each one's top line sits. */
const STAVES = [44, 80, 116] as const;
/** A few note heads on each staff, as (x, step below the top line). */
const NOTES = [
  [66, 3],
  [80, 1.5],
  [96, 2.5],
  [112, 0.5],
  [128, 2],
] as const;

/**
 * A sheet of music and a magnifier moving over it, stopping here and there
 * as if looking for something (a work's scores being fetched): the lens
 * glides in one loop (`lupa-procura` in globals.css). The sibling of
 * `QuillOnPaper`, which writes biographies. With reduced motion the lens
 * rests over the sheet.
 */
export function MagnifierSearching() {
  return (
    <svg
      viewBox="0 -36 200 196"
      aria-hidden="true"
      className="h-48 w-48 shrink-0 text-[var(--ouro)]"
    >
      <rect
        x="50"
        y="22"
        width="100"
        height="128"
        rx="3"
        fill="var(--fundo)"
        stroke="currentColor"
        strokeWidth="1.25"
        opacity="0.9"
      />
      {STAVES.map((top) => (
        <g key={top} opacity="0.55">
          {[0, 1, 2, 3, 4].map((l) => (
            <line
              key={l}
              x1="60"
              x2="140"
              y1={top + l * 4}
              y2={top + l * 4}
              stroke="currentColor"
              strokeWidth="0.6"
            />
          ))}
          {NOTES.map(([x, step], i) => (
            <ellipse
              key={i}
              cx={x}
              cy={top + step * 4}
              rx="2.6"
              ry="1.9"
              transform={`rotate(-20 ${x} ${top + step * 4})`}
              fill="currentColor"
            />
          ))}
        </g>
      ))}
      {/* The lens' center sits at the group's origin: moving it searches. */}
      <g className="lupa-procura">
        <circle r="19" fill="var(--fundo)" opacity="0.35" />
        <circle r="19" fill="none" stroke="currentColor" strokeWidth="3" />
        <path
          d="M-11 -6 A13 13 0 0 1 -4 -12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.7"
        />
        <line
          x1="13.5"
          y1="13.5"
          x2="30"
          y2="30"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
