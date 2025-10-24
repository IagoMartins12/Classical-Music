import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import prisma from '@/app/libs/prismadb';
import { FiGrid, FiArrowRight } from 'react-icons/fi';
import AnimatedMusicalNotesClient from '@/app/components/AnimatedMusicalNotesClient';

export const metadata: Metadata = {
  title: 'Categorias - Blog Opus Atlas',
  description: 'Explore artigos por categoria',
};

export const revalidate = 600;

async function getCategories() {
  return await prisma.blogCategory.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          articles: {
            where: {
              article: {
                status: 'PUBLISHED',
                publishedAt: { lte: new Date() },
              },
            },
          },
        },
      },
    },
    orderBy: { order: 'asc' },
  });
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="section-wrap relative !py-16 text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center shadow-theme-glow">
            <FiGrid className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
          Explore por Categoria
        </h1>
        <p className="text-xl text-theme-secondary max-w-3xl mx-auto">
          Navegue por {categories.length} categorias e descubra artigos sobre
          seus temas favoritos
        </p>
        <AnimatedMusicalNotesClient />
      </div>

      {/* Categories Grid */}
      <div className="section-wrap pb-16">
        {categories.length === 0 ? (
          <div className="classical-card p-12 text-center">
            <p className="text-theme-secondary text-lg">
              Nenhuma categoria disponível no momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/blog/category/${category.slug}`}
                className="classical-card overflow-hidden group hover:shadow-theme-large transition-all"
              >
                {/* Image Header */}
                <div className="relative h-48 overflow-hidden">
                  {category.image ? (
                    <>
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </>
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center text-6xl"
                      style={{
                        background: category.color
                          ? `linear-gradient(135deg, ${category.color}40, ${category.color}80)`
                          : 'var(--gradient-hero)',
                      }}
                    >
                      {category.icon || '📚'}
                    </div>
                  )}

                  {/* Icon Overlay */}
                  {/* <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg backdrop-blur-sm"
                      style={{
                        background: category.color
                          ? `${category.color}40`
                          : 'rgba(212, 175, 55, 0.4)',
                        border: `2px solid ${category.color || '#d4af37'}`,
                      }}
                    >
                      {category.icon || '📚'}
                    </div>

                    <div className="px-3 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-bold text-gray-900">
                      {category._count.articles}{' '}
                      {category._count.articles === 1 ? 'artigo' : 'artigos'}
                    </div>
                  </div> */}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-theme-primary mb-2 group-hover:text-brand-primary transition-colors">
                    {category.name}
                  </h3>

                  {category.description && (
                    <p className="text-theme-secondary text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  {/* CTA */}
                  <div className="flex items-center text-brand-primary font-medium group-hover:translate-x-2 transition-transform">
                    <span className="mr-2">Explorar</span>
                    <FiArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
