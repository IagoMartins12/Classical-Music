// components/blog/FeaturedArticlesManager.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { FaStar, FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface FeaturedArticle {
  id: string;
  title: string;
  featuredOrder: number;
}

interface FeaturedArticlesManagerProps {
  currentArticleId?: string;
  currentArticleTitle?: string; // 👈 NOVO: Título do artigo atual
  isFeatured: boolean;
  featuredOrder: number | null;
  onFeaturedChange: (isFeatured: boolean, order: number | null) => void;
}

export default function FeaturedArticlesManager({
  currentArticleId,
  currentArticleTitle,
  isFeatured,
  featuredOrder,
  onFeaturedChange,
}: FeaturedArticlesManagerProps) {
  const [featuredArticles, setFeaturedArticles] = useState<FeaturedArticle[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedArticles();
  }, []);

  // 🆕 INCLUIR ARTIGO ATUAL NA LISTA SE ESTIVER MARCADO COMO DESTAQUE
  const displayArticles = useMemo(() => {
    let articles = [...featuredArticles];

    // Se o artigo atual está marcado como destaque
    if (isFeatured && currentArticleTitle) {
      // Verificar se já está na lista (artigo existente)
      const existsInList = articles.some((a) => a.id === currentArticleId);

      if (!existsInList) {
        // Adicionar artigo atual (novo artigo)
        articles.push({
          id: currentArticleId || 'new-article',
          title: currentArticleTitle,
          featuredOrder: featuredOrder || articles.length + 1,
        });
      } else {
        // Atualizar ordem do artigo existente
        articles = articles.map((a) =>
          a.id === currentArticleId
            ? { ...a, featuredOrder: featuredOrder || a.featuredOrder }
            : a
        );
      }
    } else if (!isFeatured && currentArticleId) {
      // Remover artigo atual da lista se desmarcou destaque
      articles = articles.filter((a) => a.id !== currentArticleId);
    }

    // Ordenar por featuredOrder
    return articles.sort((a, b) => a.featuredOrder - b.featuredOrder);
  }, [
    featuredArticles,
    isFeatured,
    currentArticleId,
    currentArticleTitle,
    featuredOrder,
  ]);

  const fetchFeaturedArticles = async () => {
    try {
      const response = await fetch('/api/blog/articles/featured');
      const data = await response.json();

      if (data.success) {
        setFeaturedArticles(data.articles);
      }
    } catch (error) {
      console.error('Erro ao buscar destaques:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = (checked: boolean) => {
    if (checked) {
      // Adicionar como destaque - pegar a próxima posição disponível
      const maxOrder = Math.max(
        ...featuredArticles.map((a) => a.featuredOrder),
        0
      );
      const newOrder = maxOrder + 1;
      onFeaturedChange(true, newOrder);
    } else {
      // Remover destaque
      onFeaturedChange(false, null);
    }
  };

  const handleReorder = async (articleId: string, direction: 'up' | 'down') => {
    const currentIndex = displayArticles.findIndex((a) => a.id === articleId);
    if (currentIndex === -1) return;

    const targetIndex =
      direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= displayArticles.length) return;

    // Criar nova ordem
    const newArticles = [...displayArticles];
    const temp = newArticles[currentIndex];
    newArticles[currentIndex] = newArticles[targetIndex];
    newArticles[targetIndex] = temp;

    // Atualizar ordem numérica
    const updatedArticles = newArticles.map((article, index) => ({
      ...article,
      featuredOrder: index + 1,
    }));

    // Atualizar estado local apenas dos artigos que não são o atual (novo)
    const articlesToSave = updatedArticles.filter(
      (a) => a.id !== 'new-article'
    );
    setFeaturedArticles(articlesToSave);

    // Se o artigo atual foi movido, atualizar o estado local
    const currentArticleData = updatedArticles.find(
      (a) => a.id === articleId || a.id === 'new-article'
    );
    if (
      currentArticleData &&
      (articleId === currentArticleId || articleId === 'new-article')
    ) {
      onFeaturedChange(true, currentArticleData.featuredOrder);
    }

    // Salvar no banco apenas artigos existentes
    if (articlesToSave.length > 0) {
      try {
        await fetch('/api/blog/articles/featured/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            articles: articlesToSave.map((a) => ({
              id: a.id,
              featuredOrder: a.featuredOrder,
            })),
          }),
        });
      } catch (error) {
        console.error('Erro ao reordenar:', error);
        fetchFeaturedArticles(); // Recarregar em caso de erro
      }
    }
  };

  if (loading) {
    return (
      <div className="classical-card-simple p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-theme-secondary rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-10 bg-theme-secondary rounded"></div>
            <div className="h-10 bg-theme-secondary rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="classical-card-simple p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-theme-primary flex items-center">
          <FaStar className="w-4 h-4 mr-2 text-yellow-500" />
          Artigos em Destaque
        </h3>
        <span className="text-xs text-theme-tertiary">
          {displayArticles.length} / 5 destaques
        </span>
      </div>

      {/* Toggle para marcar como destaque */}
      <label className="flex items-center space-x-3 p-3 bg-theme-elevated rounded-lg cursor-pointer hover:bg-interactive-hover transition-colors mb-4">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(e) => handleToggleFeatured(e.target.checked)}
          className="w-5 h-5 text-brand-primary border-theme-secondary rounded focus:ring-brand-primary focus:ring-2"
          disabled={!isFeatured && displayArticles.length >= 5}
        />
        <div className="flex-1">
          <span className="text-sm font-medium text-theme-primary">
            Marcar como destaque
          </span>
          {!isFeatured && displayArticles.length >= 5 && (
            <p className="text-xs text-red-600 mt-1">
              Máximo de 5 destaques atingido. Remova um para adicionar.
            </p>
          )}
        </div>
      </label>

      {/* Lista de destaques atuais */}
      {displayArticles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-theme-tertiary mb-2">
            Ordem atual dos destaques:
          </p>
          {displayArticles.map((article, index) => {
            const isCurrentArticle =
              article.id === currentArticleId || article.id === 'new-article';

            return (
              <div
                key={article.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isCurrentArticle
                    ? 'bg-brand-primary/10 border-brand-primary'
                    : 'bg-theme-elevated border-theme-secondary'
                }`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <span className="text-xs font-bold text-theme-tertiary min-w-[20px]">
                    #{index + 1}
                  </span>
                  <span
                    className={`text-sm ${isCurrentArticle ? 'font-semibold text-brand-primary' : 'text-theme-secondary'}`}
                  >
                    {article.title}
                    {isCurrentArticle && (
                      <span className="ml-2 text-xs">(Este artigo)</span>
                    )}
                  </span>
                </div>

                {/* Botões de reordenação */}
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => handleReorder(article.id, 'up')}
                    disabled={index === 0}
                    className={`p-2 rounded transition-colors ${
                      index === 0
                        ? 'opacity-30 cursor-not-allowed'
                        : 'hover:bg-theme-secondary/20 text-theme-tertiary hover:text-theme-primary'
                    }`}
                    title="Mover para cima"
                  >
                    <FaArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReorder(article.id, 'down')}
                    disabled={index === displayArticles.length - 1}
                    className={`p-2 rounded transition-colors ${
                      index === displayArticles.length - 1
                        ? 'opacity-30 cursor-not-allowed'
                        : 'hover:bg-theme-secondary/20 text-theme-tertiary hover:text-theme-primary'
                    }`}
                    title="Mover para baixo"
                  >
                    <FaArrowDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {displayArticles.length === 0 && (
        <p className="text-sm text-theme-tertiary text-center py-4">
          Nenhum artigo em destaque no momento.
        </p>
      )}
    </div>
  );
}
