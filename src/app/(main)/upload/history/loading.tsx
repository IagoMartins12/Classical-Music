import {
  EsqueletoCabecalho,
  EsqueletoControles,
  EsqueletoLinhaDoTempo,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando histórico">
      <EsqueletoCabecalho centro />
      <EsqueletoControles filtros={1} />
      <EsqueletoLinhaDoTempo quantos={5} />
    </EsqueletoPagina>
  );
}
