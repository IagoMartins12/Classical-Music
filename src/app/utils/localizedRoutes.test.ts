import { describe, expect, it } from 'vitest';
import {
  isLocalizedRoute,
  languageOfPathname,
  localizeHref,
} from './localizedRoutes';

/**
 * O idioma na URL é a decisão de SEO mais cara do projeto: é o que faz o
 * inglês existir para os buscadores. Se `localizeHref` parar de prefixar,
 * nada quebra visivelmente — a pessoa continua navegando, porque o cookie
 * mantém o idioma — e o inglês simplesmente deixa de ter links apontando
 * para ele. Ninguém nota até o tráfego cair.
 */
describe('localizeHref', () => {
  it('prefixa rota pública no inglês', () => {
    expect(localizeHref('/composers', 'en')).toBe('/en/composers');
    expect(localizeHref('/works/123', 'en')).toBe('/en/works/123');
    expect(localizeHref('/', 'en')).toBe('/en');
  });

  it('não prefixa nada no português: é o caminho limpo', () => {
    expect(localizeHref('/composers', 'pt')).toBe('/composers');
    expect(localizeHref('/', 'pt')).toBe('/');
  });

  // `/en/profile` não existe: a área por pessoa não vive sob `[lang]`.
  // Prefixar aqui levaria a um 404 — e só para quem usa o site em inglês.
  it('deixa intocada a rota que não é traduzida', () => {
    expect(localizeHref('/profile', 'en')).toBe('/profile');
    expect(localizeHref('/favorites', 'en')).toBe('/favorites');
    expect(localizeHref('/upload', 'en')).toBe('/upload');
    expect(localizeHref('/blog', 'en')).toBe('/blog');
  });

  it('preserva query e âncora', () => {
    expect(localizeHref('/works?page=2', 'en')).toBe('/en/works?page=2');
    expect(localizeHref('/faq#planos', 'en')).toBe('/en/faq#planos');
  });

  it('deixa passar endereço externo e protocolo', () => {
    expect(localizeHref('https://imslp.org/x', 'en')).toBe(
      'https://imslp.org/x'
    );
    expect(localizeHref('mailto:contato@opusatlas.com.br', 'en')).toBe(
      'mailto:contato@opusatlas.com.br'
    );
    expect(localizeHref('#topo', 'en')).toBe('#topo');
  });
});

describe('languageOfPathname', () => {
  it('lê o idioma do prefixo', () => {
    expect(languageOfPathname('/en/composers')).toBe('en');
    expect(languageOfPathname('/en')).toBe('en');
  });

  it('sem prefixo é português', () => {
    expect(languageOfPathname('/composers')).toBe('pt');
    expect(languageOfPathname('/')).toBe('pt');
  });

  // Uma rota que começa com "en" sem ser o idioma — o prefixo é um segmento
  // inteiro, não um começo de palavra.
  it('não confunde segmento que só começa com o idioma', () => {
    expect(languageOfPathname('/enciclopedia')).toBe('pt');
  });
});

describe('isLocalizedRoute', () => {
  it('reconhece as rotas públicas e só elas', () => {
    expect(isLocalizedRoute('/composers')).toBe(true);
    expect(isLocalizedRoute('/composer/abc')).toBe(true);
    expect(isLocalizedRoute('/')).toBe(true);
    expect(isLocalizedRoute('/profile')).toBe(false);
    expect(isLocalizedRoute('/admin/users')).toBe(false);
  });
});
