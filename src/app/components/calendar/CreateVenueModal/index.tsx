// ==================== app/components/calendar/CreateVenueModal.tsx ====================
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { z } from 'zod';
import { FiMapPin } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Modal from '@/app/components/Modal';
import Button from '@/app/components/Common/Button';
import Input from '@/app/components/Common/Inputs';
import { useSmartFormChanges } from '@/app/hooks/useFormChanges';
import Image from 'next/image';

interface CreateVenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingVenue?: any;
}

export default function CreateVenueModal({
  isOpen,
  onClose,
  onSuccess,
  editingVenue,
}: CreateVenueModalProps) {
  const isEditing = !!editingVenue;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const venueSchema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .min(1, 'Nome é obrigatório')
          .min(3, 'Nome deve ter no mínimo 3 caracteres')
          .max(200, 'Nome deve ter no máximo 200 caracteres'),
        city: z.string().min(1, 'Cidade é obrigatória'),
        state: z.string().min(1, 'Estado é obrigatório'),
      }),
    []
  );

  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    city: '',
    state: '',
    country: 'Brasil',
    address: '',
    zipCode: '',
    website: '',
    email: '',
    phone: '',
    capacity: '',
    description: '',
    logoUrl: '',
    coverImageUrl: '',
    isActive: true,
  });

  const originalData = useMemo(() => {
    if (!editingVenue) return null;
    return {
      name: editingVenue.name || '',
      shortName: editingVenue.shortName || '',
      city: editingVenue.city || '',
      state: editingVenue.state || '',
      country: editingVenue.country || 'Brasil',
      address: editingVenue.address || '',
      zipCode: editingVenue.zipCode || '',
      website: editingVenue.website || '',
      email: editingVenue.email || '',
      phone: editingVenue.phone || '',
      capacity: editingVenue.capacity?.toString() || '',
      description: editingVenue.description || '',
      logoUrl: editingVenue.logoUrl || '',
      coverImageUrl: editingVenue.coverImageUrl || '',
      isActive: editingVenue.isActive !== false,
    };
  }, [editingVenue]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const hasChanges = useSmartFormChanges(formData, originalData, ['isActive']);

  const fieldRefs = {
    name: useRef<HTMLInputElement>(null),
    city: useRef<HTMLInputElement>(null),
    state: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    if (isEditing && editingVenue) {
      setFormData({
        name: editingVenue.name || '',
        shortName: editingVenue.shortName || '',
        city: editingVenue.city || '',
        state: editingVenue.state || '',
        country: editingVenue.country || 'Brasil',
        address: editingVenue.address || '',
        zipCode: editingVenue.zipCode || '',
        website: editingVenue.website || '',
        email: editingVenue.email || '',
        phone: editingVenue.phone || '',
        capacity: editingVenue.capacity?.toString() || '',
        description: editingVenue.description || '',
        logoUrl: editingVenue.logoUrl || '',
        coverImageUrl: editingVenue.coverImageUrl || '',
        isActive: editingVenue.isActive !== false,
      });
    } else {
      setFormData({
        name: '',
        shortName: '',
        city: '',
        state: '',
        country: 'Brasil',
        address: '',
        zipCode: '',
        website: '',
        email: '',
        phone: '',
        capacity: '',
        description: '',
        logoUrl: '',
        coverImageUrl: '',
        isActive: true,
      });
    }
    setErrors({});
  }, [isEditing, editingVenue, isOpen]);

  const scrollToFirstError = (errorFields: string[]) => {
    if (errorFields.length > 0) {
      const firstErrorField = errorFields[0] as keyof typeof fieldRefs;
      const fieldRef = fieldRefs[firstErrorField];

      if (fieldRef?.current) {
        fieldRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        setTimeout(() => fieldRef.current?.focus(), 500);
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    try {
      venueSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
      }
    }

    setErrors(newErrors);

    const errorFields = Object.keys(newErrors);
    if (errorFields.length > 0) {
      setTimeout(() => scrollToFirstError(errorFields), 100);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      };

      const url = isEditing ? `/api/venues/${editingVenue.id}` : '/api/venues';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          isEditing
            ? 'Venue atualizada com sucesso!'
            : 'Venue criada com sucesso!',
          { icon: '🏛️' }
        );
        onSuccess?.();
        onClose();
      } else {
        toast.error(data.error || 'Erro ao salvar venue');
      }
    } catch (error) {
      console.error('Erro ao salvar venue:', error);
      toast.error('Erro ao salvar venue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      showCloseButton
      confirmOnClose
      hasChanges={hasChanges}
      isProcessing={isSubmitting}
      processName="Salvamento de venue"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-theme-secondary">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-theme-glow">
            <FiMapPin className="w-5 h-5 text-theme-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-theme-primary classical-title">
              {isEditing ? 'Editar Local' : 'Novo Local'}
            </h2>
            <p className="text-sm text-theme-secondary">
              {isEditing
                ? 'Atualize as informações do local'
                : 'Adicione um novo local de eventos'}
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-6 py-6 space-y-6 overflow-y-auto ">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-theme-primary mb-2">
            Nome do Local *
          </label>
          <Input
            ref={fieldRefs.name}
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className={`w-full input-classical-2 ${
              errors.name ? '!border-red-400' : ''
            }`}
            placeholder="Ex: Teatro Municipal de São Paulo"
            maxLength={200}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* City and State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Cidade *
            </label>
            <Input
              ref={fieldRefs.city}
              type="text"
              value={formData.city}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, city: e.target.value }))
              }
              className={`w-full input-classical-2 ${
                errors.city ? '!border-red-400' : ''
              }`}
              placeholder="Ex: São Paulo"
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Estado *
            </label>
            <Input
              ref={fieldRefs.state}
              type="text"
              value={formData.state}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, state: e.target.value }))
              }
              className={`w-full input-classical-2 ${
                errors.state ? '!border-red-400' : ''
              }`}
              placeholder="Ex: SP"
              maxLength={2}
            />
            {errors.state && (
              <p className="text-red-500 text-sm mt-1">{errors.state}</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-theme-primary mb-2">
            Endereço
          </label>
          <Input
            type="text"
            value={formData.address}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, address: e.target.value }))
            }
            className="w-full input-classical-2"
            placeholder="Ex: Praça Ramos de Azevedo, s/n"
          />
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Website
            </label>
            <Input
              type="url"
              value={formData.website}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, website: e.target.value }))
              }
              className="w-full input-classical-2"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Telefone
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="w-full input-classical-2"
              placeholder="(11) 1234-5678"
            />
          </div>
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-sm font-medium text-theme-primary mb-2">
            Capacidade
          </label>
          <Input
            type="number"
            min="1"
            value={formData.capacity}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, capacity: e.target.value }))
            }
            className="w-full input-classical-2"
            placeholder="Ex: 1500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-theme-primary mb-2">
            Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-full input-classical-2 resize-none"
            rows={4}
            placeholder="Descreva o local..."
            maxLength={500}
          />
          <p className="text-theme-tertiary text-xs mt-1">
            {formData.description.length}/500 caracteres
          </p>
        </div>

        {/* Logo URL */}
        <div>
          <label className="block text-sm font-medium text-theme-primary mb-2">
            Logo do Local
          </label>
          <Input
            type="url"
            value={formData.logoUrl}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, logoUrl: e.target.value }))
            }
            className="w-full input-classical-2"
            placeholder="https://exemplo.com/logo.jpg"
          />
          {formData.logoUrl && (
            <div className="mt-3">
              <p className="text-sm text-theme-secondary mb-2">
                Preview do Logo:
              </p>
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-theme-secondary bg-white p-2">
                <Image
                  src={formData.logoUrl}
                  alt="Logo Preview"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-logo.jpg';
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Cover Image URL */}
        <div>
          <label className="block text-sm font-medium text-theme-primary mb-2">
            Imagem de Capa
          </label>
          <Input
            type="url"
            value={formData.coverImageUrl}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                coverImageUrl: e.target.value,
              }))
            }
            className="w-full input-classical-2"
            placeholder="https://exemplo.com/capa.jpg"
          />
          {formData.coverImageUrl && (
            <div className="mt-3">
              <p className="text-sm text-theme-secondary mb-2">
                Preview da Capa:
              </p>
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-theme-secondary">
                <Image
                  src={formData.coverImageUrl}
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-venue.jpg';
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              className="w-4 h-4 rounded border-theme-secondary"
            />
            <span className="text-sm text-theme-primary">Local Ativo</span>
          </label>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-theme-secondary flex items-center justify-end space-x-3">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          isLoading={isSubmitting}
        >
          {isEditing ? 'Atualizar' : 'Criar'} Local
        </Button>
      </div>
    </Modal>
  );
}
