'use client';

// app/components/modals/CreateWorkModal.tsx - MELHORADO COM SCRAPING IMSLP

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiX,
  FiMusic,
  FiExternalLink,
  FiSave,
  FiLoader,
  FiInfo,
  FiTag,
  FiPlay,
  FiDatabase,
  FiLink,
  FiCheck,
  FiAlertCircle,
  FiSearch,
} from 'react-icons/fi';
import Select from '@/app/components/Common/Select';
import Input from '@/app/components/Common/Inputs';
import {
  AnimatedCard,
  AnimatedItem,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Checkbox from '@/app/components/Common/Checkbox';
import Modal from '@/app/components/Modal';
import ComposerSearchInput from '@/app/components/ComposerSearchInput';
import { useFormValidation } from '@/app/utils/formUtils';

interface CreateWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  composers: Array<{ id: string; name: string; fullName: string }>;
  instruments: Array<{ id: string; name: string; category: string }>;
  epochs: Array<{ id: string; name: string }>;
  editingWork?: any;
}

const workTypeOptions = [
  { value: 'INDIVIDUAL', label: 'Obra Individual' },
  { value: 'COMPLETE_WORK', label: 'Obra Completa' },
  { value: 'ARRANGEMENT', label: 'Arranjo' },
  { value: 'COLLECTION', label: 'Coleção' },
  { value: 'COLLABORATION', label: 'Colaboração' },
  { value: 'COMPOSITION', label: 'Composição' },
  { value: 'COLLECTED_WORKS', label: 'Obras Coletadas' },
  { value: 'COLLECTIONS_WITH', label: 'Coleções com' },
];

const difficultyOptions = [
  { value: '', label: 'Não especificado' },
  { value: 'BEGINNER', label: 'Iniciante' },
  { value: 'INTERMEDIATE', label: 'Intermediário' },
  { value: 'ADVANCED', label: 'Avançado' },
];

