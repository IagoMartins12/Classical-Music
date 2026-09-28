'use client';

import Link from 'next/link';
import {
  PiEnvelopeSimple,
  PiFacebookLogo,
  PiInstagramLogo,
  PiMusicNotes,
  PiTwitterLogo,
  PiYoutubeLogo,
} from 'react-icons/pi';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Button } from '@/app/components/ui/Button';

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
    { icon: PiFacebookLogo, href: 'https://facebook.com', label: 'Facebook' },
    { icon: PiTwitterLogo, href: 'https://twitter.com', label: 'Twitter' },
    {
      icon: PiInstagramLogo,
      href: 'https://instagram.com',
      label: 'Instagram',
    },
    { icon: PiYoutubeLogo, href: 'https://youtube.com', label: 'YouTube' },
    {
      icon: PiEnvelopeSimple,
      href: 'mailto:contato@opusatlas.com',
      label: 'Email',
    },
  ];

  return (
    <footer className="bg-theme-secondary border-t border-theme-secondary mt-20">
      <div className="section-wrap py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <Stack>
            <Inline gap={3}>
              <PiMusicNotes className="w-8 h-8 text-ouro-texto" />
              <div>
                <h3 className="text-xl font-bold text-gradient-brand">
                  Opus Atlas
                </h3>
                <Text papel="legenda" tom="fraco" as="p">
                  Blog Musical
                </Text>
              </div>
            </Inline>
            <Text papel="rotulo" tom="suave" as="p" className="leading-relaxed">
              Explore o fascinante mundo da música clássica através de artigos,
              análises e biografias dos grandes mestres.
            </Text>
            <Inline gap={3}>
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-theme-elevated transition-all group"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-theme-tertiary transition-colors" />
                </Link>
              ))}
            </Inline>
          </Stack>

          {/* Links Columns */}
          {footerSections.map((section) => (
            <Stack key={section.title}>
              <h4 className="font-semibold text-theme-primary">
                {section.title}
              </h4>
              <Stack gap={2} as="ul">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-theme-secondary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </Stack>
            </Stack>
          ))}
        </div>

        {/* Newsletter */}
        <div className="py-8 border-t border-theme-secondary">
          <div className="max-w-2xl mx-auto text-center">
            <h4 className="text-lg font-semibold text-theme-primary mb-2">
              Receba novos artigos no seu email
            </h4>
            <Text papel="rotulo" tom="suave" as="p" className="mb-4">
              Inscreva-se na nossa newsletter e fique por dentro das novidades
            </Text>
            <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Seu email"
                className="input-classical-2 flex-1"
                required
              />
              <Button
                variante="primario"
                type="submit"
                className="whitespace-nowrap"
              >
                Inscrever-se
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-theme-secondary">
          <Text
            papel="rotulo"
            tom="fraco"
            as="div"
            className="flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <p>© {currentYear} Opus Atlas. Todos os direitos reservados.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="transition-colors">
                Privacidade
              </Link>
              <Link href="/terms" className="transition-colors">
                Termos
              </Link>
              <Link href="/sitemap" className="transition-colors">
                Mapa do Site
              </Link>
            </div>
          </Text>
        </div>
      </div>
    </footer>
  );
}
