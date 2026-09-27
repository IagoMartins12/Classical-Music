// app/components/ViewModeToggle.tsx
'use client';

import { PiListBullets, PiSquaresFour } from 'react-icons/pi';

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
      <div className="border border-theme-primary rounded-lg p-1 flex">
        <button
          onClick={() => onViewModeChange('list')}
          className={`p-2 rounded-md transition-all duration-300 ${
            viewMode === 'list'
              ? 'text-ouro-texto shadow-theme-glow'
              : 'text-theme-tertiary'
          }`}
          title="Visualização em lista"
        >
          <PiListBullets className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange('cards')}
          className={`p-2 rounded-md transition-all duration-300 ${
            viewMode === 'cards'
              ? 'text-ouro-texto shadow-theme-glow'
              : 'text-theme-tertiary'
          }`}
          title="Visualização em cards"
        >
          <PiSquaresFour className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
