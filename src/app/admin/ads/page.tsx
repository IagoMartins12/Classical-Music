// app/admin/ads/page.tsx
import { Metadata } from 'next';
import AdsManagementClient from '@/app/components/Admin/Ads/AdsManagementClient';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Gerenciamento de Publicidades | Admin Panel',
  description: 'Gerenciar publicidades e campanhas da plataforma',
  robots: 'noindex, nofollow',
};

export default function AdsManagementPage() {
  return <AdsManagementClient />;
}
