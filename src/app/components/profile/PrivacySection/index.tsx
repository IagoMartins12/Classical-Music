// app/profile/components/PrivacySection.tsx (versão atualizada)
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'next-auth';
import { FiEye, FiEyeOff, FiMapPin, FiSave } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Button from '../../Common/Button';
import { updatePrivacySettings } from '@/app/actions/profile';
import { useAuth } from '@/app/hooks/useAuth';
import { useSessionUpdate } from '@/app/hooks/useSessionUpdate';
import { useTranslation } from '@/app/hooks/useTranslation';

interface PrivacySectionProps {
  user: User;
  updateUser: (data: Partial<User>) => void;
}

const PrivacySection: React.FC<PrivacySectionProps> = ({
  user,
  updateUser: localUpdateUser,
}) => {
  const { updateUser: globalUpdateUser } = useAuth();
  const { updateUserSession } = useSessionUpdate();
  const { t } = useTranslation({ sections: ['pages/profile'] });
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    profilePublic: user.profilePublic || true,
    showLocation: user.showLocation || false,
    showInstruments: true, // Exemplo adicional
    showActivity: true, // Exemplo adicional
  });

  // Atualizar settings quando user mudar
  useEffect(() => {
    setSettings({
      profilePublic: user.profilePublic || true,
      showLocation: user.showLocation || false,
      showInstruments: true,
      showActivity: true,
    });
  }, [user.profilePublic, user.showLocation]);

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
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
      const dataToSave = {
        profilePublic: settings.profilePublic,
        showLocation: settings.showLocation,
      };

      const result = await updatePrivacySettings(user.id, dataToSave);

      if (result.success) {
        await syncUserData(dataToSave);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Erro ao salvar configurações de privacidade:', error);
      toast.error('Erro ao atualizar configurações.');
    } finally {
      setIsLoading(false);
    }
  };

  const ToggleSwitch: React.FC<{
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
  }> = ({ checked, onChange, disabled = false }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${checked ? 'bg-brand-primary' : 'bg-theme-secondary'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-theme-primary">
            {t('privacy_title')}
          </h3>
          <p className="text-sm text-theme-secondary">
            {t('privacy_description')}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          isLoading={isLoading}
          leftIcon={<FiSave />}
        >
          {t('privacy_save')}
        </Button>
      </div>

      {/* Privacy Settings */}
      <div className="space-y-6">
        {/* Profile Visibility */}
        <div className="classical-card-2 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {settings.profilePublic ? (
                <FiEye className="w-5 h-5 text-brand-primary" />
              ) : (
                <FiEyeOff className="w-5 h-5 text-theme-tertiary" />
              )}
              <div>
                <h4 className="font-medium text-theme-primary">
                  {t('privacy_public_profile')}
                </h4>
                <p className="text-sm text-theme-secondary">
                  {t('privacy_public_profile_description')}
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={settings.profilePublic}
              onChange={() => handleToggle('profilePublic')}
            />
          </div>
        </div>

        {/* Location Visibility */}
        <div className="classical-card-2 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiMapPin className="w-5 h-5 text-brand-primary" />
              <div>
                <h4 className="font-medium text-theme-primary">
                  {t('privacy_show_location')}
                </h4>
                <p className="text-sm text-theme-secondary">
                  {t('privacy_show_location_description')}
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={settings.showLocation}
              onChange={() => handleToggle('showLocation')}
              disabled={!settings.profilePublic}
            />
          </div>

          {!settings.profilePublic && (
            <p className="text-xs text-theme-tertiary mt-2 ml-8">
              {t('privacy_public_only')}
            </p>
          )}
        </div>

        {/* Instruments Visibility */}
        <div className="classical-card-2 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiEye className="w-5 h-5 text-brand-primary" />
              <div>
                <h4 className="font-medium text-theme-primary">
                  {t('privacy_show_instruments')}
                </h4>
                <p className="text-sm text-theme-secondary">
                  {t('privacy_show_instruments_description')}
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={settings.showInstruments}
              onChange={() => handleToggle('showInstruments')}
              disabled={!settings.profilePublic}
            />
          </div>

          {!settings.profilePublic && (
            <p className="text-xs text-theme-tertiary mt-2 ml-8">
              {t('privacy_public_only')}
            </p>
          )}
        </div>

        {/* Activity Visibility */}
        <div className="classical-card-2 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiEye className="w-5 h-5 text-brand-primary" />
              <div>
                <h4 className="font-medium text-theme-primary">
                  {t('privacy_show_activity')}
                </h4>
                <p className="text-sm text-theme-secondary">
                  {t('privacy_show_activity_description')}
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={settings.showActivity}
              onChange={() => handleToggle('showActivity')}
              disabled={!settings.profilePublic}
            />
          </div>

          {!settings.profilePublic && (
            <p className="text-xs text-theme-tertiary mt-2 ml-8">
              {t('privacy_public_only')}
            </p>
          )}
        </div>
      </div>

      {/* Privacy Summary */}
      <div className="classical-card-2 p-4 bg-brand-primary bg-opacity-5 border border-brand-primary border-opacity-30">
        <h4 className="font-medium text-brand-primary mb-2">
          {t('privacy_summary')}
        </h4>
        <div className="text-sm text-theme-secondary space-y-1">
          <p>
            • <strong>{t('privacy_profile')}</strong>{' '}
            {settings.profilePublic
              ? t('privacy_public')
              : t('privacy_private')}
          </p>
          <p>
            • <strong>{t('privacy_location')}</strong>{' '}
            {settings.showLocation && settings.profilePublic
              ? t('privacy_visible')
              : t('privacy_hidden')}
          </p>
          <p>
            • <strong>{t('privacy_instruments')}</strong>{' '}
            {settings.showInstruments && settings.profilePublic
              ? t('privacy_visible')
              : t('privacy_hidden')}
          </p>
          <p>
            • <strong>{t('privacy_activity')}</strong>{' '}
            {settings.showActivity && settings.profilePublic
              ? t('privacy_visible')
              : t('privacy_hidden')}
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="classical-card-2 p-4 bg-theme-secondary bg-opacity-20">
        <h4 className="font-medium text-theme-primary mb-2">
          {t('privacy_security_info')}
        </h4>
        <ul className="text-sm text-theme-secondary space-y-1">
          <li>{t('privacy_email_never_shown')}</li>
          <li>{t('privacy_admin_only')}</li>
          <li>{t('privacy_can_change')}</li>
          <li>{t('privacy_study_data_private')}</li>
          <li>{t('privacy_auto_save')}</li>
        </ul>
      </div>
    </div>
  );
};

export default PrivacySection;
