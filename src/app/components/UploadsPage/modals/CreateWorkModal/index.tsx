// app/components/modals/CreateWorkModal.tsx - CORRIGIDO COM VALIDAÇÃO CUSTOMIZADA
'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiMusic,
  FiExternalLink,
  FiSave,
  FiLoader,
  FiInfo,
  FiTag,
  FiDatabase,
  FiLink,
  FiCheck,
  FiAlertCircle,
  FiSearch,
  FiLock,
} from 'react-icons/fi';
import Select from '@/app/components/Common/Select';
import Input from '@/app/components/Common/Inputs';
import MultiSelect from '@/app/components/Common/MultiSelect';
import {
  AnimatedCard,
  AnimatedItem,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Modal from '@/app/components/Modal';
import ComposerSearchInput from '@/app/components/ComposerSearchInput';
import { useFormValidation, workModalValidations } from '@/app/utils/formUtils';
import {
  filterValidCategories,
  getAllValidCategories,
  mapStyleToEpoch,
  VALID_PORTUGUESE_WORKGENRES,
} from '@/app/utils/valid-categories-and-genres';
import { useToast } from '@/app/hooks/useToast';
import { SiInstagram, SiSpotify, SiTiktok, SiYoutube } from 'react-icons/si';
import { FaGraduationCap } from 'react-icons/fa';
import { useAuth } from '@/app/hooks/useAuth';
import { useSmartFormChanges } from '@/app/hooks/useFormChanges';

interface CreateWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  composers: Array<{ id: string; name: string; fullName: string }>;
  instruments: Array<{ id: string; name: string; category: string }>;
  epochs: Array<{ id: string; name: string }>;
  editingWork?: any;
}

const extractSpotifyTrackId = (url: string) => {
  if (url.includes('spotify.com/track/')) {
    return url.split('/track/')[1].split('?')[0];
  }
  return null;
};

const extractYouTubeVideoId = (url: string) => {
  if (url.includes('youtu.be/')) {
    return url.split('youtu.be/')[1].split('?')[0];
  } else if (url.includes('youtube.com/watch?v=')) {
    return url.split('v=')[1].split('&')[0];
  }
  return null;
};

const workTypeOptions = [
  { value: 'INDIVIDUAL', label: 'Obra Individual' },
  { value: 'COMPLETE_WORK', label: 'Obra Completa' },
  { value: 'ARRANGEMENT', label: 'Arranjo' },
  { value: 'COLLECTION', label: 'Coleção' },
  { value: 'COLLABORATION', label: 'Colaboração' },
  { value: 'COMPOSITION', label: 'Composição' },
  { value: 'COLLECTED_WORKS', label: 'Obras Coletadas' },
  { value: 'COLLECTIONS_WITH', label: 'Coleções com' },
];

const difficultyOptions = [
  { value: '', label: 'Não especificado' },
  { value: 'BEGINNER', label: 'Iniciante' },
  { value: 'INTERMEDIATE', label: 'Intermediário' },
  { value: 'ADVANCED', label: 'Avançado' },
];

const tonalityOptions = [
  { value: '', label: 'Selecione uma tonalidade' },

  // Tonalidades Maiores
  { value: 'Do maior', label: 'Dó maior' },
  { value: 'Do# maior', label: 'Dó# maior' },
  { value: 'Reb maior', label: 'Réb maior' },
  { value: 'Re maior', label: 'Ré maior' },
  { value: 'Re# maior', label: 'Ré# maior' },
  { value: 'Mib maior', label: 'Mib maior' },
  { value: 'Mi maior', label: 'Mi maior' },
  { value: 'Fa maior', label: 'Fá maior' },
  { value: 'Fa# maior', label: 'Fá# maior' },
  { value: 'Solb maior', label: 'Solb maior' },
  { value: 'Sol maior', label: 'Sol maior' },
  { value: 'Sol# maior', label: 'Sol# maior' },
  { value: 'Lab maior', label: 'Láb maior' },
  { value: 'La maior', label: 'Lá maior' },
  { value: 'La# maior', label: 'Lá# maior' },
  { value: 'Sib maior', label: 'Sib maior' },
  { value: 'Si maior', label: 'Si maior' },

  // Tonalidades Menores
  { value: 'Do menor', label: 'Dó menor' },
  { value: 'Do# menor', label: 'Dó# menor' },
  { value: 'Reb menor', label: 'Réb menor' },
  { value: 'Re menor', label: 'Ré menor' },
  { value: 'Re# menor', label: 'Ré# menor' },
  { value: 'Mib menor', label: 'Mib menor' },
  { value: 'Mi menor', label: 'Mi menor' },
  { value: 'Fa menor', label: 'Fá menor' },
  { value: 'Fa# menor', label: 'Fá# menor' },
  { value: 'Solb menor', label: 'Solb menor' },
  { value: 'Sol menor', label: 'Sol menor' },
  { value: 'Sol# menor', label: 'Sol# menor' },
  { value: 'Lab menor', label: 'Láb menor' },
  { value: 'La menor', label: 'Lá menor' },
  { value: 'La# menor', label: 'Lá# menor' },
  { value: 'Sib menor', label: 'Sib menor' },
  { value: 'Si menor', label: 'Si menor' },

  // Modos
  { value: 'Dorico', label: 'Dórico' },
  { value: 'Frigio', label: 'Frígio' },
  { value: 'Lidio', label: 'Lídio' },
  { value: 'Mixolidio', label: 'Mixolídio' },
  { value: 'Eolio', label: 'Eólio' },
  { value: 'Locrio', label: 'Lócrio' },

  // Outras categorias
  { value: 'Atonal', label: 'Atonal' },
  { value: 'Politonal', label: 'Politonal' },
  { value: 'Modal', label: 'Modal' },
  { value: 'Cromática', label: 'Cromática' },
  { value: 'Dodecafônica', label: 'Dodecafônica' },
  { value: 'Pentatônica', label: 'Pentatônica' },
  { value: 'Não especificada', label: 'Não especificada' },
];

