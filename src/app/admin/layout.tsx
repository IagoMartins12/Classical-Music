import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/app/libs/api/server-session';
import { AdminShell } from '../components/Admin/painel/AdminShell';
import { Avisos } from '../components/ui/Avisos';

export const metadata: Metadata = {
  title: {
    template: '%s · Painel · Opus Atlas',
    default: 'Painel · Opus Atlas',
  },
  robots: 'noindex, nofollow',
};

/**
 * O painel é CSR: a página não busca dado no servidor, e a API confere o
 * papel em cada chamada. O layout confere a sessão antes de desenhar, para
 * que quem não é administrador vá direto para "acesso negado".
 *
 * Sem `AdsProvider` e `FavoritesProvider` desde 29/09/2026: o primeiro
 * buscava anúncios (e podia abrir um anúncio em modal dentro do painel), o
 * segundo buscava os favoritos de quem estava logado. Duas chamadas por
 * página que o painel nunca usou.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Decided on the server, before anything is drawn: the shell must never
  // show, not even for an instant, to someone who is not an administrator.
  const session = await getServerSession();
  if (!session?.user?.id) redirect('/not-authenticated');
  if (session.user.role !== 2) redirect('/access-denied');

  return (
    <>
      <AdminShell>{children}</AdminShell>
      <Avisos />
    </>
  );
}
