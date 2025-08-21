import React from 'react';
import {
  FiShield,
  FiFileText,
  FiUpload,
  FiAlertCircle,
  FiCheck,
  FiMail,
  FiFlag,
  FiGlobe,
  FiUsers,
  FiBook,
  FiEye,
  FiLock,
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
  FloatingElement,
} from '../../components/animation/AnimatedComponents';
import { FaBalanceScale } from 'react-icons/fa';

interface CopyrightSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content: string[];
}

const copyrightData: CopyrightSection[] = [
  {
    id: 'our-commitment',
    title: 'Nosso Compromisso',
    icon: FiShield,
    content: [
      'O Opus Atlas respeita rigorosamente os direitos autorais de compositores, editores e demais detentores de direitos.',
      'Trabalhamos exclusivamente com partituras de domínio público, principalmente através do IMSLP (International Music Score Library Project).',
      'Implementamos sistemas de verificação para garantir que todo conteúdo disponibilizado seja legal e apropriado.',
      'Colaboramos com editoras e detentores de direitos para resolver rapidamente qualquer questão que possa surgir.',
    ],
  },
  {
    id: 'public-domain',
    title: 'Domínio Público e IMSLP',
    icon: FiGlobe,
    content: [
      'A maioria das partituras disponíveis no Opus Atlas provém do IMSLP, uma biblioteca digital de partituras de domínio público.',
      'Obras entram em domínio público quando seus direitos autorais expiram, geralmente 70 anos após a morte do compositor.',
      'Verificamos cuidadosamente o status de domínio público antes de disponibilizar qualquer conteúdo.',
      'Respeitamos as diferenças nas leis de direitos autorais entre países e aplicamos as mais restritivas.',
    ],
  },
  {
    id: 'user-uploads',
    title: 'Uploads da Comunidade',
    icon: FiUpload,
    content: [
      'Usuários podem fazer upload de compositores, obras e partituras, desde que sigam nossas diretrizes rigorosas.',
      'Todo upload passa por processo de moderação antes de ser publicado na plataforma.',
      'Exigimos que o usuário declare ter direitos legais sobre o conteúdo enviado.',
      'Removemos imediatamente qualquer conteúdo que viole direitos autorais após verificação.',
      'Mantemos um sistema de pontuação que penaliza uploads inadequados.',
    ],
  },
  {
    id: 'moderation',
    title: 'Sistema de Moderação',
    icon: FiUsers,
    content: [
      'Nossa equipe de moderadores verifica todo conteúdo enviado pela comunidade.',
      'Utilizamos ferramentas automatizadas para detectar possíveis violações de direitos autorais.',
      'Mantemos um banco de dados de conteúdo protegido para comparação automática.',
      'Respondemos a reports de usuários em até 24 horas.',
      'Documentamos todas as decisões de moderação para transparência.',
    ],
  },
  {
    id: 'reporting',
    title: 'Como Reportar Violações',
    icon: FiFlag,
    content: [
      'Se você acredita que algum conteúdo viola direitos autorais, pode reportar através do sistema de reports.',
      'Forneça informações detalhadas sobre a violação, incluindo links e documentos comprobatórios.',
      'Nossa equipe investigará todos os reports dentro de 48 horas.',
      'Removemos conteúdo imediatamente quando a violação é confirmada.',
      'Notificamos o usuário que enviou o conteúdo sobre a remoção e os motivos.',
    ],
  },
  {
    id: 'dmca',
    title: 'Processo DMCA',
    icon: FiFileText,
    content: [
      'Seguimos o processo DMCA (Digital Millennium Copyright Act) para remoção de conteúdo.',
      'Detentores de direitos podem enviar notificações DMCA formais para remoção rápida.',
      'Fornecemos um processo de contra-notificação para usuários que acreditam que seu conteúdo foi removido incorretamente.',
      'Mantemos registros completos de todas as notificações DMCA recebidas.',
      'Cooperamos totalmente com autoridades legais quando necessário.',
    ],
  },
  {
    id: 'fair-use',
    title: 'Uso Educacional e Fair Use',
    icon: FiBook,
    content: [
      'O Opus Atlas é uma plataforma educacional dedicada ao ensino e aprendizado de música clássica.',
      'Nosso uso de conteúdo se enquadra em exceções educacionais das leis de direitos autorais.',
      'Não comercializamos partituras ou conteúdo protegido por direitos autorais.',
      'Sempre creditamos adequadamente autores, editores e fontes originais.',
      'Limitamos o uso de conteúdo ao mínimo necessário para fins educacionais.',
    ],
  },
  {
    id: 'permissions',
    title: 'Permissões e Licenças',
    icon: FiLock,
    content: [
      'Quando necessário, obtemos permissões específicas de detentores de direitos.',
      'Trabalhamos com editoras para licenciar conteúdo educacional apropriado.',
      'Respeitamos todas as condições de licenciamento e uso.',
      'Mantemos registros detalhados de todas as permissões obtidas.',
      'Renovamos licenças conforme necessário para manter o conteúdo disponível.',
    ],
  },
];

