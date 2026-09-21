// app/blog/category/[slug]/page.tsx — artigos de uma categoria, pela API
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from '@/app/components/SmartImage';
import { FiGrid } from 'react-icons/fi';
import { CategoryArticles } from '@/app/components/blog/CategoryArticles';
import {
  getCategory,
  listCategoryArticles,
} from '@/app/requests/blog/taxonomy';

export const revalidate = 600;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; view?: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug, { revalidate });

  if (!category) return { title: 'Categoria não encontrada' };

  return {
    title: `${category.name} - Blog Opus Atlas`,
    description: category.description || `Artigos sobre ${category.name}`,
  };
}

/**
 * **`generateStaticParams` vazio, e é isso que liga o cache.**
 *
 * No App Router, rota com segmento dinâmico e **sem** `generateStaticParams`
 * é renderizada a cada pedido, e o `revalidate` acima não vale nada — era o
 * caso aqui: cada visita a uma categoria renderizava a página do zero, para as categorias do blog.
 *
 * Devolvendo uma lista vazia, nada é gerado no build (não faria sentido gerar
 * centenas de milhares de páginas) mas a rota passa a ser guardada: a primeira
 * visita de cada endereço renderiza, as seguintes vêm do Redis compartilhado,
 * e a API revalida por tag quando o dado muda.
 */
export async function generateStaticParams() {
  return [];
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { page = '1' } = await searchParams;

  const category = await getCategory(slug, { revalidate });

  if (!category) {
    notFound();
  }

  const { articles, pagination } = await listCategoryArticles(
    slug,
    Math.max(1, parseInt(page) || 1),
    12,
    { revalidate }
  );

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="relative section-wrap lg:min-h-[25rem] py-16 overflow-hidden flex items-center justify-center">
        {/* Background Image */}
        {category.image && (
          <div className="absolute inset-0 z-0">
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-theme-primary/80 to-theme-primary" />
          </div>
        )}

        {/* Content */}
        <div className=" z-10 flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-theme-primary classical-title mb-4">
            {category.name}
          </h1>

          {/* Description */}
          {category.description && (
            <p className="text-xl text-theme-secondary max-w-2xl mx-auto mb-6">
              {category.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center justify-center space-x-6 text-theme-tertiary">
            <div className="flex items-center space-x-2">
              <FiGrid className="w-5 h-5" />
              <span>
                {category._count.articles}{' '}
                {category._count.articles === 1 ? 'artigo' : 'artigos'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="section-wrap pb-16">
        <CategoryArticles
          articles={articles}
          pagination={pagination}
          categorySlug={slug}
        />
      </div>
    </div>
  );
}
