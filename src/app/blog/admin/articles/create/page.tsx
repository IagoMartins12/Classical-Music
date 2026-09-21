// app/blog/admin/articles/create/page.tsx — novo artigo, pela API
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArticleForm } from '@/app/components/blog/ArticleForm';
import { FaArrowLeft } from 'react-icons/fa';
import { createArticle } from '@/app/requests/blog/admin-actions';
import { listCategories } from '@/app/requests/blog/taxonomy';

export default function CreateArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setCategories(await listCategories({ fresh: true }));
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  // O ArticleForm mostra o erro: aqui só se repassa.
  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const data = await createArticle(formData);
      const slug = data.article?.slug ?? formData.slug;

      // ✅ Se foi publicado diretamente, vai para artigo público; senão, preview
      router.push(
        formData.status === 'PUBLISHED'
          ? `/blog/${slug}`
          : `/blog/preview/${slug}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/blog/admin/articles"
            className="inline-flex items-center text-sm text-theme-secondary hover:text-brand-primary mb-4 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Voltar para artigos
          </Link>
          <h1 className="text-3xl font-bold text-theme-primary classical-title">
            Criar Novo Artigo
          </h1>
          <p className="mt-2 text-sm text-theme-secondary">
            Preencha as informações abaixo. O artigo será salvo e você será
            redirecionado ao preview para aprovar antes de publicar.
          </p>
        </div>

        {/* Form */}
        <div className="classical-card p-6">
          <ArticleForm
            onSubmit={handleSubmit}
            categories={categories}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
