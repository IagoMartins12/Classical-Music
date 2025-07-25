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
import { GiMusicalNotes, GiGrandPiano, GiScrollQuill } from 'react-icons/gi';
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

interface ContactOption {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action: string;
  color: string;
  category: string;
}

const contactOptions: ContactOption[] = [
  {
    icon: FiMessageCircle,
    title: 'Suporte Geral',
    description: 'Dúvidas sobre funcionalidades, conta ou navegação',
    action: 'Falar com Suporte',
    color: 'from-accent-blue to-accent-purple',
    category: 'suporte',
  },
  {
    icon: BiBug,
    title: 'Reportar Bug',
    description: 'Encontrou um erro ou problema técnico?',
    action: 'Reportar Problema',
    color: 'from-accent-red to-accent-amber',
    category: 'bug',
  },
  {
    icon: FiUpload,
    title: 'Moderação de Conteúdo',
    description: 'Questões sobre uploads, verificação ou moderação',
    action: 'Contatar Moderação',
    color: 'from-accent-green to-accent-blue',
    category: 'moderacao',
  },
  {
    icon: FiUser,
    title: 'Parcerias',
    description: 'Interesse em parcerias, colaborações ou publicidade',
    action: 'Propor Parceria',
    color: 'from-brand-primary to-brand-secondary',
    category: 'parceria',
  },
];

