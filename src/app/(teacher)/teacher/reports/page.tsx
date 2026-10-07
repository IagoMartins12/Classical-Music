import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ReportsScreen } from '@/app/components/Portal/screens/ReportsScreen';

export const metadata: Metadata = { title: 'Relatórios' };

/** Aceita `?student=` e `?new=1` (vindos do painel e da página do aluno). */
export default function TeacherReportsPage() {
  return (
    <Suspense>
      <ReportsScreen role="teacher" />
    </Suspense>
  );
}
