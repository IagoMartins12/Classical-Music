// app/blog/page.tsx
import Link from 'next/link';
import Image from '@/app/components/SmartImage';
import {
  PiArrowRight,
  PiClock,
  PiSquaresFour,
  PiTrendUp,
} from 'react-icons/pi';
import { HeroCarousel } from '@/app/components/blog/HeroCarousel';
import { ArticleCard } from '@/app/components/blog/ArticleCard';
import SectionTitle from '../components/Utils/SectionTitle';
import { tolerarApiForaNoBuild } from '@/app/libs/api/build-tolerance';
import {
  getCachedFeaturedArticles,
  getCachedLatestArticles,
  getCachedMostReadArticles,
  getCachedCategories,
} from '@/app/requests/blog/cached-blog-function';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

// ✅ Revalidação de 5 minutos (fallback para ISR do Next.js)
export const revalidate = 300;

export const metadata = {
  title: 'Blog - Opus Atlas | Música Clássica',
  description:
    'Explore artigos, análises e histórias sobre música clássica, compositores e obras imortais',
};

/** O que a home do blog precisa, em paralelo. */
function carregarBlog() {
  return Promise.all([
    getCachedFeaturedArticles(),
    getCachedLatestArticles(),
    getCachedMostReadArticles(),
    getCachedCategories(),
  ]);
}

export default async function BlogHomePage() {
  console.log('📰 Loading Blog Home Page...');

  // ✅ Buscar dados em paralelo com cache condicional (dev vs prod)
  const [featuredArticles, latestArticles, mostReadArticles, categories] =
    await tolerarApiForaNoBuild(
      carregarBlog,
      [[], [], [], []] as Awaited<ReturnType<typeof carregarBlog>>,
      'blog: home'
    );

  console.log('✅ Blog data loaded successfully');

  return (
    <div>
      {/* O blog abria direto no carrossel (h2): sem título de página. */}
      <h1 className="sr-only">
        Blog Opus Atlas — artigos sobre música clássica
      </h1>

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
          icon={<PiTrendUp className="w-6 h-6" />}
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
          icon={<PiSquaresFour className="w-6 h-6" />}
          accent="gold"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/blog/category/${category.slug}`}
              className="classical-card overflow-hidden group hover:shadow-[var(--sombra-2)] transition-all"
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
                <h3 className="text-lg font-bold text-theme-primary mb-2 group-hover:text-ouro-texto transition-colors line-clamp-1">
                  {category.name}
                </h3>

                {category.description && (
                  <Text
                    papel="rotulo"
                    tom="suave"
                    as="p"
                    className="mb-3 line-clamp-2"
                  >
                    {category.description}
                  </Text>
                )}

                {/* CTA */}
                <Text
                  papel="rotulo"
                  tom="ouro"
                  as="div"
                  className="flex items-center font-medium group-hover:translate-x-2 transition-transform"
                >
                  <span className="mr-1">Explorar</span>
                  <PiArrowRight className="w-4 h-4" />
                </Text>
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
            <Card densidade="larga">
              <h3 className="text-2xl font-bold text-theme-primary mb-6 flex items-center">
                <PiTrendUp className="w-6 h-6 mr-3 text-brand-primary" />
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
            </Card>
          </div>

          {/* Sidebar - Most Read */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center">
                <PiTrendUp className="w-5 h-5 mr-2 text-brand-primary" />
                Mais Lidos
              </h3>
              <Stack>
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
                      <h4 className="font-medium text-theme-primary group-hover:text-ouro-texto transition-colors line-clamp-2 mb-1">
                        {article.title}
                      </h4>
                      <Inline gap={2} className="text-xs text-theme-tertiary">
                        <PiClock className="w-3 h-3" />
                        <span>{article?.readTime ?? 0} min</span>
                        <span>•</span>
                        <span>{article.viewCount.toLocaleString()} views</span>
                      </Inline>
                    </div>
                  </Link>
                ))}
              </Stack>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
