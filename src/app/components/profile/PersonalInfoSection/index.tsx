// app/profile/components/PersonalInfoSection.tsx - COM VALIDAÇÃO DE TELEFONE
'use client';

import React, { useState } from 'react';
import {
  FiEdit3,
  FiSave,
  FiX,
  FiMapPin,
  FiUser,
  FiAlertCircle,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Button from '../../Common/Button';
import Input from '../../Common/Inputs';
import ProfileImageUpload from '../../ProfileImageUpload';
import LocationSelector, { LocationData } from '../../Common/LocationSelector';
import InternationalPhoneInput from '../../Common/InternationalPhoneInput';
import { updatePersonalInfo } from '@/app/actions/profile';
import { useAuth } from '@/app/hooks/useAuth';
import { useSessionUpdate } from '@/app/hooks/useSessionUpdate';
import { User } from 'next-auth';
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
      newErrors.firstName = 'Nome é obrigatório';
    }

    // Validação de bio
    if (formData.bio.length > 500) {
      newErrors.bio = 'Bio não pode ter mais de 500 caracteres';
    }

    // 🆕 VALIDAÇÃO DE TELEFONE

    if (formData.phone && formData.phone.trim() !== '') {
      const phoneValidationResult = validatePhoneNumber(formData.phone);

      if (!phoneValidationResult.isValid && !phoneValidationResult.isEmpty) {
        newErrors.phone = phoneValidationResult.error || 'Telefone inválido';
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
        toast.error(`Telefone inválido: ${errors.phone}`);
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
      formData.append('userId', user.id);

      const response = await fetch('/api/upload/profile-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const imageUpdate = { image: result.imageUrl };
        await syncUserData(imageUpdate);
        setFormData((prev) => ({ ...prev, image: result.imageUrl }));
        toast.success('Foto atualizada com sucesso!');
      } else {
        toast.error(result.message || 'Erro ao fazer upload da imagem');
      }
    } catch (error: any) {
      toast.error('Erro ao fazer upload da imagem');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-theme-primary">
            Informações Básicas
          </h3>
          <p className="text-sm text-theme-secondary">
            Suas informações pessoais e de contato
          </p>
        </div>

        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            leftIcon={<FiEdit3 />}
          >
            Editar
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
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={isLoading}
              leftIcon={<FiSave />}
              disabled={!canProceedWithPhone(formData.phone)} // 🆕 Desabilitar se telefone inválido
              title={
                errors.phone
                  ? `Não é possível salvar: ${errors.phone}`
                  : undefined
              }
            >
              Salvar
            </Button>
          </div>
        )}
      </div>

      {/* Profile Image */}
      <div className="flex items-center space-x-6 pb-6 border-b border-theme-secondary">
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
          <h4 className="font-medium text-theme-primary">Foto do Perfil</h4>
          <p className="text-sm text-theme-secondary mb-2">
            JPG, PNG ou GIF. Máximo 5MB.
          </p>
          <p className="text-xs text-theme-tertiary">
            {user.image
              ? 'Clique no ícone para alterar sua foto'
              : 'Clique no ícone para adicionar uma foto'}
          </p>
        </div>
      </div>

      {/* Basic Info Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Nome *"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          disabled={!isEditing}
          placeholder="Seu nome"
          error={errors.firstName}
          leftIcon={<FiUser className="w-4 h-4" />}
        />

        <Input
          label="Sobrenome"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          disabled={!isEditing}
          placeholder="Seu sobrenome"
          leftIcon={<FiUser className="w-4 h-4" />}
          error={errors.lastName}
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-2">
          Sobre você
        </label>
        <div className="relative">
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="Conte um pouco sobre sua paixão pela música clássica..."
            className={`input-classical !px-8 w-full h-24 resize-none ${
              !isEditing
                ? 'bg-theme-secondary bg-opacity-50 cursor-not-allowed'
                : ''
            }`}
            maxLength={500}
          />
        </div>
        <p className="text-xs text-theme-tertiary mt-1">
          {formData.bio.length}/500 caracteres
        </p>
        {errors.bio && (
          <p className="text-xs text-accent-red mt-1">{errors.bio}</p>
        )}
      </div>

      {/* 🔧 TELEFONE COM VALIDAÇÃO APRIMORADA */}
      <div>
        <InternationalPhoneInput
          value={formData.phone}
          onChange={handlePhoneChange}
          disabled={!isEditing}
          label="Telefone"
          placeholder="Digite seu número"
          showLabel={true}
          error={errors.phone} // Passar erro específico do telefone
        />

        {/* 🆕 AVISO DE VALIDAÇÃO DE TELEFONE (se editando e houver erro) */}
        {errors.phone && phoneValidation.showError && phoneValidation.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">
                Telefone inválido
              </h4>
              <p className="text-sm text-red-700 mt-1">
                {phoneValidation.error}
              </p>
              {phoneValidation.progressMessage && (
                <p className="text-xs text-red-600 mt-1">
                  {phoneValidation.progressMessage}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Localização */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <FiMapPin className="w-4 h-4 text-brand-primary" />
          <h4 className="font-medium text-theme-primary">Localização</h4>
        </div>

        <LocationSelector
          value={formData.location}
          onChange={handleLocationChange}
          disabled={!isEditing}
          showLabels={false}
          className="space-y-3"
        />

        {!isEditing && !user.city && !user.state && !user.country && (
          <p className="text-sm text-theme-tertiary mt-2 italic">
            Nenhuma localização definida
          </p>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoSection;
