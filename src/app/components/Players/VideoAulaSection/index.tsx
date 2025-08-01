// app/components/Players/VideoAulaSection.tsx - CORRIGIDO E MELHORADO
'use client';

import React, { useState, useEffect } from 'react';
import {
  FiPlay,
  FiExternalLink,
  FiUser,
  FiClock,
  FiVideo,
  FiDownload,
  FiEdit3,
  FiX, // ✅ ADICIONADO PARA BOTÃO FECHAR
  FiSave, // ✅ ADICIONADO PARA SALVAR
  FiTrash2, // ✅ ADICIONADO PARA DELETAR
  FiLoader, // ✅ ADICIONADO PARA LOADING
  FiCheck,
  FiMusic, // ✅ ADICIONADO PARA CONFIRMAR
} from 'react-icons/fi';
import { SiYoutube, SiInstagram, SiTiktok } from 'react-icons/si';
import { AnimatedCard } from '../../animation/AnimatedComponents';
import { FaGraduationCap } from 'react-icons/fa';
import Button from '../../Common/Button';
import Input from '../../Common/Inputs'; // ✅ ADICIONADO PARA CAMPOS DE EDIÇÃO
import Select from '../../Common/Select'; // ✅ ADICIONADO PARA DROPDOWNS
import Image from 'next/image';
import { useToast } from '@/app/hooks/useToast'; // ✅ ADICIONADO PARA NOTIFICAÇÕES

// ✅ INTERFACE CORRIGIDA - removendo null dos tipos
interface VideoAulaSectionProps {
  work: {
    id: string;
    title: string;
    composer: {
      fullName: string;
    };
    videoAulaUrl?: string; // string | undefined (sem null)
    videoAulaFile?: string; // string | undefined (sem null)
    videoAulaTitle?: string; // string | undefined (sem null)
    videoAulaType?: string; // string | undefined (sem null)
    videoAulaSource?: string; // string | undefined (sem null)
    videoAulaAddedBy?: string; // string | undefined (sem null)
    videoAulaAddedAt?: Date; // Date | undefined (sem null)
    videoAulaMetadata?: any; // any | undefined (sem null)
  };
  canEditMedia?: boolean;
  onOpenEditModal?: () => void;
}

// ✅ OPÇÕES ATUALIZADAS - removendo 'story'
const videoAulaTypeOptions = [
  { value: 'video', label: 'Vídeo Normal' },
  { value: 'reels', label: 'Reels/Shorts' }, // Removido 'story'
  { value: 'live', label: 'Live/Transmissão' },
];

const videoAulaSourceOptions = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'local', label: 'Upload Local' },
];

// ✅ INTERFACE PARA INFORMAÇÕES DO VÍDEO
interface VideoInfo {
  platform: string;
  embedUrl: string;
  thumbnailUrl: string;
  canEmbed: boolean;
  aspectRatio: string;
  displayType: string;
  embedHtml?: string; // Para TikTok oEmbed
}

