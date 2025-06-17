// components/auth/onboarding/ProfileStep.tsx (versão atualizada)
'use client';

import { useOnboardingModal } from '@/app/stores/authStore';
import React, { useState } from 'react';
import { FiMapPin } from 'react-icons/fi';
import Input from '../../Common/Inputs';
import ProfileImageUpload from '../../ProfileImageUpload';
import toast from 'react-hot-toast';
import { User } from 'next-auth';
import { useAuth } from '@/app/hooks/useAuth';
import { useSessionUpdate } from '@/app/hooks/useSessionUpdate';
import { FaCity, FaGlobeAmericas, FaMapPin } from 'react-icons/fa';

const ProfileStep: React.FC = () => {
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { data, updateData } = useOnboardingModal();
  const { updateUser: globalUpdateUser, user } = useAuth();

  const { updateUserSession } = useSessionUpdate(); // Hook personalizado

  const handleImageChange = (imageUrl: string | null) => {
    updateData({ image: imageUrl || undefined });
  };

  const syncUserData = async (data: Partial<User>) => {
    // 1. Atualizar stores locais
    globalUpdateUser(data);

    // 2. Forçar refresh da sessão NextAuth
    await updateUserSession();
  };

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    try {
      if (!user) return;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);

      const response = await fetch('/api/upload/profile-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const imageUpdate = { image: result.imageUrl };

        // Sincronizar todos os estados
        await syncUserData(imageUpdate);

        toast.success('Foto atualizada com sucesso!');
      } else {
        toast.error(result.message || 'Erro ao fazer upload da imagem');
      }
    } catch (error) {
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setIsUploadingImage(false);
    }
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
            currentImage={user?.image}
            onImageUpload={handleImageUpload}
            onImageChange={handleImageChange}
            size="lg"
            isUploading={isUploadingImage}
            fallbackText={getUserDisplayName()}
            showRemove={!!user?.image}
          />

          {/* <ProfileImageUpload
            currentImage={data.image}
            onImageChange={handleImageChange}
            size="lg"
            fallbackText={getUserDisplayName()}
            showRemove={!!data.image}
            className="mx-auto"
          /> */}

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
              value={data.location?.city || ''}
              onChange={(e) =>
                updateData({
                  location: { ...data.location, city: e.target.value },
                })
              }
              leftIcon={<FaCity className="w-4 h-4" />}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="Estado"
                value={data.location?.state || ''}
                onChange={(e) =>
                  updateData({
                    location: { ...data.location, state: e.target.value },
                  })
                }
                leftIcon={<FaMapPin className="w-4 h-4" />}
              />

              <Input
                placeholder="País"
                value={data.location?.country || ''}
                onChange={(e) =>
                  updateData({
                    location: { ...data.location, country: e.target.value },
                  })
                }
                leftIcon={<FaGlobeAmericas className="w-4 h-4" />}
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
