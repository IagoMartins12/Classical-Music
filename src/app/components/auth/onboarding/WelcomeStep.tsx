// components/onboarding/WelcomeStep.tsx
'use client';

import React from 'react';
import { GiGrandPiano, GiViolin } from 'react-icons/gi';
import { PiBook, PiHeart, PiMusicNotes, PiUsers } from 'react-icons/pi';
import { useTranslation } from '@/app/context/TranslationContext';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

const WelcomeStep: React.FC = () => {
  const { t } = useTranslation({ sections: ['components/onboarding'] });

  return (
    <div className="text-center py-8">
      <div className="mb-8">
        <div className="flex justify-center space-x-4 mb-6">
          <div className="w-16 h-16 fill-ouro rounded-full flex items-center justify-center ">
            <GiGrandPiano className="w-8 h-8 text-theme-primary" />
          </div>
          <div className="w-16 h-16 bg-ouro/20 rounded-full flex items-center justify-center shadow-theme-glow animate-glow">
            <GiViolin className="w-8 h-8 text-ouro-texto" />
          </div>
          <div className="w-16 h-16 bg-aviso/20 rounded-full flex items-center justify-center">
            <PiMusicNotes className="w-8 h-8 text-aviso" />
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
        <Card nivel={2} className="text-center">
          <div className="w-12 h-12 bg-ok/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <PiBook className="w-6 h-6 text-ok" />
          </div>
          <h4 className="font-semibold text-theme-primary mb-2">
            {t('welcome_step_explore_title')}
          </h4>
          <Text papel="rotulo" tom="suave" as="p">
            {t('welcome_step_explore_description')}
          </Text>
        </Card>

        <Card nivel={2} className="text-center">
          <div className="w-12 h-12 bg-ouro/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <PiHeart className="w-6 h-6 text-ouro-texto" />
          </div>
          <h4 className="font-semibold text-theme-primary mb-2">
            {t('welcome_step_personalize_title')}
          </h4>
          <Text papel="rotulo" tom="suave" as="p">
            {t('welcome_step_personalize_description')}
          </Text>
        </Card>

        <Card nivel={2} className="text-center">
          <div className="w-12 h-12 bg-aviso/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <PiUsers className="w-6 h-6 text-aviso" />
          </div>
          <h4 className="font-semibold text-theme-primary mb-2">
            {t('welcome_step_connect_title')}
          </h4>
          <Text papel="rotulo" tom="suave" as="p">
            {t('welcome_step_connect_description')}
          </Text>
        </Card>
      </div>
    </div>
  );
};

export default WelcomeStep;
