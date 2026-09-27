import {
  EsqueletoCabecalho,
  EsqueletoControles,
  EsqueletoGrade,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando favoritos">
      <EsqueletoCabecalho />
      <EsqueletoControles filtros={1} />
      <EsqueletoGrade colunas={3} quantos={6} />
    </EsqueletoPagina>
  );
}
