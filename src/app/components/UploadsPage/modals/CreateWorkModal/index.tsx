// app/components/modals/CreateWorkModal.tsx - COM INTEGRAÇÃO DE SUGESTÃO DE OBRA PAI
'use client';

import { ENVIOS } from '@/app/conteudo/textos/envios';
import { useTextos } from '@/app/hooks/useTextos';
import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useId,
} from 'react';
import { useRouter } from 'next/navigation';
import { PiFloppyDisk, PiLock, PiMagnifyingGlass } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { CaixaDeMarcar } from '@/app/components/ui/CaixaDeMarcar';
import { Field } from '@/app/components/ui/Field';
import { Selecao } from '@/app/components/ui/Selecao';
import {
  Aviso,
  CampoDeArquivo,
  FormBlock,
  FormSheet,
} from '@/app/components/site/edit/FormSheet';
import { SelecaoMultipla } from '@/app/components/ui/SelecaoMultipla';
import {
  escreverInstrumentacao,
  lerInstrumentacao,
  opcoesDeInstrumento,
  rotuloDoInstrumento,
} from '@/app/conteudo/site/instrumentacao';
import ComposerSearchInput from '@/app/components/ComposerSearchInput';
import { useFormValidation, workModalValidations } from '@/app/utils/formUtils';
import {
  filterValidCategories,
  getAllValidCategories,
  mapStyleToEpoch,
  VALID_PORTUGUESE_WORKGENRES,
} from '@/app/utils/valid-categories-and-genres';
import { useToast } from '@/app/hooks/useToast';
import { useAuth } from '@/app/hooks/useAuth';
import { useSmartFormChanges } from '@/app/hooks/useFormChanges';
import SimpleWorkSearchInput from '@/app/components/SimpleWorkSearchInput';
import { translateEpochName } from '@/app/utils/translations/epochTranslations';
import { translateInstrument } from '@/app/utils/translations/instrumentsGenresTranslation';
import { TONALITIES } from '@/app/utils/tonalities';
import { translateToneStatic } from '@/app/utils/translations/toneTranslation';
import ParentWorkSuggestionModal from '../ParentWorkSuggestionModal';
import {
  checkWorkDuplicateRequest,
  saveWorkRequest,
} from '@/app/requests/uploads-client';
import { getWorkById, searchWorks } from '@/app/requests/catalog-search';
import { scrapeWorkPage } from '@/app/requests/external-sources';
import {
  updateWorkMediaRequest,
  uploadWorkMediaFileRequest,
} from '@/app/requests/work-media';
import { useTx } from '@/app/hooks/useTx';

