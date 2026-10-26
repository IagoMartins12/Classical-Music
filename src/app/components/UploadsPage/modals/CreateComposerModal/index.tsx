// CreateComposerModal.tsx - TRADUZIDO - Versão Atualizada
'use client';

import { ENVIOS } from '@/app/conteudo/textos/envios';
import { useTextos } from '@/app/hooks/useTextos';
import { useState, useEffect, useRef, useMemo, useId } from 'react';
import { useRouter } from 'next/navigation';
import {
  PiFloppyDisk,
  PiLock,
  PiMagnifyingGlass,
  PiSparkle,
  PiTranslate,
} from 'react-icons/pi';
import { Aba, Abas } from '@/app/components/ui/Abas';
import { Button } from '@/app/components/ui/Button';
import { CaixaDeMarcar } from '@/app/components/ui/CaixaDeMarcar';
import { Field } from '@/app/components/ui/Field';
import { Selecao } from '@/app/components/ui/Selecao';
import {
  Aviso,
  FormBlock,
  FormSheet,
} from '@/app/components/site/edit/FormSheet';
import ComposerImageUpload from '../ComposerImageUpload';
import { Rotulado } from '@/app/components/ui/Rotulado';
import { SelecaoComBusca } from '@/app/components/ui/SelecaoComBusca';
import { SeletorDeData } from '@/app/components/ui/SeletorDeData';
import {
  canonicalNationality,
  nationalityOptions,
} from '@/app/conteudo/site/countries';
import {
  useFormValidation,
  composerModalValidations,
} from '@/app/utils/formUtils';

import { useToast } from '@/app/hooks/useToast';
import { useSmartFormChanges } from '@/app/hooks/useFormChanges';
import { translateEpochWithHook } from '@/app/utils/translations/epochTranslationComposer';
import {
  checkComposerDuplicateRequest,
  saveComposerRequest,
  uploadComposerImage,
} from '@/app/requests/uploads-client';
import { scrapeComposerPage } from '@/app/requests/external-sources';
import {
  draftComposerBiography,
  loadComposerBiographies,
  translateBiographyText,
} from '@/app/requests/composer-biography';
import { useTx } from '@/app/hooks/useTx';

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

// Mapeamento para tradução dos roles
const ROLE_TRANSLATIONS: Record<string, string> = {
  Compositor: 'Composer',
  Cantor: 'Singer',
  Libretista: 'Librettist',
  Arranjador: 'Arranger',
  Editor: 'Editor',
  Escritor: 'Writer',
  Tradutor: 'Translator',
  Desconhecido: 'Unknown',
};

// Função para traduzir role baseado no idioma
export const translateRole = (roleName: string, language: string): string => {
  if (language === 'en' && ROLE_TRANSLATIONS[roleName]) {
    return ROLE_TRANSLATIONS[roleName];
  }
  return roleName;
};

