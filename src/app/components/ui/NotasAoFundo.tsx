import {
  PiMusicNote,
  PiMusicNoteSimple,
  PiMusicNotes,
  PiMusicNotesSimple,
} from 'react-icons/pi';

/**
 * As notas que sobem ao fundo — a única coisa no site que só poderia ser
 * deste produto.
 *
 * **Onde:** páginas em que a pessoa espera ou se orienta (404, erro, acesso,
 * verificação, sobre, ajuda, FAQ, suporte, contato) e uma vez, discreta, no
 * topo da inicial. **Onde não:** catálogo, busca, listas, artigo, aluno,
 * professor e painel — onde se trabalha ou se lê, elas atrapalham.
 *
 * Quatro notas de uma família só (Phosphor), no ouro da marca, subindo em 14s
 * com atrasos diferentes, opacidade máxima de 28%, sem pulso e sem desfoque.
 * Só CSS: nada disto roda no navegador. Com movimento reduzido, somem.
 */

const NOTAS = [
  { Icone: PiMusicNote, esquerda: '12%', atraso: '0s', tamanho: 22 },
  { Icone: PiMusicNotesSimple, esquerda: '36%', atraso: '-3.5s', tamanho: 26 },
  { Icone: PiMusicNoteSimple, esquerda: '63%', atraso: '-7s', tamanho: 20 },
  { Icone: PiMusicNotes, esquerda: '86%', atraso: '-10.5s', tamanho: 24 },
];

export function NotasAoFundo({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`notas-ao-fundo pointer-events-none absolute inset-0 overflow-hidden ${className ?? ''}`}
    >
      {NOTAS.map(({ Icone, esquerda, atraso, tamanho }) => (
        <Icone
          key={esquerda}
          className="nota-ao-fundo absolute text-ouro"
          style={{ left: esquerda, animationDelay: atraso }}
          size={tamanho}
        />
      ))}
    </div>
  );
}
