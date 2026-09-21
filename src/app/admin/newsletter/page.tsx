// app/admin/newsletter/page.tsx
import { Metadata } from 'next';
import NewsletterDashboardClient from '@/app/components/Admin/Newsletter/NewsletterDashboardClient';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Newsletter Dashboard | Admin',
  description: 'Gerenciamento de newsletter e campanhas de email',
  robots: 'noindex, nofollow',
};

export default function NewsletterDashboardPage() {
  return <NewsletterDashboardClient />;
}
