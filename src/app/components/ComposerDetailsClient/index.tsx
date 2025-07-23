// app/composer/[composerId]/ComposerDetailsClient.tsx - Com sistema de animações
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ComposerDetails,
  ComposerWorksResponse,
  ComposerFilterOptions,
} from '@/app/requests/composer-details';
import {
  FiCalendar,
  FiMapPin,
  FiUser,
  FiExternalLink,
  FiBookOpen,
  FiUsers,
  FiMusic,
  FiHeart,
  FiInfo,
  FiShield,
  FiEdit,
} from 'react-icons/fi';

import ComposerBiography from '../ComposerBiography';
import ComposerWorks from '../ComposersClient/ComposerWorks';
import FavoriteButton from '../FavoriteButton';
import ShareButton from '../ShareButton'; // Novo componente

// Importar componentes de animação
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
} from '../animation/AnimatedComponents';
import { getComposerNationalityDisplay } from '../Utils/nationalityFlags';
import { INSTRUMENT_MAPPING } from '../../../../scripts/imslp-works-scraper-util';
import VerificationBadge from '../Verification/VerificationBadge';
import ReportButton from '../Report/ReportButton';
import VerificationModal from '../Verification/VerificationModal';
import VerificationButton from '../Verification/VerificationButton';
import { useRouter } from 'next/navigation';
import EditButton from '../Common/EditButton';

interface ComposerDetailsClientProps {
  composer: ComposerDetails;
  initialWorksData: ComposerWorksResponse;
  filterOptions: ComposerFilterOptions;
  isAdmin: boolean;
}

