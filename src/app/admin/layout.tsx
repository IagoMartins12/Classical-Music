import type { Metadata } from 'next';
import { AdminShell } from '../components/Admin/painel/AdminShell';
import { Avisos } from '../components/Admin/painel/Avisos';

export const metadata: Metadata = {
  title: {
    template: '%s · Painel · Opus Atlas',
    default: 'Painel · Opus Atlas',
  },
  robots: 'noindex, nofollow',
};

/**
 * O painel é CSR: a página não busca dado no servidor, e quem confere o papel
 * é a API na primeira chamada. A casca (`AdminShell`) só evita mostrar o
 * painel a quem não é administrador.
 *
 * Sem `AdsProvider` e `FavoritesProvider` desde 29/09/2026: o primeiro
 * buscava anúncios (e podia abrir um anúncio em modal dentro do painel), o
 * segundo buscava os favoritos de quem estava logado. Duas chamadas por
 * página que o painel nunca usou.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminShell>{children}</AdminShell>
      <Avisos />
    </>
  );
}
