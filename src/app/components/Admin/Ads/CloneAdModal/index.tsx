// app/admin/ads/components/CloneAdModal.tsx - Modal para clonagem de anúncios
'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiCopy, FiTarget, FiInfo, FiCheck, FiX } from 'react-icons/fi';
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

const statusOptions = [
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'PAUSED', label: 'Pausado' },
  { value: 'SCHEDULED', label: 'Agendado' },
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
    title: '',
    description: '',
    type: 'BANNER',
    placement: 'SIDEBAR_RIGHT',
    status: 'DRAFT',
    targetType: 'GENERAL',
    targetUserLevel: 'ALL',
    instrumentId: '',
    ctaText: '',
    targetUrl: '',
    linkType: 'url',
    isExternal: true,
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
  const [hasMedia, setHasMedia] = useState(false);

  // Carregar dados do anúncio original
  useEffect(() => {
    if (ad) {
      setFormData({
        title: `${ad.title} - Cópia`,
        description: ad.description || '',
        type: ad.type || 'BANNER',
        placement: ad.placement || 'SIDEBAR_RIGHT',
        status: 'DRAFT', // Sempre começar como DRAFT
        targetType: ad.targetType || 'GENERAL',
        targetUserLevel: ad.targetUserLevel || 'ALL',
        instrumentId: ad.instrumentId || '',
        ctaText: ad.ctaText || '',
        targetUrl: ad.targetUrl || '',
        linkType: ad.linkType || 'url',
        isExternal: ad.isExternal ?? true,
        advertiserName: ad.advertiserName || '',
        advertiserEmail: ad.advertiserEmail || '',
        advertiserPhone: ad.advertiserPhone || '',
        advertiserWebsite: ad.advertiserWebsite || '',
        startDate: '', // Resetar datas
        endDate: '', // Resetar datas
        showOnMobile: ad.showOnMobile ?? true,
        showOnTablet: ad.showOnTablet ?? true,
        showOnDesktop: ad.showOnDesktop ?? true,
      });

      // Verificar se o anúncio original tem mídia
      setHasMedia(!!(ad.imageUrl || ad.videoUrl));
    }
  }, [ad]);

  // Buscar instrumentos disponíveis
  useEffect(() => {
    const fetchInstruments = async () => {
      try {
        const response = await fetch('/api/instruments');
        const data = await response.json();
        setAvailableInstruments(data.instruments || []);
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
          formData.placement,
          formData.targetType,
          formData.targetType === 'INSTRUMENT'
            ? formData.instrumentId
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
    formData.placement,
    formData.targetType,
    formData.instrumentId,
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

    try {
      // Validações
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

      if (conflictInfo) {
        toast.error('Resolva o conflito antes de continuar');
        return;
      }

      // Preparar dados para clonagem
      const modifications = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        ctaText: formData.ctaText.trim() || undefined,
        targetUrl: formData.targetUrl.trim() || undefined,
        advertiserName: formData.advertiserName.trim(),
        advertiserEmail: formData.advertiserEmail.trim() || undefined,
        advertiserPhone: formData.advertiserPhone.trim() || undefined,
        advertiserWebsite: formData.advertiserWebsite.trim() || undefined,
        instrumentId:
          formData.targetType === 'INSTRUMENT'
            ? formData.instrumentId
            : undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      };

      const clonedAd = await cloneAd(ad.id, modifications);

      // Mostrar mensagem de sucesso com info sobre mídia
      const successMessage = hasMedia
        ? 'Anúncio clonado com sucesso! A mídia foi copiada automaticamente.'
        : 'Anúncio clonado com sucesso! Lembre-se de adicionar mídia.';

      toast.success(successMessage);
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
            <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center">
              <FiCopy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-theme-primary">
                Clonar Anúncio
              </h2>
              <p className="text-sm text-theme-tertiary">
                Criar uma cópia de: {ad?.title}
              </p>
            </div>
          </div>
        </div>

        {/* Info sobre mídia */}
        <div className="p-4 bg-accent-blue/10 border-l-4 border-accent-blue mx-6 mt-4 rounded">
          <div className="flex items-start space-x-3">
            <FiInfo className="w-5 h-5 text-accent-blue mt-0.5" />
            <div>
              <h4 className="font-medium text-theme-primary">
                Sobre a clonagem
              </h4>
              <p className="text-sm text-theme-secondary mt-1">
                {hasMedia ? (
                  <>
                    ✅ A mídia (imagem/vídeo) será copiada automaticamente para
                    o novo anúncio.
                  </>
                ) : (
                  <>
                    ⚠️ O anúncio original não possui mídia. Lembre-se de
                    adicionar imagem ou vídeo após a clonagem.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Conflict Warning */}
        {conflictInfo && (
          <div className="p-4 bg-accent-red/10 border-l-4 border-accent-red mx-6 mt-4 rounded">
            <div className="flex items-start space-x-3">
              <FiX className="w-5 h-5 text-accent-red mt-0.5" />
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
          {/* Comparação com original */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dados originais */}
            <div className="classical-card p-4 bg-theme-secondary/50">
              <h3 className="font-semibold text-theme-primary mb-3 flex items-center space-x-2">
                <FiTarget className="w-4 h-4" />
                <span>Anúncio Original</span>
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-theme-tertiary">Título:</span>
                  <span className="text-theme-primary ml-2">{ad?.title}</span>
                </div>
                <div>
                  <span className="text-theme-tertiary">Tipo:</span>
                  <span className="text-theme-primary ml-2">{ad?.type}</span>
                </div>
                <div>
                  <span className="text-theme-tertiary">Posição:</span>
                  <span className="text-theme-primary ml-2">
                    {ad?.placement}
                  </span>
                </div>
                <div>
                  <span className="text-theme-tertiary">Status:</span>
                  <span className="text-theme-primary ml-2">{ad?.status}</span>
                </div>
                <div>
                  <span className="text-theme-tertiary">Mídia:</span>
                  <span className="text-theme-primary ml-2">
                    {hasMedia ? (
                      <span className="text-accent-green flex items-center">
                        <FiCheck className="w-3 h-3 mr-1" />
                        Tem mídia
                      </span>
                    ) : (
                      <span className="text-accent-amber">Sem mídia</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Modificações */}
            <div className="classical-card p-4">
              <h3 className="font-semibold text-theme-primary mb-3 flex items-center space-x-2">
                <FiCopy className="w-4 h-4" />
                <span>Novo Anúncio</span>
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-theme-tertiary mb-1">
                    Título *
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Título do novo anúncio"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Select
                    label="Tipo"
                    options={typeOptions}
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Select
                    label="Posição"
                    options={placementOptions}
                    value={formData.placement}
                    onChange={(e) =>
                      handleInputChange('placement', e.target.value)
                    }
                    className="text-sm"
                  />
                </div>
                <div>
                  <Select
                    label="Status"
                    options={statusOptions}
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange('status', e.target.value)
                    }
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Configurações detalhadas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-theme-primary">
              Configurações Detalhadas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  rows={3}
                  placeholder="Descrição do anúncio clonado"
                  className="input-classical-2 w-full resize-none"
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
                />
              </div>

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
              loading={loading}
            >
              Clonar Anúncio
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
