// CreateComposerModal.tsx - MELHORADO COM INPUTS DE DATA
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiX,
  FiUser,
  FiSearch,
  FiExternalLink,
  FiSave,
  FiLoader,
  FiImage,
  FiCalendar,
  FiGlobe,
  FiTag,
  FiInfo,
  FiLink,
  FiCheck,
  FiAlertCircle,
  FiDatabase,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedItem,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import Modal from '@/app/components/Modal';
import ComposerImageUpload from '../ComposerImageUpload';
import { isValidDate, useFormValidation } from '@/app/utils/formUtils';

interface CreateComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  epochs: Array<{ id: string; name: string }>;
  roles: Array<{ id: string; name: string }>;
  editingComposer?: any;
}

type DataSource = 'none' | 'imslp' | 'wikipedia';

const CreateComposerModal = ({
  isOpen,
  onClose,
  epochs,
  roles,
  editingComposer,
}: CreateComposerModalProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrapingUrl, setScrapingUrl] = useState(false);
  const [urlToScrape, setUrlToScrape] = useState('');
  const [dataSource, setDataSource] = useState<DataSource>('none');
  const [scrapingResult, setScrapingResult] = useState<any>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [duplicateCheck, setDuplicateCheck] = useState<{
    loading: boolean;
    found: boolean;
    composer?: any;
  }>({ loading: false, found: false });

  // Refs para scroll automático
  const fieldRefs = {
    name: useRef<HTMLInputElement>(null),
    fullName: useRef<HTMLInputElement>(null),
    epochId: useRef<HTMLSelectElement>(null),
    primaryRoleId: useRef<HTMLSelectElement>(null),
    birthDate: useRef<HTMLInputElement>(null),
    deathDate: useRef<HTMLInputElement>(null),
    nationality: useRef<HTMLInputElement>(null),
  };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    fullName: '',
    otherName: '',
    alternativeNames: '',
    pseudonyms: '',
    birthDate: '', // Formato YYYY-MM-DD para input date
    deathDate: '', // Formato YYYY-MM-DD para input date
    portraitUrl: '',
    epochId: '',
    bio: '',
    diverseInfo: '',
    externalLinks: '',
    imslpId: '',
    wikipediaLink: '',
    nationality: '',
    instruments: '',
    imslpCategories: '',
    primaryRoleId: '',
    secondaryRoles: [] as string[],
    dataSource: 'none' as DataSource,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when editing
  useEffect(() => {
    if (editingComposer) {
      setFormData({
        name: editingComposer.name || '',
        fullName: editingComposer.fullName || '',
        otherName: editingComposer.otherName || '',
        alternativeNames: editingComposer.alternativeNames || '',
        pseudonyms: editingComposer.pseudonyms || '',
        birthDate: formatDateForInput(editingComposer.birthDate),
        deathDate: formatDateForInput(editingComposer.deathDate),
        portraitUrl: editingComposer.portraitUrl || '',
        epochId: editingComposer.epochId || '',
        bio: editingComposer.bio || '',
        diverseInfo: editingComposer.diverseInfo || '',
        externalLinks: editingComposer.externalLinks || '',
        imslpId: editingComposer.imslpId || '',
        wikipediaLink: editingComposer.wikipediaLink || '',
        nationality: editingComposer.nationality || '',
        instruments: editingComposer.instruments || '',
        imslpCategories: editingComposer.imslpCategories || '',
        primaryRoleId: editingComposer.primaryRoleId || '',
        secondaryRoles: editingComposer.roles
          ? editingComposer.roles.split(', ')
          : [],
        dataSource: editingComposer.imslpId
          ? 'imslp'
          : editingComposer.wikipediaLink
          ? 'wikipedia'
          : 'none',
      });

      if (editingComposer.imslpId) {
        setDataSource('imslp');
      } else if (editingComposer.wikipediaLink) {
        setDataSource('wikipedia');
      }
    }
  }, [editingComposer]);

  // Função para formatar data para input HTML5 (YYYY-MM-DD)
  const formatDateForInput = (dateString: string | null): string => {
    if (!dateString) return '';

    // Se já está em formato ISO, retornar como está
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // Se está em formato dd/mm/yyyy
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Tentar extrair data de formato extenso
    const dateFromText = extractDateFromExtendedFormat(dateString);
    if (dateFromText) {
      return dateFromText;
    }

    // Se só tem ano, usar 1 de janeiro
    const yearMatch = dateString.match(/(\d{4})/);
    if (yearMatch) {
      return `${yearMatch[1]}-01-01`;
    }

    return '';
  };

  // Função para extrair data de formato extenso
  const extractDateFromExtendedFormat = (dateString: string): string | null => {
    if (!dateString) return null;

    // Meses em português
    const monthsMap: Record<string, string> = {
      janeiro: '01',
      fevereiro: '02',
      março: '03',
      abril: '04',
      maio: '05',
      junho: '06',
      julho: '07',
      agosto: '08',
      setembro: '09',
      outubro: '10',
      novembro: '11',
      dezembro: '12',
      jan: '01',
      fev: '02',
      mar: '03',
      abr: '04',
      mai: '05',
      jun: '06',
      jul: '07',
      ago: '08',
      set: '09',
      out: '10',
      nov: '11',
      dez: '12',
      // Inglês
      january: '01',
      february: '02',
      march: '03',
      april: '04',
      may: '05',
      june: '06',
      july: '07',
      august: '08',
      september: '09',
      october: '10',
      november: '11',
      december: '12',
    };

    // Padrões para extrair datas
    const patterns = [
      // Português: "27 de janeiro de 1756"
      /(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/i,
      // Inglês: "27 January 1756" ou "January 27, 1756"
      /(\d{1,2})\s+(\w+)\s+(\d{4})/i,
      /(\w+)\s+(\d{1,2}),?\s+(\d{4})/i,
    ];

    for (const pattern of patterns) {
      const match = dateString.match(pattern);
      if (match) {
        if (pattern.source.includes('de\\s+')) {
          // Português
          const day = match[1];
          const monthName = match[2].toLowerCase();
          const year = match[3];
          const month = monthsMap[monthName];
          if (month) {
            return `${year}-${month}-${day.padStart(2, '0')}`;
          }
        } else {
          // Inglês
          let day, monthName, year;
          if (/^\d/.test(match[1])) {
            // Formato: "27 January 1756"
            day = match[1];
            monthName = match[2].toLowerCase();
            year = match[3];
          } else {
            // Formato: "January 27, 1756"
            monthName = match[1].toLowerCase();
            day = match[2];
            year = match[3];
          }
          const month = monthsMap[monthName];
          if (month) {
            return `${year}-${month}-${day.padStart(2, '0')}`;
          }
        }
      }
    }

    return null;
  };

  // Função para formatar data para salvar (dd/mm/yyyy)
  const formatDateForSave = (dateString: string): string => {
    if (!dateString) return '';

    // Se está em formato YYYY-MM-DD (do input date)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }

    return dateString;
  };

  // Função para limpar nome
  const cleanName = (name: string): string => {
    return name
      .replace(/[(),]/g, '')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Verificar duplicatas por link
  const checkDuplicateByLink = async (url: string, source: DataSource) => {
    if (!url.trim()) return;

    setDuplicateCheck({ loading: true, found: false });

    try {
      const response = await fetch('/api/uploads/composer/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          source,
          excludeId: editingComposer?.id,
          fulllname: cleanName(formData.fullName),
        }),
      });

      const data = await response.json();

      if (data.found) {
        setDuplicateCheck({
          loading: false,
          found: true,
          composer: data.composer,
        });
        return true;
      } else {
        setDuplicateCheck({ loading: false, found: false });
        return false;
      }
    } catch (error) {
      console.error('Erro ao verificar duplicata:', error);
      setDuplicateCheck({ loading: false, found: false });
      return false;
    }
  };

  const handleInputChange = (
    field: string,
    value: string | boolean | string[]
  ) => {
    // Limpar nomes automaticamente
    if (field === 'name' || field === 'fullName') {
      value = cleanName(value as string);
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSecondaryRolesChange = (roleId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      secondaryRoles: checked
        ? [...prev.secondaryRoles, roleId]
        : prev.secondaryRoles.filter((id) => id !== roleId),
    }));
  };

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append(
        'composerName',
        formData.fullName || formData.name || 'Compositor'
      );

      const response = await fetch('/api/uploads/composer-image', {
        method: 'POST',
        body: uploadFormData,
      });

      const result = await response.json();

      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          portraitUrl: result.imageUrl,
        }));
        alert('Imagem carregada com sucesso!');
      } else {
        throw new Error(result.message || 'Erro ao fazer upload');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Erro ao fazer upload da imagem'
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageChange = (imageUrl: string | null) => {
    setFormData((prev) => ({
      ...prev,
      portraitUrl: imageUrl || '',
    }));
  };

  // Configurar validação de formulário
  const requiredFields = ['name', 'fullName', 'epochId', 'primaryRoleId'];
  const customValidations = {
    birthDate: (value: string) => {
      if (value && !isValidHTMLDate(value)) {
        return 'Data inválida';
      }
      return null;
    },
    deathDate: (value: string) => {
      if (value && !isValidHTMLDate(value)) {
        return 'Data inválida';
      }
      return null;
    },
  };

  // Validar formato de data HTML5
  const isValidHTMLDate = (dateString: string): boolean => {
    if (!dateString) return true;
    return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
  };

  const { validateForm } = useFormValidation(
    fieldRefs,
    requiredFields,
    customValidations
  );

  // Função de validação
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
    if (
      formData.imslpId &&
      (await checkDuplicateByLink(formData.imslpId, 'imslp'))
    ) {
      alert('Já existe um compositor com este link do IMSLP.');
      return;
    }

    if (
      formData.wikipediaLink &&
      (await checkDuplicateByLink(formData.wikipediaLink, 'wikipedia'))
    ) {
      alert('Já existe um compositor com este link da Wikipedia.');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingComposer
        ? `/api/uploads/composer/${editingComposer.id}`
        : '/api/uploads/composer';

      const method = editingComposer ? 'PUT' : 'POST';

      const dataToSend = {
        ...formData,
        // Converter datas para formato dd/mm/yyyy para salvar no banco
        birthDate: formatDateForSave(formData.birthDate),
        deathDate: formatDateForSave(formData.deathDate),
        roles: formData.secondaryRoles.join(', '),
        dataSource: formData.dataSource,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (response.ok) {
        router.refresh();
        onClose();
        alert(data.message || 'Compositor salvo com sucesso!');
      } else {
        throw new Error(data.error || 'Erro ao salvar compositor');
      }
    } catch (error) {
      console.error('Erro ao salvar compositor:', error);
      alert(
        error instanceof Error ? error.message : 'Erro ao salvar compositor'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScrapeUrl = async () => {
    if (!urlToScrape.trim()) {
      alert('Digite uma URL para fazer scraping');
      return;
    }

    if (dataSource === 'none') {
      alert('Selecione o tipo de fonte (IMSLP ou Wikipedia)');
      return;
    }

    // Verificar duplicatas antes de fazer scraping
    const isDuplicate = await checkDuplicateByLink(urlToScrape, dataSource);
    if (isDuplicate) {
      alert(
        `Já existe um compositor com este link ${
          dataSource === 'imslp' ? 'do IMSLP' : 'da Wikipedia'
        }.`
      );
      return;
    }

    setScrapingUrl(true);
    setScrapingResult(null);

    try {
      const response = await fetch('/api/uploads/external-sources/scraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: urlToScrape,
          source: dataSource,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setScrapingResult(data);
        fillFromScrapingResult(data.data);
      } else {
        throw new Error(data.error || 'Erro ao fazer scraping');
      }
    } catch (error) {
      console.error('Erro ao fazer scraping:', error);
      alert(error instanceof Error ? error.message : 'Erro ao fazer scraping');
    } finally {
      setScrapingUrl(false);
    }
  };

  const fillFromScrapingResult = (data: any) => {
    setFormData((prev) => ({
      ...prev,
      name: cleanName(data.name || prev.name),
      fullName: cleanName(data.fullName || prev.fullName),
      otherName: data.otherName || prev.otherName,
      alternativeNames: data.alternativeNames || prev.alternativeNames,
      pseudonyms: data.pseudonyms || prev.pseudonyms,
      // As datas já vêm em formato YYYY-MM-DD do scraper melhorado
      birthDate: data.birthDate || prev.birthDate,
      deathDate: data.deathDate || prev.deathDate,
      portraitUrl: data.portraitUrl || prev.portraitUrl,
      bio: data.bio || prev.bio,
      diverseInfo: data.diverseInfo || prev.diverseInfo,
      externalLinks: data.externalLinks || prev.externalLinks,
      imslpId: data.imslpId || prev.imslpId,
      wikipediaLink: data.wikipediaLink || prev.wikipediaLink,
      nationality: data.nationality || prev.nationality, // Já traduzida para português
      instruments: data.instruments || prev.instruments,
      imslpCategories: data.imslpCategories || prev.imslpCategories,
      dataSource: dataSource,

      // Determinar época automaticamente baseada no ano de nascimento
      epochId: determineEpochId(data.epochName, epochs) || prev.epochId,
      primaryRoleId:
        determinePrimaryRoleId(data.primaryRole, roles) || prev.primaryRoleId,
    }));

    // Log das melhorias aplicadas
    console.log('📊 Dados extraídos com melhorias:');
    console.log(`   - Nome: ${data.name} | Nome completo: ${data.fullName}`);
    console.log(`   - Nacionalidade: ${data.nationality || 'Não encontrada'}`);
    console.log(`   - Data nascimento: ${data.birthDate || 'Não encontrada'}`);
    console.log(`   - Data morte: ${data.deathDate || 'Não encontrada'}`);
    console.log(
      `   - Época determinada: ${data.epochName || 'Não determinada'}`
    );
    console.log(
      `   - Qualidade da página: ${data.pageQuality} (${data.dataCompleteness}%)`
    );
  };

  // Função auxiliar para determinar ID da época baseada no nome
  const determineEpochId = (
    epochName: string | undefined,
    epochs: Array<{ id: string; name: string }>
  ): string | null => {
    if (!epochName) return null;

    const epoch = epochs.find(
      (e) => e.name.toLowerCase() === epochName.toLowerCase()
    );
    if (epoch) {
      console.log(`🎼 Época encontrada: ${epochName} (ID: ${epoch.id})`);
      return epoch.id;
    }

    console.log(`⚠️ Época não encontrada: ${epochName}`);
    return null;
  };

  // Função auxiliar para determinar ID do papel baseado no nome
  const determinePrimaryRoleId = (
    roleName: string | undefined,
    roles: Array<{ id: string; name: string }>
  ): string | null => {
    if (!roleName) return null;

    const role = roles.find(
      (r) => r.name.toLowerCase() === roleName.toLowerCase()
    );
    if (role) {
      console.log(`👨‍🎼 Papel encontrado: ${roleName} (ID: ${role.id})`);
      return role.id;
    }

    // Padrão para Compositor se não encontrar
    const composerRole = roles.find(
      (r) => r.name.toLowerCase() === 'compositor'
    );
    if (composerRole) {
      console.log(
        `👨‍🎼 Usando papel padrão: Compositor (ID: ${composerRole.id})`
      );
      return composerRole.id;
    }

    console.log(`⚠️ Papel não encontrado: ${roleName}`);
    return null;
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
                <FiUser className="w-5 h-5 text-theme-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-primary classical-title">
                  {editingComposer ? 'Editar Compositor' : 'Novo Compositor'}
                </h2>
                <p className="text-theme-secondary text-sm">
                  {editingComposer
                    ? 'Atualize as informações do compositor'
                    : 'Adicione um novo compositor à enciclopédia'}
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
                      Extrair Dados de Fonte Externa
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Seleção de Fonte */}
                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Tipo de Fonte
                    </label>
                    <Select
                      options={[
                        {
                          value: 'none',
                          label: 'Nenhuma (inserir manualmente)',
                        },
                        { value: 'imslp', label: 'IMSLP' },
                        { value: 'wikipedia', label: 'Wikipedia' },
                      ]}
                      value={dataSource}
                      onChange={(e) =>
                        setDataSource(e.target.value as DataSource)
                      }
                      className="w-full"
                    />
                  </div>

                  {/* URL Input */}
                  {dataSource !== 'none' && (
                    <div>
                      <Input
                        label={`URL do ${
                          dataSource === 'imslp' ? 'IMSLP' : 'Wikipedia'
                        }`}
                        value={urlToScrape}
                        onChange={(e) => setUrlToScrape(e.target.value)}
                        placeholder={
                          dataSource === 'imslp'
                            ? 'https://imslp.org/wiki/Category:Mozart,_Wolfgang_Amadeus'
                            : 'https://en.wikipedia.org/wiki/Wolfgang_Amadeus_Mozart'
                        }
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
                              Compositor já existe!
                            </span>
                          </div>
                          <p className="text-sm text-red-700">
                            Já existe um compositor com este link:{' '}
                            <strong>{duplicateCheck.composer?.fullName}</strong>
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
                    label="Nome *"
                    ref={fieldRefs.name}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={errors.name}
                    placeholder="Mozart"
                  />

                  <Input
                    label="Nome Completo *"
                    ref={fieldRefs.fullName}
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange('fullName', e.target.value)
                    }
                    error={errors.fullName}
                    placeholder="Wolfgang Amadeus Mozart"
                  />

                  <Input
                    label="Nome Alternativo"
                    value={formData.otherName}
                    onChange={(e) =>
                      handleInputChange('otherName', e.target.value)
                    }
                    placeholder="Outro nome conhecido"
                  />

                  <Input
                    label="Nacionalidade"
                    ref={fieldRefs.nationality}
                    value={formData.nationality}
                    onChange={(e) =>
                      handleInputChange('nationality', e.target.value)
                    }
                    placeholder="Austríaco"
                  />

                  <Input
                    label="Nomes Alternativos"
                    value={formData.alternativeNames}
                    onChange={(e) =>
                      handleInputChange('alternativeNames', e.target.value)
                    }
                    placeholder="Separados por vírgula"
                  />

                  <Input
                    label="Pseudônimos"
                    value={formData.pseudonyms}
                    onChange={(e) =>
                      handleInputChange('pseudonyms', e.target.value)
                    }
                    placeholder="Separados por vírgula"
                  />
                </div>
              </AnimatedCard>

              {/* Dates - MELHORADO COM INPUTS DE DATA */}
              <AnimatedCard className="classical-card-simple p-4" hover="none">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiCalendar className="w-5 h-5" />
                  <span>Datas</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Data de Nascimento
                    </label>
                    <input
                      ref={fieldRefs.birthDate}
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) =>
                        handleInputChange('birthDate', e.target.value)
                      }
                      className={`input-classical-2 w-full ${
                        errors.birthDate ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.birthDate && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.birthDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Data de Morte
                    </label>
                    <input
                      ref={fieldRefs.deathDate}
                      type="date"
                      value={formData.deathDate}
                      onChange={(e) =>
                        handleInputChange('deathDate', e.target.value)
                      }
                      className={`input-classical-2 w-full ${
                        errors.deathDate ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.deathDate && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.deathDate}
                      </p>
                    )}
                    <p className="text-xs text-theme-tertiary mt-1">
                      Deixe vazio se ainda vivo
                    </p>
                  </div>
                </div>
              </AnimatedCard>

              {/* Image */}
              <AnimatedCard className="classical-card-simple p-6" hover="none">
                <h3 className="text-lg font-semibold text-theme-primary mb-6 flex items-center space-x-2">
                  <FiImage className="w-5 h-5" />
                  <span>Imagem do Compositor</span>
                </h3>

                <div className="flex justify-center">
                  <ComposerImageUpload
                    currentImage={formData.portraitUrl}
                    onImageUpload={handleImageUpload}
                    onImageChange={handleImageChange}
                    onImageUrlChange={(url) =>
                      setFormData((prev) => ({ ...prev, portraitUrl: url }))
                    }
                    size="xl"
                    isUploading={isUploadingImage}
                    fallbackText={
                      formData.fullName || formData.name || 'Compositor'
                    }
                    showRemove={!!formData.portraitUrl}
                    composerName={formData.fullName || formData.name}
                  />
                </div>
              </AnimatedCard>

              {/* Classification */}
              <AnimatedCard className="classical-card-simple p-4" hover="none">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiTag className="w-5 h-5" />
                  <span>Classificação</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Papel Principal *
                    </label>
                    <Select
                      ref={fieldRefs.primaryRoleId}
                      options={[
                        { value: '', label: 'Selecione um papel' },
                        ...roles.map((role) => ({
                          value: role.id,
                          label: role.name,
                        })),
                      ]}
                      value={formData.primaryRoleId}
                      onChange={(e) =>
                        handleInputChange('primaryRoleId', e.target.value)
                      }
                      error={errors.primaryRoleId}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Papéis Secundários
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {roles.map((role) => (
                        <div
                          key={role.id}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={`role-${role.id}`}
                            checked={formData.secondaryRoles.includes(role.id)}
                            onChange={(e) =>
                              handleSecondaryRolesChange(
                                role.id,
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 text-brand-primary bg-theme-secondary border-theme-tertiary rounded focus:ring-brand-primary"
                          />
                          <label
                            htmlFor={`role-${role.id}`}
                            className="text-sm text-theme-primary"
                          >
                            {role.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Input
                    label="Instrumentos"
                    value={formData.instruments}
                    onChange={(e) =>
                      handleInputChange('instruments', e.target.value)
                    }
                    placeholder="Piano, Violino, Orquestra"
                  />

                  <Input
                    label="Categorias IMSLP"
                    value={formData.imslpCategories}
                    onChange={(e) =>
                      handleInputChange('imslpCategories', e.target.value)
                    }
                    placeholder="Romantic composers, German composers"
                  />
                </div>
              </AnimatedCard>

              {/* External Links */}
              <AnimatedCard className="classical-card-simple p-4" hover="none">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiGlobe className="w-5 h-5" />
                  <span>Links Externos</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Link da Wikipedia"
                    value={formData.wikipediaLink}
                    onChange={(e) =>
                      handleInputChange('wikipediaLink', e.target.value)
                    }
                    placeholder="https://en.wikipedia.org/wiki/..."
                    leftIcon={<FiExternalLink />}
                  />

                  <div className="md:col-span-2">
                    <Input
                      label="Links Externos"
                      value={formData.externalLinks}
                      onChange={(e) =>
                        handleInputChange('externalLinks', e.target.value)
                      }
                      placeholder="Links separados por vírgula"
                    />
                  </div>
                </div>
              </AnimatedCard>

              {/* Biography */}
              <AnimatedCard className="classical-card-simple p-4" hover="none">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiUser className="w-5 h-5" />
                  <span>Biografia</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Biografia
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className="input-classical-2 w-full resize-none"
                      placeholder="Breve biografia do compositor..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Informações Detalhadas
                    </label>
                    <textarea
                      value={formData.diverseInfo}
                      onChange={(e) =>
                        handleInputChange('diverseInfo', e.target.value)
                      }
                      rows={4}
                      className="input-classical-2 w-full resize-none"
                      placeholder="Informações detalhadas e diversas..."
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
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Salvando...'
                    : editingComposer
                    ? 'Atualizar Compositor'
                    : 'Criar Compositor'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </AnimatedItem>
    </Modal>
  );
};

export default CreateComposerModal;
