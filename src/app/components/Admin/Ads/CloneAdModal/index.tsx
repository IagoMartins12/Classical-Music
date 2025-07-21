// app/admin/ads/components/CloneAdModal.tsx - Modal para clonar anúncios
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  FiCopy,
  FiEdit,
  FiTarget,
  FiSettings,
  FiInfo,
  FiMessageCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAds } from '@/app/hooks/admin/useAds';
import Button from '@/app/components/Common/Button';
import Modal from '@/app/components/Modal';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';

interface CloneAdModalProps {
  ad: any;
  onClose: () => void;
  onSuccess: () => void;
}

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

const statusOptions = [
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'SCHEDULED', label: 'Agendado' },
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'PAUSED', label: 'Pausado' },
];

const linkTypeOptions = [
  { value: 'url', label: 'Site/URL' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

// Função para formatar número de telefone
const formatPhoneNumber = (value: string) => {
  const numbers = value.replace(/\D/g, '');

  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
      7
    )}`;
  } else {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
      7,
      11
    )}`;
  }
};

export default function CloneAdModal({
  ad,
  onClose,
  onSuccess,
}: CloneAdModalProps) {
  const { cloneAd, loading, checkConflict } = useAds();

  // Refs para scroll automático
  const fieldRefs = {
    title: useRef<HTMLInputElement>(null),
    advertiserName: useRef<HTMLInputElement>(null),
    description: useRef<HTMLTextAreaElement>(null),
    placement: useRef<HTMLSelectElement>(null),
    targetType: useRef<HTMLSelectElement>(null),
    instrumentId: useRef<HTMLSelectElement>(null),
    ctaText: useRef<HTMLInputElement>(null),
    targetUrl: useRef<HTMLInputElement>(null),
    advertiserPhone: useRef<HTMLInputElement>(null),
  };

  const [availableInstruments, setAvailableInstruments] = useState<any[]>([]);
  const [conflictInfo, setConflictInfo] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [modifications, setModifications] = useState({
    title: `${ad?.title || ''} - Cópia`,
    description: ad?.description || '',
    placement: ad?.placement || 'SIDEBAR_RIGHT',
    targetType: ad?.targetType || 'GENERAL',
    targetUserLevel: ad?.targetUserLevel || 'ALL',
    instrumentId: ad?.instrumentId || '',
    status: 'DRAFT',
    advertiserName: ad?.advertiserName || '',
    advertiserEmail: ad?.advertiserEmail || '',
    advertiserPhone: ad?.advertiserPhone || '',
    advertiserWebsite: ad?.advertiserWebsite || '',
    showOnMobile: ad?.showOnMobile ?? true,
    showOnTablet: ad?.showOnTablet ?? true,
    showOnDesktop: ad?.showOnDesktop ?? true,
    ctaText: ad?.ctaText || '',
    targetUrl: ad?.targetUrl || '',
    linkType: ad?.linkType || 'url',
    isExternal: ad?.isExternal ?? true,
    startDate: '',
    endDate: '',
  });

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
      if (!modifications.placement || !modifications.targetType) return;

      try {
        const result = await checkConflict(
          modifications.placement,
          modifications.targetType,
          modifications.targetType === 'INSTRUMENT'
            ? modifications.instrumentId
            : undefined
        );

        if (result.hasConflict) {
          setConflictInfo(result.message);
        } else {
          setConflictInfo(null);
        }
      } catch (error) {
        console.error('Erro ao verificar conflitos:', error);
      }
    };

    checkConflicts();
  }, [
    modifications.placement,
    modifications.targetType,
    modifications.instrumentId,
    checkConflict,
  ]);

  // Função para scroll automático para o primeiro erro
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

  // Função de validação com scroll automático
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!modifications.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!modifications.advertiserName.trim()) {
      newErrors.advertiserName = 'Nome do anunciante é obrigatório';
    }

    if (
      modifications.targetType === 'INSTRUMENT' &&
      !modifications.instrumentId
    ) {
      newErrors.instrumentId =
        'Instrumento é obrigatório para este tipo de segmentação';
    }

    if (modifications.linkType === 'whatsapp' && modifications.targetUrl) {
      const whatsappNumber = modifications.targetUrl.replace(/\D/g, '');
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
    // Aplicar formatação especial para telefone
    if (field === 'advertiserPhone' && typeof value === 'string') {
      value = formatPhoneNumber(value);
    }

    setModifications((prev) => ({
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
        title: modifications.title.trim(),
        description: modifications.description.trim() || undefined,
        placement: modifications.placement,
        targetType: modifications.targetType,
        targetUserLevel: modifications.targetUserLevel,
        instrumentId:
          modifications.targetType === 'INSTRUMENT'
            ? modifications.instrumentId
            : undefined,
        status: modifications.status,
        advertiserName: modifications.advertiserName.trim(),
        advertiserEmail: modifications.advertiserEmail.trim() || undefined,
        advertiserPhone:
          modifications.advertiserPhone.replace(/\D/g, '') || undefined, // Salvar apenas números
        advertiserWebsite: modifications.advertiserWebsite.trim() || undefined,
        showOnMobile: modifications.showOnMobile,
        showOnTablet: modifications.showOnTablet,
        showOnDesktop: modifications.showOnDesktop,
        ctaText: modifications.ctaText.trim() || undefined,
        targetUrl: modifications.targetUrl.trim() || undefined,
        linkType: modifications.linkType,
        isExternal: modifications.isExternal,
        startDate: modifications.startDate || undefined,
        endDate: modifications.endDate || undefined,
      };

      await cloneAd(ad.id, submitData);
      toast.success('Anúncio clonado com sucesso!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao clonar anúncio');
    }
  };

  return (
    <Modal maxWidth="4xl" isOpen={!!ad} onClose={onClose}>
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-primary">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-blue rounded-2xl flex items-center justify-center">
              <FiCopy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-theme-primary">
                Clonar Anúncio
              </h2>
              <p className="text-sm text-theme-tertiary">
                Criar uma cópia modificada de: {ad?.title}
              </p>
            </div>
          </div>
        </div>

        {/* Info sobre clonagem */}
        <div className="p-4 bg-accent-blue/10 border-l-4 border-accent-blue mx-6 mt-4 rounded">
          <div className="flex items-start space-x-3">
            <FiInfo className="w-5 h-5 text-accent-blue mt-0.5" />
            <div>
              <h4 className="font-medium text-theme-primary">
                🔄 Como funciona a clonagem
              </h4>
              <ul className="text-sm text-theme-secondary mt-1 space-y-1">
                <li>• Todas as configurações são copiadas</li>
                <li>• Mídia é duplicada fisicamente (cópias independentes)</li>
                <li>• Sempre começa como "Rascunho" para evitar conflitos</li>
                <li>
                  • Você pode modificar qualquer configuração antes de criar
                </li>
              </ul>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Preview do anúncio original */}
          <div className="classical-card p-4 bg-theme-secondary/20">
            <h3 className="font-semibold text-theme-primary mb-3 flex items-center">
              <FiTarget className="w-5 h-5 mr-2" />
              Anúncio Original
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-theme-tertiary">Posicionamento</div>
                <div className="font-medium text-theme-primary">
                  {ad?.placement}
                </div>
              </div>
              <div>
                <div className="text-theme-tertiary">Targeting</div>
                <div className="font-medium text-theme-primary">
                  {ad?.targetType}
                  {ad?.instrument && ` (${ad.instrument.name})`}
                </div>
              </div>
              <div>
                <div className="text-theme-tertiary">Status</div>
                <div className="font-medium text-theme-primary">
                  {ad?.status}
                </div>
              </div>
            </div>

            {(ad?.imageUrl || ad?.videoUrl) && (
              <div className="mt-3 flex items-center text-xs text-accent-green">
                <FiInfo className="w-3 h-3 mr-1" />
                Mídia será copiada automaticamente
              </div>
            )}
          </div>

          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-theme-primary flex items-center space-x-2">
              <FiEdit className="w-5 h-5" />
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
                  value={modifications.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Título do anúncio clonado"
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
                  value={modifications.advertiserName}
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
                  value={modifications.description}
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
                  ref={fieldRefs.placement}
                  label="Novo Posicionamento"
                  options={placementOptions}
                  value={modifications.placement}
                  onChange={(e) =>
                    handleInputChange('placement', e.target.value)
                  }
                />
              </div>

              <div>
                <Select
                  label="Status Inicial"
                  options={statusOptions}
                  value={modifications.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
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
                  value={modifications.targetType}
                  onChange={(e) =>
                    handleInputChange('targetType', e.target.value)
                  }
                />
              </div>

              {modifications.targetType === 'USER_LEVEL' && (
                <div>
                  <Select
                    label="Nível de Usuário"
                    options={userLevelOptions}
                    value={modifications.targetUserLevel}
                    onChange={(e) =>
                      handleInputChange('targetUserLevel', e.target.value)
                    }
                  />
                </div>
              )}

              {modifications.targetType === 'INSTRUMENT' && (
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    Instrumento *
                  </label>
                  <select
                    ref={fieldRefs.instrumentId}
                    value={modifications.instrumentId}
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
                  value={modifications.linkType}
                  onChange={(e) =>
                    handleInputChange('linkType', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  {modifications.linkType === 'whatsapp'
                    ? 'Número do WhatsApp'
                    : 'URL de Destino'}
                </label>
                <Input
                  ref={fieldRefs.targetUrl}
                  type={modifications.linkType === 'whatsapp' ? 'tel' : 'url'}
                  value={modifications.targetUrl}
                  onChange={(e) =>
                    handleInputChange('targetUrl', e.target.value)
                  }
                  placeholder={
                    modifications.linkType === 'whatsapp'
                      ? '5511999999999'
                      : 'https://exemplo.com'
                  }
                  className={errors.targetUrl ? 'border-accent-red' : ''}
                />
                {modifications.linkType === 'whatsapp' && (
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
                  value={modifications.ctaText}
                  onChange={(e) => handleInputChange('ctaText', e.target.value)}
                  placeholder={
                    modifications.linkType === 'whatsapp'
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
                  value={modifications.advertiserEmail}
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
                  ref={fieldRefs.advertiserPhone}
                  type="tel"
                  value={modifications.advertiserPhone}
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
                  value={modifications.advertiserWebsite}
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
            <h3 className="text-lg font-semibold text-theme-primary flex items-center space-x-2">
              <FiSettings className="w-4 h-4" />
              <span>Configurações</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Data de Início
                </label>
                <Input
                  type="datetime-local"
                  value={modifications.startDate}
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
                  value={modifications.endDate}
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
                    checked={modifications.showOnMobile}
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
                    checked={modifications.showOnTablet}
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
                    checked={modifications.showOnDesktop}
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

          {/* Sumário das mudanças */}
          <div className="classical-card p-4 bg-accent-green/5 border border-accent-green/20">
            <h4 className="font-medium text-theme-primary mb-3 flex items-center">
              <FiInfo className="w-4 h-4 mr-2" />
              Resumo das Alterações
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="space-y-2">
                  {modifications.title !== ad?.title && (
                    <div className="flex">
                      <span className="text-theme-tertiary w-20">Título:</span>
                      <span className="text-theme-primary font-medium">
                        {modifications.title}
                      </span>
                    </div>
                  )}

                  {modifications.placement !== ad?.placement && (
                    <div className="flex">
                      <span className="text-theme-tertiary w-20">Local:</span>
                      <span className="text-theme-primary font-medium">
                        {modifications.placement}
                      </span>
                    </div>
                  )}

                  {modifications.status !== ad?.status && (
                    <div className="flex">
                      <span className="text-theme-tertiary w-20">Status:</span>
                      <span className="text-theme-primary font-medium">
                        {modifications.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="space-y-2">
                  {modifications.targetType !== ad?.targetType && (
                    <div className="flex">
                      <span className="text-theme-tertiary w-24">
                        Targeting:
                      </span>
                      <span className="text-theme-primary font-medium">
                        {modifications.targetType}
                      </span>
                    </div>
                  )}

                  {modifications.instrumentId !== ad?.instrumentId &&
                    modifications.targetType === 'INSTRUMENT' && (
                      <div className="flex">
                        <span className="text-theme-tertiary w-24">
                          Instrumento:
                        </span>
                        <span className="text-theme-primary font-medium">
                          {availableInstruments.find(
                            (i) => i.id === modifications.instrumentId
                          )?.name || 'Selecionado'}
                        </span>
                      </div>
                    )}
                </div>
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
              leftIcon={<FiCopy />}
              disabled={loading || !!conflictInfo}
              loading={loading}
            >
              {loading ? 'Clonando...' : 'Clonar Anúncio'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
