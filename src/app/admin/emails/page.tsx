import type { Metadata } from 'next';
import EmailsDaPlataforma from '@/app/components/Admin/telas/EmailsDaPlataforma';

export const metadata: Metadata = { title: 'E-mails da plataforma' };

export default function EmailsPage() {
  return <EmailsDaPlataforma />;
}
