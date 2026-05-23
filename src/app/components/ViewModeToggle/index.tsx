// app/components/ViewModeToggle.tsx
'use client';

import { FiList, FiGrid } from 'react-icons/fi';

export type ViewMode = 'list' | 'cards';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

export default function ViewModeToggle({
  viewMode,
  onViewModeChange,
  className = '',
}: ViewModeToggleProps) {
  return (
    <div className={`hidden sm:flex items-center space-x-3 ${className}`}>
      {/* <span className="text-sm text-theme-secondary">Vista:</span> */}
      <div className="bg-theme-secundary border border-theme-primary rounded-lg p-1 flex">
        <button
          onClick={() => onViewModeChange('list')}
          className={`p-2 rounded-md transition-all duration-300 ${
            viewMode === 'list'
              ? 'bg-brand-gradient text-brand-primary shadow-theme-glow'
              : 'text-theme-tertiary hover:text-theme-primary hover:bg-interactive-hover'
          }`}
          title="Visualização em lista"
        >
          <FiList className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange('cards')}
          className={`p-2 rounded-md transition-all duration-300 ${
            viewMode === 'cards'
              ? 'bg-brand-gradient text-brand-primary shadow-theme-glow'
              : 'text-theme-tertiary hover:text-theme-primary hover:bg-interactive-hover'
          }`}
          title="Visualização em cards"
        >
          <FiGrid className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
