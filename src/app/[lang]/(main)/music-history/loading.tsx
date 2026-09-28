import {
  EsqueletoCabecalho,
  EsqueletoFaixas,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando a história da música">
      <EsqueletoCabecalho centro />
      <EsqueletoFaixas quantos={9} />
    </EsqueletoPagina>
  );
}
