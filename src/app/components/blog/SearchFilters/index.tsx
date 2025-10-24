'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Checkbox from '../../Common/Checkbox';

interface SearchFiltersProps {
  currentParams: {
    q?: string;
    tipos?: string;
    categorias?: string;
    tags?: string;
    ordenar?: string;
    page?: string;
  };
}

export function SearchFilters({ currentParams }: SearchFiltersProps) {
  const router = useRouter();

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    tipos: true,
    categorias: false,
    tags: false,
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        fetch('/api/blog/categories'),
        fetch('/api/blog/tags?limit=20'),
      ]);

      const [categoriesData, tagsData] = await Promise.all([
        categoriesRes.json(),
        tagsRes.json(),
      ]);

      if (categoriesData.success) setCategories(categoriesData.categories);
      if (tagsData.success) setTags(tagsData.tags);
    } catch (error) {
      console.error('Erro ao carregar filtros:', error);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleFilterChange = (
    filterType: string,
    value: string,
    checked: boolean
  ) => {
    const params = new URLSearchParams(window.location.search);
    const currentValues =
      params.get(filterType)?.split(',').filter(Boolean) || [];

    if (checked) {
      currentValues.push(value);
    } else {
      const index = currentValues.indexOf(value);
      if (index > -1) {
        currentValues.splice(index, 1);
      }
    }

    if (currentValues.length > 0) {
      params.set(filterType, currentValues.join(','));
    } else {
      params.delete(filterType);
    }

    // Reset to page 1 when filters change
    params.delete('page');

    router.push(`/blog/search?${params.toString()}`);
  };

  const isChecked = (filterType: string, value: string) => {
    const values =
      currentParams[filterType as keyof typeof currentParams]
        ?.split(',')
        .filter(Boolean) || [];
    return values.includes(value);
  };

  const articleTypes = [
    { value: 'COMPOSER_ANALYSIS', label: 'Análise de Compositor' },
    { value: 'WORK_ANALYSIS', label: 'Análise de Obra' },
    { value: 'INSTRUMENT_GUIDE', label: 'Guia de Instrumentos' },
    { value: 'MUSIC_HISTORY', label: 'História da Música' },
    { value: 'TUTORIAL', label: 'Tutorial' },
    { value: 'TOP_LIST', label: 'Lista/Top 10' },
    { value: 'INTERVIEW', label: 'Entrevista' },
    { value: 'NEWS', label: 'Notícias' },
    { value: 'CURIOSITY', label: 'Curiosidades' },
    { value: 'PERFORMANCE_VIDEO', label: 'Vídeo de Performance' },
    { value: 'CONCERT_GUIDE', label: 'Guia de Concerto' },
    { value: 'GENERAL', label: 'Geral' },
  ];

  const FilterSection = ({
    title,
    sectionKey,
    children,
  }: {
    title: string;
    sectionKey: string;
    children: React.ReactNode;
  }) => (
    <div className="mb-4">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between py-2 text-theme-primary font-medium hover:text-brand-primary transition-colors"
      >
        <span>{title}</span>
        {expandedSections[sectionKey] ? (
          <FaChevronUp className="w-4 h-4" />
        ) : (
          <FaChevronDown className="w-4 h-4" />
        )}
      </button>
      {expandedSections[sectionKey] && (
        <div className="mt-2 space-y-2">{children}</div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Article Types */}
      <FilterSection title="Tipos de Artigo" sectionKey="tipos">
        {articleTypes.map((type) => (
          <label
            key={type.value}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <Checkbox
              checked={isChecked('tipos', type.value)}
              onChange={(e) =>
                handleFilterChange('tipos', type.value, e.target.checked)
              }
            />
            <span className="text-sm text-theme-secondary group-hover:text-theme-primary transition-colors">
              {type.label}
            </span>
          </label>
        ))}
      </FilterSection>

      {/* Categories */}
      {categories.length > 0 && (
        <FilterSection title="Categorias" sectionKey="categorias">
          {categories.map((category: any) => (
            <label
              key={category.id}
              className="flex items-center space-x-2 cursor-pointer group"
            >
              <Checkbox
                checked={isChecked('categorias', category.slug)}
                onChange={(e) =>
                  handleFilterChange(
                    'categorias',
                    category.slug,
                    e.target.checked
                  )
                }
                className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
              />
              <span className="text-sm text-theme-secondary group-hover:text-theme-primary transition-colors">
                {category.icon} {category.name}
              </span>
            </label>
          ))}
        </FilterSection>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <FilterSection title="Tags Populares" sectionKey="tags">
          {tags.map((tag: any) => (
            <label
              key={tag.id}
              className="flex items-center space-x-2 cursor-pointer group"
            >
              <Checkbox
                checked={isChecked('tags', tag.slug)}
                onChange={(e) =>
                  handleFilterChange('tags', tag.slug, e.target.checked)
                }
                className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
              />
              <span
                className="text-sm text-theme-secondary group-hover:text-theme-primary transition-colors"
                style={{ color: tag.color || undefined }}
              >
                #{tag.name}
              </span>
            </label>
          ))}
        </FilterSection>
      )}
    </div>
  );
}
