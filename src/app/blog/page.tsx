// app/blog/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { BsClock } from 'react-icons/bs';
import { BiTrendingUp } from 'react-icons/bi';
import { HeroCarousel } from '@/app/components/blog/HeroCarousel';
import { ArticleCard } from '@/app/components/blog/ArticleCard';
import SectionTitle from '../components/Utils/SectionTitle';
import { FiTrendingUp, FiGrid, FiArrowRight } from 'react-icons/fi';
import {
  getCachedFeaturedArticles,
  getCachedLatestArticles,
  getCachedMostReadArticles,
  getCachedCategories,
} from '@/app/requests/blog/cached-blog-function';

// ✅ Revalidação de 5 minutos (fallback para ISR do Next.js)
export const revalidate = 300;

export const metadata = {
  title: 'Blog - Opus Atlas | Música Clássica',
  description:
    'Explore artigos, análises e histórias sobre música clássica, compositores e obras imortais',
};

export default async function BlogHomePage() {
  console.log('📰 Loading Blog Home Page...');

  // ✅ Buscar dados em paralelo com cache condicional (dev vs prod)
  const [
    featuredArticles,
    latestArticles,
    mostReadArticles,
    categories,
    // trendingTopics,
  ] = await Promise.all([
    getCachedFeaturedArticles(),
    getCachedLatestArticles(),
    getCachedMostReadArticles(),
    getCachedCategories(),
    // getCachedTrendingTopics(),
  ]);

  console.log('✅ Blog data loaded successfully');

  return (
    <div>
      {/* Hero Carousel */}
      <section className="section-wrap pt-8">
        <HeroCarousel articles={featuredArticles} />
      </section>

      {/* Quote Inspiradora */}
      {/* <section className="section-wrap">
        <ComposerQuote />
      </section> */}

      {/* Latest Articles */}
      <section className="section-wrap">
        <SectionTitle
          title="Últimos Artigos"
          subtitle="Descubra as novidades do mundo da música clássica"
          linkText="Ver todos"
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

      {/* Tópicos em Alta */}
      {/* <section className="section-wrap">
        <TrendingTopics topics={trendingTopics} />
      </section> */}

      {/* Seção de Categorias */}
      <section className="section-wrap">
        <SectionTitle
          title="Explore por Categoria"
          subtitle="Navegue pelos temas que mais te interessam"
          linkText="Ver todas"
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
