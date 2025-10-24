'use client';

import Link from 'next/link';
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaEnvelope,
  FaMusic,
} from 'react-icons/fa';

export function BlogFooter() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Navegação',
      links: [
        { label: 'Início', href: '/blog' },
        { label: 'Categorias', href: '/blog/categoria' },
        { label: 'Compositores', href: '/composers' },
        { label: 'Obras', href: '/works' },
        { label: 'Partituras', href: '/scores' },
      ],
    },
    {
      title: 'Recursos',
      links: [
        { label: 'Sobre o Blog', href: '/about' },
        { label: 'Contato', href: '/contact' },
        { label: 'FAQ', href: '/faq' },
        { label: 'Política de Privacidade', href: '/privacy' },
        { label: 'Termos de Uso', href: '/terms' },
      ],
    },
    {
      title: 'Categorias',
      links: [
        { label: 'Análise Musical', href: '/blog/category/analise-musical' },
        { label: 'Biografias', href: '/blog/category/biografias' },
        { label: 'História', href: '/blog/category/historia' },
        { label: 'Técnica', href: '/blog/category/tecnica' },
        { label: 'Teoria Musical', href: '/blog/category/teoria-musical' },
      ],
    },
  ];

  const socialLinks = [
    { icon: FaFacebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: FaTwitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: FaYoutube, href: 'https://youtube.com', label: 'YouTube' },
    { icon: FaEnvelope, href: 'mailto:contato@opusatlas.com', label: 'Email' },
  ];

  return (
    <footer className="bg-theme-secondary border-t border-theme-secondary mt-20">
      <div className="section-wrap py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <FaMusic className="w-8 h-8 text-brand-primary" />
              <div>
                <h3 className="text-xl font-bold text-gradient-brand">
                  Opus Atlas
                </h3>
                <p className="text-xs text-theme-tertiary">Blog Musical</p>
              </div>
            </div>
            <p className="text-sm text-theme-secondary leading-relaxed">
              Explore o fascinante mundo da música clássica através de artigos,
              análises e biografias dos grandes mestres.
            </p>
            <div className="flex items-center space-x-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-theme-elevated hover:bg-theme-classical transition-all group"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-theme-tertiary group-hover:text-brand-primary transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-theme-primary mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-theme-secondary hover:text-brand-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="py-8 border-t border-theme-secondary">
          <div className="max-w-2xl mx-auto text-center">
            <h4 className="text-lg font-semibold text-theme-primary mb-2">
              📬 Receba novos artigos no seu email
            </h4>
            <p className="text-sm text-theme-secondary mb-4">
              Inscreva-se na nossa newsletter e fique por dentro das novidades
            </p>
            <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Seu email"
                className="input-classical-2 flex-1"
                required
              />
              <button
                type="submit"
                className="btn-classical-primary whitespace-nowrap"
              >
                Inscrever-se
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-theme-secondary">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-theme-tertiary">
            <p>© {currentYear} Opus Atlas. Todos os direitos reservados.</p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="hover:text-brand-primary transition-colors"
              >
                Privacidade
              </Link>
              <Link
                href="/terms"
                className="hover:text-brand-primary transition-colors"
              >
                Termos
              </Link>
              <Link
                href="/sitemap"
                className="hover:text-brand-primary transition-colors"
              >
                Mapa do Site
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
