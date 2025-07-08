'use client';

// app/components/modals/CreateScoreModal.tsx - ATUALIZADO COM UPLOAD/URL EXCLUSIVO

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedItem,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import Checkbox from '@/app/components/Common/Checkbox';
import Modal from '@/app/components/Modal';
import WorkSearchInput from '@/app/components/WorkSearchInput';
import {
  validateAndExtractPDFInfo,
  validateUploadedFile,
  isProbablyPDF,
  isValidUrl,
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

  // 🆕 Estado para modo de upload (URL ou arquivo)
  const [uploadMode, setUploadMode] = useState<UploadMode>('file');
  const [showFilePath, setShowFilePath] = useState(false);

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

  // 🆕 Estado para controle de upload
  const [uploadedFilePath, setUploadedFilePath] = useState<string>('');

  // Populate form when editing
  useEffect(() => {
    if (editingScore) {
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
        customData: editingScore.customData
          ? JSON.stringify(editingScore.customData)
          : '',
      });

      // 🆕 Determinar modo de upload baseado na URL
      if (editingScore.downloadUrl) {
        if (editingScore.downloadUrl.startsWith('/uploads/')) {
          setUploadMode('file');
          setUploadedFilePath(editingScore.downloadUrl);
        } else {
          setUploadMode('url');
        }
      }
    }
  }, [editingScore]);

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

  // 🆕 Função para resetar modo de upload
  const resetUploadMode = () => {
    setUploadMode(null);
    setSelectedFile(null);
    setUploadedFilePath('');
    setPdfValidation({ isValidating: false, isValid: false });
    setFormData((prev) => ({ ...prev, downloadUrl: '' }));
  };

  // 🆕 Função para selecionar modo de upload
  const selectUploadMode = (mode: UploadMode) => {
    if (uploadMode && uploadMode !== mode) {
      resetUploadMode();
    }
    setUploadMode(mode);
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
          // Atualizar formulário com informações extraídas
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
      // Validar arquivo primeiro
      const validation = await validateUploadedFile(file);

      if (!validation.isValid) {
        alert(validation.error || 'Arquivo inválido');
        return;
      }

      // Criar FormData para upload
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', 'score');

      // Fazer upload para seu endpoint de upload
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error('Erro no upload do arquivo');
      }

      const data = await response.json();

      // 🆕 Salvar caminho do arquivo sem mostrar no formulário
      setUploadedFilePath(data.url);

      // Atualizar form com dados do arquivo
      setFormData((prev) => ({
        ...prev,
        downloadUrl: data.url, // Usar internamente
        fileSize: validation.fileSize || '',
        pageCount: validation.pageCount?.toString() || '',
        title:
          prev.title || validation.title || file.name.replace(/\.[^/.]+$/, ''),
        fileFormat: getFileExtension(file.name).toUpperCase(),
      }));

      setSelectedFile(file);
      setPdfValidation({ isValidating: false, isValid: true });
    } catch (error) {
      console.error('Erro no upload:', error);
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.workId) {
      newErrors.workId = 'Obra é obrigatória';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }
    if (!formData.downloadUrl.trim()) {
      newErrors.downloadUrl = 'URL do arquivo ou upload é obrigatório';
    }
    if (!uploadMode) {
      newErrors.uploadMode = 'Escolha entre URL ou upload de arquivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert string numbers back to numbers
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
        // 🆕 Definir source baseado no modo de upload
        source: uploadMode === 'file' ? 'UPLOAD' : 'CUSTOM',
        // Garantir que é sempre customizado
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
            {/* 🆕 Badge indicativo */}
            <div className="px-3 py-1 bg-accent-purple/20 text-accent-purple rounded-full text-xs font-medium">
              PERSONALIZADA
            </div>
          </div>

          {/* Content */}
          <div className="p-6 ">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 🆕 Upload Mode Selection */}
              <AnimatedCard className="classical-card-2 p-4">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiUpload className="w-5 h-5" />
                  <span>Modo de Upload</span>
                </h3>

                <div className="space-y-4">
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

                  {errors.uploadMode && (
                    <p className="text-red-500 text-sm">{errors.uploadMode}</p>
                  )}
                </div>
              </AnimatedCard>

              {/* 🆕 URL Input (apenas se modo URL selecionado) */}
              {uploadMode === 'url' && (
                <AnimatedCard className="classical-card-2 p-4">
                  <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                    <FiLink className="w-5 h-5" />
                    <span>URL do Arquivo</span>
                  </h3>

                  <div className="space-y-4">
                    <Input
                      label="URL do Arquivo *"
                      value={formData.downloadUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="https://exemplo.com/partitura.pdf"
                      leftIcon={<FiDownload />}
                      error={errors.downloadUrl}
                    />

                    {/* Indicador de validação de PDF */}
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

              {/* 🆕 File Upload (apenas se modo upload selecionado) */}
              {uploadMode === 'file' && (
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

                          {/* 🆕 Mostrar/ocultar caminho do arquivo */}
                          {/* {uploadedFilePath && (
                            <div className="mt-2 p-3 bg-theme-secondary/20 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-theme-tertiary">
                                  Caminho do arquivo:
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setShowFilePath(!showFilePath)}
                                  className="text-xs text-brand-primary hover:text-brand-secondary transition-colors flex items-center space-x-1"
                                >
                                  {showFilePath ? (
                                    <>
                                      <FiEyeOff className="w-3 h-3" />
                                      <span>Ocultar</span>
                                    </>
                                  ) : (
                                    <>
                                      <FiEye className="w-3 h-3" />
                                      <span>Mostrar</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              {showFilePath && (
                                <div className="mt-2 text-xs text-theme-secondary font-mono bg-theme-primary/5 p-2 rounded">
                                  {uploadedFilePath}
                                </div>
                              )}
                            </div>
                          )} */}
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

                    {/* Resetar upload */}
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setUploadedFilePath('');
                          setFormData((prev) => ({ ...prev, downloadUrl: '' }));
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
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Obra *
                    </label>
                    <WorkSearchInput
                      selectedWork={formData.workId}
                      onWorkSelect={handleWorkSelect}
                      popularWorks={works.map((work) => ({
                        id: work.id,
                        title: work.title,
                        composer: work.composer,
                      }))}
                    />
                    {errors.workId && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.workId}
                      </p>
                    )}
                  </div>

                  <Input
                    label="Título *"
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

                  {/* Campos automáticos */}
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

              {/* 🆕 Grouping - Seção melhorada */}
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
                  disabled={isSubmitting || !uploadMode}
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
