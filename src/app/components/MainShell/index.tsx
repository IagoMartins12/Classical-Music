// components/MainShell — o invólucro visual do site público
//
// Era o corpo de `(main)/layout.tsx`. Saiu de lá porque agora há dois grupos
// de rota com a mesma casca: `app/[lang]/(main)/` (as páginas públicas, que o
// Next gera por idioma e guarda) e `app/(main)/` (as que dependem de quem
// está logado e seguem dinâmicas). Um componente só, para as duas não
// divergirem — nada aqui mudou de aparência.
import { Avisos } from '@/app/components/ui/Avisos';
import { SiteHeader } from '@/app/components/site/header/SiteHeader';
import Footer from '../Footer';
import { FavoritesProvider } from '../../providers/FavoritesProvider';
import AdsProvider from '../Ads/AdsProvider';

export default function MainShell({ children }: { children: React.ReactNode }) {
  return (
    <AdsProvider>
      <FavoritesProvider>
        <div className="min-h-screen">
          <SiteHeader />
          <main>{children}</main>
          <Footer />
          <Avisos />
        </div>
      </FavoritesProvider>
    </AdsProvider>
  );
}
