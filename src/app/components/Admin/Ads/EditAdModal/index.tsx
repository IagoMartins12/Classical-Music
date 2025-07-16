// app/admin/ads/components/EditAdModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiEdit, FiTarget, FiImage, FiMapPin } from 'react-icons/fi';

import toast from 'react-hot-toast';
import { useAds } from '@/app/hooks/admin/useAds';
import Button from '@/app/components/Common/Button';
import Select from '@/app/components/Common/Select';
import Input from '@/app/components/Common/Inputs';
import Modal from '@/app/components/Modal';

interface EditAdModalProps {
  ad: any;
  onClose: () => void;
  onSuccess: () => void;
}

const statusOptions = [
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'PAUSED', label: 'Pausado' },
  { value: 'SCHEDULED', label: 'Agendado' },
  { value: 'EXPIRED', label: 'Expirado' },
];

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
  { value: 'GENERAL', label: 'Geral' },
  { value: 'INSTRUMENT', label: 'Por Instrumento' },
  { value: 'COMPOSER', label: 'Por Compositor' },
  { value: 'EPOCH', label: 'Por Época' },
  { value: 'USER_LEVEL', label: 'Por Nível do Usuário' },
  { value: 'GEOGRAPHIC', label: 'Por Localização' },
];

const userLevelOptions = [
  { value: 'BEGINNER', label: 'Iniciante' },
  { value: 'INTERMEDIATE', label: 'Intermediário' },
  { value: 'ADVANCED', label: 'Avançado' },
];

