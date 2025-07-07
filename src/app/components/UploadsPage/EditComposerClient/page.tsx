// app/components/EditComposerClient.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave, FiTrash2, FiLoader } from 'react-icons/fi';

import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
} from '../../animation/AnimatedComponents';
import Button from '../../Common/Button';
import CreateComposerModal from '../modals/CreateComposerModal';

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
        router.push('/uploads?success=composer-deleted');
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir compositor');
      }
    } catch (error) {
      console.error('Erro ao excluir compositor:', error);
      alert(
        error instanceof Error ? error.message : 'Erro ao excluir compositor'
      );
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
                  Editar Compositor
                </h1>
                <p className="text-theme-secondary">
                  {composer.fullName || composer.name}
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
        </AnimatedItem>

        {/* Composer Details */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="classical-card p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Image */}
              <div className="flex justify-center">
                {composer.portraitUrl ? (
                  <img
                    src={composer.portraitUrl}
                    alt={composer.fullName || composer.name}
                    className="w-64 h-64 object-cover rounded-xl border-2 border-theme-secondary"
                  />
                ) : (
                  <div className="w-64 h-64 bg-theme-secondary rounded-xl flex items-center justify-center">
                    <span className="text-theme-tertiary">Sem imagem</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-theme-primary mb-2">
                    Informações Básicas
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-theme-tertiary">Nome:</span>
                      <span className="ml-2 text-theme-primary">
                        {composer.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-theme-tertiary">
                        Nome Completo:
                      </span>
                      <span className="ml-2 text-theme-primary">
                        {composer.fullName}
                      </span>
                    </div>
                    {composer.otherName && (
                      <div>
                        <span className="text-theme-tertiary">
                          Nome Alternativo:
                        </span>
                        <span className="ml-2 text-theme-primary">
                          {composer.otherName}
                        </span>
                      </div>
                    )}
                    {composer.nationality && (
                      <div>
                        <span className="text-theme-tertiary">
                          Nacionalidade:
                        </span>
                        <span className="ml-2 text-theme-primary">
                          {composer.nationality}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-theme-primary mb-2">
                    Datas
                  </h3>
                  <div className="space-y-2">
                    {composer.birthDate && (
                      <div>
                        <span className="text-theme-tertiary">Nascimento:</span>
                        <span className="ml-2 text-theme-primary">
                          {composer.birthDate}
                        </span>
                      </div>
                    )}
                    {composer.deathDate && (
                      <div>
                        <span className="text-theme-tertiary">Morte:</span>
                        <span className="ml-2 text-theme-primary">
                          {composer.deathDate}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-theme-primary mb-2">
                    Classificação
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-theme-tertiary">Época:</span>
                      <span className="ml-2 text-theme-primary">
                        {composer.epoch.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-theme-tertiary">Papel:</span>
                      <span className="ml-2 text-theme-primary">
                        {composer.primaryRole.name}
                      </span>
                    </div>
                    {composer.instruments && (
                      <div>
                        <span className="text-theme-tertiary">
                          Instrumentos:
                        </span>
                        <span className="ml-2 text-theme-primary">
                          {composer.instruments}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {composer.bio && (
                  <div className="whitespace-pre-line text-theme-secondary leading-relaxed text-base classical-body">
                    <h3 className="text-lg font-semibold text-theme-primary mb-2">
                      Biografia
                    </h3>
                    <p className="text-theme-secondary leading-relaxed">
                      {composer.bio}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </AnimatedItem>
      </AnimatedContainer>

      {/* Edit Modal */}
      <CreateComposerModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        epochs={epochs}
        roles={roles}
        editingComposer={composer}
      />
    </PageContainer>
  );
};

export default EditComposerClient;
