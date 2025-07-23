import React from 'react';
import {
  FiShield,
  FiLock,
  FiEye,
  FiDatabase,
  FiShare2,
  FiSettings,
  FiMail,
  FiCheck,
  FiUser,
} from 'react-icons/fi';
import {
  GiMusicalNotes,
  GiGrandPiano,
  GiScrollQuill,
  GiShield,
} from 'react-icons/gi';
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
import { BiCookie } from 'react-icons/bi';

interface PrivacySection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content: string[];
}

const privacyData: PrivacySection[] = [
  {
    id: 'collection',
    title: 'Informações que Coletamos',
    icon: FiDatabase,
    content: [
      'Informações de cadastro: nome, email, data de nascimento e localização (opcional).',
      'Preferências musicais: compositores favoritos, instrumentos, nível de experiência.',
      'Atividades na plataforma: favoritos, anotações, sessões de estudo e progresso.',
      'Dados técnicos: endereço IP, tipo de dispositivo, navegador e dados de uso.',
      'Informações de uploads: conteúdo enviado, metadados e histórico de moderação.',
    ],
  },
  {
    id: 'usage',
    title: 'Como Usamos suas Informações',
    icon: FiEye,
    content: [
      'Personalizar sua experiência de aprendizado e recomendações.',
      'Manter a segurança e integridade da plataforma.',
      'Comunicar atualizações importantes e novidades.',
      'Moderar conteúdo e uploads para garantir qualidade.',
      'Gerar estatísticas anônimas para melhorar nossos serviços.',
      'Processar publicidades direcionadas de forma não intrusiva.',
    ],
  },
  {
    id: 'sharing',
    title: 'Compartilhamento de Informações',
    icon: FiShare2,
    content: [
      'Suas anotações privadas nunca são compartilhadas com terceiros.',
      'Anotações públicas são visíveis para toda a comunidade.',
      'Informações básicas do perfil podem ser visíveis se você optar por perfil público.',
      'Não vendemos seus dados pessoais para terceiros.',
      'Podemos compartilhar dados agregados e anônimos para pesquisas educacionais.',
    ],
  },
  {
    id: 'cookies',
    title: 'Cookies e Tecnologias Similares',
    icon: BiCookie,
    content: [
      'Usamos cookies essenciais para funcionamento da plataforma.',
      'Cookies de preferências salvam suas configurações e tema.',
      'Cookies de análise nos ajudam a entender como você usa a plataforma.',
      'Cookies de publicidade permitem anúncios relevantes (se habilitados).',
      'Você pode gerenciar cookies através das configurações do seu navegador.',
    ],
  },
  {
    id: 'security',
    title: 'Segurança dos Dados',
    icon: FiLock,
    content: [
      'Utilizamos criptografia SSL/TLS para proteger dados em trânsito.',
      'Senhas são armazenadas com hash seguro e nunca em texto plano.',
      'Implementamos controles de acesso rigorosos aos nossos sistemas.',
      'Realizamos backups regulares e seguros dos dados.',
      'Monitoramos constantemente por atividades suspeitas.',
    ],
  },
  {
    id: 'rights',
    title: 'Seus Direitos',
    icon: FiUser,
    content: [
      'Acesso: você pode solicitar uma cópia dos seus dados.',
      'Correção: você pode corrigir informações incorretas.',
      'Exclusão: você pode solicitar a exclusão dos seus dados.',
      'Portabilidade: você pode solicitar seus dados em formato estruturado.',
      'Objeção: você pode se opor ao processamento de seus dados.',
      'Limitação: você pode solicitar limitação do processamento.',
    ],
  },
  {
    id: 'retention',
    title: 'Retenção de Dados',
    icon: FiSettings,
    content: [
      'Mantemos suas informações apenas pelo tempo necessário.',
      'Dados de conta são mantidos enquanto sua conta estiver ativa.',
      'Anotações públicas podem ser mantidas para benefício da comunidade.',
      'Dados de moderação são mantidos por motivos de segurança.',
      'Você pode solicitar exclusão de dados a qualquer momento.',
    ],
  },
  {
    id: 'children',
    title: 'Proteção de Menores',
    icon: FiShield,
    content: [
      'Não coletamos intencionalmente dados de menores de 13 anos.',
      'Usuários entre 13-16 anos precisam de autorização parental.',
      'Implementamos proteções adicionais para usuários jovens.',
      'Pais podem solicitar revisão ou exclusão de dados de menores.',
    ],
  },
];

const dataTypes = [
  {
    icon: FiUser,
    title: 'Dados de Perfil',
    description: 'Nome, email, foto e preferências musicais',
    retention: 'Até exclusão da conta',
  },
  {
    icon: FiSettings,
    title: 'Dados de Uso',
    description: 'Favoritos, anotações, sessões de estudo',
    retention: 'Até exclusão da conta',
  },
  {
    icon: FiDatabase,
    title: 'Dados Técnicos',
    description: 'IP, dispositivo, navegador, logs',
    retention: '90 dias',
  },
  {
    icon: FiShare2,
    title: 'Dados Públicos',
    description: 'Anotações públicas, contribuições',
    retention: 'Permanente (anonimizado)',
  },
];

