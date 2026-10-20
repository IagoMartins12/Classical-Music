import {
  EsqueletoAbertura,
  EsqueletoPagina,
  EsqueletoVerbetes,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando">
      <EsqueletoAbertura linhas={3} acoes />
      <EsqueletoVerbetes />
    </EsqueletoPagina>
  );
}
