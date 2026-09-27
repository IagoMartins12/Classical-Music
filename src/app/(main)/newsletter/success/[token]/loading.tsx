import {
  EsqueletoAviso,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando">
      <EsqueletoAviso />
    </EsqueletoPagina>
  );
}
