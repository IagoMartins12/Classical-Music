// components/auth/onboarding/ProfileStep.tsx (versão atualizada)
'use client';

import { useOnboardingModal } from '@/app/stores/authStore';
import React from 'react';
import { FiMapPin } from 'react-icons/fi';
import Input from '../../Common/Inputs';
import ProfileImageUpload from '../../ProfileImageUpload';

const ProfileStep: React.FC = () => {
  const { data, updateData } = useOnboardingModal();

  const handleImageChange = (imageUrl: string | null) => {
    updateData({ image: imageUrl || undefined });
  };

  const getUserDisplayName = () => {
    // Tentar obter o nome dos dados do onboarding ou criar um nome genérico
    const firstName = data.location?.city || 'Usuário';
    return firstName;
  };

  return (
    <div className="py-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-theme-primary classical-title mb-3">
          Finalize seu perfil
        </h3>
        <p className="text-theme-secondary max-w-lg mx-auto">
          Adicione uma foto e informações pessoais para completar seu perfil.
          Tudo é opcional e você pode configurar depois.
        </p>
      </div>

      <div className="max-w-lg mx-auto space-y-8">
        {/* Profile Picture */}
        <div className="text-center">
          <label className="block text-sm font-medium text-theme-secondary mb-4">
            Foto do perfil (opcional)
          </label>

          <ProfileImageUpload
            currentImage={data.image}
            onImageChange={handleImageChange}
            size="lg"
            fallbackText={getUserDisplayName()}
            showRemove={!!data.image}
            className="mx-auto"
          />

          <p className="text-xs text-theme-tertiary mt-2">
            Clique no ícone para adicionar uma foto
          </p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-3">
            Sobre você (opcional)
          </label>

          <textarea
            value={data.bio || ''}
            onChange={(e) => updateData({ bio: e.target.value })}
            placeholder="Conte um pouco sobre sua paixão pela música clássica..."
            className="input-classical-2 w-full h-24 resize-none"
            maxLength={500}
          />

          <p className="text-xs text-theme-tertiary mt-1">
            {(data.bio || '').length}/500 caracteres
          </p>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-3">
            <FiMapPin className="w-4 h-4 inline mr-2" />
            Localização (opcional)
          </label>

          <div className="space-y-3">
            <Input
              placeholder="Cidade"
              className="input-classical-2"
              value={data.location?.city || ''}
              onChange={(e) =>
                updateData({
                  location: { ...data.location, city: e.target.value },
                })
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="Estado"
                className="input-classical-2"
                value={data.location?.state || ''}
                onChange={(e) =>
                  updateData({
                    location: { ...data.location, state: e.target.value },
                  })
                }
              />

              <Input
                placeholder="País"
                className="input-classical-2"
                value={data.location?.country || ''}
                onChange={(e) =>
                  updateData({
                    location: { ...data.location, country: e.target.value },
                  })
                }
              />
            </div>
          </div>

          <p className="text-xs text-theme-tertiary mt-2">
            Suas informações de localização são privadas por padrão
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="classical-card-2 p-4 max-w-md mx-auto">
          <p className="text-sm text-theme-secondary">
            💡 <strong>Dica:</strong> Um perfil completo ajuda outros usuários a
            se conectarem com você e descobrirem interesses em comum!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileStep;
