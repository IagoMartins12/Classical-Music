// app/admin/ads/components/CreateAdModal.tsx - Atualizado com scroll automático
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  FiSave,
  FiPlus,
  FiTarget,
  FiMessageCircle,
  FiInfo,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAds } from '@/app/hooks/admin/useAds';
import Button from '@/app/components/Common/Button';
import Modal from '@/app/components/Modal';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';

interface CreateAdModalProps {
  showCreateModal: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const typeOptions = [
  { value: 'BANNER', label: 'Banner' },
  { value: 'VIDEO', label: 'Vídeo' },
  { value: 'CARD', label: 'Card' },
  { value: 'SIDEBAR', label: 'Sidebar' },
  { value: 'NATIVE', label: 'Nativo' },
  { value: 'POPUP', label: 'Popup' },
];

const placementOptions = [
  { value: 'HEADER', label: 'Header' },
  { value: 'SIDEBAR_LEFT', label: 'Sidebar Esquerda' },
  { value: 'SIDEBAR_RIGHT', label: 'Sidebar Direita' },
  { value: 'CONTENT_TOP', label: 'Acima do Conteúdo' },
  { value: 'CONTENT_BOTTOM', label: 'Abaixo do Conteúdo' },
  { value: 'BETWEEN_CONTENT', label: 'Entre Conteúdos' },
  { value: 'FOOTER', label: 'Footer' },
  { value: 'MODAL', label: 'Modal' },
];

const targetTypeOptions = [
  { value: 'GENERAL', label: 'Geral (Todos os usuários)' },
  { value: 'INSTRUMENT', label: 'Por Instrumento Específico' },
  { value: 'USER_LEVEL', label: 'Por Tipo de Usuário' },
];

const userLevelOptions = [
  { value: 'ALL', label: 'Todos os Usuários' },
  { value: 'STUDENT', label: 'Apenas Estudantes' },
  { value: 'TEACHER', label: 'Apenas Professores' },
];

const linkTypeOptions = [
  { value: 'url', label: 'Site/URL' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

export default function CreateAdModal({
  showCreateModal,
  onClose,
  onSuccess,
}: CreateAdModalProps) {
  const { createAd, loading, checkConflict } = useAds();

  // 🆕 Refs para scroll automático
  const fieldRefs = {
    title: useRef<HTMLInputElement>(null),
    advertiserName: useRef<HTMLInputElement>(null),
    description: useRef<HTMLTextAreaElement>(null),
    type: useRef<HTMLSelectElement>(null),
    placement: useRef<HTMLSelectElement>(null),
    targetType: useRef<HTMLSelectElement>(null),
    instrumentId: useRef<HTMLSelectElement>(null),
    ctaText: useRef<HTMLInputElement>(null),
    targetUrl: useRef<HTMLInputElement>(null),
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    ctaText: '',
    targetUrl: '',
    linkType: 'url',
    isExternal: true,
    type: 'BANNER',
    placement: 'SIDEBAR_RIGHT',
    status: 'DRAFT',
    targetType: 'GENERAL',
    targetUserLevel: 'ALL',
    instrumentId: '',
    advertiserName: '',
    advertiserEmail: '',
    advertiserPhone: '',
    advertiserWebsite: '',
    startDate: '',
    endDate: '',
    showOnMobile: true,
    showOnTablet: true,
    showOnDesktop: true,
  });

  const [availableInstruments, setAvailableInstruments] = useState<any[]>([]);
  const [conflictInfo, setConflictInfo] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Buscar instrumentos disponíveis
  useEffect(() => {
    const fetchInstruments = async () => {
      try {
        const response = await fetch('/api/instruments');
        const data = await response.json();
        setAvailableInstruments(data);
      } catch (error) {
        console.error('Erro ao buscar instrumentos:', error);
      }
    };

    fetchInstruments();
  }, []);

  // Verificar conflitos quando dados relevantes mudarem
  useEffect(() => {
    const checkConflicts = async () => {
      if (!formData.placement || !formData.targetType) return;

      try {
        const result = await checkConflict(
          formData.type,
          formData.placement,
          formData.targetType,
          formData.targetType === 'INSTRUMENT'
            ? formData.instrumentId
            : undefined
        );

        if (result.hasConflict) {
          const conflictMessages = result.conflicts
            ? result.conflicts.map((c: any) => c.message).join(' ')
            : result.message;

          setConflictInfo(conflictMessages);
        } else {
          setConflictInfo(null);
        }
      } catch (error) {
        console.error('Erro ao verificar conflitos:', error);
      }
    };

    checkConflicts();
  }, [
    formData.placement,
    formData.targetType,
    formData.instrumentId,
    checkConflict,
  ]);

  // 🆕 Função para scroll automático para o primeiro erro
  const scrollToFirstError = (errorFields: string[]) => {
    if (errorFields.length > 0) {
      const firstErrorField = errorFields[0] as keyof typeof fieldRefs;
      const fieldRef = fieldRefs[firstErrorField];

      if (fieldRef?.current) {
        fieldRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });

        setTimeout(() => {
          fieldRef.current?.focus();
        }, 500);
      }
    }
  };

