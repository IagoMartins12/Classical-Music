// app/blog/preview/[slug]/page.tsx — prévia do artigo (administrador), pela API
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FiEdit, FiAlertCircle } from 'react-icons/fi';
import { ApiError } from '@/app/libs/api/client';
import { getServerAccessToken } from '@/app/libs/api/server-session';
import { ArticleHeader } from '@/app/components/blog/ArticleHeader';
import { ArticlePageClient } from '@/app/components/blog/ArticlePageClient';
import { ApproveArticleButton } from '@/app/components/blog/admin/ApproveArticleButton';
import { backgroundAudioType, getArticle } from '@/app/requests/blog/articles';
import { getServerSession } from '@/app/libs/api/server-session';

export const dynamic = 'force-dynamic';

interface slugProps {
  slug: string;
}

interface PageProps {
  params: Promise<slugProps>;
}

/** Com o token de administrador, a API mostra o artigo em qualquer estado. */
async function getArticlePreview(slug: string, token?: string) {
  try {
    return await getArticle(slug, { token });
  } catch (error) {
    if (error instanceof ApiError && [400, 403, 404].includes(error.status)) {
      return null;
    }
    throw error;
  }
}

export default async function ArticlePreviewPage({ params }: PageProps) {
  const session = await getServerSession();

  // ✅ Apenas admins podem ver preview
  if (!session?.user || (session.user.role !== 1 && session.user.role !== 2)) {
    notFound();
  }
  const resolvedParams = await params;

  const article = await getArticlePreview(
    resolvedParams.slug,
    await getServerAccessToken()
  );

  if (!article) {
    notFound();
  }

  const audioType = backgroundAudioType(article.backgroundMusicUrl);

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

              <ApproveArticleButton
                articleId={article.id}
                slug={article.slug}
              />
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
        hasBackgroundMusic={audioType !== null}
        backgroundMusicUrl={article.backgroundMusicUrl || ''}
        backgroundMusicTitle={article.backgroundMusicTitle || ''}
        backgroundAudioType={audioType}
      />
    </div>
  );
}
