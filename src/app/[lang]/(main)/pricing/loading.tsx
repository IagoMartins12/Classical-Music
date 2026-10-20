import {
  EsqueletoAbertura,
  EsqueletoPagina,
  EsqueletoPlanos,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando planos">
      <EsqueletoAbertura linhas={1} />
      <EsqueletoPlanos />
    </EsqueletoPagina>
  );
}
