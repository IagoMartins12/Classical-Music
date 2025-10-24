import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import {
  FiPlus,
  FiFileText,
  FiEye,
  FiClock,
  FiCheckCircle,
} from 'react-icons/fi';
import prisma from '@/app/libs/prismadb';
import { authOptions } from '@/app/libs/auth';
import { ArticleList } from '@/app/components/blog/admin/ArticleList';
import { AnimatedItem } from '@/app/components/animation/AnimatedComponents';
import AnimatedMusicalNotesClient from '@/app/components/AnimatedMusicalNotesClient';

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

async function getArticles(searchParams: PageProps['searchParams']) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1');
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (resolvedParams.search) {
    where.OR = [
      { title: { contains: resolvedParams.search, mode: 'insensitive' } },
      { description: { contains: resolvedParams.search, mode: 'insensitive' } },
    ];
  }

  if (resolvedParams.status) {
    where.status = resolvedParams.status;
  }

  if (resolvedParams.category) {
    where.categories = {
      some: {
        category: {
          slug: resolvedParams.category,
        },
      },
    };
  }

  if (resolvedParams.author) {
    where.authorId = resolvedParams.author;
  }

  if (resolvedParams.type) {
    where.types = {
      has: resolvedParams.type,
    };
  }

  const [articles, total] = await Promise.all([
    prisma.blogArticle.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
                icon: true,
              },
            },
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: { where: { status: 'APPROVED' } },
            likes: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.blogArticle.count({ where }),
  ]);

  return {
    articles,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getStats() {
  const [total, published, draft, review, views] = await Promise.all([
    prisma.blogArticle.count(),
    prisma.blogArticle.count({ where: { status: 'PUBLISHED' } }),
    prisma.blogArticle.count({ where: { status: 'DRAFT' } }),
    prisma.blogArticle.count({ where: { status: 'REVIEW' } }),
    prisma.blogArticle.aggregate({
      _sum: { viewCount: true },
      where: { status: 'PUBLISHED' },
    }),
  ]);

  return {
    total,
    published,
    draft,
    review,
    totalViews: views._sum.viewCount || 0,
  };
}

async function getFilters() {
  const [categories, authors] = await Promise.all([
    prisma.blogCategory.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true, icon: true },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        image: true,
      },
      orderBy: { firstName: 'asc' },
    }),
  ]);

  return { categories, authors };
}

export default async function ArticlesAdminPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user.role !== 1 && session.user.role !== 2)) {
    redirect('/blog');
  }

  const [{ articles, pagination }, stats, filters] = await Promise.all([
    getArticles(searchParams),
    getStats(),
    getFilters(),
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