export default function EditAdModal({
  ad,
  onClose,
  onSuccess,
}: EditAdModalProps) {
  const { updateAd, loading } = useAds();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tagline: '',
    content: '',
    imageUrl: '',
    videoUrl: '',
    ctaText: '',
    targetUrl: '',
    isExternal: true,
    type: 'BANNER',
    placement: 'SIDEBAR_RIGHT',
    status: 'DRAFT',
    targetType: 'GENERAL',
    advertiserName: '',
    advertiserEmail: '',
    advertiserPhone: '',
    advertiserWebsite: '',
    priority: 0,
    weight: 1,
    maxViews: '',
    maxClicks: '',
    startDate: '',
    endDate: '',
    showOnMobile: true,
    showOnTablet: true,
    showOnDesktop: true,

    // Targeting
    instrumentTargets: [] as string[],
    composerTargets: [] as string[],
    epochTargets: [] as string[],
    userLevelTargets: [] as string[],
    geoTargets: [] as any[],
  });

  const [availableOptions, setAvailableOptions] = useState({
    instruments: [] as any[],
  });

  // Carregar dados do ad
  useEffect(() => {
    if (ad) {
      setFormData({
        title: ad.title || '',
        description: ad.description || '',
        tagline: ad.tagline || '',
        content: ad.content || '',
        imageUrl: ad.imageUrl || '',
        videoUrl: ad.videoUrl || '',
        ctaText: ad.ctaText || '',
        targetUrl: ad.targetUrl || '',
        isExternal: ad.isExternal ?? true,
        type: ad.type || 'BANNER',
        placement: ad.placement || 'SIDEBAR_RIGHT',
        status: ad.status || 'DRAFT',
        targetType: ad.targetType || 'GENERAL',
        advertiserName: ad.advertiserName || '',
        advertiserEmail: ad.advertiserEmail || '',
        advertiserPhone: ad.advertiserPhone || '',
        advertiserWebsite: ad.advertiserWebsite || '',
        priority: ad.priority || 0,
        weight: ad.weight || 1,
        maxViews: ad.maxViews?.toString() || '',
        maxClicks: ad.maxClicks?.toString() || '',
        startDate: ad.startDate
          ? new Date(ad.startDate).toISOString().slice(0, 16)
          : '',
        endDate: ad.endDate
          ? new Date(ad.endDate).toISOString().slice(0, 16)
          : '',
        showOnMobile: ad.showOnMobile ?? true,
        showOnTablet: ad.showOnTablet ?? true,
        showOnDesktop: ad.showOnDesktop ?? true,

        instrumentTargets:
          ad.instrumentTargets?.map((t: any) => t.instrumentId) || [],
        composerTargets:
          ad.composerTargets?.map((t: any) => t.composerId) || [],
        epochTargets: ad.epochTargets?.map((t: any) => t.epochId) || [],
        userLevelTargets:
          ad.userLevelTargets?.map((t: any) => t.userLevel) || [],
        geoTargets: ad.geoTargets || [],
      });
    }
  }, [ad]);

  // Buscar opções para targeting
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [instrumentsRes] = await Promise.all([fetch('/api/instruments')]);

        const [instruments] = await Promise.all([instrumentsRes.json()]);

        setAvailableOptions({
          instruments: instruments.instruments || [],
        });
      } catch (error) {
        console.error('Erro ao buscar opções:', error);
      }
    };

    fetchOptions();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (
    field: string,
    value: string,
    checked: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...(prev[field as keyof typeof prev] as string[]), value]
        : (prev[field as keyof typeof prev] as string[]).filter(
            (item) => item !== value
          ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validação básica
      if (!formData.title.trim()) {
        toast.error('Título é obrigatório');
        return;
      }

      if (!formData.advertiserName.trim()) {
        toast.error('Nome do anunciante é obrigatório');
        return;
      }

      // Função helper para converter strings vazias em undefined
      const cleanUrlField = (value: string) =>
        value.trim() === '' ? undefined : value;
      const cleanEmailField = (value: string) =>
        value.trim() === '' ? undefined : value;
      const cleanStringField = (value: string) =>
        value.trim() === '' ? undefined : value;

      // Preparar dados para envio
      const submitData = {
        title: formData.title.trim(),
        description: cleanStringField(formData.description),
        tagline: cleanStringField(formData.tagline),
        content: cleanStringField(formData.content),
        imageUrl: cleanUrlField(formData.imageUrl),
        videoUrl: cleanUrlField(formData.videoUrl),
        ctaText: cleanStringField(formData.ctaText),
        targetUrl: cleanUrlField(formData.targetUrl),
        isExternal: formData.isExternal,
        type: formData.type,
        placement: formData.placement,
        status: formData.status,
        targetType: formData.targetType,
        advertiserName: formData.advertiserName.trim(),
        advertiserEmail: cleanEmailField(formData.advertiserEmail),
        advertiserPhone: cleanStringField(formData.advertiserPhone),
        advertiserWebsite: cleanUrlField(formData.advertiserWebsite),
        priority: formData.priority,
        weight: formData.weight,
        maxViews: formData.maxViews ? parseInt(formData.maxViews) : undefined,
        maxClicks: formData.maxClicks
          ? parseInt(formData.maxClicks)
          : undefined,
        startDate: cleanStringField(formData.startDate),
        endDate: cleanStringField(formData.endDate),
        showOnMobile: formData.showOnMobile,
        showOnTablet: formData.showOnTablet,
        showOnDesktop: formData.showOnDesktop,
        instrumentTargets:
          formData.instrumentTargets.length > 0
            ? formData.instrumentTargets
            : undefined,
        composerTargets:
          formData.composerTargets.length > 0
            ? formData.composerTargets
            : undefined,
        epochTargets:
          formData.epochTargets.length > 0 ? formData.epochTargets : undefined,
        userLevelTargets:
          formData.userLevelTargets.length > 0
            ? formData.userLevelTargets
            : undefined,
        geoTargets:
          formData.geoTargets.length > 0 ? formData.geoTargets : undefined,
      };

      // Remover campos undefined do objeto (opcional, mas limpa o payload)
      const cleanSubmitData = Object.fromEntries(
        Object.entries(submitData).filter(([_, value]) => value !== undefined)
      );

      await updateAd(ad.id, cleanSubmitData);
      toast.success('Publicidade atualizada com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Erro ao atualizar publicidade:', error);
      toast.error('Erro ao atualizar publicidade');
    }
  };

  return (
    <Modal isOpen={ad} onClose={onClose} maxWidth="4xl">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-primary">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
              <FiEdit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-theme-primary">
                Editar Publicidade
              </h2>
              <p className="text-sm text-theme-tertiary">{ad.title}</p>
            </div>
          </div>
        </div>

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
                  placeholder="Título da publicidade"
                />
              </div>

              <div>
                <Select
                  label="Status"
                  options={statusOptions}
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
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
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Email do Anunciante
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
                  Número do telefone
                </label>
                <Input
                  type="text"
                  value={formData.advertiserPhone}
                  onChange={(e) =>
                    handleInputChange('advertiserPhone', e.target.value)
                  }
                  placeholder="Número do telefone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Site do Anunciante
                </label>
                <Input
                  type="text"
                  value={formData.advertiserWebsite}
                  onChange={(e) =>
                    handleInputChange('advertiserWebsite', e.target.value)
                  }
                  placeholder="Site do Anunciante"
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
                  rows={4}
                  placeholder="Descrição da publicidade"
                  className="input-classical-2 w-full h-24 resize-none"
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

          {/* Performance Atual */}
          {ad.totalImpressions !== undefined && (
            <div className="p-4 bg-theme-secondary rounded-lg">
              <h4 className="font-medium text-theme-primary mb-2">
                Performance Atual
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-accent-blue">
                    {ad.totalImpressions?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-theme-tertiary">Impressões</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-accent-green">
                    {ad.totalClicks?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-theme-tertiary">Cliques</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-accent-purple">
                    {ad.ctr?.toFixed(2) || 0}%
                  </div>
                  <div className="text-sm text-theme-tertiary">CTR</div>
                </div>
              </div>
            </div>
          )}

          {/* Mídia */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-theme-primary flex items-center space-x-2">
              <FiImage className="w-5 h-5" />
              <span>Mídia</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  URL da Imagem
                </label>
                <Input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    handleInputChange('imageUrl', e.target.value)
                  }
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  URL do Vídeo
                </label>
                <Input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) =>
                    handleInputChange('videoUrl', e.target.value)
                  }
                  placeholder="https://exemplo.com/video.mp4"
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
                  placeholder="Saiba Mais, Inscreva-se, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  URL de Destino
                </label>
                <Input
                  type="url"
                  value={formData.targetUrl}
                  onChange={(e) =>
                    handleInputChange('targetUrl', e.target.value)
                  }
                  placeholder="https://exemplo.com"
                />
              </div>
            </div>
          </div>

          {/* Targeting */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-theme-primary flex items-center space-x-2">
              <FiMapPin className="w-5 h-5" />
              <span>Segmentação</span>
            </h3>

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

            {/* Targeting por Instrumento */}
            {formData.targetType === 'INSTRUMENT' && (
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Instrumentos
                </label>
                <div className="max-h-40 overflow-y-auto border border-theme-primary rounded-lg p-3 space-y-2">
                  {availableOptions.instruments.map((instrument) => (
                    <label
                      key={instrument.id}
                      className="flex items-center space-x-2"
                    >
                      <Input
                        type="checkbox"
                        checked={formData.instrumentTargets.includes(
                          instrument.id
                        )}
                        onChange={(e) =>
                          handleArrayChange(
                            'instrumentTargets',
                            instrument.id,
                            e.target.checked
                          )
                        }
                        className="rounded border-theme-primary"
                      />
                      <span className="text-sm text-theme-primary">
                        {instrument.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Targeting por Nível */}
            {formData.targetType === 'USER_LEVEL' && (
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Níveis de Usuário
                </label>
                <div className="space-y-2">
                  {userLevelOptions.map((level) => (
                    <label
                      key={level.value}
                      className="flex items-center space-x-2"
                    >
                      <Input
                        type="checkbox"
                        checked={formData.userLevelTargets.includes(
                          level.value
                        )}
                        onChange={(e) =>
                          handleArrayChange(
                            'userLevelTargets',
                            level.value,
                            e.target.checked
                          )
                        }
                        className="rounded border-theme-primary"
                      />
                      <span className="text-sm text-theme-primary">
                        {level.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Configurações */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-theme-primary">
              Configurações
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Prioridade (0-10)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.priority}
                  onChange={(e) =>
                    handleInputChange('priority', parseInt(e.target.value))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Máx. Visualizações
                </label>
                <Input
                  type="number"
                  value={formData.maxViews}
                  onChange={(e) =>
                    handleInputChange('maxViews', e.target.value)
                  }
                  placeholder="Opcional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Máx. Cliques
                </label>
                <Input
                  type="number"
                  value={formData.maxClicks}
                  onChange={(e) =>
                    handleInputChange('maxClicks', e.target.value)
                  }
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              disabled={loading}
              loading={loading}
            >
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
