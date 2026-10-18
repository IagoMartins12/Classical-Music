'use client';
import { PERFIL } from '@/app/conteudo/textos/perfil';
import { useTextos } from '@/app/hooks/useTextos';
import { Button } from '@/app/components/ui/Button';

import { useState } from 'react';
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
} from 'react-icons/pi';
import { CascadeInfo } from '@/app/hooks/useAccountManagement';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';

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
  const { t } = useTextos(PERFIL);
  const [confirmText, setConfirmText] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [currentStep, setCurrentStep] = useState<
    'warning' | 'cascade' | 'confirm'
  >('warning');

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

  const dataItems = [
    {
      icon: PiUser,
      label: t('delete_modal_composers'),
      count: cascadeInfo?.composersCount || 0,
      samples: cascadeInfo?.sampleComposers,
    },
    {
      icon: PiMusicNotes,
      label: t('delete_modal_works'),
      count: cascadeInfo?.worksCount || 0,
      samples: cascadeInfo?.sampleWorks,
    },
    {
      icon: PiFileText,
      label: t('delete_modal_scores'),
      count: cascadeInfo?.scoresCount || 0,
    },
    {
      icon: PiPencilLine,
      label: t('delete_modal_annotations'),
      count: cascadeInfo?.annotationsCount || 0,
      samples: cascadeInfo?.sampleAnnotations,
    },
    {
      icon: PiHeart,
      label: t('delete_modal_favorites'),
      count: cascadeInfo?.favoritesCount || 0,
    },

    {
      icon: PiMusicNotes,
      label: t('delete_modal_instruments'),
      count: cascadeInfo?.instrumentsCount || 0,
    },

    {
      icon: PiBookOpen,
      label: t('delete_modal_learned_works'),
      count: cascadeInfo?.learnedWorksCount || 0,
    },
    {
      icon: PiBookBookmark,
      label: t('delete_modal_want_to_learn'),
      count: cascadeInfo?.wantToLearnCount || 0,
    },
  ];

  const steps = ['warning', 'cascade', 'confirm'] as const;
  const stepIndex = steps.indexOf(currentStep);
  const muted = 'text-texto-suave';

  const footer = (
    <div className="flex w-full flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="flex gap-1.5">
          {steps.map((step, index) => (
            <span
              key={step}
              className={cx(
                'h-1.5 w-6 rounded-full transition-colors',
                index <= stepIndex ? 'bg-[var(--erro)]' : 'bg-[var(--linha)]'
              )}
            />
          ))}
        </span>
        <span className="t-legenda">
          {t('delete_modal_step')} {stepIndex + 1} {t('delete_modal_of')} 3
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {currentStep !== 'warning' && (
          <Button
            variante="fantasma"
            onClick={handlePrevStep}
            disabled={isLoading}
          >
            {t('delete_modal_back')}
          </Button>
        )}
        <Button
          variante="secundario"
          onClick={handleClose}
          disabled={isLoading}
        >
          {t('delete_modal_cancel')}
        </Button>
        {currentStep === 'confirm' ? (
          <Button
            variante="perigo"
            icone={PiTrash}
            onClick={handleConfirm}
            carregando={isLoading}
            disabled={!canProceed}
          >
            {isLoading
              ? t('delete_modal_deleting')
              : t('delete_modal_delete_permanently')}
          </Button>
        ) : (
          <Button
            variante="primario"
            onClick={handleNextStep}
            disabled={isCascadeLoading}
          >
            {currentStep === 'warning'
              ? t('delete_modal_continue')
              : t('delete_modal_next')}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Sheet
      aberto={isOpen}
      aoFechar={() => {
        if (!isLoading) handleClose();
      }}
      titulo={t('delete_modal_title')}
      descricao={t('delete_modal_subtitle')}
      largura="m"
      rodape={footer}
    >
      {currentStep === 'warning' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-sup-2 text-[var(--erro)]">
              <Icon de={PiWarning} tamanho="m" />
            </span>
            <h3 className="font-display text-[1.375rem]">
              {t('delete_modal_sure')}
            </h3>
            <p className={cx('t-corpo', muted)}>{t('delete_modal_warning')}</p>
          </div>

          <section className="flex flex-col gap-3 rounded-card bg-sup-2 p-5">
            <h4 className="flex items-center gap-2 font-medium">
              <Icon de={PiInfo} tamanho="p" />
              {t('delete_modal_what_happens')}
            </h4>
            <ul className={cx('flex flex-col gap-1.5 text-sm', muted)}>
              <li>{t('delete_modal_data_removed')}</li>
              <li>{t('delete_modal_uploads_deleted')}</li>
              <li>{t('delete_modal_annotations_lost')}</li>
              <li>{t('delete_modal_history_erased')}</li>
              <li>{t('delete_modal_goodbye_email')}</li>
              <li>{t('delete_modal_irreversible')}</li>
            </ul>
          </section>

          <dl className="grid gap-2 rounded-card bg-sup-2 p-5 text-sm">
            <h4 className="mb-1 font-medium">
              {t('delete_modal_account_info')}
            </h4>
            <div className="flex justify-between gap-4">
              <dt className={muted}>{t('delete_modal_name')}</dt>
              <dd className="font-medium">{userName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className={muted}>{t('delete_modal_email')}</dt>
              <dd className="break-all font-mono">{userEmail}</dd>
            </div>
          </dl>
        </div>
      )}

      {currentStep === 'cascade' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h3 className="font-display text-[1.375rem]">
              {t('delete_modal_data_summary')}
            </h3>
            <p className={cx('t-corpo', muted)}>
              {t('delete_modal_data_description')}
            </p>
          </div>

          {isCascadeLoading ? (
            <div
              role="status"
              className="flex flex-col items-center gap-3 py-12 text-center"
            >
              <Icon
                de={PiSpinnerGap}
                tamanho="m"
                className="animate-spin text-ouro-texto"
              />
              <p className={muted}>{t('delete_modal_analyzing')}</p>
            </div>
          ) : cascadeInfo ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center gap-1 rounded-card bg-sup-2 p-5 text-center">
                <span className="t-dado font-display text-[2rem] leading-none">
                  {cascadeInfo.totalItems}
                </span>
                <p className={cx('text-sm', muted)}>
                  {t('delete_modal_total_items')}
                </p>
              </div>

              <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {dataItems
                  .filter((item) => item.count > 0)
                  .map((item) => (
                    <li
                      key={item.label}
                      className="flex flex-col items-center gap-1 rounded-card bg-sup-2 p-3 text-center"
                    >
                      <Icon de={item.icon} tamanho="p" className={muted} />
                      <span className="t-dado font-medium">{item.count}</span>
                      <span className="t-legenda">{item.label}</span>
                    </li>
                  ))}
              </ul>

              {(cascadeInfo.sampleComposers.length > 0 ||
                cascadeInfo.sampleWorks.length > 0 ||
                cascadeInfo.sampleAnnotations.length > 0) && (
                <section className="flex flex-col gap-3 rounded-card bg-sup-2 p-5">
                  <h4 className="flex items-center gap-2 font-medium">
                    <Icon de={PiInfo} tamanho="p" />
                    {t('delete_modal_examples')}
                  </h4>
                  <ul className="flex max-h-36 flex-col gap-2 overflow-y-auto text-sm">
                    {cascadeInfo.sampleComposers.slice(0, 3).map((composer) => (
                      <li key={composer.id} className="flex items-start gap-2">
                        <Icon de={PiUser} tamanho="pp" className="mt-0.5" />
                        <span>
                          {composer.name}
                          {composer.epochName && (
                            <span className={muted}>
                              {' '}
                              ({composer.epochName})
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                    {cascadeInfo.sampleWorks.slice(0, 3).map((work) => (
                      <li key={work.id} className="flex items-start gap-2">
                        <Icon
                          de={PiMusicNotes}
                          tamanho="pp"
                          className="mt-0.5"
                        />
                        <span>
                          {work.title}
                          <span className={muted}> - {work.composer.name}</span>
                        </span>
                      </li>
                    ))}
                    {cascadeInfo.sampleAnnotations
                      .slice(0, 2)
                      .map((annotation) => (
                        <li
                          key={annotation.id}
                          className="flex items-start gap-2"
                        >
                          <Icon
                            de={PiPencilLine}
                            tamanho="pp"
                            className="mt-0.5"
                          />
                          <span>
                            {annotation.title}
                            <span className={muted}>
                              {' '}
                              ({annotation.work.title})
                            </span>
                          </span>
                        </li>
                      ))}
                  </ul>
                </section>
              )}

              <div className="flex items-start gap-3 rounded-card bg-sup-2 p-5 text-sm">
                <Icon de={PiEnvelopeSimple} tamanho="p" className="mt-0.5" />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">
                    {t('delete_modal_goodbye_email_info')}
                  </p>
                  <p className={muted}>
                    {t('delete_modal_goodbye_description')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Icon de={PiInfo} tamanho="m" className="text-texto-fraco" />
              <p className={muted}>{t('delete_modal_error_loading')}</p>
            </div>
          )}
        </div>
      )}

      {currentStep === 'confirm' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-sup-2 text-[var(--erro)]">
              <Icon de={PiTrash} tamanho="m" />
            </span>
            <h3 className="font-display text-[1.375rem]">
              {t('delete_modal_final_confirmation')}
            </h3>
            <p className={cx('t-corpo', muted)}>
              {t('delete_modal_last_chance')}
            </p>
          </div>

          <section className="flex flex-col gap-1.5 rounded-card bg-sup-2 p-5">
            <h4 className="font-medium">
              {t('delete_modal_permanent_warning')}
            </h4>
            <p className={cx('text-sm', muted)}>
              {t('delete_modal_immediate_removal')}
            </p>
          </section>

          <Field
            label={t('delete_modal_type_delete')}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={t('delete_modal_placeholder_delete')}
            className="text-center font-mono"
            autoComplete="off"
            autoFocus
            erro={
              confirmText && !typedConfirmation
                ? t('delete_modal_type_exactly')
                : undefined
            }
          />

          {requirePassword && (
            <Field.Senha
              label={t('delete_modal_current_password')}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          )}

          {cascadeInfo && (
            <p className={cx('t-rotulo text-center', muted)}>
              <strong className="text-texto">{cascadeInfo.totalItems}</strong>{' '}
              {t('delete_modal_items_removed')}
            </p>
          )}
        </div>
      )}
    </Sheet>
  );
};

export default DeleteAccountModal;
