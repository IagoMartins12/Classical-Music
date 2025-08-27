// app/admin/ads/components/CloneAdModal.tsx - Modal para clonagem com nova estrutura
'use client';

import { useState, useEffect } from 'react';
import {
  FiCopy,
  FiTarget,
  FiMessageCircle,
  FiInfo,
  FiAlertTriangle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAds } from '@/app/hooks/admin/useAds';
import Button from '@/app/components/Common/Button';
import Modal from '@/app/components/Modal';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import Checkbox from '@/app/components/Common/Checkbox';

interface CloneAdModalProps {
  ad: any;
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

export default function CloneAdModal({
  ad,
  onClose,
  onSuccess,
}: CloneAdModalProps) {
  const { cloneAd, loading, checkConflict } = useAds();

  const [formData, setFormData] = useState({
    title: `${ad.title} - Cópia`,
    description: ad.description || '',
    content: ad.content || '',
    ctaText: ad.ctaText || '',
    targetUrl: ad.targetUrl || '',
    linkType: ad.linkType || 'url',
    isExternal: ad.isExternal ?? true,
    type: ad.type || 'BANNER',
    placement: ad.placement || 'SIDEBAR_RIGHT',
    status: 'DRAFT', // Sempre começar como DRAFT
    targetType: ad.targetType || 'GENERAL',
    targetUserLevel: ad.targetUserLevel || 'ALL',
    instrumentId: ad.instrumentId || '',
    advertiserName: ad.advertiserName || '',
    advertiserEmail: ad.advertiserEmail || '',
    advertiserPhone: ad.advertiserPhone || '',
    advertiserWebsite: ad.advertiserWebsite || '',
    startDate: '',
    endDate: '',
    showOnMobile: ad.showOnMobile ?? true,
    showOnTablet: ad.showOnTablet ?? true,
    showOnDesktop: ad.showOnDesktop ?? true,
  });

  const [availableInstruments, setAvailableInstruments] = useState<any[]>([]);
  const [conflictInfo, setConflictInfo] = useState<any>(null);
  const [hasMedia, setHasMedia] = useState(false);

  // Verificar se o ad original tem mídia
  useEffect(() => {
    const originalHasMedia = !!(
      ad.imageUrl ||
      ad.videoUrl ||
      ad.imageVersions ||
      ad.videoVersions
    );
    setHasMedia(originalHasMedia);
  }, [ad]);

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
      if (!formData.placement || !formData.targetType || !formData.type) return;

      try {
        const result = await checkConflict(
          formData.type,
          formData.placement,
          formData.targetType,
          formData.targetType === 'INSTRUMENT'
            ? formData.instrumentId
            : undefined
        );

        // 🆕 Tratar resposta detalhada
        if (result.hasConflict) {
          setConflictInfo({
            hasConflict: true,
            summary: result.summary || result.message,
            conflicts: result.conflicts || [
              {
                type: 'LEGACY_CONFLICT',
                message: result.message,
                conflictingAd: result.conflictingAd,
              },
            ],
            suggestions: [],
          });
        } else {
          setConflictInfo(null);
        }
      } catch (error) {
        console.error('Erro ao verificar conflitos:', error);
        setConflictInfo(null);
      }
    };

