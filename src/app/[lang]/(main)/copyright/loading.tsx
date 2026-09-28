import {
  EsqueletoCabecalho,
  EsqueletoLeitura,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando">
      <EsqueletoCabecalho centro />
      <EsqueletoLeitura secoes={3} />
    </EsqueletoPagina>
  );
}
