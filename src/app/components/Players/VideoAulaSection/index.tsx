// app/components/Players/VideoAulaSection.tsx - TIKTOK E INSTAGRAM EXTERNOS COM TRADUÇÕES
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
  FiX,
  FiSave,
  FiTrash2,
  FiLoader,
  FiMusic,
  FiPlus,
} from 'react-icons/fi';
import { SiYoutube, SiInstagram, SiTiktok } from 'react-icons/si';
import { AnimatedCard } from '../../animation/AnimatedComponents';
import { FaGraduationCap } from 'react-icons/fa';
import Button from '../../Common/Button';
import Input from '../../Common/Inputs';
import Select from '../../Common/Select';
import Image from 'next/image';
import { useToast } from '@/app/hooks/useToast';
import { useTranslation } from '@/app/hooks/useTranslation';

interface VideoAulaSectionProps {
  work: {
    id: string;
    title: string;
    composer: {
      fullName: string;
    };
    videoAulaUrl?: string;
    videoAulaFile?: string;
    videoAulaTitle?: string;
    videoAulaType?: string;
    videoAulaSource?: string;
    videoAulaAddedBy?: string;
    videoAulaAddedAt?: Date;
    videoAulaMetadata?: any;
  };
  canEditMedia?: boolean;
  onOpenEditModal?: () => void;
}

interface VideoInfo {
  platform: string;
  embedUrl: string;
  thumbnailUrl: string;
  canEmbed: boolean;
  aspectRatio: string;
  displayType: string;
  embedHtml?: string;
  originalUrl?: string; // URL original para abrir externamente
}

