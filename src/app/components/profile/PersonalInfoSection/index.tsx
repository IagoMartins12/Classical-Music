// app/profile/components/PersonalInfoSection.tsx - CORRIGIDO com funções utilitárias
'use client';

import React, { useState } from 'react';
import {
  FiEdit3,
  FiSave,
  FiX,
  FiMapPin,
  FiUser,
  FiPhone,
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

  // 🔧 Estado do formulário CORRIGIDO - Agora mantém objetos completos de localização
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    bio: user.bio || '',
    phone: user.phone || '',
    image: user.image || '',
    // 🔧 CORRIGIDO: Agora usa função utilitária para converter strings do banco para objetos completos
    location: convertDatabaseToLocationData({
      country: user.country,
      state: user.state,
      city: user.city,
    }),
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // 🔧 HANDLER CORRIGIDO - Agora salva objetos completos da localização
  const handleLocationChange = (location: LocationData) => {
    console.log(
      '🔄 PersonalInfoSection - Recebendo localização completa:',
      location
    );

    // ✅ Agora salva os objetos completos no estado local
    setFormData((prev) => ({
      ...prev,
      location, // Salva o objeto completo LocationData
    }));

    console.log('✅ PersonalInfoSection - Localização salva no formData');

    if (errors.location) {
      setErrors((prev) => ({ ...prev, location: '' }));
    }
  };

  // 🆕 Handler para mudança de telefone
  const handlePhoneChange = (phone: string) => {
    setFormData((prev) => ({ ...prev, phone }));

    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nome é obrigatório';
    }

    if (formData.bio.length > 500) {
      newErrors.bio = 'Bio não pode ter mais de 500 caracteres';
    }

    // Validar se localização está completa (opcional)
    if (formData.location && !isLocationDataComplete(formData.location)) {
      console.warn('⚠️ Localização incompleta detectada:', formData.location);
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
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // 🔧 DADOS CORRIGIDOS - Converte objetos completos para strings do banco
      const locationForDatabase = convertLocationDataToDatabase(
        formData.location
      );

      const dataToSave = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        phone: formData.phone,
        // 🔧 Usar dados convertidos para o banco
        city: locationForDatabase.city,
        state: locationForDatabase.state,
        country: locationForDatabase.country,
        image: formData.image,
      };

      console.log('💾 Salvando dados no backend:', dataToSave);

      const result = await updatePersonalInfo(user.id, dataToSave);

      if (result.success) {
        await syncUserData({
          ...dataToSave,
          // Atualizar também os campos relacionados ao telefone se retornados
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
    // 🔧 CANCELAR CORRIGIDO - Reconverte dados do usuário
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      bio: user.bio || '',
      phone: user.phone || '',
      image: user.image || '',
      // 🔧 Reconverter dados do banco para objetos completos
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

  // 🐛 Debug melhorado
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 PersonalInfoSection - Estado atual:', {
        'Dados do usuário (banco)': {
          country: user.country,
          state: user.state,
          city: user.city,
        },
        'FormData location (objetos completos)': formData.location,
        'Location completa?': isLocationDataComplete(formData.location),
      });
    }
  }, [user, formData.location]);

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

      {/* 🆕 Telefone Internacional */}
      <div>
        <InternationalPhoneInput
          value={formData.phone}
          onChange={handlePhoneChange}
          disabled={!isEditing}
          label="Telefone"
          placeholder="Digite seu número"
          defaultCountry="br"
          showLabel={true}
          error={errors.phone}
        />
        {!errors.phone && (
          <p className="text-xs text-theme-tertiary mt-1">
            Formato internacional - será formatado automaticamente
          </p>
        )}
      </div>

      {/* 🔧 LOCALIZAÇÃO CORRIGIDA */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <FiMapPin className="w-4 h-4 text-brand-primary" />
          <h4 className="font-medium text-theme-primary">Localização</h4>
        </div>

        {/* ✅ Agora usa objetos completos diretamente do formData */}
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

      {/* Account Info (Read-only) */}
      <div className="pt-6 border-t border-theme-secondary">
        <h4 className="font-medium text-theme-primary mb-4">
          Informações da Conta
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-2">
              Email
            </label>
            <div className="input-classical bg-theme-secondary bg-opacity-50 cursor-not-allowed">
              {user.email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-2">
              Tipo de Usuário
            </label>
            <div className="input-classical bg-theme-secondary bg-opacity-50 cursor-not-allowed">
              {user.userType === 'MUSIC_STUDENT' && 'Estudante de Música'}
              {user.userType === 'CASUAL_USER' && 'Entusiasta'}
              {user.userType === 'PROFESSIONAL' && 'Profissional'}
              {user.userType === 'TEACHER' && 'Professor'}
              {!user.userType && 'Não definido'}
            </div>
          </div>
        </div>

        {/* 🆕 Informações técnicas do telefone (apenas se houver) */}
        {user.phone && (
          <div className="mt-4 p-3 bg-theme-secondary bg-opacity-20 rounded-lg">
            <h5 className="text-sm font-medium text-theme-primary mb-2">
              Informações do Telefone
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-theme-tertiary">Completo:</span>
                <div className="font-mono text-theme-primary">{user.phone}</div>
              </div>
              {user.phoneCountryCode && (
                <div>
                  <span className="text-theme-tertiary">País:</span>
                  <div className="font-mono text-theme-primary">
                    {user.phoneCountryCode}
                  </div>
                </div>
              )}
              {user.phoneNumber && (
                <div>
                  <span className="text-theme-tertiary">Número:</span>
                  <div className="font-mono text-theme-primary">
                    {user.phoneNumber}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoSection;
