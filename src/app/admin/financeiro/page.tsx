import type { Metadata } from 'next';
import Financeiro from '@/app/components/Admin/telas/Financeiro';

export const metadata: Metadata = { title: 'Financeiro' };

export default function FinanceiroPage() {
  return <Financeiro />;
}
