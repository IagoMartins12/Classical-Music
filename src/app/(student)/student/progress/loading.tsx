import {
  EsqueletoCabecalho,
  EsqueletoGrade,
  EsqueletoNumeros,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando progresso">
      <EsqueletoCabecalho />
      <EsqueletoNumeros quantos={4} />
      <EsqueletoGrade colunas={2} quantos={2} />
    </EsqueletoPagina>
  );
}
