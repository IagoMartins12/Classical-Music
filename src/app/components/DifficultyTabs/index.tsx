// app/difficulty/components/DifficultyTabs.tsx

'use client';

import { FiMusic, FiGrid } from 'react-icons/fi';
import { AnimatedItem } from '../animation/AnimatedComponents';

interface DifficultyTabsProps {
  instruments: { id: string; name: string; workCount: number }[];
  selectedInstrument: string;
  onInstrumentChange: (instrumentId: string) => void;
  isPending: boolean;
}

export default function DifficultyTabs({
  instruments,
  selectedInstrument,
  onInstrumentChange,
  isPending,
}: DifficultyTabsProps) {
  const totalWorks = instruments.reduce((sum, inst) => sum + inst.workCount, 0);

  return (
    <div className="classical-card p-6">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mr-3">
          <FiMusic className="w-5 h-5 text-theme-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-theme-primary classical-title">
            Filtrar por Instrumento
          </h3>
          <p className="text-theme-secondary text-sm">
            Selecione um instrumento específico ou veja todas as obras
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Tab "Todos" */}
        <AnimatedItem hover="scale">
          <button
            onClick={() => onInstrumentChange('all')}
            disabled={isPending}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 border ${
              selectedInstrument === 'all'
                ? 'bg-brand-gradient text-theme-inverse border-brand-primary shadow-theme-glow'
                : 'bg-theme-elevated border-theme-secondary text-theme-secondary hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5'
            } ${isPending ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <FiGrid className="w-4 h-4" />
            <span>Todos</span>
            <span className="px-2 py-0.5 text-xs bg-theme-overlay rounded-full">
              {totalWorks}
            </span>
          </button>
        </AnimatedItem>

        {/* Tabs dos Instrumentos */}
        {instruments.map((instrument, index) => (
          <AnimatedItem
            key={instrument.id}
            hover="scale"
            style={{
              animationDelay: `${index * 0.05}s`,
              animationFillMode: 'backwards',
            }}
          >
            <button
              onClick={() => onInstrumentChange(instrument.id)}
              disabled={isPending}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 border ${
                selectedInstrument === instrument.id
                  ? 'bg-brand-gradient text-theme-inverse border-brand-primary shadow-theme-glow'
                  : 'bg-theme-elevated border-theme-secondary text-theme-secondary hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5'
              } ${isPending ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <FiMusic className="w-4 h-4" />
              <span>{instrument.name}</span>
              <span className="px-2 py-0.5 text-xs bg-theme-overlay rounded-full">
                {instrument.workCount}
              </span>
            </button>
          </AnimatedItem>
        ))}
      </div>
    </div>
  );
}
