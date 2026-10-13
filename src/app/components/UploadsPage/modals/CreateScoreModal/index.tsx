// app/components/UploadsPage/modals/CreateScoreModal/index.tsx - ATUALIZADO PARA IMAGENS
'use client';

import { useState, useEffect, useRef, useMemo, useId } from 'react';
import { useRouter } from 'next/navigation';
import Image from '@/app/components/SmartImage';
import {
  PiCheck,
  PiFile,
  PiFloppyDisk,
  PiImage,
  PiLink,
  PiSpinnerGap,
  PiUploadSimple,
  PiX,
} from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Selecao } from '@/app/components/ui/Selecao';
import { cx } from '@/app/components/ui/cx';
import {
  Aviso,
  FormBlock,
  FormSheet,
} from '@/app/components/site/edit/FormSheet';
import WorkSearchInput, {
  WorkSearchInputWorkProp,
} from '@/app/components/WorkSearchInput';
import ComposerSearchInput from '@/app/components/ComposerSearchInput';
import {
  useFormValidation,
  scoreModalValidations,
} from '@/app/utils/formUtils';
import {
  validateAndExtractFileInfo,
  validateUploadedFile,
  isProbablyValidFile,
  isValidUrl,
  generateAndUploadTempThumbnail,
} from '@/app/utils/pdfUtils';
import { useToast } from '@/app/hooks/useToast';
import { useTranslation } from '@/app/context/TranslationContext';
import GroupingSuggestions from '../../GroupingSuggestions';
import { useSmartFormChanges } from '@/app/hooks/useFormChanges';
import {
  getMyWorks,
  saveScoreRequest,
  searchComposers,
  uploadScoreFile,
} from '@/app/requests/uploads-client';
import { Field } from '@/app/components/ui/Field';
import { useTx } from '@/app/hooks/useTx';

interface CreateScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  works: Array<{
    id: string;
    title: string;
    composer: { id?: string; name: string; fullName: string };
  }>;
  editingScore?: any;
}

interface UserWork {
  id: string;
  title: string;
  composer: { id: string; name: string; fullName: string };
}

interface Composer {
  id: string;
  name: string;
  fullName?: string;
  worksCount?: number;
}

type UploadMode = 'url' | 'file' | null;

