import Link from 'next/link';
import { FiCheckCircle, FiSearch, FiTarget } from 'react-icons/fi';

// app/learning/components/EmptyState.tsx
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
  const config = {
    'want-to-learn': {
      icon: (
        <FiTarget className="w-16 h-16 text-theme-tertiary mx-auto mb-4 opacity-50" />
      ),
      title: hasFilters ? 'Nenhuma obra encontrada' : 'Lista vazia',
      description: hasFilters
        ? 'Tente ajustar os filtros de busca'
        : 'Adicione obras que você gostaria de estudar',
      action: 'Explorar Obras',
    },
    learned: {
      icon: (
        <FiCheckCircle className="w-16 h-16 text-theme-tertiary mx-auto mb-4 opacity-50" />
      ),
      title: hasFilters ? 'Nenhuma obra encontrada' : 'Lista vazia',
      description: hasFilters
        ? 'Tente ajustar os filtros de busca'
        : 'Marque obras que você já aprendeu',
      action: 'Explorar Obras',
    },
    search: {
      icon: (
        <FiSearch className="w-16 h-16 text-theme-tertiary mx-auto mb-4 opacity-50" />
      ),
      title: 'Nenhum resultado encontrado',
      description: `Não encontramos obras para "${searchQuery}"`,
      action: 'Limpar Filtros',
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
