// app/public/teachers/[id]/pageClient.tsx - Client Component para Detalhes do Professor

'use client';

import { useState, useCallback } from 'react';
import Image from '@/app/components/SmartImage';
import Link from '@/app/components/LocalizedLink';
import { TeacherDetailedProfile } from '@/app/requests/public-teachers-requests';
import {
  PiArrowSquareOut,
  PiBookOpen,
  PiCalendarBlank,
  PiChatCircle,
  PiCheckCircle,
  PiClock,
  PiEnvelopeSimple,
  PiFlag,
  PiInfo,
  PiMapPin,
  PiMusicNotes,
  PiShareNetwork,
  PiStar,
  PiTarget,
  PiTrendUp,
  PiUser,
  PiUsers,
} from 'react-icons/pi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
} from '../../../../components/animation/AnimatedComponents';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';
import { Button } from '@/app/components/ui/Button';

interface PublicTeacherDetailsPageClientProps {
  teacher: TeacherDetailedProfile;
}

export default function PublicTeacherDetailsPageClient({
  teacher,
}: PublicTeacherDetailsPageClientProps) {
  const [imageError, setImageError] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);

  // Handle WhatsApp contact
  const handleWhatsAppContact = useCallback(() => {
    if (!teacher.phone) return;

    const message = `Olá ${teacher.name}! Vi seu perfil no Opus Atlas e gostaria de mais informações sobre suas aulas de música.`;
    const phoneNumber = teacher.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }, [teacher]);

  // Handle email contact
  const handleEmailContact = useCallback(() => {
    if (!teacher.email) return;

    const subject = `Interesse em aulas de música - Opus Atlas`;
    const body = `Olá ${teacher.name}!\n\nVi seu perfil no Opus Atlas e gostaria de mais informações sobre suas aulas de música.\n\nAguardo seu retorno.\n\nObrigado!`;

    const emailUrl = `mailto:${teacher.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = emailUrl;
  }, [teacher]);

  // Handle share
  const handleShare = useCallback(async () => {
    const shareData = {
      title: `${teacher.name} - Professor de Música`,
      text: `Conheça ${teacher.name}, professor especialista em música no Opus Atlas`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Fallback para clipboard
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      // Fallback para clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  }, [teacher.name]);

  const bioToShow = showFullBio
    ? teacher.fullBio
    : teacher.fullBio.length > 500
      ? teacher.fullBio.substring(0, 500) + '...'
      : teacher.fullBio;

  return (
    <div className="">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5"></div>

      <Stack gap={8} className="section-wrap relative z-10">
        {/* Breadcrumb */}
        <AnimatedItem direction="down" springType="gentle">
          <Inline
            as="nav"
            gap={2}
            className="text-sm text-theme-tertiary mb-6 pt-4"
          >
            <Link
              href="/teachers"
              className="transition-colors duration-300 font-medium"
            >
              Professores
            </Link>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="text-theme-primary font-medium">
              {teacher.name}
            </span>
          </Inline>
        </AnimatedItem>

        <AnimatedContainer
          delay={0.1}
          staggerSpeed="normal"
          className="flex flex-col gap-4"
        >
          {/* Header Principal */}
          <AnimatedCard
            hover="lift"
            className="classical-card relative z-elevado"
          >
            <div className="p-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Informações do Professor */}
                <Stack
                  gap={6}
                  className="lg:col-span-2 order-2 md:order-1 lg:order-1"
                >
                  {/* Nome e título */}
                  <AnimatedItem direction="up" springType="bouncy">
                    <Stack gap={3}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Inline gap={3}>
                            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title leading-tight">
                              {teacher.name}
                            </h1>
                            {teacher.isVerified && (
                              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                                <PiCheckCircle className="w-5 h-5 text-theme-primary" />
                              </div>
                            )}
                          </Inline>

                          {teacher.specialties.length > 0 && (
                            <p className="text-xl text-theme-secondary mt-2">
                              Especialista em{' '}
                              {teacher.specialties.slice(0, 2).join(', ')}
                              {teacher.specialties.length > 2 &&
                                ` +${teacher.specialties.length - 2}`}
                            </p>
                          )}
                        </div>

                        {/* Ações */}
                        <Inline gap={3} className="pt-2">
                          <Button
                            variante="secundario"
                            type="submit"
                            onClick={handleShare}
                            className="flex items-center justify-center"
                            title="Compartilhar perfil"
                          >
                            <PiShareNetwork className="w-5 h-5" />
                          </Button>
                          <Button
                            variante="secundario"
                            type="submit"
                            className="flex items-center justify-center"
                          >
                            <PiFlag className="w-5 h-5" />
                            <NomeAcao acao="denunciar" />
                          </Button>
                        </Inline>
                      </div>
                    </Stack>
                  </AnimatedItem>

                  {/* Stats Cards */}
                  <AnimatedItem direction="left" springType="smooth">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Experiência */}
                      <div className="flex items-start space-x-3 group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <PiClock className="w-5 h-5 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-theme-primary">
                            {teacher.yearsExperience} anos
                          </p>
                          <Text papel="rotulo" tom="fraco" as="p">
                            Experiência
                          </Text>
                        </div>
                      </div>

                      {/* Alunos */}
                      <div className="flex items-start space-x-3 group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <PiUsers className="w-5 h-5 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-theme-primary">
                            {teacher.totalStudents}
                          </p>
                          <Text papel="rotulo" tom="fraco" as="p">
                            Alunos
                          </Text>
                        </div>
                      </div>

                      {/* Avaliação */}
                      {teacher.averageRating && (
                        <div className="flex items-start space-x-3 group">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                            <PiStar className="w-5 h-5 text-theme-primary" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-theme-primary">
                              {teacher.averageRating.toFixed(1)}
                            </p>
                            <Text papel="rotulo" tom="fraco" as="p">
                              Avaliação
                            </Text>
                          </div>
                        </div>
                      )}

                      {/* Aulas */}
                      <div className="flex items-start space-x-3 group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <PiMusicNotes className="w-5 h-5 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-theme-primary">
                            {teacher.totalLessons}
                          </p>
                          <Text papel="rotulo" tom="fraco" as="p">
                            Aulas
                          </Text>
                        </div>
                      </div>
                    </div>
                  </AnimatedItem>

                  {/* Informações Adicionais */}
                  <AnimatedItem direction="left" springType="smooth">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Localização */}
                      {teacher.location && (
                        <div className="flex items-start space-x-3 group">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                            <PiMapPin className="w-4 h-4 text-theme-primary" />
                          </div>
                          <div>
                            <Text
                              papel="rotulo"
                              tom="fraco"
                              as="p"
                              className="font-medium"
                            >
                              Localização
                            </Text>
                            <p className="text-theme-primary font-semibold">
                              {teacher.location}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Desde quando ensina */}
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <PiCalendarBlank className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <Text
                            papel="rotulo"
                            tom="fraco"
                            as="p"
                            className="font-medium"
                          >
                            Ensina desde
                          </Text>
                          <p className="text-theme-primary font-semibold">
                            {new Date(teacher.teachingSince).getFullYear()}
                          </p>
                        </div>
                      </div>

                      {/* Taxa de Conclusão */}
                      {teacher.completionRate && (
                        <div className="flex items-start space-x-3 group">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                            <PiTrendUp className="w-4 h-4 text-theme-primary" />
                          </div>
                          <div>
                            <Text
                              papel="rotulo"
                              tom="fraco"
                              as="p"
                              className="font-medium"
                            >
                              Taxa de Conclusão
                            </Text>
                            <p className="text-theme-primary font-semibold">
                              {(teacher.completionRate * 100).toFixed(0)}%
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Responde em */}
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <PiChatCircle className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <Text
                            papel="rotulo"
                            tom="fraco"
                            as="p"
                            className="font-medium"
                          >
                            Tempo de Resposta
                          </Text>
                          <p className="text-theme-primary font-semibold">
                            {teacher.contactPreferences.responseTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  </AnimatedItem>

                  {/* Botões de Contato */}
                  <AnimatedItem direction="right" springType="smooth">
                    <Stack className="pt-4">
                      <div className="flex flex-wrap gap-3">
                        {teacher.phone && (
                          <Inline
                            as="button"
                            gap={2}
                            onClick={handleWhatsAppContact}
                            className="btn-classical-primary group/btn"
                          >
                            <PiChatCircle className="w-5 h-5" />
                            <span>WhatsApp</span>
                            <svg
                              className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </Inline>
                        )}

                        {teacher.email && (
                          <Inline
                            as="button"
                            gap={2}
                            onClick={handleEmailContact}
                            className="btn-classical-secondary group/btn"
                          >
                            <PiEnvelopeSimple className="w-5 h-5" />
                            <span>Email</span>
                            <svg
                              className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </Inline>
                        )}

                        {teacher.website && (
                          <Inline
                            as="a"
                            gap={2}
                            href={teacher.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-classical-secondary group/btn"
                          >
                            <PiArrowSquareOut className="w-5 h-5" />
                            <span>Website</span>
                            <svg
                              className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </Inline>
                        )}
                      </div>

                      {/* Status de disponibilidade */}
                      <Inline gap={3} className="p-4 rounded-xl bg-sup-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            teacher.contactPreferences.acceptingStudents
                              ? ''
                              : ''
                          }`}
                        ></div>
                        <Text papel="rotulo" tom="suave" as="p">
                          {teacher.contactPreferences.acceptingStudents
                            ? `Aceitando novos alunos (máx. ${teacher.contactPreferences.maxStudentsPerWeek}/semana)`
                            : 'Não está aceitando novos alunos no momento'}
                        </Text>
                      </Inline>
                    </Stack>
                  </AnimatedItem>
                </Stack>

                {/* Imagem do Professor */}
                <AnimatedItem
                  direction="scale"
                  springType="bouncy"
                  className="flex justify-center order-1 md:order-2 space-y-6 lg:order-2 lg:justify-end"
                >
                  <div className="relative group">
                    {teacher.profileImage && !imageError ? (
                      <div className="relative w-64 h-80 rounded-2xl overflow-hidden shadow-theme-glow group-hover:scale-105 transition-all duration-500">
                        <Image
                          src={teacher.profileImage}
                          alt={teacher.name}
                          fill
                          sizes="256px"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          priority
                          onError={() => setImageError(true)}
                        />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                      </div>
                    ) : (
                      <div className="w-64 h-80 rounded-2xl flex items-center justify-center shadow-theme-glow group-hover:scale-105 transition-all duration-500">
                        <div className="text-center text-theme-tertiary">
                          <PiUser className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-sm">Sem imagem disponível</p>
                        </div>
                      </div>
                    )}
                  </div>
                </AnimatedItem>
              </div>
            </div>
          </AnimatedCard>

          {/* Especialidades e Instrumentos */}
          {(teacher.specialties.length > 0 ||
            teacher.instruments.length > 0) && (
            <AnimatedCard hover="lift" className="classical-card">
              <div className="p-8">
                <AnimatedItem direction="up" springType="bouncy">
                  <Inline gap={3} className="mb-6">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
                      <PiMusicNotes className="w-6 h-6 text-theme-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-theme-primary classical-title">
                        Especialidades e Instrumentos
                      </h2>
                      <p className="text-theme-secondary classical-subtitle">
                        Áreas de expertise de {teacher.name}
                      </p>
                    </div>
                  </Inline>
                </AnimatedItem>

                <div className="flex flex-wrap gap-3">
                  {teacher.specialties.map((specialty, index) => (
                    <AnimatedItem key={index} hover="scale" springType="bouncy">
                      <Text
                        papel="rotulo"
                        tom="ouro"
                        className="inline-flex items-center px-4 py-2 rounded-full font-medium shadow-theme-small transition-all duration-300 hover:scale-105 group bg-sup-2"
                      >
                        <div className="w-4 h-4 rounded-full flex items-center justify-center mr-2 group-hover:scale-110 transition-transform duration-300">
                          <PiMusicNotes className="w-3 h-3 text-theme-primary" />
                        </div>
                        {specialty}
                      </Text>
                    </AnimatedItem>
                  ))}

                  {teacher.instruments.map((instrument, index) => (
                    <AnimatedItem
                      key={`instrument-${index}`}
                      hover="scale"
                      springType="bouncy"
                    >
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-theme-small transition-all duration-300 hover:scale-105 group bg-sup-2">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center mr-2 group-hover:scale-110 transition-transform duration-300">
                          <PiTarget className="w-3 h-3 text-theme-primary" />
                        </div>
                        {instrument}
                      </span>
                    </AnimatedItem>
                  ))}
                </div>
              </div>
            </AnimatedCard>
          )}

          {/* Sobre o Professor */}
          <AnimatedCard hover="lift" className="classical-card">
            <div className="p-8">
              <AnimatedItem direction="left" springType="smooth">
                <Inline gap={3} className="mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
                    <PiBookOpen className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-theme-primary classical-title">
                      Sobre {teacher.name.split(' ')[0]}
                    </h2>
                    <p className="text-theme-secondary classical-subtitle">
                      Conheça mais sobre a trajetória e filosofia de ensino
                    </p>
                  </div>
                </Inline>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <Stack>
                  <p className="text-theme-primary leading-relaxed whitespace-pre-line">
                    {bioToShow}
                  </p>

                  {teacher.fullBio.length > 500 && (
                    <Button
                      className="self-start"
                      variante="secundario"
                      type="submit"
                      onClick={() => setShowFullBio(!showFullBio)}
                    >
                      {showFullBio ? 'Ver menos' : 'Ver mais'}
                    </Button>
                  )}
                </Stack>
              </AnimatedItem>

              {teacher.teachingPhilosophy && (
                <AnimatedItem direction="up" springType="gentle">
                  <Stack gap={2} className="mt-6 p-4 rounded-xl bg-sup-2">
                    <h3 className="text-lg font-bold text-ouro-texto">
                      Filosofia de Ensino
                    </h3>
                    <p className="text-theme-secondary">
                      {teacher.teachingPhilosophy}
                    </p>
                  </Stack>
                </AnimatedItem>
              )}
            </div>
          </AnimatedCard>

          {/* Informações de Contato */}
          <AnimatedCard hover="lift" className="classical-card">
            <div className="p-8">
              <AnimatedItem direction="up" springType="bouncy">
                <Inline gap={3} className="mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
                    <PiChatCircle className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-theme-primary classical-title">
                      Entre em Contato
                    </h2>
                    <p className="text-theme-secondary classical-subtitle">
                      Inicie sua jornada musical hoje mesmo
                    </p>
                  </div>
                </Inline>
              </AnimatedItem>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Informações de Contato */}
                <AnimatedItem direction="left" springType="smooth">
                  <div className="gap-4 flex flex-col">
                    <h3 className="text-lg font-bold text-theme-primary ">
                      Preferências de Contato
                    </h3>

                    <Stack gap={3}>
                      <Inline gap={3}>
                        <PiClock className="w-5 h-5" />
                        <span className="text-theme-secondary">
                          Responde em até{' '}
                          <strong>
                            {teacher.contactPreferences.responseTime}
                          </strong>
                        </span>
                      </Inline>

                      <Inline gap={3}>
                        <PiChatCircle className="w-5 h-5" />
                        <span className="text-theme-secondary">
                          Prefere contato por{' '}
                          <strong>
                            {teacher.contactPreferences.preferredMethod ===
                            'whatsapp'
                              ? 'WhatsApp'
                              : teacher.contactPreferences.preferredMethod ===
                                  'email'
                                ? 'Email'
                                : 'WhatsApp ou Email'}
                          </strong>
                        </span>
                      </Inline>

                      <Inline gap={3}>
                        <PiClock className="w-5 h-5" />
                        <span className="text-theme-secondary">
                          Aulas de{' '}
                          <strong>
                            {teacher.contactPreferences.defaultLessonDuration}{' '}
                            minutos
                          </strong>
                        </span>
                      </Inline>
                    </Stack>
                  </div>
                </AnimatedItem>

                {/* Botões de Ação */}
                <AnimatedItem direction="right" springType="smooth">
                  <div className="gap-4 flex flex-col">
                    <h3 className="text-lg font-bold text-theme-primary ">
                      Como Entrar em Contato
                    </h3>

                    <Stack gap={3}>
                      {teacher.phone && (
                        <Inline
                          as="button"
                          gap={2}
                          onClick={handleWhatsAppContact}
                          className="w-full btn-classical-primary justify-center"
                        >
                          <PiChatCircle className="w-5 h-5" />
                          <span>Conversar pelo WhatsApp</span>
                        </Inline>
                      )}

                      {teacher.email && (
                        <Inline
                          as="button"
                          gap={2}
                          onClick={handleEmailContact}
                          className="w-full btn-classical-secondary justify-center"
                        >
                          <PiEnvelopeSimple className="w-5 h-5" />
                          <span>Enviar Email</span>
                        </Inline>
                      )}

                      {teacher.website && (
                        <Inline
                          as="a"
                          gap={2}
                          href={teacher.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full btn-classical-secondary justify-center"
                        >
                          <PiArrowSquareOut className="w-5 h-5" />
                          <span>Visitar Website</span>
                        </Inline>
                      )}
                    </Stack>
                  </div>
                </AnimatedItem>
              </div>

              {/* Aviso sobre Disponibilidade */}
              <AnimatedItem direction="up" springType="gentle">
                <div className="mt-6 p-4 rounded-xl bg-sup-2">
                  <div className="flex items-start space-x-3">
                    <PiInfo className="w-5 h-5 text-ouro-texto mt-1" />
                    <div>
                      <Text papel="rotulo" tom="suave" as="p">
                        <strong className="text-ouro-texto">
                          {teacher.name}
                        </strong>{' '}
                        {teacher.contactPreferences.acceptingStudents
                          ? `está aceitando novos alunos e pode receber até ${teacher.contactPreferences.maxStudentsPerWeek} aulas por semana. Entre em contato para agendar uma aula experimental.`
                          : 'não está aceitando novos alunos no momento, mas você pode entrar em contato para entrar na lista de espera.'}
                      </Text>
                    </div>
                  </div>
                </div>
              </AnimatedItem>
            </div>
          </AnimatedCard>
        </AnimatedContainer>
      </Stack>
    </div>
  );
}