const CreateComposerModal = ({
  isOpen,
  onClose,
  epochs,
  roles,
  editingComposer,
}: CreateComposerModalProps) => {
  const tx = useTx();
  const idCampo = useId();
  const formId = `${idCampo}-form`;
  const router = useRouter();
  const { t, language } = useTextos(ENVIOS);
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
  const [biographyTab, setBiographyTab] = useState<'pt' | 'en'>('pt');
  const [biographies, setBiographies] = useState({
    pt: '',
    en: '',
  });
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [isTranslatingBio, setIsTranslatingBio] = useState(false);
  const [bioMessage, setBioMessage] = useState({ type: '', text: '' });

  const fieldRefs = {
    name: useRef<HTMLInputElement>(null),
    fullName: useRef<HTMLInputElement>(null),
    epochId: useRef<HTMLDivElement>(null),
    primaryRoleId: useRef<HTMLDivElement>(null),
    birthDate: useRef<HTMLDivElement>(null),
    deathDate: useRef<HTMLDivElement>(null),
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

  // 🆕 FUNÇÃO PARA GERAR BIOGRAFIA COM IA
  const handleGenerateBiography = async (lang: 'pt' | 'en') => {
    if (!formData.name || !formData.fullName) {
      toast.warning(
        tx('Campos obrigatórios', 'Required fields'),
        tx(
          'Preencha pelo menos o nome e nome completo antes de gerar biografia',
          'Fill in at least the name and full name before generating a biography'
        )
      );
      return;
    }

    setIsGeneratingBio(true);
    setBioMessage({ type: '', text: '' });

    try {
      // Rascunho a partir do formulário, sem gravar: vai junto ao salvar.
      const data = await draftComposerBiography(
        {
          name: formData.name,
          fullName: formData.fullName,
          alternativeNames: formData.alternativeNames,
          birthDate: formData.birthDate,
          deathDate: formData.deathDate,
          epochName: formData.epochName,
          roleName: roles.find((r) => r.id === formData.primaryRoleId)?.name,
          nationality: formData.nationality,
          instruments: formData.instruments,
        },
        lang
      );

      if (data.biography === null) {
        throw new Error(
          tx(
            'A IA não tem informação confiável sobre este compositor',
            'The AI has no reliable information about this composer'
          )
        );
      }

      setBiographies((prev) => ({
        ...prev,
        [lang]: data.biography,
      }));
      setBioMessage({
        type: 'success',
        text: tx(
          `Biografia em ${lang === 'pt' ? 'português' : 'inglês'} gerada.`,
          `${lang === 'pt' ? 'Portuguese' : 'English'} biography generated.`
        ),
      });
    } catch (error) {
      console.error('Erro ao gerar biografia:', error);
      setBioMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : tx('Erro ao gerar biografia', 'Could not generate the biography'),
      });
    } finally {
      setIsGeneratingBio(false);
    }
  };

  // 🆕 FUNÇÃO PARA TRADUZIR BIOGRAFIA
  const handleTranslateBiography = async (
    from: 'pt' | 'en',
    to: 'pt' | 'en'
  ) => {
    if (!biographies[from]) {
      setBioMessage({
        type: 'error',
        text: tx(
          `Não há biografia em ${from === 'pt' ? 'português' : 'inglês'} para traduzir`,
          `There is no ${from === 'pt' ? 'Portuguese' : 'English'} biography to translate`
        ),
      });
      return;
    }

    // A API traduz só do português para o inglês (o legado usava o Google
    // Tradutor nas duas direções).
    if (from !== 'pt' || to !== 'en') {
      setBioMessage({
        type: 'error',
        text: tx(
          'A tradução automática é só do português para o inglês',
          'Automatic translation only goes from Portuguese to English'
        ),
      });
      return;
    }

    setIsTranslatingBio(true);
    setBioMessage({ type: '', text: '' });

    try {
      const translatedText = await translateBiographyText(biographies[from]);

      setBiographies((prev) => ({
        ...prev,
        [to]: translatedText,
      }));
      setBioMessage({
        type: 'success',
        text: tx(
          'Biografia traduzida para inglês!',
          'Biography translated to English.'
        ),
      });
    } catch (error) {
      console.error('Erro ao traduzir biografia:', error);
      setBioMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : tx(
                'Erro ao traduzir biografia',
                'Could not translate the biography'
              ),
      });
    } finally {
      setIsTranslatingBio(false);
    }
  };

  // 🆕 FUNÇÃO PARA CARREGAR BIOGRAFIAS DO JSON
  const loadBiographiesFromJson = async (composerId: string) => {
    try {
      // As duas biografias vêm do compositor (`bio` e `bioEn`), não de JSON.
      const biographies = await loadComposerBiographies(composerId);

      setBiographies({
        pt: biographies.pt || formData.bio || '',
        en: biographies.en,
      });
    } catch (error) {
      console.error('Erro ao carregar biografias:', error);
      // Fallback para o bio do banco
      setBiographies({
        pt: formData.bio || '',
        en: '',
      });
    }
  };

  // 🆕 CARREGAR BIOGRAFIAS DO JSON QUANDO EDITAR
  useEffect(() => {
    if (editingComposer && isOpen) {
      loadBiographiesFromJson(editingComposer.id);
    }
  }, [editingComposer, isOpen]);

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
      birthDate: editingComposer.birthDate || '',
      deathDate: editingComposer.deathDate || '',
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
    t,
    customValidations
  );

  const dataSourceOptions = [
    { value: 'none', label: t('modal_composer_scraping_source_none') },
    { value: 'imslp', label: 'IMSLP' },
    { value: 'wikipedia', label: 'Wikipedia' },
  ];

  // Papéis secundários filtrados - excluir o papel principal
  const filteredSecondaryRoles = useMemo(() => {
    return roles.filter((role) => role.id !== formData.primaryRoleId);
  }, [roles, formData.primaryRoleId]);

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
        birthDate: editingComposer.birthDate || '',
        deathDate: editingComposer.deathDate || '',
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

  useEffect(() => {
    if (
      formData.primaryRoleId &&
      formData.roles.includes(formData.primaryRoleId)
    ) {
      setFormData((prev) => ({
        ...prev,
        roles: prev.roles.filter((roleId) => roleId !== formData.primaryRoleId),
      }));
    }
  }, [formData.primaryRoleId, formData.roles]);

  const hasChanges = useSmartFormChanges(formData, originalData, [
    'primaryRoleId',
    'dataSource',
  ]);

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
      const response = await checkComposerDuplicateRequest({
        url: url.trim(),
        source: source as 'imslp' | 'wikipedia',
        excludeId: editingComposer?.id,
        fullName: cleanName(composerFullName || formData.fullName || ''),
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
    // Não permitir selecionar o papel principal como secundário
    if (roleId === formData.primaryRoleId) {
      return;
    }

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
      const result = await uploadComposerImage(file, editingComposer?.id);

      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          portraitUrl: result.imageUrl,
        }));
        toast.success(
          t('toast_success'),
          t('toast_composer_image_upload_success')
        );
      } else {
        throw new Error(
          result.message || t('toast_composer_image_upload_error_message')
        );
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error(
        t('toast_composer_image_upload_error'),
        error instanceof Error
          ? error.message
          : t('toast_composer_image_upload_error_message')
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
          t('toast_composer_duplicate_found'),
          t('toast_composer_duplicate_imslp')
        );
        return;
      }

      if (
        formData.imslpId &&
        (await checkDuplicateByLink(formData.imslpId, 'imslp'))
      ) {
        toast.error(
          t('toast_composer_duplicate_found'),
          t('toast_composer_duplicate_imslp')
        );
        return;
      }

      if (
        formData.wikipediaLink &&
        (await checkDuplicateByLink(formData.wikipediaLink, 'wikipedia'))
      ) {
        toast.error(
          t('toast_composer_duplicate_found'),
          t('toast_composer_duplicate_wikipedia')
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const dataToSend = {
        ...formData,
        birthDate: formData.birthDate,
        deathDate: formData.deathDate,
        roles: formData.roles.join(', '),
        dataSource: formData.dataSource,
        bio: biographies.pt, // 🆕 Salvar bio PT no campo principal
        // A versão em inglês é campo do compositor (o legado a guardava num
        // JSON à parte, depois de salvar).
        bioEn: biographies.en,
      };

      const response = await saveComposerRequest(
        editingComposer?.id,
        dataToSend
      );

      const data = await response.json();

      if (response.ok) {
        router.refresh();
        onClose();
        toast.success(
          editingComposer
            ? t('toast_composer_updated')
            : t('toast_composer_created'),
          data.message || t('toast_composer_save_success')
        );
      } else {
        throw new Error(data.error || t('toast_composer_save_error_message'));
      }
    } catch (error) {
      console.error('Erro ao salvar compositor:', error);
      toast.error(
        t('toast_composer_save_error'),
        error instanceof Error
          ? error.message
          : t('toast_composer_save_error_message')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScrapeUrl = async () => {
    if (!urlToScrape.trim()) {
      toast.warning(
        t('toast_composer_url_required'),
        t('toast_composer_url_required_message')
      );
      return;
    }

    if (dataSource === 'none') {
      toast.warning(
        t('toast_composer_source_type_required'),
        t('toast_composer_source_type_required_message')
      );
      return;
    }

    const isDuplicate = await checkDuplicateByLink(urlToScrape, dataSource);
    if (isDuplicate) {
      const reasonText =
        duplicateCheck.reason === 'nome'
          ? t('toast_composer_duplicate_reason_name', {
              name: `${duplicateCheck.composer?.fullName}`,
            })
          : duplicateCheck.reason === tx('link do IMSLP', 'IMSLP link')
            ? t('toast_composer_duplicate_reason_imslp', {
                name: `${duplicateCheck.composer?.fullName}`,
              })
            : t('toast_composer_duplicate_reason_wikipedia', {
                name: `${duplicateCheck.composer?.fullName}`,
              });

      toast.error(t('toast_composer_duplicate_found'), reasonText);
      return;
    }

    setScrapingUrl(true);
    setScrapingResult(null);

    try {
      const page = await scrapeComposerPage(urlToScrape, dataSource);

      setScrapingResult({ success: true, data: page });
      fillFromScrapingResult(page);
      toast.success(
        t('toast_composer_data_extracted'),
        t('toast_composer_data_extracted_message', {
          completeness: page.dataCompleteness,
        })
      );
    } catch (error) {
      console.error('Erro ao fazer scraping:', error);
      toast.error(
        t('toast_composer_scraping_error'),
        error instanceof Error
          ? error.message
          : t('toast_composer_scraping_error_message')
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

  const titulo = editingComposer
    ? t('modal_composer_title_edit')
    : t('modal_composer_title_create');
  const fonte = dataSource === 'imslp' ? 'IMSLP' : 'Wikipedia';
  const motivo =
    duplicateCheck.reason === 'nome'
      ? t('modal_composer_scraping_duplicate_reason_name')
      : duplicateCheck.reason === tx('link do IMSLP', 'IMSLP link')
        ? t('modal_composer_scraping_duplicate_reason_imslp')
        : t('modal_composer_scraping_duplicate_reason_wikipedia');
  const fechar = () => {
    if (editingComposer && originalData) setFormData(originalData);
    onClose();
  };

  return (
    <FormSheet
      aberto={isOpen}
      aoFechar={fechar}
      titulo={titulo}
      descricao={
        editingComposer
          ? t('modal_composer_subtitle_edit')
          : t('modal_composer_subtitle_create')
      }
      sujo={hasChanges}
      ocupado={isSubmitting}
      rodape={
        <div className="flex justify-end gap-2">
          <Button variante="fantasma" onClick={fechar} disabled={isSubmitting}>
            {t('form_cancel')}
          </Button>
          <Button
            type="submit"
            form={formId}
            variante="primario"
            icone={PiFloppyDisk}
            carregando={isSubmitting}
          >
            {isSubmitting
              ? t('form_saving')
              : editingComposer
                ? `${t('form_update')} Compositor`
                : `${t('form_create')} Compositor`}
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate>
        <FormBlock
          titulo={t('modal_composer_scraping_title')}
          nota={
            isEditingExternalSource ? (
              <span className="inline-flex items-center gap-1">
                <PiLock aria-hidden="true" className="h-3 w-3" />
                {t('modal_composer_scraping_detected')}
              </span>
            ) : undefined
          }
        >
          <label className="flex flex-col gap-2">
            <span className="t-rotulo font-medium text-texto">
              {t('modal_composer_scraping_source_type')}
            </span>
            <Selecao
              aria-label={t('modal_composer_scraping_source_type')}
              opcoes={dataSourceOptions}
              valor={dataSource}
              aoMudar={(v) => setDataSource(v as DataSource)}
              disabled={isEditingExternalSource}
            />
          </label>

          {dataSource !== 'none' && (
            <>
              <Field
                className="sm:col-span-2"
                label={
                  dataSource === 'imslp'
                    ? t('modal_composer_scraping_url_imslp')
                    : t('modal_composer_scraping_url_wikipedia')
                }
                type="url"
                inputMode="url"
                value={urlToScrape}
                onChange={(e) => setUrlToScrape(e.target.value)}
                placeholder={
                  dataSource === 'imslp'
                    ? 'https://imslp.org/wiki/Category:Mozart,_Wolfgang_Amadeus'
                    : 'https://en.wikipedia.org/wiki/Wolfgang_Amadeus_Mozart'
                }
                disabled={isEditingExternalSource}
              />

              {duplicateCheck.loading && (
                <Aviso tom="carregando">
                  {t('modal_composer_scraping_checking_duplicates')}
                </Aviso>
              )}

              {duplicateCheck.found && (
                <Aviso
                  tom="erro"
                  titulo={t('modal_composer_scraping_duplicate_found')}
                >
                  <p>
                    {t('modal_composer_scraping_duplicate_reason', {
                      reason: motivo,
                    })}
                  </p>
                  {duplicateCheck.composer?.fullName && (
                    <p>
                      {t('modal_composer_scraping_duplicate_composer', {
                        composer: duplicateCheck.composer.fullName,
                      })}
                    </p>
                  )}
                  {duplicateCheck.composer?.nationality && (
                    <p>
                      {t('modal_composer_scraping_duplicate_nationality', {
                        nationality: duplicateCheck.composer.nationality,
                      })}
                    </p>
                  )}
                  {(duplicateCheck.composer?.birthDate ||
                    duplicateCheck.composer?.deathDate) && (
                    <p>
                      {t('modal_composer_scraping_duplicate_period', {
                        birthDate: duplicateCheck.composer.birthDate || '?',
                        deathDate: duplicateCheck.composer.deathDate || '?',
                      })}
                    </p>
                  )}
                </Aviso>
              )}

              {!isEditingExternalSource && (
                <div className="sm:col-span-2">
                  <Button
                    tamanho="p"
                    icone={PiMagnifyingGlass}
                    carregando={scrapingUrl}
                    onClick={handleScrapeUrl}
                  >
                    {scrapingUrl
                      ? t('modal_composer_scraping_extracting')
                      : t('modal_composer_scraping_extract_button')}
                  </Button>
                </div>
              )}

              {scrapingResult && (
                <Aviso tom="ok" titulo={t('modal_composer_scraping_success')}>
                  {t('modal_composer_scraping_quality', {
                    source: scrapingResult.source,
                    quality: scrapingResult.data.pageQuality,
                    completeness: scrapingResult.data.dataCompleteness,
                  })}
                </Aviso>
              )}

              {isEditingExternalSource && (
                <Aviso>
                  {t('modal_composer_scraping_external_edit', {
                    source: fonte,
                  })}
                </Aviso>
              )}
            </>
          )}
        </FormBlock>

        <FormBlock titulo={t('modal_composer_basic_title')}>
          <Field
            ref={fieldRefs.name}
            label={`${t('modal_composer_basic_name')} *`}
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            erro={errors.name}
            placeholder="Mozart"
          />
          <Field
            ref={fieldRefs.fullName}
            label={`${t('modal_composer_basic_full_name')} *`}
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            erro={errors.fullName}
            placeholder="Wolfgang Amadeus Mozart"
          />
          <Field
            label={t('modal_composer_basic_alt_names')}
            value={formData.alternativeNames}
            onChange={(e) =>
              handleInputChange('alternativeNames', e.target.value)
            }
            placeholder={t('modal_composer_basic_alt_names_placeholder')}
          />
          <div ref={fieldRefs.nationality} className="flex flex-col gap-2">
            <label
              htmlFor={`${idCampo}-1`}
              className="t-rotulo font-medium text-texto"
            >
              {t('modal_composer_basic_nationality')}
            </label>
            {/* The countries of the composer pages, stored as the English
                demonym ("German"), like the rest of the catalog. */}
            <SelecaoComBusca
              id={`${idCampo}-1`}
              opcoes={nationalityOptions(
                language === 'en' ? 'en' : 'pt',
                canonicalNationality(formData.nationality)
              )}
              valor={canonicalNationality(formData.nationality)}
              aoMudar={handleNationalityChange}
              placeholder={t('modal_composer_basic_nationality_placeholder')}
              invalido={!!errors.nationality}
              limpavel
            />
          </div>
        </FormBlock>

        <FormBlock titulo={t('modal_composer_dates_title')}>
          {/* The same picker as "Completar" and the edit page: year typed,
              month and day optional, approximate dates; it writes the
              database's format ("15 August 1921", "ca.1845"). */}
          <div ref={fieldRefs.birthDate}>
            <Rotulado label={t('modal_composer_dates_birth')}>
              {(id) => (
                <SeletorDeData
                  id={id}
                  valor={formData.birthDate}
                  aoMudar={(texto) => handleInputChange('birthDate', texto)}
                  invalido={!!errors.birthDate}
                />
              )}
            </Rotulado>
          </div>
          <div ref={fieldRefs.deathDate} className="flex flex-col gap-1.5">
            <Rotulado label={t('modal_composer_dates_death')}>
              {(id) => (
                <SeletorDeData
                  id={id}
                  valor={formData.deathDate}
                  aoMudar={(texto) => handleInputChange('deathDate', texto)}
                  invalido={!!errors.deathDate}
                />
              )}
            </Rotulado>
            <span className="t-legenda">
              {t('modal_composer_dates_death_note')}
            </span>
          </div>
        </FormBlock>

        <FormBlock titulo={t('modal_composer_image_title')}>
          <div className="flex justify-center sm:col-span-2">
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
                formData.fullName ||
                formData.name ||
                tx('Compositor', 'Composer')
              }
              showRemove={!!formData.portraitUrl}
              composerName={formData.fullName || formData.name}
            />
          </div>
        </FormBlock>

        <FormBlock titulo={t('modal_composer_classification_title')}>
          <div ref={fieldRefs.epochId} className="flex flex-col gap-2">
            <span className="t-rotulo font-medium text-texto">
              {t('modal_composer_classification_epoch')} *
            </span>
            <Selecao
              aria-label={t('modal_composer_classification_epoch')}
              placeholder={t('modal_composer_classification_epoch_placeholder')}
              opcoes={epochs.map((epoch) => ({
                value: epoch.id,
                label: translateEpochWithHook(epoch.name, t),
              }))}
              valor={formData.epochId}
              invalido={!!errors.epochId}
              aoMudar={(value) => {
                handleInputChange('epochId', value);
                handleInputChange(
                  'epochName',
                  epochs.find((epoch) => epoch.id === value)?.name ??
                    tx('Desconhecido', 'Unknown')
                );
              }}
            />
            {errors.epochId && (
              <span className="t-legenda text-erro">{errors.epochId}</span>
            )}
          </div>
          <div ref={fieldRefs.primaryRoleId} className="flex flex-col gap-2">
            <span className="t-rotulo font-medium text-texto">
              {t('modal_composer_classification_primary_role')} *
            </span>
            <Selecao
              aria-label={t('modal_composer_classification_primary_role')}
              placeholder={t(
                'modal_composer_classification_primary_role_placeholder'
              )}
              opcoes={roles.map((role) => ({
                value: role.id,
                label: translateRole(role.name, language || 'pt'),
              }))}
              valor={formData.primaryRoleId}
              invalido={!!errors.primaryRoleId}
              aoMudar={(value) => handleInputChange('primaryRoleId', value)}
            />
            {errors.primaryRoleId && (
              <span className="t-legenda text-erro">
                {errors.primaryRoleId}
              </span>
            )}
          </div>
          <fieldset className="flex flex-col gap-3 sm:col-span-2">
            <legend className="t-rotulo mb-1 font-medium text-texto">
              {t('modal_composer_classification_secondary_roles')}
            </legend>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {filteredSecondaryRoles.map((role) => (
                <CaixaDeMarcar
                  key={role.id}
                  rotulo={translateRole(role.name, language || 'pt')}
                  marcado={formData.roles.includes(role.id)}
                  aoMudar={(on) => handleSecondaryRolesChange(role.id, on)}
                />
              ))}
            </div>
          </fieldset>
          <Field
            className="sm:col-span-2"
            label={t('modal_composer_classification_instruments')}
            value={formData.instruments}
            onChange={(e) => handleInputChange('instruments', e.target.value)}
            placeholder={t(
              'modal_composer_classification_instruments_placeholder'
            )}
          />
        </FormBlock>

        <FormBlock titulo={t('modal_composer_external_title')}>
          {(['wikipediaLink', 'permLinkImslp'] as const).map((key) => (
            <Field
              key={key}
              className="sm:col-span-2"
              label={
                key === 'wikipediaLink'
                  ? t('modal_composer_external_wikipedia')
                  : t('modal_composer_external_imslp')
              }
              type="url"
              inputMode="url"
              value={formData[key]}
              onChange={(e) => handleInputChange(key, e.target.value)}
              placeholder={
                key === 'wikipediaLink'
                  ? 'https://en.wikipedia.org/wiki/...'
                  : 'https://imslp.org/wiki/Category:Mozart,_Wolfgang_Amadeus'
              }
              disabled={isFieldLocked(key)}
              ajuda={
                isFieldLocked(key)
                  ? t('modal_composer_external_field_locked', {
                      source: key === 'wikipediaLink' ? 'Wikipedia' : 'IMSLP',
                    })
                  : undefined
              }
            />
          ))}
          <Field
            className="sm:col-span-2"
            label={t('modal_composer_external_video')}
            type="url"
            inputMode="url"
            value={formData.videoUrl}
            onChange={(e) => handleInputChange('videoUrl', e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            ajuda={t('modal_composer_external_video_description')}
          />
        </FormBlock>

        <FormBlock
          titulo={t('modal_composer_bio_title')}
          acoes={
            <>
              <Button
                tamanho="p"
                icone={PiSparkle}
                carregando={isGeneratingBio}
                onClick={() => handleGenerateBiography(biographyTab)}
              >
                {tx('Gerar com IA', 'Generate with AI')}
              </Button>
              <Button
                tamanho="p"
                icone={PiTranslate}
                carregando={isTranslatingBio}
                disabled={!biographies[biographyTab]}
                onClick={() =>
                  biographyTab === 'pt'
                    ? handleTranslateBiography('pt', 'en')
                    : handleTranslateBiography('en', 'pt')
                }
              >
                {biographyTab === 'pt'
                  ? tx('Traduzir para inglês', 'Translate to English')
                  : tx('Traduzir para português', 'Translate to Portuguese')}
              </Button>
              <Button
                tamanho="p"
                variante="fantasma"
                disabled={!biographies[biographyTab]}
                onClick={() => {
                  setBiographies((prev) => ({ ...prev, [biographyTab]: '' }));
                  setBioMessage({ type: '', text: '' });
                }}
              >
                {tx('Limpar', 'Clear')}
              </Button>
            </>
          }
        >
          <Abas
            rotulo={tx('Idioma da biografia', 'Biography language')}
            className="sm:col-span-2"
          >
            {(['pt', 'en'] as const).map((lang) => (
              <Aba
                key={lang}
                ativa={biographyTab === lang}
                onClick={() => setBiographyTab(lang)}
              >
                {lang === 'pt' ? 'Português' : 'English'}
                <span className="ml-2 text-texto-fraco">
                  {biographies[lang]
                    ? lang === 'pt'
                      ? 'preenchida'
                      : 'filled'
                    : lang === 'pt'
                      ? 'vazia'
                      : 'empty'}
                </span>
              </Aba>
            ))}
          </Abas>

          {bioMessage.text && (
            <Aviso tom={bioMessage.type === 'success' ? 'ok' : 'erro'}>
              {bioMessage.text}
            </Aviso>
          )}

          <Field.Area
            className="sm:col-span-2"
            label={
              biographyTab === 'pt'
                ? 'Biografia em português'
                : 'Biography in English'
            }
            ajuda={`${biographies[biographyTab]?.length || 0} caracteres`}
            rows={10}
            value={biographies[biographyTab]}
            onChange={(e) => {
              setBiographies((prev) => ({
                ...prev,
                [biographyTab]: e.target.value,
              }));
              setBioMessage({ type: '', text: '' });
            }}
            placeholder={
              biographyTab === 'pt'
                ? 'Escreva a biografia ou use "Gerar com IA".'
                : 'Write the biography or use "Generate with AI".'
            }
          />
        </FormBlock>
      </form>
    </FormSheet>
  );
};

export default CreateComposerModal;
