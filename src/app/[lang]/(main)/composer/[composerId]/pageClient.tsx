// app/composer/[composerId]/ComposerDetailsClient.tsx - Com sistema de animações, traduções e vídeo
'use client';

import { useState } from 'react';
import Image from '@/app/components/SmartImage';
import Link from '@/app/components/LocalizedLink';
import {
  ComposerDetails,
  ComposerWorksResponse,
  ComposerFilterOptions,
} from '@/app/requests/composer-details';
import {
  PiArrowSquareOut,
  PiBookOpen,
  PiCalendarBlank,
  PiHeart,
  PiInfo,
  PiMapPin,
  PiMusicNotes,
  PiUser,
  PiUsers,
} from 'react-icons/pi';
import ComposerBiography from '../../../../components/ComposerBiography';
import ComposerWorks from '../../../../components/ComposersClient/ComposerWorks';
import ComposerVideo from '../../../../components/ComposerVideo';
import FavoriteButton from '../../../../components/FavoriteButton';
import ShareButton from '../../../../components/ShareButton';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
} from '../../../../components/animation/AnimatedComponents';
import { getComposerNationalityDisplay } from '../../../../components/Utils/nationalityFlags';
import { INSTRUMENT_MAPPING } from '../../../../../../scripts/imslp-works-scraper-util';
import VerificationBadge from '../../../../components/Verification/VerificationBadge';
import ReportButton from '../../../../components/Report/ReportButton';
import VerificationModal from '../../../../components/Verification/VerificationModal';
import VerificationButton from '../../../../components/Verification/VerificationButton';
import EditButton from '../../../../components/Common/EditButton';
import { translateEpochWithHook } from '@/app/utils/translations/epochTranslationComposer';
import { useTranslation } from '@/app/context/TranslationContext';
import { translateRole } from '@/app/components/UploadsPage/modals/CreateComposerModal';
import type { BlogArticlePreview } from '@/app/requests/blog/composer-articles';
import ComposerArticlesSection from '@/app/components/ComposerArticlesSection';
import { useSession } from '@/app/libs/session';
import { canEditCatalog, canVerifyCatalog } from '@/app/utils/permissions';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

interface ComposerDetailsClientProps {
  composer: ComposerDetails;
  initialWorksData: ComposerWorksResponse;
  filterOptions: ComposerFilterOptions;
  composerArticles: { articles: BlogArticlePreview[]; totalCount: number }; // 🆕
}

