import {
  EsqueletoCabecalho,
  EsqueletoGrade,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando suporte">
      <EsqueletoCabecalho centro />
      <EsqueletoGrade colunas={2} quantos={4} />
    </EsqueletoPagina>
  );
}
