import {
  EsqueletoCabecalho,
  EsqueletoControlesComAbas,
  EsqueletoPagina,
  EsqueletoSecaoCartoes,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando envios">
      <EsqueletoCabecalho centro />
      <EsqueletoControlesComAbas abas={4} abasEmCima criar={3} />
      <EsqueletoSecaoCartoes quantos={3} acao />
      <EsqueletoSecaoCartoes quantos={3} acao />
    </EsqueletoPagina>
  );
}
