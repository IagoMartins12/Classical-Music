// app/profile/components/PrivacySection.tsx (versão atualizada)
'use client';

import { PERFIL } from '@/app/conteudo/textos/perfil';
import { useTextos } from '@/app/hooks/useTextos';
import React, { useState, useEffect, useCallback } from 'react';
// Era `User` do NextAuth, aumentado em `types/next-auth.d.ts`. É o mesmo
// objeto que `useAuth()` entrega, e ele já tem tipo próprio no store.
import type { User } from '@/app/hooks/userStore';
import { PiEye, PiEyeSlash, PiFloppyDisk, PiMapPin } from 'react-icons/pi';
import { toast } from 'react-hot-toast';
import { Button } from '@/app/components/ui/Button';
import { updatePrivacySettings } from '@/app/actions/profile';
import { useAuth } from '@/app/hooks/useAuth';
import { useSessionUpdate } from '@/app/hooks/useSessionUpdate';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';
import { porIdioma } from '@/app/utils/porIdioma';

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
  const { t } = useTextos(PERFIL);
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
      toast.error(porIdioma('Não foi possível salvar.', 'Could not save.'));
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
        ${checked ? '' : 'bg-sup-2'}
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
    <Stack gap={6}>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 sm:flex-nowrap [&>*:not(:first-child)]:shrink-0">
        <div className="min-w-0 flex-1 basis-48">
          <h3 className="font-display text-[1.5rem] leading-tight text-texto">
            {t('privacy_title')}
          </h3>
          <Text papel="rotulo" tom="suave" as="p">
            {t('privacy_description')}
          </Text>
        </div>

        <Button
          variante="primario"
          tamanho="p"
          onClick={handleSave}
          carregando={isLoading}
          icone={PiFloppyDisk}
        >
          {t('privacy_save')}
        </Button>
      </div>

      {/* Privacy Settings */}
      <Stack gap={6}>
        {/* Profile Visibility */}
        <Card nivel={2} densidade="compacta">
          <div className="flex items-center justify-between">
            <Inline gap={3}>
              {settings.profilePublic ? (
                <PiEye className="w-5 h-5 text-ouro-texto" />
              ) : (
                <PiEyeSlash className="w-5 h-5 text-texto-fraco" />
              )}
              <div>
                <h4 className="font-medium text-texto">
                  {t('privacy_public_profile')}
                </h4>
                <Text papel="rotulo" tom="suave" as="p">
                  {t('privacy_public_profile_description')}
                </Text>
              </div>
            </Inline>

            <ToggleSwitch
              checked={settings.profilePublic}
              onChange={() => handleToggle('profilePublic')}
            />
          </div>
        </Card>

        {/* Location Visibility */}
        <Card nivel={2} densidade="compacta">
          <div className="flex items-center justify-between">
            <Inline gap={3}>
              <PiMapPin className="w-5 h-5 text-ouro-texto" />
              <div>
                <h4 className="font-medium text-texto">
                  {t('privacy_show_location')}
                </h4>
                <Text papel="rotulo" tom="suave" as="p">
                  {t('privacy_show_location_description')}
                </Text>
              </div>
            </Inline>

            <ToggleSwitch
              checked={settings.showLocation}
              onChange={() => handleToggle('showLocation')}
              disabled={!settings.profilePublic}
            />
          </div>

          {!settings.profilePublic && (
            <Text papel="legenda" tom="fraco" as="p" className="mt-2 ml-8">
              {t('privacy_public_only')}
            </Text>
          )}
        </Card>

        {/* Instruments Visibility */}
        <Card nivel={2} densidade="compacta">
          <div className="flex items-center justify-between">
            <Inline gap={3}>
              <PiEye className="w-5 h-5 text-ouro-texto" />
              <div>
                <h4 className="font-medium text-texto">
                  {t('privacy_show_instruments')}
                </h4>
                <Text papel="rotulo" tom="suave" as="p">
                  {t('privacy_show_instruments_description')}
                </Text>
              </div>
            </Inline>

            <ToggleSwitch
              checked={settings.showInstruments}
              onChange={() => handleToggle('showInstruments')}
              disabled={!settings.profilePublic}
            />
          </div>

          {!settings.profilePublic && (
            <Text papel="legenda" tom="fraco" as="p" className="mt-2 ml-8">
              {t('privacy_public_only')}
            </Text>
          )}
        </Card>

        {/* Activity Visibility */}
        <Card nivel={2} densidade="compacta">
          <div className="flex items-center justify-between">
            <Inline gap={3}>
              <PiEye className="w-5 h-5 text-ouro-texto" />
              <div>
                <h4 className="font-medium text-texto">
                  {t('privacy_show_activity')}
                </h4>
                <Text papel="rotulo" tom="suave" as="p">
                  {t('privacy_show_activity_description')}
                </Text>
              </div>
            </Inline>

            <ToggleSwitch
              checked={settings.showActivity}
              onChange={() => handleToggle('showActivity')}
              disabled={!settings.profilePublic}
            />
          </div>

          {!settings.profilePublic && (
            <Text papel="legenda" tom="fraco" as="p" className="mt-2 ml-8">
              {t('privacy_public_only')}
            </Text>
          )}
        </Card>
      </Stack>

      {/* Privacy Summary */}
      <Card nivel={2} densidade="compacta" className="">
        <h4 className="font-medium text-ouro-texto mb-2">
          {t('privacy_summary')}
        </h4>
        <Text papel="rotulo" tom="suave" as="div" className="space-y-1">
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
        </Text>
      </Card>

      {/* Info Box */}
      <Card nivel={2} densidade="compacta" className="bg-sup-2">
        <h4 className="font-medium text-texto mb-2">
          {t('privacy_security_info')}
        </h4>
        <Stack gap={1} as="ul" className="text-sm text-texto-suave">
          <li>{t('privacy_email_never_shown')}</li>
          <li>{t('privacy_can_change')}</li>
          <li>{t('privacy_study_data_private')}</li>
          <li>{t('privacy_auto_save')}</li>
        </Stack>
      </Card>
    </Stack>
  );
};

export default PrivacySection;