const CreateWorkModal = ({
  isOpen,
  onClose,
  composers,
  instruments,
  epochs,
  editingWork,
}: CreateWorkModalProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrapingUrl, setScrapingUrl] = useState(false);
  const [urlToScrape, setUrlToScrape] = useState('');
  const [scrapingResult, setScrapingResult] = useState<any>(null);
  const [duplicateCheck, setDuplicateCheck] = useState<{
    loading: boolean;
    found: boolean;
    work?: any;
  }>({ loading: false, found: false });

  // Refs para scroll automático
  const fieldRefs = {
    title: useRef<HTMLInputElement>(null),
    composerId: useRef<HTMLDivElement>(null),
    instrumentId: useRef<HTMLSelectElement>(null),
    epochId: useRef<HTMLSelectElement>(null),
  };

  // Form state para os dados da obra
  const [formData, setFormData] = useState({
    title: '',
    composerId: '',
    instrumentId: '',
    epochId: '',
    videoUrl: '',
    imslpId: '',
    opOrCatalog: '',
    compositionYear: '',
    firstPublishDate: '',
    tone: '',
    mediaDuration: '',
    workStyle: '',
    moviment: '',
    categoryNames: '',
    workGenresArr: '',
    dedicateTo: '',
    dedicationComposerLink: '',
    instrumentation: '',
    workType: 'INDIVIDUAL',
    isPartOfCollection: false,
    parentWorkId: '',
    movementNumber: '',
    subtitle: '',
    timeSignature: '',
    tempoMarking: '',
    movementsDetailed: '',
    imslpTags: '',
    difficultyLevel: '',
  });

  // Support data para listas de apoio (renomeado para evitar conflito)
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
  const [loadingFormData, setLoadingFormData] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editingWork) {
      setFormData({
        title: editingWork.title || '',
        composerId: editingWork.composerId || '',
        instrumentId: editingWork.instrumentId || '',
        epochId: editingWork.epochId || '',
        videoUrl: editingWork.videoUrl || '',
        imslpId: editingWork.imslpId || '',
        opOrCatalog: editingWork.opOrCatalog || '',
        compositionYear: editingWork.compositionYear || '',
        firstPublishDate: editingWork.firstPublishDate || '',
        tone: editingWork.tone || '',
        mediaDuration: editingWork.mediaDuration || '',
        workStyle: editingWork.workStyle || '',
        moviment: editingWork.moviment || '',
        categoryNames: editingWork.categoryNames?.join(', ') || '',
        workGenresArr: editingWork.workGenresArr?.join(', ') || '',
        dedicateTo: editingWork.dedicateTo || '',
        dedicationComposerLink: editingWork.dedicationComposerLink || '',
        instrumentation: editingWork.instrumentation || '',
        workType: editingWork.workType || 'INDIVIDUAL',
        isPartOfCollection: editingWork.isPartOfCollection || false,
        parentWorkId: editingWork.parentWorkId || '',
        movementNumber: editingWork.movementNumber?.toString() || '',
        subtitle: editingWork.subtitle || '',
        timeSignature: editingWork.timeSignature || '',
        tempoMarking: editingWork.tempoMarking || '',
        movementsDetailed: editingWork.movementsDetailed
          ? JSON.stringify(editingWork.movementsDetailed)
          : '',
        imslpTags: editingWork.imslpTags?.join(', ') || '',
        difficultyLevel: editingWork.difficultyLevel || '',
      });
    }
  }, [editingWork]);

  // Carregar dados adicionais quando necessário
  const loadFormData = async () => {
    setLoadingFormData(true);
    try {
      const response = await fetch('/api/uploads/form-data');
      if (response.ok) {
        const data = await response.json();
        setSupportData((prev) => ({
          ...prev,
          roles: data.roles || [],
          instruments: data.instruments || prev.instruments,
          composers: data.composers || prev.composers,
          works: data.works || [],
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do formulário:', error);
    } finally {
      setLoadingFormData(false);
    }
  };

  // Configurar validação de formulário
  const requiredFields = ['title', 'composerId', 'instrumentId', 'epochId'];
  const customValidations = {};

  const { validateForm } = useFormValidation(
    fieldRefs,
    requiredFields,
    customValidations
  );

  // Verificar duplicatas por link IMSLP
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
        console.log('⚠️ Obra duplicada encontrada:', data.work.title);
        return true;
      } else {
        setDuplicateCheck({ loading: false, found: false });
        console.log('✅ Nenhuma duplicata encontrada');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao verificar duplicata:', error);
      setDuplicateCheck({ loading: false, found: false });
      return false;
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleComposerSelect = (composerId: string) => {
    setFormData((prev) => ({ ...prev, composerId }));
    if (errors.composerId) {
      setErrors((prev) => ({ ...prev, composerId: '' }));
    }
  };

  // Função de validação com scroll suave
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

    // Verificar duplicatas antes de salvar
    if (formData.imslpId && (await checkDuplicateByLink(formData.imslpId))) {
      alert('Já existe uma obra com este link do IMSLP.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert string arrays back to arrays
      const submitData = {
        ...formData,
        categoryNames: formData.categoryNames
          ? formData.categoryNames.split(',').map((s) => s.trim())
          : [],
        workGenresArr: formData.workGenresArr
          ? formData.workGenresArr.split(',').map((s) => s.trim())
          : [],
        imslpTags: formData.imslpTags
          ? formData.imslpTags.split(',').map((s) => s.trim())
          : [],
        movementNumber: formData.movementNumber
          ? parseInt(formData.movementNumber)
          : null,
        movementsDetailed: formData.movementsDetailed
          ? JSON.parse(formData.movementsDetailed)
          : null,
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
        alert(data.message || 'Obra salva com sucesso!');
      } else {
        throw new Error(data.error || 'Erro ao salvar obra');
      }
    } catch (error) {
      console.error('Erro ao salvar obra:', error);
      alert(error instanceof Error ? error.message : 'Erro ao salvar obra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScrapeUrl = async () => {
    if (!urlToScrape.trim()) {
      alert('Digite uma URL para fazer scraping');
      return;
    }

    // Verificar se é uma URL válida do IMSLP
    if (!urlToScrape.includes('imslp.org/wiki/')) {
      alert(
        'Por favor, insira um link válido do IMSLP (deve conter "imslp.org/wiki/")'
      );
      return;
    }

    // Verificar duplicatas antes de fazer scraping
    const isDuplicate = await checkDuplicateByLink(urlToScrape);
    if (isDuplicate) {
      alert('Já existe uma obra com este link do IMSLP.');
      return;
    }

    setScrapingUrl(true);
    setScrapingResult(null);

    try {
      console.log('🚀 Iniciando scraping da URL:', urlToScrape);

      const response = await fetch('/api/uploads/work/scraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: urlToScrape,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Scraping concluído com sucesso:', data);
        setScrapingResult(data);
        await fillFromScrapingResult(data.data);
      } else {
        throw new Error(data.error || 'Erro ao fazer scraping');
      }
    } catch (error) {
      console.error('❌ Erro ao fazer scraping:', error);
      alert(error instanceof Error ? error.message : 'Erro ao fazer scraping');
    } finally {
      setScrapingUrl(false);
    }
  };

  const fillFromScrapingResult = async (data: any) => {
    // Primeiro, preencher todos os dados básicos
    setFormData((prev) => ({
      ...prev,
      title: data.title || prev.title,
      subtitle: data.subtitle || prev.subtitle,
      imslpId: data.imslpId || prev.imslpId,
      opOrCatalog: data.opOrCatalog || prev.opOrCatalog,
      compositionYear: data.compositionYear || prev.compositionYear,
      firstPublishDate: data.firstPublishDate || prev.firstPublishDate,
      tone: data.tone || prev.tone,
      timeSignature: data.timeSignature || prev.timeSignature,
      tempoMarking: data.tempoMarking || prev.tempoMarking,
      mediaDuration: data.mediaDuration || prev.mediaDuration,
      workStyle: data.workStyle || prev.workStyle,
      moviment: data.moviment || prev.moviment,
      instrumentation: data.instrumentation || prev.instrumentation,
      dedicateTo: data.dedicateTo || prev.dedicateTo,
      dedicationComposerLink:
        data.dedicationComposerLink || prev.dedicationComposerLink,
      categoryNames: data.categoryNames?.join(', ') || prev.categoryNames,
      workGenresArr: data.workGenresArr?.join(', ') || prev.workGenresArr,
      imslpTags: data.imslpTags?.join(', ') || prev.imslpTags,
      difficultyLevel: data.difficultyLevel || prev.difficultyLevel,
      workType: data.workType || prev.workType,
      isPartOfCollection: data.isPartOfCollection || prev.isPartOfCollection,
      movementNumber: data.movementNumber?.toString() || prev.movementNumber,
    }));

    // Buscar época automaticamente baseada no epochName retornado pelo scraper
    if (data.epochName) {
      const epoch = epochs.find((e) =>
        e.name.toLowerCase().includes(data.epochName.toLowerCase())
      );
      if (epoch) {
        setFormData((prev) => ({ ...prev, epochId: epoch.id }));
        console.log(`🏛️ Época vinculada automaticamente: ${epoch.name}`);
      } else {
        console.log(`⚠️ Época não encontrada no banco: ${data.epochName}`);
      }
    }

    // Buscar instrumento automaticamente baseado no primaryInstrument
    if (data.primaryInstrument) {
      const instrument = supportData.instruments.find((i) =>
        i.name.toLowerCase().includes(data.primaryInstrument.toLowerCase())
      );
      if (instrument) {
        setFormData((prev) => ({ ...prev, instrumentId: instrument.id }));
        console.log(
          `🎼 Instrumento vinculado automaticamente: ${instrument.name}`
        );
      } else {
        console.log(
          `⚠️ Instrumento não encontrado no banco: ${data.primaryInstrument}`
        );
      }
    }

    // Buscar e definir compositor automaticamente
    if (data.composerId) {
      try {
        console.log(
          `🔍 Buscando dados completos do compositor: ${data.composerId}`
        );

        // Fazer nova requisição para buscar dados completos do compositor
        const response = await fetch('/api/composers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: data.composerId,
          }),
        });

        if (response.ok) {
          const composerData = await response.json();
          if (composerData && composerData.id) {
            // Definir o ID do compositor encontrado
            setFormData((prev) => ({ ...prev, composerId: data.composerId }));

            // Verificar se o compositor está na lista de compositores do supportData
            const existingComposer = supportData.composers.find(
              (c) => c.id === data.composerId
            );
            if (!existingComposer && composerData) {
              // Adicionar o compositor à lista se não estiver presente
              setSupportData((prevSupportData) => ({
                ...prevSupportData,
                composers: [
                  ...prevSupportData.composers,
                  {
                    id: composerData.id,
                    name: composerData.name,
                    fullName: composerData.fullName,
                    worksCount: composerData.worksCount || 0,
                  },
                ],
              }));
            }

            console.log(
              `🎼 Compositor vinculado automaticamente: ${
                composerData.fullName || composerData.name
              }`
            );
          } else {
            console.log(
              `⚠️ Dados do compositor não encontrados para ID: ${data.composerId}`
            );
          }
        } else {
          console.log(
            `❌ Erro na requisição do compositor: ${response.status}`
          );
          // Se falhar, apenas definir o ID diretamente (fallback)
          setFormData((prev) => ({ ...prev, composerId: data.composerId }));
        }
      } catch (error) {
        console.error('❌ Erro ao buscar dados do compositor:', error);
        // Se falhar, apenas definir o ID diretamente (fallback)
        setFormData((prev) => ({ ...prev, composerId: data.composerId }));
      }
    } else if (data.composerName) {
      // Se não tem composerId mas tem composerName, tentar buscar por nome
      console.log(`🔍 Buscando compositor por nome: ${data.composerName}`);
      const composer = supportData.composers.find(
        (c) =>
          c.name.toLowerCase().includes(data.composerName.toLowerCase()) ||
          (c.fullName &&
            c.fullName.toLowerCase().includes(data.composerName.toLowerCase()))
      );

      if (composer) {
        setFormData((prev) => ({ ...prev, composerId: composer.id }));
        console.log(
          `🎼 Compositor encontrado por nome: ${
            composer.fullName || composer.name
          }`
        );
      } else {
        console.log(
          `⚠️ Compositor não encontrado por nome: ${data.composerName}`
        );
      }
    }

    // Log de completude dos dados
    console.log('📊 Dados extraídos e preenchidos:');
    console.log(`   - Título: ${data.title}`);
    console.log(`   - Compositor: ${data.composerName || 'Não encontrado'}`);
    console.log(`   - Época: ${data.epochName || 'Não determinada'}`);
    console.log(
      `   - Instrumento: ${data.primaryInstrument || 'Não determinado'}`
    );
    console.log(`   - Gêneros: ${data.workGenresArr?.length || 0} encontrados`);
    console.log(
      `   - Categorias: ${data.categoryNames?.length || 0} encontradas`
    );
    console.log(`   - Completude: ${data.dataCompleteness}%`);
    console.log(`   - Qualidade da página: ${data.pageQuality}`);
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
              <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-green rounded-xl flex items-center justify-center">
                <FiMusic className="w-5 h-5 text-theme-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-primary classical-title">
                  {editingWork ? 'Editar Obra' : 'Nova Obra'}
                </h2>
                <p className="text-theme-secondary text-sm">
                  {editingWork
                    ? 'Atualize as informações da obra'
                    : 'Adicione uma nova obra à enciclopédia'}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mt-4 max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* URL Scraping */}
              <AnimatedCard className="classical-card-simple p-4" hover="none">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FiDatabase className="w-4 h-4 text-theme-tertiary" />
                    <span className="text-sm font-medium text-theme-primary">
                      Extrair Dados do IMSLP
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Input
                    label="URL do IMSLP"
                    value={urlToScrape}
                    onChange={(e) => setUrlToScrape(e.target.value)}
                    placeholder="https://imslp.org/wiki/Symphony_No.40_(Mozart,_Wolfgang_Amadeus)"
                    leftIcon={<FiLink />}
                  />

                  {/* Verificação de Duplicata */}
                  {duplicateCheck.loading && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FiLoader className="w-4 h-4 animate-spin text-blue-600" />
                        <span className="text-sm text-blue-800">
                          Verificando duplicatas...
                        </span>
                      </div>
                    </div>
                  )}

                  {duplicateCheck.found && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <FiAlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">
                          Obra já existe!
                        </span>
                      </div>
                      <p className="text-sm text-red-700">
                        Já existe uma obra com este link:{' '}
                        <strong>{duplicateCheck.work?.title}</strong>
                      </p>
                    </div>
                  )}

                  {/* Botão de Scraping */}
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
                      disabled={scrapingUrl || duplicateCheck.found}
                    >
                      {scrapingUrl ? 'Extraindo Dados...' : 'Extrair Dados'}
                    </Button>
                  </div>

                  {/* Resultado do Scraping */}
                  {scrapingResult && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <FiCheck className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Dados extraídos com sucesso!
                        </span>
                      </div>
                      <div className="text-xs text-green-700">
                        Fonte: {scrapingResult.source} | Qualidade:{' '}
                        {scrapingResult.data.pageQuality} | Completude:{' '}
                        {scrapingResult.data.dataCompleteness}%
                      </div>
                    </div>
                  )}
                </div>
              </AnimatedCard>

              {/* Basic Information */}
              <AnimatedCard className="classical-card-simple p-4" hover="none">
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
                    placeholder="Sinfonia No. 40 em Sol menor"
                    required
                  />

                  <Input
                    label="Subtítulo"
                    value={formData.subtitle}
                    onChange={(e) =>
                      handleInputChange('subtitle', e.target.value)
                    }
                    placeholder="Subtítulo da obra"
                  />

                  <div ref={fieldRefs.composerId}>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Compositor *
                    </label>
                    <ComposerSearchInput
                      selectedComposer={formData.composerId}
                      onComposerSelect={handleComposerSelect}
                      popularComposers={supportData.composers}
                    />
                    {errors.composerId && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.composerId}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Instrumento *
                    </label>
                    <Select
                      ref={fieldRefs.instrumentId}
                      options={[
                        { value: '', label: 'Selecione um instrumento' },
                        ...supportData.instruments.map((instrument) => ({
                          value: instrument.id,
                          label: `${instrument.name} (${instrument.category})`,
                        })),
                      ]}
                      value={formData.instrumentId}
                      onChange={(e) =>
                        handleInputChange('instrumentId', e.target.value)
                      }
                      error={errors.instrumentId}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Época *
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
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Tipo de Obra
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

              {/* Catalog Information */}
              <AnimatedCard className="classical-card-simple p-4" hover="none">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiTag className="w-5 h-5" />
                  <span>Informações de Catálogo</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Op. ou Catálogo"
                    value={formData.opOrCatalog}
                    onChange={(e) =>
                      handleInputChange('opOrCatalog', e.target.value)
                    }
                    placeholder="K. 550, Op. 67"
                  />

                  <Input
                    label="Ano de Composição"
                    value={formData.compositionYear}
                    onChange={(e) =>
                      handleInputChange('compositionYear', e.target.value)
                    }
                    placeholder="1788"
                  />

                  <Input
                    label="Primeira Publicação"
                    value={formData.firstPublishDate}
                    onChange={(e) =>
                      handleInputChange('firstPublishDate', e.target.value)
                    }
                    placeholder="1794"
                  />

                  <Input
                    label="Tonalidade"
                    value={formData.tone}
                    onChange={(e) => handleInputChange('tone', e.target.value)}
                    placeholder="Sol menor"
                  />

                  <Input
                    label="Duração"
                    value={formData.mediaDuration}
                    onChange={(e) =>
                      handleInputChange('mediaDuration', e.target.value)
                    }
                    placeholder="35 minutos"
                  />

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Dificuldade
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
                  <span>Detalhes Musicais</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Compasso"
                    value={formData.timeSignature}
                    onChange={(e) =>
                      handleInputChange('timeSignature', e.target.value)
                    }
                    placeholder="4/4"
                  />

                  <Input
                    label="Andamento"
                    value={formData.tempoMarking}
                    onChange={(e) =>
                      handleInputChange('tempoMarking', e.target.value)
                    }
                    placeholder="Allegro molto"
                  />

                  <Input
                    label="Estilo"
                    value={formData.workStyle}
                    onChange={(e) =>
                      handleInputChange('workStyle', e.target.value)
                    }
                    placeholder="Classical"
                  />

                  <Input
                    label="Movimento"
                    value={formData.moviment}
                    onChange={(e) =>
                      handleInputChange('moviment', e.target.value)
                    }
                    placeholder="I. Allegro molto"
                  />

                  <Input
                    label="Instrumentação"
                    value={formData.instrumentation}
                    onChange={(e) =>
                      handleInputChange('instrumentation', e.target.value)
                    }
                    placeholder="2 flautas, 2 oboés, 2 clarinetes..."
                  />

                  <Input
                    label="Dedicado a"
                    value={formData.dedicateTo}
                    onChange={(e) =>
                      handleInputChange('dedicateTo', e.target.value)
                    }
                    placeholder="Nome do dedicatário"
                  />
                </div>
              </AnimatedCard>

              {/* Categories and Tags */}
              <AnimatedCard className="classical-card-simple p-4" hover="none">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiTag className="w-5 h-5" />
                  <span>Categorias e Tags</span>
                </h3>

                <div className="space-y-4">
                  <Input
                    label="Categorias"
                    value={formData.categoryNames}
                    onChange={(e) =>
                      handleInputChange('categoryNames', e.target.value)
                    }
                    placeholder="Para piano, Para piano 4 mãos (separadas por vírgula)"
                  />

                  <Input
                    label="Gêneros"
                    value={formData.workGenresArr}
                    onChange={(e) =>
                      handleInputChange('workGenresArr', e.target.value)
                    }
                    placeholder="noturnos, valsas, estudos (separados por vírgula)"
                  />

                  <Input
                    label="Tags IMSLP"
                    value={formData.imslpTags}
                    onChange={(e) =>
                      handleInputChange('imslpTags', e.target.value)
                    }
                    placeholder="Symphonies, Orchestral works (separadas por vírgula)"
                  />
                </div>
              </AnimatedCard>

              {/* External Links */}
              <AnimatedCard className="classical-card-simple p-4" hover="none">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiExternalLink className="w-5 h-5" />
                  <span>Links Externos</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="ID IMSLP"
                    value={formData.imslpId}
                    onChange={(e) =>
                      handleInputChange('imslpId', e.target.value)
                    }
                    placeholder="Symphony_No.40_(Mozart,_Wolfgang_Amadeus)"
                    leftIcon={<FiExternalLink />}
                  />

                  <Input
                    label="URL do Vídeo"
                    value={formData.videoUrl}
                    onChange={(e) =>
                      handleInputChange('videoUrl', e.target.value)
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                    leftIcon={<FiPlay />}
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
                    : editingWork
                    ? 'Atualizar Obra'
                    : 'Criar Obra'}
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
