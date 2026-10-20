import type { Metadata } from 'next';
import Modelos from '@/app/components/Admin/telas/Modelos';

export const metadata: Metadata = { title: 'Modelos de e-mail' };

export default function ModelosPage() {
  return <Modelos />;
}
