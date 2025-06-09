import { Suspense } from 'react';
import { MusicHistoryPageServer } from './MusicHistoryPageServer';
import LoadingSkeleton from './loading';

export const metadata = {
  title: 'História da Música Clássica | Jornada Musical através dos Séculos',
  description:
    'Conheça a fascinante evolução da música clássica desde o período medieval até os tempos modernos. Explore compositores famosos, características de cada época e marcos históricos.',
  keywords:
    'música clássica, história da música, compositores famosos, períodos musicais, barroco, clássico, romântico',
};

export const revalidate = 3600;

export default function MusicClassicHistoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Suspense fallback={<LoadingSkeleton />}>
        <MusicHistoryPageServer />
      </Suspense>
    </div>
  );
}
