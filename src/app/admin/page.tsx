// app/admin/page.tsx
import { Metadata } from 'next';
import AdminDashboardClient from './AdminDashboardClient';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Classical Music Platform',
  description: 'Painel principal de administração da plataforma',
  robots: 'noindex, nofollow',
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}
