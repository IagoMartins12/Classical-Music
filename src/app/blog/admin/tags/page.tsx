import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { FiPlus, FiTag, FiTrendingUp } from 'react-icons/fi';
import prisma from '@/app/libs/prismadb';
import { authOptions } from '@/app/libs/auth';
import { TagList } from '@/app/components/blog/admin/TagList';
import { AnimatedItem } from '@/app/components/animation/AnimatedComponents';
import AnimatedMusicalNotesClient from '@/app/components/AnimatedMusicalNotesClient';

export const metadata: Metadata = {
  title: 'Gerenciar Tags - Blog Admin',
  description: 'Administração de tags do blog',
  robots: 'noindex, nofollow',
};

// ✅ Interface PageProps correta
interface PageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

async function getTags(search?: string) {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { slug: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  return await prisma.blogTag.findMany({
    where,
    include: {
      _count: {
        select: {
          articles: {
            where: {
              article: {
                status: 'PUBLISHED',
              },
            },
          },
        },
      },
    },
    orderBy: { articleCount: 'desc' },
  });
}

async function getStats() {
  const [totalTags, tagsWithArticles, totalArticles] = await Promise.all([
    prisma.blogTag.count(),
    prisma.blogTag.count({
      where: {
        articles: {
          some: {},
        },
      },
    }),
    prisma.blogArticle.count({ where: { status: 'PUBLISHED' } }),
  ]);

  return { totalTags, tagsWithArticles, totalArticles };
}

// ✅ Usar a interface PageProps
export default async function TagsAdminPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user.role !== 1 && session.user.role !== 2)) {
    redirect('/blog');
  }

  // ✅ Resolver a Promise do searchParams
  const resolvedParams = await searchParams;

  const [tags, stats] = await Promise.all([
    getTags(resolvedParams.q),
    getStats(),
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
                <FiTag className="w-8 h-8 text-theme-primary" />
              </div>
            </AnimatedItem>

            <AnimatedItem direction="up">
              <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
                Gerenciar Tags
              </h1>
            </AnimatedItem>

            <AnimatedItem direction="up">
              <p className="text-xl text-theme-secondary max-w-3xl mx-auto classical-subtitle mb-8">
                Organize e administre as tags do seu blog
              </p>
            </AnimatedItem>

            {/* Action Button */}
            <AnimatedItem direction="up">
              <Link
                href="/blog/admin/tags/create"
                className="btn-classical-primary inline-flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <FiPlus className="w-5 h-5" />
                <span>Nova Tag</span>
              </Link>
            </AnimatedItem>
          </div>
        </AnimatedItem>

        {/* Stats Cards */}
        <div className="pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatedItem direction="up">
              <div className="classical-card group hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm font-medium text-theme-tertiary mb-2">
                      Total de Tags
                    </p>
                    <p className="text-4xl font-bold text-theme-primary">
                      {stats.totalTags}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FiTag className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
                <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-b-xl"></div>
              </div>
            </AnimatedItem>

            <AnimatedItem direction="up">
              <div className="classical-card group hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm font-medium text-theme-tertiary mb-2">
                      Tags em Uso
                    </p>
                    <p className="text-4xl font-bold text-theme-primary">
                      {stats.tagsWithArticles}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FiTrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <div className="h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-b-xl"></div>
              </div>
            </AnimatedItem>

            <AnimatedItem direction="up">
              <div className="classical-card group hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm font-medium text-theme-tertiary mb-2">
                      Média Artigos/Tag
                    </p>
                    <p className="text-4xl font-bold text-theme-primary">
                      {(stats.totalArticles / stats.totalTags || 0).toFixed(1)}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FiTag className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-b-xl"></div>
              </div>
            </AnimatedItem>
          </div>
        </div>
      </div>

      {/* Tags List */}
      <div className="section-wrap !pt-0">
        <TagList tags={tags} />
      </div>
    </div>
  );
}
