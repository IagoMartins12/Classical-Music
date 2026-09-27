import {
  EsqueletoCabecalho,
  EsqueletoControles,
  EsqueletoLista,
  EsqueletoNumeros,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando moderação">
      <EsqueletoCabecalho acao />
      <EsqueletoNumeros quantos={4} />
      <EsqueletoControles filtros={2} />
      <EsqueletoLista quantos={6} />
    </EsqueletoPagina>
  );
}
