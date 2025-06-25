// app/composers/PaginationControls.tsx - Premium pagination component
'use client';

import {
  FiChevronLeft,
  FiChevronRight,
  FiMoreHorizontal,
} from 'react-icons/fi';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isPending: boolean;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isPending,
}) => {
  // Generate page numbers to show
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    // Always show first page
    range.push(1);

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      range.push(totalPages);
    }

    let l;
    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="classical-card p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Page info */}
        <div className="flex items-center space-x-2 text-theme-secondary text-sm">
          <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
          <span>
            Página{' '}
            <span className="font-bold text-theme-primary">{currentPage}</span>{' '}
            de{' '}
            <span className="font-bold text-theme-primary">{totalPages}</span>
          </span>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center space-x-2">
          {/* First page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1 || isPending}
            className="hidden md:flex items-center px-3 py-2 text-sm font-medium text-theme-secondary hover:text-theme-primary bg-theme-elevated border border-theme-secondary hover:border-theme-primary rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
          >
            Início
          </button>

          {/* Previous button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || isPending}
            className="flex items-center justify-center w-10 h-10 text-theme-secondary hover:text-brand-primary bg-theme-elevated border border-theme-secondary hover:border-brand-primary rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 group"
          >
            <FiChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {visiblePages.map((page, index) => {
              if (page === '...') {
                return (
                  <div
                    key={`dots-${index}`}
                    className="flex items-center justify-center w-10 h-10"
                  >
                    <FiMoreHorizontal className="w-4 h-4 text-theme-tertiary" />
                  </div>
                );
              }

              const pageNum = page as number;
              const isActive = pageNum === currentPage;

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  disabled={isPending}
                  className={`
                    flex items-center justify-center w-10 h-10 text-sm font-medium rounded-lg transition-all duration-300 disabled:cursor-not-allowed hover:scale-105
                    ${
                      isActive
                        ? 'bg-brand-gradient text-theme-primary shadow-theme-glow border-2 border-brand-primary/30'
                        : 'text-theme-secondary hover:text-brand-primary bg-theme-elevated border border-theme-secondary hover:border-brand-primary hover:bg-interactive-hover'
                    }
                  `}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isPending}
            className="flex items-center justify-center w-10 h-10 text-theme-secondary hover:text-brand-primary bg-theme-elevated border border-theme-secondary hover:border-brand-primary rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 group"
          >
            <FiChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Last page */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages || isPending}
            className="hidden md:flex items-center px-3 py-2 text-sm font-medium text-theme-secondary hover:text-theme-primary bg-theme-elevated border border-theme-secondary hover:border-theme-primary rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
          >
            Final
          </button>
        </div>

        {/* Quick jump (mobile hidden) */}
        <div className="hidden lg:flex items-center space-x-2 text-sm"></div>
      </div>

      {/* Loading indicator */}
      {isPending && (
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-brand-primary text-sm">
            <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Carregando...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginationControls;
