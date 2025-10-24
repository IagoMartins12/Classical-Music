// app/blog/preview/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import prisma from '@/app/libs/prismadb';
import { authOptions } from '@/app/libs/auth';
import { ArticleHeader } from '@/app/components/blog/ArticleHeader';
import { ArticlePageClient } from '@/app/components/blog/ArticlePageClient';
import { FiCheck, FiEdit, FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface slugProps {
  slug: string;
}

interface PageProps {
  params: Promise<slugProps>;
}

async function getArticlePreview(slug: string) {
  const article = await prisma.blogArticle.findUnique({
    where: { slug },
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

  return article;
}

export default async function ArticlePreviewPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  // ✅ Apenas admins podem ver preview
  if (!session?.user || (session.user.role !== 1 && session.user.role !== 2)) {
    notFound();
  }
  const resolvedParams = await params;

  const article = await getArticlePreview(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  // ✅ PREPARAR MÚSICA DE FUNDO
  const hasBackgroundMusic =
    article.backgroundMusicUrl && article.backgroundMusicUrl.trim() !== '';

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
      {/* ⚠️ BANNER DE PREVIEW */}
      <div className="sticky top-0 z-50 bg-yellow-500 border-b-4 border-yellow-600 shadow-lg">
        <div className="section-wrap">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiAlertCircle className="w-6 h-6 text-yellow-900" />
              <div>
                <p className="text-sm font-bold text-yellow-900">
                  MODO PREVIEW
                </p>
                <p className="text-xs text-yellow-800">
                  Esta é uma visualização. O artigo ainda não está publicado.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href={`/blog/admin/articles/${article.id}/edit`}
                className="px-4 py-2 bg-white text-yellow-900 rounded-lg font-medium hover:bg-yellow-50 transition-all flex items-center space-x-2"
              >
                <FiEdit className="w-4 h-4" />
                <span>Editar</span>
              </Link>

              <form
                action={`/api/blog/articles/${article.id}/approve`}
                method="POST"
              >
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all flex items-center space-x-2"
                >
                  <FiCheck className="w-4 h-4" />
                  <span>Aprovar e Publicar</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Article Header */}
      <ArticleHeader article={article} />

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
    </div>
  );
}
