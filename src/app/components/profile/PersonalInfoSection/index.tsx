// app/profile/components/PersonalInfoSection.tsx (versão com hook personalizado)
'use client';

import React, { useState } from 'react';
import { FiEdit3, FiSave, FiX, FiMapPin } from 'react-icons/fi';

import { updatePersonalInfo } from '@/app/actions/profile';
import { toast } from 'react-hot-toast';
import Button from '../../Common/Button';
import Input from '../../Common/Inputs';
import ProfileImageUpload from '../../ProfileImageUpload';
import { useAuth } from '@/app/hooks/useAuth';
import { useSessionUpdate } from '@/app/hooks/useSessionUpdate'; // Hook personalizado
import { User } from '@/app/stores/authStore';

interface PersonalInfoSectionProps {
  user: User;
  updateUser: (data: Partial<User>) => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  user,
  updateUser: localUpdateUser,
}) => {
  const { updateUser: globalUpdateUser } = useAuth();
  const { updateUserSession } = useSessionUpdate(); // Hook personalizado
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    bio: user.bio || '',
    city: user.city || '',
    state: user.state || '',
    country: user.country || '',
    image: user.image || '',
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

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (formData.bio.length > 500) {
      newErrors.bio = 'Bio não pode ter mais de 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função para sincronizar todos os estados após update
  const syncUserData = async (data: Partial<User>) => {
    // 1. Atualizar stores locais
    localUpdateUser(data);
    globalUpdateUser(data);

    // 2. Forçar refresh da sessão NextAuth
    await updateUserSession();
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await updatePersonalInfo(user.id, formData);

      if (result.success) {
        await syncUserData(formData);
        setIsEditing(false);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Erro ao atualizar informações.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      bio: user.bio || '',
      city: user.city || '',
      state: user.state || '',
      country: user.country || '',
      image: user.image || '',
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

  const handleImageChange = (imageUrl: string | null) => {
    const imageUpdate = { image: imageUrl };
    localUpdateUser(imageUpdate);
    globalUpdateUser(imageUpdate);
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

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Nome *"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          disabled={!isEditing}
          placeholder="Seu nome"
          error={errors.firstName}
        />

        <Input
          label="Sobrenome *"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          disabled={!isEditing}
          placeholder="Seu sobrenome"
          error={errors.lastName}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-2">
          Sobre você
        </label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          disabled={!isEditing}
          placeholder="Conte um pouco sobre sua paixão pela música clássica..."
          className={`input-classical w-full h-24 resize-none ${
            !isEditing
              ? 'bg-theme-secondary bg-opacity-50 cursor-not-allowed'
              : ''
          }`}
          maxLength={500}
        />
        <p className="text-xs text-theme-tertiary mt-1">
          {formData.bio.length}/500 caracteres
        </p>
        {errors.bio && (
          <p className="text-xs text-accent-red mt-1">{errors.bio}</p>
        )}
      </div>

      {/* Location */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <FiMapPin className="w-4 h-4 text-brand-primary" />
          <h4 className="font-medium text-theme-primary">Localização</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Cidade"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="Sua cidade"
          />

          <Input
            label="Estado"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="Seu estado"
          />

          <Input
            label="País"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="Seu país"
          />
        </div>
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
      </div>
    </div>
  );
};

export default PersonalInfoSection;
