import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ReportsScreen } from '@/app/components/Portal/screens/ReportsScreen';

export const metadata: Metadata = { title: 'Relatórios' };

export default function StudentReportsPage() {
  return (
    <Suspense>
      <ReportsScreen role="student" />
    </Suspense>
  );
}
