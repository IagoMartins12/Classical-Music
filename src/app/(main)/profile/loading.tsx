import { EsqueletoPerfil } from '@/app/components/ui/Carregando';
import { AreaCarregando } from '@/app/components/ui/Skeleton';

// Sem `EsqueletoPagina`: a própria página do perfil já é o `section-wrap`, e
// o esqueleto também aparece dentro dela (`pageClient`, antes da sessão).
// Nas duas situações ele ocupa o mesmo lugar que o perfil.
export default function Carregando() {
  return (
    <AreaCarregando rotulo="Carregando perfil">
      <div className="section-wrap">
        <EsqueletoPerfil />
      </div>
    </AreaCarregando>
  );
}
