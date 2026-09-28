import {
  EsqueletoFicha,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando">
      <EsqueletoFicha />
    </EsqueletoPagina>
  );
}
