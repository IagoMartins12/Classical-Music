// app/admin/newsletter/subscribers/page.tsx
import { Metadata } from 'next';
import NewsletterSubscribersClient from '@/app/components/Admin/Newsletter/NewsletterSubscribersClient';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Subscribers | Newsletter Admin',
  description: 'Gerenciar subscribers da newsletter',
  robots: 'noindex, nofollow',
};

export default function NewsletterSubscribersPage() {
  return <NewsletterSubscribersClient />;
}