export default function ContactPageClient() {
  const { submitForm, loading, success, error, reset } = useContactForm();
  const [selectedCategory, setSelectedCategory] = useState('suporte');
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

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setFormData((prev) => ({
      ...prev,
      subject: getDefaultSubject(category),
    }));
  };

  const getDefaultSubject = (category: string): string => {
    switch (category) {
      case 'suporte':
        return 'Dúvida sobre funcionalidades';
      case 'bug':
        return 'Relato de problema técnico';
      case 'moderacao':
        return 'Questão sobre moderação de conteúdo';
      case 'parceria':
        return 'Proposta de parceria';
      default:
        return '';
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
        message: 'Enviando mensagem...',
        color: 'text-brand-primary',
      };
    }

    if (success) {
      return {
        icon: <FiCheckCircle className="w-5 h-5 text-accent-green" />,
        message: 'Mensagem enviada com sucesso! Responderemos em breve.',
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
                    Fale Conosco
                  </span>
                </div>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <h1 className="text-4xl lg:text-6xl font-bold classical-title text-theme-primary mb-6">
                  Entre em
                  <span className="text-gradient-brand block lg:inline lg:ml-4">
                    Contato
                  </span>
                </h1>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <p className="text-xl lg:text-2xl text-theme-secondary leading-relaxed classical-body">
                  Estamos aqui para ajudar você a aproveitar ao máximo sua
                  experiência musical no Opus Atlas.
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
          <div className="section-wrap">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-4">
                Como podemos ajudar?
              </h2>
              <p className="text-xl text-theme-secondary max-w-2xl mx-auto">
                Escolha a categoria que melhor se adequa à sua necessidade
              </p>
            </div>

            <SequentialGrid cols={2} gap={8} delayBetweenItems={0.1}>
              {contactOptions.map((option, index) => (
                <AnimatedCard
                  key={index}
                  hover="lift"
                  className={`classical-card p-6 cursor-pointer group transition-all duration-300 ${
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
                      ? '✓ Selecionado'
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
          <div className="section-wrap">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <AnimatedCard hover="lift" className="classical-card p-8">
                <h3 className="text-2xl font-bold classical-title text-theme-primary mb-6">
                  Envie sua mensagem
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
                        Fechar
                      </button>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        Nome *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        disabled={loading || success}
                        className="input-classical-2 w-full disabled:opacity-50"
                        placeholder="Seu nome completo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={loading || success}
                        className="input-classical-2 w-full disabled:opacity-50"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Assunto *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      disabled={loading || success}
                      className="input-classical-2 w-full disabled:opacity-50"
                      placeholder="Descreva brevemente o assunto"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Prioridade
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      disabled={loading || success}
                      className="input-classical-2 w-full disabled:opacity-50"
                    >
                      <option value="baixa">Baixa</option>
                      <option value="normal">Normal</option>
                      <option value="alta">Alta</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Mensagem *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      disabled={loading || success}
                      className="input-classical-2 w-full resize-none disabled:opacity-50"
                      placeholder="Descreva sua dúvida, problema ou sugestão em detalhes..."
                    />
                  </div>

                  {/* Newsletter Subscription Option */}
                  <div className="flex items-start space-x-3 p-4 bg-theme-secondary rounded-lg">
                    <input
                      type="checkbox"
                      name="subscribeNewsletter"
                      checked={formData.subscribeNewsletter}
                      onChange={handleInputChange}
                      disabled={loading || success}
                      className="mt-1 rounded border-theme-primary text-brand-primary focus:ring-brand-primary disabled:opacity-50"
                    />
                    <div>
                      <label className="font-medium text-theme-primary cursor-pointer">
                        Receber newsletter
                      </label>
                      <p className="text-sm text-theme-tertiary">
                        Mantenha-se atualizado com novidades sobre música
                        clássica, novos compositores e funcionalidades da
                        plataforma.
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
                        <span>Enviando...</span>
                      </>
                    ) : success ? (
                      <>
                        <FiCheckCircle className="w-5 h-5" />
                        <span>Enviado!</span>
                      </>
                    ) : (
                      <>
                        <FiSend className="w-5 h-5" />
                        <span>Enviar Mensagem</span>
                      </>
                    )}
                  </button>
                </form>
              </AnimatedCard>

              {/* Contact Info */}
              <div className="space-y-8">
                <AnimatedCard hover="lift" className="classical-card p-8">
                  <h3 className="text-2xl font-bold classical-title text-theme-primary mb-6">
                    Informações de Contato
                  </h3>

                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
                        <FiMail className="w-6 h-6 text-theme-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-theme-primary">
                          Email
                        </h4>
                        <p className="text-theme-secondary">
                          contato@classicalhub.com
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center">
                        <FiPhone className="w-6 h-6 text-theme-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-theme-primary">
                          Telefone
                        </h4>
                        <p className="text-theme-secondary">
                          +55 (11) 9999-9999
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center">
                        <FiMapPin className="w-6 h-6 text-theme-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-theme-primary">
                          Localização
                        </h4>
                        <p className="text-theme-secondary">
                          São Paulo, Brasil
                        </p>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard hover="lift" className="classical-card p-8">
                  <h3 className="text-xl font-bold classical-title text-theme-primary mb-6">
                    Horário de Atendimento
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-theme-secondary">
                        Segunda - Sexta
                      </span>
                      <span className="text-theme-primary font-medium">
                        9h às 18h
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-theme-secondary">Sábado</span>
                      <span className="text-theme-primary font-medium">
                        9h às 14h
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-theme-secondary">Domingo</span>
                      <span className="text-theme-tertiary">Fechado</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-accent-blue/10 border border-accent-blue/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FiClock className="w-5 h-5 text-accent-blue" />
                      <span className="text-accent-blue font-medium">
                        Resposta em até 24 horas
                      </span>
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard hover="lift" className="classical-card p-8">
                  <h3 className="text-xl font-bold classical-title text-theme-primary mb-6">
                    Outros Canais
                  </h3>

                  <div className="space-y-4">
                    <Link
                      href="/faq"
                      className="flex items-center space-x-3 text-theme-secondary hover:text-brand-primary transition-colors"
                    >
                      <FiHelpCircle className="w-5 h-5" />
                      <span>Central de Ajuda (FAQ)</span>
                    </Link>

                    <Link
                      href="/help"
                      className="flex items-center space-x-3 text-theme-secondary hover:text-brand-primary transition-colors"
                    >
                      <FiMessageCircle className="w-5 h-5" />
                      <span>Guias e Tutoriais</span>
                    </Link>

                    <Link
                      href="/support"
                      className="flex items-center space-x-3 text-theme-secondary hover:text-brand-primary transition-colors"
                    >
                      <FiUser className="w-5 h-5" />
                      <span>Suporte Técnico</span>
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
      <FloatingElement
        className="bottom-1/3 left-24 text-4xl text-brand-secondary/5"
        delay={3}
      >
        <GiScrollQuill />
      </FloatingElement>
    </PageContainer>
  );
}
