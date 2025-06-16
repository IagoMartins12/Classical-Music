// app/profile/components/PrivacySection.tsx
'use client';

import React, { useState } from 'react';
import { User } from 'next-auth';
import { FiEye, FiEyeOff, FiMapPin, FiSave } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Button from '../../Common/Button';

interface PrivacySectionProps {
  user: User;
  updateUser: (data: Partial<User>) => void;
}

const PrivacySection: React.FC<PrivacySectionProps> = ({
  user,
  updateUser,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    profilePublic: user.profilePublic || true,
    showLocation: user.showLocation || false,
    showInstruments: true, // Exemplo adicional
    showActivity: true, // Exemplo adicional
  });

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Aqui você salvaria as configurações de privacidade
      updateUser({
        profilePublic: settings.profilePublic,
        showLocation: settings.showLocation,
      });

      toast.success('Configurações de privacidade atualizadas!');
    } catch (error) {
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
            Configurações de Privacidade
          </h3>
          <p className="text-sm text-theme-secondary">
            Controle quem pode ver suas informações
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          isLoading={isLoading}
          leftIcon={<FiSave />}
        >
          Salvar
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
                  Perfil Público
                </h4>
                <p className="text-sm text-theme-secondary">
                  Permite que outros usuários vejam seu perfil básico
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
                  Mostrar Localização
                </h4>
                <p className="text-sm text-theme-secondary">
                  Exibe sua cidade/país no perfil público
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
              Disponível apenas com perfil público ativo
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
                  Mostrar Instrumentos
                </h4>
                <p className="text-sm text-theme-secondary">
                  Exibe os instrumentos que você toca no perfil
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={settings.showInstruments}
              onChange={() => handleToggle('showInstruments')}
              disabled={!settings.profilePublic}
            />
          </div>
        </div>

        {/* Activity Visibility */}
        <div className="classical-card-2 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiEye className="w-5 h-5 text-brand-primary" />
              <div>
                <h4 className="font-medium text-theme-primary">
                  Mostrar Atividade
                </h4>
                <p className="text-sm text-theme-secondary">
                  Mostra suas obras favoritas e progresso de estudos
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={settings.showActivity}
              onChange={() => handleToggle('showActivity')}
              disabled={!settings.profilePublic}
            />
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="classical-card-2 p-4 bg-brand-primary bg-opacity-5 border border-brand-primary border-opacity-30">
        <h4 className="font-medium text-brand-primary mb-2">
          📋 Sobre a Privacidade
        </h4>
        <ul className="text-sm text-theme-secondary space-y-1">
          <li>• Seu email nunca é mostrado publicamente</li>
          <li>• Apenas administradores podem ver informações privadas</li>
          <li>• Você pode alterar essas configurações a qualquer momento</li>
          <li>• Dados de estudo são sempre privados por padrão</li>
        </ul>
      </div>
    </div>
  );
};

export default PrivacySection;
