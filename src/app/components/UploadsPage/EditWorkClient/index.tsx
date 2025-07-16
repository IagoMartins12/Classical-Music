// app/components/EditWorkClient.tsx - Layout atualizado
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  FiArrowLeft,
  FiSave,
  FiTrash2,
  FiLoader,
  FiExternalLink,
  FiEdit3,
  FiCalendar,
  FiMusic,
  FiClock,
  FiMapPin,
  FiUser,
  FiTarget,
  FiTag,
  FiLayers,
  FiActivity,
  FiBookOpen,
} from 'react-icons/fi';
import { GiMusicalNotes, GiMetronome } from 'react-icons/gi';

import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
} from '../../animation/AnimatedComponents';
import Button from '../../Common/Button';
import CreateWorkModal from '../modals/CreateWorkModal';
import { useToast } from '@/app/hooks/useToast';

interface EditWorkClientProps {
  work: any;
  composers: any[];
  instruments: any[];
  epochs: any[];
  isAdmin: boolean;
  userId: string;
}

const EditWorkClient = ({
  work,
  composers,
  instruments,
  epochs,
  isAdmin,
  userId,
}: EditWorkClientProps) => {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  console.log('teste', { work, composers });
  const formatDuration = (duration?: string) => {
    if (!duration) return null;
    return duration;
  };

  const toast = useToast();

  const getWorkTypeLabel = (type: string) => {
    const labels = {
      INDIVIDUAL: 'Obra Individual',
      COMPLETE_WORK: 'Obra Completa',
      ARRANGEMENT: 'Arranjo',
      COLLECTION: 'Coleção de peças',
      COLLABORATION: 'Colaboração',
      COMPOSITION: 'Composição Original',
      COLLECTED_WORKS: 'Coleção de peças',
      COLLECTIONS_WITH: 'Coleção com outros',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getDifficultyLabel = (level?: string) => {
    const labels = {
      BEGINNER: 'Iniciante',
      INTERMEDIATE: 'Intermediário',
      ADVANCED: 'Avançado',
    };
    return level ? labels[level as keyof typeof labels] || level : null;
  };

  const getDifficultyColor = (level?: string) => {
    const colors = {
      BEGINNER: 'from-accent-green to-accent-blue',
      INTERMEDIATE: 'from-accent-blue to-accent-purple',
      ADVANCED: 'from-accent-red to-accent-purple',
    };
    return level
      ? colors[level as keyof typeof colors] ||
          'from-theme-primary to-theme-secondary'
      : 'from-theme-primary to-theme-secondary';
  };

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir a obra "${work.title}"?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/uploads/work/${work.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/uploads');
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir obra');
      }
    } catch (error) {
      console.error('Erro ao excluir obra:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao excluir obra'
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
              Obras
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
              Editar {work.title}
            </span>
          </nav>
        </AnimatedItem>

        <AnimatedContainer
          delay={0.1}
          staggerSpeed="normal"
          className="flex flex-col gap-4"
        >
          {/* Header Principal */}
          <AnimatedCard
            hover="lift"
            className="classical-card overflow-hidden relative"
          >
            <div className="p-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Informações Principais */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Título e Header */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
                            <FiEdit3 className="w-5 h-5 text-theme-primary" />
                          </div>
                          <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gradient-brand classical-title leading-tight">
                              Editar Obra
                            </h1>
                          </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title leading-tight">
                          {work.title}
                        </h1>

                        {/* Subtitle */}
                        {work.subtitle && (
                          <h2 className="text-2xl md:text-3xl text-theme-secondary mt-2 classical-subtitle font-medium">
                            {work.subtitle}
                          </h2>
                        )}

                        <div className="flex items-center space-x-2 text-xl text-theme-secondary mt-3">
                          <span>por</span>
                          <Link
                            href={`/composer/${work.composer.id}`}
                            className="text-brand-primary hover:text-brand-secondary font-semibold transition-colors duration-300 classical-subtitle"
                          >
                            {work.composer.fullName || work.composer.name}
                          </Link>
                        </div>
                        {work.opOrCatalog && (
                          <p className="text-lg text-theme-tertiary mt-2 font-medium">
                            {work.opOrCatalog}
                          </p>
                        )}
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

                        {(isAdmin || work.createdBy === userId) && (
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

                    {/* Difficulty Level Badge */}
                    {work.difficultyLevel && (
                      <div className="flex items-center space-x-3">
                        <div
                          className={`px-4 py-2 bg-gradient-to-r ${getDifficultyColor(
                            work.difficultyLevel
                          )} rounded-full flex items-center space-x-2 shadow-lg`}
                        >
                          <FiTarget className="w-4 h-4 text-theme-primary" />
                          <span className="text-theme-primary font-semibold text-sm">
                            Nível: {getDifficultyLabel(work.difficultyLevel)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Grid de Informações Detalhadas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Ano de Composição */}
                    {work.compositionYear && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <FiCalendar className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-tertiary">
                            Ano de Composição
                          </p>
                          <p className="text-theme-primary font-semibold">
                            {work.compositionYear}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Duração */}
                    {work.mediaDuration && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <FiClock className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-tertiary">
                            Duração
                          </p>
                          <p className="text-theme-primary font-semibold">
                            {formatDuration(work.mediaDuration)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tom */}
                    {work.tone && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <FiMusic className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-tertiary">
                            Tom
                          </p>
                          <p className="text-theme-primary font-semibold">
                            {work.tone}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Time Signature */}
                    {work.timeSignature && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-red to-accent-purple rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <FiActivity className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-tertiary">
                            Fórmula de Compasso
                          </p>
                          <p className="text-theme-primary font-semibold">
                            {work.timeSignature}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tempo Marking */}
                    {work.tempoMarking && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-purple rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <GiMetronome className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-tertiary">
                            Indicação de Tempo
                          </p>
                          <p className="text-theme-primary font-semibold">
                            {work.tempoMarking}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Instrumento */}
                    <div className="flex items-start space-x-3 group">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                        <GiMusicalNotes className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-theme-tertiary">
                          Instrumento
                        </p>
                        <p className="text-theme-primary font-semibold">
                          {work.instrument.name}
                        </p>
                      </div>
                    </div>

                    {/* Época */}
                    <div className="flex items-start space-x-3 group">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-red to-accent-purple rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                        <FiMapPin className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-theme-tertiary">
                          Época/Estilo
                        </p>
                        <p className="text-brand-primary font-semibold">
                          {work.epoch.name}
                        </p>
                      </div>
                    </div>

                    {/* Tipo de Obra */}
                    <div className="flex items-start space-x-3 group">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                        <FiLayers className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-theme-tertiary">
                          Tipo
                        </p>
                        <p className="text-theme-primary font-semibold">
                          {getWorkTypeLabel(work.workType)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Informações Adicionais */}
                  {(work.firstPublishDate ||
                    work.dedicateTo ||
                    work.workStyle ||
                    work.instrumentation) && (
                    <div className="border-t border-theme-secondary pt-6">
                      <h3 className="text-lg font-semibold text-theme-primary classical-title mb-4 flex items-center space-x-2">
                        <FiBookOpen className="w-5 h-5 text-accent-blue" />
                        <span>Informações Adicionais</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {work.firstPublishDate && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-theme-tertiary">
                              Primeira Publicação:
                            </span>
                            <span className="text-theme-primary font-semibold">
                              {work.firstPublishDate}
                            </span>
                          </div>
                        )}
                        {work.dedicateTo && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-theme-tertiary">
                              Dedicada a:
                            </span>
                            <span className="text-theme-primary font-semibold">
                              {work.dedicateTo}
                            </span>
                          </div>
                        )}
                        {work.workStyle && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-theme-tertiary">
                              Estilo:
                            </span>
                            <span className="text-theme-primary font-semibold">
                              {work.workStyle}
                            </span>
                          </div>
                        )}
                        {work.instrumentation && (
                          <div className="md:col-span-2 p-3 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-xl border border-theme-primary">
                            <span className="font-medium text-theme-tertiary block mb-1">
                              Instrumentação:
                            </span>
                            <span className="text-theme-primary whitespace-pre-line">
                              {work.instrumentation}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags de Categorias e Gêneros */}
                  {(work.categoryNames?.length > 0 ||
                    work.workGenresArr?.length > 0) && (
                    <div className="border-t border-theme-secondary pt-6">
                      <h3 className="text-lg font-semibold text-theme-primary classical-title mb-4 flex items-center space-x-2">
                        <FiTag className="w-5 h-5 text-accent-green" />
                        <span>Categorias e Gêneros</span>
                      </h3>
                      <div className="space-y-4">
                        {work.categoryNames?.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-theme-tertiary block mb-3">
                              Categorias:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {work.categoryNames.map(
                                (categoryName: string, index: number) => (
                                  <span
                                    key={index}
                                    className="px-4 py-2 bg-gradient-to-r border border-brand-primary/30 text-brand-primary rounded-full text-sm font-medium"
                                  >
                                    {categoryName}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {work.workGenresArr?.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-theme-tertiary block mb-3">
                              Tipos de Obra:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {work.workGenresArr.map(
                                (workGenre: string, index: number) => (
                                  <span
                                    key={index}
                                    className="capitalize px-4 py-2 bg-gradient-to-r from-accent-green/10 to-accent-blue/10 border border-accent-green/30 text-accent-green rounded-full text-sm font-medium"
                                  >
                                    {workGenre}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Link IMSLP */}
                  {work.imslpPermlink && (
                    <div className="border-t border-theme-secondary pt-6">
                      <h3 className="text-lg font-semibold text-theme-primary classical-title mb-4 flex items-center space-x-2">
                        <FiExternalLink className="w-5 h-5 text-accent-blue" />
                        <span>Link Externo</span>
                      </h3>
                      <a
                        href={work.imslpPermlink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-classical-primary flex items-center space-x-2 group/btn w-fit"
                      >
                        <FiBookOpen className="w-4 h-4" />
                        <span>Ver no IMSLP</span>
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
                    </div>
                  )}
                </div>

                {/* Sidebar com Foto do Compositor */}
                <div className="space-y-6">
                  {/* Foto do Compositor */}
                  <div className="classical-card-simple p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center">
                        <FiUser className="w-4 h-4 text-theme-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-theme-primary classical-title">
                        Compositor
                      </h3>
                    </div>

                    <div className="text-center space-y-4">
                      {work.composer.portraitUrl && !imageError ? (
                        <div className="relative w-32 h-40 mx-auto rounded-xl overflow-hidden shadow-theme-medium border border-theme-primary">
                          <Image
                            src={work.composer.portraitUrl}
                            alt={work.composer.fullName || work.composer.name}
                            fill
                            sizes="128px"
                            className="object-cover"
                            onError={() => setImageError(true)}
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-40 mx-auto bg-gradient-card border border-theme-primary rounded-xl flex items-center justify-center">
                          <FiUser className="w-8 h-8 text-theme-tertiary opacity-50" />
                        </div>
                      )}

                      <div>
                        <Link
                          href={`/composer/${work.composer.id}`}
                          className="text-brand-primary hover:text-brand-secondary font-semibold transition-colors duration-300 block"
                        >
                          {work.composer.fullName || work.composer.name}
                        </Link>
                        <p className="text-theme-secondary text-sm mt-1">
                          {work.epoch.name}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Detalhes Técnicos */}
                  <div className="classical-card-simple p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
                        <FiBookOpen className="w-4 h-4 text-theme-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-theme-primary classical-title">
                        Detalhes Técnicos
                      </h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      {work.movementNumber && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-theme-tertiary">
                            Movimento:
                          </span>
                          <span className="text-theme-primary font-semibold">
                            #{work.movementNumber}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-theme-secondary">
                        <span className="font-medium text-theme-tertiary">
                          Catalogado em:
                        </span>
                        <span className="text-theme-primary font-semibold text-xs">
                          {new Date(work.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </AnimatedContainer>
      </div>

      {/* Edit Modal */}
      <CreateWorkModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        composers={composers}
        instruments={instruments}
        epochs={epochs}
        editingWork={work}
      />
    </div>
  );
};

export default EditWorkClient;
