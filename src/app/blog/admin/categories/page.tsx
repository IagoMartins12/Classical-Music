import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { FiPlus, FiGrid, FiTag, FiLayers } from 'react-icons/fi';
import prisma from '@/app/libs/prismadb';
import { authOptions } from '@/app/libs/auth';
import { CategoryList } from '@/app/components/blog/admin/CategoryList';
import { AnimatedItem } from '@/app/components/animation/AnimatedComponents';
import AnimatedMusicalNotesClient from '@/app/components/AnimatedMusicalNotesClient';

export const metadata: Metadata = {
  title: 'Gerenciar Categorias - Blog Admin',
  description: 'Administração de categorias do blog',
  robots: 'noindex, nofollow',
};

async function getCategories() {
  return await prisma.blogCategory.findMany({
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
    orderBy: { order: 'asc' },
  });
}

async function getStats() {
  const [totalCategories, activeCategories, totalArticles] = await Promise.all([
    prisma.blogCategory.count(),
    prisma.blogCategory.count({ where: { isActive: true } }),
    prisma.blogArticle.count({ where: { status: 'PUBLISHED' } }),
  ]);

  return { totalCategories, activeCategories, totalArticles };
}

export default async function CategoriesAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user.role !== 1 && session.user.role !== 2)) {
    redirect('/blog');
  }

  const [categories, stats] = await Promise.all([getCategories(), getStats()]);

  return (
    <div className="min-h-screen ">
      {/* Enhanced Header */}
      <div className="relative section-wrap overflow-hidden">
        <AnimatedItem
          direction="up"
          springType="bouncy"
          className="relative text-center py-16"
        >
          {/* Animated Background Elements */}
          <AnimatedMusicalNotesClient />

          <div className="relative z-10 ">
            <AnimatedItem
              direction="scale"
              className="flex items-center justify-center mb-6"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center shadow-theme-glow">
                <FiLayers className="w-8 h-8 text-theme-primary" />
              </div>
            </AnimatedItem>

            <AnimatedItem direction="up">
              <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
                Gerenciar Categorias
              </h1>
            </AnimatedItem>

            <AnimatedItem direction="up">
              <p className="text-xl text-theme-secondary max-w-3xl mx-auto classical-subtitle mb-8">
                Organize e administre as categorias do seu blog
              </p>
            </AnimatedItem>

            {/* Action Button */}
            <AnimatedItem direction="up">
              <Link
                href="/blog/admin/categories/create"
                className="btn-classical-primary inline-flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <FiPlus className="w-5 h-5" />
                <span>Nova Categoria</span>
              </Link>
            </AnimatedItem>
          </div>
        </AnimatedItem>

        {/* Stats Cards */}
        <div className=" pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Categories */}
            <AnimatedItem direction="up">
              <div className="classical-card group hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm font-medium text-theme-tertiary mb-2">
                      Total de Categorias
                    </p>
                    <p className="text-4xl font-bold text-theme-primary">
                      {stats.totalCategories}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FiGrid className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-b-xl"></div>
              </div>
            </AnimatedItem>

            {/* Active Categories */}
            <AnimatedItem direction="up">
              <div className="classical-card group hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm font-medium text-theme-tertiary mb-2">
                      Categorias Ativas
                    </p>
                    <p className="text-4xl font-bold text-theme-primary">
                      {stats.activeCategories}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FiTag className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <div className="h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-b-xl"></div>
              </div>
            </AnimatedItem>

            {/* Total Articles */}
            <AnimatedItem direction="up">
              <div className="classical-card group hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm font-medium text-theme-tertiary mb-2">
                      Artigos Publicados
                    </p>
                    <p className="text-4xl font-bold text-theme-primary">
                      {stats.totalArticles}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FiGrid className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
                <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-b-xl"></div>
              </div>
            </AnimatedItem>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="section-wrap py-8">
        <CategoryList categories={categories} />
      </div>
    </div>
  );
}
