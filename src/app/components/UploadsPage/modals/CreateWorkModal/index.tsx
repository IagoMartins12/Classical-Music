// app/components/modals/CreateWorkModal.tsx - TRADUZIDO
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
  FiLayers,
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
import { useTranslation } from '@/app/hooks/useTranslation';
import { SiInstagram, SiSpotify, SiTiktok, SiYoutube } from 'react-icons/si';
import { FaGraduationCap } from 'react-icons/fa';
import { useAuth } from '@/app/hooks/useAuth';
import { useSmartFormChanges } from '@/app/hooks/useFormChanges';
import Checkbox from '@/app/components/Common/Checkbox';
import SimpleWorkSearchInput from '@/app/components/SimpleWorkSearchInput';

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

function cleanImslpUrl(url: string): string {
  try {
    const decodedUrl = decodeURIComponent(url);
    const cleanedUrl = decodedUrl.split('#')[0].split('?')[0];
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
  const { t } = useTranslation({ sections: ['pages/uploads'] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrapingUrl, setScrapingUrl] = useState(false);
  const [urlToScrape, setUrlToScrape] = useState('');
  const [scrapingResult, setScrapingResult] = useState<any>(null);
  const [duplicateCheck, setDuplicateCheck] = useState<{
    loading: boolean;
    found: boolean;
    work?: any;
  }>({ loading: false, found: false });
  // 🆕 ESTADO PARA PARENT WORK (COLEÇÃO)
  const [isPartOfCollection, setIsPartOfCollection] = useState(false);
  const [parentWorks, setParentWorks] = useState<
    Array<{
      id: string;
      title: string;
      composer: { id?: string; name: string; fullName: string };
    }>
  >([]);
  const [isEditingExternalSource, setIsEditingExternalSource] = useState(false);
  const [includeMedia, setIncludeMedia] = useState(false);
  const [mediaData, setMediaData] = useState({
    spotifyUrl: '',
    youtubeUrl: '',
    audioFile: null as File | null,
    hasVideoAula: false,
    videoAulaUrl: '',
    videoAulaFile: null as File | null,
    videoAulaTitle: '',
    videoAulaType: 'video',
    videoAulaSource: 'youtube',
  });
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingVideoAula, setUploadingVideoAula] = useState(false);

  const { user } = useAuth();

  const validCategoryOptions = useMemo(() => getAllValidCategories(), []);
  const validWorkGenreOptions = useMemo(
    () => Array.from(VALID_PORTUGUESE_WORKGENRES).sort(),
    []
  );

  const workTypeOptions = [
    { value: 'INDIVIDUAL', label: t('work_types_INDIVIDUAL') },
    { value: 'COMPLETE_WORK', label: t('work_types_COMPLETE_WORK') },
    { value: 'ARRANGEMENT', label: t('work_types_ARRANGEMENT') },
    { value: 'COLLECTION', label: t('work_types_COLLECTION') },
    { value: 'COLLABORATION', label: t('work_types_COLLABORATION') },
    { value: 'COMPOSITION', label: t('work_types_COMPOSITION') },
    { value: 'COLLECTED_WORKS', label: t('work_types_COLLECTED_WORKS') },
    { value: 'COLLECTIONS_WITH', label: t('work_types_COLLECTIONS_WITH') },
  ];

  const difficultyOptions = [
    { value: '', label: t('difficulty_not_specified') },
    { value: 'BEGINNER', label: t('difficulty_BEGINNER') },
    { value: 'INTERMEDIATE', label: t('difficulty_INTERMEDIATE') },
    { value: 'ADVANCED', label: t('difficulty_ADVANCED') },
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

  const fieldRefs = {
    title: useRef<HTMLInputElement>(null),
    composerId: useRef<HTMLDivElement>(null),
    instrumentId: useRef<HTMLSelectElement>(null),
    epochId: useRef<HTMLSelectElement>(null),
  };

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
    difficultyLevel: '',
    parentWorkId: '', // 🆕 NOVO CAMPO
  });

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

  const requiredFields = useMemo(() => {
    const base = ['title', 'composerId', 'instrumentId', 'epochId'];
    if (isPartOfCollection) {
      base.push('parentWorkId');
    }
    return base;
  }, [isPartOfCollection]);
  // const customValidations = workModalValidations;
  const customValidations = useMemo(
    () => ({
      ...workModalValidations,
      parentWorkId: (value: string) => {
        if (isPartOfCollection && !value?.trim()) {
          return 'Selecione uma obra da coleção';
        }
        return null;
      },
    }),
    [isPartOfCollection]
  );
  const { validateForm } = useFormValidation(
    fieldRefs,
    requiredFields,
    customValidations
  );

  const videoAulaTypeOptions = [
    { value: 'video', label: t('video_lesson_types_video') },
    { value: 'reels', label: t('video_lesson_types_reels') },
    { value: 'live', label: t('video_lesson_types_live') },
  ];

  const videoAulaSourceOptions = [
    { value: 'youtube', label: t('video_lesson_sources_youtube') },
    { value: 'instagram', label: t('video_lesson_sources_instagram') },
    { value: 'tiktok', label: t('video_lesson_sources_tiktok') },
    { value: 'local', label: t('video_lesson_sources_local') },
  ];

  const handleInputChange = useCallback(
    (field: string, value: string | boolean | string[]) => {
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
      setFormData((prev) => ({
        ...prev,
        composerId,
        parentWorkId: '', // 🆕 Limpar obra da coleção ao trocar compositor
      }));
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
      difficultyLevel: editingWork.difficultyLevel || '',
      parentWorkId: editingWork.parentWorkId || '', // 🆕 NOVO CAMPO
    };
  }, [editingWork]);

  const hasChanges = useSmartFormChanges(formData, originalData, ['workType']);
  // 🆕 FUNÇÃO PARA CARREGAR OBRAS DO COMPOSITOR (PARA PARENT WORK)
  const loadParentWorks = useCallback(async (composerId: string) => {
    if (!composerId) {
      setParentWorks([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/works/search?composer=${composerId}&limit=50`
      );
      if (response.ok) {
        const data = await response.json();
        // Filtrar apenas obras que podem ser coleções (não obras filhas)
        const potentialParents = data.works.filter(
          (work: any) => !work.parentWorkId
        );
        setParentWorks(potentialParents || []);
        console.log(
          '✅ Parent works carregadas:',
          potentialParents?.length || 0
        );
      }
    } catch (error) {
      console.error('❌ Erro ao carregar parent works:', error);
      setParentWorks([]);
    }
  }, []);
  // 🆕 EFFECT PARA CARREGAR PARENT WORKS QUANDO COMPOSITOR MUDAR
  useEffect(() => {
    if (isPartOfCollection && formData.composerId) {
      loadParentWorks(formData.composerId);
    } else {
      setParentWorks([]);
    }
  }, [isPartOfCollection, formData.composerId, loadParentWorks]);

  // 🆕 HANDLER PARA PARENT WORK
  const handleParentWorkSelect = useCallback((parentWorkId: string) => {
    setFormData((prev) => ({ ...prev, parentWorkId }));
  }, []);

  const handleAudioUpload = async (file: File) => {
    if (!file) return;

    setUploadingAudio(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('mediaType', 'audio');

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

  // Load form data
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

  // Check for duplicates
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
        return true;
      } else {
        setDuplicateCheck({ loading: false, found: false });
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao verificar duplicata:', error);
      setDuplicateCheck({ loading: false, found: false });
      return false;
    }
  };

  const handleValidation = () => {
    const { isValid, errors: validationErrors } = validateForm(formData);
    setErrors(validationErrors);
    return isValid;
  };

  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!handleValidation()) {
      return;
    }

    // Check for duplicates if not editing external source
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
        imslpTags: formData.imslpTags
          ? formData.imslpTags.split(',').map((s) => s.trim())
          : [],
        movementNumber: formData.movementNumber
          ? parseInt(formData.movementNumber)
          : null,
        difficultyLevel: formData.difficultyLevel || null,
        ...(includeMedia && {
          spotifyTrackUrl: mediaData.spotifyUrl || null,
          spotifyTrackId: mediaData.spotifyUrl
            ? extractSpotifyTrackId(mediaData.spotifyUrl)
            : null,
          youtubeVideoUrl: mediaData.youtubeUrl || null,
          youtubeVideoId: mediaData.youtubeUrl
            ? extractYouTubeVideoId(mediaData.youtubeUrl)
            : null,
          youtubeTitle: mediaData.youtubeUrl
            ? `${formData.title} - ${
                composers.find((c) => c.id === formData.composerId)?.fullName
              }`
            : null,
          ...(mediaData.hasVideoAula && {
            videoAulaUrl: mediaData.videoAulaUrl || null,
            videoAulaTitle: mediaData.videoAulaTitle || formData.title,
            videoAulaType: mediaData.videoAulaType,
            videoAulaSource: mediaData.videoAulaSource,
            videoAulaAddedAt: new Date(),
          }),
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

  const handleScrapeUrl = async () => {
    if (!urlToScrape.trim()) {
      toast.error('Digite uma URL para fazer scraping');
      return;
    }

    if (!urlToScrape.includes('imslp.org/wiki/')) {
      toast.error(
        'Por favor, insira um link válido do IMSLP (deve conter "imslp.org/wiki/")'
      );
      return;
    }

    const cleanedUrl = cleanImslpUrl(urlToScrape);

    const isDuplicate = await checkDuplicateByLink(cleanedUrl);
    if (isDuplicate) {
      toast.error('Já existe uma obra com este link do IMSLP.');
      return;
    }

    setScrapingUrl(true);
    setScrapingResult(null);

    try {
      const response = await fetch('/api/uploads/work/scraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: cleanedUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
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
      composerId: data.composerId || prev.composerId,
    }));

    if (data.workStyle || data.epochName) {
      const styleToMap = data.workStyle || data.epochName;
      const mappedEpoch = mapStyleToEpoch(styleToMap);

      if (mappedEpoch) {
        const epoch = epochs.find((e) =>
          e.name.toLowerCase().includes(mappedEpoch.toLowerCase())
        );
        if (epoch) {
          setFormData((prev) => ({ ...prev, epochId: epoch.id }));
        }
      }
    }

    if (data.primaryInstrument) {
      const instrument = supportData.instruments.find((i) =>
        i.name.toLowerCase().includes(data.primaryInstrument.toLowerCase())
      );
      if (instrument) {
        setFormData((prev) => ({ ...prev, instrumentId: instrument.id }));
      }
    }

    if (data.composerId) {
      setFormData((prev) => ({ ...prev, composerId: data.composerId }));
    }
  };

  useEffect(() => {
    loadFormData();
    if (editingWork) {
      let detectedUrl = '';

      if (editingWork.imslpId || editingWork.imslpPermlink) {
        setIsEditingExternalSource(true);
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
        difficultyLevel: editingWork.difficultyLevel || '',
        parentWorkId: editingWork.parentWorkId || '', // 🆕 NOVO CAMPO
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
      confirmOnClose={true}
      hasChanges={hasChanges}
      isProcessing={isSubmitting || duplicateCheck.loading}
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
                  {editingWork
                    ? t('modal_work_title_edit')
                    : t('modal_work_title_create')}
                </h2>
                <p className="text-theme-secondary text-sm">
                  {editingWork
                    ? t('modal_work_subtitle_edit')
                    : t('modal_work_subtitle_create')}
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
                      {t('modal_work_scraping_title')}
                    </span>
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
                    label={t('modal_work_scraping_url_label')}
                    value={urlToScrape}
                    onChange={(e) => setUrlToScrape(e.target.value)}
                    placeholder="https://imslp.org/wiki/Symphony_No.40_(Mozart,_Wolfgang_Amadeus)"
                    leftIcon={<FiLink />}
                    disabled={isEditingExternalSource}
                  />

                  {duplicateCheck.loading && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FiLoader className="w-4 h-4 animate-spin text-blue-600" />
                        <span className="text-sm text-blue-800">
                          {t('modal_work_scraping_checking_duplicates')}
                        </span>
                      </div>
                    </div>
                  )}

                  {duplicateCheck.found && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <FiAlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">
                          {t('modal_work_scraping_duplicate_found')}
                        </span>
                      </div>
                      <p className="text-sm text-red-700">
                        {t('modal_work_scraping_duplicate_message', {
                          title: duplicateCheck.work?.title,
                        })}
                      </p>
                    </div>
                  )}

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
                      >
                        {scrapingUrl
                          ? t('modal_work_scraping_extracting')
                          : t('modal_work_scraping_extract_button')}
                      </Button>
                    </div>
                  )}

                  {scrapingResult && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <FiCheck className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          {t('modal_work_scraping_success')}
                        </span>
                      </div>
                      <div className="text-xs text-green-700">
                        {t('modal_work_scraping_source', {
                          source: scrapingResult.source,
                          quality: scrapingResult.data.pageQuality,
                          completeness: scrapingResult.data.dataCompleteness,
                        })}
                      </div>
                    </div>
                  )}

                  {isEditingExternalSource && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FiInfo className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-800">
                          {t('modal_work_scraping_external_detected')}
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
                  <span>{t('modal_work_basic_title')}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={`${t('modal_work_basic_title_field')} *`}
                    ref={fieldRefs.title}
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    error={errors.title}
                    placeholder="Sinfonia No. 40 em Sol menor"
                  />

                  <Input
                    label={t('modal_work_basic_subtitle')}
                    value={formData.subtitle}
                    onChange={(e) =>
                      handleInputChange('subtitle', e.target.value)
                    }
                    placeholder="Subtítulo da obra"
                  />

                  <div ref={fieldRefs.composerId}>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      {t('modal_work_basic_composer')} *
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
                      {t('modal_work_basic_instrument')} *
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
                      {t('modal_work_basic_epoch')} *
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
                      {t('modal_work_basic_work_type')}
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

              {/* 🆕 PARENT WORK (COLEÇÃO) SECTION */}
              <AnimatedCard className="classical-card-simple p-4" hover="none">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FiLayers className="w-4 h-4 text-theme-tertiary" />
                    <span className="text-sm font-medium text-theme-primary">
                      Coleção
                    </span>
                  </div>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      label="Essa peça faz parte de uma coleção?"
                      type="checkbox"
                      checked={isPartOfCollection}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIsPartOfCollection(checked);
                        if (!checked) {
                          setFormData((prev) => ({
                            ...prev,
                            parentWorkId: '',
                          }));
                        }
                      }}
                    />
                  </label>
                </div>

                {isPartOfCollection && (
                  <div className="space-y-4 border-t border-theme-secondary pt-4">
                    {/* Informação sobre compositor */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FiInfo className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-800">
                          <strong>Importante:</strong> A obra da coleção deve
                          ser do mesmo compositor (
                          {formData.composerId
                            ? composers.find(
                                (c) => c.id === formData.composerId
                              )?.fullName || 'compositor selecionado'
                            : 'selecione um compositor primeiro'}
                          ).
                        </span>
                      </div>
                    </div>

                    {/* Work Search Input para Parent Work */}
                    {formData.composerId ? (
                      <div>
                        <label className="block text-sm font-medium text-theme-tertiary mb-2">
                          Obra da Coleção *
                        </label>
                        <SimpleWorkSearchInput
                          selectedWork={formData.parentWorkId}
                          onWorkSelect={handleParentWorkSelect}
                          userSuggestions={parentWorks}
                          placeholder="Digite para buscar a obra da coleção..."
                          filterByComposer={formData.composerId}
                          error={
                            errors.parentWorkId
                              ? 'Selecione a obra principal.'
                              : undefined
                          }
                        />
                        <p className="text-xs text-theme-tertiary mt-2">
                          💡 Busque pela obra principal que contém esta peça
                          como parte ou movimento.
                        </p>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                )}
              </AnimatedCard>

              {/* Catalog Information */}
              <AnimatedCard className="classical-card-simple p-4" hover="none">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiTag className="w-5 h-5" />
                  <span>{t('modal_work_catalog_title')}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('modal_work_catalog_op')}
                    value={formData.opOrCatalog}
                    onChange={(e) =>
                      handleInputChange('opOrCatalog', e.target.value)
                    }
                    placeholder="K. 550, Op. 67"
                  />

                  <Input
                    label={t('modal_work_catalog_composition_year')}
                    value={formData.compositionYear}
                    onChange={(e) =>
                      handleInputChange('compositionYear', e.target.value)
                    }
                    placeholder="1788"
                  />

                  <Input
                    label={t('modal_work_catalog_first_publish')}
                    value={formData.firstPublishDate}
                    onChange={(e) =>
                      handleInputChange('firstPublishDate', e.target.value)
                    }
                    placeholder="1794"
                  />

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      {t('modal_work_catalog_tonality')}
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
                    label={t('modal_work_catalog_duration')}
                    value={formData.mediaDuration}
                    onChange={(e) =>
                      handleInputChange('mediaDuration', e.target.value)
                    }
                    placeholder="35 minutos"
                  />

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      {t('modal_work_catalog_difficulty')}
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
                  <span>{t('modal_work_musical_title')}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('modal_work_musical_style')}
                    value={formData.workStyle}
                    onChange={(e) =>
                      handleInputChange('workStyle', e.target.value)
                    }
                    placeholder="Classical"
                  />

                  <Input
                    label={t('modal_work_musical_movement')}
                    value={formData.moviment}
                    onChange={(e) =>
                      handleInputChange('moviment', e.target.value)
                    }
                    placeholder="I. Allegro molto"
                  />

                  <Input
                    label={t('modal_work_musical_instrumentation')}
                    value={formData.instrumentation}
                    onChange={(e) =>
                      handleInputChange('instrumentation', e.target.value)
                    }
                    placeholder="2 flautas, 2 oboés, 2 clarinetes..."
                  />

                  <Input
                    label={t('modal_work_musical_dedicated_to')}
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
                  <span>{t('modal_work_categories_title')}</span>
                </h3>

                <div className="space-y-4">
                  <MultiSelect
                    label={t('modal_work_categories_label')}
                    options={validCategoryOptions}
                    selectedValues={formData.categoryNames}
                    onChange={(values) =>
                      handleInputChange('categoryNames', values)
                    }
                    placeholder={t('modal_work_categories_placeholder')}
                    excludeValues={categoryExcludeValues}
                  />

                  <MultiSelect
                    label={t('modal_work_genres_label')}
                    options={validWorkGenreOptions}
                    selectedValues={formData.workGenresArr}
                    onChange={(values) =>
                      handleInputChange('workGenresArr', values)
                    }
                    placeholder={t('modal_work_genres_placeholder')}
                    excludeValues={workGenresExcludeValues}
                  />
                </div>
              </AnimatedCard>

              {/* External Links */}
              <AnimatedCard className="classical-card-simple p-4" hover="none">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiExternalLink className="w-5 h-5" />
                  <span>{t('modal_work_external_links_title')}</span>
                </h3>

                <div className="flex flex-col gap-2">
                  <Input
                    label={t('modal_work_external_imslp_link')}
                    value={formData.imslpPermlink}
                    onChange={(e) =>
                      handleInputChange('imslpId', e.target.value)
                    }
                    placeholder="Symphony_No.40_(Mozart,_Wolfgang_Amadeus)"
                    leftIcon={<FiExternalLink />}
                    disabled={scrapingResult}
                    className={
                      scrapingResult ? 'bg-gray-50 cursor-not-allowed' : ''
                    }
                  />

                  {scrapingResult && (
                    <div className="mt-1 flex items-center space-x-1 text-xs text-theme-primary font-bold">
                      <FiLock className="w-3 h-3" />
                      <span>
                        Campo bloqueado pois foi extraído via scraping do IMSLP
                      </span>
                    </div>
                  )}
                </div>
              </AnimatedCard>

              {/* Media Section */}
              <AnimatedCard className="classical-card-simple p-4" hover="none">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FiMusic className="w-4 h-4 text-theme-tertiary" />
                    <span className="text-sm font-medium text-theme-primary">
                      {t('modal_work_media_title')}
                    </span>
                  </div>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      label={t('modal_work_media_checkbox')}
                      type="checkbox"
                      checked={includeMedia}
                      onChange={(e) => setIncludeMedia(e.target.checked)}
                    />
                  </label>
                </div>

                {includeMedia && (
                  <div className="space-y-6 border-t border-theme-secondary pt-4">
                    {/* Spotify */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <SiSpotify className="w-5 h-5 text-green-400" />
                        <h4 className="text-lg font-semibold text-theme-primary">
                          {t('modal_work_media_spotify_title')}
                        </h4>
                      </div>
                      <Input
                        label={t('modal_work_media_spotify_url')}
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
                          {t('modal_work_media_youtube_title')}
                        </h4>
                      </div>
                      <Input
                        label={t('modal_work_media_youtube_url')}
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

                    {/* Custom Audio */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <FiMusic className="w-5 h-5 text-blue-400" />
                        <h4 className="text-lg font-semibold text-theme-primary">
                          {t('modal_work_media_audio_title')}
                        </h4>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-theme-tertiary mb-2">
                          {t('modal_work_media_audio_upload')}
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
                            <span>{t('modal_work_media_audio_uploading')}</span>
                          </p>
                        )}
                        {mediaData.audioFile && (
                          <p className="text-sm text-theme-secondary mt-1">
                            Arquivo: {mediaData.audioFile.name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Video Lesson */}
                    {user && user.role >= 1 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FaGraduationCap className="w-5 h-5 text-purple-400" />
                            <h4 className="text-lg font-semibold text-theme-primary">
                              {t('modal_work_media_video_lesson_title')}
                            </h4>
                          </div>

                          <label className="flex items-center space-x-2 cursor-pointer">
                            <Checkbox
                              label={t(
                                'modal_work_media_video_lesson_checkbox'
                              )}
                              type="checkbox"
                              checked={mediaData.hasVideoAula}
                              onChange={(e) =>
                                setMediaData((prev) => ({
                                  ...prev,
                                  hasVideoAula: e.target.checked,
                                }))
                              }
                            />
                          </label>
                        </div>

                        {mediaData.hasVideoAula && (
                          <div className="space-y-4 p-4 bg-purple-900/10 border border-purple-700/30 rounded-xl">
                            {/* Type and Source */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-theme-tertiary mb-2">
                                  {t('modal_work_media_video_type')}
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
                                  {t('modal_work_media_video_source')}
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

                            {/* Custom title */}
                            <Input
                              label={t('modal_work_media_video_title_field')}
                              value={mediaData.videoAulaTitle}
                              onChange={(e) =>
                                setMediaData((prev) => ({
                                  ...prev,
                                  videoAulaTitle: e.target.value,
                                }))
                              }
                              placeholder="Ex: Tutorial de Técnica - Chopin Étude Op. 10 No. 1"
                            />

                            {/* URL or Upload */}
                            {mediaData.videoAulaSource !== 'local' ? (
                              <Input
                                label={t('modal_work_media_video_url')}
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
                                  {t('modal_work_media_video_upload')}
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
                                    <span>
                                      {t('modal_work_media_video_uploading')}
                                    </span>
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
                  {t('form_cancel')}
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
                    ? t('form_saving')
                    : editingWork
                    ? t('form_update') + ' Obra'
                    : t('form_create') + ' Obra'}
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
