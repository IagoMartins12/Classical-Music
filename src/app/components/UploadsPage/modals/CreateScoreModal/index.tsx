'use client';

// app/components/modals/CreateScoreModal.tsx - ATUALIZADO COM MELHORIAS

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

      // Atualizar form com dados do arquivo
      setFormData((prev) => ({
        ...prev,
        downloadUrl: data.url,
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
      newErrors.downloadUrl = 'URL do arquivo é obrigatória';
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
        // Remover campos que agora são automáticos
        uploadDate: undefined,
        uploader: undefined,
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
              <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-amber rounded-xl flex items-center justify-center">
                <FiFile className="w-5 h-5 text-theme-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-primary classical-title">
                  {editingScore ? 'Editar Partitura' : 'Nova Partitura'}
                </h2>
                <p className="text-theme-secondary text-sm">
                  {editingScore
                    ? 'Atualize as informações da partitura'
                    : 'Adicione uma nova partitura à obra'}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload */}
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
                      <div className="flex items-center justify-center space-x-2">
                        <FiFile className="w-6 h-6 text-accent-green" />
                        <span className="text-theme-primary font-medium">
                          {selectedFile.name}
                        </span>
                        <span className="text-theme-tertiary">
                          ({formData.fileSize})
                        </span>
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

                  <div className="text-center">
                    <span className="text-theme-tertiary text-sm">ou</span>
                  </div>

                  <div className="space-y-2">
                    <Input
                      label="URL do Arquivo"
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
                </div>
              </AnimatedCard>

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

                  {/* Campos automáticos - agora desabilitados */}
                  <Input
                    label="Tamanho do Arquivo"
                    value={formData.fileSize}
                    onChange={() => {}} // Não permite edição
                    placeholder="Detectado automaticamente"
                    disabled
                    className="bg-theme-secondary/20"
                  />

                  <Input
                    label="Número de Páginas"
                    value={formData.pageCount}
                    onChange={() => {}} // Não permite edição
                    placeholder="Detectado automaticamente"
                    disabled
                    className="bg-theme-secondary/20"
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

              {/* Grouping and Rating */}
              <AnimatedCard className="classical-card-2 p-4">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiTag className="w-5 h-5" />
                  <span>Agrupamento </span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Índice do Grupo"
                    value={formData.groupIndex}
                    onChange={(e) =>
                      handleInputChange('groupIndex', e.target.value)
                    }
                    placeholder="0"
                    type="number"
                  />

                  <Input
                    label="Título do Grupo"
                    value={formData.groupTitle}
                    onChange={(e) =>
                      handleInputChange('groupTitle', e.target.value)
                    }
                    placeholder="Nome do grupo"
                  />
                </div>
              </AnimatedCard>

              {/* Notes and Custom Data */}
              <AnimatedCard className="classical-card-2 p-4">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiInfo className="w-5 h-5" />
                  <span>Notas e Dados Customizados</span>
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
                      placeholder="Notas sobre a partitura..."
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
                      placeholder='{"qualidade": "alta", "fonte": "digitalização própria"}'
                    />
                  </div>

                  <Checkbox
                    label="Partitura customizada (não-IMSLP)"
                    checked={formData.isCustom}
                    onChange={(e) =>
                      handleInputChange('isCustom', e.target.checked)
                    }
                  />
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
                  disabled={isSubmitting}
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
