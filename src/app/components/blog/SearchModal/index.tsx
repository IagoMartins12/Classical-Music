'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/app/components/Modal';
import {
  FaSearch,
  FaTimes,
  FaClock,
  FaHashtag,
  FaFolder,
} from 'react-icons/fa';
import { FiArrowRight, FiRefreshCw, FiTrendingUp } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import debounce from 'lodash/debounce';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchSuggestions {
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    coverImage?: string;
  }>;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    color?: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    icon?: string;
    color?: string;
  }>;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestions>({
    articles: [],
    tags: [],
    categories: [],
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Carregar pesquisas recentes do localStorage
  useEffect(() => {
    if (isOpen) {
      const recent = localStorage.getItem('recentSearches');
      if (recent) {
        setRecentSearches(JSON.parse(recent).slice(0, 5));
      }
      // Focar no input quando abrir
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Função para buscar sugestões
  const fetchSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery || searchQuery.length < 2) {
        setSuggestions({ articles: [], tags: [], categories: [] });
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/blog/search/autocomplete?q=${encodeURIComponent(searchQuery)}&type=all`
        );

        if (response.ok) {
          const data = await response.json();
          setSuggestions(
            data.suggestions || { articles: [], tags: [], categories: [] }
          );
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Detectar mudanças no campo de busca
  useEffect(() => {
    fetchSuggestions(query);
  }, [query, fetchSuggestions]);

  // Salvar pesquisa recente
  const saveRecentSearch = (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) return;

    const recent = [...new Set([searchTerm, ...recentSearches])].slice(0, 5);
    setRecentSearches(recent);
    localStorage.setItem('recentSearches', JSON.stringify(recent));
  };

  // Limpar pesquisas recentes
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Executar pesquisa
  const handleSearch = (searchQuery?: string) => {
    const searchTerm = searchQuery || query;
    if (!searchTerm || searchTerm.trim().length < 2) return;

    saveRecentSearch(searchTerm);
    router.push(`/blog/search?q=${encodeURIComponent(searchTerm)}`);
    onClose();
    setQuery('');
    setSuggestions({ articles: [], tags: [], categories: [] });
  };

  // Navegar para categoria
  const handleCategoryClick = (slug: string) => {
    router.push(`/blog/category/${slug}`);
    onClose();
  };

  // Navegar para tag
  const handleTagClick = (slug: string) => {
    router.push(`/blog/tag/${slug}`);
    onClose();
  };

  // Sugestões populares
  const popularSuggestions = [
    'Beethoven',
    'Piano',
    'Mozart',
    'Análise Musical',
    'História da Música',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      showCloseButton={false}
      className="!p-0"
    >
      <div className="p-6">
        {/* Header com campo de busca */}
        <div className="relative mb-6">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
              if (e.key === 'Escape') onClose();
            }}
            placeholder="Buscar artigos, compositores, tags..."
            className="input-classical w-full pl-12 pr-12 text-lg"
            autoFocus
          />
          <button
            onClick={onClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-theme-tertiary hover:text-theme-primary transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <FiRefreshCw className={`w-12 h-12 animate-spin`} />{' '}
          </div>
        )}

        {/* Resultados de pesquisa */}
        {!isLoading && showSuggestions && query.length >= 2 && (
          <div className="space-y-6">
            {/* Artigos */}
            {suggestions.articles.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-theme-tertiary mb-3 uppercase tracking-wider">
                  Artigos
                </h3>
                <div className="space-y-2">
                  {suggestions.articles.slice(0, 3).map((article) => (
                    <Link
                      key={article.id}
                      href={`/blog/${article.slug}`}
                      onClick={() => {
                        saveRecentSearch(query);
                        onClose();
                      }}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-theme-elevated transition-all group"
                    >
                      {article.coverImage && (
                        <Image
                          src={article.coverImage}
                          alt={article.title}
                          width={60}
                          height={40}
                          className="rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-theme-primary group-hover:text-brand-primary transition-colors truncate">
                          {article.title}
                        </p>
                      </div>
                      <FiArrowRight className="w-4 h-4 text-theme-tertiary group-hover:text-brand-primary transition-all group-hover:translate-x-1" />
                    </Link>
                  ))}
                </div>

                {/* Link para ver todos os resultados */}
                <button
                  onClick={() => handleSearch()}
                  className="mt-3 w-full py-2 text-center text-brand-primary hover:text-brand-secondary transition-colors text-sm font-medium"
                >
                  Ver todos os resultados para &quot;{query}&quot;
                </button>
              </div>
            )}

            {/* Categorias */}
            {suggestions.categories.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-theme-tertiary mb-3 uppercase tracking-wider">
                  <FaFolder className="inline-block mr-2" />
                  Categorias
                </h3>
                <div className="flex flex-wrap gap-2">
                  {suggestions.categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.slug)}
                      className="px-4 py-2 rounded-full text-sm bg-theme-elevated hover:bg-brand-primary hover:text-white transition-all"
                      style={{ borderColor: category.color }}
                    >
                      {category.icon} {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {suggestions.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-theme-tertiary mb-3 uppercase tracking-wider">
                  <FaHashtag className="inline-block mr-2" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {suggestions.tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleTagClick(tag.slug)}
                      className="px-3 py-1 rounded-full text-sm bg-theme-elevated hover:bg-theme-classical transition-all"
                      style={{ color: tag.color || undefined }}
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Nenhum resultado */}
            {suggestions.articles.length === 0 &&
              suggestions.categories.length === 0 &&
              suggestions.tags.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-theme-tertiary mb-2">
                    Nenhum resultado encontrado para &quot;{query}&quot;
                  </p>
                  <p className="text-sm text-theme-tertiary">
                    Tente usar termos diferentes ou navegue pelas categorias
                  </p>
                </div>
              )}
          </div>
        )}

        {/* Estado inicial - sem query */}
        {(!query || query.length <= 1) && !showSuggestions && (
          <div className="space-y-6">
            {/* Pesquisas recentes */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-theme-tertiary uppercase tracking-wider">
                    <FaClock className="inline-block mr-2" />
                    Recentes
                  </h3>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-theme-tertiary hover:text-accent-red transition-colors"
                  >
                    Limpar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleSearch(term)}
                      className="px-3 py-2 rounded-lg bg-theme-elevated hover:bg-theme-classical text-sm transition-all"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sugestões populares */}
            <div>
              <h3 className="text-sm font-semibold text-theme-tertiary mb-3 uppercase tracking-wider">
                <FiTrendingUp className="inline-block mr-2" />
                Populares
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularSuggestions.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSearch(term)}
                    className="px-3 py-2 rounded-lg bg-theme-elevated hover:bg-brand-primary hover:text-white text-sm transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
