import {
  EsqueletoCabecalho,
  EsqueletoGrade,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando instrumentos">
      <EsqueletoCabecalho centro />
      <EsqueletoGrade colunas={3} quantos={6} />
    </EsqueletoPagina>
  );
}
