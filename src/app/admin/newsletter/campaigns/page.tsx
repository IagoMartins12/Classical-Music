// app/admin/newsletter/campaigns/page.tsx
import { Metadata } from 'next';
import NewsletterCampaignsClient from '@/app/components/Admin/Newsletter/NewsletterCampaignsClient';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Campanhas | Newsletter Admin',
  description: 'Gerenciar campanhas de email da newsletter',
  robots: 'noindex, nofollow',
};

export default function NewsletterCampaignsPage() {
  return <NewsletterCampaignsClient />;
}
