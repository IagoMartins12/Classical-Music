// app/blog/[slug]/page.tsx — página pública do artigo, pela API
//
// Estática (ISR): a API revalida a tag `blog-articles` quando o artigo muda, e
// os 10 minutos são só a rede de segurança. Por isso a página não lê a sessão
// no servidor — o que é de administrador (editar, visitas, áudio) se decide
// no navegador, e a visita é contada de lá.
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ArticleHeader } from '@/app/components/blog/ArticleHeader';
import { RelatedArticles } from '@/app/components/blog/RelatedArticles';
import { Breadcrumb } from '@/app/components/blog/Breadcrumb';
import EditButton from '@/app/components/Common/EditButton';
import { ArticlePageClient } from '@/app/components/blog/ArticlePageClient';
import { AdminOnly } from '@/app/components/blog/AdminOnly';
import { ApiError } from '@/app/libs/api/client';
import {
  backgroundAudioType,
  getArticle,
  getRelatedArticles,
} from '@/app/requests/blog/articles';

export const revalidate = 600;

interface slugProps {
  slug: string;
}

interface PageProps {
  params: Promise<slugProps>;
}

/** Só artigo publicado; rascunho ou inexistente vira "não encontrado". */
async function loadArticle(slug: string) {
  try {
    const article = await getArticle(slug, { revalidate });
    return article.status === 'PUBLISHED' ? article : null;
  } catch (error) {
    if (error instanceof ApiError && [400, 403, 404].includes(error.status)) {
      return null;
    }
    throw error;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await loadArticle(resolvedParams.slug);

  if (!article) {
    return { title: 'Artigo não encontrado' };
  }

  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.description || undefined,
    keywords: article.keywords,
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.description || undefined,
      images: article.coverImage ? [article.coverImage] : undefined,
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
      authors: [
        `${article.author.firstName || ''} ${article.author.lastName || ''}`.trim(),
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.description || undefined,
      images: article.coverImage ? [article.coverImage] : undefined,
    },
  };
}

/**
 * **`generateStaticParams` vazio, e é isso que liga o cache.**
 *
 * No App Router, rota com segmento dinâmico e **sem** `generateStaticParams`
 * é renderizada a cada pedido, e o `revalidate` acima não vale nada — era o
 * caso aqui: cada visita a um artigo renderizava a página do zero, para os artigos publicados.
 *
 * Devolvendo uma lista vazia, nada é gerado no build (não faria sentido gerar
 * centenas de milhares de páginas) mas a rota passa a ser guardada: a primeira
 * visita de cada endereço renderiza, as seguintes vêm do Redis compartilhado,
 * e a API revalida por tag quando o dado muda.
 */
export async function generateStaticParams() {
  return [];
}

export default async function ArticlePage({ params }: PageProps) {
  const resolvedParams = await params;
  const article = await loadArticle(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article, 4, { revalidate });

  const audioType = backgroundAudioType(article.backgroundMusicUrl);

  return (
    <div className="min-h-screen relative">
      {/* Breadcrumb */}
      <div className="section-wrap flex justify-between pt-8 !pb-0">
        <Breadcrumb
          items={[
            { label: 'Início', href: '/blog' },
            {
              label: article.categories[0]?.category.name || 'Sem categoria',
              href: `/blog/category/${
                article.categories[0]?.category.slug || '#'
              }`,
            },
            { label: article.title },
          ]}
        />

        <AdminOnly>
          <EditButton
            entityId={article.id}
            variant="minimal"
            entityType="article"
            size="lg"
            showLabel={false}
          />
        </AdminOnly>
      </div>

      {/* Article Header */}
      <ArticleHeader article={article} />

      <ArticlePageClient
        article={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          content: article.content,
          composerIds: article.composerIds,
          workIds: article.workIds,
          scoreIds: article.scoreIds,
          _count: article._count,
          categories: article.categories,
          ttsAudioUrl: article.ttsAudioUrl,
        }}
        hasBackgroundMusic={audioType !== null}
        backgroundMusicUrl={article.backgroundMusicUrl || ''}
        backgroundMusicTitle={article.backgroundMusicTitle || ''}
        backgroundAudioType={audioType}
      />

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="section-wrap py-12">
          <RelatedArticles articles={relatedArticles} />
        </section>
      )}
    </div>
  );
}
