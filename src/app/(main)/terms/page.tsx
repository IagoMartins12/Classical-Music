import React from 'react';
import {
  FiShield,
  FiFileText,
  FiUpload,
  FiUser,
  FiHeart,
  FiAlertCircle,
  FiCheck,
  FiMail,
} from 'react-icons/fi';
import {
  GiMusicalNotes,
  GiGrandPiano,
  GiScrollQuill,
  GiGavel,
} from 'react-icons/gi';
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

interface TermsSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content: string[];
}

const termsData: TermsSection[] = [
  {
    id: 'acceptance',
    title: 'Aceitação dos Termos',
    icon: FiCheck,
    content: [
      'Ao acessar e usar o Classical Hub, você concorda em ficar vinculado a estes Termos de Uso e todas as leis e regulamentos aplicáveis.',
      'Se você não concordar com algum destes termos, está proibido de usar ou acessar este site.',
      'Reservamo-nos o direito de modificar estes termos a qualquer momento, sendo sua responsabilidade verificar periodicamente as alterações.',
    ],
  },
  {
    id: 'use',
    title: 'Uso da Plataforma',
    icon: FiUser,
    content: [
      'O Classical Hub é uma plataforma educacional destinada ao estudo e apreciação da música clássica.',
      'Você pode usar a plataforma para explorar compositores, obras, partituras e utilizar as ferramentas de estudo disponíveis.',
      'É proibido usar a plataforma para fins comerciais não autorizados, spam ou qualquer atividade ilegal.',
      'Você é responsável por manter a segurança de sua conta e senha.',
    ],
  },
  {
    id: 'content',
    title: 'Conteúdo e Propriedade Intelectual',
    icon: FiFileText,
    content: [
      'As partituras disponíveis provêm principalmente do IMSLP e são de domínio público.',
      'Informações sobre compositores e obras são curadas por nossa equipe e pela comunidade.',
      'Você mantém os direitos sobre suas anotações pessoais e uploads aprovados.',
      'É proibido copiar, reproduzir ou distribuir conteúdo protegido por direitos autorais.',
    ],
  },
  {
    id: 'uploads',
    title: 'Sistema de Uploads',
    icon: FiUpload,
    content: [
      'Usuários verificados podem fazer upload de compositores, obras e partituras.',
      'Todo conteúdo enviado passa por processo de moderação antes da publicação.',
      'Você declara ter direitos legais sobre o conteúdo que envia.',
      'Reservamo-nos o direito de remover qualquer conteúdo que viole direitos autorais ou nossas políticas.',
      'O sistema de pontuação recompensa uploads de qualidade e penaliza conteúdo inadequado.',
    ],
  },
  {
    id: 'user-conduct',
    title: 'Conduta do Usuário',
    icon: FiShield,
    content: [
      'Seja respeitoso com outros usuários em anotações e interações.',
      'Não publique conteúdo ofensivo, discriminatório ou inadequado.',
      'Use o sistema de reports para denunciar conteúdo impróprio.',
      'Não tente burlar nossos sistemas de moderação ou segurança.',
      'Colabore construtivamente com a comunidade musical.',
    ],
  },
  {
    id: 'favorites',
    title: 'Sistema de Favoritos e Anotações',
    icon: FiHeart,
    content: [
      'Você pode favoritar compositores, obras e partituras para organizar seu estudo.',
      'Anotações podem ser privadas ou compartilhadas com a comunidade.',
      'Anotações públicas devem ser educativas e respeitosas.',
      'Reservamo-nos o direito de moderar anotações públicas.',
    ],
  },
  {
    id: 'limitations',
    title: 'Limitações de Responsabilidade',
    icon: FiAlertCircle,
    content: [
      'A plataforma é fornecida "como está", sem garantias de qualquer tipo.',
      'Não nos responsabilizamos por danos decorrentes do uso da plataforma.',
      'Não garantimos a precisão absoluta de todas as informações musicais.',
      'Você usa a plataforma por sua própria conta e risco.',
    ],
  },
  {
    id: 'termination',
    title: 'Suspensão e Encerramento',
    icon: GiGavel,
    content: [
      'Podemos suspender ou encerrar sua conta por violação destes termos.',
      'Você pode encerrar sua conta a qualquer momento através das configurações.',
      'Após o encerramento, você perde acesso a favoritos e anotações privadas.',
      'Anotações públicas podem permanecer na plataforma para benefício da comunidade.',
    ],
  },
];