export default function ComposerDetailsClient({
  composer,
  initialWorksData,
  filterOptions,
  composerArticles,
}: ComposerDetailsClientProps) {
  /**
   * Antes vinha do servidor, via `getServerSession`. Ler a sessão no servidor
   * tornava esta página dinâmica — renderizada do zero a cada visita — para
   * decidir a exibição de dois botões de administrador. Decidir no navegador
   * devolve a página ao cache.
   */
  const { data: session } = useSession();
  // Editar é de administrador e de professor aprovado; carimbar "verificado"
  // é só da curadoria administrativa.
  const podeEditar = canEditCatalog(session?.user);
  const podeVerificar = canVerifyCatalog(session?.user);

  const [imageError, setImageError] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isVerified, setIsVerified] = useState(composer.isVerified || false);

  const { t, language } = useTranslation({ sections: ['pages/composerId'] });

  const handleVerificationChange = (verified: boolean) => {
    setIsVerified(verified);
  };

  // Hook para informações da bandeira
  const nationalityDisplay = composer.nationality
    ? (() => {
        const flagInfo = getComposerNationalityDisplay(composer.nationality);
        console.log('composer', composer.nationality);
        const displayName =
          language === 'en'
            ? flagInfo.countryName
                .replace('Estados Unidos', 'United States')
                .replace('Alemanha', 'Germany')
                .replace('França', 'France')
                .replace('Reino Unido', 'United Kingdom')
                .replace('Itália', 'Italy')
                .replace('Áustria', 'Austria')
                .replace('Rússia', 'Russia')
                .replace('Brasil', 'Brazil')
                .replace('Polônia', 'Poland')
                .replace('Espanha', 'Spain')
                .replace('Bélgica', 'Belgium')
                .replace('Dinamarca', 'Denmark')
                .replace('República Tcheca', 'Czech Republic')
                .replace('Países Baixos', 'Netherlands')
                .replace('Hungria', 'Hungary')
                .replace('Suécia', 'Sweden')
                .replace('Suíça', 'Switzerland')
                .replace('Noruega', 'Norway')
                .replace('Finlândia', 'Finland')
            : flagInfo.countryName;

        return {
          ...flagInfo,
          countryName: displayName,
        };
      })()
    : null;

  // Função para traduzir instrumentos para português
  const translateInstruments = (instrumentsString?: string) => {
    if (!instrumentsString) return '';

    return instrumentsString
      .split(',')
      .map((instrument) => {
        const trimmed = instrument.trim().toLowerCase();
        if (language == 'en') {
          return instrument.trim();
        }
        return INSTRUMENT_MAPPING[trimmed] || instrument.trim();
      })
      .join(', ');
  };

  // Função para formatar datas no formato brasileiro
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;

    // Remove espaços extras e normaliza
    const cleanDate = dateString.trim();

    // Se é apenas o ano (formato: "1841")
    if (/^\d{4}$/.test(cleanDate)) {
      return cleanDate;
    }

    // Mapeamento de meses em inglês para números
    const monthMap: Record<string, string> = {
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
      jan: '01',
      feb: '02',
      mar: '03',
      apr: '04',
      jun: '06',
      jul: '07',
      aug: '08',
      sep: '09',
      oct: '10',
      nov: '11',
      dec: '12',
    };

    // Formato: "8 September 1841" ou "September 1841"
    const datePattern = /^(\d{1,2})?\s*([a-zA-Z]+)\s+(\d{4})$/;
    const match = cleanDate.match(datePattern);

    if (match) {
      const [, day, month, year] = match;
      const monthNumber = monthMap[month.toLowerCase()];

      if (monthNumber) {
        if (day) {
          // Formato completo: DD/MM/YYYY
          const formattedDay = day.padStart(2, '0');
          return `${formattedDay}/${monthNumber}/${year}`;
        } else {
          // Apenas mês e ano: MM/YYYY
          return `${monthNumber}/${year}`;
        }
      }
    }

    // Formato ISO: "1841-09-08"
    const isoPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
    const isoMatch = cleanDate.match(isoPattern);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      return `${day}/${month}/${year}`;
    }

    // Formato: "September 1841" (sem dia)
    const monthYearPattern = /^([a-zA-Z]+)\s+(\d{4})$/;
    const monthYearMatch = cleanDate.match(monthYearPattern);
    if (monthYearMatch) {
      const [, month, year] = monthYearMatch;
      const monthNumber = monthMap[month.toLowerCase()];
      if (monthNumber) {
        return `${monthNumber}/${year}`;
      }
    }

    // Se não conseguiu formatar, retorna como está
    return cleanDate;
  };

  // Calcular idade e anos de vida
  const calculateLifeSpan = () => {
    if (!composer.birthDate && !composer.deathDate) return null;

    const birth = composer.birthDate ? new Date(composer.birthDate) : null;
    const death = composer.deathDate
      ? new Date(composer.deathDate)
      : new Date();

    if (birth && death) {
      const years = death.getFullYear() - birth.getFullYear();
      return years;
    }
    return null;
  };

  const lifeSpan = calculateLifeSpan();
  const secondaryRoles = composer.roleNames || [];

  return (
    <div className="">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 rounded-full blur-2xl"></div>
      </div>

      <div className="section-wrap space-y-8 relative z-10 ">
        {/* Breadcrumb */}
        <AnimatedItem direction="down" springType="gentle">
          <Inline
            as="nav"
            gap={2}
            className="text-sm text-theme-tertiary mb-6 pt-4"
          >
            <Link
              href="/composers"
              className="hover:text-ouro-texto transition-colors duration-300 font-medium"
            >
              {t('breadcrumb_composers')}
            </Link>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="text-theme-primary font-medium">
              {composer.name}
            </span>
          </Inline>
        </AnimatedItem>

        <AnimatedContainer
          delay={0.1}
          staggerSpeed="normal"
          className="flex flex-col gap-4"
        >
          {/* Header Principal */}
          <AnimatedCard
            hover="lift"
            className="classical-card relative z-elevado"
          >
            <div className=" p-2 md:p-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Informações do Compositor */}
                <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
                  {/* Nome e título */}
                  <AnimatedItem direction="up" springType="bouncy">
                    <Stack gap={3}>
                      <div className="flex flex-col-reverse md:flex-row items-start justify-between">
                        <div className="flex-1 ">
                          <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title leading-tight">
                            {composer.name}
                          </h1>
                          {composer.fullName !== composer.name && (
                            <Inline gap={2}>
                              <p className="text-xl text-theme-secondary">
                                {composer.fullName}
                              </p>
                              {isVerified && (
                                <VerificationBadge
                                  verified={isVerified}
                                  size="md"
                                  variant="text"
                                />
                              )}
                            </Inline>
                          )}
                        </div>
                        {/* Ações */}
                        <Inline
                          gap={3}
                          className="self-end py-4 sm:pb-0 sm:pt-2 b"
                        >
                          <FavoriteButton
                            id={composer.id}
                            type="composer"
                            variant="default"
                            size="lg"
                            itemName={composer.fullName}
                            showToast={true}
                          />

                          <ShareButton
                            title={`${composer.fullName} - Compositor`}
                            description={`Explore as obras de ${composer.fullName}, compositor do período ${composer.epochName}. Acesse partituras, biografia e mais informações.`}
                            variant="default"
                            size="lg"
                          />
                          <ReportButton
                            entityType="composer"
                            entityId={composer.id}
                            entityName={composer.fullName}
                            variant="ghost"
                            size="lg"
                            showLabel={false}
                          />
                          {podeEditar && (
                            <EditButton
                              entityId={composer.id}
                              variant="minimal"
                              entityType="composer"
                              size="lg"
                              showLabel={false}
                            />
                          )}

                          {/* Selo de verificação: só administrador */}
                          {podeVerificar && (
                            <VerificationButton
                              entityType="composer"
                              variant="secondary"
                              size="lg"
                              onClick={() => setShowVerificationModal(true)}
                            />
                          )}
                        </Inline>
                      </div>
                    </Stack>
                  </AnimatedItem>

                  {composer.alternativeNames && (
                    <Stack gap={3}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 flex-row ">
                          <p className="space-x-2 text-xl text-theme-secondary mt-3">
                            {t('alternative_names_label')}{' '}
                            <Text
                              papel="rotulo"
                              tom="fraco"
                              className="font-medium"
                            >
                              {composer.alternativeNames}
                            </Text>
                          </p>
                        </div>
                      </div>
                    </Stack>
                  )}

                  {/* Grid de informações */}
                  <AnimatedItem direction="left" springType="smooth">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Nascimento */}
                      {composer.birthDate && (
                        <div className="flex items-start space-x-3 group">
                          <div className="w-8 h-8 bg-ok rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                            <PiCalendarBlank className="w-4 h-4 text-theme-primary" />
                          </div>
                          <div>
                            <Text
                              papel="rotulo"
                              tom="fraco"
                              as="p"
                              className="font-medium"
                            >
                              {t('birth_label')}
                            </Text>
                            <p className="text-theme-primary font-semibold">
                              {formatDate(composer.birthDate)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Falecimento ou Idade */}
                      {composer.deathDate ? (
                        <div className="flex items-start space-x-3 group">
                          <div className="w-8 h-8 bg-erro rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                            <PiCalendarBlank className="w-4 h-4 text-theme-primary" />
                          </div>
                          <div>
                            <Text
                              papel="rotulo"
                              tom="fraco"
                              as="p"
                              className="font-medium"
                            >
                              {t('death_label')}
                            </Text>
                            <p className="text-theme-primary font-semibold">
                              {formatDate(composer.deathDate)}
                              {lifeSpan && (
                                <Text
                                  papel="rotulo"
                                  tom="suave"
                                  className="ml-2"
                                >
                                  ({lifeSpan} {t('years_suffix')})
                                </Text>
                              )}
                            </p>
                          </div>
                        </div>
                      ) : (
                        composer.birthDate && (
                          <div className="flex items-start space-x-3 group">
                            <div className="w-8 h-8 bg-ok rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                              <PiHeart className="w-4 h-4 text-theme-primary" />
                            </div>
                            <div>
                              <Text
                                papel="rotulo"
                                tom="fraco"
                                as="p"
                                className="font-medium"
                              >
                                {t('age_label')}
                              </Text>
                              <p className="text-theme-primary font-semibold">
                                {lifeSpan} {t('years_suffix')}
                                <span className="text-ok ml-2 text-sm">
                                  {t('alive_status')}
                                </span>
                              </p>
                            </div>
                          </div>
                        )
                      )}

                      {/* Época */}
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 fill-ouro rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <PiMapPin className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <Text
                            papel="rotulo"
                            tom="fraco"
                            as="p"
                            className="font-medium"
                          >
                            {t('epoch_label')}
                          </Text>
                          <p className="text-brand-primary font-semibold">
                            {translateEpochWithHook(composer.epochName, t)}
                          </p>
                        </div>
                      </div>

                      {/* Papel Principal */}
                      {composer.primaryRoleName && (
                        <div className="flex items-start space-x-3 group">
                          <div className="w-8 h-8 bg-aviso rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                            <PiUser className="w-4 h-4 text-theme-primary" />
                          </div>
                          <div>
                            <Text
                              papel="rotulo"
                              tom="fraco"
                              as="p"
                              className="font-medium"
                            >
                              {t('primary_role_label')}
                            </Text>
                            <p className="text-theme-primary font-semibold">
                              {translateRole(
                                composer.primaryRoleName,
                                language
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {nationalityDisplay && (
                        <div className="flex items-start space-x-3 group">
                          <div className="w-8 h-8 bg-aviso rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                            {nationalityDisplay.flag}
                          </div>
                          <div>
                            <Text
                              papel="rotulo"
                              tom="fraco"
                              as="p"
                              className="font-medium"
                            >
                              {t('nationality_label')}
                            </Text>
                            <p className="text-theme-primary font-semibold">
                              {nationalityDisplay.countryName}
                            </p>
                          </div>
                        </div>
                      )}

                      {composer.instruments && (
                        <div className="flex items-start space-x-3 group">
                          <div className="w-8 h-8 pl-2 pr-2 bg-aviso rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                            <PiUser className="w-4 h-4 text-theme-primary" />
                          </div>
                          <div className="flex flex-col ">
                            <Text
                              papel="rotulo"
                              tom="fraco"
                              as="p"
                              className="font-medium"
                            >
                              {t('instruments_label')}
                            </Text>
                            <p className="text-theme-primary font-semibold break-all">
                              {translateInstruments(composer.instruments)}.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </AnimatedItem>

                  {/* Recursos Externos */}
                  <AnimatedItem direction="right" springType="smooth">
                    <Stack className="pt-4">
                      <div className="flex flex-wrap gap-3">
                        {composer.wikipediaLink && (
                          <Inline
                            as="a"
                            gap={2}
                            href={composer.wikipediaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-classical-primary group/btn"
                          >
                            <PiArrowSquareOut className="w-4 h-4" />
                            <span>{t('wikipedia_link')}</span>
                            <svg
                              className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </Inline>
                        )}

                        {composer.permLinkImslp && (
                          <Inline
                            as="a"
                            gap={2}
                            href={composer.permLinkImslp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-classical-secondary group/btn"
                          >
                            <PiBookOpen className="w-4 h-4" />
                            <span>{t('imslp_link')}</span>
                            <svg
                              className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </Inline>
                        )}
                      </div>
                    </Stack>
                  </AnimatedItem>
                </div>

                {/* Imagem do Compositor */}
                <AnimatedItem
                  direction="scale"
                  springType="bouncy"
                  className="flex justify-center order-1  space-y-6 lg:order-2 lg:justify-end"
                >
                  <div className="relative group">
                    {composer.portraitUrl && !imageError ? (
                      <div className="relative w-64 h-80 rounded-2xl overflow-hidden shadow-theme-glow border border-theme-primary group-hover:scale-105 transition-all duration-500">
                        <Image
                          src={composer.portraitUrl}
                          alt={composer.name}
                          fill
                          sizes="256px"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          priority
                          onError={() => setImageError(true)}
                        />
                        <div className="absolute inset-0 fill-ouro opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                      </div>
                    ) : (
                      <div className="w-64 h-80 fundo-sup-1 border border-theme-primary rounded-2xl flex items-center justify-center shadow-theme-glow group-hover:scale-105 transition-all duration-500">
                        <div className="text-center text-theme-tertiary">
                          <PiUser className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-sm">{t('no_image_available')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </AnimatedItem>
              </div>
            </div>
          </AnimatedCard>

          {/* Seção de Papéis Secundários */}
          {secondaryRoles.length > 0 && (
            <AnimatedCard
              hover="lift"
              className="classical-card p-8 z-10 relative"
            >
              <AnimatedItem direction="up" springType="bouncy">
                <Inline gap={3} className="mb-6">
                  <div className="w-12 h-12 fill-ouro rounded-2xl flex items-center justify-center">
                    <PiUsers className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-theme-primary classical-title">
                      {t('secondary_roles_title')}
                    </h2>
                    <p className="text-theme-secondary classical-subtitle">
                      {t('secondary_roles_subtitle')} {composer.fullName}
                    </p>
                  </div>
                </Inline>
              </AnimatedItem>

              <div className="flex flex-wrap gap-3">
                {secondaryRoles.map((role, index) => (
                  <AnimatedItem key={index} hover="scale" springType="bouncy">
                    <span className="inline-flex items-center px-4 py-2 bg-aviso/10 border border-aviso/30 rounded-full text-sm font-medium text-aviso shadow-theme-small hover:shadow-[var(--sombra-1)] transition-all duration-300 hover:scale-105 group">
                      <div className="w-4 h-4 bg-aviso rounded-full flex items-center justify-center mr-2 group-hover:scale-110 transition-transform duration-300">
                        <PiMusicNotes className="w-3 h-3 text-theme-primary" />
                      </div>

                      {translateRole(role, language)}
                    </span>
                  </AnimatedItem>
                ))}
              </div>

              {secondaryRoles.length > 5 && (
                <AnimatedItem direction="up" springType="gentle">
                  <div className="mt-6 p-4 bg-sup-elevada rounded-xl border border-theme-primary">
                    <Text papel="rotulo" tom="suave" as="p">
                      <strong className="text-brand-primary">
                        {composer.name}
                      </strong>{' '}
                      {t('versatility_text_part1')}{' '}
                      <strong className="text-ok">
                        {secondaryRoles.length} {t('versatility_text_part2')}
                      </strong>{' '}
                      {t('versatility_text_part3')}
                    </Text>
                  </div>
                </AnimatedItem>
              )}
            </AnimatedCard>
          )}

          {/* Biografia */}
          <AnimatedCard hover="lift" className="classical-card p-8">
            <AnimatedItem direction="left" springType="smooth">
              <Inline gap={3} className="mb-6">
                <div className="w-12 h-12 bg-ok rounded-2xl flex items-center justify-center">
                  <PiBookOpen className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-theme-primary classical-title">
                    {t('biography_title')}
                  </h2>
                </div>
                <div className="relative group">
                  <div className="w-8 h-8 bg-ouro/10 rounded-full flex items-center justify-center cursor-help">
                    <PiInfo className="w-4 h-4 text-theme-tertiary" />
                  </div>
                  {/* Tooltip */}
                  <Text
                    papel="legenda"
                    tom="forte"
                    as="div"
                    className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-theme-elevated border border-theme-primary rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 shadow-theme-medium"
                  >
                    {t('biography_ai_tooltip')}
                    <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-sup-elevada"></div>
                  </Text>
                </div>
              </Inline>
            </AnimatedItem>

            <AnimatedItem direction="up" springType="gentle">
              <ComposerBiography
                composerId={composer.id}
                initialBio={composer.bio}
              />
            </AnimatedItem>
          </AnimatedCard>

          <ComposerArticlesSection
            articles={composerArticles.articles}
            totalCount={composerArticles.totalCount}
            composerName={composer.name}
          />

          {/* Vídeo do Compositor - Nova seção */}
          {composer.videoUrl && (
            <ComposerVideo
              videoUrl={composer.videoUrl}
              composerName={composer.fullName || composer.name}
            />
          )}

          {/* Obras do Compositor */}
          <ComposerWorks
            composerId={composer.id}
            composerName={composer.name}
            initialWorks={initialWorksData.works}
            initialTotalCount={initialWorksData.totalCount}
            initialHasMore={initialWorksData.hasMore}
            filterOptions={filterOptions}
          />
        </AnimatedContainer>
      </div>
      {podeVerificar && (
        <VerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          currentItem="composer"
          itemId={composer.id}
          composerName={composer.fullName}
          currentVerificationStatus={isVerified}
          onVerificationChange={handleVerificationChange}
        />
      )}
    </div>
  );
}
