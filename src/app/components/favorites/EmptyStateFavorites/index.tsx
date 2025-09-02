import Link from 'next/link';
import {
  FiMusic,
  FiStar,
  FiUser,
  FiSearch,
  FiX,
  FiFileText,
} from 'react-icons/fi';
import { AnimatedContainer } from '../../animation/AnimatedComponents';
import { useTranslation } from '@/app/context/TranslationContext';

interface emptyStatesProps {
  emptyState: 'all' | 'works' | 'composers' | 'scores';
  filters?: boolean;
  onClearFilters?: () => void;
}

const EmptyStateFavorites: React.FC<emptyStatesProps> = ({
  emptyState,
  filters = false,
  onClearFilters,
}) => {
  const { t } = useTranslation({ sections: ['pages/favorites'] });

  // Configurações baseadas no tipo de estado vazio e filtros
  const getEmptyStateConfig = () => {
    // Se há filtros ativos, mostra mensagem de "nenhum resultado encontrado"
    if (filters) {
      return {
        all: {
          icon: FiSearch,
          title: t('empty_no_results'),
          description: t('empty_no_results_description'),
          primaryAction: {
            label: t('empty_clear_filters'),
            onClick: onClearFilters,
            icon: FiX,
            href: null,
          },
          showSecondaryActions: false,
        },
        composers: {
          icon: FiSearch,
          title: t('empty_no_composer'),
          description: t('empty_no_composer_description'),
          primaryAction: {
            label: t('empty_clear_filters'),
            onClick: onClearFilters,
            icon: FiX,
          },
          showSecondaryActions: false,
        },
        works: {
          icon: FiSearch,
          title: t('empty_no_work'),
          description: t('empty_no_work_description'),
          primaryAction: {
            label: t('empty_clear_filters'),
            onClick: onClearFilters,
            icon: FiX,
          },
          showSecondaryActions: false,
        },
        scores: {
          icon: FiSearch,
          title: t('empty_no_score'),
          description: t('empty_no_score_description'),
          primaryAction: {
            label: t('empty_clear_filters'),
            onClick: onClearFilters,
            icon: FiX,
          },
          showSecondaryActions: false,
        },
      };
    }

    // Estados vazios sem filtros
    return {
      all: {
        icon: FiStar,
        title: t('empty_start_journey'),
        description: t('empty_start_journey_description'),
        showSecondaryActions: true,
        tip: t('empty_start_journey_tip'),
      },
      composers: {
        icon: FiUser,
        title: t('empty_no_favorite_composer'),
        description: t('empty_no_favorite_composer_description'),
        primaryAction: {
          label: t('empty_explore_composers'),
          href: '/composers',
          icon: FiUser,
        },
        showSecondaryActions: false,
        tip: t('empty_favorite_composers_tip'),
      },
      works: {
        icon: FiMusic,
        title: t('empty_no_favorite_work'),
        description: t('empty_no_favorite_work_description'),
        primaryAction: {
          label: t('empty_discover_works'),
          href: '/works',
          icon: FiMusic,
        },
        showSecondaryActions: false,
        tip: t('empty_favorite_works_tip'),
      },
      scores: {
        icon: FiFileText,
        title: t('empty_no_favorite_score'),
        description: t('empty_no_favorite_score_description'),
        primaryAction: {
          label: t('empty_discover_works'),
          href: '/works',
          icon: FiMusic,
        },
        showSecondaryActions: false,
        tip: t('empty_favorite_scores_tip'),
      },
    };
  };

  const config = getEmptyStateConfig()[emptyState];
  const IconComponent = config.icon;

  return (
    <AnimatedContainer
      speed="fast"
      className="classical-card p-12 mt-4 text-center"
    >
      <div className="max-w-none lg:max-w-3xl mx-auto">
        {/* Ícone */}
        <div className="w-16 h-16 bg-gradient-to-br from-theme-secondary to-theme-elevated rounded-3xl flex items-center justify-center mx-auto mb-6">
          <IconComponent className="w-8 h-8 text-theme-tertiary" />
        </div>

        {/* Título e Descrição */}
        <h3 className="text-2xl font-bold text-theme-primary mb-4 classical-title">
          {config.title}
        </h3>

        <p className="text-theme-secondary mb-8 classical-body">
          {config.description}
        </p>

        {/* Ações */}
        <div className="space-y-4">
          {/* Ação principal personalizada (filtros) */}
          {config.primaryAction && config.primaryAction.onClick && (
            <button
              onClick={config.primaryAction.onClick}
              className="btn-classical-primary flex items-center justify-center space-x-2 group mx-auto"
            >
              <config.primaryAction.icon className="w-4 h-4" />
              <span>{config.primaryAction.label}</span>
            </button>
          )}

          {/* Ação principal com link */}
          {config.primaryAction && config.primaryAction.href && (
            <Link
              href={config.primaryAction.href}
              className="btn-classical-primary flex items-center justify-center space-x-2 group mx-auto"
            >
              <config.primaryAction.icon className="w-4 h-4" />
              <span>{config.primaryAction.label}</span>
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          )}

          {/* Ações secundárias atualizadas para incluir partituras */}
          {config.showSecondaryActions && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/composers"
                className="btn-classical-primary flex items-center justify-center space-x-2 group"
              >
                <FiUser className="w-4 h-4" />
                <span>{t('empty_see_composers')}</span>
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>

              <Link
                href="/works"
                className="btn-classical-secondary flex items-center justify-center space-x-2 group"
              >
                <FiMusic className="w-4 h-4" />
                <span>{t('empty_discover_works')}</span>
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>

              {/* Novo botão para partituras */}
              <Link
                href="/works"
                className="btn-classical-primary flex items-center justify-center space-x-2 group"
              >
                <FiFileText className="w-4 h-4" />
                <span>{t('empty_see_scores')}</span>
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          )}

          {/* Dica */}
          {config.tip && (
            <div className="mt-8 p-4 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-xl border border-theme-primary">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-8 md:w-6 md:h-6 rounded-lg flex items-center justify-center mt-0.5">
                  <FiStar className="w-5 h-5text-theme-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-theme-primary text-sm mb-1">
                    {t('empty_tip_to_start')}
                  </h4>
                  <p className="text-xs text-theme-secondary">{config.tip}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default EmptyStateFavorites;
