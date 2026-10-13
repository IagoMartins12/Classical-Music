/**
 * The legacy `t()` for components that still read `/translations/*.json`.
 * One implementation, in the TranslationContext: the provider's sections
 * when there is one, a fetch otherwise. `ready` is false until the sections
 * arrive; `t()` never returns a key.
 */
export { useTranslation } from '@/app/context/TranslationContext';
