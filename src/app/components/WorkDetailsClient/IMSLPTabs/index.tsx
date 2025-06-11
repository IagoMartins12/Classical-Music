// components/IMSLPTabs.tsx - Premium version with theme system
'use client';

import { useState } from 'react';
import {
  FiMusic,
  FiEye,
  FiDownload,
  FiStar,
  FiClock,
  FiFileText,
  FiRefreshCw,
  FiAlertCircle,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import ScoreCard from '../ScoreCard';
import { IMSLPScore, IMSLPWorkScores } from '@/app/libs/imslp-score-scraper';
import ScorePreview from '../ScorePreview';

interface IMSLPTabsProps {
  imslpData: IMSLPWorkScores;
  loading?: boolean;
  error?: string;
  onRefetch?: () => void;
}

interface TabInfo {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  type: keyof IMSLPWorkScores['scoresByType'];
  gradient: string;
}

const TABS: TabInfo[] = [
  {
    id: 'scores',
    label: 'Partituras',
    icon: FiMusic,
    type: 'scores',
    gradient: 'from-brand-primary to-brand-secondary',
  },
  {
    id: 'parts',
    label: 'Partes',
    icon: FiFileText,
    type: 'parts',
    gradient: 'from-accent-blue to-accent-purple',
  },
  {
    id: 'arrangements',
    label: 'Arranjos e Transcrições',
    icon: GiMusicalNotes,
    type: 'arrangements',
    gradient: 'from-accent-green to-accent-blue',
  },
  {
    id: 'librettos',
    label: 'Libretos',
    icon: FiFileText,
    type: 'librettos',
    gradient: 'from-accent-purple to-accent-red',
  },
  {
    id: 'others',
    label: 'Outros',
    icon: FiFileText,
    type: 'others',
    gradient: 'from-accent-red to-accent-purple',
  },
  {
    id: 'sources',
    label: 'Arquivos Fonte',
    icon: FiFileText,
    type: 'sources',
    gradient: 'from-accent-purple to-accent-blue',
  },
];

export default function IMSLPTabs({
  imslpData,
  loading,
  error,
  onRefetch,
}: IMSLPTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Encontrar a primeira aba com conteúdo
    const firstTabWithContent = TABS.find(
      (tab) => imslpData?.totalCounts[tab.type] > 0
    );
    return firstTabWithContent?.id || 'scores';
  });

  const [selectedScore, setSelectedScore] = useState<IMSLPScore | null>(null);

  if (loading) {
    return (
      <div className="classical-card overflow-hidden animate-fade-in-up">
        <div className="border-b border-theme-secondary p-8 bg-gradient-to-r from-theme-elevated to-interactive-hover">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center">
              <FiMusic className="w-6 h-6 text-theme-inverse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-theme-primary classical-title">
                Partituras IMSLP
              </h2>
              <p className="text-theme-secondary classical-subtitle">
                Carregando recursos disponíveis...
              </p>
            </div>
          </div>
        </div>
        <div className="p-8">
          <div className="flex items-center justify-center space-x-3 py-12">
            <div className="relative">
              <div className="w-8 h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
              <div
                className="absolute inset-0 w-8 h-8 border-4 border-transparent border-r-brand-secondary rounded-full animate-spin"
                style={{
                  animationDirection: 'reverse',
                  animationDuration: '1.5s',
                }}
              ></div>
            </div>
            <span className="text-theme-primary font-medium">
              Carregando partituras...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="classical-card overflow-hidden animate-fade-in-up">
        <div className="border-b border-theme-secondary p-8 bg-gradient-to-r from-theme-elevated to-interactive-hover">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-red to-accent-purple rounded-2xl flex items-center justify-center">
              <FiAlertCircle className="w-6 h-6 text-theme-inverse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-theme-primary classical-title">
                Partituras IMSLP
              </h2>
              <p className="text-theme-secondary classical-subtitle">
                Erro ao carregar recursos
              </p>
            </div>
          </div>
        </div>
        <div className="p-8">
          <div className="bg-gradient-to-r from-accent-red/10 to-accent-red/5 border border-accent-red/30 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-accent-red/20 border border-accent-red/40 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiAlertCircle className="w-5 h-5 text-accent-red" />
              </div>
              <div className="flex-1">
                <p className="text-accent-red font-medium mb-2">{error}</p>
                {onRefetch && (
                  <button
                    onClick={onRefetch}
                    className="btn-classical-secondary flex items-center space-x-2 group"
                  >
                    <FiRefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    <span>Tentar novamente</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!imslpData) {
    return null;
  }

  const visibleTabs = TABS.filter((tab) => imslpData.totalCounts[tab.type] > 0);
  const activeTabData =
    imslpData.scoresByType[activeTab as keyof typeof imslpData.scoresByType] ||
    [];

  const totalItems = Object.values(imslpData.totalCounts).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <div className="classical-card overflow-hidden animate-fade-in-up">
      {/* Header */}
      {/* <div className="border-b border-theme-secondary p-8 bg-gradient-to-r from-theme-elevated to-interactive-hover relative">
        <div className="absolute top-4 right-4 text-6xl text-brand-primary/5">
          <GiMusicalNotes />
        </div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center shadow-theme-glow">
              <FiMusic className="w-6 h-6 text-theme-inverse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-theme-primary classical-title">
                Partituras Disponíveis
              </h2>
              <p className="text-theme-secondary classical-subtitle">
                {totalItems}{' '}
                {totalItems === 1 ? 'item disponível' : 'itens disponíveis'}
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="text-center p-3 bg-theme-elevated border border-theme-primary rounded-xl">
              <div className="text-lg font-bold text-brand-primary">
                {totalItems}
              </div>
              <div className="text-xs text-theme-tertiary">Total</div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Tabs Navigation */}
      <div className="border-b border-theme-secondary bg-gradient-to-r from-theme-primary to-theme-elevated">
        <nav className="flex overflow-x-auto scrollbar-hide" aria-label="Tabs">
          {visibleTabs.map((tab, index) => {
            const Icon = tab.icon;
            const count = imslpData.totalCounts[tab.type];
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-3 px-6 py-4 cursor-pointer text-sm font-medium border-b-2 transition-all duration-300 whitespace-nowrap flex-shrink-0 animate-fade-in-up
                  ${
                    isActive
                      ? 'border-brand-primary text-brand-primary bg-gradient-to-t from-brand-primary/10 to-transparent'
                      : 'border-transparent text-theme-tertiary hover:text-theme-primary hover:border-theme-primary hover:bg-interactive-hover'
                  }
                `}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`w-6 h-6 rounded-lg  flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-br ${tab.gradient} text-theme-primary shadow-theme-glow`
                      : 'bg-theme-elevated text-theme-tertiary group-hover:text-theme-primary'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                </div>
                <span className="font-semibold">{tab.label}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30'
                      : 'bg-theme-elevated text-theme-tertiary border border-theme-secondary'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-8">
        {activeTabData.length > 0 ? (
          <div className="grid grid-cols-1 gap-8">
            {/* Lista de Partituras */}
            <div className="space-y-6">
              {activeTabData.map((scoreGroup, groupIndex) => (
                <div
                  key={scoreGroup.groupIndex}
                  className="space-y-4 animate-fade-in-up"
                  style={{ animationDelay: `${groupIndex * 0.1}s` }}
                >
                  {/* Título do grupo, se disponível */}
                  {scoreGroup.groupTitle && (
                    <div className="border-b border-theme-secondary pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
                          <GiMusicalNotes className="w-4 h-4 text-theme-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-theme-primary classical-title">
                          {scoreGroup.groupTitle}
                        </h3>
                      </div>
                    </div>
                  )}

                  {/* Scores do grupo */}
                  <div className="space-y-2">
                    {scoreGroup.scores.map((score, index) => (
                      <ScoreCard
                        key={score.id}
                        score={score}
                        isSelected={selectedScore?.id === score.id}
                        onSelect={() =>
                          setSelectedScore(
                            selectedScore?.id === score.id ? null : score
                          )
                        }
                        isLastInGroup={index === scoreGroup.scores.length - 1}
                        groupSize={scoreGroup.scores.length}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Preview Panel */}
            {selectedScore && (
              <div className="lg:sticky lg:top-6 animate-fade-in-up">
                <ScorePreview score={selectedScore} />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-theme-tertiary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiMusic className="w-8 h-8 text-theme-tertiary" />
            </div>
            <h3 className="text-xl font-bold text-theme-primary classical-title mb-2">
              Nenhuma partitura disponível
            </h3>
            <p className="text-theme-secondary max-w-md mx-auto">
              Não foram encontradas partituras desta categoria para esta obra no
              momento.
            </p>
          </div>
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-4 right-4 w-2 h-2 bg-brand-primary/30 rounded-full animate-pulse"></div>
      <div
        className="absolute top-1/2 left-4 w-1.5 h-1.5 bg-accent-purple/40 rounded-full animate-pulse"
        style={{ animationDelay: '1s' }}
      ></div>
    </div>
  );
}
