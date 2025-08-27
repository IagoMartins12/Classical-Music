// app/components/Footer.tsx - VERSÃO FINAL INTEGRADA
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiHeart,
  FiBookOpen,
  FiMusic,
  FiUsers,
  FiInfo,
  FiShield,
  FiGlobe,
  FiCheck,
  FiAlertCircle,
  FiLoader,
  FiRefreshCw,
} from 'react-icons/fi';
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaSpotify,
} from 'react-icons/fa';
import { GiGrandPiano, GiViolin, GiTrumpet } from 'react-icons/gi';
import {
  useNewsletterSubscription,
  useNewsletterForm,
} from '@/app/hooks/useNewsletterSubscription';
import Button from '../Common/Button';
import { useTranslation } from '@/app/hooks/useTranslation';

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
      icon: FiBookOpen,
    },
    {
      label: t('footer_quicklinks_1__label'),
      href: '/composers',
      icon: FiUsers,
    },
    { label: t('footer_quicklinks_2__label'), href: '/works', icon: FiMusic },
    {
      label: t('footer_quicklinks_3__label'),
      href: '/instruments',
      icon: GiViolin,
    },
    { label: t('footer_quicklinks_4__label'), href: '/genres', icon: FiGlobe },
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
      icon: FaFacebook,
      href: '#',
      label: 'Facebook',
      color: 'hover:text-blue-500',
    },
    {
      icon: FaTwitter,
      href: '#',
      label: 'Twitter',
      color: 'hover:text-sky-500',
    },
    {
      icon: FaInstagram,
      href: '#',
      label: 'Instagram',
      color: 'hover:text-pink-500',
    },
    {
      icon: FaLinkedin,
      href: '#',
      label: 'LinkedIn',
      color: 'hover:text-blue-600',
    },
    {
      icon: FaYoutube,
      href: '#',
      label: 'YouTube',
      color: 'hover:text-red-500',
    },
    {
      icon: FaSpotify,
      href: '#',
      label: 'Spotify',
      color: 'hover:text-green-500',
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
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-accent-green">
            <FiCheck className="w-4 h-4" />
            <span className="text-sm font-medium">
              {status === 'RESUBSCRIBED'
                ? 'Bem-vindo de volta!'
                : 'Inscrição realizada!'}
            </span>
          </div>

          {status === 'PENDING' && (
            <div className="bg-accent-blue bg-opacity-10 border border-accent-blue rounded-lg p-3">
              <p className="text-accent-blue text-sm">
                {t('footer_jsx_p_children_0__confirm')}
              </p>
            </div>
          )}

          <button
            onClick={handleReset}
            className="text-xs text-theme-tertiary hover:text-theme-primary underline"
          >
            {t('footer_jsx_button_children_0__email')}
          </button>
        </div>
      );
    }

    if (error) {
      return (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-accent-red">
            <FiAlertCircle className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-500 mt-1">{error}</p>
          </div>

          {/* 🆕 OPÇÕES BASEADAS NO TIPO DE ERRO */}
          <div className="flex flex-wrap gap-2">
            {canResend && (
              <button
                onClick={handleResendConfirmation}
                disabled={loading}
                className="text-xs bg-accent-amber bg-opacity-20 text-accent-amber px-2 py-1 rounded hover:bg-opacity-30 transition-colors disabled:opacity-50"
              >
                <FiRefreshCw className="w-3 h-3 inline mr-1" />
                {t('footer_jsx_button_children_2__send')}
              </button>
            )}

            <button
              onClick={handleReset}
              className="text-xs text-theme-tertiary hover:text-theme-primary underline"
            >
              {t('footer_jsx_button_children_0__tentar_novamente')}
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <footer className="relative  bg-gradient-to-b from-theme-primary to-theme-secondary border-t border-theme-secondary">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-primary opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-accent-purple opacity-5 rounded-full blur-3xl"></div>
        <GiTrumpet className="absolute top-10 right-20 w-8 h-8 text-brand-primary opacity-10 rotate-12" />
        <GiViolin className="absolute bottom-20 left-20 w-10 h-10 text-accent-purple opacity-10 -rotate-12" />
      </div>

      <div className="relative">
        {/* Main Footer Content */}
        <div className="section-wrap py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-1 space-y-6">
              <Link href="/" className="flex items-center group">
                <div className="relative">
                  <GiGrandPiano className="w-10 h-10 mr-3 text-brand-primary icon-glow transition-all duration-300 group-hover:scale-110" />
                </div>
                <span className="text-2xl font-bold text-gradient-brand classical-title">
                  {t('footer_jsx_span_children_0__opus_atlas')}
                </span>
              </Link>

              <p className="text-theme-tertiary leading-relaxed text-sm">
                {t('footer_jsx_p_children_0__composer')}
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-theme-tertiary">
                  <FiMail className="w-4 h-4 text-brand-primary" />
                  <span>contato@classicalhub.com</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-theme-tertiary">
                  <FiPhone className="w-4 h-4 text-brand-primary" />
                  <span>{t('footer_jsx_span_children_0__text')}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-theme-tertiary">
                  <FiMapPin className="w-4 h-4 text-brand-primary" />
                  <span>
                    {t('footer_jsx_span_children_0__são_paulo_brasil')}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-theme-primary flex items-center">
                <FiBookOpen className="w-5 h-5 mr-2 text-brand-primary" />
                {t('footer_jsx_h3_children_2__explorar')}
              </h3>
              <ul className="space-y-3">
                {quickLinks.map(({ label, href, icon: Icon }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="flex items-center space-x-2 text-sm text-theme-tertiary hover:text-brand-primary transition-colors duration-300 group"
                    >
                      <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-theme-primary flex items-center">
                <FiInfo className="w-5 h-5 mr-2 text-brand-primary" />
                {t('footer_jsx_h3_children_2__suporte')}
              </h3>
              <ul className="space-y-3">
                {supportLinks.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-theme-tertiary hover:text-brand-primary transition-colors duration-300"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal & Social */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-theme-primary flex items-center">
                <FiShield className="w-5 h-5 mr-2 text-brand-primary" />
                {t('footer_jsx_h3_children_2__legal')}
              </h3>
              <ul className="space-y-3">
                {legalLinks.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-theme-tertiary hover:text-brand-primary transition-colors duration-300"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Social Media */}
              <div className="pt-4">
                <h4 className="text-sm font-medium text-theme-secondary mb-4">
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
              </div>
            </div>
          </div>
        </div>

        {/* 🆕 NEWSLETTER SECTION ATUALIZADA */}
        <div className="border-t border-theme-secondary" id="newsletter">
          <div className="section-wrap py-8">
            <div className="classical-card p-6 bg-gradient-to-r from-brand-primary/5 to-accent-purple/5 border border-brand-primary/20">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0 lg:space-x-8">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-theme-primary flex items-center mb-2">
                    <FiHeart className="w-5 h-5 mr-2 text-brand-primary" />
                    {t('footer_jsx_h3_children_2__music')}
                  </h3>
                  <p className="text-sm text-theme-tertiary mb-4">
                    {t('footer_jsx_p_children_0__score')}
                  </p>

                  {/* 🆕 STATUS AVANÇADO */}
                  {renderNewsletterStatus()}
                </div>

                {/* 🆕 FORMULÁRIO APRIMORADO */}
                {(!success || showAdvanced) && (
                  <form
                    onSubmit={handleNewsletterSubmit}
                    className="flex flex-col space-y-3 w-full lg:w-auto min-w-0 lg:min-w-[400px]"
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
                          formErrors.email
                            ? 'border-accent-red'
                            : 'border-theme-secondary'
                        } rounded-lg text-sm focus:outline-none focus:border-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 min-w-0`}
                      />
                    </div>

                    {/* 🆕 ERROS DE VALIDAÇÃO */}
                    {(formErrors.email || formErrors.firstName) && (
                      <div className="text-xs text-accent-red">
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
                            <FiLoader className="w-4 h-4 animate-spin" />
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
                  </form>
                )}
              </div>

              {/* Privacy note */}
              <div className="mt-4 pt-4 border-t border-theme-secondary/50">
                <p className="text-xs text-theme-tertiary">
                  {t('footer_jsx_p_children_0__email')}
                  <br />
                  {t('footer_jsx_p_children_2__inscrever_concorda_nossa')}{' '}
                  <Link
                    href="/privacy"
                    className="text-brand-primary hover:underline"
                  >
                    {t('footer_jsx_link_children_0__política_privacidade')}
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-theme-secondary">
          <div className="section-wrap py-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="text-sm text-theme-tertiary text-center md:text-left">
                <p>
                  © {currentYear}{' '}
                  {t('footer_jsx_p_children_2__opus_atlas_todos')}
                </p>
              </div>

              <div className="flex items-center space-x-6 text-sm text-theme-tertiary">
                <span className="flex items-center">
                  {t('footer_jsx_span_children_0__feito')}
                  <FiHeart className="w-4 h-4 mx-1 text-accent-red" />{' '}
                  {t('footer_jsx_span_children_3__music')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
