import type { Idioma } from '../legal/tipos';

/** Copy shared by components used across the public site. */
const pt = {
  favorite: {
    add: (name: string) => `Favoritar ${name}`,
    remove: (name: string) => `Tirar ${name} dos favoritos`,
    added: (name: string) => `${name} nos favoritos`,
    removed: (name: string) => `${name} saiu dos favoritos`,
    failed: 'Não foi possível salvar o favorito. Tente de novo.',
    labelOn: 'Nos favoritos',
    labelOff: 'Favoritar',
  },
  verified: 'Verificado',
};

const en: typeof pt = {
  favorite: {
    add: (name: string) => `Add ${name} to favorites`,
    remove: (name: string) => `Remove ${name} from favorites`,
    added: (name: string) => `${name} added to favorites`,
    removed: (name: string) => `${name} removed from favorites`,
    failed: 'Could not save the favorite. Try again.',
    labelOn: 'In favorites',
    labelOff: 'Favorite',
  },
  verified: 'Verified',
};

export const COMMON: Record<Idioma, typeof pt> = { pt, en };
export type CommonCopy = typeof pt;
