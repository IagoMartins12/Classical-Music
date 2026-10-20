import type { Metadata } from 'next';
import ArquivosOrfaos from '@/app/components/Admin/telas/ArquivosOrfaos';

export const metadata: Metadata = { title: 'Arquivos órfãos' };

export default function OrfaosPage() {
  return <ArquivosOrfaos />;
}
