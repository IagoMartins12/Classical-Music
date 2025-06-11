// NavigationTabs.tsx - Premium version with theme system
'use client';

import { FiBookOpen, FiClock } from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';

interface Props {
  activeTab: 'history' | 'timeline';
  onTabChange: (tab: 'history' | 'timeline') => void;
}

export function NavigationTabs({ activeTab, onTabChange }: Props) {
  const tabs = [
    {
      id: 'history' as const,
      label: 'Épocas Históricas',
      description: 'Explore cada período da música clássica',
      icon: FiBookOpen,
      gradient: 'from-brand-primary to-brand-secondary',
    },
    {
      id: 'timeline' as const,
      label: 'Linha do Tempo',
      description: 'Cronologia dos grandes compositores',
      icon: FiClock,
      gradient: 'from-accent-purple to-accent-blue',
    },
  ];

  return (
    <div className="classical-card p-8 animate-fade-in-up relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-4 right-4 text-6xl text-brand-primary/5">
        <GiMusicalNotes />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center shadow-theme-glow">
              <GiMusicalNotes className="w-5 h-5 text-theme-primary" />
            </div>
            <h2 className="text-2xl font-bold text-theme-primary classical-title">
              Navegue pela História
            </h2>
          </div>
          <p className="text-theme-secondary classical-subtitle">
            Escolha como deseja explorar a evolução da música clássica
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative group p-6 rounded-2xl border-2 transition-all duration-500 text-left overflow-hidden
                  ${
                    isActive
                      ? 'border-brand-primary bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 shadow-theme-glow scale-105'
                      : 'border-theme-secondary hover:border-theme-primary hover:bg-interactive-hover hover:scale-102'
                  }
                  animate-fade-in-up
                `}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Background gradient effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${
                    tab.gradient
                  } opacity-0 ${
                    isActive ? 'opacity-10' : 'group-hover:opacity-5'
                  } transition-opacity duration-500 rounded-2xl`}
                ></div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-4 bottom-4 w-1 bg-brand-gradient rounded-full"></div>
                )}

                <div className="relative z-10 flex items-start space-x-4">
                  {/* Icon */}
                  <div
                    className={`
                      w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 flex-shrink-0
                      ${
                        isActive
                          ? `bg-gradient-to-br ${tab.gradient} text-theme-primary shadow-theme-glow`
                          : 'bg-theme-elevated border border-theme-secondary text-theme-primary group-hover:border-theme-primary'
                      }
                      group-hover:scale-110
                    `}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3
                      className={`
                        text-lg font-semibold classical-title mb-2 transition-colors duration-300
                        ${
                          isActive
                            ? 'text-brand-primary'
                            : 'text-theme-primary group-hover:text-brand-primary'
                        }
                      `}
                    >
                      {tab.label}
                    </h3>
                    <p
                      className={`
                        text-sm leading-relaxed transition-colors duration-300
                        ${
                          isActive
                            ? 'text-theme-primary'
                            : 'text-theme-secondary group-hover:text-theme-primary'
                        }
                      `}
                    >
                      {tab.description}
                    </p>

                    {/* Active state indicator */}
                    {isActive && (
                      <div className="flex items-center space-x-2 mt-3">
                        <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-brand-primary">
                          Visualização atual
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Arrow indicator */}
                  <div
                    className={`
                      w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300
                      ${
                        isActive
                          ? 'bg-brand-primary/20 text-brand-primary'
                          : 'text-theme-tertiary group-hover:text-theme-primary group-hover:bg-interactive-hover'
                      }
                    `}
                  >
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isActive ? 'rotate-90' : 'group-hover:translate-x-0.5'
                      }`}
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
                  </div>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
              </button>
            );
          })}
        </div>

        {/* Bottom decoration */}
        <div className="flex items-center justify-center space-x-2 mt-8">
          <div className="w-1 h-1 bg-brand-primary rounded-full animate-pulse"></div>
          <div
            className="w-2 h-2 bg-accent-purple rounded-full animate-pulse"
            style={{ animationDelay: '0.5s' }}
          ></div>
          <div
            className="w-1 h-1 bg-brand-primary rounded-full animate-pulse"
            style={{ animationDelay: '1s' }}
          ></div>
        </div>
      </div>
    </div>
  );
}
