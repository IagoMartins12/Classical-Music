// app/admin/ads/components/CreateAdModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiPlus, FiTarget, FiImage, FiMapPin } from 'react-icons/fi';

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

export default function CreateAdModal({
  showCreateModal,
  onClose,
  onSuccess,
}: CreateAdModalProps) {
  const { createAd, loading } = useAds();
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

  // Buscar opções para targeting
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [instrumentsRes] = await Promise.all([fetch('/api/instruments')]);

        const instruments = await instrumentsRes.json();
        console.log('res,', instruments);

        setAvailableOptions({
          instruments: instruments || [],
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

      // Preparar dados para envio
      const submitData = {
        ...formData,
        // Converter strings vazias para undefined para campos com validação específica
        imageUrl:
          formData.imageUrl.trim() === '' ? undefined : formData.imageUrl,
        videoUrl:
          formData.videoUrl.trim() === '' ? undefined : formData.videoUrl,
        advertiserEmail:
          formData.advertiserEmail.trim() === ''
            ? undefined
            : formData.advertiserEmail,
        advertiserWebsite:
          formData.advertiserWebsite.trim() === ''
            ? undefined
            : formData.advertiserWebsite,
        targetUrl:
          formData.targetUrl.trim() === '' ? undefined : formData.targetUrl,
        description:
          formData.description.trim() === '' ? undefined : formData.description,
        tagline: formData.tagline.trim() === '' ? undefined : formData.tagline,
        content: formData.content.trim() === '' ? undefined : formData.content,
        ctaText: formData.ctaText.trim() === '' ? undefined : formData.ctaText,
        advertiserPhone:
          formData.advertiserPhone.trim() === ''
            ? undefined
            : formData.advertiserPhone,
        maxViews: formData.maxViews ? parseInt(formData.maxViews) : undefined,
        maxClicks: formData.maxClicks
          ? parseInt(formData.maxClicks)
          : undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      };

      // Remover campos undefined
      const cleanData = Object.fromEntries(
        Object.entries(submitData).filter(([_, value]) => value !== undefined)
      );

      await createAd(cleanData);
      toast.success('Publicidade criada com sucesso!');
      onSuccess();
    } catch (error) {
      console.log('error', error);
      toast.error('Erro ao criar publicidade');
    }
  };

  return (
    <Modal maxWidth="4xl" isOpen={showCreateModal} onClose={onClose}>
      <div className="w-full ">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-primary">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-pink rounded-xl flex items-center justify-center">
              <FiPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-theme-primary">
                Nova Publicidade
              </h2>
              <p className="text-sm text-theme-tertiary">
                Criar nova campanha publicitária
              </p>
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
                <div className="max-h-40 flex flex-wrap gap-y-2 gap-x-6 overflow-y-auto border border-theme-primary rounded-lg p-3 space-y-2">
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
              Criar Publicidade
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
