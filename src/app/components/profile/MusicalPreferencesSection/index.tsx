// app/profile/components/MusicalPreferencesSection.tsx (versão atualizada)
'use client';

import { Field } from '@/app/components/ui/Field';
import { PERFIL } from '@/app/conteudo/textos/perfil';
import { useTextos } from '@/app/hooks/useTextos';
import React, { useState, useEffect, useCallback } from 'react';
// Era `User` do NextAuth, aumentado em `types/next-auth.d.ts`. É o mesmo
// objeto que `useAuth()` entrega, e ele já tem tipo próprio no store.
import type { User } from '@/app/hooks/userStore';
import {
  PiClock,
  PiFloppyDisk,
  PiHeart,
  PiPencilLine,
  PiX,
} from 'react-icons/pi';

import { STUDY_HORIZONS, WELCOME } from '@/app/conteudo/site/welcome';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import type { StudyHorizon } from '@/app/libs/api/profile';
import { updateMusicalPreferences } from '@/app/actions/profile';
import { toast } from 'react-hot-toast';
import { Button } from '@/app/components/ui/Button';
import { legacyCatalog } from '@/app/libs/api/compat';
import { useAuth } from '@/app/hooks/useAuth';
import { useSessionUpdate } from '@/app/hooks/useSessionUpdate';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';
import { porIdioma } from '@/app/utils/porIdioma';

interface MusicalPreferencesSectionProps {
  user: User;
  updateUser: (data: Partial<User>) => void;
}