const CreateScoreModal = ({
  isOpen,
  onClose,
  works,
  editingScore,
}: CreateScoreModalProps) => {
  const tx = useTx();
  const idCampo = useId();
  const formId = `${idCampo}-form`;
  const fileInputId = `${idCampo}-file`;
  const router = useRouter();
  const { t } = useTranslation({ sections: ['pages/uploads'] });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [validatingFile, setValidatingFile] = useState(false);

  const [composerFilter, setComposerFilter] = useState('');
  const [userWorks, setUserWorks] = useState<UserWork[]>([]);
  const [loadingUserWorks, setLoadingUserWorks] = useState(false);
  const [popularComposers, setPopularComposers] = useState<Composer[]>([]);

  const [generatingThumbnail, setGeneratingThumbnail] = useState(false);
  const [thumbnailGenerated, setThumbnailGenerated] = useState(false);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [isLargeFile, setIsLargeFile] = useState(false);

  const fieldRefs = {
    workId: useRef<HTMLDivElement>(null),
    title: useRef<HTMLInputElement>(null),
    downloadUrl: useRef<HTMLInputElement>(null),
    uploadMode: useRef<HTMLDivElement>(null),
    composerFilter: useRef<HTMLDivElement>(null),
  };

  const [uploadMode, setUploadMode] = useState<UploadMode>('file');

  const [formData, setFormData] = useState({
    workId: '',
    title: '',
    downloadUrl: '',
    fileSize: '',
    pageCount: '',
    fileFormat: 'PDF',
    editor: '',
    publisher: '',
    copyright: '',
    thumbnailUrl: '',
    notes: '',
    type: 'SCORES',
    groupIndex: '0',
    groupTitle: '',
    rating: '',
    ratingsCount: '',
    downloadCount: '',
    isCustom: true,
    tempThumbnailPath: '',
    tempPdfPath: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileValidation, setFileValidation] = useState<{
    isValidating: boolean;
    isValid: boolean;
    error?: string;
  }>({ isValidating: false, isValid: false });

  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(
    null
  );

  const [workData, setWorkData] = useState<{
    id: string;
    title: string;
    composer: { name: string; fullName: string };
  } | null>(null);

  const scoreTypeOptions = [
    { value: 'SCORES', label: t('score_types_SCORES') },
    { value: 'PARTS', label: t('score_types_PARTS') },
    { value: 'ARRANGEMENTS', label: t('score_types_ARRANGEMENTS') },
    { value: 'LIBRETTOS', label: t('score_types_LIBRETTOS') },
    { value: 'OTHERS', label: t('score_types_OTHERS') },
    { value: 'SOURCES', label: t('score_types_SOURCES') },
  ];

  const fileFormatOptions = [
    { value: 'PDF', label: t('file_formats_PDF') },
    { value: 'PNG', label: t('file_formats_PNG') },
    { value: 'JPG', label: t('file_formats_JPG') },
    { value: 'MIDI', label: t('file_formats_MIDI') },
    { value: 'MusicXML', label: t('file_formats_MusicXML') },
    { value: 'SVG', label: t('file_formats_SVG') },
    { value: 'Other', label: t('file_formats_Other') },
  ];

  useEffect(() => {
    if (isOpen && popularComposers.length === 0) {
      loadPopularComposers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadUserWorks();
    }
  }, [isOpen]);

  const loadPopularComposers = async () => {
    try {
      setPopularComposers(await searchComposers('', 20));
    } catch (error) {
      console.error('Erro ao carregar compositores populares:', error);
    }
  };

  const loadUserWorks = async () => {
    setLoadingUserWorks(true);
    try {
      const { works } = await getMyWorks(100);
      setUserWorks(works);
    } catch (error) {
      console.error('❌ Erro ao carregar obras do usuário:', error);
    } finally {
      setLoadingUserWorks(false);
    }
  };

  const requiredFields = ['workId', 'title', 'downloadUrl'];

  const customValidations = {
    ...scoreModalValidations,
    uploadMode: () => {
      if (!editingScore && !uploadMode) {
        return t('toast_score_upload_mode_required');
      }
      return null;
    },
    downloadUrl: (value: any) => {
      if (!editingScore && !value?.trim()) {
        if (!uploadMode) {
          return t('toast_score_upload_mode_required');
        }
        if (uploadMode === 'url') {
          return t('toast_score_url_required');
        }
        if (uploadMode === 'file' && !selectedFile) {
          return t('toast_score_file_required');
        }
      }
      return null;
    },
  };
  const { validateForm } = useFormValidation(
    fieldRefs,
    requiredFields,
    t,
    customValidations
  );

  const originalData = useMemo(() => {
    if (!editingScore) return null;

    return {
      workId: editingScore.workId || '',
      title: editingScore.title || '',
      downloadUrl: editingScore.downloadUrl || '',
      fileSize: editingScore.fileSize || '',
      pageCount: editingScore.pageCount || '',
      fileFormat: editingScore.fileFormat || 'PDF',
      editor: editingScore.editor || '',
      publisher: editingScore.publisher || '',
      copyright: editingScore.copyright || '',
      thumbnailUrl: editingScore.thumbnailUrl || '',
      notes: editingScore.notes || '',
      type: editingScore.type || 'SCORES',
      groupIndex: editingScore.groupIndex?.toString() || '0',
      groupTitle: editingScore.groupTitle || '',
      rating: editingScore.rating?.toString() || '',
      ratingsCount: editingScore.ratingsCount?.toString() || '',
      downloadCount: editingScore.downloadCount?.toString() || '',
      isCustom: editingScore.isCustom || true,
      tempThumbnailPath: '',
      tempPdfPath: '',
    };
  }, [editingScore]);

  // Populate form when editing
  useEffect(() => {
    if (editingScore && works.length > 0) {
      const work = works.find((w) => w.id === editingScore.workId);

      if (work) {
        setWorkData(work);

        if (work.composer.id) {
          setComposerFilter(work.composer.id);
        } else {
          findComposerIdByName(work.composer.fullName || work.composer.name);
        }
      }

      setFormData({
        workId: editingScore.workId || '',
        title: editingScore.title || '',
        downloadUrl: editingScore.downloadUrl || '',
        fileSize: editingScore.fileSize || '',
        pageCount: editingScore.pageCount || '',
        fileFormat: editingScore.fileFormat || 'PDF',
        editor: editingScore.editor || '',
        publisher: editingScore.publisher || '',
        copyright: editingScore.copyright || '',
        thumbnailUrl: editingScore.thumbnailUrl || '',
        notes: editingScore.notes || '',
        type: editingScore.type || 'SCORES',
        groupIndex: editingScore.groupIndex?.toString() || '0',
        groupTitle: editingScore.groupTitle || '',
        rating: editingScore.rating?.toString() || '',
        ratingsCount: editingScore.ratingsCount?.toString() || '',
        downloadCount: editingScore.downloadCount?.toString() || '',
        isCustom: editingScore.isCustom || true,
        tempThumbnailPath: '',
        tempPdfPath: '',
      });

      if (editingScore.downloadUrl) {
        if (editingScore.downloadUrl.startsWith('/uploads/')) {
          setUploadMode('file');
        } else {
          setUploadMode('url');
        }
      }
    }
  }, [editingScore, works]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleWorkSelect = (
    workId: string,
    workData?: WorkSearchInputWorkProp
  ) => {
    setFormData((prev) => ({ ...prev, workId }));

    if (workId) {
      // 🆕 PRIMEIRO: Verificar se temos os dados da obra diretamente (da busca)
      if (workData && workData.composer) {
        console.log(
          '✅ Usando dados da obra retornados pela busca:',
          workData.title
        );

        if (workData.composer.id) {
          setComposerFilter(workData.composer.id);
        } else {
          // Buscar ID do compositor pelo nome
          findComposerIdByName(
            workData.composer.fullName || workData.composer.name
          );
        }
        return; // Não continuar para as outras verificações
      }

      // SEGUNDO: Verificar em obras do usuário (caso não tenha workData)
      const userWork = userWorks.find((w) => w.id === workId);
      if (userWork) {
        console.log('✅ Encontrada em obras do usuário:', userWork.title);
        setComposerFilter(userWork.composer.id);
        return;
      }

      // TERCEIRO: Verificar em obras populares (fallback)
      const generalWork = works.find((w) => w.id === workId);
      if (generalWork && generalWork.composer) {
        console.log('✅ Encontrada em obras populares:', generalWork.title);

        if (generalWork.composer.id) {
          setComposerFilter(generalWork.composer.id);
        } else {
          findComposerIdByName(
            generalWork.composer.fullName || generalWork.composer.name
          );
        }
        return;
      }

      // FALLBACK: Se não encontrou em lugar nenhum
      console.warn('⚠️ Obra não encontrada em nenhuma lista local:', workId);
    } else {
      setComposerFilter('');
    }

    if (errors.workId) {
      setErrors((prev) => ({ ...prev, workId: '' }));
    }
  };

  const findComposerIdByName = async (composerName: string) => {
    console.log('CHAMOU ', composerName);
    try {
      const composers = await searchComposers(composerName, 1);
      if (composers.length > 0) {
        setComposerFilter(composers[0].id);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar compositor por nome:', error);
    }
  };

  const handleComposerFilterChange = (composerId: string) => {
    setComposerFilter(composerId);
    if (formData.workId && !editingScore) {
      setFormData((prev) => ({ ...prev, workId: '' }));
    }
  };

  const handleGroupSelect = (groupIndex: number, groupTitle: string) => {
    setFormData((prev) => ({
      ...prev,
      groupIndex: groupIndex.toString(),
      groupTitle,
    }));
  };

  const resetUploadMode = () => {
    setUploadMode(null);
    setSelectedFile(null);
    setGeneratedThumbnail(null);
    setGeneratingThumbnail(false);
    setThumbnailGenerated(false);
    setThumbnailError(null);
    setIsLargeFile(false);
    setFileValidation({ isValidating: false, isValid: false });
    setFormData((prev) => ({
      ...prev,
      downloadUrl: '',
      thumbnailUrl: '',
      tempThumbnailPath: '',
      tempPdfPath: '',
    }));
  };

  const selectUploadMode = (mode: UploadMode) => {
    if (uploadMode && uploadMode !== mode) {
      resetUploadMode();
    }
    setUploadMode(mode);

    if (errors.uploadMode) {
      setErrors((prev) => ({ ...prev, uploadMode: '' }));
    }
  };

  const handleUrlChange = async (url: string) => {
    handleInputChange('downloadUrl', url);

    if (url && isValidUrl(url) && isProbablyValidFile(url)) {
      setValidatingFile(true);
      setFileValidation({ isValidating: true, isValid: false });

      try {
        const fileInfo = await validateAndExtractFileInfo(url);

        if (fileInfo.isValid) {
          setFormData((prev) => ({
            ...prev,
            downloadUrl: url,
            fileSize: fileInfo.fileSize || prev.fileSize,
            pageCount: fileInfo.pageCount?.toString() || prev.pageCount,
            title: prev.title || fileInfo.title || prev.title,
          }));

          setFileValidation({ isValidating: false, isValid: true });
        } else {
          setFileValidation({
            isValidating: false,
            isValid: false,
            error: fileInfo.error,
          });
        }
      } catch {
        setFileValidation({
          isValidating: false,
          isValid: false,
          error: tx('Erro ao validar arquivo', 'Could not validate the file'),
        });
      } finally {
        setValidatingFile(false);
      }
    } else {
      setFileValidation({ isValidating: false, isValid: false });
    }
  };

  const toast = useToast();
  const handleFileUpload = async (file: File) => {
    setUploadingFile(true);
    setThumbnailError(null);
    setThumbnailGenerated(false);

    try {
      const validation = await validateUploadedFile(file);

      if (!validation.isValid) {
        toast.error(
          t('toast_error'),
          validation.error || t('toast_score_file_invalid')
        );
        return;
      }

      const isLarge = file.size > 10 * 1024 * 1024;
      setIsLargeFile(isLarge);

      if (isLarge) {
        toast.info(t('toast_info'), t('toast_score_file_large_detected'));
      }

      // O arquivo vai para o armazenamento da API; a partitura é criada depois
      // com o id dele (o legado gravava numa pasta temporária do servidor).
      const data = await uploadScoreFile(file, formData.workId);

      let thumbnailUrl: string | null = null;
      let tempThumbnailPath: string | null | undefined = null;

      // Gerar thumbnail para PDFs e imagens
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        setGeneratingThumbnail(true);

        try {
          const thumbnailResult = await generateAndUploadTempThumbnail(
            file,
            '64f5b3a7e123456789abcdef'
          );

          if (thumbnailResult.success && thumbnailResult.thumbnailUrl) {
            thumbnailUrl = thumbnailResult.thumbnailUrl;
            tempThumbnailPath = thumbnailResult.tempThumbnailPath;
            setGeneratedThumbnail(thumbnailUrl);
            setThumbnailGenerated(true);

            toast.success(
              t('toast_success'),
              t('modal_score_file_preview_success')
            );
          } else {
            setThumbnailError(
              thumbnailResult.error || tx('Erro desconhecido', 'Unknown error')
            );
            toast.info(t('toast_info'), t('toast_score_preview_not_available'));
          }
        } catch {
          setThumbnailError(
            tx('Erro ao gerar preview', 'Could not make the preview')
          );
          toast.error(t('toast_error'), t('toast_score_preview_error'));
        } finally {
          setGeneratingThumbnail(false);
        }
      }

      setFormData((prev) => ({
        ...prev,
        downloadUrl: data.url,
        fileSize: validation.fileSize || '',
        pageCount: validation.pageCount?.toString() || '',
        title:
          prev.title || validation.title || file.name.replace(/\.[^/.]+$/, ''),
        fileFormat: getFileExtension(file.name).toUpperCase(),
        thumbnailUrl: thumbnailUrl || prev.thumbnailUrl,
        tempPdfPath: data.url,
        tempThumbnailPath: tempThumbnailPath || '',
      }));

      setSelectedFile(file);
      setFileValidation({ isValidating: false, isValid: true });

      if (errors.downloadUrl) {
        setErrors((prev) => ({ ...prev, downloadUrl: '' }));
      }
    } catch {
      console.error('❌ Erro no upload:');
      toast.error(t('toast_error'), t('toast_score_file_upload_error'));
      setFileValidation({
        isValidating: false,
        isValid: false,
        error: tx('Erro no upload', 'Upload failed'),
      });
    } finally {
      setUploadingFile(false);
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

    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        groupIndex: formData.groupIndex ? parseInt(formData.groupIndex) : 0,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        ratingsCount: formData.ratingsCount
          ? parseInt(formData.ratingsCount)
          : null,
        downloadCount: formData.downloadCount
          ? parseInt(formData.downloadCount)
          : null,

        source: uploadMode === 'file' ? 'UPLOAD' : 'CUSTOM',
        isCustom: true,
        hasTemporaryFiles: !!(
          formData.tempPdfPath || formData.tempThumbnailPath
        ),
        tempPdfPath: formData.tempPdfPath,
        tempThumbnailPath: formData.tempThumbnailPath,
      };

      // Arquivo enviado ou link externo: a API aceita os dois (`assetId` ou
      // `externalUrl`), e o request escolhe pelo que a tela tem.
      const response = await saveScoreRequest(editingScore?.id, submitData);

      const data = await response.json();

      if (response.ok) {
        router.refresh();
        onClose();
        toast.success(
          editingScore ? t('toast_score_updated') : t('toast_score_created'),
          data.message || t('toast_score_save_success')
        );
      } else {
        throw new Error(data.error || t('toast_score_save_error'));
      }
    } catch (error) {
      console.error('Erro ao salvar partitura:', error);
      toast.error(
        t('toast_error'),
        error instanceof Error ? error.message : t('toast_score_save_error')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop() || '';
  };

  const shouldDisableComposerFilter = !!formData.workId && !editingScore;

  const hasChanges = useSmartFormChanges(formData, originalData, [
    'fileFormat',
    'isCustom',
    'type',
    'groupIndex',
  ]);

  if (!isOpen) return null;

  const titulo = editingScore
    ? t('modal_score_title_edit')
    : t('modal_score_title_create');
  const fechar = () => {
    if (editingScore && originalData) setFormData(originalData);
    onClose();
  };
  const selecao = (
    label: string,
    opcoes: { value: string; label: string }[],
    valor: string,
    aoMudar: (v: string) => void
  ) => (
    <label className="flex flex-col gap-2">
      <span className="t-rotulo font-medium text-texto">{label}</span>
      <Selecao
        aria-label={label}
        opcoes={opcoes}
        valor={valor}
        aoMudar={aoMudar}
      />
    </label>
  );
  const modos = [
    {
      id: 'url' as const,
      icone: PiLink,
      titulo: t('modal_score_upload_url'),
      texto: tx(
        'PDF, PNG, JPG ou outras imagens por um link',
        'PDF, PNG, JPG or other images by link'
      ),
    },
    {
      id: 'file' as const,
      icone: PiUploadSimple,
      titulo: t('modal_score_upload_file'),
      texto: tx(
        'PDF ou imagens do seu aparelho',
        'PDF or images from your device'
      ),
    },
  ];

  return (
    <FormSheet
      aberto={isOpen}
      aoFechar={fechar}
      titulo={titulo}
      descricao={
        editingScore
          ? t('modal_score_subtitle_edit')
          : t('modal_score_subtitle_create')
      }
      sujo={hasChanges}
      ocupado={isSubmitting}
      rodape={
        <div className="flex justify-end gap-2">
          <Button variante="fantasma" onClick={fechar} disabled={isSubmitting}>
            {t('form_cancel')}
          </Button>
          <Button
            type="submit"
            form={formId}
            variante="primario"
            icone={PiFloppyDisk}
            carregando={isSubmitting}
            disabled={!editingScore && !uploadMode}
          >
            {isSubmitting
              ? t('form_saving')
              : editingScore
                ? `${t('form_update')} Partitura`
                : `${t('form_create')} Partitura`}
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate>
        {!editingScore && (
          <FormBlock titulo={t('modal_score_upload_mode_title')}>
            <div
              ref={fieldRefs.uploadMode}
              role="radiogroup"
              aria-label={t('modal_score_upload_mode_title')}
              className="grid grid-cols-1 gap-3 sm:col-span-2 sm:grid-cols-2"
            >
              {modos.map((modo) => {
                const ativo = uploadMode === modo.id;
                return (
                  <button
                    key={modo.id}
                    type="button"
                    role="radio"
                    aria-checked={ativo}
                    onClick={() => selectUploadMode(modo.id)}
                    className={cx(
                      'flex items-start gap-3 rounded-card p-4 text-left transition-colors duration-[var(--t-toque)]',
                      ativo
                        ? 'tint-ouro text-ouro-na-tinta'
                        : 'bg-sup-2 text-texto hover:bg-[var(--interactive-hover)]'
                    )}
                  >
                    <Icon de={modo.icone} tamanho="m" className="mt-0.5" />
                    <span className="flex flex-col gap-0.5">
                      <span className="font-medium">{modo.titulo}</span>
                      <span className="t-legenda">{modo.texto}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.uploadMode && <Aviso tom="erro">{errors.uploadMode}</Aviso>}
          </FormBlock>
        )}

        {uploadMode === 'file' && !editingScore && (
          <FormBlock titulo={tx('Enviar arquivo', 'Upload file')}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => document.getElementById(fileInputId)?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  document.getElementById(fileInputId)?.click();
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileUpload(file);
              }}
              className={cx(
                'flex cursor-pointer flex-col items-center gap-3 rounded-card border border-dashed bg-sup-2 px-6 py-10 text-center sm:col-span-2',
                errors.downloadUrl
                  ? 'border-[var(--erro)]'
                  : 'border-[var(--linha-forte)]'
              )}
            >
              <input
                id={fileInputId}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.gif,.bmp,.webp"
                className="sr-only"
                tabIndex={-1}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              {uploadingFile ? (
                <span className="flex items-center gap-2 text-texto-suave">
                  <PiSpinnerGap
                    aria-hidden="true"
                    className="h-5 w-5 animate-spin text-ouro-texto"
                  />

                  {tx('Enviando arquivo…', 'Uploading file…')}
                </span>
              ) : selectedFile ? (
                <>
                  <span className="flex items-center gap-2 text-texto">
                    <Icon
                      de={
                        selectedFile.type.startsWith('image/')
                          ? PiImage
                          : PiFile
                      }
                      tamanho="m"
                    />
                    <span className="font-medium">{selectedFile.name}</span>
                    <span className="text-texto-fraco">
                      ({formData.fileSize})
                    </span>
                  </span>
                  {generatingThumbnail && (
                    <span className="t-legenda">
                      {isLargeFile
                        ? tx(
                            'Processando arquivo grande; pode levar um pouco mais.',
                            'Processing a large file; it may take a bit longer.'
                          )
                        : tx('Gerando a prévia…', 'Making the preview…')}
                    </span>
                  )}
                  {generatedThumbnail && thumbnailGenerated && (
                    <span className="block h-32 w-24 overflow-hidden rounded-controle shadow-[var(--sombra-alta)]">
                      <Image
                        src={generatedThumbnail}
                        alt={tx('Prévia do arquivo', 'File preview')}
                        width={96}
                        height={128}
                        className="h-full w-full object-cover"
                      />
                    </span>
                  )}
                  {thumbnailError && !generatingThumbnail && (
                    <span className="t-legenda">
                      {tx('Prévia indisponível:', 'Preview unavailable:')}{' '}
                      {thumbnailError}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <PiUploadSimple
                    aria-hidden="true"
                    className="h-10 w-10 text-texto-fraco"
                  />
                  <span className="text-texto">
                    {tx(
                      'Toque para escolher ou arraste o arquivo para cá',
                      'Tap to choose or drag the file here'
                    )}
                  </span>
                  <span className="t-legenda">
                    {tx(
                      'PDF, PNG, JPG, GIF, BMP ou WEBP, até 50 MB. A prévia sai sozinha.',
                      'PDF, PNG, JPG, GIF, BMP or WEBP, up to 50 MB. The preview makes itself.'
                    )}
                  </span>
                </>
              )}
            </div>
            {errors.downloadUrl && (
              <Aviso tom="erro">{errors.downloadUrl}</Aviso>
            )}
            {selectedFile && (
              <div className="sm:col-span-2">
                <Button
                  tamanho="p"
                  variante="fantasma"
                  icone={PiX}
                  onClick={() => {
                    setSelectedFile(null);
                    resetUploadMode();
                  }}
                >
                  {tx('Remover arquivo', 'Remove file')}
                </Button>
              </div>
            )}
          </FormBlock>
        )}

        {uploadMode === 'url' && !editingScore && (
          <FormBlock titulo={tx('Link do arquivo', 'File link')}>
            <Field
              className="sm:col-span-2"
              ref={fieldRefs.downloadUrl}
              label={tx('Link do arquivo *', 'File link *')}
              type="url"
              inputMode="url"
              value={formData.downloadUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              erro={errors.downloadUrl}
              placeholder="https://exemplo.com/partitura.pdf"
            />
            {validatingFile && (
              <Aviso tom="carregando">
                {tx('Validando o arquivo…', 'Validating the file…')}
              </Aviso>
            )}
            {fileValidation.isValid && (
              <Aviso tom="ok">
                {tx('Arquivo válido encontrado.', 'Valid file found.')}
              </Aviso>
            )}
            {fileValidation.error && (
              <Aviso tom="erro">{fileValidation.error}</Aviso>
            )}
          </FormBlock>
        )}

        <FormBlock titulo={t('modal_score_work_selection_title')}>
          <div
            ref={fieldRefs.composerFilter}
            className="flex flex-col gap-2 sm:col-span-2"
          >
            <label
              htmlFor={`${idCampo}-1`}
              className="t-rotulo font-medium text-texto"
            >
              {t('modal_score_work_filter_composer')}
              {shouldDisableComposerFilter && (
                <span className="ml-2 text-texto-fraco">
                  {t('modal_score_work_filter_auto_selected')}
                </span>
              )}
            </label>
            <ComposerSearchInput
              id={`${idCampo}-1`}
              selectedComposer={composerFilter}
              onComposerSelect={handleComposerFilterChange}
              popularComposers={popularComposers}
              isDisabled={shouldDisableComposerFilter || editingScore}
            />
            {(shouldDisableComposerFilter || editingScore) && (
              <span className="t-legenda">
                {editingScore
                  ? t('modal_score_work_edit_tip')
                  : t('modal_score_work_filter_tip')}
              </span>
            )}
          </div>

          <div
            ref={fieldRefs.workId}
            className="flex flex-col gap-2 sm:col-span-2"
          >
            <span className="t-rotulo font-medium text-texto">
              {t('modal_score_work_label')} *
            </span>
            {editingScore && workData ? (
              <div className="flex items-center gap-3 rounded-controle bg-sup-2 px-4 py-3 opacity-70">
                <Icon de={PiCheck} tamanho="p" className="text-ouro-texto" />
                <span className="flex flex-col">
                  <span className="font-medium text-texto">
                    {workData.title}
                  </span>
                  <span className="t-legenda">
                    {workData.composer.fullName || workData.composer.name}
                  </span>
                </span>
              </div>
            ) : (
              <WorkSearchInput
                selectedWork={formData.workId}
                onWorkSelect={handleWorkSelect}
                popularWorks={works.map((work) => ({
                  id: work.id,
                  title: work.title,
                  composer: work.composer,
                }))}
                filterByComposer={composerFilter}
                userSuggestions={userWorks}
                loadingUserSuggestions={loadingUserWorks}
                error={errors.workId}
              />
            )}
            {editingScore && workData && (
              <span className="t-legenda">
                {t('modal_score_work_edit_locked')}
              </span>
            )}
          </div>

          {!editingScore && !loadingUserWorks && (
            <Aviso titulo={t('modal_score_work_suggestions_title')}>
              {userWorks.length > 0
                ? t('modal_score_work_suggestions_with_works', {
                    count: userWorks.length,
                  })
                : t('modal_score_work_suggestions_no_works')}
            </Aviso>
          )}
        </FormBlock>

        <FormBlock titulo={t('modal_score_basic_info_title')}>
          <Field
            ref={fieldRefs.title}
            label={`${t('modal_score_basic_title')} *`}
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            erro={errors.title}
            placeholder={tx('Título da partitura', 'Score title')}
          />
          {selecao(
            t('modal_score_basic_type'),
            scoreTypeOptions,
            formData.type,
            (v) => handleInputChange('type', v)
          )}
          {selecao(
            t('modal_score_basic_format'),
            fileFormatOptions,
            formData.fileFormat,
            (v) => handleInputChange('fileFormat', v)
          )}
          <Field
            label={t('modal_score_basic_file_size')}
            value={formData.fileSize}
            onChange={(e) => handleInputChange('fileSize', e.target.value)}
            placeholder="Ex.: 2,5 MB"
            disabled
          />
          <Field
            label={tx('Páginas ou imagens', 'Pages or images')}
            type="number"
            inputMode="numeric"
            value={formData.pageCount}
            onChange={(e) => handleInputChange('pageCount', e.target.value)}
            placeholder="Ex.: 12"
          />
        </FormBlock>

        <FormBlock titulo={t('modal_score_publication_title')}>
          <Field
            label={t('modal_score_publication_editor')}
            value={formData.editor}
            onChange={(e) => handleInputChange('editor', e.target.value)}
            placeholder={tx('Nome do editor', 'Editor’s name')}
          />
          <Field
            label={t('modal_score_publication_publisher')}
            value={formData.publisher}
            onChange={(e) => handleInputChange('publisher', e.target.value)}
            placeholder={tx('Nome da editora', 'Publisher’s name')}
          />
          <Field
            label={t('modal_score_publication_copyright')}
            value={formData.copyright}
            onChange={(e) => handleInputChange('copyright', e.target.value)}
            placeholder={tx('Informações de copyright', 'Copyright details')}
          />
          {!generatedThumbnail && (
            <Field
              label={t('modal_score_publication_thumbnail')}
              type="url"
              inputMode="url"
              value={formData.thumbnailUrl}
              onChange={(e) =>
                handleInputChange('thumbnailUrl', e.target.value)
              }
              placeholder="https://exemplo.com/thumb.jpg"
            />
          )}
        </FormBlock>

        <FormBlock
          titulo={t('modal_score_grouping_title')}
          nota={t('modal_score_grouping_how_description')}
        >
          {formData.workId && (
            <div className="flex flex-col gap-3 sm:col-span-2">
              <span className="t-rotulo font-medium text-texto">
                {t('modal_score_grouping_suggestions_title')}
              </span>
              <GroupingSuggestions
                workId={formData.workId}
                onGroupSelect={handleGroupSelect}
                currentGroupIndex={formData.groupIndex}
                currentGroupTitle={formData.groupTitle}
                visible={!!formData.workId}
              />
            </div>
          )}
          <Field
            label={t('modal_score_grouping_index')}
            type="number"
            inputMode="numeric"
            min="0"
            value={formData.groupIndex}
            onChange={(e) => handleInputChange('groupIndex', e.target.value)}
            placeholder="0"
          />
          <Field
            label={t('modal_score_grouping_title_field')}
            value={formData.groupTitle}
            onChange={(e) => handleInputChange('groupTitle', e.target.value)}
            placeholder={tx(
              'Ex.: Partitura completa, Versão simplificada',
              'E.g. Full score, Simplified version'
            )}
          />
          <Aviso titulo={t('modal_score_grouping_example_title')}>
            <ul className="flex flex-col gap-1">
              <li>{t('modal_score_grouping_example_group0')}</li>
              <li>{t('modal_score_grouping_example_group1')}</li>
              <li>{t('modal_score_grouping_example_tip')}</li>
            </ul>
          </Aviso>
        </FormBlock>

        <FormBlock titulo={t('modal_score_notes_title')}>
          <Field.Area
            className="sm:col-span-2"
            label={t('modal_score_notes_label')}
            classeCampo="resize-none"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            placeholder={t('modal_score_notes_placeholder')}
          />
        </FormBlock>
      </form>
    </FormSheet>
  );
};

export default CreateScoreModal;
