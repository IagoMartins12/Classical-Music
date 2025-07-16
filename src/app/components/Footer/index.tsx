import React from 'react';
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
  FiFileText,
  FiShield,
  FiGlobe,
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

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'História da Música', href: '/music-history', icon: FiBookOpen },
    { label: 'Compositores', href: '/composers', icon: FiUsers },
    { label: 'Obras', href: '/works', icon: FiMusic },
    { label: 'Instrumentos', href: '/instruments', icon: GiViolin },
    { label: 'Categorias', href: '/genres', icon: FiGlobe },
  ];

  const supportLinks = [
    { label: 'Central de Ajuda', href: '/help' },
    { label: 'Perguntas Frequentes', href: '/faq' },
    { label: 'Contato', href: '/contact' },
    { label: 'Suporte Técnico', href: '/support' },
  ];

  const legalLinks = [
    { label: 'Termos de Uso', href: '/terms' },
    { label: 'Política de Privacidade', href: '/privacy' },
    { label: 'Direitos Autorais', href: '/copyright' },
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

  return (
    <footer className="relative mt-20 bg-gradient-to-b from-theme-primary to-theme-secondary border-t border-theme-secondary">
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
                  Classical Hub
                </span>
              </Link>

              <p className="text-theme-tertiary leading-relaxed text-sm">
                Sua plataforma completa para explorar, aprender e se apaixonar
                pela música clássica. Descubra compositores, obras e desenvolva
                suas habilidades musicais.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-theme-tertiary">
                  <FiMail className="w-4 h-4 text-brand-primary" />
                  <span>contato@classicalhub.com</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-theme-tertiary">
                  <FiPhone className="w-4 h-4 text-brand-primary" />
                  <span>+55 (11) 9999-9999</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-theme-tertiary">
                  <FiMapPin className="w-4 h-4 text-brand-primary" />
                  <span>São Paulo, Brasil</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-theme-primary flex items-center">
                <FiBookOpen className="w-5 h-5 mr-2 text-brand-primary" />
                Explorar
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
                Suporte
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
                Legal
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
                  Siga-nos
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

        {/* Newsletter Section */}
        <div className="border-t border-theme-secondary">
          <div className="section-wrap py-8">
            <div className="classical-card p-6 bg-gradient-to-r from-brand-primary/5 to-accent-purple/5 border border-brand-primary/20">
              <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-semibold text-theme-primary flex items-center justify-center md:justify-start">
                    <FiHeart className="w-5 h-5 mr-2 text-brand-primary" />
                    Receba novidades sobre música clássica
                  </h3>
                  <p className="text-sm text-theme-tertiary mt-1">
                    Fique por dentro de novos compositores, obras e
                    funcionalidades
                  </p>
                </div>
                <div className="flex space-x-3">
                  <input
                    type="email"
                    placeholder="Seu e-mail"
                    className="px-4 py-2 bg-theme-tertiary border border-theme-secondary rounded-lg text-sm focus:outline-none focus:border-brand-primary transition-colors"
                  />
                  <button className="px-6 py-2 bg-brand-gradient text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                    Inscrever
                  </button>
                </div>
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
                  © {currentYear} Classical Hub. Todos os direitos reservados.
                </p>
              </div>

              <div className="flex items-center space-x-6 text-sm text-theme-tertiary">
                <span className="flex items-center">
                  Feito com <FiHeart className="w-4 h-4 mx-1 text-accent-red" />{' '}
                  para a música clássica
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
