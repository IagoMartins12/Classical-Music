// app/(admin)/blog/admin/articles/[id]/edit/page.tsx - ATUALIZADO
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArticleForm } from '@/app/components/blog/ArticleForm';
import { BiTrash } from 'react-icons/bi';
import { FaArrowLeft } from 'react-icons/fa';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;

  const [article, setArticle] = useState<any>(null);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [articleId]);

  const fetchData = async () => {
    try {
      const [articleRes, categoriesRes] = await Promise.all([
        fetch(`/api/blog/articles/${articleId}`),
        fetch('/api/blog/categories'),
      ]);

      const articleData = await articleRes.json();
      const categoriesData = await categoriesRes.json();

      if (articleData.success) {
        const article = articleData.article;

        // ✅ MONTAR backgroundMusic corretamente
        const backgroundMusic = {
          url: article.backgroundMusicUrl || '',
          title: article.backgroundMusicTitle || '',
          volume: article.backgroundMusicVolume ?? 0.3,
          loop: article.backgroundMusicLoop ?? true,
          autoplay: article.backgroundMusicAutoplay ?? true,
        };

        // ✅ FIX: categories já vem como array de Category
        const categoryIds = Array.isArray(article.categories)
          ? article.categories.map((c: any) => c.id).filter(Boolean)
          : [];

        // ✅ FIX: tags já vem como array de Tag
        const tags = Array.isArray(article.tags)
          ? article.tags.map((t: any) => t.name).filter(Boolean)
          : [];

        console.log('✅ Dados mapeados:', {
          categoryIds,
          tags,
          backgroundMusic,
        });

        const formData = {
          ...article,
          categoryIds,
          tags,
          backgroundMusic,
          // ✅ Garantir que arrays sempre existam
          composerIds: article.composerIds || [],
          workIds: article.workIds || [],
          scoreIds: article.scoreIds || [],
          instrumentIds: article.instrumentIds || [],
          epochIds: article.epochIds || [],
          keywords: article.keywords || [],
          types: article.types || [],
          scheduledFor: article.scheduledFor
            ? new Date(article.scheduledFor).toISOString().slice(0, 16)
            : undefined,
        };

        console.log('📋 FormData final:', formData);

        setArticle(formData);
      }

      if (categoriesData.success) {
        setCategories(categoriesData.categories);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      alert('Erro ao carregar artigo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/blog/articles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: articleId, ...formData }),
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
        alert('Erro ao atualizar artigo: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao atualizar artigo:', error);
      alert('Erro ao atualizar artigo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Tem certeza que deseja deletar este artigo? Esta ação não pode ser desfeita.'
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/blog/articles?id=${articleId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Artigo deletado com sucesso!');
        router.push('/blog/admin/articles');
      } else {
        alert('Erro ao deletar artigo: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao deletar artigo:', error);
      alert('Erro ao deletar artigo');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-theme-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-theme-primary">
        <div className="text-center classical-card p-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-2">
            Artigo não encontrado
          </h2>
          <Link
            href="/blog/admin/articles"
            className="text-brand-primary hover:text-brand-secondary transition-colors"
          >
            Voltar para artigos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/blog/admin/articles"
              className="inline-flex items-center text-sm text-theme-secondary hover:text-brand-primary mb-4 transition-colors"
            >
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Voltar para artigos
            </Link>
            <h1 className="text-3xl font-bold text-theme-primary classical-title">
              Editar Artigo
            </h1>
            <p className="mt-2 text-sm text-theme-secondary">{article.title}</p>
          </div>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-classical-delete flex items-center space-x-2"
          >
            <BiTrash className="w-4 h-4" />
            <span>{deleting ? 'Deletando...' : 'Deletar'}</span>
          </button>
        </div>

        {/* Form */}
        <div className="classical-card p-6">
          <ArticleForm
            initialData={article}
            onSubmit={handleSubmit}
            categories={categories}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
