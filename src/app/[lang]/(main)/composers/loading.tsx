import {
  EsqueletoBusca,
  EsqueletoCabecalho,
  EsqueletoCompositores,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando compositores">
      <EsqueletoCabecalho />
      <EsqueletoBusca seletores={1} />
      <EsqueletoCompositores quantos={8} />
    </EsqueletoPagina>
  );
}
