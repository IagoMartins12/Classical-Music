'use client';

import { FaHistory, FaClock } from 'react-icons/fa';

interface Props {
  activeTab: 'history' | 'timeline';
  onTabChange: (tab: 'history' | 'timeline') => void;
}

export function NavigationTabs({ activeTab, onTabChange }: Props) {
  const tabs = [
    {
      id: 'history' as const,
      label: 'História por Períodos',
      icon: FaHistory,
      description: 'Explore cada época em detalhes',
    },
    {
      id: 'timeline' as const,
      label: 'Linha do Tempo',
      icon: FaClock,
      description: 'Cronologia dos compositores',
    },
  ];

  return (
    <div className="mb-12">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
        <div className="flex flex-col sm:flex-row gap-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-3 px-6 py-4 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <IconComponent className="text-xl" />
                <div className="text-left">
                  <div className="font-semibold">{tab.label}</div>
                  <div
                    className={`text-sm ${
                      isActive ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {tab.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
