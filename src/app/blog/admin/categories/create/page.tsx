// app/blog/admin/categories/create/page.tsx

import Link from 'next/link';
import { CategoryForm } from '@/app/components/blog/admin/CategoryForm';
import { PiArrowLeft } from 'react-icons/pi';
import { Text } from '@/app/components/ui/Text';

export default function CreateCategoryPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/blog/admin/categories"
            className="inline-flex items-center text-sm text-theme-secondary hover:text-ouro-texto mb-4 transition-colors"
          >
            <PiArrowLeft className="w-4 h-4 mr-2" />
            Voltar para categorias
          </Link>
          <h1 className="text-3xl font-bold text-theme-primary classical-title">
            Criar Nova Categoria
          </h1>
          <Text papel="rotulo" tom="suave" as="p" className="mt-2">
            Preencha as informações abaixo para criar uma nova categoria para o
            blog.
          </Text>
        </div>

        {/* Form */}
        <div className="">
          <CategoryForm mode="create" />
        </div>
      </div>
    </div>
  );
}
