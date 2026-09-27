// app/contact/ContactPageClient.tsx - VERSÃO ATUALIZADA FUNCIONAL
'use client';

import React, { useState } from 'react';
import { GiGrandPiano } from 'react-icons/gi';
import {
  PiBug,
  PiChatCircle,
  PiCheckCircle,
  PiClock,
  PiEnvelopeSimple,
  PiMapPin,
  PiMusicNotes,
  PiPaperPlaneRight,
  PiPhone,
  PiQuestion,
  PiSpinnerGap,
  PiUploadSimple,
  PiUser,
  PiWarningCircle,
} from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
  SequentialGrid,
  FloatingElement,
} from '../../../components/animation/AnimatedComponents';
import AnimatedMusicalNotes from '@/app/components/AnimatedMusicalNotes';
import { useContactForm } from '@/app/hooks/useContactForm';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import { useTranslation } from '@/app/context/TranslationContext';
import Checkbox from '@/app/components/Common/Checkbox';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Field } from '@/app/components/ui/Field';

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
      icon: PiChatCircle,
      title: t('contact_option_0_title'),
      description: t('contact_option_0_description'),
      action: t('contact_option_0_action'),
      color: '',
      category: 'suporte',
    },
    {
      icon: PiBug,
      title: t('contact_option_1_title'),
      description: t('contact_option_1_description'),
      action: t('contact_option_1_action'),
      color: '',
      category: 'bug',
    },
    {
      icon: PiUploadSimple,
      title: t('contact_option_2_title'),
      description: t('contact_option_2_description'),
      action: t('contact_option_2_action'),
      color: '',
      category: 'moderacao',
    },
    {
      icon: PiUser,
      title: t('contact_option_3_title'),
      description: t('contact_option_3_description'),
      action: t('contact_option_3_action'),
      color: '',
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
        icon: <PiSpinnerGap className="w-5 h-5 animate-spin text-ouro-texto" />,
        message: t('contact_form_status_loading'),
        color: 'text-ouro-texto',
      };
    }

    if (success) {
      return {
        icon: <PiCheckCircle className="w-5 h-5" />,
        message: t('contact_form_status_success'),
        color: '',
      };
    }

    if (error) {
      return {
        icon: <PiWarningCircle className="w-5 h-5" />,
        message: error,
        color: '',
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
        <div className="absolute inset-0"></div>
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="relative section-wrap">
            <div className="text-center max-w-4xl mx-auto">
              <AnimatedItem direction="scale" springType="bouncy">
                <div className="inline-flex items-center px-6 py-3 rounded-full mb-8 bg-sup-2">
                  <PiEnvelopeSimple className="w-5 h-5 text-ouro-texto mr-2" />
                  <span className="text-ouro-texto font-medium">
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
                <p className="text-xl lg:text-2xl text-theme-secondary leading-relaxed classical-body medida-texto mx-auto">
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
              <p className="text-xl text-theme-secondary medida-texto mx-auto">
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
                    selectedCategory === option.category ? 'ring-2' : ''
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
                        ? 'text-ouro-texto'
                        : 'text-theme-tertiary'
                    }`}
                  >
                    {selectedCategory === option.category
                      ? `${t('contact_jsx_option_selected')}`
                      : `${option.action}→`}
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
                    className={`mb-6 p-4 rounded-lg flex items-center space-x-3 bg-sup-2 ${
                      success ? '' : error ? '' : ''
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

                <Stack gap={6} as="form" onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Input
                        label={t('contact_jsx_label_children_0__nome')}
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
                      <Input
                        label={t('contact_jsx_label_children_0__email')}
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
                    <Input
                      label={t('contact_jsx_label_children_0__assunto')}
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
                    <Select
                      label={t('contact_jsx_label_children_0__prioridade')}
                      options={priorityOptions}
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      disabled={loading || success}
                      className="input-classical-2 w-full disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <Field.Area
                      label={t('contact_jsx_label_children_0__mensagem')}
                      classeCampo="resize-none"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      disabled={loading || success}
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
                      <Text papel="rotulo" tom="fraco" as="p">
                        {t('contact_jsx_p_children_0__newsletter_description')}
                      </Text>
                    </div>
                  </div>

                  <Inline
                    as="button"
                    gap={3}
                    type="submit"
                    disabled={
                      loading ||
                      success ||
                      !formData.name.trim() ||
                      !formData.email.trim() ||
                      !formData.message.trim()
                    }
                    className="btn-classical-primary w-full justify-center py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <PiSpinnerGap className="w-5 h-5 animate-spin" />
                        <span>
                          {t('contact_jsx_span_children_0__enviando')}
                        </span>
                      </>
                    ) : success ? (
                      <>
                        <PiCheckCircle className="w-5 h-5" />
                        <span>{t('contact_jsx_span_children_0__enviado')}</span>
                      </>
                    ) : (
                      <>
                        <PiPaperPlaneRight className="w-5 h-5" />
                        <span>
                          {t('contact_jsx_span_children_0__enviar_mensagem')}
                        </span>
                      </>
                    )}
                  </Inline>
                </Stack>
              </AnimatedCard>

              {/* Contact Info */}
              <div className="space-y-8">
                <AnimatedCard hover="lift" className="classical-card !p-8">
                  <h3 className="text-2xl font-bold classical-title text-theme-primary mb-6">
                    {t('contact_jsx_h3_children_0__informações_contato')}
                  </h3>

                  <Stack gap={6}>
                    <Inline gap={4}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                        <PiEnvelopeSimple className="w-6 h-6 text-theme-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-theme-primary">
                          {t('contact_jsx_h4_children_0__email')}
                        </h4>
                        <p className="text-theme-secondary">
                          {t('contact_jsx_p_children_0__email_address')}
                        </p>
                      </div>
                    </Inline>

                    <Inline gap={4}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                        <PiPhone className="w-6 h-6 text-theme-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-theme-primary">
                          {t('contact_jsx_h4_children_0__telefone')}
                        </h4>
                        <p className="text-theme-secondary">
                          {t('contact_jsx_p_children_0__telefone_number')}
                        </p>
                      </div>
                    </Inline>

                    <Inline gap={4}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                        <PiMapPin className="w-6 h-6 text-theme-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-theme-primary">
                          {t('contact_jsx_h4_children_0__localização')}
                        </h4>
                        <p className="text-theme-secondary">
                          {t('contact_jsx_p_children_0__localização_address')}
                        </p>
                      </div>
                    </Inline>
                  </Stack>
                </AnimatedCard>

                <AnimatedCard hover="lift" className="classical-card !p-8">
                  <h3 className="text-xl font-bold classical-title text-theme-primary mb-6">
                    {t('contact_jsx_h3_children_0__horário_atendimento')}
                  </h3>

                  <Stack>
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
                  </Stack>

                  <div className="mt-6 p-4 rounded-lg bg-sup-2">
                    <Inline gap={3}>
                      <PiClock className="w-5 h-5" />
                      <span className="font-medium">
                        {t('contact_jsx_span_children_0__resposta_tempo')}
                      </span>
                    </Inline>
                  </div>
                </AnimatedCard>

                <AnimatedCard hover="lift" className="classical-card !p-8">
                  <h3 className="text-xl font-bold classical-title text-theme-primary mb-6">
                    {t('contact_jsx_h3_children_0__outros_canais')}
                  </h3>

                  <Stack>
                    <Link
                      href="/faq"
                      className="flex items-center space-x-3 text-theme-secondary transition-colors"
                    >
                      <PiQuestion className="w-5 h-5" />
                      <span>
                        {t('contact_jsx_link_children_0__central_ajuda')}
                      </span>
                    </Link>

                    <Link
                      href="/help"
                      className="flex items-center space-x-3 text-theme-secondary transition-colors"
                    >
                      <PiChatCircle className="w-5 h-5" />
                      <span>
                        {t('contact_jsx_link_children_0__guias_tutoriais')}
                      </span>
                    </Link>

                    <Link
                      href="/support"
                      className="flex items-center space-x-3 text-theme-secondary transition-colors"
                    >
                      <PiUser className="w-5 h-5" />
                      <span>
                        {t('contact_jsx_link_children_0__suporte_técnico')}
                      </span>
                    </Link>
                  </Stack>
                </AnimatedCard>
              </div>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Floating Elements */}
      <FloatingElement className="top-16 left-16 text-6xl" delay={0}>
        <PiMusicNotes />
      </FloatingElement>
      <FloatingElement className="bottom-16 right-16 text-5xl" delay={2}>
        <GiGrandPiano />
      </FloatingElement>
      <FloatingElement className="top-1/3 right-24 text-4xl" delay={1}>
        <PiEnvelopeSimple />
      </FloatingElement>
    </PageContainer>
  );
}
