import {
  EsqueletoCabecalho,
  EsqueletoControles,
  EsqueletoLista,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando histórico">
      <EsqueletoCabecalho />
      <EsqueletoControles filtros={2} />
      <EsqueletoLista quantos={6} />
    </EsqueletoPagina>
  );
}
