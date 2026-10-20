import type { Metadata } from 'next';
import { Suspense } from 'react';
import { NewLessonScreen } from '@/app/components/Portal/screens/NewLessonScreen';

export const metadata: Metadata = { title: 'Nova aula' };

/** Aceita `?student=`, `?start=` e `?duration=` (vindos da marcação rápida). */
export default function NewLessonPage() {
  return (
    <Suspense>
      <NewLessonScreen />
    </Suspense>
  );
}
