// app/profile/components/PersonalInfoSection.tsx - COM VALIDAÇÃO DE TELEFONE
'use client';

import React, { useState } from 'react';
import {
  PiFloppyDisk,
  PiMapPin,
  PiPencilLine,
  PiUser,
  PiWarningCircle,
  PiX,
} from 'react-icons/pi';
import { toast } from 'react-hot-toast';
import Button from '../../Common/Button';
import Input from '../../Common/Inputs';
import ProfileImageUpload from '../../ProfileImageUpload';
import LocationSelector, { LocationData } from '../../Common/LocationSelector';
import InternationalPhoneInput from '../../Common/InternationalPhoneInput';
import { updatePersonalInfo } from '@/app/actions/profile';
import { ApiError, apiFetch } from '@/app/libs/api/client';
import { useAuth } from '@/app/hooks/useAuth';
import { useSessionUpdate } from '@/app/hooks/useSessionUpdate';
// Era `User` do NextAuth, aumentado em `types/next-auth.d.ts`. É o mesmo
// objeto que `useAuth()` entrega, e ele já tem tipo próprio no store.
import type { User } from '@/app/hooks/userStore';
import {
  convertDatabaseToLocationData,
  convertLocationDataToDatabase,
  isLocationDataComplete,
} from '@/app/utils/locationUtils';

// 🆕 IMPORTAR VALIDAÇÃO DE TELEFONE
import {
  validatePhoneNumber,
  canProceedWithPhone,
  usePhoneValidation,
} from '@/app/utils/phones_and_location/phoneValidation';
import { useTranslation } from '@/app/context/TranslationContext';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

