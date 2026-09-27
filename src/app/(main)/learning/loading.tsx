import {
  EsqueletoCabecalho,
  EsqueletoControles,
  EsqueletoGrade,
  EsqueletoNumeros,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando estudos">
      <EsqueletoCabecalho />
      <EsqueletoNumeros quantos={4} />
      <EsqueletoControles filtros={1} />
      <EsqueletoGrade colunas={3} quantos={6} />
    </EsqueletoPagina>
  );
}