const VideoAulaSection: React.FC<VideoAulaSectionProps> = ({
  work,
  canEditMedia = false,
}) => {
  const { t } = useTranslation({ sections: ['pages/workId'] });
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);

  // Estados para modo de edição
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

  const videoAulaTypeOptions = [
    { value: 'video', label: t('video_aula_tipo_normal') },
    { value: 'reels', label: t('video_aula_tipo_reels') },
    { value: 'live', label: t('video_aula_tipo_live') },
  ];

  const videoAulaSourceOptions = [
    { value: 'youtube', label: t('video_aula_fonte_youtube') },
    { value: 'instagram', label: t('video_aula_fonte_instagram') },
    { value: 'tiktok', label: t('video_aula_fonte_tiktok') },
    { value: 'local', label: t('video_aula_fonte_local') },
  ];

  // ✅ VERIFICAR SE TEM VIDEO AULA
  const hasVideoAula = !!(work.videoAulaUrl || work.videoAulaFile);

  // ✅ EMBED INTELIGENTE COM PLACEHOLDERS EXTERNOS PARA TIKTOK E INSTAGRAM
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

    // 🎯 YOUTUBE - EMBED NORMAL
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = extractYouTubeId(url);

      const thumbnailOptions = [
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/default.jpg`,
      ];

      let workingThumbnail = thumbnailOptions[0];

      try {
        const response = await fetch(thumbnailOptions[0], { method: 'HEAD' });
        if (!response.ok) {
          workingThumbnail = thumbnailOptions[1];
        }
      } catch {
        workingThumbnail = thumbnailOptions[1];
      }

      return {
        platform: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`,
        thumbnailUrl: workingThumbnail,
        canEmbed: true,
        aspectRatio,
        displayType,
        originalUrl: url,
      };
    }

    // 🎯 TIKTOK - SEMPRE EXTERNO COM PLACEHOLDER
    if (url.includes('tiktok.com')) {
      console.log('🎯 [VIDEO-AULA] Processando TikTok URL (EXTERNO):', url);

      // Extrair thumbnail do TikTok
      let thumbnailUrl = await extractTikTokThumbnail(url);

      // Se não conseguir thumbnail específica, usar placeholder do TikTok
      if (!thumbnailUrl) {
        thumbnailUrl = await generateTikTokPlaceholder();
      }

      return {
        platform: 'tiktok',
        embedUrl: url, // URL original para abrir externamente
        thumbnailUrl,
        canEmbed: false, // ✅ SEMPRE EXTERNO
        aspectRatio: '9:16',
        displayType: 'TikTok',
        originalUrl: url,
      };
    }

    // 🎯 INSTAGRAM - SEMPRE EXTERNO COM PLACEHOLDER
    if (url.includes('instagram.com')) {
      console.log('🎯 [VIDEO-AULA] Processando Instagram URL (EXTERNO):', url);

      const isReel = url.includes('/reel/') || videoType === 'reels';

      // Extrair thumbnail do Instagram
      let thumbnailUrl = await extractInstagramThumbnail(url);

      // Se não conseguir thumbnail específica, usar placeholder do Instagram
      if (!thumbnailUrl) {
        thumbnailUrl = await generateInstagramPlaceholder(isReel);
      }

      return {
        platform: 'instagram',
        embedUrl: url, // URL original para abrir externamente
        thumbnailUrl,
        canEmbed: false, // ✅ SEMPRE EXTERNO
        aspectRatio: isReel ? '9:16' : '1:1',
        displayType: isReel
          ? t('video_aula_instagram_reel')
          : t('video_aula_instagram_post'),
        originalUrl: url,
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
        originalUrl: url,
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
        originalUrl: url,
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
      originalUrl: url,
    };
  };

  // ✅ FUNÇÕES MELHORADAS DE THUMBNAIL
  const extractTikTokThumbnail = async (
    url: string
  ): Promise<string | null> => {
    try {
      // Tentar diferentes métodos para extrair thumbnail do TikTok
      const tiktokId = url.match(/\/video\/(\d+)/)?.[1];

      if (tiktokId) {
        // Método 1: Tentar acessar metadados via oEmbed (pode falhar devido a CORS)
        try {
          const oEmbedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(
            url
          )}`;
          const response = await fetch(oEmbedUrl);
          if (response.ok) {
            const data = await response.json();
            if (data.thumbnail_url) {
              return data.thumbnail_url;
            }
          }
        } catch (error) {
          console.log('oEmbed TikTok falhou:', error);
        }

        // Método 2: Tentar CDN direto do TikTok
        const possibleThumbnails = [
          `https://p16-sign-va.tiktokcdn.com/obj/tos-maliva-p-0068/o_${tiktokId}`,
          `https://p16-sign-va.tiktokcdn.com/tos-maliva-p-0068/${tiktokId}`,
          `https://sf16-ies-music-va.tiktokcdn.com/obj/tos-useast2a-ve-2774/o_${tiktokId}`,
        ];

        for (const thumbnailUrl of possibleThumbnails) {
          try {
            const response = await fetch(thumbnailUrl, { method: 'HEAD' });
            if (response.ok) {
              return thumbnailUrl;
            }
          } catch {
            continue;
          }
        }
      }

      return null;
    } catch {
      return null;
    }
  };

  const extractInstagramThumbnail = async (
    url: string
  ): Promise<string | null> => {
    try {
      // Instagram não permite acesso direto a thumbnails devido a políticas de CORS
      // Tentar método oEmbed (pode falhar)
      try {
        const oEmbedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(
          url
        )}`;
        const response = await fetch(oEmbedUrl);
        if (response.ok) {
          const data = await response.json();
          if (data.thumbnail_url) {
            return data.thumbnail_url;
          }
        }
      } catch (error) {
        console.log('oEmbed Instagram falhou:', error);
      }

      return null;
    } catch {
      return null;
    }
  };

  // ✅ PLACEHOLDERS PERSONALIZADOS
  const generateTikTokPlaceholder = async (): Promise<string> => {
    // Criar SVG placeholder do TikTok
    const svg = `
      <svg width="300" height="533" viewBox="0 0 300 533" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tiktokGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ff0050;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#00f2ea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="300" height="533" fill="url(#tiktokGradient)"/>
        <circle cx="150" cy="200" r="40" fill="white" opacity="0.9"/>
        <path d="M140 185 L170 205 L140 225 V185Z" fill="black"/>
        <text x="150" y="280" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" font-weight="bold">TikTok</text>
        <text x="150" y="305" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">${
          work.title
        }</text>
        <text x="150" y="325" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" opacity="0.8">${t(
          'video_aula_clique_abrir'
        )}</text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const generateInstagramPlaceholder = async (
    isReel: boolean = false
  ): Promise<string> => {
    const width = isReel ? 300 : 400;
    const height = isReel ? 533 : 400;

    const svg = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="instagramGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#833ab4;stop-opacity:1" />
            <stop offset="25%" style="stop-color:#fd1d1d;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#fcb045;stop-opacity:1" />
            <stop offset="75%" style="stop-color:#fd1d1d;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#833ab4;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#instagramGradient)"/>
        <circle cx="${width / 2}" cy="${
      height / 2 - 50
    }" r="40" fill="white" opacity="0.9"/>
        <path d="${width / 2 - 10} ${height / 2 - 65} L${width / 2 + 10} ${
      height / 2 - 45
    } L${width / 2 - 10} ${height / 2 - 25} V${
      height / 2 - 65
    }Z" fill="#833ab4"/>
        <text x="${width / 2}" y="${
      height / 2 + 20
    }" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" font-weight="bold">${
      isReel ? t('video_aula_instagram_reel') : 'Instagram'
    }</text>
        <text x="${width / 2}" y="${
      height / 2 + 45
    }" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">${
      work.title
    }</text>
        <text x="${width / 2}" y="${
      height / 2 + 65
    }" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" opacity="0.8">${t(
      'video_aula_clique_abrir'
    )}</text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const extractLocalVideoThumbnail = async (
    videoUrl: string
  ): Promise<string | null> => {
    return new Promise((resolve) => {
      try {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.currentTime = 1;

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
    return extractLocalVideoThumbnail(videoUrl);
  };

  // Funções utilitárias
  const getAspectRatio = (type?: string) => {
    switch (type) {
      case 'reels':
        return '9:16';
      case 'live':
      case 'video':
      default:
        return '16:9';
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

  // Funções para salvar e deletar
  const saveVideoAula = async () => {
    if (!canEditMedia) {
      toast.error(t('video_aula_erro_permissao'));
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
          throw new Error(uploadData.error || t('video_aula_erro_salvar'));
        }

        console.log('✅ [VIDEO-AULA] Upload concluído:', uploadData.url);

        updateData.videoAulaFile = uploadData.url;
        updateData.videoAulaUrl = uploadData.url;
        updateData.videoAulaSource = 'local';
      } else if (editData.videoAulaUrl) {
        updateData.videoAulaUrl = editData.videoAulaUrl;
        updateData.videoAulaFile = null;
      }

      updateData.videoAulaTitle =
        editData.videoAulaTitle || `Video Aula: ${work.title}`;
      updateData.videoAulaType = editData.videoAulaType;
      updateData.videoAulaSource = editData.videoAulaFile
        ? 'local'
        : editData.videoAulaSource;
      updateData.mediaSource = 'manual';

      console.log('💾 [VIDEO-AULA] Salvando na base de dados...');

      const response = await fetch(`/api/works/${work.id}/media`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('video_aula_erro_salvar'));
      }

      console.log('✅ [VIDEO-AULA] Video aula salva com sucesso');

      window.location.reload();

      toast.success(t('video_aula_salva_sucesso'));
    } catch (error) {
      console.error('❌ [VIDEO-AULA] Erro ao salvar video aula:', error);
      toast.error(
        error instanceof Error ? error.message : t('video_aula_erro_salvar')
      );
    } finally {
      setIsUploading(false);
    }
  };

  const deleteVideoAula = async () => {
    if (!canEditMedia) {
      toast.error(t('video_aula_erro_permissao'));
      return;
    }

    if (!work.videoAulaUrl && !work.videoAulaFile) {
      toast.error(t('video_aula_nenhuma_deletar'));
      return;
    }

    try {
      setIsUploading(true);

      console.log('🗑️ [VIDEO-AULA] Deletando video aula:', {
        videoAulaFile: work.videoAulaFile,
        videoAulaSource: work.videoAulaSource,
      });

      if (work.videoAulaFile && work.videoAulaSource === 'local') {
        const fileName = work.videoAulaFile.split('/').pop();
        if (fileName) {
          const deleteFileResponse = await fetch(
            `/api/works/${work.id}/media/upload?fileName=${fileName}&mediaType=videoAula`,
            { method: 'DELETE' }
          );

          if (!deleteFileResponse.ok) {
            console.warn('⚠️ [VIDEO-AULA] ' + t('video_aula_falha_deletar'));
          } else {
            console.log('✅ [VIDEO-AULA] ' + t('video_aula_arquivo_deletado'));
          }
        }
      }

      const response = await fetch(`/api/works/${work.id}/media`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'video-aula' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('video_aula_erro_deletar'));
      }

      console.log('✅ [VIDEO-AULA] ' + t('video_aula_deletada_sucesso'));

      window.location.reload();

      toast.success(t('video_aula_deletada_sucesso'));
    } catch (error) {
      console.error('❌ [VIDEO-AULA] Erro ao deletar video aula:', error);
      toast.error(
        error instanceof Error ? error.message : t('video_aula_erro_deletar')
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Funções de interface
  const getThumbnailClasses = () => {
    if (!videoInfo)
      return 'w-full h-full object-cover transition-all duration-300';

    const baseClasses =
      'w-full h-full object-cover transition-all duration-300 group-hover:scale-105';

    switch (videoInfo.aspectRatio) {
      case '9:16':
        return `${baseClasses} object-center`;
      case '1:1':
        return `${baseClasses} object-center`;
      default:
        return `${baseClasses} object-center`;
    }
  };

  const getOverlayClasses = () => {
    if (!videoInfo)
      return 'absolute inset-0 bg-black/40 flex items-center justify-center transition-all duration-300';

    const baseClasses =
      'absolute inset-0 flex items-center justify-center transition-all duration-300 group-hover:bg-black/30';

    switch (videoInfo.aspectRatio) {
      case '9:16':
        return `${baseClasses} bg-gradient-to-t from-black/70 via-black/20 to-transparent`;
      case '1:1':
        return `${baseClasses} bg-gradient-to-r from-black/20 via-black/40 to-black/60`;
      default:
        return `${baseClasses} bg-gradient-to-t from-black/60 via-black/20 to-transparent`;
    }
  };

  const getPlayButtonClasses = () => {
    if (!videoInfo)
      return 'w-16 h-16 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-2xl';

    const baseClasses =
      'bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-2xl';

    switch (videoInfo.aspectRatio) {
      case '9:16':
        return `${baseClasses} w-14 h-14 lg:w-16 lg:h-16`;
      case '1:1':
        return `${baseClasses} w-16 h-16 lg:w-18 lg:h-18`;
      default:
        return `${baseClasses} w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24`;
    }
  };

  const getBadgeClasses = () => {
    if (!videoInfo)
      return 'bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1 transition-all duration-300 text-xs';

    const baseClasses =
      'bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1 transition-all duration-300';

    switch (videoInfo.aspectRatio) {
      case '9:16':
        return `${baseClasses} text-xs lg:text-sm`;
      case '1:1':
        return `${baseClasses} text-xs lg:text-sm`;
      default:
        return `${baseClasses} text-xs lg:text-sm xl:text-base`;
    }
  };

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

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return t('video_aula_fonte_youtube');
      case 'instagram':
        return t('video_aula_fonte_instagram');
      case 'instagram-reel':
        return t('video_aula_instagram_reel');
      case 'tiktok':
        return t('video_aula_fonte_tiktok');
      case 'local':
        return 'Vídeo Local';
      case 'direct':
        return 'Vídeo Direto';
      default:
        return 'Externo';
    }
  };

  const formatDate = (dateString?: Date) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // ✅ FUNÇÃO PARA ABRIR VÍDEO (EXTERNO PARA TIKTOK/INSTAGRAM)
  const showPlayer = () => {
    if (videoInfo?.canEmbed) {
      setIsPlayerVisible(true);
    } else {
      // Para TikTok e Instagram, sempre abrir externamente
      const url =
        videoInfo?.originalUrl || work.videoAulaUrl || work.videoAulaFile;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const getContainerClass = () => {
    if (!videoInfo) return 'aspect-video';

    switch (videoInfo.aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-w-sm max-h-96';
      case '1:1':
        return 'aspect-square max-w-sm max-h-80';
      default:
        return 'aspect-video';
    }
  };

  const getContainerStyle = () => {
    if (!videoInfo) return {};

    if (videoInfo.aspectRatio === '9:16') {
      return {
        maxWidth: '300px',
        margin: '0 auto',
      };
    }

    return {};
  };

  // Detectar plataforma e gerar URLs de embed + pré-popular campos
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

  // ✅ ESTADO VAZIO - SEM VIDEO AULA
  if (!hasVideoAula) {
    return (
      <AnimatedCard hover="lift" className="classical-card overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-theme-secondary bg-gradient-to-r from-blue-900/10 to-purple-800/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
                <FiMusic className="w-5 h-5 text-theme-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-theme-primary classical-title">
                  {t('video_aula_titulo')}
                </h2>
                <p className="text-theme-secondary text-sm">
                  {t('video_aula_subtitulo')}
                </p>
              </div>
            </div>

            {canEditMedia && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<FiPlus />}
                onClick={() => setShowEditMode(true)}
              >
                {t('video_aula_adicionar')}
              </Button>
            )}
          </div>
        </div>

        {/* ✅ MODO DE EDIÇÃO PARA ESTADO VAZIO */}
        {showEditMode && canEditMedia ? (
          <div className="p-6">
            <div className="bg-purple-900/20 border border-purple-700/30 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-theme-primary mb-4">
                {t('video_aula_adicionar')}
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label={t('video_aula_tipo')}
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
                    label={t('video_aula_plataforma')}
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

                <Input
                  label={t('video_aula_titulo_campo')}
                  value={editData.videoAulaTitle}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      videoAulaTitle: e.target.value,
                    }))
                  }
                  placeholder="Ex: Tutorial de Técnica - Chopin Étude Op. 10 No. 1"
                />

                {editData.videoAulaSource !== 'local' ? (
                  <Input
                    label={t('video_aula_url')}
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
                      {t('video_aula_upload')}
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
                        {t('video_aula_arquivo')} {editData.videoAulaFile.name}
                      </p>
                    )}
                  </div>
                )}

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
                    {isUploading
                      ? t('video_aula_deletando')
                      : t('video_aula_salvar')}
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<FiX />}
                    onClick={() => setShowEditMode(false)}
                  >
                    {t('video_aula_cancelar')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ✅ ESTADO VAZIO - CONTEÚDO PRINCIPAL */
          <div className="p-6">
            <div className="text-center py-12">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FaGraduationCap className="w-12 h-12 text-theme-primary" />
              </div>

              <h3 className="text-xl font-semibold text-theme-primary mb-2">
                {t('video_aula_sem_cadastrada')}
              </h3>

              <p className="text-theme-secondary mb-6 max-w-md mx-auto">
                {canEditMedia
                  ? t('video_aula_nao_disponivel_admin')
                  : t('video_aula_nao_disponivel_user')}
              </p>

              {canEditMedia && (
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<FiPlus />}
                  onClick={() => setShowEditMode(true)}
                  className="hover:scale-105 transition-transform duration-300"
                >
                  {t('video_aula_adicionar')}
                </Button>
              )}
            </div>
          </div>
        )}
      </AnimatedCard>
    );
  }

  // ✅ COMPONENTE PRINCIPAL COM VIDEO AULA
  return (
    <AnimatedCard hover="lift" className="classical-card overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-theme-secondary bg-gradient-to-r from-blue-900/10 to-purple-800/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
              <FiMusic className="w-5 h-5 text-theme-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-theme-primary classical-title">
                {t('video_aula_titulo')}
              </h2>
              <p className="text-theme-secondary text-sm">
                {t('video_aula_subtitulo')}
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
                {showEditMode
                  ? t('video_aula_cancelar')
                  : t('video_aula_editar')}
              </Button>
            )}

            {videoInfo &&
              !videoInfo.canEmbed &&
              (work.videoAulaUrl || work.videoAulaFile) && (
                <button
                  onClick={() => {
                    const url =
                      videoInfo?.originalUrl ||
                      work.videoAulaUrl ||
                      work.videoAulaFile;
                    if (url) {
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  className="text-blue-400 hover:text-blue-300 transition-colors p-2 hover:bg-blue-400/10 rounded-lg"
                  title={t('video_aula_abrir_nova_aba')}
                >
                  <FiExternalLink className="w-5 h-5" />
                </button>
              )}
          </div>
        </div>
      </div>

      {/* Modo de edição */}
      {showEditMode && canEditMedia && (
        <div className="px-6 pb-6">
          <div className="bg-purple-900/20 border border-purple-700/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-theme-primary">
                {t('video_aula_editar_titulo')}
              </h3>

              {(work.videoAulaUrl || work.videoAulaFile) && (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<FiTrash2 />}
                  onClick={deleteVideoAula}
                  disabled={isUploading}
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                >
                  {isUploading
                    ? t('video_aula_deletando')
                    : t('video_aula_deletar')}
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label={t('video_aula_tipo')}
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
                  label={t('video_aula_plataforma')}
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

              <Input
                label={t('video_aula_titulo_campo')}
                value={editData.videoAulaTitle}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    videoAulaTitle: e.target.value,
                  }))
                }
                placeholder="Ex: Tutorial de Técnica - Chopin Étude Op. 10 No. 1"
              />

              {editData.videoAulaSource !== 'local' ? (
                <Input
                  label={t('video_aula_url')}
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
                    {t('video_aula_upload')}
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
                      {t('video_aula_arquivo')} {editData.videoAulaFile.name}
                    </p>
                  )}
                  {work.videoAulaFile && !editData.videoAulaFile && (
                    <p className="text-sm text-green-400 mt-1">
                      📁 {t('video_aula_arquivo_atual')}{' '}
                      {work.videoAulaFile.split('/').pop()}
                    </p>
                  )}
                </div>
              )}

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
                  {isUploading
                    ? t('video_aula_deletando')
                    : t('video_aula_salvar')}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FiX />}
                  onClick={() => {
                    setShowEditMode(false);
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
                  {t('video_aula_cancelar')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Área do vídeo */}
      {videoInfo && (
        <div className="p-6">
          <div className="relative" style={getContainerStyle()}>
            {!isPlayerVisible || !videoInfo.canEmbed ? (
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
                      priority={videoInfo.platform === 'youtube'}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                      <div className="text-center">
                        <FaGraduationCap className="w-16 h-16 lg:w-20 lg:h-20 text-blue-400 mx-auto mb-4 animate-pulse" />
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-300">
                          {videoInfo.displayType}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className={getOverlayClasses()}>
                    <div className={getPlayButtonClasses()}>
                      {videoInfo.canEmbed ? (
                        <FiPlay className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600 ml-1" />
                      ) : (
                        <FiExternalLink className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                      )}
                    </div>
                  </div>

                  <div className="absolute top-3 right-3">
                    <div className={getBadgeClasses()}>
                      {getPlatformIcon(videoInfo.platform)}
                      <span className="text-white font-medium">
                        {videoInfo.displayType}
                      </span>
                    </div>
                  </div>

                  {videoInfo.platform === 'youtube' && (
                    <div className="absolute top-3 left-3">
                      <div className="bg-red-600/90 backdrop-blur-sm rounded px-2 py-1">
                        <span className="text-white text-xs font-bold">
                          {t('video_aula_hd')}
                        </span>
                      </div>
                    </div>
                  )}

                  {videoInfo.platform === 'local' && (
                    <div className="absolute top-3 left-3">
                      <div className="bg-green-600/90 backdrop-blur-sm rounded px-2 py-1">
                        <span className="text-white text-xs font-bold">
                          {t('video_aula_local')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ✅ BADGE ESPECIAL PARA TIKTOK E INSTAGRAM */}
                  {(videoInfo.platform === 'tiktok' ||
                    videoInfo.platform === 'instagram') && (
                    <div className="absolute top-3 left-3">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 backdrop-blur-sm rounded px-2 py-1">
                        <span className="text-white text-xs font-bold">
                          {t('video_aula_externo')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ✅ PLAYER EMBED (APENAS YOUTUBE E VÍDEOS LOCAIS) */
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
                ) : videoInfo.platform === 'local' ||
                  videoInfo.platform === 'direct' ? (
                  <video
                    src={videoInfo.embedUrl}
                    controls
                    autoPlay
                    muted
                    playsInline
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
                  <iframe
                    src={videoInfo.embedUrl}
                    title={work.videoAulaTitle || `Video aula - ${work.title}`}
                    frameBorder="0"
                    allowFullScreen
                    className="w-full h-full rounded-xl"
                  />
                )}

                <button
                  onClick={() => setIsPlayerVisible(false)}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-300 z-10"
                  title={t('video_aula_fechar_player')}
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Informações do vídeo */}
          <div className="mt-4 space-y-3">
            <div>
              <h4 className="text-theme-primary font-semibold text-lg">
                {work.videoAulaTitle || `Video Aula: ${work.title}`}
              </h4>
              <p className="text-theme-secondary text-sm mt-1">
                {work.composer.fullName} • {videoInfo.displayType}
              </p>
            </div>

            <div className="flex items-center justify-between text-sm text-theme-tertiary flex-wrap gap-2">
              <div className="flex items-center space-x-4">
                {work.videoAulaAddedAt && (
                  <div className="flex items-center space-x-1">
                    <FiUser className="w-4 h-4" />
                    <span>{formatDate(work.videoAulaAddedAt)}</span>
                  </div>
                )}

                {work.videoAulaMetadata?.duration && (
                  <div className="flex items-center space-x-1">
                    <FiClock className="w-4 h-4" />
                    <span>{work.videoAulaMetadata.duration}</span>
                  </div>
                )}
              </div>

              {videoInfo.platform === 'local' && work.videoAulaFile && (
                <a
                  href={work.videoAulaFile}
                  download
                  className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors hover:bg-blue-400/10 px-2 py-1 rounded"
                  title={t('video_aula_download')}
                >
                  <FiDownload className="w-4 h-4" />
                  <span>{t('video_aula_download')}</span>
                </a>
              )}
            </div>

            {!isPlayerVisible && (
              <div className="space-y-2">
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
                      ? `${t('video_aula_assistir')} ${videoInfo.displayType}`
                      : `${t('video_aula_abrir_no')} ${getPlatformLabel(
                          videoInfo.platform
                        )}`}
                  </span>

                  <div className="absolute inset-0  opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>

                <div className="flex items-center justify-center space-x-4 text-xs text-theme-tertiary">
                  {!videoInfo.canEmbed && (
                    <div className="flex items-center space-x-1">
                      <FiExternalLink className="w-3 h-3" />
                      <span>{t('video_aula_abre_nova_aba')}</span>
                    </div>
                  )}

                  {videoInfo.platform === 'local' && (
                    <div className="flex items-center space-x-1">
                      <FiDownload className="w-3 h-3" />
                      <span>{t('video_aula_download_disponivel')}</span>
                    </div>
                  )}

                  {(videoInfo.platform === 'tiktok' ||
                    videoInfo.platform === 'instagram') && (
                    <div className="flex items-center space-x-1">
                      {getPlatformIcon(videoInfo.platform)}
                      <span>
                        {t('video_aula_abre_no')}{' '}
                        {getPlatformLabel(videoInfo.platform)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isPlayerVisible && (
              <div className="flex items-center justify-between">
                <Button
                  onClick={() => setIsPlayerVisible(false)}
                  variant="secondary"
                  size="sm"
                  leftIcon={<FiX />}
                >
                  {t('video_aula_fechar_player')}
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
                      <span>{t('video_aula_download')}</span>
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
