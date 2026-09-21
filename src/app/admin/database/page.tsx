// app/admin/database/page.tsx
import { Metadata } from 'next';
import DatabaseStudioClient from '@/app/components/Admin/Database/DatabaseStudioClient';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Database Studio | Admin Panel',
  description:
    'Gerenciar banco de dados - Visualizar, editar e deletar registros',
  robots: 'noindex, nofollow',
};

export default function DatabaseStudioPage() {
  return <DatabaseStudioClient />;
}
