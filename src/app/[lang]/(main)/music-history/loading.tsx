import {
  EsqueletoCabecalho,
  EsqueletoLeitura,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando a história da música">
      <EsqueletoCabecalho centro />
      <EsqueletoLeitura secoes={3} />
    </EsqueletoPagina>
  );
}
