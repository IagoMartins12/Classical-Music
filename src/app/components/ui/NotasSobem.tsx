'use client';

import { PiMusicNote, PiMusicNotes } from 'react-icons/pi';

const NOTAS = [
  { x: -22, d: 0, icone: PiMusicNote },
  { x: -6, d: 90, icone: PiMusicNotes },
  { x: 10, d: 40, icone: PiMusicNote },
  { x: 24, d: 140, icone: PiMusicNotes },
  { x: 0, d: 200, icone: PiMusicNote },
];

/**
 * A handful of gold notes rising from where something was achieved
 * ("Já aprendi"). Mount it with a fresh `key` each time; it draws once and
 * stays still and invisible afterwards. Nothing moves with reduced motion.
 */
export function NotasSobem() {
  return (
    <span aria-hidden="true" className="notas-sobem">
      {NOTAS.map(({ x, d, icone: Icone }, i) => (
        <Icone
          key={i}
          style={{ ['--x' as string]: `${x}px`, animationDelay: `${d}ms` }}
        />
      ))}
    </span>
  );
}
