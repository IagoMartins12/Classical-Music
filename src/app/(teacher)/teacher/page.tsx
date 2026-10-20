import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TeacherDashboard } from '@/app/components/Portal/screens/TeacherDashboard';

export const metadata: Metadata = { title: 'Painel' };

/**
 * O painel do professor é do cliente (TanStack Query): a casca aparece na
 * hora e o painel chega de uma chamada só (`GET /dashboard?as=teacher`).
 * O legado buscava quatro coisas no servidor a cada visita e jogava fora
 * metade do que a API calculava.
 */
export default function TeacherPage() {
  return (
    <Suspense>
      <TeacherDashboard />
    </Suspense>
  );
}
