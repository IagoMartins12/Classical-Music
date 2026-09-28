import {
  EsqueletoCabecalho,
  EsqueletoFormulario,
  EsqueletoGrade,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando contato">
      <EsqueletoCabecalho centro />
      <EsqueletoGrade colunas={2} quantos={4} />
      <EsqueletoFormulario secoes={1} campos={4} />
    </EsqueletoPagina>
  );
}