  // 🆕 Função de validação com scroll automático
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.advertiserName.trim()) {
      newErrors.advertiserName = 'Nome do anunciante é obrigatório';
    }

    if (formData.targetType === 'INSTRUMENT' && !formData.instrumentId) {
      newErrors.instrumentId =
        'Instrumento é obrigatório para este tipo de segmentação';
    }

    if (formData.linkType === 'whatsapp' && formData.targetUrl) {
      const whatsappNumber = formData.targetUrl.replace(/\D/g, '');
      if (whatsappNumber.length < 10) {
        newErrors.targetUrl =
          'Número do WhatsApp inválido. Use formato: 5511999999999';
      }
    }

    setErrors(newErrors);

    // Scroll para o primeiro erro
    const errorFields = Object.keys(newErrors);
    if (errorFields.length > 0) {
      setTimeout(() => {
        scrollToFirstError(errorFields);
      }, 100);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (conflictInfo) {
      toast.error('Resolva o conflito antes de continuar');
      return;
    }

    try {
      // Preparar dados para envio
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        content: formData.content.trim() || undefined,
        ctaText: formData.ctaText.trim() || undefined,
        targetUrl: formData.targetUrl.trim() || undefined,
        linkType: formData.linkType,
        isExternal: formData.isExternal,
        type: formData.type,
        placement: formData.placement,
        status: formData.status,
        targetType: formData.targetType,
        targetUserLevel: formData.targetUserLevel,
        instrumentId:
          formData.targetType === 'INSTRUMENT'
            ? formData.instrumentId
            : undefined,
        advertiserName: formData.advertiserName.trim(),
        advertiserEmail: formData.advertiserEmail.trim() || undefined,
        advertiserPhone: formData.advertiserPhone.trim() || undefined,
        advertiserWebsite: formData.advertiserWebsite.trim() || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        showOnMobile: formData.showOnMobile,
        showOnTablet: formData.showOnTablet,
        showOnDesktop: formData.showOnDesktop,
      };

      await createAd(submitData);
      toast.success(
        'Anúncio criado com sucesso! Agora adicione a imagem/vídeo.'
      );
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar anúncio');
    }
  };

  return (
    <Modal maxWidth="4xl" isOpen={showCreateModal} onClose={onClose}>
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-primary">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-pink rounded-xl flex items-center justify-center">
              <FiPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-theme-primary">
                Novo Anúncio
              </h2>
              <p className="text-sm text-theme-tertiary">
                Criar nova campanha publicitária
              </p>
            </div>
          </div>
        </div>

        {/* Alert sobre mídia */}
        <div className="p-4 bg-accent-blue/10 border-l-4 border-accent-blue mx-6 mt-4 rounded">
          <div className="flex items-start space-x-3">
            <FiInfo className="w-5 h-5 text-accent-blue mt-0.5" />
            <div>
              <h4 className="font-medium text-theme-primary">Sobre a mídia</h4>
              <p className="text-sm text-theme-secondary mt-1">
                Após criar o anúncio, você precisará fazer upload da imagem ou
                vídeo. O anúncio ficará como rascunho até que a mídia seja
                adicionada.
              </p>
            </div>
          </div>
        </div>

        {/* Conflict Warning */}
        {conflictInfo && (
          <div className="p-4 bg-accent-red/10 border-l-4 border-accent-red mx-6 mt-4 rounded">
            <div className="flex items-start space-x-3">
              <FiTarget className="w-5 h-5 text-accent-red mt-0.5" />
              <div>
                <h4 className="font-medium text-accent-red">
                  Conflito Detectado
                </h4>
                <p className="text-sm text-theme-secondary mt-1">
                  {conflictInfo}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-theme-primary flex items-center space-x-2">
              <FiTarget className="w-5 h-5" />
              <span>Informações Básicas</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Título *
                </label>
                <Input
                  ref={fieldRefs.title}
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Título do anúncio"
                  maxLength={100}
                  className={errors.title ? 'border-accent-red' : ''}
                />
                {errors.title && (
                  <p className="text-accent-red text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Anunciante *
                </label>
                <Input
                  ref={fieldRefs.advertiserName}
                  type="text"
                  value={formData.advertiserName}
                  onChange={(e) =>
                    handleInputChange('advertiserName', e.target.value)
                  }
                  placeholder="Nome do anunciante"
                  maxLength={100}
                  className={errors.advertiserName ? 'border-accent-red' : ''}
                />
                {errors.advertiserName && (
                  <p className="text-accent-red text-sm mt-1">
                    {errors.advertiserName}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Descrição
                </label>
                <textarea
                  ref={fieldRefs.description}
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  rows={3}
                  placeholder="Descrição do anúncio"
                  className="input-classical-2 w-full resize-none"
                  maxLength={300}
                />
              </div>

              <div>
                <Select
                  ref={fieldRefs.type}
                  label="Tipo"
                  options={typeOptions}
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                />
              </div>

              <div>
                <Select
                  ref={fieldRefs.placement}
                  label="Posicionamento"
                  options={placementOptions}
                  value={formData.placement}
                  onChange={(e) =>
                    handleInputChange('placement', e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Segmentação */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-theme-primary flex items-center space-x-2">
              <FiTarget className="w-5 h-5" />
              <span>Segmentação</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Select
                  ref={fieldRefs.targetType}
                  label="Tipo de Segmentação"
                  options={targetTypeOptions}
                  value={formData.targetType}
                  onChange={(e) =>
                    handleInputChange('targetType', e.target.value)
                  }
                />
              </div>

              {formData.targetType === 'USER_LEVEL' && (
                <div>
                  <Select
                    label="Tipo de Usuário"
                    options={userLevelOptions}
                    value={formData.targetUserLevel}
                    onChange={(e) =>
                      handleInputChange('targetUserLevel', e.target.value)
                    }
                  />
                </div>
              )}

              {formData.targetType === 'INSTRUMENT' && (
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    Instrumento *
                  </label>
                  <select
                    ref={fieldRefs.instrumentId}
                    value={formData.instrumentId}
                    onChange={(e) =>
                      handleInputChange('instrumentId', e.target.value)
                    }
                    className={`input-classical-2 w-full ${
                      errors.instrumentId ? 'border-accent-red' : ''
                    }`}
                  >
                    <option value="">Selecione um instrumento</option>
                    {availableInstruments.map((instrument) => (
                      <option key={instrument.id} value={instrument.id}>
                        {instrument.name}
                      </option>
                    ))}
                  </select>
                  {errors.instrumentId && (
                    <p className="text-accent-red text-sm mt-1">
                      {errors.instrumentId}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Link e Call-to-Action */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-theme-primary flex items-center space-x-2">
              <FiMessageCircle className="w-5 h-5" />
              <span>Call-to-Action</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Select
                  label="Tipo de Link"
                  options={linkTypeOptions}
                  value={formData.linkType}
                  onChange={(e) =>
                    handleInputChange('linkType', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  {formData.linkType === 'whatsapp'
                    ? 'Número do WhatsApp'
                    : 'URL de Destino'}
                </label>
                <Input
                  ref={fieldRefs.targetUrl}
                  type={formData.linkType === 'whatsapp' ? 'tel' : 'url'}
                  value={formData.targetUrl}
                  onChange={(e) =>
                    handleInputChange('targetUrl', e.target.value)
                  }
                  placeholder={
                    formData.linkType === 'whatsapp'
                      ? '5511999999999'
                      : 'https://exemplo.com'
                  }
                  className={errors.targetUrl ? 'border-accent-red' : ''}
                />
                {formData.linkType === 'whatsapp' && (
                  <p className="text-xs text-theme-tertiary mt-1">
                    Formato: código do país + DDD + número (ex: 5511999999999)
                  </p>
                )}
                {errors.targetUrl && (
                  <p className="text-accent-red text-sm mt-1">
                    {errors.targetUrl}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Texto do Botão
                </label>
                <Input
                  ref={fieldRefs.ctaText}
                  type="text"
                  value={formData.ctaText}
                  onChange={(e) => handleInputChange('ctaText', e.target.value)}
                  placeholder={
                    formData.linkType === 'whatsapp'
                      ? 'Falar no WhatsApp'
                      : 'Saiba Mais'
                  }
                  maxLength={50}
                />
              </div>
            </div>
          </div>

          {/* Dados do Anunciante */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-theme-primary">
              Contato do Anunciante
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.advertiserEmail}
                  onChange={(e) =>
                    handleInputChange('advertiserEmail', e.target.value)
                  }
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Telefone
                </label>
                <Input
                  type="tel"
                  value={formData.advertiserPhone}
                  onChange={(e) =>
                    handleInputChange('advertiserPhone', e.target.value)
                  }
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Site
                </label>
                <Input
                  type="url"
                  value={formData.advertiserWebsite}
                  onChange={(e) =>
                    handleInputChange('advertiserWebsite', e.target.value)
                  }
                  placeholder="https://exemplo.com"
                />
              </div>
            </div>
          </div>

          {/* Configurações */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-theme-primary">
              Configurações
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Data de Início
                </label>
                <Input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) =>
                    handleInputChange('startDate', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Data de Fim
                </label>
                <Input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>
            </div>

            {/* Dispositivos */}
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Exibir em:
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <Input
                    type="checkbox"
                    checked={formData.showOnMobile}
                    onChange={(e) =>
                      handleInputChange('showOnMobile', e.target.checked)
                    }
                    className="rounded border-theme-primary"
                  />
                  <span className="text-sm text-theme-primary">Mobile</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Input
                    type="checkbox"
                    checked={formData.showOnTablet}
                    onChange={(e) =>
                      handleInputChange('showOnTablet', e.target.checked)
                    }
                    className="rounded border-theme-primary"
                  />
                  <span className="text-sm text-theme-primary">Tablet</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Input
                    type="checkbox"
                    checked={formData.showOnDesktop}
                    onChange={(e) =>
                      handleInputChange('showOnDesktop', e.target.checked)
                    }
                    className="rounded border-theme-primary"
                  />
                  <span className="text-sm text-theme-primary">Desktop</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-theme-primary">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              leftIcon={<FiSave />}
              disabled={loading || !!conflictInfo}
              isLoading={loading}
            >
              Criar Anúncio
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
