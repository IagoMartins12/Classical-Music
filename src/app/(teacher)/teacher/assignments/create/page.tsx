import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AssignmentsScreen } from '@/app/components/Portal/screens/AssignmentsScreen';

export const metadata: Metadata = { title: 'Nova tarefa' };

/** A criação de tarefa é a folha, por cima da lista (aceita `?student=` e `?lesson=`). */
export default function NewAssignmentPage() {
  return (
    <Suspense>
      <AssignmentsScreen role="teacher" create />
    </Suspense>
  );
}
