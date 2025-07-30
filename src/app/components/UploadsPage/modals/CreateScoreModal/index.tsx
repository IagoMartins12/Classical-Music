// app/components/UploadsPage/modals/CreateScoreModal/index.tsx - COM FILTRO DE COMPOSITOR
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
  FiFileText,
  FiTag,
  FiCheck,
  FiAlertCircle,
  FiLink,
  FiX,
  FiFilter,
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

interface CreateScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  works: Array<{
    id: string;
    title: string;
    composer: { id?: string; name: string; fullName: string }; // 🔧 ADICIONADO id opcional
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

  // 🆕 Estados para filtro de compositor
  const [composerFilter, setComposerFilter] = useState('');
  const [userWorks, setUserWorks] = useState<UserWork[]>([]);
  const [loadingUserWorks, setLoadingUserWorks] = useState(false);
  const [popularComposers, setPopularComposers] = useState<Composer[]>([]);

  // Estados específicos para thumbnails
  const [generatingThumbnail, setGeneratingThumbnail] = useState(false);
  const [thumbnailGenerated, setThumbnailGenerated] = useState(false);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [isLargePDF, setIsLargePDF] = useState(false);

  // REFS PARA SCROLL DE VALIDAÇÃO
  const fieldRefs = {
    workId: useRef<HTMLDivElement>(null),
    title: useRef<HTMLInputElement>(null),
    downloadUrl: useRef<HTMLInputElement>(null),
    uploadMode: useRef<HTMLDivElement>(null),
    composerFilter: useRef<HTMLDivElement>(null),
  };

  // Estados para modo de upload
  const [uploadMode, setUploadMode] = useState<UploadMode>('file');

