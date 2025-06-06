// components/IMSLPTabs.tsx
'use client';

import { useState } from 'react';
import {
  LuMusic,
  LuEye,
  LuDownload,
  LuStar,
  LuClock,
  LuFileText,
} from 'react-icons/lu';
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
}

const TABS: TabInfo[] = [
  { id: 'scores', label: 'Partituras', icon: LuMusic, type: 'scores' },
  { id: 'parts', label: 'Partes', icon: LuFileText, type: 'parts' },
  {
    id: 'arrangements',
    label: 'Arranjos e Transcrições',
    icon: LuMusic,
    type: 'arrangements',
  },
  { id: 'librettos', label: 'Libretos', icon: LuFileText, type: 'librettos' },
  { id: 'others', label: 'Outros', icon: LuFileText, type: 'others' },
  { id: 'sources', label: 'Arquivos Fonte', icon: LuFileText, type: 'sources' },
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
      <div className="bg-white rounded-xl shadow-lg">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LuMusic className="w-6 h-6" />
            Partituras IMSLP
          </h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Carregando partituras...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LuMusic className="w-6 h-6" />
            Partituras IMSLP
          </h2>
        </div>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p>{error}</p>
            {onRefetch && (
              <button
                onClick={onRefetch}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Tentar novamente
              </button>
            )}
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

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <LuMusic className="w-6 h-6" />
          Partituras Disponiveis
          <span className="text-sm font-normal text-gray-500">
            ({Object.values(imslpData.totalCounts).reduce((a, b) => a + b, 0)}{' '}
            itens)
          </span>
        </h2>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-1" aria-label="Tabs">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const count = imslpData.totalCounts[tab.type];
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all
                  ${
                    isActive
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTabData.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {/* Lista de Partituras */}
            <div className="space-y-4">
              {activeTabData.map((score) => (
                <ScoreCard
                  key={score.id}
                  score={score}
                  isSelected={selectedScore?.id === score.id}
                  onSelect={() =>
                    setSelectedScore(
                      selectedScore?.id === score.id ? null : score
                    )
                  }
                />
              ))}
            </div>

            {/* Preview Panel */}
            {/* <div className="lg:sticky lg:top-6">
              {selectedScore ? (
                <ScorePreview score={selectedScore} />
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <LuEye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Selecione uma partitura para ver o preview
                  </p>
                </div>
              )}
            </div> */}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            Nenhum item encontrado nesta categoria.
          </p>
        )}
      </div>
    </div>
  );
}
