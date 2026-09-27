// app/admin/ads/components/MediaPreview.tsx - Preview das versões responsivas
'use client';

import { useState } from 'react';
import {
  PiDeviceMobile,
  PiDeviceTablet,
  PiDownloadSimple,
  PiEye,
  PiInfo,
  PiMonitor,
} from 'react-icons/pi';
import {
  getResponsiveImageUrl,
  AD_DIMENSIONS,
} from '@/app/libs/ads/mediaUtils';
import Button from '@/app/components/Common/Button';
import Image from '@/app/components/SmartImage';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

interface MediaPreviewProps {
  ad: any;
  className?: string;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export default function MediaPreview({
  ad,
  className = '',
}: MediaPreviewProps) {
  const [activeDevice, setActiveDevice] = useState<DeviceType>('desktop');
  const [showDetails, setShowDetails] = useState(false);

  const hasImageVersions =
    ad.imageVersions && typeof ad.imageVersions === 'object';
  const hasVideoVersions =
    ad.videoVersions && typeof ad.videoVersions === 'object';
  const hasMedia =
    hasImageVersions || hasVideoVersions || ad.imageUrl || ad.videoUrl;

  if (!hasMedia) {
    return (
      <div className={`classical-card p-6 text-center ${className}`}>
        <div className="text-theme-tertiary">
          <PiEye className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhuma mídia para preview</p>
          <p className="text-sm mt-1">Faça upload de uma imagem ou vídeo</p>
        </div>
      </div>
    );
  }

  const placementDimensions =
    AD_DIMENSIONS[ad.placement as keyof typeof AD_DIMENSIONS];
  const currentDimensions = placementDimensions[activeDevice];

  const getMediaForDevice = (device: DeviceType) => {
    if (hasImageVersions) {
      return {
        type: 'image',
        src: getResponsiveImageUrl(ad.imageVersions, device),
        versions: ad.imageVersions,
      };
    } else if (hasVideoVersions) {
      return {
        type: 'video',
        src: getResponsiveImageUrl(ad.videoVersions, device),
        versions: ad.videoVersions,
        thumbnail: ad.thumbnailUrl,
      };
    } else if (ad.imageUrl) {
      return {
        type: 'image',
        src: ad.imageUrl,
      };
    } else if (ad.videoUrl) {
      return {
        type: 'video',
        src: ad.videoUrl,
        thumbnail: ad.thumbnailUrl,
      };
    }
    return null;
  };

  const currentMedia = getMediaForDevice(activeDevice);

  const deviceOptions = [
    {
      value: 'desktop' as DeviceType,
      label: 'Desktop',
      icon: PiMonitor,
      color: '',
      bgColor: '',
      description: '1200px+',
    },
    {
      value: 'tablet' as DeviceType,
      label: 'Tablet',
      icon: PiDeviceTablet,
      color: '',
      bgColor: '',
      description: '768px - 1199px',
    },
    {
      value: 'mobile' as DeviceType,
      label: 'Mobile',
      icon: PiDeviceMobile,
      color: '',
      bgColor: '',
      description: '< 768px',
    },
  ];

  const downloadMedia = (mediaUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`classical-card overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-theme-primary">
        <div className="flex items-center justify-between">
          <Inline gap={3}>
            <PiEye className="w-5 h-5 text-ouro-texto" />
            <div>
              <h3 className="font-semibold text-theme-primary">
                Preview Responsivo
              </h3>
              <Text papel="rotulo" tom="fraco" as="p">
                Visualize como aparece em cada dispositivo
              </Text>
            </div>
          </Inline>

          <Inline gap={2}>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<PiInfo />}
              onClick={() => setShowDetails(!showDetails)}
              className={showDetails ? 'text-ouro-texto' : ''}
            >
              Detalhes
            </Button>

            {currentMedia && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<PiDownloadSimple />}
                onClick={() =>
                  downloadMedia(
                    currentMedia.src,
                    `${ad.title}_${activeDevice}.${
                      currentMedia.type === 'image' ? 'webp' : 'mp4'
                    }`
                  )
                }
              >
                Baixar
              </Button>
            )}
          </Inline>
        </div>
      </div>

      {/* Device Selector */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2">
          {deviceOptions.map((device) => {
            const Icon = device.icon;
            const isActive = activeDevice === device.value;

            return (
              <button
                key={device.value}
                onClick={() => setActiveDevice(device.value)}
                className={`
                  p-3 rounded-xl transition-all duration-200 text-center
                  ${
                    isActive
                      ? `${device.bgColor} ${device.color} border-2 border-current shadow-lg transform scale-[1.02]`
                      : 'bg-theme-elevated text-theme-secondary border-2 border-transparent'
                  }
                `}
              >
                <Icon className="w-6 h-6 mx-auto mb-1" />
                <div className="text-sm font-medium">{device.label}</div>
                <div className="text-xs opacity-75">{device.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Details Panel */}
      {showDetails && (
        <div className="p-4 border-b border-theme-primary">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-theme-primary mb-1">
                Dimensões
              </div>
              <div className="text-theme-secondary">
                {currentDimensions.width} × {currentDimensions.height}px
              </div>
              <Text papel="legenda" tom="fraco" as="div">
                Proporção: {currentDimensions.aspectRatio}
              </Text>
            </div>

            <div>
              <div className="font-medium text-theme-primary mb-1">
                Posicionamento
              </div>
              <div className="text-theme-secondary">{ad.placement}</div>
              <Text papel="legenda" tom="fraco" as="div">
                {ad.targetType} targeting
              </Text>
            </div>

            <Stack gap={1}>
              <div className="font-medium text-theme-primary">Versões</div>
              <Inline gap={2} className="text-xs">
                {hasImageVersions && (
                  <span className="px-2 py-1 rounded">IMG ✓</span>
                )}
                {hasVideoVersions && (
                  <span className="px-2 py-1 rounded">VID ✓</span>
                )}
                {!hasImageVersions && !hasVideoVersions && (
                  <span className="px-2 py-1 rounded">Original</span>
                )}
              </Inline>
            </Stack>
          </div>
        </div>
      )}

      {/* Preview Area */}
      <div className="p-6">
        <div
          className="relative mx-auto"
          style={{
            maxWidth: Math.min(currentDimensions.width, 400),
            aspectRatio: `${currentDimensions.width}/${currentDimensions.height}`,
          }}
        >
          {/* Device Frame */}
          <div
            className={`
            absolute inset-0 rounded-lg border-2 transition-all duration-300
            ${
              activeDevice === 'desktop'
                ? ''
                : activeDevice === 'tablet'
                  ? ''
                  : ''
            } shadow-lg
          `}
          >
            {currentMedia ? (
              <div className="w-full h-full overflow-hidden rounded-md">
                {currentMedia.type === 'image' ? (
                  <Image
                    src={currentMedia.src}
                    alt={`${ad.title} - ${activeDevice}`}
                    width={currentDimensions.width}
                    height={currentDimensions.height}
                    className="w-full h-full object-cover"
                    style={{
                      aspectRatio: `${currentDimensions.width}/${currentDimensions.height}`,
                    }}
                  />
                ) : (
                  <video
                    src={currentMedia.src}
                    poster={currentMedia.thumbnail}
                    className="w-full h-full object-cover"
                    controls
                    muted
                    style={{
                      aspectRatio: `${currentDimensions.width}/${currentDimensions.height}`,
                    }}
                  />
                )}

                {/* Ad overlay simulation */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Indicador de publicidade */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur">
                    Publicidade
                  </div>

                  {/* CTA button simulation */}
                  {ad.ctaText && (
                    <div className="absolute bottom-4 right-4">
                      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        {ad.ctaText}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center rounded-md">
                <div className="text-center text-theme-tertiary">
                  <div className="w-12 h-12 mx-auto mb-2 opacity-50">
                    {activeDevice === 'desktop' ? (
                      <PiMonitor className="w-full h-full" />
                    ) : activeDevice === 'tablet' ? (
                      <PiDeviceTablet className="w-full h-full" />
                    ) : (
                      <PiDeviceMobile className="w-full h-full" />
                    )}
                  </div>
                  <p className="text-sm">Sem mídia</p>
                </div>
              </div>
            )}
          </div>

          {/* Device Label */}
          <div
            className={`
            absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center
          `}
          >
            <div
              className={`
              inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium
              ${
                activeDevice === 'desktop'
                  ? ''
                  : activeDevice === 'tablet'
                    ? ''
                    : ''
              }
            `}
            >
              <span>
                {currentDimensions.width}×{currentDimensions.height}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Info */}
      {(ad.imageQuality || ad.videoQuality) && (
        <div className="px-4 pb-4">
          <div className="rounded-lg p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-theme-secondary">
                Qualidade de processamento:
              </span>
              <span className="font-medium text-theme-primary capitalize">
                {hasImageVersions ? ad.imageQuality : ad.videoQuality}
              </span>
            </div>
            {ad.mediaMetadata?.processingError && (
              <div className="mt-2 text-xs">
                ⚠️ Processamento com fallback:{' '}
                {ad.mediaMetadata.processingError}
              </div>
            )}
            {ad.mediaMetadata?.processedAt && (
              <Text papel="legenda" tom="fraco" as="div" className="mt-1">
                Processado em:{' '}
                {new Date(ad.mediaMetadata.processedAt).toLocaleString()}
              </Text>
            )}
          </div>
        </div>
      )}

      {/* Usage Tips */}
      <div className="px-4 pb-4">
        <div className="rounded-lg p-3 bg-sup-2">
          <div className="flex items-start space-x-2">
            <PiInfo className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <Text papel="legenda" tom="suave" as="div">
              <div className="font-medium text-theme-primary mb-1">
                💡 Dicas de otimização
              </div>
              <ul className="space-y-1">
                <li>• Textos devem ser legíveis em telas pequenas</li>
                <li>• CTAs ficam mais visíveis com contrastes altos</li>
                <li>• Evite detalhes muito pequenos para mobile</li>
                {currentMedia?.type === 'video' && (
                  <li>• Vídeos começam mutados por padrão</li>
                )}
              </ul>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
