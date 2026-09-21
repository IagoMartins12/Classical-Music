// app/blog/admin/moderation/page.tsx

import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import {
  BiComment,
  BiCheckCircle,
  BiXCircle,
  BiFlag,
  BiListUl,
} from 'react-icons/bi';
import { getServerAccessToken } from '@/app/libs/api/server-session';
import { loadModeration } from '@/app/requests/blog/admin';
import { ModerationList } from '@/app/components/blog/admin/ModerationList';
import { AnimatedItem } from '@/app/components/animation/AnimatedComponents';
import AnimatedMusicalNotesClient from '@/app/components/AnimatedMusicalNotesClient';
import { getServerSession } from '@/app/libs/api/server-session';

export const metadata: Metadata = {
  title: 'Moderação de Comentários - Blog Admin',
  description: 'Moderar comentários do blog',
  robots: 'noindex, nofollow',
};

// ✅ Interface PageProps correta
interface PageProps {
  searchParams: Promise<{
    filter?: string;
  }>;
}

// ✅ Usar a interface PageProps correta
export default async function ModerationPage({ searchParams }: PageProps) {
  const session = await getServerSession();

  if (!session?.user || (session.user.role !== 1 && session.user.role !== 2)) {
    redirect('/blog');
  }

  // ✅ Resolver a Promise do searchParams
  const resolvedParams = await searchParams;
  const filter = resolvedParams.filter || 'all';

  const { comments, stats } = await loadModeration(
    filter,
    await getServerAccessToken()
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative section-wrap overflow-hidden">
        <AnimatedItem
          direction="up"
          springType="bouncy"
          className="relative text-center py-16"
        >
          <AnimatedMusicalNotesClient />

          <div className="relative z-10">
            <AnimatedItem
              direction="scale"
              className="flex items-center justify-center mb-6"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center shadow-theme-glow">
                <BiComment className="w-8 h-8 text-theme-primary" />
              </div>
            </AnimatedItem>

            <AnimatedItem direction="up">
              <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
                Moderação de Comentários
              </h1>
            </AnimatedItem>

            <AnimatedItem direction="up">
              <p className="text-xl text-theme-secondary max-w-3xl mx-auto classical-subtitle mb-8">
                Revise e modere os comentários do blog
              </p>
            </AnimatedItem>
          </div>
        </AnimatedItem>

        {/* Stats Cards */}
        <div className="pb-8">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <AnimatedItem direction="up">
              <div className="classical-card group hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xs font-medium text-theme-tertiary mb-2">
                      Total
                    </p>
                    <p className="text-2xl font-bold text-theme-primary">
                      {stats.total}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BiListUl className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </div>
            </AnimatedItem>

            <AnimatedItem direction="up">
              <div className="classical-card group hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xs font-medium text-theme-tertiary mb-2">
                      Pendentes
                    </p>
                    <p className="text-2xl font-bold text-theme-primary">
                      {stats.pending}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BiComment className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </div>
            </AnimatedItem>

            <AnimatedItem direction="up">
              <div className="classical-card group hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xs font-medium text-theme-tertiary mb-2">
                      Denunciados
                    </p>
                    <p className="text-2xl font-bold text-theme-primary">
                      {stats.flagged}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BiFlag className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
              </div>
            </AnimatedItem>

            <AnimatedItem direction="up">
              <div className="classical-card group hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xs font-medium text-theme-tertiary mb-2">
                      Respostas
                    </p>
                    <p className="text-2xl font-bold text-theme-primary">
                      {stats.replies}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BiComment className="w-6 h-6 text-indigo-500" />
                  </div>
                </div>
              </div>
            </AnimatedItem>

            <AnimatedItem direction="up">
              <div className="classical-card group hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xs font-medium text-theme-tertiary mb-2">
                      Aprovados
                    </p>
                    <p className="text-2xl font-bold text-theme-primary">
                      {stats.approved}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BiCheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </div>
            </AnimatedItem>

            <AnimatedItem direction="up">
              <div className="classical-card group hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xs font-medium text-theme-tertiary mb-2">
                      Rejeitados/Spam
                    </p>
                    <p className="text-2xl font-bold text-theme-primary">
                      {stats.rejected + stats.spam}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BiXCircle className="w-6 h-6 text-red-500" />
                  </div>
                </div>
              </div>
            </AnimatedItem>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="section-wrap !pt-0">
        <ModerationList comments={comments} currentFilter={filter} />
      </div>
    </div>
  );
}
