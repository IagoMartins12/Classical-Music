// app/components/Footer.tsx - VERSÃO FINAL INTEGRADA
'use client';
import { CONTATO, mailto } from '@/app/utils/contato';
import { Button as Botao } from '@/app/components/ui/Button';

import React, { useState } from 'react';
import Link from '@/app/components/LocalizedLink';
import { GiGrandPiano, GiViolin } from 'react-icons/gi';
import {
  PiArrowsClockwise,
  PiBookOpen,
  PiCheck,
  PiEnvelopeSimple,
  PiHeart,
  PiInfo,
  PiInstagramLogo,
  PiLinkedinLogo,
  PiMapPin,
  PiMusicNotes,
  PiPhone,
  PiShield,
  PiSpinnerGap,
  PiTiktokLogo,
  PiUsers,
  PiWarningCircle,
  PiXLogo,
} from 'react-icons/pi';

import {
  useNewsletterSubscription,
  useNewsletterForm,
} from '@/app/hooks/useNewsletterSubscription';
import Button from '../Common/Button';
import { useTranslation } from '@/app/hooks/useTranslation';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation({ sections: ['components/footer'] });

  // 🆕 USAR HOOKS ATUALIZADOS
  const {
    subscribe,
    resendConfirmation,
    loading,
    success,
    error,
    status,
    canResend,
    reset,
  } = useNewsletterSubscription();

  const { formData, formErrors, updateField, validateForm, resetForm } =
    useNewsletterForm();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const quickLinks = [
    {
      label: t('footer_quicklinks_0__label'),
      href: '/music-history',
      icon: PiBookOpen,
    },
    {
      label: t('footer_quicklinks_1__label'),
      href: '/composers',
      icon: PiUsers,
    },
    {
      label: t('footer_quicklinks_2__label'),
      href: '/works',
      icon: PiMusicNotes,
    },
    {
      label: t('footer_quicklinks_3__label'),
      href: '/instruments',
      icon: GiViolin,
    },
  ];

  const supportLinks = [
    { label: t('footer_supportlinks_0__label'), href: '/help' },
    { label: t('footer_supportlinks_1__label'), href: '/faq' },
    { label: t('footer_supportlinks_2__label'), href: '/contact' },
    { label: t('footer_supportlinks_3__label'), href: '/support' },
  ];

  const legalLinks = [
    { label: t('footer_legallinks_0__label'), href: '/terms' },
    { label: t('footer_legallinks_1__label'), href: '/privacy' },
    { label: t('footer_legallinks_2__label'), href: '/copyright' },
  ];

  const socialLinks = [
    {
      icon: PiXLogo,
      href: 'https://x.com/Opus_Atlas',
      label: 'Twitter / X',
      color: 'hover:text-sky-500',
    },
    {
      icon: PiInstagramLogo,
      href: 'https://www.instagram.com/opusatlas/',
      label: 'Instagram',
      color: 'hover:text-pink-500',
    },
    {
      icon: PiLinkedinLogo,
      href: 'https://www.linkedin.com/company/opus-atlas/about/',
      label: 'LinkedIn',
      color: 'hover:text-blue-600',
    },
    {
      icon: PiTiktokLogo,
      href: 'https://www.tiktok.com/@opusatlas5',
      label: 'Tik tok',
      color: 'hover:text-blue-600',
    },
  ];

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm();
    if (!validation.valid) {
      return;
    }

    try {
      await subscribe({
        email: formData.email,
        firstName: formData.firstName || undefined,
        sourceUrl:
          typeof window !== 'undefined' ? window.location.href : undefined,
        utmSource: 'footer',
      });
    } catch (err) {
      console.error('Erro na inscrição:', err);
    }
  };

  const handleResendConfirmation = async () => {
    if (!formData.email) return;

    try {
      await resendConfirmation(formData.email);
    } catch (err) {
      console.error('Erro ao reenviar:', err);
    }
  };

  const handleReset = () => {
    reset();
    resetForm();
    setShowAdvanced(false);
  };

  // 🆕 FUNÇÃO PARA RENDERIZAR STATUS AVANÇADO
  const renderNewsletterStatus = () => {
    if (success) {
      return (
        <Stack gap={3}>
          <Inline gap={2} className="">
            <PiCheck className="w-4 h-4" />
            <span className="text-sm font-medium">
              {status === 'RESUBSCRIBED'
                ? 'Bem-vindo de volta!'
                : 'Inscrição realizada!'}
            </span>
          </Inline>

          {status === 'PENDING' && (
            <div className="rounded-lg p-3 bg-sup-2">
              <p className="text-sm">{t('footer_jsx_p_children_0__confirm')}</p>
            </div>
          )}

          <button
            onClick={handleReset}
            className="text-xs text-theme-tertiary underline self-start"
          >
            {t('footer_jsx_button_children_0__email')}
          </button>
        </Stack>
      );
    }

    if (error) {
      return (
        <Stack gap={3}>
          <Inline gap={2} className="">
            <PiWarningCircle className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-500 mt-1">{error}</p>
          </Inline>

          {/* 🆕 OPÇÕES BASEADAS NO TIPO DE ERRO */}
          <div className="flex flex-wrap gap-2">
            {canResend && (
              <Botao
                variante="fantasma"
                tamanho="p"
                onClick={handleResendConfirmation}
                disabled={loading}
              >
                <PiArrowsClockwise className="w-3 h-3 inline mr-1" />
                {t('footer_jsx_button_children_2__send')}
              </Botao>
            )}

            <button
              onClick={handleReset}
              className="text-xs text-theme-tertiary underline"
            >
              {t('footer_jsx_button_children_0__tentar_novamente')}
            </button>
          </div>
        </Stack>
      );
    }

    return null;
  };

  return (
    <footer className="  border-t border-theme-secondary">
      <div className="">
        {/* Main Footer Content */}
        <div className="section-wrap py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Section */}
            <Stack gap={6} className="lg:col-span-1">
              <Link href="/" className="flex items-center group">
                <div className="relative">
                  <GiGrandPiano className="w-10 h-10 mr-3 text-ouro-texto icon-glow transition-all duration-300 group-hover:scale-110" />
                </div>
                <span className="text-2xl font-bold text-gradient-brand classical-title">
                  {t('footer_jsx_span_children_0__opus_atlas')}
                </span>
              </Link>

              <Text
                papel="rotulo"
                tom="fraco"
                as="p"
                className="leading-relaxed"
              >
                {t('footer_jsx_p_children_0__composer')}
              </Text>

              {/* Contact Info */}
              <Stack gap={3}>
                <Inline gap={3} className="text-sm text-theme-tertiary">
                  <PiEnvelopeSimple className="w-4 h-4 text-ouro-texto" />
                  <a href={mailto('contato')} className="hover:text-texto">
                    {CONTATO.contato}
                  </a>
                </Inline>
                {/* Só com um número de atendimento de verdade (`CONTATO`). */}
                {CONTATO.telefone && (
                  <Inline gap={3} className="text-sm text-theme-tertiary">
                    <PiPhone className="w-4 h-4 text-ouro-texto" />
                    <span>{CONTATO.telefone}</span>
                  </Inline>
                )}
                <Inline gap={3} className="text-sm text-theme-tertiary">
                  <PiMapPin className="w-4 h-4 text-ouro-texto" />
                  <span>
                    {t('footer_jsx_span_children_0__são_paulo_brasil')}
                  </span>
                </Inline>
              </Stack>
            </Stack>

            {/* Quick Links */}
            <Stack gap={6}>
              <h3 className="text-lg font-semibold text-theme-primary flex items-center">
                <PiBookOpen className="w-5 h-5 mr-2 text-ouro-texto" />
                {t('footer_jsx_h3_children_2__explorar')}
              </h3>
              <Stack gap={3} as="ul">
                {quickLinks.map(({ label, href, icon: Icon }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      target="_blank"
                      className="flex items-center space-x-2 text-sm text-theme-tertiary transition-colors duration-300 group"
                    >
                      <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
              </Stack>
            </Stack>

            {/* Support Links */}
            <Stack gap={6}>
              <h3 className="text-lg font-semibold text-theme-primary flex items-center">
                <PiInfo className="w-5 h-5 mr-2 text-ouro-texto" />
                {t('footer_jsx_h3_children_2__suporte')}
              </h3>
              <Stack gap={3} as="ul">
                {supportLinks.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-theme-tertiary transition-colors duration-300"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </Stack>
            </Stack>

            {/* Legal & Social */}
            <Stack gap={6}>
              <h3 className="text-lg font-semibold text-theme-primary flex items-center">
                <PiShield className="w-5 h-5 mr-2 text-ouro-texto" />
                {t('footer_jsx_h3_children_2__legal')}
              </h3>
              <Stack gap={3} as="ul">
                {legalLinks.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-theme-tertiary transition-colors duration-300"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </Stack>

              {/* Social Media */}
              <Stack className="pt-4">
                <h4 className="text-sm font-medium text-theme-secondary">
                  {t('footer_jsx_h4_children_0__siganos')}
                </h4>
                <div className="flex space-x-4">
                  {socialLinks.map(({ icon: Icon, href, label, color }) => (
                    <a
                      key={label}
                      href={href}
                      className={`text-theme-tertiary ${color} transition-colors duration-300 transform hover:scale-110`}
                      aria-label={label}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </Stack>
            </Stack>
          </div>
        </div>

        {/* 🆕 NEWSLETTER SECTION ATUALIZADA */}
        <div className="border-t border-theme-secondary" id="newsletter">
          <div className="section-wrap py-8">
            <Card className="">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0 lg:space-x-8">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-theme-primary flex items-center mb-2">
                    <PiHeart className="w-5 h-5 mr-2 text-ouro-texto" />
                    {t('footer_jsx_h3_children_2__music')}
                  </h3>
                  <Text papel="rotulo" tom="fraco" as="p" className="mb-4">
                    {t('footer_jsx_p_children_0__score')}
                  </Text>

                  {/* 🆕 STATUS AVANÇADO */}
                  {renderNewsletterStatus()}
                </div>

                {/* 🆕 FORMULÁRIO APRIMORADO */}
                {(!success || showAdvanced) && (
                  <Stack
                    as="form"
                    gap={3}
                    onSubmit={handleNewsletterSubmit}
                    className="w-full lg:w-auto min-w-0 lg:min-w-[400px]"
                  >
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="email"
                        placeholder={t('footer_jsx_input_placeholder_email')}
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        required
                        disabled={loading}
                        className={`px-4 py-2 bg-theme-tertiary border ${
                          formErrors.email ? '' : 'border-theme-secondary'
                        } rounded-lg text-sm focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 min-w-0`}
                      />
                    </div>

                    {/* 🆕 ERROS DE VALIDAÇÃO */}
                    {(formErrors.email || formErrors.firstName) && (
                      <div className="text-xs">
                        {formErrors.email || formErrors.firstName}
                      </div>
                    )}

                    <div className="flex items-center justify-end">
                      <Button
                        type="submit"
                        variant="outline"
                        disabled={loading || !formData.email.trim()}
                      >
                        {loading ? (
                          <div className="flex gap-2">
                            <PiSpinnerGap className="w-4 h-4 animate-spin" />
                            <span>
                              {t('footer_jsx_span_children_0__enviando')}
                            </span>
                          </div>
                        ) : (
                          <span>
                            {t('footer_jsx_span_children_0__inscrever')}
                          </span>
                        )}
                      </Button>
                    </div>
                  </Stack>
                )}
              </div>

              {/* Privacy note */}
              <div className="mt-4 pt-4 border-t border-linha">
                <Text papel="legenda" tom="fraco" as="p">
                  {t('footer_jsx_p_children_0__email')}
                  <br />
                  {t('footer_jsx_p_children_2__inscrever_concorda_nossa')}{' '}
                  <Link
                    href="/privacy"
                    className="text-ouro-texto hover:underline"
                  >
                    {t('footer_jsx_link_children_0__política_privacidade')}
                  </Link>
                  .
                </Text>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-theme-secondary">
          <div className="section-wrap py-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <Text
                papel="rotulo"
                tom="fraco"
                as="div"
                className="text-center md:text-left"
              >
                <p>
                  © {currentYear}{' '}
                  {t('footer_jsx_p_children_2__opus_atlas_todos')}
                </p>
              </Text>

              <Inline gap={6} className="text-sm text-theme-tertiary">
                <span className="flex items-center">
                  {t('footer_jsx_span_children_0__feito')}
                  <PiHeart className="w-4 h-4 mx-1" />{' '}
                  {t('footer_jsx_span_children_3__music')}
                </span>
              </Inline>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