  // Form state - 🔧 CORRIGIDO O TIPO DO tempThumbnailPath
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
    // 🔧 CORRIGIDO: Definir tipos corretos para evitar erro TypeScript
    tempThumbnailPath: '', // sempre string, não string | null
    tempPdfPath: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfValidation, setPdfValidation] = useState<{
    isValidating: boolean;
    isValid: boolean;
    error?: string;
  }>({ isValidating: false, isValid: false });

  // Estados para upload e thumbnail
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(
    null
  );

  // ESTADO PARA DADOS DA OBRA (quando editando)
  const [workData, setWorkData] = useState<{
    id: string;
    title: string;
    composer: { name: string; fullName: string };
  } | null>(null);

  // 🆕 CARREGAR COMPOSITORES POPULARES AO ABRIR O MODAL
  useEffect(() => {
    if (isOpen && popularComposers.length === 0) {
      loadPopularComposers();
    }
  }, [isOpen]);

  // 🆕 CARREGAR OBRAS DO USUÁRIO
  useEffect(() => {
    if (isOpen) {
      loadUserWorks();
    }
  }, [isOpen]);

  // 🆕 Função para carregar compositores populares
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

  // 🆕 Função para carregar obras do usuário
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

  // VALIDAÇÕES CUSTOMIZADAS CORRIGIDAS
  const requiredFields = ['workId', 'title', 'downloadUrl'];
  const customValidations = {
    ...scoreModalValidations,
    uploadMode: () => {
      if (!editingScore && !uploadMode) {
        return 'Escolha entre URL ou upload de arquivo';
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

  // Populate form when editing
  useEffect(() => {
    if (editingScore) {
      // BUSCAR DADOS DA OBRA
      const work = works.find((w) => w.id === editingScore.workId);
      if (work) {
        setWorkData(work);
        // 🆕 SETAR COMPOSITOR AUTOMATICAMENTE QUANDO EDITANDO - 🔧 VERIFICAR SE ID EXISTE
        if (work.composer.id) {
          setComposerFilter(work.composer.id);
        } else {
          // Se não tiver ID, buscar por nome
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
        customData: editingScore.customData
          ? JSON.stringify(editingScore.customData)
          : '',
        tempThumbnailPath: '',
        tempPdfPath: '',
      });

      // Determinar modo de upload baseado na URL
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

  // 🆕 FUNÇÃO PARA SELEÇÃO DE OBRA COM AUTO-SELEÇÃO DE COMPOSITOR
  const handleWorkSelect = (workId: string) => {
    setFormData((prev) => ({ ...prev, workId }));

    // 🆕 AUTO-SELEÇÃO DO COMPOSITOR
    if (workId) {
      // Primeiro procurar nas obras do usuário
      const userWork = userWorks.find((w) => w.id === workId);
      if (userWork) {
        setComposerFilter(userWork.composer.id);
        console.log(
          '🎯 Compositor auto-selecionado (usuário):',
          userWork.composer.name
        );
      } else {
        // Procurar nas obras gerais
        const generalWork = works.find((w) => w.id === workId);
        if (generalWork && generalWork.composer) {
          // 🔧 VERIFICAR SE TEM ID ANTES DE USAR
          if (generalWork.composer.id) {
            setComposerFilter(generalWork.composer.id);
            console.log(
              '🎯 Compositor auto-selecionado (ID):',
              generalWork.composer.name
            );
          } else {
            // Se não tiver ID, buscar pela API usando o nome
            findComposerIdByName(
              generalWork.composer.fullName || generalWork.composer.name
            );
          }
        }
      }
    } else {
      // Se limpar a obra, limpar também o filtro de compositor
      setComposerFilter('');
    }

    if (errors.workId) {
      setErrors((prev) => ({ ...prev, workId: '' }));
    }
  };

  // 🆕 Função para encontrar ID do compositor pelo nome
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
          console.log(
            '🎯 Compositor auto-selecionado (API):',
            composers[0].name
          );
        }
      }
    } catch (error) {
      console.error('❌ Erro ao buscar compositor por nome:', error);
    }
  };

  // 🆕 FUNÇÃO PARA FILTRO DE COMPOSITOR
  const handleComposerFilterChange = (composerId: string) => {
    setComposerFilter(composerId);
    // Limpar obra selecionada se mudar o filtro manualmente
    if (formData.workId && !editingScore) {
      setFormData((prev) => ({ ...prev, workId: '' }));
    }
  };

  // Função para resetar modo de upload
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

  const toast = useToast();

  // 🔧 FUNÇÃO DE UPLOAD CORRIGIDA - Erro TypeScript resolvido
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

      // Verificar se é PDF grande
      const isLarge = file.size > 10 * 1024 * 1024; // 10MB
      setIsLargePDF(isLarge);

      if (isLarge) {
        toast.info('📄 PDF grande detectado - processo pode ser mais lento');
      }

      console.log('📤 Iniciando upload do arquivo principal (temporário)...');

      // Upload do PDF principal para pasta temporária
      const tempId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', 'score-temp');
      uploadFormData.append('userId', '64f5b3a7e123456789abcdef'); // TODO: Pegar do session
      uploadFormData.append('tempId', tempId);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error('Erro no upload do arquivo');
      }

      const data = await response.json();
      console.log('✅ Arquivo principal enviado (temporário):', data.url);

      // Gerar thumbnail provisória
      let thumbnailUrl: string | null = null;
      let tempThumbnailPath: string | null | undefined = null;

      if (file.type === 'application/pdf') {
        setGeneratingThumbnail(true);

        try {
          console.log('🖼️ Iniciando geração de thumbnail provisória...');

          // Gerar thumbnail usando nova função
          const thumbnailResult = await generateAndUploadTempThumbnail(
            file,
            '64f5b3a7e123456789abcdef' // TODO: Pegar do session
          );

          if (thumbnailResult.success && thumbnailResult.thumbnailUrl) {
            thumbnailUrl = thumbnailResult.thumbnailUrl;
            tempThumbnailPath = thumbnailResult.tempThumbnailPath;
            setGeneratedThumbnail(thumbnailUrl);
            setThumbnailGenerated(true);
            console.log('✅ Thumbnail provisória gerada:', thumbnailUrl);

            toast.success('Preview da partitura gerado com sucesso!');
          } else {
            console.warn(
              '⚠️ Não foi possível gerar thumbnail:',
              thumbnailResult.error
            );
            setThumbnailError(thumbnailResult.error || 'Erro desconhecido');

            toast.info('⚠️ Preview não disponível - usando placeholder');
          }
        } catch (error) {
          console.warn('⚠️ Erro ao gerar thumbnail:', error);
          setThumbnailError('Erro ao gerar preview');

          toast.error('⚠️ Erro ao gerar preview da partitura');
        } finally {
          setGeneratingThumbnail(false);
        }
      }

      // 🔧 CORRIGIDO: Garantir que tempThumbnailPath seja sempre string
      setFormData((prev) => ({
        ...prev,
        downloadUrl: data.url,
        fileSize: validation.fileSize || '',
        pageCount: validation.pageCount?.toString() || '',
        title:
          prev.title || validation.title || file.name.replace(/\.[^/.]+$/, ''),
        fileFormat: getFileExtension(file.name).toUpperCase(),
        thumbnailUrl: thumbnailUrl || prev.thumbnailUrl,
        // 🔧 CORRIGIDO: Usar || '' para garantir que seja sempre string
        tempPdfPath: data.url, // URL do PDF temporário
        tempThumbnailPath: tempThumbnailPath || '', // 🔧 CORRIGIDO: Garantir string
      }));

      setSelectedFile(file);
      setPdfValidation({ isValidating: false, isValid: true });

      // LIMPAR ERRO DE DOWNLOAD URL QUANDO ARQUIVO FOR CARREGADO
      if (errors.downloadUrl) {
        setErrors((prev) => ({ ...prev, downloadUrl: '' }));
      }

      console.log('✅ Upload temporário completo:', {
        mainFile: data.url,
        thumbnail: thumbnailUrl,
        tempPdfPath: data.url,
        tempThumbnailPath: tempThumbnailPath || '',
        fileSize: validation.fileSize,
        pageCount: validation.pageCount,
      });
    } catch (error) {
      console.error('❌ Erro no upload:', error);
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

  // VALIDAÇÃO MELHORADA COM SCROLL
  const handleValidation = () => {
    const { isValid, errors: validationErrors } = validateForm(formData);
    setErrors(validationErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // USAR VALIDAÇÃO CUSTOMIZADA (SEM required DO HTML)
    if (!handleValidation()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📝 Dados do formulário antes do submit:', {
        downloadUrl: formData.downloadUrl,
        thumbnailUrl: formData.thumbnailUrl,
        tempPdfPath: formData.tempPdfPath,
        tempThumbnailPath: formData.tempThumbnailPath,
        hasTemporaryFiles: !!(
          formData.tempPdfPath || formData.tempThumbnailPath
        ),
      });

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
        hasTemporaryFiles: !!(
          formData.tempPdfPath || formData.tempThumbnailPath
        ),
        tempPdfPath: formData.tempPdfPath,
        tempThumbnailPath: formData.tempThumbnailPath,
      };

      console.log('🚀 Enviando dados para API:', {
        hasTemporaryFiles: submitData.hasTemporaryFiles,
        tempPdfPath: submitData.tempPdfPath,
        tempThumbnailPath: submitData.tempThumbnailPath,
        downloadUrl: submitData.downloadUrl,
        thumbnailUrl: submitData.thumbnailUrl,
      });

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
        console.log('✅ Resposta da API:', data);
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

  // 🆕 Determinar se deve desabilitar o filtro de compositor
  const shouldDisableComposerFilter = !!formData.workId && !editingScore;

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
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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

                    {/* ERRO DE MODO DE UPLOAD */}
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
                    <span>Upload de Arquivo</span>
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
                            Fazendo upload...
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

                          {/* Status da geração de thumbnail */}
                          {generatingThumbnail && (
                            <div className="mt-4 text-center">
                              <div className="flex items-center justify-center space-x-2 text-sm text-brand-primary">
                                <FiLoader className="w-4 h-4 animate-spin" />
                                <span>
                                  {isLargePDF
                                    ? 'Gerando preview (PDF grande - pode levar alguns segundos)...'
                                    : 'Gerando preview da partitura...'}
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

                          {/* Thumbnail gerada com sucesso */}
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

                          {/* Erro na geração de thumbnail */}
                          {thumbnailError && !generatingThumbnail && (
                            <div className="mt-4 text-center">
                              <div className="flex items-center justify-center space-x-2 text-sm text-amber-600 mb-2">
                                <FiAlertCircle className="w-4 h-4" />
                                <span>Preview não disponível</span>
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
                            Clique aqui ou arraste um arquivo para fazer upload
                          </p>
                          <p className="text-theme-tertiary text-sm mt-2">
                            Formatos suportados: PDF, MIDI, MusicXML, SVG, PNG,
                            JPG
                          </p>
                          <p className="text-theme-tertiary text-xs mt-1">
                            🖼️ Para PDFs, será gerado um preview automaticamente
                          </p>
                        </div>
                      )}
                    </div>

                    {/* ERRO DE UPLOAD DE ARQUIVO */}
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
                        <span>Remover arquivo</span>
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
                    <span>URL do Arquivo</span>
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

                  {/* Validação de PDF */}
                  {validatingPDF && (
                    <div className="mt-2 flex items-center space-x-2 text-sm text-brand-primary">
                      <FiLoader className="w-4 h-4 animate-spin" />
                      <span>Validando PDF...</span>
                    </div>
                  )}

                  {pdfValidation.isValid && (
                    <div className="mt-2 flex items-center space-x-2 text-sm text-accent-green">
                      <FiCheck className="w-4 h-4" />
                      <span>PDF válido e acessível</span>
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

              {/* 🆕 SEÇÃO DE SELEÇÃO DE OBRA COM FILTRO DE COMPOSITOR */}
              <AnimatedCard className="classical-card-2 p-4 relative z-50">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiInfo className="w-5 h-5" />
                  <span>Seleção de Obra</span>
                </h3>

                <div className="space-y-4">
                  {/* 🆕 Filtro de Compositor */}
                  <div ref={fieldRefs.composerFilter}>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      <div className="flex items-center space-x-2">
                        <FiFilter className="w-4 h-4" />
                        <span>Filtrar por Compositor</span>
                        {shouldDisableComposerFilter && (
                          <span className="text-xs text-accent-blue">
                            (Selecionado automaticamente)
                          </span>
                        )}
                      </div>
                    </label>

                    <ComposerSearchInput
                      selectedComposer={composerFilter}
                      onComposerSelect={handleComposerFilterChange}
                      popularComposers={popularComposers}
                      isDisabled={shouldDisableComposerFilter}
                    />

                    {shouldDisableComposerFilter && (
                      <p className="text-xs text-theme-tertiary mt-1">
                        💡 O compositor foi selecionado automaticamente baseado
                        na obra escolhida. Limpe a obra para alterar o
                        compositor.
                      </p>
                    )}
                  </div>

                  {/* Seleção de Obra */}
                  <div ref={fieldRefs.workId}>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Obra *
                    </label>

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
                        // 🆕 PROPS PARA FUNCIONALIDADES NOVAS
                        filterByComposer={composerFilter}
                        userSuggestions={userWorks}
                        loadingUserSuggestions={loadingUserWorks}
                      />
                    )}

                    {errors.workId && (
                      <p className="text-red-500 text-sm font-medium flex items-center space-x-1 mt-1">
                        <FiAlertCircle className="w-4 h-4" />
                        <span>{errors.workId}</span>
                      </p>
                    )}
                  </div>

                  {/* Informações sobre sugestões */}
                  {!editingScore && !loadingUserWorks && (
                    <div className="bg-theme-secondary/10 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <FiInfo className="w-4 h-4 text-theme-tertiary mt-0.5" />
                        <div className="text-xs text-theme-tertiary">
                          <p className="font-medium mb-1">
                            💡 Sugestões Inteligentes:
                          </p>
                          {userWorks.length > 0 ? (
                            <p>
                              Mostrando suas obras primeiro ({userWorks.length}{' '}
                              encontradas), seguidas por obras populares.
                            </p>
                          ) : (
                            <p>
                              Como você ainda não tem obras cadastradas,
                              mostramos obras populares de compositores famosos.
                            </p>
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
                  <span>Informações Básicas</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Título *"
                    ref={fieldRefs.title}
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    error={errors.title}
                    placeholder="Título da partitura"
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
