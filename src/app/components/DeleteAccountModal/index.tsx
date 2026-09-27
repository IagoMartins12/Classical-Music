// app/components/profile/DeleteAccountModal.tsx - Enhanced modal for account deletion
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  PiBookBookmark,
  PiBookOpen,
  PiEnvelopeSimple,
  PiFileText,
  PiHeart,
  PiInfo,
  PiMusicNotes,
  PiPencilLine,
  PiSpinnerGap,
  PiTrash,
  PiUser,
  PiWarning,
  PiX,
} from 'react-icons/pi';
import Button from '../Common/Button';
import Input from '../Common/Inputs';
import { CascadeInfo } from '@/app/hooks/useAccountManagement';
import { useTranslation } from '@/app/context/TranslationContext';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';
import Modal from '@/app/components/Modal';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Recebe a senha atual quando `requirePassword` (a API a exige de quem tem senha). */
  onConfirm: (currentPassword?: string) => void;
  requirePassword?: boolean;
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
  requirePassword = false,
  onLoadCascadeInfo,
  isLoading,
  isCascadeLoading,
  cascadeInfo,
  userName,
  userEmail,
}) => {
  const { t } = useTranslation({ sections: ['pages/profile'] });
  const [mounted, setMounted] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
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
    setCurrentPassword('');
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

  // A tela em inglês pede "delete"; antes só "deletar" era aceito.
  const typedConfirmation = ['deletar', 'delete'].includes(
    confirmText.trim().toLowerCase()
  );
  const canProceed =
    typedConfirmation && (!requirePassword || currentPassword.length > 0);

  const handleConfirm = () => {
    if (canProceed) {
      onConfirm(requirePassword ? currentPassword : undefined);
    }
  };

  if (!mounted || !isOpen) return null;

  const dataItems = [
    {
      icon: PiUser,
      label: t('delete_modal_composers'),
      count: cascadeInfo?.composersCount || 0,
      color: '',
      samples: cascadeInfo?.sampleComposers,
    },
    {
      icon: PiMusicNotes,
      label: t('delete_modal_works'),
      count: cascadeInfo?.worksCount || 0,
      color: '',
      samples: cascadeInfo?.sampleWorks,
    },
    {
      icon: PiFileText,
      label: t('delete_modal_scores'),
      count: cascadeInfo?.scoresCount || 0,
      color: '',
    },
    {
      icon: PiPencilLine,
      label: t('delete_modal_annotations'),
      count: cascadeInfo?.annotationsCount || 0,
      color: '',
      samples: cascadeInfo?.sampleAnnotations,
    },
    {
      icon: PiHeart,
      label: t('delete_modal_favorites'),
      count: cascadeInfo?.favoritesCount || 0,
      color: '',
    },

    {
      icon: PiMusicNotes,
      label: t('delete_modal_instruments'),
      count: cascadeInfo?.instrumentsCount || 0,
      color: '',
    },

    {
      icon: PiBookOpen,
      label: t('delete_modal_learned_works'),
      count: cascadeInfo?.learnedWorksCount || 0,
      color: '',
    },
    {
      icon: PiBookBookmark,
      label: t('delete_modal_want_to_learn'),
      count: cascadeInfo?.wantToLearnCount || 0,
      color: '',
    },
  ];

  const modalContent = (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isLoading) handleClose();
      }}
      maxWidth="2xl"
      showCloseButton={false}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-theme-secondary">
        <Inline gap={3}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center">
            <PiWarning className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-theme-primary">
              {t('delete_modal_title')}
            </h3>
            <Text papel="rotulo" tom="suave" as="p">
              {t('delete_modal_subtitle')}
            </Text>
          </div>
        </Inline>

        <button
          onClick={handleClose}
          disabled={isLoading}
          className="w-8 h-8 rounded-lg bg-theme-secondary text-theme-tertiary transition-colors flex items-center justify-center disabled:opacity-50"
        >
          <PiX className="w-4 h-4" />
          <NomeAcao acao="fechar" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Step 1: Warning */}
        {currentStep === 'warning' && (
          <Stack gap={6}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <PiWarning className="w-8 h-8 text-red-500" />
              </div>
              <h4 className="text-lg font-semibold text-theme-primary mb-2">
                {t('delete_modal_sure')}
              </h4>
              <p className="text-theme-secondary">
                {t('delete_modal_warning')}
              </p>
            </div>

            <Stack gap={2} className="border border-red-400 rounded-lg p-4">
              <h5 className="font-medium flex items-center">
                <PiInfo className="w-4 h-4 mr-2" />
                {t('delete_modal_what_happens')}
              </h5>
              <ul className="text-sm opacity-90 space-y-1">
                <li>{t('delete_modal_data_removed')}</li>
                <li>{t('delete_modal_uploads_deleted')}</li>
                <li>{t('delete_modal_annotations_lost')}</li>
                <li>{t('delete_modal_history_erased')}</li>
                <li>{t('delete_modal_goodbye_email')}</li>
                <li>{t('delete_modal_irreversible')}</li>
              </ul>
            </Stack>

            <Stack gap={2} className="bg-theme-secondary rounded-lg p-4">
              <h5 className="font-medium text-theme-primary">
                {t('delete_modal_account_info')}
              </h5>
              <Stack gap={2} className="text-sm">
                <div className="flex justify-between">
                  <span className="text-theme-secondary">
                    {t('delete_modal_name')}
                  </span>
                  <span className="text-theme-primary font-medium">
                    {userName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-secondary">
                    {t('delete_modal_email')}
                  </span>
                  <span className="text-theme-primary font-mono">
                    {userEmail}
                  </span>
                </div>
              </Stack>
            </Stack>
          </Stack>
        )}

        {/* Step 2: Cascade Info */}
        {currentStep === 'cascade' && (
          <Stack gap={6}>
            <Stack gap={2} className="text-center">
              <h4 className="text-lg font-semibold text-theme-primary">
                {t('delete_modal_data_summary')}
              </h4>
              <p className="text-theme-secondary">
                {t('delete_modal_data_description')}
              </p>
            </Stack>

            {isCascadeLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <PiSpinnerGap className="w-8 h-8 text-ouro-texto animate-spin mx-auto mb-4" />
                  <p className="text-theme-secondary">
                    {t('delete_modal_analyzing')}
                  </p>
                </div>
              </div>
            ) : cascadeInfo ? (
              <Stack>
                {/* Summary */}
                <Stack
                  gap={1}
                  className="border border-red-400 rounded-lg p-4 text-center"
                >
                  <h5 className="font-bold text-lg">
                    {cascadeInfo.totalItems}
                  </h5>
                  <p className="text-sm">{t('delete_modal_total_items')}</p>
                </Stack>

                {/* Data Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {dataItems
                    .filter((item) => item.count > 0)
                    .map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={index}
                          className="bg-theme-secondary rounded-lg p-3 text-center transition-colors"
                        >
                          <div
                            className={`w-8 h-8 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center mx-auto mb-2`}
                          >
                            <Icon className="w-4 h-4 text-theme-primary" />
                          </div>
                          <div className="font-bold text-theme-primary">
                            {item.count}
                          </div>
                          <Text papel="legenda" tom="suave" as="div">
                            {item.label}
                          </Text>
                        </div>
                      );
                    })}
                </div>

                {/* Sample Data */}
                {(cascadeInfo.sampleComposers.length > 0 ||
                  cascadeInfo.sampleWorks.length > 0 ||
                  cascadeInfo.sampleAnnotations.length > 0) && (
                  <Stack gap={3} className="bg-theme-secondary rounded-lg p-4">
                    <h5 className="font-medium text-theme-primary flex items-center">
                      <PiInfo className="w-4 h-4 mr-2" />
                      {t('delete_modal_examples')}
                    </h5>
                    <div className="space-y-3 max-h-32 overflow-y-auto">
                      {cascadeInfo.sampleComposers
                        .slice(0, 3)
                        .map((composer) => (
                          <Inline gap={2} key={composer.id} className="text-sm">
                            <PiUser className="w-3 h-3 flex-shrink-0" />
                            <span className="text-theme-primary">
                              {composer.name}
                              {composer.epochName && (
                                <span className="text-theme-tertiary">
                                  {' '}
                                  ({composer.epochName})
                                </span>
                              )}
                            </span>
                          </Inline>
                        ))}
                      {cascadeInfo.sampleWorks.slice(0, 3).map((work) => (
                        <Inline gap={2} key={work.id} className="text-sm">
                          <PiMusicNotes className="w-3 h-3 flex-shrink-0" />
                          <span className="text-theme-primary">
                            {work.title}
                            <span className="text-theme-tertiary">
                              {' '}
                              - {work.composer.name}
                            </span>
                          </span>
                        </Inline>
                      ))}
                      {cascadeInfo.sampleAnnotations
                        .slice(0, 2)
                        .map((annotation) => (
                          <Inline
                            gap={2}
                            key={annotation.id}
                            className="text-sm"
                          >
                            <PiPencilLine className="w-3 h-3 flex-shrink-0" />
                            <span className="text-theme-primary">
                              {annotation.title}
                              <span className="text-theme-tertiary">
                                {' '}
                                ({annotation.work.title})
                              </span>
                            </span>
                          </Inline>
                        ))}
                    </div>
                  </Stack>
                )}

                {/* Additional Info */}
                <div className="bg-theme-elevated rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <PiEnvelopeSimple className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <Stack gap={1} className="text-sm">
                      <p className="font-medium">
                        {t('delete_modal_goodbye_email_info')}
                      </p>
                      <p className="opacity-90">
                        {t('delete_modal_goodbye_description')}
                      </p>
                    </Stack>
                  </div>
                </div>
              </Stack>
            ) : (
              <div className="text-center py-8">
                <PiInfo className="w-8 h-8 text-theme-tertiary mx-auto mb-4" />
                <p className="text-theme-secondary">
                  {t('delete_modal_error_loading')}
                </p>
              </div>
            )}
          </Stack>
        )}

        {/* Step 3: Final Confirmation */}
        {currentStep === 'confirm' && (
          <Stack gap={6}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <PiTrash className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-semibold text-theme-primary mb-2">
                {t('delete_modal_final_confirmation')}
              </h4>
              <p className="text-theme-secondary">
                {t('delete_modal_last_chance')}
              </p>
            </div>

            <Stack gap={2} className="border border-red-400 rounded-lg p-4">
              <h5 className="font-medium">
                {t('delete_modal_permanent_warning')}
              </h5>
              <p className="text-sm opacity-90">
                {t('delete_modal_immediate_removal')}
              </p>
            </Stack>

            <div>
              <Input
                label={t('delete_modal_type_delete')}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={t('delete_modal_placeholder_delete')}
                className="text-center font-mono"
                autoFocus
              />
              {confirmText && !typedConfirmation && (
                <p className="text-xs mt-1">{t('delete_modal_type_exactly')}</p>
              )}
            </div>

            {requirePassword && (
              <div>
                <Input
                  label={t('delete_modal_current_password')}
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            )}

            {cascadeInfo && (
              <div className="text-center p-3 bg-theme-secondary rounded-lg">
                <Text papel="rotulo" tom="suave" as="p">
                  <strong>{cascadeInfo.totalItems}</strong>{' '}
                  {t('delete_modal_items_removed')}
                </Text>
              </div>
            )}
          </Stack>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col-reverse md:flex-row gap-4 items-center justify-between p-6 border-t border-theme-secondary">
        <Inline gap={2}>
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
          <Text papel="legenda" tom="forte" className="ml-2">
            {t('delete_modal_step')}{' '}
            {['warning', 'cascade', 'confirm'].indexOf(currentStep) + 1}{' '}
            {t('delete_modal_of')} 3
          </Text>
        </Inline>

        <Inline gap={3}>
          {/* Back button */}
          {currentStep !== 'warning' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevStep}
              disabled={isLoading}
            >
              {t('delete_modal_back')}
            </Button>
          )}

          {/* Cancel button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isLoading}
          >
            {t('delete_modal_cancel')}
          </Button>

          {/* Action button */}
          {currentStep === 'confirm' ? (
            <Button
              variant="delete"
              size="sm"
              onClick={handleConfirm}
              isLoading={isLoading}
              disabled={!canProceed}
              leftIcon={<PiTrash />}
            >
              {isLoading
                ? t('delete_modal_deleting')
                : t('delete_modal_delete_permanently')}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleNextStep}
              disabled={isCascadeLoading}
              className="hover:bg-red-600"
            >
              {currentStep === 'warning'
                ? t('delete_modal_continue')
                : t('delete_modal_next')}
            </Button>
          )}
        </Inline>
      </div>
    </Modal>
  );

  return createPortal(modalContent, document.body);
};

export default DeleteAccountModal;