const MusicalPreferencesSection: React.FC<MusicalPreferencesSectionProps> = ({
  user,
  updateUser: localUpdateUser,
}) => {
  const { updateUser: globalUpdateUser } = useAuth();
  const { updateUserSession } = useSessionUpdate();
  const { t } = useTextos(PERFIL);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [composers, setComposers] = useState<any[]>([]);
  const [epochs, setEpochs] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    favoriteComposerId: user.favoriteComposerId || '',
    favoriteEpochId: user.favoriteEpochId || '',
    experienceLevel: (user.experienceLevel || '') as
      | 'BEGINNER'
      | 'INTERMEDIATE'
      | 'ADVANCED'
      | '',
    practiceTimePerWeek: user.practiceTimePerWeek || 0,
    studyHorizon: (user.studyHorizon || '') as StudyHorizon | '',
  });

  const EXPERIENCE_LEVELS = [
    { value: '', label: t('preferences_select_experience') },
    { value: 'BEGINNER', label: t('instruments_level_beginner') },
    { value: 'INTERMEDIATE', label: t('instruments_level_intermediate') },
    { value: 'ADVANCED', label: t('instruments_level_advanced') },
  ];

  const PRACTICE_TIME_OPTIONS = [
    { value: '0', label: t('preferences_no_practice') },
    { value: '60', label: t('preferences_1_hour') },
    { value: '120', label: t('preferences_2_hours') },
    { value: '300', label: t('preferences_5_hours') },
    { value: '600', label: t('preferences_10_hours') },
    { value: '900', label: t('preferences_15_hours') },
    { value: '1200', label: t('preferences_20_plus_hours') },
  ];

  useEffect(() => {
    loadOptions();
  }, []);

  // Atualizar formData quando user mudar
  useEffect(() => {
    setFormData({
      favoriteComposerId: user.favoriteComposerId || '',
      favoriteEpochId: user.favoriteEpochId || '',
      experienceLevel: (user.experienceLevel || '') as
        | 'BEGINNER'
        | 'INTERMEDIATE'
        | 'ADVANCED'
        | '',
      practiceTimePerWeek: user.practiceTimePerWeek || 0,
      studyHorizon: (user.studyHorizon || '') as StudyHorizon | '',
    });
  }, [user]);

  const loadOptions = async () => {
    setIsLoadingData(true);
    try {
      const { composers: composersData, epochs: epochsData } =
        await legacyCatalog.musicalOptions();

      setComposers(composersData);
      setEpochs(epochsData);
    } catch (error) {
      console.error('Erro ao carregar opções:', error);
      toast.error(
        porIdioma(
          'Não foi possível carregar as opções',
          'Could not load the options'
        )
      );
    } finally {
      setIsLoadingData(false);
    }
  };

  const horizonCopy = WELCOME[useRouteLanguage().language].study;
  const HORIZON_OPTIONS = [
    { value: '', label: t('preferences_not_selected') },
    ...STUDY_HORIZONS.map((h) => ({
      value: h,
      label: horizonCopy.horizons[h],
    })),
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'practiceTimePerWeek' ? parseInt(value) : value,
    }));
  };

  // Função para sincronizar todos os estados após update
  const syncUserData = useCallback(
    async (data: Partial<User>) => {
      // 1. Atualizar stores locais
      localUpdateUser(data);
      globalUpdateUser(data);

      // 2. Forçar refresh da sessão NextAuth
      await updateUserSession();
    },
    [localUpdateUser, globalUpdateUser, updateUserSession]
  );

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Preparar dados com tipagem correta
      const dataToSave = {
        favoriteComposerId: formData.favoriteComposerId || undefined,
        favoriteEpochId: formData.favoriteEpochId || undefined,
        experienceLevel: formData.experienceLevel as
          | 'BEGINNER'
          | 'INTERMEDIATE'
          | 'ADVANCED'
          | undefined,
        practiceTimePerWeek: formData.practiceTimePerWeek,
        studyHorizon: formData.studyHorizon || null,
      };

      const result = await updateMusicalPreferences(user.id, dataToSave);

      if (result.success) {
        // Preparar dados para sincronização local com tipagem correta
        const syncData: Partial<User> = {
          favoriteComposerId: formData.favoriteComposerId || null,
          favoriteEpochId: formData.favoriteEpochId || null,
          experienceLevel: (formData.experienceLevel || null) as
            | 'BEGINNER'
            | 'INTERMEDIATE'
            | 'ADVANCED'
            | null,
          practiceTimePerWeek: formData.practiceTimePerWeek,
          studyHorizon: formData.studyHorizon || null,
        };

        await syncUserData(syncData);
        setIsEditing(false);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      toast.error(porIdioma('Não foi possível salvar.', 'Could not save.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      favoriteComposerId: user.favoriteComposerId || '',
      favoriteEpochId: user.favoriteEpochId || '',
      experienceLevel: (user.experienceLevel || '') as
        | 'BEGINNER'
        | 'INTERMEDIATE'
        | 'ADVANCED'
        | '',
      practiceTimePerWeek: user.practiceTimePerWeek || 0,
      studyHorizon: (user.studyHorizon || '') as StudyHorizon | '',
    });
    setIsEditing(false);
  };

  const getComposerName = (id: string) => {
    if (!id) return t('preferences_not_selected');
    const composer = composers.find((c) => c.id === id);
    return composer ? composer.fullName : t('preferences_composer_not_found');
  };

  const getEpochName = (id: string) => {
    if (!id) return t('preferences_not_selected');
    const epoch = epochs.find((e) => e.id === id);
    return epoch ? epoch.name : t('preferences_period_not_found');
  };

  // Loading inicial
  if (isLoadingData) {
    return (
      <Stack gap={6}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-texto">
              {t('preferences_title')}
            </h3>
            <Text papel="rotulo" tom="suave" as="p">
              {t('preferences_loading')}
            </Text>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, index) => (
            <Stack gap={2} key={index} className="animate-pulse">
              <div className="h-4 bg-sup-2 rounded w-24" />
              <div className="h-12 bg-sup-2 rounded" />
            </Stack>
          ))}
        </div>
      </Stack>
    );
  }

  return (
    <Stack gap={6}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-texto">
            {t('preferences_title')}
          </h3>
          <Text papel="rotulo" tom="suave" as="p">
            {t('preferences_description')}
          </Text>
        </div>

        {!isEditing ? (
          <Button
            variante="secundario"
            tamanho="p"
            onClick={() => setIsEditing(true)}
            icone={PiPencilLine}
          >
            {t('preferences_edit')}
          </Button>
        ) : (
          <div className="flex flex-col md-flex-row gap-2 ">
            <Button
              variante="secundario"
              tamanho="p"
              onClick={handleCancel}
              icone={PiX}
              disabled={isLoading}
            >
              {t('preferences_cancel')}
            </Button>
            <Button
              variante="primario"
              tamanho="p"
              onClick={handleSave}
              carregando={isLoading}
              icone={PiFloppyDisk}
            >
              {t('preferences_save')}
            </Button>
          </div>
        )}
      </div>

      {/* Experience Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Stack gap={3}>
          <Inline gap={2}>
            <PiClock className="w-4 h-4 text-ouro-texto" />
            <span className="text-sm font-medium text-texto-suave">
              {t('preferences_experience_level')}
            </span>
          </Inline>

          <Field.Selecao
            label={t('preferences_experience_level')}
            rotuloOculto
            value={formData.experienceLevel}
            onChange={handleInputChange}
            name="experienceLevel"
            disabled={!isEditing}
          >
            {EXPERIENCE_LEVELS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Field.Selecao>
        </Stack>

        <Stack gap={3}>
          <Inline gap={2}>
            <PiClock className="w-4 h-4 text-ouro-texto" />
            <span className="text-sm font-medium text-texto-suave">
              {t('preferences_practice_time')}
            </span>
          </Inline>

          <Field.Selecao
            label={t('preferences_practice_time')}
            rotuloOculto
            value={formData.practiceTimePerWeek.toString()}
            onChange={handleInputChange}
            name="practiceTimePerWeek"
            disabled={!isEditing}
          >
            {PRACTICE_TIME_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Field.Selecao>
        </Stack>

        {user.userType === 'MUSIC_STUDENT' && (
          <Stack gap={3}>
            <span className="text-sm font-medium text-texto-suave">
              {horizonCopy.horizon}
            </span>
            <Field.Selecao
              label={horizonCopy.horizon}
              rotuloOculto
              value={formData.studyHorizon}
              onChange={handleInputChange}
              name="studyHorizon"
              disabled={!isEditing}
            >
              {HORIZON_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Field.Selecao>
          </Stack>
        )}
      </div>

      {/* Favorites */}
      <Stack gap={6} className="pt-6 border-t border-linha">
        <Inline gap={2}>
          <PiHeart className="w-4 h-4 text-ouro-texto" />
          <h4 className="font-medium text-texto">
            {t('preferences_favorites')}
          </h4>
        </Inline>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span className="block text-sm font-medium text-texto-suave mb-2">
              {t('preferences_favorite_composer')}
            </span>
            {!isEditing ? (
              <div className="input-classical bg-sup-2">
                {getComposerName(formData.favoriteComposerId)}
              </div>
            ) : (
              <Field.Selecao
                label={t('preferences_favorite_composer')}
                rotuloOculto
                value={formData.favoriteComposerId}
                onChange={handleInputChange}
                name="favoriteComposerId"
                disabled={isLoadingData}
              >
                {[
                  { value: '', label: t('preferences_select_composer') },
                  ...composers.map((composer) => ({
                    value: composer.id,
                    label: composer.fullName,
                  })),
                ].map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Field.Selecao>
            )}
          </div>

          <div>
            <span className="block text-sm font-medium text-texto-suave mb-2">
              {t('preferences_favorite_period')}
            </span>
            {!isEditing ? (
              <div className="input-classical bg-sup-2">
                {getEpochName(formData.favoriteEpochId)}
              </div>
            ) : (
              <Field.Selecao
                label={t('preferences_favorite_period')}
                rotuloOculto
                value={formData.favoriteEpochId}
                onChange={handleInputChange}
                name="favoriteEpochId"
                disabled={isLoadingData}
              >
                {[
                  { value: '', label: t('preferences_select_period') },
                  ...epochs.map((epoch) => ({
                    value: epoch.id,
                    label: epoch.name,
                  })),
                ].map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Field.Selecao>
            )}
          </div>
        </div>
      </Stack>

      {/* Summary Card */}
      {formData.experienceLevel && formData.practiceTimePerWeek > 0 && (
        <Card nivel={2} densidade="compacta" className="">
          <h4 className="font-medium text-ouro-texto mb-2">
            {t('preferences_profile_summary')}
          </h4>
          <Text papel="rotulo" tom="suave" as="div" className="space-y-1">
            <p>
              • <strong>{t('preferences_level')}</strong>{' '}
              {
                EXPERIENCE_LEVELS.find(
                  (l) => l.value === formData.experienceLevel
                )?.label
              }
            </p>
            <p>
              • <strong>{t('preferences_practice')}</strong>{' '}
              {
                PRACTICE_TIME_OPTIONS.find(
                  (p) => p.value === formData.practiceTimePerWeek.toString()
                )?.label
              }
            </p>
            {formData.favoriteComposerId && (
              <p>
                • <strong>{t('preferences_favorite_composer_summary')}</strong>{' '}
                {getComposerName(formData.favoriteComposerId)}
              </p>
            )}
            {formData.favoriteEpochId && (
              <p>
                • <strong>{t('preferences_favorite_period_summary')}</strong>{' '}
                {getEpochName(formData.favoriteEpochId)}
              </p>
            )}
          </Text>
        </Card>
      )}
    </Stack>
  );
};

export default MusicalPreferencesSection;
