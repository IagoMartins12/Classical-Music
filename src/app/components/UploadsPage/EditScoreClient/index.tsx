// app/components/EditScoreClient.tsx - Layout atualizado
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
  FiEdit3,
  FiFile,
  FiDownload,
  FiUser,
  FiTag,
  FiInfo,
  FiClock,
  FiFileText,
  FiImage,
  FiExternalLink,
  FiMusic,
  FiLayers,
} from 'react-icons/fi';

import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
} from '../../animation/AnimatedComponents';
import Button from '../../Common/Button';
import CreateScoreModal from '../modals/CreateScoreModal';
import { useToast } from '@/app/hooks/useToast';

interface EditScoreClientProps {
  score: any;
  works: any[];
  isAdmin: boolean;
  userId: string;
}

const EditScoreClient = ({
  score,
  works,
  isAdmin,
  userId,
}: EditScoreClientProps) => {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const toast = useToast();
  const formatFileSize = (size?: string) => {
    if (!size) return 'Não informado';
    return size;
  };

  const getScoreTypeLabel = (type: string) => {
    const labels = {
      SCORES: 'Partituras',
      PARTS: 'Partes',
      ARRANGEMENTS: 'Arranjos',
      LIBRETTOS: 'Libretos',
      OTHERS: 'Outros',
      SOURCES: 'Fontes',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getSourceLabel = (source: string) => {
    const labels = {
      IMSLP: 'IMSLP',
      CUSTOM: 'Personalizada',
      UPLOAD: 'Upload',
    };
    return labels[source as keyof typeof labels] || source;
  };

  const getSourceColor = (source: string) => {
    const colors = {
      IMSLP: 'from-accent-blue to-accent-purple',
      CUSTOM: 'from-accent-green to-accent-blue',
      UPLOAD: 'from-accent-purple to-accent-red',
    };
    return (
      colors[source as keyof typeof colors] ||
      'from-theme-primary to-theme-secondary'
    );
  };

  const handleDelete = async () => {
    if (
      !confirm(`Tem certeza que deseja excluir a partitura "${score.title}"?`)
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/uploads/score/${score.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/uploads');
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir partitura');
      }
    } catch (error) {
      console.error('Erro ao excluir partitura:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao excluir partitura'
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
              Partituras
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
              Editar {score.title}
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
                          <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
                            <FiEdit3 className="w-5 h-5 text-theme-primary" />
                          </div>
                          <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gradient-brand classical-title leading-tight">
                              Editar Partitura
                            </h1>
                          </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title leading-tight">
                          {score.title}
                        </h1>

                        <div className="flex items-center space-x-2 text-xl text-theme-secondary mt-3">
                          <span>Da obra</span>
                          <Link
                            href={`/works/${score.work.id}`}
                            className="text-brand-primary hover:text-brand-secondary font-semibold transition-colors duration-300 classical-subtitle"
                          >
                            {score.work.title}
                          </Link>
                        </div>
                        <div className="flex items-center space-x-2 text-lg text-theme-tertiary mt-2">
                          <span>por</span>
                          <Link
                            href={`/composer/${score.work.composer.id}`}
                            className="text-brand-primary hover:text-brand-secondary font-medium transition-colors duration-300"
                          >
                            {score.work.composer.fullName ||
                              score.work.composer.name}
                          </Link>
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

                        {(isAdmin || score.uploadedBy === userId) && (
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

                    {/* Badge de Fonte */}
                    <div className="flex items-center space-x-3">
                      <div
                        className={`px-4 py-2 bg-gradient-to-r ${getSourceColor(
                          score.source
                        )} rounded-full flex items-center space-x-2 shadow-lg`}
                      >
                        <FiTag className="w-4 h-4 text-theme-primary" />
                        <span className="text-theme-primary font-semibold text-sm">
                          Fonte: {getSourceLabel(score.source)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Grid de Informações Detalhadas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Tipo */}
                    <div className="flex items-start space-x-3 group">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                        <FiLayers className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-theme-tertiary">
                          Tipo
                        </p>
                        <p className="text-theme-primary font-semibold">
                          {getScoreTypeLabel(score.type)}
                        </p>
                      </div>
                    </div>

                    {/* Formato */}
                    <div className="flex items-start space-x-3 group">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                        <FiFile className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-theme-tertiary">
                          Formato
                        </p>
                        <p className="text-theme-primary font-semibold">
                          {score.fileFormat || 'PDF'}
                        </p>
                      </div>
                    </div>

                    {/* Tamanho do Arquivo */}
                    {score.fileSize && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-red rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <FiDownload className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-tertiary">
                            Tamanho
                          </p>
                          <p className="text-theme-primary font-semibold">
                            {formatFileSize(score.fileSize)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Páginas */}
                    {score.pageCount && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <FiFileText className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-tertiary">
                            Páginas
                          </p>
                          <p className="text-theme-primary font-semibold">
                            {score.pageCount}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Grupo */}
                    {score.groupTitle && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-purple rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <FiTag className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-tertiary">
                            Grupo
                          </p>
                          <p className="text-theme-primary font-semibold">
                            {score.groupTitle}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Uploader */}
                    {score.uploader && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-red to-accent-purple rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <FiUser className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-tertiary">
                            Enviado por
                          </p>
                          <p className="text-theme-primary font-semibold">
                            {score.uploader}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Informações de Publicação */}
                  {(score.editor || score.publisher || score.copyright) && (
                    <div className="border-t border-theme-secondary pt-6">
                      <h3 className="text-lg font-semibold text-theme-primary classical-title mb-4 flex items-center space-x-2">
                        <FiFileText className="w-5 h-5 text-accent-blue" />
                        <span>Informações de Publicação</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {score.editor && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-theme-tertiary">
                              Editor:
                            </span>
                            <span className="text-theme-primary font-semibold">
                              {score.editor}
                            </span>
                          </div>
                        )}
                        {score.publisher && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-theme-tertiary">
                              Editora:
                            </span>
                            <span className="text-theme-primary font-semibold">
                              {score.publisher}
                            </span>
                          </div>
                        )}
                        {score.copyright && (
                          <div className="md:col-span-2 p-3 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-xl border border-theme-primary">
                            <span className="font-medium text-theme-tertiary block mb-1">
                              Copyright:
                            </span>
                            <span className="text-theme-primary whitespace-pre-line">
                              {score.copyright}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notas */}
                  {score.notes && (
                    <div className="border-t border-theme-secondary pt-6">
                      <h3 className="text-lg font-semibold text-theme-primary classical-title mb-4 flex items-center space-x-2">
                        <FiInfo className="w-5 h-5 text-accent-green" />
                        <span>Notas</span>
                      </h3>
                      <div className="p-4 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-xl border border-theme-primary">
                        <p className="text-theme-primary whitespace-pre-line">
                          {score.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Link de Download */}
                  {score.downloadUrl && (
                    <div className="border-t border-theme-secondary pt-6">
                      <h3 className="text-lg font-semibold text-theme-primary classical-title mb-4 flex items-center space-x-2">
                        <FiExternalLink className="w-5 h-5 text-accent-blue" />
                        <span>Arquivo</span>
                      </h3>
                      <a
                        href={score.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-classical-primary flex items-center space-x-2 group/btn w-fit"
                      >
                        <FiDownload className="w-4 h-4" />
                        <span>Download da Partitura</span>
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

                {/* Sidebar com Thumbnail e Obra */}
                <div className="space-y-6">
                  {/* Thumbnail da Partitura */}
                  {score.thumbnailUrl && (
                    <div className="classical-card-simple p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
                          <FiImage className="w-4 h-4 text-theme-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-theme-primary classical-title">
                          Miniatura
                        </h3>
                      </div>

                      <div className="text-center">
                        {!imageError ? (
                          <div className="relative w-full aspect-[3/4] mx-auto rounded-xl overflow-hidden shadow-theme-medium border border-theme-primary">
                            <Image
                              src={score.thumbnailUrl}
                              alt={`Thumbnail de ${score.title}`}
                              fill
                              sizes="256px"
                              className="object-cover"
                              onError={() => setImageError(true)}
                            />
                          </div>
                        ) : (
                          <div className="w-full aspect-[3/4] mx-auto bg-gradient-card border border-theme-primary rounded-xl flex items-center justify-center">
                            <FiFile className="w-12 h-12 text-theme-tertiary opacity-50" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Informações da Obra */}
                  <div className="classical-card-simple p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center">
                        <FiMusic className="w-4 h-4 text-theme-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-theme-primary classical-title">
                        Obra
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Link
                          href={`/work/${score.work.id}`}
                          className="text-brand-primary hover:text-brand-secondary font-semibold transition-colors duration-300 block text-lg"
                        >
                          {score.work.title}
                        </Link>
                        <Link
                          href={`/composer/${score.work.composer.id}`}
                          className="text-theme-secondary hover:text-brand-primary transition-colors duration-300 block mt-1"
                        >
                          {score.work.composer.fullName ||
                            score.work.composer.name}
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Detalhes Técnicos */}
                  <div className="classical-card-simple p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center">
                        <FiInfo className="w-4 h-4 text-theme-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-theme-primary classical-title">
                        Detalhes Técnicos
                      </h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      {score.groupIndex !== null && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-theme-tertiary">
                            Índice:
                          </span>
                          <span className="text-theme-primary font-semibold">
                            #{score.groupIndex}
                          </span>
                        </div>
                      )}
                      {score.uploadDate && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-theme-tertiary">
                            Upload:
                          </span>
                          <span className="text-theme-primary font-semibold text-xs">
                            {score.uploadDate}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-theme-secondary">
                        <span className="font-medium text-theme-tertiary">
                          Catalogado em:
                        </span>
                        <span className="text-theme-primary font-semibold text-xs">
                          {new Date(score.createdAt).toLocaleDateString(
                            'pt-BR'
                          )}
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
      <CreateScoreModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        works={works}
        editingScore={score}
      />
    </div>
  );
};

export default EditScoreClient;
