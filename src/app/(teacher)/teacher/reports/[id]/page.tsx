import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ReportsScreen } from '@/app/components/Portal/screens/ReportsScreen';

export const metadata: Metadata = { title: 'Relatório' };

export default async function TeacherReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense>
      <ReportsScreen role="teacher" initialId={id} />
    </Suspense>
  );
}
