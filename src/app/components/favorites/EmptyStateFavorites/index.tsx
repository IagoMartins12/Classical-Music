import Link from 'next/link';
import { FiMusic, FiStar, FiUser, FiSearch, FiX } from 'react-icons/fi';

interface emptyStatesProps {
  emptyState: 'all' | 'works' | 'composers';
  filters?: boolean;
  onClearFilters?: () => void; // Função para limpar filtros
}

const EmptyStateFavorites: React.FC<emptyStatesProps> = ({
  emptyState,
  filters = false,
  onClearFilters,
}) => {
  // Configurações baseadas no tipo de estado vazio e filtros
  const getEmptyStateConfig = () => {
    // Se há filtros ativos, mostra mensagem de "nenhum resultado encontrado"
    if (filters) {
      return {
        all: {
          icon: FiSearch,
          title: 'Nenhum resultado encontrado',
          description:
            'Não encontramos favoritos que correspondam à sua busca. Tente termos diferentes ou limpe os filtros.',
          primaryAction: {
            label: 'Limpar Filtros',
            onClick: onClearFilters,
            icon: FiX,
            href: null,
          },
          showSecondaryActions: false,
        },
        composers: {
          icon: FiSearch,
          title: 'Nenhum compositor encontrado',
          description:
            'Não encontramos compositores favoritos que correspondam à sua busca.',
          primaryAction: {
            label: 'Limpar Filtros',
            onClick: onClearFilters,
            icon: FiX,
          },
          showSecondaryActions: false,
        },
        works: {
          icon: FiSearch,
          title: 'Nenhuma obra encontrada',
          description:
            'Não encontramos obras favoritas que correspondam à sua busca.',
          primaryAction: {
            label: 'Limpar Filtros',
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
        title: 'Comece sua jornada musical',
        description:
          'Descubra e favorite compositores e obras que inspiram você. Sua coleção pessoal aguarda para ser criada.',
        showSecondaryActions: true,
        tip: 'Clique no ícone de coração ❤️ ao lado de qualquer compositor ou obra para adicioná-los aos seus favoritos.',
      },
      composers: {
        icon: FiUser,
        title: 'Nenhum compositor favorito',
        description:
          'Você ainda não favoritou nenhum compositor. Explore nossa coleção e descubra os mestres da música clássica.',
        primaryAction: {
          label: 'Explorar Compositores',
          href: '/composers',
          icon: FiUser,
        },
        showSecondaryActions: false,
        tip: 'Favorite compositores para acompanhar suas obras e descobrir mais sobre sua vida e legado.',
      },
      works: {
        icon: FiMusic,
        title: 'Nenhuma obra favorita',
        description:
          'Você ainda não favoritou nenhuma obra. Explore nossa biblioteca e encontre peças que tocam seu coração.',
        primaryAction: {
          label: 'Descobrir Obras',
          href: '/works',
          icon: FiMusic,
        },
        showSecondaryActions: false,
        tip: 'Favorite obras para criar sua playlist pessoal de música clássica.',
      },
    };
  };

  const config = getEmptyStateConfig()[emptyState];
  const IconComponent = config.icon;

  return (
    <div
      className="classical-card p-12 text-center animate-fade-in-up"
      style={{ animationDelay: '0.2s' }}
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

          {/* Ações secundárias (para estado 'all' sem filtros) */}
          {config.showSecondaryActions && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/composers"
                className="btn-classical-primary flex items-center justify-center space-x-2 group"
              >
                <FiUser className="w-4 h-4" />
                <span>Explorar Compositores</span>
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
                <span>Descobrir Obras</span>
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
                <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mt-0.5">
                  <FiStar className="w-3 h-3 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-theme-primary text-sm mb-1">
                    Dica para começar
                  </h4>
                  <p className="text-xs text-theme-secondary">{config.tip}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmptyStateFavorites;
