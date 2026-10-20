import type { Metadata } from 'next';
import VisaoNewsletter from '@/app/components/Admin/telas/VisaoNewsletter';

export const metadata: Metadata = { title: 'Newsletter' };

export default function NewsletterPage() {
  return <VisaoNewsletter />;
}
