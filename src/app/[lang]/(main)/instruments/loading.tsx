import {
  EsqueletoCabecalho,
  EsqueletoFaixas,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando instrumentos">
      <EsqueletoCabecalho centro />
      <EsqueletoFaixas quantos={6} icone="grande" lado="numero" />
    </EsqueletoPagina>
  );
}
