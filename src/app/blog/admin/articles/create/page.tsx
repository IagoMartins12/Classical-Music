// app/(admin)/blog/admin/articles/create/page.tsx - ATUALIZADO
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArticleForm } from '@/app/components/blog/ArticleForm';
import { FaArrowLeft } from 'react-icons/fa';

export default function CreateArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/blog/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/blog/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // ✅ Se foi publicado diretamente, vai para artigo público
        if (formData.status === 'PUBLISHED') {
          router.push(`/blog/${data.article.slug}`);
        } else {
          // ✅ Caso contrário, vai para PREVIEW obrigatório
          router.push(`/blog/preview/${data.article.slug}`);
        }
      } else {
        alert('Erro ao criar artigo: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao criar artigo:', error);
      alert('Erro ao criar artigo');
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
