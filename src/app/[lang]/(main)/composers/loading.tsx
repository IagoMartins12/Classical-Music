import {
  EsqueletoCabecalho,
  EsqueletoControles,
  EsqueletoGrade,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando compositores">
      <EsqueletoCabecalho centro />
      <EsqueletoControles filtros={1} />
      <EsqueletoGrade colunas={4} quantos={8} />
    </EsqueletoPagina>
  );
}
