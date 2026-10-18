'use client';

import { NEWSLETTER } from '@/app/conteudo/textos/newsletter';
import { useTextos } from '@/app/hooks/useTextos';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { PiArrowRight, PiEnvelopeSimple } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { chip } from '@/app/components/site/choice';
import { TokenFrame } from '@/app/components/site/tokens/TokenFrame';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { unsubscribeFromNewsletter } from '@/app/requests/newsletter';

const MOTIVOS = [
  'too_frequent',
  'not_relevant',
  'never_signed',
  'technical_issues',
  'changed_email',
  'other',
] as const;

/**
 * Leaving the newsletter from the e-mail link: leave at once, or say why
 * first. Either way one call, and the reason goes with it.
 */
export default function UnsubscribePage() {
  const token = String(useParams()?.token ?? '');
  const { t } = useTextos(NEWSLETTER);
  const [motivo, setMotivo] = useState('');
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [passo, setPasso] = useState<'confirmar' | 'motivo' | 'feito'>(
    'confirmar'
  );

  const sair = async (comMotivo: string) => {
    setEnviando(true);
    try {
      const result = await unsubscribeFromNewsletter({
        token,
        reason: comMotivo,
        feedback: comentario,
      });
      if (result.ok) setPasso('feito');
      else toast.error(result.error || t('error_unsubscribe_default'));
    } catch {
      toast.error(t('error_general'));
    } finally {
      setEnviando(false);
    }
  };

  if (passo === 'feito') {
    return (
      <TokenFrame
        icon={PiEnvelopeSimple}
        done
        title={t('unsubscribe_completed_title')}
        text={t('unsubscribe_completed_message')}
      >
        <Link href="/" className={classesDeBotao('primario')}>
          {t('unsubscribe_completed_button')}{' '}
          <Icon de={PiArrowRight} tamanho="p" />
        </Link>
      </TokenFrame>
    );
  }

  if (passo === 'motivo') {
    return (
      <TokenFrame
        icon={PiEnvelopeSimple}
        title={t('unsubscribe_feedback_title')}
        text={t('unsubscribe_feedback_subtitle')}
      >
        <div className="flex w-full max-w-lg flex-col gap-6 text-left">
          <fieldset className="flex flex-col gap-3">
            <legend className="t-rotulo mb-3 text-texto-suave">
              {t('unsubscribe_reason_label')}
            </legend>
            <div className="flex flex-wrap gap-2">
              {MOTIVOS.map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={motivo === id}
                  onClick={() => setMotivo(id)}
                  className={chip(motivo === id)}
                >
                  {t(`unsubscribe_reason_${id}`)}
                </button>
              ))}
            </div>
          </fieldset>
          <Field.Area
            label={t('unsubscribe_feedback_label')}
            placeholder={t('unsubscribe_feedback_placeholder')}
            rows={4}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />
          <div className="flex flex-wrap gap-3">
            <Button
              variante="primario"
              carregando={enviando}
              onClick={() => void sair(motivo || 'not_specified')}
            >
              {t('unsubscribe_confirm_button')}
            </Button>
            <Button variante="fantasma" onClick={() => setPasso('confirmar')}>
              {t('unsubscribe_back_button')}
            </Button>
          </div>
        </div>
      </TokenFrame>
    );
  }

  return (
    <TokenFrame
      icon={PiEnvelopeSimple}
      title={t('unsubscribe_page_title')}
      text={
        <>
          <span className="block text-texto">
            {t('unsubscribe_before_title')}
          </span>
          {t('unsubscribe_before_message')}
        </>
      }
    >
      <Button
        variante="primario"
        carregando={enviando}
        onClick={() => void sair('not_specified')}
      >
        {t('unsubscribe_quick_button')}
      </Button>
      <Button onClick={() => setPasso('motivo')}>
        {t('unsubscribe_with_feedback_button')}
      </Button>
      <Link href="/" className={classesDeBotao('fantasma')}>
        {t('unsubscribe_keep_button')}
      </Link>
    </TokenFrame>
  );
}
