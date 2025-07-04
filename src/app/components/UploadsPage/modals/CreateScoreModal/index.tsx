'use client';

// app/components/modals/CreateScoreModal.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiX,
  FiFile,
  FiUpload,
  FiExternalLink,
  FiSave,
  FiLoader,
  FiInfo,
  FiImage,
  FiDownload,
  FiFileText,
  FiTag,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedItem,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import Checkbox from '@/app/components/Common/Checkbox';

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
    uploadDate: '',
    uploader: '',
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
        uploadDate: editingScore.uploadDate || '',
        uploader: editingScore.uploader || '',
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

  const handleFileUpload = async (file: File) => {
    setUploadingFile(true);

    try {
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
        fileSize: formatFileSize(file.size),
        title: prev.title || file.name.replace(/\.[^/.]+$/, ''), // Remove extensão se título vazio
        fileFormat: getFileExtension(file.name).toUpperCase(),
        uploadDate: new Date().toISOString().split('T')[0],
      }));

      setSelectedFile(file);
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload do arquivo');
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop() || '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-overlay backdrop-blur-sm">
      <AnimatedItem
        direction="scale"
        springType="bouncy"
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <div className="classical-card">
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
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-theme-secondary hover:bg-theme-tertiary text-theme-tertiary hover:text-theme-primary transition-colors flex items-center justify-center"
            >
              <FiX className="w-4 h-4" />
            </button>
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
                          ({formatFileSize(selectedFile.size)})
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

                  <Input
                    label="URL do Arquivo"
                    value={formData.downloadUrl}
                    onChange={(e) =>
                      handleInputChange('downloadUrl', e.target.value)
                    }
                    placeholder="https://exemplo.com/partitura.pdf"
                    leftIcon={<FiDownload />}
                  />
                </div>
              </AnimatedCard>

              {/* Basic Information */}
              <AnimatedCard className="classical-card-2 p-4">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiInfo className="w-5 h-5" />
                  <span>Informações Básicas</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Obra *
                    </label>
                    <Select
                      options={[
                        { value: '', label: 'Selecione uma obra' },
                        ...works.map((work) => ({
                          value: work.id,
                          label: `${work.title} - ${
                            work.composer.fullName || work.composer.name
                          }`,
                        })),
                      ]}
                      value={formData.workId}
                      onChange={(e) =>
                        handleInputChange('workId', e.target.value)
                      }
                      error={errors.workId}
                      required
                    />
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

                  <Input
                    label="Tamanho do Arquivo"
                    value={formData.fileSize}
                    onChange={(e) =>
                      handleInputChange('fileSize', e.target.value)
                    }
                    placeholder="2.5 MB"
                  />

                  <Input
                    label="Número de Páginas"
                    value={formData.pageCount}
                    onChange={(e) =>
                      handleInputChange('pageCount', e.target.value)
                    }
                    placeholder="24"
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
                    label="Data de Upload"
                    value={formData.uploadDate}
                    onChange={(e) =>
                      handleInputChange('uploadDate', e.target.value)
                    }
                    type="date"
                  />

                  <Input
                    label="Uploader"
                    value={formData.uploader}
                    onChange={(e) =>
                      handleInputChange('uploader', e.target.value)
                    }
                    placeholder="Nome de quem fez o upload"
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
                  <span>Agrupamento e Avaliação</span>
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

                  <Input
                    label="Avaliação"
                    value={formData.rating}
                    onChange={(e) =>
                      handleInputChange('rating', e.target.value)
                    }
                    placeholder="4.5"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                  />

                  <Input
                    label="Número de Avaliações"
                    value={formData.ratingsCount}
                    onChange={(e) =>
                      handleInputChange('ratingsCount', e.target.value)
                    }
                    placeholder="120"
                    type="number"
                  />

                  <Input
                    label="Contagem de Downloads"
                    value={formData.downloadCount}
                    onChange={(e) =>
                      handleInputChange('downloadCount', e.target.value)
                    }
                    placeholder="1500"
                    type="number"
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
    </div>
  );
};

export default CreateScoreModal;
