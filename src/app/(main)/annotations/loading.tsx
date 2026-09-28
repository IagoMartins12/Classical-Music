import {
  EsqueletoCabecalho,
  EsqueletoControlesComAbas,
  EsqueletoPagina,
  EsqueletoSecaoCartoes,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando anotações">
      <EsqueletoCabecalho centro />
      <EsqueletoControlesComAbas abas={3} />
      <EsqueletoSecaoCartoes quantos={6} />
    </EsqueletoPagina>
  );
}
