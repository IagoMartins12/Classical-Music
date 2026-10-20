/**
 * Junta classes, ignorando o que for falso.
 *
 * Existe para não trazer `clsx` só por isto: o front já carrega 214 mil
 * linhas, e uma dependência nova para concatenar string é peso sem troco.
 * Não resolve conflito entre utilitários do Tailwind (isso é o
 * `tailwind-merge`); os primitivos evitam o problema na origem, deixando a
 * classe de fora vir por último no atributo.
 */
export function cx(...partes: Array<string | false | null | undefined>) {
  return partes.filter(Boolean).join(' ');
}
