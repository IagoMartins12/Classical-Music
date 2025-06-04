// app/work/[workId]/WorkDetailsServer.tsx
import { notFound } from 'next/navigation';
import WorkDetailsClient from '../../components/WorkDetailsClient/WorkDetailsClient';
import { getRelatedWorks, getWorkById } from '@/app/requests/work-page-details';

interface WorkDetailsServerProps {
  workId: string;
}

export default async function WorkDetailsServer({
  workId,
}: WorkDetailsServerProps) {
  try {
    // Carregar dados da obra e obras relacionadas em paralelo para máxima performance
    const [work, relatedWorks] = await Promise.all([
      getWorkById(workId),
      getRelatedWorks(workId, 6),
    ]);

    if (!work) {
      notFound();
    }

    return <WorkDetailsClient work={work} relatedWorks={relatedWorks} />;
  } catch (error) {
    console.error('Erro ao carregar obra:', error);
    notFound();
  }
}
