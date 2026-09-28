import {
  EsqueletoAviso,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

// Vale para as rotas daqui sem esqueleto próprio: confirmação de conta e de
// e-mail, nova senha e o retorno da assinatura — todas um card no centro.
export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando">
      <EsqueletoAviso />
    </EsqueletoPagina>
  );
}
