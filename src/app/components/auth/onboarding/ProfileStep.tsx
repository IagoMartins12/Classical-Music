// components/auth/onboarding/ProfileStep.tsx
'use client';

import { useOnboardingModal } from '@/app/stores/authStore';
import React, { useState, useRef } from 'react';
import { FiCamera, FiMapPin, FiEdit3 } from 'react-icons/fi';
import Input from '../../Common/Inputs';

const ProfileStep: React.FC = () => {
  const { data, updateData } = useOnboardingModal();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    data.image || null
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        updateData({ image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    updateData({ image: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

          <div className="relative inline-block">
            <div className="w-32 h-32 bg-theme-secondary rounded-full overflow-hidden border-4 border-theme-secondary">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-theme-tertiary">
                  <FiCamera className="w-8 h-8" />
                </div>
              )}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-theme-inverse shadow-theme-medium hover:scale-110 transition-transform"
            >
              <FiEdit3 className="w-4 h-4" />
            </button>

            {imagePreview && (
              <button
                onClick={removeImage}
                className="absolute top-0 right-0 w-8 h-8 bg-accent-red rounded-full flex items-center justify-center text-white text-sm hover:scale-110 transition-transform"
              >
                ✕
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
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
            className="input-classical w-full h-24 resize-none"
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
              />

              <Input
                placeholder="País"
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
