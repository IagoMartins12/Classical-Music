// app/work/[workId]/WorkDetailsServer.tsx - Versão Atualizada com Sistema Incremental
import { notFound } from 'next/navigation';
import WorkDetailsClient from '../../components/WorkDetailsClient/WorkDetailsClient';
import { getRelatedWorks, getWorkById } from '@/app/requests/work-page-details';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';

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
    console.log(`📊 [SERVER] Obra: ${work.title} (${work.composer.fullName})`);
    console.log(`🔗 [SERVER] IMSLP: ${work.imslpPermlink}`);
    console.log(`📝 [SERVER] Obras relacionadas: ${relatedWorks.length}`);

    // 🆕 O sistema incremental será gerenciado pelo cliente
    // Não fazemos pré-carregamento de partituras no servidor para manter SSR rápido
    console.log(
      `🚀 [SERVER] Sistema incremental ativo - partituras serão carregadas no cliente`
    );
    const isAdmin = session?.user.role === 2;

    return (
      <WorkDetailsClient
        work={work}
        relatedWorks={relatedWorks}
        // Dados de aprendizado podem ser pré-carregados se necessário

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
