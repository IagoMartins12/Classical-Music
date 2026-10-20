import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AssignmentsScreen } from '@/app/components/Portal/screens/AssignmentsScreen';

export const metadata: Metadata = { title: 'Tarefas' };

export default function AssignmentsPage() {
  return (
    <Suspense>
      <AssignmentsScreen role="teacher" />
    </Suspense>
  );
}
