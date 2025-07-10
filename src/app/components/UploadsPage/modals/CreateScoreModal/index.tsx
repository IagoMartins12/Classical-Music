// CreateScoreModal.tsx - ATUALIZADO COM TOASTS
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  FiFile,
  FiUpload,
  FiSave,
  FiLoader,
  FiInfo,
  FiImage,
  FiDownload,
  FiFileText,
  FiTag,
  FiCheck,
  FiAlertCircle,
  FiLink,
  FiX,
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
import { useFormValidation } from '@/app/utils/formUtils';
import {
  validateAndExtractPDFInfo,
  validateUploadedFile,
  isProbablyPDF,
  isValidUrl,
  generateAndUploadPDFThumbnail,
} from '@/app/utils/pdfUtils';

// 🆕 IMPORTAR O HOOK DE TOAST
import { useToast } from '@/app/hooks/useToast';

interface CreateScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  works: Array<{
    id: string;
    title: string;
    composer: { name: string; fullName: string };
  }>;
  editingScore?: any;
}

const scoreTypeOptions = [
  { value: 'SCORES', label: 'Partituras' },
  { value: 'PARTS', label: 'Partes' },
  { value: 'ARRANGEMENTS', label: 'Arranjos' },
  { value: 'LIBRETTOS', label: 'Libretos' },
  { value: 'OTHERS', label: 'Outros' },
  { value: 'SOURCES', label: 'Fontes' },
];

const fileFormatOptions = [
  { value: 'PDF', label: 'PDF' },
  { value: 'MIDI', label: 'MIDI' },
  { value: 'MusicXML', label: 'MusicXML' },
  { value: 'SVG', label: 'SVG' },
  { value: 'PNG', label: 'PNG' },
  { value: 'JPG', label: 'JPG' },
  { value: 'Other', label: 'Outro' },
];

type UploadMode = 'url' | 'file' | null;

