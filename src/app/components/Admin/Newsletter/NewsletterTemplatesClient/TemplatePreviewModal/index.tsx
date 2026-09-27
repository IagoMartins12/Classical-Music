// app/components/Admin/Newsletter/TemplatePreviewModal.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  PiCode,
  PiDeviceMobile,
  PiDeviceTablet,
  PiEnvelopeSimple,
  PiEye,
  PiMonitor,
  PiX,
} from 'react-icons/pi';
import Button from '@/app/components/Common/Button';
import Modal from '@/app/components/Modal';
import { processTemplate } from '@/app/libs/newsletter/emailTemplates';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: any;
}

type ViewMode = 'html' | 'text' | 'code';
type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export default function TemplatePreviewModal({
  isOpen,
  onClose,
  template,
}: TemplatePreviewModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('html');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [processedTemplate, setProcessedTemplate] = useState<{
    html: string;
    text: string;
    subject: string;
  } | null>(null);

  useEffect(() => {
    if (template) {
      // Dados de exemplo para preview
      const sampleData = {
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@exemplo.com',
        siteUrl: 'https://classicalhub.com',
        unsubscribeUrl: 'https://classicalhub.com/unsubscribe?token=sample',
        preferencesUrl: 'https://classicalhub.com/preferences?token=sample',
        confirmationUrl: 'https://classicalhub.com/confirm?token=sample',
        resetUrl: 'https://classicalhub.com/reset?token=sample',
        requestDate: new Date().toLocaleDateString('pt-BR'),
        ipAddress: '192.168.1.100',
        newComposers: 5,
        newWorks: 12,
        newScores: 8,
        activeUsers: 150,
        featuredComposer: {
          name: 'Ludwig van Beethoven',
          period: '1770-1827',
          description:
            'Compositor alemão considerado um dos maiores da história.',
          url: 'https://classicalhub.com/composers/beethoven',
        },
        popularWorks: [
          {
            title: 'Sonata ao Luar',
            composer: 'Beethoven',
            instrument: 'Piano',
            description: 'Uma das sonatas mais conhecidas para piano.',
            url: 'https://classicalhub.com/works/moonlight-sonata',
          },
        ],
        studyTip: {
          title: 'Técnica de Dedilhado',
          content:
            'Pratique escalas lentamente para desenvolver força e precisão nos dedos.',
        },
        composerName: 'Wolfgang Amadeus Mozart',
        composerPeriod: '1756-1791',
        composerNationality: 'Austríaco',
        composerBio:
          'Compositor austríaco do período clássico, conhecido por sua genialidade precoce.',
        composerUrl: 'https://classicalhub.com/composers/mozart',
        works: [
          {
            title: 'Requiem em Ré menor',
            instrument: 'Coro e Orquestra',
            year: '1791',
          },
          { title: 'Sinfonia nº 40', instrument: 'Orquestra', year: '1788' },
        ],
        musicalFact: 'Mozart compôs mais de 600 obras durante sua curta vida.',
        customSubject: 'Assunto Personalizado',
        customContent:
          '<h3>Conteúdo personalizado da campanha</h3><p>Este é um exemplo de conteúdo customizado.</p>',
        customTextContent:
          'Conteúdo personalizado da campanha em texto simples.',
      };

      try {
        const processed = {
          html: processTemplate(template.htmlContent, sampleData),
          text: processTemplate(template.textContent, sampleData),
          subject: processTemplate(template.subject, sampleData),
        };
        setProcessedTemplate(processed);
      } catch (error) {
        console.error('Erro ao processar template:', error);
        setProcessedTemplate({
          html: template.htmlContent,
          text: template.textContent,
          subject: template.subject,
        });
      }
    }
  }, [template]);

  const getDeviceWidth = () => {
    switch (deviceMode) {
      case 'mobile':
        return '320px';
      case 'tablet':
        return '768px';
      case 'desktop':
      default:
        return '100%';
    }
  };

  const getDeviceMaxWidth = () => {
    switch (deviceMode) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '820px';
      case 'desktop':
      default:
        return 'none';
    }
  };

  if (!processedTemplate) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="6xl"
      confirmOnClose
      withouVerification
    >
      <div className="bg-theme-primary rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-secondary">
          <Inline gap={4}>
            <Inline gap={2}>
              <PiEye className="w-5 h-5 text-theme-primary" />
              <h3 className="text-lg font-bold text-theme-primary">
                Preview: {template.name}
              </h3>
            </Inline>

            <Inline gap={1} className="bg-theme-secondary rounded-lg p-1">
              <button
                onClick={() => setViewMode('html')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'html' ? 'text-white' : 'text-theme-tertiary'
                }`}
              >
                <PiEye className="w-4 h-4 inline mr-1" />
                HTML
              </button>
              <button
                onClick={() => setViewMode('text')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'text' ? 'text-white' : 'text-theme-tertiary'
                }`}
              >
                <PiEnvelopeSimple className="w-4 h-4 inline mr-1" />
                Texto
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'code' ? 'text-white' : 'text-theme-tertiary'
                }`}
              >
                <PiCode className="w-4 h-4 inline mr-1" />
                Código
              </button>
            </Inline>
          </Inline>

          <Inline gap={4}>
            {/* Device Mode Selector */}
            {viewMode === 'html' && (
              <Inline gap={1} className="bg-theme-secondary rounded-lg p-1">
                <button
                  onClick={() => setDeviceMode('desktop')}
                  className={`p-2 rounded transition-colors ${
                    deviceMode === 'desktop'
                      ? 'text-white'
                      : 'text-theme-tertiary'
                  }`}
                  title="Desktop"
                >
                  <PiMonitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeviceMode('tablet')}
                  className={`p-2 rounded transition-colors ${
                    deviceMode === 'tablet'
                      ? 'text-white'
                      : 'text-theme-tertiary'
                  }`}
                  title="Tablet"
                >
                  <PiDeviceTablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeviceMode('mobile')}
                  className={`p-2 rounded transition-colors ${
                    deviceMode === 'mobile'
                      ? 'text-white'
                      : 'text-theme-tertiary'
                  }`}
                  title="Mobile"
                >
                  <PiDeviceMobile className="w-4 h-4" />
                </button>
              </Inline>
            )}

            <button
              onClick={onClose}
              className="text-theme-tertiary transition-colors"
            >
              <PiX className="w-6 h-6" />
              <NomeAcao acao="fechar" />
            </button>
          </Inline>
        </div>

        {/* Template Info */}
        <div className="px-6 py-4 bg-theme-secondary border-b border-theme-primary">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-theme-tertiary">Assunto:</span>
              <p className="font-medium text-theme-primary">
                {processedTemplate.subject}
              </p>
            </div>
            <div>
              <span className="text-theme-tertiary">Tipo:</span>
              <p className="font-medium text-theme-primary">{template.type}</p>
            </div>
            <div>
              <span className="text-theme-tertiary">Variáveis:</span>
              <p className="font-medium text-theme-primary">
                {template.variables?.length || 0} detectadas
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[70vh]">
          <div className="p-6">
            {viewMode === 'html' && (
              <div className="flex justify-center">
                <div
                  className="transition-all duration-300 rounded-lg overflow-hidden shadow-lg"
                  style={{
                    width: getDeviceWidth(),
                    maxWidth: getDeviceMaxWidth(),
                  }}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: processedTemplate.html }}
                    className="bg-white"
                  />
                </div>
              </div>
            )}

            {viewMode === 'text' && (
              <div className="max-w-2xl mx-auto">
                <pre className="text-theme-primary bg-theme-secondary p-6 rounded-lg text-sm whitespace-pre-wrap font-mono leading-relaxed">
                  {processedTemplate.text}
                </pre>
              </div>
            )}

            {viewMode === 'code' && (
              <Stack gap={6} className="max-w-4xl mx-auto">
                <Stack gap={3}>
                  <h4 className="font-medium text-theme-primary flex items-center">
                    <PiCode className="w-4 h-4 mr-2" />
                    HTML Source
                  </h4>
                  <pre className="text-theme-primary bg-theme-secondary p-4 rounded-lg text-xs overflow-x-auto font-mono">
                    {template.htmlContent}
                  </pre>
                </Stack>

                <Stack gap={3}>
                  <h4 className="font-medium text-theme-primary flex items-center">
                    <PiEnvelopeSimple className="w-4 h-4 mr-2" />
                    Text Source
                  </h4>
                  <pre className="text-theme-primary bg-theme-secondary p-4 rounded-lg text-xs overflow-x-auto font-mono">
                    {template.textContent}
                  </pre>
                </Stack>

                {template.variables && template.variables.length > 0 && (
                  <Stack gap={3}>
                    <h4 className="font-medium text-theme-primary">
                      Variáveis Disponíveis ({template.variables.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {template.variables.map((variable: string) => (
                        <span
                          key={variable}
                          className="px-3 py-1 text-white text-xs rounded-full font-mono"
                        >
                          {`{{${variable}}}`}
                        </span>
                      ))}
                    </div>
                  </Stack>
                )}
              </Stack>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-theme-secondary">
          <Text papel="rotulo" tom="fraco" as="div">
            {deviceMode === 'mobile' && 'Visualização Mobile'}
            {deviceMode === 'tablet' && 'Visualização Tablet'}
            {deviceMode === 'desktop' && 'Visualização Desktop'}
            {viewMode !== 'html' && ''}
          </Text>

          <Inline gap={2}>
            <Button variant="ghost" onClick={onClose}>
              Fechar
            </Button>
          </Inline>
        </div>
      </div>
    </Modal>
  );
}
