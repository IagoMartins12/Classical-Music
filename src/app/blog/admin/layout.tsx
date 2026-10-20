import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/app/libs/api/server-session';
import { AdminShell } from '@/app/components/Admin/painel/AdminShell';
import { Avisos } from '@/app/components/ui/Avisos';

export const metadata: Metadata = {
  title: {
    template: '%s · Painel · Opus Atlas',
    default: 'Blog · Painel · Opus Atlas',
  },
  robots: 'noindex, nofollow',
};

/**
 * O admin do blog mora na casca do painel desde 29/09/2026 — antes ele
 * herdava o cabeçalho e o rodapé do blog público e era outro lugar para quem
 * administra. As páginas públicas do blog foram para `blog/(site)`, um grupo
 * de rota: os endereços não mudaram.
 */
export default async function BlogAdminLayout({
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
