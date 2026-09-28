'use client';
import { Button } from '@/app/components/ui/Button';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/app/components/Modal';
import {
  PiArrowRight,
  PiArrowsClockwise,
  PiClock,
  PiFolder,
  PiHash,
  PiMagnifyingGlass,
  PiTrendUp,
  PiX,
} from 'react-icons/pi';
import Link from 'next/link';
import Image from '@/app/components/SmartImage';
import debounce from 'lodash/debounce';
import { autocomplete } from '@/app/requests/blog/taxonomy';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';
import { Stack } from '@/app/components/ui/Layout';

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
        const found = await autocomplete(searchQuery, 'all');

        setSuggestions({
          articles: found.articles.map((article) => ({
            ...article,
            coverImage: article.coverImage ?? undefined,
          })),
          tags: found.tags.map((tag) => ({
            ...tag,
            color: tag.color ?? undefined,
          })),
          categories: found.categories.map((category) => ({
            ...category,
            icon: category.icon ?? undefined,
            color: category.color ?? undefined,
          })),
        });
        setShowSuggestions(true);
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
          <PiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary pointer-events-none" />
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
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-theme-tertiary transition-colors"
          >
            <PiX className="w-5 h-5" />
            <NomeAcao acao="fechar" />
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <PiArrowsClockwise className={`w-12 h-12 animate-spin`} />{' '}
          </div>
        )}

        {/* Resultados de pesquisa */}
        {!isLoading && showSuggestions && query.length >= 2 && (
          <Stack gap={6}>
            {/* Artigos */}
            {suggestions.articles.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-theme-tertiary mb-3 uppercase tracking-wider">
                  Artigos
                </h3>
                <Stack gap={2}>
                  {suggestions.articles.slice(0, 3).map((article) => (
                    <Link
                      key={article.id}
                      href={`/blog/${article.slug}`}
                      onClick={() => {
                        saveRecentSearch(query);
                        onClose();
                      }}
                      className="flex items-center gap-3 p-3 rounded-lg transition-all group"
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
                        <p className="text-theme-primary transition-colors truncate">
                          {article.title}
                        </p>
                      </div>
                      <PiArrowRight className="w-4 h-4 text-theme-tertiary transition-all group-hover:translate-x-1" />
                    </Link>
                  ))}
                </Stack>

                {/* Link para ver todos os resultados */}
                <Button
                  variante="fantasma"
                  tamanho="p"
                  onClick={() => handleSearch()}
                  className="mt-3 w-full"
                >
                  Ver todos os resultados para &quot;{query}&quot;
                </Button>
              </div>
            )}

            {/* Categorias */}
            {suggestions.categories.length > 0 && (
              <Stack gap={3}>
                <h3 className="text-sm font-semibold text-theme-tertiary uppercase tracking-wider">
                  <PiFolder className="inline-block mr-2" />
                  Categorias
                </h3>
                <div className="flex flex-wrap gap-2">
                  {suggestions.categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.slug)}
                      className="px-4 py-2 rounded-full text-sm bg-theme-elevated hover:text-white transition-all"
                      style={{ borderColor: category.color }}
                    >
                      {category.icon} {category.name}
                    </button>
                  ))}
                </div>
              </Stack>
            )}

            {/* Tags */}
            {suggestions.tags.length > 0 && (
              <Stack gap={3}>
                <h3 className="text-sm font-semibold text-theme-tertiary uppercase tracking-wider">
                  <PiHash className="inline-block mr-2" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {suggestions.tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleTagClick(tag.slug)}
                      className="px-3 py-1 rounded-full text-sm bg-theme-elevated transition-all"
                      style={{ color: tag.color || undefined }}
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              </Stack>
            )}

            {/* Nenhum resultado */}
            {suggestions.articles.length === 0 &&
              suggestions.categories.length === 0 &&
              suggestions.tags.length === 0 && (
                <Stack gap={2} className="text-center py-8">
                  <p className="text-theme-tertiary">
                    Nenhum resultado encontrado para &quot;{query}&quot;
                  </p>
                  <Text papel="rotulo" tom="fraco" as="p">
                    Tente usar termos diferentes ou navegue pelas categorias
                  </Text>
                </Stack>
              )}
          </Stack>
        )}

        {/* Estado inicial - sem query */}
        {(!query || query.length <= 1) && !showSuggestions && (
          <Stack gap={6}>
            {/* Pesquisas recentes */}
            {recentSearches.length > 0 && (
              <Stack gap={3}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-theme-tertiary uppercase tracking-wider">
                    <PiClock className="inline-block mr-2" />
                    Recentes
                  </h3>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-theme-tertiary transition-colors"
                  >
                    Limpar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <Button
                      tamanho="p"
                      key={term}
                      onClick={() => handleSearch(term)}
                    >
                      {term}
                    </Button>
                  ))}
                </div>
              </Stack>
            )}

            {/* Sugestões populares */}
            <Stack gap={3}>
              <h3 className="text-sm font-semibold text-theme-tertiary uppercase tracking-wider">
                <PiTrendUp className="inline-block mr-2" />
                Populares
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularSuggestions.map((term) => (
                  <Button
                    tamanho="p"
                    key={term}
                    onClick={() => handleSearch(term)}
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </Stack>
          </Stack>
        )}
      </div>
    </Modal>
  );
}
