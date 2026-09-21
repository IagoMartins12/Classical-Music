/**
 * Quanto da biografia viaja com uma lista de compositores.
 *
 * A API devolve o texto inteiro, e os cartões mostram duas linhas. Mandá-lo
 * como veio punha dezenas de biografias completas dentro do HTML de cada
 * visita — na história da música eram ~90 textos, uns 350 kB que o navegador
 * baixa, analisa e hidrata para exibir 150 caracteres. O corte acontece no
 * servidor; quem quer a biografia toda abre a página do compositor, que a
 * busca por conta própria.
 */
const TEASER_LENGTH = 200;

export function bioTeaser(bio: string | null | undefined): string | null {
  if (!bio) return null;

  const text = bio.trim();

  return text.length <= TEASER_LENGTH
    ? text
    : `${text.slice(0, TEASER_LENGTH).trimEnd()}…`;
}
