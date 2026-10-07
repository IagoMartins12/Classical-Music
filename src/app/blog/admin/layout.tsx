import type { Metadata } from 'next';
import { AdminShell } from '@/app/components/Admin/painel/AdminShell';
import { Avisos } from '@/app/components/Admin/painel/Avisos';

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
export default function BlogAdminLayout({
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
