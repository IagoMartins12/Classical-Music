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
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano, GiScrollQuill } from 'react-icons/gi';
import AnimatedMusicalNotes from '../../components/AnimatedMusicalNotes';
import Link from 'next/link';

// Importar componentes de animação
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
  SequentialGrid,
  FloatingElement,
} from '../../components/animation/AnimatedComponents';
import { BiBug } from 'react-icons/bi';

interface ContactOption {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action: string;
  color: string;
}

const contactOptions: ContactOption[] = [
  {
    icon: FiMessageCircle,
    title: 'Suporte Geral',
    description: 'Dúvidas sobre funcionalidades, conta ou navegação',
    action: 'Falar com Suporte',
    color: 'from-accent-blue to-accent-purple',
  },
  {
    icon: BiBug,
    title: 'Reportar Bug',
    description: 'Encontrou um erro ou problema técnico?',
    action: 'Reportar Problema',
    color: 'from-accent-red to-accent-amber',
  },
  {
    icon: FiUpload,
    title: 'Moderação de Conteúdo',
    description: 'Questões sobre uploads, verificação ou moderação',
    action: 'Contatar Moderação',
    color: 'from-accent-green to-accent-blue',
  },
  {
    icon: FiUser,
    title: 'Parcerias',
    description: 'Interesse em parcerias, colaborações ou publicidade',
    action: 'Propor Parceria',
    color: 'from-brand-primary to-brand-secondary',
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'suporte',
    message: '',
    priority: 'normal',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simular envio
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: 'suporte',
        message: '',
        priority: 'normal',
      });
    }, 2000);
  };

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
                  experiência musical no Classical Hub.
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
                  className="classical-card p-6 cursor-pointer group"
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

                  <div className="text-brand-primary font-medium group-hover:text-brand-secondary transition-colors">
                    {option.action} →
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

                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-accent-green/10 border border-accent-green/20 rounded-lg flex items-center space-x-3">
                    <FiCheckCircle className="w-5 h-5 text-accent-green" />
                    <span className="text-accent-green font-medium">
                      Mensagem enviada com sucesso! Responderemos em breve.
                    </span>
                  </div>
                )}

                <div className="space-y-6">
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
                        className="input-classical-2 w-full"
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
                        className="input-classical-2 w-full"
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
                      className="input-classical-2 w-full"
                      placeholder="Descreva brevemente o assunto"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        Categoria
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="input-classical-2 w-full"
                      >
                        <option value="suporte">Suporte Geral</option>
                        <option value="bug">Reportar Bug</option>
                        <option value="moderacao">Moderação</option>
                        <option value="parceria">Parcerias</option>
                        <option value="feedback">Feedback</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        Prioridade
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="input-classical-2 w-full"
                      >
                        <option value="baixa">Baixa</option>
                        <option value="normal">Normal</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                      </select>
                    </div>
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
                      className="input-classical-2 w-full resize-none"
                      placeholder="Descreva sua dúvida, problema ou sugestão em detalhes..."
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="btn-classical-primary w-full flex items-center justify-center space-x-3 py-4 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <FiSend className="w-5 h-5" />
                        <span>Enviar Mensagem</span>
                      </>
                    )}
                  </button>
                </div>
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
