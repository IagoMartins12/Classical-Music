import {
  EsqueletoBusca,
  EsqueletoCabecalho,
  EsqueletoIndice,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando gêneros">
      <EsqueletoCabecalho centro />
      <EsqueletoBusca alternarVista={false} />
      <EsqueletoIndice letras={2} />
    </EsqueletoPagina>
  );
}
