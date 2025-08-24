// app/profile/components/MusicalPreferencesSection.tsx (versão atualizada)
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'next-auth';
import { FiEdit3, FiSave, FiX, FiClock, FiHeart } from 'react-icons/fi';

import { updateMusicalPreferences } from '@/app/actions/profile';
import { toast } from 'react-hot-toast';
import Button from '../../Common/Button';
import Select from '../../Common/Select';
import { getEpochs, getFamousComposers } from '@/app/actions/auth';
import { useAuth } from '@/app/hooks/useAuth';
import { useSessionUpdate } from '@/app/hooks/useSessionUpdate';
import { useTranslation } from '@/app/hooks/useTranslation';

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
  const { t } = useTranslation({ sections: ['pages/profile'] });
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
    });
  }, [user]);

  const loadOptions = async () => {
    setIsLoadingData(true);
    try {
      const [epochsData, composersData] = await Promise.all([
        getEpochs(),
        getFamousComposers(),
      ]);

      if (epochsData && composersData) {
        setComposers(composersData);
        setEpochs(epochsData);
      } else {
        toast.error('Erro ao carregar opções');
      }
    } catch (error) {
      console.error('Erro ao carregar opções:', error);
      toast.error('Erro ao carregar opções');
    } finally {
      setIsLoadingData(false);
    }
  };

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
        };

        await syncUserData(syncData);
        setIsEditing(false);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      toast.error('Erro ao atualizar preferências.');
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-theme-primary">
              {t('preferences_title')}
            </h3>
            <p className="text-sm text-theme-secondary">
              {t('preferences_loading')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-4 bg-theme-secondary rounded w-24 mb-2" />
              <div className="h-12 bg-theme-secondary rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-theme-primary">
            {t('preferences_title')}
          </h3>
          <p className="text-sm text-theme-secondary">
            {t('preferences_description')}
          </p>
        </div>

        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            leftIcon={<FiEdit3 />}
          >
            {t('preferences_edit')}
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              leftIcon={<FiX />}
              disabled={isLoading}
            >
              {t('preferences_cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={isLoading}
              leftIcon={<FiSave />}
            >
              {t('preferences_save')}
            </Button>
          </div>
        )}
      </div>

      {/* Experience Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <FiClock className="w-4 h-4 text-brand-primary" />
            <label className="text-sm font-medium text-theme-secondary">
              {t('preferences_experience_level')}
            </label>
          </div>

          <Select
            value={formData.experienceLevel}
            onChange={handleInputChange}
            name="experienceLevel"
            options={EXPERIENCE_LEVELS}
            disabled={!isEditing}
          />
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-3">
            <FiClock className="w-4 h-4 text-brand-primary" />
            <label className="text-sm font-medium text-theme-secondary">
              {t('preferences_practice_time')}
            </label>
          </div>

          <Select
            value={formData.practiceTimePerWeek.toString()}
            onChange={handleInputChange}
            name="practiceTimePerWeek"
            options={PRACTICE_TIME_OPTIONS}
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* Favorites */}
      <div className="pt-6 border-t border-theme-secondary">
        <div className="flex items-center space-x-2 mb-6">
          <FiHeart className="w-4 h-4 text-brand-primary" />
          <h4 className="font-medium text-theme-primary">
            {t('preferences_favorites')}
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-2">
              {t('preferences_favorite_composer')}
            </label>
            {!isEditing ? (
              <div className="input-classical bg-theme-secondary bg-opacity-50">
                {getComposerName(formData.favoriteComposerId)}
              </div>
            ) : (
              <Select
                value={formData.favoriteComposerId}
                onChange={handleInputChange}
                name="favoriteComposerId"
                options={[
                  { value: '', label: t('preferences_select_composer') },
                  ...composers.map((composer) => ({
                    value: composer.id,
                    label: composer.fullName,
                  })),
                ]}
                disabled={isLoadingData}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-2">
              {t('preferences_favorite_period')}
            </label>
            {!isEditing ? (
              <div className="input-classical bg-theme-secondary bg-opacity-50">
                {getEpochName(formData.favoriteEpochId)}
              </div>
            ) : (
              <Select
                value={formData.favoriteEpochId}
                onChange={handleInputChange}
                name="favoriteEpochId"
                options={[
                  { value: '', label: t('preferences_select_period') },
                  ...epochs.map((epoch) => ({
                    value: epoch.id,
                    label: epoch.name,
                  })),
                ]}
                disabled={isLoadingData}
              />
            )}
          </div>
        </div>
      </div>

      {/* Summary Card */}
      {formData.experienceLevel && formData.practiceTimePerWeek > 0 && (
        <div className="classical-card-2 p-4 bg-brand-primary bg-opacity-5 border border-brand-primary border-opacity-30">
          <h4 className="font-medium text-brand-primary mb-2">
            {t('preferences_profile_summary')}
          </h4>
          <div className="text-sm text-theme-secondary space-y-1">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicalPreferencesSection;
