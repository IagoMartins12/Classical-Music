// app/blog/articles/page.tsx — todos os artigos, pela API (ISR)
import { Metadata } from 'next';
import Link from 'next/link';
import { FiTrendingUp, FiClock, FiArrowRight } from 'react-icons/fi';
import { ArticleCarousel } from '@/app/components/blog/ArticleCarousel';
import SectionTitle from '@/app/components/Utils/SectionTitle';
import AnimatedMusicalNotesClient from '@/app/components/AnimatedMusicalNotesClient';
import { listArticles } from '@/app/requests/blog/articles';
import { tolerarApiForaNoBuild } from '@/app/libs/api/build-tolerance';
import {
  listCategories,
  listCategoryArticles,
} from '@/app/requests/blog/taxonomy';

export const metadata: Metadata = {
  title: 'Todos os Artigos - Blog Opus Atlas',
  description: 'Explore todos os artigos publicados no blog',
};

export const revalidate = 300;

/** Cada categoria ativa com os 12 artigos mais recentes. */
async function getCategoriesWithArticles() {
  const categories = await listCategories();

  return Promise.all(
    categories.map(async (category) => ({
      ...category,
      articles:
        category._count.articles > 0
          ? (await listCategoryArticles(category.slug, 1, 12)).articles
          : [],
    }))
  );
}

/** As três listas da página, em paralelo. */
function carregarArtigos() {
  return Promise.all([
    listArticles({ limit: 12, sortBy: 'newest' }),
    listArticles({ limit: 12, sortBy: 'popular' }),
    getCategoriesWithArticles(),
  ]);
}

export default async function ArticlesPage() {
  const [latest, trending, categoriesWithArticles] =
    await tolerarApiForaNoBuild(
      carregarArtigos,
      [
        { articles: [], pagination: { total: 0 } },
        { articles: [], pagination: { total: 0 } },
        [],
      ] as unknown as Awaited<ReturnType<typeof carregarArtigos>>,
      'blog: artigos'
    );

  // "Ver todos" aparece quando há mais do que cabe no carrossel (a API não
  // conta à parte os artigos com visita, como o legado fazia em "Em alta").
  const publishedCount = latest.pagination.total;

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
          {publishedCount > 12 && (
            <Link
              href="/blog/search?ordenar=recente"
              className="flex items-center gap-2 text-brand-primary hover:text-brand-secondary transition-colors font-medium"
            >
              <span>Ver todos</span>
              <FiArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
        <ArticleCarousel articles={latest.articles} />
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
          {publishedCount > 12 && (
            <Link
              href="/blog/search?ordenar=popular"
              className="flex items-center gap-2 text-brand-primary hover:text-brand-secondary transition-colors font-medium"
            >
              <span>Ver todos</span>
              <FiArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
        <ArticleCarousel articles={trending.articles} />
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
