// app/admin/backup/page.tsx
import { Metadata } from 'next';
import AdminPlanPricingPage from '@/app/components/Admin/AdminPlanPricing';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Gerenciamento de Planos | Admin Panel',
  description: 'Gerenciar planos do banco de dados',
  robots: 'noindex, nofollow',
};

export default function CouponsPage() {
  return <AdminPlanPricingPage />;
}
