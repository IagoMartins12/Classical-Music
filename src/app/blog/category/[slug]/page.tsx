import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import prisma from '@/app/libs/prismadb';
import { FiGrid } from 'react-icons/fi';
import { CategoryArticles } from '@/app/components/blog/CategoryArticles';

export const revalidate = 600;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; view?: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.blogCategory.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!category) return { title: 'Categoria não encontrada' };

  return {
    title: `${category.name} - Blog Opus Atlas`,
    description: category.description || `Artigos sobre ${category.name}`,
  };
}

async function getCategory(slug: string) {
  return await prisma.blogCategory.findUnique({
    where: { slug, isActive: true },
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
  });
}

async function getCategoryArticles(slug: string, page: number) {
  const limit = 12;
  const skip = (page - 1) * limit;

  const [articles, total] = await Promise.all([
    prisma.blogArticle.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { lte: new Date() },
        categories: {
          some: {
            category: { slug },
          },
        },
      },
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
          include: { category: true },
        },
        _count: {
          select: {
            comments: { where: { status: 'APPROVED' } },
            likes: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.blogArticle.count({
      where: {
        status: 'PUBLISHED',
        publishedAt: { lte: new Date() },
        categories: {
          some: {
            category: { slug },
          },
        },
      },
    }),
  ]);

  return {
    articles: articles.map((a) => ({ ...a, readTime: a.readTime ?? 0 })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { page = '1' } = await searchParams;

  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const { articles, pagination } = await getCategoryArticles(
    slug,
    parseInt(page)
  );

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="relative section-wrap lg:min-h-[25rem] py-16 overflow-hidden flex items-center justify-center">
        {/* Background Image */}
        {category.image && (
          <div className="absolute inset-0 z-0">
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-theme-primary/80 to-theme-primary" />
          </div>
        )}

        {/* Content */}
        <div className=" z-10 flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
          {/* Icon */}
          {/* <div
            className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center text-5xl shadow-theme-glow"
            style={{
              background: category.color
                ? `linear-gradient(135deg, ${category.color}60, ${category.color})`
                : 'var(--gradient-brand)',
            }}
          >
            {category.icon || '📚'}
          </div> */}

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-theme-primary classical-title mb-4">
            {category.name}
          </h1>

          {/* Description */}
          {category.description && (
            <p className="text-xl text-theme-secondary max-w-2xl mx-auto mb-6">
              {category.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center justify-center space-x-6 text-theme-tertiary">
            <div className="flex items-center space-x-2">
              <FiGrid className="w-5 h-5" />
              <span>
                {category._count.articles}{' '}
                {category._count.articles === 1 ? 'artigo' : 'artigos'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="section-wrap pb-16">
        <CategoryArticles
          articles={articles}
          pagination={pagination}
          categorySlug={slug}
        />
      </div>
    </div>
  );
}