interface CreateWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  composers: Array<{ id: string; name: string; fullName: string }>;
  instruments: Array<{ id: string; name: string; category?: string | null }>;
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
  const tx = useTx();
  const idCampo = useId();
  const formId = `${idCampo}-form`;
  const router = useRouter();
  const { t, language } = useTextos(ENVIOS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrapingUrl, setScrapingUrl] = useState(false);
  const [urlToScrape, setUrlToScrape] = useState('');
  const [scrapingResult, setScrapingResult] = useState<any>(null);
  const [duplicateCheck, setDuplicateCheck] = useState<{
    loading: boolean;
    found: boolean;
    work?: any;
    duplicateType?: 'url' | 'title_composer';
    duplicateReason?: string;
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

  // 🆕 ESTADOS PARA SUGESTÃO DE OBRA PAI
  const [showParentSuggestionModal, setShowParentSuggestionModal] =
    useState(false);
  const [parentWorkData, setParentWorkData] = useState<any>(null);
  const [loadingParentWork, setLoadingParentWork] = useState(false);

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
  // Arquivos escolhidos antes de a obra existir: sobem logo depois de criá-la.
  const [pendingMedia, setPendingMedia] = useState<{
    audio?: File | null;
    videoAula?: File | null;
  }>({});

  const { user } = useAuth();
  const toast = useToast();

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

  const getTonalityOptions = (language: string) => {
    const selectLabel =
      language === 'en' ? 'Select a tonality' : 'Selecione uma tonalidade';

    const baseTonalities: string[] = [
      ...TONALITIES,
      tx('Não especificada', 'Not specified'),
    ];

    return [
      { value: '', label: selectLabel },
      ...baseTonalities.map((tonality) => ({
        value: tonality,
        label: translateToneStatic(tonality, language as 'pt' | 'en'),
      })),
    ];
  };

  const tonalityOptions = useMemo(
    () => getTonalityOptions(language || 'pt'),
    [language]
  );

  const fieldRefs = {
    title: useRef<HTMLInputElement>(null),
    composerId: useRef<HTMLDivElement>(null),
    instrumentId: useRef<HTMLDivElement>(null),
    epochId: useRef<HTMLDivElement>(null),
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

  const [errors, setErrors] = useState<Record<string, string>>({});

  const requiredFields = useMemo(() => {
    const base = ['title', 'composerId', 'instrumentId', 'epochId'];
    if (isPartOfCollection) {
      base.push('parentWorkId');
    }
    return base;
  }, [isPartOfCollection]);

  const customValidations = useMemo(
    () => ({
      ...workModalValidations,
      parentWorkId: (value: string) => {
        if (isPartOfCollection && !value?.trim()) {
          return tx(
            'Selecione uma obra da coleção',
            'Choose a work from the collection'
          );
        }
        return null;
      },
    }),
    [isPartOfCollection]
  );

  const { validateForm } = useFormValidation(
    fieldRefs,
    requiredFields,
    t,
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

  // 🆕 FUNÇÃO PARA BUSCAR DADOS DA OBRA PAI
  const fetchParentWorkData = useCallback(async (parentWorkId: string) => {
    if (!parentWorkId) return;

    setLoadingParentWork(true);
    try {
      console.log('🔍 Buscando dados da obra pai:', parentWorkId);

      const data = await getWorkById(parentWorkId);
      if (data) {
        console.log('✅ Dados da obra pai carregados:', data.title);
        setParentWorkData(data);

        // Verificar se há dados úteis para copiar
        const hasUsefulData = checkIfParentHasUsefulData(data);
        if (hasUsefulData) {
          setShowParentSuggestionModal(true);
        }
      } else {
        console.error('❌ Obra pai não encontrada:', parentWorkId);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dados da obra pai:', error);
    } finally {
      setLoadingParentWork(false);
    }
  }, []);

  // 🆕 FUNÇÃO PARA VERIFICAR SE A OBRA PAI TEM DADOS ÚTEIS
  const checkIfParentHasUsefulData = useCallback(
    (parentData: any) => {
      if (!parentData) return false;

      // Verificar se há pelo menos um campo útil que pode ser copiado
      const fieldsToCheck = [
        { field: 'opOrCatalog', current: formData.opOrCatalog },
        { field: 'compositionYear', current: formData.compositionYear },
        { field: 'firstPublishDate', current: formData.firstPublishDate },
        { field: 'tone', current: formData.tone },
        { field: 'mediaDuration', current: formData.mediaDuration },
        { field: 'workStyle', current: formData.workStyle },
        { field: 'moviment', current: formData.moviment },
        { field: 'instrumentation', current: formData.instrumentation },
        { field: 'dedicateTo', current: formData.dedicateTo },
        { field: 'difficultyLevel', current: formData.difficultyLevel },
      ];

      // Verificar campos simples
      for (const { field, current } of fieldsToCheck) {
        if (parentData[field] && !current?.trim()) {
          return true;
        }
      }

      // Verificar arrays
      if (parentData.categoryNames?.length && !formData.categoryNames.length) {
        return true;
      }
      if (parentData.workGenresArr?.length && !formData.workGenresArr.length) {
        return true;
      }
      if (parentData.imslpTags?.length && !formData.imslpTags.trim()) {
        return true;
      }

      // Verificar IDs especiais
      if (parentData.epochId && !formData.epochId.trim()) {
        return true;
      }
      if (parentData.instrumentId && !formData.instrumentId.trim()) {
        return true;
      }
      if (parentData.workType && formData.workType === 'INDIVIDUAL') {
        return true;
      }

      return false;
    },
    [formData]
  );

  // 🆕 FUNÇÃO PARA APLICAR DADOS SELECIONADOS
  const handleApplyParentData = useCallback(
    (selectedData: any) => {
      console.log('📋 Aplicando dados da obra pai:', selectedData);

      setFormData((prev) => ({
        ...prev,
        ...selectedData,
      }));

      // Limpar erros dos campos que foram preenchidos
      const updatedErrors = { ...errors };
      Object.keys(selectedData).forEach((field) => {
        if (updatedErrors[field]) {
          delete updatedErrors[field];
        }
      });
      setErrors(updatedErrors);

      toast.success(
        tx('Sucesso', 'Done'),
        tx(
          `${Object.keys(selectedData).length} campo(s) preenchido(s) com dados da obra pai`,
          `${Object.keys(selectedData).length} field(s) filled from the parent work`
        )
      );
    },
    [errors, toast]
  );

  // 🆕 FUNÇÃO PARA CARREGAR OBRAS DO COMPOSITOR (PARA PARENT WORK)
  const loadParentWorks = useCallback(async (composerId: string) => {
    if (!composerId) {
      setParentWorks([]);
      return;
    }

    try {
      // A lista de obras do compositor na API não diz qual obra é filha de
      // outra: todas aparecem como possível obra pai.
      const { works: potentialParents } = await searchWorks({
        composerId,
        limit: 50,
      });
      setParentWorks(potentialParents);
      console.log('✅ Parent works carregadas:', potentialParents.length);
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

  // 🆕 HANDLER PARA PARENT WORK - ATUALIZADO COM BUSCA DE DADOS
  const handleParentWorkSelect = useCallback(
    (parentWorkId: string) => {
      setFormData((prev) => ({ ...prev, parentWorkId }));

      // 🆕 BUSCAR DADOS DA OBRA PAI SE SELECIONADA
      if (parentWorkId && parentWorkId.trim() !== '') {
        console.log('🎯 Obra pai selecionada, buscando dados...');
        fetchParentWorkData(parentWorkId);
      } else {
        // Limpar dados se obra pai foi removida
        setParentWorkData(null);
        setShowParentSuggestionModal(false);
      }
    },
    [fetchParentWorkData]
  );

  /**
   * Envia o arquivo pela API e grava a URL nos campos da obra. Obra nova ainda
   * não tem id para dono do arquivo: o arquivo fica guardado aqui e sobe assim
   * que a obra é criada (o legado o jogava numa pasta temporária do servidor,
   * sem ligar à obra).
   */
  const uploadMediaFile = async (
    file: File,
    mediaType: 'audio' | 'videoAula',
    workId?: string
  ) => {
    const targetWorkId = workId ?? editingWork?.id;

    if (!targetWorkId) {
      setPendingMedia((prev) => ({ ...prev, [mediaType]: file }));
      return;
    }

    const isAudio = mediaType === 'audio';
    const upload = await uploadWorkMediaFileRequest(
      targetWorkId,
      isAudio ? 'WORK_AUDIO' : 'WORK_VIDEO_LESSON',
      file
    );
    const { url, error } = await upload.json();

    if (!upload.ok) {
      throw new Error(error || t('toast_work_upload_error'));
    }

    const saved = await updateWorkMediaRequest(
      targetWorkId,
      isAudio
        ? {
            customAudioFile: url,
            customAudioUrl: url,
            customAudioSource: 'upload',
            mediaSource: 'manual',
          }
        : {
            videoAulaFile: url,
            videoAulaUrl: url,
            videoAulaSource: 'local',
            mediaSource: 'manual',
          }
    );

    if (!saved.ok) {
      throw new Error(
        (await saved.json()).error || t('toast_work_upload_error')
      );
    }
  };

  const handleAudioUpload = async (file: File) => {
    if (!file) return;

    setUploadingAudio(true);
    try {
      await uploadMediaFile(file, 'audio');

      setMediaData((prev) => ({ ...prev, audioFile: file }));
      toast.success(t('toast_success'), t('toast_work_audio_upload_success'));
    } catch (error) {
      console.error('Erro no upload de áudio:', error);
      toast.error(
        t('toast_error'),
        error instanceof Error ? error.message : t('toast_work_upload_error')
      );
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleVideoAulaUpload = async (file: File) => {
    if (!file) return;

    setUploadingVideoAula(true);
    try {
      await uploadMediaFile(file, 'videoAula');

      setMediaData((prev) => ({ ...prev, videoAulaFile: file }));
      toast.success(
        t('toast_success'),
        t('toast_work_video_lesson_upload_success')
      );
    } catch (error) {
      console.error('Erro no upload de video aula:', error);
      toast.error(
        t('toast_error'),
        error instanceof Error ? error.message : t('toast_work_upload_error')
      );
    } finally {
      setUploadingVideoAula(false);
    }
  };

  // Check for duplicates
  const checkDuplicateByLink = async (url: string) => {
    if (!url.trim() && (!formData.title.trim() || !formData.composerId)) {
      return false;
    }

    setDuplicateCheck({ loading: true, found: false });

    try {
      const response = await checkWorkDuplicateRequest({
        url: url.trim() || undefined,
        title: formData.title.trim() || undefined,
        composerId: formData.composerId || undefined,
        excludeId: editingWork?.id,
      });

      const data = await response.json();

      if (data.found) {
        setDuplicateCheck({
          loading: false,
          found: true,
          work: data.work,
          duplicateType: data.duplicateType,
          duplicateReason: data.duplicateReason,
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

  const checkDuplicateByTitle = async () => {
    if (!formData.title.trim() || !formData.composerId) {
      return false;
    }

    setDuplicateCheck({ loading: true, found: false });

    try {
      const response = await checkWorkDuplicateRequest({
        title: formData.title.trim(),
        composerId: formData.composerId,
        excludeId: editingWork?.id,
      });

      const data = await response.json();

      if (data.found) {
        setDuplicateCheck({
          loading: false,
          found: true,
          work: data.work,
          duplicateType: data.duplicateType,
          duplicateReason: data.duplicateReason,
        });
        return true;
      } else {
        setDuplicateCheck({ loading: false, found: false });
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao verificar duplicata por título:', error);
      setDuplicateCheck({ loading: false, found: false });
      return false;
    }
  };

  const handleValidation = () => {
    const { isValid, errors: validationErrors } = validateForm(formData);
    setErrors(validationErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!handleValidation()) {
      return;
    }

    // Check for duplicates if not editing external source
    if (!isEditingExternalSource) {
      if (formData.imslpId && (await checkDuplicateByLink(formData.imslpId))) {
        toast.error(t('toast_error'), t('toast_work_duplicate_imslp'));
        return;
      }

      if (await checkDuplicateByTitle()) {
        const composerName =
          composers.find((c) => c.id === formData.composerId)?.fullName ||
          tx('compositor selecionado', 'chosen composer');
        toast.error(
          t('toast_error'),
          t('toast_work_duplicate_title_composer', {
            title: formData.title,
            composer: composerName,
          })
        );
        return;
      }
    }

    setIsSubmitting(true);

    const composerFullName =
      composers.find((c) => c.id === formData.composerId)?.fullName ||
      composers.find((c) => c.id === formData.composerId)?.name;

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
            ? `${formData.title} - ${composerFullName}`
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

      const response = await saveWorkRequest(editingWork?.id, submitData);

      const data = await response.json();

      if (response.ok) {
        // Obra nova: o áudio e a videoaula escolhidos antes sobem agora, com
        // o id que acabou de existir.
        const savedWorkId = editingWork?.id || data.workId;

        if (savedWorkId) {
          for (const [mediaType, file] of [
            ['audio', pendingMedia.audio],
            ['videoAula', pendingMedia.videoAula],
          ] as const) {
            if (!file) continue;

            try {
              await uploadMediaFile(file, mediaType, savedWorkId);
            } catch (uploadError) {
              console.error('Erro ao enviar mídia da obra:', uploadError);
              toast.error(t('toast_error'), t('toast_work_upload_error'));
            }
          }

          setPendingMedia({});
        }

        router.refresh();
        onClose();
        toast.success(
          editingWork ? t('toast_work_updated') : t('toast_work_created'),
          data.message || t('toast_work_save_success')
        );
      } else {
        throw new Error(data.error || t('toast_work_save_error'));
      }
    } catch (error) {
      console.error('Erro ao salvar obra:', error);
      toast.error(
        t('toast_error'),
        error instanceof Error ? error.message : t('toast_work_save_error')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScrapeUrl = async () => {
    if (!urlToScrape.trim()) {
      toast.error(t('toast_error'), t('toast_work_url_required'));
      return;
    }

    if (!urlToScrape.includes('imslp.org/wiki/')) {
      toast.error(t('toast_error'), t('toast_work_invalid_imslp_url'));
      return;
    }

    const cleanedUrl = cleanImslpUrl(urlToScrape);

    const isDuplicate = await checkDuplicateByLink(cleanedUrl);
    if (isDuplicate) {
      toast.error(
        t('toast_work_duplicate_found'),
        t('toast_work_duplicate_imslp')
      );
      return;
    }

    setScrapingUrl(true);
    setScrapingResult(null);

    try {
      const page = await scrapeWorkPage(cleanedUrl);

      setScrapingResult({ success: true, data: page });
      await fillFromScrapingResult(page);
      toast.success(t('toast_success'), t('toast_work_scraping_success'));
    } catch (error) {
      console.error('❌ Erro ao fazer scraping:', error);
      toast.error(
        t('toast_error'),
        error instanceof Error ? error.message : t('toast_work_scraping_error')
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
      const instrument = instruments.find((i) =>
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
        parentWorkId: editingWork.parentWorkId || '',
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

  const titulo = editingWork
    ? t('modal_work_title_edit')
    : t('modal_work_title_create');
  const ocupado = isSubmitting || uploadingAudio || uploadingVideoAula;
  const fechar = () => {
    if (editingWork && originalData) setFormData(originalData);
    onClose();
  };
  const compositor = formData.composerId
    ? composers.find((c) => c.id === formData.composerId)?.fullName ||
      tx('compositor selecionado', 'chosen composer')
    : null;
  const selecao = (
    key: string,
    label: string,
    opcoes: { value: string; label: string }[],
    valor: string,
    aoMudar: (v: string) => void,
    extra: {
      erro?: string;
      ref?: React.Ref<HTMLDivElement>;
      placeholder?: string;
    } = {}
  ) => (
    <div ref={extra.ref} className="flex flex-col gap-2" key={key}>
      <span className="t-rotulo font-medium text-texto">{label}</span>
      <Selecao
        aria-label={label}
        opcoes={opcoes}
        valor={valor}
        invalido={!!extra.erro}
        placeholder={extra.placeholder}
        aoMudar={aoMudar}
      />
      {extra.erro && <span className="t-legenda text-erro">{extra.erro}</span>}
    </div>
  );
  const media = <K extends keyof typeof mediaData>(
    key: K,
    value: (typeof mediaData)[K]
  ) => setMediaData((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <FormSheet
        aberto={isOpen}
        aoFechar={fechar}
        titulo={titulo}
        descricao={
          editingWork
            ? t('modal_work_subtitle_edit')
            : t('modal_work_subtitle_create')
        }
        sujo={hasChanges}
        ocupado={isSubmitting || duplicateCheck.loading}
        rodape={
          <div className="flex justify-end gap-2">
            <Button
              variante="fantasma"
              onClick={fechar}
              disabled={isSubmitting}
            >
              {t('form_cancel')}
            </Button>
            <Button
              type="submit"
              form={formId}
              variante="primario"
              icone={PiFloppyDisk}
              carregando={ocupado}
            >
              {isSubmitting
                ? t('form_saving')
                : editingWork
                  ? `${t('form_update')} Obra`
                  : `${t('form_create')} Obra`}
            </Button>
          </div>
        }
      >
        <form id={formId} onSubmit={handleSubmit} noValidate>
          <FormBlock
            titulo={t('modal_work_scraping_title')}
            nota={
              isEditingExternalSource ? (
                <span className="inline-flex items-center gap-1">
                  <PiLock aria-hidden="true" className="h-3 w-3" />

                  {tx(
                    'Fonte IMSLP detectada automaticamente',
                    'IMSLP source detected automatically'
                  )}
                </span>
              ) : undefined
            }
          >
            <Field
              className="sm:col-span-2"
              label={t('modal_work_scraping_url_label')}
              type="url"
              inputMode="url"
              value={urlToScrape}
              onChange={(e) => setUrlToScrape(e.target.value)}
              placeholder="https://imslp.org/wiki/Symphony_No.40_(Mozart,_Wolfgang_Amadeus)"
              disabled={isEditingExternalSource}
            />
            {duplicateCheck.loading && (
              <Aviso tom="carregando">
                {t('modal_work_scraping_checking_duplicates')}
              </Aviso>
            )}
            {duplicateCheck.found && (
              <Aviso
                tom="erro"
                titulo={
                  duplicateCheck.duplicateType === 'url'
                    ? tx(
                        'Duplicata encontrada por URL do IMSLP',
                        'Duplicate found by IMSLP URL'
                      )
                    : tx(
                        'Duplicata encontrada por título e compositor',
                        'Duplicate found by title and composer'
                      )
                }
              >
                <p>
                  {tx('Obra existente:', 'Existing work:')}{' '}
                  {duplicateCheck.work?.title}
                  {duplicateCheck.work?.subtitle &&
                    ` - ${duplicateCheck.work.subtitle}`}
                </p>
                <p>
                  {tx('Compositor:', 'Composer:')}{' '}
                  {duplicateCheck.work?.composerName}
                </p>
                {duplicateCheck.work?.opOrCatalog && (
                  <p>
                    {tx('Op./Catálogo:', 'Op./Catalog:')}{' '}
                    {duplicateCheck.work.opOrCatalog}
                  </p>
                )}
                <p className="mt-1">
                  {duplicateCheck.duplicateType === 'url'
                    ? tx(
                        'Uma obra com este link do IMSLP já existe no sistema.',
                        'A work with this IMSLP link already exists.'
                      )
                    : tx(
                        `Uma obra com o título “${duplicateCheck.work?.title}” deste compositor já existe no sistema.`,
                        `A work titled “${duplicateCheck.work?.title}” by this composer already exists.`
                      )}
                </p>
              </Aviso>
            )}
            {!isEditingExternalSource && (
              <div className="sm:col-span-2">
                <Button
                  tamanho="p"
                  icone={PiMagnifyingGlass}
                  carregando={scrapingUrl}
                  onClick={handleScrapeUrl}
                >
                  {scrapingUrl
                    ? t('modal_work_scraping_extracting')
                    : t('modal_work_scraping_extract_button')}
                </Button>
              </div>
            )}
            {scrapingResult && (
              <Aviso tom="ok" titulo={t('modal_work_scraping_success')}>
                {t('modal_work_scraping_source', {
                  source: scrapingResult.source,
                  quality: scrapingResult.data.pageQuality,
                  completeness: scrapingResult.data.dataCompleteness,
                })}
              </Aviso>
            )}
            {isEditingExternalSource && (
              <Aviso>{t('modal_work_scraping_external_detected')}</Aviso>
            )}
          </FormBlock>

          <FormBlock titulo={t('modal_work_basic_title')}>
            <Field
              ref={fieldRefs.title}
              label={`${t('modal_work_basic_title_field')} *`}
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              erro={errors.title}
              placeholder={tx(
                'Sinfonia No. 40 em Sol menor',
                'Symphony No. 40 in G minor'
              )}
            />
            <Field
              label={t('modal_work_basic_subtitle')}
              value={formData.subtitle}
              onChange={(e) => handleInputChange('subtitle', e.target.value)}
              placeholder={tx('Subtítulo da obra', 'Work subtitle')}
            />
            <div
              ref={fieldRefs.composerId}
              className="flex flex-col gap-2 sm:col-span-2"
            >
              <label
                htmlFor={`${idCampo}-1`}
                className="t-rotulo font-medium text-texto"
              >
                {t('modal_work_basic_composer')} *
              </label>
              <ComposerSearchInput
                id={`${idCampo}-1`}
                selectedComposer={formData.composerId}
                onComposerSelect={handleComposerSelect}
                popularComposers={composers}
              />
              {errors.composerId && (
                <span className="t-legenda text-erro">{errors.composerId}</span>
              )}
            </div>
            {selecao(
              'instrument',
              `${t('modal_work_basic_instrument')} *`,
              instruments.map((instrument) => ({
                value: instrument.id,
                label: translateInstrument(instrument.name, language),
              })),
              formData.instrumentId,
              (v) => handleInputChange('instrumentId', v),
              {
                erro: errors.instrumentId,
                ref: fieldRefs.instrumentId,
                placeholder:
                  language === 'pt'
                    ? 'Selecione um instrumento'
                    : 'Select an instrument',
              }
            )}
            {selecao(
              'epoch',
              `${t('modal_work_basic_epoch')} *`,
              epochs.map((epoch) => ({
                value: epoch.id,
                label: translateEpochName(epoch.name, language),
              })),
              formData.epochId,
              (v) => handleInputChange('epochId', v),
              {
                erro: errors.epochId,
                ref: fieldRefs.epochId,
                placeholder:
                  language === 'pt' ? 'Selecione uma época' : 'Select an epoch',
              }
            )}
            {selecao(
              'workType',
              t('modal_work_basic_work_type'),
              workTypeOptions,
              formData.workType,
              (v) => handleInputChange('workType', v)
            )}
          </FormBlock>

          <FormBlock titulo={tx('Coleção', 'Collection')}>
            <div className="sm:col-span-2">
              <CaixaDeMarcar
                rotulo={tx(
                  'Esta peça faz parte de uma coleção',
                  'This piece is part of a collection'
                )}
                marcado={isPartOfCollection}
                aoMudar={(checked) => {
                  setIsPartOfCollection(checked);
                  if (!checked) {
                    setFormData((prev) => ({ ...prev, parentWorkId: '' }));
                    setParentWorkData(null);
                    setShowParentSuggestionModal(false);
                  }
                }}
              />
            </div>
            {isPartOfCollection && (
              <>
                <Aviso>
                  {tx(
                    'A obra da coleção deve ser do mesmo compositor',
                    'The collection work must be by the same composer'
                  )}{' '}
                  (
                  {compositor ??
                    tx(
                      'selecione um compositor primeiro',
                      'choose a composer first'
                    )}
                  ).
                </Aviso>
                {formData.composerId && (
                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <label
                      htmlFor={`${idCampo}-2`}
                      className="t-rotulo font-medium text-texto"
                    >
                      {tx('Obra da coleção *', 'Collection work *')}
                    </label>
                    <SimpleWorkSearchInput
                      id={`${idCampo}-2`}
                      selectedWork={formData.parentWorkId}
                      onWorkSelect={handleParentWorkSelect}
                      userSuggestions={parentWorks}
                      placeholder={tx(
                        'Digite para buscar a obra da coleção...',
                        'Type to search the collection work…'
                      )}
                      filterByComposer={formData.composerId}
                      error={
                        errors.parentWorkId
                          ? tx(
                              'Selecione a obra principal.',
                              'Choose the main work.'
                            )
                          : undefined
                      }
                      disabled={loadingParentWork}
                    />
                    <span className="t-legenda">
                      {loadingParentWork
                        ? tx(
                            'Verificando dados da obra pai…',
                            'Checking the parent work’s details…'
                          )
                        : tx(
                            'Busque a obra principal que tem esta peça como parte ou movimento.',
                            'Search the main work that has this piece as a part or movement.'
                          )}
                    </span>
                  </div>
                )}
              </>
            )}
          </FormBlock>

          <FormBlock titulo={t('modal_work_catalog_title')}>
            <Field
              label={t('modal_work_catalog_op')}
              value={formData.opOrCatalog}
              onChange={(e) => handleInputChange('opOrCatalog', e.target.value)}
              placeholder="K. 550, Op. 67"
            />
            <Field
              label={t('modal_work_catalog_composition_year')}
              value={formData.compositionYear}
              onChange={(e) =>
                handleInputChange('compositionYear', e.target.value)
              }
              placeholder="1788"
            />
            <Field
              label={t('modal_work_catalog_first_publish')}
              value={formData.firstPublishDate}
              onChange={(e) =>
                handleInputChange('firstPublishDate', e.target.value)
              }
              placeholder="1794"
            />
            {selecao(
              'tone',
              t('modal_work_catalog_tonality'),
              tonalityOptions,
              formData.tone,
              (v) => handleInputChange('tone', v)
            )}
            <Field
              label={t('modal_work_catalog_duration')}
              value={formData.mediaDuration}
              onChange={(e) =>
                handleInputChange('mediaDuration', e.target.value)
              }
              placeholder="35 minutos"
            />
            {selecao(
              'difficulty',
              t('modal_work_catalog_difficulty'),
              difficultyOptions,
              formData.difficultyLevel,
              (v) => handleInputChange('difficultyLevel', v)
            )}
          </FormBlock>

          <FormBlock titulo={t('modal_work_musical_title')}>
            <Field
              label={t('modal_work_musical_style')}
              value={formData.workStyle}
              onChange={(e) => handleInputChange('workStyle', e.target.value)}
              placeholder="Classical"
            />
            <Field
              label={t('modal_work_musical_movement')}
              value={formData.moviment}
              onChange={(e) => handleInputChange('moviment', e.target.value)}
              placeholder="I. Allegro molto"
            />
            {/* The same list as "Completar" and the edit page: stored in
                Portuguese ("Violino, Piano"), shown in the page's language. */}
            <SelecaoMultipla
              rotulo={t('modal_work_musical_instrumentation')}
              opcoes={opcoesDeInstrumento(language === 'en' ? 'en' : 'pt')}
              valores={lerInstrumentacao(formData.instrumentation)}
              rotuloDe={(v) =>
                rotuloDoInstrumento(v, language === 'en' ? 'en' : 'pt')
              }
              aoMudar={(lista) =>
                handleInputChange(
                  'instrumentation',
                  escreverInstrumentacao(lista)
                )
              }
              placeholder={tx('Adicionar instrumento', 'Add an instrument')}
              vazio={tx('Nada encontrado', 'Nothing found')}
            />
            <Field
              label={t('modal_work_musical_dedicated_to')}
              value={formData.dedicateTo}
              onChange={(e) => handleInputChange('dedicateTo', e.target.value)}
              placeholder={tx('Nome do dedicatário', 'Dedicatee’s name')}
            />
          </FormBlock>

          <FormBlock titulo={t('modal_work_categories_title')}>
            <div className="sm:col-span-2">
              <SelecaoMultipla
                rotulo={t('modal_work_categories_label')}
                opcoes={validCategoryOptions}
                valores={formData.categoryNames}
                aoMudar={(values) => handleInputChange('categoryNames', values)}
                placeholder={t('modal_work_categories_placeholder')}
                excluir={categoryExcludeValues}
              />
            </div>
            <div className="sm:col-span-2">
              <SelecaoMultipla
                rotulo={t('modal_work_genres_label')}
                opcoes={validWorkGenreOptions}
                valores={formData.workGenresArr}
                aoMudar={(values) => handleInputChange('workGenresArr', values)}
                placeholder={t('modal_work_genres_placeholder')}
                excluir={workGenresExcludeValues}
              />
            </div>
          </FormBlock>

          <FormBlock titulo={t('modal_work_external_links_title')}>
            <Field
              className="sm:col-span-2"
              label={t('modal_work_external_imslp_link')}
              value={formData.imslpPermlink}
              onChange={(e) => handleInputChange('imslpId', e.target.value)}
              placeholder="Symphony_No.40_(Mozart,_Wolfgang_Amadeus)"
              disabled={!!scrapingResult}
              ajuda={
                scrapingResult
                  ? tx(
                      'Bloqueado: veio da importação do IMSLP.',
                      'Locked: it came from the IMSLP import.'
                    )
                  : undefined
              }
            />
          </FormBlock>

          <FormBlock titulo={t('modal_work_media_title')}>
            <div className="sm:col-span-2">
              <CaixaDeMarcar
                rotulo={t('modal_work_media_checkbox')}
                marcado={includeMedia}
                aoMudar={setIncludeMedia}
              />
            </div>
            {includeMedia && (
              <>
                <Field
                  label={t('modal_work_media_spotify_url')}
                  type="url"
                  inputMode="url"
                  value={mediaData.spotifyUrl}
                  onChange={(e) => media('spotifyUrl', e.target.value)}
                  placeholder="https://open.spotify.com/track/..."
                />
                <Field
                  label={t('modal_work_media_youtube_url')}
                  type="url"
                  inputMode="url"
                  value={mediaData.youtubeUrl}
                  onChange={(e) => media('youtubeUrl', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <CampoDeArquivo
                  className="sm:col-span-2"
                  label={t('modal_work_media_audio_upload')}
                  botao={tx('Escolher áudio', 'Choose audio')}
                  accept="audio/*"
                  arquivo={mediaData.audioFile?.name}
                  carregando={uploadingAudio}
                  ajuda={
                    uploadingAudio
                      ? t('modal_work_media_audio_uploading')
                      : undefined
                  }
                  aoEscolher={(file) => {
                    media('audioFile', file);
                    if (editingWork) handleAudioUpload(file);
                  }}
                />

                {user && user.role >= 1 && (
                  <>
                    <div className="sm:col-span-2">
                      <CaixaDeMarcar
                        rotulo={t('modal_work_media_video_lesson_checkbox')}
                        ajuda={t('modal_work_media_video_lesson_title')}
                        marcado={mediaData.hasVideoAula}
                        aoMudar={(on) => media('hasVideoAula', on)}
                      />
                    </div>
                    {mediaData.hasVideoAula && (
                      <>
                        {selecao(
                          'videoType',
                          t('modal_work_media_video_type'),
                          videoAulaTypeOptions,
                          mediaData.videoAulaType,
                          (v) => media('videoAulaType', v)
                        )}
                        {selecao(
                          'videoSource',
                          t('modal_work_media_video_source'),
                          videoAulaSourceOptions,
                          mediaData.videoAulaSource,
                          (v) => media('videoAulaSource', v)
                        )}
                        <Field
                          className="sm:col-span-2"
                          label={t('modal_work_media_video_title_field')}
                          value={mediaData.videoAulaTitle}
                          onChange={(e) =>
                            media('videoAulaTitle', e.target.value)
                          }
                          placeholder={tx(
                            'Ex.: Técnica no Estudo Op. 10 nº 1 de Chopin',
                            'E.g. Technique in Chopin’s Étude Op. 10 No. 1'
                          )}
                        />
                        {mediaData.videoAulaSource !== 'local' ? (
                          <Field
                            className="sm:col-span-2"
                            label={t('modal_work_media_video_url')}
                            type="url"
                            inputMode="url"
                            value={mediaData.videoAulaUrl}
                            onChange={(e) =>
                              media('videoAulaUrl', e.target.value)
                            }
                            placeholder={
                              mediaData.videoAulaSource === 'youtube'
                                ? 'https://www.youtube.com/watch?v=...'
                                : mediaData.videoAulaSource === 'instagram'
                                  ? 'https://www.instagram.com/reel/...'
                                  : 'https://...'
                            }
                          />
                        ) : (
                          <CampoDeArquivo
                            className="sm:col-span-2"
                            label={t('modal_work_media_video_upload')}
                            botao={tx('Escolher vídeo', 'Choose video')}
                            accept="video/*"
                            arquivo={mediaData.videoAulaFile?.name}
                            carregando={uploadingVideoAula}
                            ajuda={
                              uploadingVideoAula
                                ? t('modal_work_media_video_uploading')
                                : undefined
                            }
                            aoEscolher={(file) => {
                              media('videoAulaFile', file);
                              if (editingWork) handleVideoAulaUpload(file);
                            }}
                          />
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </FormBlock>
        </form>
      </FormSheet>

      <ParentWorkSuggestionModal
        isOpen={showParentSuggestionModal}
        onClose={() => setShowParentSuggestionModal(false)}
        parentWorkData={parentWorkData}
        currentFormData={formData}
        onApplyData={handleApplyParentData}
      />
    </>
  );
};

export default CreateWorkModal;
