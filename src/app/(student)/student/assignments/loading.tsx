import {
  EsqueletoCabecalho,
  EsqueletoControles,
  EsqueletoGrade,
  EsqueletoNumeros,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando tarefas">
      <EsqueletoCabecalho />
      <EsqueletoNumeros quantos={4} />
      <EsqueletoControles filtros={2} />
      <EsqueletoGrade colunas={3} quantos={6} />
    </EsqueletoPagina>
  );
}
