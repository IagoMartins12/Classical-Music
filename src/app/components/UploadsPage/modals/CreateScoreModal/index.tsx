// app/components/UploadsPage/modals/CreateScoreModal/index.tsx
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
    console.log('workId', workId);
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
        } else {
          setPdfValidation({
            isValidating: false,
            isValid: false,
            error: pdfInfo.error,
          });
        }
      } catch (error) {
        console.log('error', error);
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

  const handleFileUpload = async (file: File) => {
    setUploadingFile(true);

    try {
      const validation = await validateUploadedFile(file);

      if (!validation.isValid) {
        alert(validation.error || 'Arquivo inválido');
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

      console.log('✅ Upload completo:', {
        mainFile: data.url,
        thumbnail: thumbnailUrl,
        fileSize: validation.fileSize,
        pageCount: validation.pageCount,
      });
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      alert('Erro ao fazer upload do arquivo');
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

      console.log('submitData', submitData);
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
        alert(data.message || 'Partitura salva com sucesso!');
      } else {
        throw new Error(data.error || 'Erro ao salvar partitura');
      }
    } catch (error) {
      console.error('Erro ao salvar partitura:', error);
      alert(
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
                  </div>
                </AnimatedCard>
              )}

              {/* Informações do Arquivo Atual - Apenas para edição */}
              {editingScore && (
                <AnimatedCard className="classical-card-2 p-4">
                  <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                    <FiFile className="w-5 h-5" />
                    <span>Arquivo Atual</span>
                  </h3>

                  <div className="space-y-4">
                    <div className="p-4 bg-theme-secondary/10 rounded-lg border border-theme-primary/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-accent-blue/20 rounded-lg flex items-center justify-center">
                          <FiFile className="w-5 h-5 text-accent-blue" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-theme-primary">
                            {editingScore.title}
                          </p>
                          <div className="text-sm text-theme-secondary space-x-4">
                            {editingScore.fileFormat && (
                              <span>Formato: {editingScore.fileFormat}</span>
                            )}
                            {editingScore.fileSize && (
                              <span>Tamanho: {editingScore.fileSize}</span>
                            )}
                            {editingScore.pageCount && (
                              <span>Páginas: {editingScore.pageCount}</span>
                            )}
                          </div>
                        </div>
                        {editingScore.downloadUrl && (
                          <a
                            href={editingScore.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-classical-secondary btn-sm flex items-center space-x-2"
                          >
                            <FiDownload className="w-4 h-4" />
                            <span>Download</span>
                          </a>
                        )}
                      </div>

                      {editingScore.thumbnailUrl && (
                        <div className="mt-4 pt-4 border-t border-theme-primary/20">
                          <p className="text-sm font-medium text-theme-tertiary mb-2">
                            Miniatura:
                          </p>
                          <div className="w-20 h-24 mx-auto rounded border border-theme-primary/30 overflow-hidden">
                            <Image
                              src={editingScore.thumbnailUrl}
                              alt="Thumbnail"
                              width={80}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-accent-blue/10 rounded-lg border border-accent-blue/30">
                      <div className="flex items-start space-x-2">
                        <FiInfo className="w-4 h-4 text-accent-blue mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-accent-blue">
                          <p className="font-medium">
                            Arquivo não pode ser alterado
                          </p>
                          <p>
                            Durante a edição, você pode alterar apenas as
                            informações e metadados da partitura.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              )}

              {/* URL Input (apenas se modo URL selecionado e não estiver editando) */}
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

              {/* File Upload (apenas se modo upload selecionado e não estiver editando) */}
              {uploadMode === 'file' && !editingScore && (
                <AnimatedCard className="classical-card-2 p-4">
                  <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                    <FiUpload className="w-5 h-5" />
                    <span>Upload de Arquivo</span>
                  </h3>

                  <div className="space-y-4">
                    <div
                      className="border-2 border-dashed border-theme-secondary rounded-lg p-8 text-center hover:border-brand-primary transition-colors cursor-pointer"
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
                            Fazendo upload...
                          </span>
                        </div>
                      ) : selectedFile ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center space-x-2">
                            <FiFile className="w-6 h-6 text-accent-green" />
                            <span className="text-theme-primary font-medium">
                              {selectedFile.name}
                            </span>
                            <span className="text-theme-tertiary">
                              ({formData.fileSize})
                            </span>
                          </div>

                          {generatedThumbnail && (
                            <div className="mt-4 text-center">
                              <p className="text-sm text-theme-tertiary mb-2">
                                Miniatura gerada:
                              </p>
                              <div className="w-24 h-32 mx-auto rounded border border-theme-primary/30 overflow-hidden shadow-theme-small">
                                <Image
                                  src={generatedThumbnail}
                                  alt="Thumbnail da partitura"
                                  width={96}
                                  height={128}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          )}

                          {generatingThumbnail && (
                            <div className="mt-4 text-center">
                              <div className="flex items-center justify-center space-x-2 text-sm text-brand-primary">
                                <FiLoader className="w-4 h-4 animate-spin" />
                                <span>Gerando miniatura...</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <FiUpload className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                          <p className="text-theme-secondary">
                            Clique aqui ou arraste um arquivo para fazer upload
                          </p>
                          <p className="text-theme-tertiary text-sm mt-2">
                            Formatos suportados: PDF, MIDI, MusicXML, SVG, PNG,
                            JPG
                          </p>
                        </div>
                      )}
                    </div>

                    {selectedFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setUploadedFilePath('');
                          setGeneratedThumbnail(null);
                          setGeneratingThumbnail(false);
                          setFormData((prev) => ({
                            ...prev,
                            downloadUrl: '',
                            thumbnailUrl: '',
                          }));
                        }}
                        className="flex items-center space-x-2 mx-auto text-sm text-theme-tertiary hover:text-accent-red transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                        <span>Remover arquivo</span>
                      </button>
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

                    {/* 🆕 CONDICIONAL PARA EDIÇÃO - CAMPO DESABILITADO */}
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

                    {/* 🆕 MENSAGEM DE ERRO */}
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

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Tipo
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
                      Formato
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
                    label="Tamanho do Arquivo"
                    value={formData.fileSize}
                    onChange={(e) =>
                      handleInputChange('fileSize', e.target.value)
                    }
                    placeholder="Ex: 2.5 MB"
                  />

                  <Input
                    label="Número de Páginas"
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
                  <span>Informações de Publicação</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Editor"
                    value={formData.editor}
                    onChange={(e) =>
                      handleInputChange('editor', e.target.value)
                    }
                    placeholder="Nome do editor"
                  />

                  <Input
                    label="Editora"
                    value={formData.publisher}
                    onChange={(e) =>
                      handleInputChange('publisher', e.target.value)
                    }
                    placeholder="Nome da editora"
                  />

                  <Input
                    label="Copyright"
                    value={formData.copyright}
                    onChange={(e) =>
                      handleInputChange('copyright', e.target.value)
                    }
                    placeholder="Informações de copyright"
                  />

                  <Input
                    label="URL da Miniatura"
                    value={formData.thumbnailUrl}
                    onChange={(e) =>
                      handleInputChange('thumbnailUrl', e.target.value)
                    }
                    placeholder="https://exemplo.com/thumb.jpg"
                    leftIcon={<FiImage />}
                  />
                </div>
              </AnimatedCard>

              {/* Grouping */}
              <AnimatedCard className="classical-card-2 p-4">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiTag className="w-5 h-5" />
                  <span>Agrupamento de Partituras</span>
                </h3>

                <div className="space-y-4">
                  <div className="p-4 bg-theme-secondary/10 rounded-lg">
                    <h4 className="font-medium text-theme-primary mb-2">
                      Como funciona o agrupamento?
                    </h4>
                    <p className="text-sm text-theme-secondary">
                      Partituras do mesmo grupo são exibidas juntas. Use o{' '}
                      <strong>Índice do Grupo</strong> para organizar a ordem e
                      o <strong>Título do Grupo</strong> para dar nome ao
                      conjunto de partituras.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Índice do Grupo"
                      value={formData.groupIndex}
                      onChange={(e) =>
                        handleInputChange('groupIndex', e.target.value)
                      }
                      placeholder="0"
                      type="number"
                      min="0"
                    />

                    <Input
                      label="Título do Grupo"
                      value={formData.groupTitle}
                      onChange={(e) =>
                        handleInputChange('groupTitle', e.target.value)
                      }
                      placeholder="Ex: Partitura Completa, Versão Simplificada"
                    />
                  </div>
                </div>
              </AnimatedCard>

              {/* Notes and Custom Data */}
              <AnimatedCard className="classical-card-2 p-4">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiInfo className="w-5 h-5" />
                  <span>Notas e Informações Adicionais</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Notas
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        handleInputChange('notes', e.target.value)
                      }
                      rows={3}
                      className="input-classical-2 w-full resize-none"
                      placeholder="Notas sobre a partitura, origem, qualidade, etc..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Dados Customizados (JSON)
                    </label>
                    <textarea
                      value={formData.customData}
                      onChange={(e) =>
                        handleInputChange('customData', e.target.value)
                      }
                      rows={3}
                      className="input-classical-2 w-full resize-none font-mono text-sm"
                      placeholder='{"qualidade": "alta", "fonte": "digitalização própria", "instrumento": "piano"}'
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
