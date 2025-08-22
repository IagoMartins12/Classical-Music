// app/profile/ProfilePageClient.tsx (versão atualizada)
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  FiUser,
  FiMusic,
  FiHeart,
  FiShield,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

// Import all profile sections
import PersonalInfoSection from '../../components/profile/PersonalInfoSection';
import InstrumentsSection from '../../components/profile/InstrumentsSection';
import MusicalPreferencesSection from '../../components/profile/MusicalPreferencesSection';
import PrivacySection from '../../components/profile/PrivacySection';
import AccountSettingsSection from '../../components/profile/AccountSettingsSection';
import { useAuth } from '@/app/hooks/useAuth';
import { User } from 'next-auth';
import { useAuthStore } from '@/app/stores/authStore';
import ProfileSkeleton from './loading';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType<{
    user: User;
    updateUser: (data: Partial<User>) => void;
  }>;
}

export default function ProfilePageClient() {
  const { user, isAuthenticated, updateUser } = useAuth(); // Usar o novo hook
  const { hasOnboardingProgress, openOnboardingModal } = useAuthStore();
  const [activeTab, setActiveTab] = useState('personal');

  // Memoized tabs configuration
  const tabs: Tab[] = useMemo(
    () => [
      {
        id: 'personal',
        label: 'Informações Pessoais',
        icon: <FiUser className="w-4 h-4" />,
        component: PersonalInfoSection,
      },
      {
        id: 'instruments',
        label: 'Meus Instrumentos',
        icon: <FiMusic className="w-4 h-4" />,
        component: InstrumentsSection,
      },
      {
        id: 'preferences',
        label: 'Preferências Musicais',
        icon: <FiHeart className="w-4 h-4" />,
        component: MusicalPreferencesSection,
      },
      {
        id: 'privacy',
        label: 'Privacidade',
        icon: <FiShield className="w-4 h-4" />,
        component: PrivacySection,
      },
      {
        id: 'account',
        label: 'Configurações da Conta',
        icon: <FiSettings className="w-4 h-4" />,
        component: AccountSettingsSection,
      },
    ],
    []
  );

  // Navigation functions
  const goToPrevTab = useCallback(() => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  }, [activeTab, tabs]);

  const goToNextTab = useCallback(() => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  }, [activeTab, tabs]);

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            goToPrevTab();
            break;
          case 'ArrowRight':
            e.preventDefault();
            goToNextTab();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevTab, goToNextTab]);

  const activeTabData = tabs.find((tab) => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component;
  const currentTabIndex = tabs.findIndex((tab) => tab.id === activeTab);

  // Not authenticated
  if (!isAuthenticated || !user) {
    return <ProfileSkeleton />;
  }

  return (
    <>
      {hasOnboardingProgress() && !user.onboardingCompleted ? (
        <>
          <div className="text-center py-12">
            <div className="classical-card-2 p-8 max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-theme-primary mb-4">
                Acesso Restrito
              </h2>
              <p className="text-theme-secondary mb-6">
                Termine nosso onboarding para acessar esta pagina.
              </p>
              <button
                onClick={openOnboardingModal}
                className="btn-primary classical-card-simple px-3 py-2"
              >
                Abrir onboarding.
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="classical-card-2 p-4 sticky top-8">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                      w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200
                      ${
                        isActive
                          ? 'bg-brand-primary text-brand-primary shadow-sm'
                          : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary hover:bg-opacity-50'
                      }
                    `}
                    >
                      {tab.icon}
                      <span className="font-medium text-sm">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Mobile Navigation Arrows */}
              <div className="lg:hidden flex justify-between mt-4 pt-4 border-t border-theme-secondary">
                <button
                  onClick={goToPrevTab}
                  disabled={currentTabIndex === 0}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-theme-secondary hover:text-theme-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                <button
                  onClick={goToNextTab}
                  disabled={currentTabIndex === tabs.length - 1}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-theme-secondary hover:text-theme-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Próximo</span>
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="classical-card-2 p-6">
              {/* Mobile Tab Header */}
              <div className="lg:hidden mb-6 pb-6 border-b border-theme-secondary">
                <div className="flex items-center space-x-3">
                  {activeTabData?.icon}
                  <h2 className="text-xl font-semibold text-theme-primary">
                    {activeTabData?.label}
                  </h2>
                </div>
              </div>

              {/* Tab Content */}
              {ActiveComponent && (
                <ActiveComponent user={user} updateUser={updateUser} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