export default function TermsPage() {
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
                  <FiFileText className="w-5 h-5 text-brand-primary mr-2" />
                  <span className="text-brand-primary font-medium">
                    Termos Legais
                  </span>
                </div>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <h1 className="text-4xl lg:text-6xl font-bold classical-title text-theme-primary mb-6">
                  Termos de
                  <span className="text-gradient-brand block lg:inline lg:ml-4">
                    Uso
                  </span>
                </h1>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <p className="text-xl lg:text-2xl text-theme-secondary leading-relaxed classical-body">
                  Conheça os termos que regem o uso do Classical Hub e nossa
                  comunidade musical.
                </p>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <div className="mt-8 inline-flex items-center space-x-2 text-theme-tertiary">
                  <FiShield className="w-4 h-4" />
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
                      Bem-vindo ao Classical Hub
                    </h2>
                    <p className="text-lg text-theme-secondary classical-body leading-relaxed">
                      Estes Termos de Uso estabelecem as regras para o uso de
                      nossa plataforma educacional de música clássica. Ao criar
                      uma conta ou utilizar nossos serviços, você concorda em
                      cumprir estes termos e contribuir para uma comunidade
                      musical respeitosa e educativa.
                    </p>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Terms Sections */}
      <section className="">
        <AnimatedContainer delay={0.1} staggerSpeed="fast">
          <div className="">
            <div className="max-w-4xl mx-auto space-y-8">
              {termsData.map((section, index) => (
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
                      Importantes Considerações
                    </h3>
                    <ul className="space-y-3 text-theme-secondary">
                      <li className="flex items-start space-x-2">
                        <FiCheck className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
                        <span>
                          O Classical Hub é uma plataforma educacional sem fins
                          lucrativos
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <FiCheck className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
                        <span>
                          Respeitamos direitos autorais e políticas de domínio
                          público
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <FiCheck className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
                        <span>
                          Valorizamos a qualidade e precisão das informações
                          musicais
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <FiCheck className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
                        <span>
                          Promovemos uma comunidade colaborativa e respeitosa
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

      {/* Contact and Related Links */}
      <section className=" relative overflow-hidden">
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
                  Dúvidas sobre os Termos?
                </h2>

                <p className="text-xl text-theme-secondary mb-12 classical-body">
                  Se você tiver alguma dúvida sobre estes termos de uso, entre
                  em contato conosco.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link
                    href="/contact"
                    className="btn-classical-primary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                  >
                    <FiMail className="w-5 h-5" />
                    <span>Entre em Contato</span>
                  </Link>

                  <Link
                    href="/privacy"
                    className="btn-classical-secondary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                  >
                    <FiShield className="w-5 h-5" />
                    <span>Política de Privacidade</span>
                  </Link>
                </div>

                <div className="flex items-center justify-center space-x-8 mt-12 pt-8 border-t border-theme-secondary">
                  <Link
                    href="/faq"
                    className="flex items-center space-x-2 text-theme-tertiary hover:text-brand-primary transition-colors"
                  >
                    <FiFileText className="w-4 h-4" />
                    <span className="text-sm">Perguntas Frequentes</span>
                  </Link>
                  <Link
                    href="/help"
                    className="flex items-center space-x-2 text-theme-tertiary hover:text-brand-primary transition-colors"
                  >
                    <FiUser className="w-4 h-4" />
                    <span className="text-sm">Central de Ajuda</span>
                  </Link>
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
