import {
  EsqueletoCabecalho,
  EsqueletoControlesComAbas,
  EsqueletoPagina,
  EsqueletoSecaoCartoes,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando favoritos">
      <EsqueletoCabecalho centro />
      <EsqueletoControlesComAbas abas={4} />
      <EsqueletoSecaoCartoes quantos={3} />
      <EsqueletoSecaoCartoes quantos={3} />
    </EsqueletoPagina>
  );
}
