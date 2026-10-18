// app/profile/components/PersonalInfoSection.tsx - COM VALIDAÇÃO DE TELEFONE
'use client';

import { PERFIL } from '@/app/conteudo/textos/perfil';
import { useTextos } from '@/app/hooks/useTextos';
import React, { useState } from 'react';
import { PiFloppyDisk, PiPencilLine, PiX } from 'react-icons/pi';
import { toast } from 'react-hot-toast';
import ProfileImageUpload from '../../ProfileImageUpload';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import {
  LocationField,
  type LocationData,
} from '@/app/components/site/profile/LocationField';
import { PhoneField } from '@/app/components/site/profile/PhoneField';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
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
} from '@/app/utils/locationUtils';

// 🆕 IMPORTAR VALIDAÇÃO DE TELEFONE
import {
  validatePhoneNumber,
  canProceedWithPhone,
} from '@/app/utils/phones_and_location/phoneValidation';
import { Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { porIdioma } from '@/app/utils/porIdioma';
import { useTx } from '@/app/hooks/useTx';

/** The API's limit for `bio` (`UpdateAccountDto`). */
const BIO_MAX = 2000;

interface PersonalInfoSectionProps {
  user: User;
  updateUser: (data: Partial<User>) => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  user,
  updateUser: localUpdateUser,
}) => {
  const tx = useTx();
  const { language } = useRouteLanguage();
  const { updateUser: globalUpdateUser } = useAuth();
  const { updateUserSession } = useSessionUpdate();
  const { t } = useTextos(PERFIL);
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
    setFormData((prev) => ({
      ...prev,
      location,
    }));

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
    if (formData.bio.length > BIO_MAX) {
      newErrors.bio =
        language === 'pt'
          ? `Use até ${BIO_MAX} caracteres.`
          : `Use up to ${BIO_MAX} characters.`;
    }

    // 🆕 VALIDAÇÃO DE TELEFONE
    if (formData.phone && formData.phone.trim() !== '') {
      const phoneValidationResult = validatePhoneNumber(formData.phone);

      if (!phoneValidationResult.isValid && !phoneValidationResult.isEmpty) {
        newErrors.phone =
          phoneValidationResult.error || t('personal_info_phone_invalid');
      }
    }

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
    if (!validateForm()) {
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
      toast.error(porIdioma('Não foi possível salvar.', 'Could not save.'));
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
      toast.success(tx('Foto atualizada com sucesso!', 'Photo updated.'));
    } catch (error: any) {
      toast.error(
        error instanceof ApiError && error.message
          ? error.message
          : tx('Erro ao fazer upload da imagem', 'Could not upload the image')
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-[1.5rem] leading-tight text-texto">
            {t('personal_info_title')}
          </h3>
          <Text papel="rotulo" tom="suave" as="p">
            {t('personal_info_description')}
          </Text>
        </div>

        {!isEditing ? (
          <Button
            tamanho="p"
            icone={PiPencilLine}
            onClick={() => setIsEditing(true)}
          >
            {t('personal_info_edit')}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              tamanho="p"
              variante="fantasma"
              icone={PiX}
              onClick={handleCancel}
              disabled={isLoading}
            >
              {t('personal_info_cancel')}
            </Button>
            <Button
              tamanho="p"
              variante="primario"
              icone={PiFloppyDisk}
              onClick={handleSave}
              carregando={isLoading}
              disabled={!canProceedWithPhone(formData.phone)}
            >
              {t('personal_info_save')}
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 border-b border-linha pb-6">
        <ProfileImageUpload
          currentImage={user.image}
          onImageUpload={handleImageUpload}
          onImageChange={handleImageChange}
          size="lg"
          isUploading={isUploadingImage}
          fallbackText={getUserDisplayName()}
          showRemove={!!user.image}
        />
        <div className="flex flex-col gap-1">
          <Text papel="subtitulo" as="h4">
            {t('personal_info_profile_photo')}
          </Text>
          <Text papel="rotulo" tom="suave" as="p">
            {t('personal_info_photo_description')}
          </Text>
          <Text papel="legenda" tom="fraco" as="p">
            {user.image
              ? t('personal_info_photo_instruction_change')
              : t('personal_info_photo_instruction_add')}
          </Text>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field
          label={t('personal_info_first_name_required')}
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          disabled={!isEditing}
          placeholder={t('personal_info_first_name_placeholder')}
          erro={errors.firstName}
          autoComplete="given-name"
        />
        <Field
          label={t('personal_info_last_name')}
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          disabled={!isEditing}
          placeholder={t('personal_info_last_name_placeholder')}
          erro={errors.lastName}
          autoComplete="family-name"
        />
      </div>

      <Field.Area
        label={t('personal_info_about')}
        name="bio"
        rows={5}
        value={formData.bio}
        onChange={handleInputChange}
        disabled={!isEditing}
        placeholder={t('personal_info_bio_placeholder')}
        maxLength={BIO_MAX}
        ajuda={`${formData.bio.length}/${BIO_MAX} ${t('personal_info_bio_characters')}`}
        erro={errors.bio}
      />

      <PhoneField
        label={t('personal_info_phone')}
        countryLabel={language === 'pt' ? 'País do telefone' : 'Phone country'}
        value={formData.phone}
        onChange={handlePhoneChange}
        disabled={!isEditing}
        error={errors.phone}
      />

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 font-display text-[1.25rem] text-texto">
          {t('personal_info_location')}
        </legend>
        <LocationField
          value={formData.location}
          onChange={handleLocationChange}
          disabled={!isEditing}
          language={language}
        />
        {!isEditing && !user.city && !user.state && !user.country && (
          <Text papel="rotulo" tom="fraco" as="p">
            {t('personal_info_location_not_set')}
          </Text>
        )}
      </fieldset>
    </Stack>
  );
};

export default PersonalInfoSection;
