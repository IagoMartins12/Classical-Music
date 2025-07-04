// app/components/EditWorkClient.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiArrowLeft,
  FiSave,
  FiTrash2,
  FiLoader,
  FiExternalLink,
} from 'react-icons/fi';

import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
} from '../../animation/AnimatedComponents';
import Button from '../../Common/Button';
import CreateWorkModal from '../modals/CreateWorkModal';

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
        router.push('/uploads?success=work-deleted');
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir obra');
      }
    } catch (error) {
      console.error('Erro ao excluir obra:', error);
      alert(error instanceof Error ? error.message : 'Erro ao excluir obra');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                leftIcon={<FiArrowLeft />}
                onClick={() => router.push('/uploads')}
              >
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-theme-primary classical-title">
                  Editar Obra
                </h1>
                <p className="text-theme-secondary">
                  {work.title} - {work.composer.fullName || work.composer.name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
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
        </AnimatedItem>

        {/* Work Details */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="classical-card p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-theme-primary mb-2">
                    Informações Básicas
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-theme-tertiary">Título:</span>
                      <span className="ml-2 text-theme-primary">
                        {work.title}
                      </span>
                    </div>
                    {work.subtitle && (
                      <div>
                        <span className="text-theme-tertiary">Subtítulo:</span>
                        <span className="ml-2 text-theme-primary">
                          {work.subtitle}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-theme-tertiary">Compositor:</span>
                      <span className="ml-2 text-theme-primary">
                        {work.composer.fullName || work.composer.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-theme-tertiary">Instrumento:</span>
                      <span className="ml-2 text-theme-primary">
                        {work.instrument.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-theme-tertiary">Época:</span>
                      <span className="ml-2 text-theme-primary">
                        {work.epoch.name}
                      </span>
                    </div>
                  </div>
                </div>

                {work.opOrCatalog && (
                  <div>
                    <h3 className="text-lg font-semibold text-theme-primary mb-2">
                      Catálogo
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-theme-tertiary">
                          Op./Catálogo:
                        </span>
                        <span className="ml-2 text-theme-primary">
                          {work.opOrCatalog}
                        </span>
                      </div>
                      {work.compositionYear && (
                        <div>
                          <span className="text-theme-tertiary">Ano:</span>
                          <span className="ml-2 text-theme-primary">
                            {work.compositionYear}
                          </span>
                        </div>
                      )}
                      {work.tone && (
                        <div>
                          <span className="text-theme-tertiary">
                            Tonalidade:
                          </span>
                          <span className="ml-2 text-theme-primary">
                            {work.tone}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="space-y-6">
                {work.mediaDuration && (
                  <div>
                    <h3 className="text-lg font-semibold text-theme-primary mb-2">
                      Duração
                    </h3>
                    <p className="text-theme-secondary">{work.mediaDuration}</p>
                  </div>
                )}

                {work.instrumentation && (
                  <div>
                    <h3 className="text-lg font-semibold text-theme-primary mb-2">
                      Instrumentação
                    </h3>
                    <p className="text-theme-secondary">
                      {work.instrumentation}
                    </p>
                  </div>
                )}

                {work.categoryNames && work.categoryNames.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-theme-primary mb-2">
                      Categorias
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {work.categoryNames.map(
                        (category: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-theme-secondary text-theme-primary text-sm rounded-full"
                          >
                            {category}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {work.workGenresArr && work.workGenresArr.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-theme-primary mb-2">
                      Gêneros
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {work.workGenresArr.map(
                        (genre: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-accent-blue/10 text-accent-blue text-sm rounded-full"
                          >
                            {genre}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {work.imslpId && (
                  <div>
                    <h3 className="text-lg font-semibold text-theme-primary mb-2">
                      Links Externos
                    </h3>
                    <a
                      href={work.imslpPermlink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-accent-blue hover:text-accent-blue/80 transition-colors"
                    >
                      <FiExternalLink className="w-4 h-4" />
                      <span>Ver no IMSLP</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </AnimatedItem>
      </AnimatedContainer>

      {/* Edit Modal */}
      <CreateWorkModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        composers={composers}
        instruments={instruments}
        epochs={epochs}
        editingWork={work}
      />
    </PageContainer>
  );
};

export default EditWorkClient;
