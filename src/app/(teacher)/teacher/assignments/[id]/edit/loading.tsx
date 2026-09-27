import {
  EsqueletoCabecalho,
  EsqueletoFormulario,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando tarefa">
      <EsqueletoCabecalho />
      <EsqueletoFormulario secoes={2} campos={4} />
    </EsqueletoPagina>
  );
}
