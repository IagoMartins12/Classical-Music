// ==================== app/components/calendar/CreateEventModal.tsx ====================
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { z } from 'zod';
import { FiCalendar } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Modal from '@/app/components/Modal';
import Button from '@/app/components/Common/Button';
import Select from '@/app/components/Common/Select';
import Input from '@/app/components/Common/Inputs';
import { useSmartFormChanges } from '@/app/hooks/useFormChanges';
import Image from 'next/image';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  venues: Array<{ id: string; name: string; city: string }>;
  editingEvent?: any;
}

export default function CreateEventModal({
  isOpen,
  onClose,
  onSuccess,
  venues,
  editingEvent,
}: CreateEventModalProps) {
  const isEditing = !!editingEvent;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eventSchema = useMemo(
    () =>
      z.object({
        title: z
          .string()
          .min(1, 'Título é obrigatório')
          .min(3, 'Título deve ter no mínimo 3 caracteres')
          .max(200, 'Título deve ter no máximo 200 caracteres'),
        venueId: z.string().min(1, 'Venue é obrigatória'),
        startDate: z.string().min(1, 'Data de início é obrigatória'),
        startTime: z.string().min(1, 'Horário de início é obrigatório'),
        type: z.enum([
          'CONCERT',
          'RECITAL',
          'OPEN_REHEARSAL',
          'OPERA',
          'CHAMBER_MUSIC',
          'ORCHESTRA',
          'MASTERCLASS',
          'WORKSHOP',
          'FESTIVAL',
          'COMPETITION',
          'LECTURE',
          'EXHIBITION',
          'OTHER',
        ]),
      }),
    []
  );

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    type: 'CONCERT' as any,
    status: 'PUBLISHED',
    venueId: '',
    room: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    duration: '',
    doors: '',
    conductor: '',
    ensemble: '',
    ticketUrl: '',
    isFree: false,
    imageUrl: '',
    venueDetails: '',
    ticketInfo: '',
  });

  const originalData = useMemo(() => {
    if (!editingEvent) return null;
    return {
      title: editingEvent.title || '',
      subtitle: editingEvent.subtitle || '',
      description: editingEvent.description || '',
      type: editingEvent.type || 'CONCERT',
      status: editingEvent.status || 'PUBLISHED',
      venueId: editingEvent.venueId || '',
      room: editingEvent.room || '',
      startDate: editingEvent.startDate
        ? new Date(editingEvent.startDate).toISOString().split('T')[0]
        : '',
      endDate: editingEvent.endDate
        ? new Date(editingEvent.endDate).toISOString().split('T')[0]
        : '',
      startTime: editingEvent.startTime || '',
      endTime: editingEvent.endTime || '',
      duration: editingEvent.duration?.toString() || '',
      doors: editingEvent.doors || '',
      conductor: editingEvent.conductor || '',
      ensemble: editingEvent.ensemble || '',
      ticketUrl: editingEvent.ticketUrl || '',
      isFree: editingEvent.isFree || false,
      imageUrl: editingEvent.imageUrl || '',
      venueDetails: editingEvent.venueDetails || '',
      ticketInfo: editingEvent.ticketInfo || '',
    };
  }, [editingEvent]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const hasChanges = useSmartFormChanges(formData, originalData, [
    'type',
    'status',
    'venueId',
    'isFree',
  ]);

  const fieldRefs = {
    title: useRef<HTMLInputElement>(null),
    venueId: useRef<HTMLSelectElement>(null),
    startDate: useRef<HTMLInputElement>(null),
    startTime: useRef<HTMLInputElement>(null),
  };

  const EVENT_TYPE_OPTIONS = [
    { value: 'CONCERT', label: '🎼 Concerto' },
    { value: 'RECITAL', label: '🎹 Recital' },
    { value: 'OPERA', label: '🎭 Ópera' },
    { value: 'CHAMBER_MUSIC', label: '🎻 Música de Câmara' },
    { value: 'ORCHESTRA', label: '🎺 Orquestra Sinfônica' },
    { value: 'MASTERCLASS', label: '🎓 Masterclass' },
    { value: 'WORKSHOP', label: '🔧 Workshop' },
    { value: 'FESTIVAL', label: '🎪 Festival' },
    { value: 'COMPETITION', label: '🏆 Competição' },
    { value: 'LECTURE', label: '📚 Palestra' },
    { value: 'EXHIBITION', label: '🖼️ Exposição' },
    { value: 'OPEN_REHEARSAL', label: '📝 Ensaio Aberto' },
    { value: 'OTHER', label: '📌 Outro' },
  ];

  const STATUS_OPTIONS = [
    { value: 'DRAFT', label: 'Rascunho' },
    { value: 'PENDING', label: 'Pendente' },
    { value: 'PUBLISHED', label: 'Publicado' },
    { value: 'CANCELLED', label: 'Cancelado' },
    { value: 'POSTPONED', label: 'Adiado' },
    { value: 'COMPLETED', label: 'Finalizado' },
  ];

  useEffect(() => {
    if (isEditing && editingEvent) {
      setFormData({
        title: editingEvent.title || '',
        subtitle: editingEvent.subtitle || '',
        description: editingEvent.description || '',
        type: editingEvent.type || 'CONCERT',
        status: editingEvent.status || 'PUBLISHED',
        venueId: editingEvent.venueId || '',
        room: editingEvent.room || '',
        startDate: editingEvent.startDate
          ? new Date(editingEvent.startDate).toISOString().split('T')[0]
          : '',
        endDate: editingEvent.endDate
          ? new Date(editingEvent.endDate).toISOString().split('T')[0]
          : '',
        startTime: editingEvent.startTime || '',
        endTime: editingEvent.endTime || '',
        duration: editingEvent.duration?.toString() || '',
        doors: editingEvent.doors || '',
        conductor: editingEvent.conductor || '',
        ensemble: editingEvent.ensemble || '',
        ticketUrl: editingEvent.ticketUrl || '',
        isFree: editingEvent.isFree || false,
        imageUrl: editingEvent.imageUrl || '',
        venueDetails: editingEvent.venueDetails || '',
        ticketInfo: editingEvent.ticketInfo || '',
      });
    } else {
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        type: 'CONCERT',
        status: 'PUBLISHED',
        venueId: '',
        room: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        duration: '',
        doors: '',
        conductor: '',
        ensemble: '',
        ticketUrl: '',
        isFree: false,
        imageUrl: '',
        venueDetails: '',
        ticketInfo: '',
      });
    }
    setErrors({});
  }, [isEditing, editingEvent, isOpen]);

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
      eventSchema.parse(formData);
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
        duration: formData.duration ? parseInt(formData.duration) : undefined,
      };

      const url = isEditing ? `/api/events/${editingEvent.id}` : '/api/events';
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
            ? 'Evento atualizado com sucesso!'
            : 'Evento criado com sucesso!',
          { icon: '🎉' }
        );
        onSuccess?.();
        onClose();
      } else {
        toast.error(data.error || 'Erro ao salvar evento');
      }
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      toast.error('Erro ao salvar evento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      showCloseButton
      confirmOnClose
      hasChanges={hasChanges}
      isProcessing={isSubmitting}
      processName="Salvamento de evento"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-theme-secondary">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-theme-glow">
            <FiCalendar className="w-5 h-5 text-theme-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-theme-primary classical-title">
              {isEditing ? 'Editar Evento' : 'Novo Evento'}
            </h2>
            <p className="text-sm text-theme-secondary">
              {isEditing
                ? 'Atualize as informações do evento'
                : 'Adicione um novo evento ao calendário'}
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-6 py-6 space-y-6 overflow-y-auto ">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-theme-primary mb-2">
            Título do Evento *
          </label>
          <Input
            ref={fieldRefs.title}
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className={`w-full input-classical-2 ${
              errors.title ? '!border-red-400' : ''
            }`}
            placeholder="Ex: Concerto de Ano Novo"
            maxLength={200}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Type and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Tipo de Evento *
            </label>
            <Select
              options={EVENT_TYPE_OPTIONS}
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  type: e.target.value as any,
                }))
              }
              className="w-full input-classical-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Status
            </label>
            <Select
              options={STATUS_OPTIONS}
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full input-classical-2"
            />
          </div>
        </div>

        {/* Venue */}
        <div>
          <label className="block text-sm font-medium text-theme-primary mb-2">
            Local *
          </label>
          <Select
            ref={fieldRefs.venueId}
            options={[
              { value: '', label: 'Selecione um local' },
              ...venues.map((v) => ({
                value: v.id,
                label: `${v.name} - ${v.city}`,
              })),
            ]}
            value={formData.venueId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, venueId: e.target.value }))
            }
            className={`w-full input-classical-2 ${
              errors.venueId ? '!border-red-400' : ''
            }`}
          />
          {errors.venueId && (
            <p className="text-red-500 text-sm mt-1">{errors.venueId}</p>
          )}
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Data de Início *
            </label>
            <Input
              ref={fieldRefs.startDate}
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className={`w-full input-classical-2 ${
                errors.startDate ? '!border-red-400' : ''
              }`}
            />
            {errors.startDate && (
              <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Horário de Início *
            </label>
            <Input
              ref={fieldRefs.startTime}
              type="time"
              value={formData.startTime}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, startTime: e.target.value }))
              }
              className={`w-full input-classical-2 ${
                errors.startTime ? '!border-red-400' : ''
              }`}
            />
            {errors.startTime && (
              <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
            )}
          </div>
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
            placeholder="Descreva o evento..."
            maxLength={500}
          />
          <p className="text-theme-tertiary text-xs mt-1">
            {formData.description.length}/500 caracteres
          </p>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-theme-primary mb-2">
            Imagem do Evento
          </label>
          <Input
            type="url"
            value={formData.imageUrl}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
            }
            className="w-full input-classical-2"
            placeholder="https://exemplo.com/imagem.jpg"
          />
          {formData.imageUrl && (
            <div className="mt-3">
              <p className="text-sm text-theme-secondary mb-2">Preview:</p>
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-theme-secondary">
                <Image
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-event.jpg';
                  }}
                  height={100}
                  width={100}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tickets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Link para Ingressos
            </label>
            <Input
              type="url"
              value={formData.ticketUrl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, ticketUrl: e.target.value }))
              }
              className="w-full input-classical-2"
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center pt-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFree}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, isFree: e.target.checked }))
                }
                className="w-4 h-4 rounded border-theme-secondary"
              />
              <span className="text-sm text-theme-primary">
                Evento Gratuito
              </span>
            </label>
          </div>
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
          {isEditing ? 'Atualizar' : 'Criar'} Evento
        </Button>
      </div>
    </Modal>
  );
}
