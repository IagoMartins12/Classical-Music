import {
  EsqueletoBusca,
  EsqueletoCabecalho,
  EsqueletoObras,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando obras">
      <EsqueletoCabecalho />
      <EsqueletoBusca />
      <EsqueletoObras quantos={8} />
    </EsqueletoPagina>
  );
}