export default function PrivacyPage() {
  const lastUpdated = 'Janeiro de 2025';

  return (
    <PageContainer
      showBackground={true}
      className="classical-theme section-wrap"
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-accent-purple/5 to-accent-blue/5"></div>
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="relative ">
            <div className="text-center max-w-4xl mx-auto">
              <AnimatedItem direction="scale" springType="bouncy">
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-full mb-8">
                  <FiShield className="w-5 h-5 text-brand-primary mr-2" />
                  <span className="text-brand-primary font-medium">
                    Proteção de Dados
                  </span>
                </div>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <h1 className="text-4xl lg:text-6xl font-bold classical-title text-theme-primary mb-6">
                  Política de
                  <span className="text-gradient-brand block lg:inline lg:ml-4">
                    Privacidade
                  </span>
                </h1>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <p className="text-xl lg:text-2xl text-theme-secondary leading-relaxed classical-body">
                  Conheça como protegemos seus dados e respeitamos sua
                  privacidade no Opus Atlas.
                </p>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <div className="mt-8 inline-flex items-center space-x-2 text-theme-tertiary">
                  <FiLock className="w-4 h-4" />
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
      <section className="py-8">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="">
            <div className="max-w-4xl mx-auto">
              <AnimatedCard hover="lift" className="classical-card p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-accent-blue rounded-2xl flex items-center justify-center flex-shrink-0">
                    <GiShield className="w-8 h-8 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold classical-title text-theme-primary mb-4">
                      Compromisso com sua Privacidade
                    </h2>
                    <p className="text-lg text-theme-secondary classical-body leading-relaxed">
                      No Opus Atlas, levamos sua privacidade muito a sério. Esta
                      política explica como coletamos, usamos, protegemos e
                      compartilhamos suas informações quando você usa nossa
                      plataforma educacional de música clássica.
                    </p>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Data Types Overview */}
      <section className="py-8">
        <AnimatedContainer delay={0.1} staggerSpeed="fast">
          <div className="">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold classical-title text-theme-primary mb-4">
                  Tipos de Dados Coletados
                </h2>
                <p className="text-xl text-theme-secondary">
                  Visão geral dos diferentes tipos de informações que
                  processamos
                </p>
              </div>

              <SequentialGrid cols={2} gap={6} delayBetweenItems={0.1}>
                {dataTypes.map((dataType, index) => (
                  <AnimatedCard
                    key={index}
                    hover="lift"
                    className="classical-card p-6"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center flex-shrink-0">
                        <dataType.icon className="w-6 h-6 text-theme-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold classical-title text-theme-primary mb-2">
                          {dataType.title}
                        </h3>
                        <p className="text-theme-secondary text-sm mb-3">
                          {dataType.description}
                        </p>
                        <div className="text-xs text-theme-tertiary">
                          <span className="font-medium">Retenção:</span>{' '}
                          {dataType.retention}
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                ))}
              </SequentialGrid>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Privacy Sections */}
      <section className="py-8">
        <AnimatedContainer delay={0.1} staggerSpeed="fast">
          <div className="">
            <div className="max-w-4xl mx-auto space-y-8">
              {privacyData.map((section, index) => (
                <AnimatedItem
                  key={section.id}
                  direction="up"
                  springType="gentle"
                  delay={index * 0.1}
                >
                  <div className="classical-card p-8">
                    <div className="flex items-start space-x-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center flex-shrink-0">
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

      {/* Your Rights */}
      <section className="py-8">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="">
            <div className="max-w-4xl mx-auto">
              <AnimatedCard hover="lift" className="classical-card p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiCheck className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold classical-title text-theme-primary mb-4">
                      Exercendo seus Direitos
                    </h3>
                    <p className="text-theme-secondary mb-6">
                      Para exercer qualquer um dos seus direitos de privacidade,
                      entre em contato conosco:
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <FiMail className="w-4 h-4 text-brand-primary" />
                        <span className="text-theme-secondary">
                          privacidade@classicalhub.com
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <FiSettings className="w-4 h-4 text-brand-primary" />
                        <span className="text-theme-secondary">
                          Configurações de Privacidade no seu perfil
                        </span>
                      </div>
                    </div>
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
          <div className="relative ">
            <div className="max-w-4xl mx-auto">
              <AnimatedCard
                hover="lift"
                className="classical-card p-12 text-center"
              >
                <div className="w-20 h-20 bg-brand-gradient rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <FiMail className="w-10 h-10 text-theme-primary" />
                </div>

                <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-6">
                  Dúvidas sobre Privacidade?
                </h2>

                <p className="text-xl text-theme-secondary mb-12 classical-body">
                  Nossa equipe está pronta para esclarecer qualquer dúvida sobre
                  como tratamos seus dados.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link
                    href="/contact"
                    className="btn-classical-primary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                  >
                    <FiMail className="w-5 h-5" />
                    <span>Contatar DPO</span>
                  </Link>

                  <Link
                    href="/terms"
                    className="btn-classical-secondary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                  >
                    <FiShield className="w-5 h-5" />
                    <span>Termos de Uso</span>
                  </Link>
                </div>

                <div className="flex items-center justify-center space-x-8 mt-12 pt-8 border-t border-theme-secondary">
                  <div className="flex items-center space-x-2 text-theme-tertiary">
                    <FiShield className="w-4 h-4" />
                    <span className="text-sm">Conformidade com LGPD</span>
                  </div>
                  <div className="flex items-center space-x-2 text-theme-tertiary">
                    <FiLock className="w-4 h-4" />
                    <span className="text-sm">Dados criptografados</span>
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
        <GiShield />
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
