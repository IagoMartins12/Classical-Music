import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import prisma from '@/app/libs/prismadb';
import { authOptions } from '@/app/libs/auth';
import { CategoryForm } from '@/app/components/blog/admin/CategoryForm';
import { FaArrowLeft } from 'react-icons/fa';

interface categoryProps {
  id: string;
}

interface PageProps {
  params: Promise<categoryProps>;
}

async function getCategory(id: string) {
  return await prisma.blogCategory.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          articles: true,
        },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;

  const category = await getCategory(resolvedParams.id);

  return {
    title: category
      ? `Editar ${category.name} - Blog Admin`
      : 'Categoria não encontrada',
    robots: 'noindex, nofollow',
  };
}

export default async function EditCategoryPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user.role !== 1 && session.user.role !== 2)) {
    redirect('/blog');
  }
  const resolvedParams = await params;

  const category = await getCategory(resolvedParams.id);

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/blog/admin/categories"
            className="inline-flex items-center text-sm text-theme-secondary hover:text-brand-primary mb-4 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Voltar para categorias
          </Link>
          <h1 className="text-3xl font-bold text-theme-primary classical-title">
            Editar categoria {category.name}
          </h1>
          <p className="mt-2 text-sm text-theme-secondary">
            Preencha as informações abaixo para editar a categoria para o blog.
          </p>
        </div>

        {/* Form */}
        <div className="">
          <CategoryForm mode="edit" category={category} />
        </div>
      </div>
    </div>
  );
}
