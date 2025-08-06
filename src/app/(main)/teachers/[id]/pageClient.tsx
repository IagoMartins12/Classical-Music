// app/public/teachers/[id]/pageClient.tsx - Client Component para Detalhes do Professor

'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TeacherDetailedProfile } from '@/app/requests/public-teachers-requests';
import {
  FiCalendar,
  FiMapPin,
  FiUser,
  FiExternalLink,
  FiUsers,
  FiMusic,
  FiStar,
  FiClock,
  FiAward,
  FiHeart,
  FiMessageCircle,
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiInfo,
  FiTrendingUp,
  FiTarget,
  FiBookOpen,
  FiThumbsUp,
  FiShare2,
  FiFlag,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  SequentialGrid,
  PageContainer,
} from '../../../components/animation/AnimatedComponents';

interface PublicTeacherDetailsPageClientProps {
  teacher: TeacherDetailedProfile;
}

export default function PublicTeacherDetailsPageClient({
  teacher,
}: PublicTeacherDetailsPageClientProps) {
  const [imageError, setImageError] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
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
      } catch (error) {
        // Fallback para clipboard
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      // Fallback para clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  }, [teacher.name]);

  const reviewsToShow = showAllReviews
    ? teacher.studentTestimonials
    : teacher.studentTestimonials.slice(0, 6);

  const bioToShow = showFullBio
    ? teacher.fullBio
    : teacher.fullBio.length > 500
    ? teacher.fullBio.substring(0, 500) + '...'
    : teacher.fullBio;

  return (
    <div className="bg-gradient-primary">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-brand-gradient rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-accent-purple/30 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent-blue/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-brand-secondary/20 rounded-full blur-2xl"></div>
      </div>

      <div className="section-wrap space-y-8 relative z-10">
        {/* Breadcrumb */}
        <AnimatedItem direction="down" springType="gentle">
          <nav className="flex items-center space-x-2 text-sm text-theme-tertiary mb-6 pt-4">
            <Link
              href="/public/teachers"
              className="hover:text-brand-primary transition-colors duration-300 font-medium"
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
          </nav>
        </AnimatedItem>

        <AnimatedContainer
          delay={0.1}
          staggerSpeed="normal"
          className="flex flex-col gap-4"
        >
          {/* Header Principal */}
          <AnimatedCard hover="lift" className="classical-card relative z-50">
            <div className="p-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Informações do Professor */}
                <div className="lg:col-span-2 space-y-6 order-2 md:order-1 lg:order-1">
                  {/* Nome e título */}
                  <AnimatedItem direction="up" springType="bouncy">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title leading-tight">
                              {teacher.name}
                            </h1>
                            {teacher.isVerified && (
                              <div className="w-8 h-8 bg-accent-green rounded-full flex items-center justify-center">
                                <FiCheckCircle className="w-5 h-5 text-theme-primary" />
                              </div>
                            )}
                          </div>

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
                        <div className="flex items-center space-x-3 pt-2">
                          <button
                            onClick={handleShare}
                            className="btn-classical-secondary flex items-center justify-center"
                            title="Compartilhar perfil"
                          >
                            <FiShare2 className="w-5 h-5" />
                          </button>
                          <button className="btn-classical-secondary flex items-center justify-center text-accent-red border-accent-red/30 hover:bg-accent-red/10">
                            <FiFlag className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </AnimatedItem>

                  {/* Stats Cards */}
                  <AnimatedItem direction="left" springType="smooth">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Experiência */}
                      <div className="flex items-start space-x-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <FiClock className="w-5 h-5 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-theme-primary">
                            {teacher.yearsExperience} anos
                          </p>
                          <p className="text-sm text-theme-tertiary">
                            Experiência
                          </p>
                        </div>
                      </div>

                      {/* Alunos */}
                      <div className="flex items-start space-x-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <FiUsers className="w-5 h-5 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-theme-primary">
                            {teacher.totalStudents}
                          </p>
                          <p className="text-sm text-theme-tertiary">Alunos</p>
                        </div>
                      </div>

                      {/* Avaliação */}
                      {teacher.averageRating && (
                        <div className="flex items-start space-x-3 group">
                          <div className="w-10 h-10 bg-gradient-to-br from-accent-yellow to-accent-orange rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                            <FiStar className="w-5 h-5 text-theme-primary" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-theme-primary">
                              {teacher.averageRating.toFixed(1)}
                            </p>
                            <p className="text-sm text-theme-tertiary">
                              Avaliação
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Aulas */}
                      <div className="flex items-start space-x-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-pink rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <FiMusic className="w-5 h-5 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-theme-primary">
                            {teacher.totalLessons}
                          </p>
                          <p className="text-sm text-theme-tertiary">Aulas</p>
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
                          <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                            <FiMapPin className="w-4 h-4 text-theme-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-theme-tertiary">
                              Localização
                            </p>
                            <p className="text-theme-primary font-semibold">
                              {teacher.location}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Desde quando ensina */}
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <FiCalendar className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-tertiary">
                            Ensina desde
                          </p>
                          <p className="text-theme-primary font-semibold">
                            {new Date(teacher.teachingSince).getFullYear()}
                          </p>
                        </div>
                      </div>

                      {/* Taxa de Conclusão */}
                      {teacher.completionRate && (
                        <div className="flex items-start space-x-3 group">
                          <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                            <FiTrendingUp className="w-4 h-4 text-theme-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-theme-tertiary">
                              Taxa de Conclusão
                            </p>
                            <p className="text-theme-primary font-semibold">
                              {(teacher.completionRate * 100).toFixed(0)}%
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Responde em */}
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <FiMessageCircle className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-tertiary">
                            Tempo de Resposta
                          </p>
                          <p className="text-theme-primary font-semibold">
                            {teacher.contactPreferences.responseTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  </AnimatedItem>

                  {/* Botões de Contato */}
                  <AnimatedItem direction="right" springType="smooth">
                    <div className="space-y-4 pt-4">
                      <div className="flex flex-wrap gap-3">
                        {teacher.phone && (
                          <button
                            onClick={handleWhatsAppContact}
                            className="btn-classical-primary flex items-center space-x-2 group/btn"
                          >
                            <FiMessageCircle className="w-5 h-5" />
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
                          </button>
                        )}

                        {teacher.email && (
                          <button
                            onClick={handleEmailContact}
                            className="btn-classical-secondary flex items-center space-x-2 group/btn"
                          >
                            <FiMail className="w-5 h-5" />
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
                          </button>
                        )}

                        {teacher.website && (
                          <a
                            href={teacher.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-classical-secondary flex items-center space-x-2 group/btn"
                          >
                            <FiExternalLink className="w-5 h-5" />
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
                          </a>
                        )}
                      </div>

                      {/* Status de disponibilidade */}
                      <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-xl border border-theme-primary">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            teacher.contactPreferences.acceptingStudents
                              ? 'bg-accent-green'
                              : 'bg-accent-red'
                          }`}
                        ></div>
                        <p className="text-sm text-theme-secondary">
                          {teacher.contactPreferences.acceptingStudents
                            ? `Aceitando novos alunos (máx. ${teacher.contactPreferences.maxStudentsPerWeek}/semana)`
                            : 'Não está aceitando novos alunos no momento'}
                        </p>
                      </div>
                    </div>
                  </AnimatedItem>
                </div>

                {/* Imagem do Professor */}
                <AnimatedItem
                  direction="scale"
                  springType="bouncy"
                  className="flex justify-center order-1 md:order-2 space-y-6 lg:order-2 lg:justify-end"
                >
                  <div className="relative group">
                    {teacher.profileImage && !imageError ? (
                      <div className="relative w-64 h-80 rounded-2xl overflow-hidden shadow-theme-glow border border-theme-primary group-hover:scale-105 transition-all duration-500">
                        <Image
                          src={teacher.profileImage}
                          alt={teacher.name}
                          fill
                          sizes="256px"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          priority
                          onError={() => setImageError(true)}
                        />
                        <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                      </div>
                    ) : (
                      <div className="w-64 h-80 bg-gradient-card border border-theme-primary rounded-2xl flex items-center justify-center shadow-theme-glow group-hover:scale-105 transition-all duration-500">
                        <div className="text-center text-theme-tertiary">
                          <FiUser className="w-16 h-16 mx-auto mb-4 opacity-50" />
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
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-blue rounded-2xl flex items-center justify-center">
                      <FiMusic className="w-6 h-6 text-theme-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-theme-primary classical-title">
                        Especialidades e Instrumentos
                      </h2>
                      <p className="text-theme-secondary classical-subtitle">
                        Áreas de expertise de {teacher.name}
                      </p>
                    </div>
                  </div>
                </AnimatedItem>

                <div className="flex flex-wrap gap-3">
                  {teacher.specialties.map((specialty, index) => (
                    <AnimatedItem key={index} hover="scale" springType="bouncy">
                      <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/30 rounded-full text-sm font-medium text-brand-primary shadow-theme-small hover:shadow-theme-medium transition-all duration-300 hover:scale-105 group">
                        <div className="w-4 h-4 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center mr-2 group-hover:scale-110 transition-transform duration-300">
                          <FiMusic className="w-3 h-3 text-theme-primary" />
                        </div>
                        {specialty}
                      </span>
                    </AnimatedItem>
                  ))}

                  {teacher.instruments.map((instrument, index) => (
                    <AnimatedItem
                      key={`instrument-${index}`}
                      hover="scale"
                      springType="bouncy"
                    >
                      <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 border border-accent-blue/30 rounded-full text-sm font-medium text-accent-blue shadow-theme-small hover:shadow-theme-medium transition-all duration-300 hover:scale-105 group">
                        <div className="w-4 h-4 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex items-center justify-center mr-2 group-hover:scale-110 transition-transform duration-300">
                          <FiTarget className="w-3 h-3 text-theme-primary" />
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
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-2xl flex items-center justify-center">
                    <FiBookOpen className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-theme-primary classical-title">
                      Sobre {teacher.name.split(' ')[0]}
                    </h2>
                    <p className="text-theme-secondary classical-subtitle">
                      Conheça mais sobre a trajetória e filosofia de ensino
                    </p>
                  </div>
                </div>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <div className="space-y-4">
                  <p className="text-theme-primary leading-relaxed whitespace-pre-line">
                    {bioToShow}
                  </p>

                  {teacher.fullBio.length > 500 && (
                    <button
                      onClick={() => setShowFullBio(!showFullBio)}
                      className="btn-classical-secondary text-sm"
                    >
                      {showFullBio ? 'Ver menos' : 'Ver mais'}
                    </button>
                  )}
                </div>
              </AnimatedItem>

              {teacher.teachingPhilosophy && (
                <AnimatedItem direction="up" springType="gentle">
                  <div className="mt-6 p-4 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-xl border border-theme-primary">
                    <h3 className="text-lg font-bold text-brand-primary mb-2">
                      Filosofia de Ensino
                    </h3>
                    <p className="text-theme-secondary">
                      {teacher.teachingPhilosophy}
                    </p>
                  </div>
                </AnimatedItem>
              )}
            </div>
          </AnimatedCard>

          {/* Avaliações dos Alunos */}
          {teacher.studentTestimonials.length > 0 && (
            <AnimatedCard hover="lift" className="classical-card">
              <div className="p-8">
                <AnimatedItem direction="up" springType="bouncy">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-accent-yellow to-accent-orange rounded-2xl flex items-center justify-center">
                        <FiThumbsUp className="w-6 h-6 text-theme-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-theme-primary classical-title">
                          Avaliações dos Alunos
                        </h2>
                        <p className="text-theme-secondary classical-subtitle">
                          {teacher.totalReviews} avaliação
                          {teacher.totalReviews !== 1 ? 'ões' : ''}
                          {teacher.averageRating && (
                            <span className="ml-2">
                              • Média {teacher.averageRating.toFixed(1)} ⭐
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Breakdown de Ratings */}
                    {teacher.averageRating && (
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FiStar
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(teacher.averageRating!)
                                  ? 'text-accent-yellow'
                                  : 'text-theme-tertiary'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AnimatedItem>

                {/* Grid de Avaliações */}
                <SequentialGrid cols={2} gap={6} delayBetweenItems={0.1}>
                  {reviewsToShow.map((review) => (
                    <AnimatedItem
                      key={review.id}
                      hover="lift"
                      springType="bouncy"
                    >
                      <div className="bg-gradient-to-br from-theme-elevated to-interactive-hover p-6 rounded-xl border border-theme-primary">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="flex items-center space-x-1">
                                {Array.from({ length: review.rating }).map(
                                  (_, i) => (
                                    <FiStar
                                      key={i}
                                      className="w-4 h-4 text-accent-yellow"
                                    />
                                  )
                                )}
                              </div>
                              <span className="text-sm font-medium text-theme-primary">
                                {review.studentName}
                              </span>
                            </div>
                            {review.relationshipDuration && (
                              <p className="text-xs text-theme-tertiary">
                                Aluno há {review.relationshipDuration}
                              </p>
                            )}
                          </div>
                          <div className="text-xs text-theme-tertiary">
                            {new Date(review.createdAt).toLocaleDateString(
                              'pt-BR'
                            )}
                          </div>
                        </div>

                        <p className="text-theme-secondary mb-3 leading-relaxed">
                          "{review.comment}"
                        </p>

                        {review.wouldRecommend && (
                          <div className="flex items-center space-x-2 text-accent-green">
                            <FiThumbsUp className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Recomenda este professor
                            </span>
                          </div>
                        )}
                      </div>
                    </AnimatedItem>
                  ))}
                </SequentialGrid>

                {teacher.studentTestimonials.length > 6 && (
                  <AnimatedItem direction="up" springType="gentle">
                    <div className="text-center mt-6">
                      <button
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        className="btn-classical-secondary"
                      >
                        {showAllReviews
                          ? 'Ver menos avaliações'
                          : `Ver todas as ${teacher.studentTestimonials.length} avaliações`}
                      </button>
                    </div>
                  </AnimatedItem>
                )}
              </div>
            </AnimatedCard>
          )}

          {/* Informações de Contato */}
          <AnimatedCard hover="lift" className="classical-card">
            <div className="p-8">
              <AnimatedItem direction="up" springType="bouncy">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-2xl flex items-center justify-center">
                    <FiMessageCircle className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-theme-primary classical-title">
                      Entre em Contato
                    </h2>
                    <p className="text-theme-secondary classical-subtitle">
                      Inicie sua jornada musical hoje mesmo
                    </p>
                  </div>
                </div>
              </AnimatedItem>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Informações de Contato */}
                <AnimatedItem direction="left" springType="smooth">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-theme-primary mb-4">
                      Preferências de Contato
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <FiClock className="w-5 h-5 text-accent-blue" />
                        <span className="text-theme-secondary">
                          Responde em até{' '}
                          <strong>
                            {teacher.contactPreferences.responseTime}
                          </strong>
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <FiMessageCircle className="w-5 h-5 text-accent-green" />
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
                      </div>

                      <div className="flex items-center space-x-3">
                        <FiClock className="w-5 h-5 text-accent-purple" />
                        <span className="text-theme-secondary">
                          Aulas de{' '}
                          <strong>
                            {teacher.contactPreferences.defaultLessonDuration}{' '}
                            minutos
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </AnimatedItem>

                {/* Botões de Ação */}
                <AnimatedItem direction="right" springType="smooth">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-theme-primary mb-4">
                      Como Entrar em Contato
                    </h3>

                    <div className="space-y-3">
                      {teacher.phone && (
                        <button
                          onClick={handleWhatsAppContact}
                          className="w-full btn-classical-primary flex items-center justify-center space-x-2"
                        >
                          <FiMessageCircle className="w-5 h-5" />
                          <span>Conversar pelo WhatsApp</span>
                        </button>
                      )}

                      {teacher.email && (
                        <button
                          onClick={handleEmailContact}
                          className="w-full btn-classical-secondary flex items-center justify-center space-x-2"
                        >
                          <FiMail className="w-5 h-5" />
                          <span>Enviar Email</span>
                        </button>
                      )}

                      {teacher.website && (
                        <a
                          href={teacher.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full btn-classical-secondary flex items-center justify-center space-x-2"
                        >
                          <FiExternalLink className="w-5 h-5" />
                          <span>Visitar Website</span>
                        </a>
                      )}
                    </div>
                  </div>
                </AnimatedItem>
              </div>

              {/* Aviso sobre Disponibilidade */}
              <AnimatedItem direction="up" springType="gentle">
                <div className="mt-6 p-4 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-xl border border-theme-primary">
                  <div className="flex items-start space-x-3">
                    <FiInfo className="w-5 h-5 text-brand-primary mt-1" />
                    <div>
                      <p className="text-sm text-theme-secondary">
                        <strong className="text-brand-primary">
                          {teacher.name}
                        </strong>{' '}
                        {teacher.contactPreferences.acceptingStudents
                          ? `está aceitando novos alunos e pode receber até ${teacher.contactPreferences.maxStudentsPerWeek} aulas por semana. Entre em contato para agendar uma aula experimental.`
                          : 'não está aceitando novos alunos no momento, mas você pode entrar em contato para entrar na lista de espera.'}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedItem>
            </div>
          </AnimatedCard>
        </AnimatedContainer>
      </div>
    </div>
  );
}
