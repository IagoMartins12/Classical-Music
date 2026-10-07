'use client';

import React, { useId, useState } from 'react';
import { PiArrowSquareOut, PiWarningCircle } from 'react-icons/pi';
import { useTranslation } from '@/app/context/TranslationContext';
import Modal from '../../Modal';
import { Button } from '@/app/components/ui/Button';
import { Inline } from '@/app/components/ui/Layout';
import { TextoRico } from '@/app/components/ui/TextoRico';
import { TERMOS } from '@/app/conteudo/legal/termos';
import { PRIVACIDADE } from '@/app/conteudo/legal/privacidade';
import type { DocumentoBilingue } from '@/app/conteudo/legal/tipos';
import LocalizedLink from '@/app/components/LocalizedLink';

/**
 * O aceite dos Termos e da Política no cadastro.
 *
 * Os dois modais mostram "O essencial" do documento de verdade
 * (`conteudo/legal`) — o mesmo texto das páginas `/terms` e `/privacy` — e
 * levam ao documento completo numa aba nova, para o cadastro não se perder.
 * Havia aqui um resumo próprio, escrito à parte, que contradizia a política.
 */
interface TermsAcceptanceProps {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
  error?: string;
  disabled?: boolean;
}

const ROTULOS = {
  pt: {
    vigor: 'Em vigor desde',
    completo: {
      terms: 'Ler os Termos de Uso completos',
      privacy: 'Ler a Política de Privacidade completa',
    },
    entendi: 'Entendi',
  },
  en: {
    vigor: 'Effective from',
    completo: {
      terms: 'Read the full Terms of Use',
      privacy: 'Read the full Privacy Policy',
    },
    entendi: 'Got it',
  },
} as const;

function data(iso: string, idioma: 'pt' | 'en') {
  return new Intl.DateTimeFormat(idioma === 'pt' ? 'pt-BR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso));
}

function Resumo({
  qual,
  documento,
  idioma,
  aoFechar,
}: {
  qual: 'terms' | 'privacy';
  documento: DocumentoBilingue;
  idioma: 'pt' | 'en';
  aoFechar: () => void;
}) {
  const doc = documento[idioma];
  const r = ROTULOS[idioma];
  return (
    <div className="flex flex-col gap-6">
      <p className="text-[0.9375rem] leading-relaxed text-texto-suave">
        {doc.abertura}
      </p>
      <ul className="flex list-disc flex-col gap-3 pl-5 text-[0.9375rem] leading-relaxed text-texto-suave marker:text-ouro-texto">
        {doc.essencial.map((e, i) => (
          <li key={i} className="pl-1">
            <TextoRico texto={e} />
          </li>
        ))}
      </ul>
      <p className="text-sm text-texto-fraco">
        {r.vigor}{' '}
        <time dateTime={doc.vigencia}>{data(doc.vigencia, idioma)}</time>
      </p>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <LocalizedLink
          href={`/${qual}`}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 text-sm font-medium text-ouro-texto underline decoration-ouro/40 underline-offset-[3px] hover:decoration-ouro"
        >
          {r.completo[qual]}
          <PiArrowSquareOut aria-hidden="true" className="h-4 w-4" />
        </LocalizedLink>
        <Button
          variante="primario"
          onClick={aoFechar}
          className="w-full sm:w-auto"
        >
          {r.entendi}
        </Button>
      </div>
    </div>
  );
}

const TermsAcceptance: React.FC<TermsAcceptanceProps> = ({
  accepted,
  onChange,
  error,
  disabled = false,
}) => {
  const { t, language } = useTranslation({
    sections: ['components/auth-modals'],
  });
  const idioma = language === 'en' ? 'en' : 'pt';
  const [aberto, setAberto] = useState<'terms' | 'privacy' | null>(null);
  const idCaixa = useId();
  const idErro = useId();

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <input
            id={idCaixa}
            type="checkbox"
            checked={accepted}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? idErro : undefined}
            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[var(--ouro)] disabled:cursor-not-allowed"
          />
          <p className="text-sm leading-relaxed text-texto-suave">
            <label htmlFor={idCaixa} className="cursor-pointer">
              {t('terms_acceptance_text')}
            </label>{' '}
            <button
              type="button"
              onClick={() => setAberto('terms')}
              disabled={disabled}
              className="font-medium text-ouro-texto underline decoration-ouro/40 underline-offset-[3px] hover:decoration-ouro"
            >
              {t('terms_acceptance_terms_link')}
            </button>{' '}
            {t('terms_acceptance_and')}{' '}
            <button
              type="button"
              onClick={() => setAberto('privacy')}
              disabled={disabled}
              className="font-medium text-ouro-texto underline decoration-ouro/40 underline-offset-[3px] hover:decoration-ouro"
            >
              {t('terms_acceptance_privacy_link')}
            </button>
          </p>
        </div>

        {error && (
          <Inline gap={2} id={idErro} className="text-sm text-erro">
            <PiWarningCircle aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </Inline>
        )}
      </div>

      <Modal
        isOpen={aberto === 'terms'}
        onClose={() => setAberto(null)}
        title={TERMOS[idioma].titulo}
        maxWidth="xl"
        showCloseButton
        setPr
      >
        <Resumo
          qual="terms"
          documento={TERMOS}
          idioma={idioma}
          aoFechar={() => setAberto(null)}
        />
      </Modal>

      <Modal
        isOpen={aberto === 'privacy'}
        onClose={() => setAberto(null)}
        title={PRIVACIDADE[idioma].titulo}
        maxWidth="xl"
        showCloseButton
        setPr
      >
        <Resumo
          qual="privacy"
          documento={PRIVACIDADE}
          idioma={idioma}
          aoFechar={() => setAberto(null)}
        />
      </Modal>
    </>
  );
};

export default TermsAcceptance;
