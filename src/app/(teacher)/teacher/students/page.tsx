import type { Metadata } from 'next';
import { Suspense } from 'react';
import { StudentsScreen } from '@/app/components/Portal/screens/StudentsScreen';

export const metadata: Metadata = { title: 'Alunos' };

export default function StudentsPage() {
  return (
    <Suspense>
      <StudentsScreen />
    </Suspense>
  );
}