    checkConflicts();
  }, [
    formData.placement,
    formData.targetType,
    formData.instrumentId,
    formData.type,

    checkConflict,
  ]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    if (!formData.advertiserName.trim()) {
      toast.error('Nome do anunciante é obrigatório');
      return;
    }

    if (formData.targetType === 'INSTRUMENT' && !formData.instrumentId) {
      toast.error('Instrumento é obrigatório para este tipo de segmentação');
      return;
    }

    if (conflictInfo && conflictInfo.hasConflict) {
      toast.error('Resolva os conflitos antes de continuar');
      return;
    }

    try {
      // Preparar apenas as modificações (diferentes do original)
      const modifications: any = {};

      // Comparar campos e incluir apenas os diferentes
      if (formData.title !== `${ad.title} - Cópia`)
        modifications.title = formData.title;
      if (formData.description !== (ad.description || ''))
        modifications.description = formData.description;
      if (formData.content !== (ad.content || ''))
        modifications.content = formData.content;
      if (formData.ctaText !== (ad.ctaText || ''))
        modifications.ctaText = formData.ctaText;
      if (formData.targetUrl !== (ad.targetUrl || ''))
        modifications.targetUrl = formData.targetUrl;
      if (formData.linkType !== ad.linkType)
        modifications.linkType = formData.linkType;
      if (formData.isExternal !== ad.isExternal)
        modifications.isExternal = formData.isExternal;
      if (formData.type !== ad.type) modifications.type = formData.type;
      if (formData.placement !== ad.placement)
        modifications.placement = formData.placement;
      if (formData.targetType !== ad.targetType)
        modifications.targetType = formData.targetType;
      if (formData.targetUserLevel !== ad.targetUserLevel)
        modifications.targetUserLevel = formData.targetUserLevel;
      if (formData.instrumentId !== (ad.instrumentId || ''))
        modifications.instrumentId = formData.instrumentId || null;
      if (formData.advertiserName !== ad.advertiserName)
        modifications.advertiserName = formData.advertiserName;
      if (formData.advertiserEmail !== (ad.advertiserEmail || ''))
        modifications.advertiserEmail = formData.advertiserEmail;
      if (formData.advertiserPhone !== (ad.advertiserPhone || ''))
        modifications.advertiserPhone = formData.advertiserPhone;
      if (formData.advertiserWebsite !== (ad.advertiserWebsite || ''))
        modifications.advertiserWebsite = formData.advertiserWebsite;
      if (formData.showOnMobile !== ad.showOnMobile)
        modifications.showOnMobile = formData.showOnMobile;
      if (formData.showOnTablet !== ad.showOnTablet)
        modifications.showOnTablet = formData.showOnTablet;
      if (formData.showOnDesktop !== ad.showOnDesktop)
        modifications.showOnDesktop = formData.showOnDesktop;

      // Sempre incluir título (mesmo que seja o padrão) e datas
      if (!modifications.title) {
        modifications.title = formData.title;
      }

      if (formData.startDate) modifications.startDate = formData.startDate;
      if (formData.endDate) modifications.endDate = formData.endDate;

      await cloneAd(ad.id, modifications);

      if (hasMedia) {
        toast.success('✅ Anúncio clonado com mídia copiada!');
      } else {
        toast.success('✅ Anúncio clonado! Adicione mídia se necessário.');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Erro ao clonar:', error);

      // 🆕 Tratamento detalhado de erros
      if (error.message && typeof error.message === 'string') {
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.details && errorData.details.conflicts) {
            // Erro com conflitos detalhados
            setConflictInfo({
              hasConflict: true,
              summary: errorData.details.summary,
              conflicts: errorData.details.conflicts,
              suggestions: errorData.details.suggestions || [],
            });

            toast.error(
              `Conflitos detectados: ${errorData.details.conflicts.length} problema(s) encontrado(s)`
            );
            return;
          }
        } catch {
          // Se não conseguir fazer parse, tratar como erro normal
        }
      }

      // Erro normal
      toast.error(error.message || 'Erro ao clonar anúncio');
    }
  };

  return (
    <Modal
      maxWidth="4xl"
      isOpen={!!ad}
      onClose={onClose}
      confirmOnClose
      withouVerification
    >
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-primary">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-pink rounded-xl flex items-center justify-center">
              <FiCopy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-theme-primary">
                Clonar Anúncio
              </h2>
              <p className="text-sm text-theme-tertiary">
                Criar cópia de &quot;{ad.title}&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Alert sobre mídia */}
        {hasMedia && (
          <div className="p-4 bg-accent-green/10 border-l-4 border-accent-green mx-6 mt-4 rounded">
            <div className="flex items-start space-x-3">
              <FiInfo className="w-5 h-5 text-accent-green mt-0.5" />
              <div>
                <h4 className="font-medium text-theme-primary">
                  Mídia será clonada
                </h4>
                <p className="text-sm text-theme-secondary mt-1">
                  📁 A mídia do anúncio original será copiada para uma nova
                  pasta exclusiva do clone. Todas as versões responsivas serão
                  duplicadas automaticamente.
                </p>
              </div>
            </div>
          </div>
        )}

        {!hasMedia && (
          <div className="p-4 bg-accent-amber/10 border-l-4 border-accent-amber mx-6 mt-4 rounded">
            <div className="flex items-start space-x-3">
              <FiAlertTriangle className="w-5 h-5 text-accent-amber mt-0.5" />
              <div>
                <h4 className="font-medium text-theme-primary">
                  Sem mídia para clonar
                </h4>
                <p className="text-sm text-theme-secondary mt-1">
                  O anúncio original não possui mídia. Após clonar, você
                  precisará fazer upload de imagem ou vídeo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Conflict Warning - Atualizado para mostrar detalhes */}
        {conflictInfo && (
          <div className="p-4 bg-accent-red/10 border-l-4 border-accent-red mx-6 mt-4 rounded">
            <div className="flex items-start space-x-3">
              <FiTarget className="w-5 h-5 text-accent-red mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-accent-red mb-2">
                  Conflitos Detectados
                </h4>

                {conflictInfo.summary && (
                  <p className="text-sm text-theme-secondary mb-3">
                    {conflictInfo.summary}
                  </p>
                )}

                {conflictInfo.conflicts &&
                  conflictInfo.conflicts.length > 0 && (
                    <div className="space-y-3">
                      {conflictInfo.conflicts.map(
                        (conflict: any, index: number) => (
                          <div
                            key={index}
                            className="p-3 bg-white/50 rounded border border-accent-red/20"
                          >
                            <div className="font-medium text-sm text-accent-red mb-1">
                              {conflict.type.replace(/_/g, ' ')}
                            </div>
                            <div className="text-xs text-theme-secondary mb-2">
                              {conflict.message}
                            </div>

                            {conflict.conflictingAd && (
                              <div className="text-xs text-theme-tertiary">
                                Anúncio conflitante:{' '}
                                <strong>{conflict.conflictingAd.title}</strong>
                                {conflict.conflictingAd.instrumentName && (
                                  <span>
                                    {' '}
                                    ({conflict.conflictingAd.instrumentName})
                                  </span>
                                )}
                              </div>
                            )}

                            {conflict.affectedFields &&
                              conflict.affectedFields.length > 0 && (
                                <div className="text-xs text-accent-red mt-1">
                                  Campos afetados:{' '}
                                  {conflict.affectedFields.join(', ')}
                                </div>
                              )}
                          </div>
                        )
                      )}
                    </div>
                  )}

                {conflictInfo.suggestions &&
                  conflictInfo.suggestions.length > 0 && (
                    <div className="mt-4 p-3 bg-accent-blue/10 rounded border border-accent-blue/20">
                      <h5 className="font-medium text-sm text-accent-blue mb-2">
                        Sugestões:
                      </h5>
                      <ul className="text-xs text-theme-secondary space-y-1">
                        {conflictInfo.suggestions.map(
                          (suggestion: string, index: number) => (
                            <li key={index}>{suggestion}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
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
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Título do anúncio clonado"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Anunciante *
                </label>
                <Input
                  type="text"
                  value={formData.advertiserName}
                  onChange={(e) =>
                    handleInputChange('advertiserName', e.target.value)
                  }
                  placeholder="Nome do anunciante"
                  maxLength={100}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Descrição
                </label>
                <textarea
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
                  label="Tipo"
                  options={typeOptions}
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                />
              </div>

              <div>
                <Select
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
                    value={formData.instrumentId}
                    onChange={(e) =>
                      handleInputChange('instrumentId', e.target.value)
                    }
                    className="input-classical-2 w-full"
                  >
                    <option value="">Selecione um instrumento</option>
                    {availableInstruments.map((instrument) => (
                      <option key={instrument.id} value={instrument.id}>
                        {instrument.name}
                      </option>
                    ))}
                  </select>
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Texto do Botão
                </label>
                <Input
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

          {/* Agendamento */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-theme-primary">
              Agendamento (Opcional)
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
          </div>

          {/* Dispositivos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-theme-primary">
              Configurações de Exibição
            </h3>

            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Exibir em:
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <Checkbox
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
                  <Checkbox
                    type="checkbox"
                    label="Tablet"
                    checked={formData.showOnTablet}
                    onChange={(e) =>
                      handleInputChange('showOnTablet', e.target.checked)
                    }
                    className="rounded border-theme-primary"
                  />
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    type="checkbox"
                    label="Desktop"
                    checked={formData.showOnDesktop}
                    onChange={(e) =>
                      handleInputChange('showOnDesktop', e.target.checked)
                    }
                    className="rounded border-theme-primary"
                  />
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
              leftIcon={<FiCopy />}
              disabled={loading || (conflictInfo && conflictInfo.hasConflict)}
              isLoading={loading}
            >
              {loading ? 'Clonando...' : 'Clonar Anúncio'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
