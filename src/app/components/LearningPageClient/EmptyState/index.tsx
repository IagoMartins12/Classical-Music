// app/learning/components/EmptyState.tsx

import Link from 'next/link';
import { FiCheckCircle, FiSearch, FiTarget } from 'react-icons/fi';
import { useTranslation } from '@/app/hooks/useTranslation';

interface EmptyStateProps {
  type: 'want-to-learn' | 'learned' | 'search';
  searchQuery?: string;
  hasFilters?: boolean;
}

export const EmptyState = ({
  type,
  searchQuery,
  hasFilters,
}: EmptyStateProps) => {
  const { t } = useTranslation({ sections: ['pages/learning'] });

  const config = {
    'want-to-learn': {
      icon: (
        <FiTarget className="w-16 h-16 text-theme-tertiary mx-auto mb-4 opacity-50" />
      ),
      title: hasFilters ? t('empty_no_works_found') : t('empty_list_empty'),
      description: hasFilters
        ? t('empty_adjust_filters')
        : t('empty_add_want_to_learn'),
      action: t('empty_explore_works'),
    },
    learned: {
      icon: (
        <FiCheckCircle className="w-16 h-16 text-theme-tertiary mx-auto mb-4 opacity-50" />
      ),
      title: hasFilters ? t('empty_no_works_found') : t('empty_list_empty'),
      description: hasFilters
        ? t('empty_adjust_filters')
        : t('empty_add_learned'),
      action: t('empty_explore_works'),
    },
    search: {
      icon: (
        <FiSearch className="w-16 h-16 text-theme-tertiary mx-auto mb-4 opacity-50" />
      ),
      title: t('empty_no_results'),
      description: `${t('empty_no_results_for')} "${searchQuery}"`,
      action: t('empty_clear_filters'),
    },
  };

  const currentConfig = config[type];

  return (
    <div className="classical-card p-8 text-center">
      {currentConfig.icon}
      <h3 className="text-xl font-semibold text-theme-primary mb-2">
        {currentConfig.title}
      </h3>
      <p className="text-theme-tertiary mb-4">{currentConfig.description}</p>
      <Link href="/works" className="btn-classical-primary">
        {currentConfig.action}
      </Link>
    </div>
  );
};
