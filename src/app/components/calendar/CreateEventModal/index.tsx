// ==================== app/components/calendar/CreateEventModal.tsx ====================
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { z } from 'zod';
import { PiCalendarBlank } from 'react-icons/pi';
import { toast } from 'react-hot-toast';
import Modal from '@/app/components/Modal';
import Button from '@/app/components/Common/Button';
import Select from '@/app/components/Common/Select';
import Input from '@/app/components/Common/Inputs';
import { useSmartFormChanges } from '@/app/hooks/useFormChanges';
import { saveEvent } from '@/app/requests/calendar-requests';
import Image from '@/app/components/SmartImage';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Field } from '@/app/components/ui/Field';

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
      await saveEvent(formData, isEditing ? editingEvent.id : undefined);

      toast.success(
        isEditing
          ? 'Evento atualizado com sucesso!'
          : 'Evento criado com sucesso!',
        { icon: '🎉' }
      );
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao salvar evento'
      );
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
        <Inline gap={3}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-theme-glow">
            <PiCalendarBlank className="w-5 h-5 text-theme-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-theme-primary classical-title">
              {isEditing ? 'Editar Evento' : 'Novo Evento'}
            </h2>
            <Text papel="rotulo" tom="suave" as="p">
              {isEditing
                ? 'Atualize as informações do evento'
                : 'Adicione um novo evento ao calendário'}
            </Text>
          </div>
        </Inline>
      </div>

      {/* Form Content */}
      <Stack gap={6} className="px-6 py-6 overflow-y-auto">
        {/* Title */}
        <div>
          <Input
            label="Título do Evento *"
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
            <Select
              label="Tipo de Evento *"
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
            <Select
              label="Status"
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
          <Select
            label="Local *"
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
            <Input
              label="Data de Início *"
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
            <Input
              label="Horário de Início *"
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
          <Field.Area
            label="Descrição"
            classeCampo="resize-none"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={4}
            placeholder="Descreva o evento..."
            maxLength={500}
          />
          <Text papel="legenda" tom="fraco" as="p" className="mt-1">
            {formData.description.length}/500 caracteres
          </Text>
        </div>

        {/* Image URL */}
        <div>
          <Input
            label="Imagem do Evento"
            type="url"
            value={formData.imageUrl}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
            }
            className="w-full input-classical-2"
            placeholder="https://exemplo.com/imagem.jpg"
          />
          {formData.imageUrl && (
            <Stack gap={2} className="mt-3">
              <Text papel="rotulo" tom="suave" as="p">
                Preview:
              </Text>
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
            </Stack>
          )}
        </div>

        {/* Tickets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Link para Ingressos"
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
            <Inline as="label" gap={2} className="cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFree}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, isFree: e.target.checked }))
                }
                className="w-4 h-4 rounded border-theme-secondary"
              />
              <Text papel="rotulo" tom="forte">
                Evento Gratuito
              </Text>
            </Inline>
          </div>
        </div>
      </Stack>

      {/* Footer */}
      <Inline
        gap={3}
        className="px-6 py-4 border-t border-theme-secondary justify-end"
      >
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
      </Inline>
    </Modal>
  );
}
