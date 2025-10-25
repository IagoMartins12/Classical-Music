// app/blog/articles/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/app/libs/prismadb';
import { FiTrendingUp, FiClock, FiArrowRight } from 'react-icons/fi';
import { ArticleCarousel } from '@/app/components/blog/ArticleCarousel';
import SectionTitle from '@/app/components/Utils/SectionTitle';
import AnimatedMusicalNotesClient from '@/app/components/AnimatedMusicalNotesClient';

export const metadata: Metadata = {
  title: 'Todos os Artigos - Blog Opus Atlas',
  description: 'Explore todos os artigos publicados no blog',
};

export const revalidate = 300;
export const dynamic = 'force-dynamic';

async function getLatestArticles() {
  return await prisma.blogArticle.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() },
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
    take: 12,
  });
}

async function getTrendingArticles() {
  return await prisma.blogArticle.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() },
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
    orderBy: { viewCount: 'desc' },
    take: 12,
  });
}

async function getCategoriesWithArticles() {
  const categories = await prisma.blogCategory.findMany({
    where: { isActive: true },
    include: {
      articles: {
        where: {
          article: {
            status: 'PUBLISHED',
            publishedAt: { lte: new Date() },
          },
        },
        take: 12,
        orderBy: {
          article: {
            publishedAt: 'desc',
          },
        },
        include: {
          article: {
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
          },
        },
      },
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

  return categories.map((cat) => ({
    ...cat,

    articles: (cat.articles ?? [])
      .map((a) =>
        a && (a as any).article
          ? { ...(a as any).article, readTime: a.article?.readTime ?? 0 }
          : null
      )
      .filter(Boolean),

    // articles: cat.articles.map((a) => ({
    //   ...a.article,
    //   readTime: a.article.readTime ?? 0,
    // })),
  }));
}

async function getArticleCounts() {
  const [latestCount, trendingCount] = await Promise.all([
    prisma.blogArticle.count({
      where: {
        status: 'PUBLISHED',
        publishedAt: { lte: new Date() },
      },
    }),
    prisma.blogArticle.count({
      where: {
        status: 'PUBLISHED',
        publishedAt: { lte: new Date() },
        viewCount: { gt: 0 },
      },
    }),
  ]);

  return { latestCount, trendingCount };
}

export default async function ArticlesPage() {
  const [latestArticles, trendingArticles, categoriesWithArticles, counts] =
    await Promise.all([
      getLatestArticles(),
      getTrendingArticles(),
      getCategoriesWithArticles(),
      getArticleCounts(),
    ]);

  const latestWithReadTime = latestArticles.map((a) => ({
    ...a,
    readTime: a?.readTime ?? 0,
  }));

  const trendingWithReadTime = trendingArticles.map((a) => ({
    ...a,
    readTime: a?.readTime ?? 0,
  }));

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="section-wrap relative !py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
          Todos os Artigos
        </h1>
        <p className="text-xl text-theme-secondary max-w-3xl mx-auto">
          Explore nossa coleção completa de artigos sobre música clássica
        </p>

        <AnimatedMusicalNotesClient />
      </div>

      {/* Últimos Artigos */}
      <section className="section-wrap">
        <div className="flex items-center justify-between mb-6">
          <SectionTitle
            title="Últimos Artigos"
            subtitle="Os artigos mais recentes do blog"
            icon={<FiClock className="w-6 h-6" />}
            accent="gold"
          />
          {counts.latestCount > 12 && (
            <Link
              href="/blog/search?ordenar=recente"
              className="flex items-center gap-2 text-brand-primary hover:text-brand-secondary transition-colors font-medium"
            >
              <span>Ver todos</span>
              <FiArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
        <ArticleCarousel articles={latestWithReadTime} />
      </section>

      {/* Artigos em Alta */}
      <section className="section-wrap">
        <div className="flex items-center justify-between mb-6">
          <SectionTitle
            title="Artigos em Alta"
            subtitle="Os mais lidos pela comunidade"
            icon={<FiTrendingUp className="w-6 h-6" />}
            accent="gold"
          />
          {counts.trendingCount > 12 && (
            <Link
              href="/blog/search?ordenar=popular"
              className="flex items-center gap-2 text-brand-primary hover:text-brand-secondary transition-colors font-medium"
            >
              <span>Ver todos</span>
              <FiArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
        <ArticleCarousel articles={trendingWithReadTime} />
      </section>

      {/* Por Categoria */}
      {categoriesWithArticles.map((category) => (
        <section key={category.id} className="section-wrap">
          <div className="flex items-center justify-between mb-6">
            <SectionTitle
              title={category.name}
              subtitle={
                category.description || `Artigos sobre ${category.name}`
              }
              icon={<span className="text-2xl">{category.icon || '📚'}</span>}
              accent="gold"
            />
            {category._count.articles > 12 && (
              <Link
                href={`/blog/category/${category.slug}`}
                className="flex items-center gap-2 text-brand-primary hover:text-brand-secondary transition-colors font-medium"
              >
                <span>Ver todos</span>
                <FiArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
          {category.articles.length > 0 ? (
            <ArticleCarousel articles={category.articles} />
          ) : (
            <div className=" p-8 text-center">
              <p className="text-theme-secondary">
                Em breve novos artigos sobre {category.name}
              </p>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