const VideoAulaSection: React.FC<VideoAulaSectionProps> = ({
  work,
  canEditMedia = false,
  onOpenEditModal,
}) => {
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loadingEmbed, setLoadingEmbed] = useState(false);

  // ✅ ESTADOS PARA MODO DE EDIÇÃO
  const [showEditMode, setShowEditMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editData, setEditData] = useState({
    videoAulaUrl: '',
    videoAulaTitle: '',
    videoAulaType: 'video',
    videoAulaSource: 'youtube',
    videoAulaFile: null as File | null,
  });

  const toast = useToast();

  // Só renderizar se tiver conteúdo
  const hasVideoAula = !!(work.videoAulaUrl || work.videoAulaFile);

  // 🎯 EMBED INTELIGENTE COM FALLBACKS - IMPLEMENTAÇÃO COMPLETA
  const detectVideoInfo = async (
    url: string,
    type?: string,
    source?: string
  ): Promise<VideoInfo> => {
    const videoType = type || 'video';
    const videoSource = source || 'external';
    const aspectRatio = getAspectRatio(videoType);
    const displayType = getDisplayType(videoType);

    console.log('🎥 [VIDEO-AULA] Detectando info:', {
      url,
      type: videoType,
      source: videoSource,
    });

    // 🎯 YOUTUBE - THUMBNAIL AUTOMÁTICA
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = extractYouTubeId(url);

      // 🖼️ THUMBNAILS AUTOMÁTICAS - Tentar múltiplas resoluções
      const thumbnailOptions = [
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, // Melhor qualidade
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, // Alta qualidade
        `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`, // Média qualidade
        `https://img.youtube.com/vi/${videoId}/default.jpg`, // Padrão
      ];

      let workingThumbnail = thumbnailOptions[0];

      // Testar se thumbnail existe
      try {
        const response = await fetch(thumbnailOptions[0], { method: 'HEAD' });
        if (!response.ok) {
          workingThumbnail = thumbnailOptions[1]; // Fallback para hq
        }
      } catch {
        workingThumbnail = thumbnailOptions[1]; // Fallback para hq
      }

      return {
        platform: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`,
        thumbnailUrl: workingThumbnail,
        canEmbed: true,
        aspectRatio,
        displayType,
      };
    }

    // 🎯 TIKTOK - EMBED INTELIGENTE COM FALLBACK
    if (url.includes('tiktok.com')) {
      setLoadingEmbed(true);

      try {
        // Tentar oEmbed API primeiro
        const oEmbedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(
          url
        )}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(oEmbedUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; OpusAtlas/1.0)',
          },
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ [VIDEO-AULA] TikTok oEmbed success:', data);

          return {
            platform: 'tiktok',
            embedUrl: url,
            thumbnailUrl:
              data.thumbnail_url || (await extractTikTokThumbnail(url)),
            canEmbed: true,
            aspectRatio: '9:16',
            displayType: 'TikTok',
            embedHtml: data.html,
          };
        }
      } catch (error) {
        console.warn('⚠️ [VIDEO-AULA] TikTok oEmbed falhou:', error);
      } finally {
        setLoadingEmbed(false);
      }

      // 🚀 FALLBACK INTELIGENTE PARA TIKTOK
      return {
        platform: 'tiktok-fallback',
        embedUrl: url,
        thumbnailUrl:
          (await extractTikTokThumbnail(url)) ||
          '/images/tiktok-placeholder.png',
        canEmbed: false, // Forçar abrir em nova aba
        aspectRatio: '9:16',
        displayType: 'TikTok',
      };
    }

    // 🎯 INSTAGRAM - EMBED COM MÚLTIPLOS FALLBACKS
    if (url.includes('instagram.com')) {
      const isReel = url.includes('/reel/') || videoType === 'reels';

      if (isReel) {
        // Tentar múltiplas estratégias para Reels
        const strategies = [
          {
            url: url.replace('/reel/', '/p/') + 'embed/',
            method: 'post-embed',
          },
          { url: url + 'embed/', method: 'direct-embed' },
          { url: url, method: 'external-fallback' },
        ];

        for (const strategy of strategies) {
          try {
            if (strategy.method === 'external-fallback') {
              return {
                platform: 'instagram-external',
                embedUrl: strategy.url,
                thumbnailUrl:
                  (await extractInstagramThumbnail(url)) ||
                  '/images/instagram-placeholder.png',
                canEmbed: false,
                aspectRatio: '9:16',
                displayType: 'Instagram Reel',
              };
            }

            // Testar se embed funciona
            const testResponse = await fetch(strategy.url, { method: 'HEAD' });
            if (testResponse.ok) {
              return {
                platform: 'instagram-reel',
                embedUrl: strategy.url,
                thumbnailUrl:
                  (await extractInstagramThumbnail(url)) ||
                  '/images/instagram-placeholder.png',
                canEmbed: true,
                aspectRatio: '9:16',
                displayType: 'Instagram Reel',
              };
            }
          } catch {
            continue; // Tentar próxima estratégia
          }
        }
      }

      // Instagram Post normal ou fallback
      return {
        platform: 'instagram',
        embedUrl: `${url}embed/`,
        thumbnailUrl:
          (await extractInstagramThumbnail(url)) ||
          '/images/instagram-placeholder.png',
        canEmbed: true,
        aspectRatio: isReel ? '9:16' : '1:1',
        displayType: isReel ? 'Instagram Reel' : 'Instagram Post',
      };
    }

    // 🎯 UPLOAD LOCAL - THUMBNAIL AUTOMÁTICA
    if (videoSource === 'local' || url.startsWith('/uploads/')) {
      const thumbnail =
        (await extractLocalVideoThumbnail(url)) ||
        work.videoAulaMetadata?.thumbnail ||
        '/images/video-placeholder.png';

      return {
        platform: 'local',
        embedUrl: url,
        thumbnailUrl: thumbnail,
        canEmbed: true,
        aspectRatio,
        displayType,
      };
    }

    // 🎯 VÍDEO DIRETO - THUMBNAIL AUTOMÁTICA
    if (url.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)) {
      const thumbnail =
        (await extractVideoThumbnail(url)) ||
        work.videoAulaMetadata?.thumbnail ||
        '/images/video-placeholder.png';

      return {
        platform: 'direct',
        embedUrl: url,
        thumbnailUrl: thumbnail,
        canEmbed: true,
        aspectRatio,
        displayType,
      };
    }

    // 🎯 URL EXTERNA GENÉRICA
    return {
      platform: 'external',
      embedUrl: url,
      thumbnailUrl:
        work.videoAulaMetadata?.thumbnail ||
        '/images/external-video-placeholder.png',
      canEmbed: false,
      aspectRatio,
      displayType,
    };
  };

  // 🎨 FUNÇÃO PARA OBTER CLASSES DE THUMBNAIL RESPONSIVAS
  const getThumbnailClasses = () => {
    if (!videoInfo)
      return 'w-full h-full object-cover transition-all duration-300';

    const baseClasses =
      'w-full h-full object-cover transition-all duration-300 group-hover:scale-105';

    switch (videoInfo.aspectRatio) {
      case '9:16':
        // Vertical - foco no centro, permite crop nas laterais
        return `${baseClasses} object-center`;
      case '1:1':
        // Quadrado - foco no centro
        return `${baseClasses} object-center`;
      default:
        // Horizontal - padrão
        return `${baseClasses} object-center`;
    }
  };
  console.log('canEditMedia', canEditMedia);

  // 🎯 FUNÇÃO PARA OBTER ESTILOS DO OVERLAY RESPONSIVO
  const getOverlayClasses = () => {
    if (!videoInfo)
      return 'absolute inset-0 bg-black/40 flex items-center justify-center transition-all duration-300';

    const baseClasses =
      'absolute inset-0 flex items-center justify-center transition-all duration-300 group-hover:bg-black/30';

    switch (videoInfo.aspectRatio) {
      case '9:16':
        // Vertical - gradiente de baixo para cima (mais natural para stories/reels)
        return `${baseClasses} bg-gradient-to-t from-black/70 via-black/20 to-transparent`;
      case '1:1':
        // Quadrado - gradiente radial do centro
        return `${baseClasses} bg-gradient-to-r from-black/20 via-black/40 to-black/60`;
      default:
        // Horizontal - gradiente tradicional
        return `${baseClasses} bg-gradient-to-t from-black/60 via-black/20 to-transparent`;
    }
  };

  // 🎯 FUNÇÃO PARA BOTÃO PLAY RESPONSIVO
  const getPlayButtonClasses = () => {
    if (!videoInfo)
      return 'w-16 h-16 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-2xl';

    const baseClasses =
      'bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-2xl';

    switch (videoInfo.aspectRatio) {
      case '9:16':
        // Vertical - botão menor para não dominar a tela
        return `${baseClasses} w-14 h-14 lg:w-16 lg:h-16`;
      case '1:1':
        // Quadrado - botão médio
        return `${baseClasses} w-16 h-16 lg:w-18 lg:h-18`;
      default:
        // Horizontal - botão maior
        return `${baseClasses} w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24`;
    }
  };

  // 🏷️ FUNÇÃO PARA BADGE RESPONSIVO
  const getBadgeClasses = () => {
    if (!videoInfo)
      return 'bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1 transition-all duration-300 text-xs';

    const baseClasses =
      'bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1 transition-all duration-300';

    switch (videoInfo.aspectRatio) {
      case '9:16':
        // Vertical - badge menor e mais discreto
        return `${baseClasses} text-xs lg:text-sm`;
      case '1:1':
        // Quadrado - badge médio
        return `${baseClasses} text-xs lg:text-sm`;
      default:
        // Horizontal - badge padrão
        return `${baseClasses} text-xs lg:text-sm xl:text-base`;
    }
  };
  // 🖼️ THUMBNAILS AUTOMÁTICAS - FUNÇÕES DE EXTRAÇÃO
  const extractTikTokThumbnail = async (
    url: string
  ): Promise<string | null> => {
    try {
      // Método 1: Tentar extrair ID do TikTok e usar API não-oficial
      const tiktokId = url.match(/\/video\/(\d+)/)?.[1];
      if (tiktokId) {
        const thumbnailUrl = `https://p16-sign-va.tiktokcdn.com/obj/tos-maliva-p-0068/o_${tiktokId}`;

        // Testar se thumbnail existe
        const response = await fetch(thumbnailUrl, { method: 'HEAD' });
        if (response.ok) {
          return thumbnailUrl;
        }
      }

      // Método 2: Placeholder inteligente
      return '/images/tiktok-placeholder.png';
    } catch {
      return null;
    }
  };

  const extractInstagramThumbnail = async (
    url: string
  ): Promise<string | null> => {
    try {
      // Instagram não permite fácil extração de thumbnail
      // Usar placeholder inteligente baseado no tipo
      return '/images/instagram-placeholder.png';
    } catch {
      return null;
    }
  };

  const extractLocalVideoThumbnail = async (
    videoUrl: string
  ): Promise<string | null> => {
    return new Promise((resolve) => {
      try {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.currentTime = 1; // Pegar frame do segundo 1

        video.onloadeddata = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
            resolve(thumbnailUrl);
          } else {
            resolve(null);
          }
        };

        video.onerror = () => resolve(null);
        video.src = videoUrl;
      } catch {
        resolve(null);
      }
    });
  };

  const extractVideoThumbnail = async (
    videoUrl: string
  ): Promise<string | null> => {
    // Similar ao local, mas para vídeos externos
    return extractLocalVideoThumbnail(videoUrl);
  };

  // ✅ FUNÇÃO PARA SALVAR VIDEO AULA
  const saveVideoAula = async () => {
    if (!canEditMedia) {
      toast.error('Você não tem permissão para editar mídia');
      return;
    }

    try {
      setIsUploading(true);

      console.log('💾 [VIDEO-AULA] Salvando video aula:', {
        url: !!editData.videoAulaUrl,
        file: !!editData.videoAulaFile,
        type: editData.videoAulaType,
        source: editData.videoAulaSource,
      });

      const updateData: any = {};

      // Upload de arquivo primeiro (se houver)
      if (editData.videoAulaFile) {
        console.log('📤 [VIDEO-AULA] Fazendo upload de arquivo...');

        const formData = new FormData();
        formData.append('file', editData.videoAulaFile);
        formData.append('mediaType', 'videoAula');

        const uploadResponse = await fetch(
          `/api/works/${work.id}/media/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || 'Erro no upload');
        }

        console.log('✅ [VIDEO-AULA] Upload concluído:', uploadData.url);

        updateData.videoAulaFile = uploadData.url;
        updateData.videoAulaUrl = uploadData.url;
        updateData.videoAulaSource = 'local';
      } else if (editData.videoAulaUrl) {
        // URL externa
        updateData.videoAulaUrl = editData.videoAulaUrl;
        updateData.videoAulaFile = null;
      }

      // Dados adicionais
      updateData.videoAulaTitle =
        editData.videoAulaTitle || `Video Aula: ${work.title}`;
      updateData.videoAulaType = editData.videoAulaType;
      updateData.videoAulaSource = editData.videoAulaFile
        ? 'local'
        : editData.videoAulaSource;
      updateData.mediaSource = 'manual';

      // Salvar no banco
      console.log('💾 [VIDEO-AULA] Salvando na base de dados...');

      const response = await fetch(`/api/works/${work.id}/media`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar');
      }

      console.log('✅ [VIDEO-AULA] Video aula salva com sucesso');

      // Atualizar interface (force refresh)
      window.location.reload();

      toast.success('Video aula salva com sucesso!');
    } catch (error) {
      console.error('❌ [VIDEO-AULA] Erro ao salvar video aula:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao salvar video aula'
      );
    } finally {
      setIsUploading(false);
    }
  };

  // ✅ FUNÇÃO PARA DELETAR VIDEO AULA
  const deleteVideoAula = async () => {
    if (!canEditMedia) {
      toast.error('Você não tem permissão para editar mídia');
      return;
    }

    if (!work.videoAulaUrl && !work.videoAulaFile) {
      toast.error('Nenhuma video aula para deletar');
      return;
    }

    try {
      setIsUploading(true);

      console.log('🗑️ [VIDEO-AULA] Deletando video aula:', {
        videoAulaFile: work.videoAulaFile,
        videoAulaSource: work.videoAulaSource,
      });

      // Deletar arquivo físico (se for upload local)
      if (work.videoAulaFile && work.videoAulaSource === 'local') {
        const fileName = work.videoAulaFile.split('/').pop();
        if (fileName) {
          const deleteFileResponse = await fetch(
            `/api/works/${work.id}/media/upload?fileName=${fileName}&mediaType=videoAula`,
            { method: 'DELETE' }
          );

          if (!deleteFileResponse.ok) {
            console.warn('⚠️ [VIDEO-AULA] Falha ao deletar arquivo físico');
          } else {
            console.log('✅ [VIDEO-AULA] Arquivo físico deletado');
          }
        }
      }

      // Limpar campos no banco
      const response = await fetch(`/api/works/${work.id}/media`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'video-aula' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao deletar');
      }

      console.log('✅ [VIDEO-AULA] Video aula deletada com sucesso');

      // Atualizar interface (force refresh)
      window.location.reload();

      toast.success('Video aula removida com sucesso!');
    } catch (error) {
      console.error('❌ [VIDEO-AULA] Erro ao deletar video aula:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao deletar video aula'
      );
    } finally {
      setIsUploading(false);
    }
  };

  // ✅ FUNÇÕES AUXILIARES
  const getAspectRatio = (type?: string) => {
    switch (type) {
      case 'reels':
        return '9:16'; // Vertical
      case 'live':
      case 'video':
      default:
        return '16:9'; // Horizontal
    }
  };

  const getDisplayType = (type?: string) => {
    switch (type) {
      case 'reels':
        return 'Reels';
      case 'live':
        return 'Live';
      case 'video':
      default:
        return 'Vídeo';
    }
  };

  const extractYouTubeId = (url: string): string => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
  };

  // ✅ FUNÇÃO PARA OBTER ÍCONE DA PLATAFORMA
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return <SiYoutube className="w-4 h-4 text-red-400" />;
      case 'instagram':
      case 'instagram-reel':
        return <SiInstagram className="w-4 h-4 text-pink-400" />;
      case 'tiktok':
        return <SiTiktok className="w-4 h-4 text-black dark:text-white" />;
      case 'local':
      case 'direct':
        return <FiVideo className="w-4 h-4 text-blue-400" />;
      default:
        return <FiExternalLink className="w-4 h-4 text-theme-tertiary" />;
    }
  };

  // ✅ FUNÇÃO PARA OBTER LABEL DA PLATAFORMA
  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return 'YouTube';
      case 'instagram':
        return 'Instagram';
      case 'instagram-reel':
        return 'Instagram Reel';
      case 'tiktok':
        return 'TikTok';
      case 'local':
        return 'Vídeo Local';
      case 'direct':
        return 'Vídeo Direto';
      default:
        return 'Externo';
    }
  };

  // ✅ FUNÇÃO PARA FORMATEAR DATA
  const formatDate = (dateString?: Date) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // ✅ FUNÇÃO PARA MOSTRAR PLAYER
  const showPlayer = () => {
    if (videoInfo?.canEmbed) {
      setIsPlayerVisible(true);
    } else {
      // Abrir em nova aba para plataformas que não permitem embed
      const url = work.videoAulaUrl || work.videoAulaFile;
      if (url) {
        window.open(url, '_blank');
      }
    }
  };

  // ✅ FUNÇÃO PARA OBTER CLASSE DO CONTAINER
  const getContainerClass = () => {
    if (!videoInfo) return 'aspect-video';

    switch (videoInfo.aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-w-sm max-h-96'; // Vertical (Reels)
      case '1:1':
        return 'aspect-square max-w-sm max-h-80'; // Quadrado (Instagram posts)
      default:
        return 'aspect-video'; // 16:9 padrão
    }
  };

  // ✅ FUNÇÃO PARA ESTILO DO CONTAINER
  const getContainerStyle = () => {
    if (!videoInfo) return {};

    // Para vídeos verticais, centralizar e limitar largura
    if (videoInfo.aspectRatio === '9:16') {
      return {
        maxWidth: '300px',
        margin: '0 auto',
      };
    }

    return {};
  };

  // ✅ DETECTAR PLATAFORMA E GERAR URLs DE EMBED + PRÉ-POPULAR CAMPOS
  useEffect(() => {
    const loadVideoInfo = async () => {
      if (work.videoAulaUrl) {
        const info = await detectVideoInfo(
          work.videoAulaUrl,
          work.videoAulaType,
          work.videoAulaSource
        );
        setVideoInfo(info);
      } else if (work.videoAulaFile) {
        const info = await detectVideoInfo(
          work.videoAulaFile,
          work.videoAulaType,
          'local'
        );
        setVideoInfo(info);
      }
    };

    // ✅ PRÉ-POPULAR CAMPOS DE EDIÇÃO
    setEditData({
      videoAulaUrl: work.videoAulaUrl || '',
      videoAulaTitle: work.videoAulaTitle || `Video Aula: ${work.title}`,
      videoAulaType: work.videoAulaType || 'video',
      videoAulaSource: work.videoAulaSource || 'youtube',
      videoAulaFile: null,
    });

    loadVideoInfo();
  }, [
    work.videoAulaUrl,
    work.videoAulaFile,
    work.videoAulaType,
    work.videoAulaSource,
    work.title,
  ]);

  // ✅ LOADING STATE
  if (loadingEmbed) {
    return (
      <AnimatedCard hover="lift" className="classical-card">
        <div className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-theme-secondary">
            {loadingEmbed ? 'Carregando embed...' : 'Carregando video aula...'}
          </p>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard hover="lift" className="classical-card overflow-hidden">
      {/* ✅ HEADER */}
      <div className="p-6 border-b border-theme-secondary bg-gradient-to-r from-blue-900/10 to-purple-800/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
              <FiMusic className="w-5 h-5 text-theme-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-theme-primary classical-title">
                Video aula
              </h2>
              <p className="text-theme-secondary text-sm">
                Veja a video aula desta peça.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {canEditMedia && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FiEdit3 />}
                onClick={() => setShowEditMode(!showEditMode)}
              >
                {showEditMode ? 'Cancelar' : 'Editar'}
              </Button>
            )}

            {/* Link externo se não puder fazer embed */}
            {videoInfo &&
              !videoInfo.canEmbed &&
              (work.videoAulaUrl || work.videoAulaFile) && (
                <a
                  href={work.videoAulaUrl || work.videoAulaFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors p-2 hover:bg-blue-400/10 rounded-lg"
                  title="Abrir em nova aba"
                >
                  <FiExternalLink className="w-5 h-5" />
                </a>
              )}
          </div>
        </div>
      </div>

      {/* ✅ MODO DE EDIÇÃO */}
      {showEditMode && canEditMedia && (
        <div className="px-6 pb-6">
          <div className="bg-purple-900/20 border border-purple-700/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-theme-primary">
                Editar Video Aula
              </h3>

              {/* Mostrar video aula existente com opção de deletar */}
              {(work.videoAulaUrl || work.videoAulaFile) && (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<FiTrash2 />}
                  onClick={deleteVideoAula}
                  disabled={isUploading}
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                >
                  {isUploading ? 'Deletando...' : 'Deletar Video Aula'}
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {/* Tipo e Fonte */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Tipo de Vídeo"
                  options={videoAulaTypeOptions}
                  value={editData.videoAulaType}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      videoAulaType: e.target.value,
                    }))
                  }
                />

                <Select
                  label="Plataforma/Fonte"
                  options={videoAulaSourceOptions}
                  value={editData.videoAulaSource}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      videoAulaSource: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Título personalizado */}
              <Input
                label="Título da Video Aula"
                value={editData.videoAulaTitle}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    videoAulaTitle: e.target.value,
                  }))
                }
                placeholder="Ex: Tutorial de Técnica - Chopin Étude Op. 10 No. 1"
              />

              {/* URL ou Upload baseado na fonte */}
              {editData.videoAulaSource !== 'local' ? (
                <Input
                  label="URL do Vídeo"
                  value={editData.videoAulaUrl}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      videoAulaUrl: e.target.value,
                    }))
                  }
                  placeholder={
                    editData.videoAulaSource === 'youtube'
                      ? 'https://www.youtube.com/watch?v=...'
                      : editData.videoAulaSource === 'instagram'
                      ? 'https://www.instagram.com/reel/...'
                      : editData.videoAulaSource === 'tiktok'
                      ? 'https://www.tiktok.com/@user/video/...'
                      : 'https://...'
                  }
                  leftIcon={
                    editData.videoAulaSource === 'youtube' ? (
                      <SiYoutube />
                    ) : editData.videoAulaSource === 'instagram' ? (
                      <SiInstagram />
                    ) : editData.videoAulaSource === 'tiktok' ? (
                      <SiTiktok />
                    ) : (
                      <FiExternalLink />
                    )
                  }
                />
              ) : (
                <div>
                  <label className="block text-sm font-medium text-theme-tertiary mb-2">
                    Upload de Video Aula
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        videoAulaFile: e.target.files?.[0] || null,
                      }))
                    }
                    className="w-full p-3 bg-theme-elevated border border-theme-secondary rounded-xl text-theme-primary"
                    disabled={isUploading}
                  />
                  {editData.videoAulaFile && (
                    <p className="text-sm text-theme-secondary mt-1">
                      Arquivo: {editData.videoAulaFile.name}
                    </p>
                  )}
                  {work.videoAulaFile && !editData.videoAulaFile && (
                    <p className="text-sm text-green-400 mt-1">
                      📁 Arquivo atual: {work.videoAulaFile.split('/').pop()}
                    </p>
                  )}
                </div>
              )}

              {/* Botões de ação */}
              <div className="flex items-center space-x-3 pt-4">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={
                    isUploading ? (
                      <FiLoader className="animate-spin" />
                    ) : (
                      <FiSave />
                    )
                  }
                  onClick={saveVideoAula}
                  disabled={
                    isUploading ||
                    (!editData.videoAulaUrl && !editData.videoAulaFile)
                  }
                >
                  {isUploading ? 'Salvando...' : 'Salvar Video Aula'}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FiX />}
                  onClick={() => {
                    setShowEditMode(false);
                    // Restaurar dados originais
                    setEditData({
                      videoAulaUrl: work.videoAulaUrl || '',
                      videoAulaTitle:
                        work.videoAulaTitle || `Video Aula: ${work.title}`,
                      videoAulaType: work.videoAulaType || 'video',
                      videoAulaSource: work.videoAulaSource || 'youtube',
                      videoAulaFile: null,
                    });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ ÁREA DO VÍDEO */}
      {videoInfo && (
        <div className="p-6">
          <div className="relative" style={getContainerStyle()}>
            {!isPlayerVisible || !videoInfo.canEmbed ? (
              // 🎨 THUMBNAIL RESPONSIVO COM BOTÃO PLAY MELHORADO
              <div
                className={`group cursor-pointer transform hover:scale-[1.02] transition-transform duration-300 ${getContainerClass()}`}
                onClick={showPlayer}
              >
                <div className="w-full h-full relative overflow-hidden rounded-xl">
                  {videoInfo.thumbnailUrl ? (
                    <Image
                      width={videoInfo.aspectRatio === '9:16' ? 300 : 800}
                      height={videoInfo.aspectRatio === '9:16' ? 533 : 450}
                      src={videoInfo.thumbnailUrl}
                      alt={work.videoAulaTitle || `Video aula - ${work.title}`}
                      className={getThumbnailClasses()}
                      onError={(e) => {
                        // 🎯 FALLBACK INTELIGENTE DE THUMBNAIL
                        const target = e.currentTarget;
                        const fallbacks = [
                          '/images/video-placeholder.png',
                          '/images/default-video-thumb.jpg',
                          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjAgODBMMTgwIDEyMEwxMjAgMTYwVjgwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K',
                        ];

                        const currentSrc = target.src;
                        const currentIndex = fallbacks.indexOf(currentSrc);
                        const nextIndex = currentIndex + 1;

                        if (nextIndex < fallbacks.length) {
                          target.src = fallbacks[nextIndex];
                        }
                      }}
                      priority={videoInfo.platform === 'youtube'} // Prioridade para YouTube
                    />
                  ) : (
                    // 🎨 PLACEHOLDER ANIMADO QUANDO NÃO TEM THUMBNAIL
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                      <div className="text-center">
                        <FaGraduationCap className="w-16 h-16 lg:w-20 lg:h-20 text-blue-400 mx-auto mb-4 animate-pulse" />
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-300">
                          {videoInfo.displayType}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 🎨 OVERLAY RESPONSIVO MELHORADO */}
                  <div className={getOverlayClasses()}>
                    {/* 🎯 BOTÃO PLAY RESPONSIVO */}
                    <div className={getPlayButtonClasses()}>
                      {videoInfo.canEmbed ? (
                        <FiPlay className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600 ml-1" />
                      ) : (
                        <FiExternalLink className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                      )}
                    </div>
                  </div>

                  {/* 🏷️ BADGE DA PLATAFORMA RESPONSIVO */}
                  <div className="absolute top-3 right-3">
                    <div className={getBadgeClasses()}>
                      {getPlatformIcon(videoInfo.platform)}
                      <span className="text-white font-medium">
                        {videoInfo.displayType}
                      </span>
                    </div>
                  </div>

                  {/* 🎯 INDICADOR DE QUALIDADE/TIPO (NOVO) */}
                  {videoInfo.platform === 'youtube' && (
                    <div className="absolute top-3 left-3">
                      <div className="bg-red-600/90 backdrop-blur-sm rounded px-2 py-1">
                        <span className="text-white text-xs font-bold">HD</span>
                      </div>
                    </div>
                  )}

                  {videoInfo.platform === 'local' && (
                    <div className="absolute top-3 left-3">
                      <div className="bg-green-600/90 backdrop-blur-sm rounded px-2 py-1">
                        <span className="text-white text-xs font-bold">
                          LOCAL
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 🎯 LOADING OVERLAY QUANDO ESTÁ CARREGANDO EMBED */}
                  {loadingEmbed && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-sm">Carregando embed...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // 🎬 PLAYER EMBEDADO MELHORADO
              <div className={getContainerClass()}>
                {videoInfo.platform === 'youtube' ? (
                  <iframe
                    src={`${videoInfo.embedUrl}&autoplay=1&mute=1`}
                    title={work.videoAulaTitle || `Video aula - ${work.title}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded-xl"
                  />
                ) : videoInfo.platform === 'tiktok' && videoInfo.embedHtml ? (
                  // 🎯 TIKTOK EMBED MELHORADO
                  <div className="w-full h-full flex items-center justify-center bg-black rounded-xl overflow-hidden">
                    <div
                      className="max-w-full max-h-full"
                      dangerouslySetInnerHTML={{ __html: videoInfo.embedHtml }}
                    />
                  </div>
                ) : videoInfo.platform === 'instagram-reel' ||
                  videoInfo.platform === 'instagram' ? (
                  // 🎯 INSTAGRAM EMBED COM FALLBACK APRIMORADO
                  <iframe
                    src={videoInfo.embedUrl}
                    title={work.videoAulaTitle || `Video aula - ${work.title}`}
                    frameBorder="0"
                    allowFullScreen
                    className="w-full h-full rounded-xl"
                    onError={() => {
                      console.warn('Instagram embed falhou, redirecionando...');
                      // Aguardar um momento e redirecionar
                      setTimeout(() => {
                        window.open(work.videoAulaUrl, '_blank');
                      }, 1000);
                    }}
                    onLoad={(e) => {
                      // Verificar se carregou corretamente
                      const iframe = e.currentTarget;
                      try {
                        // Se não conseguir acessar o conteúdo, pode ser bloqueado
                        if (!iframe.contentWindow) {
                          throw new Error('Blocked');
                        }
                      } catch {
                        console.warn('Instagram embed pode estar bloqueado');
                      }
                    }}
                  />
                ) : videoInfo.platform === 'local' ||
                  videoInfo.platform === 'direct' ? (
                  // 🎯 VÍDEO LOCAL MELHORADO
                  <video
                    src={videoInfo.embedUrl}
                    controls
                    autoPlay
                    muted // Importante para autoplay funcionar
                    playsInline // Importante para mobile
                    className="w-full h-full object-cover rounded-xl"
                    poster={videoInfo.thumbnailUrl}
                    onError={(e) => {
                      console.error('Erro ao carregar vídeo local:', e);
                    }}
                  >
                    <source src={videoInfo.embedUrl} type="video/mp4" />
                    <source src={videoInfo.embedUrl} type="video/webm" />
                    Seu navegador não suporta vídeos HTML5.
                  </video>
                ) : (
                  // 🎯 FALLBACK IFRAME GENÉRICO
                  <iframe
                    src={videoInfo.embedUrl}
                    title={work.videoAulaTitle || `Video aula - ${work.title}`}
                    frameBorder="0"
                    allowFullScreen
                    className="w-full h-full rounded-xl"
                  />
                )}

                {/* 🎯 BOTÃO PARA FECHAR PLAYER (NOVO) */}
                <button
                  onClick={() => setIsPlayerVisible(false)}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-300 z-10"
                  title="Fechar player"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* ✅ INFORMAÇÕES DO VÍDEO */}
          <div className="mt-4 space-y-3">
            {/* Título e Descrição */}
            <div>
              <h4 className="text-theme-primary font-semibold text-lg">
                {work.videoAulaTitle || `Video Aula: ${work.title}`}
              </h4>
              <p className="text-theme-secondary text-sm mt-1">
                {work.composer.fullName} • {videoInfo.displayType}
              </p>
            </div>

            {/* ✅ METADADOS */}
            <div className="flex items-center justify-between text-sm text-theme-tertiary flex-wrap gap-2">
              <div className="flex items-center space-x-4">
                {/* Data de adição */}
                {work.videoAulaAddedAt && (
                  <div className="flex items-center space-x-1">
                    <FiUser className="w-4 h-4" />
                    <span>{formatDate(work.videoAulaAddedAt)}</span>
                  </div>
                )}

                {/* Duração se disponível */}
                {work.videoAulaMetadata?.duration && (
                  <div className="flex items-center space-x-1">
                    <FiClock className="w-4 h-4" />
                    <span>{work.videoAulaMetadata.duration}</span>
                  </div>
                )}
              </div>

              {/* ✅ DOWNLOAD (para vídeos locais) */}
              {videoInfo.platform === 'local' && work.videoAulaFile && (
                <a
                  href={work.videoAulaFile}
                  download
                  className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors hover:bg-blue-400/10 px-2 py-1 rounded"
                  title="Download do vídeo"
                >
                  <FiDownload className="w-4 h-4" />
                  <span>Download</span>
                </a>
              )}
            </div>

            {/* ✅ BOTÃO DE AÇÃO INTELIGENTE E RESPONSIVO */}
            {!isPlayerVisible && (
              <div className="space-y-2">
                {/* Botão principal */}
                <Button
                  onClick={showPlayer}
                  variant="primary"
                  size="md"
                  leftIcon={
                    videoInfo.canEmbed ? <FiPlay /> : <FiExternalLink />
                  }
                  className="w-full relative overflow-hidden group"
                >
                  <span className="relative z-10">
                    {videoInfo.canEmbed
                      ? `Assistir ${videoInfo.displayType}`
                      : `Abrir no ${getPlatformLabel(videoInfo.platform)}`}
                  </span>

                  {/* Animação de background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>

                {/* ✅ INFORMAÇÕES EXTRAS BASEADAS NA PLATAFORMA */}
                <div className="flex items-center justify-center space-x-4 text-xs text-theme-tertiary">
                  {!videoInfo.canEmbed && (
                    <div className="flex items-center space-x-1">
                      <FiExternalLink className="w-3 h-3" />
                      <span>Abre em nova aba</span>
                    </div>
                  )}

                  {videoInfo.platform === 'local' && (
                    <div className="flex items-center space-x-1">
                      <FiDownload className="w-3 h-3" />
                      <span>Download disponível</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ✅ CONTROLES QUANDO PLAYER ESTÁ ATIVO */}
            {isPlayerVisible && (
              <div className="flex items-center justify-between">
                <Button
                  onClick={() => setIsPlayerVisible(false)}
                  variant="secondary"
                  size="sm"
                  leftIcon={<FiX />}
                >
                  Fechar Player
                </Button>

                {(videoInfo.platform === 'local' ||
                  videoInfo.platform === 'direct') &&
                  work.videoAulaFile && (
                    <a
                      href={work.videoAulaFile}
                      download
                      className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors hover:bg-blue-400/10 px-3 py-2 rounded text-sm"
                    >
                      <FiDownload className="w-4 h-4" />
                      <span>Download</span>
                    </a>
                  )}
              </div>
            )}
          </div>
        </div>
      )}
    </AnimatedCard>
  );
};

export default VideoAulaSection;
