// app/components/EditComposerClient.tsx - Layout atualizado
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  FiSave,
  FiTrash2,
  FiLoader,
  FiCalendar,
  FiMapPin,
  FiUser,
  FiExternalLink,
  FiBookOpen,
  FiEdit3,
  FiInfo,
} from 'react-icons/fi';

import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
} from '../../animation/AnimatedComponents';
import Button from '../../Common/Button';
import CreateComposerModal from '../modals/CreateComposerModal';
import { getComposerNationalityDisplay } from '../../Utils/nationalityFlags';
import { useToast } from '@/app/hooks/useToast';

interface EditComposerClientProps {
  composer: any;
  epochs: any[];
  roles: any[];
  isAdmin: boolean;
  userId: string;
}

const EditComposerClient = ({
  composer,
  epochs,
  roles,
  isAdmin,
  userId,
}: EditComposerClientProps) => {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Hook para informações da bandeira
  const nationalityDisplay = composer.nationality
    ? getComposerNationalityDisplay(composer.nationality)
    : null;

  // Função para formatar datas no formato brasileiro
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;

    const cleanDate = dateString.trim();

    if (/^\d{4}$/.test(cleanDate)) {
      return cleanDate;
    }

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

    const datePattern = /^(\d{1,2})?\s*([a-zA-Z]+)\s+(\d{4})$/;
    const match = cleanDate.match(datePattern);

    if (match) {
      const [, day, month, year] = match;
      const monthNumber = monthMap[month.toLowerCase()];

      if (monthNumber) {
        if (day) {
          const formattedDay = day.padStart(2, '0');
          return `${formattedDay}/${monthNumber}/${year}`;
        } else {
          return `${monthNumber}/${year}`;
        }
      }
    }

    const isoPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
    const isoMatch = cleanDate.match(isoPattern);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      return `${day}/${month}/${year}`;
    }

    const monthYearPattern = /^([a-zA-Z]+)\s+(\d{4})$/;
    const monthYearMatch = cleanDate.match(monthYearPattern);
    if (monthYearMatch) {
      const [, month, year] = monthYearMatch;
      const monthNumber = monthMap[month.toLowerCase()];
      if (monthNumber) {
        return `${monthNumber}/${year}`;
      }
    }

    return cleanDate;
  };

  const toast = useToast();

  const handleDelete = async () => {
    if (
      !confirm(
        `Tem certeza que deseja excluir o compositor "${
          composer.fullName || composer.name
        }"?`
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/uploads/composer/${composer.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/uploads');
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir compositor');
      }
    } catch (error) {
      console.error('Erro ao excluir compositor:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao excluir compositor'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-gradient-primary">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-brand-gradient rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-accent-purple/30 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent-blue/20 rounded-full blur-xl"></div>
      </div>

      <div className="section-wrap space-y-8 relative z-10">
        {/* Breadcrumb */}
        <AnimatedItem direction="down" springType="gentle">
          <nav className="flex items-center space-x-2 text-sm text-theme-tertiary mb-6 pt-4">
            <Link
              href="/uploads"
              className="hover:text-brand-primary transition-colors duration-300 font-medium"
            >
              Uploads
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
            <Link
              href="/uploads"
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
              Editar {composer.name}
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
                  <AnimatedItem direction="up" springType="bouncy">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
                              <FiEdit3 className="w-5 h-5 text-theme-primary" />
                            </div>
                            <div>
                              <h1 className="text-3xl md:text-4xl font-bold text-gradient-brand classical-title leading-tight">
                                Editar Compositor
                              </h1>
                              <p className="text-theme-secondary text-lg">
                                {composer.fullName || composer.name}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center space-x-3 ml-4">
                          <Button
                            variant="primary"
                            leftIcon={<FiSave />}
                            onClick={() => setShowEditModal(true)}
                          >
                            Editar
                          </Button>

                          {(isAdmin || composer.createdBy === userId) && (
                            <Button
                              variant="delete"
                              leftIcon={
                                isDeleting ? (
                                  <FiLoader className="animate-spin" />
                                ) : (
                                  <FiTrash2 />
                                )
                              }
                              onClick={handleDelete}
                              disabled={isDeleting}
                            >
                              {isDeleting ? 'Excluindo...' : 'Excluir'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </AnimatedItem>

                  {/* Grid de informações */}
                  <AnimatedItem direction="left" springType="smooth">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Nome */}
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <FiUser className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-tertiary">
                            Nome
                          </p>
                          <p className="text-theme-primary font-semibold">
                            {composer.name}
                          </p>
                        </div>
                      </div>

                      {/* Nome Completo */}
                      {composer.fullName &&
                        composer.fullName !== composer.name && (
                          <div className="flex items-start space-x-3 group">
                            <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                              <FiUser className="w-4 h-4 text-theme-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-theme-tertiary">
                                Nome Completo
                              </p>
                              <p className="text-theme-primary font-semibold">
                                {composer.fullName}
                              </p>
                            </div>
                          </div>
                        )}

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

                      {/* Falecimento */}
                      {composer.deathDate && (
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
                            </p>
                          </div>
                        </div>
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
                            {composer.epoch.name}
                          </p>
                        </div>
                      </div>

                      {/* Papel Principal */}
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <FiUser className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-tertiary">
                            Papel Principal
                          </p>
                          <p className="text-theme-primary font-semibold">
                            {composer.primaryRole.name}
                          </p>
                        </div>
                      </div>

                      {/* Nacionalidade */}
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

                      {/* Instrumentos */}
                      {composer.instruments && (
                        <div className="md:col-span-2 flex items-start space-x-3 group">
                          <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-red rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                            <FiUser className="w-4 h-4 text-theme-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-theme-tertiary">
                              Instrumentos
                            </p>
                            <p className="text-theme-primary font-semibold">
                              {composer.instruments}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </AnimatedItem>

                  {/* Links Externos */}
                  {(composer.wikipediaLink || composer.permLinkImslp) && (
                    <AnimatedItem direction="right" springType="smooth">
                      <div className="border-t border-theme-secondary pt-6">
                        <h3 className="text-lg font-semibold text-theme-primary classical-title mb-4 flex items-center space-x-2">
                          <FiExternalLink className="w-5 h-5 text-accent-blue" />
                          <span>Links Externos</span>
                        </h3>
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
                  )}
                </div>

                {/* Imagem do Compositor */}
                <AnimatedItem
                  direction="scale"
                  springType="bouncy"
                  className="flex justify-center order-1 md:order-2 lg:order-2 lg:justify-end"
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

          {/* Biografia */}
          {composer.bio && (
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
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-theme-elevated border border-theme-primary text-theme-primary text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 shadow-theme-medium">
                      Biografia cadastrada no sistema
                      <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-theme-elevated"></div>
                    </div>
                  </div>
                </div>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <div className="whitespace-pre-line text-theme-secondary leading-relaxed text-base classical-body">
                  {composer.bio
                    .split('\n')
                    .map((paragraph: string, index: number) => (
                      <p key={index} className="mb-4">
                        {paragraph}
                      </p>
                    ))}
                </div>
              </AnimatedItem>
            </AnimatedCard>
          )}
        </AnimatedContainer>
      </div>

      {/* Edit Modal */}
      <CreateComposerModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        epochs={epochs}
        roles={roles}
        editingComposer={composer}
      />
    </div>
  );
};

export default EditComposerClient;
