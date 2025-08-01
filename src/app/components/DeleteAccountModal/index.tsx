// app/components/profile/DeleteAccountModal.tsx - Enhanced modal for account deletion
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FiAlertTriangle,
  FiTrash2,
  FiX,
  FiInfo,
  FiLoader,
  FiMail,
  FiUser,
  FiMusic,
  FiFileText,
  FiHeart,
  FiClock,
  FiEdit3,
  FiBookmark,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import Button from '../Common/Button';
import Input from '../Common/Inputs';
import { AnimatedCard } from '../animation/AnimatedComponents';
import { BiBookContent, BiBookOpen } from 'react-icons/bi';
import { CascadeInfo } from '@/app/hooks/useAccountManagement';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onLoadCascadeInfo: () => void;
  isLoading: boolean;
  isCascadeLoading: boolean;
  cascadeInfo?: CascadeInfo | null | undefined;
  userName: string;
  userEmail: string;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onLoadCascadeInfo,
  isLoading,
  isCascadeLoading,
  cascadeInfo,
  userName,
  userEmail,
}) => {
  const [mounted, setMounted] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [currentStep, setCurrentStep] = useState<
    'warning' | 'cascade' | 'confirm'
  >('warning');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isLoading) return;
    setCurrentStep('warning');
    setConfirmText('');
    onClose();
  };

  const handleNextStep = () => {
    if (currentStep === 'warning') {
      setCurrentStep('cascade');
      onLoadCascadeInfo();
    } else if (currentStep === 'cascade') {
      setCurrentStep('confirm');
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 'confirm') {
      setCurrentStep('cascade');
    } else if (currentStep === 'cascade') {
      setCurrentStep('warning');
    }
  };

  const handleConfirm = () => {
    if (confirmText.toLowerCase() === 'deletar') {
      onConfirm();
    }
  };

  const canProceed = confirmText.toLowerCase() === 'deletar';

  if (!mounted || !isOpen) return null;

  const dataItems = [
    {
      icon: FiUser,
      label: 'Compositores',
      count: cascadeInfo?.composersCount || 0,
      color: 'from-accent-purple to-accent-blue',
      samples: cascadeInfo?.sampleComposers,
    },
    {
      icon: FiMusic,
      label: 'Obras',
      count: cascadeInfo?.worksCount || 0,
      color: 'from-accent-blue to-accent-green',
      samples: cascadeInfo?.sampleWorks,
    },
    {
      icon: FiFileText,
      label: 'Partituras',
      count: cascadeInfo?.scoresCount || 0,
      color: 'from-accent-green to-accent-amber',
    },
    {
      icon: FiEdit3,
      label: 'Anotações',
      count: cascadeInfo?.annotationsCount || 0,
      color: 'from-accent-amber to-accent-red',
      samples: cascadeInfo?.sampleAnnotations,
    },
    {
      icon: FiHeart,
      label: 'Favoritos',
      count: cascadeInfo?.favoritesCount || 0,
      color: 'from-accent-red to-accent-purple',
    },
    {
      icon: FiClock,
      label: 'Sessões de Estudo',
      count: cascadeInfo?.studySessionsCount || 0,
      color: 'from-accent-purple to-accent-blue',
    },
    {
      icon: GiMusicalNotes,
      label: 'Instrumentos',
      count: cascadeInfo?.instrumentsCount || 0,
      color: 'from-accent-blue to-accent-green',
    },
    {
      icon: FiBookmark,
      label: 'Marcadores',
      count: cascadeInfo?.bookmarksCount || 0,
      color: 'from-accent-green to-accent-amber',
    },
    {
      icon: BiBookOpen,
      label: 'Peças aprendidas',
      count: cascadeInfo?.learnedWorksCount || 0,
      color: 'from-accent-green to-accent-amber',
    },
    {
      icon: BiBookContent,
      label: 'Peças que deseja aprender',
      count: cascadeInfo?.wantToLearnCount || 0,
      color: 'from-accent-green to-accent-amber',
    },
  ];

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={!isLoading ? handleClose : undefined}
      />

      <AnimatedCard
        hover="none"
        className="relative bg-theme-primary rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-theme-secondary"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-secondary bg-accent-red/5">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-accent-red/10 rounded-xl flex items-center justify-center">
              <FiAlertTriangle className="w-6 h-6 text-accent-red" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-theme-primary">
                Deletar Conta Permanentemente
              </h3>
              <p className="text-sm text-theme-secondary">
                Esta ação não pode ser desfeita
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-lg bg-theme-secondary hover:bg-theme-tertiary text-theme-tertiary hover:text-theme-primary transition-colors flex items-center justify-center disabled:opacity-50"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Warning */}
          {currentStep === 'warning' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiAlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h4 className="text-lg font-semibold text-theme-primary mb-2">
                  Você tem certeza?
                </h4>
                <p className="text-theme-secondary">
                  Deletar sua conta removerá permanentemente todos os seus dados
                  e não poderá ser desfeito.
                </p>
              </div>

              <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-4">
                <h5 className="font-medium text-accent-red mb-2 flex items-center">
                  <FiInfo className="w-4 h-4 mr-2" />O que acontecerá:
                </h5>
                <ul className="text-sm text-accent-red opacity-90 space-y-1">
                  <li>• Todos os seus dados serão removidos permanentemente</li>
                  <li>
                    • Seus uploads (compositores, obras, partituras) serão
                    deletados
                  </li>
                  <li>• Suas anotações e favoritos serão perdidos</li>
                  <li>• Seu histórico de estudos será apagado</li>
                  <li>• Você receberá um email de despedida</li>
                  <li>• Esta ação não pode ser revertida</li>
                </ul>
              </div>

              <div className="bg-theme-secondary rounded-lg p-4">
                <h5 className="font-medium text-theme-primary mb-2">
                  Informações da sua conta:
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-theme-secondary">Nome:</span>
                    <span className="text-theme-primary font-medium">
                      {userName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-secondary">Email:</span>
                    <span className="text-theme-primary font-mono">
                      {userEmail}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Cascade Info */}
          {currentStep === 'cascade' && (
            <div className="space-y-6">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-theme-primary mb-2">
                  📊 Seus dados que serão removidos
                </h4>
                <p className="text-theme-secondary">
                  Aqui está um resumo de tudo que será deletado permanentemente:
                </p>
              </div>

              {isCascadeLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <FiLoader className="w-8 h-8 text-brand-primary animate-spin mx-auto mb-4" />
                    <p className="text-theme-secondary">
                      Analisando seus dados...
                    </p>
                  </div>
                </div>
              ) : cascadeInfo ? (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="bg-accent-amber/10 border border-accent-amber/20 rounded-lg p-4 text-center">
                    <h5 className="font-bold text-accent-amber text-lg mb-1">
                      {cascadeInfo.totalItems}
                    </h5>
                    <p className="text-accent-amber text-sm">
                      itens totais serão removidos
                    </p>
                  </div>

                  {/* Data Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {dataItems
                      .filter((item) => item.count > 0)
                      .map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={index}
                            className="bg-theme-secondary rounded-lg p-3 text-center hover:bg-theme-tertiary transition-colors"
                          >
                            <div
                              className={`w-8 h-8 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center mx-auto mb-2`}
                            >
                              <Icon className="w-4 h-4 text-theme-primary" />
                            </div>
                            <div className="font-bold text-theme-primary">
                              {item.count}
                            </div>
                            <div className="text-xs text-theme-secondary">
                              {item.label}
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Sample Data */}
                  {(cascadeInfo.sampleComposers.length > 0 ||
                    cascadeInfo.sampleWorks.length > 0 ||
                    cascadeInfo.sampleAnnotations.length > 0) && (
                    <div className="bg-theme-secondary rounded-lg p-4">
                      <h5 className="font-medium text-theme-primary mb-3 flex items-center">
                        <FiInfo className="w-4 h-4 mr-2" />
                        Exemplos dos seus dados:
                      </h5>
                      <div className="space-y-3 max-h-32 overflow-y-auto">
                        {cascadeInfo.sampleComposers
                          .slice(0, 3)
                          .map((composer) => (
                            <div
                              key={composer.id}
                              className="flex items-center space-x-2 text-sm"
                            >
                              <FiUser className="w-3 h-3 text-accent-purple flex-shrink-0" />
                              <span className="text-theme-primary">
                                {composer.name}
                                {composer.epochName && (
                                  <span className="text-theme-tertiary">
                                    {' '}
                                    ({composer.epochName})
                                  </span>
                                )}
                              </span>
                            </div>
                          ))}
                        {cascadeInfo.sampleWorks.slice(0, 3).map((work) => (
                          <div
                            key={work.id}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <FiMusic className="w-3 h-3 text-accent-blue flex-shrink-0" />
                            <span className="text-theme-primary">
                              {work.title}
                              <span className="text-theme-tertiary">
                                {' '}
                                - {work.composer.name}
                              </span>
                            </span>
                          </div>
                        ))}
                        {cascadeInfo.sampleAnnotations
                          .slice(0, 2)
                          .map((annotation) => (
                            <div
                              key={annotation.id}
                              className="flex items-center space-x-2 text-sm"
                            >
                              <FiEdit3 className="w-3 h-3 text-accent-green flex-shrink-0" />
                              <span className="text-theme-primary">
                                {annotation.title}
                                <span className="text-theme-tertiary">
                                  {' '}
                                  ({annotation.work.title})
                                </span>
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="bg-accent-blue/10 border border-accent-blue/20 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <FiMail className="w-4 h-4 text-accent-blue mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-accent-blue">
                        <p className="font-medium mb-1">Email de despedida</p>
                        <p className="opacity-90">
                          Você receberá um email com o resumo da sua jornada na
                          plataforma e confirmação da exclusão.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiInfo className="w-8 h-8 text-theme-tertiary mx-auto mb-4" />
                  <p className="text-theme-secondary">
                    Erro ao carregar informações. Tente novamente.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Final Confirmation */}
          {currentStep === 'confirm' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTrash2 className="w-8 h-8 text-accent-red" />
                </div>
                <h4 className="text-lg font-semibold text-theme-primary mb-2">
                  ⚠️ Confirmação Final
                </h4>
                <p className="text-theme-secondary">
                  Esta é sua última chance de cancelar. Esta ação é
                  irreversível.
                </p>
              </div>

              <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-4">
                <h5 className="font-medium text-accent-red mb-2">
                  ⚠️ ATENÇÃO: Esta ação é permanente!
                </h5>
                <p className="text-sm text-accent-red opacity-90">
                  Ao confirmar, todos os seus dados serão removidos
                  imediatamente e não poderão ser recuperados.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  Para confirmar, digite <strong>&quot;deletar&quot;</strong>{' '}
                  abaixo:
                </label>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="deletar"
                  className="text-center font-mono"
                  autoFocus
                />
                {confirmText && !canProceed && (
                  <p className="text-xs text-accent-red mt-1">
                    Digite exatamente &quot;deletar&quot; para continuar
                  </p>
                )}
              </div>

              {cascadeInfo && (
                <div className="text-center p-3 bg-theme-secondary rounded-lg">
                  <p className="text-sm text-theme-secondary">
                    <strong>{cascadeInfo.totalItems}</strong> itens serão
                    removidos permanentemente
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-theme-secondary bg-theme-secondary/30">
          <div className="flex items-center space-x-2">
            {/* Step indicator */}
            <div className="flex space-x-2">
              {['warning', 'cascade', 'confirm'].map((step, index) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    step === currentStep
                      ? 'bg-red-400'
                      : index <
                        ['warning', 'cascade', 'confirm'].indexOf(currentStep)
                      ? 'bg-green-400'
                      : 'bg-theme-tertiary'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-theme-primary ml-2">
              Passo {['warning', 'cascade', 'confirm'].indexOf(currentStep) + 1}{' '}
              de 3
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Back button */}
            {currentStep !== 'warning' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevStep}
                disabled={isLoading}
              >
                Voltar
              </Button>
            )}

            {/* Cancel button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>

            {/* Action button */}
            {currentStep === 'confirm' ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirm}
                isLoading={isLoading}
                disabled={!canProceed}
                className="bg-accent-red hover:bg-red-600 border-accent-red"
                leftIcon={<FiTrash2 />}
              >
                {isLoading ? 'Deletando...' : 'Deletar Permanentemente'}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleNextStep}
                disabled={isCascadeLoading}
                className="bg-accent-red hover:bg-red-600 border-accent-red"
              >
                {currentStep === 'warning' ? 'Continuar' : 'Próximo'}
              </Button>
            )}
          </div>
        </div>
      </AnimatedCard>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DeleteAccountModal;
