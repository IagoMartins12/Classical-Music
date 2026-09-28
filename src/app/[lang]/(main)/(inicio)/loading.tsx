// No grupo `(inicio)`, e não na raiz de `(main)`: lá ele valeria para as
// páginas de detalhe também — ver `../README-loading.md`.
import {
  EsqueletoInicio,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando a página inicial">
      <EsqueletoInicio />
    </EsqueletoPagina>
  );
}
