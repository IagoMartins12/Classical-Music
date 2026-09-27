import {
  EsqueletoCabecalho,
  EsqueletoFormulario,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando">
      <EsqueletoCabecalho />
      <EsqueletoFormulario secoes={3} campos={4} />
    </EsqueletoPagina>
  );
}
