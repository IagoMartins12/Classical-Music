import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '@/app/libs/auth';
import { TagForm } from '@/app/components/blog/admin/TagForm';
import { FaArrowLeft } from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Nova Tag - Blog Admin',
  description: 'Criar nova tag para o blog',
  robots: 'noindex, nofollow',
};

export default async function CreateTagPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user.role !== 1 && session.user.role !== 2)) {
    redirect('/blog');
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
            Criar Nova Tag
          </h1>
          <p className="mt-2 text-sm text-theme-secondary">
            Preencha as informações abaixo para criar uma nova tag para o blog.
          </p>
        </div>

        <div className="">
          <TagForm mode="create" />
        </div>
      </div>
    </div>
  );
}
