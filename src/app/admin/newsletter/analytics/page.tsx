// app/admin/newsletter/analytics/page.tsx
import { Metadata } from 'next';
import NewsletterAnalyticsClient from '@/app/components/Admin/Newsletter/NewsletterAnalyticsClient';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Analytics | Newsletter Admin',
  description: 'Analytics e relatórios da newsletter',
  robots: 'noindex, nofollow',
};

export default function NewsletterAnalyticsPage() {
  return <NewsletterAnalyticsClient />;
}