interface PersonalInfoSectionProps {
  user: User;
  updateUser: (data: Partial<User>) => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  user,
  updateUser: localUpdateUser,
}) => {
  const { updateUser: globalUpdateUser } = useAuth();
  const { updateUserSession } = useSessionUpdate();
  const { t } = useTranslation({ sections: ['pages/profile'] });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    bio: user.bio || '',
    phone: user.phone || '',
    image: user.image || '',
    location: convertDatabaseToLocationData({
      country: user.country,
      state: user.state,
      city: user.city,
    }),
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 🆕 VALIDAÇÃO DE TELEFONE EM TEMPO REAL
  const phoneValidation = usePhoneValidation(formData.phone);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleLocationChange = (location: LocationData) => {
    console.log(
      '🔄 PersonalInfoSection - Recebendo localização completa:',
      location
    );

    setFormData((prev) => ({
      ...prev,
      location,
    }));

    console.log('✅ PersonalInfoSection - Localização salva no formData');

    if (errors.location) {
      setErrors((prev) => ({ ...prev, location: '' }));
    }
  };

  // 🔧 HANDLER PARA TELEFONE COM VALIDAÇÃO
  const handlePhoneChange = (phone: string) => {
    setFormData((prev) => ({ ...prev, phone }));

    // Limpar erro de telefone quando começar a digitar
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: '' }));
    }
  };

  // 🔧 VALIDAÇÃO ATUALIZADA COM TELEFONE
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validação de nome
    if (!formData.firstName.trim()) {
      newErrors.firstName = t('personal_info_first_name_required');
    }

    // Validação de bio
    if (formData.bio.length > 500) {
      newErrors.bio = `Bio não pode ter mais de 500 ${t(
        'personal_info_bio_characters'
      )}`;
    }

    // 🆕 VALIDAÇÃO DE TELEFONE
    if (formData.phone && formData.phone.trim() !== '') {
      const phoneValidationResult = validatePhoneNumber(formData.phone);

      if (!phoneValidationResult.isValid && !phoneValidationResult.isEmpty) {
        newErrors.phone =
          phoneValidationResult.error || t('personal_info_phone_invalid');
        console.log('❌ Telefone inválido:', newErrors.phone);
      } else {
        console.log('✅ Telefone válido ou vazio');
      }
    }

    // Validar localização (opcional)
    if (formData.location && !isLocationDataComplete(formData.location)) {
      console.warn('⚠️ Localização incompleta detectada:', formData.location);
    }

    console.log('🔍 Erros de validação encontrados:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função para sincronizar todos os estados após update
  const syncUserData = async (data: Partial<User>) => {
    localUpdateUser(data);
    globalUpdateUser(data);
    await updateUserSession();
  };

  const handleSave = async () => {
    console.log('💾 Tentando salvar dados do perfil');

    if (!validateForm()) {
      console.log('❌ Validação falhou, não salvando');

      // Se houver erro de telefone, mostrar toast específico
      if (errors.phone) {
        toast.error(`${t('personal_info_phone_invalid')}: ${errors.phone}`);
      }

      return;
    }

    setIsLoading(true);

    try {
      const locationForDatabase = convertLocationDataToDatabase(
        formData.location
      );

      const dataToSave = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        phone: formData.phone,
        city: locationForDatabase.city,
        state: locationForDatabase.state,
        country: locationForDatabase.country,
        image: formData.image,
      };

      const result = await updatePersonalInfo(user.id, dataToSave);

      if (result.success) {
        await syncUserData({
          ...dataToSave,
          ...(result.data?.phoneCountryCode && {
            phoneCountryCode: result.data.phoneCountryCode,
          }),
          ...(result.data?.phoneNumber && {
            phoneNumber: result.data.phoneNumber,
          }),
        });
        setIsEditing(false);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error('Erro ao atualizar informações.');
      console.error('Update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      bio: user.bio || '',
      phone: user.phone || '',
      image: user.image || '',
      location: convertDatabaseToLocationData({
        country: user.country,
        state: user.state,
        city: user.city,
      }),
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // A API sobe a foto para o armazenamento em nuvem e já a grava na conta.
      const { imageUrl } = await apiFetch<{ imageUrl: string }>(
        '/profile/avatar',
        { method: 'POST', body: formData }
      );

      const imageUpdate = { image: imageUrl };
      await syncUserData(imageUpdate);
      setFormData((prev) => ({ ...prev, image: imageUrl }));
      toast.success('Foto atualizada com sucesso!');
    } catch (error: any) {
      toast.error(
        error instanceof ApiError && error.message
          ? error.message
          : 'Erro ao fazer upload da imagem'
      );
      console.error('Upload error:', error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageChange = (imageUrl: string | null) => {
    const imageUpdate = { image: imageUrl };
    localUpdateUser(imageUpdate);
    globalUpdateUser(imageUpdate);
    setFormData((prev) => ({ ...prev, image: imageUrl || '' }));
  };

  const getUserDisplayName = () => {
    const firstName = formData.firstName || user.firstName || '';
    const lastName = formData.lastName || user.lastName || '';
    return `${firstName} ${lastName}`.trim();
  };

  return (
    <Stack gap={6}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-theme-primary">
            {t('personal_info_title')}
          </h3>
          <Text papel="rotulo" tom="suave" as="p">
            {t('personal_info_description')}
          </Text>
        </div>

        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            leftIcon={<PiPencilLine />}
          >
            {t('personal_info_edit')}
          </Button>
        ) : (
          <div className="flex flex-col md:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              leftIcon={<PiX />}
              disabled={isLoading}
            >
              {t('personal_info_cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={isLoading}
              leftIcon={<PiFloppyDisk />}
              disabled={!canProceedWithPhone(formData.phone)}
              title={
                errors.phone
                  ? `Não é possível salvar: ${errors.phone}`
                  : undefined
              }
            >
              {t('personal_info_save')}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Image */}
      <Inline gap={6} className="pb-6 border-b border-theme-secondary">
        <ProfileImageUpload
          currentImage={user.image}
          onImageUpload={handleImageUpload}
          onImageChange={handleImageChange}
          size="lg"
          isUploading={isUploadingImage}
          fallbackText={getUserDisplayName()}
          showRemove={!!user.image}
        />

        <div>
          <h4 className="font-medium text-theme-primary">
            {t('personal_info_profile_photo')}
          </h4>
          <Text papel="rotulo" tom="suave" as="p" className="mb-2">
            {t('personal_info_photo_description')}
          </Text>
          <Text papel="legenda" tom="fraco" as="p">
            {user.image
              ? t('personal_info_photo_instruction_change')
              : t('personal_info_photo_instruction_add')}
          </Text>
        </div>
      </Inline>

      {/* Basic Info Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label={t('personal_info_first_name_required')}
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          disabled={!isEditing}
          placeholder={t('personal_info_first_name_placeholder')}
          error={errors.firstName}
          leftIcon={<PiUser className="w-4 h-4" />}
        />

        <Input
          label={t('personal_info_last_name')}
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          disabled={!isEditing}
          placeholder={t('personal_info_last_name_placeholder')}
          leftIcon={<PiUser className="w-4 h-4" />}
          error={errors.lastName}
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-2">
          {t('personal_info_about')}
        </label>
        <div className="relative">
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder={t('personal_info_bio_placeholder')}
            className={`input-classical !px-8 w-full h-24 resize-none ${
              !isEditing ? 'bg-theme-secondary cursor-not-allowed' : ''
            }`}
            maxLength={500}
          />
        </div>
        <Text papel="legenda" tom="fraco" as="p" className="mt-1">
          {formData.bio.length}/500 {t('personal_info_bio_characters')}
        </Text>
        {errors.bio && <p className="text-xs text-erro mt-1">{errors.bio}</p>}
      </div>

      {/* 🔧 TELEFONE COM VALIDAÇÃO APRIMORADA */}
      <div>
        <InternationalPhoneInput
          value={formData.phone}
          onChange={handlePhoneChange}
          disabled={!isEditing}
          label={t('personal_info_phone')}
          placeholder={t('personal_info_phone_placeholder')}
          showLabel={true}
          error={errors.phone}
        />

        {/* 🆕 AVISO DE VALIDAÇÃO DE TELEFONE (se editando e houver erro) */}
        {errors.phone && phoneValidation.showError && phoneValidation.error && (
          <div className="p-4 bg-erro/10 border border-erro/30 rounded-lg flex items-start space-x-3">
            <PiWarningCircle className="w-5 h-5 text-erro flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-erro">
                {t('personal_info_phone_invalid')}
              </h4>
              <p className="text-sm text-erro mt-1">{phoneValidation.error}</p>
              {phoneValidation.progressMessage && (
                <p className="text-xs text-erro mt-1">
                  {phoneValidation.progressMessage}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Localização */}
      <div>
        <Inline gap={2} className="mb-4">
          <PiMapPin className="w-4 h-4 text-brand-primary" />
          <h4 className="font-medium text-theme-primary">
            {t('personal_info_location')}
          </h4>
        </Inline>

        <LocationSelector
          value={formData.location}
          onChange={handleLocationChange}
          disabled={!isEditing}
          showLabels={false}
          className="space-y-3"
        />

        {!isEditing && !user.city && !user.state && !user.country && (
          <Text papel="rotulo" tom="fraco" as="p" className="mt-2 italic">
            {t('personal_info_location_not_set')}
          </Text>
        )}
      </div>
    </Stack>
  );
};

export default PersonalInfoSection;
