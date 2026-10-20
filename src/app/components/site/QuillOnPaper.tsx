/** Where each handwritten line sits on the sheet (start, end, height). */
const LINES = [
  [64, 136, 52],
  [64, 136, 70],
  [64, 136, 88],
  [64, 112, 106],
] as const;

/** A wavering ink line, like handwriting rather than a ruler. */
const inkLine = (from: number, to: number, y: number) => {
  let d = `M${from} ${y}`;
  for (let x = from; x < to; x += 8) d += ` q2 -2.6 4 0 t4 0`;
  return d;
};

/**
 * A sheet in the middle and a quill on top writing it, one line after
 * another (the biography being written, the scores being fetched): the nib follows each stroke (`bio-pen` and `bio-l*` in
 * globals.css share one six-second cycle). With reduced motion the sheet
 * is already written and the quill rests.
 */
export function QuillOnPaper() {
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
      {LINES.map(([from, to, y], i) => (
        <path
          key={y}
          className={`bio-l${i}`}
          d={inkLine(from, to, y)}
          pathLength={1}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ))}
      {/* The nib sits at the group's origin, so moving the group writes. */}
      <g className="bio-pen">
        <g transform="rotate(34)">
          <path d="M0 0 L-2.2 -9 L2.2 -9 Z" fill="currentColor" />
          <path
            d="M0 -9 C-9 -22 -10 -44 -2 -70 C2 -52 10 -34 4 -9 Z"
            fill="currentColor"
            opacity="0.85"
          />
          <path
            d="M0 -9 C-1 -30 -1.5 -50 -2 -70"
            fill="none"
            stroke="var(--fundo)"
            strokeWidth="1"
            opacity="0.7"
          />
        </g>
      </g>
    </svg>
  );
}
