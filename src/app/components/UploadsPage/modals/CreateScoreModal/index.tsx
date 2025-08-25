// app/components/UploadsPage/modals/CreateScoreModal/index.tsx - TRADUZIDO
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  FiFile,
  FiUpload,
  FiSave,
  FiLoader,
  FiInfo,
  FiImage,
  FiFileText,
  FiTag,
  FiCheck,
  FiAlertCircle,
  FiLink,
  FiX,
  FiFilter,
  FiTarget,
  FiSettings,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedItem,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import Modal from '@/app/components/Modal';
import WorkSearchInput from '@/app/components/WorkSearchInput';
import ComposerSearchInput from '@/app/components/ComposerSearchInput';
import {
  useFormValidation,
  scoreModalValidations,
} from '@/app/utils/formUtils';
import {
  validateAndExtractPDFInfo,
  validateUploadedFile,
  isProbablyPDF,
  isValidUrl,
  generateAndUploadTempThumbnail,
} from '@/app/utils/pdfUtils';
import { useToast } from '@/app/hooks/useToast';
import { useTranslation } from '@/app/hooks/useTranslation';
import GroupingSuggestions from '../../GroupingSuggestions';
import { useSmartFormChanges } from '@/app/hooks/useFormChanges';

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
  const router = useRouter();
  const { t } = useTranslation({ sections: ['pages/uploads'] });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [validatingPDF, setValidatingPDF] = useState(false);

  const [composerFilter, setComposerFilter] = useState('');
  const [userWorks, setUserWorks] = useState<UserWork[]>([]);
  const [loadingUserWorks, setLoadingUserWorks] = useState(false);
  const [popularComposers, setPopularComposers] = useState<Composer[]>([]);

  const [generatingThumbnail, setGeneratingThumbnail] = useState(false);
  const [thumbnailGenerated, setThumbnailGenerated] = useState(false);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [isLargePDF, setIsLargePDF] = useState(false);

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
  const [pdfValidation, setPdfValidation] = useState<{
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
    { value: 'MIDI', label: t('file_formats_MIDI') },
    { value: 'MusicXML', label: t('file_formats_MusicXML') },
    { value: 'SVG', label: t('file_formats_SVG') },
    { value: 'PNG', label: t('file_formats_PNG') },
    { value: 'JPG', label: t('file_formats_JPG') },
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
      const response = await fetch('/api/composers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: '', limit: 20 }),
      });

      if (response.ok) {
        const composers = await response.json();
        setPopularComposers(composers);
      }
    } catch (error) {
      console.error('Erro ao carregar compositores populares:', error);
    }
  };

  const loadUserWorks = async () => {
    setLoadingUserWorks(true);
    try {
      const response = await fetch('/api/uploads?type=work&limit=100');

      if (response.ok) {
        const data = await response.json();
        const works = data.works.map((work: any) => ({
          id: work.id,
          title: work.title,
          composer: {
            id: work.composer.id,
            name: work.composer.name,
            fullName: work.composer.fullName,
          },
        }));
        setUserWorks(works);
        console.log('✅ Obras do usuário carregadas:', works.length);
      }
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
        return t('modal_score_upload_mode_error');
      }
      return null;
    },
    downloadUrl: (value: any) => {
      if (!editingScore && !value?.trim()) {
        if (!uploadMode) {
          return 'Escolha um modo de upload primeiro';
        }
        if (uploadMode === 'url') {
          return 'URL do arquivo é obrigatória';
        }
        if (uploadMode === 'file' && !selectedFile) {
          return 'Faça upload de um arquivo';
        }
      }
      return null;
    },
  };

  const { validateForm } = useFormValidation(
    fieldRefs,
    requiredFields,
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

  const handleWorkSelect = (workId: string) => {
    setFormData((prev) => ({ ...prev, workId }));

    if (workId) {
      const userWork = userWorks.find((w) => w.id === workId);
      if (userWork) {
        setComposerFilter(userWork.composer.id);
      } else {
        const generalWork = works.find((w) => w.id === workId);
        if (generalWork && generalWork.composer) {
          if (generalWork.composer.id) {
            setComposerFilter(generalWork.composer.id);
          } else {
            findComposerIdByName(
              generalWork.composer.fullName || generalWork.composer.name
            );
          }
        }
      }
    } else {
      setComposerFilter('');
    }

    if (errors.workId) {
      setErrors((prev) => ({ ...prev, workId: '' }));
    }
  };

  const findComposerIdByName = async (composerName: string) => {
    try {
      const response = await fetch('/api/composers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: composerName, limit: 1 }),
      });

      if (response.ok) {
        const composers = await response.json();
        if (composers.length > 0) {
          setComposerFilter(composers[0].id);
        }
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
    setIsLargePDF(false);
    setPdfValidation({ isValidating: false, isValid: false });
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

    if (url && isValidUrl(url) && isProbablyPDF(url)) {
      setValidatingPDF(true);
      setPdfValidation({ isValidating: true, isValid: false });

      try {
        const pdfInfo = await validateAndExtractPDFInfo(url);

        if (pdfInfo.isValid) {
          setFormData((prev) => ({
            ...prev,
            downloadUrl: url,
            fileSize: pdfInfo.fileSize || prev.fileSize,
            pageCount: pdfInfo.pageCount?.toString() || prev.pageCount,
            title: prev.title || pdfInfo.title || prev.title,
          }));

          setPdfValidation({ isValidating: false, isValid: true });
        } else {
          setPdfValidation({
            isValidating: false,
            isValid: false,
            error: pdfInfo.error,
          });
        }
      } catch {
        setPdfValidation({
          isValidating: false,
          isValid: false,
          error: 'Erro ao validar PDF',
        });
      } finally {
        setValidatingPDF(false);
      }
    } else {
      setPdfValidation({ isValidating: false, isValid: false });
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
        toast.error(validation.error || 'Arquivo inválido');
        return;
      }

      const isLarge = file.size > 10 * 1024 * 1024;
      setIsLargePDF(isLarge);

      if (isLarge) {
        toast.info('📄 PDF grande detectado - processo pode ser mais lento');
      }

      const tempId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', 'score-temp');
      uploadFormData.append('userId', '64f5b3a7e123456789abcdef');
      uploadFormData.append('tempId', tempId);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error('Erro no upload do arquivo');
      }

      const data = await response.json();

      let thumbnailUrl: string | null = null;
      let tempThumbnailPath: string | null | undefined = null;

      if (file.type === 'application/pdf') {
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

            toast.success(t('modal_score_file_preview_success'));
          } else {
            setThumbnailError(thumbnailResult.error || 'Erro desconhecido');
            toast.info('⚠️ Preview não disponível - usando placeholder');
          }
        } catch  {
          setThumbnailError('Erro ao gerar preview');
          toast.error('⚠️ Erro ao gerar preview da partitura');
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
      setPdfValidation({ isValidating: false, isValid: true });

      if (errors.downloadUrl) {
        setErrors((prev) => ({ ...prev, downloadUrl: '' }));
      }
    } catch  {
      toast.error('Erro ao fazer upload do arquivo');
      setPdfValidation({
        isValidating: false,
        isValid: false,
        error: 'Erro no upload',
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

      const url = editingScore
        ? `/api/uploads/score/${editingScore.id}`
        : '/api/uploads/score';

      const method = editingScore ? 'PUT' : 'POST';

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
        toast.success(data.message || 'Partitura salva com sucesso!');
      } else {
        throw new Error(data.error || 'Erro ao salvar partitura');
      }
    } catch (error) {
      console.error('Erro ao salvar partitura:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao salvar partitura'
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (editingScore && originalData) {
          setFormData(originalData);
        }
        onClose();
      }}
      maxWidth="4xl"
      showCloseButton={true}
      confirmOnClose={true}
      hasChanges={hasChanges}
      isProcessing={isSubmitting}
      processName="criação de partitura"
    >
      <AnimatedItem direction="scale" springType="bouncy" className="w-full">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-theme-secondary">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
                <FiFile className="w-5 h-5 text-theme-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-primary classical-title">
                  {editingScore
                    ? t('modal_score_title_edit')
                    : t('modal_score_title_create')}
                </h2>
                <p className="text-theme-secondary text-sm">
                  {editingScore
                    ? t('modal_score_subtitle_edit')
                    : t('modal_score_subtitle_create')}
                </p>
              </div>
            </div>
            <div className="px-3 py-1 bg-accent-purple/20 text-accent-purple rounded-full text-xs font-medium">
              {t('modal_score_badge_custom')}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Upload Mode Selection */}
              {!editingScore && (
                <AnimatedCard className="classical-card-2 p-4">
                  <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                    <FiUpload className="w-5 h-5" />
                    <span>{t('modal_score_upload_mode_title')}</span>
                  </h3>

                  <div className="space-y-4" ref={fieldRefs.uploadMode}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* URL Option */}
                      <button
                        type="button"
                        onClick={() => selectUploadMode('url')}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          uploadMode === 'url'
                            ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                            : 'border-theme-secondary bg-theme-elevated hover:border-theme-primary text-theme-secondary'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              uploadMode === 'url'
                                ? 'bg-brand-primary text-theme-primary'
                                : 'bg-theme-secondary text-theme-tertiary'
                            }`}
                          >
                            <FiLink className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <h4 className="font-medium">
                              {t('modal_score_upload_url')}
                            </h4>
                            <p className="text-xs opacity-75">
                              {t('modal_score_upload_url_description')}
                            </p>
                          </div>
                        </div>
                      </button>

                      {/* File Upload Option */}
                      <button
                        type="button"
                        onClick={() => selectUploadMode('file')}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          uploadMode === 'file'
                            ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                            : 'border-theme-secondary bg-theme-elevated hover:border-theme-primary text-theme-secondary'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              uploadMode === 'file'
                                ? 'bg-brand-primary text-theme-primary'
                                : 'bg-theme-secondary text-theme-tertiary'
                            }`}
                          >
                            <FiUpload className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <h4 className="font-medium">
                              {t('modal_score_upload_file')}
                            </h4>
                            <p className="text-xs opacity-75">
                              {t('modal_score_upload_file_description')}
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>

                    {errors.uploadMode && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FiAlertCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium text-red-800">
                            {errors.uploadMode}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </AnimatedCard>
              )}

              {/* File Upload */}
              {uploadMode === 'file' && !editingScore && (
                <AnimatedCard className="classical-card-2 p-4">
                  <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                    <FiUpload className="w-5 h-5" />
                    <span>{t('modal_score_file_upload_title')}</span>
                  </h3>

                  <div className="space-y-4">
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center hover:border-brand-primary transition-colors cursor-pointer ${
                        errors.downloadUrl
                          ? 'border-red-500'
                          : 'border-theme-secondary'
                      }`}
                      onClick={() =>
                        document.getElementById('file-upload')?.click()
                      }
                    >
                      <input
                        id="file-upload"
                        type="file"
                        accept=".pdf,.mid,.midi,.xml,.musicxml,.svg,.png,.jpg,.jpeg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file);
                          }
                        }}
                      />

                      {uploadingFile ? (
                        <div className="flex items-center justify-center space-x-2">
                          <FiLoader className="w-6 h-6 animate-spin text-brand-primary" />
                          <span className="text-theme-secondary">
                            {t('modal_score_file_uploading')}
                          </span>
                        </div>
                      ) : selectedFile ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-center space-x-2">
                            <FiFile className="w-6 h-6 text-accent-green" />
                            <span className="text-theme-primary font-medium">
                              {selectedFile.name}
                            </span>
                            <span className="text-theme-tertiary">
                              ({formData.fileSize})
                            </span>
                          </div>

                          {generatingThumbnail && (
                            <div className="mt-4 text-center">
                              <div className="flex items-center justify-center space-x-2 text-sm text-brand-primary">
                                <FiLoader className="w-4 h-4 animate-spin" />
                                <span>
                                  {isLargePDF
                                    ? t('modal_score_file_preview_large')
                                    : t('modal_score_file_preview_generating')}
                                </span>
                              </div>
                              {isLargePDF && (
                                <div className="mt-2 text-xs text-theme-tertiary">
                                  📄 PDFs grandes podem levar mais tempo para
                                  processar
                                </div>
                              )}
                            </div>
                          )}

                          {generatedThumbnail && thumbnailGenerated && (
                            <div className="mt-4 text-center">
                              <div className="w-24 h-32 mx-auto rounded border border-theme-primary/30 overflow-hidden shadow-theme-small">
                                <Image
                                  src={generatedThumbnail}
                                  alt="Preview da partitura"
                                  width={96}
                                  height={128}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          )}

                          {thumbnailError && !generatingThumbnail && (
                            <div className="mt-4 text-center">
                              <div className="flex items-center justify-center space-x-2 text-sm text-amber-600 mb-2">
                                <FiAlertCircle className="w-4 h-4" />
                                <span>
                                  {t('modal_score_file_preview_unavailable')}
                                </span>
                              </div>
                              <div className="text-xs text-theme-tertiary">
                                {thumbnailError}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <FiUpload className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                          <p className="text-theme-secondary">
                            {t('modal_score_file_drop_text')}
                          </p>
                          <p className="text-theme-tertiary text-sm mt-2">
                            {t('modal_score_file_formats')}
                          </p>
                          <p className="text-theme-tertiary text-xs mt-1">
                            🖼️ {t('modal_score_file_pdf_preview')}
                          </p>
                        </div>
                      )}
                    </div>

                    {errors.downloadUrl && uploadMode === 'file' && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FiAlertCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium text-red-800">
                            {errors.downloadUrl}
                          </span>
                        </div>
                      </div>
                    )}

                    {selectedFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          resetUploadMode();
                        }}
                        className="flex items-center space-x-2 mx-auto text-sm text-theme-tertiary hover:text-accent-red transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                        <span>{t('modal_score_file_remove')}</span>
                      </button>
                    )}
                  </div>
                </AnimatedCard>
              )}

              {/* URL Input */}
              {uploadMode === 'url' && !editingScore && (
                <AnimatedCard className="classical-card-2 p-4">
                  <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                    <FiLink className="w-5 h-5" />
                    <span>{t('modal_score_url_title')}</span>
                  </h3>

                  <Input
                    label="URL do Arquivo *"
                    ref={fieldRefs.downloadUrl}
                    value={formData.downloadUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    error={errors.downloadUrl}
                    placeholder="https://exemplo.com/partitura.pdf"
                    leftIcon={<FiLink />}
                  />

                  {validatingPDF && (
                    <div className="mt-2 flex items-center space-x-2 text-sm text-brand-primary">
                      <FiLoader className="w-4 h-4 animate-spin" />
                      <span>{t('modal_score_url_validating')}</span>
                    </div>
                  )}

                  {pdfValidation.isValid && (
                    <div className="mt-2 flex items-center space-x-2 text-sm text-accent-green">
                      <FiCheck className="w-4 h-4" />
                      <span>{t('modal_score_url_valid')}</span>
                    </div>
                  )}

                  {pdfValidation.error && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FiAlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">
                          {pdfValidation.error}
                        </span>
                      </div>
                    </div>
                  )}
                </AnimatedCard>
              )}

              {/* Work Selection */}
              <AnimatedCard className="classical-card-2 p-4 relative z-50">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiInfo className="w-5 h-5" />
                  <span>{t('modal_score_work_selection_title')}</span>
                </h3>

                <div className="space-y-4">
                  <div ref={fieldRefs.composerFilter}>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      <div className="flex items-center space-x-2">
                        <FiFilter className="w-4 h-4" />
                        <span>{t('modal_score_work_filter_composer')}</span>
                        {shouldDisableComposerFilter && (
                          <span className="text-xs text-accent-blue">
                            {t('modal_score_work_filter_auto_selected')}
                          </span>
                        )}
                      </div>
                    </label>

                    <ComposerSearchInput
                      selectedComposer={composerFilter}
                      onComposerSelect={handleComposerFilterChange}
                      popularComposers={popularComposers}
                      isDisabled={shouldDisableComposerFilter || editingScore}
                    />

                    {shouldDisableComposerFilter && (
                      <p className="text-xs text-theme-tertiary mt-2">
                        💡 {t('modal_score_work_filter_tip')}
                      </p>
                    )}

                    {editingScore && (
                      <p className="text-xs text-theme-tertiary mt-2">
                        💡 {t('modal_score_work_edit_tip')}
                      </p>
                    )}
                  </div>

                  <div ref={fieldRefs.workId}>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      {t('modal_score_work_label')} *
                    </label>

                    {editingScore && workData ? (
                      <div className="w-full p-3 border rounded-lg bg-theme-elevated border-theme-secondary opacity-50 cursor-not-allowed">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-accent-blue/20 rounded-lg flex items-center justify-center">
                              <FiCheck className="w-4 h-4 text-accent-blue" />
                            </div>
                            <div>
                              <p className="font-medium text-theme-primary text-sm">
                                {workData.title}
                              </p>
                              <p className="text-theme-tertiary text-xs">
                                {workData.composer.fullName ||
                                  workData.composer.name}
                              </p>
                            </div>
                          </div>
                          <div className="text-theme-tertiary">
                            <FiInfo className="w-4 h-4" />
                          </div>
                        </div>
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
                      <p className="text-xs text-theme-tertiary mt-2">
                        {t('modal_score_work_edit_locked')}
                      </p>
                    )}
                  </div>

                  {!editingScore && !loadingUserWorks && (
                    <div className="bg-theme-secondary/10 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <FiInfo className="w-4 h-4 text-theme-tertiary mt-0.5" />
                        <div className="text-xs text-theme-tertiary">
                          <p className="font-medium mb-1">
                            💡 {t('modal_score_work_suggestions_title')}
                          </p>
                          {userWorks.length > 0 ? (
                            <p>
                              {t('modal_score_work_suggestions_with_works', {
                                count: userWorks.length,
                              })}
                            </p>
                          ) : (
                            <p>{t('modal_score_work_suggestions_no_works')}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </AnimatedCard>

              {/* Basic Information */}
              <AnimatedCard className="classical-card-2 p-4">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiInfo className="w-5 h-5" />
                  <span>{t('modal_score_basic_info_title')}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={`${t('modal_score_basic_title')} *`}
                    ref={fieldRefs.title}
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    error={errors.title}
                    placeholder="Título da partitura"
                  />

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      {t('modal_score_basic_type')}
                    </label>
                    <Select
                      options={scoreTypeOptions}
                      value={formData.type}
                      onChange={(e) =>
                        handleInputChange('type', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      {t('modal_score_basic_format')}
                    </label>
                    <Select
                      options={fileFormatOptions}
                      value={formData.fileFormat}
                      onChange={(e) =>
                        handleInputChange('fileFormat', e.target.value)
                      }
                    />
                  </div>

                  <Input
                    label={t('modal_score_basic_file_size')}
                    value={formData.fileSize}
                    onChange={(e) =>
                      handleInputChange('fileSize', e.target.value)
                    }
                    placeholder="Ex: 2.5 MB"
                    disabled
                  />

                  <Input
                    label={t('modal_score_basic_pages')}
                    value={formData.pageCount}
                    onChange={(e) =>
                      handleInputChange('pageCount', e.target.value)
                    }
                    placeholder="Ex: 12"
                    type="number"
                  />
                </div>
              </AnimatedCard>

              {/* Publication Information */}
              <AnimatedCard className="classical-card-2 p-4">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiFileText className="w-5 h-5" />
                  <span>{t('modal_score_publication_title')}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('modal_score_publication_editor')}
                    value={formData.editor}
                    onChange={(e) =>
                      handleInputChange('editor', e.target.value)
                    }
                    placeholder="Nome do editor"
                  />

                  <Input
                    label={t('modal_score_publication_publisher')}
                    value={formData.publisher}
                    onChange={(e) =>
                      handleInputChange('publisher', e.target.value)
                    }
                    placeholder="Nome da editora"
                  />

                  <Input
                    label={t('modal_score_publication_copyright')}
                    value={formData.copyright}
                    onChange={(e) =>
                      handleInputChange('copyright', e.target.value)
                    }
                    placeholder="Informações de copyright"
                  />

                  {!generatedThumbnail && (
                    <Input
                      label={t('modal_score_publication_thumbnail')}
                      value={formData.thumbnailUrl}
                      onChange={(e) =>
                        handleInputChange('thumbnailUrl', e.target.value)
                      }
                      placeholder="https://exemplo.com/thumb.jpg"
                      leftIcon={<FiImage />}
                    />
                  )}
                </div>
              </AnimatedCard>

              {/* Score Grouping */}
              <AnimatedCard className="classical-card-2 p-4">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiTag className="w-5 h-5" />
                  <span>{t('modal_score_grouping_title')}</span>
                </h3>

                <div className="space-y-6">
                  {formData.workId && (
                    <div>
                      <h4 className="text-sm font-semibold text-theme-primary mb-3 flex items-center space-x-2">
                        <FiTarget className="w-4 h-4 text-accent-green" />
                        <span>
                          {t('modal_score_grouping_suggestions_title')}
                        </span>
                      </h4>

                      <GroupingSuggestions
                        workId={formData.workId}
                        onGroupSelect={handleGroupSelect}
                        currentGroupIndex={formData.groupIndex}
                        currentGroupTitle={formData.groupTitle}
                        visible={!!formData.workId}
                      />
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-semibold text-theme-primary mb-3 flex items-center space-x-2">
                      <FiSettings className="w-4 h-4 text-theme-tertiary" />
                      <span>{t('modal_score_grouping_manual_title')}</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label={t('modal_score_grouping_index')}
                        value={formData.groupIndex}
                        onChange={(e) =>
                          handleInputChange('groupIndex', e.target.value)
                        }
                        placeholder="0"
                        type="number"
                        min="0"
                      />

                      <Input
                        label={t('modal_score_grouping_title_field')}
                        value={formData.groupTitle}
                        onChange={(e) =>
                          handleInputChange('groupTitle', e.target.value)
                        }
                        placeholder="Ex: Partitura Completa, Versão Simplificada"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-theme-secondary/10 rounded-lg">
                    <h4 className="font-medium text-theme-primary mb-2 flex items-center space-x-2">
                      <FiInfo className="w-4 h-4" />
                      <span>{t('modal_score_grouping_how_title')}</span>
                    </h4>
                    <p className="text-sm text-theme-secondary">
                      {t('modal_score_grouping_how_description')}
                    </p>
                    <div className="mt-3 text-xs text-theme-tertiary">
                      <p>
                        💡{' '}
                        <strong>
                          {t('modal_score_grouping_example_title')}
                        </strong>
                      </p>
                      <p>• {t('modal_score_grouping_example_group0')}</p>
                      <p className="">
                        • {t('modal_score_grouping_example_group1')}.
                      </p>
                      <p className="">
                        • {t('modal_score_grouping_example_tip')}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedCard>

              {/* Notes and Custom Data */}
              <AnimatedCard className="classical-card-2 p-4">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiInfo className="w-5 h-5" />
                  <span>{t('modal_score_notes_title')}</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      {t('modal_score_notes_label')}
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        handleInputChange('notes', e.target.value)
                      }
                      rows={3}
                      className="input-classical-2 w-full resize-none"
                      placeholder={t('modal_score_notes_placeholder')}
                    />
                  </div>
                </div>
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
                  disabled={isSubmitting || (!editingScore && !uploadMode)}
                >
                  {isSubmitting
                    ? t('form_saving')
                    : editingScore
                    ? t('form_update') + ' Partitura'
                    : t('form_create') + ' Partitura'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </AnimatedItem>
    </Modal>
  );
};

export default CreateScoreModal;