const reportSteps = [
  {
    step: 1,
    title: 'Identifique a Violação',
    description:
      'Localize o conteúdo que você acredita violar direitos autorais',
  },
  {
    step: 2,
    title: 'Colete Evidências',
    description:
      'Reúna documentos que comprovem seus direitos sobre o conteúdo',
  },
  {
    step: 3,
    title: 'Envie o Report',
    description:
      'Use nosso sistema de reports ou envie email para nosso DMCA agent',
  },
  {
    step: 4,
    title: 'Aguarde Investigação',
    description: 'Nossa equipe investigará e responderá em até 48 horas',
  },
  {
    step: 5,
    title: 'Resolução',
    description: 'Removeremos o conteúdo se a violação for confirmada',
  },
];

const publicDomainExamples = [
  {
    composer: 'Johann Sebastian Bach',
    period: '1685-1750',
    status: 'Domínio Público',
    reason: 'Obras anteriores a 1923',
  },
  {
    composer: 'Wolfgang Amadeus Mozart',
    period: '1756-1791',
    status: 'Domínio Público',
    reason: 'Obras anteriores a 1923',
  },
  {
    composer: 'Ludwig van Beethoven',
    period: '1770-1827',
    status: 'Domínio Público',
    reason: 'Obras anteriores a 1923',
  },
  {
    composer: 'Frédéric Chopin',
    period: '1810-1849',
    status: 'Domínio Público',
    reason: 'Obras anteriores a 1923',
  },
];

