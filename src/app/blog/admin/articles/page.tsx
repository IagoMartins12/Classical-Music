import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  FiPlus,
  FiFileText,
  FiEye,
  FiClock,
  FiCheckCircle,
} from 'react-icons/fi';
import { getServerAccessToken } from '@/app/libs/api/server-session';
import {
  loadAdminArticleOverview,
  loadAdminArticles,
} from '@/app/requests/blog/admin';
import { ArticleList } from '@/app/components/blog/admin/ArticleList';
import { AnimatedItem } from '@/app/components/animation/AnimatedComponents';
import AnimatedMusicalNotesClient from '@/app/components/AnimatedMusicalNotesClient';
import { getServerSession } from '@/app/libs/api/server-session';

export const metadata: Metadata = {
  title: 'Gerenciar Artigos - Blog Admin',
  description: 'Administração de artigos do blog',
  robots: 'noindex, nofollow',
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    category?: string;
    author?: string;
    type?: string;
  }>;
}

export default async function ArticlesAdminPage({ searchParams }: PageProps) {
  const session = await getServerSession();

  if (!session?.user || (session.user.role !== 1 && session.user.role !== 2)) {
    redirect('/blog');
  }

  const token = await getServerAccessToken();
  const [{ articles, pagination }, { stats, filters }] = await Promise.all([
    loadAdminArticles(await searchParams, token),
    loadAdminArticleOverview(token),
  ]);

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
                <FiFileText className="w-8 h-8 text-theme-primary" />
              </div>
            </AnimatedItem>

            <AnimatedItem direction="up">
              <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
                Gerenciar Artigos
              </h1>
            </AnimatedItem>

            <AnimatedItem direction="up">
              <p className="text-xl text-theme-secondary max-w-3xl mx-auto classical-subtitle mb-8">
                Todos os artigos do blog em um só lugar
              </p>
            </AnimatedItem>

            {/* Action Button */}
            <AnimatedItem direction="up">
              <Link
                href="/blog/admin/articles/create"
                className="btn-classical-primary inline-flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <FiPlus className="w-5 h-5" />
                <span>Novo Artigo</span>
              </Link>
            </AnimatedItem>
          </div>
        </AnimatedItem>

        {/* Stats Cards */}
        <div className="pb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FiFileText className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </div>
            </AnimatedItem>

            <AnimatedItem direction="up">
              <div className="classical-card group hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xs font-medium text-theme-tertiary mb-2">
                      Publicados
                    </p>
                    <p className="text-2xl font-bold text-theme-primary">
                      {stats.published}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FiCheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </div>
            </AnimatedItem>

            <AnimatedItem direction="up">
              <div className="classical-card group hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xs font-medium text-theme-tertiary mb-2">
                      Rascunhos
                    </p>
                    <p className="text-2xl font-bold text-theme-primary">
                      {stats.draft}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FiClock className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
              </div>
            </AnimatedItem>

            <AnimatedItem direction="up">
              <div className="classical-card group hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xs font-medium text-theme-tertiary mb-2">
                      Visualizações
                    </p>
                    <p className="text-2xl font-bold text-theme-primary">
                      {(stats.totalViews / 1000).toFixed(1)}k
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FiEye className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
              </div>
            </AnimatedItem>
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="section-wrap !pt-0">
        <ArticleList
          articles={articles}
          pagination={pagination}
          filters={filters}
          currentParams={searchParams}
        />
      </div>
    </div>
  );
}
