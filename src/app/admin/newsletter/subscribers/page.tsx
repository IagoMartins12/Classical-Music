import type { Metadata } from 'next';
import AssinantesNewsletter from '@/app/components/Admin/telas/AssinantesNewsletter';

export const metadata: Metadata = { title: 'Assinantes da newsletter' };

export default function AssinantesPage() {
  return <AssinantesNewsletter />;
}
