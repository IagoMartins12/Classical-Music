import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ReportsScreen } from '@/app/components/Portal/screens/ReportsScreen';

export const metadata: Metadata = { title: 'Relatório' };

export default async function StudentReportPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  return (
    <Suspense>
      <ReportsScreen role="student" initialId={reportId} />
    </Suspense>
  );
}