// 🆕 FUNÇÃO PARA LIMPAR URL DO IMSLP
function cleanImslpUrl(url: string): string {
  try {
    // Decodificar caracteres URL (ex: %C3%A9 -> é)
    const decodedUrl = decodeURIComponent(url);

    // Remover fragmentos e parâmetros de query
    const cleanedUrl = decodedUrl.split('#')[0].split('?')[0];

    console.log(`🧹 URL limpa: ${url} -> ${cleanedUrl}`);
    return cleanedUrl;
  } catch (error) {
    console.error('❌ Erro ao limpar URL:', error);
    return url;
  }
}

const CreateWorkModal = ({
  isOpen,
  onClose,
  composers,
  instruments,
  epochs,
  editingWork,
}: CreateWorkModalProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrapingUrl, setScrapingUrl] = useState(false);
  const [urlToScrape, setUrlToScrape] = useState('');
  const [scrapingResult, setScrapingResult] = useState<any>(null);
  const [duplicateCheck, setDuplicateCheck] = useState<{
    loading: boolean;
    found: boolean;
    work?: any;
  }>({ loading: false, found: false });

  // 🆕 ESTADO PARA DETECTAR EDIÇÃO DE FONTE EXTERNA
  const [isEditingExternalSource, setIsEditingExternalSource] = useState(false);
  const [includeMedia, setIncludeMedia] = useState(false);
  const [mediaData, setMediaData] = useState({
    // Spotify
    spotifyUrl: '',

    // YouTube
    youtubeUrl: '',

    // Áudio customizado
    audioFile: null as File | null,

    // Video Aula
    hasVideoAula: false,
    videoAulaUrl: '',
    videoAulaFile: null as File | null,
    videoAulaTitle: '',
    videoAulaType: 'video', // video, story, reels, live, tutorial
    videoAulaSource: 'youtube', // youtube, instagram, tiktok, local, external
  });
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingVideoAula, setUploadingVideoAula] = useState(false);

  const { user } = useAuth();
  // 🔧 CORRIGIDO: Memoizar as opções para evitar recriação a cada render
  const validCategoryOptions = useMemo(() => getAllValidCategories(), []);
  const validWorkGenreOptions = useMemo(
    () => Array.from(VALID_PORTUGUESE_WORKGENRES).sort(),
    []
  );

  // 🔧 CORRIGIDO: Refs para scroll automático com tipos corretos
  const fieldRefs = {
    title: useRef<HTMLInputElement>(null),
    composerId: useRef<HTMLDivElement>(null), // 🆕 CORRIGIDO PARA DIV (ComposerSearchInput)
    instrumentId: useRef<HTMLSelectElement>(null),
    epochId: useRef<HTMLSelectElement>(null),
  };

  // 🔧 CORRIGIDO: Inicializando com strings vazias ao invés de null
  const [formData, setFormData] = useState({
    title: '',
    composerId: '',
    instrumentId: '',
    epochId: '',
    videoUrl: '',
    imslpId: '',
    imslpPermlink: '',
    opOrCatalog: '',
    compositionYear: '',
    firstPublishDate: '',
    tone: '',
    mediaDuration: '',
    workStyle: '',
    moviment: '',
    categoryNames: [] as string[],
    workGenresArr: [] as string[],
    dedicateTo: '',
    instrumentation: '',
    workType: 'INDIVIDUAL',
    movementNumber: '',
    subtitle: '',
    imslpTags: '',
    difficultyLevel: '', // 🔧 CORRIGIDO: string vazia ao invés de null
  });

  // Support data para listas de apoio
  const [supportData, setSupportData] = useState<{
    epochs: any[];
    instruments: any[];
    roles: any[];
    composers: any[];
    works: any[];
  }>({
    epochs: epochs,
    instruments: instruments,
    roles: [],
    composers: composers,
    works: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 🆕 CONFIGURAR VALIDAÇÃO DE FORMULÁRIO
  const requiredFields = ['title', 'composerId', 'instrumentId', 'epochId'];
  const customValidations = workModalValidations;

  const { validateForm } = useFormValidation(
    fieldRefs,
    requiredFields,
    customValidations
  );

  // 🆕 Opções para Video Aula
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

  // 🔧 CORRIGIDO: Usar useCallback para estabilizar funções
  const handleInputChange = useCallback(
    (field: string, value: string | boolean | string[]) => {
      // 🆕 NOVO: Se for o campo imslpId, limpar a URL
      if (field === 'imslpId' && typeof value === 'string') {
        value = cleanImslpUrl(value);
      }

      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' }));
      }
    },
    [errors]
  );

  const handleComposerSelect = useCallback(
    (composerId: string) => {
      setFormData((prev) => ({ ...prev, composerId }));
      if (errors.composerId) {
        setErrors((prev) => ({ ...prev, composerId: '' }));
      }
    },
    [errors.composerId]
  );

  const originalData = useMemo(() => {
    if (!editingWork) return null;

    return {
      title: editingWork.title || '',
      composerId: editingWork.composerId || '',
      instrumentId: editingWork.instrumentId || '',
      epochId: editingWork.epochId || '',
      videoUrl: editingWork.videoUrl || '',
      imslpId: editingWork.imslpId || '',
      imslpPermlink: editingWork.imslpPermlink || '',
      opOrCatalog: editingWork.opOrCatalog || '',
      compositionYear: editingWork.compositionYear || '',
      firstPublishDate: editingWork.firstPublishDate || '',
      tone: editingWork.tone || '',
      mediaDuration: editingWork.mediaDuration || '',
      workStyle: editingWork.workStyle || '',
      moviment: editingWork.moviment || '',
      categoryNames: editingWork.categoryNames || [],
      workGenresArr: editingWork.workGenresArr || [],
      dedicateTo: editingWork.dedicateTo || '',
      instrumentation: editingWork.instrumentation || '',
      workType: editingWork.workType || 'INDIVIDUAL',
      movementNumber: editingWork.movementNumber?.toString() || '',
      subtitle: editingWork.subtitle || '',

      imslpTags: editingWork.imslpTags?.join(', ') || '',
      difficultyLevel: editingWork.difficultyLevel || '', // 🔧 CORRIGIDO: string vazia
    };
  }, [editingWork]);

  const hasChanges = useSmartFormChanges(
    formData,
    originalData,
    ['workType'] // Se null = modo criação, se preenchido = modo edição
  );
  // Populate form when editing
  useEffect(() => {
    loadFormData();
    if (editingWork) {
      // 🆕 DETECTAR SE É EDIÇÃO DE FONTE EXTERNA (IMSLP)
      let detectedUrl = '';

      if (editingWork.imslpId || editingWork.imslpPermlink) {
        setIsEditingExternalSource(true);
        // Construir URL do IMSLP baseado no ID ou permlink
        detectedUrl =
          editingWork.imslpPermlink ||
          (editingWork.imslpId
            ? `https://imslp.org/wiki/${editingWork.imslpId}`
            : '');
      }

      setUrlToScrape(detectedUrl);

      setFormData({
        title: editingWork.title || '',
        composerId: editingWork.composerId || '',
        instrumentId: editingWork.instrumentId || '',
        epochId: editingWork.epochId || '',
        videoUrl: editingWork.videoUrl || '',
        imslpId: editingWork.imslpId || '',
        imslpPermlink: editingWork.imslpPermlink || '',
        opOrCatalog: editingWork.opOrCatalog || '',
        compositionYear: editingWork.compositionYear || '',
        firstPublishDate: editingWork.firstPublishDate || '',
        tone: editingWork.tone || '',
        mediaDuration: editingWork.mediaDuration || '',
        workStyle: editingWork.workStyle || '',
        moviment: editingWork.moviment || '',
        categoryNames: editingWork.categoryNames || [],
        workGenresArr: editingWork.workGenresArr || [],
        dedicateTo: editingWork.dedicateTo || '',
        instrumentation: editingWork.instrumentation || '',
        workType: editingWork.workType || 'INDIVIDUAL',
        movementNumber: editingWork.movementNumber?.toString() || '',
        subtitle: editingWork.subtitle || '',

        imslpTags: editingWork.imslpTags?.join(', ') || '',
        difficultyLevel: editingWork.difficultyLevel || '', // 🔧 CORRIGIDO: string vazia
      });

      const hasExistingMedia = !!(
        editingWork.spotifyTrackId ||
        editingWork.youtubeVideoId ||
        editingWork.customAudioFile ||
        editingWork.videoAulaUrl ||
        editingWork.videoAulaFile
      );

      setIncludeMedia(hasExistingMedia);

      setMediaData({
        spotifyUrl: editingWork.spotifyTrackUrl || '',
        youtubeUrl: editingWork.youtubeVideoUrl || '',
        audioFile: null,
        hasVideoAula: !!(editingWork.videoAulaUrl || editingWork.videoAulaFile),
        videoAulaUrl: editingWork.videoAulaUrl || '',
        videoAulaFile: null,
        videoAulaTitle: editingWork.videoAulaTitle || '',
        videoAulaType: editingWork.videoAulaType || 'video',
        videoAulaSource: editingWork.videoAulaSource || 'youtube',
      });
    }
  }, [editingWork]);

  const handleAudioUpload = async (file: File) => {
    if (!file) return;

    setUploadingAudio(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('mediaType', 'audio');

      // Para edição, usar workId existente, senão usar temp
      const workId = editingWork?.id || 'temp';

      const response = await fetch(`/api/works/${workId}/media/upload`, {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro no upload');
      }

      setMediaData((prev) => ({ ...prev, audioFile: file }));
      toast.success('Áudio enviado com sucesso!');
    } catch (error) {
      console.error('Erro no upload de áudio:', error);
      toast.error(error instanceof Error ? error.message : 'Erro no upload');
    } finally {
      setUploadingAudio(false);
    }
  };

  // 🆕 Upload de video aula
  const handleVideoAulaUpload = async (file: File) => {
    if (!file) return;

    setUploadingVideoAula(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('mediaType', 'videoAula');

      const workId = editingWork?.id || 'temp';

      const response = await fetch(`/api/works/${workId}/media/upload`, {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro no upload');
      }

      setMediaData((prev) => ({ ...prev, videoAulaFile: file }));
      toast.success('Video aula enviado com sucesso!');
    } catch (error) {
      console.error('Erro no upload de video aula:', error);
      toast.error(error instanceof Error ? error.message : 'Erro no upload');
    } finally {
      setUploadingVideoAula(false);
    }
  };
  // Carregar dados adicionais quando necessário
  const loadFormData = async () => {
    try {
      const response = await fetch('/api/uploads/form-data');
      if (response.ok) {
        const data = await response.json();
        setSupportData((prev) => ({
          ...prev,
          roles: data.roles || [],
          instruments: data.instruments || prev.instruments,
          works: data.works || [],
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do formulário:', error);
    }
  };

  // Verificar duplicatas por link IMSLP
  const checkDuplicateByLink = async (url: string) => {
    if (!url.trim()) return;

    setDuplicateCheck({ loading: true, found: false });

    try {
      const response = await fetch('/api/uploads/work/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          excludeId: editingWork?.id,
        }),
      });

      const data = await response.json();

      if (data.found) {
        setDuplicateCheck({
          loading: false,
          found: true,
          work: data.work,
        });
        console.log('⚠️ Obra duplicada encontrada:', data.work.title);
        return true;
      } else {
        setDuplicateCheck({ loading: false, found: false });
        console.log('✅ Nenhuma duplicata encontrada');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao verificar duplicata:', error);
      setDuplicateCheck({ loading: false, found: false });
      return false;
    }
  };

  // 🆕 FUNÇÃO DE VALIDAÇÃO MELHORADA
  const handleValidation = () => {
    console.log('valiou');
    const { isValid, errors: validationErrors } = validateForm(formData);
    setErrors(validationErrors);
    return isValid;
  };

  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🆕 USAR VALIDAÇÃO CUSTOMIZADA (SEM required DO HTML)
    if (!handleValidation()) {
      return;
    }

    // Verificar duplicatas antes de salvar (apenas se não estiver editando fonte externa)
    if (
      !isEditingExternalSource &&
      formData.imslpId &&
      (await checkDuplicateByLink(formData.imslpId))
    ) {
      toast.error('Já existe uma obra com este link do IMSLP.');
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        // categoryNames e workGenresArr já são arrays
        imslpTags: formData.imslpTags
          ? formData.imslpTags.split(',').map((s) => s.trim())
          : [],
        movementNumber: formData.movementNumber
          ? parseInt(formData.movementNumber)
          : null,

        difficultyLevel: formData.difficultyLevel || null,
        ...(includeMedia && {
          // Spotify
          spotifyTrackUrl: mediaData.spotifyUrl || null,
          spotifyTrackId: mediaData.spotifyUrl
            ? extractSpotifyTrackId(mediaData.spotifyUrl)
            : null,

          // YouTube
          youtubeVideoUrl: mediaData.youtubeUrl || null,
          youtubeVideoId: mediaData.youtubeUrl
            ? extractYouTubeVideoId(mediaData.youtubeUrl)
            : null,
          youtubeTitle: mediaData.youtubeUrl
            ? `${formData.title} - ${
                composers.find((c) => c.id === formData.composerId)?.fullName
              }`
            : null,

          // Áudio customizado será tratado pelo upload

          // Video Aula
          ...(mediaData.hasVideoAula && {
            videoAulaUrl: mediaData.videoAulaUrl || null,
            videoAulaTitle: mediaData.videoAulaTitle || formData.title,
            videoAulaType: mediaData.videoAulaType,
            videoAulaSource: mediaData.videoAulaSource,
            videoAulaAddedAt: new Date(),
          }),

          // Marcar como manual
          mediaSource: 'manual',
        }),
      };

      const url = editingWork
        ? `/api/uploads/work/${editingWork.id}`
        : '/api/uploads/work';

      const method = editingWork ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        router.refresh();
        onClose();
        toast.success(data.message || 'Obra salva com sucesso!');
      } else {
        throw new Error(data.error || 'Erro ao salvar obra');
      }
    } catch (error) {
      console.error('Erro ao salvar obra:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao salvar obra'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🆕 CORRIGIDO: handleScrapeUrl com URL limpa
  const handleScrapeUrl = async () => {
    if (!urlToScrape.trim()) {
      toast.error('Digite uma URL para fazer scraping');
      return;
    }

    // Verificar se é uma URL válida do IMSLP
    if (!urlToScrape.includes('imslp.org/wiki/')) {
      toast.error(
        'Por favor, insira um link válido do IMSLP (deve conter "imslp.org/wiki/")'
      );
      return;
    }

    // 🆕 LIMPAR URL ANTES DE VERIFICAR DUPLICATAS
    const cleanedUrl = cleanImslpUrl(urlToScrape);

    // Verificar duplicatas antes de fazer scraping
    const isDuplicate = await checkDuplicateByLink(cleanedUrl);
    if (isDuplicate) {
      toast.error('Já existe uma obra com este link do IMSLP.');
      return;
    }

    setScrapingUrl(true);
    setScrapingResult(null);

    try {
      console.log('🚀 Iniciando scraping da URL:', cleanedUrl);

      const response = await fetch('/api/uploads/work/scraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: cleanedUrl, // 🆕 USAR URL LIMPA
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Scraping concluído com sucesso:', data);
        setScrapingResult(data);
        await fillFromScrapingResult(data.data);
      } else {
        throw new Error(data.error || 'Erro ao fazer scraping');
      }
    } catch (error) {
      console.error('❌ Erro ao fazer scraping:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao fazer scraping'
      );
    } finally {
      setScrapingUrl(false);
    }
  };

  const fillFromScrapingResult = async (data: any) => {
    // Primeiro, preencher todos os dados básicos
    setFormData((prev) => ({
      ...prev,
      title: data.title || prev.title,
      subtitle: data.subtitle || prev.subtitle,
      imslpId: data.imslpId || prev.imslpId,
      imslpPermlink: data.imslpPermlink || prev.imslpPermlink,
      opOrCatalog: data.opOrCatalog || prev.opOrCatalog,
      compositionYear: data.compositionYear || prev.compositionYear,
      firstPublishDate: data.firstPublishDate || prev.firstPublishDate,
      tone: data.tone || prev.tone,
      mediaDuration: data.mediaDuration || prev.mediaDuration,
      workStyle: data.workStyle || prev.workStyle,
      moviment: data.moviment || prev.moviment,
      instrumentation: data.instrumentation || prev.instrumentation,
      dedicateTo: data.dedicateTo || prev.dedicateTo,

      categoryNames: data.categoryNames
        ? filterValidCategories(data.categoryNames)
        : prev.categoryNames,
      workGenresArr: data.workGenresArr
        ? data.workGenresArr.filter((genre: string) =>
            VALID_PORTUGUESE_WORKGENRES.has(genre.toLowerCase().trim())
          )
        : prev.workGenresArr,
      difficultyLevel: data.difficultyLevel || prev.difficultyLevel,
      workType: data.workType || prev.workType,
      movementNumber: data.movementNumber?.toString() || prev.movementNumber,
      // 🔧 CORRIGIDO: Garantir que sempre temos um ID de compositor válido
      composerId: data.composerId || prev.composerId,
    }));

    // Buscar época automaticamente usando o mapeamento
    if (data.workStyle || data.epochName) {
      const styleToMap = data.workStyle || data.epochName;
      const mappedEpoch = mapStyleToEpoch(styleToMap);

      if (mappedEpoch) {
        const epoch = epochs.find((e) =>
          e.name.toLowerCase().includes(mappedEpoch.toLowerCase())
        );
        if (epoch) {
          setFormData((prev) => ({ ...prev, epochId: epoch.id }));
          console.log(`🏛️ Época vinculada automaticamente: ${epoch.name}`);
        } else {
          console.log(`⚠️ Época não encontrada no banco: ${mappedEpoch}`);
        }
      }
    }

    // Buscar instrumento automaticamente baseado no primaryInstrument
    if (data.primaryInstrument) {
      const instrument = supportData.instruments.find((i) =>
        i.name.toLowerCase().includes(data.primaryInstrument.toLowerCase())
      );
      if (instrument) {
        setFormData((prev) => ({ ...prev, instrumentId: instrument.id }));
        console.log(
          `🎼 Instrumento vinculado automaticamente: ${instrument.name}`
        );
      } else {
        console.log(
          `⚠️ Instrumento não encontrado no banco: ${data.primaryInstrument}`
        );
      }
    }

    // 🔧 CORRIGIDO: Definir o compositor apenas se foi encontrado
    if (data.composerId) {
      setFormData((prev) => ({ ...prev, composerId: data.composerId }));
      console.log(
        `🎼 Compositor vinculado automaticamente: ${data.composerId}`
      );
    }
  };

  // 🔧 CORRIGIDO: Memoizar excludeValues para evitar recriação
  const categoryExcludeValues = useMemo(() => [], []);
  const workGenresExcludeValues = useMemo(() => [], []);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (editingWork && originalData) {
          setFormData(originalData);
        }
        onClose();
      }}
      maxWidth="4xl"
      showCloseButton={true}
      confirmOnClose={true} // Ativa confirmação
      hasChanges={hasChanges} // Detecta mudanças
      isProcessing={isSubmitting || duplicateCheck.loading} // Detecta processo
      processName="criação de peça"
    >
      <AnimatedItem direction="scale" springType="bouncy" className="w-full">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-theme-secondary">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-green rounded-xl flex items-center justify-center">
                <FiMusic className="w-5 h-5 text-theme-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-primary classical-title">
                  {editingWork ? 'Editar Obra' : 'Nova Obra'}
                </h2>
                <p className="text-theme-secondary text-sm">
                  {editingWork
                    ? 'Atualize as informações da obra'
                    : 'Adicione uma nova obra à enciclopédia'}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mt-4 ">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* URL Scraping */}
              <AnimatedCard className="classical-card-simple p-4" hover="none">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FiDatabase className="w-4 h-4 text-theme-tertiary" />
                    <span className="text-sm font-medium text-theme-primary">
                      Extrair Dados do IMSLP
                    </span>
                    {/* 🆕 INDICADOR DE FONTE EXTERNA DETECTADA */}
                    {isEditingExternalSource && (
                      <div className="flex items-center space-x-1 text-xs text-blue-600">
                        <FiLock className="w-3 h-3" />
                        <span>Fonte IMSLP detectada automaticamente</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <Input
                    label="URL do IMSLP"
                    value={urlToScrape}
                    onChange={(e) => setUrlToScrape(e.target.value)}
                    placeholder="https://imslp.org/wiki/Symphony_No.40_(Mozart,_Wolfgang_Amadeus)"
                    leftIcon={<FiLink />}
                    disabled={isEditingExternalSource} // 🆕 DESABILITAR QUANDO EDITANDO FONTE EXTERNA
                  />

                  {/* Verificação de Duplicata */}
                  {duplicateCheck.loading && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FiLoader className="w-4 h-4 animate-spin text-blue-600" />
                        <span className="text-sm text-blue-800">
                          Verificando duplicatas...
                        </span>
                      </div>
                    </div>
                  )}

                  {duplicateCheck.found && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <FiAlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">
                          Obra já existe!
                        </span>
                      </div>
                      <p className="text-sm text-red-700">
                        Já existe uma obra com este link:{' '}
                        <strong>{duplicateCheck.work?.title}</strong>
                      </p>
                    </div>
                  )}

                  {/* Botão de Scraping */}
                  {!isEditingExternalSource && (
                    <div className="mt-3">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        leftIcon={
                          scrapingUrl ? (
                            <FiLoader className="animate-spin" />
                          ) : (
                            <FiSearch />
                          )
                        }
                        onClick={handleScrapeUrl}
                        disabled={scrapingUrl || duplicateCheck.found}
                      >
                        {scrapingUrl ? 'Extraindo Dados...' : 'Extrair Dados'}
                      </Button>
                    </div>
                  )}

                  {/* Resultado do Scraping */}
                  {scrapingResult && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <FiCheck className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Dados extraídos com sucesso!
                        </span>
                      </div>
                      <div className="text-xs text-green-700">
                        Fonte: {scrapingResult.source} | Qualidade:{' '}
                        {scrapingResult.data.pageQuality} | Completude:{' '}
                        {scrapingResult.data.dataCompleteness}%
                      </div>
                    </div>
                  )}

                  {/* 🆕 AVISO PARA FONTE EXTERNA SENDO EDITADA */}
                  {isEditingExternalSource && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FiInfo className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-800">
                          Esta obra foi originalmente criada a partir do IMSLP.
                          Você pode editar os dados diretamente nos campos
                          abaixo.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </AnimatedCard>

              {/* Basic Information */}
              <AnimatedCard className="classical-card-simple p-4" hover="none">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiInfo className="w-5 h-5" />
                  <span>Informações Básicas</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Título *"
                    ref={fieldRefs.title}
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    error={errors.title}
                    placeholder="Sinfonia No. 40 em Sol menor"
                  />

                  <Input
                    label="Subtítulo"
                    value={formData.subtitle}
                    onChange={(e) =>
                      handleInputChange('subtitle', e.target.value)
                    }
                    placeholder="Subtítulo da obra"
                  />

                  <div ref={fieldRefs.composerId}>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Compositor *
                    </label>
                    <ComposerSearchInput
                      selectedComposer={formData.composerId}
                      onComposerSelect={handleComposerSelect}
                      popularComposers={supportData.composers}
                    />
                    {errors.composerId && (
                      <p className="text-red-500 text-sm font-medium flex items-center space-x-1 mt-1">
                        <FiAlertCircle className="w-4 h-4" />
                        <span>{errors.composerId}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Instrumento *
                    </label>
                    <Select
                      ref={fieldRefs.instrumentId}
                      options={[
                        { value: '', label: 'Selecione um instrumento' },
                        ...supportData.instruments.map((instrument) => ({
                          value: instrument.id,
                          label: `${instrument.name}`,
                        })),
                      ]}
                      value={formData.instrumentId}
                      onChange={(e) =>
                        handleInputChange('instrumentId', e.target.value)
                      }
                      error={errors.instrumentId}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Época *
                    </label>
                    <Select
                      ref={fieldRefs.epochId}
                      options={[
                        { value: '', label: 'Selecione uma época' },
                        ...epochs.map((epoch) => ({
                          value: epoch.id,
                          label: epoch.name,
                        })),
                      ]}
                      value={formData.epochId}
                      onChange={(e) =>
                        handleInputChange('epochId', e.target.value)
                      }
                      error={errors.epochId}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Tipo de Obra
                    </label>
                    <Select
                      options={workTypeOptions}
                      value={formData.workType}
                      onChange={(e) =>
                        handleInputChange('workType', e.target.value)
                      }
                    />
                  </div>
                </div>
              </AnimatedCard>

              {/* Catalog Information */}
              <AnimatedCard className="classical-card-simple p-4" hover="none">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiTag className="w-5 h-5" />
                  <span>Informações de Catálogo</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Op. ou Catálogo"
                    value={formData.opOrCatalog}
                    onChange={(e) =>
                      handleInputChange('opOrCatalog', e.target.value)
                    }
                    placeholder="K. 550, Op. 67"
                  />

                  <Input
                    label="Ano de Composição"
                    value={formData.compositionYear}
                    onChange={(e) =>
                      handleInputChange('compositionYear', e.target.value)
                    }
                    placeholder="1788"
                  />

                  <Input
                    label="Primeira Publicação"
                    value={formData.firstPublishDate}
                    onChange={(e) =>
                      handleInputChange('firstPublishDate', e.target.value)
                    }
                    placeholder="1794"
                  />

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Tonalidade
                    </label>
                    <Select
                      options={tonalityOptions}
                      value={formData.tone}
                      onChange={(e) =>
                        handleInputChange('tone', e.target.value)
                      }
                      placeholder="Selecione uma tonalidade"
                    />
                  </div>

                  <Input
                    label="Duração"
                    value={formData.mediaDuration}
                    onChange={(e) =>
                      handleInputChange('mediaDuration', e.target.value)
                    }
                    placeholder="35 minutos"
                  />

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Dificuldade
                    </label>
                    <Select
                      options={difficultyOptions}
                      value={formData.difficultyLevel}
                      onChange={(e) =>
                        handleInputChange('difficultyLevel', e.target.value)
                      }
                    />
                  </div>
                </div>
              </AnimatedCard>

              {/* Musical Details */}
              <AnimatedCard className="classical-card-simple p-4" hover="none">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiMusic className="w-5 h-5" />
                  <span>Detalhes Musicais</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Estilo"
                    value={formData.workStyle}
                    onChange={(e) =>
                      handleInputChange('workStyle', e.target.value)
                    }
                    placeholder="Classical"
                  />

                  <Input
                    label="Movimento"
                    value={formData.moviment}
                    onChange={(e) =>
                      handleInputChange('moviment', e.target.value)
                    }
                    placeholder="I. Allegro molto"
                  />

                  <Input
                    label="Instrumentação"
                    value={formData.instrumentation}
                    onChange={(e) =>
                      handleInputChange('instrumentation', e.target.value)
                    }
                    placeholder="2 flautas, 2 oboés, 2 clarinetes..."
                  />

                  <Input
                    label="Dedicado a"
                    value={formData.dedicateTo}
                    onChange={(e) =>
                      handleInputChange('dedicateTo', e.target.value)
                    }
                    placeholder="Nome do dedicatário"
                  />
                </div>
              </AnimatedCard>

              {/* Categories and Genres */}
              <AnimatedCard className="classical-card-simple p-4" hover="none">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiTag className="w-5 h-5" />
                  <span>Categorias e Gêneros</span>
                </h3>

                <div className="space-y-4">
                  <MultiSelect
                    label="Categorias"
                    options={validCategoryOptions}
                    selectedValues={formData.categoryNames}
                    onChange={(values) =>
                      handleInputChange('categoryNames', values)
                    }
                    placeholder="Selecione categorias válidas..."
                    excludeValues={categoryExcludeValues}
                  />

                  <MultiSelect
                    label="Gêneros"
                    options={validWorkGenreOptions}
                    selectedValues={formData.workGenresArr}
                    onChange={(values) =>
                      handleInputChange('workGenresArr', values)
                    }
                    placeholder="Selecione gêneros válidos..."
                    excludeValues={workGenresExcludeValues}
                  />
                </div>
              </AnimatedCard>

              {/* External Links */}
              <AnimatedCard className="classical-card-simple p-4" hover="none">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiExternalLink className="w-5 h-5" />
                  <span>Links Externos</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ID IMSLP */}
                  <Input
                    label="Link IMSLP"
                    value={formData.imslpPermlink}
                    onChange={(e) =>
                      handleInputChange('imslpId', e.target.value)
                    }
                    placeholder="Symphony_No.40_(Mozart,_Wolfgang_Amadeus)"
                    leftIcon={<FiExternalLink />}
                  />
                </div>
              </AnimatedCard>

              {/* 🆕 NOVA SEÇÃO: MÍDIA */}
              <AnimatedCard className="classical-card-simple p-4" hover="none">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FiMusic className="w-4 h-4 text-theme-tertiary" />
                    <span className="text-sm font-medium text-theme-primary">
                      Adicionar Mídia
                    </span>
                  </div>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <Input
                      type="checkbox"
                      checked={includeMedia}
                      onChange={(e) => setIncludeMedia(e.target.checked)}
                      className="w-4 h-4 text-brand-primary bg-theme-elevated border-theme-secondary rounded focus:ring-brand-primary"
                    />
                    <span className="text-sm text-theme-primary">
                      Adicionar mídia?
                    </span>
                  </label>
                </div>

                {includeMedia && (
                  <div className="space-y-6 border-t border-theme-secondary pt-4">
                    {/* Spotify */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <SiSpotify className="w-5 h-5 text-green-400" />
                        <h4 className="text-lg font-semibold text-theme-primary">
                          Spotify
                        </h4>
                      </div>
                      <Input
                        label="URL do Spotify"
                        value={mediaData.spotifyUrl}
                        onChange={(e) =>
                          setMediaData((prev) => ({
                            ...prev,
                            spotifyUrl: e.target.value,
                          }))
                        }
                        placeholder="https://open.spotify.com/track/..."
                        leftIcon={<SiSpotify />}
                      />
                    </div>

                    {/* YouTube */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <SiYoutube className="w-5 h-5 text-red-400" />
                        <h4 className="text-lg font-semibold text-theme-primary">
                          YouTube
                        </h4>
                      </div>
                      <Input
                        label="URL do YouTube"
                        value={mediaData.youtubeUrl}
                        onChange={(e) =>
                          setMediaData((prev) => ({
                            ...prev,
                            youtubeUrl: e.target.value,
                          }))
                        }
                        placeholder="https://www.youtube.com/watch?v=..."
                        leftIcon={<SiYoutube />}
                      />
                    </div>

                    {/* Áudio Customizado */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <FiMusic className="w-5 h-5 text-blue-400" />
                        <h4 className="text-lg font-semibold text-theme-primary">
                          Áudio Personalizado
                        </h4>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-theme-tertiary mb-2">
                          Upload de Arquivo de Áudio
                        </label>
                        <Input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setMediaData((prev) => ({
                                ...prev,
                                audioFile: file,
                              }));
                              if (editingWork) {
                                handleAudioUpload(file);
                              }
                            }
                          }}
                          className="w-full p-3 bg-theme-elevated border border-theme-secondary rounded-xl text-theme-primary"
                          disabled={uploadingAudio}
                        />
                        {uploadingAudio && (
                          <p className="text-sm text-blue-400 mt-1 flex items-center space-x-1">
                            <FiLoader className="w-4 h-4 animate-spin" />
                            <span>Enviando áudio...</span>
                          </p>
                        )}
                        {mediaData.audioFile && (
                          <p className="text-sm text-theme-secondary mt-1">
                            Arquivo: {mediaData.audioFile.name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Video Aula */}
                    {user && user.role >= 1 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FaGraduationCap className="w-5 h-5 text-purple-400" />
                            <h4 className="text-lg font-semibold text-theme-primary">
                              Video Aula
                            </h4>
                          </div>

                          <label className="flex items-center space-x-2 cursor-pointer">
                            <Input
                              type="checkbox"
                              checked={mediaData.hasVideoAula}
                              onChange={(e) =>
                                setMediaData((prev) => ({
                                  ...prev,
                                  hasVideoAula: e.target.checked,
                                }))
                              }
                              className="w-4 h-4 text-purple-600 bg-theme-elevated border-theme-secondary rounded focus:ring-purple-500"
                            />
                            <span className="text-sm text-theme-primary">
                              Incluir video aula?
                            </span>
                          </label>
                        </div>

                        {mediaData.hasVideoAula && (
                          <div className="space-y-4 p-4 bg-purple-900/10 border border-purple-700/30 rounded-xl">
                            {/* Tipo e Fonte */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-theme-tertiary mb-2">
                                  Tipo de Vídeo
                                </label>
                                <Select
                                  options={videoAulaTypeOptions}
                                  value={mediaData.videoAulaType}
                                  onChange={(e) =>
                                    setMediaData((prev) => ({
                                      ...prev,
                                      videoAulaType: e.target.value,
                                    }))
                                  }
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-theme-tertiary mb-2">
                                  Plataforma/Fonte
                                </label>
                                <Select
                                  options={videoAulaSourceOptions}
                                  value={mediaData.videoAulaSource}
                                  onChange={(e) =>
                                    setMediaData((prev) => ({
                                      ...prev,
                                      videoAulaSource: e.target.value,
                                    }))
                                  }
                                />
                              </div>
                            </div>

                            {/* Título personalizado */}
                            <Input
                              label="Título da Video Aula"
                              value={mediaData.videoAulaTitle}
                              onChange={(e) =>
                                setMediaData((prev) => ({
                                  ...prev,
                                  videoAulaTitle: e.target.value,
                                }))
                              }
                              placeholder="Ex: Tutorial de Técnica - Chopin Étude Op. 10 No. 1"
                            />

                            {/* URL ou Upload */}
                            {mediaData.videoAulaSource !== 'local' ? (
                              <Input
                                label="URL do Vídeo"
                                value={mediaData.videoAulaUrl}
                                onChange={(e) =>
                                  setMediaData((prev) => ({
                                    ...prev,
                                    videoAulaUrl: e.target.value,
                                  }))
                                }
                                placeholder={
                                  mediaData.videoAulaSource === 'youtube'
                                    ? 'https://www.youtube.com/watch?v=...'
                                    : mediaData.videoAulaSource === 'instagram'
                                    ? 'https://www.instagram.com/reel/...'
                                    : 'https://...'
                                }
                                leftIcon={
                                  mediaData.videoAulaSource === 'youtube' ? (
                                    <SiYoutube />
                                  ) : mediaData.videoAulaSource ===
                                    'instagram' ? (
                                    <SiInstagram />
                                  ) : mediaData.videoAulaSource === 'tiktok' ? (
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
                                <Input
                                  type="file"
                                  accept="video/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setMediaData((prev) => ({
                                        ...prev,
                                        videoAulaFile: file,
                                      }));
                                      if (editingWork) {
                                        handleVideoAulaUpload(file);
                                      }
                                    }
                                  }}
                                  className="w-full p-3 bg-theme-elevated border border-theme-secondary rounded-xl text-theme-primary"
                                  disabled={uploadingVideoAula}
                                />
                                {uploadingVideoAula && (
                                  <p className="text-sm text-purple-400 mt-1 flex items-center space-x-1">
                                    <FiLoader className="w-4 h-4 animate-spin" />
                                    <span>Enviando video aula...</span>
                                  </p>
                                )}
                                {mediaData.videoAulaFile && (
                                  <p className="text-sm text-theme-secondary mt-1">
                                    Arquivo: {mediaData.videoAulaFile.name}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </AnimatedCard>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-theme-secondary">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  leftIcon={
                    isSubmitting ? (
                      <FiLoader className="animate-spin" />
                    ) : (
                      <FiSave />
                    )
                  }
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Salvando...'
                    : editingWork
                    ? 'Atualizar Obra'
                    : 'Criar Obra'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </AnimatedItem>
    </Modal>
  );
};

export default CreateWorkModal;
