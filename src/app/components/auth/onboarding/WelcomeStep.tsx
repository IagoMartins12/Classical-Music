// components/onboarding/WelcomeStep.tsx
'use client';

import React from 'react';
import { GiGrandPiano, GiMusicalNotes, GiViolin } from 'react-icons/gi';
import { FiHeart, FiBook, FiUsers } from 'react-icons/fi';
import { useTranslation } from '@/app/hooks/useTranslation';

const WelcomeStep: React.FC = () => {
  const { t } = useTranslation({ sections: ['components/onboarding'] });

  return (
    <div className="text-center py-8">
      <div className="mb-8">
        <div className="flex justify-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-brand-gradient rounded-full flex items-center justify-center ">
            <GiGrandPiano className="w-8 h-8 text-theme-primary" />
          </div>
          <div className="w-16 h-16 bg-accent-purple bg-opacity-20 rounded-full flex items-center justify-center shadow-theme-glow animate-glow">
            <GiViolin className="w-8 h-8 text-accent-purple" />
          </div>
          <div className="w-16 h-16 bg-accent-blue bg-opacity-20 rounded-full flex items-center justify-center">
            <GiMusicalNotes className="w-8 h-8 text-accent-blue" />
          </div>
        </div>

        <h3 className="text-3xl font-bold text-theme-primary classical-title mb-4">
          {t('welcome_step_title')}
        </h3>

        <p className="text-lg text-theme-secondary max-w-2xl mx-auto leading-relaxed">
          {t('welcome_step_subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="classical-card-2 p-6 text-center">
          <div className="w-12 h-12 bg-accent-green bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiBook className="w-6 h-6 text-accent-green" />
          </div>
          <h4 className="font-semibold text-theme-primary mb-2">
            {t('welcome_step_explore_title')}
          </h4>
          <p className="text-sm text-theme-secondary">
            {t('welcome_step_explore_description')}
          </p>
        </div>

        <div className="classical-card-2 p-6 text-center">
          <div className="w-12 h-12 bg-accent-purple bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiHeart className="w-6 h-6 text-accent-purple" />
          </div>
          <h4 className="font-semibold text-theme-primary mb-2">
            {t('welcome_step_personalize_title')}
          </h4>
          <p className="text-sm text-theme-secondary">
            {t('welcome_step_personalize_description')}
          </p>
        </div>

        <div className="classical-card-2 p-6 text-center">
          <div className="w-12 h-12 bg-accent-blue bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUsers className="w-6 h-6 text-accent-blue" />
          </div>
          <h4 className="font-semibold text-theme-primary mb-2">
            {t('welcome_step_connect_title')}
          </h4>
          <p className="text-sm text-theme-secondary">
            {t('welcome_step_connect_description')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeStep;
