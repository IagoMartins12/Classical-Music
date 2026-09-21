// app/admin/newsletter/templates/page.tsx
import { Metadata } from 'next';
import NewsletterTemplatesClient from '@/app/components/Admin/Newsletter/NewsletterTemplatesClient';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Templates | Newsletter Admin',
  description: 'Gerenciar templates de email da newsletter',
  robots: 'noindex, nofollow',
};

export default function NewsletterTemplatesPage() {
  return <NewsletterTemplatesClient />;
}
