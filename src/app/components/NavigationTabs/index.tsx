// NavigationTabs.tsx - Premium version with theme system
'use client';

import { useTranslation } from '@/app/context/TranslationContext';
import { PiBookOpen, PiClock, PiMusicNotes } from 'react-icons/pi';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

interface Props {
  activeTab: 'history' | 'timeline';
  onTabChange: (tab: 'history' | 'timeline') => void;
}

export function NavigationTabs({ activeTab, onTabChange }: Props) {
  const { t } = useTranslation({ sections: ['pages/music-history'] });

  const tabs = [
    {
      id: 'history' as const,
      label: t('navigation_tabs_0__label'),
      description: t('navigation_tabs_0__description'),
      icon: PiBookOpen,
      gradient: '',
    },
    {
      id: 'timeline' as const,
      label: t('navigation_tabs_1__label'),
      description: t('navigation_tabs_1__description'),
      icon: PiClock,
      gradient: '',
    },
  ];

  return (
    <Card
      densidade="larga"
      className="animate-fade-in-up relative overflow-hidden"
    >
      <div className="relative z-10">
        {/* Header */}
        <Stack className="text-center mb-8">
          <Inline gap={3} className="justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-theme-glow">
              <PiMusicNotes className="w-5 h-5 text-theme-primary" />
            </div>
            <h2 className="text-2xl font-bold text-theme-primary classical-title">
              {t('navigation_jsx_h2_children_0__navegue_historia')}
            </h2>
          </Inline>
          <p className="text-theme-secondary classical-subtitle">
            {t('navigation_jsx_p_children_0__escolha_explorar')}
          </p>
        </Stack>

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
                      ? 'shadow-theme-glow scale-105'
                      : 'border-theme-secondary hover:scale-102'
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
                  <div className="absolute left-0 top-4 bottom-4 w-1 rounded-full"></div>
                )}

                <div className="relative z-10 flex items-start space-x-4">
                  {/* Icon */}
                  <div
                    className={`
                      w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 flex-shrink-0
                      ${
                        isActive
                          ? `bg-gradient-to-br ${tab.gradient} text-theme-primary shadow-theme-glow`
                          : 'bg-theme-elevated border border-theme-secondary text-theme-primary'
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
                        ${isActive ? 'text-ouro-texto' : 'text-theme-primary'}
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
                            : 'text-theme-secondary'
                        }
                      `}
                    >
                      {tab.description}
                    </p>

                    {/* Active state indicator */}
                    {isActive && (
                      <Inline gap={2} className="mt-3">
                        <div className="w-2 h-2 rounded-full animate-pulse"></div>
                        <Text
                          papel="legenda"
                          tom="ouro"
                          className="font-medium"
                        >
                          {t(
                            'navigation_jsx_span_children_0__visualizacao_atual'
                          )}
                        </Text>
                      </Inline>
                    )}
                  </div>

                  {/* Arrow indicator */}
                  <div
                    className={`
                      w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300
                      ${isActive ? 'text-ouro-texto' : 'text-theme-tertiary'}
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
                <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
              </button>
            );
          })}
        </div>

        {/* Bottom decoration */}
        <Inline gap={2} className="justify-center mt-8">
          <div className="w-1 h-1 rounded-full animate-pulse"></div>
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ animationDelay: '0.5s' }}
          ></div>
          <div
            className="w-1 h-1 rounded-full animate-pulse"
            style={{ animationDelay: '1s' }}
          ></div>
        </Inline>
      </div>
    </Card>
  );
}
