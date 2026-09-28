'use client';
// components/onboarding/PreferencesStep.tsx

import { NomeAcao } from '@/app/components/ui/NomeAcao';
import { useOnboardingModal } from '@/app/stores/authStore';
import React, { useState, useEffect, useId } from 'react';
import { PiHeart, PiMagnifyingGlass, PiSpinnerGap, PiX } from 'react-icons/pi';
import Image from '@/app/components/SmartImage';
import { useTranslation } from '@/app/context/TranslationContext';
import Select from '../../Common/Select';
import { translateEpochWithHook } from '@/app/utils/translations/epochTranslationComposer';
import Input from '../../Common/Inputs';
import { findComposers } from '@/app/requests/catalog-search';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

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

const PreferencesStep: React.FC<PreferencesStepProps> = ({
  composers: initialComposers,
  epochs,
}) => {
  const idCampo = useId();
  const { data, updateData } = useOnboardingModal();
  const { t } = useTranslation({ sections: ['components/onboarding'] });
  const [composerSearch, setComposerSearch] = useState('');
  const [searchedComposers, setSearchedComposers] = useState<Composer[]>([]);
  const [isSearchingComposers, setIsSearchingComposers] = useState(false);
  const [hasSearchedApi, setHasSearchedApi] = useState(false);

  const PRACTICE_TIME_OPTIONS = [
    { value: '0', label: t('preferences_step_practice_none') },
    { value: '60', label: t('preferences_step_practice_1h') },
    { value: '120', label: t('preferences_step_practice_2h') },
    { value: '300', label: t('preferences_step_practice_5h') },
    { value: '600', label: t('preferences_step_practice_10h') },
    { value: '900', label: t('preferences_step_practice_15h') },
    { value: '1200', label: t('preferences_step_practice_20h') },
  ];

  // Combinar compositores iniciais com os buscados na API
  const allComposers = [...initialComposers, ...searchedComposers];

  const filteredComposers = allComposers.filter((composer) =>
    composer.fullName.toLowerCase().includes(composerSearch.toLowerCase())
  );

  const selectedComposer = allComposers.find(
    (c) => c.id === data.favoriteComposerId
  );

  // Buscar compositores na API quando não há resultados locais
  useEffect(() => {
    const searchApiComposers = async () => {
      if (!composerSearch.trim() || composerSearch.length < 3) {
        setSearchedComposers([]);
        setHasSearchedApi(false);
        return;
      }

      // Se já há resultados locais, não buscar na API
      if (filteredComposers.length > 0) {
        setHasSearchedApi(false);
        return;
      }

      // Se já buscou na API para este termo, não buscar novamente
      if (hasSearchedApi) return;

      setIsSearchingComposers(true);

      try {
        console.log('🔍 Buscando compositores na API para:', composerSearch);

        const apiComposers = (await findComposers(composerSearch, 20)).map(
          (composer) => ({
            ...composer,
            fullName: composer.fullName ?? composer.name,
          })
        );
        console.log('✅ Compositores encontrados na API:', apiComposers.length);

        // Filtrar compositores que já não estão na lista inicial
        const newComposers = apiComposers.filter(
          (apiComposer) =>
            !initialComposers.some((initial) => initial.id === apiComposer.id)
        );
        setSearchedComposers(newComposers);
        setHasSearchedApi(true);
      } catch (error) {
        console.error('❌ Erro ao buscar compositores na API:', error);
      } finally {
        setIsSearchingComposers(false);
      }
    };

    // Debounce da busca
    const timeoutId = setTimeout(searchApiComposers, 500);
    return () => clearTimeout(timeoutId);
  }, [
    composerSearch,
    filteredComposers.length,
    hasSearchedApi,
    initialComposers,
  ]);

  // Reset da busca quando o termo muda
  useEffect(() => {
    setHasSearchedApi(false);
  }, [composerSearch]);

  return (
    <div className="py-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-theme-primary classical-title mb-3">
          {t('preferences_step_title')}
        </h3>
        <p className="text-theme-secondary max-w-lg mx-auto">
          {t('preferences_step_subtitle')}
        </p>
      </div>

      <Stack gap={8} className="max-w-2xl mx-auto">
        {/* Practice Time */}
        {data.userType !== 'CASUAL_USER' && (
          <Stack gap={3}>
            <label
              htmlFor={`${idCampo}-1`}
              className="block text-sm font-medium text-theme-secondary"
            >
              {t('preferences_step_practice_time')}
            </label>

            <Select
              id={`${idCampo}-1`}
              value={data.practiceTimePerWeek?.toString() || ''}
              onChange={(e) =>
                updateData({
                  practiceTimePerWeek: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              options={PRACTICE_TIME_OPTIONS}
              placeholder={t('preferences_step_practice_select')}
            />
          </Stack>
        )}

        {/* Favorite Epoch */}
        <Stack gap={3}>
          <span
            id={`${idCampo}-2`}
            className="block text-sm font-medium text-theme-secondary"
          >
            <PiHeart className="w-4 h-4 inline mr-2" />
            {t('preferences_step_favorite_epoch')}
          </span>

          <div
            role="group"
            aria-labelledby={`${idCampo}-2`}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
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
                      : 'hover:scale-105'
                  }
                `}
              >
                <Text papel="rotulo" tom="forte" className="font-medium">
                  {translateEpochWithHook(epoch.name, t)}
                </Text>
              </button>
            ))}
          </div>
        </Stack>

        {/* Favorite Composer */}
        <div>
          <label
            htmlFor={`${idCampo}-3`}
            className="block text-sm font-medium text-theme-secondary mb-3"
          >
            {t('preferences_step_favorite_composer')}
          </label>

          <div className="relative">
            <Input
              id={`${idCampo}-3`}
              placeholder={t('preferences_step_search_composer')}
              value={composerSearch}
              onChange={(e) => setComposerSearch(e.target.value)}
              leftIcon={<PiMagnifyingGlass className="w-4 h-4" />}
              rightIcon={
                isSearchingComposers ? (
                  <PiSpinnerGap className="w-4 h-4 animate-spin text-theme-tertiary" />
                ) : undefined
              }
            />
          </div>

          {selectedComposer && (
            <div className="my-4 classical-card p-3 rounded-lg ">
              <Inline gap={3}>
                {selectedComposer.portraitUrl && (
                  <Image
                    width={24}
                    height={24}
                    src={selectedComposer.portraitUrl}
                    alt={selectedComposer.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-medium text-ouro-texto">
                    {selectedComposer.fullName}
                  </p>
                  {selectedComposer.epochName && (
                    <Text papel="rotulo" tom="fraco" as="p">
                      {translateEpochWithHook(selectedComposer.epochName, t)}
                    </Text>
                  )}
                </div>
                <button
                  onClick={() => updateData({ favoriteComposerId: undefined })}
                  className="ml-auto text-theme-tertiary"
                >
                  <PiX aria-hidden className="h-4 w-4" />
                  <NomeAcao acao="limpar" />
                </button>
              </Inline>
            </div>
          )}

          <div className="grid mt-4 grid-cols-1 sm:grid-cols-2 py-2 px-2 gap-3 max-h-60 overflow-y-auto overflow-x-hidden classical-scrollbar">
            {filteredComposers.map((composer) => (
              <button
                key={composer.id}
                onClick={() => updateData({ favoriteComposerId: composer.id })}
                className="classical-card-2 p-3 text-left transition-all duration-200 hover:scale-105"
              >
                <Inline gap={3}>
                  {composer.portraitUrl && (
                    <Image
                      width={24}
                      height={24}
                      src={composer.portraitUrl}
                      alt={composer.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <Text
                      papel="rotulo"
                      tom="forte"
                      as="p"
                      className="font-medium"
                    >
                      {composer.fullName}
                    </Text>
                    {composer.epochName && (
                      <Text papel="legenda" tom="fraco" as="p">
                        {translateEpochWithHook(composer.epochName, t)}
                      </Text>
                    )}
                  </div>
                </Inline>
              </button>
            ))}
          </div>

          {/* Estado de carregamento */}
          {isSearchingComposers && (
            <div className="text-center py-4">
              <Inline gap={2} className="justify-center">
                <PiSpinnerGap className="w-4 h-4 animate-spin text-theme-tertiary" />
                <Text papel="rotulo" tom="fraco">
                  {t('preferences_step_searching_composers')}
                </Text>
              </Inline>
            </div>
          )}

          {/* Nenhum compositor encontrado */}
          {filteredComposers.length === 0 &&
            composerSearch &&
            !isSearchingComposers &&
            hasSearchedApi && (
              <div className="text-center py-6">
                <p className="text-theme-secondary">
                  {t('preferences_step_no_composer_found')}
                </p>
              </div>
            )}

          {/* Indicador de resultados da API */}
          {searchedComposers.length > 0 && (
            <Text papel="legenda" tom="fraco" as="div" className="mt-2">
              {t('preferences_step_api_results_hint')}
            </Text>
          )}
        </div>
      </Stack>

      <div className="mt-8 text-center">
        <Text papel="rotulo" tom="fraco" as="p">
          {t('preferences_step_footer')}
        </Text>
      </div>
    </div>
  );
};

export default PreferencesStep;
