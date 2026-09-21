// app/admin/users/list/page.tsx
import { Metadata } from 'next';
import UsersList from '@/app/components/Admin/Users/UsersList';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Lista de Usuários | Admin Panel',
  description: 'Gerencie e visualize todos os usuários da plataforma',
  robots: 'noindex, nofollow',
};

export default function AdminUsersListPage() {
  return <UsersList />;
}
