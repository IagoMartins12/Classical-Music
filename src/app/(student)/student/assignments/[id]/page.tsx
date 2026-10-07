import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AssignmentsScreen } from '@/app/components/Portal/screens/AssignmentsScreen';

export const metadata: Metadata = { title: 'Tarefa' };

/** O link direto de uma tarefa abre a lista com a tarefa por cima. */
export default async function AssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense>
      <AssignmentsScreen role="student" initialId={id} />
    </Suspense>
  );
}
