// CreateComposerModal.tsx - TRADUZIDO
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
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
  FiLock,
  FiPlay,
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
import NationalitySelect from '@/app/components/NationalitySelect';
import {
  useFormValidation,
  composerModalValidations,
} from '@/app/utils/formUtils';

import { useToast } from '@/app/hooks/useToast';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useSmartFormChanges } from '@/app/hooks/useFormChanges';
import Checkbox from '@/app/components/Common/Checkbox';
import { translateEpochWithHook } from '@/app/utils/translations/epochTranslationComposer';

interface DuplicateCheckState {
  loading: boolean;
  found: boolean;
  composer?: {
    id: string;
    name: string;
    fullName: string;
    alternativeNames?: string;
    portraitUrl?: string;
    imslpId?: string;
    wikipediaLink?: string;
    epochName?: string;
    nationality?: string;
    birthDate?: string;
    deathDate?: string;
    epoch?: {
      name: string;
    };
  };
  reason?: string;
  matchDetails?: string;
}

interface CreateComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  epochs: Array<{ id: string; name: string }>;
  roles: Array<{ id: string; name: string }>;
  editingComposer?: any;
}

type DataSource = 'none' | 'imslp' | 'wikipedia';

const extractDateFromExtendedFormat = (dateString: string): string | null => {
  if (!dateString) return null;

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

  const patterns = [
    /(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/i,
    /(\d{1,2})\s+(\w+)\s+(\d{4})/i,
    /(\w+)\s+(\d{1,2}),?\s+(\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = dateString.match(pattern);
    if (match) {
      if (pattern.source.includes('de\\s+')) {
        const day = match[1];
        const monthName = match[2].toLowerCase();
        const year = match[3];
        const month = monthsMap[monthName];
        if (month) {
          return `${year}-${month}-${day.padStart(2, '0')}`;
        }
      } else {
        let day, monthName, year;
        if (/^\d/.test(match[1])) {
          day = match[1];
          monthName = match[2].toLowerCase();
          year = match[3];
        } else {
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

const formatDateForInput = (dateString: string | null): string => {
  if (!dateString) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const dateFromText = extractDateFromExtendedFormat(dateString);
  if (dateFromText) {
    return dateFromText;
  }

  const yearMatch = dateString.match(/(\d{4})/);
  if (yearMatch) {
    return `${yearMatch[1]}-01-01`;
  }

  return '';
};

const CreateComposerModal = ({
  isOpen,
  onClose,
  epochs,
  roles,
  editingComposer,
}: CreateComposerModalProps) => {
  const router = useRouter();
  const { t } = useTranslation({ sections: ['pages/uploads'] });
  const toast = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrapingUrl, setScrapingUrl] = useState(false);
  const [urlToScrape, setUrlToScrape] = useState('');
  const [dataSource, setDataSource] = useState<DataSource>('none');
  const [scrapingResult, setScrapingResult] = useState<any>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isEditingExternalSource, setIsEditingExternalSource] = useState(false);

  const [duplicateCheck, setDuplicateCheck] = useState<DuplicateCheckState>({
    loading: false,
    found: false,
  });

  const fieldRefs = {
    name: useRef<HTMLInputElement>(null),
    fullName: useRef<HTMLInputElement>(null),
    epochId: useRef<HTMLSelectElement>(null),
    primaryRoleId: useRef<HTMLSelectElement>(null),
    birthDate: useRef<HTMLInputElement>(null),
    deathDate: useRef<HTMLInputElement>(null),
    nationality: useRef<HTMLDivElement>(null),
  };

  const [formData, setFormData] = useState({
    name: '',
    fullName: '',
    alternativeNames: '',
    birthDate: '',
    deathDate: '',
    portraitUrl: '',
    epochId: '',
    epochName: '',
    bio: '',
    imslpId: '',
    permLinkImslp: '',
    wikipediaLink: '',
    videoUrl: '',
    nationality: '',
    instruments: '',
    imslpCategories: '',
    primaryRoleId: '685d591c1e3db0c5aaa893e4',
    roles: [] as string[],
    dataSource: 'none' as DataSource,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const requiredFields = ['name', 'fullName', 'epochId', 'primaryRoleId'];
  const customValidations = composerModalValidations;

  const originalData = useMemo(() => {
    if (!editingComposer) return null;

    let detectedSource: DataSource = 'none';
    if (editingComposer.imslpId || editingComposer.permLinkImslp) {
      detectedSource = 'imslp';
      setIsEditingExternalSource(true);
    } else if (editingComposer.wikipediaLink) {
      detectedSource = 'wikipedia';
      setIsEditingExternalSource(true);
    }

    return {
      name: editingComposer.name || '',
      fullName: editingComposer.fullName || '',
      alternativeNames: editingComposer.alternativeNames || '',
      birthDate: formatDateForInput(editingComposer.birthDate),
      deathDate: formatDateForInput(editingComposer.deathDate),
      portraitUrl: editingComposer.portraitUrl || '',
      epochId: editingComposer.epochId || '',
      epochName: editingComposer.epochName || '',
      bio: editingComposer.bio || '',
      imslpId: editingComposer.imslpId || '',
      permLinkImslp: editingComposer.permLinkImslp || '',
      wikipediaLink: editingComposer.wikipediaLink || '',
      videoUrl: editingComposer.videoUrl || '',
      nationality: editingComposer.nationality || '',
      instruments: editingComposer.instruments || '',
      imslpCategories: editingComposer.imslpCategories || '',
      primaryRoleId: editingComposer.primaryRoleId || '',
      roles: editingComposer.roles
        ? editingComposer.roles.split(', ').filter(Boolean)
        : [],
      dataSource: detectedSource,
    };
  }, [editingComposer]);

  const { validateForm } = useFormValidation(
    fieldRefs,
    requiredFields,
    customValidations
  );

  const dataSourceOptions = [
    { value: 'none', label: t('modal_composer_scraping_source_none') },
    { value: 'imslp', label: 'IMSLP' },
    { value: 'wikipedia', label: 'Wikipedia' },
  ];

  // Populate form when editing
  useEffect(() => {
    if (editingComposer) {
      let detectedSource: DataSource = 'none';
      let detectedUrl = '';

      if (editingComposer.imslpId || editingComposer.permLinkImslp) {
        detectedSource = 'imslp';
        detectedUrl =
          editingComposer.permLinkImslp ||
          `https://imslp.org/wiki/${editingComposer.imslpId}`;
        setIsEditingExternalSource(true);
      } else if (editingComposer.wikipediaLink) {
        detectedSource = 'wikipedia';
        detectedUrl = editingComposer.wikipediaLink;
        setIsEditingExternalSource(true);
      }

      setDataSource(detectedSource);
      setUrlToScrape(detectedUrl);

      setFormData({
        name: editingComposer.name || '',
        fullName: editingComposer.fullName || '',
        alternativeNames: editingComposer.alternativeNames || '',
        birthDate: formatDateForInput(editingComposer.birthDate),
        deathDate: formatDateForInput(editingComposer.deathDate),
        portraitUrl: editingComposer.portraitUrl || '',
        epochId: editingComposer.epochId || '',
        epochName: editingComposer.epochName || '',
        bio: editingComposer.bio || '',
        imslpId: editingComposer.imslpId || '',
        permLinkImslp: editingComposer.permLinkImslp || '',
        wikipediaLink: editingComposer.wikipediaLink || '',
        videoUrl: editingComposer.videoUrl || '',
        nationality: editingComposer.nationality || '',
        instruments: editingComposer.instruments || '',
        imslpCategories: editingComposer.imslpCategories || '',
        primaryRoleId: editingComposer.primaryRoleId || '',
        roles: editingComposer.roles
          ? editingComposer.roles.split(', ').filter(Boolean)
          : [],
        dataSource: detectedSource,
      });
    }
  }, [editingComposer]);

  const hasChanges = useSmartFormChanges(formData, originalData, [
    'primaryRoleId',
    'dataSource',
  ]);

  const formatDateForSave = (dateString: string): string => {
    if (!dateString) return '';

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }

    return dateString;
  };

  const cleanName = (name: string): string => {
    return name.replace(/[(),]/g, '').replace(/_/g, ' ').replace(/\s+/g, ' ');
  };

  const checkDuplicateByLink = async (
    url: string,
    source: DataSource,
    composerFullName?: string
  ) => {
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
          fullName: cleanName(composerFullName || formData.fullName || ''),
        }),
      });

      const data = await response.json();

      if (data.found) {
        setDuplicateCheck({
          loading: false,
          found: true,
          composer: data.composer,
          reason: data.reason,
          matchDetails: data.matchDetails,
        });
        return true;
      } else {
        setDuplicateCheck({ loading: false, found: false });
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao verificar duplicata:', error);
      setDuplicateCheck({ loading: false, found: false });
      return false;
    }
  };

  const handleInputChange = (
    field: string,
    value: string | boolean | string[]
  ) => {
    if (dataSource !== 'none' && (field === 'name' || field === 'fullName')) {
      value = cleanName(value as string);
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleNationalityChange = (nationality: string) => {
    setFormData((prev) => ({ ...prev, nationality }));
    if (errors.nationality) {
      setErrors((prev) => ({ ...prev, nationality: '' }));
    }
  };

  const handleSecondaryRolesChange = (roleId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      roles: checked
        ? [...prev.roles, roleId]
        : prev.roles.filter((id) => id !== roleId),
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
        toast.success('Sucesso', 'Imagem carregada com sucesso!');
      } else {
        throw new Error(result.message || 'Erro ao fazer upload');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error(
        'Erro no Upload',
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

    if (!isEditingExternalSource) {
      if (
        formData.permLinkImslp &&
        (await checkDuplicateByLink(formData.permLinkImslp, 'imslp'))
      ) {
        toast.error(
          'Duplicata Encontrada',
          'Já existe um compositor com este link do IMSLP.'
        );
        return;
      }

      if (
        formData.imslpId &&
        (await checkDuplicateByLink(formData.imslpId, 'imslp'))
      ) {
        toast.error(
          'Duplicata Encontrada',
          'Já existe um compositor com este ID do IMSLP.'
        );
        return;
      }

      if (
        formData.wikipediaLink &&
        (await checkDuplicateByLink(formData.wikipediaLink, 'wikipedia'))
      ) {
        toast.error(
          'Duplicata Encontrada',
          'Já existe um compositor com este link da Wikipedia.'
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const url = editingComposer
        ? `/api/uploads/composer/${editingComposer.id}`
        : '/api/uploads/composer';

      const method = editingComposer ? 'PUT' : 'POST';

      const dataToSend = {
        ...formData,
        birthDate: formatDateForSave(formData.birthDate),
        deathDate: formatDateForSave(formData.deathDate),
        roles: formData.roles.join(', '),
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
        toast.success(
          editingComposer ? 'Compositor Atualizado' : 'Compositor Criado',
          data.message || 'Compositor salvo com sucesso!'
        );
      } else {
        throw new Error(data.error || 'Erro ao salvar compositor');
      }
    } catch (error) {
      console.error('Erro ao salvar compositor:', error);
      toast.error(
        'Erro ao Salvar',
        error instanceof Error ? error.message : 'Erro ao salvar compositor'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScrapeUrl = async () => {
    if (!urlToScrape.trim()) {
      toast.warning('URL Necessária', 'Digite uma URL para fazer scraping');
      return;
    }

    if (dataSource === 'none') {
      toast.warning(
        'Tipo de Fonte',
        'Selecione o tipo de fonte (IMSLP ou Wikipedia)'
      );
      return;
    }

    const isDuplicate = await checkDuplicateByLink(urlToScrape, dataSource);
    if (isDuplicate) {
      const reasonText =
        duplicateCheck.reason === 'nome'
          ? t('modal_composer_scraping_duplicate_reason_name')
          : duplicateCheck.reason === 'link do IMSLP'
          ? t('modal_composer_scraping_duplicate_reason_imslp')
          : t('modal_composer_scraping_duplicate_reason_wikipedia');

      toast.error(
        'Compositor Já Existe',
        `Já existe um compositor com esse ${reasonText}: ${duplicateCheck.composer?.fullName}`
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
        toast.success(
          'Dados Extraídos',
          `Informações extraídas com ${data.data.dataCompleteness}% de completude`
        );
      } else {
        throw new Error(data.error || 'Erro ao fazer scraping');
      }
    } catch (error) {
      console.error('Erro ao fazer scraping:', error);
      toast.error(
        'Erro no Scraping',
        error instanceof Error ? error.message : 'Erro ao fazer scraping'
      );
    } finally {
      setScrapingUrl(false);
    }
  };

  const fillFromScrapingResult = (data: any) => {
    setFormData((prev) => ({
      ...prev,
      name: cleanName(data.name || prev.name),
      fullName: cleanName(data.fullName || prev.fullName),
      alternativeNames: data.alternativeNames || prev.alternativeNames,
      birthDate: data.birthDate || prev.birthDate,
      deathDate: data.deathDate || prev.deathDate,
      portraitUrl: data.portraitUrl || prev.portraitUrl,
      bio: data.bio || prev.bio,
      imslpId: data.imslpId || prev.imslpId,
      permLinkImslp: data.permLinkImslp || prev.permLinkImslp,
      wikipediaLink: data.wikipediaLink || prev.wikipediaLink,
      videoUrl: data.videoUrl || prev.videoUrl,
      nationality: data.nationality || prev.nationality,
      instruments: data.instruments || prev.instruments,
      imslpCategories: data.imslpCategories || prev.imslpCategories,
      dataSource: dataSource,
      epochId: determineEpochId(data.epochName, epochs) || prev.epochId,
      epochName: data.epochName || prev.epochName,
      primaryRoleId:
        determinePrimaryRoleId(data.primaryRole, roles) || prev.primaryRoleId,
    }));
  };

  const determineEpochId = (
    epochName: string | undefined,
    epochs: Array<{ id: string; name: string }>
  ): string | null => {
    if (!epochName) return null;

    const epoch = epochs.find(
      (e) => e.name.toLowerCase() === epochName.toLowerCase()
    );
    if (epoch) {
      return epoch.id;
    }

    return null;
  };

  const determinePrimaryRoleId = (
    roleName: string | undefined,
    roles: Array<{ id: string; name: string }>
  ): string | null => {
    if (!roleName) return null;

    const role = roles.find(
      (r) => r.name.toLowerCase() === roleName.toLowerCase()
    );
    if (role) {
      return role.id;
    }

    const composerRole = roles.find(
      (r) => r.name.toLowerCase() === 'compositor'
    );
    if (composerRole) {
      return composerRole.id;
    }

    return null;
  };

  const isFieldLocked = (field: 'wikipediaLink' | 'permLinkImslp'): boolean => {
    if (field === 'wikipediaLink' && dataSource === 'wikipedia') return true;
    if (field === 'permLinkImslp' && dataSource === 'imslp') return true;

    return false;
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (editingComposer && originalData) {
          setFormData(originalData);
        }
        onClose();
      }}
      maxWidth="4xl"
      showCloseButton={true}
      confirmOnClose={true}
      hasChanges={hasChanges}
      isProcessing={isSubmitting}
      processName="criação do compositor"
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
                  {editingComposer
                    ? t('modal_composer_title_edit')
                    : t('modal_composer_title_create')}
                </h2>
                <p className="text-theme-secondary text-sm">
                  {editingComposer
                    ? t('modal_composer_subtitle_edit')
                    : t('modal_composer_subtitle_create')}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mt-4 ">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* URL Scraping */}
              <AnimatedCard className="classical-card-simple p-4" hover="none">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FiDatabase className="w-4 h-4 text-theme-tertiary" />
                    <span className="text-sm font-medium text-theme-primary">
                      {t('modal_composer_scraping_title')}
                    </span>
                    {isEditingExternalSource && (
                      <div className="flex items-center space-x-1 text-xs text-theme-primary font-bold">
                        <FiLock className="w-3 h-3" />
                        <span>{t('modal_composer_scraping_detected')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      {t('modal_composer_scraping_source_type')}
                    </label>
                    <Select
                      options={dataSourceOptions}
                      value={dataSource}
                      onChange={(e) =>
                        setDataSource(e.target.value as DataSource)
                      }
                      className="w-full"
                      disabled={isEditingExternalSource}
                    />
                  </div>

                  {dataSource !== 'none' && (
                    <div>
                      <Input
                        label={
                          dataSource === 'imslp'
                            ? t('modal_composer_scraping_url_imslp')
                            : t('modal_composer_scraping_url_wikipedia')
                        }
                        value={urlToScrape}
                        onChange={(e) => setUrlToScrape(e.target.value)}
                        placeholder={
                          dataSource === 'imslp'
                            ? 'https://imslp.org/wiki/Category:Mozart,_Wolfgang_Amadeus'
                            : 'https://en.wikipedia.org/wiki/Wolfgang_Amadeus_Mozart'
                        }
                        leftIcon={<FiLink />}
                        disabled={isEditingExternalSource}
                      />

                      {duplicateCheck.loading && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FiLoader className="w-4 h-4 animate-spin text-theme-primary font-bold" />
                            <span className="text-sm text-blue-800">
                              {t('modal_composer_scraping_checking_duplicates')}
                            </span>
                          </div>
                        </div>
                      )}

                      {duplicateCheck.found && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <FiAlertCircle className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium text-red-800">
                              {t('modal_composer_scraping_duplicate_found')}
                            </span>
                          </div>
                          <div className="text-sm text-red-700">
                            <p className="mb-1">
                              <strong>
                                {t('modal_composer_scraping_duplicate_reason', {
                                  reason:
                                    duplicateCheck.reason === 'nome'
                                      ? t(
                                          'modal_composer_scraping_duplicate_reason_name'
                                        )
                                      : duplicateCheck.reason ===
                                        'link do IMSLP'
                                      ? t(
                                          'modal_composer_scraping_duplicate_reason_imslp'
                                        )
                                      : t(
                                          'modal_composer_scraping_duplicate_reason_wikipedia'
                                        ),
                                })}
                              </strong>
                            </p>
                            <p className="mb-1">
                              {duplicateCheck.composer?.fullName} && (
                              <strong>
                                {t(
                                  'modal_composer_scraping_duplicate_composer',
                                  {
                                    composer: `${duplicateCheck.composer?.fullName}`,
                                  }
                                )}
                              </strong>
                              )
                            </p>
                            {duplicateCheck.composer?.nationality && (
                              <p className="mb-1">
                                <strong>
                                  {t(
                                    'modal_composer_scraping_duplicate_nationality',
                                    {
                                      nationality:
                                        duplicateCheck.composer.nationality,
                                    }
                                  )}
                                </strong>
                              </p>
                            )}
                            {(duplicateCheck.composer?.birthDate ||
                              duplicateCheck.composer?.deathDate) && (
                              <p>
                                <strong>
                                  {t(
                                    'modal_composer_scraping_duplicate_period',
                                    {
                                      birthDate:
                                        duplicateCheck.composer.birthDate ||
                                        '?',
                                      deathDate:
                                        duplicateCheck.composer.deathDate ||
                                        '?',
                                    }
                                  )}
                                </strong>
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {!isEditingExternalSource && (
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
                            disabled={scrapingUrl}
                          >
                            {scrapingUrl
                              ? t('modal_composer_scraping_extracting')
                              : t('modal_composer_scraping_extract_button')}
                          </Button>
                        </div>
                      )}

                      {scrapingResult && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <FiCheck className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">
                              {t('modal_composer_scraping_success')}
                            </span>
                          </div>
                          <div className="text-xs text-green-700">
                            {t('modal_composer_scraping_quality', {
                              source: scrapingResult.source,
                              quality: scrapingResult.data.pageQuality,
                              completeness:
                                scrapingResult.data.dataCompleteness,
                            })}
                          </div>
                        </div>
                      )}

                      {isEditingExternalSource && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FiInfo className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-blue-800">
                              {t('modal_composer_scraping_external_edit', {
                                source:
                                  dataSource === 'imslp'
                                    ? 'IMSLP'
                                    : 'Wikipedia',
                              })}
                            </span>
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
                  <span>{t('modal_composer_basic_title')}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={`${t('modal_composer_basic_name')} *`}
                    ref={fieldRefs.name}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={errors.name}
                    placeholder="Mozart"
                  />

                  <Input
                    label={`${t('modal_composer_basic_full_name')} *`}
                    ref={fieldRefs.fullName}
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange('fullName', e.target.value)
                    }
                    error={errors.fullName}
                    placeholder="Wolfgang Amadeus Mozart"
                  />
                  <Input
                    label={t('modal_composer_basic_alt_names')}
                    value={formData.alternativeNames}
                    onChange={(e) =>
                      handleInputChange('alternativeNames', e.target.value)
                    }
                    placeholder={t(
                      'modal_composer_basic_alt_names_placeholder'
                    )}
                  />

                  <div ref={fieldRefs.nationality}>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      {t('modal_composer_basic_nationality')}
                    </label>
                    <NationalitySelect
                      value={formData.nationality}
                      onChange={handleNationalityChange}
                      error={errors.nationality}
                      placeholder={t(
                        'modal_composer_basic_nationality_placeholder'
                      )}
                    />
                  </div>
                </div>
              </AnimatedCard>

              {/* Dates */}
              <AnimatedCard className="classical-card-simple p-4" hover="none">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiCalendar className="w-5 h-5" />
                  <span>{t('modal_composer_dates_title')}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      {t('modal_composer_dates_birth')}
                    </label>
                    <Input
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      {t('modal_composer_dates_death')}
                    </label>
                    <Input
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

                    <p className="text-xs text-theme-tertiary mt-1">
                      {t('modal_composer_dates_death_note')}
                    </p>
                  </div>
                </div>
              </AnimatedCard>

              {/* Image */}
              <AnimatedCard className="classical-card-simple p-6" hover="none">
                <h3 className="text-lg font-semibold text-theme-primary mb-6 flex items-center space-x-2">
                  <FiImage className="w-5 h-5" />
                  <span>{t('modal_composer_image_title')}</span>
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
              <AnimatedCard className="classical-card-simple p-4 " hover="none">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiTag className="w-5 h-5" />
                  <span>{t('modal_composer_classification_title')}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 space-y-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      {t('modal_composer_classification_epoch')} *
                    </label>
                    <Select
                      ref={fieldRefs.epochId}
                      options={[
                        {
                          value: '',
                          label: t(
                            'modal_composer_classification_epoch_placeholder'
                          ),
                        },
                        ...epochs.map((epoch) => ({
                          value: epoch.id,
                          label: translateEpochWithHook(epoch.name, t),
                        })),
                      ]}
                      value={formData.epochId}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        const selectedOption = [
                          {
                            value: '',
                            label: t(
                              'modal_composer_classification_epoch_placeholder'
                            ),
                          },
                          ...epochs.map((epoch) => ({
                            value: epoch.id,
                            label: epoch.name,
                          })),
                        ].find((opt) => opt.value === selectedValue);

                        const selectedLabel = selectedOption?.label;

                        handleInputChange('epochId', selectedValue);
                        handleInputChange(
                          'epochName',
                          selectedLabel ?? 'Desconhecido'
                        );
                      }}
                      error={errors.epochId}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      {t('modal_composer_classification_primary_role')} *
                    </label>
                    <Select
                      ref={fieldRefs.primaryRoleId}
                      options={[
                        {
                          value: '',
                          label: t(
                            'modal_composer_classification_primary_role_placeholder'
                          ),
                        },
                        ...roles.map((role) => ({
                          value: role.id,
                          label: role.name,
                        })),
                      ]}
                      value={formData.primaryRoleId}
                      onChange={(e) =>
                        handleInputChange('primaryRoleId', e.target.value)
                      }
                      defaultValue={'Compositor'}
                      error={errors.primaryRoleId}
                    />
                  </div>

                  <div className="md:col-span-2 space-x-4">
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      {t('modal_composer_classification_secondary_roles')}
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3  gap-2">
                      {roles.map((role) => (
                        <div
                          key={role.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            type="checkbox"
                            id={`role-${role.id}`}
                            checked={formData.roles.includes(role.id)}
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

                  <div className="col-span-2">
                    <Input
                      label={t('modal_composer_classification_instruments')}
                      value={formData.instruments}
                      onChange={(e) =>
                        handleInputChange('instruments', e.target.value)
                      }
                      placeholder={t(
                        'modal_composer_classification_instruments_placeholder'
                      )}
                    />

                    <Input
                      value={formData.imslpCategories}
                      onChange={(e) =>
                        handleInputChange('imslpCategories', e.target.value)
                      }
                      placeholder="Romantic composers, German composers"
                      className="hidden"
                    />
                  </div>
                </div>
              </AnimatedCard>

              {/* External Links */}
              <AnimatedCard className="classical-card-simple p-4" hover="none">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiGlobe className="w-5 h-5" />
                  <span>{t('modal_composer_external_title')}</span>
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  {/* Wikipedia Link */}
                  <div className="relative">
                    <Input
                      label={t('modal_composer_external_wikipedia')}
                      value={formData.wikipediaLink}
                      onChange={(e) =>
                        handleInputChange('wikipediaLink', e.target.value)
                      }
                      placeholder="https://en.wikipedia.org/wiki/..."
                      leftIcon={<FiExternalLink />}
                      disabled={isFieldLocked('wikipediaLink')}
                      className={
                        isFieldLocked('wikipediaLink')
                          ? 'bg-gray-50 cursor-not-allowed'
                          : ''
                      }
                    />
                    {isFieldLocked('wikipediaLink') && (
                      <div className="mt-1 flex items-center space-x-1 text-xs text-theme-primary font-bold">
                        <FiLock className="w-3 h-3" />
                        <span>
                          {t('modal_composer_external_field_locked', {
                            source: 'Wikipedia',
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* IMSLP Link */}
                  <div className="relative">
                    <Input
                      label={t('modal_composer_external_imslp')}
                      value={formData.permLinkImslp}
                      onChange={(e) =>
                        handleInputChange('permLinkImslp', e.target.value)
                      }
                      placeholder="https://imslp.org/wiki/Category:Mozart,_Wolfgang_Amadeus"
                      leftIcon={<FiExternalLink />}
                      disabled={isFieldLocked('permLinkImslp')}
                      className={
                        isFieldLocked('permLinkImslp')
                          ? 'bg-gray-50 cursor-not-allowed'
                          : ''
                      }
                    />
                    {isFieldLocked('permLinkImslp') && (
                      <div className="mt-1 flex items-center space-x-1 text-xs text-theme-primary font-bold">
                        <FiLock className="w-3 h-3" />
                        <span>
                          {t('modal_composer_external_field_locked', {
                            source: 'IMSLP',
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Video URL */}
                  <div>
                    <Input
                      label={t('modal_composer_external_video')}
                      value={formData.videoUrl}
                      onChange={(e) =>
                        handleInputChange('videoUrl', e.target.value)
                      }
                      placeholder="https://www.youtube.com/watch?v=... ou outro vídeo"
                      leftIcon={<FiPlay />}
                    />
                    <p className="text-xs text-theme-tertiary mt-1">
                      {t('modal_composer_external_video_description')}
                    </p>
                  </div>
                </div>
              </AnimatedCard>

              {/* Biography */}
              <AnimatedCard className="classical-card-simple p-4" hover="none">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiUser className="w-5 h-5" />
                  <span>{t('modal_composer_bio_title')}</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      {t('modal_composer_bio_title')}
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={7}
                      className="input-classical-2 w-full resize-none"
                      placeholder={t('modal_composer_bio_placeholder')}
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
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? t('form_saving')
                    : editingComposer
                    ? t('form_update') + ' Compositor'
                    : t('form_create') + ' Compositor'}
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
