// app/admin/users/page.tsx
import { Metadata } from 'next';
import UsersAnalytics from '@/app/components/Admin/Users/UsersAnalytics';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Análise de Usuários | Admin Panel',
  description: 'Análise detalhada de usuários e comportamento na plataforma',
  robots: 'noindex, nofollow',
};

export default function AdminUsersPage() {
  return <UsersAnalytics />;
}
