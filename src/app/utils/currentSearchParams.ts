/**
 * Os parâmetros da URL atual, lidos no momento da chamada.
 *
 * **Por que não `useSearchParams()`.** Ele é uma API dinâmica do cliente.
 * Durante a geração estática, o Next renderiza **no navegador** toda a
 * subárvore até o `Suspense` mais próximo de quem o chama: o HTML sai com o
 * esqueleto e a lista só aparece depois da hidratação. Numa página feita para
 * ser indexada isso é o pior dos dois mundos — guardada em cache e vazia para
 * o buscador. Foi o que aconteceu com `/composers`: 0 cartões no HTML, com os
 * dados presentes no payload.
 *
 * Quem usa isto só precisa dos parâmetros ao montar a próxima URL, dentro de
 * um callback disparado por clique — nunca durante a renderização. Ler
 * `window.location.search` ali dá exatamente o mesmo valor sem arrastar a
 * árvore para o cliente.
 */
export function currentSearchParams(): URLSearchParams {
  if (typeof window === 'undefined') {
    return new URLSearchParams();
  }

  return new URLSearchParams(window.location.search);
}
