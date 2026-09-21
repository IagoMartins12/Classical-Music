// app/admin/newsletter/test-lists/page.tsx
import { Metadata } from 'next';
import TestEmailListsManager from '@/app/components/Admin/Newsletter/TestEmailListsManager';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Listas de Teste | Newsletter Admin',
  description: 'Gerenciamento de listas de teste para campanhas de email',
  robots: 'noindex, nofollow',
};

export default function TestListsAdminPage() {
  return <TestEmailListsManager />;
}
