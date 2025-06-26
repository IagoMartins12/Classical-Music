// app/work/[workId]/WorkDetailsServer.tsx - Servidor otimizado
import WorkDetailsClient from '@/app/components/WorkDetailsClient/WorkDetailsClient';
import { BackgroundJobsSystemOptimized } from '@/app/libs/background-jobs-system';
import {
  getRelatedWorks,
  getWorkById,
  hasScoresInCache,
} from '@/app/requests/work-details-score';
import { notFound } from 'next/navigation';

interface WorkDetailsServerProps {
  workId: string;
}

export default async function WorkDetailsServer({
  workId,
}: WorkDetailsServerProps) {
  try {
    console.log(`🚀 [WORK-SERVER] Carregando dados para workId: ${workId}`);
    const loadStartTime = Date.now();

    // 🚀 Carregar dados principais em paralelo para máxima performance
    const [work, relatedWorks, cacheInfo] = await Promise.all([
      getWorkById(workId),
      getRelatedWorks(workId, 6),
      hasScoresInCache(workId), // 🆕 Verificar cache de partituras
    ]);

    if (!work) {
      console.log(`❌ [WORK-SERVER] Obra não encontrada: ${workId}`);
      notFound();
    }

    const loadTime = Date.now() - loadStartTime;
    console.log(`✅ [WORK-SERVER] Dados carregados em ${loadTime}ms`);

    // 🆕 Pré-agendar scraping em background se não há cache
    if (!cacheInfo.hasCache && work.imslpPermlink) {
      console.log(
        `📋 [WORK-SERVER] Agendando scraping em background para ${work.title}`
      );

      // Agendar job de baixa prioridade para popular o cache
      BackgroundJobsSystemOptimized.enqueueScrapingJob(
        workId,
        work.imslpPermlink,
        {
          priority: 3, // Prioridade baixa para não afetar UX
          scheduledFor: new Date(Date.now() + 2000), // 2 segundos de delay
          details: {
            workTitle: work.title,
            composerName: work.composer.fullName,
            preemptive: true, // Flag para indicar que é preemptivo
          },
        }
      ).catch((error) => {
        console.error(`❌ [WORK-SERVER] Erro ao agendar scraping:`, error);
      });
    } else if (cacheInfo.hasCache) {
      console.log(
        `💾 [WORK-SERVER] Cache disponível: ${cacheInfo.cacheInfo?.totalScores} partituras`
      );
    }

    // 🆕 Log de performance para monitoramento
    if (loadTime > 1000) {
      console.warn(
        `⚠️ [WORK-SERVER] Carregamento lento detectado: ${loadTime}ms`
      );
    }

    return (
      <WorkDetailsClient
        work={work}
        relatedWorks={relatedWorks}
        // 🆕 Passar informações de cache para o cliente
        initialCacheInfo={cacheInfo}
      />
    );
  } catch (error) {
    console.error('❌ [WORK-SERVER] Erro ao carregar obra:', error);

    // 🆕 Log estruturado de erro para monitoramento
    console.error('Error Details:', {
      workId,
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : error,
      timestamp: new Date().toISOString(),
    });

    notFound();
  }
}
