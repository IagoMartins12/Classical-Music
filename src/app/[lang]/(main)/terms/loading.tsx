import {
  EsqueletoDocumento,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando">
      <EsqueletoDocumento />
    </EsqueletoPagina>
  );
}
