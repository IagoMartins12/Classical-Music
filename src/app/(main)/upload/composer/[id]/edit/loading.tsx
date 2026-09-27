import {
  EsqueletoCabecalho,
  EsqueletoDetalhe,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando compositor">
      <EsqueletoCabecalho acao />
      <EsqueletoDetalhe />
    </EsqueletoPagina>
  );
}
