// app/work/[workId]/WorkDetailsServer.tsx - Versão Atualizada com Sistema Incremental
import { notFound } from 'next/navigation';
import { getRelatedWorks, getWorkById } from '@/app/requests/work-page-details';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import WorkDetailsClient from '@/app/components/WorkDetailsClient/WorkDetailsClient';

interface WorkDetailsServerProps {
  workId: string;
}

export default async function WorkDetailsServer({
  workId,
}: WorkDetailsServerProps) {
  const session = await getServerSession(authOptions);

  try {
    console.log(`🎼 [SERVER] Carregando dados da obra ${workId}`);
    const startTime = Date.now();

    // 🚀 Carregar dados da obra e obras relacionadas em paralelo para máxima performance
    const [work, relatedWorks] = await Promise.all([
      getWorkById(workId),
      getRelatedWorks(workId, 6),
    ]);

    if (!work) {
      console.log(`❌ [SERVER] Obra ${workId} não encontrada`);
      notFound();
    }

    const loadTime = Date.now() - startTime;
    console.log(`✅ [SERVER] Dados da obra carregados em ${loadTime}ms`);

    const isAdmin = session?.user.role === 2;

    return (
      <WorkDetailsClient
        work={work}
        isAdmin={isAdmin}
        relatedWorks={relatedWorks}
        learningData={{ wantToLearn: [], learned: [] }}
      />
    );
  } catch (error) {
    console.error(`❌ [SERVER] Erro ao carregar obra ${workId}:`, error);

    // Log detalhado do erro
    if (error instanceof Error) {
      console.error(`- Mensagem: ${error.message}`);
      console.error(`- Stack: ${error.stack}`);
    }

    notFound();
  }
}
