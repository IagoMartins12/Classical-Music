// app/contact/ContactPageClient.tsx - VERSÃO ATUALIZADA FUNCIONAL
'use client';

import React, { useState } from 'react';
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiMessageCircle,
  FiUser,
  FiHelpCircle,
  FiUpload,
  FiSend,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano } from 'react-icons/gi';
import { BiBug } from 'react-icons/bi';
import Link from 'next/link';
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
  SequentialGrid,
  FloatingElement,
} from '../../components/animation/AnimatedComponents';
import AnimatedMusicalNotes from '@/app/components/AnimatedMusicalNotes';
import { useContactForm } from '@/app/hooks/useContactForm';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import { useTranslation } from '@/app/context/TranslationContext';
import Checkbox from '@/app/components/Common/Checkbox';

interface ContactOption {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action: string;
  color: string;
  category: string;
}

export default function ContactPageClient() {
  const { t } = useTranslation({ sections: ['pages/contact'] });

  const contactOptions: ContactOption[] = [
    {
      icon: FiMessageCircle,
      title: t('contact_option_0_title'),
      description: t('contact_option_0_description'),
      action: t('contact_option_0_action'),
      color: 'from-accent-blue to-accent-purple',
      category: 'suporte',
    },
    {
      icon: BiBug,
      title: t('contact_option_1_title'),
      description: t('contact_option_1_description'),
      action: t('contact_option_1_action'),
      color: 'from-accent-red to-accent-amber',
      category: 'bug',
    },
    {
      icon: FiUpload,
      title: t('contact_option_2_title'),
      description: t('contact_option_2_description'),
      action: t('contact_option_2_action'),
      color: 'from-accent-green to-accent-blue',
      category: 'moderacao',
    },
    {
      icon: FiUser,
      title: t('contact_option_3_title'),
      description: t('contact_option_3_description'),
      action: t('contact_option_3_action'),
      color: 'from-brand-primary to-brand-secondary',
      category: 'parceria',
    },
  ];

  const { submitForm, loading, success, error, reset } = useContactForm();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'normal',
    subscribeNewsletter: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const getDefaultSubject = (category: string): string => {
    switch (category) {
      case 'suporte':
        return t('contact_default_subject_suporte');
      case 'bug':
        return t('contact_default_subject_bug');
      case 'moderacao':
        return t('contact_default_subject_moderacao');
      case 'parceria':
        return t('contact_default_subject_parceria');
      default:
        return '';
    }
  };

  const getAllDefaultSubjects = (): string[] => {
    return [
      t('contact_default_subject_suporte'),
      t('contact_default_subject_bug'),
      t('contact_default_subject_moderacao'),
      t('contact_default_subject_parceria'),
    ];
  };

  const isDefaultSubject = (subject: string): boolean => {
    return getAllDefaultSubjects().includes(subject.trim());
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);

    // Define o assunto automaticamente se:
    // 1. O campo estiver vazio, OU
    // 2. O campo contiver um dos textos padrão das categorias
    if (!formData.subject.trim() || isDefaultSubject(formData.subject)) {
      setFormData((prev) => ({
        ...prev,
        subject: getDefaultSubject(category),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      return;
    }

    try {
      await submitForm({
        ...formData,
        category: selectedCategory,
        sourceUrl: window.location.href,
        userAgent: navigator.userAgent,
      });

      if (success) {
        // Limpar formulário
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          priority: 'normal',
          subscribeNewsletter: false,
        });
      }
    } catch (err) {
      console.error('Erro no envio:', err);
    }
  };

  const getFormStatus = () => {
    if (loading) {
      return {
        icon: <FiLoader className="w-5 h-5 animate-spin text-brand-primary" />,
        message: t('contact_form_status_loading'),
        color: 'text-brand-primary',
      };
    }

    if (success) {
      return {
        icon: <FiCheckCircle className="w-5 h-5 text-accent-green" />,
        message: t('contact_form_status_success'),
        color: 'text-accent-green',
      };
    }

    if (error) {
      return {
        icon: <FiAlertCircle className="w-5 h-5 text-accent-red" />,
        message: error,
        color: 'text-accent-red',
      };
    }

    return null;
  };

  const formStatus = getFormStatus();

  const priorityOptions = [
    { value: 'baixa', label: t('contact_priority_baixa') },
    { value: 'normal', label: t('contact_priority_normal') },
    { value: 'alta', label: t('contact_priority_alta') },
    { value: 'urgente', label: t('contact_priority_urgente') },
  ];

  return (
    <PageContainer showBackground={true} className="classical-theme">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-accent-purple/5 to-accent-blue/5"></div>
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="relative section-wrap">
            <div className="text-center max-w-4xl mx-auto">
              <AnimatedItem direction="scale" springType="bouncy">
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-full mb-8">
                  <FiMail className="w-5 h-5 text-brand-primary mr-2" />
                  <span className="text-brand-primary font-medium">
                    {t('contact_jsx_span_children_0__fale_conosco')}
                  </span>
                </div>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <h1 className="text-4xl lg:text-6xl font-bold classical-title text-theme-primary mb-6">
                  {t('contact_jsx_h1_children_0__entre_em')}
                  <span className="text-gradient-brand block lg:inline ml-2 lg:ml-4">
                    {t('contact_jsx_span_children_0__contato')}
                  </span>
                </h1>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <p className="text-xl lg:text-2xl text-theme-secondary leading-relaxed classical-body">
                  {t('contact_jsx_p_children_0__estamos_aqui_ajudar')}
                </p>
              </AnimatedItem>
            </div>
          </div>
          <AnimatedMusicalNotes />
        </AnimatedContainer>
      </section>

      {/* Contact Options */}
      <section className="py-8">
        <AnimatedContainer delay={0.1} staggerSpeed="fast">
          <div className="">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-4">
                {t('contact_jsx_h2_children_0__como_podemos_ajudar')}
              </h2>
              <p className="text-xl text-theme-secondary max-w-2xl mx-auto">
                {t('contact_jsx_p_children_0__escolha_categoria_que')}
              </p>
            </div>

            <SequentialGrid cols={2} gap={8} delayBetweenItems={0.1}>
              {contactOptions.map((option, index) => (
                <AnimatedCard
                  key={index}
                  hover="lift"
                  clickable
                  className={`classical-card !p-6 cursor-pointer group transition-all duration-300 ${
                    selectedCategory === option.category
                      ? 'ring-2 ring-brand-primary bg-brand-primary/5'
                      : ''
                  }`}
                  onClick={() => handleCategorySelect(option.category)}
                >
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${option.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <option.icon className="w-8 h-8 text-theme-primary" />
                  </div>

                  <h3 className="text-xl font-semibold classical-title text-theme-primary mb-3">
                    {option.title}
                  </h3>

                  <p className="text-theme-secondary classical-body mb-4">
                    {option.description}
                  </p>

                  <div
                    className={`font-medium transition-colors ${
                      selectedCategory === option.category
                        ? 'text-brand-primary'
                        : 'text-theme-tertiary group-hover:text-brand-primary'
                    }`}
                  >
                    {selectedCategory === option.category
                      ? `✓ ${t('contact_jsx_option_selected')}`
                      : `${option.action} →`}
                  </div>
                </AnimatedCard>
              ))}
            </SequentialGrid>
          </div>
        </AnimatedContainer>
      </section>

      {/* Contact Form and Info */}
      <section className="py-8">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <AnimatedCard hover="lift" className="classical-card !p-8">
                <h3 className="text-2xl font-bold classical-title text-theme-primary mb-6">
                  {t('contact_jsx_h3_children_0__envie_sua_mensagem')}
                </h3>

                {formStatus && (
                  <div
                    className={`mb-6 p-4 rounded-lg border flex items-center space-x-3 ${
                      success
                        ? 'bg-accent-green/10 border-accent-green/20'
                        : error
                          ? 'bg-accent-red/10 border-accent-red/20'
                          : 'bg-brand-primary/10 border-brand-primary/20'
                    }`}
                  >
                    {formStatus.icon}
                    <span className={`font-medium ${formStatus.color}`}>
                      {formStatus.message}
                    </span>
                    {(success || error) && (
                      <button
                        onClick={reset}
                        className="ml-auto text-xs hover:underline"
                      >
                        {t('contact_jsx_button_children_0__fechar')}
                      </button>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        {t('contact_jsx_label_children_0__nome')}
                      </label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        disabled={loading || success}
                        className="input-classical-2 w-full disabled:opacity-50"
                        placeholder={t('contact_jsx_input_placeholder_nome')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        {t('contact_jsx_label_children_0__email')}
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={loading || success}
                        className="input-classical-2 w-full disabled:opacity-50"
                        placeholder={t('contact_jsx_input_placeholder_email')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      {t('contact_jsx_label_children_0__assunto')}
                    </label>
                    <Input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      disabled={loading || success}
                      className="input-classical-2 w-full disabled:opacity-50"
                      placeholder={t('contact_jsx_input_placeholder_assunto')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      {t('contact_jsx_label_children_0__prioridade')}
                    </label>
                    <Select
                      options={priorityOptions}
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      disabled={loading || success}
                      className="input-classical-2 w-full disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      {t('contact_jsx_label_children_0__mensagem')}
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      disabled={loading || success}
                      className="input-classical-2 w-full resize-none disabled:opacity-50"
                      placeholder={t(
                        'contact_jsx_textarea_placeholder_mensagem'
                      )}
                    />
                  </div>

                  {/* Newsletter Subscription Option */}
                  <div className="flex items-start space-x-3 p-4 bg-theme-secondary rounded-lg">
                    <Checkbox
                      name="subscribeNewsletter"
                      checked={formData.subscribeNewsletter}
                      onChange={handleInputChange}
                      disabled={loading || success}
                    />
                    <div>
                      <label className="font-medium text-theme-primary cursor-pointer">
                        {t('contact_jsx_label_children_0__receber_newsletter')}
                      </label>
                      <p className="text-sm text-theme-tertiary">
                        {t('contact_jsx_p_children_0__newsletter_description')}
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      success ||
                      !formData.name.trim() ||
                      !formData.email.trim() ||
                      !formData.message.trim()
                    }
                    className="btn-classical-primary w-full flex items-center justify-center space-x-3 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <FiLoader className="w-5 h-5 animate-spin" />
                        <span>
                          {t('contact_jsx_span_children_0__enviando')}
                        </span>
                      </>
                    ) : success ? (
                      <>
                        <FiCheckCircle className="w-5 h-5" />
                        <span>{t('contact_jsx_span_children_0__enviado')}</span>
                      </>
                    ) : (
                      <>
                        <FiSend className="w-5 h-5" />
                        <span>
                          {t('contact_jsx_span_children_0__enviar_mensagem')}
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </AnimatedCard>

              {/* Contact Info */}
              <div className="space-y-8">
                <AnimatedCard hover="lift" className="classical-card !p-8">
                  <h3 className="text-2xl font-bold classical-title text-theme-primary mb-6">
                    {t('contact_jsx_h3_children_0__informações_contato')}
                  </h3>

                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
                        <FiMail className="w-6 h-6 text-theme-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-theme-primary">
                          {t('contact_jsx_h4_children_0__email')}
                        </h4>
                        <p className="text-theme-secondary">
                          {t('contact_jsx_p_children_0__email_address')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center">
                        <FiPhone className="w-6 h-6 text-theme-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-theme-primary">
                          {t('contact_jsx_h4_children_0__telefone')}
                        </h4>
                        <p className="text-theme-secondary">
                          {t('contact_jsx_p_children_0__telefone_number')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center">
                        <FiMapPin className="w-6 h-6 text-theme-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-theme-primary">
                          {t('contact_jsx_h4_children_0__localização')}
                        </h4>
                        <p className="text-theme-secondary">
                          {t('contact_jsx_p_children_0__localização_address')}
                        </p>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard hover="lift" className="classical-card !p-8">
                  <h3 className="text-xl font-bold classical-title text-theme-primary mb-6">
                    {t('contact_jsx_h3_children_0__horário_atendimento')}
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-theme-secondary">
                        {t('contact_jsx_span_children_0__segunda_sexta')}
                      </span>
                      <span className="text-theme-primary font-medium">
                        {t('contact_jsx_span_children_0__horario_semana')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-theme-secondary">
                        {t('contact_jsx_span_children_0__sábado')}
                      </span>
                      <span className="text-theme-primary font-medium">
                        {t('contact_jsx_span_children_0__horario_sabado')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-theme-secondary">
                        {t('contact_jsx_span_children_0__domingo')}
                      </span>
                      <span className="text-theme-tertiary">
                        {t('contact_jsx_span_children_0__fechado')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-accent-blue/10 border border-accent-blue/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FiClock className="w-5 h-5 text-accent-blue" />
                      <span className="text-accent-blue font-medium">
                        {t('contact_jsx_span_children_0__resposta_tempo')}
                      </span>
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard hover="lift" className="classical-card !p-8">
                  <h3 className="text-xl font-bold classical-title text-theme-primary mb-6">
                    {t('contact_jsx_h3_children_0__outros_canais')}
                  </h3>

                  <div className="space-y-4">
                    <Link
                      href="/faq"
                      className="flex items-center space-x-3 text-theme-secondary hover:text-brand-primary transition-colors"
                    >
                      <FiHelpCircle className="w-5 h-5" />
                      <span>
                        {t('contact_jsx_link_children_0__central_ajuda')}
                      </span>
                    </Link>

                    <Link
                      href="/help"
                      className="flex items-center space-x-3 text-theme-secondary hover:text-brand-primary transition-colors"
                    >
                      <FiMessageCircle className="w-5 h-5" />
                      <span>
                        {t('contact_jsx_link_children_0__guias_tutoriais')}
                      </span>
                    </Link>

                    <Link
                      href="/support"
                      className="flex items-center space-x-3 text-theme-secondary hover:text-brand-primary transition-colors"
                    >
                      <FiUser className="w-5 h-5" />
                      <span>
                        {t('contact_jsx_link_children_0__suporte_técnico')}
                      </span>
                    </Link>
                  </div>
                </AnimatedCard>
              </div>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Floating Elements */}
      <FloatingElement
        className="top-16 left-16 text-6xl text-brand-primary/5"
        delay={0}
      >
        <GiMusicalNotes />
      </FloatingElement>
      <FloatingElement
        className="bottom-16 right-16 text-5xl text-accent-purple/5"
        delay={2}
      >
        <GiGrandPiano />
      </FloatingElement>
      <FloatingElement
        className="top-1/3 right-24 text-4xl text-accent-blue/5"
        delay={1}
      >
        <FiMail />
      </FloatingElement>
    </PageContainer>
  );
}