export default function CopyrightPage() {
  const lastUpdated = 'Janeiro de 2025';

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
                  <FiShield className="w-5 h-5 text-brand-primary mr-2" />
                  <span className="text-brand-primary font-medium">
                    Proteção Legal
                  </span>
                </div>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <h1 className="text-4xl lg:text-6xl font-bold classical-title text-theme-primary mb-6">
                  Direitos
                  <span className="text-gradient-brand block lg:inline lg:ml-4">
                    Autorais
                  </span>
                </h1>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <p className="text-xl lg:text-2xl text-theme-secondary leading-relaxed classical-body">
                  Conheça como o Opus Atlas respeita e protege os direitos
                  autorais de compositores, editores e criadores de conteúdo
                  musical.
                </p>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <div className="mt-8 inline-flex items-center space-x-2 text-theme-tertiary">
                  <FiFileText className="w-4 h-4" />
                  <span className="text-sm">
                    Última atualização: {lastUpdated}
                  </span>
                </div>
              </AnimatedItem>
            </div>
          </div>
          <AnimatedMusicalNotes />
        </AnimatedContainer>
      </section>

      {/* Introduction */}
      <section className="">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="">
            <div className="max-w-4xl mx-auto">
              <AnimatedCard hover="lift" className="classical-card p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl flex items-center justify-center flex-shrink-0">
                    <FaBalanceScale className="w-8 h-8 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold classical-title text-theme-primary mb-4">
                      Compromisso com a Legalidade
                    </h2>
                    <p className="text-lg text-theme-secondary classical-body leading-relaxed">
                      O Opus Atlas opera dentro dos mais rigorosos padrões
                      legais, trabalhando exclusivamente com partituras de
                      domínio público e implementando sistemas robustos de
                      verificação para garantir que todo conteúdo
                      disponibilizado seja legal e apropriado para uso
                      educacional.
                    </p>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Public Domain Examples */}
      <section className="py-8">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="section-wrap">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold classical-title text-theme-primary mb-4">
                  Exemplos de Domínio Público
                </h2>
                <p className="text-xl text-theme-secondary">
                  Compositores cujas obras estão em domínio público
                </p>
              </div>

              <AnimatedCard hover="lift" className="classical-card p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {publicDomainExamples.map((example, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-theme-elevated rounded-lg"
                    >
                      <div>
                        <h3 className="font-semibold text-theme-primary">
                          {example.composer}
                        </h3>
                        <p className="text-sm text-theme-tertiary">
                          {example.period}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-accent-green">
                          {example.status}
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          {example.reason}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Copyright Sections */}
      <section className="">
        <AnimatedContainer delay={0.1} staggerSpeed="fast">
          <div className="">
            <div className="max-w-4xl mx-auto space-y-8">
              {copyrightData.map((section, index) => (
                <AnimatedItem
                  key={section.id}
                  direction="up"
                  springType="gentle"
                  delay={index * 0.1}
                >
                  <div className="classical-card p-8">
                    <div className="flex items-start space-x-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center flex-shrink-0">
                        <section.icon className="w-7 h-7 text-theme-primary" />
                      </div>

                      <div className="flex-grow">
                        <h3 className="text-2xl font-bold classical-title text-theme-primary mb-6">
                          {section.title}
                        </h3>

                        <div className="space-y-4">
                          {section.content.map((paragraph, pIndex) => (
                            <p
                              key={pIndex}
                              className="text-theme-secondary classical-body leading-relaxed"
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedItem>
              ))}
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Report Process */}
      <section className="py-8">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="section-wrap">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold classical-title text-theme-primary mb-4">
                  Processo de Report
                </h2>
                <p className="text-xl text-theme-secondary">
                  Como reportar violações de direitos autorais
                </p>
              </div>

              <AnimatedCard hover="lift" className="classical-card p-8">
                <div className="space-y-6">
                  {reportSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-brand-gradient rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {step.step}
                      </div>
                      <div>
                        <h3 className="font-semibold text-theme-primary mb-2">
                          {step.title}
                        </h3>
                        <p className="text-theme-secondary">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Important Notes */}
      <section className="">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="">
            <div className="max-w-4xl mx-auto">
              <AnimatedCard hover="lift" className="classical-card p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-amber to-accent-red rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiAlertCircle className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold classical-title text-theme-primary mb-4">
                      Avisos Importantes
                    </h3>
                    <ul className="space-y-3 text-theme-secondary">
                      <li className="flex items-start space-x-2">
                        <FiCheck className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
                        <span>
                          Sempre verifique os direitos autorais antes de fazer
                          upload
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <FiCheck className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
                        <span>
                          Não assumimos responsabilidade por uploads de
                          terceiros
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <FiCheck className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
                        <span>
                          Removemos conteúdo imediatamente quando violations são
                          confirmadas
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <FiCheck className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
                        <span>
                          Cooperamos integralmente com detentores de direitos
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Contact Section */}
      <section className="py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/10 via-accent-purple/5 to-accent-blue/10"></div>

        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="relative section-wrap">
            <div className="max-w-4xl mx-auto">
              <AnimatedCard
                hover="lift"
                className="classical-card p-12 text-center"
              >
                <div className="w-20 h-20 bg-brand-gradient rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <FiMail className="w-10 h-10 text-theme-primary" />
                </div>

                <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-6">
                  DMCA Agent
                </h2>

                <p className="text-xl text-theme-secondary mb-8 classical-body">
                  Para questões relacionadas a direitos autorais, entre em
                  contato com nosso agente DMCA oficial.
                </p>

                <div className="space-y-4 mb-12">
                  <div className="flex items-center justify-center space-x-3">
                    <FiMail className="w-5 h-5 text-brand-primary" />
                    <span className="text-theme-primary font-medium">
                      dmca@classicalhub.com
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-3">
                    <FiFlag className="w-5 h-5 text-brand-primary" />
                    <span className="text-theme-primary font-medium">
                      Sistema de Reports na Plataforma
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link
                    href="/contact"
                    className="btn-classical-primary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                  >
                    <FiMail className="w-5 h-5" />
                    <span>Contatar DMCA Agent</span>
                  </Link>

                  <Link
                    href="/terms"
                    className="btn-classical-secondary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                  >
                    <FiFileText className="w-5 h-5" />
                    <span>Termos de Uso</span>
                  </Link>
                </div>

                <div className="flex items-center justify-center space-x-8 mt-12 pt-8 border-t border-theme-secondary">
                  <div className="flex items-center space-x-2 text-theme-tertiary">
                    <FiEye className="w-4 h-4" />
                    <span className="text-sm">Resposta em 48h</span>
                  </div>
                  <div className="flex items-center space-x-2 text-theme-tertiary">
                    <FiShield className="w-4 h-4" />
                    <span className="text-sm">100% Legal</span>
                  </div>
                </div>
              </AnimatedCard>
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
        <FaBalanceScale />
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
