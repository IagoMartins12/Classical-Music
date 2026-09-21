import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { TagForm } from '@/app/components/blog/admin/TagForm';
import { getServerAccessToken } from '@/app/libs/api/server-session';
import { loadAdminTag } from '@/app/requests/blog/admin';
import { FaArrowLeft } from 'react-icons/fa';
import { getServerSession } from '@/app/libs/api/server-session';

interface idProps {
  id: string;
}

interface PageProps {
  params: Promise<idProps>;
}

async function getTag(id: string) {
  return loadAdminTag(id, await getServerAccessToken());
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;

  const tag = await getTag(resolvedParams.id);

  return {
    title: tag ? `Editar #${tag.name} - Blog Admin` : 'Tag não encontrada',
    robots: 'noindex, nofollow',
  };
}

export default async function EditTagPage({ params }: PageProps) {
  const session = await getServerSession();

  if (!session?.user || (session.user.role !== 1 && session.user.role !== 2)) {
    redirect('/blog');
  }
  const resolvedParams = await params;

  const tag = await getTag(resolvedParams.id);

  if (!tag) {
    notFound();
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/blog/admin/tags"
            className="inline-flex items-center text-sm text-theme-secondary hover:text-brand-primary mb-4 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Voltar para tags
          </Link>
          <h1 className="text-3xl font-bold text-theme-primary classical-title">
            Editar Tag {tag.name}
          </h1>
          <p className="mt-2 text-sm text-theme-secondary">
            Preencha as informações abaixo para criar uma editar a tag para o
            blog.
          </p>
        </div>

        <div>
          <TagForm mode="edit" tag={tag} />
        </div>
      </div>
    </div>
  );
}