const CreateScoreModal = ({
  isOpen,
  onClose,
  works,
  editingScore,
}: CreateScoreModalProps) => {
  const router = useRouter();
  // 🆕 HOOK DE TOAST
  const toast = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [validatingPDF, setValidatingPDF] = useState(false);

  // 🆕 REFS PARA SCROLL DE VALIDAÇÃO
  const fieldRefs = {
    workId: useRef<HTMLDivElement>(null),
    title: useRef<HTMLInputElement>(null),
    downloadUrl: useRef<HTMLInputElement>(null),
    uploadMode: useRef<HTMLDivElement>(null),
  };

  // Estados para modo de upload
  const [uploadMode, setUploadMode] = useState<UploadMode>('file');

  // Form state
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
    customData: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfValidation, setPdfValidation] = useState<{
    isValidating: boolean;
    isValid: boolean;
    error?: string;
  }>({ isValidating: false, isValid: false });

  // Estados para upload e thumbnail
  const [uploadedFilePath, setUploadedFilePath] = useState<string>('');
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(
    null
  );
  const [generatingThumbnail, setGeneratingThumbnail] = useState(false);

  // 🆕 ESTADO PARA DADOS DA OBRA (quando editando)
  const [workData, setWorkData] = useState<{
    id: string;
    title: string;
    composer: { name: string; fullName: string };
  } | null>(null);

  // 🆕 CONFIGURAÇÃO DE VALIDAÇÃO
  const requiredFields = ['workId', 'title', 'downloadUrl'];
  const customValidations = {
    uploadMode: (value: any) => {
      if (!editingScore && !uploadMode) {
        return 'Escolha entre URL ou upload de arquivo';
      }
      return null;
    },
  };

  const { validateForm } = useFormValidation(
    fieldRefs,
    requiredFields,
    customValidations
  );

  // Populate form when editing
  useEffect(() => {
    if (editingScore) {
      // 🆕 BUSCAR DADOS DA OBRA
      const work = works.find((w) => w.id === editingScore.workId);
      if (work) {
        setWorkData(work);
      }

      setFormData({
        workId: editingScore.workId || '', // 🆕 SETAR workId
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
        customData: editingScore.customData
          ? JSON.stringify(editingScore.customData)
          : '',
      });

      // Determinar modo de upload baseado na URL
      if (editingScore.downloadUrl) {
        if (editingScore.downloadUrl.startsWith('/uploads/')) {
          setUploadMode('file');
          setUploadedFilePath(editingScore.downloadUrl);
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
    if (errors.workId) {
      setErrors((prev) => ({ ...prev, workId: '' }));
    }
  };

  // Função para resetar modo de upload
  const resetUploadMode = () => {
    setUploadMode(null);
    setSelectedFile(null);
    setUploadedFilePath('');
    setGeneratedThumbnail(null);
    setGeneratingThumbnail(false);
    setPdfValidation({ isValidating: false, isValid: false });
    setFormData((prev) => ({ ...prev, downloadUrl: '', thumbnailUrl: '' }));
  };

  // Função para selecionar modo de upload
  const selectUploadMode = (mode: UploadMode) => {
    if (uploadMode && uploadMode !== mode) {
      resetUploadMode();
    }
    setUploadMode(mode);

    // Limpar erro de uploadMode quando selecionado
    if (errors.uploadMode) {
      setErrors((prev) => ({ ...prev, uploadMode: '' }));
    }
  };

  // Validar PDF quando URL for inserida
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
          // 🆕 TOAST DE SUCESSO
          toast.success('PDF Válido', 'Informações extraídas automaticamente');
        } else {
          setPdfValidation({
            isValidating: false,
            isValid: false,
            error: pdfInfo.error,
          });
          // 🆕 TOAST DE ERRO
          toast.error('PDF Inválido', pdfInfo.error || 'Erro ao validar PDF');
        }
      } catch (error) {
        console.log('error', error);
        setPdfValidation({
          isValidating: false,
          isValid: false,
          error: 'Erro ao validar PDF',
        });
        // 🆕 TOAST DE ERRO
        toast.error('Erro de Validação', 'Erro ao validar PDF');
      } finally {
        setValidatingPDF(false);
      }
    } else {
      setPdfValidation({ isValidating: false, isValid: false });
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadingFile(true);

    try {
      const validation = await validateUploadedFile(file);

      if (!validation.isValid) {
        // 🆕 SUBSTITUIR alert POR toast
        toast.error('Arquivo Inválido', validation.error || 'Arquivo inválido');
        return;
      }

      console.log('📤 Iniciando upload do arquivo principal...');
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', 'score');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error('Erro no upload do arquivo');
      }

      const data = await response.json();
      console.log('✅ Arquivo principal enviado:', data.url);

      setUploadedFilePath(data.url);

      let thumbnailUrl = null;
      if (file.type === 'application/pdf') {
        setGeneratingThumbnail(true);

        try {
          console.log('🖼️ Iniciando geração de thumbnail...');
          const thumbnailResult = await generateAndUploadPDFThumbnail(file);

          if (thumbnailResult.success && thumbnailResult.thumbnailUrl) {
            thumbnailUrl = thumbnailResult.thumbnailUrl;
            setGeneratedThumbnail(thumbnailUrl);
            console.log('✅ Thumbnail gerado e salvo:', thumbnailUrl);
          } else {
            console.warn(
              '⚠️ Não foi possível gerar thumbnail:',
              thumbnailResult.error
            );
          }
        } catch (error) {
          console.warn('⚠️ Erro ao gerar thumbnail:', error);
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
      }));

      setSelectedFile(file);
      setPdfValidation({ isValidating: false, isValid: true });

      // 🆕 TOAST DE SUCESSO
      toast.upload('Upload Concluído', `${file.name} foi enviado com sucesso`);

      console.log('✅ Upload completo:', {
        mainFile: data.url,
        thumbnail: thumbnailUrl,
        fileSize: validation.fileSize,
        pageCount: validation.pageCount,
      });
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      // 🆕 SUBSTITUIR alert POR toast
      toast.error('Erro no Upload', 'Erro ao fazer upload do arquivo');
      setPdfValidation({
        isValidating: false,
        isValid: false,
        error: 'Erro no upload',
      });
    } finally {
      setUploadingFile(false);
    }
  };

  // 🆕 VALIDAÇÃO MELHORADA COM SCROLL
  const handleValidation = () => {
    const { isValid, errors: validationErrors } = validateForm(formData);
    setErrors(validationErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🆕 USAR VALIDAÇÃO COM SCROLL
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
        customData: formData.customData
          ? JSON.parse(formData.customData)
          : null,
        source: uploadMode === 'file' ? 'UPLOAD' : 'CUSTOM',
        isCustom: true,
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
        // 🆕 SUBSTITUIR alert POR toast
        toast.success(
          editingScore ? 'Partitura Atualizada' : 'Partitura Criada',
          data.message || 'Partitura salva com sucesso!'
        );
      } else {
        throw new Error(data.error || 'Erro ao salvar partitura');
      }
    } catch (error) {
      console.error('Erro ao salvar partitura:', error);
      // 🆕 SUBSTITUIR alert POR toast
      toast.error(
        'Erro ao Salvar',
        error instanceof Error ? error.message : 'Erro ao salvar partitura'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop() || '';
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      showCloseButton={true}
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
                    ? 'Editar Partitura'
                    : 'Nova Partitura Personalizada'}
                </h2>
                <p className="text-theme-secondary text-sm">
                  {editingScore
                    ? 'Atualize as informações da partitura'
                    : 'Adicione uma nova partitura personalizada à obra'}
                </p>
              </div>
            </div>
            <div className="px-3 py-1 bg-accent-purple/20 text-accent-purple rounded-full text-xs font-medium">
              PERSONALIZADA
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Upload Mode Selection - Apenas para criação nova */}
              {!editingScore && (
                <AnimatedCard className="classical-card-2 p-4">
                  <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                    <FiUpload className="w-5 h-5" />
                    <span>Modo de Upload</span>
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
                            <h4 className="font-medium">URL do Arquivo</h4>
                            <p className="text-xs opacity-75">
                              Link direto para o arquivo
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
                            <h4 className="font-medium">Upload de Arquivo</h4>
                            <p className="text-xs opacity-75">
                              Enviar arquivo do computador
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* 🆕 MENSAGEM DE ERRO PARA uploadMode */}
                    {errors.uploadMode && (
                      <p className="text-red-500 text-sm font-medium flex items-center space-x-1">
                        <FiAlertCircle className="w-4 h-4" />
                        <span>Campo obrigatório: {errors.uploadMode}</span>
                      </p>
                    )}
                  </div>
                </AnimatedCard>
              )}

              {/* Rest of the form content remains the same... */}
              {/* I'll continue with key sections that use alerts */}

              {/* URL Input */}
              {uploadMode === 'url' && !editingScore && (
                <AnimatedCard className="classical-card-2 p-4">
                  <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                    <FiLink className="w-5 h-5" />
                    <span>URL do Arquivo</span>
                  </h3>

                  <div className="space-y-4">
                    <Input
                      label="URL do Arquivo *"
                      ref={fieldRefs.downloadUrl}
                      value={formData.downloadUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="https://exemplo.com/partitura.pdf"
                      leftIcon={<FiDownload />}
                      error={errors.downloadUrl}
                    />

                    {validatingPDF && (
                      <div className="flex items-center space-x-2 text-sm text-brand-primary">
                        <FiLoader className="w-4 h-4 animate-spin" />
                        <span>Validando PDF...</span>
                      </div>
                    )}

                    {formData.downloadUrl &&
                      !validatingPDF &&
                      pdfValidation.isValid && (
                        <div className="flex items-center space-x-2 text-sm text-accent-green">
                          <FiCheck className="w-4 h-4" />
                          <span>
                            PDF válido - informações extraídas automaticamente
                          </span>
                        </div>
                      )}

                    {formData.downloadUrl &&
                      !validatingPDF &&
                      pdfValidation.error && (
                        <div className="flex items-center space-x-2 text-sm text-accent-red">
                          <FiAlertCircle className="w-4 h-4" />
                          <span>{pdfValidation.error}</span>
                        </div>
                      )}
                  </div>
                </AnimatedCard>
              )}

              {/* Basic Information */}
              <AnimatedCard className="classical-card-2 p-4">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiInfo className="w-5 h-5" />
                  <span>Informações Básicas</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2" ref={fieldRefs.workId}>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Obra *
                    </label>

                    {/* Conditional for editing - disabled field */}
                    {editingScore && workData ? (
                      <div className="w-full p-3 bg-theme-secondary/20 border border-theme-secondary rounded-lg text-theme-primary">
                        <div className="flex items-center space-x-2">
                          <FiInfo className="w-4 h-4 text-theme-tertiary" />
                          <span className="font-medium">{workData.title}</span>
                          <span className="text-theme-tertiary">
                            por{' '}
                            {workData.composer.fullName ||
                              workData.composer.name}
                          </span>
                        </div>
                        <p className="text-xs text-theme-tertiary mt-1">
                          A obra não pode ser alterada durante a edição
                        </p>
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
                      />
                    )}

                    {errors.workId && (
                      <p className="text-red-500 text-sm font-medium flex items-center space-x-1 mt-1">
                        <FiAlertCircle className="w-4 h-4" />
                        <span>
                          Campo obrigatório: Obra deve ser selecionada
                        </span>
                      </p>
                    )}
                  </div>

                  <Input
                    label="Título *"
                    ref={fieldRefs.title}
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    error={errors.title}
                    placeholder="Título da partitura"
                    required
                  />

                  {/* Rest of form fields... */}
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
                  disabled={isSubmitting || (!editingScore && !uploadMode)}
                >
                  {isSubmitting
                    ? 'Salvando...'
                    : editingScore
                    ? 'Atualizar Partitura'
                    : 'Criar Partitura'}
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
