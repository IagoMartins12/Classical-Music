// components/auth/onboarding/PreferencesStep.tsx
'use client';

import { useOnboardingModal } from '@/app/stores/authStore';
import React, { useState } from 'react';
import { FiSearch, FiHeart, FiClock } from 'react-icons/fi';
import Select from '../../Common/Select';
import Input from '../../Common/Inputs';

interface Composer {
  id: string;
  name: string;
  fullName: string;
  portraitUrl?: string | null;
  epochName?: string | null;
}

interface Epoch {
  id: string;
  name: string;
}

interface PreferencesStepProps {
  composers: Composer[];
  epochs: Epoch[];
}

const PRACTICE_TIME_OPTIONS = [
  { value: '0', label: 'Não pratico regularmente' },
  { value: '60', label: '1 hora por semana' },
  { value: '120', label: '2 horas por semana' },
  { value: '300', label: '5 horas por semana' },
  { value: '600', label: '10 horas por semana' },
  { value: '900', label: '15 horas por semana' },
  { value: '1200', label: '20+ horas por semana' },
];

const PreferencesStep: React.FC<PreferencesStepProps> = ({
  composers,
  epochs,
}) => {
  const { data, updateData } = useOnboardingModal();
  const [composerSearch, setComposerSearch] = useState('');

  const filteredComposers = composers.filter((composer) =>
    composer.fullName.toLowerCase().includes(composerSearch.toLowerCase())
  );

  const selectedComposer = composers.find(
    (c) => c.id === data.favoriteComposerId
  );
  const selectedEpoch = epochs.find((e) => e.id === data.favoriteEpochId);

  return (
    <div className="py-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-theme-primary classical-title mb-3">
          Suas preferências musicais
        </h3>
        <p className="text-theme-secondary max-w-lg mx-auto">
          Conte-nos sobre seus gostos e experiência para personalizar suas
          recomendações.
        </p>
      </div>

      <div className="space-y-8 max-w-2xl mx-auto">
        {/* Experience Level */}
        {/* <div>
          <label className="block text-sm font-medium text-theme-secondary mb-3">
            <FiClock className="w-4 h-4 inline mr-2" />
            Qual seu nível de experiência musical?
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() =>
                  updateData({ experienceLevel: level.value as any })
                }
                className={`
                  classical-card-2 p-4 text-center transition-all duration-200
                  ${
                    data.experienceLevel === level.value
                      ? 'border-brand-primary shadow-theme-glow'
                      : 'hover:border-brand-primary hover:scale-105'
                  }
                `}
              >
                <span className="text-sm font-medium text-theme-primary">
                  {level.label}
                </span>
              </button>
            ))}
          </div>
        </div> */}

        {/* Practice Time */}
        {data.userType !== 'CASUAL_USER' && (
          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-3">
              Quanto tempo você dedica à prática musical por semana?
            </label>

            <Select
              value={data.practiceTimePerWeek?.toString() || ''}
              onChange={(e) =>
                updateData({
                  practiceTimePerWeek: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              options={PRACTICE_TIME_OPTIONS}
              placeholder="Selecione..."
            />
          </div>
        )}

        {/* Favorite Epoch */}
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-3">
            <FiHeart className="w-4 h-4 inline mr-2" />
            Período musical favorito (opcional)
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {epochs.map((epoch) => (
              <button
                key={epoch.id}
                onClick={() =>
                  updateData({
                    favoriteEpochId:
                      data.favoriteEpochId === epoch.id ? undefined : epoch.id,
                  })
                }
                className={`
                  classical-card p-3 text-center transition-all border-2 duration-200
                  ${
                    data.favoriteEpochId === epoch.id
                      ? 'border-theme-accent  shadow-theme-glow'
                      : '!hover:border-brand-primary hover:scale-105'
                  }
                `}
              >
                <span className="text-sm font-medium text-theme-primary">
                  {epoch.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Favorite Composer */}
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-3">
            Compositor favorito (opcional)
          </label>

          <Input
            placeholder="Buscar compositor..."
            value={composerSearch}
            onChange={(e) => setComposerSearch(e.target.value)}
            leftIcon={<FiSearch className="w-4 h-4" />}
          />

          {selectedComposer && (
            <div className="my-4  classical-card p-3 rounded-lg border ">
              <div className="flex items-center space-x-3">
                {selectedComposer.portraitUrl && (
                  <img
                    src={selectedComposer.portraitUrl}
                    alt={selectedComposer.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-medium text-brand-primary">
                    {selectedComposer.fullName}
                  </p>
                  {selectedComposer.epochName && (
                    <p className="text-sm text-theme-tertiary">
                      {selectedComposer.epochName}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => updateData({ favoriteComposerId: undefined })}
                  className="ml-auto text-theme-tertiary hover:text-accent-red"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <div className="grid mt-4 grid-cols-1 sm:grid-cols-2 py-2 px-2 gap-3 max-h-60 overflow-y-auto overflow-x-hidden classical-scrollbar">
            {filteredComposers.map((composer) => (
              <button
                key={composer.id}
                onClick={() => updateData({ favoriteComposerId: composer.id })}
                className="classical-card-2 p-3 text-left transition-all duration-200 hover:border-brand-primary hover:scale-105"
              >
                <div className="flex items-center space-x-3">
                  {composer.portraitUrl && (
                    <img
                      src={composer.portraitUrl}
                      alt={composer.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-theme-primary">
                      {composer.fullName}
                    </p>
                    {composer.epochName && (
                      <p className="text-xs text-theme-tertiary">
                        {composer.epochName}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredComposers.length === 0 && composerSearch && (
            <div className="text-center py-6">
              <p className="text-theme-secondary">
                Nenhum compositor encontrado.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-theme-tertiary">
          Todas essas informações são opcionais e podem ser alteradas
          posteriormente.
        </p>
      </div>
    </div>
  );
};

export default PreferencesStep;
