// app/components/RecentAdditions/RecentAdditions.tsx
'use client';

import { FiPlus } from 'react-icons/fi';

import SectionTitle from '../Utils/SectionTitle';
import RecentComposerCard from './RecentComposerCard';
import RecentWorkCard, { RecentWorkProps } from './RecentWorkCard';

export interface RecentComposerProps {
  name: string;
  id: string;
  createdAt: Date;
  fullName: string;
  portraitUrl: string | null;
  epochName: string | null;
}

interface RecentAdditionsProps {
  composers: RecentComposerProps[];
  works: RecentWorkProps[];
}

const RecentAdditions: React.FC<RecentAdditionsProps> = ({
  composers,
  works,
}) => {
  return (
    <section className="section-wrap relative !mb-8">
      <SectionTitle
        title="Últimas Adições"
        subtitle="Novos compositores recém-adicionados à nossa enciclopédia"
        linkText="Ver todas as adições"
        linkHref="/composers?sort=recent"
        icon={<FiPlus className="w-6 h-6" />}
        accent="green"
      />

      {/* Grid responsivo */}

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-xl font-bold text-theme-primary classical-title">
            Ultimos compositores adicionados
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-orange-500/20 to-transparent"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {composers.map((composer) => (
            <RecentComposerCard key={composer.id} composer={composer} />
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-xl font-bold text-theme-primary classical-title">
            Ultimas obras adicionadas.
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-purple-500/20 to-transparent"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {works.map((work) => (
            <RecentWorkCard key={work.id} work={work} />
          ))}
        </div>
      </div>

      {/* Fresh content indicator */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-medium backdrop-blur-sm">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Conteúdo sempre atualizado</span>
          <FiPlus className="w-4 h-4" />
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 right-16 w-32 h-32 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-16 left-16 w-24 h-24 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
};

export default RecentAdditions;