export default function ComposerDetailsClient({
  composer,
  initialWorksData,
  filterOptions,
  isAdmin,
}: ComposerDetailsClientProps) {
  const [imageError, setImageError] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isVerified, setIsVerified] = useState(composer.isVerified || false);

  const router = useRouter();
  const handleVerificationChange = (verified: boolean) => {
    setIsVerified(verified);
    // Atualizar no contexto global se necessário
  };

  // 🆕 Hook para informações da bandeira
  const nationalityDisplay = composer.nationality
    ? getComposerNationalityDisplay(composer.nationality)
    : null;

  // 🆕 Função para traduzir instrumentos para português
  const translateInstruments = (instrumentsString?: string) => {
    if (!instrumentsString) return '';

    return instrumentsString
      .split(',')
      .map((instrument) => {
        const trimmed = instrument.trim().toLowerCase();
        return INSTRUMENT_MAPPING[trimmed] || instrument.trim();
      })
      .join(', ');
  };

  // 🆕 Função para formatar datas no formato brasileiro
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
    <div className="bg-gradient-primary">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-brand-gradient rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-accent-purple/30 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent-blue/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-brand-secondary/20 rounded-full blur-2xl"></div>
      </div>

      <div className="section-wrap space-y-8 relative z-10 ">
        {/* Breadcrumb */}
        <AnimatedItem direction="down" springType="gentle">
          <nav className="flex items-center space-x-2 text-sm text-theme-tertiary mb-6 pt-4">
            <Link
              href="/composers"
              className="hover:text-brand-primary transition-colors duration-300 font-medium"
            >
              Compositores
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
          </nav>
        </AnimatedItem>

        <AnimatedContainer
          delay={0.1}
          staggerSpeed="normal"
          className="flex flex-col gap-4"
        >
          {/* Header Principal */}
          <AnimatedCard hover="lift" className="classical-card relative z-50">
            <div className="p-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Informações do Compositor */}
                <div className="lg:col-span-2 space-y-6 order-2 md:order-1 lg:order-1">
                  {/* Nome e título */}
                  <AnimatedItem direction="up" springType="bouncy">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 ">
                          <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title leading-tight">
                            {composer.name}
                          </h1>
                          {composer.fullName !== composer.name && (
                            <div className="flex items-center space-x-2">
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
                            </div>
                          )}
                        </div>
                        {/* Ações */}
                        <div className="flex items-center space-x-3 pt-2 b">
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
                          {isAdmin && (
                            <EditButton
                              entityId={composer.id}
                              variant="minimal"
                              entityType="composer"
                              size="lg"
                              showLabel={false}
                            />
                          )}

                          {/* Admin verification button */}
                          {isAdmin && (
                            <VerificationButton
                              entityType="composer"
                              variant="ghost"
                              size="lg"
                              onClick={() => setShowVerificationModal(true)}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </AnimatedItem>

                  {composer.alternativeNames && (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 flex-row ">
                          <p className="space-x-2 text-xl text-theme-secondary mt-3">
                            Nomes alternativos:{' '}
                            <span className="text-sm font-medium text-theme-tertiary ">
                              {composer.alternativeNames}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Grid de informações */}
                  <AnimatedItem direction="left" springType="smooth">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Nascimento */}
                      {composer.birthDate && (
                        <div className="flex items-start space-x-3 group">
                          <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                            <FiCalendar className="w-4 h-4 text-theme-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-theme-tertiary">
                              Nascimento
                            </p>
                            <p className="text-theme-primary font-semibold">
                              {formatDate(composer.birthDate)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Falecimento ou Idade */}
                      {composer.deathDate ? (
                        <div className="flex items-start space-x-3 group">
                          <div className="w-8 h-8 bg-gradient-to-br from-accent-red to-accent-purple rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                            <FiCalendar className="w-4 h-4 text-theme-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-theme-tertiary">
                              Falecimento
                            </p>
                            <p className="text-theme-primary font-semibold">
                              {formatDate(composer.deathDate)}
                              {lifeSpan && (
                                <span className="text-theme-secondary ml-2 text-sm">
                                  ({lifeSpan} anos)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      ) : (
                        composer.birthDate && (
                          <div className="flex items-start space-x-3 group">
                            <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                              <FiHeart className="w-4 h-4 text-theme-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-theme-tertiary">
                                Idade
                              </p>
                              <p className="text-theme-primary font-semibold">
                                {lifeSpan} anos
                                <span className="text-accent-green ml-2 text-sm">
                                  (vivo)
                                </span>
                              </p>
                            </div>
                          </div>
                        )
                      )}

                      {/* Época */}
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <FiMapPin className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-tertiary">
                            Época
                          </p>
                          <p className="text-brand-primary font-semibold">
                            {composer.epochName}
                          </p>
                        </div>
                      </div>

                      {/* Papel Principal */}
                      {composer.primaryRoleName && (
                        <div className="flex items-start space-x-3 group">
                          <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                            <FiUser className="w-4 h-4 text-theme-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-theme-tertiary">
                              Papel Principal
                            </p>
                            <p className="text-theme-primary font-semibold">
                              {composer.primaryRoleName}
                            </p>
                          </div>
                        </div>
                      )}

                      {nationalityDisplay && (
                        <div className="flex items-start space-x-3 group">
                          <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                            {nationalityDisplay.flag}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-theme-tertiary">
                              Nacionalidade
                            </p>
                            <p className="text-theme-primary font-semibold">
                              {nationalityDisplay.countryName}
                            </p>
                          </div>
                        </div>
                      )}

                      {composer.instruments && (
                        <div className="flex items-start space-x-3 group">
                          <div className="w-8 h-8 pl-2 pr-2 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                            <FiUser className="w-4 h-4 text-theme-primary" />
                          </div>
                          <div className="flex flex-col ">
                            <p className="text-sm font-medium text-theme-tertiary">
                              Compôs para:
                            </p>
                            <p className="text-theme-primary font-semibold break-all">
                              {translateInstruments(composer.instruments)}.
                              {/* {filterOptions.instruments
                                .map(
                                  (instrument, index) =>
                                    index ===
                                    filterOptions.instruments.length - 1
                                      ? `${instrument.name}.` // Último item = ponto final
                                      : `${instrument.name}, ` // Demais itens = vírgula + espaço
                                )
                                .join('')} */}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </AnimatedItem>

                  {/* Recursos Externos */}
                  <AnimatedItem direction="right" springType="smooth">
                    <div className="space-y-4 pt-4">
                      <div className="flex flex-wrap gap-3">
                        {composer.wikipediaLink && (
                          <a
                            href={composer.wikipediaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-classical-primary flex items-center space-x-2 group/btn"
                          >
                            <FiExternalLink className="w-4 h-4" />
                            <span>Wikipedia</span>
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
                          </a>
                        )}

                        {composer.permLinkImslp && (
                          <a
                            href={composer.permLinkImslp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-classical-secondary flex items-center space-x-2 group/btn"
                          >
                            <FiBookOpen className="w-4 h-4" />
                            <span>IMSLP</span>
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
                          </a>
                        )}
                      </div>
                    </div>
                  </AnimatedItem>
                </div>

                {/* Imagem do Compositor */}
                <AnimatedItem
                  direction="scale"
                  springType="bouncy"
                  className="flex justify-center order-1 md:order-2 space-y-6 lg:order-2 lg:justify-end"
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
                        <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                      </div>
                    ) : (
                      <div className="w-64 h-80 bg-gradient-card border border-theme-primary rounded-2xl flex items-center justify-center shadow-theme-glow group-hover:scale-105 transition-all duration-500">
                        <div className="text-center text-theme-tertiary">
                          <FiUser className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-sm">Sem imagem disponível</p>
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
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-blue rounded-2xl flex items-center justify-center">
                    <FiUsers className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-theme-primary classical-title">
                      Papéis Secundários
                    </h2>
                    <p className="text-theme-secondary classical-subtitle">
                      Outras funções exercidas por {composer.fullName}
                    </p>
                  </div>
                </div>
              </AnimatedItem>

              <div className="flex flex-wrap gap-3">
                {secondaryRoles.map((role, index) => (
                  <AnimatedItem key={index} hover="scale" springType="bouncy">
                    <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 border border-accent-blue/30 rounded-full text-sm font-medium text-accent-blue shadow-theme-small hover:shadow-theme-medium transition-all duration-300 hover:scale-105 group">
                      <div className="w-4 h-4 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex items-center justify-center mr-2 group-hover:scale-110 transition-transform duration-300">
                        <FiMusic className="w-3 h-3 text-theme-primary" />
                      </div>
                      {role}
                    </span>
                  </AnimatedItem>
                ))}
              </div>

              {secondaryRoles.length > 5 && (
                <AnimatedItem direction="up" springType="gentle">
                  <div className="mt-6 p-4 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-xl border border-theme-primary">
                    <p className="text-sm text-theme-secondary">
                      <strong className="text-brand-primary">
                        {composer.name}
                      </strong>{' '}
                      exerceu{' '}
                      <strong className="text-accent-green">
                        {secondaryRoles.length} funções diferentes
                      </strong>{' '}
                      ao longo de sua carreira, demonstrando sua versatilidade
                      no mundo musical.
                    </p>
                  </div>
                </AnimatedItem>
              )}
            </AnimatedCard>
          )}

          {/* Biografia */}
          <AnimatedCard hover="lift" className="classical-card p-8">
            <AnimatedItem direction="left" springType="smooth">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-2xl flex items-center justify-center">
                  <FiBookOpen className="w-6 h-6 text-theme-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-theme-primary classical-title">
                    Biografia
                  </h2>
                </div>
                <div className="relative group">
                  <div className="w-8 h-8 bg-interactive-hover rounded-full flex items-center justify-center cursor-help">
                    <FiInfo className="w-4 h-4 text-theme-tertiary" />
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-theme-elevated border border-theme-primary text-theme-primary text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 shadow-theme-medium">
                    Biografia gerada automaticamente por IA
                    <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-theme-elevated"></div>
                  </div>
                </div>
              </div>
            </AnimatedItem>

            <AnimatedItem direction="up" springType="gentle">
              <ComposerBiography
                composerId={composer.id}
                initialBio={composer.bio}
                composerName={composer.name}
              />
            </AnimatedItem>
          </AnimatedCard>

          {/* Obras do Compositor - NOVA VERSÃO COM TABS E PAGINAÇÃO */}
          <AnimatedCard hover="none" className="">
            <ComposerWorks
              composerId={composer.id}
              composerName={composer.name}
              initialWorks={initialWorksData.works}
              initialTotalCount={initialWorksData.totalCount}
              initialHasMore={initialWorksData.hasMore}
              filterOptions={filterOptions}
            />
          </AnimatedCard>
        </AnimatedContainer>
      </div>
      {isAdmin && (
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
