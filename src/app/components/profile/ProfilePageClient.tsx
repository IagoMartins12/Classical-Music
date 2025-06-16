// app/profile/ProfilePageClient.tsx
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import {
  FiUser,
  FiMusic,
  FiHeart,
  FiShield,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

import { User } from 'next-auth';

// Import all profile sections
import PersonalInfoSection from './PersonalInfoSection';
import InstrumentsSection from './InstrumentsSection';
import MusicalPreferencesSection from './MusicalPreferencesSection';
import PrivacySection from './PrivacySection';
import AccountSettingsSection from './AccountSettingsSection';
import { useAuth } from '@/app/hooks/useAuth';

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
  const { user, isLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [localUser, setLocalUser] = useState<User | null>(null);

  // Update local user when auth user changes
  React.useEffect(() => {
    if (user) {
      setLocalUser(user);
    }
  }, [user]);

  // Optimized user update function
  const updateUser = useCallback((data: Partial<User>) => {
    setLocalUser((prev) => (prev ? { ...prev, ...data } : null));
  }, []);

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

  //   // Loading state
  //   if (isLoading) {
  //     return (
  //       <div className="flex items-center justify-center py-12">
  //         <LoadingSpinner size="lg" />
  //       </div>
  //     );
  //   }

  // Not authenticated
  if (!isAuthenticated || !localUser) {
    return (
      <div className="text-center py-12">
        <div className="classical-card-2 p-8 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-theme-primary mb-4">
            Acesso Restrito
          </h2>
          <p className="text-theme-secondary mb-6">
            Você precisa estar logado para acessar seu perfil.
          </p>
          <button
            onClick={() => (window.location.href = '/login')}
            className="btn-primary"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  const activeTabData = tabs.find((tab) => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component;
  const currentTabIndex = tabs.findIndex((tab) => tab.id === activeTab);

  return (
    <>
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
                          ? 'bg-brand-primary text-brand-primary  shadow-sm'
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
              <ActiveComponent user={localUser} updateUser={updateUser} />
            )}
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--theme-background)',
            color: 'var(--theme-primary)',
            border: '1px solid var(--theme-secondary)',
          },
        }}
      />
    </>
  );
}
