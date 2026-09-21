// app/admin/backup/page.tsx
import { Metadata } from 'next';
import AdminCouponsPageClient from './pageClient';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Gerenciamento de Cupons | Admin Panel',
  description: 'Gerenciar cupons do banco de dados',
  robots: 'noindex, nofollow',
};

export default function CouponsPage() {
  return <AdminCouponsPageClient />;
}
