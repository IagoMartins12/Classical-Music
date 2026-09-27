import {
  EsqueletoCabecalho,
  EsqueletoDetalhe,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando partitura">
      <EsqueletoCabecalho acao />
      <EsqueletoDetalhe />
    </EsqueletoPagina>
  );
}
