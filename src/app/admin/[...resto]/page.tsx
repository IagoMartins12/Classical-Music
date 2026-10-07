import { notFound } from 'next/navigation';

/**
 * Endereço desconhecido dentro do painel: cai no `not-found` do próprio
 * painel, que mora dentro da casca (lateral, ⌘K), em vez do "não encontrado"
 * do site.
 */
export default function EnderecoDesconhecido() {
  notFound();
}
