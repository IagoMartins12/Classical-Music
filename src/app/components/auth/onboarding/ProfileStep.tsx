// components/onboarding/ProfileStep.tsx - CORRIGIDO para salvar objetos completos
'use client';

import { useOnboardingModal } from '@/app/stores/authStore';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { User } from 'next-auth';
import { useAuth } from '@/app/hooks/useAuth';
import { useSessionUpdate } from '@/app/hooks/useSessionUpdate';

import { useTranslation } from '@/app/hooks/useTranslation';
import LocationSelector, { LocationData } from '../../Common/LocationSelector';
import ProfileImageUpload from '../../ProfileImageUpload';
import InternationalPhoneInput from '../../Common/InternationalPhoneInput';

const ProfileStep: React.FC = () => {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { t } = useTranslation({ sections: ['components/onboarding'] });

  const { data, updateData } = useOnboardingModal();
  const { updateUser: globalUpdateUser, user } = useAuth();
  const { updateUserSession } = useSessionUpdate();

  // Função para sincronizar dados do usuário
  const syncUserData = async (data: Partial<User>) => {
    globalUpdateUser(data);
    await updateUserSession();
  };

  // Handler para mudança de imagem
  const handleImageChange = (imageUrl: string | null) => {
    updateData({ image: imageUrl || undefined });
  };

  // Handler para upload de imagem
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
        await syncUserData(imageUpdate);
        updateData({ image: result.imageUrl });
        toast.success(t('profile_step_photo_updated'));
      } else {
        toast.error(result.message || t('profile_step_photo_error'));
      }
    } catch (error: any) {
      toast.error(t('profile_step_photo_error'));
      console.error('Upload error:', error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // 🔧 HANDLER CORRIGIDO - Salva objetos completos da localização
  const handleLocationChange = (location: LocationData) => {
    console.log('🔄 ProfileStep - Salvando localização completa:', location);

    // 💡 AGORA salva os objetos completos, não apenas o nome!
    updateData({
      location: {
        country: location.country
          ? {
              isoCode: location.country.isoCode,
              name: location.country.name,
              flag: location.country.flag,
            }
          : undefined,
        state: location.state
          ? {
              isoCode: location.state.isoCode,
              name: location.state.name,
              countryCode: location.state.countryCode,
            }
          : undefined,
        city: location.city
          ? {
              name: location.city.name,
              stateCode: location.city.stateCode,
              countryCode: location.city.countryCode,
            }
          : undefined,
      },
    });

    console.log('✅ ProfileStep - Localização salva no onboarding data');
  };

  // Handler para mudança de telefone
  const handlePhoneChange = (phone: string) => {
    console.log('📞 ProfileStep - Salvando telefone:', phone);
    updateData({ phone });
  };

  // Função para obter nome de exibição do usuário
  const getUserDisplayName = () => {
    const firstName = user?.firstName || 'Usuário';
    return firstName;
  };

  // 🔧 CONVERSÃO CORRIGIDA - Converter dados salvos para formato do LocationSelector
  const currentLocation: LocationData = {
    country: data.location?.country
      ? {
          isoCode: data.location.country.isoCode,
          name: data.location.country.name,
          flag: data.location.country.flag,
        }
      : undefined,
    state: data.location?.state
      ? {
          isoCode: data.location.state.isoCode,
          name: data.location.state.name,
          countryCode: data.location.state.countryCode,
        }
      : undefined,
    city: data.location?.city
      ? {
          name: data.location.city.name,
          stateCode: data.location.city.stateCode,
          countryCode: data.location.city.countryCode,
        }
      : undefined,
  };

  // 🐛 Debug melhorado
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 ProfileStep - Estado atual:', {
        'Data do onboarding': data,
        'Localização do data': data.location,
        'Telefone do data': data.phone,
        'Current location convertida': currentLocation,
      });
    }
  }, [data, currentLocation]);

  return (
    <div className="py-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-theme-primary classical-title mb-3">
          {t('profile_step_title')}
        </h3>
        <p className="text-theme-secondary max-w-lg mx-auto">
          {t('profile_step_subtitle')}
        </p>
      </div>

      <div className="max-w-lg mx-auto space-y-8">
        {/* Profile Picture */}
        <div className="text-center">
          <label className="block text-sm font-medium text-theme-secondary mb-4">
            {t('profile_step_photo_label')}
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

          <p className="text-xs text-theme-tertiary mt-2">
            {t('profile_step_photo_hint')}
          </p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-3">
            {t('profile_step_bio_label')}
          </label>

          <textarea
            value={data.bio || ''}
            onChange={(e) => updateData({ bio: e.target.value })}
            placeholder={t('profile_step_bio_placeholder')}
            className="input-classical-2 w-full h-24 resize-none"
            maxLength={500}
          />

          <p className="text-xs text-theme-tertiary mt-1">
            {(data.bio || '').length}/500 {t('profile_step_bio_chars')}
          </p>
        </div>

        {/* Telefone Internacional */}
        <div>
          <InternationalPhoneInput
            value={data.phone || ''}
            onChange={handlePhoneChange}
            label={t('profile_step_phone_label')}
            placeholder={t('profile_step_phone_placeholder')}
            showLabel={true}
          />
        </div>

        {/* Localização */}
        <div>
          <div className="mb-4">
            <h4 className="text-sm font-medium text-theme-secondary mb-2">
              {t('profile_step_location_label')}
            </h4>
            <p className="text-xs text-theme-tertiary mb-4">
              {t('profile_step_location_hint')}
            </p>
          </div>

          <LocationSelector
            value={currentLocation}
            onChange={handleLocationChange}
            showLabels={false}
            className="space-y-3"
          />
        </div>
      </div>

      {/* Dicas e informações */}
      <div className="mt-8 space-y-4">
        <div className="classical-card-2 p-4 max-w-lg mx-auto">
          <p className="text-sm text-theme-secondary">
            {t('profile_step_tip_title')} <strong>Dica:</strong>{' '}
            {t('profile_step_tip_text')}
          </p>
        </div>

        <div className="classical-card-2 p-4 max-w-lg mx-auto bg-brand-primary bg-opacity-5 border border-brand-primary border-opacity-20">
          <h4 className="text-sm font-medium text-brand-primary mb-2">
            {t('profile_step_privacy_title')}
          </h4>
          <ul className="text-xs text-theme-secondary space-y-1">
            <li>{t('profile_step_privacy_contact')}</li>
            <li>{t('profile_step_privacy_location')}</li>
            <li>{t('profile_step_privacy_settings')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfileStep;
