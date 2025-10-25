// app/artigo/[slug]/page.tsx - VERSÃO COMPLETA ATUALIZADA
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import prisma from '@/app/libs/prismadb';
import { ArticleHeader } from '@/app/components/blog/ArticleHeader';
import { RelatedArticles } from '@/app/components/blog/RelatedArticles';
import { Breadcrumb } from '@/app/components/blog/Breadcrumb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import EditButton from '@/app/components/Common/EditButton';
// ✅ NOVOS COMPONENTES
import { ArticlePageClient } from '@/app/components/blog/ArticlePageClient';

export const revalidate = 600;

interface slugProps {
  slug: string;
}

interface PageProps {
  params: Promise<slugProps>;
}

async function getArticle(slug: string) {
  const article = await prisma.blogArticle.findUnique({
    where: { slug, status: 'PUBLISHED' },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          image: true,
          bio: true,
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
      media: {
        orderBy: { order: 'asc' },
      },
      _count: {
        select: {
          comments: { where: { status: 'APPROVED' } },
          likes: true,
        },
      },
    },
  });

  if (!article) {
    return null;
  }

  await prisma.blogArticle.update({
    where: { id: article.id },
    data: { viewCount: { increment: 1 } },
  });

  return article;
}

async function getRelatedArticles(articleId: string, categoryIds: string[]) {
  if (categoryIds.length === 0) return [];

  return await prisma.blogArticle.findMany({
    where: {
      id: { not: articleId },
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() },
      categories: {
        some: {
          categoryId: { in: categoryIds },
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
    take: 4,
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await getArticle(resolvedParams.slug);

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

export default async function ArticlePage({ params }: PageProps) {
  const resolvedParams = await params;
  const article = await getArticle(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user?.id ?? 0 >= 1) ? true : false;
  const categoryIds = article.categories.map((c) => c.category.id);
  const relatedArticles = await getRelatedArticles(article.id, categoryIds);

  // ✅ PREPARAR MÚSICA DE FUNDO
  const hasBackgroundMusic =
    article.backgroundMusicUrl && article.backgroundMusicUrl.trim() !== '';

  // ✅ DETECTAR TIPO DE ÁUDIO (upload ou youtube)
  let backgroundAudioType: 'upload' | 'youtube' | null = null;
  if (hasBackgroundMusic) {
    if (
      article.backgroundMusicUrl!.includes('youtube.com') ||
      article.backgroundMusicUrl!.includes('youtu.be')
    ) {
      backgroundAudioType = 'youtube';
    } else {
      backgroundAudioType = 'upload';
    }
  }

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

        {isAdmin && (
          <EditButton
            entityId={article.id}
            variant="minimal"
            entityType="article"
            size="lg"
            showLabel={false}
          />
        )}
      </div>

      {/* Article Header */}
      <ArticleHeader article={article} isAdmin={isAdmin} />

      {/* ✅ COMPONENTE CLIENT-SIDE (com todos os recursos) */}
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
        }}
        hasBackgroundMusic={hasBackgroundMusic}
        backgroundMusicUrl={article.backgroundMusicUrl || ''}
        backgroundMusicTitle={article.backgroundMusicTitle || ''}
        backgroundAudioType={backgroundAudioType}
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

// export async function generateStaticParams() {
//   const articles = await prisma.blogArticle.findMany({
//     where: {
//       status: 'PUBLISHED',
//     },
//     select: {
//       slug: true,
//     },
//     orderBy: { viewCount: 'desc' },
//     take: 50,
//   });

//   return articles.map((article) => ({
//     slug: article.slug,
//   }));
// }
