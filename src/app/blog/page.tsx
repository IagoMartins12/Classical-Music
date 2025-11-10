// app/blog/page.tsx (atualizado - apenas a seção de categorias)
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/app/libs/prismadb';
import { BsClock } from 'react-icons/bs';
import { BiTrendingUp } from 'react-icons/bi';
import { HeroCarousel } from '@/app/components/blog/HeroCarousel';
import { ArticleCard } from '@/app/components/blog/ArticleCard';
import SectionTitle from '../components/Utils/SectionTitle';
import { FiTrendingUp, FiGrid, FiArrowRight } from 'react-icons/fi';

// Revalidar a cada 5 minutos
export const revalidate = 300;

export const metadata = {
  title: 'Blog - Opus Atlas | Música Clássica',
  description:
    'Explore artigos, análises e histórias sobre música clássica, compositores e obras imortais',
};

async function getFeaturedArticles() {
  return await prisma.blogArticle.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() },
      isFeatured: true,
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
        include: {
          category: true,
        },
      },
      _count: {
        select: {
          comments: { where: { status: 'APPROVED' } },
          likes: true,
        },
      },
    },
    orderBy: { featuredOrder: 'asc' },
    take: 6,
  });
}

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
        include: {
          category: true,
        },
      },
      _count: {
        select: {
          comments: { where: { status: 'APPROVED' } },
          likes: true,
        },
      },
    },
    orderBy: { publishedAt: 'desc' },
    take: 9,
  });
}

async function getMostReadArticles() {
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
        include: {
          category: true,
        },
      },
    },
    orderBy: { viewCount: 'desc' },
    take: 5,
  });
}

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
    take: 8,
  });
}

export default async function BlogHomePage() {
  const [featuredArticles, latestArticles, mostReadArticles, categories] =
    await Promise.all([
      getFeaturedArticles(),
      getLatestArticles(),
      getMostReadArticles(),
      getCategories(),
    ]);

  return (
    <div>
      {/* Hero Carousel */}
      {
        <section className="section-wrap pt-8">
          <HeroCarousel articles={featuredArticles} />
        </section>
      }

      {/* <section className="section-wrap flex  gap-6 pt-8">
        <div className="w-8/12">
          <HeroCarousel articles={featuredArticles} />
        </div>

        <div className="flex flex-col w-4/12 gap-4">
          {latestArticles.map((article) => (
            <ArticleCardList key={article.id} article={article} />
          ))}
        </div>
      </section> */}

      {/* Latest Articles */}
      <section className="section-wrap">
        <SectionTitle
          title={'Últimos Artigos'}
          subtitle={'Descubra as novidades do mundo da música clássica'}
          linkText={'Ver todos'}
          linkHref="/blog/articles"
          icon={<FiTrendingUp className="w-6 h-6" />}
          accent="gold"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      {/* ===== SEÇÃO DE CATEGORIAS MODERNIZADA ===== */}
      <section className="section-wrap">
        <SectionTitle
          title={'Explore por Categoria'}
          subtitle={'Navegue pelos temas que mais te interessam'}
          linkText={'Ver todas'}
          linkHref="/blog/category"
          icon={<FiGrid className="w-6 h-6" />}
          accent="gold"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/blog/category/${category.slug}`}
              className="classical-card overflow-hidden group hover:shadow-theme-large transition-all"
            >
              {/* Image/Background */}
              <div className="relative h-40 overflow-hidden">
                {category.image ? (
                  <>
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  </>
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center text-5xl"
                    style={{
                      background: category.color
                        ? `linear-gradient(135deg, ${category.color}50, ${category.color}90)`
                        : 'var(--gradient-hero)',
                    }}
                  >
                    {category.icon || '📚'}
                  </div>
                )}

                {/* Icon Badge */}
                {/* <div className="absolute top-4 left-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg backdrop-blur-sm"
                    style={{
                      background: category.color
                        ? `${category.color}60`
                        : 'rgba(212, 175, 55, 0.6)',
                      border: `2px solid ${category.color || '#d4af37'}`,
                    }}
                  >
                    {category.icon || '📚'}
                  </div>
                </div>

                <div className="absolute top-4 right-4">
                  <div className="px-3 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-bold text-gray-900">
                    {category._count.articles}
                  </div>
                </div> */}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-theme-primary mb-2 group-hover:text-brand-primary transition-colors line-clamp-1">
                  {category.name}
                </h3>

                {category.description && (
                  <p className="text-sm text-theme-secondary mb-3 line-clamp-2">
                    {category.description}
                  </p>
                )}

                {/* CTA */}
                <div className="flex items-center text-brand-primary text-sm font-medium group-hover:translate-x-2 transition-transform">
                  <span className="mr-1">Explorar</span>
                  <FiArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Most Read - Sidebar Style */}
      <section className="section-wrap py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="classical-card p-8">
              <h3 className="text-2xl font-bold text-theme-primary mb-6 flex items-center">
                <BiTrendingUp className="w-6 h-6 mr-3 text-brand-primary" />
                Destaques da Semana
              </h3>
              <p className="text-theme-secondary mb-6">
                Os artigos mais populares escolhidos pela nossa comunidade
              </p>
              <div className="prose prose-lg max-w-none">
                <p className="text-theme-secondary leading-relaxed">
                  Explore análises profundas, biografias inspiradoras e guias
                  práticos sobre música clássica. Nossa equipe de especialistas
                  traz conteúdo original e cuidadosamente pesquisado para
                  enriquecer sua jornada musical.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar - Most Read */}
          <div className="lg:col-span-1">
            <div className="classical-card p-6 sticky top-24">
              <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center">
                <BiTrendingUp className="w-5 h-5 mr-2 text-brand-primary" />
                Mais Lidos
              </h3>
              <div className="space-y-4">
                {mostReadArticles.map((article, index) => (
                  <Link
                    key={article.id}
                    href={`/blog/${article.slug}`}
                    className="flex items-start space-x-3 group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-theme-classical flex items-center justify-center text-brand-primary font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-theme-primary group-hover:text-brand-primary transition-colors line-clamp-2 mb-1">
                        {article.title}
                      </h4>
                      <div className="flex items-center text-xs text-theme-tertiary space-x-2">
                        <BsClock className="w-3 h-3" />
                        <span>{article?.readTime ?? 0} min</span>
                        <span>•</span>
                        <span>{article.viewCount.toLocaleString()} views</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
