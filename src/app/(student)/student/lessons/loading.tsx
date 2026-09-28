import {
  EsqueletoCabecalho,
  EsqueletoControles,
  EsqueletoNumerosCentro,
  EsqueletoPagina,
  EsqueletoGrade,
} from '@/app/components/ui/Carregando';

// A forma da página de aulas: o cabeçalho centrado, os números com o ícone
// em cima, a busca e a lista.
export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando aulas">
      <EsqueletoCabecalho centro />
      <EsqueletoNumerosCentro quantos={4} />
      <EsqueletoControles filtros={2} />
      <EsqueletoGrade colunas={3} quantos={6} />
    </EsqueletoPagina>
  );
}
