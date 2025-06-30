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
} from 'react-icons/fi';
import { CiMusicNote1 } from 'react-icons/ci';

import ComposerBiography from '../ComposerBiography';
import ComposerWorks from '../ComposersClient/ComposerWorks';
import FavoriteButton from '../FavoriteButton';
import ShareButton from '../ShareButton'; // Novo componente

// Importar componentes de animação
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  SequentialGrid,
} from '../animation/AnimatedComponents';
import { getComposerNationalityDisplay } from '../Utils/nationalityFlags';

interface ComposerDetailsClientProps {
  composer: ComposerDetails;
  initialWorksData: ComposerWorksResponse;
  filterOptions: ComposerFilterOptions;
}

export default function ComposerDetailsClient({
  composer,
  initialWorksData,
  filterOptions,
}: ComposerDetailsClientProps) {
  const [imageError, setImageError] = useState(false);

  // 🆕 Hook para informações da bandeira
  const nationalityDisplay = composer.nationality
    ? getComposerNationalityDisplay(composer.nationality)
    : null;
  // 🆕 Função para formatar datas (pode conter dia/mês/ano)
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;

    // Tentar diversos formatos de data
    const formats = [
      // Formato ISO
      /^\d{4}-\d{2}-\d{2}$/,
      // Formato brasileiro
      /^\d{1,2}\/\d{1,2}\/\d{4}$/,
      // Formato com mês por extenso
      /^\d{1,2} de \w+ de \d{4}$/,
      // Apenas ano
      /^\d{4}$/,
    ];

    // Se é apenas o ano, retornar como está
    if (/^\d{4}$/.test(dateString)) {
      return dateString;
    }

    // Se contém informações mais detalhadas, retornar como está
    return dateString;
  };

  // 🆕 Função para calcular idade aproximada
  const calculateAge = (birthDate?: string, deathDate?: string) => {
    if (!birthDate) return null;

    try {
      // Extrair o ano da data de nascimento
      const birthYear = parseInt(birthDate.match(/\d{4}/)?.[0] || '');
      if (!birthYear) return null;

      let endYear;
      if (deathDate) {
        endYear = parseInt(deathDate.match(/\d{4}/)?.[0] || '');
      } else {
        endYear = new Date().getFullYear();
      }

      if (!endYear) return null;

      const age = endYear - birthYear;
      return age > 0 ? age : null;
    } catch {
      return null;
    }
  };

  // 🆕 Função para obter cor da qualidade da página
  const getPageQualityColor = (quality?: string) => {
    const colors = {
      high: 'from-accent-green to-accent-blue',
      medium: 'from-accent-blue to-accent-purple',
      low: 'from-accent-red to-accent-purple',
    };
    return quality
      ? colors[quality as keyof typeof colors] ||
          'from-theme-primary to-theme-secondary'
      : 'from-theme-primary to-theme-secondary';
  };

  // 🆕 Função para obter label da qualidade da página
  const getPageQualityLabel = (quality?: string) => {
    const labels = {
      high: 'Alta Qualidade',
      medium: 'Qualidade Média',
      low: 'Qualidade Baixa',
      complete: 'Completa',
      stub: 'Esboço',
      needs_work: 'Precisa de Trabalho',
    };
    return quality ? labels[quality as keyof typeof labels] || quality : null;
  };

  // 🆕 Função para processar categorias IMSLP
  const processIMSLPCategories = (categories?: string) => {
    if (!categories) return [];
    return categories
      .split(',')
      .map((cat) => cat.trim())
      .filter((cat) => cat.length > 0);
  };

  // 🆕 Função para processar instrumentos
  const processInstruments = (instruments?: string) => {
    if (!instruments) return [];
    return instruments
      .split(',')
      .map((inst) => inst.trim())
      .filter((inst) => inst.length > 0);
  };

  // 🆕 Função para processar links externos
  const processExternalLinks = (links?: string) => {
    if (!links) return [];

    try {
      // Tentar parsear como JSON primeiro
      const parsed = JSON.parse(links);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Se não é JSON, tratar como string separada por vírgulas ou quebras de linha
      return links
        .split(/[,\n]/)
        .map((link) => link.trim())
        .filter((link) => link.length > 0);
    }

    return [];
  };

  const age = calculateAge(composer.birthDate, composer.deathDate);
  const imslpCategories = processIMSLPCategories(composer.imslpCategories);
  const composerInstruments = processInstruments(composer.instruments);
  const externalLinks = processExternalLinks(composer.externalLinks);

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
                            <p className="space-x-2 text-xl text-theme-secondary mt-3">
                              {composer.fullName}
                            </p>
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
                              {new Date(composer.birthDate).getFullYear() + 1}
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
                              {new Date(composer.deathDate).getFullYear() + 1}
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
                          <div>
                            <p className="text-sm font-medium text-theme-tertiary">
                              Compôs para:
                            </p>
                            <p className="text-theme-primary font-semibold">
                              {composer.instruments}
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
    </div>
  );
}
